import os
import io
import base64
from PIL import Image
import numpy as np
import cv2
from ultralytics import YOLO

from ml.severity import calculate_severity

_model = None

def get_weights_path() -> str:
    # Look for ml/weights/best.pt relative to project root or script directory
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
        raise RuntimeError("Model not found. Run: python ml/download_model.py")
        
    _model = YOLO(weights_path)
    return _model

def run_detection(pil_image: Image.Image, conf_threshold: float = 0.3):
    """
    Runs YOLOv8 detection on the provided PIL image.
    Returns:
      detections: List[dict] containing issue_type, confidence, severity, bbox
      base64_result_image: str (JPEG base64)
    """
    model = load_yolo_model()
    
    # Convert PIL Image to RGB numpy array for YOLO
    img_rgb = np.array(pil_image.convert("RGB"))
    img_height, img_width = img_rgb.shape[:2]

    results = model(img_rgb, conf=conf_threshold)
    
    detections = []
    
    if len(results) > 0:
        result = results[0]
        boxes = result.boxes
        
        for box in boxes:
            # Extract class index and name
            cls_id = int(box.cls[0].item())
            class_name = result.names.get(cls_id, f"issue_{cls_id}")
            
            # Standardize issue type string formatting (e.g. road_damage, garbage, waterlogging)
            issue_type = class_name.lower().replace(" ", "_")
            
            # Extract confidence
            confidence = float(box.conf[0].item())
            
            # Extract bbox coordinates [xmin, ymin, xmax, ymax]
            xyxy = box.xyxy[0].tolist()
            bbox = [int(round(coord)) for coord in xyxy]
            
            # Calculate severity
            severity = calculate_severity(confidence, bbox, img_width, img_height)
            
            detections.append({
                "issue_type": issue_type,
                "confidence": round(confidence, 2),
                "severity": severity,
                "bbox": bbox
            })
            
        # Draw annotated result image
        annotated_bgr = result.plot()  # returns BGR uint8 array
        
        # Encode to JPG base64 string
        success, encoded_img = cv2.imencode('.jpg', annotated_bgr)
        if success:
            base64_result_image = base64.b64encode(encoded_img.tobytes()).decode('utf-8')
        else:
            # Fallback if cv2 fails
            buf = io.BytesIO()
            pil_image.save(buf, format="JPEG")
            base64_result_image = base64.b64encode(buf.getvalue()).decode('utf-8')
    else:
        # Fallback for no detections
        buf = io.BytesIO()
        pil_image.save(buf, format="JPEG")
        base64_result_image = base64.b64encode(buf.getvalue()).decode('utf-8')

    return detections, base64_result_image
