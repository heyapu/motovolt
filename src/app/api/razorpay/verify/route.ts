import { NextResponse } from "next/server";
import { verifyPaymentSignature } from "@/lib/razorpay";
import { markOrderPaid } from "@/lib/orders";
import { razorpayVerifySchema, firstError } from "@/lib/validation";

// Called by the Razorpay Checkout success handler in the browser.
export async function POST(req: Request) {
  try {
    const parsed = razorpayVerifySchema.safeParse(await req.json());
    if (!parsed.success) {
      return NextResponse.json({ error: firstError(parsed.error) }, { status: 400 });
    }
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = parsed.data;

    const valid = verifyPaymentSignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });
    if (!valid) {
      return NextResponse.json({ error: "Invalid payment signature." }, { status: 400 });
    }

    const orderId = await markOrderPaid(razorpay_order_id, razorpay_payment_id);
    if (!orderId) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    return NextResponse.json({ orderId });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Verification failed." }, { status: 500 });
  }
}
