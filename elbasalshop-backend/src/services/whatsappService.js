// WhatsApp Service - Generate WhatsApp message link

const generateWhatsAppLink = (order) => {
  const shopNumber = process.env.WHATSAPP_NUMBER || '+201234567890';
  
  // Format product list
  const productsList = order.products.map((item, index) => 
    `${index + 1}. ${item.name} - الكمية: ${item.quantity} - السعر: ${item.price} جنيه`
  ).join('\n');
  
  // Create message
  const message = `
🛍️ *طلب جديد من المتجر*

📋 *رقم الطلب:* ${order.orderNumber}

👤 *بيانات العميل:*
الاسم: ${order.customerInfo.name}
التليفون: ${order.customerInfo.phone}
${order.customerInfo.email ? `البريد: ${order.customerInfo.email}` : ''}

📦 *المنتجات:*
${productsList}

💰 *المبلغ الإجمالي:* ${order.totalAmount} جنيه

📍 *العنوان:*
${order.customerInfo.address}
${order.customerInfo.city ? `المدينة: ${order.customerInfo.city}` : ''}

${order.customerInfo.notes ? `📝 *ملاحظات العميل:*\n${order.customerInfo.notes}` : ''}

⏰ *تاريخ الطلب:* ${new Date(order.createdAt).toLocaleString('ar-EG')}
  `.trim();
  
  // Generate WhatsApp link
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${shopNumber.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  
  return whatsappLink;
};

// Generate customer notification link
const generateCustomerWhatsAppLink = (order, customerPhone) => {
  const message = `
🎉 *شكراً لطلبك من متجرنا!*

📋 *رقم طلبك:* ${order.orderNumber}

✅ تم استلام طلبك بنجاح وجاري المراجعة.
سيتم التواصل معك قريباً لتأكيد الطلب.

💰 *المبلغ الإجمالي:* ${order.totalAmount} جنيه

يمكنك التواصل معنا في أي وقت على نفس هذا الرقم.
  `.trim();
  
  const encodedMessage = encodeURIComponent(message);
  const whatsappLink = `https://wa.me/${customerPhone.replace(/[^0-9]/g, '')}?text=${encodedMessage}`;
  
  return whatsappLink;
};

module.exports = {
  generateWhatsAppLink,
  generateCustomerWhatsAppLink
};