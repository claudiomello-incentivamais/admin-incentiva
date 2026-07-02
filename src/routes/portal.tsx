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
import type {
  PortalAnalyticsBaseLead,
  PortalAnalyticsFact,
  PortalChannelPeriodSummary,
  PortalIcpDimensionId,
  PortalPeriodPreset,
  PortalPeriodSummary,
} from "@/lib/admin-portal-analytics";
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

function firstInterestCountForSummary(summary: PortalPeriodSummary) {
  const stageBasedFirstInterestCount =
    summary.stageCounts["lead-interessado"] +
    summary.stageCounts["mql-agendado"] +
    summary.stageCounts["mql-realizado"] +
    summary.stageCounts.negotiation +
    summary.stageCounts.won +
    summary.stageCounts.lost;
  return Math.max(
    stageBasedFirstInterestCount,
    summary.channels.email.replies +
      summary.channels.linkedin.replies +
      summary.channels.whatsapp.replies,
  );
}

function firstInterestCountForChannel(channel: PortalChannelPeriodSummary) {
  const stageBasedFirstInterestCount =
    channel.leadInteressado +
    channel.mqlAgendado +
    channel.mqlRealizado +
    channel.negotiation +
    channel.won +
    channel.lost;
  return Math.max(stageBasedFirstInterestCount, channel.replies);
}

function groupDispatchesByDay(facts: PortalAnalyticsFact[]) {
  const grouped = new Map<string, Record<"email" | "linkedin" | "whatsapp", number>>();
  facts.forEach((fact) => {
    if (fact.kind !== "dispatch" || !fact.channel) return;
    const dayKey = fact.eventAt.slice(0, 10);
    const existing = grouped.get(dayKey) ?? { email: 0, linkedin: 0, whatsapp: 0 };
    existing[fact.channel] += 1;
    grouped.set(dayKey, existing);
  });
  return grouped;
}

function groupRepliesByDay(facts: PortalAnalyticsFact[]) {
  const grouped = new Map<string, number>();
  facts.forEach((fact) => {
    if (fact.kind !== "reply") return;
    const dayKey = fact.eventAt.slice(0, 10);
    grouped.set(dayKey, (grouped.get(dayKey) ?? 0) + 1);
  });
  return grouped;
}

function groupFirstInterestByDay(facts: PortalAnalyticsFact[]) {
  const grouped = new Map<string, number>();
  facts.forEach((fact) => {
    const dayKey = fact.eventAt.slice(0, 10);
    if (
      fact.kind === "stage" &&
      fact.stageId &&
      fact.stageId !== "prospecting"
    ) {
      grouped.set(dayKey, (grouped.get(dayKey) ?? 0) + 1);
      return;
    }
    if (fact.kind === "reply") {
      grouped.set(dayKey, (grouped.get(dayKey) ?? 0) + 1);
    }
  });
  return grouped;
}

function buildRhythmDailyNote(
  timeline: Array<{
    label: string;
    prospecting: number;
    leadDisplay: number;
    mqlAgendado: number;
    won: number;
    sortKey?: string;
  }>,
  dispatchesByDay: Map<string, Record<"email" | "linkedin" | "whatsapp", number>>,
) {
  if (timeline.length < 2) {
    return "A observação diária aparece quando existem pelo menos dois dias úteis no recorte para comparar volume e canal.";
  }

  const previous = timeline[timeline.length - 2];
  const current = timeline[timeline.length - 1];
  const currentDay = dispatchesByDay.get(current.sortKey ?? "") ?? { email: 0, linkedin: 0, whatsapp: 0 };
  const previousDay = dispatchesByDay.get(previous.sortKey ?? "") ?? { email: 0, linkedin: 0, whatsapp: 0 };
  const delta = current.prospecting - previous.prospecting;

  if (delta === 0) {
    return `Ritmo estável entre ${previous.label} e ${current.label}: ${formatNumber(current.prospecting)} prospects iniciados em cada dia.`;
  }

  const direction = delta > 0 ? "subiu" : "caiu";
  const reasons: string[] = [];

  if (currentDay.whatsapp !== previousDay.whatsapp) {
    reasons.push(`WhatsApp ${direction === "subiu" ? "foi de" : "caiu de"} ${formatNumber(previousDay.whatsapp)} para ${formatNumber(currentDay.whatsapp)}`);
  }
  if (currentDay.email !== previousDay.email) {
    reasons.push(`e-mail ${direction === "subiu" ? "foi de" : "caiu de"} ${formatNumber(previousDay.email)} para ${formatNumber(currentDay.email)}`);
  }
  if (currentDay.linkedin !== previousDay.linkedin) {
    reasons.push(`LinkedIn ${direction === "subiu" ? "foi de" : "caiu de"} ${formatNumber(previousDay.linkedin)} para ${formatNumber(currentDay.linkedin)}`);
  }

  const reasonText =
    reasons.length > 0
      ? reasons.join(" · ")
      : "sem mudança clara de canal materializada na trilha atual";

  return `Entre ${previous.label} e ${current.label}, a leitura atual do Portal mostra que os novos iniciados ${direction} de ${formatNumber(previous.prospecting)} para ${formatNumber(current.prospecting)}. Na trilha atual, ${reasonText}.`;
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

function formatIcpFilterValue(
  dimensionId: PortalIcpDimensionId,
  value: string,
) {
  if (dimensionId === "company_size_cluster") {
    if (value === "micro_smb") return "Micro SMB (1-10)";
    if (value === "smb") return "SMB (11-99)";
    if (value === "midmarket") return "Midmarket (100-499)";
    if (value === "enterprise") return "Enterprise (500+)";
  }
  return value;
}

const ICP_FILTERS: Array<{ id: PortalIcpDimensionId; label: string; allLabel: string }> = [
  { id: "segment_cluster", label: "Setor", allLabel: "Todos os setores" },
  { id: "company_size_cluster", label: "Porte", allLabel: "Todos os portes" },
  { id: "cargo_cluster", label: "Cargo", allLabel: "Todos os cargos" },
];

function createPortalChannelSummary(channel: PortalChannelPeriodSummary["channel"]): PortalChannelPeriodSummary {
  return {
    channel,
    touched: 0,
    dispatches: 0,
    leadInteressado: 0,
    mqlAgendado: 0,
    mqlRealizado: 0,
    negotiation: 0,
    won: 0,
    lost: 0,
    firstInterestPct: 0,
    scheduledPct: 0,
    negotiationPct: 0,
    wonPct: 0,
    replies: 0,
    dispatchSource: "none",
  };
}

function createPortalPeriodSummary(period: PortalPeriodPreset, label: string): PortalPeriodSummary {
  return {
    period,
    label,
    stageCounts: {
      prospecting: 0,
      "lead-interessado": 0,
      "mql-agendado": 0,
      "mql-realizado": 0,
      negotiation: 0,
      won: 0,
      lost: 0,
    },
    touched: 0,
    firstInterestPct: 0,
    scheduledPct: 0,
    negotiationPct: 0,
    wonPct: 0,
    channels: {
      email: createPortalChannelSummary("email"),
      linkedin: createPortalChannelSummary("linkedin"),
      whatsapp: createPortalChannelSummary("whatsapp"),
    },
    attributionFallbackCount: 0,
    unattributedStageCount: 0,
    timeline: [],
  };
}

function localMidnight(date: Date) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const year = parts.find((item) => item.type === "year")?.value ?? "1970";
  const month = parts.find((item) => item.type === "month")?.value ?? "01";
  const day = parts.find((item) => item.type === "day")?.value ?? "01";
  return new Date(`${year}-${month}-${day}T00:00:00-03:00`);
}

