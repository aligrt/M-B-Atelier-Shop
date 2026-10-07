import React from 'react';
import brandLogo3dImg from '../assets/images/brand_logo_3d_rosegold.jpg';
import brandLogoMarkImg from '../assets/images/brand_logo_3d_mark.jpg';
import brandLogoRoundelImg from '../assets/images/brand_logo_3d_roundel.jpg';
import brandLogoFalconImg from '../assets/images/brand_logo_3d_falcon.jpg';

interface BrandLogoProps {
  variant?: 'full' | 'mark' | 'roundel' | 'falcon' | 'showcase';
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  variant = 'full',
  className = '',
  size = 'md',
}) => {
  // Size dimensions for mark - using clean inline styling without white background
  const sizeMap = {
    sm: 'h-[40px] w-auto max-h-[40px]',
    md: 'h-11 sm:h-12 w-auto',
    lg: 'h-16 sm:h-20 w-auto',
    xl: 'h-24 sm:h-28 w-auto',
  };

  // Full 3D Branding Asset Board Showcase
  if (variant === 'showcase') {
    return (
      <div className={`relative rounded-3xl overflow-hidden border border-[#C88D76]/40 shadow-2xl bg-[#14171A] group ${className}`}>
        <img
          src={brandLogo3dImg}
          alt="M&B Atelier - High-Resolution Rose Gold 3D Branding"
          className="w-full h-auto object-cover object-center group-hover:scale-[1.01] transition-transform duration-700"
          referrerPolicy="no-referrer"
          loading="eager"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#14171A]/60 via-transparent to-transparent pointer-events-none" />
      </div>
    );
  }

  // Circular Roundel Stamp: "M&B ATELIER" / "EST. 2026 | LAHORE, PAKISTAN"
  if (variant === 'roundel') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <div className="w-28 h-28 sm:w-36 sm:h-36 rounded-full overflow-hidden border-2 border-[#C88D76]/60 shadow-xl bg-[#16181B] group hover:border-[#E2B29F] transition-all">
          <img
            src={brandLogoRoundelImg}
            alt="M&B Atelier EST. 2026 Lahore Pakistan Roundel Seal"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  }

  // Tactical Falcon Emblem Card: "Atelier Carry. Designed for You. Proof Against Pakistan."
  if (variant === 'falcon') {
    return (
      <div className={`relative inline-flex items-center justify-center ${className}`}>
        <div className="w-48 sm:w-56 rounded-2xl overflow-hidden border border-[#C88D76]/40 shadow-xl bg-[#16181B] group hover:border-[#E2B29F] transition-all">
          <img
            src={brandLogoFalconImg}
            alt="Atelier Carry Falcon Emblem - Proof Against Pakistan"
            className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    );
  }

  // Pure 3D Rose Gold Emblem Mark
  if (variant === 'mark') {
    return (
      <div className={`inline-flex items-center justify-center shrink-0 bg-transparent ${className}`}>
        <img
          src={brandLogoMarkImg}
          alt="M&B Atelier 3D Rose Gold Emblem"
          className={`${sizeMap[size]} object-contain rounded-md transition-transform hover:scale-105 bg-transparent`}
          style={{ height: size === 'sm' ? '40px' : undefined, width: 'auto', objectFit: 'contain' }}
          referrerPolicy="no-referrer"
        />
      </div>
    );
  }

  // Full Brand Lockup: 3D Emblem + Serif Typography + Domain
  return (
    <div className={`inline-flex flex-col items-center text-center ${className}`}>
      {/* 3D Rose Gold Mark */}
      <img
        src={brandLogoMarkImg}
        alt="M&B Atelier 3D Rose Gold Monogram"
        className={`${sizeMap[size]} object-contain rounded-xl mb-1 transition-transform hover:scale-105`}
        referrerPolicy="no-referrer"
      />
      
      {/* Brand Title: High-Contrast Roman Serif */}
      <span className="font-display font-extrabold text-base sm:text-lg tracking-[0.22em] text-white uppercase leading-none mt-1">
        M&B ATELIER
      </span>

      {/* Domain Subtitle */}
      <span className="text-[10px] sm:text-[11px] font-medium tracking-[0.14em] text-[#E2B29F] mt-0.5">
        mbatelier.shop
      </span>
    </div>
  );
};
