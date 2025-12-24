// =======================
// FIREBASE CLOUD FUNCTIONS
// =======================
// Email notifications for orders

const functions = require("firebase-functions");
const admin = require("firebase-admin");
const nodemailer = require("nodemailer");

admin.initializeApp();

// Configure email transporter
// TODO: Replace with your email service configuration
// Options: Gmail, SendGrid, Mailgun, etc.
const transporter = nodemailer.createTransport({
  service: "gmail", // Change to your email service
  auth: {
    user: functions.config().email.user, // Set with: firebase functions:config:set email.user="your-email@gmail.com"
    pass: functions.config().email.password, // Set with: firebase functions:config:set email.password="your-app-password"
  },
});

// Alternative: Use SendGrid
// const sgMail = require('@sendgrid/mail');
// sgMail.setApiKey(functions.config().sendgrid.key);

// Send order confirmation email when order is created
exports.sendOrderConfirmation = functions.firestore
  .document("orders/{orderId}")
  .onCreate(async (snap, context) => {
    const order = snap.data();
    const orderId = context.params.orderId;

    // Only send if order has customer email
    if (!order.customerEmail) {
      console.log("No email address for order", orderId);
      return null;
    }

    try {
      // Get order details
      const itemsList = order.cartItems
        .map((item) => `- ${item.name}: ₹${item.price}`)
        .join("\n");

      const filesList =
        order.uploadedFiles && order.uploadedFiles.length > 0
          ? `\n\nUploaded Files:\n${order.uploadedFiles
              .map((f) => `- ${f.fileName}`)
              .join("\n")}`
          : "";

      const mailOptions = {
        from: "PrintAhead <noreply@printahead.com>", // TODO: Update with your email
        to: order.customerEmail,
        subject: `Order Confirmed - PrintAhead #${orderId.slice(0, 8)}`,
        html: `
          <!DOCTYPE html>
          <html>
            <head>
              <style>
                body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                .header { background: linear-gradient(135deg, #60a5fa, #2563eb); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                .order-details { background: white; padding: 15px; margin: 15px 0; border-radius: 8px; }
                .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
                .btn { display: inline-block; padding: 12px 24px; background: #2563eb; color: white; text-decoration: none; border-radius: 8px; margin-top: 10px; }
              </style>
            </head>
            <body>
              <div class="container">
                <div class="header">
                  <h1>Order Confirmed!</h1>
                  <p>Your order has been received and is being processed.</p>
                </div>
                <div class="content">
                  <p>Hello ${order.customerName},</p>
                  <p>Thank you for your order! We've received your request and will notify you once it's ready for pickup.</p>
                  
                  <div class="order-details">
                    <h3>Order Details</h3>
                    <p><strong>Order ID:</strong> ${orderId.slice(0, 8)}</p>
                    <p><strong>Pickup Date:</strong> ${order.pickupDate}</p>
                    <p><strong>Pickup Time:</strong> ${order.pickupTime}</p>
                    <p><strong>Total Amount:</strong> ₹${order.total}</p>
                    <p><strong>Payment Method:</strong> ${
                      order.paymentMethod === "credits"
                        ? "Print Credits"
                        : "Cash on Pickup"
                    }</p>
                    
                    <h4>Items:</h4>
                    <pre style="white-space: pre-wrap; font-family: inherit;">${itemsList}${filesList}</pre>
                    
                    ${
                      order.notes
                        ? `<p><strong>Notes:</strong> ${order.notes}</p>`
                        : ""
                    }
                  </div>
                  
                  <p>We'll send you another email when your order is ready for pickup.</p>
                  <p>If you have any questions, please contact us.</p>
                </div>
                <div class="footer">
                  <p>PrintAhead - Campus Stationery & Xerox</p>
                </div>
              </div>
            </body>
          </html>
        `,
        text: `
          Order Confirmed - PrintAhead #${orderId.slice(0, 8)}
          
          Hello ${order.customerName},
          
          Thank you for your order! We've received your request and will notify you once it's ready for pickup.
          
          Order Details:
          Order ID: ${orderId.slice(0, 8)}
          Pickup Date: ${order.pickupDate}
          Pickup Time: ${order.pickupTime}
          Total Amount: ₹${order.total}
          Payment Method: ${
            order.paymentMethod === "credits"
              ? "Print Credits"
              : "Cash on Pickup"
          }
          
          Items:
          ${itemsList}${filesList}
          
          ${order.notes ? `Notes: ${order.notes}` : ""}
          
          We'll send you another email when your order is ready for pickup.
        `,
      };

      await transporter.sendMail(mailOptions);
      console.log("Order confirmation email sent to", order.customerEmail);
      return null;
    } catch (error) {
      console.error("Error sending order confirmation email:", error);
      return null;
    }
  });

