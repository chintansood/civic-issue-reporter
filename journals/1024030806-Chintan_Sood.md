Developer Journal — Chintan Sood
Roll No: 1024030806
Role: ML Pipeline Lead
Project: AI-Based Civic Problem Reporter



WEEK 1 (Aug 18-29, 2026)

What I worked on
- Set up GitHub repo with folder structure (frontend, backend, ml, docs)
- Searched and downloaded 4 civic issue datasets from Roboflow Universe
- Merged all datasets into one Roboflow project (16,714 images, 23 classes)
- Renamed 23 messy class names into 3 clean classes (road_damage, garbage, waterlogging)
- Generated augmented dataset version (3x augmentation = 44,095 images)
- Set up Google Colab with T4 GPU
- Ran baseline training: YOLOv8n, 30 epochs, 5 hours
- Tested model on real images with teammates

Results
- Overall mAP50: 0.654
- road_damage: 0.67-0.81 confidence on real photos ✓
- waterlogging: 0.78-0.91 confidence on real photos ✓
- garbage: misclassifying, needs improvement ✗

What I learned
- What labeled datasets are and how train/valid/test splits work
- What epochs, box_loss, cls_loss, mAP50 mean
- How YOLOv8 fine-tuning works
- How to prevent Colab disconnections during long training runs

Challenges
- 23 different class names across datasets needed manual standardization
- Colab disconnected once mid-training, had to reinstall packages
- Garbage detection weak due to dataset context mismatch (Western vs Indian)

Next week plan
- Upgrade to YOLOv8s, train 100 epochs
- Add more India-specific garbage images
- Start backend integration of best.pt into FastAPI


