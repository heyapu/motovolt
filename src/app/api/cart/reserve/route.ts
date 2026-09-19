import { NextResponse } from "next/server";
import { redis } from "@/lib/redis";
import { db } from "@/lib/db";

export async function POST(req: Request) {
    try {
        const { variantId, quantity, sessionId } = await req.json();

        if (!variantId || !quantity || !sessionId) {
            return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
        }

        // 1. Check actual available stock in Supabase
        const { data: variant } = await db()
            .from("product_variants")
            .select("stock")
            .eq("id", variantId)
            .single();

        if (!variant || variant.stock < quantity) {
            return NextResponse.json({ error: "Insufficient stock" }, { status: 400 });
        }

        // 2. Tally up active reservations for this variant currently held in Redis
        // We store reservations as: reserve:{variantId}:{sessionId}
        const keys = await redis.keys(`reserve:${variantId}:*`);
        let currentlyReserved = 0;

        if (keys.length > 0) {
            const reservations = await redis.mget<number[]>(...keys);
            currentlyReserved = reservations.reduce((sum, val) => sum + (val || 0), 0);
        }

        // 3. Calculate true availability
        const trueAvailable = variant.stock - currentlyReserved;

        if (trueAvailable < quantity) {
            return NextResponse.json({ error: "Item is currently held in other carts" }, { status: 409 });
        }

        // 4. Create the 15-minute lock (900 seconds)
        const reservationKey = `reserve:${variantId}:${sessionId}`;
        await redis.set(reservationKey, quantity, { ex: 900 });

        return NextResponse.json({ ok: true, expires_in: 900 });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}