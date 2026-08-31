Developer Journal — Adhyan Gupta Roll No: 1024030802
Role: Frontend + Testing  
Repo: civic-issue-reporter

Week 1 (Aug 18-29, 2026)

What I worked on
- Wrote severity calculation function (ml/severity.py)
- Pushed severity.py to GitHub
- Watched and understood the YOLOv8 training process on Colab
- Reviewed detection results on test images
- Wrote inference pipeline (ml/inference.py)
- Pushed inferece.py to GitHub

Results this week
- severity.py working correctly — tested with dummy values:
  - High confidence + large bbox → High severity
  - Medium confidence + medium bbox → Medium severity
  - Low confidence + small bbox → Low severity
- Waterlogging images performed best (0.86-0.91 confidence)
- Road damage images performed well (0.67-0.81 confidence)
- Garbage images need better real-world Indian context photos
  
What I learned
- How the ML detection output works (bounding boxes, confidence scores)
- How severity is calculated from raw model output
- Why test images need to be different from training images
- Why training data context matters (Western vs Indian urban images)
- What object detection means — model draws bounding boxes around detected issues
- What confidence score means — how sure the model is about its detection

Challenges faced
- Some garbage images were Western-style (NYC bins) — not matching Indian civic context
- Some test images were AI-generated/stock photos — model correctly ignored them
- Garbage detection failed on Western-style bins — need India-specific images

Next week plan
- Set up React frontend project
- Build citizen upload screen (photo upload + GPS capture)
- Build basic map component with Leaflet
- Connect upload form to backend API once ready
- Connect severity.py into the inference pipeline
