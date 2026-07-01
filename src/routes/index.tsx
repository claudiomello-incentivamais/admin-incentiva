import { Link, createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, type ComponentType } from "react";
import {
  AlertOctagon,
  AlertTriangle,
  ArrowUpRight,
  Building2,
  Info,
  MessageSquareShare,
  SquareKanban,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
  Zap,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { ActionPacketCard } from "@/components/admin/action-packet-card";
import { Badge } from "@/components/ui/badge";
import {
  useAdminFilters,
  formatPeriodLabel,
  formatVisibilityModeLabel,
} from "@/components/admin/admin-filters";
import { useAdminAuth } from "@/components/admin/auth-context";
import { cn } from "@/lib/utils";

import {
  buildExecutiveCommandQueue,
  buildExecutiveFocusAreas,
  buildOperationActionPlan,
  buildOperationActionPackets,
  getScoreDrivers,
  priorityMeta,
  statusMeta,
  type ExecutiveCommandItem,
  type ExecutiveFocusArea,
  type GlobalDashboardData,
  type Operation,
  type OperationStatus,
} from "@/lib/admin-data";
import { loadScopedGlobalDashboardServerFn } from "@/lib/admin-global-rpc";
import { applyPeriodToOperation, buildScopedKpis } from "@/lib/admin-period";

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
  loader: async () => loadScopedGlobalDashboardServerFn(),
  component: AdminGlobal,
});

function formatNumber(n: number) {
  return new Intl.NumberFormat("pt-BR").format(n);
}

