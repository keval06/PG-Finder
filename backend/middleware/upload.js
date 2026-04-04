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
    contentType: multerS3.AUTO_CONTENT_TYPE,
    key: (req, file, cb) => {
      cb(null, `images/${Date.now()}-${file.originalname.replace(/\s+/g, "-")}`);
    },
  }),
});

module.exports = upload;
