// services/emailService.js
const nodemailer = require('nodemailer');

// Create transporter for any SMTP provider
const createTransporter = () => {
  return nodemailer.createTransport({ // Fixed: createTransport (not createTransporter)
    host: process.env.MAILTRAP_HOST || 'smtp.mailtrap.io',
    port: process.env.MAILTRAP_PORT || 2525,
    auth: {
      user: process.env.MAILTRAP_USER,
      pass: process.env.MAILTRAP_PASS,
    },
  });
};

// Send OTP email
const sendOTPEmail = async (email, otp, firstName = 'User') => {
  try {
    const transporter = createTransporter();

    const htmlContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          .email-container {
            font-family: Arial, sans-serif;
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
          }
          .email-content {
            background-color: white;
            padding: 30px;
            border-radius: 10px;
            text-align: center;
          }
          .otp-code {
            font-size: 32px;
            font-weight: bold;
            color: #2563eb;
            letter-spacing: 5px;
            margin: 20px 0;
            padding: 15px;
            background-color: #f0f9ff;
            border-radius: 8px;
            border: 2px dashed #2563eb;
          }
          .footer {
            margin-top: 30px;
            font-size: 12px;
            color: #666;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="email-content">
            <h1 style="color: #333;">Email Verification</h1>
            <p>Hi ${firstName},</p>
            <p>Thank you for signing up with Urban Pilgrim! To complete your registration, please verify your email address.</p>
            
            <p>Your verification code is:</p>
            <div class="otp-code">${otp}</div>
            
            <p>This code will expire in 10 minutes.</p>
            <p>If you didn't create an account with us, please ignore this email.</p>
            
            <div class="footer">
              <p>Best regards,<br>Urban Pilgrim Team</p>
            </div>
          </div>
        </div>
      </body>
      </html>
    `;

    const mailOptions = {
      from: `"Urban Pilgrim" <${process.env.FROM_EMAIL || 'noreply@urbanpilgrim.com'}>`,
      to: email,
      subject: 'Verify Your Email Address - Urban Pilgrim',
      html: htmlContent,
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('OTP email sent successfully:', result.messageId);
    return result;

  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send verification email');
  }
};

// Send welcome email after verification
const sendWelcomeEmail = async (email, firstName) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"Urban Pilgrim" <${process.env.FROM_EMAIL || 'noreply@urbanpilgrim.com'}>`,
      to: email,
      subject: 'Welcome to Urban Pilgrim!',
      html: `
        <h1>Welcome ${firstName}!</h1>
        <p>Your email has been successfully verified. Welcome to Urban Pilgrim!</p>
        <p>You can now access all features of our platform.</p>
        <p>Best regards,<br>Urban Pilgrim Team</p>
      `,
    };

    await transporter.sendMail(mailOptions);
    console.log('Welcome email sent successfully');

  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error for welcome email failure
  }
};

module.exports = {
  sendOTPEmail,
  sendWelcomeEmail,
};