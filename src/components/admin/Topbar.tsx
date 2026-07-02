import {
  Bell,
  CalendarRange,
  Filter,
  LogOut,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import { useAdminAuth } from "@/components/admin/auth-context";
import {
  formatPeriodLabel,
  useAdminFilters,
  type PeriodPreset,
} from "@/components/admin/admin-filters";
import { BrandMark } from "@/components/admin/BrandMark";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface TopbarProps {
  breadcrumb: string[];
  hidePeriodFilter?: boolean;
}

export function Topbar({ breadcrumb, hidePeriodFilter = false }: TopbarProps) {
  const {
    selectedOperationId,
    selectedPeriod,
    operationOptions,
    selectedAccessProfile,
    setSelectedOperationId,
    setSelectedPeriod,
  } = useAdminFilters();
  const { session, signOut } = useAdminAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/88 backdrop-blur-xl topbar-glow">
      <div className="flex min-h-16 flex-wrap items-center gap-3 px-3 py-3 md:px-4">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div className="hidden h-5 w-px bg-border sm:block" />

        <div className="hidden xl:flex">
          <BrandMark compact className="mr-1" />
        </div>

        <div className="min-w-0 flex-1">
          <nav className="flex items-center gap-1.5 overflow-hidden text-sm">
            {breadcrumb.map((crumb, index) => {
              const isLast = index === breadcrumb.length - 1;
              const hideOnMobile = index < breadcrumb.length - 2;

              return (
                <span
                  key={`${crumb}-${index}`}
                  className={
                    hideOnMobile
                      ? "hidden items-center gap-1.5 sm:flex"
                      : "flex min-w-0 items-center gap-1.5"
                  }
                >
                  <span
                    className={
                      isLast
                        ? "truncate font-medium text-foreground"
                        : "truncate text-muted-foreground"
                    }
                  >
                    {crumb}
                  </span>
                  {!isLast ? <span className="text-muted-foreground/40">/</span> : null}
                </span>
              );
            })}
          </nav>

          <div className="mt-1 flex flex-wrap items-center gap-1.5 xl:hidden">
            <Badge
              variant="outline"
              className="h-5 rounded-full border-border bg-surface px-2 text-[10px] uppercase tracking-[0.16em]"
            >
              {session?.name ?? selectedAccessProfile.label}
            </Badge>
          </div>
        </div>

        <div className="ml-auto flex w-full flex-wrap items-center justify-end gap-2 md:w-auto md:flex-nowrap">
          <div className="relative hidden min-w-0 flex-1 lg:block xl:w-[260px]">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Buscar operações, clientes, métricas..."
              className="h-9 w-full min-w-0 pl-8 bg-surface border-border text-sm"
            />
            <kbd className="absolute right-2 top-1/2 hidden h-5 -translate-y-1/2 items-center rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground text-mono xl:inline-flex">
              ⌘K
            </kbd>
          </div>

          <div className="hidden items-center gap-2 xl:flex">
            {!hidePeriodFilter ? (
              <div className="relative">
                <CalendarRange className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
                <Select
                  value={selectedPeriod}
                  onValueChange={(value) => setSelectedPeriod(value as PeriodPreset)}
                >
                  <SelectTrigger className="h-9 w-[170px] pl-8 bg-surface border-border text-xs">
                    <SelectValue placeholder="Período" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="mtd">{formatPeriodLabel("mtd")}</SelectItem>
                    <SelectItem value="prev_month">{formatPeriodLabel("prev_month")}</SelectItem>
                    <SelectItem value="7d">{formatPeriodLabel("7d")}</SelectItem>
                    <SelectItem value="90d">{formatPeriodLabel("90d")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            ) : null}

            <div className="relative">
              <Filter className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
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

          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface xl:hidden">
                <SlidersHorizontal className="h-3.5 w-3.5" />
                Filtros
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-full max-w-sm">
              <SheetHeader>
                <SheetTitle>Filtros e contexto</SheetTitle>
                <SheetDescription>Ajuste o recorte do painel.</SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Sessão ativa
                  </div>
                  <div className="mt-2 text-sm font-medium text-display">
                    {session?.name ?? selectedAccessProfile.label}
                  </div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    Recorte e permissões seguem a sessão atual, sem expor controles desnecessários
                    dentro do cockpit.
                  </p>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Busca rápida
                  </label>
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      placeholder="Buscar operação, cliente ou tema..."
                      className="h-11 bg-surface border-border pl-10 text-sm"
                    />
                  </div>
                </div>

                {!hidePeriodFilter ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Período
                    </label>
                    <Select
                      value={selectedPeriod}
                      onValueChange={(value) => setSelectedPeriod(value as PeriodPreset)}
                    >
                      <SelectTrigger className="h-11 bg-surface border-border text-sm">
                        <SelectValue placeholder="Período" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="mtd">{formatPeriodLabel("mtd")}</SelectItem>
                        <SelectItem value="prev_month">{formatPeriodLabel("prev_month")}</SelectItem>
                        <SelectItem value="7d">{formatPeriodLabel("7d")}</SelectItem>
                        <SelectItem value="90d">{formatPeriodLabel("90d")}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Operação
                  </label>
                  <Select value={selectedOperationId} onValueChange={setSelectedOperationId}>
                    <SelectTrigger className="h-11 bg-surface border-border text-sm">
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
            </SheetContent>
          </Sheet>

          <Badge
            variant="outline"
            className="hidden h-8 rounded-full border-primary/25 bg-primary/8 px-3 text-[10px] uppercase tracking-[0.18em] text-primary 2xl:inline-flex"
          >
            {session?.name ?? selectedAccessProfile.label}
          </Badge>

          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => {
              void signOut();
            }}
          >
            <LogOut className="h-4 w-4" />
          </Button>

          <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
