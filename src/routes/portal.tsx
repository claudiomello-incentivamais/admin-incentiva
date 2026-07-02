import { useEffect, useState } from "react";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  buildOperationActionPlan,
  buildOperationCadenceView,
  buildOperationCockpitFromOperation,
  buildOperationNotionView,
  buildOperationTrelloView,
  statusMeta,
} from "@/lib/admin-data";
import { applyPeriodToCockpit } from "@/lib/admin-period";
import { loadPortalPageBundleServerFn } from "@/lib/admin-portal-rpc";
import type { PortalIcpDimensionId } from "@/lib/admin-portal-analytics";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "Portal — Console Incentiva" }] }),
  validateSearch: z.object({
    operationId: z.string().optional(),
  }),
  loaderDeps: ({ search }) => ({ operationId: search.operationId }),
  loader: ({ deps }) => loadPortalPageBundleServerFn({ data: deps }),
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

function formatStageConversionValue(numerator: number, denominator: number) {
  if (denominator <= 0) return "n/d";
  return `${formatPercent(ratioPct(numerator, denominator))}%`;
}

function formatDispatchSourceLabel(value: "events" | "fallback" | "none") {
  if (value === "events") return "eventos";
  if (value === "fallback") return "fallback";
  return "sem trilha";
}

function formatDateTimeLabel(value: string | null | undefined) {
  if (!value) return "Leitura indisponível";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Leitura indisponível";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function trimDetail(value: string | null | undefined, fallback: string, max = 160) {
  const normalized = value?.replace(/\s+/g, " ").trim();
  if (!normalized) return fallback;
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1)}…`;
}

function normalizeWorkflowSearch(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function workflowMatchesOperationName(workflowName: string, operationName: string) {
  const workflowNormalized = normalizeWorkflowSearch(workflowName);
  const operationNormalized = normalizeWorkflowSearch(operationName);
  if (!workflowNormalized || !operationNormalized) return false;
  return workflowNormalized.includes(operationNormalized);
}

function isPortalScopedWorkflow(workflow: {
  workflowName: string;
  operationId: string;
  operationName: string;
}, operation: {
  id: string;
  name: string;
}) {
  return (
    workflow.operationId === operation.id ||
    workflow.operationName === operation.name ||
    ((!workflow.operationId || !workflow.operationName) &&
      workflowMatchesOperationName(workflow.workflowName, operation.name))
  );
}

function isCoreOperationWorkflowFamily(workflowFamily: string) {
  return [
    "lista_upload",
    "agente_conversa",
    "retorno_email",
    "sync_crm",
    "email_fup",
    "whatsapp_fup",
    "linkedin_conexao",
    "linkedin_fup",
    "reativacao",
    "inbound",
  ].includes(workflowFamily);
}

function summarizeWorkflowSet(
  workflows: Array<{
    active: boolean;
    execToday: number;
    exec7d: number;
    errorToday: number;
    error7d: number;
    waitingToday: number;
    waiting7d: number;
  }>,
) {
  return workflows.reduce(
    (summary, workflow) => {
      summary.total += 1;
      summary.active += workflow.active ? 1 : 0;
      summary.execToday += workflow.execToday;
      summary.exec7d += workflow.exec7d;
      summary.errorToday += workflow.errorToday;
      summary.error7d += workflow.error7d;
      summary.waitingToday += workflow.waitingToday;
      summary.waiting7d += workflow.waiting7d;
      return summary;
    },
    {
      total: 0,
      active: 0,
      execToday: 0,
      exec7d: 0,
      errorToday: 0,
      error7d: 0,
      waitingToday: 0,
      waiting7d: 0,
    },
  );
}

function formatPipelineStageLabel(stageId: string) {
  if (stageId === "prospecting") return "Prospect";
  if (stageId === "lead-interessado") return "Lead";
  if (stageId === "mql-agendado") return "MQL Agendado";
  if (stageId === "mql-realizado") return "MQL Realizado";
  if (stageId === "negotiation") return "Negociação";
  if (stageId === "won") return "Cliente Ganho";
  if (stageId === "lost") return "Perdido";
  return stageId;
}

function formatIcpDimensionLabel(value: PortalIcpDimensionId) {
  if (value === "segment_cluster") return "Setor";
  if (value === "company_size_cluster") return "Porte";
  return "Cargo";
}

function PortalPage() {
  const search = Route.useSearch();
  const { session } = useAdminAuth();
  const loaderData = Route.useLoaderData();
  const [bundleData, setBundleData] = useState(loaderData);
  const [isBundleRefreshing, setIsBundleRefreshing] = useState(false);
  const { selectedOperationId, selectedPeriod } = useAdminFilters();

  useEffect(() => {
    setBundleData(loaderData);
  }, [loaderData]);

  const { dashboard, evolution, n8n, analytics, focusOperationId } = bundleData;
  const [selectedIcpDimension, setSelectedIcpDimension] = useState<"all" | PortalIcpDimensionId>("all");
  const [selectedIcpValue, setSelectedIcpValue] = useState("all");

  if (!session || !dashboard || !evolution || !n8n || !analytics) {
    return null;
  }
  const requestedOperationId = search.operationId;
  const effectiveOperationId =
    selectedOperationId !== "all" ? selectedOperationId : requestedOperationId;

  const portalOperation =
    ((effectiveOperationId
      ? dashboard.operations.find((operation) => operation.id === effectiveOperationId)
      : null) ??
      (selectedOperationId === "all"
      ? dashboard.operations.find((operation) => operation.health === "healthy") ??
        dashboard.operations.find((operation) => operation.health === "monitor") ??
        dashboard.operations[0]
      : dashboard.operations.find((operation) => operation.id === selectedOperationId))) ?? null;

  useEffect(() => {
    if (!portalOperation?.id) return;
    if (focusOperationId === portalOperation.id) return;

    let cancelled = false;
    setIsBundleRefreshing(true);

    loadPortalPageBundleServerFn({
      data: { operationId: portalOperation.id },
    })
      .then((nextBundle) => {
        if (cancelled) return;
        setBundleData(nextBundle);
      })
      .finally(() => {
        if (cancelled) return;
        setIsBundleRefreshing(false);
      });

    return () => {
      cancelled = true;
    };
  }, [focusOperationId, portalOperation?.id]);

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

  const currentCockpit = applyPeriodToCockpit(
    buildOperationCockpitFromOperation(portalOperation),
    selectedPeriod,
  );
  const baseMonitoradaValue = portalOperation.notionRecords ?? currentCockpit.summary.supabaseRecords;
  const cockpit = currentCockpit;
  const cadenceView = buildOperationCadenceView(portalOperation, cockpit, dashboard.source);
  const actionPlan = buildOperationActionPlan(portalOperation);
  const notionView = buildOperationNotionView(portalOperation, cockpit, dashboard.source);
  const trelloView = buildOperationTrelloView(portalOperation, cockpit);
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
  const portalAnalyticsOperation =
    analytics.operations.find((operation) => operation.operationId === portalOperation.id) ?? null;
  const selectedIcpBreakdown =
    selectedIcpDimension !== "all"
      ? portalAnalyticsOperation?.breakdowns[selectedIcpDimension] ?? null
      : null;
  const icpBucketOptions = selectedIcpBreakdown?.buckets ?? [];
  const selectedIcpBucket =
    selectedIcpBreakdown && selectedIcpValue !== "all"
      ? selectedIcpBreakdown.buckets.find((bucket) => bucket.value === selectedIcpValue) ?? null
      : null;
  const periodAnalytics =
    selectedIcpBucket?.periods[selectedPeriod] ??
    portalAnalyticsOperation?.periods[selectedPeriod] ??
    null;
  const periodScopeLabel = selectedIcpBucket
    ? `${selectedIcpBreakdown?.label}: ${selectedIcpBucket.label}`
      : selectedIcpBreakdown
        ? `${selectedIcpBreakdown.label}: todos`
        : "Operação inteira";
  const evolutionRow =
    evolution.operations.find((row) => row.operationId === portalOperation.id) ?? null;
  const evolutionInstances = evolution.instances.filter((row) => row.operationId === portalOperation.id);
  const evolutionOutbound7d = evolutionInstances.reduce((sum, row) => sum + row.outbound7d, 0);
  const linkedinChannel = currentCockpit.channels.find((channel) => channel.id === "linkedin") ?? null;
  const n8nOperation = n8n.operations.find((row) => row.operationId === portalOperation.id) ?? null;
  const n8nWorkflows = n8n.workflows.filter((row) => isPortalScopedWorkflow(row, portalOperation));
  const n8nCoreWorkflows = n8nWorkflows.filter((row) => isCoreOperationWorkflowFamily(row.workflowFamily));
  const n8nSupportWorkflows = n8nWorkflows.filter((row) => !isCoreOperationWorkflowFamily(row.workflowFamily));
  const portalScopedN8nSummary = summarizeWorkflowSet(n8nWorkflows);
  const portalCoreN8nSummary = summarizeWorkflowSet(n8nCoreWorkflows);
  const portalSupportN8nSummary = summarizeWorkflowSet(n8nSupportWorkflows);
  const topN8nWorkflow =
    [...(n8nCoreWorkflows.length > 0 ? n8nCoreWorkflows : n8nWorkflows)].sort(
      (a, b) =>
        b.errorToday - a.errorToday ||
        b.waitingToday - a.waitingToday ||
        b.error7d - a.error7d ||
        b.waiting7d - a.waiting7d ||
        b.execToday - a.execToday ||
        b.exec7d - a.exec7d,
    )[0] ?? null;
  const inactiveN8nWorkflowCount = Math.max(0, portalScopedN8nSummary.total - portalScopedN8nSummary.active);
  const topEvolutionInstance =
    [...evolutionInstances].sort((a, b) => {
      const severityWeight = (severity: string) =>
        severity === "critical" ? 3 : severity === "attention" ? 2 : severity === "insufficient" ? 1 : 0;
      return (
        severityWeight(b.severity) - severityWeight(a.severity) ||
        b.errors24h - a.errors24h ||
        b.stalled24h - a.stalled24h ||
        b.outbound24h - a.outbound24h
      );
    })[0] ?? null;
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
  const reactivationWorkflows = n8nWorkflows.filter((workflow) => workflow.workflowFamily === "reativacao");
  const socialSellingWorkflows = n8nWorkflows.filter((workflow) => workflow.workflowFamily === "linkedin_social");
  const reactivationSummary = summarizeWorkflowSet(reactivationWorkflows);
  const socialSellingSummary = summarizeWorkflowSet(socialSellingWorkflows);
  const topReactivationWorkflow =
    [...reactivationWorkflows].sort(
      (a, b) =>
        b.errorToday - a.errorToday ||
        b.waitingToday - a.waitingToday ||
        b.error7d - a.error7d ||
        b.waiting7d - a.waiting7d ||
        b.execToday - a.execToday ||
        b.exec7d - a.exec7d,
    )[0] ?? null;
  const topSocialSellingWorkflow =
    [...socialSellingWorkflows].sort(
      (a, b) =>
        b.errorToday - a.errorToday ||
        b.waitingToday - a.waitingToday ||
        b.error7d - a.error7d ||
        b.waiting7d - a.waiting7d ||
        b.execToday - a.execToday ||
        b.exec7d - a.exec7d,
    )[0] ?? null;
  const chartStageData = periodAnalytics
    ? [
        { stage: "Prospect", value: periodAnalytics.stageCounts.prospecting },
        { stage: "Lead", value: periodAnalytics.stageCounts["lead-interessado"] },
        { stage: "MQL Ag.", value: periodAnalytics.stageCounts["mql-agendado"] },
        { stage: "Negociação", value: periodAnalytics.stageCounts.negotiation },
        { stage: "Ganhos", value: periodAnalytics.stageCounts.won },
      ]
    : [];
  const chartTimelineData = periodAnalytics?.timeline ?? [];
  const hasPeriodAnalytics = Boolean(periodAnalytics);
  const hasStageChartData = chartStageData.some((item) => item.value > 0);
  const hasTimelineChartData = chartTimelineData.some((item) =>
    item.prospecting > 0 || item.leadInteressado > 0 || item.mqlAgendado > 0 || item.won > 0,
  );
  const firstInterestPctDisplay = periodAnalytics?.firstInterestPct ?? firstInterestPct;
  const wonTouchedDisplay = periodAnalytics?.stageCounts.won ?? wonTouched;

  useEffect(() => {
    setSelectedIcpValue("all");
  }, [selectedIcpDimension, portalOperation.id]);

  useEffect(() => {
    if (selectedIcpDimension === "all") return;
    if (selectedIcpValue === "all") return;
    const bucketExists = icpBucketOptions.some((bucket) => bucket.value === selectedIcpValue);
    if (!bucketExists) {
      setSelectedIcpValue("all");
    }
  }, [icpBucketOptions, selectedIcpDimension, selectedIcpValue]);

  const n8nLiveCard = {
    id: "n8n" as const,
    title: "n8n VPS",
    health:
      n8n.source !== "live"
        ? ("monitor" as const)
        : n8nOperation && (n8nOperation.errorToday > 0 || n8nOperation.waitingToday > 0)
          ? ("risk" as const)
          : n8nOperation && (n8nOperation.error7d > 0 || n8nOperation.waiting7d > 0)
            ? ("monitor" as const)
            : ("healthy" as const),
    mode: (n8n.source === "live" ? "live" : "snapshot") as "live" | "snapshot",
    headline: "Telemetria técnica própria do n8n, em janela operacional de hoje e 7 dias.",
    detail:
      n8n.source !== "live" || !n8nOperation
        ? "A leitura viva do n8n não carregou nesta operação."
        : topN8nWorkflow
          ? `A fonte governada marca ${formatNumber(n8nOperation.activeWorkflowCount)}/${formatNumber(n8nOperation.workflowCount)} workflow(s) ativos no total desta operação. Dentro do Portal, a régua operacional destaca ${formatNumber(portalCoreN8nSummary.active)}/${formatNumber(portalCoreN8nSummary.total)} workflow(s) core e ${formatNumber(portalSupportN8nSummary.active)}/${formatNumber(portalSupportN8nSummary.total)} de apoio. Erros hoje: ${formatNumber(portalScopedN8nSummary.errorToday)}. Waiting hoje: ${formatNumber(portalScopedN8nSummary.waitingToday)}. Workflow foco: ${topN8nWorkflow.workflowName}. Execuções ficam como apoio de leitura, não como protagonista. ${trimDetail(topN8nWorkflow.lastErrorMessage, topN8nWorkflow.lastStatus ? `Último status: ${topN8nWorkflow.lastStatus}.` : "Sem mensagem de erro consolidada.")}`
          : `A fonte governada marca ${formatNumber(n8nOperation.activeWorkflowCount)}/${formatNumber(n8nOperation.workflowCount)} workflow(s) ativos no total desta operação. O Portal separa ${formatNumber(portalCoreN8nSummary.active)}/${formatNumber(portalCoreN8nSummary.total)} workflow(s) core e ${formatNumber(portalSupportN8nSummary.active)}/${formatNumber(portalSupportN8nSummary.total)} de apoio. Erros hoje: ${formatNumber(portalScopedN8nSummary.errorToday)}. Waiting hoje: ${formatNumber(portalScopedN8nSummary.waitingToday)}.`,
    lastSync:
      n8n.source === "live"
        ? n8n.snapshotLabel
        : "A seção técnica do n8n está em fallback e não deve ser usada como verdade operacional.",
    ctaLabel: "Janela técnica",
    ctaValue: "Hoje + 7 dias",
    facts: [
      {
        label: "Core ativos",
        value: n8nOperation
          ? `${formatNumber(portalCoreN8nSummary.active)}/${formatNumber(portalCoreN8nSummary.total)}`
          : "Sem leitura",
      },
      {
        label: "Apoio ativos",
        value: n8nOperation
          ? `${formatNumber(portalSupportN8nSummary.active)}/${formatNumber(portalSupportN8nSummary.total)}`
          : "Sem leitura",
      },
      {
        label: "Waiting hoje",
        value: n8nOperation ? formatNumber(portalScopedN8nSummary.waitingToday) : "Sem leitura",
      },
      {
        label: "Erros hoje",
        value: n8nOperation ? formatNumber(portalScopedN8nSummary.errorToday) : "Sem leitura",
      },
    ],
    nextStep:
      n8n.source !== "live" || !n8nOperation
        ? "Restabelecer a telemetria viva do n8n antes de usar este bloco para decisão."
        : topN8nWorkflow && (topN8nWorkflow.errorToday > 0 || topN8nWorkflow.waitingToday > 0 || topN8nWorkflow.error7d > 0)
          ? `Abrir ${topN8nWorkflow.workflowName} e tratar ${topN8nWorkflow.errorToday > 0 ? "erro" : "waiting"} com base na última mensagem registrada.`
          : `Sem erro material agora; acompanhar ${formatNumber(inactiveN8nWorkflowCount)} workflow(s) inativo(s) e revisar se o total ${formatNumber(n8nOperation.workflowCount)} continua coerente com a régua core desta operação.`,
  };
  const evolutionLiveCard = {
    id: "evolution" as const,
    title: "Evolution API",
    health:
      evolution.source !== "live"
        ? ("monitor" as const)
        : evolutionRow && evolutionRow.criticalInstances > 0
          ? ("risk" as const)
          : evolutionRow && (
              evolutionRow.missingInstanceCount > 0 ||
              evolutionRow.attentionInstances > 0 ||
              evolutionRow.errors24h > 0 ||
              evolutionRow.stalled24h > 0
            )
            ? ("monitor" as const)
            : ("healthy" as const),
    mode: (evolution.source === "live" ? "live" : "snapshot") as "live" | "snapshot",
    headline: "Telemetria técnica própria da Evolution, em janela operacional de 24h e 7 dias.",
    detail:
      evolution.source !== "live" || !evolutionRow
        ? "A leitura viva da Evolution não carregou nesta operação."
        : topEvolutionInstance
          ? `${topEvolutionInstance.instanceName} está em ${topEvolutionInstance.severity}. Materialização: ${formatNumber(evolutionRow.materializedInstanceCount)}/${formatNumber(evolutionRow.expectedInstanceCount)} instâncias. 24h: ${formatNumber(topEvolutionInstance.outbound24h)} envios, ${formatNumber(topEvolutionInstance.inbound24h)} inbound, ${formatNumber(topEvolutionInstance.replyContacts24h)} contatos com resposta, ${formatNumber(topEvolutionInstance.errors24h)} erro(s) e ${formatNumber(topEvolutionInstance.stalled24h)} item(ns) parados. ${trimDetail(topEvolutionInstance.reason, "Sem motivo consolidado.")}${topEvolutionInstance.spikeReason ? ` Spike: ${trimDetail(topEvolutionInstance.spikeReason, "")}` : ""}`
          : `Materialização atual: ${formatNumber(evolutionRow.materializedInstanceCount)}/${formatNumber(evolutionRow.expectedInstanceCount)} instâncias. Últimas 24h com ${formatNumber(evolutionRow.outbound24h)} envios, ${formatNumber(evolutionRow.replies24h)} respostas e ${formatNumber(evolutionRow.errors24h)} erro(s).`,
    lastSync:
      evolution.source === "live"
        ? evolution.snapshotLabel
        : "A seção técnica da Evolution está em fallback e não deve ser usada como verdade operacional.",
    ctaLabel: "Janela técnica",
    ctaValue: "24h + 7 dias",
    facts: [
      {
        label: "Materializadas",
        value: evolutionRow
          ? `${formatNumber(evolutionRow.materializedInstanceCount)}/${formatNumber(evolutionRow.expectedInstanceCount)}`
          : "Sem leitura",
      },
      {
        label: "Envios 24h",
        value: evolutionRow ? formatNumber(evolutionRow.outbound24h) : "Sem leitura",
      },
      {
        label: "Inbound 24h",
        value: topEvolutionInstance ? formatNumber(topEvolutionInstance.inbound24h) : "Sem leitura",
      },
      {
        label: "Instância foco",
        value: topEvolutionInstance?.instanceName ?? "Sem instância foco",
      },
    ],
    nextStep:
      evolution.source !== "live" || !evolutionRow
        ? "Restabelecer a telemetria viva da Evolution antes de usar este bloco para decisão."
        : evolutionRow.missingInstanceCount > 0
          ? `Materializar ${formatNumber(evolutionRow.missingInstanceCount)} instância(s) esperada(s) no card antes de tratar esta leitura como fotografia completa da operação.`
        : topEvolutionInstance && topEvolutionInstance.severity !== "healthy"
          ? `Checar ${topEvolutionInstance.instanceName}, webhook e motivo '${topEvolutionInstance.reason}'.`
          : "Sem pressão técnica material agora; acompanhar entrega, reply e erros pela janela técnica.",
  };
  const runtimePortalCards = [n8nLiveCard, evolutionLiveCard];
  const primaryOwner =
    portalOperation.baseCoverage < 60
      ? "Bruna + Sales Ops"
      : portalOperation.dataReconciliation < 85
        ? "Claw + Sales Ops"
        : "Sales Ops";
  const primaryRoute =
    portalOperation.baseCoverage < 60
      ? "Acionar reposição de base e abrir card de lista/ICP."
      : portalOperation.dataReconciliation < 85
        ? "Abrir saneamento de dado antes de cobrar leitura comercial."
        : "Abrir ação comercial em cima do gargalo dominante do funil.";
  const executionNote =
    "O Portal mostra a rota principal de trabalho. O disparo automático para Discord e Trello ainda não está ligado daqui, então esta tela não deveria te fazer escolher entre três ações diferentes.";

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
              {isBundleRefreshing ? " Atualizando recorte da operação..." : ""}
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
              value={formatNumber(baseMonitoradaValue)}
              detail="Registros visíveis e reconciliados na última leitura útil desta operação."
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
              label="Virada para Lead"
              value={`${formatPercent(firstInterestPctDisplay)}%`}
              detail={
                hasPeriodAnalytics
                  ? "Leads sobre prospects tocados no recorte selecionado."
                  : "Leads sobre prospects tocados na melhor leitura disponível."
              }
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
              label={hasPeriodAnalytics ? "Ganhos no recorte" : "Ganhos na leitura"}
              title={formatNumber(wonTouchedDisplay)}
              detail="Clientes ganhos refletidos na operação conforme a leitura disponível na tela."
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
              <h2 className="text-sm font-semibold text-display">Como isso vira trabalho real</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Cadência da leitura e rota única para transformar prioridade em trabalho real.
              </p>
            </div>
            <Target className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-3">
            <PortalNarrativeCard
              label="Atualização técnica"
              title="n8n + Evolution até 5 min"
              detail="A saúde técnica desta tela é sincronizada para o Supabase em janelas de até 5 minutos antes de refletir no Portal."
            />
            <PortalNarrativeCard
              label="Atualização comercial"
              title="Recalcula na carga"
              detail="Base, conversão e prioridade são recalculadas quando o Portal abre, usando o estado atual disponível em Supabase, Notion e views de governança."
            />
            <PortalNarrativeCard
              label="Responsável agora"
              title={primaryOwner}
              detail="Dono sugerido da frente principal desta conta no estado atual da operação."
            />
          </div>

          <div className="mt-4 rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-primary">Próxima ação operacional</div>
            <div className="mt-1 text-base font-semibold text-display">{primaryRoute}</div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              {actionPlan.headline} A ideia correta aqui é existir uma rota principal de execução,
              não te obrigar a copiar uma mensagem para um lugar, um card para outro e um terceiro texto para o admin.
            </p>
          </div>

          <div className="mt-3 rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-[11px] leading-relaxed text-muted-foreground">
            {executionNote}
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
                Recorte do pipeline conforme a operação e o período selecionados.
              </p>
            </div>
            <Activity className="h-3.5 w-3.5 text-primary" />
          </div>

          {hasPeriodAnalytics ? (
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="text-sm font-medium text-display">Base e movimento comercial do recorte</div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                O bloco abaixo considera a movimentação real do período filtrado para a operação atual, com recorte opcional de ICP para leitura de disparo e conversão.
              </p>
              <div className="mt-3 text-[11px] text-muted-foreground">{cadenceView.syncLabel}</div>

              <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-background/70 p-4 lg:grid-cols-[220px,220px,1fr]">
                <div className="space-y-2">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Recorte ICP
                  </div>
                  <Select
                    value={selectedIcpDimension}
                    onValueChange={(value) =>
                      setSelectedIcpDimension(value as "all" | PortalIcpDimensionId)
                    }
                  >
                    <SelectTrigger className="h-10 bg-surface border-border text-sm">
                      <SelectValue placeholder="Escolher recorte" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Operação inteira</SelectItem>
                      <SelectItem value="segment_cluster">Setor</SelectItem>
                      <SelectItem value="company_size_cluster">Porte</SelectItem>
                      <SelectItem value="cargo_cluster">Cargo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                    Valor do recorte
                  </div>
                  <Select
                    value={selectedIcpValue}
                    onValueChange={setSelectedIcpValue}
                    disabled={selectedIcpDimension === "all" || icpBucketOptions.length === 0}
                  >
                    <SelectTrigger className="h-10 bg-surface border-border text-sm">
                      <SelectValue
                        placeholder={
                          selectedIcpDimension === "all" ? "Sem recorte adicional" : "Escolher valor"
                        }
                      />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">
                        {selectedIcpDimension === "all"
                          ? "Sem recorte adicional"
                          : `Todos os ${formatIcpDimensionLabel(selectedIcpDimension).toLowerCase()}s`}
                      </SelectItem>
                      {icpBucketOptions.map((bucket) => (
                        <SelectItem key={bucket.value} value={bucket.value}>
                          {bucket.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-[12px] leading-relaxed text-muted-foreground">
                  <span className="font-medium text-foreground">Escopo atual:</span> {periodScopeLabel}. O
                  recorte abaixo reaproveita a mesma leitura de período para comparar `disparos`,
                  `lead`, `MQL`, `negociação` e `cliente ganho` por setor, porte ou cargo.
                  {selectedIcpDimension !== "all" && icpBucketOptions.length === 0
                    ? ` Nesta carga, ${formatIcpDimensionLabel(selectedIcpDimension).toLowerCase()} ainda não veio materializado na fonte viva desta operação.`
                    : ""}
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <PortalMiniMetric
                  label="Não iniciados"
                  value={currentCockpit.baseMetrics.find((metric) => metric.id === "unstarted")?.value?.toLocaleString("pt-BR") ?? "0"}
                  detail="Fotografia atual da base, separada da movimentação do recorte."
                />
                <PortalMiniMetric
                  label="Cobertura em dias"
                  value={currentCockpit.baseMetrics.find((metric) => metric.id === "coverage-days")?.value?.toLocaleString("pt-BR") ?? "0"}
                  detail="Fotografia atual da cobertura, separada da movimentação do recorte."
                />
                <PortalMiniMetric
                  label="Prospects tocados"
                  value={formatNumber(periodAnalytics.stageCounts.prospecting)}
                  detail="Prospects que passaram por atualização útil no período filtrado."
                />
                <PortalMiniMetric
                  label="Ativos no recorte"
                  value={formatNumber(periodAnalytics.touched)}
                  detail="Total de movimentos de etapa refletidos no período filtrado."
                />
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-7">
                {[
                  { id: "prospecting", count: periodAnalytics.stageCounts.prospecting },
                  { id: "lead-interessado", count: periodAnalytics.stageCounts["lead-interessado"] },
                  { id: "mql-agendado", count: periodAnalytics.stageCounts["mql-agendado"] },
                  { id: "mql-realizado", count: periodAnalytics.stageCounts["mql-realizado"] },
                  { id: "negotiation", count: periodAnalytics.stageCounts.negotiation },
                  { id: "won", count: periodAnalytics.stageCounts.won },
                  { id: "lost", count: periodAnalytics.stageCounts.lost },
                ].map((stage) => (
                  <PortalNarrativeCard
                    key={stage.id}
                    label={formatPipelineStageLabel(stage.id)}
                    title={formatNumber(stage.count)}
                    detail="Volume desta etapa dentro do período selecionado."
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-4 text-[12px] leading-relaxed text-muted-foreground">
              A leitura histórica por período desta operação ainda não ficou disponível nesta carga.
              Para não congelar número errado, o Portal não está mais reaproveitando métricas fixas aqui.
            </div>
          )}
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Conversões do recorte por etapa</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Conversões calculadas com relação explícita entre origem e destino no período selecionado.
              </p>
            </div>
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          </div>

          {hasPeriodAnalytics ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <PortalMiniMetric
                label="Prospect -> Lead"
                value={formatStageConversionValue(
                  periodAnalytics.stageCounts["lead-interessado"],
                  periodAnalytics.stageCounts.prospecting,
                )}
                detail={`${formatNumber(periodAnalytics.stageCounts["lead-interessado"])} leads sobre ${formatNumber(periodAnalytics.stageCounts.prospecting)} prospects tocados no período.`}
              />
              <PortalMiniMetric
                label="Lead -> MQL agendado"
                value={formatStageConversionValue(
                  periodAnalytics.stageCounts["mql-agendado"],
                  periodAnalytics.stageCounts["lead-interessado"],
                )}
                detail={`${formatNumber(periodAnalytics.stageCounts["mql-agendado"])} MQLs agendados sobre ${formatNumber(periodAnalytics.stageCounts["lead-interessado"])} leads no período.`}
              />
              <PortalMiniMetric
                label="MQL agendado -> Negociação"
                value={formatStageConversionValue(
                  periodAnalytics.stageCounts.negotiation,
                  periodAnalytics.stageCounts["mql-agendado"],
                )}
                detail={`${formatNumber(periodAnalytics.stageCounts.negotiation)} negociações sobre ${formatNumber(periodAnalytics.stageCounts["mql-agendado"])} reuniões agendadas no período.`}
              />
              <PortalMiniMetric
                label="Negociação -> Cliente ganho"
                value={formatStageConversionValue(
                  periodAnalytics.stageCounts.won,
                  periodAnalytics.stageCounts.negotiation,
                )}
                detail={`${formatNumber(periodAnalytics.stageCounts.won)} clientes ganhos sobre ${formatNumber(periodAnalytics.stageCounts.negotiation)} negociações no período.`}
              />
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-4 text-[12px] leading-relaxed text-muted-foreground">
              As conversões por etapa só aparecem aqui quando a leitura por período estiver disponível para a operação selecionada.
            </div>
          )}
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

          {hasPeriodAnalytics ? (
            <>
              <div className="grid gap-3 xl:grid-cols-3">
                <ChannelActivityCard
                  title="E-mail"
                  icon={Mail}
                  sourceLabel={formatDispatchSourceLabel(periodAnalytics.channels.email.dispatchSource)}
                  detail="Conversão comercial do recorte priorizando a trilha append-only de eventos de e-mail. O Notion fica apenas como fallback de contingência para estado operacional."
                  metrics={[
                    {
                      label: "Prospects no canal",
                      value: formatNumber(periodAnalytics.channels.email.touched),
                    },
                    {
                      label: "Virada para Lead",
                      value: `${formatPercent(periodAnalytics.channels.email.firstInterestPct)}%`,
                    },
                    {
                      label: "MQL agendado",
                      value: formatNumber(periodAnalytics.channels.email.mqlAgendado),
                    },
                    {
                      label: "Disparos confirmados",
                      value: formatNumber(periodAnalytics.channels.email.dispatches),
                    },
                    {
                      label: "Respostas no recorte",
                      value: formatNumber(periodAnalytics.channels.email.replies),
                    },
                  ]}
                  footer={`Apoio operacional: ${formatNumber(emailWorkflowExec7d)} cadências de e-mail em 7 dias no n8n. Hoje: ${formatNumber(emailWorkflowExecToday)} execuções. Waiting atual: ${emailWaitingMetric}.`}
                />

                <ChannelActivityCard
                  title="WhatsApp"
                  icon={MessageCircle}
                  sourceLabel={formatDispatchSourceLabel(periodAnalytics.channels.whatsapp.dispatchSource)}
                  detail="Conversão comercial do recorte priorizando a trilha append-only de WhatsApp, cruzada com a telemetria viva da Evolution. Status atual do lead não serve mais como evidência histórica de disparo."
                  metrics={[
                    {
                      label: "Prospects no canal",
                      value: formatNumber(periodAnalytics.channels.whatsapp.touched),
                    },
                    {
                      label: "Virada para Lead",
                      value: `${formatPercent(periodAnalytics.channels.whatsapp.firstInterestPct)}%`,
                    },
                    {
                      label: "MQL agendado",
                      value: formatNumber(periodAnalytics.channels.whatsapp.mqlAgendado),
                    },
                    {
                      label: "Disparos confirmados",
                      value: formatNumber(periodAnalytics.channels.whatsapp.dispatches),
                    },
                    {
                      label: "Respostas no recorte",
                      value: formatNumber(periodAnalytics.channels.whatsapp.replies),
                    },
                  ]}
                  footer={evolutionRow?.snapshotAt
                    ? `Telemetria viva: ${formatNumber(evolutionOutbound7d)} envios em 7 dias. Nas últimas 24h: ${formatNumber(evolutionRow.outbound24h)} envios, ${formatNumber(evolutionRow.replies24h)} respostas, ${formatNumber(evolutionRow.errors24h)} erros.`
                    : "Sem snapshot vivo da Evolution para esta operação."}
                />

                <ChannelActivityCard
                  title="LinkedIn"
                  icon={Workflow}
                  sourceLabel={formatDispatchSourceLabel(periodAnalytics.channels.linkedin.dispatchSource)}
                  detail="Conversão comercial do recorte priorizando a trilha append-only de LinkedIn quando materializada. Status do canal e execução do n8n ficam apenas como fallback temporário."
                  metrics={[
                    {
                      label: "Prospects no canal",
                      value: formatNumber(periodAnalytics.channels.linkedin.touched),
                    },
                    {
                      label: "Virada para Lead",
                      value: `${formatPercent(periodAnalytics.channels.linkedin.firstInterestPct)}%`,
                    },
                    {
                      label: "MQL agendado",
                      value: formatNumber(periodAnalytics.channels.linkedin.mqlAgendado),
                    },
                    {
                      label: "Sinais confirmados",
                      value: formatNumber(periodAnalytics.channels.linkedin.dispatches),
                    },
                    {
                      label: "Respostas no recorte",
                      value: formatNumber(periodAnalytics.channels.linkedin.replies),
                    },
                  ]}
                  footer={`Apoio operacional: ${formatNumber(linkedinWorkflowExec7d)} cadências ligadas ao LinkedIn em 7 dias no n8n. Hoje: ${formatNumber(linkedinWorkflowExecToday)} execuções. Saúde atual: ${linkedinChannel ? statusMeta[linkedinChannel.health].label : "n/d"}.`}
                />
              </div>
              <div className="mt-3">
                <ChannelAttributionNote
                  unattributedCount={periodAnalytics.unattributedStageCount}
                  fallbackCount={periodAnalytics.attributionFallbackCount}
                />
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-dashed border-border bg-surface p-4 text-[12px] leading-relaxed text-muted-foreground">
              A conversão por canal do recorte não vai mais zerar por fallback. Se a leitura do período não vier,
              o Portal assume isso explicitamente até a carga responder com dado real.
            </div>
          )}
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

            {hasPeriodAnalytics ? (
              hasStageChartData ? (
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
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-4 text-[12px] leading-relaxed text-muted-foreground">
                  Não houve movimentação de etapa suficiente neste recorte para desenhar o funil.
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-4 text-[12px] leading-relaxed text-muted-foreground">
                O funil do recorte aparece aqui quando a leitura histórica por período estiver disponível.
              </div>
            )}
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

            {hasPeriodAnalytics ? (
              hasTimelineChartData ? (
                <ChartContainer
                  config={{
                    prospecting: { label: "Prospect", color: "#d4a373" },
                    leadInteressado: { label: "Lead", color: "#588157" },
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
              ) : (
                <div className="rounded-2xl border border-dashed border-border bg-surface p-4 text-[12px] leading-relaxed text-muted-foreground">
                  Ainda não houve ritmo diário suficiente neste recorte para desenhar a série histórica.
                </div>
              )
            ) : (
              <div className="rounded-2xl border border-dashed border-border bg-surface p-4 text-[12px] leading-relaxed text-muted-foreground">
                O ritmo diário do recorte aparece aqui quando a leitura histórica por período estiver disponível.
              </div>
            )}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Reativação e Social Selling</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Frentes modulares de expansão do Portal, separando o que já é leitura operacional do que ainda depende de maturidade da fonte.
              </p>
            </div>
            <Workflow className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Reativação / retomada</div>
                    <div className="text-[11px] text-muted-foreground">
                      Módulo de prospecção para base já trabalhada ou parada.
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="h-5 text-[10px] uppercase tracking-[0.16em]">
                  V1
                </Badge>
              </div>

              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                Esta frente já entra no Portal com leitura técnica própria. A conversão comercial por
                ICP entra na próxima camada, quando a trilha append-only também marcar a origem da ação
                como reativação em vez de misturar tudo no outbound principal.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <PortalMiniMetric
                  label="Workflows ativos"
                  value={`${formatNumber(reactivationSummary.active)}/${formatNumber(reactivationSummary.total)}`}
                  detail="Família de reativação materializada hoje na telemetria governada do n8n."
                />
                <PortalMiniMetric
                  label="Execuções 7d"
                  value={formatNumber(reactivationSummary.exec7d)}
                  detail="Volume técnico dos workflows de retomada nos últimos 7 dias."
                />
                <PortalMiniMetric
                  label="Erros hoje"
                  value={formatNumber(reactivationSummary.errorToday)}
                  detail="Falhas técnicas atuais desta frente dentro do n8n."
                />
                <PortalMiniMetric
                  label="Waiting hoje"
                  value={formatNumber(reactivationSummary.waitingToday)}
                  detail="Itens aguardando processamento na família de reativação."
                />
              </div>

              <div className="mt-3 rounded-xl border border-dashed border-border bg-surface px-3 py-3 text-[11px] leading-relaxed text-muted-foreground">
                {reactivationSummary.total > 0
                  ? topReactivationWorkflow
                    ? `Workflow foco agora: ${topReactivationWorkflow.workflowName}. Se a gente quiser responder “qual setor, porte ou cargo converte mais na reativação”, o próximo passo estrutural é fazer a trilha de disparos carregar a origem da ação.`
                    : "A família de reativação já aparece no Portal; o próximo ganho vem da marcação semântica da origem do disparo."
                  : "Ainda não existe workflow de reativação materializado nesta operação. Quando a frente subir, este bloco já nasce no Portal sem precisar redesenhar a tela."}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-card p-4">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
                    <NotebookPen className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="text-sm font-medium text-foreground">Social Selling / conteúdo</div>
                    <div className="text-[11px] text-muted-foreground">
                      Camada progressiva para calendário, produção e ponte conteúdo {">"} outreach.
                    </div>
                  </div>
                </div>
                <Badge variant="outline" className="h-5 text-[10px] uppercase tracking-[0.16em]">
                  V2 / V3
                </Badge>
              </div>

              <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
                Aqui eu prefiro separar maturidade técnica de maturidade de produto: a telemetria dos
                workflows sociais já pode aparecer, mas o dashboard client-facing mais rico só faz
                sentido quando o calendário editorial e a produção de conteúdo começarem a rodar de
                verdade.
              </p>

              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <PortalMiniMetric
                  label="Workflows ativos"
                  value={`${formatNumber(socialSellingSummary.active)}/${formatNumber(socialSellingSummary.total)}`}
                  detail="Família `linkedin_social` já visível na fonte governada do n8n."
                />
                <PortalMiniMetric
                  label="Execuções 7d"
                  value={formatNumber(socialSellingSummary.exec7d)}
                  detail="Volume técnico recente da camada de social selling."
                />
                <PortalMiniMetric
                  label="Erros hoje"
                  value={formatNumber(socialSellingSummary.errorToday)}
                  detail="Falhas técnicas atuais desta frente."
                />
                <PortalMiniMetric
                  label="Waiting hoje"
                  value={formatNumber(socialSellingSummary.waitingToday)}
                  detail="Itens aguardando processamento na família social."
                />
              </div>

              <div className="mt-3 rounded-xl border border-dashed border-border bg-surface px-3 py-3 text-[11px] leading-relaxed text-muted-foreground">
                {socialSellingSummary.total > 0
                  ? topSocialSellingWorkflow
                    ? `Workflow foco agora: ${topSocialSellingWorkflow.workflowName}. Quando a frente de conteúdo entrar em operação, este módulo passa a somar calendário, produção pendente, publicações e sinais de engajamento sem canibalizar o Notion.`
                    : "A telemetria social já está pronta para virar módulo dedicado quando a frente de conteúdo começar a operar."
                  : "A frente de social selling ainda está em prontidão. O Portal já ficou preparado para encaixar calendário editorial, produção e publicação assim que essa camada sair do papel."}
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-sm font-semibold text-display">Saúde técnica da operação</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Leitura executiva do runtime da operação, em janela técnica própria. Este bloco não
                segue o filtro comercial de mês atual, mês anterior, 7 dias ou 90 dias.
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
  fallbackCount,
}: {
  unattributedCount: number;
  fallbackCount: number;
}) {
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-3 py-3 text-[11px] leading-relaxed text-muted-foreground">
      Atribuição por canal prioriza o campo <span className="font-medium text-foreground">Canal</span> do registro.
      Quando ele não existe, o Portal usa também sinais das colunas de `status_email`, `status_linkedin`,
      `status_whatsapp`, do `Disparo Mensagem` e, quando possível, fallback por empresa para não zerar canal por falta de marcação perfeita.
      {fallbackCount > 0
        ? ` Neste recorte, ${formatNumber(fallbackCount)} viradas precisaram desse fallback por empresa.`
        : ""}
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
