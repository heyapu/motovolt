import React from 'react';
import styles from './primarybtn.module.scss';

interface PrimaryButtonProps {
    title: string;
    href?: string;
    onClick?: React.MouseEventHandler<HTMLButtonElement | HTMLAnchorElement>;
    className?: string;
    target?: string;
    rel?: string;
    blackButton?: boolean;
    whiteButton?: boolean;
    borderBlack?: boolean;
    colorVariant?: 'color1' | 'color2' | 'color3' | 'color4' | 'color5' | 'color6';
    orangeButton?: boolean;
    svg?: React.ReactNode;
    noMbsvg?: boolean;
    hideArrow?: boolean;
    doubleArrow?: boolean;
    type?: 'button' | 'submit' | 'reset';
}

export default function PrimaryButton({
    title,
    href,
    onClick,
    className = '',
    target,
    rel,
    blackButton,
    whiteButton,
    borderBlack,
    colorVariant,
    orangeButton,
    svg,
    noMbsvg,
    hideArrow = false,
    doubleArrow = false,
    type = 'button',
}: PrimaryButtonProps) {
    const colorMap: Record<string, string> = {
        color1: 'var(--color-1)',
        color2: 'var(--color-2)',
        color3: 'var(--color-3)',
        color4: 'var(--color-4)',
        color5: 'var(--color-5)',
        color6: 'var(--color-6)',
    };

    const combinedClassName = `${styles.primaryBtn} ${blackButton ? styles.blackButton : ''} ${whiteButton ? styles.whiteButton : ''} ${borderBlack ? styles.borderBlack : ''} ${orangeButton ? styles.orangeButton : ''} ${noMbsvg ? styles.noMbsvg : ''} label-1 body-2-md chakra ${className}`.trim();
    const combinedStyle = colorVariant ? { backgroundColor: colorMap[colorVariant] } : undefined;

    const content = (
        <>
            {title}
            {!hideArrow && (
                svg ? svg : doubleArrow ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 13 13" fill="none">
                        <g clipPath="url(#doubleArrowClip)">
                            <path d="M2.74609 2.34668L6.67018 6.27076L2.74609 10.1948" stroke="white" strokeWidth="1.20623" strokeLinecap="square" strokeLinejoin="bevel" />
                            <path d="M6.67188 2.34668L10.596 6.27076L6.67188 10.1948" stroke="white" strokeWidth="1.20623" strokeLinecap="square" strokeLinejoin="bevel" />
                        </g>
                        <defs>
                            <clipPath id="doubleArrowClip">
                                <rect width="12.5563" height="12.5563" fill="white" />
                            </clipPath>
                        </defs>
                    </svg>
                ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="14" viewBox="0 0 16 14" fill="none">
                        <path d="M12.8336 9.17592e-05L15.3016 7.96831e-05L15.3016 13.5317L12.8336 13.5317L12.8336 3.91348L2.09296 13.5149L0.347808 11.9548L11.253 2.20633L3.26925e-05 2.20633L3.31369e-05 9.17592e-05H12.8336Z" fill="white" />
                    </svg>
                )
            )}
        </>
    );

    if (!href) {
        return (
            <button
                type={type}
                onClick={onClick as React.MouseEventHandler<HTMLButtonElement>}
                style={combinedStyle}
                className={combinedClassName}
            >
                {content}
            </button>
        );
    }

    return (
        <a
            href={href}
            onClick={onClick as React.MouseEventHandler<HTMLAnchorElement>}
            target={target || '_self'}
            rel={rel}
            style={combinedStyle}
            className={combinedClassName}
        >
            {content}
        </a>
    );
}