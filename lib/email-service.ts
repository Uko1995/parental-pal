import nodemailer from "nodemailer";

// Create transporter function to handle different environments
function createEmailTransporter() {
  // Check if we have EMAIL_USER and EMAIL_PASSWORD for Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Alternative SMTP configuration
  if (
    process.env.SMTP_HOST &&
    process.env.SMTP_USER &&
    process.env.SMTP_PASSWORD
  ) {
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: process.env.SMTP_PORT === "465", // true for 465, false for other ports
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });
  }

  // Fallback for development/testing (logs emails instead of sending)
  return nodemailer.createTransport({
    streamTransport: true,
    newline: "unix",
    buffer: true,
  });
}

// Create reusable transporter object
const transporter = createEmailTransporter();

// Verify connection configuration only if not in test mode
if (process.env.EMAIL_USER || process.env.SMTP_HOST) {
  transporter.verify(function (error: Error | null) {
    if (error) {
      console.log("Email transporter verification failed:", error);
    } else {
      console.log("Email server is ready to take our messages");
    }
  });
}

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

export interface BookingDetails {
  _id?: string;
  serviceType?: string;
  schedule?: {
    startDate?: string;
  };
  children?: Array<{ name: string; age: number }>;
  status?: string;
  pricing?: {
    totalAmount?: number;
    currency?: string;
  };
}

export interface PaymentDetails {
  transactionId?: string;
  amount?: number;
  currency?: string;
  method?: string;
  serviceType?: string;
}

