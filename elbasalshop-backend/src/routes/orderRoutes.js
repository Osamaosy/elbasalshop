const express = require('express');
const router = express.Router();
const {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders, // ✅ هنستخدم دي لأنها الأشمل
  updateOrderStatus,
  cancelOrder,
  getAdminDashboardStats,
  createPosOrder
} = require('../controllers/orderController');
const { protect, adminOnly } = require('../middleware/auth');
const { createOrderValidation } = require('../validators/orderValidators'); // تأكد إنك بتستخدمها لو محتاجها

// --- مسارات المستخدم العادي (Customer) ---
router.post('/', protect, createOrder); // إنشاء طلب
router.get('/', protect, getUserOrders); // طلباتي
router.get('/:id', protect, getOrderById); // تفاصيل طلب محدد
router.put('/:id/cancel', protect, cancelOrder); // إلغاء طلب

// --- مسارات الأدمن (Admin) ---
// 1. الإحصائيات (لازم تكون قبل المسارات اللي فيها :id)
router.get('/admin/stats', protect, adminOnly, getAdminDashboardStats);

// 2. بيع المحل (POS)
router.post('/pos', protect, adminOnly, createPosOrder);

// 3. جلب كل الطلبات (مع البحث والصفحات)
router.get('/admin/all', protect, adminOnly, getAllOrders);

// 4. تحديث حالة الطلب
router.put('/:id/status', protect, adminOnly, updateOrderStatus);

module.exports = router;