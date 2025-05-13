import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import fs from "fs";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Uploads directory
const uploadDir = path.join(__dirname, "../uploads/");

// Ensure uploads directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir); // Store files in "uploads" folder
  },
  filename: (req, file, cb) => {
    const sanitizedFilename = file.originalname.replace(/\s+/g, "_");
    const taskId = req.params.taskId; // Get the task ID from the request params
    const uniqueSuffix = `${taskId}_${Date.now()}`; // Append task ID and timestamp
    const finalFilename = `${uniqueSuffix}_${sanitizedFilename}`;
    cb(null, finalFilename);
  },
});

// File filter to allow only PNG, JPEG, and PDFs
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "Invalid file type. Only PNG, JPEG, and PDF are allowed."), false);
  }
};

// Helper function to delete a file
export const deleteFile = (filename) => {
  const filePath = path.join(uploadDir, filename);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
    console.log(`File deleted: ${filename}`);
  }
};

// File upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

