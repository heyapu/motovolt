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
    Razorpay: new (options: RzpOptions) => { open: () => void; on: (evt: string, cb: () => void) => void };
  }
}

interface RzpOptions {
  key: string;
  amount: number;
  currency: string;
  name: string;
  order_id: string;
  one_click_checkout: boolean;
  theme?: { color?: string };
  prefill?: { name?: string; contact?: string; email?: string };
  modal?: { ondismiss?: () => void };
  handler?: (r: RzpResponse) => void;
}
interface RzpResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

// Magic Checkout uses a different script than standard Checkout.
function loadMagicCheckout(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/magic-checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function CartDrawer() {
  const router = useRouter();
  const { items, total, isOpen, closeCart, updateQty, removeItem, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  async function buyNow() {
    setLoading(true);
    setError(null);
    try {
      const ok = await loadMagicCheckout();
      if (!ok) throw new Error("Could not load payment. Check your connection.");

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        one_click_checkout: true,          // <- Magic Checkout mode
        theme: { color: "#f4581c" },
        prefill: data.prefill ?? {},
        modal: { ondismiss: () => setLoading(false) },
        handler: async (response) => {
          // Verify server-side. The webhook will do the same independently,
          // so even if this fetch fails the order still gets marked paid.
          try {
            const verify = await fetch("/api/razorpay/verify", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify(response),
            });
            const result = await verify.json();
            clearCart();
            closeCart();
            if (verify.ok) {
              router.push(`/order/success?order_id=${result.orderId}`);
            } else {
              // The webhook covers this — send the user to a friendly page.
              router.push(`/order/success`);
            }
          } catch {
            clearCart();
            closeCart();
            router.push(`/order/success`);
          }
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
          {/* <h3>Your cart {items.length > 0 && `(${items.length})`}</h3> */}
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


                  <div className={styles.metawraper}>
                    <div className={styles.meta}>
                      <div className={styles.productinfo}>
                        <h2>{i.title}</h2>
                        {i.variantLabel && <small>{i.variantLabel}</small>}
                      </div>
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
                        {/* <Trash2 size={16} /> */}
                        <u>Remove</u>
                        {/* Delete */}
                      </button>
                    </div>
                  </div>


                </li>
              ))}
            </ul>

            {error && <p className={styles.error}>{error}</p>}

            <footer className={styles.foot}>
              <button
                className={styles.pay}
                disabled={loading}
                onClick={buyNow}
              >
                {loading ? <Loader2 size={16} className={styles.spin} /> : null}
                {loading ? "Opening Razorpay" : <div className={styles.btninner}>
                  CHECKOUT
                  <span>
                    {inr(total)}
                  </span>
                </div>}
              </button>
              <p className={styles.fineprint}>
                By clicking on “Checkout”, you agree to our Policies and allow Motovolt and our service partners to get in touch with you.

                Taxes included. Shipping charges, if applicable, will be calculated at checkout.
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  );
}
