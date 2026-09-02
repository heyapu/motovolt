// "use client";
// import styles from "./ModelTabs.module.scss";
// import type { Model } from "@/types";

// interface Props {
//   models: Model[];
//   activeId: string;
//   onChange: (id: string) => void;
// }

// export default function ModelTabs({ models, activeId, onChange }: Props) {
//   return (
//     <div className={styles.tabs} role="tablist" aria-label="Vehicle models">
//       {models.map((m) => (
//         <button
//           key={m.id}
//           role="tab"
//           aria-selected={m.id === activeId}
//           className={m.id === activeId ? styles.active : styles.tab}
//           onClick={() => onChange(m.id)}
//         >
//           {m.name}
//           {m.sort_order === 0 && <span className={styles.newBadge}>NEW</span>}
//         </button>
//       ))}
//     </div>
//   );
// }


import Link from "next/link";
import styles from "./ModelTabs.module.scss";
import type { Model } from "@/types";

interface Props {
  models: Model[];
  activeId: string;
}

export default function ModelTabs({ models, activeId }: Props) {
  return (
    <div className={styles.tabs} role="tablist" aria-label="Vehicle models">
      {models.map((m) => (
        <Link
          key={m.id}
          href={`/models/${m.slug}`}
          role="tab"
          aria-selected={m.id === activeId}
          className={m.id === activeId ? styles.active : styles.tab}
          scroll={false}
        >
          {m.name}
          {m.sort_order === 0 && <span className={styles.newBadge}>NEW</span>}
        </Link>
      ))}
    </div>
  );
}