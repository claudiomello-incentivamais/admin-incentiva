// Mock data layer grounded in the current governance snapshot.
// Replace these functions with real API calls later — component layer should not change.

export type OperationStatus = "healthy" | "monitor" | "risk" | "critical";
export type Priority = "P0" | "P1" | "P2" | "P3";

export interface Operation {
  id: string;
  name: string;
  client: string;
  priority: Priority;
  focus: string;
  score: number; // 0-100, lower means worse
  baseCoverage: number; // 0-100 %
  dataReconciliation: number; // 0-100 %
  monthlyConversion: number; // 0-100 %
  health: OperationStatus;
  owner: string;
  notionRecords?: number;
  matchRatePct?: number;
  stageAlignmentPct?: number;
  statusMismatchCount?: number;
  notionOnlyCount?: number;
  refreshedAt?: string | null;
}

export interface GlobalKpis {
  monitored: number;
  atRisk: number;
  critical: number;
  baseCoverage: number; // %
  totalLeads: number;
  monthlyConversions: number;
  conversionDelta: number; // % vs prev period
  leadsDelta: number;
  coverageDelta: number;
  riskDelta: number;
}

export interface ExecutiveInsight {
  id: string;
  severity: "critical" | "risk" | "monitor" | "info";
  title: string;
  detail: string;
  operationId?: string;
  timestamp: string;
}

export interface IncentivaCockpitSummary {
  health: OperationStatus;
  focus: string;
  priorityScore: number;
  stageAlignmentPct: number;
  matchRatePct: number;
  avgLeadScore: number;
  supabaseRecords: number;
  notionRecords: number;
  activeWorkflows: number;
  totalWorkflows: number;
  success7d: number;
  error7d: number;
  waiting7d: number;
}

export interface IncentivaFunnelStage {
  id: string;
  label: string;
  count: number;
  touchedThisMonth?: number;
}

export interface IncentivaBaseMetric {
  id: string;
  label: string;
  value: number;
  unit?: string;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
  detail: string;
}

export interface IncentivaChannelStatus {
  id: string;
  label: string;
  health: OperationStatus;
  activeWorkflows: number;
  totalWorkflows: number;
  headline: string;
  detail: string;
}

export interface IncentivaWorkflowFamily {
  id: string;
  label: string;
  total: number;
  active: number;
  health: OperationStatus;
  summary: string;
}

export interface IncentivaWorkflowRun {
  name: string;
  family: string;
  active: boolean;
  executions7d: number;
  success7d: number;
  error7d: number;
  waiting7d: number;
  lastRun: string;
}

export interface IncentivaWhatsappHealthMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaWhatsappHealthTrack {
  id: string;
  label: string;
  health: OperationStatus;
  headline: string;
  detail: string;
  workflows: string;
}

export interface IncentivaEmailHealthMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaEmailHealthTrack {
  id: string;
  label: string;
  health: OperationStatus;
  headline: string;
  detail: string;
  recommendation: string;
}

export interface IncentivaWorkflowInsightMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaWorkflowInsight {
  id: string;
  familyId: string;
  label: string;
  health: OperationStatus;
  headline: string;
  detail: string;
  recommendation: string;
}

export interface IncentivaProspectingMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaProspectingLane {
  id: string;
  label: string;
  health: OperationStatus;
  headline: string;
  detail: string;
  recommendation: string;
}

export interface IncentivaExecutionBacklogMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaExecutionBacklogItem {
  id: string;
  lane: string;
  priority: "P0" | "P1" | "P2";
  health: OperationStatus;
  owner: string;
  headline: string;
  detail: string;
  nextStep: string;
}

export interface IncentivaWorkflowDrilldownMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaWorkflowDrilldownItem {
  id: string;
  family: string;
  health: OperationStatus;
  owner: string;
  highlightedWorkflow: string;
  headline: string;
  detail: string;
  nextStep: string;
}

export interface IncentivaCockpitAlert {
  id: string;
  severity: "critical" | "risk" | "monitor" | "info";
  title: string;
  detail: string;
}

export interface IncentivaCockpitData {
  operationName: string;
  snapshotLabel: string;
  source: "snapshot" | "live";
  summary: IncentivaCockpitSummary;
  funnel: IncentivaFunnelStage[];
  baseMetrics: IncentivaBaseMetric[];
  prospectingReadiness: {
    metrics: IncentivaProspectingMetric[];
    lanes: IncentivaProspectingLane[];
  };
  executionBacklog: {
    metrics: IncentivaExecutionBacklogMetric[];
    items: IncentivaExecutionBacklogItem[];
  };
  workflowDrilldown: {
    metrics: IncentivaWorkflowDrilldownMetric[];
    items: IncentivaWorkflowDrilldownItem[];
  };
  emailHealth: {
    metrics: IncentivaEmailHealthMetric[];
    tracks: IncentivaEmailHealthTrack[];
  };
  whatsappHealth: {
    metrics: IncentivaWhatsappHealthMetric[];
    tracks: IncentivaWhatsappHealthTrack[];
  };
  workflowIntelligence: {
    metrics: IncentivaWorkflowInsightMetric[];
    insights: IncentivaWorkflowInsight[];
  };
  channels: IncentivaChannelStatus[];
  workflowFamilies: IncentivaWorkflowFamily[];
  topWorkflows: IncentivaWorkflowRun[];
  alerts: IncentivaCockpitAlert[];
}

export interface GlobalDashboardData {
  source: "snapshot" | "live";
  snapshotLabel: string;
  kpis: GlobalKpis;
  operations: Operation[];
  distribution: Record<OperationStatus, number>;
  insights: ExecutiveInsight[];
}

export interface IntegrationMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IntegrationSource {
  id: string;
  title: string;
  category: string;
  health: OperationStatus;
  owner: string;
  syncStatus: "live" | "guarded" | "manual" | "planned" | "snapshot";
  visibility: "internal" | "client-safe" | "restricted";
  sourceOfTruth: string;
  lastSync: string;
  headline: string;
  detail: string;
  powers: string[];
}

export interface IntegrationBridge {
  id: string;
  from: string;
  to: string;
  health: OperationStatus;
  title: string;
  detail: string;
  nextStep: string;
}

export interface IntegrationActionLane {
  id: string;
  title: string;
  owner: string;
  target: string;
  health: OperationStatus;
  detail: string;
  nextStep: string;
}

export interface IntegrationHubData {
  source: "snapshot" | "live";
  snapshotLabel: string;
  metrics: IntegrationMetric[];
  sources: IntegrationSource[];
  bridges: IntegrationBridge[];
  actionLanes: IntegrationActionLane[];
}

export interface PortalPublishCheckpoint {
  id: string;
  title: string;
  status: "ready" | "monitor" | "blocked";
  detail: string;
}

export interface PortalPublishPacket {
  operationId: string;
  operationName: string;
  clientLabel: string;
  privateSlug: string;
  privatePath: string;
  externalCutover: string;
  audience: string;
  authLayer: string;
  visibility: string;
  owner: string;
  publishHealth: OperationStatus;
  publishStage: string;
  finalCutoverStage: string;
  finalCutoverReadinessPct: number;
  headline: string;
  checkpoints: PortalPublishCheckpoint[];
  cutoverBlockers: string[];
}

export interface PortalLiveSourceCard {
  id: "notion" | "trello";
  title: string;
  health: OperationStatus;
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
}

export interface ScoreDriver {
  id: string;
  label: string;
  value: number;
  weight: number;
  health: OperationStatus;
  detail: string;
}

export interface OperationActionPlan {
  headline: string;
  causes: string[];
  actions: string[];
  discordMessage: string;
  trelloCardTitle: string;
}

export interface ExecutiveCommandItem {
  id: string;
  operationId: string;
  operationName: string;
  priority: Priority;
  health: OperationStatus;
  lane: string;
  owner: string;
  channel: "Trello" | "Discord" | "Admin";
  title: string;
  detail: string;
  nextStep: string;
}

export interface ExecutiveFocusArea {
  id: string;
  label: string;
  count: number;
  owner: string;
  channel: "Trello" | "Discord" | "Admin";
  headline: string;
  detail: string;
}

const operations: Operation[] = [
  {
    id: "cafe-fazenda-brasil",
    name: "Café Fazenda Brasil",
    client: "Café Fazenda Brasil",
    priority: "P0",
    focus: "Reposição de base",
    score: 34,
    baseCoverage: 41,
    dataReconciliation: 62,
    monthlyConversion: 6.2,
    health: "critical",
    owner: "Sales Ops",
  },
  {
    id: "acelerato",
    name: "Acelerato",
    client: "Acelerato",
    priority: "P0",
    focus: "Reposição de base",
    score: 46,
    baseCoverage: 49,
    dataReconciliation: 98.2,
    monthlyConversion: 8.4,
    health: "risk",
    owner: "Sales Ops",
  },
  {
    id: "incentiva",
    name: "Incentiva",
    client: "Incentiva Mais",
    priority: "P0",
    focus: "Reposição de base",
    score: 49,
    baseCoverage: 52,
    dataReconciliation: 95.7,
    monthlyConversion: 9.8,
    health: "risk",
    owner: "Sales Ops",
  },
  {
    id: "nimbus",
    name: "Nimbus",
    client: "Nimbus",
    priority: "P0",
    focus: "Reposição de base",
    score: 51,
    baseCoverage: 54,
    dataReconciliation: 96.2,
    monthlyConversion: 8.7,
    health: "risk",
    owner: "Sales Ops",
  },
  {
    id: "prime-action",
    name: "Prime Action",
    client: "Prime Action",
    priority: "P1",
    focus: "Ajuste de funil",
    score: 57,
    baseCoverage: 63,
    dataReconciliation: 89.4,
    monthlyConversion: 10.9,
    health: "risk",
    owner: "Sales Ops",
  },
  {
    id: "plan-idiomas",
    name: "Plan Idiomas",
    client: "Plan Idiomas",
    priority: "P1",
    focus: "Normalização comercial",
    score: 61,
    baseCoverage: 68,
    dataReconciliation: 89.2,
    monthlyConversion: 11.4,
    health: "monitor",
    owner: "Sales Ops",
  },
  {
    id: "trial-ambiental",
    name: "Trial Ambiental",
    client: "Trial Ambiental",
    priority: "P1",
    focus: "Confiabilidade de dados",
    score: 64,
    baseCoverage: 71,
    dataReconciliation: 85.5,
    monthlyConversion: 10.2,
    health: "monitor",
    owner: "Sales Ops",
  },
  {
    id: "docseg",
    name: "DocSeg",
    client: "DocSeg",
    priority: "P2",
    focus: "Monitoramento",
    score: 69,
    baseCoverage: 77,
    dataReconciliation: 96.0,
    monthlyConversion: 12.8,
    health: "monitor",
    owner: "Sales Ops",
  },
  {
    id: "lima-duarte",
    name: "Lima Duarte Alimentos",
    client: "Lima Duarte Alimentos",
    priority: "P2",
    focus: "Cadência multicanal",
    score: 74,
    baseCoverage: 81,
    dataReconciliation: 90.0,
    monthlyConversion: 13.6,
    health: "healthy",
    owner: "Sales Ops",
  },
  {
    id: "iamit",
    name: "Iamit",
    client: "Iamit",
    priority: "P2",
    focus: "Reconciliação semântica",
    score: 78,
    baseCoverage: 85,
    dataReconciliation: 75.1,
    monthlyConversion: 12.1,
    health: "healthy",
    owner: "Sales Ops",
  },
  {
    id: "we9",
    name: "We9",
    client: "Shopping Jaraguá Araraquara",
    priority: "P3",
    focus: "Refino de estágio",
    score: 82,
    baseCoverage: 89,
    dataReconciliation: 74.0,
    monthlyConversion: 14.2,
    health: "healthy",
    owner: "Sales Ops",
  },
];

type TrelloOperationalState = {
  segment: string;
  status: "open" | "quiet";
  count: number;
  lastAlertAt: string;
  lastObservedAt: string;
  cardUrl: string;
};

const trelloOperationalStateByOperationName: Record<string, TrelloOperationalState[]> = {
  Acelerato: [
    {
      segment: "Acelerato",
      status: "open",
      count: 0,
      lastAlertAt: "",
      lastObservedAt: "2026-06-30T14:04:08.075623-03:00",
      cardUrl: "",
    },
    {
      segment: "Tecnologia",
      status: "open",
      count: 0,
      lastAlertAt: "2026-06-25T10:40:09.101562-03:00",
      lastObservedAt: "2026-06-30T14:04:08.225275-03:00",
      cardUrl: "https://trello.com/c/a1pCP8D3/16-nova-lista-tecnologia-50-n%C3%A3o-iniciados",
    },
  ],
  "Café Fazenda Brasil": [
    {
      segment: "Café Fazenda Brasil",
      status: "quiet",
      count: 660,
      lastAlertAt: "",
      lastObservedAt: "2026-06-30T14:04:08.376456-03:00",
      cardUrl: "",
    },
  ],
  DocSeg: [
    {
      segment: "DocSeg",
      status: "open",
      count: 20,
      lastAlertAt: "2026-06-25T10:19:48.364753-03:00",
      lastObservedAt: "2026-06-30T14:04:08.596253-03:00",
      cardUrl: "https://trello.com/c/TVMwVOe3/12-nova-lista-docseg-50-n%C3%A3o-iniciados",
    },
  ],
  Iamit: [
    {
      segment: "Iamit",
      status: "quiet",
      count: 287,
      lastAlertAt: "",
      lastObservedAt: "2026-06-30T14:04:08.807474-03:00",
      cardUrl: "",
    },
  ],
  Incentiva: [
    {
      segment: "Karen",
      status: "open",
      count: 0,
      lastAlertAt: "2026-06-25T10:40:22.763273-03:00",
      lastObservedAt: "2026-06-30T14:04:09.143993-03:00",
      cardUrl: "https://trello.com/c/jgAitx2U/89-nova-lista-incentiva-50-n%C3%A3o-iniciados",
    },
  ],
  "Lima Duarte Alimentos": [
    {
      segment: "Lima Duarte Alimentos",
      status: "quiet",
      count: 180,
      lastAlertAt: "",
      lastObservedAt: "2026-06-30T14:04:09.397499-03:00",
      cardUrl: "",
    },
  ],
  Nimbus: [
    {
      segment: "Nimbus",
      status: "open",
      count: 0,
      lastAlertAt: "2026-06-25T10:40:38.007775-03:00",
      lastObservedAt: "2026-06-30T14:04:09.510734-03:00",
      cardUrl: "https://trello.com/c/KucshyuO/11-nova-lista-nimbus-50-n%C3%A3o-iniciados",
    },
  ],
  "Plan Idiomas": [
    {
      segment: "Plan Idiomas",
      status: "quiet",
      count: 199,
      lastAlertAt: "",
      lastObservedAt: "2026-06-30T14:04:09.693043-03:00",
      cardUrl: "",
    },
  ],
  "Prime Action": [
    {
      segment: "Agente IA Brasil",
      status: "open",
      count: 0,
      lastAlertAt: "2026-06-25T10:40:51.271804-03:00",
      lastObservedAt: "2026-06-30T14:04:09.862994-03:00",
      cardUrl: "https://trello.com/c/f4Q7tVgb/15-nova-lista-agente-ia-brasil-50-n%C3%A3o-iniciados",
    },
    {
      segment: "Consultoria Brasil",
      status: "open",
      count: 0,
      lastAlertAt: "2026-06-25T10:41:06.836977-03:00",
      lastObservedAt: "2026-06-30T14:04:11.012317-03:00",
      cardUrl: "https://trello.com/c/7YF5nZpv/16-nova-lista-consultoria-brasil-50-n%C3%A3o-iniciados",
    },
    {
      segment: "Consultoria México",
      status: "quiet",
      count: 427,
      lastAlertAt: "",
      lastObservedAt: "2026-06-30T14:04:12.130467-03:00",
      cardUrl: "",
    },
  ],
  "Trial Ambiental": [
    {
      segment: "Trial Ambiental",
      status: "quiet",
      count: 61,
      lastAlertAt: "",
      lastObservedAt: "2026-06-30T14:04:12.244483-03:00",
      cardUrl: "",
    },
  ],
  We9: [
    {
      segment: "WE9",
      status: "quiet",
      count: 211,
      lastAlertAt: "",
      lastObservedAt: "2026-06-30T14:04:12.463796-03:00",
      cardUrl: "",
    },
  ],
};

