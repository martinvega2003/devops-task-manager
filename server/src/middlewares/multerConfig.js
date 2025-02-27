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
    const uploadPath = path.join(uploadDir, sanitizedFilename);

    // Check if a file with the same name exists
    if (fs.existsSync(uploadPath)) {
      return cb(new multer.MulterError("LIMIT_UNEXPECTED_FILE", "A file with this name already exists. Please rename your file and try again."));
    }

    cb(null, sanitizedFilename);
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

// File upload middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

