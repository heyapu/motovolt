"use client";
import { useMemo, useState } from "react";
import styles from "./AccessoriesPage.module.scss";
import ModelTabs from "@/components/ModelTabs/ModelTabs";
import ModelBanner from "@/components/ModelBanner/ModelBanner";
import ProductCard from "@/components/ProductCard/ProductCard";
import type { Model, Product } from "@/types";

interface Props {
  models: Model[];
  products: Product[];
}

export default function AccessoriesPage({ models, products }: Props) {
  const [activeId, setActiveId] = useState(models[0]?.id ?? "");
  const activeModel = models.find((m) => m.id === activeId) ?? models[0];

  const visible = useMemo(
    () =>
      products.filter((p) =>
        (p.product_models ?? []).some((pm) => pm.model_id === activeId)
      ),
    [products, activeId]
  );

  return (
    <main className={styles.main}>
      <section className={styles.hero}>
        <h1>ACCESSORIES</h1>
        <p>Get all your accessories here under one roof.</p>
        <div className={styles.tabsWrap}>
          <ModelTabs models={models} activeId={activeId} onChange={setActiveId} />
        </div>

        <div className={styles.heromedia}>
          {/* <picture>
            <source media="(max-width: 768px)" srcSet="/assets/MB.png" />
            <img
              src="/assets/DB.png"
              className={styles.herobanner}
              alt=""
            />
          </picture> */}
          <img
            src="/assets/DB.png"
            className={styles.herobanner}
            alt=""
          />
        </div>
      </section>

      <div className={styles.content}>
        {activeModel && <ModelBanner model={activeModel} />}

        <section id="products" className={styles.grid} aria-live="polite">
          {visible.length === 0 ? (
            <p className={styles.none}>
              No accessories for {activeModel?.name} yet. Check back soon.
            </p>
          ) : (
            visible.map((p) => <ProductCard key={p.id} product={p} />)
          )}
        </section>
      </div>
    </main>
  );
}
