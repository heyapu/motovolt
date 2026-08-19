"use client";
import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { X, Trash2, Loader2 } from "lucide-react";
import styles from "./CartDrawer.module.scss";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/format";
import QtyStepper from "@/components/QtyStepper/QtyStepper";

declare global {
  interface Window {
    Razorpay: any;
  }
}

function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartDrawer() {
  const router = useRouter();
  const { items, total, isOpen, closeCart, updateQty, removeItem, clearCart } = useCart();
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [pincode, setPincode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const canPay =
    items.length > 0 &&
    name.trim().length > 1 &&
    /^\d{10}$/.test(phone) &&
    line1.trim().length > 3 &&
    city.trim().length > 1 &&
    state.trim().length > 1 &&
    /^\d{6}$/.test(pincode);

  async function checkout() {
    setLoading(true);
    setError(null);
    try {
      const ok = await loadRazorpay();
      if (!ok) throw new Error("Could not load payment. Check your connection.");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customer: { name, phone, email },
          address: { line1, line2, city, state, pincode },
          items: items.map((i) => ({
            productId: i.productId,
            variantId: i.variantId,
            quantity: i.quantity,
          })),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Checkout failed");

      const rzp = new window.Razorpay({
        key: data.key,
        amount: data.amount,
        currency: "INR",
        name: "Motovolt Accessories",
        order_id: data.rzpOrderId,
        prefill: { name, email, contact: phone },
        theme: { color: "#f4581c" },
        handler: async (response: any) => {
          // Verify server-side — never trust the client callback alone.
          const verify = await fetch("/api/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(response),
          });
          const result = await verify.json();
          if (verify.ok) {
            clearCart();
            closeCart();
            router.push(`/order/success?order_id=${result.orderId}`);
          } else {
            setError(result.error ?? "Payment verification failed. Call support.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: () => setLoading(false),
        },
      });
      rzp.on("payment.failed", () => {
        setError("Payment failed. You can try again.");
        setLoading(false);
      });
      rzp.open();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Try again.");
      setLoading(false);
    }
  }

  return (
    <div className={`${styles.overlay} no-print`} onClick={closeCart}>
      <aside
        className={styles.drawer}
        onClick={(e) => e.stopPropagation()}
        aria-label="Shopping cart"
      >
        <header className={styles.head}>
          <h3>Your cart</h3>
          <button onClick={closeCart} aria-label="Close cart">
            <X size={18} />
          </button>
        </header>

        {items.length === 0 ? (
          <p className={styles.empty}>Your cart is empty. Add an accessory to get started.</p>
        ) : (
          <>
            <ul className={styles.list}>
              {items.map((i) => (
                <li key={`${i.productId}-${i.variantId}`} className={styles.item}>
                  <div className={styles.thumb}>
                    <Image
                      src={i.image ?? "/placeholder.webp"}
                      alt={i.title}
                      fill
                      sizes="64px"
                    />
                  </div>
                  <div className={styles.meta}>
                    <strong>{i.title}</strong>
                    {i.variantLabel && <small>{i.variantLabel}</small>}
                    <span>{inr(i.unitPrice)}</span>
                  </div>
                  <div className={styles.controls}>
                    <QtyStepper
                      value={i.quantity}
                      onChange={(q) => updateQty(i.productId, i.variantId, q)}
                    />
                    <button
                      aria-label={`Remove ${i.title}`}
                      onClick={() => removeItem(i.productId, i.variantId)}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              ))}
            </ul>

            <div className={styles.form}>
              <p className={styles.formTitle}>Contact</p>
              <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
              <input
                placeholder="Phone (10 digits)"
                inputMode="numeric"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
              />
              <input
                placeholder="Email (optional)"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />

              <p className={styles.formTitle}>Delivery address</p>
              <input placeholder="Address line 1" value={line1} onChange={(e) => setLine1(e.target.value)} />
              <input placeholder="Address line 2 (optional)" value={line2} onChange={(e) => setLine2(e.target.value)} />
              <div className={styles.row}>
                <input placeholder="City" value={city} onChange={(e) => setCity(e.target.value)} />
                <input placeholder="State" value={state} onChange={(e) => setState(e.target.value)} />
              </div>
              <input
                placeholder="Pincode (6 digits)"
                inputMode="numeric"
                value={pincode}
                onChange={(e) => setPincode(e.target.value.replace(/\D/g, "").slice(0, 6))}
              />
            </div>

            {error && <p className={styles.error}>{error}</p>}

            <footer className={styles.foot}>
              <div className={styles.total}>
                <span>Total</span>
                <strong>{inr(total)}</strong>
              </div>
              <button className={styles.pay} disabled={!canPay || loading} onClick={checkout}>
                {loading ? <Loader2 size={16} className={styles.spin} /> : null}
                {loading ? "Opening payment…" : "Pay with Razorpay"}
              </button>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
