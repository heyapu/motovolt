import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/orders";
import { dbAdmin } from "@/lib/db-admin";
import { Resend } from "resend";
import { render } from "@react-email/render";
import OrderReceipt from "@/components/emails/OrderReceipt";
import React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(req: Request) {
  const rawBody = await req.text();
  const signature = req.headers.get("x-razorpay-signature") ?? "";

  if (!verifyWebhookSignature(rawBody, signature)) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = JSON.parse(rawBody);

  if (event.event === "payment.captured") {
    const payment = event.payload?.payment?.entity;

    if (payment?.order_id) {
      await markOrderPaid(payment.order_id, payment.id);

      try {
        // 1. Fetch full order details including items to populate the receipt
        const { data: order, error: orderError } = await dbAdmin()
          .from("orders")
          .select("*, order_items(*)")
          .eq("rzp_order_id", payment.order_id)
          .single();

        if (orderError || !order) {
          throw new Error("Could not fetch order details for email");
        }

        // 2. Parse the JSONB address safely
        let addressString = "N/A";
        if (order.address) {
          const addr = typeof order.address === "string" ? JSON.parse(order.address) : order.address;
          const parts = [
            addr.line1 || addr.address_line_1 || addr.street,
            addr.line2 || addr.address_line_2,
            addr.city,
            addr.state,
            addr.pincode || addr.zip,
          ].filter(Boolean);
          addressString = parts.length > 0 ? parts.join(", ") : JSON.stringify(addr);
        }

        // 3. Render the React Component into an HTML string
        const emailHtml = await render(
          React.createElement(OrderReceipt, {
            orderId: order.rzp_order_id,
            serialNumber: order.serial_number,
            date: new Date(order.created_at).toLocaleDateString("en-IN", {
              day: "numeric",
              month: "short",
              year: "numeric",
            }),
            amount: payment.amount / 100,
            customerName: order.customer_name ?? "Customer",
            customerPhone: order.customer_phone ?? "",
            customerEmail: order.customer_email ?? "",
            address: addressString,
            items: order.order_items.map((item: any) => ({
              title: item.title,
              quantity: item.quantity,
              price: item.unit_price ?? item.price ?? 0,
              variant_label: item.variant_label,
            })),
          })
        );

        // 4. Fetch notified admins
        const { data: admins, error: adminError } = await dbAdmin()
          .from("admins")
          .select("email")
          .eq("notify", true);

        if (adminError) {
          console.error("Error fetching admins from Supabase:", adminError);
        } else if (admins && admins.length > 0) {
          const adminEmails = admins.map((admin) => admin.email);

          // 5. Send the rendered HTML email
          await resend.emails.send({
            from: "Motovolt Store <orders@notification.motovolt.co>",
            to: adminEmails,
            subject: `New Successful Order! (ORD-${String(order.serial_number).padStart(4, "0")})`,
            html: emailHtml,
          });

          console.log(`Successfully sent order notification to ${adminEmails.length} admin(s).`);
        }
      } catch (error) {
        console.error("Failed to process/send admin email:", error);
      }
    }
  } else if (event.event === "payment.failed") {
    const payment = event.payload?.payment?.entity;
    if (payment?.order_id) {
      await dbAdmin()
        .from("orders")
        .update({ status: "FAILED" })
        .eq("rzp_order_id", payment.order_id)
        .neq("status", "PAID");
    }
  }

  return NextResponse.json({ ok: true });
}