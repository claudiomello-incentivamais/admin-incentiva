import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BarChart3,
  ChevronRight,
  Crosshair,
  Database,
  Filter,
  Gauge,
  MessageCircle,
  PhoneCall,
  Radar,
  ServerCog,
  ShieldAlert,
  Target,
  TrendingUp,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import {
  formatPeriodLabel,
  useAdminFilters,
} from "@/components/admin/admin-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildOperationCadenceView,
  buildOperationCockpitFromOperation,
  buildOperationRuntimeView,
  statusMeta,
  type Operation,
  type OperationStatus,
} from "@/lib/admin-data";
import { loadScopedGlobalDashboardServerFn } from "@/lib/admin-global-rpc";
import { applyPeriodToOperation, buildScopedKpis } from "@/lib/admin-period";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/performance")({
  head: () => ({ meta: [{ title: "Performance — Console Incentiva" }] }),
  loader: async () => loadScopedGlobalDashboardServerFn(),
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

function parseFirstNumber(value: string) {
  const normalized = value.replace(/\./g, "");
  const match = normalized.match(/-?\d+(?:,\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : 0;
}

function PerformancePage() {
  const dashboard = Route.useLoaderData();
  const { operations, kpis } = dashboard;
  const { selectedOperationId, selectedOperation, selectedPeriod } = useAdminFilters();
  const scopedOperations = operations.map((operation) =>
    applyPeriodToOperation(operation, selectedPeriod),
  );
  const filteredOperations =
    selectedOperationId === "all"
      ? scopedOperations
      : scopedOperations.filter((operation) => operation.id === selectedOperationId);
  const effectiveKpis = buildScopedKpis(kpis, filteredOperations, scopedOperations, selectedPeriod);
  const isSingleOperationView = selectedOperationId !== "all";

  const avgScore =
    filteredOperations.reduce((sum, operation) => sum + operation.score, 0) /
    Math.max(filteredOperations.length, 1);
  const avgReconciliation =
    filteredOperations.reduce((sum, operation) => sum + operation.dataReconciliation, 0) /
    Math.max(filteredOperations.length, 1);
  const fallbackOperation = filteredOperations[0] ?? scopedOperations[0];
  const bestConversion =
    [...filteredOperations].sort((a, b) => b.monthlyConversion - a.monthlyConversion)[0] ??
    fallbackOperation;
  const lowestCoverage =
    [...filteredOperations].sort((a, b) => a.baseCoverage - b.baseCoverage)[0] ??
    fallbackOperation;
  const topConversions = [...filteredOperations]
    .sort((a, b) => b.monthlyConversion - a.monthlyConversion)
    .slice(0, 4);
  const pressureByCoverage = [...filteredOperations]
    .sort((a, b) => a.baseCoverage - b.baseCoverage)
    .slice(0, 4);
  const reconciliationWatch = [...filteredOperations]
    .sort((a, b) => a.dataReconciliation - b.dataReconciliation)
    .slice(0, 5);
  const operationViews = filteredOperations.map((operation) => {
    const cockpit = buildOperationCockpitFromOperation(operation);
    const cadence = buildOperationCadenceView(operation, cockpit, dashboard.source);
    const runtime = buildOperationRuntimeView(operation, cockpit, dashboard.source);

    return {
      operation,
      cadence,
      runtime,
      runtimeRiskCount: runtime.cards.filter((card) => card.health === "risk" || card.health === "critical").length,
      runtimeMonitorCount: runtime.cards.filter((card) => card.health === "monitor").length,
      n8nCard: runtime.cards.find((card) => card.id === "n8n"),
      evolutionCard: runtime.cards.find((card) => card.id === "evolution"),
      api4ComCard: runtime.cards.find((card) => card.id === "api4com"),
    };
  });
  const cadenceWindowViews = operationViews
    .map((view) => ({
      ...view,
      window30d: view.cadence.windows.find((window) => window.id === "30d"),
      stageTwo: view.cadence.stages[1],
    }))
    .sort(
      (a, b) =>
        parseFirstNumber(b.window30d?.conversionLabel ?? "0") -
        parseFirstNumber(a.window30d?.conversionLabel ?? "0"),
    )
    .slice(0, 4);
  const runtimeWatch = [...operationViews]
    .sort(
      (a, b) =>
        b.runtimeRiskCount - a.runtimeRiskCount ||
        b.runtimeMonitorCount - a.runtimeMonitorCount ||
        a.operation.baseCoverage - b.operation.baseCoverage,
    )
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
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {formatPeriodLabel(selectedPeriod)}
              </Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Performance
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {isSingleOperationView
                ? `Recorte exclusivo de ${selectedOperation?.label ?? "uma operação"} para comparar conversão, cobertura e qualidade sem vazamento das demais contas.`
                : "Esta frente compara resultado, cobertura e eficiência entre as operações para deixar claro onde há tração real, onde há gargalo de base e onde a leitura comercial ainda depende de saneamento."}
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
            <Link to="/operacoes">
              <ArrowRight className="h-3.5 w-3.5" />
              Abrir Operações
            </Link>
          </Button>
        </section>

        <section className="surface-card p-5">
              <div>
                <h2 className="text-sm font-semibold text-display">Como ler esta frente</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
              {isSingleOperationView
                ? "Aqui a leitura deixa de ser benchmark de carteira e vira diagnóstico exclusivo da operação filtrada, já respeitando o período selecionado."
                : "A lógica aqui é comparar eficiência, não só volume. Primeiro a página mostra o nível geral da carteira; depois abre benchmark, pressão de cobertura e qualidade de leitura."}
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
            label={selectedPeriod === "mtd" ? "Conversões do mês" : "Conversões do recorte"}
            value={formatNumber(effectiveKpis.monthlyConversions)}
            detail={
              isSingleOperationView
                ? "Volume estimado do recorte da operação filtrada."
                : "Volume consolidado de conversões no retrato atual."
            }
            icon={TrendingUp}
            tone="success"
          />
          <PerformanceKpi
            label="Conv. média"
            value={`${formatPercent(average(filteredOperations.map((operation) => operation.monthlyConversion)))}%`}
            detail={
              isSingleOperationView
                ? "Taxa média da operação no recorte atual."
                : "Média de conversão mensal entre as operações monitoradas."
            }
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
            label={isSingleOperationView ? "Operação em foco" : "Melhor conversão"}
            value={`${bestConversion.name} · ${formatPercent(bestConversion.monthlyConversion)}%`}
            detail={
              isSingleOperationView
                ? "Resumo direto da operação filtrada no período."
                : "Benchmark operacional da carteira neste snapshot."
            }
            icon={Crosshair}
            tone="success"
          />
          <PerformanceKpi
            label={isSingleOperationView ? "Pressão principal" : "Maior pressão"}
            value={`${lowestCoverage.name} · ${formatPercent(lowestCoverage.baseCoverage)}%`}
            detail={
              isSingleOperationView
                ? "Gargalo de cobertura da operação filtrada."
                : "Operação mais pressionada por falta de cobertura útil."
            }
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
                  {isSingleOperationView
                    ? "Sinal principal de conversão dentro da operação filtrada."
                    : "Operações que hoje puxam o benchmark de resultado na carteira."}
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
                  {isSingleOperationView
                    ? "Onde a própria operação filtrada perde tração por cobertura."
                    : "Operações em que o gargalo de base ameaça distorcer ou travar a performance."}
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

        <section className="surface-card p-5">
          <div className="grid gap-4 xl:grid-cols-[1fr_1fr]">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-display">Cadência por janela</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    O benchmark agora cruza conversão de 30 dias com avanço real da etapa 2, para não confundir resultado isolado com pipeline saudável.
                  </p>
                </div>
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
              </div>

              <div className="space-y-3">
                {cadenceWindowViews.map((view, index) => (
                  <CadenceWindowCard
                    key={view.operation.id}
                    index={index + 1}
                    operation={view.operation}
                    activeLabel={view.window30d?.activeLabel ?? "Sem leitura"}
                    conversionLabel={view.window30d?.conversionLabel ?? "Sem leitura"}
                    stageLabel={view.stageTwo?.conversionLabel ?? "Sem leitura"}
                    velocityLabel={view.window30d?.velocityLabel ?? "Sem leitura"}
                  />
                ))}
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-display">Watchlist multi-fonte</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Esta fila mostra onde performance, runtime técnico e pressão operacional começam a divergir.
                  </p>
                </div>
                <ServerCog className="h-3.5 w-3.5 text-primary" />
              </div>

              <div className="space-y-3">
                {runtimeWatch.map((view) => (
                  <RuntimeWatchCard key={view.operation.id} view={view} />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.02fr_0.98fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Watchlist de reconciliação</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isSingleOperationView
                    ? "Ponto de atenção da camada semântica na operação filtrada."
                    : "Onde a performance ainda precisa ser lida com mais cuidado por conta da qualidade da camada semântica."}
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
                  {isSingleOperationView
                    ? "Resumo da operação filtrada em uma tabela só."
                    : "Score, cobertura, reconciliação e conversão em uma tabela só."}
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] text-mono h-5">
                {filteredOperations.length} operação{filteredOperations.length === 1 ? "" : "ões"}
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
                  {[...filteredOperations]
                    .sort((a, b) => b.monthlyConversion - a.monthlyConversion)
                    .map((operation) => (
                      <PerformanceRow key={operation.id} operation={operation} />
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-display">Matriz de cadência x runtime</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Agora a performance mostra, na mesma linha, ritmo comercial e saúde das camadas n8n, Evolution e API4Com.
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px] text-mono h-5">
              {filteredOperations.length} operação{filteredOperations.length === 1 ? "" : "ões"}
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border bg-muted/20">
                  <th className="text-left font-medium px-4 py-2.5">Operação</th>
                  <th className="text-right font-medium px-3 py-2.5">Ativos 30d</th>
                  <th className="text-right font-medium px-3 py-2.5">Etapa 2</th>
                  <th className="text-left font-medium px-3 py-2.5">n8n VPS</th>
                  <th className="text-left font-medium px-3 py-2.5">Evolution</th>
                  <th className="text-left font-medium px-4 py-2.5">API4Com</th>
                </tr>
              </thead>
              <tbody>
                {operationViews.map((view) => (
                  <CadenceRuntimeRow key={view.operation.id} view={view} />
                ))}
              </tbody>
            </table>
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

function CadenceWindowCard({
  index,
  operation,
  activeLabel,
  conversionLabel,
  stageLabel,
  velocityLabel,
}: {
  index: number;
  operation: Operation;
  activeLabel: string;
  conversionLabel: string;
  stageLabel: string;
  velocityLabel: string;
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

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <MiniPerformanceState label="Ativos 30d" value={activeLabel} />
        <MiniPerformanceState label="Conv. 30d" value={conversionLabel} />
        <MiniPerformanceState label="Etapa 2" value={stageLabel} />
        <MiniPerformanceState label="Velocidade" value={velocityLabel} />
      </div>
    </div>
  );
}

function RuntimeWatchCard({
  view,
}: {
  view: {
    operation: Operation;
    runtime: ReturnType<typeof buildOperationRuntimeView>;
    runtimeRiskCount: number;
    runtimeMonitorCount: number;
  };
}) {
  const mainCard =
    view.runtime.cards.find((card) => card.health === "critical" || card.health === "risk") ??
    view.runtime.cards.find((card) => card.health === "monitor") ??
    view.runtime.cards[0];
  const meta = statusMeta[mainCard.health];
  const Icon = runtimeCardIconMap[mainCard.id];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium">{view.operation.name}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{mainCard.title}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5 text-primary" />
        <span>{mainCard.modeLabel}</span>
        <span>•</span>
        <span>{view.runtimeRiskCount} risco</span>
        <span>•</span>
        <span>{view.runtimeMonitorCount} monitor</span>
      </div>

      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{mainCard.nextStep}</p>
    </div>
  );
}

function MiniPerformanceState({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-card px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[12px] font-medium text-foreground">{value}</div>
    </div>
  );
}

function CadenceRuntimeRow({
  view,
}: {
  view: {
    operation: Operation;
    cadence: ReturnType<typeof buildOperationCadenceView>;
    n8nCard?: ReturnType<typeof buildOperationRuntimeView>["cards"][number];
    evolutionCard?: ReturnType<typeof buildOperationRuntimeView>["cards"][number];
    api4ComCard?: ReturnType<typeof buildOperationRuntimeView>["cards"][number];
  };
}) {
  const active30d = view.cadence.windows.find((window) => window.id === "30d")?.activeLabel ?? "Sem leitura";
  const stageTwo = view.cadence.stages[1]?.conversionLabel ?? "Sem leitura";

  return (
    <tr className="border-b border-border/70 last:border-0">
      <td className="px-4 py-3.5">
        <div className="font-medium">{view.operation.name}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{view.operation.focus}</div>
      </td>
      <td className="px-3 py-3.5 text-right">{active30d}</td>
      <td className="px-3 py-3.5 text-right">{stageTwo}</td>
      <td className="px-3 py-3.5">
        <RuntimeCell card={view.n8nCard} />
      </td>
      <td className="px-3 py-3.5">
        <RuntimeCell card={view.evolutionCard} />
      </td>
      <td className="px-4 py-3.5">
        <RuntimeCell card={view.api4ComCard} />
      </td>
    </tr>
  );
}

function RuntimeCell({
  card,
}: {
  card?: ReturnType<typeof buildOperationRuntimeView>["cards"][number];
}) {
  if (!card) {
    return <span className="text-[11px] text-muted-foreground">Sem leitura</span>;
  }

  const meta = statusMeta[card.health];
  const primaryFact = card.facts[0]?.value ?? card.modeLabel;

  return (
    <div>
      <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
        {meta.label}
      </Badge>
      <div className="mt-1 text-[11px] text-foreground">{primaryFact}</div>
      <div className="text-[10px] text-muted-foreground">{card.modeLabel}</div>
    </div>
  );
}

const toneIconClass: Record<OperationStatus, string> = {
  healthy: "bg-emerald-500/12 text-emerald-700",
  monitor: "bg-blue-500/12 text-blue-700",
  risk: "bg-amber-500/12 text-amber-700",
  critical: "bg-rose-500/12 text-rose-700",
};

const runtimeCardIconMap = {
  supabase: Database,
  notion: Radar,
  n8n: Workflow,
  evolution: MessageCircle,
  api4com: PhoneCall,
} as const;