function AdminGlobal() {
  const dashboard = Route.useLoaderData();
  const { kpis, operations, insights } = dashboard;
  const { session } = useAdminAuth();
  const { selectedOperationId, selectedOperation, selectedPeriod, selectedVisibilityMode } =
    useAdminFilters();
  const scopedOperations = useMemo(
    () => operations.map((operation) => applyPeriodToOperation(operation, selectedPeriod)),
    [operations, selectedPeriod],
  );
  const isSingleOperationView = selectedOperationId !== "all";
  const filteredOperations = useMemo(
    () =>
      selectedOperationId === "all"
        ? scopedOperations
        : scopedOperations.filter((operation) => operation.id === selectedOperationId),
    [scopedOperations, selectedOperationId],
  );
  const filteredDistribution = useMemo(
    () =>
      filteredOperations.reduce(
        (acc, operation) => {
          acc[operation.health] += 1;
          return acc;
        },
        { healthy: 0, monitor: 0, risk: 0, critical: 0 } as Record<OperationStatus, number>,
      ),
    [filteredOperations],
  );
  const filteredInsights = useMemo(
    () =>
      selectedOperationId === "all"
        ? insights
        : insights.filter((insight) => insight.operationId === selectedOperationId),
    [insights, selectedOperationId],
  );
  const executiveQueue = useMemo(
    () => buildExecutiveCommandQueue(filteredOperations),
    [filteredOperations],
  );
  const executiveFocusAreas = useMemo(
    () => buildExecutiveFocusAreas(filteredOperations),
    [filteredOperations],
  );
  const [activeOperationId, setActiveOperationId] = useState(
    selectedOperationId === "all" ? filteredOperations[0]?.id ?? "" : selectedOperationId,
  );

  useEffect(() => {
    if (selectedOperationId !== "all") {
      setActiveOperationId(selectedOperationId);
      return;
    }

    if (!filteredOperations.some((operation) => operation.id === activeOperationId)) {
      setActiveOperationId(filteredOperations[0]?.id ?? "");
    }
  }, [activeOperationId, filteredOperations, selectedOperationId]);

  const activeOperation =
    filteredOperations.find((operation) => operation.id === activeOperationId) ?? filteredOperations[0] ?? null;
  const activeDrivers = activeOperation ? getScoreDrivers(activeOperation) : [];
  const activeActionPlan = activeOperation ? buildOperationActionPlan(activeOperation) : null;
  const effectiveKpis = useMemo(() => {
    return buildScopedKpis(kpis, filteredOperations, scopedOperations, selectedPeriod);
  }, [filteredOperations, kpis, scopedOperations, selectedPeriod]);
  const blendedConversionRate =
    effectiveKpis.totalLeads > 0
      ? (effectiveKpis.monthlyConversions / effectiveKpis.totalLeads) * 100
      : 0;

  const totalOps =
    filteredDistribution.healthy +
    filteredDistribution.monitor +
    filteredDistribution.risk +
    filteredDistribution.critical;
  const topPriority = executiveQueue[0] ?? null;
  const topFocusArea = executiveFocusAreas[0] ?? null;
  const actionPackets = activeOperation ? buildOperationActionPackets(activeOperation) : [];
  const adminDrilldowns = useMemo(() => {
    const allowedRoutes = new Set(session?.allowedRoutes ?? []);
    return [
      {
        title: "Operações internas",
        href: "/operacoes",
        detail: "Leitura tática mais aberta da conta quando precisar sair do cockpit.",
      },
      {
        title: "Performance interna",
        href: "/performance",
        detail: "Painel legado para comparação de conversão, cadência e eficiência comercial.",
      },
      {
        title: "Carteira",
        href: "/clientes",
        detail: "Visão administrativa de clientes e escopo de acesso por operação.",
      },
      {
        title: "Governança técnica",
        href: "/governanca",
        detail: "Camada interna para reconciliação, trilha técnica e leitura de backend.",
      },
    ].filter((item) => allowedRoutes.has(item.href));
  }, [session]);

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Admin Global"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
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
              {isSingleOperationView ? "Painel Administrativo da Operação" : "Visão Consolidada de Operações"}
            </h1>
            <p className="text-sm text-muted-foreground max-w-xl">
              {isSingleOperationView
                ? "Leitura administrativa focada na operação filtrada, sem forçar comparativos que só fazem sentido em multioperação."
                : "Painel executivo para identificar onde a carteira está travando e qual ação deve abrir primeiro."}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-6">
              {formatPeriodLabel(selectedPeriod)}
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-6">
              {selectedOperation?.label ?? "Todas as operações"}
            </Badge>
            <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-6">
              {selectedOperationId === "all"
                ? "Painel consolidado"
                : "Painel filtrado por operação"}
            </Badge>
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
          <ExecutiveInsights insights={filteredInsights} />

          <div className="surface-card p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">
                  {isSingleOperationView ? "Radar rápido da operação" : "Radar rápido da carteira"}
                </h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isSingleOperationView
                    ? "Leitura curta para bater o olho nos sinais centrais desta conta."
                    : "Leitura curta para bater o olho em pressão, cobertura e conversão."}
                </p>
              </div>
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {isSingleOperationView && activeOperation ? (
                <>
                  <CompactMetric
                    label="Score operacional"
                    value={String(activeOperation.score)}
                    detail={activeOperation.focus}
                    tone="warning"
                  />
                  <CompactMetric
                    label="Conversão mensal"
                    value={`${activeOperation.monthlyConversion.toFixed(1)}%`}
                    detail="leitura da operação"
                    tone="success"
                  />
                  <CompactMetric
                    label="Cobertura"
                    value={`${activeOperation.baseCoverage.toFixed(1)}%`}
                    detail="base ativa"
                    tone="info"
                  />
                  <CompactMetric
                    label="Reconciliação"
                    value={`${activeOperation.dataReconciliation.toFixed(1)}%`}
                    detail="consistência operacional"
                    tone="default"
                  />
                </>
              ) : (
                <>
                  <CompactMetric
                    label="Operações sob pressão"
                    value={`${filteredDistribution.risk + filteredDistribution.critical}`}
                    detail="risk + critical"
                    tone="warning"
                  />
                  <CompactMetric
                    label="Conversão média"
                    value={`${blendedConversionRate.toFixed(1)}%`}
                    detail="recorte atual"
                    tone="success"
                  />
                  <CompactMetric
                    label="Cobertura média"
                    value={`${effectiveKpis.baseCoverage}%`}
                    detail="base ativa"
                    tone="info"
                  />
                  <CompactMetric
                    label="Tema cruzado"
                    value={topFocusArea ? topFocusArea.count.toString() : "0"}
                    detail={topFocusArea?.label ?? "sem frente dominante"}
                    tone="default"
                  />
                </>
              )}
            </div>

            {!isSingleOperationView && topFocusArea ? (
              <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Tema transversal em observação
                </div>
                <p className="mt-1 text-[12px] leading-relaxed text-foreground">
                  {topFocusArea.headline}
                </p>
              </div>
            ) : null}
          </div>
        </section>

        {adminDrilldowns.length > 0 ? (
          <section className="surface-card p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Drilldowns internos em transição
                </div>
                <h2 className="mt-1 text-sm font-semibold text-display">
                  Acessos administrativos que deixaram de poluir a navegação principal
                </h2>
                <p className="mt-1 max-w-2xl text-[12px] leading-relaxed text-muted-foreground">
                  Esses acessos continuam disponíveis para leitura interna, mas ficam rebaixados aqui
                  dentro do Admin Global enquanto a consolidação final de conteúdo não termina.
                </p>
              </div>
              <Badge variant="outline" className="h-5 text-[10px] uppercase tracking-[0.16em]">
                Admin only
              </Badge>
            </div>

            <div className="mt-4 grid gap-3 lg:grid-cols-2">
              {adminDrilldowns.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className="group rounded-2xl border border-border bg-surface px-4 py-4 transition-colors hover:border-primary/50 hover:bg-primary/[0.04]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-sm font-medium text-foreground">{item.title}</div>
                      <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                        {item.detail}
                      </p>
                    </div>
                    <ArrowUpRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-primary" />
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className="h-5 text-[10px] uppercase tracking-[0.16em]">
                {formatVisibilityModeLabel(selectedVisibilityMode)}
              </Badge>
              <Badge variant="outline" className="h-5 text-[10px] uppercase tracking-[0.16em]">
                {dashboard.source === "live" ? "Live" : "Snapshot"}
              </Badge>
            </div>
            <div className="mt-3 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Prioridade dominante
            </div>
            <h2 className="mt-1 text-sm font-semibold text-display">
              {topPriority?.title ?? "Sem prioridade crítica aberta neste recorte"}
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              {topPriority?.detail ??
                "O recorte atual não publicou um bloqueio dominante novo. Use a fila abaixo para aprofundar."}
            </p>
            {topPriority ? (
              <div className="mt-3 rounded-xl border border-border bg-surface px-3 py-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Próximo passo
                </div>
              <div className="mt-1 text-[12px] leading-relaxed text-foreground">
                  {topPriority.nextStep}
              </div>
            </div>
            ) : null}
          </div>

          <div className="surface-card p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Leitura executiva
                </div>
                <h2 className="mt-2 text-sm font-semibold text-display">
                  Mais indicador, menos texto.
                </h2>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  O objetivo aqui é mostrar primeiro pressão, cobertura, conversão e fila aberta. Explicação longa só entra se ajudar a decidir.
                </p>
              </div>
              <TrendingUp className="h-4 w-4 text-primary" />
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-3">
              <MiniStatusPill label="healthy" value={filteredDistribution.healthy} tone="healthy" />
              <MiniStatusPill label="monitor" value={filteredDistribution.monitor} tone="monitor" />
              <MiniStatusPill label="risk+critical" value={filteredDistribution.risk + filteredDistribution.critical} tone="risk" />
            </div>
          </div>
        </section>

        {/* KPI cards — 6 */}
        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <ExecKpi
            label="Operações monitoradas"
            value={effectiveKpis.monitored.toString()}
            icon={Building2}
            sub={selectedOperationId === "all" ? "Em gestão ativa" : "Recorte atual"}
          />
          <ExecKpi
            label="Em risco"
            value={effectiveKpis.atRisk.toString()}
            icon={ShieldAlert}
            delta={selectedOperationId === "all" ? effectiveKpis.riskDelta : undefined}
            tone="warning"
            sub="Status: risk"
          />
          <ExecKpi
            label="Críticas"
            value={effectiveKpis.critical.toString()}
            icon={AlertOctagon}
            tone="destructive"
            sub="SLA comprometido"
            pulse
          />
          <ExecKpi
            label="Cobertura de base"
            value={`${effectiveKpis.baseCoverage}%`}
            icon={Target}
            delta={selectedOperationId === "all" ? effectiveKpis.coverageDelta : undefined}
            tone="info"
            sub="Média ponderada"
          />
          <ExecKpi
            label={selectedPeriod === "mtd" ? "Leads no recorte" : "Leads tocados no recorte"}
            value={formatNumber(effectiveKpis.totalLeads)}
            icon={Users}
            delta={isSingleOperationView ? undefined : effectiveKpis.leadsDelta}
            sub={isSingleOperationView ? "Leitura da operação filtrada" : "Carteira no período"}
          />
          <ExecKpi
            label={selectedPeriod === "mtd" ? "Conversões do mês" : "Conversões do recorte"}
            value={formatNumber(effectiveKpis.monthlyConversions)}
            icon={TrendingUp}
            delta={isSingleOperationView ? undefined : effectiveKpis.conversionDelta}
            tone="success"
            sub={isSingleOperationView ? "Operação selecionada" : "Carteira consolidada"}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.4fr_1fr] gap-4">
          <ExecutiveCommandCenter queue={executiveQueue} />
          <ExecutiveFocusBoard areas={executiveFocusAreas} />
        </section>

        <section className="grid gap-4 xl:grid-cols-3">
          <OperationalCadenceCard
            title="Leitura técnica"
            value="Até 5 min"
            detail="n8n VPS e Evolution sincronizam a telemetria operacional para o Supabase em janelas de até 5 minutos."
          />
          <OperationalCadenceCard
            title="Leitura comercial"
            value="Na carga do admin"
            detail="Base, prioridade, cobertura e conversão são recalculadas quando o Admin Global carrega, usando o estado atual disponível."
          />
          <OperationalCadenceCard
            title="Modo de execução"
            value="Assistido"
            detail="O admin já entrega o pacote pronto para Discord, Trello e registro executivo, mas não dispara essas ações sozinho."
          />
        </section>

        {actionPackets.length > 0 ? (
          <section className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Ações prontas</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Pacotes copiáveis para transformar prioridade em execução real sem reescrever o raciocínio.
                </p>
              </div>
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 xl:grid-cols-3">
              {actionPackets.map((packet) => (
                <ActionPacketCard key={packet.channel} {...packet} />
              ))}
            </div>
          </section>
        ) : null}

        {/* Ranking + insights */}
        <section className={cn("grid grid-cols-1 gap-4", isSingleOperationView ? "xl:grid-cols-1" : "xl:grid-cols-3")}>
          {!isSingleOperationView ? (
          <div className="surface-card overflow-hidden xl:col-span-2">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-display">Ranking de Operações</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isSingleOperationView
                    ? "Recorte exclusivo da operação filtrada"
                    : "Ordenado por score crescente para mostrar primeiro onde a carteira mais exige intervenção"}
                </p>
              </div>
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
                  {filteredOperations.map((op) => {
                    const meta = statusMeta[op.health];
                    return (
                      <tr
                        key={op.id}
                        onClick={() => setActiveOperationId(op.id)}
                        className={cn(
                          "border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer group",
                          activeOperationId === op.id && "bg-primary/5",
                        )}
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
          ) : null}

          <div className="space-y-4">
            {activeOperation && activeActionPlan ? (
              <OperationDiagnosticCard
                operation={activeOperation}
                drivers={activeDrivers}
                actionPlan={activeActionPlan}
              />
            ) : null}
            {!isSingleOperationView ? (
              <StatusDistribution distribution={filteredDistribution} total={totalOps} />
            ) : null}
          </div>
        </section>
      </main>
    </>
  );
}

function ExecutiveCommandCenter({
  queue,
}: {
  queue: ExecutiveCommandItem[];
}) {
  return (
          <div className="surface-card p-5">
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
          <h2 className="text-sm font-semibold text-display">Fila prioritária</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            O que já deveria estar aberto agora na operação ou no Trello.
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] text-mono h-5">
          {queue.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {queue.map((item) => (
          <div key={item.id} className="rounded-xl border border-border bg-surface px-4 py-3">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn(
                      "text-[10px] font-semibold text-mono tracking-wider h-5 px-1.5",
                      priorityMeta[item.priority],
                    )}
                  >
                    {item.priority}
                  </Badge>
                  <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-5">
                    {item.operationName}
                  </Badge>
                  <Badge
                    variant="outline"
                    className={cn("text-[10px] uppercase tracking-[0.16em] h-5", statusMeta[item.health].color)}
                  >
                    {statusMeta[item.health].label}
                  </Badge>
                </div>
                <div>
                  <p className="text-[13px] font-medium leading-snug">{item.title}</p>
                  <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              </div>

              <div className="min-w-[120px] text-right space-y-1">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Saída principal
                </div>
                <div className="text-[12px] font-semibold text-display">{item.channel}</div>
                <div className="text-[10px] text-muted-foreground">{item.owner}</div>
              </div>
            </div>

            <div className="mt-3 rounded-lg border border-border/70 bg-background/60 px-3 py-2.5">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Próximo passo sugerido
              </div>
              <p className="mt-1 text-[11px] leading-relaxed text-foreground">{item.nextStep}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OperationalCadenceCard({
  title,
  value,
  detail,
}: {
  title: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="surface-card p-5">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{title}</div>
      <div className="mt-1 text-lg font-semibold text-display">{value}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function ExecutiveFocusBoard({
  areas,
}: {
  areas: ExecutiveFocusArea[];
}) {
  return (
    <div className="surface-card p-5">
        <div className="flex items-start justify-between gap-3 mb-4">
          <div>
          <h2 className="text-sm font-semibold text-display">Frentes secundárias</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Temas úteis para ganho cruzado, mas abaixo da fila prioritária do dia.
          </p>
        </div>
        <Target className="h-3.5 w-3.5 text-primary" />
      </div>

      <div className="space-y-3">
        {areas.map((area) => (
          <div key={area.id} className="rounded-xl border border-border bg-surface px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {area.label}
                </div>
                <p className="mt-1 text-[12px] font-medium leading-snug">{area.headline}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-display">{area.count}</div>
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  frentes
                </div>
              </div>
            </div>

            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {area.detail}
            </p>

            <div className="mt-3 flex items-center justify-between gap-3 text-[10px] text-muted-foreground">
              <span>{area.owner}</span>
              <span className="uppercase tracking-[0.16em]">{area.channel}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function OperationDiagnosticCard({
  operation,
  drivers,
  actionPlan,
}: {
  operation: Operation;
  drivers: ReturnType<typeof getScoreDrivers>;
  actionPlan: ReturnType<typeof buildOperationActionPlan>;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3 mb-4">
        <div>
          <h2 className="text-sm font-semibold text-display">Diagnóstico acionável</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Clique na operação no ranking para ver o que está puxando o score e qual ação abrir.
          </p>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-5">
          {operation.name}
        </Badge>
      </div>

      <div className="rounded-xl border border-border bg-surface px-4 py-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Score atual
            </div>
            <div className="mt-1 text-xl font-semibold text-display">{operation.score}</div>
          </div>
          <Badge
            variant="outline"
            className={cn("text-[10px] uppercase tracking-[0.16em] h-5", statusMeta[operation.health].color)}
          >
            {statusMeta[operation.health].label}
          </Badge>
        </div>
        <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
          {actionPlan.headline}
        </p>
      </div>

      <div className="mt-4 space-y-3">
        {drivers.map((driver) => (
          <div key={driver.id} className="rounded-xl border border-border bg-surface px-4 py-3">
            <div className="flex items-center justify-between gap-3">
              <div className="text-[12px] font-medium">{driver.label}</div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                  peso {(driver.weight * 100).toFixed(0)}%
                </span>
                <span
                  className={cn(
                    "text-[12px] font-semibold text-mono",
                    statusMeta[driver.health].color,
                  )}
                >
                  {driver.value.toFixed(1)}
                </span>
              </div>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{driver.detail}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          O que está puxando para baixo
        </div>
        <div className="mt-2 space-y-2">
          {actionPlan.causes.map((cause) => (
            <div key={cause} className="flex gap-2 text-[12px] text-muted-foreground leading-relaxed">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
              <span>{cause}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface px-4 py-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Próximo plano de ação
        </div>
        <div className="mt-2 space-y-2">
          {actionPlan.actions.map((action) => (
            <div key={action} className="flex gap-2 text-[12px] text-foreground leading-relaxed">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-[color:var(--color-success)] shrink-0" />
              <span>{action}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 grid gap-3">
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <MessageSquareShare className="h-3.5 w-3.5" />
            Mensagem sugerida para Discord
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-foreground">{actionPlan.discordMessage}</p>
        </div>
        <div className="rounded-xl border border-border bg-surface px-4 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <SquareKanban className="h-3.5 w-3.5" />
            Card sugerido no Trello
          </div>
          <p className="mt-2 text-[12px] font-medium text-foreground">{actionPlan.trelloCardTitle}</p>
        </div>
      </div>
    </div>
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

function CompactMetric({
  label,
  value,
  detail,
  tone = "default",
}: {
  label: string;
  value: string;
  detail: string;
  tone?: "default" | "success" | "warning" | "info";
}) {
  const toneMap = {
    default: "text-foreground",
    success: "text-[color:var(--color-success)]",
    warning: "text-[color:var(--color-warning)]",
    info: "text-[color:var(--color-info)]",
  };

  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className={cn("mt-1 text-xl font-semibold text-display", toneMap[tone])}>{value}</div>
      <div className="mt-1 text-[10px] text-muted-foreground">{detail}</div>
    </div>
  );
}

function MiniStatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "healthy" | "monitor" | "risk";
}) {
  const toneMap = {
    healthy: "bg-[color:var(--color-success)]/10 text-[color:var(--color-success)]",
    monitor: "bg-[color:var(--color-info)]/10 text-[color:var(--color-info)]",
    risk: "bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]",
  };

  return (
    <div className={cn("rounded-lg px-3 py-2 text-center", toneMap[tone])}>
      <div className="text-[10px] uppercase tracking-[0.14em]">{label}</div>
      <div className="mt-1 text-lg font-semibold text-display">{value}</div>
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
            Alertas e tendências que realmente merecem atenção agora.
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] text-mono h-5">
          {insights.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {insights.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-4 text-[12px] leading-relaxed text-muted-foreground">
            Este recorte não tem insight próprio publicado ainda. A tela foi isolada para não puxar
            sinal de outra operação por engano.
          </div>
        ) : null}
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