function periodWindow(period: PortalPeriodPreset, now: Date) {
  const today = localMidnight(now);
  if (period === "mtd") {
    return {
      start: new Date(
        `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01T00:00:00-03:00`,
      ),
      endExclusive: null,
    };
  }

  if (period === "prev_month") {
    const currentMonthStart = new Date(
      `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01T00:00:00-03:00`,
    );
    const previousMonthDate = new Date(currentMonthStart);
    previousMonthDate.setMonth(previousMonthDate.getMonth() - 1);
    return {
      start: new Date(
        `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}-01T00:00:00-03:00`,
      ),
      endExclusive: currentMonthStart,
    };
  }

  const days = period === "7d" ? 6 : 89;
  return {
    start: new Date(today.getTime() - days * 24 * 60 * 60 * 1000),
    endExclusive: null,
  };
}

function isWithinPeriod(value: Date, period: PortalPeriodPreset, now: Date) {
  const { start, endExclusive } = periodWindow(period, now);
  if (value < start) return false;
  if (endExclusive && value >= endExclusive) return false;
  return true;
}

function localDayLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "n/d";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function matchesIcpFilters(
  dimensions: Record<PortalIcpDimensionId, string | null>,
  filters: Record<PortalIcpDimensionId, string>,
) {
  return ICP_FILTERS.every(({ id }) => filters[id] === "all" || dimensions[id] === filters[id]);
}

function formatFrontLabel(value: string | null | undefined) {
  const normalized = value?.replace(/[_]+/g, " ").replace(/\s+/g, " ").trim() ?? "";
  return normalized || "Frente não identificada";
}

function summarizeFactsForPeriod(
  facts: PortalAnalyticsFact[],
  period: PortalPeriodPreset,
  now = new Date(),
): PortalPeriodSummary {
  const labels: Record<PortalPeriodPreset, string> = {
    mtd: "Mês atual",
    prev_month: "Mês anterior",
    "7d": "Últimos 7 dias",
    "90d": "Últimos 90 dias",
  };
  const summary = createPortalPeriodSummary(period, labels[period]);
  const timeline = new Map<string, PortalPeriodSummary["timeline"][number]>();

  facts.forEach((fact) => {
    const eventDate = new Date(fact.eventAt);
    if (Number.isNaN(eventDate.getTime()) || !isWithinPeriod(eventDate, period, now)) return;

    if (fact.kind === "dispatch" && fact.channel) {
      summary.channels[fact.channel].dispatches += 1;
      summary.channels[fact.channel].dispatchSource = "events";
      return;
    }

    if (fact.kind === "reply" && fact.channel) {
      summary.channels[fact.channel].replies += 1;
      return;
    }

    if (fact.kind !== "stage" || !fact.stageId) return;

    summary.stageCounts[fact.stageId] += 1;
    if (fact.channel) {
      const channel = summary.channels[fact.channel];
      if (fact.stageId === "prospecting") channel.touched += 1;
      if (fact.stageId === "lead-interessado") channel.leadInteressado += 1;
      if (fact.stageId === "mql-agendado") channel.mqlAgendado += 1;
      if (fact.stageId === "mql-realizado") channel.mqlRealizado += 1;
      if (fact.stageId === "negotiation") channel.negotiation += 1;
      if (fact.stageId === "won") channel.won += 1;
      if (fact.stageId === "lost") channel.lost += 1;
    } else {
      summary.unattributedStageCount += 1;
    }

    const dayKey = fact.eventAt.slice(0, 10);
    const existing =
      timeline.get(dayKey) ??
      {
        sortKey: dayKey,
        label: localDayLabel(fact.eventAt),
        prospecting: 0,
        leadInteressado: 0,
        mqlAgendado: 0,
        negotiation: 0,
        won: 0,
      };
    if (fact.stageId === "prospecting") existing.prospecting += 1;
    if (fact.stageId === "lead-interessado") existing.leadInteressado += 1;
    if (fact.stageId === "mql-agendado") existing.mqlAgendado += 1;
    if (fact.stageId === "negotiation") existing.negotiation += 1;
    if (fact.stageId === "won") existing.won += 1;
    timeline.set(dayKey, existing);
  });

  summary.touched =
    summary.stageCounts.prospecting +
    summary.stageCounts["lead-interessado"] +
    summary.stageCounts["mql-agendado"] +
    summary.stageCounts["mql-realizado"] +
    summary.stageCounts.negotiation +
    summary.stageCounts.won +
    summary.stageCounts.lost;
  const firstInterestCount = firstInterestCountForSummary(summary);
  summary.firstInterestPct = ratioPct(firstInterestCount, summary.stageCounts.prospecting);
  summary.scheduledPct = ratioPct(
    summary.stageCounts["mql-agendado"],
    firstInterestCount,
  );
  summary.negotiationPct = ratioPct(
    summary.stageCounts.negotiation,
    summary.stageCounts["mql-agendado"],
  );
  summary.wonPct = ratioPct(summary.stageCounts.won, summary.stageCounts.negotiation);
  (["email", "linkedin", "whatsapp"] as const).forEach((channelId) => {
    const channel = summary.channels[channelId];
    const channelFirstInterestCount = firstInterestCountForChannel(channel);
    channel.firstInterestPct = ratioPct(channelFirstInterestCount, channel.touched);
    channel.scheduledPct = ratioPct(channel.mqlAgendado, channelFirstInterestCount);
    channel.negotiationPct = ratioPct(channel.negotiation, channel.mqlAgendado);
    channel.wonPct = ratioPct(channel.won, channel.negotiation);
  });
  summary.timeline = [...timeline.values()].sort((a, b) => (a.sortKey ?? "").localeCompare(b.sortKey ?? ""));
  return summary;
}

