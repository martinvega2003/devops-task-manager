export const validateFileUploadMiddleware = (req, res, next) => {
  if (!req.file) {
    return res.status(400).json({ msg: "No file uploaded." });
  }
  
  const allowedTypes = ["image/png", "image/jpeg", "application/pdf"];
  if (!allowedTypes.includes(req.file.mimetype)) {
    return res.status(400).json({ msg: "Invalid file type. Only PNG, JPEG, and PDF are allowed." });
  }
  
  const maxSize = 5 * 1024 * 1024; // 5MB
  if (req.file.size > maxSize) {
    return res.status(400).json({ msg: "File size exceeds the 5MB limit." });
  }
  
  next();
};
  