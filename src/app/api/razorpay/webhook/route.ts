import { NextResponse } from "next/server";
import { verifyWebhookSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/orders";
import { dbAdmin } from "@/lib/db-admin";
import { Resend } from "resend";

// Initialize Resend
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
      // 1. Mark the order as paid in Supabase
      await markOrderPaid(payment.order_id, payment.id);

      // 2. Fetch and Notify Admins
      try {
        // Fetch only admins who opted into order notifications
        const { data: admins, error: adminError } = await dbAdmin()
          .from("admins")
          .select("email")
          .eq("notify", true);

        if (adminError) {
          console.error("Error fetching admins from Supabase:", adminError);
        } else if (admins && admins.length > 0) {
          const adminEmails = admins.map((admin) => admin.email);

          await resend.emails.send({
            from: "Motovolt Store <orders@notification.motovolt.co>",
            to: adminEmails,
            subject: `New Successful Order! (${payment.order_id})`,
            html: `
              <h2>New Order Received!</h2>
              <p><strong>Order ID:</strong> ${payment.order_id}</p>
              <p><strong>Payment ID:</strong> ${payment.id}</p>
              <p><strong>Amount:</strong> ₹${payment.amount / 100}</p> 
              <p><strong>Method:</strong> ${payment.method}</p>
            `,
          });
          console.log(`Successfully sent order notification to ${adminEmails.length} admin(s).`);
        } else {
          console.log("No admins found in the database. Email skipped.");
        }
      } catch (error) {
        // Catch the error so it doesn't fail the Razorpay webhook response
        console.error("Failed to send admin email:", error);
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