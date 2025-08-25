// server/middleware/upload.js
const multer = require("multer");
const { storage } = require("../config/cloudinary");

// const path = require("path");

// // Set storage engine
// const storage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, "uploads/");
//   },
//   filename: function (req, file, cb) {
//     cb(
//       null,
//       `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`
//     );
//   },
// });

// // Check file type
// function checkFileType(file, cb) {
//   const filetypes = /jpeg|jpg|png|gif/;
//   const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
//   const mimetype = filetypes.test(file.mimetype);

//   if (mimetype && extname) {
//     return cb(null, true);
//   } else {
//     cb("Error: Images only!");
//   }
// }

// // Initialize upload
// const upload = multer({
//   storage: storage,
//   limits: { fileSize: 1000000 }, // 1MB limit
//   fileFilter: function (req, file, cb) {
//     checkFileType(file, cb);
//   },
// }).single("image");

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  },
});

module.exports = upload;
