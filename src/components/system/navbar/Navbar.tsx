'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Navbar.module.scss';

const BASE_URL = 'https://motovolt-8klfp.ondigitalocean.app';

/* ── Types ─────────────────────────────────────────────────────── */

interface NavItem {
    label?: string;
    href?: string;
    tab?: string;
    name?: string;
    tag?: boolean;
}

interface Product {
    name: string;
    image?: string;
    href: string;
    fullWidth?: boolean;
}

interface VehicleSection {
    label: string;
    products: Product[];
}

interface IconProps {
    size?: number;
    strokeWidth?: number;
}

/* ── Data ──────────────────────────────────────────────────────── */

const NAV_BAR_ITEMS: NavItem[] = [
    { label: 'Smart Vehicles', tab: 'smart-vehicles' },
    { label: 'Accessories', tab: 'accessories' },
    { href: `${BASE_URL}/store-locator`, label: 'Store Locator' },
    { href: `${BASE_URL}/dealers-enquiry`, label: 'Dealership enquiry' },
    { label: 'More', tab: 'more' },
];

const MEGA_NAV_ITEMS: NavItem[] = [
    { label: 'Smart Vehicles', tab: 'smart-vehicles' },
    { label: 'Accessories', tab: 'accessories' },
    { href: `${BASE_URL}/store-locator`, label: 'Store Locator' },
    { href: `${BASE_URL}/compare-models`, label: 'Compare Models' },
    { href: `${BASE_URL}/dealers-enquiry`, label: 'Dealership Enquiry' },
    { href: `${BASE_URL}/b2b`, label: 'B2B Sales' },
    { href: `${BASE_URL}/about`, label: 'About' },
    { label: 'More', tab: 'more' },
];

const MORE_ITEMS: NavItem[] = [
    { name: 'Blogs', href: `${BASE_URL}/blog` },
    { name: 'News', href: `${BASE_URL}/news` },
    { name: 'FAQs', href: `${BASE_URL}/faq` },
    { name: 'Support', href: `${BASE_URL}/help` },
    { name: 'Contact Us', href: `${BASE_URL}/contact` },
    { name: 'Careers', href: `${BASE_URL}/careers` },
];

const ACCESSORIES_ITEMS: NavItem[] = [
    { name: 'M7', href: '#' },
    { name: 'Urbn X', href: `${BASE_URL}/urbnx`, tag: true },
    { name: 'Urbn', href: '#' },
    { name: 'Kivo', href: `${BASE_URL}/kivo` },
    { name: 'Hum', href: `${BASE_URL}/hum` },
];

const MOBILE_NAV_ITEMS: NavItem[] = [
    { label: 'Smart Vehicles', tab: 'smart-vehicles' },
    { label: 'Accessories', tab: 'accessories' },
    { href: `${BASE_URL}/store-locator`, label: 'Store Locator' },
    { href: `${BASE_URL}/compare-models`, label: 'Compare Models' },
    { href: `${BASE_URL}/dealers-enquiry`, label: 'Dealership Enquiry' },
    { href: `${BASE_URL}/b2b`, label: 'B2B Sales' },
    { href: `${BASE_URL}/about`, label: 'About' },
    { label: 'More', tab: 'more' },
];

const MOBILE_SUB_LABELS: Record<string, string> = {
    'smart-vehicles': 'Smart Vehicles',
    accessories: 'Accessories',
    more: 'More',
};

const VEHICLE_SECTIONS: VehicleSection[] = [
    {
        label: 'E- Scooters',
        products: [
            { name: 'M7', image: `${BASE_URL}/images/m7-bike.png`, href: `${BASE_URL}/m7` },
            { name: 'MVS7', image: `${BASE_URL}/images/mvs7.png`, href: `${BASE_URL}/mvs7` },
            { name: 'M7 Lite', image: `${BASE_URL}/images/m7-lite.png`, href: '#' },
        ],
    },
    {
        label: 'E- Mopeds',
        products: [
            { name: 'Klimbr', image: `${BASE_URL}/images/klimber.png`, href: '#', fullWidth: true },
            { name: 'UrbnX', image: `${BASE_URL}/images/ham-urbnx.png`, href: `${BASE_URL}/urbnx` },
            { name: 'Urbn', image: `${BASE_URL}/images/ham-urbn.png`, href: `${BASE_URL}/urbn` },
        ],
    },
    {
        label: 'E- Cycles',
        products: [
            { name: 'HUM', image: `${BASE_URL}/images/hum.png`, href: `${BASE_URL}/hum` },
            { name: 'Kivo 24', image: `${BASE_URL}/images/kivo-24.png`, href: '#' },
            { name: 'Kivo', image: `${BASE_URL}/images/ham-kivo.png`, href: `${BASE_URL}/kivo` },
            { name: 'Kivo Easy', image: `${BASE_URL}/images/kivo-easy.png`, href: '#' },
        ],
    },
];

const LEGAL_LINKS: string[] = [
    'Warranty Policy',
    'Terms of Service',
    'Privacy Policy',
    'Return & Refund Policy',
];

/* ── Icons ─────────────────────────────────────────────────────── */

const ArrowSvg: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" fill="none">
        <path d="M13.1693 0.00012602L15.7019 0.000112673L15.7019 13.8857H13.1693L13.1693 4.01589L2.14769 13.8685L0.356879 12.2676L11.5474 2.26408L5.22372e-06 2.26408L5.40147e-06 0.000125385L13.1693 0.00012602Z" fill="#F15B25" />
    </svg>
);

const ArrowSvgWhite: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" fill="none">
        <path d="M13.1688 3.95008e-06L15.7014 -9.39724e-06L15.7014 13.8856H13.1688L13.1688 4.01577L2.1472 13.8684L0.356391 12.2675L11.5469 2.26396L-0.000483058 2.26396L-0.00048288 3.3145e-06L13.1688 3.95008e-06Z" fill="white" />
    </svg>
);

const CloseIcon: React.FC<IconProps> = ({ size = 22, strokeWidth = 1.5 }) => (
    <svg width={size} height={size} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 30 27" fill="none">
        <foreignObject x="-33.75" y="-33.75" width="97.0312" height="94.5">
            <div
                style={{
                    backdropFilter: 'blur(16.88px)',
                    clipPath: 'url(#bgblur_0_2573_19243_clip_path)',
                    height: '100%',
                    width: '100%',
                }}
            ></div>
        </foreignObject>
        <path data-figma-bg-blur-radius="33.75" d="M0 2.53125C0 1.13328 1.13328 0 2.53125 0H27C28.398 0 29.5312 1.13328 29.5312 2.53125V24.4688C29.5312 25.8667 28.398 27 27 27H2.53125C1.13328 27 0 25.8667 0 24.4688V2.53125Z" fill="white" fillOpacity="0.2" />
        <path d="M8.90234 7.96497L20.5146 19.0337" stroke="white" strokeWidth={strokeWidth} />
        <path d="M20.0474 7.96582L8.43515 19.0346" stroke="white" strokeWidth={strokeWidth} />
        <defs>
            <clipPath id="bgblur_0_2573_19243_clip_path" transform="translate(33.75 33.75)">
                <path d="M0 2.53125C0 1.13328 1.13328 0 2.53125 0H27C28.398 0 29.5312 1.13328 29.5312 2.53125V24.4688C29.5312 25.8667 28.398 27 27 27H2.53125C1.13328 27 0 25.8667 0 24.4688V2.53125Z" />
            </clipPath>
        </defs>
    </svg>
);

const InstagramIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
        <path d="M12.0923 9.24704C12.0923 9.80977 11.9254 10.3599 11.6128 10.8278C11.3001 11.2957 10.8558 11.6603 10.3359 11.8757C9.81596 12.091 9.24388 12.1474 8.69196 12.0376C8.14003 11.9278 7.63306 11.6568 7.23515 11.2589C6.83723 10.861 6.56625 10.354 6.45646 9.80212C6.34668 9.25019 6.40303 8.67811 6.61838 8.15821C6.83373 7.63831 7.19841 7.19394 7.66631 6.8813C8.1342 6.56867 8.6843 6.40179 9.24704 6.40179C10.0016 6.40179 10.7253 6.70156 11.2589 7.23515C11.7925 7.76873 12.0923 8.49243 12.0923 9.24704ZM18.4941 4.97917V13.5149C18.4927 14.835 17.9676 16.1007 17.0341 17.0341C16.1007 17.9676 14.835 18.4927 13.5149 18.4941H4.97917C3.65905 18.4927 2.3934 17.9676 1.45993 17.0341C0.526456 16.1007 0.00141215 14.835 0 13.5149V4.97917C0.00141215 3.65905 0.526456 2.3934 1.45993 1.45993C2.3934 0.526456 3.65905 0.00141215 4.97917 0H13.5149C14.835 0.00141215 16.1007 0.526456 17.0341 1.45993C17.9676 2.3934 18.4927 3.65905 18.4941 4.97917ZM13.5149 9.24704C13.5149 8.40293 13.2646 7.57779 12.7956 6.87594C12.3267 6.17409 11.6601 5.62707 10.8803 5.30405C10.1004 4.98102 9.2423 4.8965 8.41442 5.06118C7.58653 5.22586 6.82607 5.63233 6.2292 6.2292C5.63233 6.82607 5.22586 7.58653 5.06118 8.41442C4.8965 9.2423 4.98102 10.1004 5.30405 10.8803C5.62707 11.6601 6.17409 12.3267 6.87594 12.7956C7.57779 13.2646 8.40293 13.5149 9.24704 13.5149C10.3786 13.5137 11.4634 13.0637 12.2636 12.2636C13.0637 11.4634 13.5137 10.3786 13.5149 9.24704ZM15.6488 3.91221C15.6488 3.70118 15.5863 3.49489 15.469 3.31943C15.3518 3.14397 15.1851 3.00722 14.9902 2.92646C14.7952 2.8457 14.5807 2.82457 14.3737 2.86574C14.1667 2.90691 13.9766 3.00853 13.8274 3.15775C13.6782 3.30697 13.5766 3.49708 13.5354 3.70405C13.4942 3.91102 13.5154 4.12556 13.5961 4.32052C13.6769 4.51548 13.8136 4.68212 13.9891 4.79936C14.1646 4.9166 14.3708 4.97917 14.5819 4.97917C14.8648 4.97917 15.1362 4.86676 15.3363 4.66667C15.5364 4.46657 15.6488 4.19518 15.6488 3.91221Z" fill="white" />
    </svg>
);

const FacebookIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="19" viewBox="0 0 20 19" fill="none">
        <path d="M18.3475 0H1.07127C0.479806 0 0 0.456958 0 1.02026V17.4738C0 18.0379 0.479806 18.4941 1.07127 18.4941H10.3712V11.3322H7.83952V8.54195H10.3712V6.48063C10.3712 4.09258 11.9037 2.79338 14.1409 2.79338C15.213 2.79338 16.1346 2.86812 16.4032 2.90203V5.39873H14.8489C13.6352 5.39873 13.399 5.95432 13.399 6.76344V8.54426H16.2988L15.9226 11.3415H13.399V18.4941H18.3467C18.9398 18.4941 19.4188 18.0379 19.4188 17.4738V1.02026C19.4188 0.456958 18.9398 0 18.3475 0Z" fill="white" />
    </svg>
);

const LinkedInIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
        <path d="M17.1259 0C17.88 0 18.4941 0.59704 18.4941 1.33347V17.1596C18.4941 17.896 17.88 18.4941 17.1259 18.4941H1.3641C0.611537 18.4941 0 17.896 0 17.1596V1.33347C0 0.59704 0.611537 0 1.3641 0H17.1259ZM15.7598 15.7589V10.9186C15.7598 8.54168 15.2466 6.71423 12.4692 6.71423C11.1346 6.71423 10.2396 7.44597 9.87387 8.13979H9.83631V6.93325H7.20689V15.7589H9.94664V11.3937C9.94664 10.2424 10.1644 9.12687 11.5917 9.12687C12.9994 9.12687 13.017 10.4436 13.017 11.467V15.7589H15.7598ZM5.48607 6.93325H2.74025V15.7589H5.48607V6.93325ZM4.11388 2.54604C3.23291 2.54604 2.52253 3.25871 2.52253 4.13667C2.52253 5.01484 3.23291 5.72747 4.11388 5.72747C4.99139 5.72747 5.70379 5.01484 5.70379 4.13667C5.70379 3.25871 4.99139 2.54604 4.11388 2.54604Z" fill="white" />
    </svg>
);

const XIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="19" height="19" viewBox="0 0 19 19" fill="none">
        <path d="M16.9471 0H1.54695C0.692564 0 0 0.692564 0 1.54695V16.9471C0 17.8015 0.692564 18.4941 1.54695 18.4941H16.9471C17.8015 18.4941 18.4941 17.8015 18.4941 16.9471V1.54695C18.4941 0.692564 17.8015 0 16.9471 0ZM11.9668 15.9722L8.29947 10.7492L3.70843 15.9722H2.52192L7.7733 9.99968L2.52192 2.52192H6.52727L9.99922 7.46653L14.3494 2.52192H15.5358L10.5282 8.21779L15.9722 15.9722H11.9668Z" fill="white" />
    </svg>
);

const YoutubeIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="19" viewBox="0 0 24 19" fill="none">
        <path d="M22.7373 3.07427C22.6391 2.69035 22.4511 2.33526 22.1888 2.0383C21.9264 1.74134 21.5972 1.51102 21.2282 1.36634C17.6583 -0.0124931 11.9763 3.96148e-06 11.6639 3.96148e-06C11.3514 3.96148e-06 5.66948 -0.0124931 2.0995 1.36634C1.73059 1.51102 1.40137 1.74134 1.13899 2.0383C0.876618 2.33526 0.688612 2.69035 0.590484 3.07427C0.320757 4.1136 0 6.01315 0 9.16448C0 12.3158 0.320757 14.2154 0.590484 15.2547C0.688465 15.6388 0.876405 15.9941 1.13879 16.2912C1.40117 16.5884 1.73047 16.8189 2.0995 16.9637C5.51951 18.2831 10.8724 18.329 11.5951 18.329H11.7326C12.4554 18.329 17.8114 18.2831 21.2282 16.9637C21.5973 16.8189 21.9266 16.5884 22.189 16.2912C22.4513 15.9941 22.6393 15.6388 22.7373 15.2547C23.007 14.2133 23.3277 12.3158 23.3277 9.16448C23.3277 6.01315 23.007 4.1136 22.7373 3.07427ZM15.0579 9.84348L10.8922 12.7595C10.7676 12.8467 10.6214 12.8983 10.4696 12.9084C10.3178 12.9185 10.1661 12.8869 10.031 12.8169C9.89593 12.7469 9.78257 12.6413 9.70324 12.5115C9.62391 12.3817 9.58165 12.2326 9.58104 12.0804V6.24851C9.58108 6.0961 9.62293 5.94662 9.70203 5.81635C9.78113 5.68607 9.89445 5.57999 10.0297 5.50965C10.1649 5.43931 10.3168 5.4074 10.4689 5.4174C10.6209 5.42741 10.7674 5.47894 10.8922 5.56638L15.0579 8.48235C15.1674 8.55919 15.2569 8.6613 15.3186 8.78004C15.3804 8.89877 15.4126 9.03064 15.4126 9.16448C15.4126 9.29831 15.3804 9.43018 15.3186 9.54892C15.2569 9.66765 15.1674 9.76976 15.0579 9.84661V9.84348Z" fill="white" />
    </svg>
);

/* ── Component ─────────────────────────────────────────────────── */

