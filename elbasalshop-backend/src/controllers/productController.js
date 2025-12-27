const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');

// @desc    Get all products with filtering, search, and pagination
// @route   GET /api/products
// @access  Public
const getProducts = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 12,
      category,
      brand,
      minPrice,
      maxPrice,
      search,
      sort = '-createdAt',
      inStock
    } = req.query;
    
    // Build filter
    let filter = { isAvailable: true };
    
    // ✅ 1. إصلاح مشكلة الأقسام (Category Fix)
    if (category) {
      if (mongoose.Types.ObjectId.isValid(category)) {
        // لو القيمة عبارة عن ID صحيح، ابحث بيه
        filter.category = category;
      } else {
        // لو القيمة اسم (Slug/Name)، ابحث عن القسم الأول وهات الـ ID بتاعه
        const categoryDoc = await Category.findOne({
          $or: [
            { slug: category },
            { type: category },
            { name: { $regex: category, $options: 'i' } }
          ]
        });

        if (categoryDoc) {
          filter.category = categoryDoc._id;
        } else {
          // لو القسم مش موجود، رجع قائمة فاضية بدل ما تضرب Error
          return res.status(200).json({
            success: true,
            data: { products: [], pagination: {} }
          });
        }
      }
    }
    
    if (brand) filter.brand = { $regex: brand, $options: 'i' };
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (inStock === 'true') filter.stock = { $gt: 0 };
    
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { brand: { $regex: search, $options: 'i' } }
      ];
    }
    
    // Pagination
    const skip = (Number(page) - 1) * Number(limit);
    
    // Get products
    const products = await Product.find(filter)
      .populate('category', 'name type')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);
    
    // Get total count
    const total = await Product.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / limit)
        }
      }
    });
    
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching products',
      error: error.message
    });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate('category', 'name type');
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    // Increment views
    product.views += 1;
    await product.save();
    
    res.json({
      success: true,
      data: { product }
    });
    
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching product',
      error: error.message
    });
  }
};

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
const createProduct = async (req, res) => {
  try {
    const productData = req.body;
    
    // Parse specifications if it's a string
    if (typeof productData.specifications === 'string') {
        try {
            productData.specifications = JSON.parse(productData.specifications);
        } catch (e) {
            productData.specifications = {};
        }
    }

    // Handle uploaded images
    if (req.files && req.files.length > 0) {
      productData.images = req.files.map(file => `/uploads/products/${file.filename}`);
      productData.mainImage = productData.images[0];
    }
    
    const product = await Product.create(productData);
    
    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
    
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating product',
      error: error.message
    });
  }
};

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
const updateProduct = async (req, res) => {
  try {
    let product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    const updateData = req.body;

    // Parse specifications
    if (typeof updateData.specifications === 'string') {
        try {
            updateData.specifications = JSON.parse(updateData.specifications);
        } catch (e) {
            // ignore error
        }
    }
    
    // Handle new uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => `/uploads/products/${file.filename}`);
      updateData.images = [...(product.images || []), ...newImages];
      if (!updateData.mainImage) {
        updateData.mainImage = updateData.images[0];
      }
    }
    
    product = await Product.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
    
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error updating product',
      error: error.message
    });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }
    
    await product.deleteOne();
    
    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
    
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Error deleting product',
      error: error.message
    });
  }
};

// ✅ 2. التأكد من وجود دالة المنتجات المميزة
// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isAvailable: true })
      .populate('category', 'name type')
      .limit(8)
      .sort('-createdAt');
    
    res.json({
      success: true,
      data: { products }
    });
    
  } catch (error) {
    console.error('Get featured products error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching featured products',
      error: error.message
    });
  }
};

// ✅ 3. تصدير جميع الدوال بشكل صحيح
module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts
};