const trelloCardRuntimeByShortLink: Record<
  string,
  {
    boardName: string;
    listName: string;
    ownerLabel: string;
    lastActivityAt: string;
    followUpText: string;
  }
> = {
  jgAitx2U: {
    boardName: "Incentiva",
    listName: "Em andamento",
    ownerLabel: "Sem owner atribuído no card",
    lastActivityAt: "2026-06-25T13:40:14.869Z",
    followUpText:
      "Validação: base confirmada como esgotada (0 não iniciados de 2.737 total). Prioridade alta para reposição da lista.",
  },
  KucshyuO: {
    boardName: "Nimbus",
    listName: "Em andamento",
    ownerLabel: "Sem owner atribuído no card",
    lastActivityAt: "2026-06-25T13:40:28.081Z",
    followUpText: "Sem comentário recente no card.",
  },
  f4Q7tVgb: {
    boardName: "Prime Action",
    listName: "Em andamento",
    ownerLabel: "Bruna",
    lastActivityAt: "2026-06-25T13:44:35.145Z",
    followUpText:
      "Bruna, preciso de nova lista/enriquecimento para Agente IA Brasil hoje. Critério de saída: mínimo 50 prospects não iniciados no Supabase para manter a cadência FUP1 viva.",
  },
  "7YF5nZpv": {
    boardName: "Prime Action",
    listName: "Em andamento",
    ownerLabel: "Sem owner atribuído no card",
    lastActivityAt: "2026-06-25T13:40:55.559Z",
    followUpText: "Sem comentário recente no card.",
  },
  a1pCP8D3: {
    boardName: "Acelerato",
    listName: "Em andamento",
    ownerLabel: "Sem owner atribuído no card",
    lastActivityAt: "2026-06-25T13:39:54.539Z",
    followUpText: "Sem comentário recente no card.",
  },
  TVMwVOe3: {
    boardName: "DocSeg",
    listName: "Em andamento",
    ownerLabel: "Sem owner atribuído no card",
    lastActivityAt: "2026-06-25T13:19:47.894Z",
    followUpText: "Sem comentário recente no card.",
  },
};

const cadenceOperationalStateByOperationName: Record<
  string,
  { status: "open" | "quiet"; count: number; lastObservedAt: string; lastMentionedAt: string }
> = {
  Incentiva: {
    status: "open",
    count: 29,
    lastObservedAt: "2026-06-29T10:10:45.328619-03:00",
    lastMentionedAt: "2026-06-23T17:48:46.666740-03:00",
  },
  We9: {
    status: "open",
    count: 22,
    lastObservedAt: "2026-06-26T15:13:04.287233-03:00",
    lastMentionedAt: "2026-06-26T15:13:04.287262-03:00",
  },
  "Trial Ambiental": {
    status: "quiet",
    count: 9,
    lastObservedAt: "2026-06-24T17:57:51.010197-03:00",
    lastMentionedAt: "",
  },
  "Prime Action": {
    status: "open",
    count: 222,
    lastObservedAt: "2026-06-29T15:44:48.408259-03:00",
    lastMentionedAt: "2026-06-24T12:09:33.761291-03:00",
  },
  DocSeg: {
    status: "open",
    count: 63,
    lastObservedAt: "2026-06-26T15:11:27.280462-03:00",
    lastMentionedAt: "2026-06-26T15:08:46.469323-03:00",
  },
  Acelerato: {
    status: "open",
    count: 189,
    lastObservedAt: "2026-06-30T10:21:32.774248-03:00",
    lastMentionedAt: "2026-06-30T10:21:32.774278-03:00",
  },
  "Plan Idiomas": {
    status: "quiet",
    count: 6,
    lastObservedAt: "2026-06-26T15:21:26.902073-03:00",
    lastMentionedAt: "",
  },
};

const insights: ExecutiveInsight[] = [
  {
    id: "i1",
    severity: "critical",
    title: "Café Fazenda Brasil sem lastro operacional consolidado",
    detail:
      "A operação aparece com leitura comercial no Notion, mas ainda não está refletida com força suficiente na camada operacional do Supabase.",
    operationId: "cafe-fazenda-brasil",
    timestamp: "agora",
  },
  {
    id: "i2",
    severity: "risk",
    title: "Acelerato, Incentiva e Nimbus puxam a fila de reposição de base",
    detail:
      "As três operações compartilham o mesmo padrão: cobertura de não iniciados abaixo da banda ideal e risco direto sobre continuidade de cadência.",
    timestamp: "há 18 min",
  },
  {
    id: "i3",
    severity: "monitor",
    title: "Prime Action e Plan Idiomas já pedem leitura mais semântica do funil",
    detail:
      "O ponto principal deixou de ser identidade do lead e passou a ser alinhamento entre estágio operacional e estágio comercial.",
    timestamp: "há 34 min",
  },
  {
    id: "i4",
    severity: "info",
    title: "Incentiva já tem maturidade para cockpit profundo por operação",
    detail:
      "A operação concentra volume, automação multicanal e telemetria suficiente para justificar drill-down de workflow, WhatsApp health e inteligência por ICP.",
    operationId: "incentiva",
    timestamp: "há 52 min",
  },
];

