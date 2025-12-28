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
    const filter = { isAvailable: true };

    // ✅ تصحيح منطق البحث بالـ slug أو _id
    if (category) {
      let categoryQuery;

      // 2. التحقق مما إذا كان النص هو ObjectId صالح
      if (mongoose.isValidObjectId(category)) {
        categoryQuery = { 
          $or: [
            { slug: category },
            { _id: category }
          ]
        };
      } else {
        // إذا لم يكن ObjectId (مثل "accessories") نبحث بالـ slug فقط لتجنب CastError
        categoryQuery = { slug: category };
      }

      const categoryDoc = await Category.findOne(categoryQuery);
      
      if (categoryDoc) {
        filter.category = categoryDoc._id;
      } else {
        return res.json({
          success: true,
          data: {
            products: [],
            pagination: {
              page: Number(page),
              limit: Number(limit),
              total: 0,
              pages: 0
            }
          }
        });
      }
    }

    if (brand) filter.brand = new RegExp(brand, 'i');
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    if (inStock === 'true') filter.stock = { $gt: 0 };
    if (search) {
      filter.$or = [
        { name: new RegExp(search, 'i') },
        { description: new RegExp(search, 'i') },
        { brand: new RegExp(search, 'i') }
      ];
    }

    // Pagination
    const skip = (page - 1) * limit;

    // Get products
    const products = await Product.find(filter)
      .populate('category', 'name type slug')
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
      .populate('category', 'name type slug');

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
    let images = [];

    // 1. التعامل مع الصور المرفوعة
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => file.path);
      images = [...images, ...uploadedImages];
    }

    // 2. التعامل مع روابط الصور الخارجية
    if (req.body.images) {
      let externalImages = [];
      if (typeof req.body.images === 'string') {
        externalImages = [req.body.images];
      } else if (Array.isArray(req.body.images)) {
        externalImages = req.body.images;
      }
      images = [...images, ...externalImages];
    }

    productData.images = images;

    if (images.length > 0) {
      productData.mainImage = images[0];
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
    let newImages = [];

    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => file.path);
      newImages = [...newImages, ...uploadedImages];
    }

    if (req.body.newImages) {
      let externalImages = [];
      if (typeof req.body.newImages === 'string') {
        externalImages = [req.body.newImages];
      } else if (Array.isArray(req.body.newImages)) {
        externalImages = req.body.newImages;
      }
      newImages = [...newImages, ...externalImages];
    }

    if (newImages.length > 0) {
      updateData.images = [...(product.images || []), ...newImages];
    }

    if (req.body.images && Array.isArray(req.body.images) && req.files.length === 0) {
      updateData.images = req.body.images;
    }

    if (updateData.images && updateData.images.length > 0 && !updateData.mainImage) {
      updateData.mainImage = updateData.images[0];
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

// @desc    Get featured products
// @route   GET /api/products/featured
// @access  Public
const getFeaturedProducts = async (req, res) => {
  try {
    const products = await Product.find({ isFeatured: true, isAvailable: true })
      .populate('category', 'name type slug')
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

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts
};