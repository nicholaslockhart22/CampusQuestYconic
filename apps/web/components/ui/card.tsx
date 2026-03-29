export function Card({
  className = "",
  children
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border border-cq-keaney/35 bg-cq-white p-6 shadow-cq-card backdrop-blur-sm ${className}`}
    >
      {children}
    </section>
  );
}
