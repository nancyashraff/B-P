const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  }
});

const sendOTP = async (email, otp) => {
  await transporter.sendMail({
    from: `"B&P Beauty Shop" <${process.env.GMAIL_USER}>`,
    to: email,
    subject: 'Your OTP - B&P Beauty Shop',
    html: `
      <div style="font-family: sans-serif; max-width: 400px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">
        <h2 style="font-family: serif; color: #111;">B&P Beauty Shop</h2>
        <p style="color: #555;">Your verification code is:</p>
        <h1 style="letter-spacing: 8px; color: #c8a96e; font-size: 36px;">${otp}</h1>
        <p style="color: #999; font-size: 12px;">This code expires in 10 minutes.</p>
      </div>
    `
  });
};

const sendOrderNotification = async (order) => {
  const itemsList = order.items.map(i => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.scent || '-'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.price * i.quantity} L.E</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: `"B&P Beauty Shop" <${process.env.GMAIL_USER}>`,
    to: process.env.GMAIL_USER, // sends to yourself
    subject: `🛍️ New Order - ${order.email}`,
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">
        
        <h2 style="font-family: serif; color: #111; border-bottom: 2px solid #c8a96e; padding-bottom: 12px;">
          🛍️ New Order Received
        </h2>

        <h3 style="color: #555; margin-top: 24px;">Customer Info</h3>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; color: #888; width: 40%;">Email</td>
            <td style="padding: 8px; font-weight: bold;">${order.email}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #888;">Phone</td>
            <td style="padding: 8px; font-weight: bold;">${order.phone}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #888;">Governorate</td>
            <td style="padding: 8px;">${order.address.governorate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #888;">Street</td>
            <td style="padding: 8px;">${order.address.street}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #888;">Building</td>
            <td style="padding: 8px;">${order.address.building}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #888;">Apartment</td>
            <td style="padding: 8px;">${order.address.apartment}</td>
          </tr>
        </table>

        <h3 style="color: #555; margin-top: 24px;">Order Items</h3>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; text-align:left;">Product</th>
              <th style="padding: 8px; text-align:left;">Scent</th>
              <th style="padding: 8px; text-align:left;">Qty</th>
              <th style="padding: 8px; text-align:left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
            <span style="color:#888;">Subtotal </span>
            <span>${order.total} L.E</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 8px;">
            <span style="color:#888;">Shipping</span>
            <span>To be decided / هيتم التحديد</span>
          </div>
          <div style="display:flex; justify-content:space-between; font-size:18px; font-weight:bold; color:#c8a96e; border-top: 1px solid #eee; padding-top: 8px;">
            <span>Total </span>
            <span>${order.total} L.E</span>
          </div>
        </div>

        <p style="margin-top: 24px; color: #999; font-size: 12px;">
          Order ID: ${order._id} · ${new Date().toLocaleString()}
        </p>
      </div>
    `
  });
};

const sendOrderConfirmationToCustomer = async (order) => {
  const itemsList = order.items.map(i => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.name}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.scent || '-'}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.quantity}</td>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${i.price * i.quantity} L.E</td>
    </tr>
  `).join('');

  await transporter.sendMail({
    from: `"B&P Beauty Shop" <${process.env.GMAIL_USER}>`,
    to:   order.email,
    subject: '✨ Order Confirmed - B&P Beauty Shop',
    html: `
      <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto; padding: 32px; border: 1px solid #eee; border-radius: 12px;">

        <h2 style="font-family: serif; color: #111; border-bottom: 2px solid #c8a96e; padding-bottom: 12px;">
          ✨ Thank You for Your Order!
        </h2>

        <p style="color: #555; margin-top: 16px;">
          Hi! Your order has been confirmed and is being prepared. Here's a summary of what you ordered:
        </p>

        <h3 style="color: #555; margin-top: 24px;">Delivery Address</h3>
        <table style="width:100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px; color: #888; width: 40%;">Governorate</td>
            <td style="padding: 8px;">${order.address.governorate}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #888;">Street</td>
            <td style="padding: 8px;">${order.address.street}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #888;">Building</td>
            <td style="padding: 8px;">${order.address.building}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #888;">Apartment</td>
            <td style="padding: 8px;">${order.address.apartment}</td>
          </tr>
          <tr>
            <td style="padding: 8px; color: #888;">Phone</td>
            <td style="padding: 8px;">${order.phone}</td>
          </tr>
        </table>

        <h3 style="color: #555; margin-top: 24px;">Order Items</h3>
        <table style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f5f5f5;">
              <th style="padding: 8px; text-align:left;">Product</th>
              <th style="padding: 8px; text-align:left;">Scent</th>
              <th style="padding: 8px; text-align:left;">Qty</th>
              <th style="padding: 8px; text-align:left;">Price</th>
            </tr>
          </thead>
          <tbody>
            ${itemsList}
          </tbody>
        </table>

        <table style="width:100%; border-top: 1px solid #eee; margin-top: 16px; padding-top: 8px;">
          <tr>
            <td style="color:#888; padding: 6px 0;">Subtotal</td>
            <td style="text-align:right; padding: 6px 0;">${order.total} L.E</td>
          </tr>
          <tr>
            <td style="color:#888; padding: 6px 0;">Shipping</td>
            <td style="text-align:right; padding: 6px 0;">To be decided / هيتم التحديد</td>
          </tr>
          <tr>
            <td style="font-size:18px; font-weight:bold; color:#c8a96e; padding: 10px 0;">Total</td>
            <td style="font-size:18px; font-weight:bold; color:#c8a96e; text-align:right; padding: 10px 0;">${order.total} L.E</td>
          </tr>
        </table>

        <div style="margin-top: 24px; padding: 16px; background: #f9f9f9; border-radius: 8px; text-align: center;">
          <p style="color: #555; font-size: 14px;">Payment Method: <strong>Cash on Delivery</strong></p>
          <p style="color: #999; font-size: 12px; margin-top: 8px;">
            If you have any questions, feel free to reach out to us on Instagram.
          </p>
        </div>

        <p style="margin-top: 24px; color: #999; font-size: 12px; text-align: center;">
          Order ID: ${order._id} · ${new Date().toLocaleString()}
        </p>

      </div>
    `
  });
};

module.exports = { sendOTP, sendOrderNotification, sendOrderConfirmationToCustomer };