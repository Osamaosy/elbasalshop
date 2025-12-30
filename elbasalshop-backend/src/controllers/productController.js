const Product = require('../models/Product');
const Category = require('../models/Category');
const mongoose = require('mongoose');
const cloudinary = require('../config/cloudinary');

// دالة مساعدة لتنظيف النص للبحث
function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}

const extractPublicId = (url) => {
  if (!url) return null;
  try {
    // 1. نفصل الرابط بناءً على "/upload/"
    const splitUrl = url.split('/upload/');
    if (splitUrl.length < 2) return null;

    // 2. الجزء الثاني يحتوي على (v123/folder/image.jpg) أو (folder/image.jpg)
    let publicIdPart = splitUrl[1];

    // 3. نزيل رقم الإصدار (v12345/) إذا وجد
    if (publicIdPart.startsWith('v')) {
      const versionIndex = publicIdPart.indexOf('/');
      if (versionIndex !== -1) {
        publicIdPart = publicIdPart.substring(versionIndex + 1);
      }
    }

    // 4. نزيل الامتداد (.jpg, .png, etc)
    const lastDotIndex = publicIdPart.lastIndexOf('.');
    if (lastDotIndex !== -1) {
      publicIdPart = publicIdPart.substring(0, lastDotIndex);
    }

    return publicIdPart;
  } catch (error) {
    console.error('Error extracting public_id:', error);
    return null;
  }
};

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
      sort = '-isFeatured -createdAt',
      inStock,
      ids
    } = req.query;

const filter = { isAvailable: true };

    // ✅ دعم جلب منتجات محددة (للسلة) في طلب واحد
    if (ids) {
      const idsArray = ids.split(',').filter(id => mongoose.isValidObjectId(id));
      if (idsArray.length > 0) {
        filter._id = { $in: idsArray };
      }
    }

    if (category) {
      let categoryQuery;
      if (mongoose.isValidObjectId(category)) {
        categoryQuery = { $or: [{ slug: category }, { _id: category }] };
      } else {
        categoryQuery = { slug: category };
      }
      const categoryDoc = await Category.findOne(categoryQuery);
      if (categoryDoc) filter.category = categoryDoc._id;
      else return res.json({ success: true, data: { products: [], pagination: { total: 0 } } });
    }

    if (brand) filter.brand = new RegExp(escapeRegex(brand), 'i');
    
    if (minPrice || maxPrice) {
      filter.price = {};
      if (minPrice) filter.price.$gte = Number(minPrice);
      if (maxPrice) filter.price.$lte = Number(maxPrice);
    }
    
    if (inStock === 'true') filter.stock = { $gt: 0 };

    if (search) {
      const searchTerms = search.trim().split(/\s+/);
      const regexConditions = searchTerms.map(term => ({
        $or: [
          { name: new RegExp(escapeRegex(term), 'i') },
          { description: new RegExp(escapeRegex(term), 'i') },
          { brand: new RegExp(escapeRegex(term), 'i') }
        ]
      }));
      filter.$and = filter.$and ? [...filter.$and, ...regexConditions] : regexConditions;
    }

    const skip = (page - 1) * limit;
    // إذا طلبنا IDs محددة، نلغي الـ limit غالباً لنجلبهم كلهم
    const queryLimit = ids ? 100 : Number(limit); 

    const products = await Product.find(filter)
      .populate('category', 'name type slug')
      .sort(sort)
      .limit(queryLimit)
      .skip(ids ? 0 : skip);

    const total = await Product.countDocuments(filter);

    res.json({
      success: true,
      data: {
        products,
        pagination: {
          page: Number(page),
          limit: queryLimit,
          total,
          pages: Math.ceil(total / queryLimit)
        }
      }
    });

  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({ success: false, message: error.message });
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

    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => file.path);
      images = [...images, ...uploadedImages];
    }

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
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    const updateData = req.body;
    let newImages = [];

    // ✅ 1. التعامل مع الصور الجديدة المرفوعة
    if (req.files && req.files.length > 0) {
      const uploadedImages = req.files.map(file => file.path);
      newImages = [...newImages, ...uploadedImages];
    }

    // (تم إزالة دعم الروابط الخارجية newImages من النص)

    // ✅ 2. حذف الصورة القديمة من Cloudinary إذا تم رفع صورة رئيسية جديدة
    // نفترض أن أول صورة جديدة هي الصورة الرئيسية إذا لم يتم تحديد غيرها
    if (newImages.length > 0) {
      // إذا كان المنتج لديه صورة رئيسية قديمة، نحذفها
      if (product.mainImage) {
        const publicId = extractPublicId(product.mainImage);
        if (publicId) {
          await cloudinary.uploader.destroy(publicId);
          console.log(`Deleted old main image: ${publicId}`);
        }
      }
      
      // إضافة الصور الجديدة
      updateData.images = [...(product.images || []), ...newImages];
      // تحديث الصورة الرئيسية بأحدث صورة مرفوعة
      updateData.mainImage = newImages[0];
    }

    // تحديث البيانات النصية
    Object.keys(updateData).forEach((key) => {
      if (key !== '_id' && key !== 'images') {
         product[key] = updateData[key];
      }
    });

    if (updateData.images) {
      product.images = updateData.images;
    }
    
    await product.save();

    res.json({ success: true, message: 'Product updated successfully', data: { product } });

  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({ success: false, message: 'Error updating product', error: error.message });
  }
};

// @desc    Delete product
// @route   DELETE /api/products/:id
// @access  Private/Admin
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // ✅ حذف جميع الصور المرتبطة بالمنتج من Cloudinary
    if (product.images && product.images.length > 0) {
      const deletePromises = product.images.map(imageUrl => {
        const publicId = extractPublicId(imageUrl);
        if (publicId) {
          return cloudinary.uploader.destroy(publicId);
        }
      });
      await Promise.all(deletePromises);
      console.log('Deleted product images from Cloudinary');
    }

    await product.deleteOne();

    res.json({ success: true, message: 'Product deleted successfully' });

  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({ success: false, message: 'Error deleting product', error: error.message });
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

// @desc    Create new review
// @route   POST /api/products/:id/reviews
// @access  Private
const createProductReview = async (req, res) => {
  const { rating, comment } = req.body;

  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ success: false, message: 'Product not found' });
    }

    // التحقق مما إذا كان المستخدم قد قيم المنتج سابقاً
    const alreadyReviewed = product.reviews.find(
      (r) => r.user.toString() === req.user._id.toString()
    );

    if (alreadyReviewed) {
      return res.status(400).json({ success: false, message: 'You have already reviewed this product' });
    }

    const review = {
      name: req.user.name,
      rating: Number(rating),
      comment,
      user: req.user._id,
    };

    product.reviews.push(review);

    // تحديث عدد التقييمات
    product.rating.count = product.reviews.length;

    // حساب المتوسط الجديد
    product.rating.average =
      product.reviews.reduce((acc, item) => item.rating + acc, 0) /
      product.reviews.length;

    await product.save();

    res.status(201).json({ success: true, message: 'Review added' });
  } catch (error) {
    console.error('Review Error:', error);
    res.status(500).json({ success: false, message: 'Server Error' });
  }
};


module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getFeaturedProducts,
  createProductReview
};