import type { Metadata } from "next";
import { Chakra_Petch } from "next/font/google";
import "@/styles/globals.scss";
import localFont from "next/font/local";
import { CartProvider } from "@/context/CartContext";
import CartButton from "@/components/CartButton/CartButton";
import CartDrawer from "@/components/CartDrawer/CartDrawer";
import Navbar from "@/components/system/navbar/Navbar";

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-chakra",
});

const roobert = localFont({
  src: [
    {
      path: "../../public/fonts/roobert/Roobert-Regular.otf",
      weight: "400",
      style: "normal",
    },
    {
      path: "../../public/fonts/roobert/Roobert-SemiBold.otf",
      weight: "600",
      style: "normal",
    },
    {
      path: "../../public/fonts/roobert/Roobert-Bold.otf",
      weight: "700",
      style: "normal",
    },
    {
      path: "../../public/fonts/roobert/Roobert-Medium.otf",
      weight: "500",
      style: "normal",
    }
  ],
  variable: "--font-roobert",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Motovolt Accessories",
  description: "Get all your accessories here under one roof.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${roobert.variable} ${chakra.variable} h-full antialiased`}
    >
      <body>
        <CartProvider>
          <Navbar />
          {children}
          <CartButton />
          <CartDrawer />
        </CartProvider>
      </body>
    </html>
  );
}