const incentivaCockpit: IncentivaCockpitData = {
  operationName: "Incentiva",
  snapshotLabel: "Snapshot real consolidado em 29 jun 2026",
  source: "snapshot",
  summary: {
    health: "risk",
    focus: "Reposição de base",
    priorityScore: 55,
    stageAlignmentPct: 95.69,
    matchRatePct: 99.85,
    avgLeadScore: 71.36,
    supabaseRecords: 2737,
    notionRecords: 2965,
    activeWorkflows: 41,
    totalWorkflows: 52,
    success7d: 4835,
    error7d: 7,
    waiting7d: 5,
  },
  funnel: [
    { id: "prospecting", label: "Prospecting", count: 2443, touchedThisMonth: 28 },
    { id: "lead-interessado", label: "Lead Interessado", count: 35, touchedThisMonth: 25 },
    { id: "mql-agendado", label: "MQL Agendado", count: 7, touchedThisMonth: 2 },
    { id: "mql-realizado", label: "MQL Realizado", count: 5, touchedThisMonth: 0 },
    { id: "negotiation", label: "Negociação", count: 8, touchedThisMonth: 0 },
    { id: "won", label: "Cliente Ganho", count: 2, touchedThisMonth: 1 },
    { id: "lost", label: "Perdido", count: 452 },
  ],
  baseMetrics: [
    {
      id: "unstarted",
      label: "Não iniciados canônicos",
      value: 6,
      tone: "destructive",
      detail: "Cobertura muito abaixo da meta diária atual de 25 ativações.",
    },
    {
      id: "coverage-days",
      label: "Cobertura em dias",
      value: 0,
      unit: "d",
      tone: "destructive",
      detail: "A base atual não sustenta a cadência com folga operacional.",
    },
    {
      id: "reactivation",
      label: "Pool de reativação",
      value: 812,
      tone: "warning",
      detail: "Volume grande o suficiente para virar alavanca de curto prazo.",
    },
    {
      id: "suppressed",
      label: "Supressões ativas",
      value: 398,
      tone: "info",
      detail: "Base já tem massa relevante fora de cadência produtiva.",
    },
    {
      id: "reprospeccao",
      label: "Reprospecção elegível",
      value: 6,
      tone: "warning",
      detail: "Baixo volume elegível imediato para reaproveitamento.",
    },
    {
      id: "retomada",
      label: "Retomada elegível",
      value: 10,
      tone: "info",
      detail: "Fila de retomada pequena, mas acionável em paralelo.",
    },
  ],
  prospectingReadiness: {
    metrics: [
      {
        id: "icp-coverage",
        label: "Cobertura vs meta diária",
        value: "6 / 25",
        tone: "critical",
        detail: "A base nova cobre só uma fração da meta diária atual de ativações.",
      },
      {
        id: "coverage-window",
        label: "Janela de sustentação",
        value: "0 d",
        tone: "critical",
        detail: "O funil novo não sustenta sequer um dia cheio de cadência com folga.",
      },
      {
        id: "reactivation-volume",
        label: "Pulmão de base",
        value: "812",
        tone: "warning",
        detail: "O maior volume reaproveitável hoje está na camada de reativação.",
      },
      {
        id: "recovery-lanes",
        label: "Faixas acionáveis",
        value: "16",
        tone: "monitor",
        detail: "Reprospecção e retomada somadas ainda são pequenas, mas já operáveis.",
      },
    ],
    lanes: [
      {
        id: "new-list",
        label: "Lista nova / ICP",
        health: "critical",
        headline: "Reposição de lista continua sendo o gargalo nº1 da Incentiva.",
        detail: "Com apenas 6 não iniciados canônicos, o problema central já não é execução e sim abastecimento qualificado da cadência.",
        recommendation: "Priorizar reposição de lista e cobertura de ICP antes de buscar ganho marginal em copy ou workflow.",
      },
      {
        id: "reactivation",
        label: "Reativação",
        health: "monitor",
        headline: "Reativação é a maior alavanca de amortecimento de curto prazo.",
        detail: "O pool atual já é grande o suficiente para segurar parte da pressão enquanto a lista nova é refeita.",
        recommendation: "Usar reativação como colchão tático, sem confundir isso com solução estrutural de base.",
      },
      {
        id: "reprospeccao",
        label: "Reprospecção",
        health: "monitor",
        headline: "Reprospecção existe, mas ainda não muda o jogo sozinha.",
        detail: "O volume elegível imediato é baixo e serve mais como complemento do que como motor principal da operação.",
        recommendation: "Acionar essa fila em paralelo, mas não contar com ela como cobertura central do mês.",
      },
      {
        id: "retomada",
        label: "Retomada",
        health: "healthy",
        headline: "Retomada já é uma faixa pequena e executável sem grande fricção.",
        detail: "A fila é curta, porém com boa chance de virar tração rápida em cima de conversa já iniciada.",
        recommendation: "Manter retomada rodando como camada tática enquanto a lista nova e a reativação ganham escala.",
      },
    ],
  },
  executionBacklog: {
    metrics: [
      {
        id: "open-fronts",
        label: "Frentes abertas",
        value: "4",
        tone: "monitor",
        detail: "A Incentiva já tem quatro blocos claros que pedem ação executiva dedicada.",
      },
      {
        id: "p0-items",
        label: "Ações P0",
        value: "2",
        tone: "critical",
        detail: "Reposição de base e fila de e-mail seguem como prioridades imediatas.",
      },
      {
        id: "owner-clusters",
        label: "Donos sugeridos",
        value: "3",
        tone: "info",
        detail: "Sales Ops, Lista/ICP e Claw já cobrem a maior parte da próxima rodada.",
      },
      {
        id: "v2-readiness",
        label: "Pronto para V2",
        value: "Sim",
        tone: "success",
        detail: "A operação já tem densidade e clareza suficiente para uma camada V2 orientada a intervenção.",
      },
    ],
    items: [
      {
        id: "backlog-base",
        lane: "ICP / Lista",
        priority: "P0",
        health: "critical",
        owner: "Bruna + Sales Ops",
        headline: "Reposição de não iniciados continua sendo a ação mais urgente.",
        detail: "A operação está com apenas 6 não iniciados canônicos para uma meta diária de 25 ativações, o que trava a sustentação da cadência.",
        nextStep: "Abrir reposição de lista por ICP como entrega imediata e medir a recuperação da cobertura em dias.",
      },
      {
        id: "backlog-email",
        lane: "E-mail FUP",
        priority: "P0",
        health: "risk",
        owner: "Claw",
        headline: "FUP2 precisa sair da zona de waiting antes de escalar invisivelmente.",
        detail: "O canal de e-mail não parece quebrado estruturalmente, mas já apresenta fila sem throughput útil no workflow mais crítico.",
        nextStep: "Abrir drill-down do FUP2 com throughput, fila e saída útil por workflow na próxima iteração da V2.",
      },
      {
        id: "backlog-whatsapp",
        lane: "WhatsApp",
        priority: "P1",
        health: "monitor",
        owner: "Sales Ops",
        headline: "Canal está íntegro, mas depende demais da recomposição da base.",
        detail: "A infraestrutura do WhatsApp está saudável; o principal risco é o canal perder tração por falta de abastecimento novo.",
        nextStep: "Reavaliar o peso de outbound, reativação e retomada assim que a cobertura de base voltar a subir.",
      },
      {
        id: "backlog-linkedin",
        lane: "LinkedIn Social",
        priority: "P2",
        health: "monitor",
        owner: "Claw + Sales Ops",
        headline: "A frente social já pede leitura mais semântica, não mais estrutural.",
        detail: "Há densidade real de workflows e sinais de uso, mas ainda falta separar descoberta, fila, engajamento e risco numa camada mais clara.",
        nextStep: "Na V2, quebrar LinkedIn em submódulos operacionais para enxergar social selling com mais nitidez.",
      },
    ],
  },
  workflowDrilldown: {
    metrics: [
      {
        id: "families-observed",
        label: "Famílias observadas",
        value: "5",
        tone: "success",
        detail: "A Incentiva já tem massa suficiente para leitura semântica das famílias principais.",
      },
      {
        id: "families-critical",
        label: "Famílias críticas",
        value: "1",
        tone: "risk",
        detail: "E-mail FUP continua sendo a única família com sinal de gargalo claro no snapshot atual.",
      },
      {
        id: "workflow-focus",
        label: "Workflow em foco",
        value: "FUP2",
        tone: "critical",
        detail: "O workflow que melhor representa risco operacional hoje continua sendo o FUP2 de e-mail.",
      },
      {
        id: "best-engine",
        label: "Motor referência",
        value: "Instagram",
        tone: "healthy",
        detail: "Instagram segue como benchmark de volume, estabilidade e observabilidade para o cockpit.",
      },
    ],
    items: [
      {
        id: "drill-email",
        family: "E-mail FUP",
        health: "risk",
        owner: "Claw",
        highlightedWorkflow: "Outbound - Email - FUP2",
        headline: "A família de e-mail já tem workflow específico pedindo drill-down.",
        detail: "O FUP2 concentra waiting sem sucesso útil, enquanto o resto da família permanece ativo, o que caracteriza gargalo localizado e rastreável.",
        nextStep: "Abrir visão por workflow de e-mail com throughput, waiting, última corrida e saída útil.",
      },
      {
        id: "drill-instagram",
        family: "Instagram",
        health: "healthy",
        owner: "Claw + Sales Ops",
        highlightedWorkflow: "Lead Inbound Sync",
        headline: "Instagram é hoje o melhor padrão operacional da Incentiva.",
        detail: "A família entrega alto volume, erro marginal e workflows com papéis claros, servindo como referência de como a observabilidade deveria ficar nos demais canais.",
        nextStep: "Usar Instagram como baseline visual e semântico para a futura V2 por workflow.",
      },
      {
        id: "drill-linkedin",
        family: "LinkedIn Social",
        health: "monitor",
        owner: "Claw + Sales Ops",
        highlightedWorkflow: "Família social / fila distribuída",
        headline: "LinkedIn já deixou de ser questão estrutural e virou questão de leitura.",
        detail: "Existe densidade relevante de workflows, mas a frente ainda aparece muito agregada, o que esconde diferenças entre descoberta, fila, engajamento e risco.",
        nextStep: "Quebrar a família em submódulos operacionais para ler descoberta, score, fila e social selling separadamente.",
      },
      {
        id: "drill-whatsapp",
        family: "WhatsApp FUP",
        health: "monitor",
        owner: "Sales Ops",
        highlightedWorkflow: "FUP1-FUP4 outbound",
        headline: "WhatsApp tem boa saúde técnica, mas não pode ser lido só por uptime.",
        detail: "O canal está íntegro nos workflows principais, porém sua performance prática depende diretamente da disponibilidade de base e da mistura entre outbound, leads e retomada.",
        nextStep: "Na próxima camada, cruzar WhatsApp com pressão de base e distribuição de corridas por frente.",
      },
    ],
  },
  emailHealth: {
    metrics: [
      {
        id: "email-active",
        label: "Infra de e-mail ativa",
        value: "5/5",
        tone: "success",
        detail: "Todos os workflows FUP de e-mail seguem ativos na camada atual.",
      },
      {
        id: "email-waiting",
        label: "Waiting concentrado",
        value: "5",
        tone: "risk",
        detail: "O snapshot fechou o FUP2 com 5 itens em waiting e sem erro explícito.",
      },
      {
        id: "email-throughput",
        label: "Throughput útil 7d",
        value: "0",
        tone: "critical",
        detail: "O principal workflow monitorado de e-mail não converteu waiting em sucesso no período.",
      },
      {
        id: "email-family-risk",
        label: "Família sob risco",
        value: "FUP2",
        tone: "monitor",
        detail: "O gargalo atual é específico, não uma quebra total da frente de e-mail.",
      },
    ],
    tracks: [
      {
        id: "email-fup2",
        label: "FUP2 / fila",
        health: "risk",
        headline: "FUP2 virou o primeiro gargalo silencioso do canal.",
        detail: "Há corrida recente, mas ela acumulou waiting sem sucesso confirmado, o que já justifica leitura de throughput e fila.",
        recommendation: "A próxima intervenção deve abrir o detalhe do FUP2 antes que a fila escale invisivelmente.",
      },
      {
        id: "email-family",
        label: "Família E-mail FUP",
        health: "monitor",
        headline: "A família está viva, mas ainda sem observabilidade executiva suficiente.",
        detail: "Os 5 workflows estão ativos, porém o cockpit ainda não diferencia claramente throughput, fila e sucesso por etapa.",
        recommendation: "Na V2, separar throughput, waiting e saída útil por workflow da família de e-mail.",
      },
      {
        id: "email-priority",
        label: "Próxima prioridade",
        health: "healthy",
        headline: "O problema de e-mail já está isolado o bastante para virar módulo próprio.",
        detail: "Não parece uma quebra estrutural do canal inteiro, e sim um ponto localizado que agora já merece drill-down.",
        recommendation: "Depois deste bloco, o próximo corte natural é dashboard de throughput por workflow e backlog operacional por frente.",
      },
    ],
  },
  whatsappHealth: {
    metrics: [
      {
        id: "infra",
        label: "Infraestrutura ativa",
        value: "8/8",
        tone: "success",
        detail: "Todos os workflows FUP de WhatsApp estão ativos na camada atual do n8n VPS.",
      },
      {
        id: "base-pressure",
        label: "Pressão de base",
        value: "6",
        tone: "critical",
        detail: "Só 6 não iniciados canônicos sustentam hoje a cadência de WhatsApp.",
      },
      {
        id: "outbound-runs",
        label: "Outbound com corrida",
        value: "4",
        tone: "healthy",
        detail: "Os FUPs outbound 1 a 4 rodaram no snapshot dos últimos 7 dias.",
      },
      {
        id: "lead-lanes-idle",
        label: "Leads sem giro",
        value: "4",
        tone: "risk",
        detail: "Os FUPs de leads seguem ativos, mas sem execução recente no corte atual.",
      },
    ],
    tracks: [
      {
        id: "outbound",
        label: "Outbound WhatsApp",
        health: "healthy",
        headline: "FUP1 a FUP4 ativos e com execução recente.",
        detail: "A cadência outbound está tecnicamente íntegra; o gargalo deixou de ser workflow e virou reposição de base.",
        workflows: "4 workflows com corrida",
      },
      {
        id: "leads",
        label: "Leads WhatsApp",
        health: "risk",
        headline: "FUP1 a FUP4 ativos, mas sem tráfego recente.",
        detail: "O bloco de leads não acusa quebra técnica, porém ficou sem giro no snapshot e pede leitura de entrada real da fila.",
        workflows: "4 workflows ativos / 0 execuções",
      },
      {
        id: "reativacao",
        label: "Reativação / Retomada",
        health: "monitor",
        headline: "Canal apto para amortecer a falta de base nova.",
        detail: "Retomada em WhatsApp já mostrou corrida recente e pode ganhar peso enquanto a reposição de lista é atacada.",
        workflows: "1 workflow com corrida",
      },
    ],
  },
  workflowIntelligence: {
    metrics: [
      {
        id: "active-families",
        label: "Famílias ativas",
        value: "11",
        tone: "success",
        detail: "A Incentiva já opera com densidade multicanal suficiente para leitura por família.",
      },
      {
        id: "email-risk",
        label: "Famílias sob risco",
        value: "1",
        tone: "risk",
        detail: "E-mail FUP concentra o principal sinal de fila silenciosa nesta camada.",
      },
      {
        id: "social-density",
        label: "Social selling ativo",
        value: "26/23",
        tone: "monitor",
        detail: "LinkedIn social + conexão + Instagram já sustentam uma malha densa de automação.",
      },
      {
        id: "top-engine",
        label: "Motor dominante",
        value: "Instagram",
        tone: "info",
        detail: "Instagram concentra a maior parte das execuções e hoje é o principal motor de volume.",
      },
    ],
    insights: [
      {
        id: "email-fup-bottleneck",
        familyId: "email_fup",
        label: "E-mail FUP",
        health: "risk",
        headline: "Waiting concentrado no FUP2 já merece leitura dedicada.",
        detail: "A família está 100% ativa, mas o FUP2 fechou o snapshot com 5 waiting e zero sucesso no período.",
        recommendation: "Abrir a próxima intervenção em throughput e fila do e-mail antes de virar gargalo invisível.",
      },
      {
        id: "instagram-engine",
        familyId: "instagram",
        label: "Instagram",
        health: "healthy",
        headline: "Instagram é hoje o motor operacional mais confiável da Incentiva.",
        detail: "Lead Inbound Sync, Action Queue e Engagement Score concentram volume alto e erro marginal.",
        recommendation: "Usar Instagram como referência de padrão visual e de observabilidade do cockpit.",
      },
      {
        id: "linkedin-spread",
        familyId: "linkedin_social",
        label: "LinkedIn Social",
        health: "monitor",
        headline: "Família extensa, porém ainda heterogênea em uso real.",
        detail: "Há boa cobertura de workflows ativos, mas a distribuição de execuções ainda é rasa e muito dispersa.",
        recommendation: "Separar descoberta, fila, engajamento e risco em leitura mais semântica na próxima V2.",
      },
      {
        id: "whatsapp-base-dependency",
        familyId: "whatsapp_fup",
        label: "WhatsApp FUP",
        health: "monitor",
        headline: "A infraestrutura está íntegra, mas o canal depende demais da reposição de base.",
        detail: "Os workflows de WhatsApp estão ativos e sem erro recente relevante, mas a sustentação comercial está pressionada pela falta de não iniciados.",
        recommendation: "Tratar a próxima melhoria do canal junto com ICP / lista / não iniciados, não isoladamente.",
      },
    ],
  },
  channels: [
    {
      id: "whatsapp",
      label: "WhatsApp",
      health: "monitor",
      activeWorkflows: 8,
      totalWorkflows: 8,
      headline: "Cadência ativa com cobertura de base pressionada",
      detail: "A camada técnica está operacional, mas a reposição de não iniciados virou o gargalo real.",
    },
    {
      id: "email",
      label: "E-mail",
      health: "risk",
      activeWorkflows: 5,
      totalWorkflows: 5,
      headline: "Fila com waiting recorrente em FUP2",
      detail: "A telemetria já mostra waiting acumulado, pedindo leitura mais fina de throughput.",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      health: "monitor",
      activeWorkflows: 14,
      totalWorkflows: 23,
      headline: "Social selling ativo, mas ainda heterogêneo",
      detail: "A operação já tem densidade real de workflows sociais e de follow-up para drill-down executivo.",
    },
    {
      id: "instagram-inbound",
      label: "Instagram / Inbound",
      health: "healthy",
      activeWorkflows: 7,
      totalWorkflows: 7,
      headline: "Canal mais volumoso da telemetria recente",
      detail: "Instagram concentrou a maior parte das execuções dos últimos 7 dias e já sustenta leitura de automação viva.",
    },
  ],
  workflowFamilies: [
    {
      id: "linkedin-social",
      label: "LinkedIn Social",
      total: 17,
      active: 9,
      health: "monitor",
      summary: "Família mais extensa da operação e base principal para social selling assistido.",
    },
    {
      id: "whatsapp-fup",
      label: "WhatsApp FUP",
      total: 8,
      active: 8,
      health: "healthy",
      summary: "Cadência 100% ativa na camada de workflows, com pressão hoje mais em base do que em infraestrutura.",
    },
    {
      id: "instagram",
      label: "Instagram",
      total: 6,
      active: 6,
      health: "healthy",
      summary: "Frente com maior volume recente e boa estabilidade operacional.",
    },
    {
      id: "email-fup",
      label: "E-mail FUP",
      total: 5,
      active: 5,
      health: "risk",
      summary: "Volume baixo com waiting presente, bom candidato para a próxima camada de workflow intelligence.",
    },
    {
      id: "reativacao",
      label: "Reativação",
      total: 3,
      active: 3,
      health: "monitor",
      summary: "Ativa e com espaço para ganhar protagonismo enquanto a base nova segue curta.",
    },
  ],
  topWorkflows: [
    {
      name: "Incentiva - Instagram - Lead Inbound Sync",
      family: "instagram",
      active: true,
      executions7d: 1281,
      success7d: 1280,
      error7d: 1,
      waiting7d: 0,
      lastRun: "29 jun 2026 · 20:35",
    },
    {
      name: "Incentiva - Instagram - Action Queue",
      family: "instagram",
      active: true,
      executions7d: 1280,
      success7d: 1278,
      error7d: 2,
      waiting7d: 0,
      lastRun: "29 jun 2026 · 20:34",
    },
    {
      name: "Incentiva - Instagram - Engagement Score",
      family: "instagram",
      active: true,
      executions7d: 1280,
      success7d: 1278,
      error7d: 2,
      waiting7d: 0,
      lastRun: "29 jun 2026 · 20:35",
    },
    {
      name: "Incentiva - Instagram - Agente Conversa",
      family: "agente_conversa",
      active: true,
      executions7d: 640,
      success7d: 639,
      error7d: 1,
      waiting7d: 0,
      lastRun: "29 jun 2026 · 20:34",
    },
    {
      name: "Incentiva - Prospecção Ativa - Outbound - Email - FUP2",
      family: "email_fup",
      active: true,
      executions7d: 5,
      success7d: 0,
      error7d: 0,
      waiting7d: 5,
      lastRun: "29 jun 2026 · 19:30",
    },
  ],
  alerts: [
    {
      id: "base-risk",
      severity: "critical",
      title: "Cobertura de não iniciados entrou em zona vermelha",
      detail: "A Incentiva fechou o snapshot com apenas 6 não iniciados canônicos para uma meta diária de 25 ativações.",
    },
    {
      id: "reconciliation",
      severity: "risk",
      title: "Reconciliação estrutural boa, semântica ainda pede ajuste",
      detail: "O match rate está em 99,85%, mas ainda existem 2.452 divergências de status e 283 registros só no Notion.",
    },
    {
      id: "email-waiting",
      severity: "monitor",
      title: "E-mail já mostrou waiting recorrente no FUP2",
      detail: "A família de e-mail está viva, mas a fila pede observação antes de virar gargalo silencioso.",
    },
    {
      id: "social-density",
      severity: "info",
      title: "Incentiva já tem densidade real para workflow intelligence",
      detail: "O volume de automação em Instagram, LinkedIn e Agente Conversa já justifica cockpit profundo por canal e família.",
    },
  ],
};

export function fetchOperations(): Operation[] {
  return [...operations].sort((a, b) => a.score - b.score);
}

export function fetchGlobalKpis(): GlobalKpis {
  const monitored = operations.length;
  const atRisk = operations.filter((o) => o.health === "risk").length;
  const critical = operations.filter((o) => o.health === "critical").length;
  const baseCoverage =
    operations.reduce((sum, operation) => sum + operation.baseCoverage, 0) / operations.length;

  return {
    monitored,
    atRisk,
    critical,
    baseCoverage: Math.round(baseCoverage * 10) / 10,
    totalLeads: 18_669,
    monthlyConversions: 98,
    conversionDelta: 6.8,
    leadsDelta: 4.2,
    coverageDelta: -3.1,
    riskDelta: -1.0,
  };
}

export function fetchStatusDistribution(): Record<OperationStatus, number> {
  return operations.reduce(
    (acc, operation) => {
      acc[operation.health] += 1;
      return acc;
    },
    { healthy: 0, monitor: 0, risk: 0, critical: 0 } as Record<OperationStatus, number>,
  );
}

export function fetchInsights(): ExecutiveInsight[] {
  return insights;
}

export function fetchIncentivaCockpit(): IncentivaCockpitData {
  return incentivaCockpit;
}

type GovernanceAdminGlobalRow = {
  operation_name: string;
  status_health: string;
  primary_focus: string;
  priority_score: number | string;
  supabase_total_records: number | string | null;
  notion_total_records: number | string | null;
  reactivation_count: number | string | null;
  reprospeccao_eligible_count: number | string | null;
  retomada_eligible_count: number | string | null;
  suppressed_count: number | string | null;
  avg_lead_score: number | string | null;
  daily_activation_target: number | string | null;
  coverage_days: number | string | null;
  canonical_unstarted_count: number | string | null;
  prospecting_count: number | string | null;
  lead_interessado_count: number | string | null;
  mql_agendado_count: number | string | null;
  mql_realizado_count: number | string | null;
  negotiation_count: number | string | null;
  won_count: number | string | null;
  lost_count: number | string | null;
  active_funnel_touched_this_month: number | string | null;
  lead_interessado_touched_this_month: number | string | null;
  mql_agendado_touched_this_month: number | string | null;
  mql_realizado_touched_this_month: number | string | null;
  negotiation_touched_this_month: number | string | null;
  won_touched_this_month: number | string | null;
  match_rate_pct: number | string | null;
  status_mismatch_count: number | string | null;
  notion_only_count: number | string | null;
  canonical_stage_alignment_pct: number | string | null;
  refreshed_at: string | null;
};

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    if (!normalized) return fallback;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toLabelDate(value: string | null | undefined) {
  if (!value) return "Leitura viva do Supabase";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Leitura viva do Supabase";
  return `Leitura viva do Supabase · ${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}`;
}

