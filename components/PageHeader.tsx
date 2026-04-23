import Link from "next/link";

export default function PageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  back,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  actions?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <header className="mb-10 pb-6 border-b border-neutral-200 flex items-end justify-between gap-6 flex-wrap">
      <div className="min-w-0">
        {back && (
          <Link
            href={back.href}
            className="inline-flex items-center gap-1 text-xs uppercase tracking-widest text-neutral-500 hover:text-neutral-900 mb-3"
          >
            ← {back.label}
          </Link>
        )}
        {eyebrow && (
          <div className="text-[11px] uppercase tracking-[0.2em] text-neutral-500 mb-3">
            {eyebrow}
          </div>
        )}
        <h1 className="iaf-display text-5xl sm:text-6xl lg:text-7xl text-neutral-950 break-words">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-4 text-neutral-500 max-w-2xl">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </header>
  );
}
