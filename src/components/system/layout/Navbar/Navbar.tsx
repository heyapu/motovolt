'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './navbar.module.scss';

/* ── Data (hardcoded snapshot — not fetched from the CMS) ────────── */

const NAV_ITEMS = [
  { label: 'Smart Vehicles', tab: 'smart-vehicles' },
  { label: 'Accessories', tab: 'accessories' },
  { href: '/store-locator', label: 'Store Locator' },
  { href: '/dealers-enquiry', label: 'Dealership enquiry' },
  { label: 'More', tab: 'more' },
];

const MEGA_NAV_ITEMS = [
  { label: 'Smart Vehicles', tab: 'smart-vehicles' },
  { label: 'Accessories', tab: 'accessories' },
  { href: '/store-locator', label: 'Store Locator' },
  { href: '/compare-models', label: 'Compare Models' },
  { href: '/dealers-enquiry', label: 'Dealership Enquiry' },
  { href: '/b2b', label: 'B2B Sales' },
  { href: '/about', label: 'About' },
  { label: 'More', tab: 'more' },
];

const MOBILE_NAV_ITEMS = MEGA_NAV_ITEMS;

const MORE_ITEMS = [
  { name: 'Blogs', href: '/blog' },
  { name: 'News', href: '/news' },
  { name: 'FAQs', href: '/faq' },
  { name: 'Support', href: '/help' },
  { name: 'Contact Us', href: '/contact' },
  { name: 'Careers', href: '/careers' },
];

const ACCESSORIES_ITEMS = [
  { name: 'M7', href: '/m7' },
  { name: 'Urbn X', href: '/urbnx', tag: true },
  { name: 'Urbn', href: '/urbn' },
  { name: 'Kivo', href: '/kivo' },
  { name: 'Hum', href: '/hum' },
];

const MOBILE_SUB_LABELS: Record<string, string> = {
  'smart-vehicles': 'Smart Vehicles',
  'accessories': 'Accessories',
  'more': 'More',
};

