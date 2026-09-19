import styles from "@/app/(storefront)/AccessoriesPage.module.scss";

export default function LoadingSkeleton() {
    return (
        <main className={styles.main}>
            <section className={styles.hero}>
                <div className="h-10 w-64 bg-muted animate-pulse rounded mb-4" />
                <div className="h-6 w-96 bg-muted animate-pulse rounded mb-8" />
                <div className="flex gap-4 mb-8">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-10 w-24 bg-muted animate-pulse rounded-full" />
                    ))}
                </div>
                <div className="h-[40vh] w-full bg-muted animate-pulse rounded-xl" />
            </section>

            <div className={styles.content}>
                <section className={styles.grid}>
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="flex flex-col gap-4">
                            <div className="h-64 w-full bg-muted animate-pulse rounded-lg" />
                            <div className="h-6 w-3/4 bg-muted animate-pulse rounded" />
                            <div className="h-4 w-1/4 bg-muted animate-pulse rounded" />
                        </div>
                    ))}
                </section>
            </div>
        </main>
    );
}