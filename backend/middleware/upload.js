const multer = require("multer");
const multerS3 = require("multer-s3");
const s3 = require("../config/s3.js");
// Without multerS3:
// ```
// Browser → uploads to Express server → server saves to disk → server uploads to S3 → delete temp file
// → double transfer, uses server disk space ❌
// ```

// With multerS3:
// ```
// Browser → uploads to Express → multerS3 streams directly to S3 → done
// → never touches server disk ✅

const upload = multer({
  storage: multerS3({
    s3: s3,
    bucket: process.env.S3_BUCKET,
    contentType: (req, file, cb) => {
      cb(null, file.mimetype);
    },
    key: (req, file, cb) => {
      const ext = file.originalname.split(".").pop().toLowerCase();
      const safeExt = ["jpg", "jpeg", "png", "webp", "gif"].includes(ext) ? ext : "jpg";
      const key = `images/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${safeExt}`;
      cb(null, key);
    },
  }),
  // SECURITY ADDITION: Enforce strict limits
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB Limit
  },
  fileFilter: (req, file, cb) => {
    // Only accept image files
    //extension regex
    const allowedExtensions = /\.(jpg|jpeg|png|webp|gif)$/i;
    if (file.mimetype.startsWith("image/") && allowedExtensions.test(file.originalname)) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
});

module.exports = upload;
