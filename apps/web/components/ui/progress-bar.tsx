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
      ? "from-cq-navy to-cq-navyLight"
      : tone === "blue"
        ? "from-cq-keaney to-cq-keaneyBright"
        : "from-uri-gold to-[#efd593]";

  return (
    <div className="h-3 rounded-full bg-cq-keaneySoft/80 ring-1 ring-cq-keaney/25">
      <div
        className={`h-3 rounded-full bg-gradient-to-r ${toneClass}`}
        style={{ width: `${percent}%` }}
      />
    </div>
  );
}
