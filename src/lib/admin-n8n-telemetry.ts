import { readEnvString } from "./runtime-env";

export type N8nTelemetrySource = "live" | "snapshot";

export interface N8nOperationTelemetryRow {
  operationId: string;
  operationName: string;
  workflowCount: number;
  activeWorkflowCount: number;
  execToday: number;
  successToday: number;
  errorToday: number;
  waitingToday: number;
  canceledToday: number;
  execYesterday: number;
  successYesterday: number;
  errorYesterday: number;
  waitingYesterday: number;
  canceledYesterday: number;
  exec7d: number;
  success7d: number;
  error7d: number;
  waiting7d: number;
  canceled7d: number;
  lastRunAt: string | null;
  snapshotAt: string | null;
}

export interface N8nWorkflowTelemetryRow {
  workflowId: string;
  workflowName: string;
  operationId: string;
  operationName: string;
  workflowFamily: string;
  active: boolean;
  execToday: number;
  successToday: number;
  errorToday: number;
  waitingToday: number;
  canceledToday: number;
  execYesterday: number;
  successYesterday: number;
  errorYesterday: number;
  waitingYesterday: number;
  canceledYesterday: number;
  exec7d: number;
  success7d: number;
  error7d: number;
  waiting7d: number;
  canceled7d: number;
  lastRunAt: string | null;
  lastStatus: string | null;
  lastErrorAt: string | null;
  lastErrorMessage: string | null;
  snapshotAt: string | null;
}

export interface N8nTelemetryMetricCard {
  id: string;
  label: string;
  value: string;
  detail: string;
  tone: "healthy" | "monitor" | "risk" | "critical";
}

export interface N8nTelemetryDashboard {
  source: N8nTelemetrySource;
  snapshotLabel: string;
  metrics: N8nTelemetryMetricCard[];
  operations: N8nOperationTelemetryRow[];
  workflows: N8nWorkflowTelemetryRow[];
}

type SupabaseOperationRow = {
  operation_id: string;
  operation_name: string;
  workflow_count: number | string | null;
  active_workflow_count: number | string | null;
  exec_today: number | string | null;
  success_today: number | string | null;
  error_today: number | string | null;
  waiting_today: number | string | null;
  canceled_today: number | string | null;
  exec_yesterday: number | string | null;
  success_yesterday: number | string | null;
  error_yesterday: number | string | null;
  waiting_yesterday: number | string | null;
  canceled_yesterday: number | string | null;
  exec_7d: number | string | null;
  success_7d: number | string | null;
  error_7d: number | string | null;
  waiting_7d: number | string | null;
  canceled_7d: number | string | null;
  last_run_at: string | null;
  snapshot_at: string | null;
};

type SupabaseWorkflowRow = {
  workflow_id: string;
  workflow_name: string;
  operation_id: string;
  operation_name: string;
  workflow_family: string;
  active: boolean;
  exec_today: number | string | null;
  success_today: number | string | null;
  error_today: number | string | null;
  waiting_today: number | string | null;
  canceled_today: number | string | null;
  exec_yesterday: number | string | null;
  success_yesterday: number | string | null;
  error_yesterday: number | string | null;
  waiting_yesterday: number | string | null;
  canceled_yesterday: number | string | null;
  exec_7d: number | string | null;
  success_7d: number | string | null;
  error_7d: number | string | null;
  waiting_7d: number | string | null;
  canceled_7d: number | string | null;
  last_run_at: string | null;
  last_status: string | null;
  last_error_at: string | null;
  last_error_message: string | null;
  snapshot_at: string | null;
};

