import os
import sys
import io
import uuid
import base64
from datetime import datetime, timedelta
from typing import Optional
from PIL import Image

from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

# Ensure root directory is in sys.path to import ml package
ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from ml.inference import run_detection, get_weights_path

# Fallback check on import/startup per requirement
weights_file = get_weights_path()
if not os.path.exists(weights_file):
    print(f"[!] Warning: {weights_file} does not exist yet.")

app = FastAPI(
    title="CivicScan Backend API",
    description="FastAPI backend for Civic Problem Detector powered by YOLOv8",
    version="1.0.0"
)

# CORS middleware allowing all origins
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for demo
reports_db = [
    {
        "report_id": "CS-1048",
        "detections": [{"issue_type": "road_damage", "confidence": 0.96, "severity": "High", "bbox": [120, 340, 280, 460]}],
        "result_image": "",
        "location": {"latitude": 30.3398, "longitude": 76.3869, "maps_link": "https://maps.google.com/?q=30.3398,76.3869"},
        "department": "Roads & Works Department",
        "urgency_score": 96,
        "status": "Pending",
        "timestamp": (datetime.now() - timedelta(minutes=12)).isoformat(),
        "issue_type": "road_damage",
        "severity": "High"
    },
    {
        "report_id": "CS-1047",
        "detections": [{"issue_type": "garbage", "confidence": 0.91, "severity": "Medium", "bbox": [50, 100, 200, 300]}],
        "result_image": "",
        "location": {"latitude": 30.9000, "longitude": 75.8573, "maps_link": "https://maps.google.com/?q=30.9000,75.8573"},
        "department": "Sanitation Department",
        "urgency_score": 60,
        "status": "In Progress",
        "timestamp": (datetime.now() - timedelta(minutes=28)).isoformat(),
        "issue_type": "garbage",
        "severity": "Medium"
    },
    {
        "report_id": "CS-1046",
        "detections": [{"issue_type": "waterlogging", "confidence": 0.88, "severity": "High", "bbox": [80, 150, 320, 400]}],
        "result_image": "",
        "location": {"latitude": 30.7415, "longitude": 76.7681, "maps_link": "https://maps.google.com/?q=30.7415,76.7681"},
        "department": "Water & Drainage Department",
        "urgency_score": 88,
        "status": "Pending",
        "timestamp": (datetime.now() - timedelta(hours=1)).isoformat(),
        "issue_type": "waterlogging",
        "severity": "High"
    },
    {
        "report_id": "CS-1045",
        "detections": [{"issue_type": "road_damage", "confidence": 0.94, "severity": "Low", "bbox": [100, 200, 180, 280]}],
        "result_image": "",
        "location": {"latitude": 30.3314, "longitude": 76.3997, "maps_link": "https://maps.google.com/?q=30.3314,76.3997"},
        "department": "Roads & Works Department",
        "urgency_score": 30,
        "status": "Resolved",
        "timestamp": (datetime.now() - timedelta(hours=2)).isoformat(),
        "issue_type": "road_damage",
        "severity": "Low"
    }
]

@app.get("/")
def read_root():
    return {
        "status": "online",
        "service": "CivicScan AI Backend",
        "weights_present": os.path.exists(get_weights_path()),
        "total_reports": len(reports_db)
    }

