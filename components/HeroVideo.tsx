'use client';

type Props = {
  src: string;
  poster?: string;
  label?: string;
};

export function HeroVideo({ src, poster, label }: Props) {
  return (
    <div className="relative">
      <video
        src={src}
        poster={poster}
        autoPlay
        loop
        muted
        playsInline
        className="w-full h-auto block rounded-sm"
      />
      {label && (
        <div className="absolute top-4 right-4 font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-secondary bg-bg/80 backdrop-blur-sm px-2.5 py-1.5 rounded-sm border-hairline border-line">
          {label}
        </div>
      )}
    </div>
  );
}
