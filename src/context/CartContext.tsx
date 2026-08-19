"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { CartItem } from "@/types";

interface CartCtx {
  items: CartItem[];
  count: number;
  total: number;
  isOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
  addItem: (item: CartItem) => void;
  updateQty: (productId: string, variantId: string | null, qty: number) => void;
  removeItem: (productId: string, variantId: string | null) => void;
  clearCart: () => void;
}

const CartContext = createContext<CartCtx | null>(null);
const STORAGE_KEY = "motovolt_cart_v1";

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch {}
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (hydrated) localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [items, hydrated]);

  const keyOf = (p: string, v: string | null) => `${p}::${v ?? ""}`;

  const addItem = useCallback((item: CartItem) => {
    setItems((prev) => {
      const k = keyOf(item.productId, item.variantId);
      const existing = prev.find((i) => keyOf(i.productId, i.variantId) === k);
      if (existing) {
        return prev.map((i) =>
          keyOf(i.productId, i.variantId) === k
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      }
      return [...prev, item];
    });
    setIsOpen(true);
  }, []);

  const updateQty = useCallback(
    (productId: string, variantId: string | null, qty: number) => {
      setItems((prev) =>
        qty <= 0
          ? prev.filter(
              (i) => !(i.productId === productId && i.variantId === variantId)
            )
          : prev.map((i) =>
              i.productId === productId && i.variantId === variantId
                ? { ...i, quantity: qty }
                : i
            )
      );
    },
    []
  );

  const removeItem = useCallback(
    (productId: string, variantId: string | null) =>
      updateQty(productId, variantId, 0),
    [updateQty]
  );

  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((n, i) => n + i.quantity, 0);
    const total = items.reduce((n, i) => n + i.unitPrice * i.quantity, 0);
    return {
      items,
      count,
      total,
      isOpen,
      openCart: () => setIsOpen(true),
      closeCart: () => setIsOpen(false),
      addItem,
      updateQty,
      removeItem,
      clearCart,
    };
  }, [items, isOpen, addItem, updateQty, removeItem, clearCart]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