@app.post("/detect")
async def detect_issue(
    file: UploadFile = File(...),
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None)
):
    weights_path = get_weights_path()
    if not os.path.exists(weights_path):
        raise HTTPException(
            status_code=500,
            detail="Model not found. Run: python ml/download_model.py"
        )

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise ValueError("Uploaded file is empty")
        
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.load()
        except Exception:
            try:
                import pi_heif
                heif_file = pi_heif.read_heif(image_bytes)
                image = Image.frombytes(
                    heif_file.mode,
                    heif_file.size,
                    heif_file.data,
                    "raw"
                )
            except Exception:
                raise ValueError("Unsupported image format. Please upload a valid JPG, PNG, or WEBP photo.")
    except Exception as e:
        print(f"[!] Error decoding image: {e}")
        err_msg = str(e)
        if "cannot identify image file" in err_msg:
            err_msg = "Unsupported image format. Please upload a standard JPG, PNG, or WEBP photo."
        raise HTTPException(status_code=400, detail=err_msg)

    try:
        detections, result_image_b64 = run_detection(image, conf_threshold=0.3)
    except Exception as e:
        print(f"[!] Error running detection: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

    lat_val = 30.3398
    if latitude is not None and str(latitude).strip() not in ("", "null", "undefined", "NaN"):
        try:
            lat_val = float(latitude)
        except ValueError:
            pass

    lng_val = 76.3869
    if longitude is not None and str(longitude).strip() not in ("", "null", "undefined", "NaN"):
        try:
            lng_val = float(longitude)
        except ValueError:
            pass

    maps_link = f"https://maps.google.com/?q={lat_val},{lng_val}"

    return JSONResponse(content={
        "detections": detections,
        "result_image": result_image_b64,
        "location": {
            "latitude": lat_val,
            "longitude": lng_val,
            "maps_link": maps_link
        }
    })

@app.post("/submit-report")
async def submit_report(
    file: UploadFile = File(...),
    latitude: Optional[str] = Form(None),
    longitude: Optional[str] = Form(None)
):
    weights_path = get_weights_path()
    if not os.path.exists(weights_path):
        raise HTTPException(
            status_code=500,
            detail="Model not found. Run: python ml/download_model.py"
        )

    try:
        image_bytes = await file.read()
        if not image_bytes:
            raise ValueError("Uploaded file is empty")
        
        try:
            image = Image.open(io.BytesIO(image_bytes))
            image.load()
        except Exception:
            try:
                import pi_heif
                heif_file = pi_heif.read_heif(image_bytes)
                image = Image.frombytes(
                    heif_file.mode,
                    heif_file.size,
                    heif_file.data,
                    "raw"
                )
            except Exception:
                raise ValueError("Unsupported image format. Please upload a valid JPG, PNG, or WEBP photo.")
    except Exception as e:
        print(f"[!] Error decoding image: {e}")
        err_msg = str(e)
        if "cannot identify image file" in err_msg:
            err_msg = "Unsupported image format. Please upload a standard JPG, PNG, or WEBP photo."
        raise HTTPException(status_code=400, detail=err_msg)

    try:
        detections, result_image_b64 = run_detection(image, conf_threshold=0.3)
    except Exception as e:
        print(f"[!] Error running detection: {e}")
        raise HTTPException(status_code=500, detail=f"Detection failed: {str(e)}")

    # Calculate urgency score
    severity_weight = {"High": 1.0, "Medium": 0.6, "Low": 0.3}
    top_severity = detections[0]["severity"] if detections else "Low"
    top_confidence = detections[0]["confidence"] if detections else 0.5
    urgency = round(severity_weight.get(top_severity, 0.3) * top_confidence * 100)
    if urgency < 10:
        urgency = 30

    # Department routing
    dept_map = {
        "road_damage": "Roads & Works Department",
        "garbage": "Sanitation Department",
        "waterlogging": "Water & Drainage Department"
    }
    top_issue = detections[0]["issue_type"] if detections else "road_damage"
    department = dept_map.get(top_issue, "General Municipal")

    lat_val = 30.3398
    if latitude is not None and str(latitude).strip() not in ("", "null", "undefined", "NaN"):
        try:
            lat_val = float(latitude)
        except ValueError:
            pass

    lng_val = 76.3869
    if longitude is not None and str(longitude).strip() not in ("", "null", "undefined", "NaN"):
        try:
            lng_val = float(longitude)
        except ValueError:
            pass

    report_id = f"CS-{str(uuid.uuid4())[:6].upper()}"

    report = {
        "report_id": report_id,
        "detections": detections,
        "result_image": result_image_b64,
        "location": {
            "latitude": lat_val,
            "longitude": lng_val,
            "maps_link": f"https://maps.google.com/?q={lat_val},{lng_val}"
        },
        "department": department,
        "urgency_score": urgency,
        "status": "Pending",
        "timestamp": datetime.now().isoformat(),
        "issue_type": top_issue,
        "severity": top_severity
    }

    reports_db.append(report)
    reports_db.sort(key=lambda x: x["urgency_score"], reverse=True)

    return JSONResponse(content=report)

@app.get("/reports")
async def get_reports(status: Optional[str] = None, issue_type: Optional[str] = None):
    filtered = reports_db
    if status and status.lower() != "all":
        # Normalize status matching (Pending, In Progress, Resolved)
        filtered = [r for r in filtered if r["status"].lower().replace(" ", "") == status.lower().replace(" ", "")]
    if issue_type and issue_type.lower() != "all":
        filtered = [r for r in filtered if r["issue_type"].lower().replace(" ", "_") == issue_type.lower().replace(" ", "_")]
    return JSONResponse(content={"reports": filtered, "total": len(filtered)})

@app.patch("/reports/{report_id}")
async def update_status(report_id: str, status: str = Form(...)):
    for report in reports_db:
        if report["report_id"].upper() == report_id.upper():
            report["status"] = status
            return JSONResponse(content={"success": True, "report": report})
    return JSONResponse(content={"success": False, "message": "Report not found"}, status_code=404)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
