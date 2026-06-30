import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type ComponentType } from "react";
import {
  Activity,
  AlertOctagon,
  ArrowUpRight,
  BarChart3,
  Bot,
  ChevronRight,
  Database,
  Gauge,
  GitBranch,
  ListTodo,
  Mail,
  MessageCircle,
  NotebookPen,
  Orbit,
  PhoneCall,
  RefreshCcw,
  ServerCog,
  ShieldAlert,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import {
  formatPeriodLabel,
  formatVisibilityModeLabel,
  useAdminFilters,
} from "@/components/admin/admin-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  buildOperationCadenceView,
  buildOperationNotionView,
  buildOperationCockpitFromOperation,
  buildOperationRuntimeView,
  buildOperationTrelloView,
  fetchOperations,
  type IncentivaExecutionBacklogItem,
  type IncentivaWorkflowDrilldownItem,
  loadIncentivaCockpit,
  type IncentivaEmailHealthTrack,
  statusMeta,
  type IncentivaCockpitAlert,
  type IncentivaCockpitData,
  type IncentivaProspectingLane,
  type IncentivaWhatsappHealthTrack,
  type IncentivaWorkflowFamily,
  type IncentivaWorkflowInsight,
} from "@/lib/admin-data";
import { applyPeriodToCockpit } from "@/lib/admin-period";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/operacoes")({
  head: () => ({ meta: [{ title: "Console Incentiva — Cockpit de Operações" }] }),
  loader: async () => loadIncentivaCockpit(),
  component: Page,
});

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatDecimal(value: number, digits = 1) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function Page() {
  const incentivaCockpit = Route.useLoaderData();
  const {
    selectedOperationId,
    selectedOperationRecord,
    selectedPeriod,
    selectedVisibilityMode,
  } = useAdminFilters();
  const fallbackOperation = fetchOperations()[0] ?? null;
  const effectiveOperation = selectedOperationRecord ?? fallbackOperation;
  const baseCockpit =
    effectiveOperation?.id === "incentiva"
      ? incentivaCockpit
      : effectiveOperation
        ? buildOperationCockpitFromOperation(effectiveOperation)
        : incentivaCockpit;
  const cockpit = applyPeriodToCockpit(baseCockpit, selectedPeriod);
  const healthMeta = statusMeta[cockpit.summary.health];
  const isSpecificOperationSelected = selectedOperationId !== "all" && selectedOperationRecord;
  const headerTitle = isSpecificOperationSelected
    ? `Cockpit ${cockpit.operationName}`
    : "Cockpit Operacional";
  const headerDescription = isSpecificOperationSelected
    ? `Leitura executiva de ${cockpit.operationName} unindo base, funil, gargalos e telemetria de automação no período selecionado.`
    : `Nenhuma operação específica foi filtrada; mostrando a operação mais pressionada da carteira (${cockpit.operationName}) no período selecionado.`;
  const notionView = effectiveOperation
    ? buildOperationNotionView(effectiveOperation, cockpit, cockpit.source)
    : null;
  const trelloView = effectiveOperation ? buildOperationTrelloView(effectiveOperation, cockpit) : null;
  const cadenceView = effectiveOperation
    ? buildOperationCadenceView(effectiveOperation, cockpit, cockpit.source)
    : null;
  const runtimeView = effectiveOperation
    ? buildOperationRuntimeView(effectiveOperation, cockpit, cockpit.source)
    : null;
  const [selectedNotionStageId, setSelectedNotionStageId] = useState<string | null>(null);
  const [selectedPipelineStageFilter, setSelectedPipelineStageFilter] = useState<string>("all");
  const [selectedPipelineOwnerFilter, setSelectedPipelineOwnerFilter] = useState<string>("all");
  const [selectedPipelineLeadId, setSelectedPipelineLeadId] = useState<string | null>(null);
  const selectedNotionStage = notionView
    ? notionView.stageDrilldown.find((stage) => stage.id === selectedNotionStageId) ??
      notionView.stageDrilldown[0] ??
      null
    : null;
  const pipelineStageOptions = notionView
    ? [
        { id: "all", label: "Todas as etapas" },
        ...notionView.stageDrilldown.map((stage) => ({ id: stage.id, label: stage.label })),
      ]
    : [];
  const pipelineOwnerOptions = notionView
    ? [
        { id: "all", label: "Todos os owners" },
        ...Array.from(new Set(notionView.pipelineRecords.map((record) => record.owner))).map((owner) => ({
          id: owner,
          label: owner,
        })),
      ]
    : [];
  const filteredPipelineRecords = notionView
    ? notionView.pipelineRecords.filter((record) => {
        const matchesStage =
          selectedPipelineStageFilter === "all" || record.stageId === selectedPipelineStageFilter;
        const matchesOwner =
          selectedPipelineOwnerFilter === "all" || record.owner === selectedPipelineOwnerFilter;
        return matchesStage && matchesOwner;
      })
    : [];
  const selectedPipelineLead = notionView
    ? filteredPipelineRecords.find((record) => record.id === selectedPipelineLeadId) ??
      filteredPipelineRecords[0] ??
      null
    : null;

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Operações", cockpit.operationName]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                {isSpecificOperationSelected ? "Operação selecionada" : "Operação prioritária"}
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] uppercase tracking-[0.18em] h-5",
                  healthMeta.color,
                )}
              >
                {healthMeta.label}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {formatPeriodLabel(selectedPeriod)}
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {cockpit.snapshotLabel}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {cockpit.source === "live" ? "Supabase live" : "Snapshot fallback"}
              </Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              {headerTitle}
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {headerDescription}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
              <Link to="/">
                <BarChart3 className="h-3.5 w-3.5" />
                Voltar ao Admin Global
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2" disabled>
              <RefreshCcw className="h-3.5 w-3.5" />
              Refresh live em breve
            </Button>
          </div>
        </section>

        <section className="grid gap-3 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="surface-card p-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge
                variant="outline"
                className="h-5 text-[10px] uppercase tracking-[0.16em]"
              >
                {formatVisibilityModeLabel(selectedVisibilityMode)}
              </Badge>
              <Badge
                variant="outline"
                className="h-5 text-[10px] uppercase tracking-[0.16em]"
              >
                {cockpit.source === "live" ? "Live" : "Snapshot"}
              </Badge>
            </div>
            <h2 className="mt-3 text-sm font-semibold text-display">
              Como interpretar esta operação
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              {selectedVisibilityMode === "internal"
                ? "Neste modo, a operação mostra base, reconciliação, health técnico, backlog e checkpoints de execução."
                : "Neste modo, a operação prioriza saúde, cobertura, marcos e leitura segura para audiência externa."}
            </p>
          </div>

          <div className="surface-card p-4">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Origem do recorte
            </div>
            <h2 className="mt-3 text-sm font-semibold text-display">
              {cockpit.source === "live"
                ? "A operação já está usando leitura viva desta conta."
                : "A operação ainda está em fallback governado nesta tela."}
            </h2>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              {cockpit.source === "live"
                ? "Score, cobertura, reconciliação e parte da leitura comercial já vieram do retrato atual da governança."
                : "O cockpit continua navegável, mas este recorte ainda depende de snapshot para preservar consistência onde a telemetria viva não está completa."}{" "}
              O filtro de período já governa esta leitura.
            </p>
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <ExecKpi
            label="Saúde da operação"
            value={healthMeta.label}
            icon={ShieldAlert}
            tone={cockpit.summary.health}
            sub={cockpit.summary.focus}
          />
          <ExecKpi
            label="Score executivo"
            value={cockpit.summary.priorityScore.toString()}
            icon={Gauge}
            sub="Prioridade atual"
          />
          <ExecKpi
            label="Alinhamento de estágio"
            value={`${formatDecimal(cockpit.summary.stageAlignmentPct, 2)}%`}
            icon={Target}
            tone="success"
            sub="Canônico Supabase x Notion"
          />
          <ExecKpi
            label="Match rate"
            value={`${formatDecimal(cockpit.summary.matchRatePct, 2)}%`}
            icon={Database}
            tone="info"
            sub="Reconciliação estrutural"
          />
          <ExecKpi
            label="Workflows ativos"
            value={`${cockpit.summary.activeWorkflows}/${cockpit.summary.totalWorkflows}`}
            icon={Workflow}
            sub={`n8n VPS · ${cockpit.operationName}`}
          />
          <ExecKpi
            label={selectedPeriod === "mtd" ? "Execuções do mês" : "Execuções do recorte"}
            value={formatNumber(cockpit.summary.success7d)}
            icon={Activity}
            tone="success"
            sub={`${cockpit.summary.error7d} erros · ${cockpit.summary.waiting7d} waiting`}
          />
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Camadas operacionais conectadas</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Aqui a operação deixa de ser só resumo e passa a ter navegação útil de pipeline e execução.
              </p>
            </div>
            <Activity className="h-3.5 w-3.5 text-primary" />
          </div>

          <Tabs defaultValue="trello" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="trello">Trello / Execução</TabsTrigger>
              <TabsTrigger value="notion">Notion / Pipeline</TabsTrigger>
            </TabsList>

            <TabsContent value="trello" className="space-y-4">
              {trelloView ? (
                <section className="space-y-4">
                  <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <div className="flex items-start gap-3">
                        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
                          <GitBranch className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-sm font-medium text-display">{trelloView.headline}</div>
                          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                            {trelloView.detail}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 grid gap-3 sm:grid-cols-4">
                        {trelloView.metrics.map((metric) => (
                          <ExecKpi
                            key={metric.id}
                            label={metric.label}
                            value={metric.value}
                            sub={metric.detail}
                            icon={
                              metric.id === "cards-open"
                                ? GitBranch
                                : metric.id === "segments-open"
                                  ? Activity
                                  : metric.id === "backlog-suggested"
                                    ? ListTodo
                                    : AlertOctagon
                            }
                            tone={metric.tone ?? "monitor"}
                          />
                        ))}
                      </div>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Aberturas úteis
                      </div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {trelloView.boardLabel}
                      </div>
                      <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                        {trelloView.syncLabel}
                      </div>
                      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                        {trelloView.availabilityLabel}
                      </p>

                      <div className="mt-4 grid gap-2">
                        {trelloView.actions.map((action) =>
                          action.href ? (
                            <Button key={action.id} variant="outline" size="sm" className="justify-start gap-2" asChild>
                              <a href={action.href} target="_blank" rel="noreferrer">
                                <ArrowUpRight className="h-3.5 w-3.5" />
                                {action.label}
                              </a>
                            </Button>
                          ) : (
                            <div
                              key={action.id}
                              className="rounded-xl border border-border bg-card px-3 py-3 text-[12px] leading-relaxed text-muted-foreground"
                            >
                              <div className="font-medium text-foreground">{action.label}</div>
                              <div className="mt-1">{action.availabilityLabel}</div>
                            </div>
                          ),
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="overflow-x-auto">
                    <div className="grid min-w-[980px] gap-4 xl:grid-cols-3">
                      {trelloView.columns.map((column) => (
                        <div key={column.id} className="rounded-2xl border border-border bg-surface p-4">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <h3 className="text-sm font-semibold text-display">{column.title}</h3>
                              <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                {column.description}
                              </p>
                            </div>
                            <Badge variant="secondary" className="text-[10px] text-mono h-5">
                              {column.cards.length}
                            </Badge>
                          </div>

                          <div className="mt-4 space-y-3">
                            {column.cards.length ? (
                              column.cards.map((card) => (
                                <TrelloBoardCard key={card.id} card={card} />
                              ))
                            ) : (
                              <div className="rounded-xl border border-dashed border-border bg-card px-3 py-4 text-[12px] text-muted-foreground">
                                Nenhum cartão neste recorte.
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
              ) : null}
            </TabsContent>

            <TabsContent value="notion" className="space-y-4">
              {notionView ? (
                <section className="space-y-4">
                  <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                    <div className="space-y-4">
                      <div className="rounded-2xl border border-border bg-surface p-4">
                        <div className="flex items-start gap-3">
                          <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
                            <NotebookPen className="h-4 w-4" />
                          </div>
                          <div className="min-w-0">
                            <div className="text-sm font-medium text-display">{notionView.headline}</div>
                            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                              {notionView.detail}
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-3 sm:grid-cols-3">
                          <MiniStateCard label="Estado do pipeline" value={notionView.stageLabel} />
                          <MiniStateCard label="Exposição" value={notionView.exposureLabel} />
                          <MiniStateCard label="Sync" value={notionView.syncLabel} />
                        </div>
                      </div>

                      <Tabs defaultValue="resumo" className="space-y-4">
                        <TabsList className="grid w-full grid-cols-4">
                          <TabsTrigger value="resumo">Resumo</TabsTrigger>
                          <TabsTrigger value="etapas">Etapas</TabsTrigger>
                          <TabsTrigger value="leads">Leads</TabsTrigger>
                          <TabsTrigger value="reconciliacao">Como ler</TabsTrigger>
                        </TabsList>

                        <TabsContent value="resumo" className="grid gap-3 sm:grid-cols-2">
                          {notionView.metrics.map((metric) => (
                            <ExecKpi
                              key={metric.id}
                              label={metric.label}
                              value={metric.value}
                              sub={metric.detail}
                              icon={
                                metric.id === "notion-records"
                                  ? NotebookPen
                                  : metric.id === "match-rate"
                                    ? Database
                                    : metric.id === "stage-alignment"
                                      ? Target
                                      : metric.id === "divergence"
                                        ? AlertOctagon
                                        : Sparkles
                              }
                              tone={metric.tone ?? "monitor"}
                            />
                          ))}
                        </TabsContent>

                        <TabsContent value="etapas">
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                            {notionView.stageHighlights.map((stage) => (
                              <button
                                key={stage.id}
                                type="button"
                                onClick={() => {
                                  setSelectedNotionStageId(stage.id);
                                  setSelectedPipelineStageFilter(stage.id);
                                  setSelectedPipelineLeadId(null);
                                }}
                                className={cn(
                                  "rounded-xl border bg-card px-3 py-3 text-left transition-colors",
                                  selectedNotionStage?.id === stage.id
                                    ? "border-primary/40 bg-primary/5"
                                    : "border-border hover:border-primary/25 hover:bg-surface",
                                )}
                              >
                                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                  {stage.label}
                                </div>
                                <div className="mt-1 text-2xl font-semibold text-display tabular-nums">
                                  {formatNumber(stage.count)}
                                </div>
                                <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                                  {stage.touchedLabel}
                                </div>
                              </button>
                            ))}
                          </div>

                          {selectedNotionStage ? (
                            <div className="mt-4 rounded-2xl border border-border bg-card p-4">
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    Etapa em foco
                                  </div>
                                  <div className="mt-1 text-sm font-medium text-foreground">
                                    {selectedNotionStage.label}
                                  </div>
                                </div>
                                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-5">
                                  {selectedNotionStage.priorityLabel}
                                </Badge>
                              </div>

                              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                                <MiniStateCard label="Volume" value={formatNumber(selectedNotionStage.count)} />
                                <MiniStateCard label="Owner" value={selectedNotionStage.owner} />
                                <MiniStateCard label="Movimento" value={selectedNotionStage.touchedLabel} />
                              </div>

                              <div className="mt-4 grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
                                <div className="rounded-xl border border-border bg-surface px-3 py-3">
                                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    Leitura operacional
                                  </div>
                                  <p className="mt-2 text-[12px] leading-relaxed text-foreground">
                                    {selectedNotionStage.detail}
                                  </p>
                                </div>
                                <div className="rounded-xl border border-border bg-surface px-3 py-3">
                                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    Próximo passo sugerido
                                  </div>
                                  <p className="mt-2 text-[12px] leading-relaxed text-foreground">
                                    {selectedNotionStage.nextStep}
                                  </p>
                                </div>
                              </div>
                            </div>
                          ) : null}
                        </TabsContent>

                        <TabsContent value="leads" className="space-y-4">
                          <div className="grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
                            <div className="space-y-4">
                              <div className="rounded-2xl border border-border bg-card p-4">
                                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                  Filtros do pipeline
                                </div>

                                <div className="mt-3">
                                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    Etapa
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {pipelineStageOptions.map((option) => (
                                      <Button
                                        key={option.id}
                                        type="button"
                                        variant={selectedPipelineStageFilter === option.id ? "default" : "outline"}
                                        size="sm"
                                        className="h-8"
                                        onClick={() => {
                                          setSelectedPipelineStageFilter(option.id);
                                          setSelectedPipelineLeadId(null);
                                        }}
                                      >
                                        {option.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>

                                <div className="mt-4">
                                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                                    Owner
                                  </div>
                                  <div className="mt-2 flex flex-wrap gap-2">
                                    {pipelineOwnerOptions.map((option) => (
                                      <Button
                                        key={option.id}
                                        type="button"
                                        variant={selectedPipelineOwnerFilter === option.id ? "default" : "outline"}
                                        size="sm"
                                        className="h-8"
                                        onClick={() => {
                                          setSelectedPipelineOwnerFilter(option.id);
                                          setSelectedPipelineLeadId(null);
                                        }}
                                      >
                                        {option.label}
                                      </Button>
                                    ))}
                                  </div>
                                </div>
                              </div>

                              <div className="grid gap-3">
                                {filteredPipelineRecords.length ? (
                                  filteredPipelineRecords.map((record) => (
                                    <PipelineRecordCard
                                      key={record.id}
                                      record={record}
                                      active={selectedPipelineLead?.id === record.id}
                                      onSelect={() => setSelectedPipelineLeadId(record.id)}
                                    />
                                  ))
                                ) : (
                                  <div className="rounded-xl border border-dashed border-border bg-card px-3 py-4 text-[12px] text-muted-foreground">
                                    Nenhum registro bate com os filtros atuais.
                                  </div>
                                )}
                              </div>
                            </div>

                            <div className="rounded-2xl border border-border bg-card p-4">
                              {selectedPipelineLead ? (
                                <PipelineRecordDetailCard record={selectedPipelineLead} />
                              ) : (
                                <div className="text-[12px] leading-relaxed text-muted-foreground">
                                  Selecione um registro para ver a leitura aprofundada desta etapa.
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>

                        <TabsContent value="reconciliacao" className="space-y-4">
                          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                            {notionView.focusCards.map((card) => (
                              <NotionFocusCard key={card.id} card={card} />
                            ))}
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {notionView.glossary.map((item) => (
                              <NotionGlossaryCard key={item.id} item={item} />
                            ))}
                          </div>

                          <div className="grid gap-3 sm:grid-cols-2">
                            {notionView.actions.map((action) => (
                              <NotionActionCard key={action.id} action={action} />
                            ))}
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>

                    <div className="rounded-2xl border border-border bg-surface p-4">
                      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                        Próximo salto desta camada
                      </div>
                      <div className="mt-1 text-sm font-medium text-foreground">
                        {notionView.nextStep}
                      </div>
                      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                        {notionView.availabilityLabel}
                      </p>

                      <div className="mt-4 grid gap-3">
                        {(selectedNotionStage
                          ? [
                              {
                                id: `stage-${selectedNotionStage.id}`,
                                label: "Etapa em foco agora",
                                value: selectedNotionStage.label,
                                detail: selectedNotionStage.nextStep,
                                tone: selectedNotionStage.tone,
                              },
                              ...notionView.focusCards.slice(0, 2),
                            ]
                          : notionView.focusCards
                        ).map((card) => (
                          <NotionFocusCard key={card.id} card={card} />
                        ))}
                      </div>

                      <div className="mt-4 grid gap-3">
                        {notionView.actions
                          .filter((action) => action.id === "open-notion")
                          .map((action) => (
                            <NotionActionCard key={action.id} action={action} />
                          ))}
                      </div>
                    </div>
                  </div>
                </section>
              ) : null}
            </TabsContent>
          </Tabs>
        </section>

        <section className="surface-card p-5">
          <div className="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
            <div>
              <h2 className="text-sm font-semibold text-display">Recorte ativo desta operação</h2>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Esta tela agora prioriza a operação filtrada e o período selecionado. A proposta é
                tirar o excesso de contexto transversal e deixar só o que ajuda a operar a conta.
              </p>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Recorte aplicado
                </div>
                <div className="mt-1 text-sm">
                  {isSpecificOperationSelected
                    ? `${cockpit.operationName} · ${formatPeriodLabel(selectedPeriod)}`
                    : `Operação prioritária · ${formatPeriodLabel(selectedPeriod)}`}
                </div>
              </div>
              <div className="rounded-xl border border-border bg-surface px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Camadas úteis agora
                </div>
                <div className="mt-1 text-sm">
                  Resumo executivo, funil, backlog e pontos de gestão conectados.
                </div>
              </div>
            </div>
          </div>
        </section>

        {cadenceView ? (
          <section className="grid grid-cols-1 xl:grid-cols-[1.08fr_0.92fr] gap-4">
            <div className="surface-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-display">Cadência comercial</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Aqui a operação cruza base, etapa, atividade e conversão sem depender só de leitura solta de pipeline.
                  </p>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-5">
                  {cadenceView.mode === "live" ? "Supabase live" : "Governado"}
                </Badge>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="text-sm font-medium text-display">{cadenceView.headline}</div>
                <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                  {cadenceView.detail}
                </p>
                <div className="mt-3 text-[11px] text-muted-foreground">{cadenceView.syncLabel}</div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {cadenceView.metrics.map((metric) => (
                  <ExecKpi
                    key={metric.id}
                    label={metric.label}
                    value={metric.value}
                    sub={metric.detail}
                    icon={
                      metric.id === "canonical-unstarted"
                        ? ListTodo
                        : metric.id === "active-now"
                          ? Activity
                          : metric.id === "coverage-days"
                            ? Gauge
                            : Target
                    }
                    tone={metric.tone ?? "monitor"}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {cadenceView.stages.map((stage) => (
                  <CadenceStageCard key={stage.id} stage={stage} />
                ))}
              </div>
            </div>

            <div className="surface-card p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-display">Janelas de leitura</h2>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Últimos 7, 30, 90 dias e acumulado do mês para não misturar pico curto com tendência estrutural.
                  </p>
                </div>
                <BarChart3 className="h-3.5 w-3.5 text-primary" />
              </div>

              <div className="space-y-3">
                {cadenceView.windows.map((window) => (
                  <CadenceWindowCard key={window.id} window={window} />
                ))}
              </div>
            </div>
          </section>
        ) : null}

        {runtimeView ? (
          <section className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Fontes e runtime da operação</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Aqui fica explícito o que vem de `Supabase`, `Notion`, `n8n VPS`, `Evolution API` e `API4Com`, com modo de leitura e próximo passo.
                </p>
              </div>
              <ServerCog className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="text-sm font-medium text-display">{runtimeView.headline}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {runtimeView.detail}
              </p>
            </div>

            <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-5">
              {runtimeView.cards.map((card) => (
                <RuntimeSourceCard key={card.id} card={card} />
              ))}
            </div>
          </section>
        ) : null}

        <section className="space-y-1">
          <h2 className="text-sm font-semibold text-display">Estado atual</h2>
          <p className="text-[11px] text-muted-foreground">
            Primeiro, a tela mostra o retrato da operação como ela está agora.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Resumo Executivo</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Leitura direta do ponto em que {cockpit.operationName} está agora
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] text-mono h-5">
                {cockpit.operationName}
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <SummaryPanel
                title="Base e cadência"
                icon={ListTodo}
                points={[
                  `A operação fechou com ${cockpit.baseMetrics[0]?.value} não iniciados canônicos.`,
                  `A meta diária atual está em ${cockpit.baseMetrics[1] ? "25 ativações" : "cadência ativa"}.`,
                  `O gargalo real hoje é reposição de base, não falta de workflow.`,
                ]}
              />
              <SummaryPanel
                title="Qualidade de dado"
                icon={Database}
                points={[
                  `${formatNumber(cockpit.summary.supabaseRecords)} registros no Supabase vs ${formatNumber(cockpit.summary.notionRecords)} no Notion.`,
                  `${formatDecimal(cockpit.summary.stageAlignmentPct, 2)}% de alinhamento canônico.`,
                  "A reconciliação estrutural está forte, mas a semântica ainda pede ajuste fino.",
                ]}
              />
              <SummaryPanel
                title="Automação"
                icon={Bot}
                points={[
                  `${cockpit.summary.activeWorkflows} workflows ativos de ${cockpit.summary.totalWorkflows} totais.`,
                  `${formatNumber(cockpit.summary.success7d)} execuções com apenas ${cockpit.summary.error7d} erros no recorte atual.`,
                  "A operação já tem densidade suficiente para workflow intelligence por família.",
                ]}
              />
              <SummaryPanel
                title="Próxima decisão"
                icon={Sparkles}
                points={[
                  `Usar ${cockpit.operationName} como leitura operacional do filtro atual.`,
                  "A próxima iteração natural é substituir os blocos mais críticos por leitura viva do Supabase.",
                  "Waiting, base de não iniciados e plano de ação são os próximos pivôs desta tela.",
                ]}
              />
            </div>
          </div>

          <AlertsCard alerts={cockpit.alerts} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-display">Funil Comercial Canônico</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Contagem por estágio já recortada pelo período ativo
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] text-mono h-5">
                Jun 2026
              </Badge>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
              {cockpit.funnel.map((stage) => (
                <div key={stage.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
                    {stage.label}
                  </div>
                  <div className="mt-3 text-[28px] leading-none font-semibold text-display tracking-tight tabular-nums">
                    {formatNumber(stage.count)}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {typeof stage.touchedThisMonth === "number"
                      ? `${formatNumber(stage.touchedThisMonth)} tocados no mês`
                      : "Sem corte mensal consolidado neste bloco"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Base / Reativação</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Primeira camada para lista, reposição e reaproveitamento
                </p>
              </div>
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {cockpit.baseMetrics.map((metric) => (
                <BaseMetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-1">
          <h2 className="text-sm font-semibold text-display">Gargalos prioritários</h2>
          <p className="text-[11px] text-muted-foreground">
            Aqui entram as leituras que mais pressionam a operação neste momento.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">ICP / Lista / Não Iniciados</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Cobertura de base nova e alavancas imediatas para sustentar a cadência
                </p>
              </div>
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.prospectingReadiness.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "icp-coverage"
                      ? ListTodo
                      : metric.id === "coverage-window"
                        ? Gauge
                        : metric.id === "reactivation-volume"
                          ? RefreshCcw
                          : ArrowUpRight
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Alavancas imediatas</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde atacar primeiro para tirar a pressão da operação
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima camada <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.prospectingReadiness.lanes.map((lane) => (
                <ProspectingLaneCard key={lane.id} lane={lane} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">E-mail / Waiting / Throughput</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Leitura do gargalo dominante de e-mail da operação selecionada
                </p>
              </div>
              <Mail className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.emailHealth.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "email-active"
                      ? Mail
                      : metric.id === "email-waiting"
                        ? AlertOctagon
                        : metric.id === "email-throughput"
                          ? Activity
                          : Workflow
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Ponto de intervenção do e-mail</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde atacar para transformar fila em throughput útil
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima camada <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.emailHealth.tracks.map((track) => (
                <EmailTrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-1">
          <h2 className="text-sm font-semibold text-display">Próximas ações</h2>
          <p className="text-[11px] text-muted-foreground">
            Depois do diagnóstico, a V2 organiza o que fazer primeiro.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">V2 · Backlog Operacional</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Primeira camada de priorização executiva por frente da operação atual
                </p>
              </div>
              <ListTodo className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.executionBacklog.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "open-fronts"
                      ? Orbit
                      : metric.id === "p0-items"
                        ? AlertOctagon
                        : metric.id === "owner-clusters"
                          ? Bot
                          : Sparkles
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Fila de intervenção</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que entra primeiro, com dono sugerido e próximo passo
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Roteiro V2 <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.executionBacklog.items.map((item) => (
                <ExecutionBacklogCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="space-y-1">
          <h2 className="text-sm font-semibold text-display">Leitura avançada</h2>
          <p className="text-[11px] text-muted-foreground">
            Estas camadas descem do canal para família, workflow e frente operacional.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">V2 · Drill-down por Família</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Primeira camada de observabilidade semântica por workflow e família
                </p>
              </div>
              <Workflow className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.workflowDrilldown.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "families-observed"
                      ? Orbit
                      : metric.id === "families-critical"
                        ? AlertOctagon
                        : metric.id === "workflow-focus"
                          ? Activity
                          : Sparkles
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Famílias em foco</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde a leitura precisa descer de canal para workflow
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima camada <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.workflowDrilldown.items.map((item) => (
                <WorkflowDrilldownCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">WhatsApp Health</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Leitura executiva do canal que mais sente pressão de base e cadência
                </p>
              </div>
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.whatsappHealth.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "infra"
                      ? Workflow
                      : metric.id === "base-pressure"
                        ? Target
                        : metric.id === "lead-lanes-idle"
                          ? AlertOctagon
                          : Activity
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Frentes do canal</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde o WhatsApp está rodando bem e onde já pede a próxima camada
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima leitura <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.whatsappHealth.tracks.map((track) => (
                <WhatsappTrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Workflow Intelligence</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Leitura de famílias, densidade operacional e ponto de intervenção
                </p>
              </div>
              <Workflow className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.workflowIntelligence.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "active-families"
                      ? Orbit
                      : metric.id === "email-risk"
                        ? AlertOctagon
                        : metric.id === "social-density"
                          ? Sparkles
                          : BarChart3
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Pontos de intervenção</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde a próxima rodada deve entrar para gerar mais efeito
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima camada <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.workflowIntelligence.insights.map((insight) => (
                <WorkflowInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Canais Ativos</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Fotografia operacional por frente principal
                </p>
              </div>
              <Orbit className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {cockpit.channels.map((channel) => {
                const meta = statusMeta[channel.health];
                const Icon =
                  channel.id === "whatsapp"
                    ? MessageCircle
                    : channel.id === "email"
                      ? Mail
                      : channel.id === "linkedin"
                        ? NetworkIcon
                        : Sparkles;

                return (
                  <div
                    key={channel.id}
                    className="rounded-xl border border-border bg-surface px-4 py-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center bg-muted",
                            meta.color,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{channel.label}</span>
                            <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
                              {meta.label}
                            </Badge>
                          </div>
                          <p className="text-[12px] text-foreground mt-1">{channel.headline}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                            {channel.detail}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-semibold text-display tabular-nums">
                          {channel.activeWorkflows}/{channel.totalWorkflows}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Workflows ativos
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-display">Famílias / Top Workflows</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Famílias ativas e fluxos com maior sinal operacional
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima camada <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2">
              {cockpit.workflowFamilies.map((family) => (
                <WorkflowFamilyCard key={family.id} family={family} />
              ))}
            </div>

            <div className="border-t border-border px-5 py-4">
              <h3 className="text-sm font-semibold text-display">
                {selectedPeriod === "mtd" ? "Top workflows do mês" : "Top workflows do recorte"}
              </h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border bg-muted/20">
                      <th className="text-left font-medium px-3 py-2.5">Workflow</th>
                      <th className="text-left font-medium px-3 py-2.5">Família</th>
                      <th className="text-right font-medium px-3 py-2.5">Execuções</th>
                      <th className="text-right font-medium px-3 py-2.5">Erro</th>
                      <th className="text-right font-medium px-3 py-2.5">Waiting</th>
                      <th className="text-left font-medium px-3 py-2.5">Última corrida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cockpit.topWorkflows.map((workflow) => (
                      <tr key={workflow.name} className="border-b border-border last:border-0">
                        <td className="px-3 py-3">
                          <div className="font-medium text-[12.5px]">{workflow.name}</div>
                        </td>
                        <td className="px-3 py-3 text-[11px] text-muted-foreground">
                          {workflow.family}
                        </td>
                        <td className="px-3 py-3 text-right text-mono text-[12px] font-medium">
                          {formatNumber(workflow.executions7d)}
                        </td>
                        <td className="px-3 py-3 text-right text-mono text-[12px]">
                          {workflow.error7d}
                        </td>
                        <td className="px-3 py-3 text-right text-mono text-[12px]">
                          {workflow.waiting7d}
                        </td>
                        <td className="px-3 py-3 text-[11px] text-muted-foreground">
                          {workflow.lastRun}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function CadenceStageCard({
  stage,
}: {
  stage: {
    id: string;
    label: string;
    count: number;
    shareLabel: string;
    conversionLabel: string;
    tone?: "healthy" | "monitor" | "risk" | "critical" | "info";
  };
}) {
  const toneClass =
    stage.tone === "healthy"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      : stage.tone === "risk" || stage.tone === "critical"
        ? "border-rose-500/20 bg-rose-500/5 text-rose-600"
        : stage.tone === "monitor"
          ? "border-amber-500/20 bg-amber-500/5 text-amber-600"
          : "border-primary/20 bg-primary/5 text-primary";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{stage.label}</div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", toneClass)}>
          {stage.tone === "healthy"
            ? "Forte"
            : stage.tone === "risk" || stage.tone === "critical"
              ? "Pressão"
              : stage.tone === "monitor"
                ? "Monitorar"
                : "Ler"}
        </Badge>
      </div>
      <div className="mt-3 text-[28px] leading-none font-semibold text-display tracking-tight tabular-nums">
        {formatNumber(stage.count)}
      </div>
      <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{stage.shareLabel}</div>
      <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{stage.conversionLabel}</div>
    </div>
  );
}

function CadenceWindowCard({
  window,
}: {
  window: {
    id: string;
    label: string;
    activeLabel: string;
    conversionLabel: string;
    velocityLabel: string;
    detail: string;
    tone?: "healthy" | "monitor" | "risk" | "critical" | "info";
  };
}) {
  const toneClass =
    window.tone === "healthy"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      : window.tone === "risk" || window.tone === "critical"
        ? "border-rose-500/20 bg-rose-500/5 text-rose-600"
        : window.tone === "monitor"
          ? "border-amber-500/20 bg-amber-500/5 text-amber-600"
          : "border-primary/20 bg-primary/5 text-primary";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-foreground">{window.label}</div>
          <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{window.detail}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", toneClass)}>
          {window.velocityLabel}
        </Badge>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MiniStateCard label="Ativos" value={window.activeLabel} />
        <MiniStateCard label="Conversão" value={window.conversionLabel} />
      </div>
    </div>
  );
}

function RuntimeSourceCard({
  card,
}: {
  card: {
    id: string;
    title: string;
    health: "healthy" | "monitor" | "risk" | "critical";
    modeLabel: string;
    lastSync: string;
    owner: string;
    sourceOfTruth: string;
    headline: string;
    detail: string;
    facts: { label: string; value: string }[];
    nextStep: string;
  };
}) {
  const toneClass =
    card.health === "healthy"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      : card.health === "risk" || card.health === "critical"
        ? "border-rose-500/20 bg-rose-500/5 text-rose-600"
        : "border-amber-500/20 bg-amber-500/5 text-amber-600";

  const Icon =
    card.id === "supabase"
      ? Database
      : card.id === "notion"
        ? NotebookPen
        : card.id === "n8n"
          ? ServerCog
          : card.id === "evolution"
            ? MessageCircle
            : PhoneCall;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className={cn("rounded-xl border p-2", toneClass)}>
              <Icon className="h-4 w-4" />
            </div>
            <div className="text-sm font-medium text-foreground">{card.title}</div>
          </div>
          <div className="mt-2 text-[11px] text-muted-foreground">{card.modeLabel}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", toneClass)}>
          {statusMeta[card.health].label}
        </Badge>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-foreground">{card.headline}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{card.detail}</p>

      <div className="mt-4 grid gap-2">
        <MiniStateCard label="Fonte de verdade" value={card.sourceOfTruth} />
        <MiniStateCard label="Owner" value={card.owner} />
        <MiniStateCard label="Última leitura" value={card.lastSync} />
      </div>

      <div className="mt-4 grid gap-2">
        {card.facts.map((fact) => (
          <div key={`${card.id}-${fact.label}`} className="rounded-lg border border-border bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{fact.label}</div>
            <div className="mt-1 text-[11px] leading-relaxed text-foreground">{fact.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface px-3 py-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Próximo passo</div>
        <p className="mt-2 text-[12px] leading-relaxed text-foreground">{card.nextStep}</p>
      </div>
    </div>
  );
}

function NotionActionCard({
  action,
}: {
  action: {
    id: string;
    title: string;
    detail: string;
    tone: "healthy" | "monitor" | "risk" | "critical" | "info";
    href?: string;
    external?: boolean;
  };
}) {
  const toneClass =
    action.tone === "healthy"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      : action.tone === "risk" || action.tone === "critical"
        ? "border-rose-500/20 bg-rose-500/5 text-rose-600"
        : action.tone === "monitor"
          ? "border-amber-500/20 bg-amber-500/5 text-amber-600"
          : "border-primary/20 bg-primary/5 text-primary";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium text-foreground">{action.title}</div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", toneClass)}>
          {action.tone === "healthy"
            ? "Saudável"
            : action.tone === "risk" || action.tone === "critical"
              ? "Prioridade"
              : action.tone === "monitor"
                ? "Monitorar"
                : "Camada"}
        </Badge>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{action.detail}</p>
      {action.href ? (
        <Button variant="outline" size="sm" className="mt-3 h-8 w-full gap-2" asChild>
          <a
            href={action.href}
            target={action.external ? "_blank" : undefined}
            rel={action.external ? "noreferrer" : undefined}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Abrir Notion da operação
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function NotionFocusCard({
  card,
}: {
  card: {
    id: string;
    label: string;
    value: string;
    detail: string;
    tone?: "healthy" | "monitor" | "risk" | "critical" | "info";
  };
}) {
  const toneClass =
    card.tone === "healthy"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      : card.tone === "risk" || card.tone === "critical"
        ? "border-rose-500/20 bg-rose-500/5 text-rose-600"
        : card.tone === "monitor"
          ? "border-amber-500/20 bg-amber-500/5 text-amber-600"
          : "border-primary/20 bg-primary/5 text-primary";

  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{card.label}</div>
        {card.tone ? (
          <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", toneClass)}>
            {card.tone === "healthy"
              ? "Forte"
              : card.tone === "risk" || card.tone === "critical"
                ? "Ajustar"
                : card.tone === "monitor"
                  ? "Monitorar"
                  : "Camada"}
          </Badge>
        ) : null}
      </div>
      <div className="mt-2 text-sm font-medium text-foreground">{card.value}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{card.detail}</p>
    </div>
  );
}

function NotionGlossaryCard({
  item,
}: {
  item: {
    id: string;
    term: string;
    definition: string;
  };
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-sm font-medium text-foreground">{item.term}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{item.definition}</p>
    </div>
  );
}

function PipelineRecordCard({
  record,
  active,
  onSelect,
}: {
  record: {
    id: string;
    leadName: string;
    company: string;
    owner: string;
    stageLabel: string;
    priorityLabel: string;
    sourceLabel: string;
    lastTouchLabel: string;
    flags: string[];
    tone?: "healthy" | "monitor" | "risk" | "critical" | "info";
  };
  active: boolean;
  onSelect: () => void;
}) {
  const toneClass =
    record.tone === "healthy"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      : record.tone === "risk" || record.tone === "critical"
        ? "border-rose-500/20 bg-rose-500/5 text-rose-600"
        : record.tone === "monitor"
          ? "border-amber-500/20 bg-amber-500/5 text-amber-600"
          : "border-primary/20 bg-primary/5 text-primary";

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full rounded-xl border bg-card p-4 text-left transition-colors",
        active ? "border-primary/40 bg-primary/5" : "border-border hover:border-primary/25 hover:bg-surface",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{record.leadName}</div>
          <div className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{record.company}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", toneClass)}>
          {record.stageLabel}
        </Badge>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Owner</div>
          <div className="mt-1 text-[11px] leading-relaxed text-foreground">{record.owner}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Prioridade</div>
          <div className="mt-1 text-[11px] leading-relaxed text-foreground">{record.priorityLabel}</div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em] h-5">
          {record.sourceLabel}
        </Badge>
        <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-5">
          {record.lastTouchLabel}
        </Badge>
        {record.flags.map((flag) => (
          <Badge key={`${record.id}-${flag}`} variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-5">
            {flag}
          </Badge>
        ))}
      </div>
    </button>
  );
}

function PipelineRecordDetailCard({
  record,
}: {
  record: {
    leadName: string;
    company: string;
    owner: string;
    stageLabel: string;
    priorityLabel: string;
    sourceLabel: string;
    lastTouchLabel: string;
    nextStep: string;
    detail: string;
    flags: string[];
    href?: string;
    external?: boolean;
  };
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Lead em foco</div>
      <div className="mt-1 text-base font-semibold text-foreground">{record.leadName}</div>
      <div className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{record.company}</div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <MiniStateCard label="Etapa" value={record.stageLabel} />
        <MiniStateCard label="Owner" value={record.owner} />
        <MiniStateCard label="Prioridade" value={record.priorityLabel} />
        <MiniStateCard label="Último movimento" value={record.lastTouchLabel} />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface px-3 py-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Leitura operacional</div>
        <p className="mt-2 text-[12px] leading-relaxed text-foreground">{record.detail}</p>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface px-3 py-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Próximo passo</div>
        <p className="mt-2 text-[12px] leading-relaxed text-foreground">{record.nextStep}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em] h-5">
          {record.sourceLabel}
        </Badge>
        {record.flags.map((flag) => (
          <Badge key={`${record.leadName}-${flag}`} variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-5">
            {flag}
          </Badge>
        ))}
      </div>

      {record.href ? (
        <Button variant="outline" size="sm" className="mt-4 h-8 w-full gap-2" asChild>
          <a
            href={record.href}
            target={record.external ? "_blank" : undefined}
            rel={record.external ? "noreferrer" : undefined}
          >
            <ArrowUpRight className="h-3.5 w-3.5" />
            Abrir Notion da operação
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function MiniStateCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function TrelloBoardCard({
  card,
}: {
  card: {
    id: string;
    title: string;
    detail: string;
    owner: string;
    statusLabel: string;
    segmentLabel: string;
    followUp: string;
    sourceLabel: string;
  };
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-foreground">{card.title}</div>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{card.detail}</p>
        </div>
        <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-5">
          {card.statusLabel}
        </Badge>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Owner</div>
          <div className="mt-1 text-[11px] leading-relaxed text-foreground">{card.owner}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface px-2.5 py-2">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Segmento</div>
          <div className="mt-1 text-[11px] leading-relaxed text-foreground">{card.segmentLabel}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface px-2.5 py-2 sm:col-span-2">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Follow-up</div>
          <div className="mt-1 text-[11px] leading-relaxed text-foreground">{card.followUp}</div>
        </div>
        <div className="rounded-lg border border-border bg-surface px-2.5 py-2 sm:col-span-2">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Fonte</div>
          <div className="mt-1 text-[11px] leading-relaxed text-foreground">{card.sourceLabel}</div>
        </div>
      </div>
    </div>
  );
}

function OperationSourceCard({
  card,
}: {
  card: {
    id: "notion" | "trello";
    title: string;
    health: "healthy" | "monitor" | "risk" | "critical";
    mode: "live" | "operational";
    headline: string;
    detail: string;
    lastSync: string;
    ctaLabel: string;
    ctaValue: string;
    facts: { label: string; value: string }[];
    nextStep: string;
    actionLabel?: string;
    actionHref?: string;
    actionExternal?: boolean;
    availabilityLabel?: string;
  };
}) {
  const meta = statusMeta[card.health];
  const Icon = card.id === "notion" ? NotebookPen : GitBranch;

  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm font-medium">{card.title}</div>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em] h-5">
              {card.mode === "live" ? "live" : "operational"}
            </Badge>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{card.headline}</p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface px-3 py-3">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Leitura atual</div>
        <div className="mt-1 text-[12px] leading-relaxed text-foreground">{card.detail}</div>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {card.facts.map((fact) => (
          <div key={`${card.id}-${fact.label}`} className="rounded-xl border border-border bg-surface px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{fact.label}</div>
            <div className="mt-1 text-[11px] leading-relaxed text-foreground">{fact.value}</div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 md:grid-cols-[auto_1fr]">
        <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-3 min-w-[170px]">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{card.ctaLabel}</div>
          <div className="mt-1 text-sm font-medium text-foreground">{card.ctaValue}</div>
          <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{card.lastSync}</div>
          {card.availabilityLabel ? (
            <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {card.availabilityLabel}
            </div>
          ) : null}
          {card.actionHref && card.actionLabel ? (
            <Button variant="outline" size="sm" className="mt-3 h-8 w-full gap-2" asChild>
              <a
                href={card.actionHref}
                target={card.actionExternal ? "_blank" : undefined}
                rel={card.actionExternal ? "noreferrer" : undefined}
              >
                <ArrowUpRight className="h-3.5 w-3.5" />
                {card.actionLabel}
              </a>
            </Button>
          ) : null}
        </div>
        <div className="rounded-xl border border-border bg-surface px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Próximo salto</div>
          <div className="mt-1 text-[12px] leading-relaxed text-foreground">{card.nextStep}</div>
        </div>
      </div>
    </div>
  );
}

function ExecKpi({
  label,
  value,
  sub,
  icon: Icon,
  tone = "healthy",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
}) {
  const toneMap = {
    healthy: "text-[color:var(--color-success)]",
    monitor: "text-[color:var(--color-info)]",
    risk: "text-[color:var(--color-warning)]",
    critical: "text-destructive",
    success: "text-[color:var(--color-success)]",
    info: "text-[color:var(--color-info)]",
  };

  return (
    <div className="surface-card p-4 flex flex-col gap-3">
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
        </div>
      </div>
      <div className={cn("text-[26px] leading-none font-semibold text-display tracking-tight", toneMap[tone])}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function SummaryPanel({
  title,
  icon: Icon,
  points,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  points: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-display">{title}</h3>
      </div>
      <div className="space-y-2">
        {points.map((point) => (
          <div key={point} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span>{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsCard({ alerts }: { alerts: IncentivaCockpitAlert[] }) {
  const meta = {
    critical: { icon: AlertOctagon, color: "text-destructive", bg: "bg-destructive/10" },
    risk: {
      icon: ShieldAlert,
      color: "text-[color:var(--color-warning)]",
      bg: "bg-[color:var(--color-warning)]/10",
    },
    monitor: {
      icon: Activity,
      color: "text-[color:var(--color-info)]",
      bg: "bg-[color:var(--color-info)]/10",
    },
    info: { icon: Sparkles, color: "text-muted-foreground", bg: "bg-muted" },
  } as const;

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-display">Alertas Prioritários</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Leitura estratégica para a próxima rodada de execução
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] text-mono h-5">
          {alerts.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const item = meta[alert.severity];
          const Icon = item.icon;
          return (
            <div key={alert.id} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", item.bg, item.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[12.5px] font-medium leading-snug">{alert.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {alert.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BaseMetricCard({
  metric,
}: {
  metric: IncentivaCockpitData["baseMetrics"][number];
}) {
  const toneMap = {
    default: "text-foreground",
    success: "text-[color:var(--color-success)]",
    warning: "text-[color:var(--color-warning)]",
    destructive: "text-destructive",
    info: "text-[color:var(--color-info)]",
  };
  const tone = toneMap[metric.tone ?? "default"];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
            {metric.label}
          </div>
          <div className={cn("mt-2 text-[24px] leading-none font-semibold text-display tracking-tight tabular-nums", tone)}>
            {formatNumber(metric.value)}
            {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
          </div>
        </div>
        <ArrowUpRight className={cn("h-4 w-4 shrink-0", tone)} />
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{metric.detail}</div>
    </div>
  );
}

function WorkflowFamilyCard({ family }: { family: IncentivaWorkflowFamily }) {
  const meta = statusMeta[family.health];
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{family.label}</div>
          <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            {family.summary}
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] h-5 shrink-0", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Ativos</span>
        <span className="text-mono font-medium text-foreground">
          {family.active}/{family.total}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full", meta.bg)}
          style={{ width: `${(family.active / family.total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function WhatsappTrackCard({ track }: { track: IncentivaWhatsappHealthTrack }) {
  const meta = statusMeta[track.health];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{track.label}</span>
            <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
              {meta.label}
            </Badge>
          </div>
          <p className="text-[12px] text-foreground mt-1">{track.headline}</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            {track.detail}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Sinal
          </div>
          <div className="text-[12px] font-medium text-display mt-1">{track.workflows}</div>
        </div>
      </div>
    </div>
  );
}

function WorkflowInsightCard({ insight }: { insight: IncentivaWorkflowInsight }) {
  const meta = statusMeta[insight.health];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{insight.label}</span>
            <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
              {meta.label}
            </Badge>
          </div>
          <p className="text-[12px] text-foreground mt-1">{insight.headline}</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            {insight.detail}
          </p>
          <div className="mt-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-[11px] leading-relaxed text-foreground">
            <span className="font-medium">Recomendação:</span> {insight.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProspectingLaneCard({ lane }: { lane: IncentivaProspectingLane }) {
  const meta = statusMeta[lane.health];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{lane.label}</span>
            <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
              {meta.label}
            </Badge>
          </div>
          <p className="text-[12px] text-foreground">{lane.headline}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{lane.detail}</p>
          <div className="text-[11px] text-primary leading-relaxed">
            {lane.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailTrackCard({ track }: { track: IncentivaEmailHealthTrack }) {
  const meta = statusMeta[track.health];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{track.label}</span>
          <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
            {meta.label}
          </Badge>
        </div>
        <p className="text-[12px] text-foreground">{track.headline}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{track.detail}</p>
        <div className="text-[11px] text-primary leading-relaxed">{track.recommendation}</div>
      </div>
    </div>
  );
}

function ExecutionBacklogCard({ item }: { item: IncentivaExecutionBacklogItem }) {
  const meta = statusMeta[item.health];
  const priorityTone =
    item.priority === "P0"
      ? "border-destructive/30 text-destructive bg-destructive/8"
      : item.priority === "P1"
        ? "border-warning/30 text-warning bg-warning/8"
        : "border-info/30 text-info bg-info/8";

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-[10px] h-5 font-semibold", priorityTone)}>
              {item.priority}
            </Badge>
            <span className="text-sm font-medium">{item.lane}</span>
            <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
              {meta.label}
            </Badge>
          </div>
          <p className="text-[12px] text-foreground">{item.headline}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
          <div className="text-[11px] text-muted-foreground">
            Dono sugerido: <span className="text-foreground">{item.owner}</span>
          </div>
          <div className="text-[11px] text-primary leading-relaxed">{item.nextStep}</div>
        </div>
      </div>
    </div>
  );
}

function WorkflowDrilldownCard({ item }: { item: IncentivaWorkflowDrilldownItem }) {
  const meta = statusMeta[item.health];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{item.family}</span>
          <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
            {meta.label}
          </Badge>
        </div>
        <div className="text-[11px] text-muted-foreground">
          Workflow em foco: <span className="text-foreground">{item.highlightedWorkflow}</span>
        </div>
        <p className="text-[12px] text-foreground">{item.headline}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
        <div className="text-[11px] text-muted-foreground">
          Dono sugerido: <span className="text-foreground">{item.owner}</span>
        </div>
        <div className="text-[11px] text-primary leading-relaxed">{item.nextStep}</div>
      </div>
    </div>
  );
}

function NetworkIcon({ className }: { className?: string }) {
  return <Orbit className={className} />;
}
