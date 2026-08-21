import styles from "./Invoice.module.scss";
import { inr } from "@/lib/format";
import type { OrderRow } from "@/types";

export default function Invoice({ order }: { order: OrderRow }) {
  const date = new Date(order.created_at).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });

  return (
    <section className={styles.invoice} aria-label="Invoice">
      <header className={styles.head}>
        <div>
          <strong className={styles.brand}>MOTOVOLT</strong>
          <p>Accessories invoice</p>
        </div>
        <div className={styles.metaRight}>
          <p>Order: {order.rzp_order_id}</p>
          <p>Date: {date}</p>
        </div>
      </header>

      <div className={styles.customer}>
        <p>
          <strong>Billed to:</strong> {order.customer_name}
        </p>
        <p>{order.customer_phone}</p>
        {order.customer_email && <p>{order.customer_email}</p>}
        {order.address && (
          <p>
            <strong>Deliver to:</strong> {order.address.line1}
            {order.address.line2 ? `, ${order.address.line2}` : ""},{" "}
            {order.address.city}, {order.address.state} — {order.address.pincode}
          </p>
        )}
      </div>

      <table className={styles.table}>
        <thead>
          <tr>
            <th>Item</th>
            <th>Qty</th>
            <th>Price</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {order.order_items.map((i, idx) => (
            <tr key={idx}>
              <td>
                {i.title}
                {i.variant_label && <small> — {i.variant_label}</small>}
              </td>
              <td>{i.quantity}</td>
              <td>{inr(i.unit_price)}</td>
              <td>{inr(i.unit_price * i.quantity)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={3}>Grand total (incl. taxes)</td>
            <td>{inr(order.amount)}</td>
          </tr>
        </tfoot>
      </table>

      <p className={styles.note}>
        Payment received via Razorpay. Our team will call you within 24 hours to
        confirm delivery.
      </p>
    </section>
  );
}