function inferCoverageDaysForFilteredBase(
  filteredUnstarted: number,
  overallUnstarted: number,
  overallCoverageDays: number,
) {
  if (overallUnstarted <= 0 || overallCoverageDays <= 0) return 0;
  return Math.max(0, Math.round((filteredUnstarted / overallUnstarted) * overallCoverageDays));
}

function formatFreshnessLabel(value: string | null | undefined) {
  if (!value) return "Sem leitura recente";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Sem leitura recente";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function findEvolutionInstanceByRole(
  instances: Array<{ instanceRole: string; instanceName: string }>,
  role: "primary" | "standby",
) {
  return (
    instances.find((instance) => instance.instanceRole.toLowerCase() === role) ??
    instances.find((instance) => instance.instanceRole.toLowerCase().includes(role)) ??
    null
  );
}

function formatEvolutionInstanceHealthLabel(
  instance:
    | {
        instanceName: string;
        severity: "healthy" | "attention" | "critical" | "insufficient";
      }
    | null
    | undefined,
) {
  if (!instance) return "Não materializada";
  const label =
    instance.severity === "healthy"
      ? "saudável"
      : instance.severity === "attention"
        ? "em atenção"
        : instance.severity === "critical"
          ? "crítica"
          : "insuficiente";
  return `${instance.instanceName} · ${label}`;
}

function formatEvolutionSeverityLabel(
  severity: "healthy" | "attention" | "critical" | "insufficient" | null | undefined,
) {
  if (severity === "healthy") return "Saudável";
  if (severity === "attention") return "Atenção";
  if (severity === "critical") return "Crítica";
  if (severity === "insufficient") return "Insuficiente";
  return "Não materializada";
}

function formatOperationHealthLabelPt(
  health: "healthy" | "monitor" | "risk" | "critical" | null | undefined,
) {
  if (health === "healthy") return "Saudável";
  if (health === "monitor") return "Monitoramento";
  if (health === "risk") return "Em risco";
  if (health === "critical") return "Crítica";
  return "Sem leitura";
}

function formatEvolutionOverallDetail(
  row:
    | {
        materializedInstanceCount: number;
        expectedInstanceCount: number;
        errors24h: number;
        stalled24h: number;
      }
    | null
    | undefined,
  snapshotStale = false,
) {
  if (!row) return "Sem snapshot vivo para resumir a operação.";
  if (snapshotStale) {
    return "A última leitura viva ficou desatualizada; usar este bloco com cautela até a próxima materialização.";
  }
  if (row.expectedInstanceCount > row.materializedInstanceCount) {
    return `${formatNumber(row.materializedInstanceCount)}/${formatNumber(row.expectedInstanceCount)} instâncias materializadas.`;
  }
  if (row.errors24h > 0 || row.stalled24h > 0) {
    return `${formatNumber(row.errors24h)} erro(s) e ${formatNumber(row.stalled24h)} fila(s) nas últimas 24h.`;
  }
  return "Primário e standby visíveis, sem ruído crítico no recorte.";
}

function parseSnapshotAgeHours(snapshotAt: string | null | undefined) {
  if (!snapshotAt) return null;
  const snapshotDate = new Date(snapshotAt);
  if (Number.isNaN(snapshotDate.getTime())) return null;
  const diffMs = Date.now() - snapshotDate.getTime();
  return diffMs >= 0 ? diffMs / (1000 * 60 * 60) : 0;
}

function isSnapshotStale(snapshotAt: string | null | undefined) {
  const ageHours = parseSnapshotAgeHours(snapshotAt);
  return ageHours != null && ageHours >= 4;
}

function formatEvolutionSnapshotState(
  source: "live" | "snapshot",
  snapshotAt: string | null | undefined,
) {
  if (source !== "live") return "Snapshot de contingência";
  if (isSnapshotStale(snapshotAt)) return "Snapshot desatualizado";
  return "Snapshot vivo";
}

function formatEvolutionInstanceDetail(
  row:
    | {
        instanceName: string;
        registryStatus: string | null;
        reason: string;
        snapshotAt: string | null;
      }
    | null
    | undefined,
) {
  if (!row) return "Não materializada";
  const statusPart = row.registryStatus ? ` · registry ${row.registryStatus}` : "";
  const stalePart = isSnapshotStale(row.snapshotAt) ? " · leitura desatualizada" : "";
  return `${row.instanceName}${statusPart}${stalePart}. ${trimDetail(row.reason, "sem motivo consolidado", 110)}`;
}