export default function Navbar() {
    const pathname = usePathname();

    const [menuOpen, setMenuOpen] = useState<boolean>(false);
    const [megaOpen, setMegaOpen] = useState<boolean>(false);
    const [megaActiveTab, setMegaActiveTab] = useState<string>('smart-vehicles');
    const [mobileSubTab, setMobileSubTab] = useState<string | null>(null);
    const [navClass, setNavClass] = useState<string>('');

    const lastScrollY = useRef<number>(0);
    const pageNavVisible = useRef<boolean>(false);
    const productColRef = useRef<HTMLDivElement | null>(null);
    const scrollTrackRef = useRef<HTMLDivElement | null>(null);
    const scrollThumbRef = useRef<HTMLDivElement | null>(null);
    const mobileSubRef = useRef<HTMLDivElement | null>(null);

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

    // Custom scrollbar for the mega menu product column
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
            if ((e.target as Node) !== track) return;
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

        const onTouchStart = (e: TouchEvent) => {
            startY = e.touches[0].clientY;
        };
        const onTouchMove = (e: TouchEvent) => {
            e.preventDefault();
            const dy = startY - e.touches[0].clientY;
            el.scrollTop += dy;
            startY = e.touches[0].clientY;
        };
        const onWheel = (e: WheelEvent) => {
            e.preventDefault();
            el.scrollTop += e.deltaY;
        };

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
    const closeMenu = useCallback(() => {
        setMenuOpen(false);
        setMobileSubTab(null);
    }, []);

    if (pathname?.startsWith('/test-ride')) return null;

    return (
        <>
            {/* ── Navbar bar ────────────────────────────────────────── */}
            <nav className={`${styles.navbar} ${navClass} container`}>
                <div className={styles.navContainer}>
                    {/* Desktop two-box layout */}
                    <div className={styles.inner}>
                        <Link href={`${BASE_URL}/`} className={styles.logoBox}>
                            <svg className={styles.logo} viewBox="0 0 175 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M23.0439 4.33691L23.0547 4.34277L20.3789 6.10059V9.66699C20.3789 9.74824 20.3337 9.82426 20.2607 9.87305L17.8203 11.4746C17.7474 11.5235 17.7022 11.5994 17.7021 11.6807V17.3154C17.702 17.3968 17.6567 17.4726 17.584 17.5215L11.6875 21.3965C11.5977 21.4562 11.4688 21.4562 11.3789 21.3965L5.48145 17.5215C5.40871 17.4726 5.36438 17.3967 5.36426 17.3154V11.6807C5.36422 11.5994 5.31899 11.5235 5.24609 11.4746L2.80566 9.87305C2.73271 9.82427 2.6875 9.74829 2.6875 9.66699V6.10059L0.140625 4.42383C0.0732983 4.38041 0.0732983 4.29341 0.140625 4.25L6.61523 0V7.30078L9.18457 8.98828C9.25728 9.03712 9.30256 9.11321 9.30273 9.19434V14.7314C9.30274 14.8127 9.34791 14.8886 9.4209 14.9375L11.373 16.2236C11.463 16.2834 11.5919 16.2834 11.6816 16.2236L13.6338 14.9375C13.7068 14.8886 13.7519 14.8127 13.752 14.7314V9.19434C13.7521 9.11321 13.7974 9.03712 13.8701 8.98828L16.4395 7.30078V0L23.0439 4.33691ZM17.6855 8.83105C17.6855 8.91261 17.6402 8.98818 17.5674 9.03711L15.1152 10.6494C15.0424 10.6982 14.998 10.7749 14.998 10.8564V16.1318C14.998 16.2131 14.9528 16.289 14.8799 16.3379L11.6709 18.4443C11.5811 18.5038 11.452 18.5037 11.3623 18.4443L8.15234 16.3379C8.07949 16.289 8.03418 16.213 8.03418 16.1318V10.8564C8.03418 10.7749 7.98983 10.6982 7.91699 10.6494L5.46484 9.03711C5.39204 8.98818 5.34668 8.91256 5.34668 8.83105V2.20898L2.22754 4.25586C2.16035 4.29935 2.16026 4.38629 2.22754 4.42969L3.92773 5.54199V9.1084C3.92787 9.1896 3.97226 9.26559 4.04492 9.31445L6.48633 10.916C6.55898 10.9648 6.60352 11.0406 6.60352 11.1221V16.7559C6.60352 16.8373 6.64887 16.9133 6.72168 16.9619L11.3672 20.0127C11.457 20.0724 11.5859 20.0722 11.6758 20.0127L16.3223 16.9619C16.3949 16.9133 16.4395 16.8372 16.4395 16.7559V11.1221C16.4395 11.0406 16.4847 10.9648 16.5576 10.916L18.998 9.31445C19.0709 9.2656 19.1161 9.18971 19.1162 9.1084V5.54199H19.1045L20.9336 4.34277L17.6855 2.20898V8.83105Z" fill="white" />
                                <path d="M52.2617 4.68652C52.7083 4.68652 53.0953 4.79111 53.4111 4.99512C53.6824 5.1694 53.9989 5.51318 53.999 6.15039V16.4902H50.8916V10.5088L46.9404 15.6582C46.7094 15.9571 46.2822 16.3057 45.5342 16.3057L45.4033 16.292C44.739 16.2527 44.3506 15.929 44.1387 15.6582L39.8164 10.5088V16.4404H36.7383V6.14551C36.7384 5.50824 37.0553 5.16941 37.3213 4.99512C37.6377 4.7911 38.024 4.68653 38.4707 4.68652C38.8173 4.68652 39.0982 4.74112 39.3291 4.85059C39.5601 4.96515 39.7714 5.13984 39.9521 5.37891L45.5693 12.3516L50.8408 5.37891C51.0167 5.14483 51.2129 4.97087 51.4238 4.86133C51.6397 4.74678 51.9155 4.68654 52.2617 4.68652Z" fill="white" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M69.3174 5.08203C70.1554 5.08204 70.8636 5.15167 71.4209 5.28613C71.9347 5.41251 72.3679 5.61135 72.707 5.87598L72.8418 5.99316C73.2083 6.32186 73.4693 6.76026 73.6201 7.28809C73.7656 7.79106 73.8359 8.39865 73.8359 9.0957V12.4727C73.8359 13.1845 73.7604 13.7923 73.6201 14.2852C73.4693 14.808 73.2081 15.2416 72.8467 15.5703C72.485 15.8891 72.0081 16.1281 71.4209 16.2725C70.8636 16.412 70.1554 16.4814 69.3174 16.4814H60.3809C59.5523 16.4814 58.849 16.412 58.292 16.2725C57.7046 16.1281 57.2275 15.8941 56.8662 15.5703C56.5049 15.2416 56.2442 14.808 56.0938 14.2852C55.953 13.7923 55.8828 13.1846 55.8828 12.4727V9.0957C55.8828 8.39365 55.953 7.7861 56.0938 7.28809C56.239 6.76023 56.4999 6.32185 56.8662 5.99316C57.2275 5.66951 57.7046 5.43056 58.292 5.28613C58.8541 5.15166 59.5523 5.08203 60.3809 5.08203H69.3174ZM60.4961 8.13965C60.14 8.13965 59.8438 8.16021 59.6279 8.20996C59.4524 8.24981 59.3112 8.31954 59.2158 8.40918C59.1206 8.50373 59.0555 8.62794 59.0205 8.79199C58.9754 8.98628 58.9551 9.24589 58.9551 9.55957V12.0195C58.9551 12.3431 58.9754 12.6122 59.0205 12.8164C59.0555 12.9805 59.1205 13.0999 59.2109 13.1895C59.3061 13.274 59.4415 13.3391 59.6221 13.374C59.843 13.419 60.1397 13.4385 60.501 13.4385H69.2314C69.5629 13.4385 69.8447 13.419 70.0605 13.374C70.241 13.3391 70.3764 13.279 70.4717 13.1895C70.5621 13.0999 70.6326 12.9659 70.6777 12.8018C70.7332 12.6026 70.7578 12.3381 70.7578 12.0195V9.55957C70.7578 9.25078 70.728 8.99598 70.6777 8.80176C70.6327 8.63274 70.5621 8.50868 70.4619 8.40918C70.3665 8.31456 70.2306 8.24981 70.0498 8.20996C69.8341 8.16514 69.558 8.13965 69.2266 8.13965H60.4961Z" fill="white" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M104.295 5.08203C105.133 5.08203 105.841 5.15169 106.398 5.28613C106.913 5.41254 107.346 5.61122 107.686 5.87598L107.819 5.99316C108.186 6.32187 108.447 6.76019 108.598 7.28809C108.738 7.79108 108.813 8.39861 108.813 9.0957V12.4727C108.813 13.1846 108.738 13.7923 108.598 14.2852C108.447 14.8081 108.186 15.2416 107.824 15.5703C107.463 15.8891 106.986 16.1281 106.398 16.2725C105.841 16.412 105.133 16.4814 104.295 16.4814H95.3584C94.5305 16.4814 93.8278 16.412 93.2705 16.2725C92.6833 16.1281 92.2063 15.8941 91.8447 15.5703C91.4833 15.2416 91.217 14.8081 91.0713 14.2852C90.9258 13.7923 90.8555 13.1846 90.8555 12.4727V9.0957C90.8555 8.39365 90.9258 7.7861 91.0713 7.28809C91.217 6.76019 91.4781 6.32187 91.8447 5.99316C92.2062 5.66953 92.6834 5.43052 93.2705 5.28613C93.8328 5.15171 94.5352 5.08205 95.3584 5.08203H104.295ZM95.4688 8.13965C95.1126 8.13966 94.8164 8.1602 94.6006 8.20996C94.4252 8.24982 94.2847 8.31958 94.1895 8.40918C94.0941 8.50378 94.0282 8.62774 93.9932 8.79199C93.9481 8.98628 93.9277 9.24589 93.9277 9.55957V12.0195C93.9277 12.3431 93.9481 12.6122 93.9932 12.8164C94.0281 12.9805 94.0935 13.0999 94.1836 13.1895C94.2793 13.2741 94.415 13.3391 94.5957 13.374C94.8167 13.4189 95.1132 13.4385 95.4746 13.4385H104.205C104.536 13.4385 104.817 13.419 105.033 13.374C105.214 13.3391 105.35 13.2791 105.445 13.1895C105.536 13.0999 105.605 12.9657 105.65 12.8018C105.706 12.6026 105.731 12.3381 105.731 12.0195V9.55957C105.731 9.25078 105.701 8.99598 105.65 8.80176C105.605 8.63271 105.535 8.50869 105.435 8.40918C105.339 8.31463 105.204 8.24982 105.023 8.20996C104.803 8.16514 104.526 8.13967 104.2 8.13965H95.4688Z" fill="white" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M141.697 5.08203C142.536 5.08204 143.243 5.15168 143.8 5.28613C144.314 5.41254 144.748 5.61124 145.087 5.87598L145.221 5.99316C145.587 6.32187 145.849 6.76019 146 7.28809C146.141 7.79106 146.211 8.39865 146.211 9.0957V12.4727C146.211 13.1845 146.141 13.7923 146 14.2852C145.849 14.8079 145.587 15.2416 145.227 15.5703C144.866 15.8891 144.388 16.1281 143.8 16.2725C143.243 16.412 142.536 16.4814 141.697 16.4814H132.76C131.937 16.4814 131.234 16.412 130.677 16.2725C130.089 16.1281 129.613 15.8941 129.251 15.5703C128.89 15.2416 128.629 14.808 128.478 14.2852C128.337 13.7923 128.267 13.1846 128.267 12.4727V9.0957C128.267 8.39367 128.337 7.78609 128.478 7.28809C128.623 6.76019 128.885 6.32187 129.251 5.99316C129.613 5.66954 130.089 5.43055 130.677 5.28613C131.234 5.15168 131.937 5.08205 132.76 5.08203H141.697ZM132.876 8.13965C132.52 8.13965 132.223 8.16018 132.008 8.20996C131.831 8.24982 131.691 8.31957 131.596 8.40918C131.5 8.50377 131.435 8.62776 131.4 8.79199C131.355 8.98628 131.334 9.24589 131.334 9.55957V12.0195C131.334 12.3431 131.355 12.6122 131.4 12.8164C131.435 12.9805 131.5 13.0999 131.59 13.1895C131.685 13.2741 131.822 13.3391 132.003 13.374C132.223 13.4189 132.52 13.4385 132.881 13.4385H141.61C141.942 13.4385 142.219 13.419 142.44 13.374C142.621 13.3391 142.756 13.279 142.852 13.1895C142.942 13.0999 143.012 12.9657 143.057 12.8018C143.112 12.6026 143.138 12.3381 143.138 12.0195V9.55957C143.138 9.25078 143.107 8.99598 143.057 8.80176C143.012 8.63272 142.941 8.50869 142.842 8.40918C142.746 8.31463 142.61 8.24982 142.43 8.20996C142.215 8.16512 141.937 8.13965 141.606 8.13965H132.876Z" fill="white" />
                                <path d="M151.653 11.9893C151.653 12.278 151.683 12.5177 151.733 12.707C151.779 12.8713 151.854 13.0011 151.959 13.1006C152.069 13.2002 152.226 13.2791 152.421 13.3291C152.648 13.3888 152.943 13.414 153.299 13.4141H161.995L162.086 16.4814H153.18C152.351 16.4814 151.648 16.412 151.09 16.2725C150.504 16.1281 150.026 15.8892 149.665 15.5654C149.299 15.2368 149.038 14.803 148.887 14.2803C148.746 13.7873 148.676 13.1798 148.676 12.4678V5.08203H151.743L151.653 11.9893Z" fill="white" />
                                <path d="M89.2393 7.80566L84.1729 8.00488V16.4766H81.0752V8.03516L75.5322 8.07031V5.19141L89.2393 5.08203V7.80566Z" fill="white" />
                                <path d="M118.391 12.9512L123.387 5.08203H127.052L120.414 15.3262C120.188 15.6798 119.927 15.9591 119.636 16.1582C119.325 16.3672 118.893 16.4766 118.341 16.4766C117.789 16.4766 117.357 16.3723 117.046 16.1582C116.755 15.9591 116.493 15.6798 116.268 15.3262L109.666 5.08203H113.381L118.391 12.9512Z" fill="white" />
                                <path d="M175 7.80566L169.935 8.00488V16.4766H166.838V8.03516L161.295 8.07031V5.19141L175 5.08203V7.80566Z" fill="white" />
                                <path d="M22.8643 12.6738C22.9427 12.6199 23.0547 12.6692 23.0547 12.7559V13.8789C23.0547 13.9114 23.0319 13.9392 23.0039 13.9609L19.3125 16.3867C19.2339 16.4411 19.1222 16.3923 19.1221 16.3057V15.1816C19.1222 15.1491 19.139 15.1221 19.167 15.1006L22.8643 12.6738Z" fill="white" />
                                <path d="M0 12.7559C0 12.6744 0.106974 12.625 0.185547 12.6738L3.87695 15.1006C3.90493 15.1168 3.92176 15.1491 3.92188 15.1816V16.3057C3.92174 16.3869 3.81485 16.4356 3.73633 16.3867L0.0449219 13.9609C0.0168666 13.9447 0 13.9114 0 13.8789V12.7559Z" fill="white" />
                                <path d="M0.00585938 6.12305C0.00585938 6.04177 0.111893 5.99255 0.19043 6.04102L1.21191 6.70898C1.23988 6.7252 1.25673 6.75759 1.25684 6.79004V10.4326L3.88281 12.1582C3.91088 12.1745 3.92773 12.2077 3.92773 12.2402V13.3633C3.92773 13.4447 3.82076 13.4941 3.74219 13.4453L0.0507812 11.0186C0.0227802 11.0022 0.00594183 10.9699 0.00585938 10.9375V6.12305Z" fill="white" />
                                <path d="M22.8584 6.03027C22.937 5.976 23.0498 6.02546 23.0498 6.1123V10.9268C23.0497 10.9591 23.0269 10.9863 22.999 11.0078L19.3066 13.4346C19.228 13.4883 19.1162 13.4393 19.1162 13.3525V12.2295C19.1162 12.197 19.1332 12.169 19.1611 12.1475L21.7871 10.4219V6.78516C21.7871 6.75263 21.8089 6.72481 21.8369 6.70312L22.8584 6.03027Z" fill="white" />
                                <path d="M15.0029 5.8623V7.24609L11.5195 4.96094L8.03418 7.24609V5.8623L11.5195 3.57715L15.0029 5.8623Z" fill="white" />
                                <path d="M15.0029 2.91504V4.29395L11.5195 2.00879L8.03418 4.29395V2.91504L11.5195 0.629883L15.0029 2.91504Z" fill="white" />
                            </svg>
                        </Link>
                        <div className={styles.navBox}>
                            <ul className={styles.navLinks}>
                                {NAV_BAR_ITEMS.map(({ href, label, tab }) => (
                                    <li key={label}>
                                        {tab ? (
                                            <button
                                                className={`${styles.navLinkBtn} label-2 ${megaOpen && megaActiveTab === tab ? styles.navLinkActive : ''
                                                    }`}
                                                onClick={() => openMega(tab)}
                                                aria-expanded={megaOpen && megaActiveTab === tab}
                                                aria-haspopup="dialog"
                                            >
                                                {label}
                                            </button>
                                        ) : (
                                            <Link href={href || `${BASE_URL}/`} className={`${styles.navLink} label-2`}>
                                                {label}
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.ctaGroup}>
                                <Link href={`${BASE_URL}/test-ride`} className={`${styles.testRideBtn} label-2`}>
                                    Test Ride
                                    <ArrowSvg />
                                </Link>
                                <Link href={`${BASE_URL}/contact`} className={`${styles.bookBtn} label-2`}>
                                    Book Now
                                    <ArrowSvg />
                                </Link>
                            </div>
                        </div>
                    </div>

                    {/* Mobile bar */}
                    <div className={styles.mobileBar}>
                        <Link href={`${BASE_URL}/`} className={styles.mobileLogoWrap}>
                            <svg className={styles.logo} viewBox="0 0 175 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path fillRule="evenodd" clipRule="evenodd" d="M23.0439 4.33691L23.0547 4.34277L20.3789 6.10059V9.66699C20.3789 9.74824 20.3337 9.82426 20.2607 9.87305L17.8203 11.4746C17.7474 11.5235 17.7022 11.5994 17.7021 11.6807V17.3154C17.702 17.3968 17.6567 17.4726 17.584 17.5215L11.6875 21.3965C11.5977 21.4562 11.4688 21.4562 11.3789 21.3965L5.48145 17.5215C5.40871 17.4726 5.36438 17.3967 5.36426 17.3154V11.6807C5.36422 11.5994 5.31899 11.5235 5.24609 11.4746L2.80566 9.87305C2.73271 9.82427 2.6875 9.74829 2.6875 9.66699V6.10059L0.140625 4.42383C0.0732983 4.38041 0.0732983 4.29341 0.140625 4.25L6.61523 0V7.30078L9.18457 8.98828C9.25728 9.03712 9.30256 9.11321 9.30273 9.19434V14.7314C9.30274 14.8127 9.34791 14.8886 9.4209 14.9375L11.373 16.2236C11.463 16.2834 11.5919 16.2834 11.6816 16.2236L13.6338 14.9375C13.7068 14.8886 13.7519 14.8127 13.752 14.7314V9.19434C13.7521 9.11321 13.7974 9.03712 13.8701 8.98828L16.4395 7.30078V0L23.0439 4.33691ZM17.6855 8.83105C17.6855 8.91261 17.6402 8.98818 17.5674 9.03711L15.1152 10.6494C15.0424 10.6982 14.998 10.7749 14.998 10.8564V16.1318C14.998 16.2131 14.9528 16.289 14.8799 16.3379L11.6709 18.4443C11.5811 18.5038 11.452 18.5037 11.3623 18.4443L8.15234 16.3379C8.07949 16.289 8.03418 16.213 8.03418 16.1318V10.8564C8.03418 10.7749 7.98983 10.6982 7.91699 10.6494L5.46484 9.03711C5.39204 8.98818 5.34668 8.91256 5.34668 8.83105V2.20898L2.22754 4.25586C2.16035 4.29935 2.16026 4.38629 2.22754 4.42969L3.92773 5.54199V9.1084C3.92787 9.1896 3.97226 9.26559 4.04492 9.31445L6.48633 10.916C6.55898 10.9648 6.60352 11.0406 6.60352 11.1221V16.7559C6.60352 16.8373 6.64887 16.9133 6.72168 16.9619L11.3672 20.0127C11.457 20.0724 11.5859 20.0722 11.6758 20.0127L16.3223 16.9619C16.3949 16.9133 16.4395 16.8372 16.4395 16.7559V11.1221C16.4395 11.0406 16.4847 10.9648 16.5576 10.916L18.998 9.31445C19.0709 9.2656 19.1161 9.18971 19.1162 9.1084V5.54199H19.1045L20.9336 4.34277L17.6855 2.20898V8.83105Z" fill="white" />
                                <path d="M52.2617 4.68652C52.7083 4.68652 53.0953 4.79111 53.4111 4.99512C53.6824 5.1694 53.9989 5.51318 53.999 6.15039V16.4902H50.8916V10.5088L46.9404 15.6582C46.7094 15.9571 46.2822 16.3057 45.5342 16.3057L45.4033 16.292C44.739 16.2527 44.3506 15.929 44.1387 15.6582L39.8164 10.5088V16.4404H36.7383V6.14551C36.7384 5.50824 37.0553 5.16941 37.3213 4.99512C37.6377 4.7911 38.024 4.68653 38.4707 4.68652C38.8173 4.68652 39.0982 4.74112 39.3291 4.85059C39.5601 4.96515 39.7714 5.13984 39.9521 5.37891L45.5693 12.3516L50.8408 5.37891C51.0167 5.14483 51.2129 4.97087 51.4238 4.86133C51.6397 4.74678 51.9155 4.68654 52.2617 4.68652Z" fill="white" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M69.3174 5.08203C70.1554 5.08204 70.8636 5.15167 71.4209 5.28613C71.9347 5.41251 72.3679 5.61135 72.707 5.87598L72.8418 5.99316C73.2083 6.32186 73.4693 6.76026 73.6201 7.28809C73.7656 7.79106 73.8359 8.39865 73.8359 9.0957V12.4727C73.8359 13.1845 73.7604 13.7923 73.6201 14.2852C73.4693 14.808 73.2081 15.2416 72.8467 15.5703C72.485 15.8891 72.0081 16.1281 71.4209 16.2725C70.8636 16.412 70.1554 16.4814 69.3174 16.4814H60.3809C59.5523 16.4814 58.849 16.412 58.292 16.2725C57.7046 16.1281 57.2275 15.8941 56.8662 15.5703C56.5049 15.2416 56.2442 14.808 56.0938 14.2852C55.953 13.7923 55.8828 13.1846 55.8828 12.4727V9.0957C55.8828 8.39365 55.953 7.7861 56.0938 7.28809C56.239 6.76023 56.4999 6.32185 56.8662 5.99316C57.2275 5.66951 57.7046 5.43056 58.292 5.28613C58.8541 5.15166 59.5523 5.08203 60.3809 5.08203H69.3174ZM60.4961 8.13965C60.14 8.13965 59.8438 8.16021 59.6279 8.20996C59.4524 8.24981 59.3112 8.31954 59.2158 8.40918C59.1206 8.50373 59.0555 8.62794 59.0205 8.79199C58.9754 8.98628 58.9551 9.24589 58.9551 9.55957V12.0195C58.9551 12.3431 58.9754 12.6122 59.0205 12.8164C59.0555 12.9805 59.1205 13.0999 59.2109 13.1895C59.3061 13.274 59.4415 13.3391 59.6221 13.374C59.843 13.419 60.1397 13.4385 60.501 13.4385H69.2314C69.5629 13.4385 69.8447 13.419 70.0605 13.374C70.241 13.3391 70.3764 13.279 70.4717 13.1895C70.5621 13.0999 70.6326 12.9659 70.6777 12.8018C70.7332 12.6026 70.7578 12.3381 70.7578 12.0195V9.55957C70.7578 9.25078 70.728 8.99598 70.6777 8.80176C70.6327 8.63274 70.5621 8.50868 70.4619 8.40918C70.3665 8.31456 70.2306 8.24981 70.0498 8.20996C69.8341 8.16514 69.558 8.13965 69.2266 8.13965H60.4961Z" fill="white" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M104.295 5.08203C105.133 5.08203 105.841 5.15169 106.398 5.28613C106.913 5.41254 107.346 5.61122 107.686 5.87598L107.819 5.99316C108.186 6.32187 108.447 6.76019 108.598 7.28809C108.738 7.79108 108.813 8.39861 108.813 9.0957V12.4727C108.813 13.1846 108.738 13.7923 108.598 14.2852C108.447 14.8081 108.186 15.2416 107.824 15.5703C107.463 15.8891 106.986 16.1281 106.398 16.2725C105.841 16.412 105.133 16.4814 104.295 16.4814H95.3584C94.5305 16.4814 93.8278 16.412 93.2705 16.2725C92.6833 16.1281 92.2063 15.8941 91.8447 15.5703C91.4833 15.2416 91.217 14.8081 91.0713 14.2852C90.9258 13.7923 90.8555 13.1846 90.8555 12.4727V9.0957C90.8555 8.39365 90.9258 7.7861 91.0713 7.28809C91.217 6.76019 91.4781 6.32187 91.8447 5.99316C92.2062 5.66953 92.6834 5.43052 93.2705 5.28613C93.8328 5.15171 94.5352 5.08205 95.3584 5.08203H104.295ZM95.4688 8.13965C95.1126 8.13966 94.8164 8.1602 94.6006 8.20996C94.4252 8.24982 94.2847 8.31958 94.1895 8.40918C94.0941 8.50378 94.0282 8.62774 93.9932 8.79199C93.9481 8.98628 93.9277 9.24589 93.9277 9.55957V12.0195C93.9277 12.3431 93.9481 12.6122 93.9932 12.8164C94.0281 12.9805 94.0935 13.0999 94.1836 13.1895C94.2793 13.2741 94.415 13.3391 94.5957 13.374C94.8167 13.4189 95.1132 13.4385 95.4746 13.4385H104.205C104.536 13.4385 104.817 13.419 105.033 13.374C105.214 13.3391 105.35 13.2791 105.445 13.1895C105.536 13.0999 105.605 12.9657 105.65 12.8018C105.706 12.6026 105.731 12.3381 105.731 12.0195V9.55957C105.731 9.25078 105.701 8.99598 105.65 8.80176C105.605 8.63271 105.535 8.50869 105.435 8.40918C105.339 8.31463 105.204 8.24982 105.023 8.20996C104.803 8.16514 104.526 8.13967 104.2 8.13965H95.4688Z" fill="white" />
                                <path fillRule="evenodd" clipRule="evenodd" d="M141.697 5.08203C142.536 5.08204 143.243 5.15168 143.8 5.28613C144.314 5.41254 144.748 5.61124 145.087 5.87598L145.221 5.99316C145.587 6.32187 145.849 6.76019 146 7.28809C146.141 7.79106 146.211 8.39865 146.211 9.0957V12.4727C146.211 13.1845 146.141 13.7923 146 14.2852C145.849 14.8079 145.587 15.2416 145.227 15.5703C144.866 15.8891 144.388 16.1281 143.8 16.2725C143.243 16.412 142.536 16.4814 141.697 16.4814H132.76C131.937 16.4814 131.234 16.412 130.677 16.2725C130.089 16.1281 129.613 15.8941 129.251 15.5703C128.89 15.2416 128.629 14.808 128.478 14.2852C128.337 13.7923 128.267 13.1846 128.267 12.4727V9.0957C128.267 8.39367 128.337 7.78609 128.478 7.28809C128.623 6.76019 128.885 6.32187 129.251 5.99316C129.613 5.66954 130.089 5.43055 130.677 5.28613C131.234 5.15168 131.937 5.08205 132.76 5.08203H141.697ZM132.876 8.13965C132.52 8.13965 132.223 8.16018 132.008 8.20996C131.831 8.24982 131.691 8.31957 131.596 8.40918C131.5 8.50377 131.435 8.62776 131.4 8.79199C131.355 8.98628 131.334 9.24589 131.334 9.55957V12.0195C131.334 12.3431 131.355 12.6122 131.4 12.8164C131.435 12.9805 131.5 13.0999 131.59 13.1895C131.685 13.2741 131.822 13.3391 132.003 13.374C132.223 13.4189 132.52 13.4385 132.881 13.4385H141.61C141.942 13.4385 142.219 13.419 142.44 13.374C142.621 13.3391 142.756 13.279 142.852 13.1895C142.942 13.0999 143.012 12.9657 143.057 12.8018C143.112 12.6026 143.138 12.3381 143.138 12.0195V9.55957C143.138 9.25078 143.107 8.99598 143.057 8.80176C143.012 8.63272 142.941 8.50869 142.842 8.40918C142.746 8.31463 142.61 8.24982 142.43 8.20996C142.215 8.16512 141.937 8.13965 141.606 8.13965H132.876Z" fill="white" />
                                <path d="M151.653 11.9893C151.653 12.278 151.683 12.5177 151.733 12.707C151.779 12.8713 151.854 13.0011 151.959 13.1006C152.069 13.2002 152.226 13.2791 152.421 13.3291C152.648 13.3888 152.943 13.414 153.299 13.4141H161.995L162.086 16.4814H153.18C152.351 16.4814 151.648 16.412 151.09 16.2725C150.504 16.1281 150.026 15.8892 149.665 15.5654C149.299 15.2368 149.038 14.803 148.887 14.2803C148.746 13.7873 148.676 13.1798 148.676 12.4678V5.08203H151.743L151.653 11.9893Z" fill="white" />
                                <path d="M89.2393 7.80566L84.1729 8.00488V16.4766H81.0752V8.03516L75.5322 8.07031V5.19141L89.2393 5.08203V7.80566Z" fill="white" />
                                <path d="M118.391 12.9512L123.387 5.08203H127.052L120.414 15.3262C120.188 15.6798 119.927 15.9591 119.636 16.1582C119.325 16.3672 118.893 16.4766 118.341 16.4766C117.789 16.4766 117.357 16.3723 117.046 16.1582C116.755 15.9591 116.493 15.6798 116.268 15.3262L109.666 5.08203H113.381L118.391 12.9512Z" fill="white" />
                                <path d="M175 7.80566L169.935 8.00488V16.4766H166.838V8.03516L161.295 8.07031V5.19141L175 5.08203V7.80566Z" fill="white" />
                                <path d="M22.8643 12.6738C22.9427 12.6199 23.0547 12.6692 23.0547 12.7559V13.8789C23.0547 13.9114 23.0319 13.9392 23.0039 13.9609L19.3125 16.3867C19.2339 16.4411 19.1222 16.3923 19.1221 16.3057V15.1816C19.1222 15.1491 19.139 15.1221 19.167 15.1006L22.8643 12.6738Z" fill="white" />
                                <path d="M0 12.7559C0 12.6744 0.106974 12.625 0.185547 12.6738L3.87695 15.1006C3.90493 15.1168 3.92176 15.1491 3.92188 15.1816V16.3057C3.92174 16.3869 3.81485 16.4356 3.73633 16.3867L0.0449219 13.9609C0.0168666 13.9447 0 13.9114 0 13.8789V12.7559Z" fill="white" />
                                <path d="M0.00585938 6.12305C0.00585938 6.04177 0.111893 5.99255 0.19043 6.04102L1.21191 6.70898C1.23988 6.7252 1.25673 6.75759 1.25684 6.79004V10.4326L3.88281 12.1582C3.91088 12.1745 3.92773 12.2077 3.92773 12.2402V13.3633C3.92773 13.4447 3.82076 13.4941 3.74219 13.4453L0.0507812 11.0186C0.0227802 11.0022 0.00594183 10.9699 0.00585938 10.9375V6.12305Z" fill="white" />
                                <path d="M22.8584 6.03027C22.937 5.976 23.0498 6.02546 23.0498 6.1123V10.9268C23.0497 10.9591 23.0269 10.9863 22.999 11.0078L19.3066 13.4346C19.228 13.4883 19.1162 13.4393 19.1162 13.3525V12.2295C19.1162 12.197 19.1332 12.169 19.1611 12.1475L21.7871 10.4219V6.78516C21.7871 6.75263 21.8089 6.72481 21.8369 6.70312L22.8584 6.03027Z" fill="white" />
                                <path d="M15.0029 5.8623V7.24609L11.5195 4.96094L8.03418 7.24609V5.8623L11.5195 3.57715L15.0029 5.8623Z" fill="white" />
                                <path d="M15.0029 2.91504V4.29395L11.5195 2.00879L8.03418 4.29395V2.91504L11.5195 0.629883L15.0029 2.91504Z" fill="white" />
                            </svg>
                        </Link>
                        <div className={styles.mobileRight}>
                            <Link href={`${BASE_URL}/contact`} className={`${styles.mobileBookBtn} label-3-md`}>
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

            {/* ── Desktop mega menu ──────────────────────────────────── */}
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
                        <Link href={`${BASE_URL}/`} className={styles.megaLogo} onClick={closeMega}>
                            <Image
                                src={`${BASE_URL}/images/motovolt-logo.png`}
                                alt="Motovolt"
                                width={220}
                                height={22}
                                unoptimized
                            />
                        </Link>
                        <div className={styles.megaLeftBottom}>
                            <div className={styles.megaLegal}>
                                {LEGAL_LINKS.map((label) => (
                                    <a key={label} href="#" className={`${styles.megaLegalLink} body-3`}>
                                        {label}
                                    </a>
                                ))}
                            </div>
                            <div className={styles.megaSocials}>
                                <a href="#" className={styles.socialIcon} aria-label="Instagram">
                                    <InstagramIcon />
                                </a>
                                <a href="#" className={styles.socialIcon} aria-label="Facebook">
                                    <FacebookIcon />
                                </a>
                                <a href="#" className={styles.socialIcon} aria-label="LinkedIn">
                                    <LinkedInIcon />
                                </a>
                                <a href="#" className={styles.socialIcon} aria-label="Twitter / X">
                                    <XIcon />
                                </a>
                                <a href="#" className={styles.socialIcon} aria-label="YouTube">
                                    <YoutubeIcon />
                                </a>
                            </div>
                            <p className={`${styles.megaCopyright} body-3`}>©Motovolt Mobility Pvt. Ltd.</p>
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
                                        className={`${styles.megaNavItem} ${tab && megaActiveTab === tab ? styles.megaNavItemActive : ''
                                            }`}
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
                                            <Link href={href || `${BASE_URL}/`} className="title-3" onClick={closeMega}>
                                                {label}
                                            </Link>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <Link href={`${BASE_URL}/contact`} className={`${styles.megaBookNow} title-3`} onClick={closeMega}>
                                Book Now
                                <ArrowSvg />
                            </Link>
                        </nav>

                        <div className={styles.megaProductCol} ref={productColRef}>
                            {megaActiveTab === 'smart-vehicles' &&
                                VEHICLE_SECTIONS.map((section) => (
                                    <div key={section.label} className={styles.megaSection}>
                                        <div className={styles.megaSectionHeader}>
                                            <span className={`${styles.megaSectionLabel} label-2`}>{section.label}</span>
                                        </div>
                                        <div className={styles.megaCardGrid}>
                                            {section.products.map((product) => (
                                                <Link
                                                    key={product.name}
                                                    href={product.href}
                                                    className={`${styles.megaCard} ${product.fullWidth ? styles.megaCardFull : ''
                                                        }`}
                                                    onClick={closeMega}
                                                >
                                                    <div className={styles.megaCardImgWrap}>
                                                        {product.image && (
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                fill
                                                                sizes="200px"
                                                                style={{ objectFit: 'contain' }}
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
                                            href={item.href || `${BASE_URL}/`}
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
                                            href={item.href || `${BASE_URL}/`}
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

            {/* ── Mobile drawer ──────────────────────────────────────── */}
            <div
                className={`${styles.mobileMenu} ${menuOpen ? styles.mobileMenuOpen : ''}`}
                aria-hidden={!menuOpen}
                role="dialog"
                aria-modal="true"
                aria-label="Navigation menu"
            >
                <div className={styles.mobileMenuHeader}>
                    <Link href={`${BASE_URL}/`} onClick={closeMenu}>
                        <Image
                            src={`${BASE_URL}/images/motovolt-logo.png`}
                            alt="Motovolt"
                            width={130}
                            height={18}
                            unoptimized
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
                                                <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
                                                    <path d="M0.707031 0.707153L5.70703 5.70715L0.707031 10.7072" stroke="white" strokeLinecap="square" strokeLinejoin="bevel" />
                                                </svg>
                                            </button>
                                        ) : (
                                            <Link
                                                href={href || `${BASE_URL}/`}
                                                className={`${styles.mobileNavLink} title-1-md`}
                                                onClick={closeMenu}
                                            >
                                                {label}
                                                <svg xmlns="http://www.w3.org/2000/svg" width="7" height="12" viewBox="0 0 7 12" fill="none">
                                                    <path d="M0.707031 0.707153L5.70703 5.70715L0.707031 10.7072" stroke="white" strokeLinecap="square" strokeLinejoin="bevel" />
                                                </svg>
                                            </Link>
                                        )}
                                    </li>
                                ))}
                            </ul>
                            <div className={styles.mobileMenuBottom}>
                                <Link href={`${BASE_URL}/test-ride`} className={`${styles.mobileMenuCta} title-1-md`} onClick={closeMenu}>
                                    <span>Test Ride</span>
                                    <ArrowSvg />
                                </Link>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className={styles.mobileSubHeader}>
                                <button
                                    className={styles.mobileBackBtn}
                                    onClick={() => setMobileSubTab(null)}
                                    aria-label="Back"
                                >
                                    <svg width="8" height="14" viewBox="0 0 8 14" fill="none">
                                        <path d="M7 1L1 7L7 13" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </button>
                                <span className={`${styles.mobileSubTitle} title-1-md`}>
                                    {MOBILE_SUB_LABELS[mobileSubTab]}
                                </span>
                            </div>

                            <div className={styles.mobileSubContent} ref={mobileSubRef}>
                                {mobileSubTab === 'smart-vehicles' &&
                                    VEHICLE_SECTIONS.map((section) => (
                                        <div key={section.label} className={styles.mobileSubSection}>
                                            <p className={`${styles.mobileSubSectionLabel} label-1-md`}>{section.label}</p>
                                            {section.products.map((product) => (
                                                <Link
                                                    key={product.name}
                                                    href={product.href}
                                                    className={`${styles.mobileProductCard} ${product.fullWidth ? styles.mobileProductCardFull : ''
                                                        }`}
                                                    onClick={closeMenu}
                                                >
                                                    {product.image && (
                                                        <div className={styles.mobileProductCardImg}>
                                                            <Image
                                                                src={product.image}
                                                                alt={product.name}
                                                                width={238}
                                                                height={149}
                                                                style={{ width: '100%', height: 149, objectFit: 'contain' }}
                                                            />
                                                        </div>
                                                    )}
                                                </Link>
                                            ))}
                                        </div>
                                    ))}

                                {mobileSubTab === 'accessories' &&
                                    ACCESSORIES_ITEMS.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href || `${BASE_URL}/`}
                                            className={styles.mobileSubListItem}
                                            onClick={closeMenu}
                                        >
                                            <span className={styles.accessoriesItemName}>
                                                <span className="title-1-md">{item.name}</span>
                                                {item.tag && <span className={`${styles.newTag} label-3`}>NEW</span>}
                                            </span>
                                            <ArrowSvg />
                                        </Link>
                                    ))}

                                {mobileSubTab === 'more' &&
                                    MORE_ITEMS.map((item) => (
                                        <Link
                                            key={item.name}
                                            href={item.href || `${BASE_URL}/`}
                                            className={styles.mobileSubListItem}
                                            onClick={closeMenu}
                                        >
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