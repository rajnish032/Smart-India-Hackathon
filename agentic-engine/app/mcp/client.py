import os
import shutil
import sys
from pathlib import Path
from typing import Any, List, Optional
from app.core.config import settings

try:
    from langchain_mcp_adapters.client import MultiServerMCPClient
    from langchain_mcp_adapters.tools import load_mcp_tools
    HAS_MCP_ADAPTER = True
except ImportError:
    HAS_MCP_ADAPTER = False


class MCPManager:
    """Manages connections to local Qiskit MCP servers via Stdio."""

    def __init__(self):
        self.mcp_client: Optional[MultiServerMCPClient] = None
        self._is_initialized = False

        # Locate base directory for mcp-servers
        base_dir = Path(__file__).resolve().parent.parent.parent
        self.mcp_servers_dir = base_dir / "mcp-servers"

        # Locate uv executable
        venv_uv = base_dir.parent / ".venv" / "Scripts" / "uv.exe"
        if venv_uv.exists():
            self.uv_cmd = str(venv_uv)
        else:
            self.uv_cmd = shutil.which("uv") or "uv"

    def initialize(self):
        if not HAS_MCP_ADAPTER or not settings.ENABLE_MCP_TOOLS:
            print("[MCPManager] MCP adapters disabled or not installed.")
            return

        qiskit_server_dir = self.mcp_servers_dir / "qiskit-mcp-server"
        qiskit_docs_dir = self.mcp_servers_dir / "qiskit-docs-mcp-server"

        server_configs = {}
        if qiskit_server_dir.exists():
            server_configs["qiskit"] = {
                "transport": "stdio",
                "command": self.uv_cmd,
                "args": ["--directory", str(qiskit_server_dir), "run", "qiskit-mcp-server"],
            }

        if qiskit_docs_dir.exists():
            server_configs["qiskit_doc"] = {
                "transport": "stdio",
                "command": self.uv_cmd,
                "args": ["--directory", str(qiskit_docs_dir), "run", "qiskit-mcp-server"],
            }

        if server_configs:
            try:
                self.mcp_client = MultiServerMCPClient(server_configs)
                self._is_initialized = True
                print(f"[MCPManager] Initialized MultiServerMCPClient with servers: {list(server_configs.keys())}")
            except Exception as e:
                print(f"[MCPManager] Warning: Failed to initialize MCP client: {e}")

    async def get_tools_for_server(self, server_name: str) -> List[Any]:
        """Loads tools for a specific MCP server using a transient session."""
        if not self._is_initialized or not self.mcp_client:
            return []

        try:
            async with self.mcp_client.session(server_name) as session:
                tools = await load_mcp_tools(session)
                return tools
        except Exception as e:
            print(f"[MCPManager] Could not load tools from server '{server_name}': {e}")
            return []


mcp_manager = MCPManager()
