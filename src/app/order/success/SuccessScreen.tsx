"use client";
import Link from "next/link";
import { CheckCircle2, Printer, PhoneCall, XCircle } from "lucide-react";
import styles from "./SuccessScreen.module.scss";
import Invoice from "@/components/Invoice/Invoice";
import type { OrderRow } from "@/types";

const SUPPORT_PHONE = process.env.NEXT_PUBLIC_SUPPORT_PHONE ?? "+91 00000 00000";

export default function SuccessScreen({ order }: { order: OrderRow | null }) {
  if (!order || order.status !== "PAID") {
    return (
      <main className={styles.wrap}>
        <XCircle size={48} className={styles.failIcon} />
        <h1>Payment not completed</h1>
        <p>
          If money was deducted, it will be refunded automatically. You can try
          again or call us at <a href={`tel:${SUPPORT_PHONE}`}>{SUPPORT_PHONE}</a>.
        </p>
        <Link href="/" className={styles.back}>
          Back to accessories
        </Link>
      </main>
    );
  }

  return (
    <main className={styles.wrap}>
      <div className="no-print">
        <CheckCircle2 size={48} className={styles.okIcon} />
        <h1>Order confirmed</h1>
        <p className={styles.lead}>
          Thanks, {order.customer_name.split(" ")[0]}! Your payment went through.
        </p>

        <div className={styles.notice}>
          <PhoneCall size={18} />
          <div>
            <strong>You&apos;ll receive a call within 24 hours</strong>
            <p>
              Our team will confirm your order and delivery details on{" "}
              {order.customer_phone}. There&apos;s no online tracking — this call
              is your confirmation. Questions in the meantime? Call us at{" "}
              <a href={`tel:${SUPPORT_PHONE}`}>{SUPPORT_PHONE}</a>.
            </p>
          </div>
        </div>

        <button className={styles.print} onClick={() => window.print()}>
          <Printer size={16} /> Print invoice
        </button>
      </div>

      <Invoice order={order} />

      <Link href="/" className={`${styles.back} no-print`}>
        Back to accessories
      </Link>
    </main>
  );
}