function evolutionSeverityClasses(
  severity: "healthy" | "attention" | "critical" | "insufficient" | null | undefined,
) {
  if (severity === "healthy") return "border-emerald-500/25 bg-emerald-500/10 text-emerald-700";
  if (severity === "attention") return "border-amber-500/25 bg-amber-500/10 text-amber-700";
  if (severity === "critical") return "border-rose-500/25 bg-rose-500/10 text-rose-700";
  return "border-slate-500/20 bg-slate-500/10 text-slate-700";
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
  const [selectedIcpFilters, setSelectedIcpFilters] = useState<Record<PortalIcpDimensionId, string>>({
    segment_cluster: "all",
    company_size_cluster: "all",
    cargo_cluster: "all",
  });
  const [selectedFront, setSelectedFront] = useState("all");

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
  const portalAnalyticsFacts = portalAnalyticsOperation?.facts ?? [];
  const portalAnalyticsBaseLeads = portalAnalyticsOperation?.baseLeads ?? [];
  const frontOptions = [
    ...new Set(
      [...portalAnalyticsFacts, ...portalAnalyticsBaseLeads]
        .map((item) => item.sourceTable)
        .filter(Boolean),
    ),
  ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR"));
  const hasMultipleFronts = frontOptions.length > 1;
  const dimensionAvailability =
    portalAnalyticsOperation?.dimensionAvailability ?? {
      segment_cluster: false,
      company_size_cluster: false,
      cargo_cluster: false,
    };
  const activeIcpFilters = ICP_FILTERS.filter(({ id }) => selectedIcpFilters[id] !== "all");
  const hasActiveIcpFilters = activeIcpFilters.length > 0;
  const icpValueOptions = Object.fromEntries(
    ICP_FILTERS.map(({ id }) => [
      id,
      [...new Set(
        [...portalAnalyticsFacts, ...portalAnalyticsBaseLeads]
          .map((item) => item.dimensions[id])
          .filter(Boolean),
      )].sort((a, b) => String(a).localeCompare(String(b), "pt-BR")),
    ]),
  ) as Record<PortalIcpDimensionId, string[]>;
  const filteredFacts = hasActiveIcpFilters
    ? portalAnalyticsFacts.filter((fact) => matchesIcpFilters(fact.dimensions, selectedIcpFilters))
    : portalAnalyticsFacts;
  const frontScopedFacts =
    selectedFront === "all"
      ? filteredFacts
      : filteredFacts.filter((fact) => fact.sourceTable === selectedFront);
  const filteredBaseLeads = hasActiveIcpFilters
    ? portalAnalyticsBaseLeads.filter((lead) => matchesIcpFilters(lead.dimensions, selectedIcpFilters))
    : portalAnalyticsBaseLeads;
  const frontScopedBaseLeads =
    selectedFront === "all"
      ? filteredBaseLeads
      : filteredBaseLeads.filter((lead) => lead.sourceTable === selectedFront);
  const periodAnalytics =
    hasActiveIcpFilters || selectedFront !== "all"
      ? summarizeFactsForPeriod(frontScopedFacts, selectedPeriod)
      : portalAnalyticsOperation?.periods[selectedPeriod] ?? null;
  const periodScopeParts = [
    selectedFront !== "all" ? `Frente: ${formatFrontLabel(selectedFront)}` : null,
    ...(hasActiveIcpFilters
      ? activeIcpFilters.map(({ id, label }) => `${label}: ${formatIcpFilterValue(id, selectedIcpFilters[id])}`)
      : []),
  ].filter(Boolean);
  const periodScopeLabel = periodScopeParts.length > 0 ? periodScopeParts.join(" · ") : "Operação inteira";
  const latestCommercialEventAt =
    [portalAnalyticsOperation?.latestStageMovementAt, portalAnalyticsOperation?.latestDispatchEventAt, portalAnalyticsOperation?.latestReplyAt]
      .filter(Boolean)
      .sort()
      .at(-1) ?? null;
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
  const replyCountsByDay = groupRepliesByDay(frontScopedFacts);
  const firstInterestCountsByDay = groupFirstInterestByDay(frontScopedFacts);
  const dispatchesByDay = groupDispatchesByDay(frontScopedFacts);
  const chartTimelineData = (periodAnalytics?.timeline ?? []).map((item) => ({
    ...item,
    leadDisplay: Math.max(
      firstInterestCountsByDay.get(item.sortKey ?? "") ?? 0,
      replyCountsByDay.get(item.sortKey ?? "") ?? 0,
    ),
  }));
  const leadStageCount = periodAnalytics ? firstInterestCountForSummary(periodAnalytics) : 0;
  const chartStageData = periodAnalytics
    ? [
        { stage: "Prospect", value: periodAnalytics.stageCounts.prospecting },
        { stage: "Lead", value: leadStageCount },
        { stage: "MQL Ag.", value: periodAnalytics.stageCounts["mql-agendado"] },
        { stage: "Negociação", value: periodAnalytics.stageCounts.negotiation },
        { stage: "Ganhos", value: periodAnalytics.stageCounts.won },
      ]
    : [];
  const hasPeriodAnalytics = Boolean(periodAnalytics);
  const hasStageChartData = chartStageData.some((item) => item.value > 0);
  const hasTimelineChartData = chartTimelineData.some((item) =>
    item.prospecting > 0 || item.leadDisplay > 0 || item.mqlAgendado > 0 || item.won > 0,
  );
  const rhythmDailyNote = buildRhythmDailyNote(chartTimelineData, dispatchesByDay);
  const overallUnstarted =
    currentCockpit.baseMetrics.find((metric) => metric.id === "unstarted")?.value ?? 0;
  const overallCoverageDays =
    currentCockpit.baseMetrics.find((metric) => metric.id === "coverage-days")?.value ?? 0;
  const reactivationPool =
    currentCockpit.baseMetrics.find((metric) => metric.id === "reactivation")?.value ?? 0;
  const reprospeccaoEligible =
    currentCockpit.baseMetrics.find((metric) => metric.id === "reprospeccao")?.value ?? 0;
  const retomadaEligible =
    currentCockpit.baseMetrics.find((metric) => metric.id === "retomada")?.value ?? 0;
  const recoveryTotal = reactivationPool + reprospeccaoEligible + retomadaEligible;
  const filteredUnstarted = hasActiveIcpFilters || selectedFront !== "all"
    ? frontScopedBaseLeads.filter((lead) => lead.isUnstarted).length
    : overallUnstarted;
  const filteredCoverageDays = hasActiveIcpFilters || selectedFront !== "all"
    ? inferCoverageDaysForFilteredBase(filteredUnstarted, overallUnstarted, overallCoverageDays)
    : overallCoverageDays;
  const isMonthCurrentStale =
    selectedPeriod === "mtd" &&
    Boolean(periodAnalytics) &&
    (periodAnalytics.touched === 0 &&
      periodAnalytics.channels.email.dispatches === 0 &&
      periodAnalytics.channels.whatsapp.dispatches === 0 &&
      periodAnalytics.channels.linkedin.dispatches === 0) &&
    Boolean(latestCommercialEventAt);
  const firstInterestPctDisplay = periodAnalytics?.firstInterestPct ?? firstInterestPct;
  const wonTouchedDisplay = periodAnalytics?.stageCounts.won ?? wonTouched;
  const primaryEvolutionInstance = findEvolutionInstanceByRole(evolutionInstances, "primary");
  const standbyEvolutionInstance = findEvolutionInstanceByRole(evolutionInstances, "standby");
  const evolutionSnapshotStale = isSnapshotStale(
    evolutionRow?.snapshotAt ?? topEvolutionInstance?.snapshotAt ?? null,
  );

  useEffect(() => {
    setSelectedIcpFilters({
      segment_cluster: "all",
      company_size_cluster: "all",
      cargo_cluster: "all",
    });
    setSelectedFront("all");
  }, [portalOperation.id]);

  useEffect(() => {
    if (selectedFront === "all") return;
    if (frontOptions.includes(selectedFront)) return;
    setSelectedFront("all");
  }, [frontOptions, selectedFront]);

  useEffect(() => {
    setSelectedIcpFilters((current) => {
      let changed = false;
      const next = { ...current };
      ICP_FILTERS.forEach(({ id }) => {
        if (current[id] === "all") return;
        if (icpValueOptions[id].includes(current[id])) return;
        next[id] = "all";
        changed = true;
      });
      return changed ? next : current;
    });
  }, [icpValueOptions]);

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
  const evolutionHealth =
    evolution.source !== "live"
      ? ("monitor" as const)
      : evolutionSnapshotStale
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
          : ("healthy" as const);
  const evolutionNextStep =
    evolution.source !== "live" || !evolutionRow
      ? "Restabelecer a telemetria viva da Evolution antes de usar este bloco para decisão."
      : evolutionSnapshotStale
        ? `Atualizar a snapshot viva da Evolution. Última leitura útil: ${trimDetail(evolution.snapshotLabel, "sem leitura útil", 120)}.`
      : evolutionRow.missingInstanceCount > 0
        ? `Materializar ${formatNumber(evolutionRow.missingInstanceCount)} instância(s) esperada(s) para a leitura ficar completa.`
        : topEvolutionInstance && topEvolutionInstance.severity !== "healthy"
          ? `Checar ${topEvolutionInstance.instanceName} e o motivo '${trimDetail(topEvolutionInstance.reason, "sem motivo consolidado", 90)}'.`
          : "Sem pressão técnica material agora; acompanhar reply, erros e entrega pela janela técnica.";
  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Portal"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/30 bg-primary/5 text-primary h-5"
              >
                Portal do cliente
              </Badge>
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
              Cockpit principal da operação, desenhado para concentrar a leitura client-facing de
              base, cobertura, conversão e saúde do canal principal, sem misturar bastidor
              administrativo no que deveria ser leitura executiva da conta.
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
                    Ir para camada interna
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
                Cockpit resumido da operação selecionada, com leitura de base, priorização e
                links de trabalho em uma camada só, deixando o detalhe administrativo para a
                área interna.
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
              <h2 className="text-sm font-semibold text-display">Reativação / Retomada</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Pulmão tático de curto prazo para reaproveitar base, reacender conversa e reduzir pressão de cobertura.
              </p>
            </div>
            <TimerReset className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="text-[10px] uppercase tracking-[0.18em] text-primary">Leitura executiva</div>
            <div className="mt-1 text-base font-semibold text-display">
              {formatNumber(recoveryTotal)} oportunidades táticas já visíveis na operação
            </div>
            <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
              O Portal separa aqui o que já está classificado para reativação, o que pode voltar por reprospecção
              e o que já está elegível para retomada de conversa.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <PortalMiniMetric
              label="Pool de reativação"
              value={formatNumber(reactivationPool)}
              detail="Leads hoje classificados para reativação dentro da operação."
            />
            <PortalMiniMetric
              label="Reprospecção elegível"
              value={formatNumber(reprospeccaoEligible)}
              detail="Contatos que já podem ser reaproveitados em nova abordagem."
            />
            <PortalMiniMetric
              label="Retomada elegível"
              value={formatNumber(retomadaEligible)}
              detail="Leads prontos para voltar a receber conversa ativa."
            />
            <PortalMiniMetric
              label="Workflows da frente"
              value={`${formatNumber(reactivationSummary.active)}/${formatNumber(reactivationSummary.total)}`}
              detail="Workflows ativos versus total da família de reativação no n8n."
            />
          </div>

          <div className="mt-3 grid gap-3 md:grid-cols-3">
            <PortalNarrativeCard
              label="Papel agora"
              title="Alavanca tática de curto prazo"
              detail="Esta frente amortece a pressão de lista nova e sustenta ritmo enquanto a cobertura principal se recompõe."
            />
            <PortalNarrativeCard
              label="Saúde operacional"
              title={statusMeta[reactivationSummary.health].label}
              detail={
                topReactivationWorkflow
                  ? `${topReactivationWorkflow.workflowName} é hoje o principal workflow para checagem, com ${formatNumber(topReactivationWorkflow.exec7d)} execuções em 7 dias.`
                  : "Sem workflow dominante nesta família no recorte atual."
              }
            />
            <PortalNarrativeCard
              label="Ação agora"
              title="Priorizar o reaproveitamento com governança"
              detail={
                recoveryTotal > 0
                  ? `Há ${formatNumber(recoveryTotal)} oportunidades já visíveis entre reativação, reprospecção e retomada.`
                  : "A frente está materializada, mas ainda sem volume acionável relevante na leitura atual."
              }
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
                O bloco abaixo considera a movimentação real do período filtrado para a operação atual, com recorte combinável de ICP para leitura de disparo e conversão.
              </p>
              <div className="mt-3 text-[11px] text-muted-foreground">{cadenceView.syncLabel}</div>
              <div className="mt-4 grid gap-3 rounded-2xl border border-border bg-background/70 p-4 xl:grid-cols-[220px,220px,220px,220px,1fr]">
                {hasMultipleFronts ? (
                  <div className="space-y-2">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      Frente
                    </div>
                    <Select value={selectedFront} onValueChange={setSelectedFront}>
                      <SelectTrigger className="h-10 bg-surface border-border text-sm">
                        <SelectValue placeholder="Escolher frente" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todas as frentes</SelectItem>
                        {frontOptions.map((value) => (
                          <SelectItem key={`front-${value}`} value={value}>
                            {formatFrontLabel(value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ) : null}
                {ICP_FILTERS.map(({ id, label, allLabel }) => (
                  <div key={id} className="space-y-2">
                    <div className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {label}
                    </div>
                    <Select
                      value={selectedIcpFilters[id]}
                      onValueChange={(value) =>
                        setSelectedIcpFilters((current) => ({ ...current, [id]: value }))
                      }
                      disabled={!dimensionAvailability[id] || icpValueOptions[id].length === 0}
                    >
                      <SelectTrigger className="h-10 bg-surface border-border text-sm">
                        <SelectValue placeholder={dimensionAvailability[id] ? `Escolher ${label.toLowerCase()}` : "Indisponível"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">{allLabel}</SelectItem>
                        {icpValueOptions[id].map((value) => (
                          <SelectItem key={`${id}-${value}`} value={value}>
                            {formatIcpFilterValue(id, value)}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}

                <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-3 text-[12px] leading-relaxed text-muted-foreground xl:col-span-1">
                  <span className="font-medium text-foreground">Escopo atual:</span> {periodScopeLabel}. O
                  recorte abaixo reaproveita a mesma leitura de período para comparar disparos,
                  lead, MQL, negociação e cliente ganho combinando setor, porte e cargo.
                  {ICP_FILTERS.some(({ id }) => !dimensionAvailability[id])
                    ? ` Parte do ICP ainda não está materializada na fonte viva desta operação.`
                    : ""}
                </div>
              </div>

              {isMonthCurrentStale ? (
                <div className="mt-4 rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-[12px] leading-relaxed text-amber-700">
                  O mês atual está zerado porque a trilha histórica desta operação ainda não materializou
                  movimentação comercial em julho na fonte usada pelo Portal. Última leitura útil:
                  {" "}
                  {formatFreshnessLabel(latestCommercialEventAt)}.
                </div>
              ) : null}

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <PortalMiniMetric
                  label="Não iniciados"
                  value={formatNumber(filteredUnstarted)}
                  detail={
                    hasActiveIcpFilters
                      ? "Fotografia atual da base filtrada pelo recorte ICP selecionado."
                      : "Fotografia atual da base, separada da movimentação do recorte."
                  }
                />
                <PortalMiniMetric
                  label="Cobertura em dias"
                  value={formatNumber(filteredCoverageDays)}
                  detail={
                    hasActiveIcpFilters
                      ? "Estimativa de cobertura da base filtrada, proporcional à régua atual da operação."
                      : "Fotografia atual da cobertura, separada da movimentação do recorte."
                  }
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
                  { id: "lead", count: leadStageCount },
                  { id: "mql-agendado", count: periodAnalytics.stageCounts["mql-agendado"] },
                  { id: "mql-realizado", count: periodAnalytics.stageCounts["mql-realizado"] },
                  { id: "negotiation", count: periodAnalytics.stageCounts.negotiation },
                  { id: "won", count: periodAnalytics.stageCounts.won },
                  { id: "lost", count: periodAnalytics.stageCounts.lost },
                ].map((stage) => (
                  <PortalNarrativeCard
                    key={stage.id}
                    label={stage.id === "lead" ? "Lead" : formatPipelineStageLabel(stage.id)}
                    title={formatNumber(stage.count)}
                    detail={
                      stage.id === "lead"
                        ? "Levantadas de mão do período, positivas ou negativas."
                        : "Volume desta etapa dentro do período selecionado."
                    }
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
                Conversões calculadas com relação explícita entre origem e destino no período selecionado. Aqui,
                lead significa levantada de mão, positiva ou negativa.
              </p>
            </div>
            <TrendingUp className="h-3.5 w-3.5 text-primary" />
          </div>

          {hasPeriodAnalytics ? (
            <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <PortalMiniMetric
                label="Prospect -> Lead"
                value={formatStageConversionValue(
                  firstInterestCountForSummary(periodAnalytics),
                  periodAnalytics.stageCounts.prospecting,
                )}
                detail={`${formatNumber(firstInterestCountForSummary(periodAnalytics))} sinais de primeiro interesse sobre ${formatNumber(periodAnalytics.stageCounts.prospecting)} prospects tocados no período. Considera resposta materializada mesmo quando o lead depois vira perdido.`}
              />
              <PortalMiniMetric
                label="Lead -> MQL agendado"
                value={formatStageConversionValue(
                  periodAnalytics.stageCounts["mql-agendado"],
                  firstInterestCountForSummary(periodAnalytics),
                )}
                detail={`${formatNumber(periodAnalytics.stageCounts["mql-agendado"])} MQLs agendados sobre ${formatNumber(firstInterestCountForSummary(periodAnalytics))} sinais de primeiro interesse no período.`}
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
                  detail="Leitura do recorte comercial do e-mail, separando volume enviado, respostas e levantadas de mão."
                  highlight={{
                    label: "Lead rate",
                    value: `${formatPercent(periodAnalytics.channels.email.firstInterestPct)}%`,
                  }}
                  metrics={[
                    {
                      label: "Prospects tocados",
                      value: formatNumber(periodAnalytics.channels.email.touched),
                    },
                    {
                      label: "Levantadas de mão",
                      value: formatNumber(firstInterestCountForChannel(periodAnalytics.channels.email)),
                    },
                    {
                      label: "Disparos confirmados",
                      value: formatNumber(periodAnalytics.channels.email.dispatches),
                    },
                    {
                      label: "Respostas",
                      value: formatNumber(periodAnalytics.channels.email.replies),
                    },
                  ]}
                  bars={[
                    { label: "Disparos", value: periodAnalytics.channels.email.dispatches },
                    { label: "Respostas", value: periodAnalytics.channels.email.replies },
                    { label: "Leads", value: firstInterestCountForChannel(periodAnalytics.channels.email) },
                  ]}
                  footer={`Prospects tocados = registros que movimentaram Prospect no período. Disparos confirmados = envios materializados na trilha do canal. Apoio n8n: ${formatNumber(emailWorkflowExec7d)} cadências em 7 dias; hoje ${formatNumber(emailWorkflowExecToday)} execuções; waiting atual ${emailWaitingMetric}.`}
                />

                <ChannelActivityCard
                  title="WhatsApp"
                  icon={MessageCircle}
                  sourceLabel={formatDispatchSourceLabel(periodAnalytics.channels.whatsapp.dispatchSource)}
                  detail="Leitura do recorte comercial do WhatsApp, cruzando disparo histórico e resposta materializada."
                  highlight={{
                    label: "Lead rate",
                    value: `${formatPercent(periodAnalytics.channels.whatsapp.firstInterestPct)}%`,
                  }}
                  metrics={[
                    {
                      label: "Prospects tocados",
                      value: formatNumber(periodAnalytics.channels.whatsapp.touched),
                    },
                    {
                      label: "Levantadas de mão",
                      value: formatNumber(firstInterestCountForChannel(periodAnalytics.channels.whatsapp)),
                    },
                    {
                      label: "Disparos confirmados",
                      value: formatNumber(periodAnalytics.channels.whatsapp.dispatches),
                    },
                    {
                      label: "Respostas",
                      value: formatNumber(periodAnalytics.channels.whatsapp.replies),
                    },
                  ]}
                  bars={[
                    { label: "Disparos", value: periodAnalytics.channels.whatsapp.dispatches },
                    { label: "Respostas", value: periodAnalytics.channels.whatsapp.replies },
                    { label: "Leads", value: firstInterestCountForChannel(periodAnalytics.channels.whatsapp) },
                  ]}
                  footer={evolutionRow?.snapshotAt
                    ? `Prospects tocados = registros que movimentaram Prospect no período. Disparos confirmados = envios materializados na trilha do canal. Telemetria viva: ${formatNumber(evolutionOutbound7d)} envios em 7 dias; nas últimas 24h ${formatNumber(evolutionRow.outbound24h)} envios, ${formatNumber(evolutionRow.replies24h)} respostas e ${formatNumber(evolutionRow.errors24h)} erros.`
                    : "Sem snapshot vivo da Evolution para esta operação."}
                />

                <ChannelActivityCard
                  title="LinkedIn"
                  icon={Workflow}
                  sourceLabel={formatDispatchSourceLabel(periodAnalytics.channels.linkedin.dispatchSource)}
                  detail="Leitura do recorte comercial do LinkedIn quando a trilha histórica do canal está materializada."
                  highlight={{
                    label: "Lead rate",
                    value: `${formatPercent(periodAnalytics.channels.linkedin.firstInterestPct)}%`,
                  }}
                  metrics={[
                    {
                      label: "Prospects tocados",
                      value: formatNumber(periodAnalytics.channels.linkedin.touched),
                    },
                    {
                      label: "Levantadas de mão",
                      value: formatNumber(firstInterestCountForChannel(periodAnalytics.channels.linkedin)),
                    },
                    {
                      label: "Disparos confirmados",
                      value: formatNumber(periodAnalytics.channels.linkedin.dispatches),
                    },
                    {
                      label: "Respostas",
                      value: formatNumber(periodAnalytics.channels.linkedin.replies),
                    },
                  ]}
                  bars={[
                    { label: "Disparos", value: periodAnalytics.channels.linkedin.dispatches },
                    { label: "Respostas", value: periodAnalytics.channels.linkedin.replies },
                    { label: "Leads", value: firstInterestCountForChannel(periodAnalytics.channels.linkedin) },
                  ]}
                  footer={`Prospects tocados = registros que movimentaram Prospect no período. Disparos confirmados = envios materializados na trilha do canal. Apoio n8n: ${formatNumber(linkedinWorkflowExec7d)} cadências em 7 dias; hoje ${formatNumber(linkedinWorkflowExecToday)} execuções; saúde atual ${linkedinChannel ? statusMeta[linkedinChannel.health].label : "n/d"}.`}
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
                  Etapas atualizadas dentro do período selecionado. O bloco de lead já considera
                  levantada de mão, não só lead interessado.
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
                    leadDisplay: { label: "Lead", color: "#588157" },
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
                    <Line type="monotone" dataKey="leadDisplay" stroke="var(--color-leadDisplay)" strokeWidth={2} dot={false} />
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
            {hasPeriodAnalytics && hasTimelineChartData ? (
              <div className="mt-3 rounded-xl border border-border bg-surface px-3 py-3 text-[11px] leading-relaxed text-muted-foreground">
                {rhythmDailyNote}
              </div>
            ) : null}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-sm font-semibold text-display">Saúde do WhatsApp da operação</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Leitura executiva da Evolution API para acompanhar a operação principal de WhatsApp.
                Este bloco não segue o filtro comercial de mês atual, mês anterior, 7 dias ou 90 dias.
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
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
                      <MessageCircle className="h-3.5 w-3.5" />
                    </div>
                    <div className="text-sm font-medium text-foreground">Saúde WhatsApp</div>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    Leitura executiva do número primário, do standby e da condição geral da operação.
                  </p>
                </div>
                <Badge
                  variant="outline"
                  className={cn("text-[10px] uppercase tracking-[0.16em] h-5", statusMeta[evolutionHealth].color)}
                >
                  Geral · {formatOperationHealthLabelPt(evolutionHealth)}
                </Badge>
              </div>

              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <EvolutionHealthTile
                  label="Primário"
                  title={formatEvolutionSeverityLabel(primaryEvolutionInstance?.severity ?? null)}
                  detail={formatEvolutionInstanceDetail(primaryEvolutionInstance)}
                  severity={primaryEvolutionInstance?.severity ?? null}
                />
                <EvolutionHealthTile
                  label="Standby"
                  title={formatEvolutionSeverityLabel(standbyEvolutionInstance?.severity ?? null)}
                  detail={formatEvolutionInstanceDetail(standbyEvolutionInstance)}
                  severity={standbyEvolutionInstance?.severity ?? null}
                />
                <EvolutionHealthTile
                  label="Geral"
                  title={formatOperationHealthLabelPt(evolutionHealth)}
                  detail={formatEvolutionOverallDetail(evolutionRow, evolutionSnapshotStale)}
                  severity={
                    evolutionHealth === "healthy"
                      ? "healthy"
                      : evolutionHealth === "monitor"
                        ? "attention"
                        : evolutionHealth === "risk"
                          ? "critical"
                          : "critical"
                  }
                />
                <PortalMiniMetric
                  label="Materialização"
                  value={
                    evolutionRow
                      ? `${formatNumber(evolutionRow.materializedInstanceCount)}/${formatNumber(evolutionRow.expectedInstanceCount)}`
                      : "Sem leitura"
                  }
                  detail="Instâncias esperadas versus instâncias que já apareceram no snapshot vivo."
                />
                <PortalMiniMetric
                  label="Envios 24h"
                  value={evolutionRow ? formatNumber(evolutionRow.outbound24h) : "Sem leitura"}
                  detail={
                    evolutionRow
                      ? `${formatNumber(evolutionRow.replies24h)} respostas e ${formatNumber(evolutionRow.errors24h)} erros nas últimas 24h.`
                      : "Sem snapshot vivo da Evolution para esta operação."
                  }
                />
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-2">
                <div className="rounded-xl border border-border bg-card px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Janela técnica
                  </div>
                  <div className="mt-1 text-sm font-medium text-foreground">
                    {formatEvolutionSnapshotState(
                      evolution.source,
                      evolutionRow?.snapshotAt ?? topEvolutionInstance?.snapshotAt ?? null,
                    )}
                  </div>
                  <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
                    {evolution.source === "live"
                      ? evolution.snapshotLabel
                      : "A leitura viva não carregou; usar este bloco apenas como contingência."}
                  </p>
                </div>
                <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-3">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                    Ação agora
                  </div>
                  <div className="mt-1 text-[12px] leading-relaxed text-foreground">{evolutionNextStep}</div>
                </div>
              </div>
            </div>
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

function EvolutionHealthTile({
  label,
  title,
  detail,
  severity,
}: {
  label: string;
  title: string;
  detail?: string;
  severity: "healthy" | "attention" | "critical" | "insufficient" | null;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3">
      <div className="flex items-center justify-between gap-2">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <Badge variant="outline" className={cn("h-5 text-[10px] uppercase tracking-[0.16em]", evolutionSeverityClasses(severity))}>
          {formatEvolutionSeverityLabel(severity)}
        </Badge>
      </div>
      <div className="mt-2 text-sm font-medium text-foreground">{title}</div>
      {detail ? <div className="mt-1 text-[11px] leading-relaxed text-muted-foreground">{detail}</div> : null}
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
  highlight,
  metrics,
  bars,
  footer,
}: {
  title: string;
  icon: typeof MessageCircle;
  sourceLabel: string;
  detail: string;
  highlight: { label: string; value: string };
  metrics: { label: string; value: string }[];
  bars: { label: string; value: number }[];
  footer: string;
}) {
  const maxBarValue = Math.max(...bars.map((item) => item.value), 1);
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
      <div className="mt-3 flex items-start justify-between gap-3">
        <p className="text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
        <div className="min-w-[108px] rounded-xl border border-primary/15 bg-primary/5 px-3 py-2 text-right">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{highlight.label}</div>
          <div className="mt-1 text-sm font-semibold text-foreground">{highlight.value}</div>
        </div>
      </div>
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
      <div className="mt-4 space-y-2">
        {bars.map((bar) => (
          <div key={`${title}-${bar.label}`}>
            <div className="flex items-center justify-between gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              <span>{bar.label}</span>
              <span>{formatNumber(bar.value)}</span>
            </div>
            <div className="mt-1 h-2 rounded-full bg-surface">
              <div
                className="h-2 rounded-full bg-primary"
                style={{ width: `${Math.max(6, (bar.value / maxBarValue) * 100)}%` }}
              />
            </div>
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
