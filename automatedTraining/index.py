

from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
import torch
import numpy as np
import cv2
from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import pixseg

# -------------------
# Load pretrained model
# -------------------
device = "cuda" if torch.cuda.is_available() else "cpu"

# Load a pretrained model (example: PSPNet on Cityscapes)
# model = pixseg.pspnet_cityscapes(pretrained=True).to(device)
# model.eval()


app = FastAPI()
model = YOLO("datafile.pt")

@app.get("/")
def home():
    return {"message": "Pothole detection API is running 🚀"}

# Test inference
dummy_input = torch.randn(1, 3, 512, 512).to(device)
with torch.no_grad():
    output = model(dummy_input)

print("Output shape:", output.shape)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
@app.post("/segment/")
async def segment_image(file: UploadFile = File(...)):
    try:
        # Read file into numpy array
        contents = await file.read()
        npimg = np.frombuffer(contents, np.uint8)
        img = cv2.imdecode(npimg, cv2.IMREAD_COLOR)

        # Convert to tensor
        tensor = torch.from_numpy(img).permute(2, 0, 1).unsqueeze(0).float().to(device)

        # Normalize to match model input (0–1)
        tensor = tensor / 255.0

        # Run inference
        with torch.no_grad():
            output = model(tensor)
            # Output: (batch, num_classes, H, W)
            pred = torch.argmax(output, dim=1).squeeze().cpu().numpy()

        # Extract road mask (Cityscapes road = class 0 or 1 depending on model mapping)
        # Here we assume class "road" has index 0 in PixSeg
        road_mask = (pred == 0).astype(np.uint8) * 255

        # Return proportion of road in image
        road_fraction = float(road_mask.sum() / (road_mask.size * 255))

        return JSONResponse({
            "road_fraction": road_fraction,
            "message": "Segmentation successful"
        })

    except Exception as e:
        return JSONResponse({"error": str(e)}, status_code=500)




@app.post("/detect/")
async def detect_potholes(file: UploadFile = File(...)):
    # Read image
    contents = await file.read()
    np_img = np.frombuffer(contents, np.uint8)
    img = cv2.imdecode(np_img, cv2.IMREAD_COLOR)

    # Run detection
    results = model(img)

    # Convert detections to JSON
    detections = []
    for box in results[0].boxes:
        x1, y1, x2, y2 = box.xyxy[0].tolist()
        conf = float(box.conf[0])
        cls = int(box.cls[0])
        detections.append({
            "class": model.names[cls],
            "confidence": conf,
            "box": [x1, y1, x2, y2]
        })

    return {"detections": detections}
