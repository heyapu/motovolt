import Link from "next/link";
import { Zap } from "lucide-react";
import styles from "./Navbar.module.scss";

const LINKS = [
  { label: "Smart Vehicles", href: "#" },
  { label: "Accessories", href: "/" },
  { label: "Swapping Station", href: "#" },
  { label: "Store Locator", href: "#" },
  { label: "Dealers Enquiry", href: "#" },
  { label: "More", href: "#" },
];

export default function Navbar() {
  return (
    <header className={`${styles.nav} no-print`}>
      <Link href="/" className={styles.logo}>
        <Zap size={18} aria-hidden />
        <span>MOTOVOLT</span>
      </Link>
      <nav className={styles.links}>
        {LINKS.map((l) => (
          <Link key={l.label} href={l.href}>
            {l.label}
          </Link>
        ))}
      </nav>
      <a href="#" className={styles.cta}>
        Book Now ↗
      </a>
    </header>
  );
}
