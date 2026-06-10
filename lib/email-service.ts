import nodemailer from "nodemailer";

// Create transporter function to handle different environments
function createEmailTransporter() {
  // Check if we have EMAIL_USER and EMAIL_PASSWORD for Gmail
  if (process.env.EMAIL_USER && process.env.EMAIL_PASSWORD) {
    return nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD.replace(/\s/g, ""), // Remove any spaces from app password
      },
      tls: {
        rejectUnauthorized: false, // Accept self-signed certificates
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
  campers?: Array<{
    name: string;
    camperId: string;
  }>;
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
          .header { padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .content { padding: 40px 20px; }
          .welcome-text { font-size: 18px; color: #333; margin-bottom: 20px; }
          .features { background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .feature-item { margin: 15px 0; padding-left: 20px; position: relative; }
          .feature-item:before { content: "✓"; position: absolute; left: 0; color: #90AC19; font-weight: bold; }
          .cta-button { display: inline-block; background: #90AC19; color: white; padding: 15px 30px; text-decoration: none; border-radius: 25px; margin: 20px 0; font-weight: bold; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Welcome to ParentalPal!</h1>
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
          .header {  padding: 30px 20px; text-align: center; }
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
                <span class="detail-label">Booking ID: </span>
                <span class="detail-value">#${
                  bookingDetails._id || "N/A"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service Type: </span>
                <span class="detail-value">${
                  bookingDetails.serviceType || "N/A"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Start Date: </span>
                <span class="detail-value">${
                  bookingDetails.schedule?.startDate
                    ? new Date(
                        bookingDetails.schedule.startDate
                      ).toLocaleDateString()
                    : "N/A"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Children: </span>
                <span class="detail-value">${
                  bookingDetails.children?.length || 0
                } child(ren)</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Status: </span>
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
  paymentConfirmation: (userName: string, paymentDetails: PaymentDetails) => {
    const camperSection =
      paymentDetails.campers && paymentDetails.campers.length > 0
        ? `
            <div class="payment-details" style="border-left: 4px solid #90AC19;">
              <p style="font-weight: bold; margin: 0 0 8px 0; color: #333;">Your Camper ID(s)</p>
              <p style="font-size: 14px; color: #666; margin: 0 0 16px 0;">
                Please save these IDs. You will need them for camp check-in and correspondence.
              </p>
              ${paymentDetails.campers
                .map(
                  (camper) => `
              <div class="detail-row" style="display: block; padding: 10px 0;">
                <span class="detail-label">${camper.name}: </span>
                <span class="detail-value" style="font-family: monospace; font-weight: bold; font-size: 22px; color: #90AC19; letter-spacing: 0.5px;">${camper.camperId}</span>
              </div>`,
                )
                .join("")}
            </div>`
        : "";

    const camperText =
      paymentDetails.campers && paymentDetails.campers.length > 0
        ? ` Camper ID(s): ${paymentDetails.campers
            .map((c) => `${c.name}: ${c.camperId}`)
            .join(", ")}.`
        : "";

    return {
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
          .header {  padding: 30px 20px; text-align: center; }
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
            <h1>Payment Received!</h1>
          </div>
          <div class="content">
            <p>Hello ${userName},</p>
            
            <div class="success-badge">✅ Payment Successful</div>
            
            <p>We've successfully received your payment. Here are the transaction details:</p>
            
            <div class="payment-details">
              <div class="detail-row">
                <span class="detail-label">Transaction ID: </span>
                <span class="detail-value">${
                  paymentDetails.transactionId || "N/A"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Amount Paid: </span>
                <span class="detail-value">${paymentDetails.currency || "₦"}${
      paymentDetails.amount?.toLocaleString() || "0"
    }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Method: </span>
                <span class="detail-value">${
                  paymentDetails.method || "Online Payment"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Service: </span>
                <span class="detail-value">${
                  paymentDetails.serviceType || "N/A"
                }</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Payment Date: </span>
                <span class="detail-value">${new Date().toLocaleDateString()}</span>
              </div>
            </div>
            ${camperSection}

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
    }.${camperText}`,
  };
  },

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
          .header { ; padding: 30px 20px; text-align: center; }
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
            <h1>Order Confirmed!</h1>
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
          .header { ; padding: 30px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 24px; }
          .content { padding: 30px 20px; }
          .download-box { background: #90AC19; padding: 30px; border-radius: 12px; text-align: center; margin: 20px 0; }
          .download-button { display: inline-block; background: white; color: #90AC19; padding: 15px 40px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 18px; margin: 10px 0; }
          .info-box { background-color: #fff3cd; border-left: 4px solid #ffc107; padding: 15px; margin: 20px 0; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>Your Book is Ready!</h1>
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
              <strong>Important Information:</strong>
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

  // Tutor registration confirmation email
  tutorRegistration: (
    userName: string,
    tutorDetails: {
      tutorId: string;
      specialty: string;
      subjects: string[];
    }
  ) => ({
    subject: "Welcome to ParentalPal - Tutor Registration Successful! 🎓",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Tutor Registration Successful</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 0 auto; background-color: white; }
          .header {  padding: 40px 20px; text-align: center; }
          .header h1 { color: white; margin: 0; font-size: 28px; }
          .header p { color: white; margin: 10px 0 0 0; font-size: 16px; }
          .content { padding: 40px 20px; }
          .success-icon { text-align: center; font-size: 30px; margin: 20px 0; }
          .details-box { background-color: #f8f9fa; padding: 25px; border-radius: 12px; margin: 25px 0; border-left: 4px solid #90AC19; }
          .detail-row { padding: 12px 0; border-bottom: 1px solid #e0e0e0; }
          .detail-row:last-child { border-bottom: none; }
          .detail-label { font-weight: 600; color: #333; display: inline-block; width: 140px; }
          .detail-value { color: #666; }
          .subjects-list { display: inline-block; }
          .subject-tag { display: inline-block; background-color: #90AC19; color: white; padding: 4px 12px; border-radius: 12px; margin: 4px; font-size: 12px; }
          .cta-button { display: inline-block; background-color: #90AC19; color: white; padding: 15px 35px; text-decoration: none; border-radius: 8px; margin: 25px 0; font-weight: 600; }
          .cta-button:hover { background-color: #7a9315; }
          .next-steps { background-color: #fff3cd; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #E8931A; }
          .next-steps h3 { color: #856404; margin-top: 0; }
          .next-steps ul { margin: 10px 0; padding-left: 20px; }
          .next-steps li { margin: 8px 0; color: #856404; }
          .footer { background-color: #f8f9fa; padding: 25px 20px; text-align: center; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1> Welcome to ParentalPal!</h1>
            <p>Your tutor registration is complete</p>
          </div>
          <div class="content">
            <p style="font-size: 18px; color: #333; text-align: center; margin-bottom: 30px;">
              Congratulations, <strong>${userName}</strong>! You're now registered as a tutor on ParentalPal.
            </p>
            
            <div class="details-box">
              <div class="detail-row">
                <span class="detail-label">Tutor ID:</span>
                <span class="detail-value">#${tutorDetails.tutorId}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Specialty:</span>
                <span class="detail-value">${tutorDetails.specialty}</span>
              </div>
              <div class="detail-row">
                <span class="detail-label">Subjects:</span>
                <div class="subjects-list">
                  ${tutorDetails.subjects
                    .map(
                      (subject) => `<span class="subject-tag">${subject}</span>`
                    )
                    .join("")}
                </div>
              </div>
            </div>

            <div class="next-steps">
              <h3> Next Steps:</h3>
              <ul>
                <li><strong>Complete Your Account Setup:</strong> Sign in to set up your password and complete your profile</li>
                <li><strong>Update Your Profile:</strong> Add more details, availability, and teaching preferences</li>
                <li><strong>Start Teaching:</strong> Once your profile is complete, you'll be matched with students</li>
              </ul>
            </div>

            <div style="text-align: center;">
              <a href="${
                process.env.NEXTAUTH_URL
              }/auth/signin" class="cta-button">
                Sign In to Your Account
              </a>
            </div>

            <p style="margin-top: 30px; color: #666; font-size: 14px;">
              <strong>Need Help Getting Started?</strong><br/>
              Visit our <a href="${
                process.env.NEXTAUTH_URL
              }/faq" style="color: #90AC19;">FAQ page</a> or 
              contact our support team at <a href="mailto:${
                process.env.EMAIL_USER
              }" style="color: #90AC19;">${process.env.EMAIL_USER}</a>
            </p>

            <p style="margin-top: 20px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 13px; line-height: 1.6;">
              <strong>Why ParentalPal?</strong><br/>
              Join hundreds of tutors who trust us to connect them with students. We provide:
              <br/>• Flexible scheduling and payment options
              <br/>• Secure payment processing
              <br/>• Professional support and resources
              <br/>• Growing network of families
            </p>
          </div>
          <div class="footer">
            <p style="font-weight: 600;">© 2024 ParentalPal. All rights reserved.</p>
            <p>Questions? Email us at ${process.env.EMAIL_USER}</p>
            <p style="margin-top: 15px;">
              <a href="${
                process.env.NEXTAUTH_URL
              }" style="color: #90AC19; text-decoration: none;">Visit Our Website</a> | 
              <a href="${
                process.env.NEXTAUTH_URL
              }/tutors" style="color: #90AC19; text-decoration: none;">Tutor Portal</a>
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Welcome to ParentalPal, ${userName}! Your tutor registration is complete. Tutor ID: #${
      tutorDetails.tutorId
    }, Specialty: ${
      tutorDetails.specialty
    }, Subjects: ${tutorDetails.subjects.join(
      ", "
    )}. Next steps: 1) Sign in to complete your profile, 2) Update availability, 3) Start teaching! Sign in at: ${
      process.env.NEXTAUTH_URL
    }/auth/signin`,
  }),

  // Invoice email template
  invoice: (
    parentName: string,
    invoiceDetails: {
      invoiceNumber: string;
      bookingId: string;
      invoiceDate: Date;
      dueDate: Date;
      serviceType: string;
      children: Array<{ name: string; age: number }>;
      schedule?: {
        startDate?: string;
        endDate?: string;
      };
      items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;
      subtotal: number;
      tax?: number;
      discount?: number;
      totalAmount: number;
      currency: string;
      paymentInstructions?: string;
    }
  ) => ({
    subject: `Invoice #${invoiceDetails.invoiceNumber} - ParentalPal Services`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Invoice - ParentalPal</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 700px; margin: 0 auto; background-color: white; }
          .header {  padding: 30px 20px; color: white; }
          .header h1 { margin: 0; font-size: 28px; }
          .header .invoice-number { font-size: 18px; margin-top: 10px; opacity: 0.95; }
          .content { padding: 30px 20px; }
          .invoice-info { display: flex; justify-content: space-between; margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 8px; }
          .info-section { flex: 1; }
          .info-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
          .info-value { color: #333; font-size: 14px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .items-table th { background-color: #90AC19; color: white; padding: 12px; text-align: left; font-size: 14px; }
          .items-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
          .items-table tr:last-child td { border-bottom: none; }
          .subtotal-row { text-align: right; padding: 8px 12px; font-size: 14px; }
          .total-row { background-color: #90AC19; color: white; font-weight: bold; font-size: 18px; padding: 15px 12px; text-align: right; }
          .payment-section { background-color: #fff3cd; border-left: 4px solid #E8931A; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 13px; }
          .children-list { background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .child-item { display: inline-block; background-color: white; padding: 8px 15px; margin: 5px; border-radius: 20px; border: 1px solid #90AC19; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>INVOICE</h1>
            <div class="invoice-number">Invoice #${
              invoiceDetails.invoiceNumber
            }</div>
          </div>

          <div class="content">
            <div style="text-align: right; color: #666; margin-bottom: 20px;">
              <strong>ParentalPal Services</strong><br/>
              Email: ${process.env.EMAIL_USER || "info@parentalpal.com"}<br/>
              Website: ${process.env.NEXTAUTH_URL || "www.parentalpal.com"}
            </div>

            <div class="invoice-info">
              <div class="info-section">
                <div class="info-label">Bill To:</div>
                <div class="info-value">
                  <strong>${parentName}</strong>
                </div>
                <div style="margin-top: 10px;">
                  <div class="info-label">Booking ID:</div>
                  <div class="info-value">#${invoiceDetails.bookingId}</div>
                </div>
              </div>
              <div class="info-section" style="text-align: right;">
                <div class="info-label">Invoice Date:</div>
                <div class="info-value">${invoiceDetails.invoiceDate.toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}</div>
                <div style="margin-top: 10px;">
                  <div class="info-label">Due Date:</div>
                  <div class="info-value">${invoiceDetails.dueDate.toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}</div>
                </div>
              </div>
            </div>

            <div>
              <div class="info-label">Service Type:</div>
              <div style="font-size: 16px; font-weight: bold; color: #90AC19; margin-top: 5px;">
                ${invoiceDetails.serviceType
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </div>
            </div>

            ${
              invoiceDetails.children && invoiceDetails.children.length > 0
                ? `
            <div class="children-list">
              <div class="info-label" style="margin-bottom: 10px;">Children Enrolled:</div>
              ${invoiceDetails.children
                .map(
                  (child) =>
                    `<span class="child-item">${child.name} (${child.age} years)</span>`
                )
                .join("")}
            </div>
            `
                : ""
            }

            ${
              invoiceDetails.schedule?.startDate
                ? `
            <div style="margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
              <div class="info-label">Schedule:</div>
              <div style="margin-top: 5px;">
                <strong>Start Date:</strong> ${new Date(
                  invoiceDetails.schedule.startDate
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                ${
                  invoiceDetails.schedule.endDate
                    ? ` - <strong>End Date:</strong> ${new Date(
                        invoiceDetails.schedule.endDate
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}`
                    : ""
                }
              </div>
            </div>
            `
                : ""
            }

            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${invoiceDetails.items
                  .map(
                    (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${
                    invoiceDetails.currency
                  }${item.unitPrice.toLocaleString()}</td>
                  <td style="text-align: right;">${
                    invoiceDetails.currency
                  }${item.total.toLocaleString()}</td>
                </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div style="text-align: right; margin: 20px 0;">
              <div class="subtotal-row">
                <strong>Subtotal:</strong> ${
                  invoiceDetails.currency
                }${invoiceDetails.subtotal.toLocaleString()}
              </div>
              ${
                invoiceDetails.discount
                  ? `
              <div class="subtotal-row" style="color: #22c55e;">
                <strong>Discount:</strong> -${
                  invoiceDetails.currency
                }${invoiceDetails.discount.toLocaleString()}
              </div>
              `
                  : ""
              }
              ${
                invoiceDetails.tax
                  ? `
              <div class="subtotal-row">
                <strong>Tax:</strong> ${
                  invoiceDetails.currency
                }${invoiceDetails.tax.toLocaleString()}
              </div>
              `
                  : ""
              }
            </div>

            <div class="total-row">
              <div>TOTAL AMOUNT DUE: ${
                invoiceDetails.currency
              }${invoiceDetails.totalAmount.toLocaleString()}</div>
            </div>

            ${
              invoiceDetails.paymentInstructions
                ? `
            <div class="payment-section">
              <strong style="color: #856404;">Payment Instructions:</strong>
              <p style="margin: 10px 0 0 0; color: #856404;">${invoiceDetails.paymentInstructions}</p>
            </div>
            `
                : `
            <div class="payment-section">
              <strong style="color: #856404;">Payment Instructions:</strong>
              <p style="margin: 10px 0 0 0; color: #856404;">
                Please log in to your ParentalPal account to make payment for this invoice. 
                Visit <a href="${process.env.NEXTAUTH_URL}/profile" style="color: #E8931A;">your profile</a> and navigate to the Payments section.
              </p>
            </div>
            `
            }

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 13px;">
              <p><strong>Terms & Conditions:</strong></p>
              <ul style="line-height: 1.6;">
                <li>Payment is due by the due date specified above</li>
                <li>Late payments may incur additional charges</li>
                <li>Services are subject to ParentalPal's terms and conditions</li>
                <li>For any questions regarding this invoice, please contact us</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 5px 0; font-weight: bold;">Thank you for choosing ParentalPal!</p>
            <p style="margin: 5px 0;">© 2024 ParentalPal. All rights reserved.</p>
            <p style="margin: 10px 0;">
              Questions? Contact us at ${
                process.env.EMAIL_USER || "info@parentalpal.com"
              }
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
INVOICE #${invoiceDetails.invoiceNumber}
ParentalPal Services

Bill To: ${parentName}
Booking ID: #${invoiceDetails.bookingId}
Invoice Date: ${invoiceDetails.invoiceDate.toLocaleDateString()}
Due Date: ${invoiceDetails.dueDate.toLocaleDateString()}

Service: ${invoiceDetails.serviceType}
${
  invoiceDetails.children && invoiceDetails.children.length > 0
    ? `Children: ${invoiceDetails.children
        .map((child) => `${child.name} (${child.age} years)`)
        .join(", ")}`
    : ""
}

INVOICE ITEMS:
${invoiceDetails.items
  .map(
    (item) =>
      `${item.description} - Qty: ${item.quantity} x ${
        invoiceDetails.currency
      }${item.unitPrice.toLocaleString()} = ${
        invoiceDetails.currency
      }${item.total.toLocaleString()}`
  )
  .join("\n")}

Subtotal: ${invoiceDetails.currency}${invoiceDetails.subtotal.toLocaleString()}
${
  invoiceDetails.discount
    ? `Discount: -${
        invoiceDetails.currency
      }${invoiceDetails.discount.toLocaleString()}`
    : ""
}
${
  invoiceDetails.tax
    ? `Tax: ${invoiceDetails.currency}${invoiceDetails.tax.toLocaleString()}`
    : ""
}

TOTAL AMOUNT DUE: ${
      invoiceDetails.currency
    }${invoiceDetails.totalAmount.toLocaleString()}

${
  invoiceDetails.paymentInstructions ||
  "Please log in to your ParentalPal account to make payment."
}

Thank you for choosing ParentalPal!
Contact: ${process.env.EMAIL_USER || "info@parentalpal.com"}
    `,
  }),

  // Receipt email template (for paid/confirmed bookings)
  receipt: (
    parentName: string,
    receiptDetails: {
      receiptNumber: string;
      bookingId: string;
      receiptDate: Date;
      paymentDate?: Date;
      serviceType: string;
      children: Array<{ name: string; age: number }>;
      schedule?: {
        startDate?: string;
        endDate?: string;
      };
      items: Array<{
        description: string;
        quantity: number;
        unitPrice: number;
        total: number;
      }>;
      subtotal: number;
      tax?: number;
      discount?: number;
      totalAmount: number;
      currency: string;
      paymentMethod?: string;
      transactionId?: string;
    }
  ) => ({
    subject: `Payment Receipt #${receiptDetails.receiptNumber} - ParentalPal Services`,
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Payment Receipt - ParentalPal</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 700px; margin: 0 auto; background-color: white; }
          .header { ; padding: 30px 20px; color: white; }
          .header h1 { margin: 0; font-size: 28px; }
          .header .receipt-number { font-size: 18px; margin-top: 10px; opacity: 0.95; }
          .paid-badge { background-color: #22c55e; color: white; padding: 8px 20px; border-radius: 20px; display: inline-block; font-weight: bold; margin-top: 10px; }
          .content { padding: 30px 20px; }
          .receipt-info { display: flex; justify-content: space-between; margin: 20px 0; padding: 20px; background-color: #f0fdf4; border-radius: 8px; border: 2px solid #22c55e; }
          .info-section { flex: 1; }
          .info-label { font-weight: bold; color: #666; font-size: 12px; text-transform: uppercase; margin-bottom: 5px; }
          .info-value { color: #333; font-size: 14px; }
          .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; }
          .items-table th { background-color: #22c55e; color: white; padding: 12px; text-align: left; font-size: 14px; }
          .items-table td { padding: 12px; border-bottom: 1px solid #e0e0e0; }
          .items-table tr:last-child td { border-bottom: none; }
          .subtotal-row { text-align: right; padding: 8px 12px; font-size: 14px; }
          .total-row { background-color: #22c55e; color: white; font-weight: bold; font-size: 18px; padding: 15px 12px; text-align: right; }
          .payment-section { background-color: #d1fae5; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 4px; }
          .footer { background-color: #333; color: white; padding: 20px; text-align: center; font-size: 13px; }
          .children-list { background-color: #f0f7ff; padding: 15px; border-radius: 8px; margin: 15px 0; }
          .child-item { display: inline-block; background-color: white; padding: 8px 15px; margin: 5px; border-radius: 20px; border: 1px solid #22c55e; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>PAYMENT RECEIPT</h1>
            <div class="receipt-number">Receipt #${
              receiptDetails.receiptNumber
            }</div>
            <div class="paid-badge">✓ PAID IN FULL</div>
          </div>

          <div class="content">
            <div style="text-align: right; color: #666; margin-bottom: 20px;">
              <strong>ParentalPal Services</strong><br/>
              Email: ${process.env.EMAIL_USER || "info@parentalpal.com"}<br/>
              Website: ${process.env.NEXTAUTH_URL || "www.parentalpal.com"}
            </div>

            <div class="receipt-info">
              <div class="info-section">
                <div class="info-label">Received From:</div>
                <div class="info-value">
                  <strong>${parentName}</strong>
                </div>
                <div style="margin-top: 10px;">
                  <div class="info-label">Booking ID:</div>
                  <div class="info-value">#${receiptDetails.bookingId}</div>
                </div>
                ${
                  receiptDetails.transactionId
                    ? `
                <div style="margin-top: 10px;">
                  <div class="info-label">Transaction ID:</div>
                  <div class="info-value">${receiptDetails.transactionId}</div>
                </div>
                `
                    : ""
                }
              </div>
              <div class="info-section" style="text-align: right;">
                <div class="info-label">Receipt Date:</div>
                <div class="info-value">${receiptDetails.receiptDate.toLocaleDateString(
                  "en-US",
                  {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  }
                )}</div>
                ${
                  receiptDetails.paymentDate
                    ? `
                <div style="margin-top: 10px;">
                  <div class="info-label">Payment Date:</div>
                  <div class="info-value">${receiptDetails.paymentDate.toLocaleDateString(
                    "en-US",
                    {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    }
                  )}</div>
                </div>
                `
                    : ""
                }
                ${
                  receiptDetails.paymentMethod
                    ? `
                <div style="margin-top: 10px;">
                  <div class="info-label">Payment Method:</div>
                  <div class="info-value" style="text-transform: capitalize;">${receiptDetails.paymentMethod.replace(
                    "_",
                    " "
                  )}</div>
                </div>
                `
                    : ""
                }
              </div>
            </div>

            <div>
              <div class="info-label">Service Type:</div>
              <div style="font-size: 16px; font-weight: bold; color: #22c55e; margin-top: 5px;">
                ${receiptDetails.serviceType
                  .split("-")
                  .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                  .join(" ")}
              </div>
            </div>

            ${
              receiptDetails.children && receiptDetails.children.length > 0
                ? `
            <div class="children-list">
              <div class="info-label" style="margin-bottom: 10px;">Children Enrolled:</div>
              ${receiptDetails.children
                .map(
                  (child) =>
                    `<span class="child-item">${child.name} (${child.age} years old)</span>`
                )
                .join("")}
            </div>
            `
                : ""
            }

            ${
              receiptDetails.schedule?.startDate
                ? `
            <div style="margin: 15px 0; padding: 15px; background-color: #f8f9fa; border-radius: 8px;">
              <div class="info-label">Schedule:</div>
              <div style="margin-top: 5px;">
                <strong>Start Date:</strong> ${new Date(
                  receiptDetails.schedule.startDate
                ).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                ${
                  receiptDetails.schedule.endDate
                    ? ` - <strong>End Date:</strong> ${new Date(
                        receiptDetails.schedule.endDate
                      ).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}`
                    : ""
                }
              </div>
            </div>
            `
                : ""
            }

            <table class="items-table">
              <thead>
                <tr>
                  <th>Description</th>
                  <th style="text-align: center;">Quantity</th>
                  <th style="text-align: right;">Unit Price</th>
                  <th style="text-align: right;">Total</th>
                </tr>
              </thead>
              <tbody>
                ${receiptDetails.items
                  .map(
                    (item) => `
                <tr>
                  <td>${item.description}</td>
                  <td style="text-align: center;">${item.quantity}</td>
                  <td style="text-align: right;">${
                    receiptDetails.currency
                  }${item.unitPrice.toLocaleString()}</td>
                  <td style="text-align: right;">${
                    receiptDetails.currency
                  }${item.total.toLocaleString()}</td>
                </tr>
                `
                  )
                  .join("")}
              </tbody>
            </table>

            <div style="text-align: right; margin: 20px 0;">
              <div class="subtotal-row">
                <strong>Subtotal:</strong> ${
                  receiptDetails.currency
                }${receiptDetails.subtotal.toLocaleString()}
              </div>
              ${
                receiptDetails.discount
                  ? `
              <div class="subtotal-row" style="color: #22c55e;">
                <strong>Discount:</strong> -${
                  receiptDetails.currency
                }${receiptDetails.discount.toLocaleString()}
              </div>
              `
                  : ""
              }
              ${
                receiptDetails.tax
                  ? `
              <div class="subtotal-row">
                <strong>Tax:</strong> ${
                  receiptDetails.currency
                }${receiptDetails.tax.toLocaleString()}
              </div>
              `
                  : ""
              }
            </div>

            <div class="total-row">
              <div>TOTAL AMOUNT PAID: ${
                receiptDetails.currency
              }${receiptDetails.totalAmount.toLocaleString()}</div>
            </div>

            <div class="payment-section">
              <strong style="color: #166534;">Payment Confirmed</strong>
              <p style="margin: 10px 0 0 0; color: #166534;">
                Thank you for your payment! This receipt confirms that we have received your full payment for the services listed above. 
                You can access this receipt anytime from your ParentalPal account dashboard.
              </p>
            </div>

            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #eee; color: #666; font-size: 13px;">
              <p><strong>Important Information:</strong></p>
              <ul style="line-height: 1.6;">
                <li>This receipt serves as proof of payment</li>
                <li>Please keep this receipt for your records</li>
                <li>Services are subject to ParentalPal's terms and conditions</li>
                <li>For any questions regarding this receipt, please contact us</li>
              </ul>
            </div>
          </div>

          <div class="footer">
            <p style="margin: 5px 0; font-weight: bold;">Thank you for choosing ParentalPal!</p>
            <p style="margin: 5px 0;">© 2024 ParentalPal. All rights reserved.</p>
            <p style="margin: 10px 0;">
              Questions? Contact us at ${
                process.env.EMAIL_USER || "info@parentalpal.com"
              }
            </p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `
PAYMENT RECEIPT #${receiptDetails.receiptNumber}
✓ PAID IN FULL
ParentalPal Services

Received From: ${parentName}
Booking ID: #${receiptDetails.bookingId}
${
  receiptDetails.transactionId
    ? `Transaction ID: ${receiptDetails.transactionId}`
    : ""
}
Receipt Date: ${receiptDetails.receiptDate.toLocaleDateString()}
${
  receiptDetails.paymentDate
    ? `Payment Date: ${receiptDetails.paymentDate.toLocaleDateString()}`
    : ""
}
${
  receiptDetails.paymentMethod
    ? `Payment Method: ${receiptDetails.paymentMethod}`
    : ""
}

Service: ${receiptDetails.serviceType}
${
  receiptDetails.children && receiptDetails.children.length > 0
    ? `Children: ${receiptDetails.children
        .map((child) => `${child.name} (${child.age} years)`)
        .join(", ")}`
    : ""
}

RECEIPT ITEMS:
${receiptDetails.items
  .map(
    (item) =>
      `${item.description} - Qty: ${item.quantity} x ${
        receiptDetails.currency
      }${item.unitPrice.toLocaleString()} = ${
        receiptDetails.currency
      }${item.total.toLocaleString()}`
  )
  .join("\n")}

Subtotal: ${receiptDetails.currency}${receiptDetails.subtotal.toLocaleString()}
${
  receiptDetails.discount
    ? `Discount: -${
        receiptDetails.currency
      }${receiptDetails.discount.toLocaleString()}`
    : ""
}
${
  receiptDetails.tax
    ? `Tax: ${receiptDetails.currency}${receiptDetails.tax.toLocaleString()}`
    : ""
}

TOTAL AMOUNT PAID: ${
      receiptDetails.currency
    }${receiptDetails.totalAmount.toLocaleString()}

Payment Confirmed - Thank you for your payment!
This receipt confirms full payment for the services listed above.

Thank you for choosing ParentalPal!
Contact: ${process.env.EMAIL_USER || "info@parentalpal.com"}
    `,
  }),
};

export default transporter;
