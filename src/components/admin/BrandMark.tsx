import { cn } from "@/lib/utils";

const INCENTIVA_LOGO_URL =
  "https://incentivamais.com/wp-content/themes/temaincentiva/assets/img/logo/logo.svg";

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
          "shrink-0 overflow-hidden rounded-xl bg-white",
          compact ? "h-9 w-9 p-1.5" : "h-12 w-12 p-2 ring-1 ring-border/80",
        )}
      >
        <img
          src={INCENTIVA_LOGO_URL}
          alt="Incentiva"
          className="h-full w-full object-contain"
        />
      </div>

      {!compact && (
        <div className="flex flex-col leading-tight">
          <span className="text-sm font-semibold text-display">Console Incentiva</span>
          <span className="text-[10px] uppercase tracking-[0.22em] text-muted-foreground">
            Operações e governança
          </span>
        </div>
      )}
    </div>
  );
}
