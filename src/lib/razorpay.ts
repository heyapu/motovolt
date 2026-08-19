import "server-only";
// Server-side Razorpay helpers.
import Razorpay from "razorpay";
import crypto from "crypto";

export function razorpay() {
  return new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
  });
}

// Checkout handler verification: HMAC-SHA256(order_id|payment_id, key_secret)
export function verifyPaymentSignature(params: {
  orderId: string;
  paymentId: string;
  signature: string;
}) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
    .update(`${params.orderId}|${params.paymentId}`)
    .digest("hex");
  return crypto.timingSafeEqual(
    Buffer.from(expected),
    Buffer.from(params.signature)
  );
}

// Webhook verification: HMAC-SHA256(rawBody, webhook_secret)
export function verifyWebhookSignature(rawBody: string, signature: string) {
  const expected = crypto
    .createHmac("sha256", process.env.RAZORPAY_WEBHOOK_SECRET!)
    .update(rawBody)
    .digest("hex");
  try {
    return crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
  } catch {
    return false;
  }
}
