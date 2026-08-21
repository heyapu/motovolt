import { NextResponse } from "next/server";

interface ShippingInfoRequest {
  addresses?: Array<{ id: string; zipcode: string; country?: string; state_code?: string }>;
}

// Public endpoint Razorpay Magic Checkout calls from their servers.
// Motovolt policy: free shipping everywhere the dashboard lets an address
// through, no COD. (International shipping is disabled at the dashboard
// level, so we don't need to gate by country here.)
export async function POST(req: Request) {
  const body = (await req.json()) as ShippingInfoRequest;
  const addresses = body.addresses ?? [];

  // Log so we can see exactly what Razorpay sends — helpful for debugging.
  console.log("[shipping-info] request:", JSON.stringify(body));

  const response = {
    addresses: addresses.map((a) => ({
      id: a.id,
      zipcode: a.zipcode,
      country: a.country ?? "in",
      serviceable: true,
      cod: false,
      cod_fee: 0,
      shipping_methods: [
        {
          id: "standard",
          name: "Standard Shipping",
          description: "Delivery in 4–7 business days.",
          serviceable: true,
          shipping_fee: 0,
          cod: false,
          cod_fee: 0,
        },
      ],
    })),
  };

  console.log("[shipping-info] response:", JSON.stringify(response));
  return NextResponse.json(response);
}

export async function GET() {
  return NextResponse.json({ ok: true });
}