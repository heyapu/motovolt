"use client";
import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import styles from "./ProductCard.module.scss";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/format";
import type { Product } from "@/types";

export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();
  const hasVariants = (product.product_variants?.length ?? 0) > 0;
  const totalStock = hasVariants
    ? (product.product_variants ?? []).reduce((n, v) => n + v.stock, 0)
    : product.stock;
  const soldOut = totalStock <= 0;

  return (
    <article className={styles.card}>
      {soldOut && <span className={styles.soldOut}>Sold out</span>}
      <div className={styles.head}>
        <Link href={`/product/${product.slug}`} className={styles.title}>
          {product.title}
        </Link>
        <span className={styles.price}>{inr(product.price)}</span>
      </div>
      <Link href={`/product/${product.slug}`} className={styles.media}>
        <img
          src={product.image ?? "/placeholder.webp"}
          alt={product.title}
          sizes="(max-width: 640px) 100vw, 33vw"
          className={styles.img}
        />
      </Link>

      <div className={styles.btns}>
        {hasVariants ? (
          <Link href={`/product/${product.slug}`} className={styles.add}>
            Choose variant <Plus size={14} />
          </Link>
        ) : (
          <button
            className={styles.add}
            disabled={soldOut}
            onClick={() =>
              addItem({
                productId: product.id,
                variantId: null,
                title: product.title,
                variantLabel: null,
                unitPrice: product.price,
                quantity: 1,
                image: product.image,
                slug: product.slug,
              })
            }
          >
            Add to cart <Plus size={14} />
          </button>
        )}
      </div>
    </article>
  );
}
