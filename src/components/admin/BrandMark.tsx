import { cn } from "@/lib/utils";

export function BrandMark({
  compact = false,
  className,
}: {
  compact?: boolean;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-3", className)}>
      <div
        className={cn(
          "brand-mark shrink-0",
          compact ? "h-9 w-9 rounded-xl" : "h-12 w-12 rounded-2xl",
        )}
      >
        <div className="brand-mark__orb brand-mark__orb--top" />
        <div className="brand-mark__orb brand-mark__orb--bottom" />
        <div className="brand-mark__letters">
          <span>IN</span>
          <span>CEN</span>
          <span>TIVA</span>
        </div>
      </div>

      {!compact && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-display">Incentiva Ops</span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            AI-First Console
          </span>
        </div>
      )}
    </div>
  );
}
