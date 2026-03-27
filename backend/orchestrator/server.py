from fastapi import FastAPI
from .routes import router

app = FastAPI(title="Physics AI Tutor Orchestrator")

app.include_router(router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok"}
