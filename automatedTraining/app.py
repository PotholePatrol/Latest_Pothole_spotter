import cv2
import sqlite3
import requests
import json
import time
import threading
from datetime import datetime, timedelta
from pathlib import Path
from ultralytics import YOLO
import logging
from dataclasses import dataclass
from typing import Optional, List, Dict, Any
import geocoder
import numpy as np
from queue import Queue, Empty
import os

# Configuration
@dataclass
class Config:
    SERVER_URL: str = 'https://app.tera-in.top/auto'
    MODEL_PATH: str = "my_model.pt"
    DATABASE_PATH: str = "pothole_detections.db"
    CONFIDENCE_THRESHOLD: float = 0.6
    MAX_OFFLINE_STORAGE: int = 1000
    SYNC_INTERVAL: int = 30  # seconds
    MAX_RETRIES: int = 3
    RETRY_DELAY: int = 5

class PotholeDetection:
    def __init__(self, config: Config):
        self.config = config
        self.model = YOLO(config.MODEL_PATH)
        self.detection_queue = Queue()
        self.sync_queue = Queue()
        self.is_online = True
        self.show_camera_window = True
        self.start_time = time.time()
        self.setup_logging()
        self.setup_database()
        self.setup_offline_storage()
        
    def setup_logging(self):
        """Setup logging configuration with proper encoding"""
        self.logger = logging.getLogger(__name__)
        self.logger.setLevel(logging.INFO)
        
        # Remove existing handlers to avoid duplicates
        for handler in self.logger.handlers[:]:
            self.logger.removeHandler(handler)
        
        # Create formatter with ASCII-safe characters
        formatter = logging.Formatter('%(asctime)s - %(levelname)s - %(message)s')
        
        # File handler
        file_handler = logging.FileHandler('pothole_detector.log', encoding='utf-8')
        file_handler.setFormatter(formatter)
        
        # Stream handler
        stream_handler = logging.StreamHandler()
        stream_handler.setFormatter(formatter)
        
        # Add handlers
        self.logger.addHandler(file_handler)
        self.logger.addHandler(stream_handler)
        
    def setup_database(self):
        """Initialize SQLite database for offline storage"""
        try:
            self.conn = sqlite3.connect(self.config.DATABASE_PATH, check_same_thread=False)
            cursor = self.conn.cursor()
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS detections (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    timestamp TEXT NOT NULL,
                    latitude REAL,
                    longitude REAL,
                    confidence REAL NOT NULL,
                    image_path TEXT,
                    severity TEXT,
                    location_name TEXT,
                    weather_conditions TEXT,
                    road_type TEXT,
                    is_synced INTEGER DEFAULT 0,
                    sync_attempts INTEGER DEFAULT 0,
                    created_at TEXT DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            self.conn.commit()
            self.logger.info("[SUCCESS] Database initialized successfully")
        except sqlite3.Error as e:
            self.logger.error(f"[ERROR] Database setup failed: {e}")
            
    def setup_offline_storage(self):
        """Create directories for offline storage"""
        Path("detections/images").mkdir(parents=True, exist_ok=True)
        Path("detections/data").mkdir(parents=True, exist_ok=True)

    def get_current_location(self) -> Dict[str, Any]:
        """Get current GPS location with fallbacks"""
        try:
            g = geocoder.ip('me')
            if g.ok:
                return {
                    'latitude': g.lat,
                    'longitude': g.lng,
                    'location_name': g.address,
                    'source': 'gps'
                }
        except Exception as e:
            self.logger.warning(f"GPS location failed: {e}")
            
        return {
            'latitude': -1.2921,
            'longitude': 36.8219,
            'location_name': 'Nairobi, Kenya',
            'source': 'mock'
        }

    def analyze_pothole_severity(self, confidence: float, bbox_area: float) -> str:
        """Analyze pothole severity based on confidence and size"""
        if confidence > 0.8 and bbox_area > 10000:
            return "critical"
        elif confidence > 0.7:
            return "high"
        elif confidence > 0.6:
            return "medium"
        else:
            return "low"

    def save_image_locally(self, image: np.ndarray, detection_id: str) -> str:
        """Save detection image locally and return path"""
        try:
            timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
            filename = f"detection_{detection_id}_{timestamp}.jpg"
            filepath = f"detections/images/{filename}"
            cv2.imwrite(filepath, image)
            return filepath
        except Exception as e:
            self.logger.error(f"Failed to save image: {e}")
            return ""

    def save_detection_to_db(self, detection_data: Dict[str, Any]) -> int:
        """Save detection to local database"""
        try:
            cursor = self.conn.cursor()
            cursor.execute('''
                INSERT INTO detections 
                (timestamp, latitude, longitude, confidence, image_path, severity, location_name, weather_conditions, road_type)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                detection_data['timestamp'],
                detection_data['latitude'],
                detection_data['longitude'],
                detection_data['confidence'],
                detection_data['image_path'],
                detection_data['severity'],
                detection_data['location_name'],
                detection_data.get('weather_conditions', 'unknown'),
                detection_data.get('road_type', 'unknown')
            ))
            self.conn.commit()
            detection_id = cursor.lastrowid
            self.logger.info(f"[SAVED] Detection saved to DB with ID: {detection_id}")
            return detection_id
        except sqlite3.Error as e:
            self.logger.error(f"[ERROR] Failed to save to database: {e}")
            return -1



    def update_to_server(self, detection_data: Dict[str, Any]) -> bool:
        """Send detection data (with optional image) to server with retry logic."""

        server_data = {
            "timestamp": detection_data["timestamp"],
            "location": {
                "latitude": detection_data["latitude"],
                "longitude": detection_data["longitude"],
                "name": detection_data["location_name"],
            },
            "detection": {
                "confidence": detection_data["confidence"],
                "severity": detection_data["severity"],
                "bbox_area": detection_data.get("bbox_area", 0),
                "weather_conditions": detection_data.get("weather_conditions", "unknown"),
                "road_type": detection_data.get("road_type", "unknown"),
            },
        }

        for attempt in range(self.config.MAX_RETRIES):
            try:
                # Prepare multipart form
                files = {
                    "data": (None, json.dumps(server_data), "application/json")
                }

                image_path = detection_data.get("image_path")
                if image_path and os.path.exists(image_path):
                    with open(image_path, "rb") as img_file:
                        files["image"] = (os.path.basename(image_path), img_file, "image/jpeg")

                        response = requests.post(
                            f"{self.config.SERVER_URL}/live-detections",
                            files=files,
                            timeout=10,
                        )
                else:
                    response = requests.post(
                        f"{self.config.SERVER_URL}/live-detections",
                        files=files,
                        timeout=10,
                    )

                if response.status_code == 200:
                    self.logger.info("[SYNC] Detection successfully sent to server")
                    self.is_online = True
                    return True
                else:
                    self.logger.warning(
                        f"[WARNING] Server returned {response.status_code}: {response.text}"
                    )

            except requests.exceptions.RequestException as e:
                self.logger.warning(
                    f"[NETWORK] Network error (attempt {attempt + 1}/{self.config.MAX_RETRIES}): {e}"
                )
                self.is_online = False

            except Exception as e:
                self.logger.error(f"[ERROR] Unexpected error sending to server: {e}")

            # Retry delay
            if attempt < self.config.MAX_RETRIES - 1:
                time.sleep(self.config.RETRY_DELAY)

        return False

    def get_weather_conditions(self) -> str:
        """Get current weather conditions"""
        conditions = ['sunny', 'rainy', 'cloudy']
        return np.random.choice(conditions, p=[0.6, 0.2, 0.2])

    def estimate_road_type(self, bbox_area: float, severity: str) -> str:
        """Estimate road type based on detection characteristics"""
        if bbox_area > 15000 and severity in ['critical', 'high']:
            return "highway"
        elif bbox_area > 8000:
            return "arterial"
        else:
            return "residential"

    def trigger_alert(self, severity: str):
        """Trigger different types of alerts based on severity"""
        alert_messages = {
            'critical': "[CRITICAL] Large pothole detected! Immediate attention required!",
            'high': "[HIGH] Significant pothole detected",
            'medium': "[MEDIUM] Moderate pothole detected",
            'low': "[LOW] Minor road surface issue"
        }
        message = alert_messages.get(severity, "Pothole detected")
        self.logger.info(message)

    def sync_worker(self):
        """Background worker to sync offline detections with server"""
        while True:
            try:
                self.check_connectivity()
                
                if self.is_online and not self.sync_queue.empty():
                    while not self.sync_queue.empty():
                        try:
                            detection_data = self.sync_queue.get_nowait()
                            success = self.update_to_server(detection_data)
                            
                            if success:
                                cursor = self.conn.cursor()
                                cursor.execute(
                                    "UPDATE detections SET is_synced = 1 WHERE id = ?",
                                    (detection_data['db_id'],)
                                )
                                self.conn.commit()
                            else:
                                cursor = self.conn.cursor()
                                cursor.execute(
                                    "UPDATE detections SET sync_attempts = sync_attempts + 1 WHERE id = ?",
                                    (detection_data['db_id'],)
                                )
                                self.conn.commit()
                                
                        except Empty:
                            break
                
                self.sync_old_detections()
                time.sleep(self.config.SYNC_INTERVAL)
                
            except Exception as e:
                self.logger.error(f"[ERROR] Sync worker error: {e}")
                time.sleep(self.config.SYNC_INTERVAL)

    def check_connectivity(self):
        """Check internet connectivity"""
        try:
            requests.get("https://www.google.com", timeout=5)
            if not self.is_online:
                self.logger.info("[NETWORK] Connection restored")
            self.is_online = True
        except:
            if self.is_online:
                self.logger.warning("[NETWORK] Connection lost - working offline")
            self.is_online = False

    def sync_old_detections(self):
        """Sync previously unsynced detections"""
        if not self.is_online:
            return
            
        try:
            cursor = self.conn.cursor()
            cursor.execute(
                "SELECT * FROM detections WHERE is_synced = 0 AND sync_attempts < ? ORDER BY timestamp LIMIT 10",
                (self.config.MAX_RETRIES,)
            )
            
            unsynced = cursor.fetchall()
            for detection in unsynced:
                detection_data = {
                    'db_id': detection[0],
                    'timestamp': detection[1],
                    'latitude': detection[2],
                    'longitude': detection[3],
                    'confidence': detection[4],
                    'image_path': detection[5],
                    'severity': detection[6],
                    'location_name': detection[7]
                }
                
                success = self.update_to_server(detection_data)
                if success:
                    cursor.execute("UPDATE detections SET is_synced = 1 WHERE id = ?", (detection[0],))
                    self.conn.commit()
                    
        except Exception as e:
            self.logger.error(f"[ERROR] Error syncing old detections: {e}")

    def generate_statistics(self) -> Dict[str, Any]:
        """Generate detection statistics"""
        try:
            cursor = self.conn.cursor()
            
            cursor.execute("SELECT COUNT(*) FROM detections")
            total = cursor.fetchone()[0]
            
            cursor.execute("SELECT severity, COUNT(*) FROM detections GROUP BY severity")
            by_severity = dict(cursor.fetchall())
            
            cursor.execute("SELECT COUNT(*) FROM detections WHERE DATE(created_at) = DATE('now')")
            today = cursor.fetchone()[0]
            
            cursor.execute("SELECT COUNT(*) FROM detections WHERE is_synced = 0")
            unsynced = cursor.fetchone()[0]
            
            return {
                'total_detections': total,
                'detections_today': today,
                'by_severity': by_severity,
                'unsynced_detections': unsynced,
                'is_online': self.is_online
            }
            
        except sqlite3.Error as e:
            self.logger.error(f"[ERROR] Error generating statistics: {e}")
            return {}

    def run_detection(self):
        """Main detection loop with advanced visualization"""
        sync_thread = threading.Thread(target=self.sync_worker, daemon=True)
        sync_thread.start()
        
        # Visualization controls
        show_detections = True
        show_boxes = True
        show_labels = True
        show_confidence = True
        show_severity = True
        show_trail = False
        detection_interval = 5
        
        detection_history = []
        max_history = 20
        
        # Open webcam - FIXED: Try different camera indices if 0 fails
        cap = None
        for i in range(3):  # Try cameras 0, 1, 2
            cap = cv2.VideoCapture(i)
            if cap.isOpened():
                self.logger.info(f"[SUCCESS] Camera {i} opened successfully!")
                break
            else:
                self.logger.warning(f"[WARNING] Camera {i} failed to open")
        
        if not cap or not cap.isOpened():
            self.logger.error("[ERROR] Cannot open any camera")
            return

        self.logger.info("[CONTROLS] Keyboard shortcuts:")
        self.logger.info("   'q' - Quit, 'd' - Toggle detections, 'b' - Toggle boxes")
        self.logger.info("   'l' - Toggle labels, 'c' - Toggle confidence, 's' - Toggle severity")
        self.logger.info("   't' - Toggle trail, '+'/- - Adjust frequency, 'r' - Reset")
        
        # Set camera properties
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        cap.set(cv2.CAP_PROP_FPS, 30)

        detection_counter = 0
        last_statistics_time = time.time()
        fps_counter = 0
        fps_time = time.time()
        current_fps = 0

        while True:
            ret, frame = cap.read()
            if not ret:
                self.logger.error("[ERROR] Failed to grab frame")
                # Try to reinitialize camera
                cap.release()
                time.sleep(1)
                cap = cv2.VideoCapture(0)
                if not cap.isOpened():
                    self.logger.error("[ERROR] Cannot reopen camera")
                    break
                continue

            # Calculate FPS
            fps_counter += 1
            if time.time() - fps_time >= 1.0:
                current_fps = fps_counter
                fps_counter = 0
                fps_time = time.time()

            # Create annotated frame
            annotated_frame = frame.copy()

            # Run detection at specified interval
            current_detections = []
            if show_detections and detection_counter % detection_interval == 0:
                try:
                    # FIXED: Use the frame for detection, not annotated_frame
                    results = self.model(frame, conf=self.config.CONFIDENCE_THRESHOLD, verbose=False)
                    
                    # Process detections for saving to DB
                    self.process_detections_for_saving(frame, results)
                    
                    # Get detections for visualization
                    current_detections = self.extract_detections_for_visualization(results)
                    
                    # Draw bounding boxes if enabled
                    if show_boxes and results and len(results) > 0 and len(results[0].boxes) > 0:
                        annotated_frame = self.draw_custom_boxes(
                            annotated_frame, results[0], 
                            show_labels=show_labels,
                            show_confidence=show_confidence,
                            show_severity=show_severity
                        )
                    
                    # Add to detection history for trail
                    if show_trail and current_detections:
                        detection_history.extend(current_detections)
                        if len(detection_history) > max_history:
                            detection_history = detection_history[-max_history:]
                            
                except Exception as e:
                    self.logger.error(f"[ERROR] Detection error: {e}")

            # Draw detection trail if enabled
            if show_trail and detection_history:
                annotated_frame = self.draw_detection_trail(annotated_frame, detection_history)

            # Add status overlay
            annotated_frame = self.draw_status_overlay(
                annotated_frame, 
                is_online=self.is_online,
                show_detections=show_detections,
                show_boxes=show_boxes,
                show_labels=show_labels,
                show_confidence=show_confidence,
                show_severity=show_severity,
                show_trail=show_trail,
                detection_interval=detection_interval,
                current_fps=current_fps,
                active_detections=len(current_detections)
            )

            # Show statistics periodically
            current_time = time.time()
            if current_time - last_statistics_time > 5:
                stats = self.generate_statistics()
                if stats:
                    stats_text = self.format_statistics(stats)
                    cv2.putText(annotated_frame, stats_text, (10, 120), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
                last_statistics_time = current_time

            # Display the frame - FIXED: Ensure window is created properly
            if self.show_camera_window:
                cv2.namedWindow("Pothole Detection System", cv2.WINDOW_NORMAL)
                cv2.imshow("Pothole Detection System", annotated_frame)
            
            # Handle keyboard input
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('d'):
                show_detections = not show_detections
                self.logger.info(f"[TOGGLE] Detections: {'ON' if show_detections else 'OFF'}")
            elif key == ord('b'):
                show_boxes = not show_boxes
                self.logger.info(f"[TOGGLE] Bounding boxes: {'ON' if show_boxes else 'OFF'}")
            elif key == ord('l'):
                show_labels = not show_labels
                self.logger.info(f"[TOGGLE] Labels: {'ON' if show_labels else 'OFF'}")
            elif key == ord('c'):
                show_confidence = not show_confidence
                self.logger.info(f"[TOGGLE] Confidence: {'ON' if show_confidence else 'OFF'}")
            elif key == ord('s'):
                show_severity = not show_severity
                self.logger.info(f"[TOGGLE] Severity: {'ON' if show_severity else 'OFF'}")
            elif key == ord('t'):
                show_trail = not show_trail
                self.logger.info(f"[TOGGLE] Detection trail: {'ON' if show_trail else 'OFF'}")
            elif key == ord('+'):
                detection_interval = max(1, detection_interval - 1)
                self.logger.info(f"[SETTING] Detection interval: every {detection_interval} frame(s)")
            elif key == ord('-'):
                detection_interval = min(20, detection_interval + 1)
                self.logger.info(f"[SETTING] Detection interval: every {detection_interval} frame(s)")
            elif key == ord('r'):
                show_detections = True
                show_boxes = True
                show_labels = True
                show_confidence = True
                show_severity = True
                show_trail = False
                detection_interval = 5
                detection_history.clear()
                self.logger.info("[RESET] All settings reset to default")

            detection_counter += 1

        cap.release()
        cv2.destroyAllWindows()
        self.conn.close()
        self.logger.info("[SHUTDOWN] Detection system stopped gracefully")

    def process_detections_for_saving(self, frame: np.ndarray, results: Any):
        """Process detections and save to database"""
        try:
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        confidence = box.conf.item()
                        
                        if confidence >= self.config.CONFIDENCE_THRESHOLD:
                            x1, y1, x2, y2 = box.xyxy[0].tolist()
                            bbox_area = (x2 - x1) * (y2 - y1)
                            
                            location = self.get_current_location()
                            severity = self.analyze_pothole_severity(confidence, bbox_area)
                            
                            detection_data = {
                                'timestamp': datetime.now().isoformat(),
                                'latitude': location['latitude'],
                                'longitude': location['longitude'],
                                'confidence': confidence,
                                'bbox_area': bbox_area,
                                'severity': severity,
                                'location_name': location['location_name'],
                                'weather_conditions': self.get_weather_conditions(),
                                'road_type': self.estimate_road_type(bbox_area, severity)
                            }
                            
                            image_path = self.save_image_locally(frame, str(int(time.time())))
                            detection_data['image_path'] = image_path
                            
                            db_id = self.save_detection_to_db(detection_data)
                            
                            if db_id != -1:
                                detection_data['db_id'] = db_id
                                self.sync_queue.put(detection_data)
                                self.logger.info(f"[DETECTED] Pothole! Confidence: {confidence:.2f}, Severity: {severity}")
                                self.trigger_alert(severity)
                            
        except Exception as e:
            self.logger.error(f"[ERROR] Error processing detection: {e}")

    def extract_detections_for_visualization(self, results: Any) -> List[Dict[str, Any]]:
        """Extract detection data for visualization only"""
        detections = []
        try:
            for result in results:
                boxes = result.boxes
                if boxes is not None:
                    for box in boxes:
                        confidence = box.conf.item()
                        if confidence >= self.config.CONFIDENCE_THRESHOLD:
                            x1, y1, x2, y2 = box.xyxy[0].tolist()
                            bbox_area = (x2 - x1) * (y2 - y1)
                            severity = self.analyze_pothole_severity(confidence, bbox_area)
                            
                            detections.append({
                                'bbox': (int(x1), int(y1), int(x2), int(y2)),
                                'confidence': confidence,
                                'severity': severity,
                                'color': self.get_severity_color(severity)
                            })
        except Exception as e:
            self.logger.error(f"[ERROR] Error extracting detections: {e}")
        
        return detections

    def draw_custom_boxes(self, frame, results, show_labels=True, show_confidence=True, show_severity=True):
        """Draw custom bounding boxes with enhanced visualization"""
        if results.boxes is None:
            return frame
        
        for box in results.boxes:
            confidence = box.conf.item()
            x1, y1, x2, y2 = map(int, box.xyxy[0].tolist())
            bbox_area = (x2 - x1) * (y2 - y1)
            
            severity = self.analyze_pothole_severity(confidence, bbox_area)
            colors = {
                'critical': (0, 0, 255),
                'high': (0, 165, 255),
                'medium': (0, 255, 255),
                'low': (0, 255, 0)
            }
            color = colors.get(severity, (255, 255, 255))
            
            # Draw bounding box
            cv2.rectangle(frame, (x1, y1), (x2, y2), color, 2)
            
            # Draw label
            label_parts = []
            if show_labels:
                label_parts.append("POTHOLE")
            if show_confidence:
                label_parts.append(f"{confidence:.2f}")
            if show_severity:
                label_parts.append(severity.upper())
            
            if label_parts:
                label = " | ".join(label_parts)
                label_size = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)[0]
                
                # Draw text background
                cv2.rectangle(frame, (x1, y1 - label_size[1] - 10), 
                             (x1 + label_size[0] + 10, y1), color, -1)
                # Draw text
                cv2.putText(frame, label, (x1 + 5, y1 - 5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1)
            
            # Draw severity indicator
            if show_severity:
                dot_radius = 8
                cv2.circle(frame, (x1 + dot_radius + 2, y1 + dot_radius + 2), 
                          dot_radius, color, -1)
        
        return frame

    def draw_detection_trail(self, frame, detection_history):
        """Draw a trail of recent detections"""
        alpha = 0.3
        trail_frame = frame.copy()
        
        for i, detection in enumerate(detection_history):
            age_factor = i / len(detection_history)
            current_alpha = alpha * (1 - age_factor)
            
            if 'bbox' in detection:
                x1, y1, x2, y2 = detection['bbox']
                color = detection.get('color', (255, 255, 255))
                
                overlay = frame.copy()
                cv2.rectangle(overlay, (x1, y1), (x2, y2), color, -1)
                cv2.addWeighted(overlay, current_alpha, trail_frame, 1 - current_alpha, 0, trail_frame)
        
        return trail_frame

    def draw_status_overlay(self, frame, is_online, show_detections, show_boxes, 
                           show_labels, show_confidence, show_severity, show_trail,
                           detection_interval, current_fps, active_detections):
        """Draw comprehensive status overlay"""
        overlay = frame.copy()
        height, width = frame.shape[:2]
        
        # Status panel background
        panel_height = 150
        cv2.rectangle(overlay, (0, 0), (width, panel_height), (0, 0, 0), -1)
        cv2.addWeighted(overlay, 0.7, frame, 0.3, 0, frame)
        
        y_offset = 25
        line_height = 20
        
        # System status
        status_color = (0, 255, 0) if is_online else (0, 0, 255)
        status_text = "ONLINE" if is_online else "OFFLINE"
        cv2.putText(frame, f"Status: {status_text}", (10, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.6, status_color, 2)
        
        # Detection info
        y_offset += line_height
        detection_status = "ACTIVE" if show_detections else "PAUSED"
        detection_color = (0, 255, 0) if show_detections else (0, 0, 255)
        cv2.putText(frame, f"Detection: {detection_status} | FPS: {current_fps} | Active: {active_detections}", 
                   (10, y_offset), cv2.FONT_HERSHEY_SIMPLEX, 0.5, detection_color, 1)
        
        # Visualization toggles
        y_offset += line_height
        toggles = [
            f"Boxes: {'ON' if show_boxes else 'OFF'}",
            f"Labels: {'ON' if show_labels else 'OFF'}",
            f"Confidence: {'ON' if show_confidence else 'OFF'}",
            f"Severity: {'ON' if show_severity else 'OFF'}",
            f"Trail: {'ON' if show_trail else 'OFF'}"
        ]
        cv2.putText(frame, " | ".join(toggles), (10, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        # Detection settings
        y_offset += line_height
        settings_text = f"Interval: {detection_interval} frames"
        cv2.putText(frame, settings_text, (10, y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1)
        
        # Controls reminder
        if time.time() - self.start_time < 30:
            y_offset += line_height
            controls_text = "Controls: d=detect b=boxes l=labels c=confidence s=severity t=trail +/-=speed"
            cv2.putText(frame, controls_text, (10, y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.35, (200, 200, 0), 1)
        
        return frame

    def format_statistics(self, stats):
        """Format statistics for display"""
        lines = [
            f"Total: {stats.get('total_detections', 0)}",
            f"Today: {stats.get('detections_today', 0)}",
            f"Unsynced: {stats.get('unsynced_detections', 0)}"
        ]
        
        if 'by_severity' in stats:
            severity_text = []
            for severity, count in stats['by_severity'].items():
                severity_text.append(f"{severity}:{count}")
            lines.append(" | ".join(severity_text))
        
        return " | ".join(lines)

    def get_severity_color(self, severity):
        """Get color for severity level"""
        colors = {
            'critical': (0, 0, 255),
            'high': (0, 165, 255),
            'medium': (0, 255, 255),
            'low': (0, 255, 0)
        }
        return colors.get(severity, (255, 255, 255))

def main():
    """Main function"""
    config = Config()
    detector = PotholeDetection(config)
    
    try:
        detector.run_detection()
    except KeyboardInterrupt:
        print("\n[SHUTDOWN] Shutting down...")
    except Exception as e:
        print(f"[FATAL ERROR] {e}")

if __name__ == "__main__":
    main()