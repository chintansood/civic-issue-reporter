def calculate_severity(confidence: float, bbox: list[float], image_width: int, image_height: int) -> str:
    """
    Calculates severity level based on confidence score and bounding box area ratio.
    
    Formula:
      area_ratio = bbox_area / image_area
      score = (confidence * 0.6) + (area_ratio * 0.4)
      High if score > 0.6, Medium if > 0.35, else Low
    """
    xmin, ymin, xmax, ymax = bbox
    bbox_width = max(0.0, xmax - xmin)
    bbox_height = max(0.0, ymax - ymin)
    bbox_area = bbox_width * bbox_height

    image_area = max(1.0, float(image_width * image_height))
    area_ratio = bbox_area / image_area

    score = (confidence * 0.6) + (area_ratio * 0.4)

    if score > 0.6:
        return "High"
    elif score > 0.35:
        return "Medium"
    else:
        return "Low"
