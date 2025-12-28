const errorHandler = (err, req, res, next) => {
    // نسخة من الخطأ للتعديل عليها
    let error = { ...err };
    error.message = err.message;

    // طباعة الخطأ في الكونسول للمطور (اختياري)
    // console.error(err);

    // 1. Mongoose Bad ObjectId (CastError)
    // بيحصل لما حد يبعت ID غلط في الرابط (مثلاً /api/orders/123)
    if (err.name === 'CastError') {
        const message = `Resource not found. Invalid ID: ${err.value}`;
        error = { statusCode: 404, message };
    }

    // 2. Mongoose Duplicate Key (Code 11000)
    // بيحصل لو حاولت تكرر قيمة فريدة (زي الإيميل أو رقم الطلب)
    if (err.code === 11000) {
        const message = 'Duplicate field value entered';
        error = { statusCode: 400, message };
    }

    // 3. Mongoose Validation Error
    // بيحصل لو بعت بيانات ناقصة أو غلط حسب الـ Schema
    if (err.name === 'ValidationError') {
        const message = Object.values(err.errors).map(val => val.message);
        error = { statusCode: 400, message };
    }

    // تحديد كود الحالة (Status Code)
    // لو الرد كان لسه 200 (نجاح) رغم وجود خطأ، نخليه 500 (خطأ سيرفر)
    // غير كده بناخد كود الخطأ المحدد (زي 404 اللي جاي من ملف server.js)
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // استخدام statusCode من الخطأ المعدل إذا وجد، أو الكود المحسوب
    const finalStatusCode = error.statusCode || statusCode;

    res.status(finalStatusCode).json({
        success: false,
        message: error.message || 'Server Error',
        // عرض تفاصيل الخطأ (Stack Trace) فقط في وضع التطوير
        ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
};

module.exports = errorHandler;