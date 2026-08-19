import { NextResponse } from "next/server";
import ImageKit from "imagekit";
import { getAdminOrNull } from "@/lib/admin-auth";

// Only an approved admin can get upload credentials.
export async function GET() {
  const admin = await getAdminOrNull();
  if (!admin) return NextResponse.json({ error: "Not allowed." }, { status: 403 });

  const imagekit = new ImageKit({
    publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT!,
  });
  return NextResponse.json(imagekit.getAuthenticationParameters());
}
