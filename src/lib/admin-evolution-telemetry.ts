import { readEnvString } from "./runtime-env";

export type EvolutionTelemetrySource = "live" | "snapshot";

export interface EvolutionOperationTelemetryRow {
  operationId: string;
  operationName: string;
  instanceCount: number;
  healthyInstances: number;
  attentionInstances: number;
  criticalInstances: number;
  outbound24h: number;
  replies24h: number;
  delivered24h: number;
  read24h: number;
  errors24h: number;
  stalled24h: number;
  snapshotAt: string | null;
}

export interface EvolutionInstanceTelemetryRow {
  operationId: string;
  operationName: string;
  instanceName: string;
  instanceRole: string;
  registryStatus: string | null;
  sendEnabled: boolean;
  parallelSendEnabled: boolean;
  severity: "healthy" | "attention" | "critical" | "insufficient";
  reason: string;
  spikeAlert: boolean;
  spikeReason: string | null;
  outbound24h: number;
  inbound24h: number;
  uniqueTargets24h: number;
  replyContacts24h: number;
  delivered24h: number;
  read24h: number;
  errors24h: number;
  stalled24h: number;
  outbound7d: number;
  inbound7d: number;
  disconnectCode: string | null;
  disconnectAt: string | null;
  snapshotAt: string | null;
}

export interface EvolutionTelemetryMetricCard {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: "healthy" | "monitor" | "risk" | "critical";
}

export interface EvolutionTelemetryDashboard {
  source: EvolutionTelemetrySource;
  snapshotLabel: string;
  metrics: EvolutionTelemetryMetricCard[];
  operations: EvolutionOperationTelemetryRow[];
  instances: EvolutionInstanceTelemetryRow[];
}

type SupabaseOperationRow = {
  operation_id: string;
  operation_name: string;
  instance_count: number | string | null;
  healthy_instances: number | string | null;
  attention_instances: number | string | null;
  critical_instances: number | string | null;
  outbound_24h: number | string | null;
  replies_24h: number | string | null;
  delivered_24h: number | string | null;
  read_24h: number | string | null;
  errors_24h: number | string | null;
  stalled_24h: number | string | null;
  snapshot_at: string | null;
};