const VEHICLE_SECTIONS = [
  {
    label: 'E- Scooters',
    products: [
      { name: 'M7', image: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/09/m7-.png', href: '/m7', fullWidth: false },
      { name: 'MVS7', image: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/09/mvs7.png', href: '/mvs7', fullWidth: false },
      { name: 'M7 Lite', image: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/09/m7-lite.png', href: '/m7', fullWidth: false },
    ],
  },
  {
    label: 'E- Mopeds',
    products: [
      { name: 'UrbnX', image: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/09/urbn-x-bike.png', href: '/urbnx', fullWidth: false },
      { name: 'Urbn', image: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/09/urbn-bike.png', href: '/urbn', fullWidth: false },
    ],
  },
  {
    label: 'E- Cycles',
    products: [
      { name: 'HUM', image: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/08/hum-1.png', href: '/hum', fullWidth: false },
      { name: 'Kivo 24', image: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/08/kivo-24.png', href: '/kivo', fullWidth: false },
      { name: 'Kivo', image: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/08/ham-kivo.png', href: '/kivo', fullWidth: false },
      { name: 'Kivo Easy', image: 'https://backend-motovolt.supercode.in/wp-content/uploads/2026/08/kivo-easy.png', href: '/kivo', fullWidth: false },
    ],
  },
];

const LEGAL_LINKS = [
  { label: 'Warranty Policy', href: '/warranty/' },
  { label: 'Terms of Service', href: '/terms-of-service/' },
  { label: 'Privacy Policy', href: '/privacy-policy/' },
  { label: 'Return & Refund Policy', href: '/return-refund-policy/' },
];

const SOCIAL_LINKS: Record<string, string> = {
  instagram: 'https://www.instagram.com/worldofmotovolt',
  facebook: 'https://m.facebook.com/motovoltindia/',
  linkedin: 'https://in.linkedin.com/company/motovolt-mobility',
  x: 'https://twitter.com/MotovoltIndia',
  youtube: 'https://youtube.com/@motovoltmobility',
};

const COPYRIGHT = '©Motovolt Mobility Pvt. Ltd.';

/* ── Icons ─────────────────────────────────────────────────────── */

const ArrowSvg = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="10" viewBox="0 0 16 14" fill="none"> <path d="M13.1693 0.00012602L15.7019 0.000112673L15.7019 13.8857H13.1693L13.1693 4.01589L2.14769 13.8685L0.356879 12.2676L11.5474 2.26408L5.22372e-06 2.26408L5.40147e-06 0.000125385L13.1693 0.00012602Z" fill="#F15B25" /> </svg>
);
const ArrowSvgWhite = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="10" viewBox="0 0 11 10" fill="none"> <path d="M10.2903 0L10.2903 9.1H8.63059L8.63059 2.63176L1.4075 9.08871L0.23388 8.03958L7.56764 1.4837L5.23354e-08 1.4837L0 7.67681e-06L10.2903 0Z" fill="white" /> </svg>
);

const CloseIcon = ({ size = 22, strokeWidth = 1.5 }) => (
  <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 27" fill="none">
    <path d="M0 2.53125C0 1.13328 1.13328 0 2.53125 0H27C28.398 0 29.5312 1.13328 29.5312 2.53125V24.4688C29.5312 25.8667 28.398 27 27 27H2.53125C1.13328 27 0 25.8667 0 24.4688V2.53125Z" fill="white" fillOpacity="0.2" />
    <path d="M8.90234 7.96497L20.5146 19.0337" stroke="white" strokeWidth={strokeWidth} />
    <path d="M20.0474 7.96582L8.43515 19.0346" stroke="white" strokeWidth={strokeWidth} />
  </svg>
);

const InstagramIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
    <path d="M12.0923 9.24704C12.0923 9.80977 11.9254 10.3599 11.6128 10.8278C11.3001 11.2957 10.8558 11.6603 10.3359 11.8757C9.81596 12.091 9.24388 12.1474 8.69196 12.0376C8.14003 11.9278 7.63306 11.6568 7.23515 11.2589C6.83723 10.861 6.56625 10.354 6.45646 9.80212C6.34668 9.25019 6.40303 8.67811 6.61838 8.15821C6.83373 7.63831 7.19841 7.19394 7.66631 6.8813C8.1342 6.56867 8.6843 6.40179 9.24704 6.40179C10.0016 6.40179 10.7253 6.70156 11.2589 7.23515C11.7925 7.76873 12.0923 8.49243 12.0923 9.24704ZM18.4941 4.97917V13.5149C18.4927 14.835 17.9676 16.1007 17.0341 17.0341C16.1007 17.9676 14.835 18.4927 13.5149 18.4941H4.97917C3.65905 18.4927 2.3934 17.9676 1.45993 17.0341C0.526456 16.1007 0.00141215 14.835 0 13.5149V4.97917C0.00141215 3.65905 0.526456 2.3934 1.45993 1.45993C2.3934 0.526456 3.65905 0.00141215 4.97917 0H13.5149C14.835 0.00141215 16.1007 0.526456 17.0341 1.45993C17.9676 2.3934 18.4927 3.65905 18.4941 4.97917ZM13.5149 9.24704C13.5149 8.40293 13.2646 7.57779 12.7956 6.87594C12.3267 6.17409 11.6601 5.62707 10.8803 5.30405C10.1004 4.98102 9.2423 4.8965 8.41442 5.06118C7.58653 5.22586 6.82607 5.63233 6.2292 6.2292C5.63233 6.82607 5.22586 7.58653 5.06118 8.41442C4.8965 9.2423 4.98102 10.1004 5.30405 10.8803C5.62707 11.6601 6.17409 12.3267 6.87594 12.7956C7.57779 13.2646 8.40293 13.5149 9.24704 13.5149C10.3786 13.5137 11.4634 13.0637 12.2636 12.2636C13.0637 11.4634 13.5137 10.3786 13.5149 9.24704ZM15.6488 3.91221C15.6488 3.70118 15.5863 3.49489 15.469 3.31943C15.3518 3.14397 15.1851 3.00722 14.9902 2.92646C14.7952 2.8457 14.5807 2.82457 14.3737 2.86574C14.1667 2.90691 13.9766 3.00853 13.8274 3.15775C13.6782 3.30697 13.5766 3.49708 13.5354 3.70405C13.4942 3.91102 13.5154 4.12556 13.5961 4.32052C13.6769 4.51548 13.8136 4.68212 13.9891 4.79936C14.1646 4.9166 14.3708 4.97917 14.5819 4.97917C14.8648 4.97917 15.1362 4.86676 15.3363 4.66667C15.5364 4.46657 15.6488 4.19518 15.6488 3.91221Z" fill="white" />
  </svg>
);

const FacebookIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
    <path d="M18.3475 0H1.07127C0.479806 0 0 0.456958 0 1.02026V17.4738C0 18.0379 0.479806 18.4941 1.07127 18.4941H10.3712V11.3322H7.83952V8.54195H10.3712V6.48063C10.3712 4.09258 11.9037 2.79338 14.1409 2.79338C15.213 2.79338 16.1346 2.86812 16.4032 2.90203V5.39873H14.8489C13.6352 5.39873 13.399 5.95432 13.399 6.76344V8.54426H16.2988L15.9226 11.3415H13.399V18.4941H18.3467C18.9398 18.4941 19.4188 18.0379 19.4188 17.4738V1.02026C19.4188 0.456958 18.9398 0 18.3475 0Z" fill="white" />
  </svg>
);

const LinkedInIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
    <path d="M17.1259 0C17.88 0 18.4941 0.59704 18.4941 1.33347V17.1596C18.4941 17.896 17.88 18.4941 17.1259 18.4941H1.3641C0.611537 18.4941 0 17.896 0 17.1596V1.33347C0 0.59704 0.611537 0 1.3641 0H17.1259ZM15.7598 15.7589V10.9186C15.7598 8.54168 15.2466 6.71423 12.4692 6.71423C11.1346 6.71423 10.2396 7.44597 9.87387 8.13979H9.83631V6.93325H7.20689V15.7589H9.94664V11.3937C9.94664 10.2424 10.1644 9.12687 11.5917 9.12687C12.9994 9.12687 13.017 10.4436 13.017 11.467V15.7589H15.7598ZM5.48607 6.93325H2.74025V15.7589H5.48607V6.93325ZM4.11388 2.54604C3.23291 2.54604 2.52253 3.25871 2.52253 4.13667C2.52253 5.01484 3.23291 5.72747 4.11388 5.72747C4.99139 5.72747 5.70379 5.01484 5.70379 4.13667C5.70379 3.25871 4.99139 2.54604 4.11388 2.54604Z" fill="white" />
  </svg>
);

const XIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
    <path d="M16.9471 0H1.54695C0.692564 0 0 0.692564 0 1.54695V16.9471C0 17.8015 0.692564 18.4941 1.54695 18.4941H16.9471C17.8015 18.4941 18.4941 17.8015 18.4941 16.9471V1.54695C18.4941 0.692564 17.8015 0 16.9471 0ZM11.9668 15.9722L8.29947 10.7492L3.70843 15.9722H2.52192L7.7733 9.99968L2.52192 2.52192H6.52727L9.99922 7.46653L14.3494 2.52192H15.5358L10.5282 8.21779L15.9722 15.9722H11.9668Z" fill="white" />
  </svg>
);

const YoutubeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="19" viewBox="0 0 24 19" fill="none">
    <path d="M22.7373 3.07427C22.6391 2.69035 22.4511 2.33526 22.1888 2.0383C21.9264 1.74134 21.5972 1.51102 21.2282 1.36634C17.6583 -0.0124931 11.9763 3.96148e-06 11.6639 3.96148e-06C11.3514 3.96148e-06 5.66948 -0.0124931 2.0995 1.36634C1.73059 1.51102 1.40137 1.74134 1.13899 2.0383C0.876618 2.33526 0.688612 2.69035 0.590484 3.07427C0.320757 4.1136 0 6.01315 0 9.16448C0 12.3158 0.320757 14.2154 0.590484 15.2547C0.688465 15.6388 0.876405 15.9941 1.13879 16.2912C1.40117 16.5884 1.73047 16.8189 2.0995 16.9637C5.51951 18.2831 10.8724 18.329 11.5951 18.329H11.7326C12.4554 18.329 17.8114 18.2831 21.2282 16.9637C21.5973 16.8189 21.9266 16.5884 22.189 16.2912C22.4513 15.9941 22.6393 15.6388 22.7373 15.2547C23.007 14.2133 23.3277 12.3158 23.3277 9.16448C23.3277 6.01315 23.007 4.1136 22.7373 3.07427ZM15.0579 9.84348L10.8922 12.7595C10.7676 12.8467 10.6214 12.8983 10.4696 12.9084C10.3178 12.9185 10.1661 12.8869 10.031 12.8169C9.89593 12.7469 9.78257 12.6413 9.70324 12.5115C9.62391 12.3817 9.58165 12.2326 9.58104 12.0804V6.24851C9.58108 6.0961 9.62293 5.94662 9.70203 5.81635C9.78113 5.68607 9.89445 5.57999 10.0297 5.50965C10.1649 5.43931 10.3168 5.4074 10.4689 5.4174C10.6209 5.42741 10.7674 5.47894 10.8922 5.56638L15.0579 8.48235C15.1674 8.55919 15.2569 8.6613 15.3186 8.78004C15.3804 8.89877 15.4126 9.03064 15.4126 9.16448C15.4126 9.29831 15.3804 9.43018 15.3186 9.54892C15.2569 9.66765 15.1674 9.76976 15.0579 9.84661V9.84348Z" fill="white" />
  </svg>
);

/* ── Component ─────────────────────────────────────────────────── */

export default function Navbar() {
  const pathname = usePathname();

  const [menuOpen, setMenuOpen] = useState(false);
  const [megaOpen, setMegaOpen] = useState(false);
  const [megaActiveTab, setMegaActiveTab] = useState('smart-vehicles');
  const [mobileSubTab, setMobileSubTab] = useState<string | null>(null);
  const [navClass, setNavClass] = useState('');
  const lastScrollY = useRef(0);
  const pageNavVisible = useRef(false);
  const productColRef = useRef<HTMLDivElement>(null);
  const scrollTrackRef = useRef<HTMLDivElement>(null);
  const scrollThumbRef = useRef<HTMLDivElement>(null);
  const mobileSubRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const lock = menuOpen || megaOpen;
    document.body.style.overflow = lock ? 'hidden' : '';
    document.body.style.overscrollBehavior = lock ? 'none' : '';
    document.documentElement.style.overflow = lock ? 'hidden' : '';
    document.documentElement.style.overscrollBehavior = lock ? 'none' : '';
    return () => {
      document.body.style.overflow = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overflow = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [menuOpen, megaOpen]);

  useEffect(() => {
    const onScroll = () => {
      if (pageNavVisible.current || megaOpen) return;
      const current = window.scrollY;
      if (current > 100 && current > lastScrollY.current) {
        setNavClass(styles.hideheader);
      } else {
        setNavClass(styles.showheader);
      }
      lastScrollY.current = current;
    };

    const onHide = () => {
      pageNavVisible.current = true;
      setNavClass(styles.hideheader);
    };

    const onShow = () => {
      pageNavVisible.current = false;
      setNavClass(styles.showheader);
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMegaOpen(false);
        setMenuOpen(false);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('navbar-hide', onHide);
    window.addEventListener('navbar-show', onShow);
    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('navbar-hide', onHide);
      window.removeEventListener('navbar-show', onShow);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [megaOpen]);

  useEffect(() => {
    if (!megaOpen) return;
    const el = productColRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      el.scrollTop += e.deltaY;
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, [megaOpen]);

  useEffect(() => {
    if (!megaOpen) return;
    const content = productColRef.current;
    const track = scrollTrackRef.current;
    const thumb = scrollThumbRef.current;
    if (!content || !track || !thumb) return;

    const MIN_THUMB = 24;

    const update = () => {
      const { scrollTop, scrollHeight, clientHeight } = content;
      const trackHeight = track.clientHeight;
      const scrollable = scrollHeight - clientHeight;

      if (scrollable <= 1) {
        track.style.display = 'none';
        return;
      }
      track.style.display = 'block';

      const thumbHeight = Math.max(MIN_THUMB, (clientHeight / scrollHeight) * trackHeight);
      const thumbTop = (scrollTop / scrollable) * (trackHeight - thumbHeight);
      thumb.style.height = `${thumbHeight}px`;
      thumb.style.transform = `translateY(${thumbTop}px)`;
    };

    update();
    content.addEventListener('scroll', update);
    const resizeObserver = new ResizeObserver(update);
    resizeObserver.observe(content);

    let dragging = false;
    let startY = 0;
    let startScrollTop = 0;

    const onThumbMouseDown = (e: MouseEvent) => {
      dragging = true;
      startY = e.clientY;
      startScrollTop = content.scrollTop;
      document.body.style.userSelect = 'none';
    };
    const onDocMouseMove = (e: MouseEvent) => {
      if (!dragging) return;
      const { scrollHeight, clientHeight } = content;
      const trackHeight = track.clientHeight;
      const thumbHeight = Math.max(MIN_THUMB, (clientHeight / scrollHeight) * trackHeight);
      const scrollable = scrollHeight - clientHeight;
      const trackable = trackHeight - thumbHeight;
      const deltaY = e.clientY - startY;
      content.scrollTop = startScrollTop + (deltaY / trackable) * scrollable;
    };
    const onDocMouseUp = () => {
      dragging = false;
      document.body.style.userSelect = '';
    };
    const onTrackMouseDown = (e: MouseEvent) => {
      if (e.target !== track) return;
      const rect = track.getBoundingClientRect();
      const { scrollHeight, clientHeight } = content;
      const trackHeight = track.clientHeight;
      const thumbHeight = Math.max(MIN_THUMB, (clientHeight / scrollHeight) * trackHeight);
      const clickRatio = (e.clientY - rect.top - thumbHeight / 2) / (trackHeight - thumbHeight);
      content.scrollTop = clickRatio * (scrollHeight - clientHeight);
    };

    thumb.addEventListener('mousedown', onThumbMouseDown);
    track.addEventListener('mousedown', onTrackMouseDown);
    document.addEventListener('mousemove', onDocMouseMove);
    document.addEventListener('mouseup', onDocMouseUp);

    return () => {
      content.removeEventListener('scroll', update);
      resizeObserver.disconnect();
      thumb.removeEventListener('mousedown', onThumbMouseDown);
      track.removeEventListener('mousedown', onTrackMouseDown);
      document.removeEventListener('mousemove', onDocMouseMove);
      document.removeEventListener('mouseup', onDocMouseUp);
    };
  }, [megaOpen, megaActiveTab]);

  useEffect(() => {
    if (!menuOpen || !mobileSubTab) return;
    const el = mobileSubRef.current;
    if (!el) return;
    let startY = 0;
    const onTouchStart = (e: TouchEvent) => { startY = e.touches[0].clientY; };
    const onTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      const dy = startY - e.touches[0].clientY;
      el.scrollTop += dy;
      startY = e.touches[0].clientY;
    };
    const onWheel = (e: WheelEvent) => { e.preventDefault(); el.scrollTop += e.deltaY; };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('wheel', onWheel);
    };
  }, [menuOpen, mobileSubTab]);

  const closeMega = useCallback(() => setMegaOpen(false), []);
  const openMega = useCallback((tab: string) => {
    setMegaActiveTab(tab);
    setMegaOpen(true);
  }, []);
  const closeMenu = useCallback(() => { setMenuOpen(false); setMobileSubTab(null); }, []);

  const getSocialHref = (platform: string) => SOCIAL_LINKS[platform] || '#';

  if (pathname?.startsWith('/test-ride')) return null;

  return (
    <>
      <nav className={`${styles.navbar} ${navClass} container`}>
        <div className={styles.navContainer}>
          <div className={styles.inner}>
            <Link href="/" className={styles.logoBox}>
              <img
                src="/images/motovolt-logo.svg"
                alt="Motovolt Logo"
                width="175"
                height="22"
                style={{ width: '100%', height: 'auto', maxWidth: '175px' }}
              />
            </Link>
            <div className={styles.navBox}>
              <ul className={styles.navLinks}>
                {NAV_ITEMS.map(({ href, label, tab }) => (
                  <li key={label}>
                    {tab ? (
                      <button
                        className={`${styles.navLinkBtn} label-2 ${megaOpen && megaActiveTab === tab ? styles.navLinkActive : ''}`}
                        onClick={() => openMega(tab)}
                        aria-expanded={megaOpen && megaActiveTab === tab}
                        aria-haspopup="dialog"
                      >
                        {label}
                      </button>
                    ) : (
                      <Link href={href!} className={`${styles.navLink} label-2`}>{label}</Link>
                    )}
                  </li>
                ))}
              </ul>
              <div className={styles.ctaGroup}>
                <Link href="/test-ride" className={`${styles.testRideBtn} label-2`}>
                  Test Ride
                  <ArrowSvg />
                </Link>
                <Link href="/contact" className={`${styles.bookBtn} label-2`}>
                  Book Now
                  <ArrowSvg />
                </Link>
              </div>
            </div>
          </div>

          <div className={styles.mobileBar}>
            <Link href="/" className={styles.mobileLogoWrap}>
              <img
                src="/images/motovolt-logo.svg"
                alt="Motovolt"
                width="130"
                height="18"
                style={{ height: 'auto' }}
              />
            </Link>
            <div className={styles.mobileRight}>
              <Link href="/contact" className={`${styles.mobileBookBtn} label-3-md`}>
                Book Now
                <ArrowSvg />
              </Link>
              <button
                className={`${styles.hamburger} ${menuOpen ? styles.hamburgerOpen : ''}`}
                onClick={() => setMenuOpen((o) => !o)}
                aria-label={menuOpen ? 'Close menu' : 'Open menu'}
                aria-expanded={menuOpen}
              >
                <span />
                <span />
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div
        className={`${styles.megaMenu} ${megaOpen ? styles.megaMenuOpen : ''}`}
        aria-hidden={!megaOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={styles.megaOverlay} onClick={closeMega} aria-hidden="true" />

        <div className={styles.megaContent}>
          <div className={styles.megaLeft}>
            <Link href="/" className={styles.megaLogo} onClick={closeMega}>
              <img
                src="/images/motovolt-logo.svg"
                alt="Motovolt"
                width="220"
                height="22"
                style={{ height: 'auto' }}
              />
            </Link>
            <div className={styles.megaLeftBottom}>
              <div className={styles.megaLegal}>
                {LEGAL_LINKS.map((link) => (
                  <Link key={link.label} href={link.href} className={`${styles.megaLegalLink} body-3`} onClick={closeMega}>
                    {link.label}
                  </Link>
                ))}
              </div>
              <div className={styles.megaSocials}>
                <a href={getSocialHref('instagram')} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Instagram">
                  <InstagramIcon />
                </a>
                <a href={getSocialHref('facebook')} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Facebook">
                  <FacebookIcon />
                </a>
                <a href={getSocialHref('linkedin')} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="LinkedIn">
                  <LinkedInIcon />
                </a>
                <a href={getSocialHref('x')} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="Twitter / X">
                  <XIcon />
                </a>
                <a href={getSocialHref('youtube')} target="_blank" rel="noopener noreferrer" className={styles.socialIcon} aria-label="YouTube">
                  <YoutubeIcon />
                </a>
              </div>
              <p className={`${styles.megaCopyright} body-3`}>{COPYRIGHT}</p>
            </div>
          </div>

          <div className={styles.megaPanel}>
            <button className={styles.megaClose} onClick={closeMega} aria-label="Close menu">
              <CloseIcon size={29} strokeWidth={1.5} />
            </button>

            <nav className={styles.megaNavCol}>
              <div className={styles.megaLinkItems}>
                {MEGA_NAV_ITEMS.map(({ href, label, tab }, idx) => (
                  <div
                    key={label}
                    className={`${styles.megaNavItem} ${tab && megaActiveTab === tab ? styles.megaNavItemActive : ''}`}
                    style={{ '--i': idx } as React.CSSProperties}
                  >
                    {tab ? (
                      <button
                        className={`${styles.megaNavItemBtn} title-3`}
                        onClick={() => setMegaActiveTab(tab)}
                      >
                        {label}
                      </button>
                    ) : (
                      <Link href={href!} className="title-3" onClick={closeMega}>
                        {label}
                      </Link>
                    )}
                  </div>
                ))}
              </div>
              <Link href="/contact" className={`${styles.megaBookNow} title-3`} onClick={closeMega}>
                Book Now
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" fill="none"> <path d="M13.1693 0.00012602L15.7019 0.000112673L15.7019 13.8857H13.1693L13.1693 4.01589L2.14769 13.8685L0.356879 12.2676L11.5474 2.26408L5.22372e-06 2.26408L5.40147e-06 0.000125385L13.1693 0.00012602Z" fill="#F15B25" /> </svg>
              </Link>
            </nav>

            <div className={styles.megaProductCol} ref={productColRef}>
              {megaActiveTab === 'smart-vehicles' && VEHICLE_SECTIONS.map((section) => (
                <div key={section.label} className={styles.megaSection}>
                  <div className={styles.megaSectionHeader}>
                    <span className={`${styles.megaSectionLabel} label-2`}>{section.label}</span>
                  </div>
                  <div className={styles.megaCardGrid}>
                    {section.products.map((product) => (
                      <Link
                        key={product.name}
                        href={product.href}
                        className={`${styles.megaCard} ${product.fullWidth ? styles.megaCardFull : ''}`}
                        onClick={closeMega}
                      >
                        <div className={styles.megaCardImgWrap}>
                          {product.image && (
                            <img
                              src={product.image}
                              alt={product.name}
                              style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                            />
                          )}
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}

              {megaActiveTab === 'accessories' && (
                <div className={styles.accessoriesList}>
                  {ACCESSORIES_ITEMS.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href!}
                      className={styles.accessoriesItem}
                      onClick={closeMega}
                    >
                      <span className={styles.accessoriesItemName}>
                        <span className="title-1">{item.name}</span>
                        {item.tag && <span className={`${styles.newTag} label-3`}>NEW</span>}
                      </span>
                      <ArrowSvgWhite />
                    </Link>
                  ))}
                </div>
              )}

              {megaActiveTab === 'more' && (
                <div className={styles.accessoriesList}>
                  {MORE_ITEMS.map((item) => (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={styles.accessoriesItem}
                      onClick={closeMega}
                    >
                      <span className="title-1">{item.name}</span>
                      <ArrowSvgWhite />
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <div className={styles.megaScrollTrack} ref={scrollTrackRef}>
              <div className={styles.megaScrollThumb} ref={scrollThumbRef} />
            </div>
          </div>
        </div>
      </div>

      <div
        className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
        aria-hidden={!menuOpen}
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
      >
        <div className={styles.mobileMenuHeader}>
          <Link href="/" onClick={closeMenu}>
            <img
              src="/images/motovolt-logo.svg"
              alt="Motovolt"
              width="130"
              height="18"
              style={{ height: 'auto' }}
            />
          </Link>
          <button className={styles.closeBtn} onClick={closeMenu} aria-label="Close menu">
            <CloseIcon size={22} strokeWidth={1.5} />
          </button>
        </div>

        <div className={styles.mobileNavCard}>
          {!mobileSubTab ? (
            <>
              <ul className={styles.mobileNavList}>
                {MOBILE_NAV_ITEMS.map(({ href, label, tab }, idx) => (
                  <li key={label} style={{ '--i': idx } as React.CSSProperties}>
                    {tab ? (
                      <button
                        className={`${styles.mobileNavLink} ${styles.mobileNavLinkBtn} title-1-md`}
                        onClick={() => setMobileSubTab(tab)}
                      >
                        {label}
                        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none"> <path d="M0.707031 0.707153L5.70703 5.70715L0.707031 10.7072" stroke="white" strokeLinecap="square" strokeLinejoin="bevel" /> </svg>
                      </button>
                    ) : (
                      <Link
                        href={href!}
                        className={`${styles.mobileNavLink} title-1-md`}
                        onClick={closeMenu}
                      >
                        {label}
                        <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none"> <path d="M0.707031 0.707153L5.70703 5.70715L0.707031 10.7072" stroke="white" strokeLinecap="square" strokeLinejoin="bevel" /> </svg>
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
              <div className={styles.mobileMenuBottom}>
                <Link href="/test-ride" className={`${styles.mobileMenuCta} title-1-md`} onClick={closeMenu}>
                  <span>Test Ride</span>
                  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="11" viewBox="0 0 12 11" fill="none"> <path d="M11.9776 0V10.5921H10.0457L10.0457 3.06328L1.63828 10.579L0.272228 9.3578L8.80848 1.72698H0L8.88758e-08 9.8516e-06L11.9776 0Z" fill="#F15B25" /> </svg>
                </Link>
              </div>
            </>
          ) : (
            <>
              <div className={styles.mobileSubHeader}>
                <button className={styles.mobileBackBtn} onClick={() => setMobileSubTab(null)} aria-label="Back">
                  <svg width="8" height="14" viewBox="0 0 8 14" fill="none"><path d="M7 1L1 7L7 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>
                <span className={`${styles.mobileSubTitle} title-1-md`}>{MOBILE_SUB_LABELS[mobileSubTab]}</span>
              </div>

              <div className={styles.mobileSubContent} ref={mobileSubRef}>
                {mobileSubTab === 'smart-vehicles' && VEHICLE_SECTIONS.map((section) => (
                  <div key={section.label} className={styles.mobileSubSection}>
                    <p className={`${styles.mobileSubSectionLabel} label-1-md`}>{section.label}</p>
                    {section.products.map((product) => (
                      <Link
                        key={product.name}
                        href={product.href}
                        className={`${styles.mobileProductCard} ${product.fullWidth ? styles.mobileProductCardFull : ''}`}
                        onClick={closeMenu}
                      >
                        {product.image && (
                          <div className={styles.mobileProductCardImg}>
                            <img src={product.image} alt={product.name} width="238" height="149" style={{ width: '100%', height: '149px', objectFit: 'contain' }} />
                          </div>
                        )}
                      </Link>
                    ))}
                  </div>
                ))}

                {mobileSubTab === 'accessories' && ACCESSORIES_ITEMS.map((item) => (
                  <Link key={item.name} href={item.href!} className={styles.mobileSubListItem} onClick={closeMenu}>
                    <span className={styles.accessoriesItemName}>
                      <span className="title-1-md">{item.name}</span>
                      {item.tag && <span className={`${styles.newTag} label-3`}>NEW</span>}
                    </span>
                    <ArrowSvg />
                  </Link>
                ))}

                {mobileSubTab === 'more' && MORE_ITEMS.map((item) => (
                  <Link key={item.name} href={item.href} className={styles.mobileSubListItem} onClick={closeMenu}>
                    <span className="title-1-md">{item.name}</span>
                    <ArrowSvg />
                  </Link>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}