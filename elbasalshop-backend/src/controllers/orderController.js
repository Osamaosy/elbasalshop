const mongoose = require('mongoose');
const Order = require('../models/Order');
const Product = require('../models/Product');
const { generateWhatsAppLink } = require('../services/whatsappService');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private
const createOrder = async (req, res) => {
  // Start transaction session
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const { products, customerInfo, notes } = req.body;
    
    if (!products || products.length === 0) {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Please add at least one product to your order'
      });
    }
    
    // Validate and calculate total
    let totalAmount = 0;
    const orderProducts = [];
    
    for (const item of products) {
      const product = await Product.findById(item.product).session(session);
      
      if (!product) {
        await session.abortTransaction();
        session.endSession();
        return res.status(404).json({
          success: false,
          message: `Product with ID ${item.product} not found`
        });
      }
      
      if (!product.isAvailable) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }
      
      if (product.stock < item.quantity) {
        await session.abortTransaction();
        session.endSession();
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${product.name}. Available: ${product.stock}`
        });
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
      
      // Update product stock within transaction
      product.stock -= item.quantity;
      await product.save({ session });
    }
    
    // Create order within transaction
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
    
    // Commit transaction - all operations succeeded
    await session.commitTransaction();
    session.endSession();
    
    // Populate products (after transaction)
    await order.populate('products.product');
    
    // Generate WhatsApp link
    const whatsappLink = generateWhatsAppLink(order);
    
    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order,
        whatsappLink
      }
    });
    
  } catch (error) {
    // Rollback transaction on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating order',
      error: error.message
    });
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
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
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
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check if user owns this order or is admin
    if (order.user._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to access this order'
      });
    }
    
    res.json({
      success: true,
      data: { order }
    });
    
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching order',
      error: error.message
    });
  }
};

// @desc    Get all orders (Admin)
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
    
    // Calculate stats
    const stats = await Order.aggregate([
      {
        $group: {
          _id: null,
          totalOrders: { $sum: 1 },
          totalRevenue: { $sum: '$totalAmount' },
          pendingOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
          },
          completedOrders: {
            $sum: { $cond: [{ $eq: ['$status', 'delivered'] }, 1, 0] }
          }
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
    console.error('Get all orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching orders',
      error: error.message
    });
  }
};

// @desc    Update order status (Admin)
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  try {
    const { status, adminNotes } = req.body;
    
    const order = await Order.findById(req.params.id);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    order.status = status;
    if (adminNotes) order.adminNotes = adminNotes;
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Order status updated successfully',
      data: { order }
    });
    
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating order status',
      error: error.message
    });
  }
};

// @desc    Cancel order
// @route   PUT /api/orders/:id/cancel
// @access  Private
const cancelOrder = async (req, res) => {
  // Start transaction for stock restoration
  const session = await mongoose.startSession();
  session.startTransaction();
  
  try {
    const order = await Order.findById(req.params.id).session(session);
    
    if (!order) {
      await session.abortTransaction();
      session.endSession();
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }
    
    // Check ownership
    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      await session.abortTransaction();
      session.endSession();
      return res.status(403).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }
    
    // Can only cancel pending orders
    if (order.status !== 'pending') {
      await session.abortTransaction();
      session.endSession();
      return res.status(400).json({
        success: false,
        message: 'Only pending orders can be cancelled'
      });
    }
    
    // Update order status
    order.status = 'cancelled';
    await order.save({ session });
    
    // Restore product stock within transaction
    for (const item of order.products) {
      await Product.findByIdAndUpdate(
        item.product,
        { $inc: { stock: item.quantity } },
        { session }
      );
    }
    
    // Commit transaction
    await session.commitTransaction();
    session.endSession();
    
    res.json({
      success: true,
      message: 'Order cancelled successfully',
      data: { order }
    });
    
  } catch (error) {
    // Rollback on error
    await session.abortTransaction();
    session.endSession();
    
    console.error('Cancel order error:', error);
    res.status(500).json({
      success: false,
      message: 'Error cancelling order',
      error: error.message
    });
  }
};

module.exports = {
  createOrder,
  getUserOrders,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  cancelOrder
};