export type PortalPeriodPreset = "mtd" | "7d" | "30d" | "90d";

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
  unattributedStageCount: number;
  timeline: PortalTimelinePoint[];
}

export interface PortalOperationAnalytics {
  operationId: string;
  operationName: string;
  periods: Record<PortalPeriodPreset, PortalPeriodSummary>;
}

export interface PortalAnalyticsDashboard {
  operations: PortalOperationAnalytics[];
  source: "live" | "snapshot";
}

type SupabaseClientConfig = {
  url: string;
  accessKey: string;
};

const PERIOD_LABELS: Record<PortalPeriodPreset, string> = {
  mtd: "Mês atual",
  "7d": "Últimos 7 dias",
  "30d": "Últimos 30 dias",
  "90d": "Últimos 90 dias",
};

function getSupabaseUrl() {
  return (
    process.env.ADMIN_INCENTIVA_SUPABASE_URL?.trim() ||
    process.env.VITE_SUPABASE_URL?.trim() ||
    (import.meta.env.VITE_SUPABASE_URL as string | undefined)?.trim() ||
    ""
  );
}

function getSupabaseServiceRoleKey() {
  return (
    process.env.ADMIN_INCENTIVA_SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SERVICE_ROLE?.trim() ||
    ""
  );
}

function getSupabaseAnonKey() {
  return (
    process.env.ADMIN_INCENTIVA_SUPABASE_ANON_KEY?.trim() ||
    process.env.VITE_SUPABASE_ANON_KEY?.trim() ||
    (import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined)?.trim() ||
    ""
  );
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
    "Accept-Profile": "governance",
    ...extra,
  };
}

