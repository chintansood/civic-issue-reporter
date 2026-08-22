def calculate_severity(confidence, bbox_area, image_area):
    area_ratio = bbox_area / image_area
    severity_score = (confidence * 0.6) + (area_ratio * 0.4)

    if severity_score > 0.6:
        return "High"
    elif severity_score > 0.35:
        return "Medium"
    else:
        return "Low"