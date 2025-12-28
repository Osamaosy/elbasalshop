const mongoose = require('mongoose');
// 1. استيراد موديل العداد
const Counter = require('./Counter');

const orderSchema = new mongoose.Schema({
  // ... (باقي الـ Schema كما هي بدون تغيير) ...
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  products: [{
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true
    },
    name: String, 
    quantity: {
      type: Number,
      required: true,
      min: [1, 'Quantity must be at least 1']
    },
    price: {
      type: Number,
      required: true
    },
    image: String
  }],
  totalAmount: {
    type: Number,
    required: true,
    min: [0, 'Total amount cannot be negative']
  },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  customerInfo: {
    name: {
      type: String,
      required: true
    },
    phone: {
      type: String,
      required: true
    },
    email: String,
    address: {
      type: String,
      required: true
    },
    city: String,
    notes: String
  },
  whatsappSent: {
    type: Boolean,
    default: false
  },
  whatsappSentAt: Date,
  notes: String,
  adminNotes: String,
  statusHistory: [{
    status: String,
    timestamp: {
      type: Date,
      default: Date.now
    },
    note: String
  }]
}, {
  timestamps: true
});

// 2. تعديل الـ pre-save hook لاستخدام العداد الذري
orderSchema.pre('save', async function(next) {
  if (this.isNew) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    try {
      // استخدام findByIdAndUpdate لزيادة العداد بشكل آمن (Atomic Operation)
      const counter = await Counter.findByIdAndUpdate(
        { _id: 'orderNumber' }, // معرف العداد
        { $inc: { seq: 1 } },   // زيادة القيمة بـ 1
        { new: true, upsert: true } // إنشاء العداد لو مش موجود وإرجاع القيمة الجديدة
      );

      // استخدام القيمة الجديدة من العداد
      this.orderNumber = `ORD-${year}${month}-${String(counter.seq).padStart(5, '0')}`;
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});

// Add status to history when status changes
orderSchema.pre('save', function(next) {
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    });
  }
  next();
});

module.exports = mongoose.model('Order', orderSchema);