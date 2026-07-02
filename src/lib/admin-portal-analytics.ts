import { readEnvString } from "./runtime-env";

export type PortalPeriodPreset = "mtd" | "prev_month" | "7d" | "90d";
export type PortalIcpDimensionId =
  | "segment_cluster"
  | "company_size_cluster"
  | "cargo_cluster";

type ChannelId = "email" | "linkedin" | "whatsapp";
type StageId =
  | "prospecting"
  | "lead-interessado"
  | "mql-agendado"
  | "mql-realizado"
  | "negotiation"
  | "won"
  | "lost";

type LeadsBaseRow = {
  id: string | number | null;
  operation_name: string;
  nome: string | null;
  empresa: string | null;
  created_at: string | null;
  status: string | null;
  estagio: string | null;
  canal: string | null;
  status_email: string | null;
  status_linkedin: string | null;
  status_whatsapp: string | null;
  last_reply_at: string | null;
  cargo?: string | null;
  source_table?: string | null;
  segment_cluster?: string | null;
  company_size_cluster?: string | null;
  cargo_cluster?: string | null;
  icp_profile?: string | null;
};

type OperationalLeadRow = {
  id: string | number | null;
  Setor?: string | null;
  Tecnologia?: string | null;
  Funcionários?: string | null;
  Cargo?: string | null;
  "Data do Envio"?: string | null;
  "Data de Início"?: string | null;
  Status?: string | null;
  Estágio?: string | null;
  Canal?: string | null;
  "Status E-mail"?: string | null;
  "Status LinkedIn"?: string | null;
  Status_wpp?: string | null;
  last_reply_at?: string | null;
  negative_signal_count?: number | string | null;
  positive_signal_count?: number | string | null;
  last_qualification_signal?: string | null;
  last_objection_category?: string | null;
  linkedin_last_inbound_at?: string | null;
};

type NotionCanonicalRow = {
  operation_name: string;
  page_id: string | null;
  nome: string | null;
  empresa: string | null;
  last_edited_at: string | null;
  canonical_stage: string | null;
  canal: string | null;
};

type NotionSnapshotRow = {
  operation_name: string;
  page_id: string | null;
  nome: string | null;
  empresa: string | null;
  status: string | null;
  canal: string | null;
  last_edited_at: string | null;
  raw_properties: unknown;
};

type DispatchEventRow = {
  operation_name: string;
  page_id: string | null;
  nome: string | null;
  empresa: string | null;
  channel: string | null;
  event_type: string | null;
  event_at: string | null;
};

export interface PortalTimelinePoint {
  sortKey?: string;
  label: string;
  prospecting: number;
  leadInteressado: number;
  mqlAgendado: number;
  negotiation: number;
  won: number;
}

export interface PortalChannelPeriodSummary {
  channel: ChannelId;
  touched: number;
  dispatches: number;
  leadInteressado: number;
  mqlAgendado: number;
  mqlRealizado: number;
  negotiation: number;
  won: number;
  lost: number;
  firstInterestPct: number;
  scheduledPct: number;
  negotiationPct: number;
  wonPct: number;
  replies: number;
  dispatchSource: "events" | "fallback" | "none";
}

export interface PortalPeriodSummary {
  period: PortalPeriodPreset;
  label: string;
  stageCounts: Record<StageId, number>;
  touched: number;
  firstInterestPct: number;
  scheduledPct: number;
  negotiationPct: number;
  wonPct: number;
  channels: Record<ChannelId, PortalChannelPeriodSummary>;
  attributionFallbackCount: number;
  unattributedStageCount: number;
  timeline: PortalTimelinePoint[];
}

export interface PortalOperationAnalytics {
  operationId: string;
  operationName: string;
  periods: Record<PortalPeriodPreset, PortalPeriodSummary>;
  breakdowns: Record<PortalIcpDimensionId, PortalIcpDimensionAnalytics>;
  facts: PortalAnalyticsFact[];
  baseLeads: PortalAnalyticsBaseLead[];
  dimensionAvailability: Record<PortalIcpDimensionId, boolean>;
  latestStageMovementAt: string | null;
  latestDispatchEventAt: string | null;
  latestReplyAt: string | null;
}

export interface PortalAnalyticsDashboard {
  operations: PortalOperationAnalytics[];
  source: "live" | "snapshot";
}

export interface PortalIcpBucketAnalytics {
  value: string;
  label: string;
  periods: Record<PortalPeriodPreset, PortalPeriodSummary>;
}

export interface PortalIcpDimensionAnalytics {
  id: PortalIcpDimensionId;
  label: string;
  buckets: PortalIcpBucketAnalytics[];
}

export interface PortalAnalyticsFact {
  kind: "stage" | "dispatch" | "reply";
  eventAt: string;
  stageId: StageId | null;
  channel: ChannelId | null;
  sourceTable: string | null;
  dimensions: Record<PortalIcpDimensionId, string | null>;
}

export interface PortalAnalyticsBaseLead {
  createdAt: string | null;
  isUnstarted: boolean;
  sourceTable: string | null;
  dimensions: Record<PortalIcpDimensionId, string | null>;
}

type PortalIcpBucketAccumulator = {
  value: string;
  label: string;
  periods: Record<PortalPeriodPreset, PortalPeriodSummary>;
};

type PortalIcpBreakdownAccumulator = Record<
  PortalIcpDimensionId,
  {
    id: PortalIcpDimensionId;
    label: string;
    buckets: Map<string, PortalIcpBucketAccumulator>;
  }
>;

type SupabaseClientConfig = {
  url: string;
  accessKey: string;
};

const PERIOD_LABELS: Record<PortalPeriodPreset, string> = {
  mtd: "Mês atual",
  prev_month: "Mês anterior",
  "7d": "Últimos 7 dias",
  "90d": "Últimos 90 dias",
};

