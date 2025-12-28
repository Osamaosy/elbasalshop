const { body, validationResult } = require('express-validator');

const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, errors: errors.array() });
  }
  next();
};

const createOrderValidation = [
  body('products').isArray({ min: 1 }).withMessage('Order must contain at least one product'),
  body('products.*.product').isMongoId().withMessage('Invalid product ID'),
  body('products.*.quantity').isInt({ min: 1 }).withMessage('Quantity must be at least 1'),
  body('customerInfo.name').notEmpty().withMessage('Customer name is required'),
  body('customerInfo.phone').matches(/^(\+201|01)[0-2,5]{1}[0-9]{8}$/).withMessage('Invalid phone number'),
  body('customerInfo.address').notEmpty().withMessage('Address is required'),
  validate
];

module.exports = { createOrderValidation };