import os
from typing import Any, Dict, List, Optional
from app.core.config import settings

try:
    from tavily import TavilyClient
    HAS_TAVILY = True
except ImportError:
    HAS_TAVILY = False


class TavilySearchTool:
    """Tool for querying current quantum developments and research via Tavily API."""

    def __init__(self, api_key: Optional[str] = None):
        self.api_key = api_key or settings.TAVILY_API_KEY or os.getenv("TAVILY_API_KEY", "")
        self.client = None
        if self.api_key and HAS_TAVILY:
            try:
                self.client = TavilyClient(api_key=self.api_key)
            except Exception as e:
                print(f"[TavilySearchTool] Warning: Could not initialize Tavily client: {e}")

    async def search(self, query: str, max_results: int = 3) -> Dict[str, Any]:
        """Runs web search for live quantum information."""
        if not self.client:
            return self._fallback_knowledge(query)

        try:
            # Query Tavily search
            response = self.client.search(
                query=f"quantum computing {query}",
                search_depth="basic",
                max_results=max_results,
            )
            results = []
            for r in response.get("results", []):
                results.append({
                    "title": r.get("title", "Quantum Reference"),
                    "url": r.get("url", ""),
                    "content": r.get("content", ""),
                })
            return {"results": results, "source": "tavily_live"}
        except Exception as e:
            print(f"[TavilySearchTool] Search query failed: {e}. Using fallback.")
            return self._fallback_knowledge(query)

    def _fallback_knowledge(self, query: str) -> Dict[str, Any]:
        """Reliable quantum facts fallback when Tavily is offline."""
        q_low = query.lower()
        if "hardware" in q_low or "processor" in q_low or "ibm" in q_low or "google" in q_low:
            return {
                "source": "curated_quantum_index",
                "results": [
                    {
                        "title": "IBM Quantum Utility & Heron Architecture",
                        "url": "https://www.ibm.com/quantum",
                        "content": "IBM's 133-qubit Heron architecture achieves 5x error reduction over previous Eagle processors, with tunable couplers facilitating 2-qubit gate fidelities exceeding 99.5%.",
                    },
                    {
                        "title": "Google Quantum AI & Sycamore/Willow Scaling",
                        "url": "https://quantumai.google/",
                        "content": "Google Quantum AI demonstrated physical-to-logical qubit threshold improvements on surface code error correction using superconducting transmon architectures.",
                    },
                ],
            }
        return {
            "source": "curated_quantum_index",
            "results": [
                {
                    "title": "Qiskit 1.0+ Architecture & Dynamic Circuits",
                    "url": "https://docs.quantum.ibm.com",
                    "content": "Modern Qiskit 1.0+ utilizes Rustworkx for lightning-fast transpilation, ISA target circuits, and native mid-circuit measurements with classical feed-forward conditionals.",
                }
            ],
        }


tavily_tool = TavilySearchTool()
