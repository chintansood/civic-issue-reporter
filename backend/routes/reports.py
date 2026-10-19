import os
import io
import math
import uuid
import base64
import datetime
from typing import Optional, List
from PIL import Image

from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form, Query
from sqlalchemy.orm import Session
from sqlalchemy import or_

from backend.database import get_db
from backend.models import Report, Department, User, StatusHistory, Notification
from backend.schemas import ReportOut, ReportDetailOut, StatusUpdate, ReportMapItem, DetectResponse, DetectionItem
from backend.auth import get_current_user, get_optional_current_user, require_role
from ml.inference import detect_issue

router = APIRouter(prefix="/reports", tags=["Reports"])

UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..", "uploads"))
os.makedirs(UPLOADS_DIR, exist_ok=True)

def haversine_distance(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    R = 6371000  # meters
    phi1 = math.radians(lat1)
    phi2 = math.radians(lat2)
    delta_phi = math.radians(lat2 - lat1)
    delta_lambda = math.radians(lon2 - lon1)
    a = math.sin(delta_phi / 2)**2 + math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2)**2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return R * c

def report_to_out(r: Report) -> ReportOut:
    dept_name = r.department.name if r.department else None
    return ReportOut(
        report_id=r.report_id,
        user_id=r.user_id,
        image_url=r.image_url,
        result_image_url=r.result_image_url,
        result_image_b64=r.result_image_b64,
        issue_type=r.issue_type,
        confidence=r.confidence,
        severity=r.severity,
        latitude=r.latitude,
        longitude=r.longitude,
        location_name=r.location_name,
        status=r.status,
        department_id=r.department_id,
        department_name=dept_name,
        urgency_score=r.urgency_score,
        duplicate_of=r.duplicate_of,
        duplicate_count=r.duplicate_count,
        cost_estimate_min=r.cost_estimate_min,
        cost_estimate_max=r.cost_estimate_max,
        description=r.description,
        staff_notes=r.staff_notes,
        created_at=r.created_at,
        updated_at=r.updated_at,
        resolved_at=r.resolved_at
    )

@router.post("/detect", response_model=DetectResponse)
async def detect_report_issue(
    file: UploadFile = File(...),
    latitude: Optional[float] = Form(30.3398),
    longitude: Optional[float] = Form(76.3869),
    db: Session = Depends(get_db)
):
    try:
        content = await file.read()
        if not content:
            raise HTTPException(status_code=400, detail="Empty image file uploaded")
        image = Image.open(io.BytesIO(content)).convert("RGB")
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Invalid image format: {str(e)}")

    # Run YOLO detection
    detection_result = detect_issue(image, conf_threshold=0.3)
    detections_raw = detection_result["detections"]
    result_b64 = detection_result["result_image"]

    detections = []
    for d in detections_raw:
        detections.append(DetectionItem(
            issue_type=d["issue_type"],
            confidence=d["confidence"],
            severity=d["severity"],
            bbox=d["bbox"],
            department=d["department"],
            cost_min=d["cost_min"],
            cost_max=d["cost_max"]
        ))

    # Determine top issue / fallback
    if detections:
        top_det = detections[0]
        top_issue = top_det.issue_type
        top_severity = top_det.severity
        top_conf = top_det.confidence
        top_dept_name = top_det.department
        cost_min = top_det.cost_min
        cost_max = top_det.cost_max
    else:
        # Fallback if no specific object detected with conf > 0.3
        top_issue = "road_damage"
        top_severity = "Low"
        top_conf = 0.25
        top_dept_name = "Roads Department"
        cost_min = 2000
        cost_max = 8000

    # Calculate urgency score (0-100)
    sev_weights = {"High": 1.0, "Medium": 0.65, "Low": 0.35}
    urgency = int(min(100, max(20, round(sev_weights.get(top_severity, 0.5) * top_conf * 100 + 20))))

    # Check for duplicates nearby (<250 meters)
    duplicate_warning = None
    duplicate_count = 0
    duplicate_of = None
    nearby_reports = db.query(Report).filter(
        Report.issue_type == top_issue,
        Report.status.in_(["pending", "in_progress"])
    ).all()

    matching_dupes = []
    for nr in nearby_reports:
        dist = haversine_distance(latitude, longitude, nr.latitude, nr.longitude)
        if dist <= 300:  # within 300 meters
            matching_dupes.append(nr)

    if matching_dupes:
        duplicate_count = len(matching_dupes)
        duplicate_of = matching_dupes[0].report_id
        duplicate_warning = f"⚠️ {duplicate_count} similar report{'s' if duplicate_count > 1 else ''} exist nearby. Your report will be linked."

    cost_str = f"₹{cost_min:,} - ₹{cost_max:,} (estimated)"

    return DetectResponse(
        detections=detections,
        result_image=result_b64,
        location={
            "latitude": latitude,
            "longitude": longitude,
            "city": "Patiala, Punjab",
            "maps_link": f"https://maps.google.com/?q={latitude},{longitude}"
        },
        duplicate_warning=duplicate_warning,
        duplicate_count=duplicate_count,
        duplicate_of=duplicate_of,
        estimated_cost_range=cost_str,
        top_issue=top_issue,
        top_severity=top_severity,
        top_department=top_dept_name,
        urgency_score=urgency
    )

