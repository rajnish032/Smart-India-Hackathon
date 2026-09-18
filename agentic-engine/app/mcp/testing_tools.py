import asyncio
from langchain_mcp_adapters.client import MultiServerMCPClient
from langchain_mcp_adapters.tools import load_mcp_tools


async def main():
    # Configure MCP client
    mcp_client = MultiServerMCPClient({
        "qiskit": {
            "transport": "stdio",
            "command": "uv",
            "args": [
                "--directory",
                "C:/Users/Admin/PycharmProjects/Smart-India-Hackathon/agentic-engine/mcp-servers/qiskit-mcp-server",
                "run",
                "qiskit-mcp-server"
            ]
        },
        "qiskit_doc": {
            "transport": "stdio",
            "command": "uv",
            "args": [
                "--directory",
                "C:/Users/Admin/PycharmProjects/Smart-India-Hackathon/agentic-engine/mcp-servers/qiskit-docs-mcp-server",
                "run",
                "qiskit-mcp-server"
            ]
        }
    })

    # Use persistent session for efficient tool calls
    for layer in ["qiskit","qiskit_doc"]:
        print("#"*20)
        print(f"LAYER:- {layer}")
        print("#"*20)

        async with mcp_client.session(layer) as session:
            tools = await load_mcp_tools(session)
            for tool in tools:
                print(f"TOOL NAME:-{tool.name}")
                print(f"TOOL DES :- {tool.description}")
                print(f"TOOL INPUT:_{ tool.get_input_schema()}")
                print("#"*20)


asyncio.run(main())
