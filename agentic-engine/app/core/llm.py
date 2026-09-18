import json
import os
import time
from typing import Any, Dict, List, Optional, Type
import httpx
from pydantic import BaseModel
from app.core.config import settings

# Attempt to import Google GenAI SDKs
try:
    from google import genai
    from google.genai import types as genai_types
    HAS_NEW_GENAI = True
except ImportError:
    HAS_NEW_GENAI = False

try:
    import google.generativeai as legacy_genai
    HAS_LEGACY_GENAI = True
except ImportError:
    HAS_LEGACY_GENAI = False


def _is_quota_error(e: Exception) -> bool:
    """Detects a rate-limit/quota-exhaustion error from its message text (the
    Gemini SDKs surface these as plain exceptions, not a dedicated type)."""
    msg = str(e)
    return "429" in msg or "RESOURCE_EXHAUSTED" in msg or "quota" in msg.lower()


class BaseLLMProvider:
    """Pluggable LLM Abstraction interface. Implementations raise on failure
    (quota exhaustion, network error, missing key, ...) so that ChainedLLMProvider
    can catch it and move on to the next provider in the chain."""

    name = "base"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        raise NotImplementedError

    async def generate_json(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        schema: Optional[Type[BaseModel]] = None,
    ) -> Dict[str, Any]:
        """Default JSON implementation shared by every provider: ask for raw JSON
        text via generate_text(), then clean/parse it."""
        enhanced_prompt = (
            f"{prompt}\n\n"
            "CRITICAL: Return ONLY valid, parseable JSON matching the requested structure. "
            "Do NOT include markdown formatting, backticks, or other explanatory prose."
        )
        raw_text = await self.generate_text(enhanced_prompt, system_prompt=system_prompt, temperature=0.1)

        cleaned = raw_text.strip()
        if cleaned.startswith("```"):
            lines = cleaned.split("\n")
            if lines[0].startswith("```"):
                lines = lines[1:]
            if lines and lines[-1].startswith("```"):
                lines = lines[:-1]
            cleaned = "\n".join(lines).strip()

        try:
            return json.loads(cleaned)
        except Exception:
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1:
                try:
                    return json.loads(cleaned[start : end + 1])
                except Exception:
                    pass
            return {"raw": raw_text}


class GeminiLLMProvider(BaseLLMProvider):
    """Google Gemini LLM Implementation. Raises RuntimeError if no response
    could be obtained (missing/invalid key, quota exhausted, network error, ...)."""

    name = "gemini"

    # Class-level (shared across every instance, since get_llm() constructs a fresh
    # provider per request/agent call) circuit breaker: once a quota/rate-limit error
    # is seen, skip hitting the network entirely for a cooldown window instead of
    # wasting 10-20s retrying multiple dead model/client combinations on every
    # subsequent call - the daily quota won't reset within that window anyway.
    _quota_exhausted_until: float = 0.0
    _QUOTA_COOLDOWN_SECONDS = 300

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = (api_key or settings.GEMINI_API_KEY or os.getenv("GEMINI_API_KEY", "")).strip()
        self.model_name = model_name or settings.GEMINI_MODEL
        self._client = None

        if self.api_key and HAS_NEW_GENAI:
            try:
                self._client = genai.Client(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiLLMProvider] Warning: Could not initialize new genai.Client: {e}")

        # Always configure the legacy SDK when a key is present (not just when the new
        # client failed to construct) - the new client can construct successfully but
        # still fail later at generate_content time (e.g. deprecated model id), in which
        # case the legacy path needs to be a real fallback, not one that was never configured.
        if self.api_key and HAS_LEGACY_GENAI:
            try:
                legacy_genai.configure(api_key=self.api_key)
            except Exception as e:
                print(f"[GeminiLLMProvider] Warning: Could not configure legacy genai: {e}")

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        if not self.api_key:
            raise RuntimeError("Gemini API key not configured.")

        remaining_cooldown = GeminiLLMProvider._quota_exhausted_until - time.time()
        if remaining_cooldown > 0:
            raise RuntimeError(
                f"Gemini quota exhausted - cooling down for {remaining_cooldown:.0f}s more "
                "before retrying (skipping network calls to avoid wasting time on a known-dead provider)."
            )

        errors = []
        quota_exhausted = False
        # Try the configured model first, then the fallback model (covers the case
        # where GEMINI_MODEL has since been deprecated/retired for this API key).
        candidate_models = [self.model_name]
        if settings.GEMINI_FALLBACK_MODEL and settings.GEMINI_FALLBACK_MODEL != self.model_name:
            candidate_models.append(settings.GEMINI_FALLBACK_MODEL)

        # 1. Try modern google.genai
        if self._client:
            for model_id in candidate_models:
                try:
                    config = genai_types.GenerateContentConfig(
                        system_instruction=system_prompt if system_prompt else None,
                        temperature=temperature,
                    )
                    response = self._client.models.generate_content(
                        model=model_id,
                        contents=prompt,
                        config=config,
                    )
                    if response and response.text:
                        return response.text
                except Exception as e:
                    errors.append(f"new client ({model_id}): {e}")
                    if _is_quota_error(e):
                        quota_exhausted = True

        # 2. Try legacy google.generativeai
        if HAS_LEGACY_GENAI:
            try:
                model = legacy_genai.GenerativeModel(
                    model_name=self.model_name,
                    system_instruction=system_prompt if system_prompt else None,
                )
                res = model.generate_content(prompt)
                if res and res.text:
                    return res.text
            except Exception as e:
                errors.append(f"legacy client: {e}")
                if _is_quota_error(e):
                    quota_exhausted = True

        if quota_exhausted:
            GeminiLLMProvider._quota_exhausted_until = time.time() + GeminiLLMProvider._QUOTA_COOLDOWN_SECONDS
            print(
                f"[GeminiLLMProvider] Quota exhausted - skipping Gemini for the next "
                f"{GeminiLLMProvider._QUOTA_COOLDOWN_SECONDS}s."
            )

        raise RuntimeError(f"Gemini generation failed: {'; '.join(errors) or 'no response text returned'}")


