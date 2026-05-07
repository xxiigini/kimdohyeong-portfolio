'use client';

import { useEffect, useState } from 'react';

type Props = {
  src: string;
  alt?: string;
  label?: string;
};

export function HeroImage({ src, alt = '', label }: Props) {
  const [loaded, setLoaded] = useState(false);

  // 이미지 캐시되어 있으면 즉시, 안 그러면 onLoad에서
  useEffect(() => {
    const img = new Image();
    img.src = src;
    if (img.complete) setLoaded(true);
    else img.onload = () => setLoaded(true);
  }, [src]);

  return (
    <div className="relative">
      <img
        src={src}
        alt={alt}
        className={`w-full h-auto block rounded-sm transition-opacity duration-1000 ease-out ${
          loaded ? 'opacity-100' : 'opacity-0'
        }`}
      />
      {label && (
        <div
          className={`absolute top-4 right-4 font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-secondary bg-bg/80 backdrop-blur-sm px-2.5 py-1.5 rounded-sm border-hairline border-line transition-opacity duration-1000 delay-300 ${
            loaded ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {label}
        </div>
      )}
    </div>
  );
}
