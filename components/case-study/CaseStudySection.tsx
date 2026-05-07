type Props = {
  number: string;
  label: string;
  children: React.ReactNode;
};

export function CaseStudySection({ number, label, children }: Props) {
  return (
    <section>
      <div className="font-mono-tabular text-2xs uppercase tracking-mono-wide text-ink-tertiary mb-4">
        {number} — {label}
      </div>
      <div>{children}</div>
    </section>
  );
}