function normalizeHealth(value: string | null | undefined): OperationStatus {
  if (value === "critical") return "critical";
  if (value === "risk") return "risk";
  if (value === "healthy") return "healthy";
  return "monitor";
}

function coveragePctFromRow(row: GovernanceAdminGlobalRow) {
  const unstarted = toNumber(row.canonical_unstarted_count);
  const target = Math.max(1, toNumber(row.daily_activation_target, 1));
  return Math.max(0, Math.min(100, (unstarted / target) * 100));
}

function monthlyConversionPctFromRow(row: GovernanceAdminGlobalRow) {
  const wonTouched = toNumber(row.won_touched_this_month);
  const funnelTouched = Math.max(1, toNumber(row.active_funnel_touched_this_month));
  return (wonTouched / funnelTouched) * 100;
}

function applyLiveGovernanceRow(base: IncentivaCockpitData, row: GovernanceAdminGlobalRow): IncentivaCockpitData {
  const dailyActivationTarget = toNumber(row.daily_activation_target, 25);
  const canonicalUnstarted = toNumber(row.canonical_unstarted_count);
  const coverageDays = toNumber(row.coverage_days);
  const reactivationCount = toNumber(row.reactivation_count);
  const reprospeccaoEligible = toNumber(row.reprospeccao_eligible_count);
  const retomadaEligible = toNumber(row.retomada_eligible_count);
  const suppressedCount = toNumber(row.suppressed_count);
  const stageAlignmentPct = toNumber(row.canonical_stage_alignment_pct);
  const matchRatePct = toNumber(row.match_rate_pct);
  const avgLeadScore = toNumber(row.avg_lead_score);
  const priorityScore = toNumber(row.priority_score);
  const supabaseRecords = toNumber(row.supabase_total_records);
  const notionRecords = toNumber(row.notion_total_records);
  const activeFunnelTouched = toNumber(row.active_funnel_touched_this_month);
  const leadInteressadoTouched = toNumber(row.lead_interessado_touched_this_month);
  const mqlAgendadoTouched = toNumber(row.mql_agendado_touched_this_month);
  const mqlRealizadoTouched = toNumber(row.mql_realizado_touched_this_month);
  const negotiationTouched = toNumber(row.negotiation_touched_this_month);
  const wonTouched = toNumber(row.won_touched_this_month);
  const statusMismatchCount = toNumber(row.status_mismatch_count);
  const notionOnlyCount = toNumber(row.notion_only_count);

  return {
    ...base,
    source: "live",
    snapshotLabel: toLabelDate(row.refreshed_at),
    summary: {
      ...base.summary,
      health: normalizeHealth(row.status_health),
      focus: row.primary_focus,
      priorityScore,
      stageAlignmentPct,
      matchRatePct,
      avgLeadScore,
      supabaseRecords,
      notionRecords,
    },
    funnel: [
      { id: "prospecting", label: "Prospecting", count: toNumber(row.prospecting_count), touchedThisMonth: activeFunnelTouched },
      { id: "lead-interessado", label: "Lead Interessado", count: toNumber(row.lead_interessado_count), touchedThisMonth: leadInteressadoTouched },
      { id: "mql-agendado", label: "MQL Agendado", count: toNumber(row.mql_agendado_count), touchedThisMonth: mqlAgendadoTouched },
      { id: "mql-realizado", label: "MQL Realizado", count: toNumber(row.mql_realizado_count), touchedThisMonth: mqlRealizadoTouched },
      { id: "negotiation", label: "Negociação", count: toNumber(row.negotiation_count), touchedThisMonth: negotiationTouched },
      { id: "won", label: "Cliente Ganho", count: toNumber(row.won_count), touchedThisMonth: wonTouched },
      { id: "lost", label: "Perdido", count: toNumber(row.lost_count) },
    ],
    baseMetrics: [
      {
        id: "unstarted",
        label: "Não iniciados canônicos",
        value: canonicalUnstarted,
        tone: canonicalUnstarted < dailyActivationTarget ? "destructive" : "success",
        detail: `Meta diária atual: ${dailyActivationTarget} ativações.`,
      },
      {
        id: "coverage-days",
        label: "Cobertura em dias",
        value: coverageDays,
        unit: "d",
        tone: coverageDays < 1 ? "destructive" : coverageDays < 3 ? "warning" : "success",
        detail: "Leitura viva da cobertura operacional da base.",
      },
      {
        id: "reactivation",
        label: "Pool de reativação",
        value: reactivationCount,
        tone: reactivationCount > 200 ? "warning" : "info",
        detail: "Leads hoje classificados para reativação na operação.",
      },
      {
        id: "suppressed",
        label: "Supressões ativas",
        value: suppressedCount,
        tone: "info",
        detail: "Base temporariamente fora de cadência por regras de supressão.",
      },
      {
        id: "reprospeccao",
        label: "Reprospecção elegível",
        value: reprospeccaoEligible,
        tone: reprospeccaoEligible < 10 ? "warning" : "info",
        detail: "Volume imediato de reaproveitamento via reprospecção.",
      },
      {
        id: "retomada",
        label: "Retomada elegível",
        value: retomadaEligible,
        tone: "info",
        detail: "Leads prontos para retomada de conversa.",
      },
    ],
    prospectingReadiness: {
      metrics: base.prospectingReadiness.metrics.map((metric) => {
        if (metric.id === "icp-coverage") {
          return {
            ...metric,
            value: `${canonicalUnstarted} / ${dailyActivationTarget}`,
            tone:
              canonicalUnstarted < dailyActivationTarget
                ? "critical"
                : canonicalUnstarted < dailyActivationTarget * 2
                  ? "risk"
                  : "success",
            detail: "Leitura viva da cobertura de não iniciados frente à meta diária atual.",
          };
        }

        if (metric.id === "coverage-window") {
          return {
            ...metric,
            value: `${coverageDays} d`,
            tone:
              coverageDays < 1 ? "critical" : coverageDays < 3 ? "risk" : "success",
            detail: "Janela real de sustentação operacional da base nova.",
          };
        }

        if (metric.id === "reactivation-volume") {
          return {
            ...metric,
            value: String(reactivationCount),
            tone: reactivationCount > 200 ? "warning" : "info",
            detail: "Volume vivo hoje classificado para reativação no Supabase.",
          };
        }

        if (metric.id === "recovery-lanes") {
          const recoveryTotal = reprospeccaoEligible + retomadaEligible;

          return {
            ...metric,
            value: String(recoveryTotal),
            tone: recoveryTotal < 20 ? "monitor" : "info",
            detail: "Soma viva de reprospecção e retomada já acionáveis na operação.",
          };
        }

        return metric;
      }),
      lanes: base.prospectingReadiness.lanes.map((lane) => {
        if (lane.id === "new-list") {
          return {
            ...lane,
            health:
              canonicalUnstarted < dailyActivationTarget ? "critical" : "monitor",
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? `A leitura viva confirma a pressão de lista: ${canonicalUnstarted} não iniciados para uma meta diária de ${dailyActivationTarget}.`
                : `A cobertura viva já saiu da zona crítica e sustenta melhor a meta diária de ${dailyActivationTarget} ativações.`,
          };
        }

        if (lane.id === "reactivation") {
          return {
            ...lane,
            health: reactivationCount > 200 ? "monitor" : "healthy",
            detail: `A leitura viva mostra ${reactivationCount} leads hoje classificados para reativação dentro da operação.`,
          };
        }

        if (lane.id === "reprospeccao") {
          return {
            ...lane,
            health: reprospeccaoEligible < 10 ? "monitor" : "healthy",
            detail: `Há ${reprospeccaoEligible} leads em reprospecção elegível na leitura viva atual.`,
          };
        }

        if (lane.id === "retomada") {
          return {
            ...lane,
            health: retomadaEligible < 10 ? "monitor" : "healthy",
            detail: `A fila viva de retomada traz ${retomadaEligible} leads hoje prontos para nova conversa.`,
          };
        }

        return lane;
      }),
    },
    executionBacklog: {
      metrics: base.executionBacklog.metrics.map((metric) => {
        if (metric.id === "p0-items") {
          const p0Count = base.executionBacklog.items.filter((item) => item.priority === "P0").length;

          return {
            ...metric,
            value: String(p0Count),
            detail: "O backlog vivo segue concentrado nas frentes mais urgentes já validadas pelo cockpit.",
          };
        }

        if (metric.id === "open-fronts") {
          return {
            ...metric,
            value: String(base.executionBacklog.items.length),
            detail: "Quantidade de frentes já claras para intervenção executiva dentro da Incentiva.",
          };
        }

        return metric;
      }),
      items: base.executionBacklog.items.map((item) => {
        if (item.id === "backlog-base") {
          return {
            ...item,
            health:
              canonicalUnstarted < dailyActivationTarget ? "critical" : "monitor",
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? `A leitura viva mantém a frente em P0: ${canonicalUnstarted} não iniciados para meta diária de ${dailyActivationTarget}.`
                : `A leitura viva já mostra recuperação de cobertura frente à meta diária de ${dailyActivationTarget} ativações.`,
          };
        }

        if (item.id === "backlog-whatsapp") {
          return {
            ...item,
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? "A camada WhatsApp continua tecnicamente estável, mas ainda opera sob dependência direta da reposição de base."
                : item.detail,
          };
        }

        return item;
      }),
    },
    workflowDrilldown: {
      metrics: base.workflowDrilldown.metrics.map((metric) => {
        if (metric.id === "families-observed") {
          return {
            ...metric,
            value: String(base.workflowFamilies.length),
            detail: "Quantidade de famílias que já aparecem com clareza suficiente para observabilidade executiva.",
          };
        }

        if (metric.id === "families-critical") {
          const criticalFamilies = base.workflowFamilies.filter((family) => family.health === "risk" || family.health === "critical").length;
          return {
            ...metric,
            value: String(criticalFamilies),
            detail: "Contagem de famílias com risco material já explícito no cockpit atual.",
          };
        }

        return metric;
      }),
      items: base.workflowDrilldown.items.map((item) => {
        if (item.id === "drill-email") {
          return {
            ...item,
            detail: "A leitura live ainda não abre fila por workflow, então o FUP2 segue como melhor proxy confirmado do gargalo de e-mail nesta camada.",
          };
        }

        if (item.id === "drill-whatsapp") {
          return {
            ...item,
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? "Na leitura viva, o canal continua tecnicamente íntegro, mas com dependência explícita da cobertura de base para manter tração comercial."
                : item.detail,
          };
        }

        return item;
      }),
    },
    emailHealth: {
      metrics: base.emailHealth.metrics.map((metric) => {
        if (metric.id === "email-active") {
          const emailChannel = base.channels.find((channel) => channel.id === "email");
          const activeWorkflows = emailChannel?.activeWorkflows ?? 5;
          const totalWorkflows = emailChannel?.totalWorkflows ?? 5;

          return {
            ...metric,
            value: `${activeWorkflows}/${totalWorkflows}`,
            detail: "A leitura viva preserva a família de e-mail ativa; a próxima camada ainda precisa abrir fila por workflow.",
          };
        }

        if (metric.id === "email-waiting") {
          return {
            ...metric,
            value: String(base.summary.waiting7d),
            tone: base.summary.waiting7d > 0 ? "risk" : "success",
            detail: "Sem telemetria viva por workflow nesta camada, mantemos o principal sinal de waiting do snapshot consolidado.",
          };
        }

        if (metric.id === "email-throughput") {
          return {
            ...metric,
            value: "snapshot",
            tone: "monitor",
            detail: "A governança live ainda não abriu throughput por workflow de e-mail; mantido o retrato já validado no snapshot.",
          };
        }

        return metric;
      }),
      tracks: base.emailHealth.tracks.map((track) => {
        if (track.id === "email-fup2") {
          return {
            ...track,
            detail: "A leitura viva da governança ainda não separa a fila por workflow; mantido o FUP2 como principal risco já confirmado no snapshot.",
          };
        }

        if (track.id === "email-family") {
          return {
            ...track,
            detail: "A família segue íntegra em ativação, mas a observabilidade fina por workflow ainda é a principal lacuna desta camada live.",
          };
        }

        return track;
      }),
    },
    alerts: [
      {
        id: "base-risk",
        severity: canonicalUnstarted < dailyActivationTarget ? "critical" : "monitor",
        title:
          canonicalUnstarted < dailyActivationTarget
            ? "Cobertura de não iniciados ainda abaixo da meta diária"
            : "Cobertura de base já saiu da zona crítica",
        detail: `A Incentiva está com ${canonicalUnstarted} não iniciados canônicos para uma meta atual de ${dailyActivationTarget} ativações.`,
      },
      {
        id: "reconciliation",
        severity: stageAlignmentPct < 90 || matchRatePct < 95 ? "risk" : "monitor",
        title: "Reconciliação estrutural e semântica em leitura viva",
        detail: `Match rate em ${matchRatePct.toFixed(2)}% e alinhamento canônico em ${stageAlignmentPct.toFixed(2)}%, com ${statusMismatchCount} divergências de status e ${notionOnlyCount} registros só no Notion.`,
      },
      base.alerts[2],
      base.alerts[3],
    ],
    whatsappHealth: {
      ...base.whatsappHealth,
      metrics: base.whatsappHealth.metrics.map((metric) => {
        if (metric.id === "base-pressure") {
          return {
            ...metric,
            value: String(canonicalUnstarted),
            tone:
              canonicalUnstarted < dailyActivationTarget
                ? "critical"
                : canonicalUnstarted < dailyActivationTarget * 2
                  ? "risk"
                  : "success",
            detail: `A leitura viva mostra ${canonicalUnstarted} não iniciados canônicos para uma meta de ${dailyActivationTarget} ativações diárias.`,
          };
        }

        if (metric.id === "infra") {
          return {
            ...metric,
            detail: `Camada WhatsApp preservada na leitura live, com ${base.summary.activeWorkflows}/${base.summary.totalWorkflows} workflows totais ativos na operação.`,
          };
        }

        return metric;
      }),
      tracks: base.whatsappHealth.tracks.map((track) => {
        if (track.id === "outbound") {
          return {
            ...track,
            health:
              canonicalUnstarted < dailyActivationTarget ? "monitor" : track.health,
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? "A cadência outbound continua íntegra, mas já opera sob pressão direta da falta de base nova."
                : track.detail,
          };
        }

        if (track.id === "leads") {
          return {
            ...track,
            detail: `Sem nova telemetria viva por workflow nesta camada; mantido o último retrato do snapshot para o bloco de leads WhatsApp.`,
          };
        }

        return track;
      }),
    },
    workflowIntelligence: {
      ...base.workflowIntelligence,
      metrics: base.workflowIntelligence.metrics.map((metric) => {
        if (metric.id === "email-risk") {
          return {
            ...metric,
            detail:
              "A leitura viva da governança ainda não abriu telemetria por workflow; mantido o principal risco já confirmado no snapshot.",
          };
        }

        if (metric.id === "active-families") {
          return {
            ...metric,
            detail: `A operação segue com ${base.workflowFamilies.length} famílias já mapeadas no cockpit atual.`,
          };
        }

        return metric;
      }),
      insights: base.workflowIntelligence.insights.map((insight) => {
        if (insight.id === "whatsapp-base-dependency") {
          return {
            ...insight,
            health:
              canonicalUnstarted < dailyActivationTarget ? "risk" : "monitor",
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? `A leitura viva reforça a dependência do WhatsApp sobre a base: ${canonicalUnstarted} não iniciados para meta diária de ${dailyActivationTarget}.`
                : insight.detail,
          };
        }

        return insight;
      }),
    },
  };
}

