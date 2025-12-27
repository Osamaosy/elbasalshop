// elbasalshop-backend/scripts/seed-categories.js
require('dotenv').config();
const mongoose = require('mongoose');
const Category = require('../src/models/Category');

const categories = [
  {
    name: 'موبايلات',
    slug: 'mobiles',
    type: 'mobile',
    description: 'أحدث الهواتف الذكية من جميع الماركات',
    order: 1,
    isActive: true
  },
  {
    name: 'إكسسوارات',
    slug: 'accessories',
    type: 'accessory',
    description: 'جميع ملحقات وإكسسوارات الموبايل',
    order: 2,
    isActive: true
  },
  {
    name: 'جرابات',
    slug: 'covers',
    type: 'accessory',
    description: 'جرابات وأغطية حماية للموبايلات',
    order: 3,
    isActive: true
  },
  {
    name: 'شواحن',
    slug: 'chargers',
    type: 'accessory',
    description: 'شواحن سريعة وكوابل عالية الجودة',
    order: 4,
    isActive: true
  },
  {
    name: 'سماعات',
    slug: 'headphones',
    type: 'accessory',
    description: 'سماعات سلكية ولاسلكية',
    order: 5,
    isActive: true
  },
  {
    name: 'باور بانك',
    slug: 'powerbanks',
    type: 'accessory',
    description: 'بطاريات محمولة وشواحن متنقلة',
    order: 6,
    isActive: true
  }
];

const seedCategories = async () => {
  try {
    console.log('🔄 جاري الاتصال بقاعدة البيانات...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ تم الاتصال بقاعدة البيانات');

    // حذف الأقسام القديمة (اختياري)
    console.log('🗑️  جاري حذف الأقسام القديمة...');
    await Category.deleteMany({});
    console.log('✅ تم حذف الأقسام القديمة');

    // إضافة الأقسام الجديدة
    console.log('📦 جاري إضافة الأقسام الجديدة...');
    const result = await Category.insertMany(categories);
    console.log(`✅ تم إضافة ${result.length} قسم بنجاح!`);

    // عرض الأقسام المضافة
    console.log('\n📋 الأقسام المضافة:');
    result.forEach(cat => {
      console.log(`   - ${cat.name} (${cat.slug}) - ID: ${cat._id}`);
    });

    console.log('\n✨ تمت العملية بنجاح!');
    process.exit(0);
  } catch (error) {
    console.error('❌ حدث خطأ:', error);
    process.exit(1);
  }
};

seedCategories();