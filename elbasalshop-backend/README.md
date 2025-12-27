# 📱 Mobile Shop Backend API

Backend API للمتجر الإلكتروني للموبايلات والإكسسوارات، مبني بـ Express.js و MongoDB

## 🚀 المميزات

- ✅ تسجيل دخول وإدارة المستخدمين
- 📦 إدارة المنتجات (موبايلات وإكسسوارات)
- 🏷️ إدارة الفئات
- 🛒 نظام الطلبات مع **Database Transactions** لضمان سلامة البيانات
- 📱 تكامل مع WhatsApp لإرسال الطلبات
- 🔒 نظام مصادقة JWT
- 🖼️ رفع الصور
- 🔍 البحث والفلترة
- 📄 Pagination
- 👨‍💼 لوحة تحكم للمسؤول
- 🔐 حماية من Race Conditions في Order Numbers
- 🌐 إعدادات CORS محسّنة للـ Production

## 🛠️ التقنيات المستخدمة

- Node.js
- Express.js
- MongoDB & Mongoose
- JWT Authentication
- Multer (File Upload)
- bcryptjs (Password Hashing)

## 📋 المتطلبات

- Node.js (v14 أو أحدث)
- MongoDB (محلي أو MongoDB Atlas)
- npm أو yarn

## ⚙️ التثبيت والتشغيل

### 1. Clone المشروع
```bash
git clone <repository-url>
cd mobile-shop-backend
```

### 2. تثبيت المكتبات
```bash
npm install
```

### 3. إعداد ملف .env
أنشئ ملف `.env` في المجلد الرئيسي وأضف:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/mobile-shop
JWT_SECRET=your_secret_key_here
JWT_EXPIRE=7d
WHATSAPP_NUMBER=+201234567890
FRONTEND_URL=http://localhost:3000
```

### 4. تشغيل السيرفر
```bash
# Development mode
npm run dev

# Production mode
npm start
```

السيرفر سيعمل على: `http://localhost:5000`

## 📚 API Endpoints

### 🔐 Authentication (`/api/auth`)
- `POST /register` - تسجيل مستخدم جديد
- `POST /login` - تسجيل الدخول
- `GET /profile` - معلومات المستخدم (Protected)
- `PUT /profile` - تحديث البيانات (Protected)
- `POST /change-password` - تغيير كلمة المرور (Protected)

### 📦 Products (`/api/products`)
- `GET /` - كل المنتجات (مع فلترة وبحث)
- `GET /featured` - المنتجات المميزة
- `GET /:id` - منتج واحد
- `POST /` - إضافة منتج (Admin)
- `PUT /:id` - تحديث منتج (Admin)
- `DELETE /:id` - حذف منتج (Admin)

### 🏷️ Categories (`/api/categories`)
- `GET /` - كل الفئات
- `GET /:id` - فئة واحدة
- `POST /` - إضافة فئة (Admin)
- `PUT /:id` - تحديث فئة (Admin)
- `DELETE /:id` - حذف فئة (Admin)

### 🛒 Orders (`/api/orders`)
- `POST /` - إنشاء طلب (Protected)
- `GET /` - طلبات المستخدم (Protected)
- `GET /:id` - تفاصيل طلب (Protected)
- `PUT /:id/cancel` - إلغاء طلب (Protected)
- `GET /admin/all` - كل الطلبات (Admin)
- `PUT /:id/status` - تحديث حالة الطلب (Admin)

## 📝 أمثلة الاستخدام

### تسجيل مستخدم جديد
```bash
POST /api/auth/register
Content-Type: application/json

{
  "name": "Ahmed Ali",
  "email": "ahmed@example.com",
  "phone": "01012345678",
  "password": "123456"
}
```

### تسجيل الدخول
```bash
POST /api/auth/login
Content-Type: application/json

{
  "email": "ahmed@example.com",
  "password": "123456"
}
```

