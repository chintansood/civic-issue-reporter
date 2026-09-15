import os
import sys
import gdown

# Replace with your Google Drive file ID from the shared link
# Example link: https://drive.google.com/file/d/1A2B3C4D5E6F7G8H9/view?usp=sharing
# File ID: 1A2B3C4D5E6F7G8H9
GOOGLE_DRIVE_FILE_ID = "1RVEFROCh1Sr0PTPLaUUXeb89LmuZsS-l"

def download_model(file_id: str = GOOGLE_DRIVE_FILE_ID, output_path: str = None):
    if output_path is None:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        output_path = os.path.join(script_dir, "weights", "best.pt")

    os.makedirs(os.path.dirname(output_path), exist_ok=True)

    if file_id == "GOOGLE_DRIVE_FILE_ID":
        print("[!] Warning: GOOGLE_DRIVE_FILE_ID has not been configured in ml/download_model.py.")
        print("[!] Please replace 'GOOGLE_DRIVE_FILE_ID' with your actual Google Drive file ID.")
        print("[!] Or pass it as an argument: python download_model.py <FILE_ID>")
        if len(sys.argv) > 1:
            file_id = sys.argv[1]
        else:
            print(f"[!] Target location for model: {output_path}")
            return False

    url = f"https://drive.google.com/uc?id={file_id}"
    print(f"Downloading best.pt from Google Drive ID '{file_id}' to {output_path}...")
    try:
        gdown.download(id=file_id, output=output_path, quiet=False)
        print(f"✅ Model downloaded successfully to {output_path}")
        return True
    except Exception as e:
        print(f"❌ Failed to download model: {e}")
        return False

if __name__ == "__main__":
    download_model()
