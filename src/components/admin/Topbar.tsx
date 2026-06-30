import { Bell, Search, Filter, CalendarRange, LogOut } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { BrandMark } from "@/components/admin/BrandMark";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatPeriodLabel, formatVisibilityModeLabel, useAdminFilters, type PeriodPreset, type VisibilityMode } from "@/components/admin/admin-filters";
import { useAdminAuth } from "@/components/admin/auth-context";

interface TopbarProps {
  breadcrumb: string[];
}

export function Topbar({ breadcrumb }: TopbarProps) {
  const {
    selectedOperationId,
    selectedPeriod,
    selectedVisibilityMode,
    operationOptions,
    selectedAccessProfile,
    setSelectedOperationId,
    setSelectedPeriod,
    setSelectedVisibilityMode,
  } = useAdminFilters();
  const { session, signOut } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/88 backdrop-blur-xl px-4 topbar-glow">
      <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
      <div className="h-5 w-px bg-border" />
      <div className="hidden xl:flex">
        <BrandMark compact className="mr-1" />
      </div>
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumb.map((c, i) => (
          <span key={i} className="flex items-center gap-1.5">
            <span
              className={
                i === breadcrumb.length - 1
                  ? "text-foreground font-medium"
                  : "text-muted-foreground"
              }
            >
              {c}
            </span>
            {i < breadcrumb.length - 1 && (
              <span className="text-muted-foreground/40">/</span>
            )}
          </span>
        ))}
      </nav>

      <div className="ml-auto flex items-center gap-2">
        <div className="relative hidden md:block">
          <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar operações, clientes, métricas..."
            className="h-9 w-[280px] pl-8 bg-surface border-border text-sm"
          />
          <kbd className="absolute right-2 top-1/2 -translate-y-1/2 hidden md:inline-flex h-5 items-center rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground text-mono">
            ⌘K
          </kbd>
        </div>

        <div className="hidden lg:flex items-center gap-2">
          <Select
            value={selectedVisibilityMode}
            onValueChange={(value) => setSelectedVisibilityMode(value as VisibilityMode)}
          >
            <SelectTrigger
              className="h-9 w-[170px] bg-surface border-border text-xs"
              disabled={session?.defaultVisibility === "client"}
            >
              <SelectValue placeholder="Visibilidade" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="internal">{formatVisibilityModeLabel("internal")}</SelectItem>
              <SelectItem value="client">{formatVisibilityModeLabel("client")}</SelectItem>
            </SelectContent>
          </Select>

          <div className="relative">
            <CalendarRange className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Select value={selectedPeriod} onValueChange={(value) => setSelectedPeriod(value as PeriodPreset)}>
              <SelectTrigger className="h-9 w-[170px] pl-8 bg-surface border-border text-xs">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="mtd">{formatPeriodLabel("mtd")}</SelectItem>
                <SelectItem value="7d">{formatPeriodLabel("7d")}</SelectItem>
                <SelectItem value="30d">{formatPeriodLabel("30d")}</SelectItem>
                <SelectItem value="90d">{formatPeriodLabel("90d")}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="relative">
            <Filter className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Select value={selectedOperationId} onValueChange={setSelectedOperationId}>
              <SelectTrigger className="h-9 w-[220px] pl-8 bg-surface border-border text-xs">
                <SelectValue placeholder="Operação" />
              </SelectTrigger>
              <SelectContent>
                {operationOptions.map((option) => (
                  <SelectItem key={option.id} value={option.id}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Badge
          variant="outline"
          className="hidden xl:inline-flex h-8 rounded-full border-primary/25 bg-primary/8 text-primary px-3 text-[10px] uppercase tracking-[0.18em]"
        >
          {session?.name ?? selectedAccessProfile.label}
        </Badge>

        <Badge
          variant="outline"
          className="hidden xl:inline-flex h-8 rounded-full border-border bg-surface px-3 text-[10px] uppercase tracking-[0.18em]"
        >
          {formatVisibilityModeLabel(selectedVisibilityMode)}
        </Badge>

        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9"
          onClick={() => {
            void signOut();
          }}
        >
          <LogOut className="h-4 w-4" />
        </Button>

        <Button variant="ghost" size="icon" className="h-9 w-9">
          <Bell className="h-4 w-4" />
        </Button>
      </div>
    </header>
  );
}
