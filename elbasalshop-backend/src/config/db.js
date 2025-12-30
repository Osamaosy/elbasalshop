const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    
    // Handle connection events
    mongoose.connection.on('error', (err) => {
      console.error(`❌ MongoDB connection error: ${err}`);
    });
    
    mongoose.connection.on('disconnected', () => {
      console.log('⚠️  MongoDB disconnected');
      // محاولة إعادة الاتصال عند الانقطاع المفاجئ
      setTimeout(connectDB, 5000);
    });
    
  } catch (error) {
    console.error(`❌ Error connecting to MongoDB: ${error.message}`);
    // بدلاً من قتل السيرفر، نحاول الاتصال مرة أخرى بعد 5 ثواني
    console.log('🔄 Retrying connection in 5 seconds...');
    setTimeout(connectDB, 5000); 
    // حذفنا process.exit(1) لمنع الانهيار
  }
};

module.exports = connectDB;