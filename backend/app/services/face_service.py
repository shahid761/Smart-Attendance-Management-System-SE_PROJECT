import base64
import cv2
import numpy as np
from typing import Optional, Tuple, List


class FaceService:
    def __init__(self):
        # Safely load standard Haar Cascade for face detection if available in cv2 build
        self.face_cascade = None
        try:
            if hasattr(cv2, 'CascadeClassifier') and hasattr(cv2, 'data'):
                cascade_path = cv2.data.haarcascades + 'haarcascade_frontalface_default.xml'
                self.face_cascade = cv2.CascadeClassifier(cascade_path)
        except Exception:
            self.face_cascade = None

    def base64_to_image(self, base64_str: str) -> Optional[np.ndarray]:
        """Convert Base64 string (with or without data URI prefix) to OpenCV image."""
        try:
            if "," in base64_str:
                base64_str = base64_str.split(",")[1]
            image_bytes = base64.b64decode(base64_str)
            nparr = np.frombuffer(image_bytes, np.uint8)
            img = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            return img
        except Exception:
            return None

    def image_to_base64(self, img: np.ndarray) -> str:
        """Convert OpenCV image to Base64 data string."""
        _, buffer = cv2.imencode('.jpg', img)
        return base64.b64encode(buffer).decode('utf-8')

    def detect_and_crop_face(self, img: np.ndarray) -> Optional[np.ndarray]:
        """Detect face in image, crop and normalize to 100x100 grayscale image."""
        if img is None:
            return None

        # Convert to grayscale
        if len(img.shape) == 3:
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        else:
            gray = img

        faces = []
        if self.face_cascade is not None and not self.face_cascade.empty():
            try:
                faces = self.face_cascade.detectMultiScale(
                    gray, scaleFactor=1.1, minNeighbors=5, minSize=(30, 30)
                )
            except Exception:
                faces = []

        if len(faces) > 0:
            # Pick largest detected face
            x, y, w, h = max(faces, key=lambda rect: rect[2] * rect[3])
            face_crop = gray[y:y+h, x:x+w]
        else:
            # Fallback: Crop center region of image as face region
            h, w = gray.shape[:2]
            cx, cy = w // 2, h // 2
            rw, rh = min(w, h) // 2, min(w, h) // 2
            x1, y1 = max(0, cx - rw), max(0, cy - rh)
            x2, y2 = min(w, cx + rw), min(h, cy + rh)
            face_crop = gray[y1:y2, x1:x2]

        normalized_face = cv2.resize(face_crop, (100, 100))
        # Histogram equalization for lighting invariance
        normalized_face = cv2.equalizeHist(normalized_face)
        return normalized_face

    def compare_faces(self, face1: np.ndarray, face2: np.ndarray) -> float:
        """
        Compare two 100x100 grayscale face crops using Histogram comparison & MSE.
        Returns a similarity confidence score between 0.0 and 1.0 (1.0 = identical).
        """
        if face1 is None or face2 is None:
            return 0.0

        # Calculate Histograms
        hist1 = cv2.calcHist([face1], [0], None, [256], [0, 256])
        hist2 = cv2.calcHist([face2], [0], None, [256], [0, 256])
        cv2.normalize(hist1, hist1, 0, 1, cv2.NORM_MINMAX)
        cv2.normalize(hist2, hist2, 0, 1, cv2.NORM_MINMAX)

        hist_sim = cv2.compareHist(hist1, hist2, cv2.HISTCMP_CORREL)

        # Calculate Mean Squared Error on normalized pixels
        f1_norm = face1.astype("float") / 255.0
        f2_norm = face2.astype("float") / 255.0
        mse = np.mean((f1_norm - f2_norm) ** 2)
        mse_sim = max(0.0, 1.0 - (mse * 3.0))  # Scale MSE difference

        # Combined confidence score
        confidence = (hist_sim * 0.5) + (mse_sim * 0.5)
        return float(np.clip(confidence, 0.0, 1.0))

    def recognize_student(
        self, query_img_b64: str, registered_faces: List[Tuple[int, str]]
    ) -> Tuple[bool, Optional[int], float]:
        """
        Matches a query image against a list of (student_id, registered_base64_crop) tuples.
        Returns (is_recognized, student_id, confidence).
        Threshold for positive match is set to >= 0.60.
        """
        query_img = self.base64_to_image(query_img_b64)
        if query_img is None:
            return False, None, 0.0

        query_face = self.detect_and_crop_face(query_img)
        if query_face is None:
            return False, None, 0.0

        best_student_id = None
        best_confidence = 0.0

        for student_id, ref_b64 in registered_faces:
            ref_img = self.base64_to_image(ref_b64)
            if ref_img is None:
                continue
            ref_face = self.detect_and_crop_face(ref_img)
            if ref_face is None:
                continue

            confidence = self.compare_faces(query_face, ref_face)
            if confidence > best_confidence:
                best_confidence = confidence
                best_student_id = student_id

        # Recognition threshold: 0.60 (60% confidence match)
        if best_confidence >= 0.60 and best_student_id is not None:
            return True, best_student_id, round(best_confidence, 2)
        
        return False, None, round(best_confidence, 2)


face_service = FaceService()
