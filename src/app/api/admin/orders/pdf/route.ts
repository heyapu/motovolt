import { NextResponse } from "next/server";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { requireAdmin } from "@/lib/admin-auth";
import { dbAdmin } from "@/lib/db-admin";

export async function POST(req: Request) {
  try {
    await requireAdmin();
    
    const { orderIds } = await req.json();
    if (!Array.isArray(orderIds) || orderIds.length === 0) {
      return NextResponse.json({ error: "No order IDs provided" }, { status: 400 });
    }

    const { data: orders, error } = await dbAdmin()
      .from("orders")
      .select("*, order_items(*)")
      .in("id", orderIds);

    if (error) throw error;

    const pdfDoc = await PDFDocument.create();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    for (const order of (orders || [])) {
      const page = pdfDoc.addPage([595.28, 841.89]);
      const { width, height } = page.getSize();
      
      let yOffset = height - 50;

      // --- Header ---
      page.drawText(`INVOICE / ORDER DETAILS`, { x: 50, y: yOffset, size: 18, font: boldFont });
      yOffset -= 40;

      // --- Order Info ---
      page.drawText(`Order #: ORD-${String(order.serial_number).padStart(4, '0')}`, { x: 50, y: yOffset, size: 12, font });
      page.drawText(`Date: ${new Date(order.created_at).toLocaleString()}`, { x: 300, y: yOffset, size: 12, font });
      yOffset -= 20;
      
      page.drawText(`Status: ${order.status}`, { x: 50, y: yOffset, size: 12, font });
      yOffset -= 20;
      
      if (order.rzp_order_id) {
        page.drawText(`RZP Order ID: ${order.rzp_order_id}`, { x: 50, y: yOffset, size: 12, font });
        yOffset -= 20;
      }
      
      if (order.rzp_payment_id) {
        page.drawText(`RZP Payment ID: ${order.rzp_payment_id}`, { x: 50, y: yOffset, size: 12, font });
        yOffset -= 20;
      }
      
      yOffset -= 20;

      // --- Customer Info ---
      page.drawText(`Customer Information:`, { x: 50, y: yOffset, size: 14, font: boldFont });
      yOffset -= 20;
      page.drawText(`Name: ${order.customer_name ?? "N/A"}`, { x: 50, y: yOffset, size: 12, font });
      yOffset -= 20;
      page.drawText(`Phone: ${order.customer_phone ?? "N/A"}`, { x: 50, y: yOffset, size: 12, font });
      yOffset -= 20;
      page.drawText(`Email: ${order.customer_email ?? "N/A"}`, { x: 50, y: yOffset, size: 12, font });
      yOffset -= 40;

      // --- Address Info ---
      page.drawText(`Shipping Address:`, { x: 50, y: yOffset, size: 14, font: boldFont });
      yOffset -= 20;

      if (order.address) {
        const addr = typeof order.address === 'string' ? JSON.parse(order.address) : order.address;
        
        const line1 = addr.line1 || addr.address_line_1 || addr.street || "";
        const line2 = addr.line2 || addr.address_line_2 || "";
        const city = addr.city || "";
        const state = addr.state || "";
        const pincode = addr.pincode || addr.zip || addr.zipcode || addr.postal_code || "";
        const country = addr.country || "";

        const addressLines = [
          line1,
          line2,
          [city, state, pincode].filter(Boolean).join(", "),
          country
        ].filter(Boolean);

        if (addressLines.length > 0) {
          addressLines.forEach(line => {
            page.drawText(String(line), { x: 50, y: yOffset, size: 12, font });
            yOffset -= 20;
          });
        } else {
          page.drawText(JSON.stringify(addr).substring(0, 80), { x: 50, y: yOffset, size: 12, font });
          yOffset -= 20;
        }
      } else {
        page.drawText(`N/A`, { x: 50, y: yOffset, size: 12, font });
        yOffset -= 20;
      }

      yOffset -= 20;
      page.drawLine({ start: { x: 50, y: yOffset }, end: { x: 545, y: yOffset }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
      yOffset -= 30;

      // --- Items Table Header ---
      page.drawText(`Items:`, { x: 50, y: yOffset, size: 14, font: boldFont });
      yOffset -= 20;
      
      // --- Items List ---
      order.order_items?.forEach((item: any) => {
        if (yOffset < 100) {
            page.drawText(`... (More items on next page)`, { x: 50, y: yOffset, size: 10, font });
        } else {
            const itemText = `${item.quantity}x ${item.title} ${item.variant_label ? `(${item.variant_label})` : ""}`;
            page.drawText(itemText, { x: 70, y: yOffset, size: 12, font });
            
            const price = item.unit_price ? item.unit_price : (item.price ?? 0);
            page.drawText(`INR ${price}`, { x: 450, y: yOffset, size: 12, font });
            yOffset -= 20;
        }
      });

      yOffset -= 20;
      page.drawLine({ start: { x: 50, y: yOffset }, end: { x: 545, y: yOffset }, thickness: 1, color: rgb(0.8, 0.8, 0.8) });
      yOffset -= 30;

      // --- Total ---
      page.drawText(`Total Amount: INR ${order.amount}`, { x: 350, y: yOffset, size: 14, font: boldFont });
    }

    const pdfBytes = await pdfDoc.save();

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="orders.pdf"`,
      },
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}