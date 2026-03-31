from fastapi import FastAPI

from orchestrator.routes import router as orchestrator_router


app = FastAPI()
app.include_router(orchestrator_router)


@app.get("/")
def home():
    return {"message": "Backend is running"}
