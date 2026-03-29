export function SectionHeading({
  eyebrow,
  title,
  description
}: {
  eyebrow: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="mb-4">
      <p className="text-xs uppercase tracking-[0.24em] text-cq-keaney">{eyebrow}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight text-cq-navy">{title}</h2>
      {description ? <p className="mt-2 text-sm leading-6 text-ig-secondary">{description}</p> : null}
    </div>
  );
}
