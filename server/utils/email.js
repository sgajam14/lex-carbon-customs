const nodemailer = require('nodemailer');

const createTransport = () => nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

exports.sendOrderConfirmation = async (order) => {
  const transport = createTransport();
  const email = order.user?.email || order.guestEmail;
  if (!email) return;

  const itemsHtml = order.items.map(item =>
    `<tr><td>${item.name}</td><td>x${item.qty}</td><td>$${(item.price * item.qty).toFixed(2)}</td></tr>`
  ).join('');

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Order Confirmed — ${order.orderNumber} | Lex's Carbon Customs`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">LEX'S CARBON CUSTOMS</h1>
        </div>
        <div style="padding: 30px; background: #1a1a1a; color: #fff;">
          <h2>Order Confirmed!</h2>
          <p>Order #: <strong>${order.orderNumber}</strong></p>
          <table style="width:100%; border-collapse:collapse;">
            <thead><tr style="background:#333"><th>Item</th><th>Qty</th><th>Price</th></tr></thead>
            <tbody>${itemsHtml}</tbody>
          </table>
          <div style="margin-top:20px; border-top: 1px solid #444; padding-top: 20px;">
            <p>Subtotal: $${order.subtotal.toFixed(2)}</p>
            <p>Shipping: $${order.shippingCost.toFixed(2)}</p>
            <p>Tax: $${order.tax.toFixed(2)}</p>
            <h3>Total: $${order.total.toFixed(2)}</h3>
          </div>
          <p style="margin-top:20px; color:#999;">We'll notify you when your order ships. Carbon fiber parts are hand-crafted and may have a lead time of ${order.items[0]?.leadTime || '2-4 weeks'}.</p>
        </div>
      </div>
    `,
  });
};

exports.sendShippingNotification = async (order) => {
  const transport = createTransport();
  const email = order.user?.email || order.guestEmail;
  if (!email) return;

  await transport.sendMail({
    from: process.env.EMAIL_FROM,
    to: email,
    subject: `Your Order Has Shipped — ${order.orderNumber}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #DC2626; padding: 20px; text-align: center;">
          <h1 style="color: white; margin: 0;">LEX'S CARBON CUSTOMS</h1>
        </div>
        <div style="padding: 30px; background: #1a1a1a; color: #fff;">
          <h2>Your order is on its way!</h2>
          <p>Order #: <strong>${order.orderNumber}</strong></p>
          ${order.trackingNumber ? `<p>Tracking: <strong>${order.carrier} ${order.trackingNumber}</strong></p>` : ''}
          ${order.trackingUrl ? `<a href="${order.trackingUrl}" style="background:#DC2626; color:white; padding:10px 20px; text-decoration:none; border-radius:4px;">Track Your Package</a>` : ''}
          ${order.estimatedDelivery ? `<p>Estimated Delivery: <strong>${new Date(order.estimatedDelivery).toLocaleDateString()}</strong></p>` : ''}
        </div>
      </div>
    `,
  });
};
