"use client";

import Image from "next/image";
import Link from "next/link";
import { Plus } from "lucide-react";
import styles from "./ProductCard.module.scss";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/format";
import type { Product } from "@/types";

/**
 * ProductCard
 *
 * Displays a product with:
 * - Product title
 * - Price or "Sold out" status
 * - Product image
 * - Add-to-cart / variant selection action
 *
 * Stock is calculated differently for products with variants:
 * - Variant product: total stock = sum of all variant stock
 * - Simple product: total stock = product.stock
 */
export default function ProductCard({ product }: { product: Product }) {
  const { addItem } = useCart();

  /**
   * Determines whether the product has selectable variants.
   */
  const hasVariants = (product.product_variants?.length ?? 0) > 0;

  /**
   * Calculates the total available stock.
   *
   * For variant products, stock is the combined stock
   * of all available variants.
   */
  const totalStock = hasVariants
    ? (product.product_variants ?? []).reduce(
        (total, variant) => total + variant.stock,
        0
      )
    : product.stock;

  /**
   * Product is considered sold out when no stock is available.
   */
  const soldOut = totalStock <= 0;

  return (
    <article className={styles.card}>
      <div className={styles.head}>
        <Link href={`/product/${product.slug}`} className={styles.title}>
          {product.title}
        </Link>

        {/* Show "Sold out" instead of the price when no stock is available. */}
        <span className={styles.price}>
          {soldOut ? <span className={styles.soldout}>Sold out</span> : inr(product.price)}
        </span>
      </div>

      <Link
        href={`/product/${product.slug}`}
        className={styles.media}
        aria-label={`View ${product.title}`}
      >
        <img
          src={product.image ?? "/placeholder.webp"}
          alt={product.title}
          sizes="(max-width: 640px) 100vw, 33vw"
          className={styles.img}
        />
      </Link>

      <div className={styles.btns}>
        {hasVariants ? (
          /**
           * Variant products require the customer to choose
           * a specific variant before adding the item to cart.
           */
          <Link href={`/product/${product.slug}`} className={styles.add}>
            {soldOut ? "Sold out" : "Choose variant"}
            {!soldOut && <Plus size={14} />}
          </Link>
        ) : (
          /**
           * Simple products can be added directly to the cart.
           * The button is disabled when the product is sold out.
           */
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
            {soldOut ? "Sold out" : "Add to cart"}
            {/* {!soldOut && <Plus size={14} />} */}
            <Plus size={14} />
          </button>
        )}
      </div>
    </article>
  );
}