class GroqLLMProvider(BaseLLMProvider):
    """
    Groq free-tier LLM Implementation (OpenAI-compatible REST API).
    Runs open models (Llama 3.3/3.1, etc.) at very high inference speed with a
    generous free rate limit. Used as the fallback when the primary provider
    (Gemini) hits its quota / rate limit or errors out.
    Get a free key at https://console.groq.com/keys
    """

    name = "groq"
    API_URL = "https://api.groq.com/openai/v1/chat/completions"

    def __init__(self, api_key: Optional[str] = None, model_name: Optional[str] = None):
        self.api_key = (api_key or settings.GROQ_API_KEY or os.getenv("GROQ_API_KEY", "")).strip()
        self.model_name = model_name or settings.GROQ_MODEL

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        if not self.api_key:
            raise RuntimeError("Groq API key not configured.")

        messages = []
        if system_prompt:
            messages.append({"role": "system", "content": system_prompt})
        if history:
            messages.extend(history)
        messages.append({"role": "user", "content": prompt})

        try:
            async with httpx.AsyncClient(timeout=30) as client:
                res = await client.post(
                    self.API_URL,
                    headers={"Authorization": f"Bearer {self.api_key}"},
                    json={
                        "model": self.model_name,
                        "messages": messages,
                        "temperature": temperature,
                    },
                )
                res.raise_for_status()
                data = res.json()
                content = data["choices"][0]["message"]["content"]
                if not content:
                    raise RuntimeError("Groq returned an empty response.")
                return content
        except httpx.HTTPStatusError as e:
            raise RuntimeError(f"Groq API error {e.response.status_code}: {e.response.text[:200]}") from e
        except Exception as e:
            raise RuntimeError(f"Groq generation failed: {e}") from e


class MockLLMProvider(BaseLLMProvider):
    """
    Deterministic offline fallback used only when every configured real provider
    fails (no keys, all quotas exhausted, no network). Guarantees the pipeline
    always returns *something* so the multi-agent workflow never hard-crashes.
    """

    name = "mock"

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        p_low = prompt.lower()
        if "bell state" in p_low or "ghz" in p_low or "circuit" in p_low:
            return (
                "```python\n"
                "from qiskit import QuantumCircuit\n"
                "from qiskit.quantum_info import Statevector\n"
                "# 2-qubit Bell state (|Φ+>)\n"
                "qc = QuantumCircuit(2)\n"
                "qc.h(0)\n"
                "qc.cx(0, 1)\n"
                "sv = Statevector(qc)\n"
                "print('Statevector:', sv)\n"
                "print('Probabilities:', sv.probabilities_dict())\n"
                "```\n\n"
                "This creates the maximally entangled Bell state: $(|00\\rangle + |11\\rangle) / \\sqrt{2}$."
            )
        return (
            "Quantum mechanics introduces state superposition and entanglement. "
            "In a 2-level quantum system (qubit), the general state is expressed as "
            "$|\\psi\\rangle = \\alpha|0\\rangle + \\beta|1\\rangle$, where $|\\alpha|^2 + |\\beta|^2 = 1$."
        )


class ChainedLLMProvider(BaseLLMProvider):
    """
    Tries each provider in order and falls through to the next on ANY failure
    (missing key, network error, and critically: quota/rate-limit exhaustion),
    so a maxed-out Gemini quota transparently degrades to Groq instead of
    breaking the agent workflow.
    """

    name = "chained"

    def __init__(self, providers: List[BaseLLMProvider]):
        self.providers = providers

    async def generate_text(
        self,
        prompt: str,
        system_prompt: Optional[str] = None,
        temperature: float = 0.2,
        history: Optional[List[Dict[str, str]]] = None,
    ) -> str:
        last_error: Optional[Exception] = None
        for provider in self.providers:
            try:
                return await provider.generate_text(
                    prompt, system_prompt=system_prompt, temperature=temperature, history=history
                )
            except Exception as e:
                last_error = e
                print(f"[ChainedLLMProvider] '{provider.name}' failed, trying next provider: {e}")
        # MockLLMProvider (always last in the chain) never raises, so this is unreachable
        # unless the chain was built without it.
        raise RuntimeError(f"All LLM providers failed. Last error: {last_error}")


def get_llm() -> BaseLLMProvider:
    """
    Factory method returning the active LLM provider chain:
    Gemini (primary) -> Groq (free fallback on quota/errors) -> Mock (offline safety net).
    Providers with no API key configured are skipped automatically.
    """
    chain: List[BaseLLMProvider] = []

    if settings.GEMINI_API_KEY.strip():
        chain.append(GeminiLLMProvider())
    if settings.GROQ_API_KEY.strip():
        chain.append(GroqLLMProvider())

    chain.append(MockLLMProvider())  # always-available final fallback

    return ChainedLLMProvider(chain)
