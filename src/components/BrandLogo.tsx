import React from 'react';

interface BrandLogoProps {
  variant?: 'full' | 'mark' | 'roundel' | 'falcon';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
}) => {
  // Size dimensions
  const sizeMap = {
    sm: { h: 32, markW: 70 },
    md: { h: 42, markW: 90 },
    lg: { h: 64, markW: 140 },
    xl: { h: 84, markW: 180 },
  };

  const currentSize = sizeMap[size];

  // The intertwined M& with Backpack SVG mark
  const IntertwinedMark = ({ width = 110, height = 54 }: { width?: number; height?: number }) => (
    <svg
      viewBox="0 0 160 80"
      width={width}
      height={height}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="shrink-0"
    >
      <defs>
        {/* Rose-Gold / Brushed Copper Metallic Gradient */}
        <linearGradient id="roseGoldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#E2B29F" />
          <stop offset="35%" stopColor="#C88D76" />
          <stop offset="70%" stopColor="#DF9B84" />
          <stop offset="100%" stopColor="#A86C55" />
        </linearGradient>

        <linearGradient id="roseGoldHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#F5D2C4" />
          <stop offset="50%" stopColor="#C88D76" />
          <stop offset="100%" stopColor="#8C4E38" />
        </linearGradient>

        <filter id="copperGlow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.5" floodColor="#8C4E38" floodOpacity="0.4" />
        </filter>
      </defs>

      {/* Serif Letter "M" */}
      <g filter="url(#copperGlow)">
        {/* Left vertical serif stem */}
        <path
          d="M 12 18 L 22 18 L 22 62 L 12 62 M 17 18 L 17 62"
          stroke="url(#roseGoldGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Top and bottom serifs on left stem */}
        <line x1="10" y1="18" x2="24" y2="18" stroke="url(#roseGoldGrad)" strokeWidth="2.5" />
        <line x1="10" y1="62" x2="24" y2="62" stroke="url(#roseGoldGrad)" strokeWidth="2.5" />

        {/* Diagonal stroke down */}
        <path
          d="M 21 18 L 38 56 L 41 56 L 56 18"
          stroke="url(#roseGoldHighlight)"
          strokeWidth="3.6"
          strokeLinejoin="round"
        />

        {/* Right vertical stem */}
        <path
          d="M 55 18 L 65 18 L 65 62 L 55 62 M 60 18 L 60 62"
          stroke="url(#roseGoldGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        <line x1="53" y1="18" x2="67" y2="18" stroke="url(#roseGoldGrad)" strokeWidth="2.5" />
        <line x1="53" y1="62" x2="67" y2="62" stroke="url(#roseGoldGrad)" strokeWidth="2.5" />

        {/* Ampersand & Flourish loop intertwined */}
        <path
          d="M 54 44 C 47 38 48 30 56 26 C 64 22 72 27 68 37 C 65 44 52 50 49 56 C 46 62 52 66 59 64 C 69 61 77 53 82 48"
          stroke="url(#roseGoldGrad)"
          strokeWidth="3.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M 56 38 L 78 64"
          stroke="url(#roseGoldHighlight)"
          strokeWidth="3.5"
          strokeLinecap="round"
        />

        {/* Technical Backpack Silhouette (Right of M&) */}
        {/* Top Grab Handle */}
        <path
          d="M 96 14 C 96 9, 108 9, 108 14"
          stroke="url(#roseGoldGrad)"
          strokeWidth="2.8"
          strokeLinecap="round"
          fill="none"
        />

        {/* Main Arch / Body of Backpack */}
        <path
          d="M 88 28 C 88 16, 96 15, 108 15 C 120 15, 126 16, 126 28 L 126 58 C 126 62, 122 65, 117 65 L 97 65 C 92 65, 88 62, 88 58 Z"
          fill="#1C1F22"
          stroke="url(#roseGoldHighlight)"
          strokeWidth="3.2"
          strokeLinejoin="round"
        />

        {/* Front Utility Pocket */}
        <path
          d="M 91 38 C 91 35, 95 34, 107 34 C 119 34, 123 35, 123 38 L 123 58 C 123 61, 120 63, 116 63 L 98 63 C 94 63, 91 61, 91 58 Z"
          fill="#25292E"
          stroke="url(#roseGoldGrad)"
          strokeWidth="2.4"
          strokeLinejoin="round"
        />

        {/* Front Horizontal Zipper Line */}
        <line x1="95" y1="41" x2="119" y2="41" stroke="url(#roseGoldHighlight)" strokeWidth="1.8" />
        <circle cx="96" cy="41" r="1.5" fill="#E2B29F" />

        {/* Backpack Strap Detail / Stitch Lines */}
        <path
          d="M 126 24 C 131 26, 134 32, 133 46 C 132 54, 128 58, 126 59"
          stroke="url(#roseGoldGrad)"
          strokeWidth="2.4"
          strokeLinecap="round"
          fill="none"
        />
        {/* Subtle vertical stitch line */}
        <line x1="113" y1="21" x2="113" y2="30" stroke="url(#roseGoldGrad)" strokeWidth="1.2" strokeDasharray="2 1.5" />
      </g>
    </svg>
  );

  // Circular Roundel Stamp: "M&B ATELIER" / "EST. 2026 | LAHORE, PAKISTAN"
  if (variant === 'roundel') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <svg
          viewBox="0 0 200 200"
          className="w-28 h-28 sm:w-36 sm:h-36 shrink-0"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="roundelCopper" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2B29F" />
              <stop offset="50%" stopColor="#C88D76" />
              <stop offset="100%" stopColor="#9C5B42" />
            </linearGradient>

            {/* Circular text paths */}
            <path id="topCurve" d="M 28 100 A 72 72 0 0 1 172 100" fill="none" />
            <path id="bottomCurve" d="M 172 100 A 72 72 0 0 1 28 100" fill="none" />
          </defs>

          {/* Outer Ring */}
          <circle cx="100" cy="100" r="94" stroke="url(#roundelCopper)" strokeWidth="2.5" fill="#181B1F" />
          <circle cx="100" cy="100" r="88" stroke="url(#roundelCopper)" strokeWidth="1.2" fill="none" />

          {/* Inner Ring */}
          <circle cx="100" cy="100" r="62" stroke="url(#roundelCopper)" strokeWidth="1.8" fill="#1C1F24" />

          {/* Curved Text: Top */}
          <text fill="#E2B29F" fontSize="13" fontWeight="700" letterSpacing="0.22em" fontFamily="Montserrat, serif">
            <textPath href="#topCurve" startOffset="50%" textAnchor="middle">
              M&B ATELIER
            </textPath>
          </text>

          {/* Curved Text: Bottom */}
          <text fill="#C88D76" fontSize="8.5" fontWeight="600" letterSpacing="0.18em" fontFamily="Montserrat, sans-serif">
            <textPath href="#bottomCurve" startOffset="50%" textAnchor="middle">
              EST. 2026 | LAHORE, PAKISTAN
            </textPath>
          </text>

          {/* Center Emblem: Mini Intertwined M& + Backpack */}
          <g transform="translate(42, 60) scale(0.72)">
            {/* Serif M */}
            <path d="M 16 16 L 24 16 L 24 54 L 16 54 M 20 16 L 20 54" stroke="url(#roundelCopper)" strokeWidth="2.8" />
            <path d="M 24 16 L 38 48 L 40 48 L 52 16" stroke="url(#roundelCopper)" strokeWidth="2.8" strokeLinejoin="round" />
            <path d="M 52 16 L 60 16 L 60 54 L 52 54 M 56 16 L 56 54" stroke="url(#roundelCopper)" strokeWidth="2.8" />
            
            {/* Ampersand */}
            <path d="M 52 38 C 46 32 46 26 54 22 C 60 19 66 23 63 32 C 60 38 48 44 46 49 C 44 54 50 57 56 55 C 64 52 70 46 75 41" stroke="url(#roundelCopper)" strokeWidth="3" fill="none" />
            
            {/* Backpack */}
            <path d="M 80 24 C 80 14, 86 13, 96 13 C 106 13, 112 14, 112 24 L 112 48 C 112 52, 108 55, 104 55 L 88 55 C 84 55, 80 52, 80 48 Z" stroke="url(#roundelCopper)" strokeWidth="2.6" fill="#14171A" />
            <path d="M 83 33 C 83 30, 86 29, 96 29 C 106 29, 109 30, 109 33 L 109 48 C 109 51, 106 53, 103 53 L 89 53 C 86 53, 83 51, 83 48 Z" stroke="url(#roundelCopper)" strokeWidth="2" fill="#20242A" />
            <line x1="86" y1="35" x2="106" y2="35" stroke="url(#roundelCopper)" strokeWidth="1.4" />
          </g>
        </svg>
      </div>
    );
  }

  // Tactical Falcon / Eagle carrying Key Emblem
  if (variant === 'falcon') {
    return (
      <div className={`p-4 bg-[#181B1F] border border-[#C88D76]/40 rounded-xl flex flex-col items-center text-center ${className}`}>
        {/* Top M& backpack mini */}
        <div className="mb-2">
          <IntertwinedMark width={70} height={34} />
        </div>
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-[#C88D76]/60 to-transparent my-2" />
        
        {/* Falcon with Key in talons */}
        <svg viewBox="0 0 100 80" className="w-16 h-14 text-[#C88D76] my-1" fill="currentColor">
          <path d="M 45 10 C 52 14, 60 16, 70 14 C 75 18, 72 24, 68 28 C 76 26, 85 24, 88 28 C 84 32, 78 36, 70 38 C 76 40, 84 42, 86 46 C 80 48, 72 48, 65 47 C 62 52, 58 58, 52 64 C 47 62, 45 56, 47 50 C 42 54, 35 60, 26 64 C 30 57, 36 50, 40 44 C 34 46, 26 48, 18 48 C 24 43, 32 37, 38 32 C 30 32, 22 32, 14 30 C 22 26, 34 22, 44 20 Z" />
          {/* Key in Talons */}
          <path d="M 46 62 L 74 62 C 76 62, 78 60, 78 58 C 78 56, 76 54, 74 54 C 72 54, 70 56, 70 58 L 56 58 L 56 55 L 53 55 L 53 58 L 48 58 C 45 58, 43 60, 43 62 C 43 64, 45 66, 48 66 Z" />
        </svg>

        <p className="font-display font-semibold text-xs text-white mt-1">Atelier Carry.</p>
        <p className="text-[11px] text-[#E2B29F] leading-tight">Designed for You.<br />Proof Against Pakistan.</p>
      </div>
    );
  }

  // Mark only
  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center ${className}`}>
        <IntertwinedMark width={currentSize.markW} height={currentSize.h} />
      </div>
    );
  }

  // Full Brand Lockup: Emblem + "M&B ATELIER" + "mbatelier.shop"
  return (
    <div className={`inline-flex flex-col items-center text-center ${className}`}>
      {/* Top Emblem */}
      <IntertwinedMark width={currentSize.markW} height={currentSize.h} />
      
      {/* Brand Title: High-Contrast Roman Serif */}
      <span className="font-display font-extrabold text-base sm:text-lg tracking-[0.24em] text-white uppercase mt-1 leading-none">
        M&B ATELIER
      </span>

      {/* Domain Subtitle */}
      <span className="text-[11px] sm:text-xs font-medium tracking-[0.12em] text-[#C88D76] mt-0.5">
        mbatelier.shop
      </span>
    </div>
  );
};
