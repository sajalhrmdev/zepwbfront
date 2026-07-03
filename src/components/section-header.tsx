import Link from "next/link";
import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  href?: string;
  actionLabel?: string;
  className?: string;
  children?: React.ReactNode;
}

export function SectionHeader({ title, href, actionLabel = "View All", className, children }: SectionHeaderProps) {
  return (
    <div className={cn("flex items-center justify-between mb-6", className)}>
      <div className="flex items-center gap-3">
        {children}
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
      </div>
      {href && (
        <Link
          href={href}
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          {actionLabel} &rarr;
        </Link>
      )}
    </div>
  );
}
