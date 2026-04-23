import Link from "next/link";
import { cn } from "@/lib/utils";

type Variant = "primary" | "secondary" | "ghost" | "danger";

const base =
  "inline-flex items-center justify-center gap-2 px-4 h-10 text-sm font-medium tracking-tight transition-colors disabled:opacity-50 disabled:cursor-not-allowed border";

const variants: Record<Variant, string> = {
  primary: "bg-neutral-900 text-white border-neutral-900 hover:bg-white hover:text-neutral-900",
  secondary: "bg-white text-neutral-900 border-neutral-900 hover:bg-neutral-900 hover:text-white",
  ghost: "bg-transparent text-neutral-700 border-transparent hover:bg-neutral-100 hover:text-neutral-900",
  danger: "bg-white text-rose-700 border-rose-700 hover:bg-rose-700 hover:text-white",
};

type BaseProps = { variant?: Variant; className?: string; children: React.ReactNode };

export function Button({
  variant = "primary",
  className,
  children,
  ...rest
}: BaseProps & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </button>
  );
}

export function LinkButton({
  variant = "primary",
  className,
  children,
  href,
  ...rest
}: BaseProps & { href: string } & Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, "href">) {
  return (
    <Link href={href} className={cn(base, variants[variant], className)} {...rest}>
      {children}
    </Link>
  );
}
