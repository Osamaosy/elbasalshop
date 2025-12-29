const express = require('express');
const router = express.Router();
const {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  createProductReview // 1. ✅ تأكد من استيراد هذه الدالة
} = require('../controllers/productController');
const { protect, adminOnly } = require('../middleware/auth');
const upload = require('../middleware/upload');
const {
  createProductValidation,
  updateProductValidation
} = require('../validators/productValidators');

// Public routes
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/:id', getProductById);

// 2. ✅ مسار التقييمات (يجب أن يكون هنا)
// المستخدم المسجل فقط (protect) يستطيع التقييم
router.post('/:id/reviews', protect, createProductReview);

// Admin routes
router.post(
  '/',
  protect,
  adminOnly,
  upload.array('images', 5),
  createProductValidation,
  createProduct
);

router.put(
  '/:id',
  protect,
  adminOnly,
  upload.array('images', 5),
  updateProductValidation,
  updateProduct
);

router.delete('/:id', protect, adminOnly, deleteProduct);

module.exports = router;