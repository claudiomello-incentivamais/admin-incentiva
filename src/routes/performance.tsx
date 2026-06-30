import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Crosshair,
  Filter,
  Gauge,
  Radar,
  ShieldAlert,
  Target,
  TrendingUp,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadGlobalDashboard, statusMeta, type Operation, type OperationStatus } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "Performance — Console Incentiva" }] }),
  loader: async () => loadGlobalDashboard(),
  component: PerformancePage,
});

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function PerformancePage() {
  const dashboard = Route.useLoaderData();
  const { operations, kpis } = dashboard;

  const avgScore = operations.reduce((sum, operation) => sum + operation.score, 0) / Math.max(operations.length, 1);
  const avgReconciliation =
    operations.reduce((sum, operation) => sum + operation.dataReconciliation, 0) /
    Math.max(operations.length, 1);
  const bestConversion = [...operations].sort((a, b) => b.monthlyConversion - a.monthlyConversion)[0];
  const lowestCoverage = [...operations].sort((a, b) => a.baseCoverage - b.baseCoverage)[0];
  const topConversions = [...operations].sort((a, b) => b.monthlyConversion - a.monthlyConversion).slice(0, 4);
  const pressureByCoverage = [...operations].sort((a, b) => a.baseCoverage - b.baseCoverage).slice(0, 4);
  const reconciliationWatch = [...operations]
    .sort((a, b) => a.dataReconciliation - b.dataReconciliation)
    .slice(0, 5);

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Performance"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Eficiência comercial
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {dashboard.snapshotLabel}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {dashboard.source === "live" ? "Supabase live" : "Snapshot fallback"}
              </Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Performance
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Esta frente compara resultado, cobertura e eficiência entre as operações para deixar
              claro onde há tração real, onde há gargalo de base e onde a leitura comercial ainda
              depende de saneamento.
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface">
            <ArrowRight className="h-3.5 w-3.5" />
            Próximo passo: Configurações
          </Button>
        </section>

        <section className="surface-card p-5">
          <div>
            <h2 className="text-sm font-semibold text-display">Como ler esta frente</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              A lógica aqui é comparar eficiência, não só volume. Primeiro a página mostra o nível
              geral da carteira; depois abre benchmark, pressão de cobertura e qualidade de leitura.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <GuideCard
              title="1. Conversão"
              detail="Mostra quem está virando mais resultado agora, independentemente do tamanho absoluto da base."
            />
            <GuideCard
              title="2. Cobertura"
              detail="Se a cobertura está curta, a performance comercial tende a virar leitura enganosa ou insustentável."
            />
            <GuideCard
              title="3. Qualidade"
              detail="Reconciliação de dados e score operacional servem para separar resultado sólido de resultado frágil."
            />
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <PerformanceKpi
            label="Conversões mensais"
            value={formatNumber(kpis.monthlyConversions)}
            detail="Volume consolidado de conversões no retrato atual."
            icon={TrendingUp}
            tone="success"
          />
          <PerformanceKpi
            label="Conv. média"
            value={`${formatPercent(average(operations.map((operation) => operation.monthlyConversion)))}%`}
            detail="Média de conversão mensal entre as operações monitoradas."
            icon={Target}
            tone="monitor"
          />
          <PerformanceKpi
            label="Score médio"
            value={formatPercent(avgScore)}
            detail="Leitura composta da carteira entre foco, cobertura e integridade."
            icon={Gauge}
            tone="info"
          />
          <PerformanceKpi
            label="Reconciliação média"
            value={`${formatPercent(avgReconciliation)}%`}
            detail="Quanto a leitura entre camadas está coerente hoje."
            icon={Radar}
            tone="monitor"
          />
          <PerformanceKpi
            label="Melhor conversão"
            value={`${bestConversion.name} · ${formatPercent(bestConversion.monthlyConversion)}%`}
            detail="Benchmark operacional da carteira neste snapshot."
            icon={Crosshair}
            tone="success"
          />
          <PerformanceKpi
            label="Maior pressão"
            value={`${lowestCoverage.name} · ${formatPercent(lowestCoverage.baseCoverage)}%`}
            detail="Operação mais pressionada por falta de cobertura útil."
            icon={ShieldAlert}
            tone="risk"
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Benchmark de conversão</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Operações que hoje puxam o benchmark de resultado na carteira.
                </p>
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {topConversions.map((operation, index) => (
                <RankCard
                  key={operation.id}
                  index={index + 1}
                  operation={operation}
                  primary={`${formatPercent(operation.monthlyConversion)}% conv. mensal`}
                  secondary={`${formatPercent(operation.baseCoverage)}% cobertura`}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Pressão por cobertura</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Operações em que o gargalo de base ameaça distorcer ou travar a performance.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Ver Operações <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {pressureByCoverage.map((operation) => (
                <CoveragePressureCard key={operation.id} operation={operation} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.02fr_0.98fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Watchlist de reconciliação</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde a performance ainda precisa ser lida com mais cuidado por conta da qualidade da camada semântica.
                </p>
              </div>
              <Filter className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {reconciliationWatch.map((operation) => (
                <ReconciliationCard key={operation.id} operation={operation} />
              ))}
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-display">Comparativo por operação</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Score, cobertura, reconciliação e conversão em uma tabela só.
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] text-mono h-5">
                {operations.length} operações
              </Badge>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border bg-muted/20">
                    <th className="text-left font-medium px-4 py-2.5">Operação</th>
                    <th className="text-right font-medium px-3 py-2.5">Score</th>
                    <th className="text-right font-medium px-3 py-2.5">Cobertura</th>
                    <th className="text-right font-medium px-3 py-2.5">Reconciliação</th>
                    <th className="text-right font-medium px-3 py-2.5">Conv. mensal</th>
                    <th className="text-left font-medium px-4 py-2.5">Saúde</th>
                  </tr>
                </thead>
                <tbody>
                  {[...operations]
                    .sort((a, b) => b.monthlyConversion - a.monthlyConversion)
                    .map((operation) => (
                      <PerformanceRow key={operation.id} operation={operation} />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function average(values: number[]) {
  return values.reduce((sum, value) => sum + value, 0) / Math.max(values.length, 1);
}

function GuideCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-sm font-medium">{title}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function PerformanceKpi({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: OperationStatus;
}) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <div className={cn("rounded-lg p-2", toneIconClass[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-4 text-[24px] leading-none font-semibold tracking-tight text-display">{value}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function RankCard({
  index,
  operation,
  primary,
  secondary,
}: {
  index: number;
  operation: Operation;
  primary: string;
  secondary: string;
}) {
  const meta = statusMeta[operation.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full border border-border bg-muted/40 text-xs font-semibold flex items-center justify-center">
            {index}
          </div>
          <div>
            <div className="text-sm font-medium">{operation.name}</div>
            <div className="text-[11px] text-muted-foreground mt-0.5">{operation.focus}</div>
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <div className="mt-3 flex items-center gap-3 text-[12px]">
        <span className="font-medium text-display">{primary}</span>
        <span className="text-muted-foreground">{secondary}</span>
      </div>
    </div>
  );
}

function CoveragePressureCard({ operation }: { operation: Operation }) {
  const meta = statusMeta[operation.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{operation.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{operation.focus}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {formatPercent(operation.baseCoverage)}%
        </Badge>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
        {operation.name} está na faixa mais pressionada de cobertura. A performance dela precisa
        ser lida junto com reposição de base, não só com volume de conversão.
      </p>
    </div>
  );
}

function ReconciliationCard({ operation }: { operation: Operation }) {
  const meta = statusMeta[operation.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{operation.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {formatPercent(operation.dataReconciliation)}% de reconciliação
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <div className="mt-3 flex items-center gap-4 text-[12px] text-muted-foreground">
        <span>{formatPercent(operation.monthlyConversion)}% conv.</span>
        <span>{formatPercent(operation.baseCoverage)}% cobertura</span>
        <span>score {formatPercent(operation.score)}</span>
      </div>
    </div>
  );
}

function PerformanceRow({ operation }: { operation: Operation }) {
  const meta = statusMeta[operation.health];

  return (
    <tr className="border-b border-border/70 last:border-0">
      <td className="px-4 py-3.5">
        <div className="font-medium">{operation.name}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{operation.focus}</div>
      </td>
      <td className="px-3 py-3.5 text-right">{formatPercent(operation.score)}</td>
      <td className="px-3 py-3.5 text-right">{formatPercent(operation.baseCoverage)}%</td>
      <td className="px-3 py-3.5 text-right">{formatPercent(operation.dataReconciliation)}%</td>
      <td className="px-3 py-3.5 text-right font-medium text-display">
        {formatPercent(operation.monthlyConversion)}%
      </td>
      <td className="px-4 py-3.5">
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </td>
    </tr>
  );
}

const toneIconClass: Record<OperationStatus, string> = {
  healthy: "bg-emerald-500/12 text-emerald-700",
  monitor: "bg-blue-500/12 text-blue-700",
  risk: "bg-amber-500/12 text-amber-700",
  critical: "bg-rose-500/12 text-rose-700",
};
