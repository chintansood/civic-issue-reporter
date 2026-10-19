import os
import io
import base64
from PIL import Image
import numpy as np
import cv2
from ultralytics import YOLO

from ml.severity import calculate_severity

_model = None

DEPT_MAP = {
    "road_damage": "Roads Department",
    "garbage": "Sanitation Department",
    "waterlogging": "Water & Drainage Department"
}

COST_MAP = {
    "road_damage": {"High": (20000, 50000), "Medium": (8000, 20000), "Low": (2000, 8000)},
    "garbage": {"High": (5000, 15000), "Medium": (2000, 5000), "Low": (500, 2000)},
    "waterlogging": {"High": (30000, 80000), "Medium": (10000, 30000), "Low": (3000, 10000)}
}

def get_weights_path() -> str:
    script_dir = os.path.dirname(os.path.abspath(__file__))
    project_root = os.path.dirname(script_dir)
    
    candidate_paths = [
        os.path.join(project_root, "ml", "weights", "best.pt"),
        os.path.join(script_dir, "weights", "best.pt"),
        "ml/weights/best.pt"
    ]
    
    for path in candidate_paths:
        if os.path.exists(path):
            return path
            
    return candidate_paths[0]

def load_yolo_model():
    global _model
    if _model is not None:
        return _model
        
    weights_path = get_weights_path()
    if not os.path.exists(weights_path):
        raise RuntimeError("Model not found at " + weights_path)
        
    _model = YOLO(weights_path)
    return _model

def detect_issue(image_input, conf_threshold: float = 0.3):
    """
    Accepts bytes or PIL.Image.
    Runs YOLOv8 detection and returns detections list and result_image base64.
    """
    if isinstance(image_input, bytes):
        pil_image = Image.open(io.BytesIO(image_input)).convert("RGB")
    elif isinstance(image_input, Image.Image):
        pil_image = image_input.convert("RGB")
    else:
        raise ValueError("Unsupported image input type")

    model = load_yolo_model()
    
    img_rgb = np.array(pil_image)
    img_height, img_width = img_rgb.shape[:2]
    image_area = img_width * img_height

    results = model(img_rgb, conf=conf_threshold)
    
    detections = []
    
    if len(results) > 0 and results[0].boxes is not None and len(results[0].boxes) > 0:
        result = results[0]
        boxes = result.boxes
        
        for box in boxes:
            cls_id = int(box.cls[0].item())
            class_name = result.names.get(cls_id, f"issue_{cls_id}")
            issue_type = class_name.lower().replace(" ", "_")
            confidence = float(box.conf[0].item())
            
            xyxy = box.xyxy[0].tolist()
            bbox = [int(round(coord)) for coord in xyxy]
            
            # Severity using formula
            severity = calculate_severity(confidence, bbox, img_width, img_height)
            cost = COST_MAP.get(issue_type, {}).get(severity, (1000, 5000))
            dept = DEPT_MAP.get(issue_type, "General Municipal")
            
            detections.append({
                "issue_type": issue_type,
                "confidence": round(confidence, 2),
                "severity": severity,
                "bbox": bbox,
                "department": dept,
                "cost_min": cost[0],
                "cost_max": cost[1]
            })
            
        annotated_bgr = result.plot()
        success, encoded_img = cv2.imencode('.jpg', annotated_bgr)
        if success:
            result_b64 = base64.b64encode(encoded_img.tobytes()).decode('utf-8')
        else:
            buffer = io.BytesIO()
            pil_image.save(buffer, format="JPEG")
            result_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')
    else:
        buffer = io.BytesIO()
        pil_image.save(buffer, format="JPEG")
        result_b64 = base64.b64encode(buffer.getvalue()).decode('utf-8')

    return {"detections": detections, "result_image": result_b64}

# Alias run_detection for compatibility
def run_detection(pil_image: Image.Image, conf_threshold: float = 0.3):
    res = detect_issue(pil_image, conf_threshold=conf_threshold)
    return res["detections"], res["result_image"]
