from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.routes import router as agentic_router
from app.core.config import settings
from app.mcp.client import mcp_manager


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle event handler for the Agentic Engine."""
    print(f"[{settings.PROJECT_NAME}] Starting up on port {settings.PORT}...")
    try:
        mcp_manager.initialize()
    except Exception as e:
        print(f"[{settings.PROJECT_NAME}] MCP Init notice: {e}")
    yield
    print(f"[{settings.PROJECT_NAME}] Shutting down...")


app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.DESCRIPTION,
    version=settings.VERSION,
    lifespan=lifespan,
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount routes under /api/v1/agentic
app.include_router(agentic_router, prefix="/api/v1/agentic", tags=["agentic-learning"])


@app.get("/")
def root():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
        "docs_url": "/docs",
    }


@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": settings.PROJECT_NAME,
        "version": settings.VERSION,
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=True)
