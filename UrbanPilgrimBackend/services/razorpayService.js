// services/razorpayService.js
const Razorpay = require('razorpay');

// Initialize Razorpay only if credentials are available
let razorpay = null;

if (process.env.RAZORPAY_KEY_ID && process.env.RAZORPAY_KEY_SECRET) {
  razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
  });
} else {
  console.warn('⚠️  Razorpay credentials not found. Payment functionality will be disabled.');
  console.warn('   Add RAZORPAY_KEY_ID and RAZORPAY_KEY_SECRET to your .env file');
}

class RazorpayService {
  
  // Check if Razorpay is properly configured
  static isConfigured() {
    return razorpay !== null;
  }

  // Create order for any booking type
  static async createOrder(orderData) {
    if (!this.isConfigured()) {
      // Return mock order for development
      console.log('🔧 Development Mode: Creating mock Razorpay order');
      return {
        id: `order_dev_${Date.now()}`,
        amount: orderData.amount * 100,
        currency: orderData.currency || 'INR',
        status: 'created',
        paymentUrl: `https://checkout.razorpay.com/v1/checkout.js?order_id=order_dev_${Date.now()}`,
        notes: orderData
      };
    }

    const options = {
      amount: orderData.amount * 100, // Convert to paise
      currency: orderData.currency || 'INR',
      notes: {
        bookingId: orderData.bookingId,
        requestId: orderData.requestId,
        customerEmail: orderData.customerEmail,
        customerName: orderData.customerName,
        description: orderData.description
      },
      payment_capture: 1 // Auto capture
    };
    
    const order = await razorpay.orders.create(options);
    
    // Add payment URL for redirect
    order.paymentUrl = `https://checkout.razorpay.com/v1/checkout.js?order_id=${order.id}`;
    
    return order;
  }
  
  // Verify payment signature
  static verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature) {
    if (!this.isConfigured()) {
      // Always return true in development mode
      console.log('🔧 Development Mode: Skipping payment signature verification');
      return true;
    }

    const crypto = require('crypto');
    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex');
    
    return expectedSignature === razorpaySignature;
  }
  
  // Process refund
  static async processRefund(refundData) {
    if (!this.isConfigured()) {
      // Return mock refund for development
      console.log('🔧 Development Mode: Creating mock refund');
      return {
        id: `rfnd_dev_${Date.now()}`,
        payment_id: refundData.paymentId,
        amount: refundData.amount * 100,
        status: 'processed',
        notes: refundData.notes || {}
      };
    }

    return await razorpay.payments.refund(refundData.paymentId, {
      amount: refundData.amount * 100, // Convert to paise
      notes: refundData.notes || {}
    });
  }
  
  // Fetch payment details
  static async getPaymentDetails(paymentId) {
    if (!this.isConfigured()) {
      // Return mock payment details for development
      console.log('🔧 Development Mode: Returning mock payment details');
      return {
        id: paymentId,
        amount: 100000, // 1000 INR in paise
        currency: 'INR',
        status: 'captured',
        method: 'card',
        created_at: Math.floor(Date.now() / 1000)
      };
    }

    return await razorpay.payments.fetch(paymentId);
  }

  // Generate webhook signature for testing
  static generateWebhookSignature(payload, secret) {
    if (!secret) {
      secret = process.env.RAZORPAY_WEBHOOK_SECRET || 'test_webhook_secret';
    }
    
    const crypto = require('crypto');
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }
}

module.exports = RazorpayService;