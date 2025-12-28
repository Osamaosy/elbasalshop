const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
// استيراد إعدادات cloudinary الموجودة بالفعل
const cloudinary = require('../config/cloudinary');

// إعداد التخزين على Cloudinary
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'elbasalshop-products', // اسم الفولدر على Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [{ width: 1000, height: 1000, crop: 'limit' }] // خيار إضافي لتحجيم الصور
  },
});

// فلتر الملفات (للتأكد من أنها صور فقط)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload only images.'), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

module.exports = upload;