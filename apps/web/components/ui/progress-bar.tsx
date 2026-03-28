export function ProgressBar({
  value,
  max,
  tone = "gold"
}: {
  value: number;
  max: number;
  tone?: "gold" | "navy" | "blue";
}) {
  const percent = Math.min(100, Math.round((value / max) * 100));
  const toneClass =
    tone === "navy"
      ? "from-uri-navy to-[#17386e]"
      : tone === "blue"
        ? "from-[#5b83da] to-uri-sky"
        : "from-uri-gold to-[#efd593]";

  return (
    <div className="h-3 rounded-full bg-uri-navy/8">
      <div
        className={`h-3 rounded-full bg-gradient-to-r ${toneClass}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