type SupabaseInstanceRow = {
  operation_id: string;
  operation_name: string;
  instance_name: string;
  instance_role: string;
  registry_status: string | null;
  send_enabled: boolean;
  parallel_send_enabled: boolean;
  severity: "healthy" | "attention" | "critical" | "insufficient";
  reason: string;
  spike_alert: boolean;
  spike_reason: string | null;
  outbound_24h: number | string | null;
  inbound_24h: number | string | null;
  unique_targets_24h: number | string | null;
  reply_contacts_24h: number | string | null;
  delivered_24h: number | string | null;
  read_24h: number | string | null;
  errors_24h: number | string | null;
  stalled_24h: number | string | null;
  outbound_7d: number | string | null;
  inbound_7d: number | string | null;
  disconnect_code: string | null;
  disconnect_at: string | null;
  snapshot_at: string | null;
};

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toSnapshotLabel(value: string | null | undefined) {
  if (!value) return "Telemetria Evolution indisponível";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Telemetria Evolution indisponível";
  return `Leitura viva da Evolution · ${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
    "pt-BR",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}

function buildMetrics(
  operations: EvolutionOperationTelemetryRow[],
  instances: EvolutionInstanceTelemetryRow[],
): EvolutionTelemetryMetricCard[] {
  const instanceCount = instances.length;
  const criticalInstances = instances.filter((row) => row.severity === "critical").length;
  const attentionInstances = instances.filter((row) => row.severity === "attention").length;
  const outbound24h = operations.reduce((sum, row) => sum + row.outbound24h, 0);
  const reply24h = operations.reduce((sum, row) => sum + row.replies24h, 0);
  const delivered24h = operations.reduce((sum, row) => sum + row.delivered24h, 0);
  const errors24h = operations.reduce((sum, row) => sum + row.errors24h, 0);
  const stalled24h = operations.reduce((sum, row) => sum + row.stalled24h, 0);
  const deliveryRate = outbound24h > 0 ? (delivered24h / outbound24h) * 100 : 0;
  const replyRate = outbound24h > 0 ? (reply24h / outbound24h) * 100 : 0;

  return [
    {
      id: "evolution-ops",
      label: "Operações com WhatsApp",
      value: String(operations.length),
      detail: `${instanceCount.toLocaleString("pt-BR")} instância(s) governadas neste recorte.`,
      tone: operations.length > 0 ? "healthy" : "monitor",
    },
    {
      id: "evolution-critical",
      label: "Instâncias críticas",
      value: criticalInstances.toLocaleString("pt-BR"),
      detail: `${attentionInstances.toLocaleString("pt-BR")} em atenção além das críticas.`,
      tone: criticalInstances > 0 ? "critical" : attentionInstances > 0 ? "monitor" : "healthy",
    },
    {
      id: "evolution-outbound",
      label: "Envios 24h",
      value: outbound24h.toLocaleString("pt-BR"),
      detail: `Reply rate em ${replyRate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%.`,
      tone: replyRate < 5 && outbound24h >= 50 ? "risk" : "healthy",
    },
    {
      id: "evolution-delivery",
      label: "Entrega 24h",
      value: `${deliveryRate.toLocaleString("pt-BR", { maximumFractionDigits: 1 })}%`,
      detail: `${errors24h.toLocaleString("pt-BR")} erro(s) e ${stalled24h.toLocaleString("pt-BR")} envio(s) travado(s).`,
      tone: errors24h > 0 || stalled24h > 0 ? "risk" : "healthy",
    },
  ];
}

function mapOperationRow(row: SupabaseOperationRow): EvolutionOperationTelemetryRow {
  return {
    operationId: row.operation_id,
    operationName: row.operation_name,
    instanceCount: toNumber(row.instance_count),
    healthyInstances: toNumber(row.healthy_instances),
    attentionInstances: toNumber(row.attention_instances),
    criticalInstances: toNumber(row.critical_instances),
    outbound24h: toNumber(row.outbound_24h),
    replies24h: toNumber(row.replies_24h),
    delivered24h: toNumber(row.delivered_24h),
    read24h: toNumber(row.read_24h),
    errors24h: toNumber(row.errors_24h),
    stalled24h: toNumber(row.stalled_24h),
    snapshotAt: row.snapshot_at,
  };
}

function mapInstanceRow(row: SupabaseInstanceRow): EvolutionInstanceTelemetryRow {
  return {
    operationId: row.operation_id,
    operationName: row.operation_name,
    instanceName: row.instance_name,
    instanceRole: row.instance_role,
    registryStatus: row.registry_status,
    sendEnabled: Boolean(row.send_enabled),
    parallelSendEnabled: Boolean(row.parallel_send_enabled),
    severity: row.severity,
    reason: row.reason,
    spikeAlert: Boolean(row.spike_alert),
    spikeReason: row.spike_reason,
    outbound24h: toNumber(row.outbound_24h),
    inbound24h: toNumber(row.inbound_24h),
    uniqueTargets24h: toNumber(row.unique_targets_24h),
    replyContacts24h: toNumber(row.reply_contacts_24h),
    delivered24h: toNumber(row.delivered_24h),
    read24h: toNumber(row.read_24h),
    errors24h: toNumber(row.errors_24h),
    stalled24h: toNumber(row.stalled_24h),
    outbound7d: toNumber(row.outbound_7d),
    inbound7d: toNumber(row.inbound_7d),
    disconnectCode: row.disconnect_code,
    disconnectAt: row.disconnect_at,
    snapshotAt: row.snapshot_at,
  };
}

async function supabaseFetch<T>(path: string, search: URLSearchParams) {
  const url = readEnvString("ADMIN_INCENTIVA_SUPABASE_URL", "VITE_SUPABASE_URL");
  const key = readEnvString("ADMIN_INCENTIVA_SUPABASE_ANON_KEY", "VITE_SUPABASE_ANON_KEY");

  if (!url || !key) return null;

  const endpoint = new URL(`${url.replace(/\/$/, "")}/rest/v1/${path}`);
  endpoint.search = search.toString();

  const response = await fetch(endpoint.toString(), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    throw new Error(`supabase_${path}_failed_${response.status}`);
  }

  return (await response.json()) as T;
}

export async function loadEvolutionTelemetryDashboard(params?: {
  operationIds?: string[] | "all";
}): Promise<EvolutionTelemetryDashboard> {
  try {
    const operationSearch = new URLSearchParams();
    operationSearch.set("select", "*");
    operationSearch.set("order", "critical_instances.desc,attention_instances.desc,operation_name.asc");
    if (params?.operationIds && params.operationIds !== "all" && params.operationIds.length > 0) {
      operationSearch.set("operation_id", `in.(${params.operationIds.join(",")})`);
    }

    const instanceSearch = new URLSearchParams();
    instanceSearch.set(
      "select",
      "operation_id,operation_name,instance_name,instance_role,registry_status,send_enabled,parallel_send_enabled,severity,reason,spike_alert,spike_reason,outbound_24h,inbound_24h,unique_targets_24h,reply_contacts_24h,delivered_24h,read_24h,errors_24h,stalled_24h,outbound_7d,inbound_7d,disconnect_code,disconnect_at,snapshot_at",
    );
    instanceSearch.set("order", "severity.asc,operation_name.asc,instance_role.asc,instance_name.asc");
    instanceSearch.set("limit", "80");
    if (params?.operationIds && params.operationIds !== "all" && params.operationIds.length > 0) {
      instanceSearch.set("operation_id", `in.(${params.operationIds.join(",")})`);
    }

    const [operationRows, instanceRows] = await Promise.all([
      supabaseFetch<SupabaseOperationRow[]>("admin_evolution_operation_telemetry_v1", operationSearch),
      supabaseFetch<SupabaseInstanceRow[]>("admin_evolution_instance_telemetry_v1", instanceSearch),
    ]);

    if (!operationRows?.length || !instanceRows?.length) {
      return {
        source: "snapshot",
        snapshotLabel: "Telemetria Evolution ainda não materializada",
        metrics: [],
        operations: [],
        instances: [],
      };
    }

    const operations = operationRows.map(mapOperationRow);
    const instances = instanceRows.map(mapInstanceRow);
    return {
      source: "live",
      snapshotLabel: toSnapshotLabel(operations[0]?.snapshotAt ?? instances[0]?.snapshotAt ?? null),
      metrics: buildMetrics(operations, instances),
      operations,
      instances,
    };
  } catch (error) {
    console.error(error);
    return {
      source: "snapshot",
      snapshotLabel: "Telemetria Evolution em fallback",
      metrics: [],
      operations: [],
      instances: [],
    };
  }
}
