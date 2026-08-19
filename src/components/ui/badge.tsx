import * as React from "react";
import { cn } from "@/lib/utils";

type Variant = "default" | "secondary" | "destructive" | "outline";

const variants: Record<Variant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground",
  destructive: "bg-destructive text-destructive-foreground",
  outline: "border text-foreground",
};

export const Badge = ({
  className,
  variant = "default",
  ...props
}: React.HTMLAttributes<HTMLDivElement> & { variant?: Variant }) => (
  <div
    className={cn(
      "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
      variants[variant],
      className
    )}
    {...props}
  />
);
