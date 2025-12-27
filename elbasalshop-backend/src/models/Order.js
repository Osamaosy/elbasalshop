const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  orderNumber: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  products: [{
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    name: String,
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    image: String
  }],
  totalAmount: { type: Number, required: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  customerInfo: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    email: String,
    address: { type: String, required: true },
    city: String,
    notes: String
  },
  whatsappSent: { type: Boolean, default: false },
  statusHistory: [{
    status: String,
    timestamp: { type: Date, default: Date.now }
  }],
  notes: String,
  adminNotes: String
}, { timestamps: true });

// ✅ الحل الصحيح لتوليد orderNumber بدون تكرار
orderSchema.pre('save', async function(next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    
    let attempts = 0;
    const maxAttempts = 10;
    
    while (attempts < maxAttempts) {
      try {
        // نعد الطلبات ونضيف timestamp للتفرد
        const count = await mongoose.model('Order').countDocuments();
        const timestamp = Date.now().toString().slice(-4); // آخر 4 أرقام من timestamp
        const orderNum = `ORD-${year}${month}-${String(count + 1).padStart(4, '0')}-${timestamp}`;
        
        // نتأكد إن الرقم مش موجود
        const existing = await mongoose.model('Order').findOne({ orderNumber: orderNum });
        
        if (!existing) {
          this.orderNumber = orderNum;
          break;
        }
        
        attempts++;
        // لو الرقم موجود، نستنى ميلي ثانية ونحاول تاني
        await new Promise(resolve => setTimeout(resolve, 1));
        
      } catch (error) {
        if (attempts === maxAttempts - 1) {
          // لو فشل كل المحاولات، نستخدم UUID
          const uuid = Date.now().toString(36) + Math.random().toString(36).substr(2);
          this.orderNumber = `ORD-${year}${month}-${uuid.toUpperCase()}`;
          break;
        }
      }
    }
  }
  next();
});

// Index لتسريع البحث
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ user: 1, createdAt: -1 });
orderSchema.index({ status: 1, createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);