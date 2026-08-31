'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
// import PrimaryButton from '@/components/button/PrimaryButton';
import styles from './Footer.module.scss';

const BASE_URL = 'https://motovolt-8klfp.ondigitalocean.app';

/* ── Types ─────────────────────────────────────────────────────── */

interface NavLink {
    label: string;
    href: string;
}

interface NavLinksMap {
    [key: string]: NavLink[];
}

interface SocialLink {
    href: string;
    icon: string;
    label: string;
}

/* ── Data ──────────────────────────────────────────────────────── */

const links: NavLinksMap = {
    'Licensed models': [
        { label: 'URBN Climber', href: `${BASE_URL}/urbn` },
        { label: 'M7', href: `${BASE_URL}/m7` },
        { label: 'M7 Lite', href: '#' },
        { label: 'MVS7', href: `${BASE_URL}/mvs7` },
    ],
    'Non-Licensed models': [
        { label: 'URBN', href: `${BASE_URL}/urbn` },
        { label: 'HUM', href: `${BASE_URL}/hum` },
        { label: 'KIVO', href: `${BASE_URL}/kivo` },
        { label: 'KIVO Easy', href: '#' },
        { label: 'KIVO 24', href: '#' },
    ],
    Company: [
        { label: 'About', href: `${BASE_URL}/about` },
        { label: 'Contact', href: `${BASE_URL}/contact` },
        { label: 'FAQ', href: `${BASE_URL}/faq` },
        { label: 'Resources', href: '#' },
        { label: 'Find a store', href: `${BASE_URL}/store-locator` },
    ],
    'Quick links': [
        { label: 'Service Enquiry', href: '#' },
        { label: 'Doorstep Service', href: '#' },
        { label: "Dealer's Enquiry", href: `${BASE_URL}/dealers-enquiry` },
        { label: 'Download iOS App', href: '#' },
        { label: 'Download Android App', href: '#' },
    ],
};

const mobileNavRows: NavLink[] = [
    { label: 'Licensed models', href: '#' },
    { label: 'Non-Licensed models', href: '#' },
    { label: 'About', href: `${BASE_URL}/about` },
    { label: 'Contact', href: `${BASE_URL}/contact` },
    { label: 'FAQ', href: `${BASE_URL}/faq` },
    { label: 'Resources', href: '#' },
    { label: 'Find a Store', href: `${BASE_URL}/store-locator` },
];

const socials: SocialLink[] = [
    { href: '#', icon: `${BASE_URL}/images/social-instagram.png`, label: 'Instagram' },
    { href: '#', icon: `${BASE_URL}/images/social-facebook.png`, label: 'Facebook' },
    { href: '#', icon: `${BASE_URL}/images/social-linkedin.png`, label: 'LinkedIn' },
    { href: '#', icon: `${BASE_URL}/images/social-twitter.png`, label: 'X (Twitter)' },
    { href: '#', icon: `${BASE_URL}/images/social-youtube.png`, label: 'YouTube' },
];

/* ── Icons ─────────────────────────────────────────────────────── */

const ArrowIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="11" height="10" viewBox="0 0 11 10" fill="none">
        <path d="M9.20207 -0.00021258L10.9717 -0.000222114L10.9717 9.70241H9.20207L9.20207 2.80582L1.50064 9.69037L0.249303 8.57176L8.06873 1.58174L-6.49462e-05 1.58174L-6.47684e-05 -0.000213533L9.20207 -0.00021258Z" fill="white" />
    </svg>
);

/* ── Component ─────────────────────────────────────────────────── */

export default function Footer() {
    const pathname = usePathname();

    const thankYouPath =
        pathname === '/' ? `${BASE_URL}/thank-you` : `${BASE_URL}${pathname}/thank-you`;

    return (
        <footer className={styles.footer}>
            <div className={styles.container}>

                {/* ── Desktop nav columns ── */}
                <nav className={styles.linksGrid} aria-label="Footer navigation">
                    {Object.entries(links).map(([col, items]) => (
                        <div key={col} className={styles.linkCol}>
                            <p className={`${styles.colHead} body-3`}>{col}</p>
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
                        <Link href={`${BASE_URL}/`} onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} style={{ cursor: 'pointer' }}>
                            <Image src={`${BASE_URL}/images/footer-logo.png`} alt="Motovolt" width={337} height={28} unoptimized style={{ width: 'auto' }} />
                        </Link>
                    </div>

                    <div className={styles.legalLinks}>
                        <Link href={`${BASE_URL}/return-refund-policy`} className={`${styles.legalLink} body-3 label-4-md`}>Return &amp; Refund Policy</Link>
                        <Link href={`${BASE_URL}/terms-of-service`} className={`${styles.legalLink} body-3 label-4-md`}>Terms of Service</Link>
                        <Link href={`${BASE_URL}/privacy-policy`} className={`${styles.legalLink} body-3 label-4-md`}>Privacy Policy</Link>
                    </div>

                    <div className={styles.socialIcons}>
                        {socials.map((s, index) => (
                            <a key={index} href={s.href} className={styles.socialBtn} aria-label={s.label}>
                                <Image src={s.icon} alt="" width={30} height={30} unoptimized />
                            </a>
                        ))}
                    </div>

                    <p className={`${styles.copyright} body-3`}>©Motovolt Mobility Pvt. Ltd.</p>
                </div>

            </div>
        </footer>
    );
}