const Product = require('../models/Product');

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

    if (category) filter.category = category;
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
    let images = [];

    // 1. التعامل مع الصور المرفوعة (تأتي من Multer بعد الرفع لـ Cloudinary)
    if (req.files && req.files.length > 0) {
      // Cloudinary يضع رابط الصورة في path
      const uploadedImages = req.files.map(file => file.path);
      images = [...images, ...uploadedImages];
    }

    // 2. التعامل مع روابط الصور الخارجية (تأتي كـ String أو Array في الـ body)
    if (req.body.images) {
      let externalImages = [];
      // التأكد هل هي رابط واحد أم مجموعة روابط
      if (typeof req.body.images === 'string') {
        externalImages = [req.body.images];
      } else if (Array.isArray(req.body.images)) {
        externalImages = req.body.images;
      }
      images = [...images, ...externalImages];
    }

    // دمج الصور النهائية
    productData.images = images;

    // تعيين الصورة الرئيسية
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

    // 1. التعامل مع الصور المرفوعة الجديدة
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => file.path);
      newImages = [...newImages, ...uploadedImages];
    }

    // 2. التعامل مع الروابط الجديدة
    // ملاحظة: في التحديث، الـ Frontend عادة بيبعت الصور القديمة + الجديدة
    // هنا سنفترض أننا نضيف صوراً جديدة للقائمة الموجودة
    if (req.body.newImages) { // استخدمنا اسم field مختلف قليلاً للتمييز
      let externalImages = [];
      if (typeof req.body.newImages === 'string') {
        externalImages = [req.body.newImages];
      } else if (Array.isArray(req.body.newImages)) {
        externalImages = req.body.newImages;
      }
      newImages = [...newImages, ...externalImages];
    }

    // إذا تم إرسال صور، نقوم بإضافتها أو استبدالها حسب المنطق الذي تفضله
    // السيناريو الأغلب: إضافة الصور الجديدة للقديمة
    if (newImages.length > 0) {
      updateData.images = [...(product.images || []), ...newImages];
    }

    // إذا أراد المستخدم استبدال كل الصور بروابط خارجية فقط (سيناريو آخر)
    if (req.body.images && Array.isArray(req.body.images) && req.files.length === 0) {
      updateData.images = req.body.images;
    }

    // تحديث الصورة الرئيسية إذا لزم الأمر
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

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts
};