export function SectionHeader({
  number,
  eyebrow,
  title,
  subtitle,
  align = "left",
}: {
  number: string;
  eyebrow: string;
  title: React.ReactNode;
  subtitle?: string;
  align?: "left" | "center";
}) {
  const alignClass = align === "center" ? "text-center mx-auto" : "";
  return (
    <header className={`max-w-3xl ${alignClass}`}>
      <div
        className={`flex items-baseline gap-3 text-[10px] font-mono uppercase tracking-[0.2em] text-ink/55 mb-5 ${
          align === "center" ? "justify-center" : ""
        }`}
      >
        <span className="text-orange">{number}</span>
        <span className="w-6 h-px bg-ink/30" />
        <span>{eyebrow}</span>
      </div>
      <h2
        className="font-display font-semibold tracking-tight leading-[1.05]"
        style={{ fontSize: "clamp(2rem, 4.5vw, 3.5rem)" }}
      >
        {title}
      </h2>
      {subtitle && (
        <p className="mt-5 text-lg text-ink/70 leading-relaxed max-w-[58ch]">
          {subtitle}
        </p>
      )}
    </header>
  );
}
