// // server/routes/upload.js
// const express = require('express');
// const upload = require('../middleware/upload');
// const { protect, admin } = require('../middleware/auth');

// const router = express.Router();

// router.post('/', protect, admin, (req, res) => {
//   upload(req, res, (err) => {
//     if (err) {
//       return res.status(400).json({ message: err });
//     }

//     if (!req.file) {
//       return res.status(400).json({ message: 'No file uploaded' });
//     }

//     res.json({
//       message: 'File uploaded successfully',
//       file: `/${req.file.path}`
//     });
//   });
// });

// module.exports = router;

// server/routes/upload.js
const express = require('express');
const upload = require('../middleware/upload');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    res.json({
      message: 'File uploaded successfully',
      file: req.file.path,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;