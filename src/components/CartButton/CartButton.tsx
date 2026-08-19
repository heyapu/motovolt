"use client";
import { ShoppingCart } from "lucide-react";
import styles from "./CartButton.module.scss";
import { useCart } from "@/context/CartContext";

export default function CartButton() {
  const { count, openCart } = useCart();
  return (
    <button
      className={`${styles.fab} no-print`}
      onClick={openCart}
      aria-label={`Open cart, ${count} items`}
    >
      <ShoppingCart size={20} />
      {count > 0 && <span className={styles.badge}>{count}</span>}
    </button>
  );
}
