interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  titleHighlight?: string;
  description?: string;
  center?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  titleHighlight,
  description,
  center = true,
}: SectionHeaderProps) {
  return (
    <div className={center ? "text-center max-w-3xl mx-auto" : "max-w-3xl"}>
      {eyebrow && (
        <p className="text-xs font-semibold uppercase tracking-widest text-[#F59E0B] mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-serif-display text-3xl sm:text-4xl md:text-5xl font-bold text-[#F8FAFC] leading-tight mb-4">
        {title}{" "}
        {titleHighlight && (
          <span className="gradient-gold-text">{titleHighlight}</span>
        )}
      </h2>
      {description && (
        <p className="text-[#94A3B8] text-lg leading-relaxed">{description}</p>
      )}
    </div>
  );
}
