import { createFileRoute } from "@tanstack/react-router";
import type { ComponentType } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Calendar,
  ChevronRight,
  Download,
  Filter,
  Info,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import {
  loadGlobalDashboard,
  priorityMeta,
  statusMeta,
  type GlobalDashboardData,
  type OperationStatus,
} from "@/lib/admin-data";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Console Incentiva — Admin Global" },
      {
        name: "description",
        content:
          "Visão consolidada da governança operacional e da performance comercial da Incentiva.",
      },
    ],
  }),
  loader: async () => loadGlobalDashboard(),
  component: AdminGlobal,
});

function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

function AdminGlobal() {
  const dashboard = Route.useLoaderData();
  const { kpis, operations, distribution, insights } = dashboard;

  const totalOps =
    distribution.healthy + distribution.monitor + distribution.risk + distribution.critical;

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Admin Global"]} />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
        {/* Executive header */}
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5 animate-pulse" />
                Cockpit Executivo
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {dashboard.snapshotLabel}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {dashboard.source === "live" ? "Supabase live" : "Snapshot fallback"}
              </Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Visão Consolidada de Operações
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              Governança operacional e performance comercial consolidadas. Drill-down disponível
              por operação.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-xs">Jun 2026 · MTD</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface">
              <Filter className="h-3.5 w-3.5" />
              <span className="text-xs">Todas as operações</span>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <Download className="h-3.5 w-3.5" />
              <span className="text-xs">Exportar</span>
            </Button>
          </div>
        </section>

        {/* KPI cards — 6 */}
        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <ExecKpi
            label="Operações monitoradas"
            value={kpis.monitored.toString()}
            icon={Building2}
            sub="Em gestão ativa"
          />
          <ExecKpi
            label="Em risco"
            value={kpis.atRisk.toString()}
            icon={ShieldAlert}
            delta={kpis.riskDelta}
            tone="warning"
            sub="Status: risk"
          />
          <ExecKpi
            label="Críticas"
            value={kpis.critical.toString()}
            icon={AlertOctagon}
            tone="destructive"
            sub="SLA comprometido"
            pulse
          />
          <ExecKpi
            label="Cobertura de base"
            value={`${kpis.baseCoverage}%`}
            icon={Target}
            delta={kpis.coverageDelta}
            tone="info"
            sub="Média ponderada"
          />
          <ExecKpi
            label="Leads totais"
            value={formatNumber(kpis.totalLeads)}
            icon={Users}
            delta={kpis.leadsDelta}
            sub="Base consolidada"
          />
          <ExecKpi
            label="Conversões do mês"
            value={formatNumber(kpis.monthlyConversions)}
            icon={TrendingUp}
            delta={kpis.conversionDelta}
            tone="success"
            sub="MTD · todas operações"
          />
        </section>

        {/* Ranking + insights */}
        <section className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          {/* Ranking table */}
          <div className="surface-card overflow-hidden xl:col-span-2">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-display">Ranking de Operações</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Ordenado por score crescente · pior performance primeiro
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Ver tudo <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border bg-muted/20">
                    <th className="text-left font-medium px-4 py-2.5">Operação</th>
                    <th className="text-left font-medium px-3 py-2.5">Prio.</th>
                    <th className="text-left font-medium px-3 py-2.5">Foco principal</th>
                    <th className="text-right font-medium px-3 py-2.5">Score</th>
                    <th className="text-left font-medium px-3 py-2.5 w-[110px]">Cobertura</th>
                    <th className="text-left font-medium px-3 py-2.5 w-[110px]">Reconciliação</th>
                    <th className="text-right font-medium px-3 py-2.5">Conv. mensal</th>
                    <th className="text-left font-medium px-4 py-2.5">Saúde</th>
                  </tr>
                </thead>
                <tbody>
                  {operations.map((op) => {
                    const meta = statusMeta[op.health];
                    return (
                      <tr
                        key={op.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group"
                      >
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={cn(
                                "h-7 w-7 rounded-md flex items-center justify-center text-[10px] font-semibold text-mono",
                                "bg-muted text-muted-foreground group-hover:bg-surface-elevated",
                              )}
                            >
                              {op.name
                                .split(" ")
                                .map((p) => p[0])
                                .slice(0, 2)
                                .join("")}
                            </span>
                            <div className="flex flex-col leading-tight">
                              <span className="font-medium text-[13px]">{op.name}</span>
                              <span className="text-[10px] text-muted-foreground">
                                {op.client} · {op.owner}
                              </span>
                            </div>
                          </div>
                        </td>
                        <td className="px-3 py-3">
                          <Badge
                            variant="outline"
                            className={cn(
                              "text-[10px] font-semibold text-mono tracking-wider h-5 px-1.5",
                              priorityMeta[op.priority],
                            )}
                          >
                            {op.priority}
                          </Badge>
                        </td>
                        <td className="px-3 py-3 text-[12px] text-muted-foreground">
                          {op.focus}
                        </td>
                        <td className="px-3 py-3 text-right">
                          <ScoreBadge score={op.score} />
                        </td>
                        <td className="px-3 py-3">
                          <MetricBar value={op.baseCoverage} />
                        </td>
                        <td className="px-3 py-3">
                          <MetricBar value={op.dataReconciliation} />
                        </td>
                        <td className="px-3 py-3 text-right text-mono text-[12px] font-medium">
                          {op.monthlyConversion.toFixed(1)}%
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            <span
                              className={cn(
                                "h-1.5 w-1.5 rounded-full ring-2",
                                meta.bg,
                                meta.ring,
                              )}
                            />
                            <span
                              className={cn(
                                "text-[10px] uppercase tracking-[0.14em] font-medium",
                                meta.color,
                              )}
                            >
                              {meta.label}
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Status distribution + insights stacked */}
          <div className="space-y-4">
            <StatusDistribution distribution={distribution} total={totalOps} />
            <ExecutiveInsights insights={insights} />
          </div>
        </section>
      </main>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/* Subcomponents                                                              */
/* -------------------------------------------------------------------------- */

function ExecKpi({
  label,
  value,
  sub,
  icon: Icon,
  delta,
  tone = "default",
  pulse = false,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
  delta?: number;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
  pulse?: boolean;
}) {
  const toneMap = {
    default: "text-foreground",
    success: "text-[color:var(--color-success)]",
    warning: "text-[color:var(--color-warning)]",
    destructive: "text-destructive",
    info: "text-[color:var(--color-info)]",
  };

  return (
    <div className="surface-card p-4 flex flex-col gap-3 relative">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
          {label}
        </span>
        <div
          className={cn(
            "h-6 w-6 rounded-md bg-muted flex items-center justify-center",
            toneMap[tone],
          )}
        >
          <Icon className="h-3 w-3" />
          {pulse && (
            <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-destructive animate-ping opacity-75" />
          )}
        </div>
      </div>
      <div className="flex items-end justify-between gap-2">
        <div
          className={cn(
            "text-[26px] leading-none font-semibold text-display tracking-tight tabular-nums",
            toneMap[tone],
          )}
        >
          {value}
        </div>
        {typeof delta === "number" && (
          <div
            className={cn(
              "flex items-center gap-0.5 text-[10px] font-semibold text-mono px-1 py-0.5 rounded",
              delta >= 0
                ? "text-[color:var(--color-success)] bg-[color:var(--color-success)]/10"
                : "text-destructive bg-destructive/10",
            )}
          >
            <ArrowUpRight className={cn("h-2.5 w-2.5", delta < 0 && "rotate-90")} />
            {Math.abs(delta).toFixed(1)}%
          </div>
        )}
      </div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function ScoreBadge({ score }: { score: number }) {
  const tone =
    score >= 80
      ? "text-[color:var(--color-success)]"
      : score >= 65
        ? "text-[color:var(--color-info)]"
        : score >= 50
          ? "text-[color:var(--color-warning)]"
          : "text-destructive";
  return (
    <span className={cn("text-mono text-[13px] font-semibold tabular-nums", tone)}>
      {score}
    </span>
  );
}

function MetricBar({ value }: { value: number }) {
  const tone =
    value >= 85
      ? "bg-[color:var(--color-success)]"
      : value >= 70
        ? "bg-[color:var(--color-info)]"
        : value >= 60
          ? "bg-[color:var(--color-warning)]"
          : "bg-destructive";
  return (
    <div className="flex items-center gap-2">
      <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", tone)}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className="text-[10px] text-mono text-muted-foreground tabular-nums w-7 text-right">
        {Math.round(value)}%
      </span>
    </div>
  );
}

function StatusDistribution({
  distribution,
  total,
}: {
  distribution: Record<OperationStatus, number>;
  total: number;
}) {
  const order: OperationStatus[] = ["healthy", "monitor", "risk", "critical"];

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-display">Distribuição por Status</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            {total} operações sob gestão
          </p>
        </div>
        <Zap className="h-3.5 w-3.5 text-primary" />
      </div>

      {/* Stacked bar */}
      <div className="flex h-2 w-full rounded-full overflow-hidden bg-muted mb-4">
        {order.map((s) => {
          const pct = (distribution[s] / total) * 100;
          if (pct === 0) return null;
          return (
            <div
              key={s}
              className={cn("h-full transition-all", statusMeta[s].bg)}
              style={{ width: `${pct}%` }}
              title={`${statusMeta[s].label}: ${distribution[s]}`}
            />
          );
        })}
      </div>

      <div className="grid grid-cols-2 gap-2.5">
        {order.map((s) => {
          const meta = statusMeta[s];
          const count = distribution[s];
          const pct = ((count / total) * 100).toFixed(0);
          return (
            <div
              key={s}
              className="flex items-center justify-between rounded-md border border-border bg-surface px-3 py-2.5"
            >
              <div className="flex items-center gap-2">
                <span className={cn("h-2 w-2 rounded-full ring-2", meta.bg, meta.ring)} />
                <span className="text-[11px] uppercase tracking-[0.14em] font-medium text-muted-foreground">
                  {meta.label}
                </span>
              </div>
              <div className="flex items-baseline gap-1">
                <span className={cn("text-display text-base font-semibold tabular-nums", meta.color)}>
                  {count}
                </span>
                <span className="text-[10px] text-muted-foreground text-mono">{pct}%</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function ExecutiveInsights({
  insights,
}: {
  insights: GlobalDashboardData["insights"];
}) {
  const sevMeta = {
    critical: { Icon: AlertOctagon, color: "text-destructive", bg: "bg-destructive/10" },
    risk: {
      Icon: AlertTriangle,
      color: "text-[color:var(--color-warning)]",
      bg: "bg-[color:var(--color-warning)]/10",
    },
    monitor: {
      Icon: TrendingUp,
      color: "text-[color:var(--color-info)]",
      bg: "bg-[color:var(--color-info)]/10",
    },
    info: { Icon: Info, color: "text-muted-foreground", bg: "bg-muted" },
  } as const;

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-display">Resumo Executivo</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Alertas e tendências priorizadas
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] text-mono h-5">
          {insights.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {insights.map((ins) => {
          const meta = sevMeta[ins.severity];
          return (
            <div
              key={ins.id}
              className="flex gap-3 pb-3 border-b border-border last:border-0 last:pb-0 group cursor-pointer"
            >
              <div
                className={cn(
                  "h-7 w-7 rounded-md flex items-center justify-center shrink-0",
                  meta.bg,
                  meta.color,
                )}
              >
                <meta.Icon className="h-3.5 w-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[12.5px] font-medium leading-snug group-hover:text-primary transition-colors">
                  {ins.title}
                </p>
                <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {ins.detail}
                </p>
                <p className="text-[10px] text-muted-foreground/70 mt-1.5 text-mono uppercase tracking-wider">
                  {ins.timestamp}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
