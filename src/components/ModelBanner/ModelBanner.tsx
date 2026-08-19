import Image from "next/image";
import { ArrowUpRight } from "lucide-react";
import styles from "./ModelBanner.module.scss";
import type { Model } from "@/types";

export default function ModelBanner({ model }: { model: Model }) {
  return (
    <section className={styles.banner}>
      <div className={styles.info}>
        <span className={styles.label}>{model.name}</span>
        <h2>{model.banner_title ?? `Accessories for ${model.name}.`}</h2>
        <a href="#products" className={styles.buy}>
          Buy Now <ArrowUpRight size={14} />
        </a>
      </div>
      <div className={styles.media}>
        <Image
          src={model.banner_image ?? "/placeholder.webp"}
          alt={model.name}
          fill
          sizes="(max-width: 768px) 100vw, 60vw"
          className={styles.img}
        />
      </div>
      <ArrowUpRight className={styles.corner} size={20} aria-hidden />
    </section>
  );
}
