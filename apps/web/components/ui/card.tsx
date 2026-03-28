export function Card({
  className = "",
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-[28px] border border-white/80 bg-white/80 p-6 shadow-card backdrop-blur ${className}`}
    >
      {children}
    </section>
  );
}