async function fetchGovernanceAdminGlobalRow(operationName: string): Promise<GovernanceAdminGlobalRow | null> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) return null;

  const endpoint = new URL(`${url.replace(/\/$/, "")}/rest/v1/admin_global_v1`);
  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("operation_name", `eq.${operationName}`);
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint.toString(), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      "Accept-Profile": "governance",
    },
  });

  if (!response.ok) {
    throw new Error(`supabase_admin_global_fetch_failed_${response.status}`);
  }

  const rows = (await response.json()) as GovernanceAdminGlobalRow[];
  return rows[0] ?? null;
}

export async function loadIncentivaCockpit(): Promise<IncentivaCockpitData> {
  try {
    const row = await fetchGovernanceAdminGlobalRow("Incentiva");
    if (!row) return incentivaCockpit;
    return applyLiveGovernanceRow(incentivaCockpit, row);
  } catch (error) {
    console.error(error);
    return incentivaCockpit;
  }
}

export function getScoreDrivers(operation: Operation): ScoreDriver[] {
  return [
    {
      id: "coverage",
      label: "Cobertura de base",
      value: operation.baseCoverage,
      weight: 0.35,
      health:
        operation.baseCoverage < 55 ? "critical" : operation.baseCoverage < 70 ? "risk" : "healthy",
      detail:
        operation.baseCoverage < 55
          ? "A operação está sem base suficiente para sustentar a cadência com folga."
          : operation.baseCoverage < 70
            ? "A cobertura existe, mas ainda pressiona a continuidade da cadência."
            : "A base atual já dá sustentação razoável para a frente.",
    },
    {
      id: "reconciliation",
      label: "Reconciliação de dados",
      value: operation.dataReconciliation,
      weight: 0.2,
      health:
        operation.dataReconciliation < 80
          ? "risk"
          : operation.dataReconciliation < 92
            ? "monitor"
            : "healthy",
      detail:
        operation.dataReconciliation < 80
          ? "Ainda há ruído entre camadas operacionais, então parte da leitura pode estar semanticamente frágil."
          : operation.dataReconciliation < 92
            ? "A reconciliação já é boa, mas ainda pede ajuste fino para decisões mais sensíveis."
            : "A estrutura de dados já está bem coerente para leitura executiva.",
    },
    {
      id: "conversion",
      label: "Conversão mensal",
      value: operation.monthlyConversion * 5,
      weight: 0.25,
      health:
        operation.monthlyConversion < 8
          ? "risk"
          : operation.monthlyConversion < 11
            ? "monitor"
            : "healthy",
      detail:
        operation.monthlyConversion < 8
          ? "A conversão ainda está curta para compensar a pressão operacional atual."
          : operation.monthlyConversion < 11
            ? "A operação já converte, mas ainda sem folga forte."
            : "A conversão está em banda saudável frente ao retrato atual.",
    },
    {
      id: "priority",
      label: "Pressão executiva",
      value: operation.priority === "P0" ? 35 : operation.priority === "P1" ? 55 : operation.priority === "P2" ? 75 : 88,
      weight: 0.2,
      health:
        operation.priority === "P0"
          ? "critical"
          : operation.priority === "P1"
            ? "risk"
            : operation.priority === "P2"
              ? "monitor"
              : "healthy",
      detail:
        operation.priority === "P0"
          ? "A operação ainda exige intervenção executiva imediata."
          : operation.priority === "P1"
            ? "A pressão já é relevante, mas não necessariamente bloqueia a carteira toda."
            : operation.priority === "P2"
              ? "A operação está mais em observação e ajuste."
              : "A urgência relativa atual é baixa.",
    },
  ];
}

export function buildOperationActionPlan(operation: Operation): OperationActionPlan {
  const causes = [
    `Foco principal atual: ${operation.focus}.`,
    `Cobertura em ${operation.baseCoverage.toFixed(1)}% e reconciliação em ${operation.dataReconciliation.toFixed(1)}%.`,
    `Conversão mensal em ${operation.monthlyConversion.toFixed(1)}% com saúde ${statusMeta[operation.health].label}.`,
  ];

  const actions =
    operation.baseCoverage < 60
      ? [
          "Confirmar a cobertura real de não iniciados e a fila de reativação.",
          "Abrir frente de reposição de lista / ICP como prioridade imediata.",
          "Só depois atacar ajustes finos de copy, cadência ou workflow.",
        ]
      : operation.dataReconciliation < 85
        ? [
            "Validar divergências entre Supabase, Notion e estágio canônico.",
            "Ajustar a leitura semântica antes de concluir sobre performance.",
            "Revisar a operação novamente depois do saneamento de dados.",
          ]
        : [
            "Revisar gargalo dominante do canal principal da operação.",
            "Definir próximo teste de melhoria com dono claro e prazo.",
            "Monitorar o efeito da ação no próximo recorte operacional.",
          ];

  return {
    headline: `${operation.name} pede intervenção orientada por ${operation.focus.toLowerCase()}.`,
    causes,
    actions,
    discordMessage:
      `Diagnóstico ${operation.name}: foco atual em ${operation.focus.toLowerCase()}, ` +
      `cobertura ${operation.baseCoverage.toFixed(1)}%, reconciliação ${operation.dataReconciliation.toFixed(1)}% ` +
      `e conversão mensal ${operation.monthlyConversion.toFixed(1)}%. Próximo passo sugerido: ${actions[0]}`,
    trelloCardTitle: `${operation.name} · plano de ação operacional`,
  };
}

export function buildExecutiveCommandQueue(operations: Operation[]): ExecutiveCommandItem[] {
  return [...operations]
    .sort((left, right) => left.score - right.score)
    .map((operation) => {
      if (operation.baseCoverage < 60) {
        return {
          id: `${operation.id}-coverage`,
          operationId: operation.id,
          operationName: operation.name,
          priority: operation.priority,
          health: operation.health,
          lane: "Base / ICP",
          owner: "Bruna + Sales Ops",
          channel: "Trello" as const,
          title: `${operation.name} pede reposição imediata de base`,
          detail:
            `Cobertura em ${operation.baseCoverage.toFixed(1)}% para uma operação em ${statusMeta[operation.health].label}. ` +
            "O risco principal deixou de ser workflow e passou a ser abastecimento da cadência.",
          nextStep:
            "Abrir card de reposição por ICP e medir recuperação da cobertura antes de otimizar copy ou canal.",
        };
      }

      if (operation.dataReconciliation < 85) {
        return {
          id: `${operation.id}-reconciliation`,
          operationId: operation.id,
          operationName: operation.name,
          priority: operation.priority,
          health: operation.health,
          lane: "Leitura semântica",
          owner: "Claw + Sales Ops",
          channel: "Admin" as const,
          title: `${operation.name} já pede saneamento semântico do funil`,
          detail:
            `Reconciliação em ${operation.dataReconciliation.toFixed(1)}% com leitura ainda suscetível a ruído entre Supabase, Notion e estágio canônico.`,
          nextStep:
            "Abrir revisão de estágio e divergência antes de concluir sobre performance comercial.",
        };
      }

      if (operation.monthlyConversion < 11) {
        return {
          id: `${operation.id}-conversion`,
          operationId: operation.id,
          operationName: operation.name,
          priority: operation.priority,
          health: operation.health,
          lane: "Gargalo comercial",
          owner: "Sales Ops",
          channel: "Discord" as const,
          title: `${operation.name} precisa de intervenção no funil ativo`,
          detail:
            `Conversão mensal em ${operation.monthlyConversion.toFixed(1)}% com espaço claro para ajuste de etapa, handoff e cadência.`,
          nextStep:
            "Levar diagnóstico para o Discord da operação com teste claro, dono e prazo fechado.",
        };
      }

      return {
        id: `${operation.id}-stabilization`,
        operationId: operation.id,
        operationName: operation.name,
        priority: operation.priority,
        health: operation.health,
        lane: "Estabilização",
        owner: "Sales Ops",
        channel: "Admin" as const,
        title: `${operation.name} já está em faixa mais estável`,
        detail:
          "A operação não pede intervenção emergencial, mas já merece monitoração ativa para proteger conversão e qualidade de leitura.",
        nextStep:
          "Manter review semanal com foco em tendência, não em incidente isolado.",
      };
    });
}

export function buildExecutiveFocusAreas(operations: Operation[]): ExecutiveFocusArea[] {
  const coverageOps = operations.filter((operation) => operation.baseCoverage < 60);
  const semanticOps = operations.filter(
    (operation) => operation.baseCoverage >= 60 && operation.dataReconciliation < 85,
  );
  const conversionOps = operations.filter(
    (operation) => operation.baseCoverage >= 60 && operation.dataReconciliation >= 85 && operation.monthlyConversion < 11,
  );

  return [
    {
      id: "coverage",
      label: "Reposição e ICP",
      count: coverageOps.length,
      owner: "Bruna + Sales Ops",
      channel: "Trello",
      headline:
        coverageOps.length > 0
          ? `${coverageOps.length} operação(ões) estão puxando a fila de reposição.`
          : "Nenhuma operação está pressionando a carteira por falta grave de base.",
      detail:
        coverageOps.length > 0
          ? "Quando a cobertura quebra, o problema principal sai do workflow e vira abastecimento qualificado da cadência."
          : "A camada de base está sob controle no recorte atual.",
    },
    {
      id: "semantic",
      label: "Leitura semântica",
      count: semanticOps.length,
      owner: "Claw + Sales Ops",
      channel: "Admin",
      headline:
        semanticOps.length > 0
          ? `${semanticOps.length} operação(ões) já precisam de ajuste fino de estágio e reconciliação.`
          : "A reconciliação entre camadas está saudável no recorte atual.",
      detail:
        semanticOps.length > 0
          ? "Aqui o risco não é falta de ação, e sim tomar decisão em cima de leitura parcialmente ruidosa."
          : "A leitura executiva está coerente para tomada de decisão transversal.",
    },
    {
      id: "conversion",
      label: "Ajuste de funil",
      count: conversionOps.length,
      owner: "Sales Ops",
      channel: "Discord",
      headline:
        conversionOps.length > 0
          ? `${conversionOps.length} operação(ões) já pedem teste comercial explícito.`
          : "Não há pressão comercial relevante fora das frentes de base e semântica.",
      detail:
        conversionOps.length > 0
          ? "Depois de estabilizar base e leitura, o próximo ganho vem de experimento de funil com dono e prazo."
          : "O recorte atual está mais pressionado por abastecimento e governança do que por teste comercial.",
    },
  ];
}

