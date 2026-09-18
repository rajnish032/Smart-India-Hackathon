import os
from typing import List, Union
from pydantic import Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Configuration settings for the Agentic Quantum Engine."""

    PROJECT_NAME: str = "Quantum Agentic Learning Engine"
    DESCRIPTION: str = "Multi-Agent Quantum Learning Operating System with LangGraph, Qiskit/Cirq, RAG, and Self-Healing Debugging"
    VERSION: str = "1.0.0"

    # Server binding
    HOST: str = "0.0.0.0"
    PORT: int = 8001
    ENVIRONMENT: str = "development"

    # CORS origins
    CORS_ORIGINS: List[str] = [
        "http://localhost:3000",
        "http://localhost:5001",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5001",
    ]

    # LLM Abstraction: Gemini (primary) -> Groq (free fallback on quota/errors) -> Mock
    LLM_PROVIDER: str = "gemini"
    GEMINI_API_KEY: str = ""
    GEMINI_MODEL: str = "gemini-3.6-flash"
    GEMINI_FALLBACK_MODEL: str = "gemini-2.5-flash"

    # Groq free-tier fallback (https://console.groq.com/keys) - used automatically
    # when Gemini's quota is exhausted or it errors out.
    GROQ_API_KEY: str = ""
    GROQ_MODEL: str = "openai/gpt-oss-120b"

    # External APIs
    TAVILY_API_KEY: str = ""

    # Quantum Execution and Debugging Sandbox
    MAX_DEBUG_ITERATIONS: int = 5
    EXECUTION_TIMEOUT_SECONDS: int = 15
    LOCAL_SIMULATION_ONLY: bool = True
    ENABLE_MCP_TOOLS: bool = True

    # RAG & Persistence
    DATA_DIR: str = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), "data")
    DATABASE_URL: str = ""

    model_config = SettingsConfigDict(
        env_file=os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    @field_validator("CORS_ORIGINS", mode="before")
    @classmethod
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> List[str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",") if i.strip()]
        elif isinstance(v, list):
            return v
        return [
            "http://localhost:3000",
            "http://localhost:5001",
            "http://127.0.0.1:3000",
            "http://127.0.0.1:5001",
        ]


settings = Settings()
