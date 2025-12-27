// elbasalshop-backend/scripts/seed-products.js
require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('../src/models/Product');
const Category = require('../src/models/Category');

const seedProducts = async () => {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // جلب الأقسام
    console.log('📂 جاري جلب الأقسام...');
    const categories = await Category.find();
    
    if (categories.length === 0) {
      console.error('❌ لم يتم العثور على أي أقسام! قم بتشغيل seed-categories.js أولاً');
      process.exit(1);
    }

    const mobilesCategory = categories.find(c => c.slug === 'mobiles');
    const accessoriesCategory = categories.find(c => c.slug === 'accessories');
    const coversCategory = categories.find(c => c.slug === 'covers');
    const chargersCategory = categories.find(c => c.slug === 'chargers');
    const headphonesCategory = categories.find(c => c.slug === 'headphones');
    const powerbanksCategory = categories.find(c => c.slug === 'powerbanks');

    console.log('✅ تم جلب الأقسام بنجاح');

    // حذف المنتجات القديمة (اختياري)
    console.log('🗑️  جاري حذف المنتجات القديمة...');
    await Product.deleteMany({});
    console.log('✅ تم حذف المنتجات القديمة');

    // المنتجات التجريبية
    const products = [
      // ==================== موبايلات ====================
      {
        name: 'Samsung Galaxy S24 Ultra',
        description: 'أحدث هاتف من سامسونج بكاميرا 200 ميجابكسل وشاشة Dynamic AMOLED 2X بحجم 6.8 بوصة',
        price: 45000,
        oldPrice: 50000,
        category: mobilesCategory._id,
        brand: 'Samsung',
        stock: 15,
        images: ['/placeholder.svg'],
        specifications: {
          'الشاشة': '6.8 بوصة Dynamic AMOLED',
          'المعالج': 'Snapdragon 8 Gen 3',
          'الرام': '12 جيجا',
          'التخزين': '256 جيجا',
          'الكاميرا الخلفية': '200 ميجابكسل',
          'البطارية': '5000 مللي أمبير'
        },
        isFeatured: true,
        isAvailable: true
      },
      {
        name: 'iPhone 15 Pro Max',
        description: 'آيفون 15 برو ماكس بمعالج A17 Pro وشاشة Super Retina XDR',
        price: 55000,
        oldPrice: 60000,
        category: mobilesCategory._id,
        brand: 'Apple',
        stock: 10,
        images: ['/placeholder.svg'],
        specifications: {
          'الشاشة': '6.7 بوصة Super Retina XDR',
          'المعالج': 'A17 Pro',
          'الرام': '8 جيجا',
          'التخزين': '256 جيجا',
          'الكاميرا': '48 ميجابكسل',
          'البطارية': '4422 مللي أمبير'
        },
        isFeatured: true,
        isAvailable: true
      },
      {
        name: 'Xiaomi 14 Pro',
        description: 'شاومي 14 برو بكاميرا Leica وشحن سريع 120W',
        price: 25000,
        oldPrice: 28000,
        category: mobilesCategory._id,
        brand: 'Xiaomi',
        stock: 20,
        images: ['/placeholder.svg'],
        specifications: {
          'الشاشة': '6.73 بوصة AMOLED',
          'المعالج': 'Snapdragon 8 Gen 3',
          'الرام': '12 جيجا',
          'التخزين': '256 جيجا',
          'الكاميرا': '50 ميجابكسل Leica',
          'البطارية': '4880 مللي أمبير'
        },
        isFeatured: true,
        isAvailable: true
      },
      {
        name: 'Oppo Find X7 Ultra',
        description: 'أوبو فايند X7 ألترا بكاميرات Hasselblad',
        price: 30000,
        category: mobilesCategory._id,
        brand: 'Oppo',
        stock: 12,
        images: ['/placeholder.svg'],
        specifications: {
          'الشاشة': '6.82 بوصة AMOLED',
          'المعالج': 'Snapdragon 8 Gen 3',
          'الرام': '16 جيجا',
          'التخزين': '512 جيجا',
          'الكاميرا': '50 ميجابكسل Hasselblad',
          'البطارية': '5000 مللي أمبير'
        },
        isFeatured: false,
        isAvailable: true
      },
      {
        name: 'Realme GT 5 Pro',
        description: 'ريلمي GT 5 برو بأداء قوي وسعر مناسب',
        price: 18000,
        oldPrice: 20000,
        category: mobilesCategory._id,
        brand: 'Realme',
        stock: 25,
        images: ['/placeholder.svg'],
        specifications: {
          'الشاشة': '6.78 بوصة AMOLED',
          'المعالج': 'Snapdragon 8 Gen 2',
          'الرام': '12 جيجا',
          'التخزين': '256 جيجا',
          'الكاميرا': '50 ميجابكسل',
          'البطارية': '5400 مللي أمبير'
        },
        isFeatured: false,
        isAvailable: true
      },

      // ==================== إكسسوارات ====================
      {
        name: 'حامل موبايل للسيارة مغناطيسي',
        description: 'حامل مغناطيسي قوي للموبايل في السيارة، يثبت على فتحة التكييف',
        price: 150,
        oldPrice: 200,
        category: accessoriesCategory._id,
        brand: 'Generic',
        stock: 50,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },
      {
        name: 'واقي شاشة زجاجي 9H',
        description: 'واقي شاشة من الزجاج المقوى بصلابة 9H، حماية كاملة ضد الخدوش',
        price: 100,
        category: accessoriesCategory._id,
        brand: 'Generic',
        stock: 100,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },
      {
        name: 'سلك USB-C سريع 3 متر',
        description: 'كابل شحن سريع USB-C بطول 3 متر، يدعم الشحن السريع حتى 65W',
        price: 120,
        oldPrice: 150,
        category: accessoriesCategory._id,
        brand: 'Generic',
        stock: 80,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },

      // ==================== جرابات ====================
      {
        name: 'جراب سيليكون شفاف',
        description: 'جراب سيليكون شفاف مقاوم للصدمات، يحمي الموبايل بدون إخفاء لونه',
        price: 80,
        category: coversCategory._id,
        brand: 'Generic',
        stock: 150,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },
      {
        name: 'جراب جلد فاخر',
        description: 'جراب من الجلد الطبيعي الفاخر مع حافظة للكروت',
        price: 250,
        oldPrice: 300,
        category: coversCategory._id,
        brand: 'Premium',
        stock: 40,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },
      {
        name: 'جراب مضاد للصدمات',
        description: 'جراب بحماية عسكرية ضد الصدمات والسقوط',
        price: 180,
        category: coversCategory._id,
        brand: 'Generic',
        stock: 60,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },

      // ==================== شواحن ====================
      {
        name: 'شاحن سريع 65W',
        description: 'شاحن سريع بقوة 65W مع منفذ USB-C وUSB-A، يشحن الموبايل بالكامل في 30 دقيقة',
        price: 350,
        oldPrice: 400,
        category: chargersCategory._id,
        brand: 'Anker',
        stock: 30,
        images: ['/placeholder.svg'],
        isFeatured: true,
        isAvailable: true
      },
      {
        name: 'شاحن لاسلكي 15W',
        description: 'شاحن لاسلكي سريع 15W متوافق مع جميع الهواتف',
        price: 280,
        category: chargersCategory._id,
        brand: 'Samsung',
        stock: 45,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },
      {
        name: 'شاحن سيارة مزدوج USB',
        description: 'شاحن سيارة بمنفذين USB بقوة 3.1A لكل منفذ',
        price: 120,
        oldPrice: 150,
        category: chargersCategory._id,
        brand: 'Generic',
        stock: 70,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },

      // ==================== سماعات ====================
      {
        name: 'سماعات AirPods Pro 2',
        description: 'سماعات أبل اللاسلكية مع إلغاء الضوضاء النشط',
        price: 4500,
        oldPrice: 5000,
        category: headphonesCategory._id,
        brand: 'Apple',
        stock: 20,
        images: ['/placeholder.svg'],
        isFeatured: true,
        isAvailable: true
      },
      {
        name: 'سماعات Galaxy Buds 3 Pro',
        description: 'سماعات سامسونج اللاسلكية بصوت نقي وإلغاء ضوضاء',
        price: 2800,
        category: headphonesCategory._id,
        brand: 'Samsung',
        stock: 35,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },
      {
        name: 'سماعات رأس لاسلكية',
        description: 'سماعات over-ear لاسلكية مع بطارية تدوم 30 ساعة',
        price: 1200,
        oldPrice: 1500,
        category: headphonesCategory._id,
        brand: 'JBL',
        stock: 25,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },

      // ==================== باور بانك ====================
      {
        name: 'باور بانك 20000mAh شحن سريع',
        description: 'بطارية محمولة بسعة 20000 مللي أمبير مع شحن سريع 65W',
        price: 650,
        oldPrice: 750,
        category: powerbanksCategory._id,
        brand: 'Anker',
        stock: 40,
        images: ['/placeholder.svg'],
        isFeatured: true,
        isAvailable: true
      },
      {
        name: 'باور بانك 10000mAh صغير',
        description: 'بطارية محمولة صغيرة الحجم بسعة 10000 مللي أمبير',
        price: 350,
        category: powerbanksCategory._id,
        brand: 'Xiaomi',
        stock: 60,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      },
      {
        name: 'باور بانك لاسلكي 10000mAh',
        description: 'بطارية محمولة مع شحن لاسلكي وشحن سريع',
        price: 550,
        oldPrice: 650,
        category: powerbanksCategory._id,
        brand: 'Samsung',
        stock: 30,
        images: ['/placeholder.svg'],
        isFeatured: false,
        isAvailable: true
      }
    ];

    // إضافة المنتجات
    console.log('📦 جاري إضافة المنتجات التجريبية...');
    const result = await Product.insertMany(products);
    console.log(`✅ تم إضافة ${result.length} منتج بنجاح!`);

    // إحصائيات حسب القسم
    console.log('\n📊 إحصائيات المنتجات حسب القسم:');
    for (const category of categories) {
      const count = await Product.countDocuments({ category: category._id });
      console.log(`   - ${category.name}: ${count} منتج`);
    }

    console.log('\n✨ تمت العملية بنجاح!');
    console.log('💡 يمكنك الآن التصفح من الفرونت إند');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  }
};

seedProducts();