### إنشاء طلب
```bash
POST /api/orders
Authorization: Bearer <token>
Content-Type: application/json

{
  "products": [
    {
      "product": "product_id_here",
      "quantity": 1
    }
  ],
  "customerInfo": {
    "name": "Ahmed Ali",
    "phone": "01012345678",
    "address": "123 شارع الجامعة، القاهرة",
    "city": "القاهرة"
  }
}
```

## 🔒 Authentication

استخدم JWT Token في الـ Header:
```
Authorization: Bearer <your_jwt_token>
```

## 📁 هيكل المشروع

```
mobile-shop-backend/
├── src/
│   ├── config/          # إعدادات DB و Cloudinary
│   ├── models/          # MongoDB Models
│   ├── controllers/     # Business Logic
│   ├── routes/          # API Routes
│   ├── middleware/      # Auth & Upload
│   ├── validators/      # Input Validation
│   ├── services/        # WhatsApp Service
│   └── utils/           # Helper Functions
├── uploads/             # الصور المرفوعة
├── .env                 # Environment Variables
├── server.js            # Entry Point
└── package.json
```

## 🌐 Database Schema

### User
- name, email, phone, password
- role (customer/admin)
- address

### Product
- name, brand, description
- category, price, discountPrice
- stock, images
- specifications

### Category
- name, type, description
- image, order

### Order
- user, products[]
- totalAmount, status
- customerInfo
- orderNumber

## 🔐 Production Security Checklist

عند النشر على السيرفر:
- ✅ غيّر `JWT_SECRET` لقيمة عشوائية قوية
- ✅ استخدم HTTPS
- ✅ حدّد `FRONTEND_URL` في `.env` بدومين الـ Frontend الحقيقي
- ✅ غيّر `NODE_ENV` لـ `production`
- ✅ فعّل Rate Limiting المناسب
- ✅ راجع جميع المتغيرات في `.env`

## 🆕 التحسينات الأمنية (v1.1)

### Database Transactions
- استخدام Mongoose Transactions في عمليات الطلبات لضمان:
  - خصم المخزون والطلب يتمان معاً أو لا يتمان
  - عند إلغاء الطلب، المخزون يعود بأمان
  - لا فقدان للبيانات حتى لو حصل خطأ

### Atomic Order Numbers
- استخدام Counter Model لتوليد Order Numbers بشكل آمن
- حماية من Race Conditions عند إنشاء طلبات متزامنة
- كل طلب مضمون له رقم فريد

### CORS Configuration
- إعدادات CORS ديناميكية حسب البيئة
- في Development: قبول كل الطلبات
- في Production: قبول طلبات من الـ Frontend المحدد فقط

---

### MongoDB Atlas
1. أنشئ حساب على [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. أنشئ Cluster جديد
3. احصل على Connection String
4. استبدل `MONGODB_URI` في `.env`

### Deployment Platforms
- **Railway**: Easy deployment
- **Render**: Free tier available
- **Heroku**: Classic choice
- **DigitalOcean**: More control

## 📱 WhatsApp Integration

عند إنشاء طلب، يتم توليد رابط WhatsApp تلقائياً يحتوي على:
- رقم الطلب
- بيانات العميل
- المنتجات المطلوبة
- المبلغ الإجمالي
- العنوان

## 🔐 Admin Account

لإنشاء أول Admin، سجل مستخدم عادي ثم غير `role` في Database:
```javascript
db.users.updateOne(
  { email: "admin@example.com" },
  { $set: { role: "admin" } }
)
```

## 📊 Features Coming Soon

- [ ] نظام التقييمات للمنتجات
- [ ] Wishlist
- [ ] إشعارات Push
- [ ] GraphQL Support
- [ ] Admin Dashboard Frontend
- [ ] Email Notifications

## 🤝 المساهمة

المساهمات مرحب بها! افتح Issue أو Pull Request

## 📄 الترخيص

MIT License

## 📞 التواصل

لأي استفسارات أو مساعدة، تواصل معنا.

---

Made with ❤️ in Egypt