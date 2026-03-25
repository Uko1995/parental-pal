import { NextResponse } from "next/server";
import { auth } from "@/auth";
import clientPromise from "@/lib/mongodb";
import { sendEmail } from "@/lib/email-service";

// Get low stock products
export async function GET() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise();
    const db = client.db();

    // Get low stock threshold from settings or use default
    const settings = await db
      .collection("settings")
      .findOne({ key: "low_stock_threshold" });
    const threshold = settings?.value || 5;

    // Find products with low stock (paperback)
    const lowStockProducts = await db
      .collection("products")
      .find({
        "pricing.paperback.available": true,
        "stock.paperback": { $lte: threshold, $gt: 0 },
        status: "active",
      })
      .project({
        title: 1,
        slug: 1,
        thumbnail: 1,
        "stock.paperback": 1,
        sku: 1,
      })
      .toArray();

    // Find out of stock products
    const outOfStockProducts = await db
      .collection("products")
      .find({
        "pricing.paperback.available": true,
        "stock.paperback": { $lte: 0 },
        status: "active",
      })
      .project({
        title: 1,
        slug: 1,
        thumbnail: 1,
        "stock.paperback": 1,
        sku: 1,
      })
      .toArray();

    return NextResponse.json({
      success: true,
      data: {
        threshold,
        lowStock: lowStockProducts.map((p) => ({
          _id: p._id.toString(),
          title: p.title,
          slug: p.slug,
          thumbnail: p.thumbnail,
          stock: p.stock?.paperback || 0,
          sku: p.sku,
        })),
        outOfStock: outOfStockProducts.map((p) => ({
          _id: p._id.toString(),
          title: p.title,
          slug: p.slug,
          thumbnail: p.thumbnail,
          stock: 0,
          sku: p.sku,
        })),
      },
    });
  } catch (error) {
    console.error("Low stock check error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to check stock levels" },
      { status: 500 }
    );
  }
}

// Send low stock alert email
export async function POST() {
  try {
    const session = await auth();

    if (!session?.user || session.user.role !== "admin") {
      return NextResponse.json(
        { success: false, error: "Unauthorized" },
        { status: 401 }
      );
    }

    const client = await clientPromise();
    const db = client.db();

    // Get low stock threshold
    const settings = await db
      .collection("settings")
      .findOne({ key: "low_stock_threshold" });
    const threshold = settings?.value || 5;

    // Find low stock and out of stock products
    const lowStockProducts = await db
      .collection("products")
      .find({
        "pricing.paperback.available": true,
        "stock.paperback": { $lte: threshold, $gt: 0 },
        status: "active",
      })
      .project({ title: 1, "stock.paperback": 1, sku: 1 })
      .toArray();

    const outOfStockProducts = await db
      .collection("products")
      .find({
        "pricing.paperback.available": true,
        "stock.paperback": { $lte: 0 },
        status: "active",
      })
      .project({ title: 1, sku: 1 })
      .toArray();

    if (lowStockProducts.length === 0 && outOfStockProducts.length === 0) {
      return NextResponse.json({
        success: true,
        message: "All products are well stocked",
      });
    }

    // Get admin emails
    const admins = await db
      .collection("users")
      .find({ role: "admin" })
      .project({ email: 1, name: 1 })
      .toArray();

    if (admins.length === 0) {
      return NextResponse.json({
        success: false,
        error: "No admin users found",
      });
    }

    // Build email content
    let emailBody = `
      <h2>📦 Stock Alert Report</h2>
      <p>This is an automated alert about inventory levels in your ParentalPal store.</p>
    `;

    if (outOfStockProducts.length > 0) {
      emailBody += `
        <h3 style="color: #dc2626;">❌ Out of Stock (${
          outOfStockProducts.length
        } products)</h3>
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
          <tr style="background: #fef2f2;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">SKU</th>
          </tr>
          ${outOfStockProducts
            .map(
              (p) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.title}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                p.sku || "N/A"
              }</td>
            </tr>
          `
            )
            .join("")}
        </table>
      `;
    }

    if (lowStockProducts.length > 0) {
      emailBody += `
        <h3 style="color: #f59e0b;">⚠️ Low Stock (${
          lowStockProducts.length
        } products)</h3>
        <table style="width: 100%; border-collapse: collapse;">
          <tr style="background: #fffbeb;">
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Product</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">SKU</th>
            <th style="padding: 10px; text-align: left; border: 1px solid #ddd;">Remaining</th>
          </tr>
          ${lowStockProducts
            .map(
              (p) => `
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd;">${p.title}</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                p.sku || "N/A"
              }</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${
                p.stock?.paperback || 0
              } units</td>
            </tr>
          `
            )
            .join("")}
        </table>
      `;
    }

    emailBody += `
      <p style="margin-top: 20px;">
        <a href="${process.env.NEXTAUTH_URL}/dashboard/products" 
           style="background: #90AC19; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; display: inline-block;">
          Manage Inventory
        </a>
      </p>
      <p style="color: #666; font-size: 14px; margin-top: 20px;">
        Current low stock threshold: ${threshold} units
      </p>
    `;

    // Send email to all admins
    for (const admin of admins) {
      await sendEmail({
        to: admin.email,
        subject: `⚠️ Stock Alert: ${outOfStockProducts.length} out of stock, ${lowStockProducts.length} low stock`,
        html: emailBody,
      });
    }

    // Log the alert
    await db.collection("stock_alerts").insertOne({
      sentAt: new Date(),
      sentBy: session.user.id,
      lowStockCount: lowStockProducts.length,
      outOfStockCount: outOfStockProducts.length,
      recipientCount: admins.length,
    });

    return NextResponse.json({
      success: true,
      message: `Alert sent to ${admins.length} admin(s)`,
      data: {
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
      },
    });
  } catch (error) {
    console.error("Send stock alert error:", error);
    return NextResponse.json(
      { success: false, error: "Failed to send stock alert" },
      { status: 500 }
    );
  }
}
