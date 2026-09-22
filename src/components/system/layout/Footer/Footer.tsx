'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import styles from './footer.module.scss';
import PrimaryButton from '../button/PrimaryButton';

/* ── Data (hardcoded snapshot — not fetched from the CMS) ────────── */

const CTA_EYEBROW = 'BOOK A TEST RIDE';
const CTA_HEADING = 'Start savings journey with Motovolt';
const SUBMIT_TEXT = 'Book your test ride';
const FORM_NOTE = 'A Motovolt executive will call you in a short while to confirm your booking and walk you through the process.';
const FOOTER_LOGO = 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/08/footer-logo.png';
const COPYRIGHT = '©Motovolt Mobility Pvt. Ltd.';

const VEHICLE_OPTIONS = ['M7', 'MVS7', 'M7 Lite', 'Kivo', 'Kivo 24', 'Kivo Easy', 'Hum', 'Urbn', 'Urbn X'];

const links = {
  'Licensed models': [
    { label: 'M7', href: '/m7' },
    { label: 'M7 Lite', href: '/m7' },
    { label: 'MVS7', href: '/mvs7' },
  ],
  'Non-Licensed models': [
    { label: 'URBN', href: '/urbn' },
    { label: 'HUM', href: '/hum' },
    { label: 'KIVO', href: '/kivo' },
    { label: 'KIVO Easy', href: '/kivo' },
    { label: 'KIVO 24', href: '/kivo' },
  ],
  'Company': [
    { label: 'About', href: '/about' },
    { label: 'Contact', href: '/contact' },
    { label: 'FAQ', href: '/faq' },
    { label: 'Resources', href: '/blog' },
    { label: 'Find a store', href: '/store-locator' },
  ],
  'Quick links': [
    { label: "Dealer's Enquiry", href: '/dealers-enquiry' },
    { label: 'Help', href: '/help' },
  ],
};

const mobileNavRows = [
  { label: 'About', href: '/about' },
  { label: 'Contact', href: '/contact' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Resources', href: '/blog' },
  { label: 'Find a Store', href: '/store-locator' },
];

const legalLinks = [
  { label: 'Return & Refund Policy', href: '/return-refund-policy' },
  { label: 'Terms Of Service', href: '/terms-of-service' },
  { label: 'Privacy Policy', href: '/privacy-policy' },
];

const socials = [
  { href: 'https://www.instagram.com/worldofmotovolt', icon: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/08/social-instagram.png', label: 'Instagram' },
  { href: 'https://m.facebook.com/motovoltindia/', icon: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/08/social-facebook.png', label: 'Facebook' },
  { href: 'https://in.linkedin.com/company/motovolt-mobility', icon: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/08/social-linkedin.png', label: 'LinkedIn' },
  { href: 'https://twitter.com/MotovoltIndia', icon: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/08/social-twitter.png', label: 'X (Twitter)' },
  { href: 'https://youtube.com/@motovoltmobility', icon: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/08/social-youtube.png', label: 'YouTube' },
];

const ArrowIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="10" viewBox="0 0 11 10" fill="none"> <path d="M9.20207 -0.00021258L10.9717 -0.000222114L10.9717 9.70241H9.20207L9.20207 2.80582L1.50064 9.69037L0.249303 8.57176L8.06873 1.58174L-6.49462e-05 1.58174L-6.47684e-05 -0.000213533L9.20207 -0.00021258Z" fill="white" /> </svg>
);

export default function Footer() {
  const pathname = usePathname();
  const router = useRouter();
  const thankYouPath = pathname?.endsWith('/thank-you')
    ? pathname
    : pathname === '/' ? '/thank-you' : `${pathname}/thank-you`;

  const [form, setForm] = useState({ fullName: '', phone: '', vehicleOfInterest: VEHICLE_OPTIONS[0] });
  const [submitted, setSubmitted] = useState(false);
  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (thankYouPath === pathname) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      router.push(thankYouPath);
    }
  };

  return (
    <footer className={styles.footer}>
      <div className="container">

        {/* ── CTA card ── */}
        <div className={styles.cta}>
          <div className={styles.ctaLeft}>
            <p className={`${styles.ctaEyebrow} label-3 label-3-md`}>{CTA_EYEBROW}</p>
            <h2 className={`${styles.ctaHeading}`}>
              {CTA_HEADING}
            </h2>
          </div>
          <form className={styles.ctaForm} onSubmit={handleSubmit}>
            <div className={styles.formRow}>
              <input className={`${styles.input} label-2 label-3-md`} type="text" placeholder="Full Name" aria-label="Full Name" value={form.fullName} onChange={set('fullName')} required />
              <input className={`${styles.input} label-2 label-3-md`} type="tel" placeholder="Phone Number" aria-label="Phone Number" value={form.phone} onChange={set('phone')} required />
            </div>
            <div className={styles.formRow}>
              <div className={styles.selectWrap}>
                <select className={`${styles.input} ${styles.select} label-2 label-3-md`} value={form.vehicleOfInterest} onChange={set('vehicleOfInterest')} aria-label="Vehicle of interest" required>
                  {VEHICLE_OPTIONS.map(opt => (
                    <option key={opt}>{opt}</option>
                  ))}
                </select>
                <svg className={styles.chevron} width="8" height="4" viewBox="0 0 8 4" fill="none" aria-hidden>
                  <path d="M1 0.5l3 3 3-3" stroke="#000" strokeWidth="1.2" strokeLinecap="round" />
                </svg>
              </div>
            </div>
            <div className={styles.formSubmitRow}>
              <PrimaryButton
                type="submit"
                className={`${styles.submitBtn} label-3 label-3-md`}
                title={SUBMIT_TEXT}
                doubleArrow
              />

              <p className={`${styles.formNote} body-3 label-1-md`}>
                {submitted && FORM_NOTE}
              </p>
            </div>
          </form>
        </div>

        {/* ── Desktop nav columns ── */}
        <nav className={styles.linksGrid} aria-label="Footer navigation">
          {Object.entries(links).map(([title, items]) => (
            <div key={title} className={styles.linkCol}>
              <p className={`${styles.colHead} body-3`}>{title}</p>
              <ul className={styles.colList}>
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href} className={`${styles.colLink} label-2`}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>

        {/* ── Mobile nav rows ── */}
        <nav className={styles.mobileNav} aria-label="Footer navigation">
          {mobileNavRows.map((row) => (
            <Link key={row.label} href={row.href} className={`${styles.mobileNavRow} body-2 label-1-md`}>
              <span>{row.label}</span>
              <ArrowIcon />
            </Link>
          ))}
        </nav>

        {/* ── Bottom: logo / legal / socials / copyright ── */}
        <div className={styles.bottomWrap}>
          <div className={styles.logoWrap}>
            <Link href="/" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
              <img src={FOOTER_LOGO} alt="Motovolt" width="337" height="28" style={{ width: 'auto' }} />
            </Link>
          </div>

          <div className={styles.legalLinks}>
            {legalLinks.map((item, i) => (
              <Link key={i} href={item.href} className={`${styles.legalLink} body-3 label-4-md`} aria-label={item.label}>{item.label}</Link>
            ))}
          </div>

          <div className={styles.socialIcons}>
            {socials.map((s, index) => (
              <a key={index} href={s.href} target="_blank" rel="noreferrer" className={styles.socialBtn} aria-label={s.label}>
                <img src={s.icon} alt="" width="30" height="30" />
              </a>
            ))}
          </div>

          <p className={`${styles.copyright} body-3`}>{COPYRIGHT}</p>
        </div>

      </div>
    </footer>
  );
}