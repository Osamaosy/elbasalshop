const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { generateWhatsAppLink } = require('../services/whatsappService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { products, customerInfo, notes } = req.body;
    
    if (!products || products.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Please add at least one product' });
    }
    
    let totalAmount = 0;
    const orderProducts = [];
    
    for (const item of products) {
      const product = await Product.findById(item.product).session(session);
      
      if (!product || !product.isAvailable) {
        throw new Error(`Product ${product ? product.name : item.product} is not available`);
      }
      
      if (product.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name}`);
      }
      
      const price = product.discountPrice || product.price;
      totalAmount += price * item.quantity;
      
      orderProducts.push({
        product: product._id,
        name: product.name,
        quantity: item.quantity,
        price: price,
        image: product.mainImage
      });
      
      product.stock -= item.quantity;
      await product.save({ session });
    }
    
    const orderData = {
      user: req.user._id,
      products: orderProducts,
      totalAmount,
      customerInfo: {
        name: customerInfo.name || req.user.name,
        phone: customerInfo.phone || req.user.phone,
        email: customerInfo.email || req.user.email,
        address: customerInfo.address,
        city: customerInfo.city,
        notes: customerInfo.notes
      },
      notes
    };
    
    const [order] = await Order.create([orderData], { session });
    
    await session.commitTransaction();
    session.endSession();
    
    await order.populate('products.product');
    const whatsappLink = generateWhatsAppLink(order);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: { order, whatsappLink }
    });
    
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    console.error('Create order error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get user orders
// @route   GET /api/orders
// @access  Private
const getUserOrders = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const filter = { user: req.user._id };
    if (status) filter.status = status;
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(filter)
      .populate('products.product', 'name mainImage')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);
    
    const total = await Order.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('products.product')
      .populate('user', 'name email phone');
    
    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });
    
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    res.json({ success: true, data: { order } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all orders (Admin) - ✅ النسخة المعتمدة
// @route   GET /api/orders/admin/all
// @access  Private/Admin
const getAllOrders = async (req, res) => {
  try {
    const { page = 1, limit = 20, status, search } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { orderNumber: new RegExp(search, 'i') },
        { 'customerInfo.name': new RegExp(search, 'i') },
        { 'customerInfo.phone': new RegExp(search, 'i') }
      ];
    }
    
    const skip = (page - 1) * limit;
    
    const orders = await Order.find(filter)
      .populate('user', 'name email phone')
      .populate('products.product', 'name mainImage')
      .sort('-createdAt')
      .limit(Number(limit))
      .skip(skip);
    
    const total = await Order.countDocuments(filter);
    
    // Calculate stats logic remains same
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          pendingOrders: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          completedOrders: { $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] } }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        orders,
        stats: stats[0] || { totalOrders: 0, totalRevenue: 0, pendingOrders: 0, completedOrders: 0 },
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (order) {
      order.status = req.body.status;
      if (order.statusHistory) {
        order.statusHistory.push({ status: req.body.status, timestamp: Date.now() });
      }
      const updatedOrder = await order.save();
      res.json({ success: true, data: { order: updatedOrder } });
    } else {
      res.status(404).json({ success: false, message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const order = await Order.findById(req.params.id).session(session);
    
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }
    
    if (order.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({ success: false, message: 'Only pending orders can be cancelled' });
    }
    
    order.status = 'cancelled';
    await order.save({ session });
    
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }
    
    await session.commitTransaction();
    session.endSession();
    
    res.json({ success: true, message: 'Order cancelled successfully', data: { order } });
  } catch (error) {
    await session.abortTransaction();
    session.endSession();
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get admin dashboard stats
// @route   GET /api/orders/admin/stats
// @access  Private/Admin
const getAdminDashboardStats = async (req, res) => {
  try {
    // 1. إحصائيات الأرقام الأساسية
    const orders = await Order.find({});
    
    const totalOrders = orders.length;
    
    const totalRevenue = orders
      .filter(o => o.status === 'delivered') // نحسب أرباح الطلبات المسلمة فقط
      .reduce((acc, order) => acc + (order.totalAmount || 0), 0);
      
    const pendingOrders = orders.filter(o => o.status === 'pending').length;

    // ✅ التعديل هنا: زيادة العدد إلى 50 لدعم التقليب في الواجهة
    const limitCount = 50;

    // 2. المنتجات التي أوشكت على النفاذ
    const lowStockProducts = await Product.find({ stock: { $lte: 5 } })
      .select('name stock price mainImage')
      .limit(limitCount);

    // 3. المنتجات الأكثر مشاهدة
    const topViewedProducts = await Product.find({})
      .sort({ views: -1 })
      .select('name views price mainImage')
      .limit(limitCount);

    // 4. المنتجات الأعلى تقييماً
    const topRatedProducts = await Product.find({})
      .sort({ 'rating.average': -1 })
      .select('name rating price mainImage')
      .limit(limitCount);

    res.json({
      success: true,
      data: {
        stats: {
          totalOrders,
          totalRevenue,
          pendingOrders,
          totalProducts: await Product.countDocuments({})
        },
        lowStockProducts,
        topViewedProducts,
        topRatedProducts
      }
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create POS order (Store Sale)
// @route   POST /api/orders/pos
// @access  Private/Admin
const createPosOrder = async (req, res) => {
  const { productId } = req.body;
  try {
    const product = await Product.findById(productId);
    if (!product || product.stock <= 0) {
      return res.status(400).json({ success: false, message: 'Product not found or out of stock' });
    }

    await Product.findByIdAndUpdate(productId, { $inc: { stock: -1 } });
    await product.save();

    const order = await Order.create({
      user: req.user._id,
      orderNumber: `POS-${Date.now()}`,
      products: [{
        product: product._id,
        name: product.name,
        quantity: 1,
        price: product.price,
        image: product.mainImage || product.images[0]
      }],
      totalAmount: product.price,
      status: 'delivered',
      customerInfo: { name: 'Store Customer', phone: '00000000000', address: 'In Store Purchase' },
      isPaid: true
    });

    res.status(201).json({
      success: true,
      message: 'Store sale recorded successfully',
      data: { order, updatedStock: product.stock }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ لاحظ: حذفنا getOrders من التصدير
module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder,
  getAdminDashboardStats,
  createPosOrder
};