"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function NavLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const active =
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/");

  return (
    <Link
      href={href}
      className={cn(
        "px-3 py-2 text-sm font-medium tracking-tight transition-colors relative",
        active ? "text-neutral-900" : "text-neutral-500 hover:text-neutral-900"
      )}
    >
      {children}
      {active && (
        <span className="absolute left-3 right-3 bottom-0 h-0.5 bg-neutral-900" />
      )}
    </Link>
  );
}