const ICP_DIMENSIONS: Array<{ id: PortalIcpDimensionId; label: string }> = [
  { id: "segment_cluster", label: "Setor" },
  { id: "company_size_cluster", label: "Porte" },
  { id: "cargo_cluster", label: "Cargo" },
];

function getSupabaseUrl() {
  return readEnvString("ADMIN_INCENTIVA_SUPABASE_URL", "VITE_SUPABASE_URL");
}

function getSupabaseServiceRoleKey() {
  return readEnvString(
    "ADMIN_INCENTIVA_SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE_KEY",
    "SUPABASE_SERVICE_ROLE",
  );
}

function getSupabaseAnonKey() {
  return readEnvString("ADMIN_INCENTIVA_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");
}

function getSupabaseClientConfig(): SupabaseClientConfig | null {
  const url = getSupabaseUrl();
  const accessKey = getSupabaseServiceRoleKey() || getSupabaseAnonKey();
  if (!url || !accessKey) return null;
  return { url, accessKey };
}

function buildHeaders(config: SupabaseClientConfig, extra?: HeadersInit) {
  return {
    apikey: config.accessKey,
    Authorization: `Bearer ${config.accessKey}`,
    Accept: "application/json",
    ...extra,
  };
}

async function fetchAllRows<T>(
  config: SupabaseClientConfig,
  table: string,
  select: string,
  operationNames: string[],
  filters?: Record<string, string>,
): Promise<T[]> {
  const pageSize = 1000;
  let offset = 0;
  const rows: T[] = [];

  while (true) {
    const endpoint = new URL(`${config.url.replace(/\/$/, "")}/rest/v1/${table}`);
    endpoint.searchParams.set("select", select);
    endpoint.searchParams.set("limit", String(pageSize));
    endpoint.searchParams.set("offset", String(offset));
    Object.entries(filters ?? {}).forEach(([key, value]) => {
      endpoint.searchParams.set(key, value);
    });
    if (operationNames.length > 0) {
      const encodedNames = operationNames.map((name) => `"${name.replace(/"/g, '\\"')}"`);
      endpoint.searchParams.set("operation_name", `in.(${encodedNames.join(",")})`);
    }

    const response = await fetch(endpoint.toString(), {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      throw new Error(`supabase_${table}_fetch_failed_${response.status}`);
    }

    const page = (await response.json()) as T[];
    rows.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
}

async function fetchAllRowsFromSourceTable<T>(
  config: SupabaseClientConfig,
  table: string,
  select: string,
): Promise<T[]> {
  const pageSize = 1000;
  let offset = 0;
  const rows: T[] = [];

  while (true) {
    const endpoint = new URL(`${config.url.replace(/\/$/, "")}/rest/v1/${encodeURIComponent(table)}`);
    endpoint.searchParams.set("select", select);
    endpoint.searchParams.set("limit", String(pageSize));
    endpoint.searchParams.set("offset", String(offset));

    const response = await fetch(endpoint.toString(), {
      headers: buildHeaders(config),
    });

    if (!response.ok) {
      throw new Error(`supabase_${table}_fetch_failed_${response.status}`);
    }

    const page = (await response.json()) as T[];
    rows.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
}

function normalizeText(value: string | null | undefined) {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeLeadKey(name: string | null | undefined, company: string | null | undefined) {
  const normalizedName = normalizeText(name);
  const normalizedCompany = normalizeText(company);
  if (!normalizedName && !normalizedCompany) return null;
  return `${normalizedName}::${normalizedCompany}`;
}

function nonBlank(value: string | null | undefined) {
  return Boolean(value && value.trim());
}

function mapRawChannel(value: string | null | undefined): ChannelId | null {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  if (normalized.includes("whats") || normalized.includes("wpp")) return "whatsapp";
  if (normalized.includes("linkedin")) return "linkedin";
  if (normalized.includes("mail")) return "email";
  return null;
}

function inferPrimaryChannel(row: Pick<LeadsBaseRow, "canal" | "status_email" | "status_linkedin" | "status_whatsapp">): ChannelId | null {
  const explicitChannel = mapRawChannel(row.canal);
  if (explicitChannel) return explicitChannel;

  const inferred = [
    nonBlank(row.status_email) ? "email" : null,
    nonBlank(row.status_linkedin) ? "linkedin" : null,
    nonBlank(row.status_whatsapp) ? "whatsapp" : null,
  ].filter(Boolean) as ChannelId[];

  if (inferred.length === 1) return inferred[0];
  return null;
}

function detectChannelSignals(row: Pick<LeadsBaseRow, "canal" | "status_email" | "status_linkedin" | "status_whatsapp">): ChannelId[] {
  const signals = new Set<ChannelId>();
  const explicitChannel = mapRawChannel(row.canal);
  if (explicitChannel) signals.add(explicitChannel);
  if (nonBlank(row.status_email)) signals.add("email");
  if (nonBlank(row.status_linkedin)) signals.add("linkedin");
  if (nonBlank(row.status_whatsapp)) signals.add("whatsapp");
  return [...signals];
}

function createLocalDateAtMidnight(date: Date) {
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
  const today = createLocalDateAtMidnight(now);
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
    const previousMonthStart = new Date(
      `${previousMonthDate.getFullYear()}-${String(previousMonthDate.getMonth() + 1).padStart(2, "0")}-01T00:00:00-03:00`,
    );

    return {
      start: previousMonthStart,
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

function localDayLabel(value: string | null | undefined) {
  if (!value) return "n/d";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "n/d";
  return new Intl.DateTimeFormat("pt-BR", {
    timeZone: "America/Sao_Paulo",
    day: "2-digit",
    month: "2-digit",
  }).format(date);
}

function mapStage(rawStage: string | null | undefined): StageId | null {
  const normalized = normalizeText(rawStage);
  switch (normalized) {
    case "prospecting":
    case "prospect":
      return "prospecting";
    case "lead":
    case "lead_interessado":
    case "lead interessado":
      return "lead-interessado";
    case "mql":
    case "mql_agendado":
    case "mql agendado":
      return "mql-agendado";
    case "mql_realizado":
    case "mql realizado":
      return "mql-realizado";
    case "negotiation":
    case "negociacao":
    case "negociação":
      return "negotiation";
    case "won":
    case "cliente ganho":
    case "ganho":
      return "won";
    case "lost":
    case "perdido":
      return "lost";
    default:
      return null;
  }
}

function emptyStageCounts(): Record<StageId, number> {
  return {
    prospecting: 0,
    "lead-interessado": 0,
    "mql-agendado": 0,
    "mql-realizado": 0,
    negotiation: 0,
    won: 0,
    lost: 0,
  };
}

function ratioPct(numerator: number, denominator: number) {
  if (denominator <= 0) return 0;
  return (numerator / denominator) * 100;
}

function flattenUnknownText(value: unknown, depth = 0): string[] {
  if (depth > 4 || value == null) return [];
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return [String(value)];
  }
  if (Array.isArray(value)) {
    return value.flatMap((item) => flattenUnknownText(item, depth + 1));
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>).flatMap((item) =>
      flattenUnknownText(item, depth + 1),
    );
  }
  return [];
}

function extractDispatchChannelFromRawProperties(rawProperties: unknown): ChannelId | null {
  if (!rawProperties || typeof rawProperties !== "object") return null;
  const entries = Object.entries(rawProperties as Record<string, unknown>);
  const dispatchEntry = entries.find(([key]) => {
    const normalizedKey = normalizeText(key);
    return normalizedKey.includes("disparo mensagem") || normalizedKey.includes("mensagem disparo");
  });
  if (!dispatchEntry) return null;
  const values = flattenUnknownText(dispatchEntry[1]).map(normalizeText).filter(Boolean);
  for (const value of values) {
    if (value.includes("whats") || value.includes("wpp")) return "whatsapp";
    if (value.includes("linkedin")) return "linkedin";
    if (value.includes("mail")) return "email";
  }
  return null;
}

function normalizeBucketValue(value: string | null | undefined) {
  const normalized = value?.replace(/\s+/g, " ").trim() ?? "";
  if (!normalized) return "";
  if (["unknown", "desconhecido", "na", "n/a", "null"].includes(normalizeText(normalized))) {
    return "";
  }
  return normalized;
}

function normalizeOperationalValue(value: string | null | undefined) {
  return normalizeBucketValue(value);
}

function extractOperationalSector(rawRow: OperationalLeadRow | null) {
  return (
    normalizeOperationalValue(rawRow?.Setor) ||
    normalizeOperationalValue(rawRow?.Tecnologia) ||
    null
  );
}

function parseEmployeeRangeUpperBound(value: string) {
  const normalized = normalizeText(value);
  if (!normalized) return null;
  if (normalized.includes("10001")) return 10001;
  if (normalized.includes("5001")) return 10000;
  if (normalized.includes("1001")) return 5000;
  if (normalized.includes("501")) return 1000;
  if (normalized.includes("201")) return 500;
  if (normalized.includes("101")) return 200;
  if (normalized.includes("100")) return 100;
  if (normalized.includes("51")) return 200;
  if (normalized.includes("11")) return 50;
  if (normalized.includes("1 a 10") || normalized.includes("1-10") || normalized.includes("1 ate 10")) return 10;

  const matches = value.match(/\d+/g)?.map((item) => Number(item)).filter((item) => !Number.isNaN(item)) ?? [];
  if (matches.length === 0) return null;
  return Math.max(...matches);
}

function deriveCompanySizeBucket(rawValue: string | null | undefined) {
  const normalized = normalizeOperationalValue(rawValue);
  if (!normalized) return null;
  const upperBound = parseEmployeeRangeUpperBound(normalized);
  if (upperBound == null) return null;
  if (upperBound <= 10) return "micro_smb";
  if (upperBound <= 99) return "smb";
  if (upperBound <= 499) return "midmarket";
  return "enterprise";
}

function formatCompanySizeBucketLabel(value: string) {
  switch (value) {
    case "micro_smb":
      return "Micro SMB (1-10)";
    case "smb":
      return "SMB (11-99)";
    case "midmarket":
      return "Midmarket (100-499)";
    case "enterprise":
      return "Enterprise (500+)";
    default:
      return value;
  }
}

function extractOperationalCargo(baseRow: LeadsBaseRow | null, rawRow: OperationalLeadRow | null) {
  return (
    normalizeOperationalValue(rawRow?.Cargo) ||
    normalizeOperationalValue(baseRow?.cargo) ||
    null
  );
}

function inferOperationalDispatchChannel(
  baseRow: LeadsBaseRow | null,
  rawRow: OperationalLeadRow | null,
): ChannelId | null {
  const explicitRawChannel = mapRawChannel(rawRow?.Canal);
  if (explicitRawChannel) return explicitRawChannel;

  const normalizedStatus = normalizeText(rawRow?.Status);
  if (normalizedStatus.includes("wpp")) return "whatsapp";
  if (normalizedStatus.includes("followup") || normalizedStatus.includes("breakup")) return "email";

  const operationalStatusChannel =
    mapRawChannel(rawRow?.Status) ??
    (nonBlank(rawRow?.Status_wpp) ? "whatsapp" : null) ??
    ((() => {
      const linkedinStatus = normalizeText(rawRow?.["Status LinkedIn"]);
      if (
        linkedinStatus.includes("mensagem") ||
        linkedinStatus.includes("conexao") ||
        linkedinStatus.includes("conexão") ||
        linkedinStatus.includes("interesse")
      ) {
        return "linkedin" as const;
      }
      return null;
    })()) ??
    (nonBlank(rawRow?.["Status E-mail"]) ? "email" : null);
  if (operationalStatusChannel) return operationalStatusChannel;

  const baseChannel = baseRow ? inferPrimaryChannel(baseRow) : null;
  if (baseChannel) return baseChannel;
  return null;
}

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const normalized = value.replace(",", ".").trim();
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function inferOperationalFirstInterestAt(
  baseRow: LeadsBaseRow | null,
  rawRow: OperationalLeadRow | null,
) {
  return (
    rawRow?.last_reply_at ??
    baseRow?.last_reply_at ??
    rawRow?.linkedin_last_inbound_at ??
    null
  );
}

function hasOperationalInterestSignal(
  baseRow: LeadsBaseRow | null,
  rawRow: OperationalLeadRow | null,
) {
  if (inferOperationalFirstInterestAt(baseRow, rawRow)) return true;
  if (toNumber(rawRow?.positive_signal_count) > 0) return true;
  if (toNumber(rawRow?.negative_signal_count) > 0) return true;
  if (nonBlank(rawRow?.last_qualification_signal)) return true;
  if (nonBlank(rawRow?.last_objection_category)) return true;
  return false;
}

function formatBucketLabel(dimensionId: PortalIcpDimensionId, value: string) {
  if (dimensionId === "company_size_cluster") {
    return formatCompanySizeBucketLabel(value);
  }
  return value;
}

function buildBreakdowns(periods: PortalPeriodPreset[]): PortalIcpBreakdownAccumulator {
  return Object.fromEntries(
    ICP_DIMENSIONS.map(({ id, label }) => [
      id,
      {
        id,
        label,
        buckets: new Map<string, PortalIcpBucketAccumulator>(),
      },
    ]),
  ) as PortalIcpBreakdownAccumulator;
}

function ensureBreakdownBucket(
  breakdowns: PortalIcpBreakdownAccumulator,
  dimensionId: PortalIcpDimensionId,
  rawValue: string | null | undefined,
  periods: PortalPeriodPreset[],
) {
  const normalizedValue = normalizeBucketValue(rawValue);
  if (!normalizedValue) return null;

  const breakdown = breakdowns[dimensionId];
  const existing = breakdown.buckets.get(normalizedValue);
  if (existing) return existing;

  const bucket: PortalIcpBucketAccumulator = {
    value: normalizedValue,
    label: formatBucketLabel(dimensionId, normalizedValue),
    periods: Object.fromEntries(
      periods.map((period) => [period, createPeriodSummary(period)]),
    ) as Record<PortalPeriodPreset, PortalPeriodSummary>,
  };

  breakdown.buckets.set(normalizedValue, bucket);
  return bucket;
}

function resolveLeadBreakdownBuckets(
  breakdowns: PortalIcpBreakdownAccumulator,
  baseRow: LeadsBaseRow | null,
  rawRow: OperationalLeadRow | null,
  periods: PortalPeriodPreset[],
) {
  if (!baseRow) return [];

  const dimensions = extractDimensions(baseRow, rawRow);
  return ICP_DIMENSIONS.map(({ id }) => ensureBreakdownBucket(breakdowns, id, dimensions[id], periods)).filter(Boolean) as PortalIcpBucketAccumulator[];
}

function extractDimensions(
  baseRow: LeadsBaseRow | null,
  rawRow: OperationalLeadRow | null = null,
): Record<PortalIcpDimensionId, string | null> {
  return {
    segment_cluster:
      extractOperationalSector(rawRow) ||
      normalizeBucketValue(baseRow?.segment_cluster) ||
      null,
    company_size_cluster:
      deriveCompanySizeBucket(rawRow?.Funcionários) ||
      normalizeBucketValue(baseRow?.company_size_cluster) ||
      null,
    cargo_cluster:
      extractOperationalCargo(baseRow, rawRow) ||
      normalizeBucketValue(baseRow?.cargo_cluster) ||
      null,
  };
}

function applyStageMovement(
  summary: PortalPeriodSummary,
  stageId: StageId,
  rowLastEditedAt: string,
  attributedChannels: ChannelId[],
  usedCompanyFallback: boolean,
  dispatchChannel: ChannelId | null,
  usedDispatchFallback: boolean,
) {
  summary.stageCounts[stageId] += 1;
  if (usedCompanyFallback) {
    summary.attributionFallbackCount += 1;
  }

  if (dispatchChannel && usedDispatchFallback) {
    summary.channels[dispatchChannel].dispatches += 1;
    if (summary.channels[dispatchChannel].dispatchSource === "none") {
      summary.channels[dispatchChannel].dispatchSource = "fallback";
    }
  }

  if (attributedChannels.length > 0) {
    attributedChannels.forEach((channelId) => {
      const channelSummary = summary.channels[channelId];
      channelSummary.touched += stageId === "prospecting" ? 1 : 0;
      if (stageId === "lead-interessado") channelSummary.leadInteressado += 1;
      if (stageId === "mql-agendado") channelSummary.mqlAgendado += 1;
      if (stageId === "mql-realizado") channelSummary.mqlRealizado += 1;
      if (stageId === "negotiation") channelSummary.negotiation += 1;
      if (stageId === "won") channelSummary.won += 1;
      if (stageId === "lost") channelSummary.lost += 1;
    });
  } else {
    summary.unattributedStageCount += 1;
  }

  const dayLabel = localDayLabel(rowLastEditedAt);
  const dayKey = rowLastEditedAt.slice(0, 10);
  let timelinePoint = summary.timeline.find((item) => item.sortKey === dayKey);
  if (!timelinePoint) {
    timelinePoint = {
      sortKey: dayKey,
      label: dayLabel,
      prospecting: 0,
      leadInteressado: 0,
      mqlAgendado: 0,
      negotiation: 0,
      won: 0,
    };
    summary.timeline.push(timelinePoint);
  }
  if (stageId === "prospecting") timelinePoint.prospecting += 1;
  if (stageId === "lead-interessado") timelinePoint.leadInteressado += 1;
  if (stageId === "mql-agendado") timelinePoint.mqlAgendado += 1;
  if (stageId === "negotiation") timelinePoint.negotiation += 1;
  if (stageId === "won") timelinePoint.won += 1;
}

function finalizeBreakdowns(
  breakdowns: PortalIcpBreakdownAccumulator,
): Record<PortalIcpDimensionId, PortalIcpDimensionAnalytics> {
  return Object.fromEntries(
    ICP_DIMENSIONS.map(({ id, label }) => {
      const buckets = [...breakdowns[id].buckets.values()]
        .map((bucket) => {
          Object.values(bucket.periods).forEach((period) => finalizePeriodSummary(period));
          return {
            value: bucket.value,
            label: bucket.label,
            periods: bucket.periods,
          } satisfies PortalIcpBucketAnalytics;
        })
        .sort(
          (a, b) =>
            b.periods.mtd.touched - a.periods.mtd.touched || a.label.localeCompare(b.label, "pt-BR"),
        );

      return [
        id,
        {
          id,
          label,
          buckets,
        } satisfies PortalIcpDimensionAnalytics,
      ];
    }),
  ) as Record<PortalIcpDimensionId, PortalIcpDimensionAnalytics>;
}

function createChannelSummary(channel: ChannelId): PortalChannelPeriodSummary {
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

function createPeriodSummary(period: PortalPeriodPreset): PortalPeriodSummary {
  return {
    period,
    label: PERIOD_LABELS[period],
    stageCounts: emptyStageCounts(),
    touched: 0,
    firstInterestPct: 0,
    scheduledPct: 0,
    negotiationPct: 0,
    wonPct: 0,
    channels: {
      email: createChannelSummary("email"),
      linkedin: createChannelSummary("linkedin"),
      whatsapp: createChannelSummary("whatsapp"),
    },
    attributionFallbackCount: 0,
    unattributedStageCount: 0,
    timeline: [],
  };
}

function finalizePeriodSummary(summary: PortalPeriodSummary) {
  summary.touched =
    summary.stageCounts.prospecting +
    summary.stageCounts["lead-interessado"] +
    summary.stageCounts["mql-agendado"] +
    summary.stageCounts["mql-realizado"] +
    summary.stageCounts.negotiation +
    summary.stageCounts.won +
    summary.stageCounts.lost;

  const stageBasedFirstInterestCount =
    summary.stageCounts["lead-interessado"] +
    summary.stageCounts["mql-agendado"] +
    summary.stageCounts["mql-realizado"] +
    summary.stageCounts.negotiation +
    summary.stageCounts.won +
    summary.stageCounts.lost;
  const firstInterestCount = Math.max(
    stageBasedFirstInterestCount,
    summary.channels.email.replies +
      summary.channels.linkedin.replies +
      summary.channels.whatsapp.replies,
  );

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

  (["email", "linkedin", "whatsapp"] as ChannelId[]).forEach((channelId) => {
    const channel = summary.channels[channelId];
    const channelStageBasedFirstInterestCount =
      channel.leadInteressado +
      channel.mqlAgendado +
      channel.mqlRealizado +
      channel.negotiation +
      channel.won +
      channel.lost;
    const channelFirstInterestCount = Math.max(channelStageBasedFirstInterestCount, channel.replies);
    channel.firstInterestPct = ratioPct(channelFirstInterestCount, channel.touched);
    channel.scheduledPct = ratioPct(channel.mqlAgendado, channelFirstInterestCount);
    channel.negotiationPct = ratioPct(channel.negotiation, channel.mqlAgendado);
    channel.wonPct = ratioPct(channel.won, channel.negotiation);
  });

  summary.timeline.sort((a, b) => (a.sortKey ?? "").localeCompare(b.sortKey ?? ""));
}

export async function loadPortalAnalytics(params: {
  operationScope: { id: string; name: string }[];
}): Promise<PortalAnalyticsDashboard> {
  const config = getSupabaseClientConfig();
  if (!config || params.operationScope.length === 0) {
    return { operations: [], source: "snapshot" };
  }

  const operationNames = params.operationScope.map((operation) => operation.name);
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setHours(0, 0, 0, 0);
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
  const recentIsoFloor = ninetyDaysAgo.toISOString();

  const [leadRows, notionRows, notionSnapshotRows, dispatchEventRows] = await Promise.all([
    fetchAllRows<LeadsBaseRow>(
      config,
      "leads_base_v1",
      "id,source_table,operation_name,nome,empresa,created_at,status,estagio,canal,status_email,status_linkedin,status_whatsapp,last_reply_at,cargo,segment_cluster,company_size_cluster,cargo_cluster,icp_profile",
      operationNames,
    ).catch(() =>
      fetchAllRows<LeadsBaseRow>(
        config,
        "leads_base_v1",
        "id,source_table,operation_name,nome,empresa,created_at,status,estagio,canal,status_email,status_linkedin,status_whatsapp,last_reply_at,cargo",
        operationNames,
      ),
    ),
    fetchAllRows<NotionCanonicalRow>(
      config,
      "notion_funnel_canonical_v1",
      "operation_name,page_id,nome,empresa,last_edited_at,canonical_stage,canal",
      operationNames,
      { last_edited_at: `gte.${recentIsoFloor}` },
    ),
    fetchAllRows<NotionSnapshotRow>(
      config,
      "notion_leads_snapshot_v1",
      "operation_name,page_id,nome,empresa,status,canal,last_edited_at,raw_properties",
      operationNames,
      { last_edited_at: `gte.${recentIsoFloor}` },
    ).catch(() => []),
    fetchAllRows<DispatchEventRow>(
      config,
      "portal_dispatch_events_v1",
      "operation_name,page_id,nome,empresa,channel,event_type,event_at",
      operationNames,
      { event_at: `gte.${recentIsoFloor}` },
    ).catch(() => []),
  ]);

  const sourceTables = [...new Set(leadRows.map((row) => row.source_table).filter(nonBlank))];
  const operationalRowsBySourceTable = new Map<string, Map<string, OperationalLeadRow>>();

  await Promise.all(
    sourceTables.map(async (sourceTable) => {
      const rows = await fetchAllRowsFromSourceTable<OperationalLeadRow>(
        config,
        sourceTable,
        'id,"Setor","Tecnologia","Funcionários","Cargo","Data do Envio","Data de Início","Status","Estágio","Canal","Status E-mail","Status LinkedIn","Status_wpp","last_reply_at","negative_signal_count","positive_signal_count","last_qualification_signal","last_objection_category","linkedin_last_inbound_at"',
      ).catch(() => []);
      operationalRowsBySourceTable.set(
        sourceTable,
        new Map(rows.map((row) => [String(row.id ?? ""), row])),
      );
    }),
  );

  const baseMaps = new Map<string, Map<string, LeadsBaseRow>>();
  const companyBaseMaps = new Map<string, Map<string, LeadsBaseRow[]>>();
  leadRows.forEach((row) => {
    const leadKey = normalizeLeadKey(row.nome, row.empresa);
    if (!leadKey) return;
    const current = baseMaps.get(row.operation_name) ?? new Map<string, LeadsBaseRow>();
    current.set(leadKey, row);
    baseMaps.set(row.operation_name, current);

    const normalizedCompany = normalizeText(row.empresa);
    if (!normalizedCompany) return;
    const operationCompanyMap =
      companyBaseMaps.get(row.operation_name) ?? new Map<string, LeadsBaseRow[]>();
    const companyRows = operationCompanyMap.get(normalizedCompany) ?? [];
    companyRows.push(row);
    operationCompanyMap.set(normalizedCompany, companyRows);
    companyBaseMaps.set(row.operation_name, operationCompanyMap);
  });

  const snapshotMaps = new Map<string, Map<string, NotionSnapshotRow>>();
  notionSnapshotRows.forEach((row) => {
    const snapshotKey = row.page_id ?? normalizeLeadKey(row.nome, row.empresa);
    if (!snapshotKey) return;
    const current = snapshotMaps.get(row.operation_name) ?? new Map<string, NotionSnapshotRow>();
    current.set(snapshotKey, row);
    snapshotMaps.set(row.operation_name, current);
  });

  const notionRowsByOperation = new Map<string, NotionCanonicalRow[]>();
  notionRows.forEach((row) => {
    const current = notionRowsByOperation.get(row.operation_name) ?? [];
    current.push(row);
    notionRowsByOperation.set(row.operation_name, current);
  });

  const dispatchEventsByOperation = new Map<string, DispatchEventRow[]>();
  const dispatchChannelByOperationLead = new Map<string, Map<string, ChannelId>>();
  const dispatchChannelByOperationPage = new Map<string, Map<string, ChannelId>>();

  dispatchEventRows.forEach((row) => {
    const channel = mapRawChannel(row.channel);
    if (!channel) return;

    const operationEvents = dispatchEventsByOperation.get(row.operation_name) ?? [];
    operationEvents.push(row);
    dispatchEventsByOperation.set(row.operation_name, operationEvents);

    const leadKey = normalizeLeadKey(row.nome, row.empresa);
    if (leadKey) {
      const operationMap =
        dispatchChannelByOperationLead.get(row.operation_name) ?? new Map<string, ChannelId>();
      operationMap.set(leadKey, channel);
      dispatchChannelByOperationLead.set(row.operation_name, operationMap);
    }

    if (row.page_id) {
      const operationMap =
        dispatchChannelByOperationPage.get(row.operation_name) ?? new Map<string, ChannelId>();
      operationMap.set(row.page_id, channel);
      dispatchChannelByOperationPage.set(row.operation_name, operationMap);
    }
  });

  const periods: PortalPeriodPreset[] = ["mtd", "prev_month", "7d", "90d"];
  const now = new Date();
  const operations = params.operationScope.map((operation) => {
    const operationPeriods = Object.fromEntries(
      periods.map((period) => [period, createPeriodSummary(period)]),
    ) as Record<PortalPeriodPreset, PortalPeriodSummary>;
    const breakdowns = buildBreakdowns(periods);
    const facts: PortalAnalyticsFact[] = [];

    const operationBaseMap = baseMaps.get(operation.name) ?? new Map<string, LeadsBaseRow>();
    const operationCompanyMap =
      companyBaseMaps.get(operation.name) ?? new Map<string, LeadsBaseRow[]>();
    const operationSnapshotMap = snapshotMaps.get(operation.name) ?? new Map<string, NotionSnapshotRow>();
    const operationDispatchEvents = dispatchEventsByOperation.get(operation.name) ?? [];
    const operationDispatchLeadMap =
      dispatchChannelByOperationLead.get(operation.name) ?? new Map<string, ChannelId>();
    const operationDispatchPageMap =
      dispatchChannelByOperationPage.get(operation.name) ?? new Map<string, ChannelId>();
    const operationCanonicalLeadKeys = new Set<string>();
    const operationDispatchFallbackKeys = new Set<string>();

    (notionRowsByOperation.get(operation.name) ?? []).forEach((row) => {
        const stageId = mapStage(row.canonical_stage);
        if (!stageId || !row.last_edited_at) return;
        const editedAt = new Date(row.last_edited_at);
        if (Number.isNaN(editedAt.getTime())) return;
        const leadKey = normalizeLeadKey(row.nome, row.empresa);
        if (leadKey) operationCanonicalLeadKeys.add(leadKey);
        let baseRow = leadKey ? operationBaseMap.get(leadKey) ?? null : null;
        let usedCompanyFallback = false;
        if (!baseRow) {
          const normalizedCompany = normalizeText(row.empresa);
          const companyRows = normalizedCompany
            ? operationCompanyMap.get(normalizedCompany) ?? []
            : [];
          if (companyRows.length === 1) {
            [baseRow] = companyRows;
            usedCompanyFallback = true;
          }
        }
        const rawRow =
          baseRow?.source_table && baseRow.id != null
            ? operationalRowsBySourceTable.get(baseRow.source_table)?.get(String(baseRow.id)) ?? null
            : null;
        const snapshotRow =
          (row.page_id ? operationSnapshotMap.get(row.page_id) : null) ??
          (leadKey ? operationSnapshotMap.get(leadKey) ?? null : null);
        const eventChannel =
          (row.page_id ? operationDispatchPageMap.get(row.page_id) ?? null : null) ??
          (leadKey ? operationDispatchLeadMap.get(leadKey) ?? null : null);
        const primaryChannel =
          (baseRow ? inferPrimaryChannel(baseRow) : null) ??
          eventChannel ??
          mapRawChannel(row.canal);
        const channelSignals = baseRow ? detectChannelSignals(baseRow) : [];
        const dispatchChannel =
          eventChannel ??
          extractDispatchChannelFromRawProperties(snapshotRow?.raw_properties) ??
          (baseRow?.status_linkedin && primaryChannel === "linkedin" ? "linkedin" : null);
        const breakdownBuckets = resolveLeadBreakdownBuckets(breakdowns, baseRow, rawRow, periods);
        const dimensions = extractDimensions(baseRow, rawRow);
        const attributedChannels =
          primaryChannel
            ? [primaryChannel]
            : dispatchChannel
              ? [dispatchChannel]
              : channelSignals.length === 1
                ? channelSignals
                : channelSignals;

        periods.forEach((period) => {
          if (!isWithinPeriod(editedAt, period, now)) return;
          const summary = operationPeriods[period];
          applyStageMovement(
            summary,
            stageId,
            row.last_edited_at,
            attributedChannels,
            usedCompanyFallback,
            dispatchChannel,
            Boolean(dispatchChannel && !eventChannel),
          );

          breakdownBuckets.forEach((bucket) => {
            applyStageMovement(
              bucket.periods[period],
              stageId,
              row.last_edited_at,
              attributedChannels,
              usedCompanyFallback,
              dispatchChannel,
              Boolean(dispatchChannel && !eventChannel),
            );
          });
        });

        facts.push({
          kind: "stage",
          eventAt: row.last_edited_at,
          stageId,
          channel: primaryChannel ?? dispatchChannel ?? channelSignals[0] ?? null,
          sourceTable: baseRow?.source_table ?? null,
          dimensions,
        });
    });

    operationDispatchEvents.forEach((row) => {
      const channel = mapRawChannel(row.channel);
      if (!channel || !row.event_at) return;
      const eventAt = new Date(row.event_at);
      if (Number.isNaN(eventAt.getTime())) return;
      const leadKey = normalizeLeadKey(row.nome, row.empresa);
      let baseRow = leadKey ? operationBaseMap.get(leadKey) ?? null : null;
        if (!baseRow) {
        const normalizedCompany = normalizeText(row.empresa);
        const companyRows = normalizedCompany
          ? operationCompanyMap.get(normalizedCompany) ?? []
          : [];
        if (companyRows.length === 1) {
          [baseRow] = companyRows;
        }
      }
      const rawRow =
        baseRow?.source_table && baseRow.id != null
          ? operationalRowsBySourceTable.get(baseRow.source_table)?.get(String(baseRow.id)) ?? null
          : null;
      const breakdownBuckets = resolveLeadBreakdownBuckets(breakdowns, baseRow, rawRow, periods);
      const dimensions = extractDimensions(baseRow, rawRow);

      periods.forEach((period) => {
        if (!isWithinPeriod(eventAt, period, now)) return;
        const summary = operationPeriods[period];
        summary.channels[channel].dispatches += 1;
        summary.channels[channel].dispatchSource = "events";
        breakdownBuckets.forEach((bucket) => {
          bucket.periods[period].channels[channel].dispatches += 1;
          bucket.periods[period].channels[channel].dispatchSource = "events";
        });
      });

      facts.push({
        kind: "dispatch",
        eventAt: row.event_at,
        stageId: null,
        channel,
        sourceTable: baseRow?.source_table ?? null,
        dimensions,
      });
    });

    const operationBaseLeads = leadRows
      .filter((row) => row.operation_name === operation.name)
      .map((row) => ({
        createdAt: row.created_at,
        isUnstarted: !nonBlank(row.status) && !nonBlank(row.estagio),
        dimensions: extractDimensions(
          row,
          row.source_table && row.id != null
            ? operationalRowsBySourceTable.get(row.source_table)?.get(String(row.id)) ?? null
            : null,
        ),
        row,
      }));

    operationBaseLeads.forEach(({ row }) => {
      const rawRow =
        row.source_table && row.id != null
          ? operationalRowsBySourceTable.get(row.source_table)?.get(String(row.id)) ?? null
          : null;
      if (!rawRow) return;

      const leadKey = normalizeLeadKey(row.nome, row.empresa);
      const operationalDispatchAt = rawRow["Data do Envio"] ?? null;
      const dispatchChannel = inferOperationalDispatchChannel(row, rawRow);
      if (leadKey && operationalDispatchAt && dispatchChannel) {
        const dispatchDate = new Date(operationalDispatchAt);
        const dispatchFactKey = `${leadKey}:${dispatchChannel}:${operationalDispatchAt.slice(0, 10)}`;
        if (!Number.isNaN(dispatchDate.getTime()) && !operationDispatchLeadMap.has(leadKey) && !operationDispatchFallbackKeys.has(dispatchFactKey)) {
          const breakdownBuckets = resolveLeadBreakdownBuckets(breakdowns, row, rawRow, periods);
          const dimensions = extractDimensions(row, rawRow);
          periods.forEach((period) => {
            if (!isWithinPeriod(dispatchDate, period, now)) return;
            operationPeriods[period].channels[dispatchChannel].dispatches += 1;
            if (operationPeriods[period].channels[dispatchChannel].dispatchSource === "none") {
              operationPeriods[period].channels[dispatchChannel].dispatchSource = "fallback";
            }
            breakdownBuckets.forEach((bucket) => {
              bucket.periods[period].channels[dispatchChannel].dispatches += 1;
              if (bucket.periods[period].channels[dispatchChannel].dispatchSource === "none") {
                bucket.periods[period].channels[dispatchChannel].dispatchSource = "fallback";
              }
            });
          });
          facts.push({
            kind: "dispatch",
            eventAt: operationalDispatchAt,
            stageId: null,
            channel: dispatchChannel,
            sourceTable: row.source_table ?? null,
            dimensions,
          });
          operationDispatchFallbackKeys.add(dispatchFactKey);
        }
      }

      if (leadKey && operationCanonicalLeadKeys.has(leadKey)) return;
      const syntheticStage = mapStage(rawRow.Estágio ?? row.estagio ?? rawRow.Status ?? row.status);
      const syntheticStageAt =
        (syntheticStage && syntheticStage !== "prospecting"
          ? inferOperationalFirstInterestAt(row, rawRow)
          : null) ??
        rawRow["Data do Envio"] ??
        rawRow["Data de Início"] ??
        row.created_at;
      if (!syntheticStageAt || !syntheticStage) return;
      const syntheticDate = new Date(syntheticStageAt);
      if (Number.isNaN(syntheticDate.getTime())) return;
      const effectiveSyntheticStage =
        syntheticStage === "lost" && hasOperationalInterestSignal(row, rawRow)
          ? "lead-interessado"
          : syntheticStage;
      const attributedChannels = dispatchChannel ? [dispatchChannel] : [];
      const breakdownBuckets = resolveLeadBreakdownBuckets(breakdowns, row, rawRow, periods);
      const dimensions = extractDimensions(row, rawRow);

      periods.forEach((period) => {
        if (!isWithinPeriod(syntheticDate, period, now)) return;
        applyStageMovement(
          operationPeriods[period],
          effectiveSyntheticStage,
          syntheticStageAt,
          attributedChannels,
          false,
          dispatchChannel,
          false,
        );
        breakdownBuckets.forEach((bucket) => {
          applyStageMovement(
            bucket.periods[period],
            effectiveSyntheticStage,
            syntheticStageAt,
            attributedChannels,
            false,
            dispatchChannel,
            false,
          );
        });
      });

      facts.push({
        kind: "stage",
        eventAt: syntheticStageAt,
        stageId: effectiveSyntheticStage,
        channel: dispatchChannel,
        sourceTable: row.source_table ?? null,
        dimensions,
      });
    });

    operationBaseLeads.forEach(({ row }) => {
      if (!row.last_reply_at) return;
        const leadKey = normalizeLeadKey(row.nome, row.empresa);
        const primaryChannel =
          inferPrimaryChannel(row) ??
          (leadKey ? operationDispatchLeadMap.get(leadKey) ?? null : null);
        if (!primaryChannel || !row.last_reply_at) return;
        const replyAt = new Date(row.last_reply_at);
        if (Number.isNaN(replyAt.getTime())) return;
        const rawRow =
          row.source_table && row.id != null
            ? operationalRowsBySourceTable.get(row.source_table)?.get(String(row.id)) ?? null
            : null;
        const breakdownBuckets = resolveLeadBreakdownBuckets(breakdowns, row, rawRow, periods);
        const dimensions = extractDimensions(row, rawRow);

        periods.forEach((period) => {
          if (!isWithinPeriod(replyAt, period, now)) return;
          operationPeriods[period].channels[primaryChannel].replies += 1;
          breakdownBuckets.forEach((bucket) => {
            bucket.periods[period].channels[primaryChannel].replies += 1;
          });
        });

        facts.push({
          kind: "reply",
          eventAt: row.last_reply_at,
          stageId: null,
          channel: primaryChannel,
          sourceTable: row.source_table ?? null,
          dimensions,
        });
      });

    periods.forEach((period) => finalizePeriodSummary(operationPeriods[period]));

    const baseLeads = operationBaseLeads.map(({ createdAt, isUnstarted, dimensions, row }) => ({
      createdAt,
      isUnstarted,
      sourceTable: row.source_table ?? null,
      dimensions,
    }));

    const dimensionAvailability = Object.fromEntries(
      ICP_DIMENSIONS.map(({ id }) => [
        id,
        facts.some((fact) => Boolean(fact.dimensions[id])) ||
          baseLeads.some((lead) => Boolean(lead.dimensions[id])),
      ]),
    ) as Record<PortalIcpDimensionId, boolean>;

    const latestStageMovementAt =
      facts
        .filter((fact) => fact.kind === "stage")
        .map((fact) => fact.eventAt)
        .sort()
        .at(-1) ?? null;
    const latestDispatchEventAt =
      facts
        .filter((fact) => fact.kind === "dispatch")
        .map((fact) => fact.eventAt)
        .sort()
        .at(-1) ?? null;
    const latestReplyAt =
      facts
        .filter((fact) => fact.kind === "reply")
        .map((fact) => fact.eventAt)
        .sort()
        .at(-1) ?? null;

    return {
      operationId: operation.id,
      operationName: operation.name,
      periods: operationPeriods,
      breakdowns: finalizeBreakdowns(breakdowns),
      facts,
      baseLeads,
      dimensionAvailability,
      latestStageMovementAt,
      latestDispatchEventAt,
      latestReplyAt,
    } satisfies PortalOperationAnalytics;
  });

  return {
    operations,
    source: "live",
  };
}
