# CivicScan - AI Civic Problem Reporter

CivicScan is an AI-powered civic problem reporter that enables citizens to snap photos of municipal issues (such as road damage, garbage accumulation, or waterlogging). Powered by a custom **YOLOv8** object detection model and **FastAPI**, CivicScan automatically identifies issue types, calculates severity based on confidence and bounding box area ratio, captures GPS coordinates, and provides real-time tracking dashboards for municipal staff and command centers.

---

## 📁 Project Structure

```
civic-issue-reporter/
  frontend/          ← Next.js (v0.dev UI) frontend app
  backend/
    main.py          ← FastAPI server & /detect endpoint
    requirements.txt ← Backend Python dependencies
  ml/
    weights/
      .gitkeep       ← Empty placeholder (best.pt is gitignored)
    download_model.py ← Google Drive weights downloader
    inference.py      ← YOLOv8 model loading & inference pipeline
    severity.py       ← Severity calculation logic
  docs/              ← Documentation & reference materials
  README.md          ← Getting started guide & instructions
  .gitignore         ← Git ignore rules (*.pt ignored)
```

---

## 📐 System Diagrams & Workflow Models

- **[Use Case Diagram](Diagrams/use_case%20diagram.pdf)**: Illustrates system actor boundaries (`Citizen`, `Department Staff`, `Municipal Admin`) and inclusion dependencies (`Upload photo` $\rightarrow$ `Capture GPS` $\rightarrow$ `Detect issue (AI)` $\rightarrow$ `Estimate severity` $\rightarrow$ `Check duplicate`).
- **[Swimlane Activity Diagram](Diagrams/Swimlane%20Diagram.pdf)**: Details cross-component workflow across `Citizen`, `AI System (YOLOv8)`, `Backend Rule Logic`, and `Department Staff` swimlanes.

---

## 🤖 Connecting Google Colab Model to Local Machine

Your YOLOv8 model trained on Google Colab is saved at:
`/content/drive/MyDrive/civic-runs/civic_v1_baseline/weights/best.pt`

Choose one of the options below to get `best.pt` onto your local machine:

### Option 1 — Direct Download (Easiest)
1. Go to your **Google Drive**.
2. Navigate to `civic-runs/civic_v1_baseline/weights/`.
3. Right-click `best.pt` → **Download**.
4. Save the file directly to `ml/weights/best.pt` in your project folder.

### Option 2 — `gdown` Script
1. Right-click `best.pt` in Google Drive → **Share** → **Copy link**.
2. The link will look like: `https://drive.google.com/file/d/ABC123XYZ/view?usp=sharing`
3. Copy the File ID: `ABC123XYZ` (the string between `/d/` and `/view`).
4. Open `ml/download_model.py` and set `GOOGLE_DRIVE_FILE_ID = "ABC123XYZ"`.
5. Run:
   ```bash
   pip install gdown
   python ml/download_model.py
   ```

### Option 3 — From Google Colab Directly
In your Colab notebook, run the following cell:
```python
from google.colab import files
files.download('/content/drive/MyDrive/civic-runs/civic_v1_baseline/weights/best.pt')
```
Once downloaded, place the file into `ml/weights/best.pt`.

---

## 🚀 How to Run

### Step 1: Download / Verify Model
```bash
# Navigate to ml directory and download model
cd ml
python download_model.py
```
*(Ensure `ml/weights/best.pt` exists before starting the backend).*

### Step 2: Start Backend (FastAPI)
```bash
# Navigate to backend directory
cd backend

# Install dependencies
pip install -r requirements.txt

# Start FastAPI server
uvicorn main:app --reload
```
The FastAPI backend will be live at `http://localhost:8000`.

### Step 3: Start Frontend (Next.js)
```bash
# Open a new terminal and navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start Next.js development server
npm run dev
```

### Step 4: Open Browser
Open your browser and navigate to:
```
http://localhost:3000
```

---

## ⚡ API Specification

### `POST /detect`
Accepts an image upload alongside optional GPS coordinates and returns object detections, severity scores, location details, and an annotated result image.

- **Request Type**: `multipart/form-data`
- **Parameters**:
  - `file`: Image file (JPG/PNG) — **Required**
  - `latitude`: Float (e.g. `30.3398`) — *Optional*
  - `longitude`: Float (e.g. `76.3869`) — *Optional*

- **Response JSON**:
```json
{
  "detections": [
    {
      "issue_type": "road_damage",
      "confidence": 0.87,
      "severity": "High",
      "bbox": [120, 340, 280, 460]
    }
  ],
  "result_image": "base64encodedJPEGstring...",
  "location": {
    "latitude": 30.3398,
    "longitude": 76.3869,
    "maps_link": "https://maps.google.com/?q=30.3398,76.3869"
  }
}
```

---

## 📊 Severity Formula

Severity is determined automatically using confidence and bounding box area ratio:

$$\text{area\_ratio} = \frac{\text{bbox\_area}}{\text{image\_area}}$$
$$\text{score} = (\text{confidence} \times 0.6) + (\text{area\_ratio} \times 0.4)$$

- **High Severity**: $\text{score} > 0.6$
- **Medium Severity**: $\text{score} > 0.35$
- **Low Severity**: $\text{score} \le 0.35$