export function buildOperationCockpitFromOperation(operation: Operation): IncentivaCockpitData {
  const coverageGap = Math.max(0, 100 - operation.baseCoverage);
  const unstarted = Math.max(6, Math.round(coverageGap * 4.5));
  const dailyTarget = operation.priority === "P0" ? 25 : operation.priority === "P1" ? 20 : 15;
  const coverageDays = Number((operation.baseCoverage / 35).toFixed(1));
  const success7d = Math.max(180, Math.round(operation.score * 41));
  const error7d = operation.health === "critical" ? 4 : operation.health === "risk" ? 2 : 1;
  const waiting7d = operation.baseCoverage < 60 ? 5 : operation.baseCoverage < 75 ? 2 : 0;
  const actionPlan = buildOperationActionPlan(operation);

  return {
    operationName: operation.name,
    snapshotLabel: "Snapshot consolidado da operação selecionada",
    source: "snapshot",
    summary: {
      health: operation.health,
      focus: operation.focus,
      priorityScore: operation.score,
      stageAlignmentPct: operation.dataReconciliation,
      matchRatePct: Math.min(99.9, operation.dataReconciliation + 2.6),
      avgLeadScore: Math.max(48, Math.round(operation.score * 0.92)),
      supabaseRecords: 900 + operation.score * 11,
      notionRecords: 860 + operation.score * 12,
      activeWorkflows: operation.priority === "P0" ? 8 : operation.priority === "P1" ? 7 : 6,
      totalWorkflows: operation.priority === "P0" ? 12 : 10,
      success7d,
      error7d,
      waiting7d,
    },
    funnel: [
      { id: "prospecting", label: "Prospecting", count: 320 + operation.score * 8, touchedThisMonth: 40 },
      { id: "lead-interessado", label: "Lead Interessado", count: 10 + Math.round(operation.monthlyConversion), touchedThisMonth: 8 },
      { id: "mql-agendado", label: "MQL Agendado", count: Math.max(1, Math.round(operation.monthlyConversion / 2)), touchedThisMonth: 2 },
      { id: "mql-realizado", label: "MQL Realizado", count: Math.max(0, Math.round(operation.monthlyConversion / 3)) },
      { id: "negotiation", label: "Negociação", count: Math.max(0, Math.round(operation.monthlyConversion / 2.5)) },
      { id: "won", label: "Cliente Ganho", count: Math.max(0, Math.round(operation.monthlyConversion / 5)), touchedThisMonth: 1 },
      { id: "lost", label: "Perdido", count: 50 + coverageGap * 2 },
    ],
    baseMetrics: [
      {
        id: "unstarted",
        label: "Não iniciados canônicos",
        value: unstarted,
        tone: operation.baseCoverage < 60 ? "destructive" : operation.baseCoverage < 75 ? "warning" : "info",
        detail: `Meta diária de referência: ${dailyTarget} ativações.`,
      },
      {
        id: "coverage-days",
        label: "Cobertura em dias",
        value: coverageDays,
        unit: "d",
        tone: coverageDays < 2 ? "destructive" : coverageDays < 4 ? "warning" : "info",
        detail: "Estimativa sintética baseada na cobertura atual da operação.",
      },
      {
        id: "reactivation",
        label: "Pool de reativação",
        value: 80 + Math.round(coverageGap * 3.2),
        tone: "warning",
        detail: "Pulmão tático para aliviar pressão enquanto a base nova é ajustada.",
      },
      {
        id: "suppressed",
        label: "Supressões ativas",
        value: 30 + Math.round((100 - operation.dataReconciliation) * 2),
        tone: "info",
        detail: "Leads temporariamente fora de cadência ou com ruído operacional.",
      },
      {
        id: "reprospeccao",
        label: "Reprospecção elegível",
        value: 8 + Math.round(operation.monthlyConversion / 2),
        tone: "warning",
        detail: "Faixa reaproveitável de curto prazo.",
      },
      {
        id: "retomada",
        label: "Retomada elegível",
        value: 6 + Math.round(operation.monthlyConversion / 2.8),
        tone: "info",
        detail: "Fila de retomada potencialmente acionável.",
      },
    ],
    prospectingReadiness: {
      metrics: [
        {
          id: "icp-coverage",
          label: "Cobertura vs meta diária",
          value: `${unstarted} / ${dailyTarget}`,
          tone: operation.baseCoverage < 60 ? "critical" : operation.baseCoverage < 75 ? "risk" : "success",
          detail: "Leitura sintética baseada na cobertura atual da operação.",
        },
        {
          id: "coverage-window",
          label: "Janela de sustentação",
          value: `${coverageDays} d`,
          tone: coverageDays < 2 ? "critical" : coverageDays < 4 ? "risk" : "success",
          detail: "Quanto a base atual sustenta a cadência antes de nova reposição.",
        },
        {
          id: "reactivation-volume",
          label: "Pulmão de base",
          value: String(80 + Math.round(coverageGap * 3.2)),
          tone: "warning",
          detail: "Reativação como colchão tático no recorte atual.",
        },
        {
          id: "recovery-lanes",
          label: "Faixas acionáveis",
          value: String(14 + Math.round(operation.monthlyConversion)),
          tone: "monitor",
          detail: "Reprospecção e retomada já disponíveis para destravar ritmo.",
        },
      ],
      lanes: [
        {
          id: "new-list",
          label: "Lista nova / ICP",
          health: operation.baseCoverage < 60 ? "critical" : operation.baseCoverage < 75 ? "risk" : "healthy",
          headline: `${operation.name} ainda depende de cobertura nova para sustentar o canal principal.`,
          detail: `A cobertura atual está em ${operation.baseCoverage.toFixed(1)}% e continua sendo o principal driver do score da operação.`,
          recommendation: actionPlan.actions[0],
        },
        {
          id: "reactivation",
          label: "Reativação",
          health: "monitor",
          headline: "Reativação funciona como alavanca de amortecimento no curto prazo.",
          detail: "Útil para aliviar pressão, mas não substitui reposição estrutural de base.",
          recommendation: actionPlan.actions[1],
        },
        {
          id: "reprospeccao",
          label: "Reprospecção",
          health: "monitor",
          headline: "Camada complementar para recuperar volume reaproveitável.",
          detail: "Bom complemento tático quando a operação ainda está consolidando cobertura.",
          recommendation: "Rodar em paralelo, sem tratar como solução principal do mês.",
        },
        {
          id: "retomada",
          label: "Retomada",
          health: "healthy",
          headline: "Retomada serve para capturar ganho rápido em cima de conversa já aquecida.",
          detail: "Faixa pequena, porém acionável quando a operação já tem histórico recente de contato.",
          recommendation: "Manter como camada tática de baixa fricção.",
        },
      ],
    },
    executionBacklog: {
      metrics: [
        { id: "open-fronts", label: "Frentes abertas", value: "4", tone: "monitor", detail: "Blocos operacionais já claros para priorização." },
        { id: "p0-items", label: "Ações P0", value: operation.priority === "P0" ? "2" : "1", tone: operation.priority === "P0" ? "critical" : "monitor", detail: "Quantidade sintética de frentes urgentes para esta operação." },
        { id: "owner-clusters", label: "Donos sugeridos", value: "3", tone: "info", detail: "Sales Ops, Claw e lista/ICP cobrem a maior parte do próximo passo." },
        { id: "v2-readiness", label: "Pronto para V2", value: "Sim", tone: "success", detail: "A operação já pode virar fila de ação dentro do painel." },
      ],
      items: [
        {
          id: "backlog-base",
          lane: "Base / ICP",
          priority: operation.priority === "P0" ? "P0" : "P1",
          health: operation.baseCoverage < 60 ? "critical" : "risk",
          owner: "Sales Ops + Lista",
          headline: `Cobertura de base é hoje o principal gargalo de ${operation.name}.`,
          detail: actionPlan.causes[1],
          nextStep: actionPlan.actions[0],
        },
        {
          id: "backlog-data",
          lane: "Reconciliação",
          priority: operation.dataReconciliation < 80 ? "P0" : "P1",
          health: operation.dataReconciliation < 80 ? "risk" : "monitor",
          owner: "Claw/main",
          headline: "A leitura semântica ainda influencia diretamente a confiabilidade da operação.",
          detail: `Reconciliação atual em ${operation.dataReconciliation.toFixed(1)}%.`,
          nextStep: actionPlan.actions[1],
        },
        {
          id: "backlog-performance",
          lane: "Conversão / canal",
          priority: operation.monthlyConversion < 8 ? "P1" : "P2",
          health: operation.monthlyConversion < 8 ? "risk" : "monitor",
          owner: "Sales Ops",
          headline: "O próximo ganho vem de atacar o gargalo dominante do canal, não de abrir mais teoria.",
          detail: `Conversão mensal atual em ${operation.monthlyConversion.toFixed(1)}%.`,
          nextStep: actionPlan.actions[2],
        },
      ],
    },
    workflowDrilldown: {
      metrics: [
        { id: "families-observed", label: "Famílias observadas", value: "4", tone: "info", detail: "Núcleos principais do canal e da operação." },
        { id: "families-critical", label: "Famílias críticas", value: operation.priority === "P0" ? "2" : "1", tone: operation.priority === "P0" ? "critical" : "monitor", detail: "Faixas que mais pedem próxima camada de drill-down." },
        { id: "workflow-focus", label: "Workflow foco", value: operation.focus, tone: "monitor", detail: "A leitura de workflow herda o foco principal atual da operação." },
        { id: "actionability", label: "Pronto para ação", value: "Sim", tone: "success", detail: "Já dá para transformar diagnóstico em backlog e mensagem operacional." },
      ],
      items: [
        {
          id: "drill-primary",
          family: "Canal principal",
          health: operation.health,
          owner: "Sales Ops",
          highlightedWorkflow: operation.focus,
          headline: `O gargalo central de ${operation.name} hoje conversa diretamente com ${operation.focus.toLowerCase()}.`,
          detail: "O drill-down desta operação deve começar pelo bloco que mais afeta cobertura, throughput ou leitura útil.",
          nextStep: actionPlan.actions[0],
        },
        {
          id: "drill-data",
          family: "Governança / dado",
          health: operation.dataReconciliation < 80 ? "risk" : "monitor",
          owner: "Claw/main",
          highlightedWorkflow: "Reconciliação",
          headline: "Antes de otimizar o detalhe, a leitura precisa estar coerente.",
          detail: "Esta operação ainda depende da qualidade da camada de dados para não gerar falso positivo de performance.",
          nextStep: actionPlan.actions[1],
        },
      ],
    },
    emailHealth: {
      metrics: [
        { id: "email-active", label: "E-mail ativo", value: "4/5", tone: "monitor", detail: "Família de e-mail em acompanhamento pelo recorte atual." },
        { id: "email-waiting", label: "Waiting", value: String(waiting7d), tone: waiting7d > 3 ? "risk" : "monitor", detail: "Proxy de fila ou gargalo no recorte atual da operação." },
        { id: "email-throughput", label: "Throughput", value: operation.monthlyConversion >= 10 ? "estável" : "pressionado", tone: operation.monthlyConversion >= 10 ? "success" : "monitor", detail: "Leitura sintética da fluidez da família de e-mail." },
        { id: "email-risk", label: "Risco atual", value: operation.baseCoverage < 60 ? "base" : "fila", tone: operation.baseCoverage < 60 ? "risk" : "monitor", detail: "Onde o e-mail mais sofre no retrato atual." },
      ],
      tracks: [
        {
          id: "email-family",
          label: "Família de e-mail",
          health: operation.baseCoverage < 60 ? "risk" : "monitor",
          headline: "O e-mail fica bom ou ruim conforme a base e a fila que o alimentam.",
          detail: "Sem base suficiente, a família perde continuidade; sem observabilidade, a fila vira gargalo silencioso.",
          recommendation: actionPlan.actions[0],
        },
      ],
    },
    whatsappHealth: {
      metrics: [
        { id: "infra", label: "Infra / webhook", value: "OK", tone: "healthy", detail: "Sem sinal sintético de quebra estrutural no retrato atual." },
        { id: "base-pressure", label: "Pressão de base", value: String(unstarted), tone: operation.baseCoverage < 60 ? "critical" : "monitor", detail: "Quantidade de não iniciados pressionando a cadência." },
        { id: "lead-lanes-idle", label: "Faixas ociosas", value: String(6 + Math.round(coverageGap / 8)), tone: "monitor", detail: "Faixas com potencial de retomada ou reaproveitamento." },
        { id: "throughput", label: "Throughput", value: operation.monthlyConversion >= 10 ? "estável" : "irregular", tone: operation.monthlyConversion >= 10 ? "success" : "monitor", detail: "Leitura sintética do ritmo do canal." },
      ],
      tracks: [
        {
          id: "outbound",
          label: "Outbound WhatsApp",
          health: operation.baseCoverage < 60 ? "monitor" : "healthy",
          headline: "O canal até pode estar íntegro, mas depende da base certa para render.",
          detail: "Quando a cobertura cai, o WhatsApp vira termômetro do gargalo upstream.",
          workflows: "Cadência, reativação e retomada",
        },
      ],
    },
    workflowIntelligence: {
      metrics: [
        { id: "active-families", label: "Famílias ativas", value: "4", tone: "info", detail: "Núcleos centrais já visíveis no cockpit." },
        { id: "email-risk", label: "Risco dominante", value: operation.focus, tone: "monitor", detail: "A inteligência de workflow herda o problema principal da operação." },
        { id: "social-density", label: "Densidade operacional", value: operation.priority === "P0" ? "alta" : "média", tone: "info", detail: "Nível de profundidade que já vale observar." },
        { id: "next-cut", label: "Próximo corte", value: "plano de ação", tone: "success", detail: "O painel já pode transformar leitura em demanda operacional." },
      ],
      insights: [
        {
          id: "workflow-focus",
          familyId: "core",
          label: operation.focus,
          health: operation.health,
          headline: `O melhor próximo passo de ${operation.name} começa por ${operation.focus.toLowerCase()}.`,
          detail: actionPlan.headline,
          recommendation: actionPlan.actions[0],
        },
      ],
    },
    channels: [
      {
        id: "whatsapp",
        label: "WhatsApp",
        health: operation.baseCoverage < 60 ? "monitor" : "healthy",
        activeWorkflows: 3,
        totalWorkflows: 4,
        headline: "Canal sensível à cobertura de base e à continuidade da cadência.",
        detail: "A leitura do canal funciona melhor quando a operação já está com abastecimento minimamente estável.",
      },
      {
        id: "email",
        label: "E-mail",
        health: operation.monthlyConversion < 8 ? "risk" : "monitor",
        activeWorkflows: 4,
        totalWorkflows: 5,
        headline: "Canal importante para throughput e pressão silenciosa de fila.",
        detail: "Sem observabilidade fina, tende a esconder gargalos de waiting e entrega útil.",
      },
      {
        id: "linkedin",
        label: "LinkedIn",
        health: "monitor",
        activeWorkflows: 1,
        totalWorkflows: 2,
        headline: "Camada complementar de social selling e sinal comercial.",
        detail: "Ajuda mais como apoio e amplificação do que como único motor.",
      },
    ],
    workflowFamilies: [
      { id: "core", label: "Core de cadência", total: 4, active: 3, health: operation.health, summary: "Motor principal da operação." },
      { id: "email", label: "E-mail FUP", total: 5, active: 4, health: operation.monthlyConversion < 8 ? "risk" : "monitor", summary: "Throughput e fila de seguimento." },
      { id: "reactivation", label: "Reativação / retomada", total: 3, active: 2, health: "monitor", summary: "Pulmão tático de curto prazo." },
    ],
    topWorkflows: [
      { name: `${operation.name} · Cadência principal`, family: "Core de cadência", active: true, executions7d: success7d, success7d, error7d, waiting7d, lastRun: "agora" },
      { name: `${operation.name} · E-mail FUP`, family: "E-mail FUP", active: true, executions7d: Math.max(80, Math.round(success7d * 0.35)), success7d: Math.max(70, Math.round(success7d * 0.3)), error7d: Math.max(0, error7d - 1), waiting7d, lastRun: "hoje" },
    ],
    alerts: [
      {
        id: "score-alert",
        severity: operation.health === "critical" ? "critical" : operation.health === "risk" ? "risk" : "monitor",
        title: `${operation.name} segue puxando atenção por ${operation.focus.toLowerCase()}.`,
        detail: actionPlan.causes.join(" "),
      },
      {
        id: "action-alert",
        severity: "info",
        title: "Próximo passo sugerido",
        detail: actionPlan.actions[0],
      },
    ],
  };
}

async function fetchGovernanceAdminGlobalRows(): Promise<GovernanceAdminGlobalRow[] | null> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) return null;

  const endpoint = new URL(`${url.replace(/\/$/, "")}/rest/v1/admin_global_v1`);
  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("order", "priority_score.desc,operation_name.asc");

  const response = await fetch(endpoint.toString(), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      "Accept-Profile": "governance",
    },
  });

  if (!response.ok) {
    throw new Error(`supabase_admin_global_list_failed_${response.status}`);
  }

  return (await response.json()) as GovernanceAdminGlobalRow[];
}

function mapPriority(score: number): Priority {
  if (score >= 60) return "P0";
  if (score >= 45) return "P1";
  if (score >= 25) return "P2";
  return "P3";
}

function mapLiveRowsToOperations(rows: GovernanceAdminGlobalRow[]): Operation[] {
  return rows
    .map((row) => {
      const name = row.operation_name;
      const score = toNumber(row.priority_score);
      const baseCoverage = coveragePctFromRow(row);
      const dataReconciliation = toNumber(row.canonical_stage_alignment_pct);
      const monthlyConversion = monthlyConversionPctFromRow(row);
      const notionRecords = toNumber(row.notion_total_records);
      const matchRatePct = toNumber(row.match_rate_pct);
      const stageAlignmentPct = toNumber(row.canonical_stage_alignment_pct);
      const statusMismatchCount = toNumber(row.status_mismatch_count);
      const notionOnlyCount = toNumber(row.notion_only_count);

      return {
        id: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name,
        client: name === "Incentiva" ? "Incentiva Mais" : name,
        priority: mapPriority(score),
        focus: row.primary_focus,
        score,
        baseCoverage,
        dataReconciliation,
        monthlyConversion,
        health: normalizeHealth(row.status_health),
        owner: "Sales Ops",
        notionRecords,
        matchRatePct,
        stageAlignmentPct,
        statusMismatchCount,
        notionOnlyCount,
        refreshedAt: row.refreshed_at,
      } satisfies Operation;
    })
    .sort((a, b) => a.score - b.score);
}

function mapLiveRowsToKpis(rows: GovernanceAdminGlobalRow[]): GlobalKpis {
  const operations = mapLiveRowsToOperations(rows);
  const monitored = operations.length;
  const atRisk = operations.filter((o) => o.health === "risk").length;
  const critical = operations.filter((o) => o.health === "critical").length;
  const baseCoverage =
    operations.reduce((sum, operation) => sum + operation.baseCoverage, 0) / Math.max(operations.length, 1);
  const totalLeads = rows.reduce((sum, row) => sum + toNumber(row.supabase_total_records), 0);
  const monthlyConversions = rows.reduce((sum, row) => sum + toNumber(row.won_touched_this_month), 0);

  return {
    monitored,
    atRisk,
    critical,
    baseCoverage: Math.round(baseCoverage * 10) / 10,
    totalLeads,
    monthlyConversions,
    conversionDelta: 6.8,
    leadsDelta: 4.2,
    coverageDelta: -3.1,
    riskDelta: -1.0,
  };
}

function mapLiveRowsToDistribution(rows: GovernanceAdminGlobalRow[]): Record<OperationStatus, number> {
  return rows.reduce(
    (acc, row) => {
      acc[normalizeHealth(row.status_health)] += 1;
      return acc;
    },
    { healthy: 0, monitor: 0, risk: 0, critical: 0 } as Record<OperationStatus, number>,
  );
}

