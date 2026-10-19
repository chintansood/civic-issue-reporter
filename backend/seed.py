import os
import io
import base64
import datetime
from PIL import Image, ImageDraw, ImageFont

from backend.database import SessionLocal, Base, engine
from backend.models import User, Department, Report, StatusHistory, Notification
from backend.auth import hash_password
from ml.inference import detect_issue

UPLOADS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "uploads"))
os.makedirs(UPLOADS_DIR, exist_ok=True)

def create_sample_issue_image(issue_type: str, title: str) -> tuple[str, str, str]:
    """
    Creates realistic sample image and annotated result image with cyan bounding box.
    Returns (orig_rel_url, result_rel_url, result_b64)
    """
    width, height = 640, 480
    img = Image.new("RGB", (width, height), color=(40, 45, 55))
    draw = ImageDraw.Draw(img)

    # Draw simulated urban background (road / pavement / street)
    if issue_type == "road_damage":
        # Dark asphalt background
        draw.rectangle([0, 0, width, height], fill=(50, 52, 58))
        # Road markings
        draw.line([width // 2, 0, width // 2, height], fill=(220, 220, 220), width=6)
        # Pothole in the road
        draw.ellipse([200, 160, 440, 340], fill=(25, 26, 30), outline=(15, 15, 18), width=3)
        draw.ellipse([230, 190, 410, 310], fill=(18, 18, 22))
        draw.ellipse([280, 230, 360, 280], fill=(10, 10, 12))
    elif issue_type == "garbage":
        # Street pavement background
        draw.rectangle([0, 0, width, height], fill=(70, 75, 78))
        draw.rectangle([0, 360, width, height], fill=(95, 100, 102))  # Curb
        # Garbage pile
        draw.polygon([(180, 360), (320, 180), (460, 360)], fill=(90, 80, 60))
        draw.rectangle([240, 260, 320, 340], fill=(45, 110, 65))  # Plastic bag
        draw.rectangle([340, 280, 410, 330], fill=(180, 80, 40))  # Cardboard box
        draw.ellipse([210, 310, 270, 350], fill=(30, 130, 170))  # Bottle/wrapper
    else:  # waterlogging
        # Flooded street
        draw.rectangle([0, 0, width, height], fill=(60, 65, 70))
        # Water pool reflection
        draw.ellipse([140, 140, 500, 360], fill=(42, 75, 105), outline=(60, 100, 135), width=2)
        draw.ellipse([200, 190, 440, 310], fill=(32, 62, 90))
        # Ripples
        draw.arc([180, 220, 320, 270], 0, 180, fill=(90, 140, 180), width=2)
        draw.arc([300, 250, 440, 300], 0, 180, fill=(90, 140, 180), width=2)

    # Save original image
    uid = title.lower().replace(" ", "_")
    filename_orig = f"seed_{uid}_orig.jpg"
    orig_path = os.path.join(UPLOADS_DIR, filename_orig)
    img.save(orig_path, format="JPEG", quality=90)

    # Run detection on it or draw bounding box
    res = detect_issue(img, conf_threshold=0.2)
    result_b64 = res["result_image"]

    # Save result image
    filename_res = f"seed_{uid}_result.jpg"
    res_path = os.path.join(UPLOADS_DIR, filename_res)
    with open(res_path, "wb") as f:
        f.write(base64.b64decode(result_b64))

    return f"/uploads/{filename_orig}", f"/uploads/{filename_res}", result_b64

def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    # Check if already seeded
    if db.query(Department).first():
        print("[✓] Database already contains seed data.")
        db.close()
        return

    print("[*] Seeding database with initial CivicScan data...")

    # 1. Departments
    depts = [
        Department(
            name="Roads Department",
            issue_types=["road_damage"],
            head_name="Er. Rajesh Verma",
            contact_email="roads@civicscan.com"
        ),
        Department(
            name="Sanitation Department",
            issue_types=["garbage"],
            head_name="Dr. Sunita Sharma",
            contact_email="sanitation@civicscan.com"
        ),
        Department(
            name="Water & Drainage Department",
            issue_types=["waterlogging"],
            head_name="Er. Amit Patel",
            contact_email="water@civicscan.com"
        )
    ]
    db.add_all(depts)
    db.commit()

    for d in depts:
        db.refresh(d)

    roads_dept = depts[0]
    sanitation_dept = depts[1]
    water_dept = depts[2]

    # 2. Users
    users = [
        # Admin
        User(
            name="Admin Officer",
            email="admin@civicscan.com",
            password_hash=hash_password("admin123"),
            phone="+91 98140 11223",
            role="admin",
            department_id=None
        ),
        # Staff 1: Roads
        User(
            name="Vikramjit Singh",
            email="roads@civicscan.com",
            password_hash=hash_password("staff123"),
            phone="+91 98720 33445",
            role="staff",
            department_id=roads_dept.dept_id
        ),
        # Staff 2: Sanitation
        User(
            name="Pooja Malhotra",
            email="sanitation@civicscan.com",
            password_hash=hash_password("staff123"),
            phone="+91 98881 55667",
            role="staff",
            department_id=sanitation_dept.dept_id
        ),
        # Staff 3: Water
        User(
            name="Harpreet Singh",
            email="water@civicscan.com",
            password_hash=hash_password("staff123"),
            phone="+91 97790 77889",
            role="staff",
            department_id=water_dept.dept_id
        ),
        # Citizen
        User(
            name="Amanpreet Kaur",
            email="citizen@civicscan.com",
            password_hash=hash_password("citizen123"),
            phone="+91 98765 43210",
            role="citizen",
            department_id=None
        )
    ]
    db.add_all(users)
    db.commit()

    for u in users:
        db.refresh(u)

    citizen_user = users[4]

    # 3. Reports
    now = datetime.datetime.utcnow()

    # Create visual sample files
    img1_orig, img1_res, b64_1 = create_sample_issue_image("road_damage", "rep_1048")
    img2_orig, img2_res, b64_2 = create_sample_issue_image("garbage", "rep_1047")
    img3_orig, img3_res, b64_3 = create_sample_issue_image("waterlogging", "rep_1046")
    img4_orig, img4_res, b64_4 = create_sample_issue_image("road_damage", "rep_1045")
    img5_orig, img5_res, b64_5 = create_sample_issue_image("garbage", "rep_1044")
    img6_orig, img6_res, b64_6 = create_sample_issue_image("waterlogging", "rep_1043")

    reports_data = [
        {
            "report_id": "CS-A3F9B2",
            "user_id": citizen_user.user_id,
            "image_url": img1_orig,
            "result_image_url": img1_res,
            "result_image_b64": b64_1,
            "issue_type": "road_damage",
            "confidence": 0.94,
            "severity": "High",
            "latitude": 30.3398,
            "longitude": 76.3869,
            "location_name": "Model Town, Patiala",
            "status": "pending",
            "department_id": roads_dept.dept_id,
            "urgency_score": 88,
            "duplicate_of": None,
            "duplicate_count": 2,
            "cost_estimate_min": 20000,
            "cost_estimate_max": 50000,
            "description": "Deep crater pothole near round-about causing heavy vehicle slowdowns and safety hazards.",
            "staff_notes": None,
            "created_at": now - datetime.timedelta(hours=2, minutes=15),
            "updated_at": now - datetime.timedelta(hours=2, minutes=15),
            "resolved_at": None,
            "histories": [
                {"old": None, "new": "pending", "by": "Amanpreet Kaur (Citizen)", "notes": "Report submitted via CivicScan AI Scanner"}
            ]
        },
        {
            "report_id": "CS-B7C1D4",
            "user_id": citizen_user.user_id,
            "image_url": img2_orig,
            "result_image_url": img2_res,
            "result_image_b64": b64_2,
            "issue_type": "garbage",
            "confidence": 0.89,
            "severity": "Medium",
            "latitude": 30.3421,
            "longitude": 76.3812,
            "location_name": "Leela Bhawan, Patiala",
            "status": "in_progress",
            "department_id": sanitation_dept.dept_id,
            "urgency_score": 67,
            "duplicate_of": None,
            "duplicate_count": 1,
            "cost_estimate_min": 2000,
            "cost_estimate_max": 5000,
            "description": "Uncollected household waste and commercial bins overflowing onto the pedestrian pathway.",
            "staff_notes": "Sanitation truck #04 dispatched to site for waste clearing.",
            "created_at": now - datetime.timedelta(hours=6, minutes=30),
            "updated_at": now - datetime.timedelta(hours=1, minutes=10),
            "resolved_at": None,
            "histories": [
                {"old": None, "new": "pending", "by": "Amanpreet Kaur (Citizen)", "notes": "Report submitted via CivicScan AI Scanner"},
                {"old": "pending", "new": "in_progress", "by": "Pooja Malhotra (Sanitation Staff)", "notes": "Sanitation truck #04 dispatched to site."}
            ]
        },
        {
            "report_id": "CS-E2F8G9",
            "user_id": citizen_user.user_id,
            "image_url": img3_orig,
            "result_image_url": img3_res,
            "result_image_b64": b64_3,
            "issue_type": "waterlogging",
            "confidence": 0.92,
            "severity": "High",
            "latitude": 30.7415,
            "longitude": 76.7681,
            "location_name": "Sector 17 Plaza, Chandigarh",
            "status": "pending",
            "department_id": water_dept.dept_id,
            "urgency_score": 92,
            "duplicate_of": None,
            "duplicate_count": 0,
            "cost_estimate_min": 30000,
            "cost_estimate_max": 80000,
            "description": "Severe storm drain blockage causing ankle-deep water accumulation on the main promenade.",
            "staff_notes": None,
            "created_at": now - datetime.timedelta(hours=3, minutes=45),
            "updated_at": now - datetime.timedelta(hours=3, minutes=45),
            "resolved_at": None,
            "histories": [
                {"old": None, "new": "pending", "by": "Amanpreet Kaur (Citizen)", "notes": "Report submitted via CivicScan AI Scanner"}
            ]
        },
        {
            "report_id": "CS-H5J3K1",
            "user_id": citizen_user.user_id,
            "image_url": img4_orig,
            "result_image_url": img4_res,
            "result_image_b64": b64_4,
            "issue_type": "road_damage",
            "confidence": 0.95,
            "severity": "Low",
            "latitude": 30.9000,
            "longitude": 75.8573,
            "location_name": "Chaura Bazaar, Ludhiana",
            "status": "resolved",
            "department_id": roads_dept.dept_id,
            "urgency_score": 38,
            "duplicate_of": None,
            "duplicate_count": 0,
            "cost_estimate_min": 2000,
            "cost_estimate_max": 8000,
            "description": "Minor asphalt degradation along curb edge.",
            "staff_notes": "Patchwork and bitumen sealing completed by Zone 3 maintenance crew.",
            "created_at": now - datetime.timedelta(days=1, hours=4),
            "updated_at": now - datetime.timedelta(hours=4),
            "resolved_at": now - datetime.timedelta(hours=4),
            "histories": [
                {"old": None, "new": "pending", "by": "Amanpreet Kaur (Citizen)", "notes": "Report submitted via CivicScan AI Scanner"},
                {"old": "pending", "new": "in_progress", "by": "Vikramjit Singh (Roads Staff)", "notes": "Work order issued for asphalt repair"},
                {"old": "in_progress", "new": "resolved", "by": "Vikramjit Singh (Roads Staff)", "notes": "Patchwork and bitumen sealing completed."}
            ]
        },
        {
            "report_id": "CS-M8N4P6",
            "user_id": citizen_user.user_id,
            "image_url": img5_orig,
            "result_image_url": img5_res,
            "result_image_b64": b64_5,
            "issue_type": "garbage",
            "confidence": 0.87,
            "severity": "Medium",
            "latitude": 30.3541,
            "longitude": 76.4190,
            "location_name": "Urban Estate Phase 2, Patiala",
            "status": "resolved",
            "department_id": sanitation_dept.dept_id,
            "urgency_score": 55,
            "duplicate_of": None,
            "duplicate_count": 0,
            "cost_estimate_min": 2000,
            "cost_estimate_max": 5000,
            "description": "Construction debris and plastic bags dumped in empty residential plot.",
            "staff_notes": "Debris hauled away to regional processing plant. Site sanitized.",
            "created_at": now - datetime.timedelta(days=2, hours=8),
            "updated_at": now - datetime.timedelta(days=1),
            "resolved_at": now - datetime.timedelta(days=1),
            "histories": [
                {"old": None, "new": "pending", "by": "Amanpreet Kaur (Citizen)", "notes": "Report submitted via CivicScan AI Scanner"},
                {"old": "pending", "new": "in_progress", "by": "Pooja Malhotra (Sanitation Staff)", "notes": "Scheduled for morning cleanup"},
                {"old": "in_progress", "new": "resolved", "by": "Pooja Malhotra (Sanitation Staff)", "notes": "Site cleared and sanitized."}
            ]
        },
        {
            "report_id": "CS-Q2R5S7",
            "user_id": citizen_user.user_id,
            "image_url": img6_orig,
            "result_image_url": img6_res,
            "result_image_b64": b64_6,
            "issue_type": "waterlogging",
            "confidence": 0.91,
            "severity": "High",
            "latitude": 30.8920,
            "longitude": 75.8200,
            "location_name": "Ferozepur Road, Ludhiana",
            "status": "in_progress",
            "department_id": water_dept.dept_id,
            "urgency_score": 85,
            "duplicate_of": None,
            "duplicate_count": 1,
            "cost_estimate_min": 30000,
            "cost_estimate_max": 80000,
            "description": "Underpass water accumulation after rain, disrupting service lane traffic.",
            "staff_notes": "High-capacity submersible pumps operational. Water level receding.",
            "created_at": now - datetime.timedelta(hours=5),
            "updated_at": now - datetime.timedelta(hours=2),
            "resolved_at": None,
            "histories": [
                {"old": None, "new": "pending", "by": "Amanpreet Kaur (Citizen)", "notes": "Report submitted via CivicScan AI Scanner"},
                {"old": "pending", "new": "in_progress", "by": "Harpreet Singh (Water Staff)", "notes": "High-capacity pump deployed."}
            ]
        }
    ]

    for item in reports_data:
        histories = item.pop("histories")
        rep = Report(**item)
        db.add(rep)
        db.commit()

        for h in histories:
            sh = StatusHistory(
                report_id=rep.report_id,
                old_status=h["old"],
                new_status=h["new"],
                changed_by=h["by"],
                notes=h["notes"],
                changed_at=now - datetime.timedelta(minutes=30)
            )
            db.add(sh)

        # Citizen notification
        notif = Notification(
            user_id=citizen_user.user_id,
            report_id=rep.report_id,
            message=f"Report #{rep.report_id} is currently {rep.status.replace('_', ' ').title()}.",
            type="status_change"
        )
        db.add(notif)
        db.commit()

    print("[✓] Seed data created successfully:")
    print("    - 3 Departments (Roads, Sanitation, Water)")
    print("    - 1 Admin (admin@civicscan.com / admin123)")
    print("    - 3 Staff (roads@civicscan.com, sanitation@civicscan.com, water@civicscan.com / staff123)")
    print("    - 1 Citizen (citizen@civicscan.com / citizen123)")
    print("    - 6 Sample Reports with real bounding box images & histories")

    db.close()

if __name__ == "__main__":
    seed_database()
