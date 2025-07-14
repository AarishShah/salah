const multer = require('multer');
const path = require('path');

const upload = multer({
    dest: path.join(__dirname, '../../uploads'),
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'text/csv' || file.originalname.endsWith('.csv')) {
            cb(null, true);
        } else {
            cb(new Error('Only CSV files are allowed'));
        }
    },
    limits: { fileSize: 100 * 1024 } // 100KB limit
});

module.exports = { upload }; 