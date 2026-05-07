import type { ProcessStep } from '@/content/projects';

export function ProcessStepBlock({ step }: { step: ProcessStep }) {
  return (
    <div>
      {/* Text */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="flex items-baseline gap-4 mb-3">
          <span className="font-mono-tabular text-xs text-ink-tertiary tabular">{step.number}</span>
          <h3 className="text-xl font-medium tracking-tight">{step.title}</h3>
        </div>
        <p className="text-base leading-relaxed text-ink-secondary pl-8 text-balance">
          {step.body}
        </p>
      </div>

      {/* Media */}
      {step.media && step.media.length > 0 && (
        <div
          className={`grid gap-4 ${
            step.media.length === 1 ? 'grid-cols-1' : 'grid-cols-1 md:grid-cols-2'
          }`}
        >
          {step.media.map((m, i) => {
            // Poster grid — 8장 포스터를 4×2 그리드로, 배경은 사이트 테마 따라감
            if (m.type === 'poster-grid') {
              return (
                <figure key={i} className="space-y-2 col-span-full">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                    {m.srcs.map((src, j) => (
                      <img
                        key={j}
                        src={src}
                        alt=""
                        loading="lazy"
                        className="w-full h-auto block rounded-sm"
                      />
                    ))}
                  </div>
                  {m.caption && (
                    <figcaption className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mt-3">
                      {m.caption}
                    </figcaption>
                  )}
                </figure>
              );
            }

            // 일반 이미지 / 비디오
            return (
              <figure key={i} className="space-y-2">
                {m.type === 'image' ? (
                  <img
                    src={m.src}
                    alt={m.caption || ''}
                    className="w-full h-auto block rounded-sm"
                  />
                ) : (
                  <video
                    src={m.src}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto block rounded-sm"
                  />
                )}
                {m.caption && (
                  <figcaption className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary">
                    {m.caption}
                  </figcaption>
                )}
              </figure>
            );
          })}
        </div>
      )}
    </div>
  );
}
