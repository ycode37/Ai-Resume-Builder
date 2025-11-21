import { Router } from "express";
import multer from "multer";
import {
  checkATSFromFile,
  checkATSFromExisting,
} from "../controller/ats.controller.js";
import { isUserAvailable } from "../middleware/auth.js";

const router = Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = [
      "application/pdf",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type. Only PDF and DOCX are allowed."));
    }
  },
});

// Route to check ATS score from uploaded file
router.post(
  "/check-file",
  isUserAvailable,
  upload.single("resume"),
  checkATSFromFile
);

// Route to check ATS score from existing resume
router.post("/check-existing", isUserAvailable, checkATSFromExisting);

export default router;