export async function sendEmail({ to, subject, html, text }: EmailOptions) {
  try {
    // Skip sending emails if no email configuration is provided (development mode)
    if (!process.env.EMAIL_USER && !process.env.SMTP_HOST) {
      console.log("📧 Email (Development Mode):", { to, subject });
      console.log("📧 Email content:", text || "HTML content provided");
      return { success: true, messageId: "dev-mode-" + Date.now() };
    }

    const mailOptions = {
      from: `"ParentalPal" <${
        process.env.EMAIL_USER ||
        process.env.SMTP_USER ||
        "noreply@parentalpal.com"
      }>`,
      to,
      subject,
      html,
      text: text || "", // fallback to empty string if no text provided
    };

    const result = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent successfully:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("❌ Error sending email:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

// Email Templates
export const emailTemplates = {
  // Welcome email for new user registration
  welcome: (userName: string) => ({
    subject: "Welcome to ParentalPal - Your Journey Begins!",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Welcome to ParentalPal</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #90AC19, #E8931A); padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 20px; }
          .welcome-text { font-size: 18px; color: #333; margin-bottom: 20px; }
          .features { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { margin: 15px 0; padding-left: 20px; position: relative; }
          .feature-item:before { content: "✓"; position: absolute; left: 0; color: #90AC19; font-weight: bold; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #90AC19, #E8931A); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>🎉 Welcome to ParentalPal!</h1>
          </div>
          <div class="content">
            <p class="welcome-text">Hello ${userName},</p>
            <p>Thank you for joining ParentalPal! We're excited to help you find the perfect childcare solutions for your family.</p>
            
            <div class="features">
              <h3 style="color: #90AC19; margin-top: 0;">What you can do with ParentalPal:</h3>
              <div class="feature-item">Book qualified tutors for academic support</div>
              <div class="feature-item">Find reliable childcare services</div>
              <div class="feature-item">Discover fun holiday camps and activities</div>
              <div class="feature-item">Access homeschooling resources</div>
              <div class="feature-item">Book event spaces and entertainment</div>
            </div>

            <p>Ready to get started? Browse our services and make your first booking!</p>
            
            <center>
              <a href={'${process.env.NEXTAUTH_URL}/services'} class="cta-button">Explore Services</a>
            </center>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              If you have any questions, feel free to contact our support team. We're here to help!
            </p>
          </div>
          <div class="footer">
            <p>© 2024 ParentalPal. All rights reserved.</p>
            <p>Email: ${process.env.EMAIL_USER} | Website: {'${process.env.NEXTAUTH_URL}/services'}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to ParentalPal, ${userName}! Thank you for joining us. Visit {'${process.env.NEXTAUTH_URL}/services' || "http://localhost:3000/services"} to get started.`,
  }),

  // Booking confirmation email
  bookingConfirmation: (userName: string, bookingDetails: BookingDetails) => ({
    subject: `Booking Confirmation - ${bookingDetails.serviceType} Service`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Booking Confirmation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #90AC19, #E8931A); padding: 30px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .booking-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #333; }
          .detail-value { color: #666; }
          .total-amount { background-color: #90AC19; color: white; padding: 15px; border-radius: 8px; text-align: center; margin: 20px 0; font-size: 18px; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> Booking Confirmed!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            <p>Great news! Your booking has been confirmed. Here are the details:</p>
            
            <div class="booking-details">
              <div class="detail-row">
                <span class="detail-label">Booking ID:</span>
                <span class="detail-value">#${
                  bookingDetails._id || "N/A"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service Type:</span>
                <span class="detail-value">${
                  bookingDetails.serviceType || "N/A"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Start Date:</span>
                <span class="detail-value">${
                  bookingDetails.schedule?.startDate
                    ? new Date(
                        bookingDetails.schedule.startDate
                      ).toLocaleDateString()
                    : "N/A"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Children:</span>
                <span class="detail-value">${
                  bookingDetails.children?.length || 0
                } child(ren)</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status:</span>
                <span class="detail-value">${
                  bookingDetails.status || "Pending"
                }</span>
              </div>
            </div>

            <div class="total-amount">
              Total Amount: ${bookingDetails.pricing?.currency || "₦"}${
      bookingDetails.pricing?.totalAmount?.toLocaleString() || "0"
    }
            </div>

            <p>You can proceed to make payments..</p>
            <p>We'll be in touch soon to finalize the arrangements. If you have any questions, please don't hesitate to contact us.</p>
          </div>
          <div class="footer">
            <p>© 2024 ParentalPal. All rights reserved.</p>
            <p>Need help? Contact us at ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Booking confirmed for ${userName}! Service: ${
      bookingDetails.serviceType
    }, Total: ${bookingDetails.pricing?.currency || "₦"}${
      bookingDetails.pricing?.totalAmount?.toLocaleString() || "0"
    }. Booking ID: #${bookingDetails._id || "N/A"}`,
  }),

  // Payment confirmation email
  paymentConfirmation: (userName: string, paymentDetails: PaymentDetails) => ({
    subject: `Payment Received - ${paymentDetails.serviceType} Service`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Confirmation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #90AC19, #E8931A); padding: 30px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .payment-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .detail-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .detail-label { font-weight: bold; color: #333; }
          .detail-value { color: #666; }
          .success-badge { background-color: #22c55e; color: white; padding: 10px 20px; border-radius: 20px; display: inline-block; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>💳 Payment Received!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            
            <div class="success-badge">✅ Payment Successful</div>
            
            <p>We've successfully received your payment. Here are the transaction details:</p>
            
            <div class="payment-details">
              <div class="detail-row">
                <span class="detail-label">Transaction ID:</span>
                <span class="detail-value">${
                  paymentDetails.transactionId || "N/A"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Paid:</span>
                <span class="detail-value">${paymentDetails.currency || "₦"}${
      paymentDetails.amount?.toLocaleString() || "0"
    }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method:</span>
                <span class="detail-value">${
                  paymentDetails.method || "Online Payment"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service:</span>
                <span class="detail-value">${
                  paymentDetails.serviceType || "N/A"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Date:</span>
                <span class="detail-value">${new Date().toLocaleDateString()}</span>
              </div>
            </div>

            <p>Your service is now fully confirmed and we'll proceed with the arrangements as scheduled.</p>
            
            <p>Thank you for choosing ParentalPal!</p>
          </div>
          <div class="footer">
            <p>© 2024 ParentalPal. All rights reserved.</p>
            <p>Questions? Contact us at ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Payment received! Amount: ${paymentDetails.currency || "₦"}${
      paymentDetails.amount?.toLocaleString() || "0"
    }, Transaction ID: ${paymentDetails.transactionId || "N/A"}, Service: ${
      paymentDetails.serviceType || "N/A"
    }`,
  }),

  // Product order confirmation email
  productOrderConfirmation: (
    customerName: string,
    orderDetails: {
      orderNumber: string;
      productTitle: string;
      productThumbnail: string;
      orderType: "softcopy" | "paperback";
      totalAmount: number;
      currency: string;
      delivery?: {
        address: string;
        city: string;
        state: string;
        estimatedDeliveryDate?: Date;
      };
    }
  ) => ({
    subject: `Order Confirmation - ${orderDetails.productTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Order Confirmation</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #90AC19, #E8931A); padding: 30px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .order-details { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .product-info { display: flex; gap: 15px; margin-bottom: 20px; padding-bottom: 20px; border-bottom: 2px solid #90AC19; }
          .product-img { width: 100px; height: 140px; object-fit: cover; border-radius: 8px; }
          .detail-row { padding: 10px 0; border-bottom: 1px solid #ddd; }
          .detail-label { font-weight: bold; color: #333; }
          .detail-value { color: #666; }
          .total { font-size: 20px; font-weight: bold; color: #90AC19; padding: 15px 0; }
          .cta-button { display: inline-block; background: linear-gradient(135deg, #90AC19, #E8931A); color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>✅ Order Confirmed!</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333;">Hello ${customerName},</p>
            <p>Thank you for your order! We've received your payment and your order is being processed.</p>
            
            <div class="order-details">
              <h3 style="color: #90AC19; margin-top: 0;">Order Details</h3>
              <div class="product-info">
                <img src="${orderDetails.productThumbnail}" alt="${
      orderDetails.productTitle
    }" class="product-img" />
                <div>
                  <h4 style="margin: 0 0 10px 0; color: #333;">${
                    orderDetails.productTitle
                  }</h4>
                  <p style="margin: 5px 0; color: #666;">Order #: ${
                    orderDetails.orderNumber
                  }</p>
                  <p style="margin: 5px 0; color: #666;">Format: ${
                    orderDetails.orderType === "softcopy"
                      ? "Digital PDF"
                      : "Paperback"
                  }</p>
                </div>
              </div>
              
              <div class="detail-row">
                <span class="detail-label">Order Type:</span>
                <span class="detail-value">${
                  orderDetails.orderType === "softcopy"
                    ? "Softcopy (PDF)"
                    : "Paperback (Physical Book)"
                }</span>
              </div>
              
              ${
                orderDetails.delivery
                  ? `
              <div class="detail-row">
                <span class="detail-label">Delivery Address:</span>
                <span class="detail-value">${orderDetails.delivery.address}, ${
                      orderDetails.delivery.city
                    }, ${orderDetails.delivery.state}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Estimated Delivery:</span>
                <span class="detail-value">${orderDetails.delivery.estimatedDeliveryDate?.toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}</span>
              </div>
              `
                  : ""
              }
              
              <div class="total">
                Total Paid: ${
                  orderDetails.currency
                } ${orderDetails.totalAmount.toLocaleString()}
              </div>
            </div>

            ${
              orderDetails.orderType === "softcopy"
                ? `
            <p style="color: #90AC19; font-weight: bold;">📧 Your download link will be sent to you shortly in a separate email.</p>
            `
                : `
            <p style="color: #90AC19; font-weight: bold;">📦 Your book will be delivered within 2 business days.</p>
            <p>You'll receive a shipping notification with tracking details once your order is dispatched.</p>
            `
            }

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              If you have any questions about your order, please contact our support team.
            </p>
          </div>
          <div class="footer">
            <p>© 2024 ParentalPal. All rights reserved.</p>
            <p>Email: ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Order Confirmation - ${orderDetails.productTitle}. Order #${
      orderDetails.orderNumber
    }. Total: ${
      orderDetails.currency
    } ${orderDetails.totalAmount.toLocaleString()}. ${
      orderDetails.orderType === "softcopy"
        ? "Download link will be sent shortly."
        : "Delivery within 2 business days."
    }`,
  }),

  // Download link email
  downloadLinkEmail: (
    customerName: string,
    productDetails: {
      productTitle: string;
      productThumbnail: string;
      orderNumber: string;
      downloadUrl: string;
      expiryDate: Date;
      maxDownloads: number;
    }
  ) => ({
    subject: `Your Download Link - ${productDetails.productTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Download Your Book</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header { background: linear-gradient(135deg, #90AC19, #E8931A); padding: 30px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .download-box { background: linear-gradient(135deg, #90AC19, #E8931A); padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0; }
          .download-button { display: inline-block; background: white; color: #90AC19; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 18px; margin: 10px 0; }
          .info-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📚 Your Book is Ready!</h1>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333;">Hello ${customerName},</p>
            <p>Your purchase of <strong>${
              productDetails.productTitle
            }</strong> (Order #${productDetails.orderNumber}) is complete!</p>
            
            <div class="download-box">
              <h2 style="color: white; margin: 0 0 10px 0;">Click below to download your book</h2>
              <a href="${
                productDetails.downloadUrl
              }" class="download-button">Download PDF</a>
            </div>

            <div class="info-box">
              <strong>⚠️ Important Information:</strong>
              <ul style="margin: 10px 0; padding-left: 20px;">
                <li>This link will expire on ${productDetails.expiryDate.toLocaleDateString(
                  "en-US",
                  {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}</li>
                <li>You can download this file up to ${
                  productDetails.maxDownloads
                } times</li>
                <li>Save the PDF to your device for offline reading</li>
                <li>Do not share this link with others</li>
              </ul>
            </div>

            <p>Enjoy your reading! We hope your child loves this story.</p>
            
            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              If you have any issues downloading, please contact our support team immediately.
            </p>
          </div>
          <div class="footer">
            <p>© 2024 ParentalPal. All rights reserved.</p>
            <p>Email: ${process.env.EMAIL_USER}</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Your book "${
      productDetails.productTitle
    }" is ready! Download here: ${
      productDetails.downloadUrl
    }. Link expires ${productDetails.expiryDate.toLocaleDateString()}. Maximum ${
      productDetails.maxDownloads
    } downloads.`,
  }),
};

export default transporter;
