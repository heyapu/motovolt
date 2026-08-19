// Central zod schemas — every API route validates its input here, so the
// rules live in ONE place and error messages stay consistent.
import { z } from "zod";

const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const isColor = (name: string) => name.trim().toLowerCase() === "color";

// ---------- storefront checkout ----------
export const checkoutSchema = z.object({
  customer: z.object({
    name: z.string().trim().min(2, "Name is required."),
    phone: z.string().regex(/^\d{10}$/, "Phone must be 10 digits."),
    email: z
      .string()
      .trim()
      .email("Invalid email.")
      .optional()
      .or(z.literal("")),
  }),
  address: z.object({
    line1: z.string().trim().min(4, "Address line 1 is required."),
    line2: z.string().trim().optional().or(z.literal("")),
    city: z.string().trim().min(2, "City is required."),
    state: z.string().trim().min(2, "State is required."),
    pincode: z.string().regex(/^\d{6}$/, "Pincode must be 6 digits."),
  }),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        variantId: z.string().uuid().nullable(),
        quantity: z.number().int().min(1).max(99),
      })
    )
    .min(1, "Cart is empty."),
});
export type CheckoutInput = z.infer<typeof checkoutSchema>;

// ---------- razorpay verify ----------
export const razorpayVerifySchema = z.object({
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

// ---------- admin: products ----------
const optionValueSchema = z.object({
  value: z.string().trim().min(1),
  hex: z.string().regex(HEX, "Invalid hex color.").optional(),
});

const optionSchema = z.object({
  name: z.string().trim().min(1),
  values: z.array(optionValueSchema).min(1),
});

export const productPayloadSchema = z
  .object({
    product: z.object({
      title: z.string().trim().min(1, "Title is required."),
      slug: z.string().trim().min(1),
      description: z.string().nullable(),
      dimension: z.string().nullable(),
      price: z.number().positive("Price must be greater than 0."),
      stock: z.number().int().min(0),
      image: z.string().url().nullable(),
      options: z.array(optionSchema),
      is_active: z.boolean(),
      updated_at: z.string(),
    }),
    modelIds: z.array(z.string().uuid()).min(1, "Pick at least one model."),
    variants: z.array(
      z.object({
        label: z.string().trim().min(1),
        options: z.record(z.string(), z.string()),
        price_override: z.number().positive().nullable(),
        stock: z.number().int().min(0),
        image: z.string().url().nullable(),
      })
    ),
  })
  .superRefine((data, ctx) => {
    // Color option values must carry a valid hex — that hex draws the
    // swatch dots on the storefront.
    for (const o of data.product.options) {
      if (!isColor(o.name)) continue;
      for (const v of o.values) {
        if (!v.hex || !HEX.test(v.hex)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Color "${v.value}" needs a valid hex like #FF5A1F.`,
            path: ["product", "options"],
          });
        }
      }
    }
    // Every variant's option keys must exist in the product's options.
    const optionNames = new Set(data.product.options.map((o) => o.name));
    for (const v of data.variants) {
      for (const key of Object.keys(v.options)) {
        if (!optionNames.has(key)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Variant "${v.label}" uses unknown option "${key}".`,
            path: ["variants"],
          });
        }
      }
    }
  });
export type ProductPayload = z.infer<typeof productPayloadSchema>;

// ---------- admin: models ----------
export const modelCreateSchema = z.object({
  name: z.string().trim().min(1, "Model name is required."),
  banner_title: z.string().trim().optional().or(z.literal("")),
  banner_image: z.string().url().nullable().optional(),
  sort_order: z.number().int().min(0).optional(),
});

export const modelUpdateSchema = modelCreateSchema.extend({
  is_active: z.boolean().optional(),
});

// ---------- admin: admins ----------
export const adminCreateSchema = z.object({
  email: z.string().trim().toLowerCase().email("Valid email required."),
  role: z.enum(["admin", "superadmin"]),
});

// ---------- admin: order actions ----------
export const orderActionSchema = z.object({
  id: z.string().uuid("Invalid order id."),
  action: z.enum(["deliver", "refund"]),
});

// ---------- shared helper ----------
// First human-readable message out of a zod failure.
export function firstError(error: z.ZodError): string {
  return error.issues[0]?.message ?? "Invalid input.";
}
