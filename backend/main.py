import os
import sys
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

# Ensure project root is in sys.path
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.database import Base, engine
from backend.routes import auth, reports, departments, stats
from backend.seed import seed_database

# Initialize database schema
Base.metadata.create_all(bind=engine)

# Auto seed if clean
try:
    seed_database()
except Exception as e:
    print(f"[!] Seed notice: {e}")

app = FastAPI(
    title="CivicScan AI Backend API",
    description="Full-stack AI Civic Issue Reporter API powered by YOLOv8, PostgreSQL & FastAPI",
    version="2.0.0"
)

# CORS configuration
origins = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:3001",
    "http://127.0.0.1:3001",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Serve uploaded media files
UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOADS_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Include Routers
app.include_router(auth.router)
app.include_router(reports.router)
app.include_router(departments.router)
app.include_router(stats.router)

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "CivicScan AI Backend v2.0",
        "weights_path": os.path.join(ROOT_DIR, "ml", "weights", "best.pt"),
        "docs": "/docs"
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("backend.main:app", host="0.0.0.0", port=8000, reload=True)
