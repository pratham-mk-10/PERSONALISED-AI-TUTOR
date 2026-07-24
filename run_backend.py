#!/usr/bin/env python
"""
Startup script for the backend server.
Sets up Python path and runs uvicorn.
"""
import sys
import os
from pathlib import Path

# Add backend directory to Python path
backend_path = Path(__file__).parent / "backend"
sys.path.insert(0, str(backend_path))
sys.path.insert(0, str(backend_path.parent))

# Now run uvicorn
import uvicorn

if __name__ == "__main__":
    uvicorn.run(
        "orchestrator.server:app",
        host="0.0.0.0",
        port=8000,
        reload=False
    )
