from fastapi import APIRouter
from app.ai.tutor.router import router as tutor_router
from app.api.routes.simulate import router as simulate_router

api_router = APIRouter()

# AI Tutor & Video Generation routes
api_router.include_router(tutor_router, prefix="/ai/tutor", tags=["ai-tutor"])

# Quantum Simulation route
api_router.include_router(simulate_router, prefix="/simulate", tags=["simulate"])

