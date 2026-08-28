"use client";
import { useMemo, useState } from "react";
import Image from "next/image";
import { Plus, ShoppingCart } from "lucide-react";
import styles from "./ProductDetail.module.scss";
import { useCart } from "@/context/CartContext";
import { inr } from "@/lib/format";
import QtyStepper from "@/components/QtyStepper/QtyStepper";
import type { Product } from "@/types";
import Navbar from "../system/navbar/Navbar";

export default function ProductDetail({ product }: { product: Product }) {
  const { addItem, openCart } = useCart();
  const variants = product.product_variants ?? [];
  const options = product.options ?? [];
  const hasOptions = options.length > 0 && variants.length > 0;

  // default: first value of each option
  const [selected, setSelected] = useState<Record<string, string>>(() =>
    Object.fromEntries(options.map((o) => [o.name, o.values[0]?.value ?? ""]))
  );
  const [qty, setQty] = useState(1);

  // The purchasable unit for the current selection
  const currentVariant = useMemo(() => {
    if (!hasOptions) return null;
    return (
      variants.find((v) =>
        Object.entries(selected).every(([k, val]) => v.options[k] === val)
      ) ?? null
    );
  }, [variants, selected, hasOptions]);

  const price = currentVariant?.price_override ?? product.price;
  const image = currentVariant?.image ?? product.image;
  const stock = hasOptions ? currentVariant?.stock ?? 0 : product.stock;
  const unavailable = hasOptions && !currentVariant;

  // Is a given value in stock, keeping the other selections fixed?
  function valueHasStock(optionName: string, value: string) {
    const trial = { ...selected, [optionName]: value };
    const v = variants.find((x) =>
      Object.entries(trial).every(([k, val]) => x.options[k] === val)
    );
    return (v?.stock ?? 0) > 0;
  }

  function add() {
    addItem({
      productId: product.id,
      variantId: currentVariant?.id ?? null,
      title: product.title,
      variantLabel: currentVariant?.label ?? null,
      unitPrice: price,
      quantity: qty,
      image,
      slug: product.slug,
    });
  }

  return (
    <>
      <Navbar />
      <div className={styles.wrap}>
        <div className={styles.media}>
          <Image
            src={image ?? "/placeholder.webp"}
            alt={product.title}
            fill
            sizes="(max-width: 768px) 100vw, 45vw"
            priority
          />
        </div>
        <div className={styles.infowraper}>
          <div className={styles.info}>

            <div className={styles.metadata}>
              <h1>{product.title}</h1>
              {product.description && <p className={styles.desc}>{product.description}</p>}
            </div>


            <div className={styles.moreinfo}>

              {options.map((o) => (
                <div className={styles.block} key={o.name}>
                  <span className={styles.label}>
                    {o.name}

                    {/* Color Name */}
                    {/* {selected[o.name] ? `: ${selected[o.name]}` : ""} */}
                  </span>
                  <div className={styles.swatches}>
                    {o.values.map((v) => {
                      const active = selected[o.name] === v.value;
                      const outOfStock = !valueHasStock(o.name, v.value);
                      return v.hex ? (
                        <button
                          key={v.value}
                          aria-label={`${o.name} ${v.value}${outOfStock ? " (out of stock)" : ""}`}
                          aria-pressed={active}
                          className={`${active ? styles.swatchOn : styles.swatch} ${outOfStock ? styles.swatchOut : ""
                            }`}
                          style={{ "--swatch-color": v.hex } as React.CSSProperties}
                          title={v.value}
                          onClick={() => setSelected((s) => ({ ...s, [o.name]: v.value }))}
                        />
                      ) : (
                        <button
                          key={v.value}
                          aria-pressed={active}
                          className={`${active ? styles.pillOn : styles.pill} ${outOfStock ? styles.pillOut : ""
                            }`}
                          onClick={() => setSelected((s) => ({ ...s, [o.name]: v.value }))}
                        >
                          {v.value}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}

              {product.dimension && (
                <div className={styles.block}>
                  <span className={styles.label}>Dimension</span>
                  <p className={styles.value}>{product.dimension}</p>
                </div>
              )}


            </div>

            <div className={styles.datawraper}>
              <p className={styles.datalabel}>Price</p>
              <p className={styles.price}>{inr(price)}</p>
            </div>

            <div>
              <QtyStepper value={qty} max={Math.max(stock, 1)} onChange={setQty} />
            </div>


            <div className={styles.actions}>
              <button
                className={styles.add}
                disabled={stock <= 0 || unavailable}
                onClick={add}
              >
                {unavailable
                  ? "Combination unavailable"
                  : stock <= 0
                    ? "Sold out"
                    : "Add to cart"}{" "}
                <Plus size={14} />
              </button>
              <button className={styles.cartIcon} aria-label="Open cart" onClick={openCart}>
                <ShoppingCart size={20} />
              </button>
            </div>
          </div>
        </div>

      </div>
    </>
  );
}
