import { ArrowDownRight, ArrowUpRight, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface KpiCardProps {
  label: string;
  value: string;
  delta: number;
  deltaLabel?: string;
  icon: LucideIcon;
  spark?: number[];
  accent?: "primary" | "info" | "success" | "destructive";
}

export function KpiCard({
  label,
  value,
  delta,
  deltaLabel = "vs. período anterior",
  icon: Icon,
  spark = [],
  accent = "primary",
}: KpiCardProps) {
  const positive = delta >= 0;
  const accentMap: Record<string, string> = {
    primary: "text-primary",
    info: "text-[color:var(--color-info)]",
    success: "text-[color:var(--color-success)]",
    destructive: "text-destructive",
  };

  const max = Math.max(...spark, 1);
  const min = Math.min(...spark, 0);
  const range = max - min || 1;
  const points = spark
    .map((v, i) => `${(i / (spark.length - 1)) * 100},${30 - ((v - min) / range) * 28}`)
    .join(" ");

  return (
    <div className="surface-card p-5 group relative overflow-hidden">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className={cn("h-8 w-8 rounded-md bg-muted flex items-center justify-center", accentMap[accent])}>
            <Icon className="h-4 w-4" />
          </div>
          <span className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
            {label}
          </span>
        </div>
        <div
          className={cn(
            "flex items-center gap-0.5 text-xs font-medium text-mono px-1.5 py-0.5 rounded",
            positive
              ? "text-[color:var(--color-success)] bg-[color:var(--color-success)]/10"
              : "text-destructive bg-destructive/10",
          )}
        >
          {positive ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
          {Math.abs(delta).toFixed(1)}%
        </div>
      </div>

      <div className="flex items-end justify-between gap-4">
        <div>
          <div className="text-3xl text-display font-semibold tracking-tight">{value}</div>
          <div className="text-[11px] text-muted-foreground mt-1">{deltaLabel}</div>
        </div>
        {spark.length > 0 && (
          <svg viewBox="0 0 100 30" className="w-24 h-10 shrink-0" preserveAspectRatio="none">
            <polyline
              points={points}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className={accentMap[accent]}
              vectorEffect="non-scaling-stroke"
            />
          </svg>
        )}
      </div>
    </div>
  );
}
