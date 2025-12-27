// src/services/whatsappService.js

const generateWhatsAppLink = (order) => {
  // رقم الأدمن (صاحب المتجر) - استبدله برقمك الحقيقي
  const adminPhone = '201010392256'; // ضع رقمك هنا (مصر: 20xxxx)

  let message = `🆕 *طلب جديد من المتجر* 🆕\n`;
  message += `------------------------\n`;
  message += `👤 *العميل:* ${order.customerInfo.name}\n`;
  message += `📱 *رقم الهاتف:* ${order.customerInfo.phone}\n`;
  message += `📍 *العنوان:* ${order.customerInfo.address}\n`;
  message += `------------------------\n`;
  message += `🛒 *المنتجات:*\n`;

  order.products.forEach((item) => {
    message += `▫️ ${item.name} (x${item.quantity})\n`;
  });

  message += `------------------------\n`;
  message += `💰 *الإجمالي:* ${order.totalAmount} ج.م\n`;
  
  if (order.notes) {
    message += `📝 *ملاحظات:* ${order.notes}\n`;
  }

  // ترميز الرسالة للرابط
  const encodedMessage = encodeURIComponent(message);
  
  // رابط واتساب مباشر
  return `https://wa.me/${adminPhone}?text=${encodedMessage}`;
};

module.exports = { generateWhatsAppLink };