function toNumber(value: number | string | null | undefined) {
  if (typeof value === "number") return value;
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toSnapshotLabel(value: string | null | undefined) {
  if (!value) return "Snapshot de telemetria indisponível";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Snapshot de telemetria indisponível";
  return `Leitura viva do n8n VPS · ${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
    "pt-BR",
    { hour: "2-digit", minute: "2-digit" },
  )}`;
}

function ratio(success: number, total: number) {
  if (total <= 0) return 0;
  return (success / total) * 100;
}

function formatPercent(value: number) {
  return `${value.toLocaleString("pt-BR", { maximumFractionDigits: value >= 10 ? 0 : 1 })}%`;
}

function buildMetrics(
  operations: N8nOperationTelemetryRow[],
  workflows: N8nWorkflowTelemetryRow[],
): N8nTelemetryMetricCard[] {
  const execToday = operations.reduce((sum, row) => sum + row.execToday, 0);
  const successToday = operations.reduce((sum, row) => sum + row.successToday, 0);
  const errorToday = operations.reduce((sum, row) => sum + row.errorToday, 0);
  const waitingToday = operations.reduce((sum, row) => sum + row.waitingToday, 0);
  const exec7d = operations.reduce((sum, row) => sum + row.exec7d, 0);
  const success7d = operations.reduce((sum, row) => sum + row.success7d, 0);
  const activeWorkflows = workflows.filter((row) => row.active).length;
  const recentAttention = workflows.filter(
    (row) => row.errorToday > 0 || row.waitingToday > 0 || row.error7d > 0,
  ).length;

  return [
    {
      id: "ops-monitored",
      label: "Operações monitoradas",
      value: String(operations.length),
      detail: "Somente operações dentro do escopo da sessão atual.",
      tone: operations.length > 0 ? "healthy" : "monitor",
    },
    {
      id: "exec-today",
      label: "Execuções hoje",
      value: execToday.toLocaleString("pt-BR"),
      detail: `Sucesso hoje em ${formatPercent(ratio(successToday, execToday))}.`,
      tone: errorToday > 0 ? "monitor" : "healthy",
    },
    {
      id: "error-today",
      label: "Erros hoje",
      value: errorToday.toLocaleString("pt-BR"),
      detail: waitingToday > 0 ? `${waitingToday} workflow(s) com waiting hoje.` : "Sem waiting relevante hoje.",
      tone: errorToday >= 10 ? "critical" : errorToday > 0 ? "risk" : "healthy",
    },
    {
      id: "success-7d",
      label: "Taxa 7 dias",
      value: formatPercent(ratio(success7d, exec7d)),
      detail: `${exec7d.toLocaleString("pt-BR")} execuções nos últimos 7 dias dentro deste escopo.`,
      tone: ratio(success7d, exec7d) < 90 ? "monitor" : "healthy",
    },
    {
      id: "active-workflows",
      label: "Workflows ativos",
      value: activeWorkflows.toLocaleString("pt-BR"),
      detail: `${recentAttention.toLocaleString("pt-BR")} workflow(s) pedem atenção por erro ou waiting.`,
      tone: recentAttention > 0 ? "monitor" : "healthy",
    },
  ];
}

function mapOperationRow(row: SupabaseOperationRow): N8nOperationTelemetryRow {
  return {
    operationId: row.operation_id,
    operationName: row.operation_name,
    workflowCount: toNumber(row.workflow_count),
    activeWorkflowCount: toNumber(row.active_workflow_count),
    execToday: toNumber(row.exec_today),
    successToday: toNumber(row.success_today),
    errorToday: toNumber(row.error_today),
    waitingToday: toNumber(row.waiting_today),
    canceledToday: toNumber(row.canceled_today),
    execYesterday: toNumber(row.exec_yesterday),
    successYesterday: toNumber(row.success_yesterday),
    errorYesterday: toNumber(row.error_yesterday),
    waitingYesterday: toNumber(row.waiting_yesterday),
    canceledYesterday: toNumber(row.canceled_yesterday),
    exec7d: toNumber(row.exec_7d),
    success7d: toNumber(row.success_7d),
    error7d: toNumber(row.error_7d),
    waiting7d: toNumber(row.waiting_7d),
    canceled7d: toNumber(row.canceled_7d),
    lastRunAt: row.last_run_at,
    snapshotAt: row.snapshot_at,
  };
}

function mapWorkflowRow(row: SupabaseWorkflowRow): N8nWorkflowTelemetryRow {
  return {
    workflowId: row.workflow_id,
    workflowName: row.workflow_name,
    operationId: row.operation_id,
    operationName: row.operation_name,
    workflowFamily: row.workflow_family,
    active: Boolean(row.active),
    execToday: toNumber(row.exec_today),
    successToday: toNumber(row.success_today),
    errorToday: toNumber(row.error_today),
    waitingToday: toNumber(row.waiting_today),
    canceledToday: toNumber(row.canceled_today),
    execYesterday: toNumber(row.exec_yesterday),
    successYesterday: toNumber(row.success_yesterday),
    errorYesterday: toNumber(row.error_yesterday),
    waitingYesterday: toNumber(row.waiting_yesterday),
    canceledYesterday: toNumber(row.canceled_yesterday),
    exec7d: toNumber(row.exec_7d),
    success7d: toNumber(row.success_7d),
    error7d: toNumber(row.error_7d),
    waiting7d: toNumber(row.waiting_7d),
    canceled7d: toNumber(row.canceled_7d),
    lastRunAt: row.last_run_at,
    lastStatus: row.last_status,
    lastErrorAt: row.last_error_at,
    lastErrorMessage: row.last_error_message,
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

async function supabaseFetchAllRows<T>(
  path: string,
  search: URLSearchParams,
) {
  const pageSize = 1000;
  let offset = 0;
  const rows: T[] = [];

  while (true) {
    const pageSearch = new URLSearchParams(search);
    pageSearch.set("limit", String(pageSize));
    pageSearch.set("offset", String(offset));
    const page = await supabaseFetch<T[]>(path, pageSearch);
    if (!page?.length) break;
    rows.push(...page);
    if (page.length < pageSize) break;
    offset += pageSize;
  }

  return rows;
}

export async function loadN8nTelemetryDashboard(params?: {
  operationIds?: string[] | "all";
}): Promise<N8nTelemetryDashboard> {
  try {
    const operationSearch = new URLSearchParams();
    operationSearch.set("select", "*");
    operationSearch.set("order", "error_today.desc,error_7d.desc,waiting_today.desc,operation_name.asc");
    if (params?.operationIds && params.operationIds !== "all" && params.operationIds.length > 0) {
      operationSearch.set("operation_id", `in.(${params.operationIds.join(",")})`);
    }

    const workflowSearch = new URLSearchParams();
    workflowSearch.set(
      "select",
      "workflow_id,workflow_name,operation_id,operation_name,workflow_family,active,exec_today,success_today,error_today,waiting_today,canceled_today,exec_yesterday,success_yesterday,error_yesterday,waiting_yesterday,canceled_yesterday,exec_7d,success_7d,error_7d,waiting_7d,canceled_7d,last_run_at,last_status,last_error_at,last_error_message,snapshot_at",
    );
    workflowSearch.set("order", "error_today.desc,error_7d.desc,waiting_today.desc,exec_today.desc,workflow_name.asc");
    if (params?.operationIds && params.operationIds !== "all" && params.operationIds.length > 0) {
      workflowSearch.set("operation_id", `in.(${params.operationIds.join(",")})`);
    }

    const [operationRows, workflowRows] = await Promise.all([
      supabaseFetchAllRows<SupabaseOperationRow>("admin_n8n_operation_telemetry_v1", operationSearch),
      supabaseFetchAllRows<SupabaseWorkflowRow>("admin_n8n_workflow_telemetry_v1", workflowSearch),
    ]);

    if (!operationRows?.length || !workflowRows?.length) {
      return {
        source: "snapshot",
        snapshotLabel: "Telemetria n8n ainda não materializada",
        metrics: [],
        operations: [],
        workflows: [],
      };
    }

    const operations = operationRows.map(mapOperationRow);
    const workflows = workflowRows.map(mapWorkflowRow);
    const snapshotLabel = toSnapshotLabel(
      [...operations, ...workflows]
        .map((row) => row.snapshotAt)
        .filter(Boolean)
        .sort()
        .at(-1) ?? null,
    );

    return {
      source: "live",
      snapshotLabel,
      metrics: buildMetrics(operations, workflows),
      operations,
      workflows,
    };
  } catch (error) {
    console.error(error);
    return {
      source: "snapshot",
      snapshotLabel: "Telemetria n8n em fallback",
      metrics: [],
      operations: [],
      workflows: [],
    };
  }
}
