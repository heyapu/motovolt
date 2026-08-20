"use client";
import { Minus, Plus } from "lucide-react";
import styles from "./QtyStepper.module.scss";

interface Props {
  value: number;
  min?: number;
  max?: number;
  onChange: (v: number) => void;
}

export default function QtyStepper({ value, min = 1, max = 99, onChange }: Props) {
  return (
    <div className={styles.stepper}>
      <button
        aria-label="Decrease quantity"
        onClick={() => onChange(Math.max(min, value - 1))}
      >
        <Minus size={12} />
      </button>
      <span aria-live="polite">{value}</span>
      <button
        aria-label="Increase quantity"
        onClick={() => onChange(Math.min(max, value + 1))}
      >
        <Plus size={12} />
      </button>
    </div>
  );
}