function buildLiveInsights(rows: GovernanceAdminGlobalRow[]): ExecutiveInsight[] {
  const sorted = [...rows].sort((a, b) => toNumber(b.priority_score) - toNumber(a.priority_score));
  const top = sorted[0];
  const incentiva = rows.find((row) => row.operation_name === "Incentiva");

  return [
    top
      ? {
          id: "live-top-priority",
          severity: normalizeHealth(top.status_health) === "critical" ? "critical" : "risk",
          title: `${top.operation_name} puxa a fila de prioridade executiva`,
          detail: `Foco principal atual: ${top.primary_focus}. Score ${toNumber(top.priority_score)} na leitura viva da governança.`,
          timestamp: "agora",
        }
      : insights[0],
    {
      id: "live-base-coverage",
      severity: "risk",
      title: "Cobertura de base segue como principal risco transversal",
      detail: "A leitura live mantém a reposição de base como gargalo dominante entre as operações críticas e em risco.",
      timestamp: "agora",
    },
    incentiva
      ? {
          id: "live-incentiva",
          severity: "monitor",
          title: "Incentiva já opera como piloto de cockpit profundo",
          detail: `Alinhamento canônico em ${toNumber(incentiva.canonical_stage_alignment_pct).toFixed(2)}% e match rate em ${toNumber(incentiva.match_rate_pct).toFixed(2)}%.`,
          operationId: "incentiva",
          timestamp: "agora",
        }
      : insights[3],
    {
      id: "live-reconciliation",
      severity: "info",
      title: "Reconciliação estrutural já pode dirigir a camada visual",
      detail: "O Admin Global agora está preparado para usar diretamente a view de governança quando a env pública estiver ativa.",
      timestamp: "agora",
    },
  ];
}

export async function loadGlobalDashboard(): Promise<GlobalDashboardData> {
  try {
    const rows = await fetchGovernanceAdminGlobalRows();
    if (!rows || rows.length === 0) {
      return {
        source: "snapshot",
        snapshotLabel: "Snapshot 29 jun 2026 · Base consolidada",
        kpis: fetchGlobalKpis(),
        operations: fetchOperations(),
        distribution: fetchStatusDistribution(),
        insights: fetchInsights(),
      };
    }

    return {
      source: "live",
      snapshotLabel: toLabelDate(rows[0]?.refreshed_at),
      kpis: mapLiveRowsToKpis(rows),
      operations: mapLiveRowsToOperations(rows),
      distribution: mapLiveRowsToDistribution(rows),
      insights: buildLiveInsights(rows),
    };
  } catch (error) {
    console.error(error);
    return {
      source: "snapshot",
      snapshotLabel: "Snapshot 29 jun 2026 · Base consolidada",
      kpis: fetchGlobalKpis(),
      operations: fetchOperations(),
      distribution: fetchStatusDistribution(),
      insights: fetchInsights(),
    };
  }
}

const integrationHub: IntegrationHubData = {
  source: "snapshot",
  snapshotLabel: "30 jun 2026 · centro de integração consolidado",
  metrics: [
    {
      id: "connected-layers",
      label: "Camadas conectadas",
      value: "10",
      tone: "success",
      detail:
        "Supabase, n8n, Evolution API, Notion, Trello, Discord, Google Drive, Apify, GitHub e publish já entram no mapa central.",
    },
    {
      id: "live-reads",
      label: "Leituras vivas",
      value: "3",
      tone: "monitor",
      detail:
        "Supabase, n8n VPS e GitHub já sobem com leitura viva; as demais camadas seguem em guarded, snapshot ou integração planejada.",
    },
    {
      id: "manual-checkpoints",
      label: "Checkpoints manuais",
      value: "4",
      tone: "risk",
      detail:
        "Publish, parte da camada comercial, alguns handoffs e o consumo de planilhas ainda pedem intervenção controlada.",
    },
    {
      id: "action-targets",
      label: "Destinos de ação",
      value: "5",
      tone: "info",
      detail:
        "Trello, Notion, Discord, Portal e Suporte já formam a camada principal de aterrissagem das ações do cockpit.",
    },
  ],
  sources: [
    {
      id: "supabase",
      title: "Supabase",
      category: "Fonte canônica",
      health: "healthy",
      owner: "Claw/main",
      syncStatus: "live",
      visibility: "restricted",
      sourceOfTruth: "Base, estágio canônico, score, SLA e governança",
      lastSync: "Leitura viva",
      headline: "Supabase segue como espinha dorsal da governança operacional.",
      detail:
        "É a camada que ancora score, base, lock, SLA, personalização e o blueprint replicável entre operações.",
      powers: ["Admin Global", "Operações", "Performance", "Portal governado"],
    },
    {
      id: "n8n",
      title: "n8n VPS",
      category: "Telemetria e execução",
      health: "healthy",
      owner: "Claw/main",
      syncStatus: "live",
      visibility: "restricted",
      sourceOfTruth: "Execuções, waiting, erro, throughput, webhook",
      lastSync: "Leitura viva",
      headline: "n8n é o motor técnico da observabilidade real do sistema.",
      detail:
        "Não é só automação. É a camada que prova se o fluxo rodou, esperou, quebrou ou ficou silenciosamente ineficiente.",
      powers: ["Suporte", "Pipelines", "Workflow intelligence", "Alertas vivos"],
    },
    {
      id: "evolution",
      title: "Evolution API",
      category: "WhatsApp runtime",
      health: "healthy",
      owner: "Claw/main",
      syncStatus: "guarded",
      visibility: "restricted",
      sourceOfTruth: "Instâncias, webhook, fila de WhatsApp e saúde do canal",
      lastSync: "Telemetria de health em expansão",
      headline:
        "Evolution é a camada que precisa materializar a saúde do WhatsApp como integração de primeira classe.",
      detail:
        "Hoje o painel já lê saúde de WhatsApp por efeito operacional, mas ainda falta expor a Evolution API como fonte técnica explícita dentro do hub.",
      powers: ["Operações", "Suporte", "Health de WhatsApp", "Diagnóstico de instância"],
    },
    {
      id: "notion",
      title: "Notion",
      category: "Operação SDR",
      health: "monitor",
      owner: "Sales Ops + Claw",
      syncStatus: "guarded",
      visibility: "internal",
      sourceOfTruth: "Pipeline humano, rotina SDR, motivos de perda",
      lastSync: "Sincronização assistida",
      headline: "Notion continua como camada humana do pipeline e da rotina comercial.",
      detail:
        "Ele não substitui a governança do Supabase, mas ainda é central para contexto operacional, qualificação e leitura comercial de SDR.",
      powers: ["Operações", "Pipelines", "Leitura comercial por operação"],
    },
    {
      id: "trello",
      title: "Trello",
      category: "Execução",
      health: "monitor",
      owner: "Ricardo + Claw/main",
      syncStatus: "guarded",
      visibility: "internal",
      sourceOfTruth: "Card, etapa, owner, follow-up e evidência de ação",
      lastSync: "Integração governada",
      headline: "Trello é a aterrissagem visível da ação decidida no admin.",
      detail:
        "Quando um insight sai do painel e vira execução, ele precisa aparecer aqui com dono, prazo e atualização real.",
      powers: ["Fila executiva", "Camada de ação prática", "Follow-up operacional"],
    },
    {
      id: "google-drive",
      title: "Google Drive / Sheets",
      category: "Apoio comercial",
      health: "monitor",
      owner: "Claw/main + Sales Ops",
      syncStatus: "snapshot",
      visibility: "internal",
      sourceOfTruth: "Planilhas auxiliares, cortes financeiros e apoio de performance",
      lastSync: "Leitura assistida",
      headline:
        "Drive e planilhas ainda funcionam como apoio, não como verdade operacional principal.",
      detail:
        "Essa camada ainda não está aterrissada como leitura viva no admin; hoje entra como apoio para cortes específicos de performance e conferência operacional.",
      powers: ["Performance", "Faturamento", "Conferência comercial"],
    },
    {
      id: "discord",
      title: "Discord operacional",
      category: "Acionamento e exceção",
      health: "monitor",
      owner: "Claw/main",
      syncStatus: "manual",
      visibility: "internal",
      sourceOfTruth: "Report, handoff, exceção e destrave",
      lastSync: "Acionamento contextual",
      headline: "Discord não é fonte-mãe; é canal de ativação e intervenção.",
      detail:
        "Serve para alertar, destravar e coordenar. O papel dele no admin é mostrar quando a exceção saiu da fila e virou conversa com dono certo.",
      powers: ["Suporte", "Ação prática", "Escalada operacional"],
    },
    {
      id: "apify",
      title: "Apify / coleta externa",
      category: "Enriquecimento",
      health: "monitor",
      owner: "Claw/main",
      syncStatus: "planned",
      visibility: "restricted",
      sourceOfTruth: "Coleta complementar, enrichment e fontes externas específicas",
      lastSync: "Planejado para hub V2",
      headline:
        "Apify entra como camada de coleta complementar quando a operação depender de enriquecimento externo.",
      detail:
        "A ferramenta já faz parte da arquitetura possível, mas ainda não está exposta no painel como fonte navegável e audível por operação.",
      powers: ["Listas", "Enriquecimento", "Coletas auxiliares por operação"],
    },
    {
      id: "github",
      title: "GitHub",
      category: "Versionamento",
      health: "healthy",
      owner: "Claw/main",
      syncStatus: "live",
      visibility: "restricted",
      sourceOfTruth: "Código, commit, branch, histórico de entrega",
      lastSync: "Push em produção local",
      headline: "GitHub é a trilha de versionamento da frente Lovable.",
      detail:
        "Tudo o que vira produto real precisa nascer como mudança versionada, buildada e empurrada para o repositório.",
      powers: ["Entrega de blocos", "Histórico técnico", "Base para publish"],
    },
    {
      id: "publish",
      title: "Lovable / Publish",
      category: "Materialização externa",
      health: "healthy",
      owner: "Claw/main + Claudio",
      syncStatus: "guarded",
      visibility: "client-safe",
      sourceOfTruth: "URL publicada, corte externo, portal visível",
      lastSync: "Publicação já materializada",
      headline: "A publicação externa já está no ar e agora entra em fase de governança por conta.",
      detail:
        "O deploy final já foi materializado. O próximo salto deixa de ser cutover técnico e passa a ser abertura privada por conta, com governança de audiência e leitura viva por operação.",
      powers: ["Portal privado", "Camada externa do produto", "Homologação final"],
    },
  ],
  bridges: [
    {
      id: "supabase-admin",
      from: "Supabase",
      to: "Admin",
      health: "healthy",
      title: "Leitura executiva consolidada",
      detail:
        "Base, score, cobertura e prioridade já conseguem alimentar o cockpit consolidado e o drill-down por operação.",
      nextStep: "Expandir mais telas para leitura viva, reduzindo fallback onde ainda houver snapshot.",
    },
    {
      id: "n8n-admin",
      from: "n8n VPS",
      to: "Suporte + Pipelines",
      health: "monitor",
      title: "Observabilidade técnica centralizada",
      detail:
        "A telemetria já entra no produto, mas ainda pode ficar mais granular por família, workflow e ownership.",
      nextStep: "Aprofundar leitura viva por workflow e cruzar com backlog de ação.",
    },
    {
      id: "evolution-admin",
      from: "Evolution API",
      to: "Operações + Suporte",
      health: "monitor",
      title: "Saúde explícita do WhatsApp",
      detail:
        "O cockpit já enxerga efeitos do canal, mas ainda precisa trazer instância, fila, webhook e disponibilidade da Evolution para a tela principal.",
      nextStep: "Subir health técnico do WhatsApp como ponte explícita do hub, sem depender só da leitura derivada por workflow.",
    },
    {
      id: "notion-admin",
      from: "Notion",
      to: "Operações",
      health: "monitor",
      title: "Contexto SDR e pipeline humano",
      detail:
        "O portal já mostra reconciliação comercial vinda da governança viva, com faixa de reconciliação, frescor do sync, exposição sugerida e leitura por operação no recorte publicado.",
      nextStep: "Aprofundar a ponte com owner comercial, histórico e drill-down direto da divergência sem sair da conta.",
    },
    {
      id: "trello-admin",
      from: "Admin",
      to: "Trello",
      health: "monitor",
      title: "Da recomendação para a execução",
      detail:
        "O produto já expõe checkpoint operacional e presença de card aberto dentro do portal, reduzindo a necessidade de abrir o board para entender o estado mínimo.",
      nextStep: "Trazer etapa, owner e profundidade de execução do card para dentro do hub e dos action packets.",
    },
    {
      id: "drive-performance",
      from: "Google Drive / Sheets",
      to: "Performance + Faturamento",
      health: "monitor",
      title: "Apoio comercial ainda não consolidado",
      detail:
        "Planilhas ainda ajudam em recortes comerciais e financeiros, mas seguem fora da malha viva do cockpit central.",
      nextStep: "Definir o que realmente continua em planilha e o que deve subir para leitura central governada.",
    },
    {
      id: "apify-admin",
      from: "Apify / coleta externa",
      to: "Listas + Integrações",
      health: "monitor",
      title: "Coleta externa ainda fora do mapa vivo",
      detail:
        "A camada de enriquecimento complementar ainda não conversa com o hub de forma auditável, mesmo já sendo relevante para evolução da operação.",
      nextStep: "Modelar fontes externas e jobs de enrichment como bloco próprio, com owner e status de sincronização.",
    },
    {
      id: "github-publish",
      from: "GitHub",
      to: "Lovable / Publish",
      health: "healthy",
      title: "Do código pronto para a tela viva",
      detail:
        "Versionamento, build, deploy e URL publicada já estão em paridade. O elo restante agora é abertura privada por conta e leitura viva mais profunda por operação.",
      nextStep: "Amarrar pacote de acesso por operação e evoluir a camada client-safe para uso real de clientes.",
    },
  ],
  actionLanes: [
    {
      id: "lane-notion",
      title: "Notion como camada comercial integrada",
      owner: "Sales Ops + Claw",
      target: "Operações / Integrações",
      health: "monitor",
      detail:
        "O produto já mostra reconciliação entre Notion, Supabase e estágio canônico no portal publicado, com ação sugerida e faixa de exposição por operação.",
      nextStep: "Adicionar owner comercial, histórico e drill-down navegável de divergência por operação dentro do hub central.",
    },
    {
      id: "lane-trello",
      title: "Trello como execução realmente visível",
      owner: "Ricardo + Claw",
      target: "Admin Global / Integrações",
      health: "monitor",
      detail:
        "O admin já enxerga se existe checkpoint operacional e card aberto no recorte publicado, mas ainda falta profundidade para ler a execução inteira sem sair da tela.",
      nextStep: "Trazer status de execução, etapa, owner e follow-up do card para a camada centralizada.",
    },
    {
      id: "lane-evolution",
      title: "Evolution API como health técnico do WhatsApp",
      owner: "Claw/main",
      target: "Operações / Suporte / Integrações",
      health: "monitor",
      detail:
        "A operação já depende de WhatsApp em produção, mas a fonte técnica do canal ainda não aparece como integração explícita no hub.",
      nextStep: "Expor instância, webhook, fila e disponibilidade da Evolution na camada visual central.",
    },
    {
      id: "lane-drive",
      title: "Planilhas e Drive com papel claramente limitado",
      owner: "Claw/main + Sales Ops",
      target: "Performance / Faturamento",
      health: "monitor",
      detail:
        "Hoje a planilha ainda serve como apoio em alguns recortes, mas precisa ficar claro onde ela termina e onde o cockpit vira fonte principal.",
      nextStep: "Separar apoio comercial de verdade operacional, reduzindo dependência de leitura distribuída.",
    },
    {
      id: "lane-apify",
      title: "Apify como fonte externa auditável",
      owner: "Claw/main",
      target: "Integrações / Listas",
      health: "monitor",
      detail:
        "A camada de coleta externa ainda não está visível na interface, mesmo sendo candidata natural para enriquecer listas e fontes auxiliares.",
      nextStep: "Modelar enrichment externo por job, owner e status dentro do hub V2.",
    },
    {
      id: "lane-auth",
      title: "Publish privado por conta",
      owner: "Claw/main",
      target: "Portal / Configurações",
      health: "monitor",
      detail:
        "Sessão real, recorte privado e publicação final já estão dentro do produto como fundação de exposição controlada.",
      nextStep: "Fechar a governança de abertura por conta, permissões e fontes vivas mais profundas por operação.",
    },
  ],
};