async function fetchAllRows<T>(
  config: SupabaseClientConfig,
  table: string,
  select: string,
  operationNames: string[],
): Promise<T[]> {
  const pageSize = 2000;
  let offset = 0;
  const rows: T[] = [];

  while (true) {
    const endpoint = new URL(`${config.url.replace(/\/$/, "")}/rest/v1/${table}`);
    endpoint.searchParams.set("select", select);
    endpoint.searchParams.set("limit", String(pageSize));
    endpoint.searchParams.set("offset", String(offset));
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

function periodStart(period: PortalPeriodPreset, now: Date) {
  const today = createLocalDateAtMidnight(now);
  if (period === "mtd") {
    return new Date(`${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-01T00:00:00-03:00`);
  }
  const days = period === "7d" ? 6 : period === "30d" ? 29 : 89;
  return new Date(today.getTime() - days * 24 * 60 * 60 * 1000);
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
  switch (rawStage) {
    case "prospecting":
      return "prospecting";
    case "lead_interessado":
      return "lead-interessado";
    case "mql_agendado":
      return "mql-agendado";
    case "mql_realizado":
      return "mql-realizado";
    case "negotiation":
      return "negotiation";
    case "won":
      return "won";
    case "lost":
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

  summary.firstInterestPct = ratioPct(
    summary.stageCounts["lead-interessado"],
    summary.stageCounts.prospecting,
  );
  summary.scheduledPct = ratioPct(
    summary.stageCounts["mql-agendado"],
    summary.stageCounts["lead-interessado"],
  );
  summary.negotiationPct = ratioPct(
    summary.stageCounts.negotiation,
    summary.stageCounts["mql-agendado"],
  );
  summary.wonPct = ratioPct(summary.stageCounts.won, summary.stageCounts.negotiation);

  (["email", "linkedin", "whatsapp"] as ChannelId[]).forEach((channelId) => {
    const channel = summary.channels[channelId];
    channel.firstInterestPct = ratioPct(channel.leadInteressado, channel.touched);
    channel.scheduledPct = ratioPct(channel.mqlAgendado, channel.leadInteressado);
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

  const [leadRows, notionRows, notionSnapshotRows] = await Promise.all([
    fetchAllRows<LeadsBaseRow>(
      config,
      "leads_base_v1",
      "operation_name,nome,empresa,created_at,status,estagio,canal,status_email,status_linkedin,status_whatsapp,last_reply_at",
      operationNames,
    ),
    fetchAllRows<NotionCanonicalRow>(
      config,
      "notion_funnel_canonical_v1",
      "operation_name,page_id,nome,empresa,last_edited_at,canonical_stage,canal",
      operationNames,
    ),
    fetchAllRows<NotionSnapshotRow>(
      config,
      "notion_leads_snapshot_v1",
      "operation_name,page_id,nome,empresa,status,canal,last_edited_at,raw_properties",
      operationNames,
    ).catch(() => []),
  ]);

  const baseMaps = new Map<string, Map<string, LeadsBaseRow>>();
  leadRows.forEach((row) => {
    const leadKey = normalizeLeadKey(row.nome, row.empresa);
    if (!leadKey) return;
    const current = baseMaps.get(row.operation_name) ?? new Map<string, LeadsBaseRow>();
    current.set(leadKey, row);
    baseMaps.set(row.operation_name, current);
  });

  const snapshotMaps = new Map<string, Map<string, NotionSnapshotRow>>();
  notionSnapshotRows.forEach((row) => {
    const snapshotKey = row.page_id ?? normalizeLeadKey(row.nome, row.empresa);
    if (!snapshotKey) return;
    const current = snapshotMaps.get(row.operation_name) ?? new Map<string, NotionSnapshotRow>();
    current.set(snapshotKey, row);
    snapshotMaps.set(row.operation_name, current);
  });

  const periods: PortalPeriodPreset[] = ["mtd", "7d", "30d", "90d"];
  const now = new Date();
  const operations = params.operationScope.map((operation) => {
    const operationPeriods = Object.fromEntries(
      periods.map((period) => [period, createPeriodSummary(period)]),
    ) as Record<PortalPeriodPreset, PortalPeriodSummary>;

    const operationBaseMap = baseMaps.get(operation.name) ?? new Map<string, LeadsBaseRow>();
    const operationSnapshotMap = snapshotMaps.get(operation.name) ?? new Map<string, NotionSnapshotRow>();

    notionRows
      .filter((row) => row.operation_name === operation.name)
      .forEach((row) => {
        const stageId = mapStage(row.canonical_stage);
        if (!stageId || !row.last_edited_at) return;
        const editedAt = new Date(row.last_edited_at);
        if (Number.isNaN(editedAt.getTime())) return;
        const leadKey = normalizeLeadKey(row.nome, row.empresa);
        const baseRow = leadKey ? operationBaseMap.get(leadKey) ?? null : null;
        const snapshotRow =
          (row.page_id ? operationSnapshotMap.get(row.page_id) : null) ??
          (leadKey ? operationSnapshotMap.get(leadKey) ?? null : null);
        const primaryChannel =
          (baseRow ? inferPrimaryChannel(baseRow) : null) ??
          mapRawChannel(row.canal);
        const channelSignals = baseRow ? detectChannelSignals(baseRow) : [];
        const dispatchChannel =
          extractDispatchChannelFromRawProperties(snapshotRow?.raw_properties) ??
          (baseRow?.status_linkedin && primaryChannel === "linkedin" ? "linkedin" : null);
        const attributedChannels =
          primaryChannel
            ? [primaryChannel]
            : dispatchChannel
              ? [dispatchChannel]
              : channelSignals.length === 1
                ? channelSignals
                : channelSignals;

        periods.forEach((period) => {
          if (editedAt < periodStart(period, now)) return;
          const summary = operationPeriods[period];
          summary.stageCounts[stageId] += 1;

          if (dispatchChannel) {
            summary.channels[dispatchChannel].dispatches += 1;
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

          const dayLabel = localDayLabel(row.last_edited_at);
          const dayKey = row.last_edited_at.slice(0, 10);
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
        });
      });

    leadRows
      .filter((row) => row.operation_name === operation.name && row.last_reply_at)
      .forEach((row) => {
        const primaryChannel = inferPrimaryChannel(row);
        if (!primaryChannel || !row.last_reply_at) return;
        const replyAt = new Date(row.last_reply_at);
        if (Number.isNaN(replyAt.getTime())) return;

        periods.forEach((period) => {
          if (replyAt < periodStart(period, now)) return;
          operationPeriods[period].channels[primaryChannel].replies += 1;
        });
      });

    periods.forEach((period) => finalizePeriodSummary(operationPeriods[period]));

    return {
      operationId: operation.id,
      operationName: operation.name,
      periods: operationPeriods,
    } satisfies PortalOperationAnalytics;
  });

  return {
    operations,
    source: "live",
  };
}