@router.post("/submit", response_model=ReportOut)
async def submit_report(
    file: Optional[UploadFile] = File(None),
    latitude: float = Form(...),
    longitude: float = Form(...),
    location_name: Optional[str] = Form("Patiala, Punjab"),
    issue_type: str = Form(...),
    confidence: float = Form(0.85),
    severity: str = Form("Medium"),
    urgency_score: int = Form(75),
    cost_estimate_min: int = Form(5000),
    cost_estimate_max: int = Form(15000),
    description: Optional[str] = Form(None),
    result_image_b64: Optional[str] = Form(None),
    image_b64: Optional[str] = Form(None),
    duplicate_of: Optional[str] = Form(None),
    duplicate_count: int = Form(0),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    short_uid = str(uuid.uuid4()).replace("-", "")[:8].upper()
    report_id = f"CS-{short_uid[:6]}"

    # Save original image file to uploads/
    filename_orig = f"{report_id}_orig.jpg"
    filepath_orig = os.path.join(UPLOADS_DIR, filename_orig)

    if file:
        content = await file.read()
        with open(filepath_orig, "wb") as f:
            f.write(content)
    elif image_b64:
        # Decode base64
        clean_b64 = image_b64.split(",")[-1]
        with open(filepath_orig, "wb") as f:
            f.write(base64.b64decode(clean_b64))
    else:
        # Default placeholder
        img = Image.new("RGB", (640, 480), color=(30, 41, 59))
        img.save(filepath_orig, format="JPEG")

    # Save result image if present
    filename_res = f"{report_id}_result.jpg"
    filepath_res = os.path.join(UPLOADS_DIR, filename_res)
    if result_image_b64:
        clean_res_b64 = result_image_b64.split(",")[-1]
        with open(filepath_res, "wb") as f:
            f.write(base64.b64decode(clean_res_b64))
    else:
        # Copy original if no annotated image
        if os.path.exists(filepath_orig):
            with open(filepath_orig, "rb") as rf, open(filepath_res, "wb") as wf:
                wf.write(rf.read())

    # Map department safely (Postgres JSON column safe)
    dept = None
    clean_type = (issue_type or "").lower().replace(" ", "_")
    dept_name_map = {
        "road_damage": "Roads Department",
        "garbage": "Sanitation Department",
        "waterlogging": "Water & Drainage Department"
    }

    # 1. Primary lookup by standard mapped name
    target_name = dept_name_map.get(clean_type)
    if target_name:
        dept = db.query(Department).filter(Department.name == target_name).first()

    # 2. Secondary lookup checking issue_types in memory
    if not dept:
        all_depts = db.query(Department).all()
        for d in all_depts:
            types = d.issue_types if isinstance(d.issue_types, list) else []
            if clean_type in types:
                dept = d
                break

    # 3. Final fallback to first department
    if not dept:
        dept = db.query(Department).first()

    dept_id = dept.dept_id if dept else None

    # Handle duplicates linking
    if duplicate_of:
        parent_report = db.query(Report).filter(Report.report_id == duplicate_of).first()
        if parent_report:
            parent_report.duplicate_count += 1
            # Merge urgency if higher
            if urgency_score > parent_report.urgency_score:
                parent_report.urgency_score = urgency_score

    new_report = Report(
        report_id=report_id,
        user_id=current_user.user_id if current_user else None,
        image_url=f"/uploads/{filename_orig}",
        result_image_url=f"/uploads/{filename_res}",
        result_image_b64=result_image_b64,
        issue_type=issue_type,
        confidence=confidence,
        severity=severity,
        latitude=latitude,
        longitude=longitude,
        location_name=location_name or "Patiala, Punjab",
        status="pending",
        department_id=dept_id,
        urgency_score=urgency_score,
        duplicate_of=duplicate_of,
        duplicate_count=duplicate_count,
        cost_estimate_min=cost_estimate_min,
        cost_estimate_max=cost_estimate_max,
        description=description,
        created_at=datetime.datetime.utcnow(),
        updated_at=datetime.datetime.utcnow()
    )
    db.add(new_report)
    db.commit()
    db.refresh(new_report)

    # Add initial status history
    author_name = current_user.name if current_user else "Citizen"
    hist = StatusHistory(
        report_id=report_id,
        old_status=None,
        new_status="pending",
        changed_by=author_name,
        notes="Issue reported via CivicScan AI scanner",
        changed_at=datetime.datetime.utcnow()
    )
    db.add(hist)

    # Add notification for user
    if current_user:
        dept_title = dept.name if dept else "Municipal Authority"
        notif = Notification(
            user_id=current_user.user_id,
            report_id=report_id,
            message=f"Report #{report_id} submitted and assigned to {dept_title}.",
            type="report_submitted"
        )
        db.add(notif)

    db.commit()
    return report_to_out(new_report)

@router.get("", response_model=List[ReportOut])
def get_reports(
    status: Optional[str] = Query(None),
    issue_type: Optional[str] = Query(None),
    department_id: Optional[int] = Query(None),
    mine_only: Optional[bool] = Query(False),
    current_user: Optional[User] = Depends(get_optional_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Report)

    # Role-based scoping
    if mine_only:
        if current_user:
            query = query.filter(Report.user_id == current_user.user_id)
        else:
            return []
    elif current_user and current_user.role == "staff" and current_user.department_id and not department_id:
        query = query.filter(Report.department_id == current_user.department_id)

    if department_id:
        query = query.filter(Report.department_id == department_id)

    if status and status.lower() != "all":
        # Normalize status
        st_clean = status.lower().replace(" ", "_")
        query = query.filter(Report.status == st_clean)

    if issue_type and issue_type.lower() != "all":
        it_clean = issue_type.lower().replace(" ", "_")
        query = query.filter(Report.issue_type == it_clean)

    # Urgency order
    reports = query.order_by(Report.urgency_score.desc(), Report.created_at.desc()).all()
    return [report_to_out(r) for r in reports]

@router.get("/map", response_model=List[ReportMapItem])
def get_map_reports(
    department_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    query = db.query(Report)
    if department_id:
        query = query.filter(Report.department_id == department_id)
    if status and status.lower() != "all":
        query = query.filter(Report.status == status.lower().replace(" ", "_"))

    reports = query.order_by(Report.created_at.desc()).all()
    results = []
    for r in reports:
        results.append(ReportMapItem(
            report_id=r.report_id,
            issue_type=r.issue_type,
            severity=r.severity,
            status=r.status,
            latitude=r.latitude,
            longitude=r.longitude,
            location_name=r.location_name,
            urgency_score=r.urgency_score,
            image_url=r.result_image_url or r.image_url,
            created_at=r.created_at
        ))
    return results

@router.get("/{report_id}", response_model=ReportDetailOut)
def get_report_detail(
    report_id: str,
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.report_id == report_id.upper()).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    # Fetch duplicates
    duplicates = db.query(Report).filter(Report.duplicate_of == report.report_id).all()

    # User info
    u_name = report.user.name if report.user else "Anonymous Citizen"
    u_email = report.user.email if report.user else "citizen@civicscan.com"

    base_out = report_to_out(report)
    return ReportDetailOut(
        **base_out.model_dump(),
        status_history=report.status_history,
        user_name=u_name,
        user_email=u_email,
        duplicate_reports=[report_to_out(d) for d in duplicates]
    )

@router.patch("/{report_id}/status", response_model=ReportOut)
def update_report_status(
    report_id: str,
    update_data: StatusUpdate,
    current_user: User = Depends(require_role(["staff", "admin"])),
    db: Session = Depends(get_db)
):
    report = db.query(Report).filter(Report.report_id == report_id.upper()).first()
    if not report:
        raise HTTPException(status_code=404, detail="Report not found")

    old_status = report.status
    new_st = update_data.status.lower().replace(" ", "_")
    report.status = new_st
    report.updated_at = datetime.datetime.utcnow()

    if update_data.notes:
        report.staff_notes = update_data.notes

    if new_st == "resolved":
        report.resolved_at = datetime.datetime.utcnow()

    # Add to status history
    hist = StatusHistory(
        report_id=report.report_id,
        old_status=old_status,
        new_status=new_st,
        changed_by=f"{current_user.name} ({current_user.role.title()})",
        notes=update_data.notes or f"Status changed from {old_status} to {new_st}",
        changed_at=datetime.datetime.utcnow()
    )
    db.add(hist)

    # Notify citizen
    if report.user_id:
        status_display = new_st.replace("_", " ").title()
        notif = Notification(
            user_id=report.user_id,
            report_id=report.report_id,
            message=f"Update: Report #{report.report_id} status changed to '{status_display}'.",
            type="status_change"
        )
        db.add(notif)

    db.commit()
    db.refresh(report)
    return report_to_out(report)
