export function StatTile({
  label,
  value
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-3xl border border-uri-navy/10 bg-white/70 p-4">
      <p className="text-xs uppercase tracking-[0.2em] text-uri-navy/50">{label}</p>
      <strong className="mt-2 block text-2xl font-semibold text-uri-ink">{value}</strong>
    </div>
  );
}