export async function loadIntegrationHub(): Promise<IntegrationHubData> {
  return integrationHub;
}

export function buildPortalPublishPacket(operation: Operation): PortalPublishPacket {
  const privateSlug = operation.id;
  const privatePath = `/portal?operationId=${operation.id}`;
  const externalCutover = "URL publicada do console + recorte privado homologado por conta";
  const publishHealth: OperationStatus =
    operation.dataReconciliation >= 90 && operation.baseCoverage >= 50
      ? "healthy"
      : operation.dataReconciliation >= 84
        ? "monitor"
        : "risk";
  const finalCutoverReadinessPct =
    publishHealth === "healthy" ? 94 : publishHealth === "monitor" ? 89 : 76;

  const publishStage =
    publishHealth === "healthy"
      ? "Pronto para homologação privada"
      : publishHealth === "monitor"
        ? "Quase pronto para abertura privada"
        : "Segurar abertura até fechar a base";
  const finalCutoverStage =
    publishHealth === "healthy"
      ? "Última milha da publicação pública"
      : publishHealth === "monitor"
        ? "Paridade externa ainda em fechamento"
        : "Publicação pública ainda bloqueada";

  const checkpoints: PortalPublishCheckpoint[] = [
    {
      id: "session",
      title: "Sessão real do produto",
      status: "ready",
      detail: "Auth por cookie já protege entrada, refresh e leitura por papel.",
    },
    {
      id: "scope",
      title: "Escopo por operação",
      status: "ready",
      detail: `A conta ${operation.client} já pode nascer com recorte próprio dentro do portal.`,
    },
    {
      id: "client-cut",
      title: "Recorte cliente-safe",
      status: "ready",
      detail: "A visão externa já separa módulos públicos do que continua interno ao cockpit.",
    },
    {
      id: "publish",
      title: "Abertura privada por conta",
      status: publishHealth === "risk" ? "blocked" : "monitor",
      detail:
        publishHealth === "risk"
          ? "Ainda falta blindar melhor a abertura externa antes de transformar a conta em portal ativo."
          : "A fundação está pronta; falta só o checkpoint final de materialização privada por conta.",
    },
    {
      id: "live-sync",
      title: "Fontes vivas de execução",
      status: "monitor",
      detail:
        "Notion já entra com reconciliação viva e Trello já aparece com checkpoint operacional; o próximo salto é aprofundar etapa, owner e sync direto.",
    },
    {
      id: "public-parity",
      title: "Paridade com a URL publicada",
      status: publishHealth === "healthy" ? "monitor" : "blocked",
      detail:
        publishHealth === "healthy"
          ? "A conta já está pronta para corte externo controlado, faltando só materializar a publicação final no endpoint visível."
          : "O produto já tem base interna, mas ainda não deve ser tratado como publicação final até fechar a paridade externa.",
    },
  ];

  const cutoverBlockers =
    publishHealth === "healthy"
      ? [
          "Materializar a URL publicada com o último corte validado",
          "Homologar a abertura externa da conta com leitura diária real",
        ]
      : publishHealth === "monitor"
        ? [
            "Fechar a materialização final da URL publicada com o corte atual",
            "Reduzir dependência de snapshot intermediário na leitura do Trello",
            "Homologar a conta em uso real antes de abrir a publicação final",
          ]
        : [
            "Fechar cobertura e reconciliação da conta antes da abertura externa",
            "Concluir governança final do publish e das fontes vivas",
          ];

  return {
    operationId: operation.id,
    operationName: operation.name,
    clientLabel: operation.client,
    privateSlug,
    privatePath,
    externalCutover,
    audience: "Cliente da conta + operação homologada",
    authLayer: "Sessão real por cookie + RBAC + escopo por operação",
    visibility: "Portal privado cliente-safe",
    owner: operation.owner,
    publishHealth,
    publishStage,
    finalCutoverStage,
    finalCutoverReadinessPct,
    headline:
      publishHealth === "healthy"
        ? "A operação já tem base suficiente para ensaiar abertura privada controlada."
        : publishHealth === "monitor"
          ? "A operação já cabe num portal privado, mas ainda pede checkpoint final antes de abrir uso real."
          : "Ainda é melhor segurar a abertura externa até fechar melhor base e governança da conta.",
    checkpoints,
    cutoverBlockers,
  };
}

export function buildPortalLiveSourceCards(
  operation: Operation,
  source: GlobalDashboardData["source"],
): PortalLiveSourceCard[] {
  const trelloStates = trelloOperationalStateByOperationName[operation.name] ?? [];
  const primaryTrelloState =
    trelloStates.find((state) => state.status === "open") ??
    [...trelloStates].sort(
      (a, b) => new Date(b.lastObservedAt).getTime() - new Date(a.lastObservedAt).getTime(),
    )[0];
  const cadenceState = cadenceOperationalStateByOperationName[operation.name];
  const openTrelloSegments = trelloStates.filter((state) => state.status === "open");
  const trelloSegmentLabel = openTrelloSegments.length
    ? openTrelloSegments.map((state) => state.segment).join(" + ")
    : primaryTrelloState?.segment ?? "Sem segmento mapeado";
  const primaryCardShortLink = primaryTrelloState?.cardUrl
    ? primaryTrelloState.cardUrl.split("/c/")[1]?.split("/")[0] ?? ""
    : "";
  const primaryCardRuntime = primaryCardShortLink
    ? trelloCardRuntimeByShortLink[primaryCardShortLink]
    : undefined;

  const notionLive =
    source === "live" &&
    typeof operation.notionRecords === "number" &&
    typeof operation.matchRatePct === "number" &&
    typeof operation.stageAlignmentPct === "number";
  const notionStageLabel = notionLive
    ? (operation.stageAlignmentPct ?? 0) >= 97 && (operation.matchRatePct ?? 0) >= 98
      ? "Reconciliação forte"
      : (operation.stageAlignmentPct ?? 0) >= 92 && (operation.matchRatePct ?? 0) >= 96
        ? "Reconciliação em ajuste"
        : "Divergência material"
    : "Snapshot governado";
  const notionFreshnessLabel = notionLive
    ? operation.refreshedAt
      ? `Sync ${toLabelDate(operation.refreshedAt)}`
      : "Sync vivo sem carimbo"
    : "Sem telemetria viva";
  const notionExposureLabel = notionLive
    ? (operation.statusMismatchCount ?? 0) <= 5 && (operation.notionOnlyCount ?? 0) <= 3
      ? "Cliente-safe forte"
      : (operation.statusMismatchCount ?? 0) <= 20 && (operation.notionOnlyCount ?? 0) <= 10
        ? "Cliente-safe com monitoramento"
        : "Segurar exposição total"
    : "Recorte ainda governado";
  const notionActionLabel = notionLive
    ? (operation.statusMismatchCount ?? 0) > 20 || (operation.notionOnlyCount ?? 0) > 10
      ? "Priorizar saneamento do funil humano antes de ampliar exposição"
      : (operation.statusMismatchCount ?? 0) > 5 || (operation.notionOnlyCount ?? 0) > 3
        ? "Monitorar divergência e ajustar pipeline com Sales Ops"
        : "Manter leitura viva e usar o portal como visão externa segura"
    : "Fechar leitura viva antes de vender reconciliação como verdade operacional";

  const notionHealth: OperationStatus = notionLive
    ? (operation.stageAlignmentPct ?? 0) < 90 || (operation.matchRatePct ?? 0) < 95
      ? "risk"
      : (operation.notionOnlyCount ?? 0) > 0 || (operation.statusMismatchCount ?? 0) > 0
        ? "monitor"
        : "healthy"
    : "monitor";

  const notionCard: PortalLiveSourceCard = {
    id: "notion",
    title: "Pipeline comercial (Notion)",
    health: notionHealth,
    mode: notionLive ? "live" : "operational",
    headline: notionLive
      ? "Reconciliação viva entre pipeline humano, estágio canônico e prontidão de exposição."
      : "Camada comercial ainda não aterrissou com telemetria viva neste recorte.",
    detail: notionLive
      ? `${operation.notionRecords} registros no Notion, match rate de ${operation.matchRatePct?.toFixed(2)}% e ${operation.statusMismatchCount} divergências de status na leitura viva atual.`
      : "O portal continua com a camada comercial governada, mas sem telemetria viva suficiente para afirmar reconciliação em tempo real.",
    lastSync: toLabelDate(operation.refreshedAt),
    ctaLabel: notionLive ? "Estado do pipeline" : "Modo",
    ctaValue: notionLive ? notionStageLabel : "Snapshot governado",
    facts: notionLive
      ? [
          { label: "Owner", value: operation.owner },
          { label: "Etapa", value: notionStageLabel },
          { label: "Sync", value: notionFreshnessLabel },
          { label: "Exposição", value: notionExposureLabel },
          {
            label: "Divergência",
            value: `${operation.statusMismatchCount ?? 0} status / ${operation.notionOnlyCount ?? 0} notion only`,
          },
        ]
      : [
          { label: "Owner", value: operation.owner },
          { label: "Etapa", value: "Snapshot governado" },
          { label: "Alinhamento", value: "Sem leitura viva suficiente" },
          { label: "Divergência", value: "Drill-down pendente" },
        ],
    nextStep: notionLive ? notionActionLabel : "Fechar a telemetria viva desta conta antes de expor reconciliação como verdade operacional.",
    availabilityLabel: "Link direto do Notion ainda não homologado nesta conta.",
  };

  const trelloHealth: OperationStatus = !primaryTrelloState
    ? "monitor"
    : primaryTrelloState.status === "open"
      ? "monitor"
      : "healthy";

  const trelloCard: PortalLiveSourceCard = {
    id: "trello",
    title: "Execução no Trello",
    health: trelloHealth,
    mode: "operational",
    headline: primaryTrelloState
      ? primaryTrelloState.status === "open"
        ? "Existe card operacional real aberto para esta conta na camada de execução."
        : "A camada de execução não mostra alerta aberto para esta conta no recorte atual."
      : "A operação ainda não tem estado de execução amarrado ao recorte publicado.",
    detail: primaryTrelloState
      ? primaryTrelloState.cardUrl
        ? `Última observação em ${new Date(primaryTrelloState.lastObservedAt).toLocaleString("pt-BR")}, com card já materializado no layer de execução para ${trelloSegmentLabel}${primaryCardRuntime ? ` na lista ${primaryCardRuntime.listName}` : ""}.`
        : `Última observação em ${new Date(primaryTrelloState.lastObservedAt).toLocaleString("pt-BR")}, sem card aberto no recorte atual para ${trelloSegmentLabel}.`
      : "Ainda falta trazer o board desta operação como estado operacional visível dentro do próprio portal.",
    lastSync: primaryTrelloState
      ? `Estado operacional · ${new Date((primaryCardRuntime?.lastActivityAt ?? primaryTrelloState.lastObservedAt)).toLocaleDateString("pt-BR")} ${new Date(
          primaryCardRuntime?.lastActivityAt ?? primaryTrelloState.lastObservedAt,
        ).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`
      : "Sem estado integrado",
    ctaLabel: primaryTrelloState?.cardUrl ? "Card" : "Status",
    ctaValue: primaryTrelloState?.cardUrl
      ? "Abertura registrada"
      : primaryTrelloState
        ? "Sem card aberto"
        : "Pendente",
    facts: [
      {
        label: "Owner",
        value: primaryCardRuntime?.ownerLabel ?? "Ricardo + Sales Ops",
      },
      {
        label: "Etapa",
        value: primaryCardRuntime?.listName
          ? `${primaryCardRuntime.listName} · ${openTrelloSegments.length > 0 ? `${openTrelloSegments.length} card(s) aberto(s)` : "sem card aberto"}`
          : openTrelloSegments.length > 0
            ? `${openTrelloSegments.length} checkpoint(s) aberto(s)`
            : "Sem checkpoint aberto",
      },
      { label: "Segmento", value: trelloSegmentLabel },
      {
        label: "Histórico",
        value: cadenceState
          ? cadenceState.lastMentionedAt
            ? `base_hygiene ${cadenceState.count} · última menção ${new Date(cadenceState.lastMentionedAt).toLocaleDateString("pt-BR")}`
            : `base_hygiene ${cadenceState.count} · sem menção recente`
          : primaryTrelloState?.lastAlertAt
            ? `último alerta ${new Date(primaryTrelloState.lastAlertAt).toLocaleDateString("pt-BR")}`
            : "sem histórico adicional mapeado",
      },
      {
        label: "Follow-up",
        value: primaryCardRuntime?.followUpText ?? "Sem follow-up materializado no card.",
      },
    ],
    nextStep:
      openTrelloSegments.length > 0
        ? "Ligar agora o board real à camada central para puxar owner, etapa e follow-up sem snapshot intermediário."
        : "Conectar etapa e owner do board antes de usar o portal como cockpit único de execução.",
    actionLabel: primaryTrelloState?.cardUrl ? "Abrir card da execução" : undefined,
    actionHref: primaryTrelloState?.cardUrl || undefined,
    actionExternal: true,
    availabilityLabel: primaryTrelloState?.cardUrl
      ? "Abertura externa pronta enquanto o embed interno não é homologado."
      : "Esta conta ainda não tem card materializado para abertura direta.",
  };

  return [notionCard, trelloCard];
}

export const statusMeta: Record<
  OperationStatus,
  { label: string; color: string; bg: string; ring: string }
> = {
  healthy: {
    label: "Healthy",
    color: "text-[color:var(--color-success)]",
    bg: "bg-[color:var(--color-success)]",
    ring: "ring-[color:var(--color-success)]/30",
  },
  monitor: {
    label: "Monitor",
    color: "text-[color:var(--color-info)]",
    bg: "bg-[color:var(--color-info)]",
    ring: "ring-[color:var(--color-info)]/30",
  },
  risk: {
    label: "Risk",
    color: "text-[color:var(--color-warning)]",
    bg: "bg-[color:var(--color-warning)]",
    ring: "ring-[color:var(--color-warning)]/30",
  },
  critical: {
    label: "Critical",
    color: "text-destructive",
    bg: "bg-destructive",
    ring: "ring-destructive/30",
  },
};

export const priorityMeta: Record<Priority, string> = {
  P0: "text-destructive border-destructive/40 bg-destructive/10",
  P1: "text-[color:var(--color-warning)] border-[color:var(--color-warning)]/40 bg-[color:var(--color-warning)]/10",
  P2: "text-[color:var(--color-info)] border-[color:var(--color-info)]/40 bg-[color:var(--color-info)]/10",
  P3: "text-muted-foreground border-border bg-muted",
};
