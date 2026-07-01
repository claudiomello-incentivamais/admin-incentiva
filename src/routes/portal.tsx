import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Building2,
  ChartColumn,
  Database,
  Eye,
  GitBranch,
  LockKeyhole,
  Mail,
  MessageCircle,
  NotebookPen,
  PhoneCall,
  ServerCog,
  Target,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";
import { Bar, BarChart, CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { z } from "zod";

import { Topbar } from "@/components/admin/Topbar";
import { useAdminAuth } from "@/components/admin/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { formatPeriodLabel, useAdminFilters } from "@/components/admin/admin-filters";
import {
  buildOperationActionPlan,
  buildOperationCadenceView,
  buildOperationCockpitFromOperation,
  buildOperationNotionView,
  buildOperationRuntimeView,
  buildOperationTrelloView,
  statusMeta,
} from "@/lib/admin-data";
import { loadEvolutionTelemetryDashboardServerFn } from "@/lib/admin-evolution-rpc";
import { loadScopedGlobalDashboardServerFn } from "@/lib/admin-global-rpc";
import { loadN8nTelemetryDashboardServerFn } from "@/lib/admin-n8n-rpc";
import { loadPortalAnalyticsServerFn } from "@/lib/admin-portal-rpc";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "Portal — Console Incentiva" }] }),
  validateSearch: z.object({
    operationId: z.string().optional(),
  }),
  loader: async () => {
    const [dashboard, evolution, n8n, analytics] = await Promise.all([
      loadScopedGlobalDashboardServerFn(),
      loadEvolutionTelemetryDashboardServerFn(),
      loadN8nTelemetryDashboardServerFn(),
      loadPortalAnalyticsServerFn(),
    ]);

    return {
      dashboard,
      evolution,
      n8n,
      analytics,
    };
  },
  component: PortalPage,
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

function ratioPct(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return (numerator / denominator) * 100;
}

function formatPipelineStageLabel(stageId: string) {
  if (stageId === "prospecting") return "Prospect";
  if (stageId === "lead-interessado") return "Lead Interessado";
  if (stageId === "mql-agendado") return "MQL Agendado";
  if (stageId === "mql-realizado") return "MQL Realizado";
  if (stageId === "negotiation") return "Negociação";
  if (stageId === "won") return "Cliente Ganho";
  if (stageId === "lost") return "Perdido";
  return stageId;
}

