import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/email-service";

interface ContactFormData {
  name: string;
  email: string;
  phone: string;
  subject: string;
  message: string;
  serviceType: string;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    const { name, email, phone, subject, message, serviceType } = body;

    // Validate required fields
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: "Invalid email address" },
        { status: 400 }
      );
    }

    // Admin email HTML template
    const adminEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>New Contact Form Submission</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #90AC19 0%, #7A9216 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .info-row { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-left: 4px solid #90AC19; border-radius: 5px; }
          .info-label { font-weight: bold; color: #333; margin-bottom: 5px; }
          .info-value { color: #666; }
          .message-box { background-color: #fff; border: 1px solid #e0e0e0; padding: 20px; border-radius: 5px; margin-top: 20px; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;"> Contact Form Submission</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; color: #333;">You have received a new message from the ParentalPal contact form:</p>
            
            <div class="info-row">
              <div class="info-label">Name:</div>
              <div class="info-value">${name}</div>
            </div>

            <div class="info-row">
              <div class="info-label">Email:</div>
              <div class="info-value"><a href="mailto:${email}" style="color: #90AC19; text-decoration: none;">${email}</a></div>
            </div>

            ${
              phone
                ? `
            <div class="info-row">
              <div class="info-label">Phone:</div>
              <div class="info-value"><a href="tel:${phone}" style="color: #90AC19; text-decoration: none;">${phone}</a></div>
            </div>
            `
                : ""
            }

            <div class="info-row">
              <div class="info-label">Service Type:</div>
              <div class="info-value">${serviceType || "General Inquiry"}</div>
            </div>

            <div class="info-row">
              <div class="info-label">Subject:</div>
              <div class="info-value">${subject}</div>
            </div>

            <div class="message-box">
              <div class="info-label" style="margin-bottom: 10px;">Message:</div>
              <div style="color: #333; line-height: 1.6;">${message.replace(
                /\n/g,
                "<br>"
              )}</div>
            </div>

            <p style="margin-top: 30px; padding: 15px; background-color: #fff3cd; border-left: 4px solid #ffc107; border-radius: 5px; color: #856404;">
              <strong> Action Required:</strong> Please respond to this inquiry within 24 hours.
            </p>
          </div>
          <div class="footer">
            <p>This email was sent from the ParentalPal contact form</p>
            <p>Reply directly to <a href="mailto:${email}" style="color: #90AC19;">${email}</a> to respond to this inquiry</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Customer confirmation email HTML template
    const customerEmailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Thank You for Contacting ParentalPal</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
          .container { max-width: 600px; margin: 20px auto; background-color: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1); overflow: hidden; }
          .header { background: linear-gradient(135deg, #90AC19 0%, #7A9216 100%); color: white; padding: 30px; text-align: center; }
          .content { padding: 30px; }
          .highlight { background-color: #f0f7e1; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #90AC19; }
          .footer { background-color: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
          .contact-info { margin: 20px 0; padding: 15px; background-color: #f8f9fa; border-radius: 5px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1 style="margin: 0;"> Thank You for Contacting Us!</h1>
          </div>
          <div class="content">
            <p style="font-size: 16px; color: #333;">Dear ${name},</p>
            
            <p style="color: #555; line-height: 1.6;">
              Thank you for reaching out to ParentalPal! We've received your message and our team will review it shortly.
            </p>

            <div class="highlight">
              <p style="margin: 0 0 10px 0; color: #333;"><strong> Your Message Summary:</strong></p>
              <p style="margin: 5px 0; color: #555;"><strong>Subject:</strong> ${subject}</p>
              <p style="margin: 5px 0; color: #555;"><strong>Service Type:</strong> ${
                serviceType || "General Inquiry"
              }</p>
              <p style="margin: 10px 0 0 0; color: #555;"><strong>Message:</strong></p>
              <p style="color: #666; line-height: 1.6; margin-top: 5px;">${message.replace(
                /\n/g,
                "<br>"
              )}</p>
            </div>

            <p style="color: #555; line-height: 1.6;">
              <strong> What's Next?</strong><br>
              Our team typically responds within 24 hours during business hours (Mon-Fri: 8:00 AM - 6:00 PM). We'll get back to you at <strong>${email}</strong>.
            </p>

            <div class="contact-info">
              <p style="margin: 0 0 10px 0; color: #333;"><strong>Need immediate assistance?</strong></p>
              <p style="margin: 5px 0; color: #555;">📞 Call us: <a href="tel:+2348065394795" style="color: #90AC19; text-decoration: none;">+234 806 539 4795</a></p>
              <p style="margin: 5px 0; color: #555;">📧 Email: <a href="mailto:admin@parentalpal.org" style="color: #90AC19; text-decoration: none;">admin@parentalpal.org</a></p>
              <p style="margin: 5px 0; color: #555;">📍 Visit: 12 Fola Jinadu Street, Gbagada, Lagos</p>
            </div>

            <p style="color: #555; line-height: 1.6;">
              Thank you for choosing ParentalPal for your childcare needs. We look forward to serving you!
            </p>

            <p style="color: #555; margin-top: 30px;">
              Warm regards,<br>
              <strong>The ParentalPal Team</strong>
            </p>
          </div>
          <div class="footer">
            <p>© ${new Date().getFullYear()} ParentalPal. All rights reserved.</p>
            <p>12 Fola Jinadu Street, Gbagada, Lagos</p>
            <p><a href="https://www.parentalpal.org" style="color: #90AC19; text-decoration: none;">www.parentalpal.org</a></p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email to admin
    const adminEmail = await sendEmail({
      to:
        process.env.EMAIL_USER ||
        process.env.ADMIN_EMAIL ||
        "admin@parentalpal.org",
      subject: `New Contact Form: ${subject}`,
      html: adminEmailHtml,
      text: `New contact form submission from ${name} (${email}):\n\nSubject: ${subject}\nService Type: ${
        serviceType || "General Inquiry"
      }\nPhone: ${phone || "Not provided"}\n\nMessage:\n${message}`,
    });

    // Send confirmation email to customer
    const customerEmail = await sendEmail({
      to: email,
      subject: "Thank You for Contacting ParentalPal",
      html: customerEmailHtml,
      text: `Dear ${name},\n\nThank you for contacting ParentalPal! We've received your message regarding "${subject}" and our team will review it shortly.\n\nWe typically respond within 24 hours during business hours. We'll get back to you at ${email}.\n\nBest regards,\nThe ParentalPal Team`,
    });

    if (!adminEmail.success) {
      console.error("Failed to send admin email:", adminEmail.error);
    }

    if (!customerEmail.success) {
      console.error("Failed to send customer email:", customerEmail.error);
    }

    return NextResponse.json({
      success: true,
      message: "Contact form submitted successfully",
      emailsSent: {
        admin: adminEmail.success,
        customer: customerEmail.success,
      },
    });
  } catch (error) {
    console.error("Contact form error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to process contact form",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
