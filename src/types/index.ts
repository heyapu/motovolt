export interface Model {
  id: string;
  name: string;
  slug: string;
  banner_title: string | null;
  banner_image: string | null;
  sort_order: number;
  is_active: boolean;
}

// e.g. { name: "Color", values: [{ value: "Black", hex: "#111111" }] }
//      { name: "Size",  values: [{ value: "M" }, { value: "L" }] }
export interface OptionValue {
  value: string;
  hex?: string; // required when the option is a Color
}
export interface ProductOption {
  name: string;
  values: OptionValue[];
}

// One purchasable combination, e.g. Black / M
export interface ProductVariant {
  id: string;
  product_id: string;
  label: string;                    // "Black / M"
  options: Record<string, string>;  // { Color: "Black", Size: "M" }
  price_override: number | null;
  stock: number;
  image: string | null;
  sort_order: number;
}

export interface Product {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  dimension: string | null;
  price: number;
  stock: number;                    // used when there are no variants
  image: string | null;
  options: ProductOption[];
  sort_order: number;
  is_active: boolean;
  product_variants?: ProductVariant[];
  product_models?: { model_id: string }[];
}

export interface CartItem {
  productId: string;
  variantId: string | null;
  title: string;
  variantLabel: string | null;
  unitPrice: number;
  quantity: number;
  image: string | null;
  slug: string;
}

export interface Address {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
}

export interface OrderItemRow {
  id: string;
  order_id: string;
  product_id: string | null;
  variant_id: string | null;
  title: string;
  variant_label: string | null;
  unit_price: number;
  quantity: number;
}

export interface OrderRow {
  id: string;
  rzp_order_id: string;
  rzp_payment_id: string | null;
  status: "PENDING" | "PAID" | "DELIVERED" | "FAILED" | "REFUNDED";
  amount: number;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  address: Address;
  created_at: string;
  paid_at: string | null;
  order_items: OrderItemRow[];
}

export interface AdminRow {
  id: string;
  email: string;
  role: "superadmin" | "admin";
  added_by: string | null;
  created_at: string;
}
