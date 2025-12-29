const mongoose = require('mongoose');

// 1. إنشاء Schema فرعية للتقييمات
const reviewSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
}, {
  timestamps: true
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide product name'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: { type: String, lowercase: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: [true, 'Please specify product category']
  },
  brand: { type: String, required: [true, 'Please provide brand name'], trim: true },
  description: {
    type: String,
    required: [true, 'Please provide product description'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  specifications: { type: Map, of: String, default: {} },
  price: { type: Number, required: [true, 'Please provide product price'], min: [0, 'Price cannot be negative'] },
  discountPrice: {
    type: Number,
    min: [0, 'Discount price cannot be negative'],
    validate: {
      validator: function(value) {
        return !value || value < this.price;
      },
      message: 'Discount price must be less than regular price'
    }
  },
  stock: { type: Number, required: [true, 'Please specify stock quantity'], min: [0, 'Stock cannot be negative'], default: 0 },
  images: [{ type: String }],
  mainImage: { type: String },
  isAvailable: { type: Boolean, default: true },
  isFeatured: { type: Boolean, default: false },
  tags: [{ type: String, trim: true }],
  views: { type: Number, default: 0 },
  
  // 2. ربط التقييمات بالمنتج
  reviews: [reviewSchema],
  
  rating: {
    average: { type: Number, default: 0, min: 0, max: 5 },
    count: { type: Number, default: 0 }
  }
}, {
  timestamps: true
});

// Create slug from name before saving
productSchema.pre('save', function(next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
  }
  if (this.images && this.images.length > 0 && !this.mainImage) {
    this.mainImage = this.images[0];
  }
  next();
});

productSchema.index({ name: 'text', description: 'text', brand: 'text' });

module.exports = mongoose.model('Product', productSchema);