function PortalPage() {
  const loaderData = Route.useLoaderData();
  const { dashboard, evolution, n8n, analytics } = loaderData;
  const search = Route.useSearch();
  const { session } = useAdminAuth();
  const { selectedOperationId, selectedPeriod } = useAdminFilters();
  const requestedOperationId = search.operationId;

  const portalOperation =
    ((requestedOperationId
      ? dashboard.operations.find((operation) => operation.id === requestedOperationId)
      : null) ??
      (selectedOperationId === "all"
      ? dashboard.operations.find((operation) => operation.health === "healthy") ??
        dashboard.operations.find((operation) => operation.health === "monitor") ??
        dashboard.operations[0]
      : dashboard.operations.find((operation) => operation.id === selectedOperationId))) ?? null;

  if (!portalOperation) {
    return (
      <>
        <Topbar breadcrumb={["Console Incentiva", "Portal"]} hidePeriodFilter />
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-4 md:px-6 md:py-6">
          <div className="surface-card p-6 text-sm text-muted-foreground">
            Nenhuma operação disponível para montar a visão de portal.
          </div>
        </main>
      </>
    );
  }

  const currentCockpit = buildOperationCockpitFromOperation(portalOperation);
  const cockpit = currentCockpit;
  const cadenceView = buildOperationCadenceView(portalOperation, cockpit, dashboard.source);
  const actionPlan = buildOperationActionPlan(portalOperation);
  const notionView = buildOperationNotionView(portalOperation, cockpit, dashboard.source);
  const trelloView = buildOperationTrelloView(portalOperation, cockpit);
  const runtimeView = buildOperationRuntimeView(
    portalOperation,
    cockpit,
    dashboard.source,
  );
  const openNotionAction = notionView.actions.find((action) => action.id === "open-notion");
  const openBoardAction = trelloView.actions.find((action) => action.id === "open-board");
  const allowedRoutes = new Set(session?.allowedRoutes ?? ["/portal"]);
  const canAccessSettings = allowedRoutes.has("/configuracoes");
  const canAccessAdminViews = allowedRoutes.has("/clientes") || allowedRoutes.has("/");
  const pipelineStages = currentCockpit.funnel.filter((stage) =>
    ["prospecting", "lead-interessado", "mql-agendado", "mql-realizado", "negotiation", "won", "lost"].includes(
      stage.id,
    ),
  );
  const prospectTouched =
    currentCockpit.funnel.find((stage) => stage.id === "prospecting")?.touchedThisMonth ?? 0;
  const leadTouched =
    currentCockpit.funnel.find((stage) => stage.id === "lead-interessado")?.touchedThisMonth ?? 0;
  const scheduledTouched =
    currentCockpit.funnel.find((stage) => stage.id === "mql-agendado")?.touchedThisMonth ?? 0;
  const negotiationTouched =
    currentCockpit.funnel.find((stage) => stage.id === "negotiation")?.touchedThisMonth ?? 0;
  const wonTouched =
    currentCockpit.funnel.find((stage) => stage.id === "won")?.touchedThisMonth ?? 0;
  const firstInterestPct = ratioPct(leadTouched, prospectTouched);
  const scheduledPct = ratioPct(scheduledTouched, leadTouched);
  const negotiationPct = ratioPct(negotiationTouched, scheduledTouched);
  const wonPct = ratioPct(wonTouched, negotiationTouched);
  const runtimePortalCards = runtimeView.cards.filter((card) =>
    ["n8n", "evolution"].includes(card.id),
  );
  const periodAnalytics =
    analytics.operations.find((operation) => operation.operationId === portalOperation.id)?.periods[
      selectedPeriod
    ] ?? null;
  const evolutionRow =
    evolution.operations.find((row) => row.operationId === portalOperation.id) ?? null;
  const evolutionInstances = evolution.instances.filter((row) => row.operationId === portalOperation.id);
  const evolutionOutbound7d = evolutionInstances.reduce((sum, row) => sum + row.outbound7d, 0);
  const linkedinChannel = currentCockpit.channels.find((channel) => channel.id === "linkedin") ?? null;
  const n8nOperation = n8n.operations.find((row) => row.operationId === portalOperation.id) ?? null;
  const n8nWorkflows = n8n.workflows.filter((row) => row.operationId === portalOperation.id);
  const emailWaitingMetric =
    currentCockpit.emailHealth.metrics.find((metric) => metric.id === "email-waiting")?.value ?? "0";
  const emailWorkflowExecToday = n8nWorkflows
    .filter((workflow) => ["email_fup", "retorno_email"].includes(workflow.workflowFamily))
    .reduce((sum, workflow) => sum + workflow.execToday, 0);
  const emailWorkflowExec7d = n8nWorkflows
    .filter((workflow) => ["email_fup", "retorno_email"].includes(workflow.workflowFamily))
    .reduce((sum, workflow) => sum + workflow.exec7d, 0);
  const linkedinWorkflowExecToday = n8nWorkflows
    .filter((workflow) =>
      ["linkedin_conexao", "linkedin_fup", "linkedin_social"].includes(workflow.workflowFamily),
    )
    .reduce((sum, workflow) => sum + workflow.execToday, 0);
  const linkedinWorkflowExec7d = n8nWorkflows
    .filter((workflow) =>
      ["linkedin_conexao", "linkedin_fup", "linkedin_social"].includes(workflow.workflowFamily),
    )
    .reduce((sum, workflow) => sum + workflow.exec7d, 0);
  const chartStageData = periodAnalytics
    ? [
        { stage: "Prospect", value: periodAnalytics.stageCounts.prospecting },
        { stage: "Lead Int.", value: periodAnalytics.stageCounts["lead-interessado"] },
        { stage: "MQL Ag.", value: periodAnalytics.stageCounts["mql-agendado"] },
        { stage: "Negociação", value: periodAnalytics.stageCounts.negotiation },
        { stage: "Ganhos", value: periodAnalytics.stageCounts.won },
      ]
    : [];
  const chartTimelineData = periodAnalytics?.timeline ?? [];

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Portal"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {formatPeriodLabel(selectedPeriod)}
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                Atualizado em {dashboard.snapshotLabel}
              </span>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Portal de Operação
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Visão central da operação com foco em base, cobertura, conversão, ações executáveis
              e saúde técnica das integrações.
            </p>
          </div>

          {(canAccessSettings || canAccessAdminViews) && (
            <div className="flex items-center gap-2 flex-wrap">
              {canAccessSettings && (
                <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
                  <Link to="/configuracoes">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Ajustar regras de acesso
                  </Link>
                </Button>
              )}
              {canAccessAdminViews && (
                <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
                  <Link to={allowedRoutes.has("/clientes") ? "/clientes" : "/"}>
                    <ArrowRight className="h-3.5 w-3.5" />
                    Voltar ao admin
                  </Link>
                </Button>
              )}
            </div>
          )}
        </section>

        <section className="surface-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em] h-5">
                  {portalOperation.client}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase tracking-[0.16em] h-5",
                    statusMeta[portalOperation.health].color,
                  )}
                >
                  {statusMeta[portalOperation.health].label}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold text-display">{portalOperation.name}</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Cockpit resumido da operação selecionada, com leitura de base, links de trabalho,
                priorização e runtime técnico no mesmo lugar.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <PortalKpi
              label="Base monitorada"
              value={formatNumber(cockpit.summary.supabaseRecords)}
              detail="Registros visíveis na última leitura útil desta operação."
              icon={Users}
              tone="info"
            />
            <PortalKpi
              label="Cobertura"
              value={`${formatPercent(portalOperation.baseCoverage)}%`}
              detail="Percentual atual de base ainda disponível para sustentar a cadência."
              icon={Target}
              tone="monitor"
            />
            <PortalKpi
              label="1º interesse"
              value={`${formatPercent(firstInterestPct)}%`}
              detail="Lead interessado sobre prospects tocados no mês, na última leitura útil."
              icon={TrendingUp}
              tone="success"
            />
            <PortalKpi
              label="Reconciliação"
              value={`${formatPercent(portalOperation.dataReconciliation)}%`}
              detail="Coerência atual entre as camadas operacionais da conta."
              icon={Building2}
              tone="info"
            />
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Direção da operação</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Diagnóstico principal e ações de gestão para a próxima rodada.
              </p>
            </div>
            <Eye className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-primary">Prioridade agora</div>
            <div className="mt-1 text-base font-semibold text-display">{actionPlan.actions[0]}</div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              Foco atual em {portalOperation.focus.toLowerCase()}, com leitura de cobertura,
              pipeline e ganhos já refletidos na última atualização útil.
            </p>
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <PortalNarrativeCard
              label="Foco principal"
              title={portalOperation.focus}
              detail="Tema que mais influencia a priorização atual desta conta."
            />
            <PortalNarrativeCard
              label="Cobertura atual"
              title={`${formatPercent(portalOperation.baseCoverage)}%`}
              detail="Mostra se ainda existe base suficiente para sustentar a cadência sem reposição imediata."
            />
            <PortalNarrativeCard
              label="Ganhos no mês"
              title={formatNumber(wonTouched)}
              detail="Clientes ganhos já refletidos na operação até a última atualização útil."
            />
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            {actionPlan.actions.slice(0, 3).map((action, index) => (
              <ActivationRow
                key={action}
                title={`Ação ${index + 1}`}
                detail={action}
                icon={ArrowRight}
              />
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Acessos rápidos da operação</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Tudo que precisa ser aberto para tocar a conta sem caçar em outras telas.
              </p>
            </div>
            <Activity className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {openBoardAction ? (
              <LiveActionCard
                title="Abrir Trello da operação"
                detail="Entrada direta no quadro da operação para execução, follow-up e priorização."
                href={openBoardAction.href}
                external
                buttonLabel={openBoardAction.label}
              />
            ) : (
              <PortalNarrativeCard
                label="Trello"
                title="Quadro ainda não homologado"
                detail={trelloView.availabilityLabel}
              />
            )}
            {openNotionAction ? (
              <LiveActionCard
                title={openNotionAction.title}
                detail="Entrada direta na base comercial da operação para owner, estágio e próximos passos."
                href={openNotionAction.href}
                external={openNotionAction.external}
                buttonLabel="Abrir Notion da operação"
              />
            ) : (
              <PortalNarrativeCard
                label="Notion"
                title="Base ainda sem link direto"
                detail="A leitura comercial continua disponível no painel, mas o link direto da base ainda não foi homologado neste recorte."
              />
            )}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Base e movimento comercial</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Recorte real do pipeline conforme o período selecionado, usando a última edição útil da camada comercial.
              </p>
            </div>
            <Activity className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="rounded-2xl border border-border bg-surface p-4">
            <div className="text-sm font-medium text-display">Base e movimento comercial do recorte</div>
            <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
              O bloco abaixo considera a movimentação real do período filtrado. Cobertura e não iniciados seguem como fotografia atual da base.
            </p>
            <div className="mt-3 text-[11px] text-muted-foreground">{cadenceView.syncLabel}</div>

            <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <PortalMiniMetric
                label="Não iniciados"
                value={currentCockpit.baseMetrics.find((metric) => metric.id === "unstarted")?.value?.toLocaleString("pt-BR") ?? "0"}
                detail="Base ainda disponível agora para continuar abastecendo a cadência."
              />
              <PortalMiniMetric
                label="Cobertura em dias"
                value={currentCockpit.baseMetrics.find((metric) => metric.id === "coverage-days")?.value?.toLocaleString("pt-BR") ?? "0"}
                detail="Quanto a base atual sustenta a meta diária de ativações."
              />
              <PortalMiniMetric
                label="Prospects tocados"
                value={formatNumber(periodAnalytics?.stageCounts.prospecting ?? 0)}
                detail="Prospects que passaram por atualização útil no período filtrado."
              />
              <PortalMiniMetric
                label="Ativos no recorte"
                value={formatNumber(periodAnalytics?.touched ?? 0)}
                detail="Total de movimentos de etapa refletidos no período filtrado."
              />
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
              {(periodAnalytics
                ? [
                    { id: "prospecting", count: periodAnalytics.stageCounts.prospecting },
                    { id: "lead-interessado", count: periodAnalytics.stageCounts["lead-interessado"] },
                    { id: "mql-agendado", count: periodAnalytics.stageCounts["mql-agendado"] },
                    { id: "mql-realizado", count: periodAnalytics.stageCounts["mql-realizado"] },
                    { id: "negotiation", count: periodAnalytics.stageCounts.negotiation },
                    { id: "won", count: periodAnalytics.stageCounts.won },
                    { id: "lost", count: periodAnalytics.stageCounts.lost },
                  ]
                : pipelineStages).map((stage) => (
                <PortalNarrativeCard
                  key={stage.id}
                  label={formatPipelineStageLabel(stage.id)}
                  title={formatNumber(stage.count)}
                  detail="Volume desta etapa dentro do período selecionado."
                />
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Conversões do mês por etapa</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Conversões calculadas com relação explícita entre origem e destino no período selecionado.
              </p>
            </div>
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <PortalMiniMetric
              label="Prospect -> Lead interessado"
              value={`${formatPercent(periodAnalytics?.firstInterestPct ?? firstInterestPct)}%`}
              detail={`${formatNumber(periodAnalytics?.stageCounts["lead-interessado"] ?? leadTouched)} leads interessados sobre ${formatNumber(periodAnalytics?.stageCounts.prospecting ?? prospectTouched)} prospects tocados no período.`}
            />
            <PortalMiniMetric
              label="Lead interessado -> MQL agendado"
              value={`${formatPercent(periodAnalytics?.scheduledPct ?? scheduledPct)}%`}
              detail={`${formatNumber(periodAnalytics?.stageCounts["mql-agendado"] ?? scheduledTouched)} MQLs agendados sobre ${formatNumber(periodAnalytics?.stageCounts["lead-interessado"] ?? leadTouched)} leads interessados no período.`}
            />
            <PortalMiniMetric
              label="MQL agendado -> Negociação"
              value={`${formatPercent(periodAnalytics?.negotiationPct ?? negotiationPct)}%`}
              detail={`${formatNumber(periodAnalytics?.stageCounts.negotiation ?? negotiationTouched)} negociações sobre ${formatNumber(periodAnalytics?.stageCounts["mql-agendado"] ?? scheduledTouched)} reuniões agendadas no período.`}
            />
            <PortalMiniMetric
              label="Negociação -> Cliente ganho"
              value={`${formatPercent(periodAnalytics?.wonPct ?? wonPct)}%`}
              detail={`${formatNumber(periodAnalytics?.stageCounts.won ?? wonTouched)} clientes ganhos sobre ${formatNumber(periodAnalytics?.stageCounts.negotiation ?? negotiationTouched)} negociações no período.`}
            />
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Conversão por canal no recorte</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Leitura do período selecionado por canal atribuído do registro, separando conversão comercial de telemetria operacional.
              </p>
            </div>
            <ChartColumn className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            <ChannelActivityCard
              title="E-mail"
              icon={Mail}
              sourceLabel="disparo"
              detail="Conversão comercial do recorte com apoio do campo de disparo registrado no Notion. A camada operacional do n8n segue como apoio de cadência."
              metrics={[
                {
                  label: "Prospects no canal",
                  value: formatNumber(periodAnalytics?.channels.email.touched ?? 0),
                },
                {
                  label: "1º interesse",
                  value: `${formatPercent(periodAnalytics?.channels.email.firstInterestPct ?? 0)}%`,
                },
                {
                  label: "MQL agendado",
                  value: formatNumber(periodAnalytics?.channels.email.mqlAgendado ?? 0),
                },
                {
                  label: "Disparos confirmados",
                  value: formatNumber(periodAnalytics?.channels.email.dispatches ?? 0),
                },
                {
                  label: "Respostas no recorte",
                  value: formatNumber(periodAnalytics?.channels.email.replies ?? 0),
                },
              ]}
              footer={`Apoio operacional: ${formatNumber(emailWorkflowExec7d)} cadências de e-mail em 7 dias no n8n. Hoje: ${formatNumber(emailWorkflowExecToday)} execuções. Waiting atual: ${emailWaitingMetric}.`}
            />

            <ChannelActivityCard
              title="WhatsApp"
              icon={MessageCircle}
              sourceLabel="disparo"
              detail="Conversão comercial do recorte com apoio do disparo registrado no Notion, cruzado com a telemetria viva da Evolution."
              metrics={[
                {
                  label: "Prospects no canal",
                  value: formatNumber(periodAnalytics?.channels.whatsapp.touched ?? 0),
                },
                {
                  label: "1º interesse",
                  value: `${formatPercent(periodAnalytics?.channels.whatsapp.firstInterestPct ?? 0)}%`,
                },
                {
                  label: "MQL agendado",
                  value: formatNumber(periodAnalytics?.channels.whatsapp.mqlAgendado ?? 0),
                },
                {
                  label: "Disparos confirmados",
                  value: formatNumber(periodAnalytics?.channels.whatsapp.dispatches ?? 0),
                },
                {
                  label: "Respostas no recorte",
                  value: formatNumber(periodAnalytics?.channels.whatsapp.replies ?? 0),
                },
              ]}
              footer={evolutionRow?.snapshotAt
                ? `Telemetria viva: ${formatNumber(evolutionOutbound7d)} envios em 7 dias. Nas últimas 24h: ${formatNumber(evolutionRow.outbound24h)} envios, ${formatNumber(evolutionRow.replies24h)} respostas, ${formatNumber(evolutionRow.errors24h)} erros.`
                : "Sem snapshot vivo da Evolution para esta operação."}
            />

            <ChannelActivityCard
              title="LinkedIn"
              icon={Workflow}
              sourceLabel="sinal"
              detail="Conversão comercial do recorte com apoio de sinal operacional de LinkedIn na base. Aqui a leitura usa status do canal e execução do n8n como evidência."
              metrics={[
                {
                  label: "Prospects no canal",
                  value: formatNumber(periodAnalytics?.channels.linkedin.touched ?? 0),
                },
                {
                  label: "1º interesse",
                  value: `${formatPercent(periodAnalytics?.channels.linkedin.firstInterestPct ?? 0)}%`,
                },
                {
                  label: "MQL agendado",
                  value: formatNumber(periodAnalytics?.channels.linkedin.mqlAgendado ?? 0),
                },
                {
                  label: "Sinais confirmados",
                  value: formatNumber(periodAnalytics?.channels.linkedin.dispatches ?? 0),
                },
                {
                  label: "Respostas no recorte",
                  value: formatNumber(periodAnalytics?.channels.linkedin.replies ?? 0),
                },
              ]}
              footer={`Apoio operacional: ${formatNumber(linkedinWorkflowExec7d)} cadências ligadas ao LinkedIn em 7 dias no n8n. Hoje: ${formatNumber(linkedinWorkflowExecToday)} execuções. Saúde atual: ${linkedinChannel ? statusMeta[linkedinChannel.health].label : "n/d"}.`}
            />
          </div>
          <div className="mt-3">
            <ChannelAttributionNote unattributedCount={periodAnalytics?.unattributedStageCount ?? 0} />
          </div>
        </section>

        <section className="grid gap-4 xl:grid-cols-2">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Funil do recorte</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Etapas atualizadas dentro do período selecionado.
                </p>
              </div>
              <ChartColumn className="h-3.5 w-3.5 text-primary" />
            </div>

            <ChartContainer
              config={{
                value: {
                  label: "Volume",
                  color: "hsl(var(--primary))",
                },
              }}
              className="h-[260px] w-full"
            >
              <BarChart data={chartStageData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="stage" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="value" radius={[10, 10, 0, 0]} fill="var(--color-value)" />
              </BarChart>
            </ChartContainer>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Ritmo diário do recorte</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Movimentação diária das principais viradas do funil no período.
                </p>
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>

            <ChartContainer
              config={{
                prospecting: { label: "Prospect", color: "#d4a373" },
                leadInteressado: { label: "Lead interessado", color: "#588157" },
                mqlAgendado: { label: "MQL agendado", color: "#457b9d" },
                won: { label: "Cliente ganho", color: "#1d3557" },
              }}
              className="h-[260px] w-full"
            >
              <LineChart data={chartTimelineData}>
                <CartesianGrid vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} />
                <ChartTooltip content={<ChartTooltipContent indicator="line" />} />
                <Line type="monotone" dataKey="prospecting" stroke="var(--color-prospecting)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="leadInteressado" stroke="var(--color-leadInteressado)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="mqlAgendado" stroke="var(--color-mqlAgendado)" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="won" stroke="var(--color-won)" strokeWidth={2} dot={false} />
              </LineChart>
            </ChartContainer>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-sm font-semibold text-display">Saúde técnica da operação</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Leitura executiva do runtime da operação, focada no que pode travar ou sustentar a
                execução agora.
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-[0.16em] h-5",
                statusMeta[portalOperation.health].color,
              )}
            >
              {statusMeta[portalOperation.health].label}
            </Badge>
          </div>

          <div className="grid gap-4">
            {runtimePortalCards.map((card) => (
              <LiveSourceCard
                key={card.id}
                card={{
                  id: card.id,
                  title: card.title,
                  health: card.health,
                  mode:
                    card.modeLabel === "Leitura viva"
                      ? "live"
                      : card.id === "n8n" || card.id === "evolution" || card.id === "api4com"
                        ? "operational"
                        : card.modeLabel === "Leitura governada"
                          ? "guarded"
                          : "snapshot",
                  headline:
                    card.id === "n8n"
                      ? "Execução dos workflows da operação."
                      : "Canal WhatsApp e entrega da operação.",
                  detail:
                    card.id === "n8n"
                      ? `${card.facts.find((fact) => fact.label === "Erro")?.value ?? "-"} erros e ${card.facts.find((fact) => fact.label === "Waiting")?.value ?? "-"} em waiting no recorte atual.`
                      : `${card.facts.find((fact) => fact.label === "Instância")?.value ?? "-"} com ${card.facts.find((fact) => fact.label === "Webhook")?.value?.toLowerCase() ?? "webhook monitorado"} e ${card.facts.find((fact) => fact.label === "Fila")?.value?.toLowerCase() ?? "fila monitorada"}.`,
                  lastSync: card.lastSync,
                  ctaLabel: "Última leitura",
                  ctaValue: card.id === "n8n" ? "Runtime de workflows" : "Canal WhatsApp",
                  facts: card.facts.slice(0, 4),
                  nextStep:
                    card.id === "n8n"
                      ? "Abrir workflow crítico se erro ou waiting subir."
                      : "Checar instância e webhook se o canal sair de saudável.",
                  availabilityLabel: undefined,
                }}
              />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function PortalKpi({
  label,
  value,
  detail,
  icon: Icon,
  tone = "info",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  tone?: "info" | "monitor" | "success";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      : tone === "monitor"
        ? "border-amber-500/20 bg-amber-500/5 text-amber-600"
        : "border-primary/20 bg-primary/5 text-primary";

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-display">{value}</div>
        </div>
        <div className={cn("rounded-xl border p-2.5", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function PortalMiniMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function PortalNarrativeCard({
  label,
  title,
  detail,
}: {
  label: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{title}</div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function LiveActionCard({
  title,
  detail,
  href,
  external,
  buttonLabel = "Abrir link",
}: {
  title: string;
  detail: string;
  href?: string;
  external?: boolean;
  buttonLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
      {href ? (
        <Button variant="outline" size="sm" className="mt-3 h-8 w-full gap-2" asChild>
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            {buttonLabel}
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function ChannelActivityCard({
  title,
  icon: Icon,
  sourceLabel,
  detail,
  metrics,
  footer,
}: {
  title: string;
  icon: typeof MessageCircle;
  sourceLabel: string;
  detail: string;
  metrics: { label: string; value: string }[];
  footer: string;
}) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
            <Icon className="h-4 w-4" />
          </div>
          <div className="text-sm font-medium text-foreground">{title}</div>
        </div>
        <Badge variant="outline" className="h-5 text-[10px] uppercase tracking-[0.16em]">
          {sourceLabel}
        </Badge>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {metrics.map((metric) => (
          <div key={`${title}-${metric.label}`} className="rounded-lg border border-border bg-surface px-3 py-2.5">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {metric.label}
            </div>
            <div className="mt-1 text-sm font-medium text-foreground">{metric.value}</div>
          </div>
        ))}
      </div>
      <div className="mt-3 text-[11px] leading-relaxed text-muted-foreground">{footer}</div>
    </div>
  );
}

function ChannelAttributionNote({
  unattributedCount,
}: {
  unattributedCount: number;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-3 py-3 text-[11px] leading-relaxed text-muted-foreground">
      Atribuição por canal prioriza o campo <span className="font-medium text-foreground">Canal</span> do registro.
      Quando ele não existe, o Portal usa fallback apenas se houver um único canal ativo no lead.
      {unattributedCount > 0
        ? ` Neste recorte, ${formatNumber(unattributedCount)} viradas ficaram fora da conversão por canal por falta de atribuição clara.`
        : " Neste recorte, não houve viradas excluídas por ambiguidade de canal."}
    </div>
  );
}

function ActivationRow({
  title,
  detail,
  icon: Icon,
  multiline = false,
}: {
  title: string;
  detail: string;
  icon: typeof Users;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{title}</div>
          <div className={cn("mt-1 text-sm text-foreground", multiline && "whitespace-pre-line")}>
            {detail}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveSourceCard({
  card,
}: {
  card: {
    id: "supabase" | "notion" | "trello" | "n8n" | "evolution" | "api4com";
    title: string;
    health: "healthy" | "monitor" | "risk" | "critical";
    mode: "live" | "operational" | "guarded" | "snapshot";
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
  const Icon =
    card.id === "supabase"
      ? Database
      : card.id === "notion"
        ? NotebookPen
        : card.id === "n8n"
          ? ServerCog
          : card.id === "evolution"
            ? MessageCircle
            : card.id === "api4com"
              ? PhoneCall
              : GitBranch;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm font-medium">{card.title}</div>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em] h-5">
              {card.mode === "live"
                ? "live"
                : card.mode === "operational"
                  ? "operational"
                  : card.mode === "guarded"
                    ? "guarded"
                    : "snapshot"}
            </Badge>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{card.headline}</p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
        {card.facts.map((fact) => (
          <div key={`${card.id}-${fact.label}`} className="rounded-xl border border-border bg-card px-3 py-3">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              {fact.label}
            </div>
            <div className="mt-1 break-words text-sm font-medium leading-relaxed text-foreground">
              {fact.value}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-3 grid gap-3 xl:grid-cols-3">
        <div className="rounded-xl border border-border bg-card px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Sinal principal
          </div>
          <div className="mt-1 text-[12px] leading-relaxed text-foreground">{card.detail}</div>
        </div>
        <div className="rounded-xl border border-border bg-card px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Ação agora
          </div>
          <div className="mt-1 text-[12px] leading-relaxed text-foreground">{card.nextStep}</div>
        </div>
        <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{card.ctaLabel}</div>
          <div className="mt-1 text-sm font-medium text-foreground">{card.ctaValue}</div>
          <div className="mt-2 break-words text-[11px] leading-relaxed text-muted-foreground">{card.lastSync}</div>
        </div>
      </div>

      {card.actionHref && card.actionLabel ? (
        <Button variant="outline" size="sm" className="mt-4 h-8 w-full gap-2" asChild>
          <a
            href={card.actionHref}
            target={card.actionExternal ? "_blank" : undefined}
            rel={card.actionExternal ? "noreferrer" : undefined}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            {card.actionLabel}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
