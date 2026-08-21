import React, { useEffect, useRef } from 'react';

/**
 * Google AdSense ad unit wrapper.
 *
 * Renders the <ins class="adsbygoogle"> placeholder and pushes it to the
 * adsbygoogle queue once the underlying DOM node mounts. Guards against
 * double-pushing the same slot (React StrictMode double-invoke, HMR,
 * re-renders) which would otherwise trigger AdSense's
 * "adsbygoogle.push() error: All ins elements ... already have ads" warning.
 *
 * Requires the AdSense loader script (with data-ad-client) in index.html.
 */
declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdUnitProps {
  /** data-ad-slot value from the AdSense ad unit. */
  adSlot: string;
  /** data-ad-format value, e.g. "auto" or "autorelaxed". Defaults to "auto". */
  adFormat?: string;
  /** Whether to render data-full-width-responsive. Omit to leave the attribute unset. */
  fullWidthResponsive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

export const AdUnit: React.FC<AdUnitProps> = ({
  adSlot,
  adFormat = 'auto',
  fullWidthResponsive,
  className = '',
  style,
}) => {
  const insRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current) return;
    const node = insRef.current;
    if (!node) return;
    // Already filled (e.g. hot reload re-running effects) - don't push again.
    if (node.getAttribute('data-adsbygoogle-status')) return;

    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      pushedRef.current = true;
    } catch (err) {
      console.error('AdSense push failed:', err);
    }
  }, []);

  return (
    <div className={`w-full flex justify-center overflow-hidden ${className}`}>
      <ins
        ref={insRef}
        className="adsbygoogle"
        style={{ display: 'block', width: '100%', ...style }}
        data-ad-client="ca-pub-9187440931404634"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-full-width-responsive={
          fullWidthResponsive === undefined ? undefined : fullWidthResponsive ? 'true' : 'false'
        }
      />
    </div>
  );
};