// Send order ready email when order status changes to 'ready'
exports.sendOrderReady = functions.firestore
  .document("orders/{orderId}")
  .onUpdate(async (change, context) => {
    const before = change.before.data();
    const after = change.after.data();
    const orderId = context.params.orderId;

    // Only send if status changed to 'ready'
    if (before.status !== "ready" && after.status === "ready") {
      // Only send if order has customer email
      if (!after.customerEmail) {
        console.log("No email address for order", orderId);
        return null;
      }

      try {
        const mailOptions = {
          from: "PrintAhead <noreply@printahead.com>", // TODO: Update with your email
          to: after.customerEmail,
          subject: `Your Order is Ready - PrintAhead #${orderId.slice(0, 8)}`,
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <style>
                  body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
                  .container { max-width: 600px; margin: 0 auto; padding: 20px; }
                  .header { background: linear-gradient(135deg, #34d399, #10b981); color: white; padding: 20px; border-radius: 8px 8px 0 0; }
                  .content { background: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
                  .footer { text-align: center; padding: 20px; color: #9ca3af; font-size: 12px; }
                  .btn { display: inline-block; padding: 12px 24px; background: #10b981; color: white; text-decoration: none; border-radius: 8px; margin-top: 10px; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="header">
                    <h1>🎉 Your Order is Ready!</h1>
                    <p>Come pick it up at your scheduled time.</p>
                  </div>
                  <div class="content">
                    <p>Hello ${after.customerName},</p>
                    <p>Great news! Your order is ready for pickup.</p>
                    
                    <p><strong>Pickup Details:</strong></p>
                    <ul>
                      <li><strong>Date:</strong> ${after.pickupDate}</li>
                      <li><strong>Time:</strong> ${after.pickupTime}</li>
                      <li><strong>Order ID:</strong> ${orderId.slice(0, 8)}</li>
                      <li><strong>Total:</strong> ₹${after.total}</li>
                    </ul>
                    
                    <p>Please come to our store during the scheduled pickup time. Don't forget to bring your order confirmation or order ID.</p>
                    
                    <p>We look forward to serving you!</p>
                  </div>
                  <div class="footer">
                    <p>PrintAhead - Campus Stationery & Xerox</p>
                  </div>
                </div>
              </body>
            </html>
          `,
          text: `
            Your Order is Ready - PrintAhead #${orderId.slice(0, 8)}
            
            Hello ${after.customerName},
            
            Great news! Your order is ready for pickup.
            
            Pickup Details:
            Date: ${after.pickupDate}
            Time: ${after.pickupTime}
            Order ID: ${orderId.slice(0, 8)}
            Total: ₹${after.total}
            
            Please come to our store during the scheduled pickup time. Don't forget to bring your order confirmation or order ID.
            
            We look forward to serving you!
          `,
        };

        await transporter.sendMail(mailOptions);
        console.log("Order ready email sent to", after.customerEmail);
        return null;
      } catch (error) {
        console.error("Error sending order ready email:", error);
        return null;
      }
    }

    return null;
  });
