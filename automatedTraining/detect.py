import cv2
from ultralytics import YOLO

# Load your trained model
model = YOLO("my_model.pt")

# Open webcam
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("❌ Cannot open camera")
    exit()

print("✅ Camera opened. Press 'q' to quit.")

while True:
    ret, frame = cap.read()
    if not ret:
        print("❌ Failed to grab frame")
        break

    # Run detection
    results = model(frame)

    # Draw predictions
    annotated_frame = results[0].plot()

    # Show
    cv2.imshow("😶‍🌫️ Pothole Detection", annotated_frame)

    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()


# yolo export model=my_model.pt format=tflite
# yolo export model=my_model.pt format=tflite int8
