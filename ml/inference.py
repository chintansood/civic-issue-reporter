from ultralytics import YOLO
from severity import calculate_severity

def detect_issue(image_path):
    model = YOLO("ml/weights/best.pt")
    results = model(image_path, conf=0.4)
    
    detections = []
    for box in results[0].boxes:
        bbox = box.xyxy.tolist()[0]
        bbox_area = (bbox[2]-bbox[0]) * (bbox[3]-bbox[1])
        detection = {
            "issue_type": results[0].names[int(box.cls)],
            "confidence": round(box.conf.item(), 2),
            "bbox": bbox,
            "severity": calculate_severity(
                box.conf.item(),
                bbox_area,
                640 * 640
            )
        }
        detections.append(detection)
    
    return {"detections": detections}

