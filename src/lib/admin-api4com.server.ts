import { execFile } from "node:child_process";
import { promises as fs } from "node:fs";
import { promisify } from "node:util";

import type {
  Api4ComHangupStat,
  Api4ComOperationTelemetryRow,
  Api4ComSdrTelemetryRow,
  Api4ComTelemetryDashboard,
  Api4ComTelemetrySummary,
} from "./admin-api4com.shared";

const execFileAsync = promisify(execFile);
const ROOT = "/root/.openclaw/workspace";
const REPORT_SCRIPT = `${ROOT}/automation/scripts/api4com_sdr_daily_report.py`;
const CREDENTIALS_PATH = "/root/.openclaw/credentials/api4com.env";

const operationIdByLabel: Record<string, string> = {
  Acelerato: "acelerato",
  DocSeg: "docseg",
  Iamit: "iamit",
  Incentiva: "incentiva",
  "Lima Duarte Alimentos": "lima-duarte-alimentos",
  Nimbus: "nimbus",
  "Plan Idiomas": "plan-idiomas",
  "Prime Action": "prime-action",
  "Trial Ambiental": "trial-ambiental",
  We9: "we9",
  "Café Fazenda Brasil": "cafe-fazenda-brasil",
  InMeta: "inmeta",
  R2B: "r2b",
};

type RawSummaryRow = {
  extension?: string;
  name?: string;
  email?: string;
  role?: string;
  operations?: string[];
  calls_total?: number;
  connections_total?: number;
  connection_rate?: number;
  avg_duration_connected?: number;
  recordings_total?: number;
  unique_numbers_total?: number;
  hangups_top?: [string, number][];
};

type RawApi4ComPayload = {
  generatedAt?: string;
  currentWindow?: { label?: string };
  previousWindow?: { label?: string };
  currentSummary?: Record<string, RawSummaryRow>;
  previousSummary?: Record<string, RawSummaryRow>;
};

function asNumber(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim()) {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function operationIdsFromLabels(labels: string[]) {
  return labels
    .map((label) => operationIdByLabel[label])
    .filter((value, index, array): value is string => !!value && array.indexOf(value) === index);
}

async function loadApi4ComToken() {
  const envToken = process.env.API4COM_TOKEN?.trim();
  if (envToken) return envToken;

  try {
    const raw = await fs.readFile(CREDENTIALS_PATH, "utf-8");
    for (const line of raw.split(/\r?\n/)) {
      if (line.startsWith("API4COM_TOKEN=")) {
        return line.split("=", 2)[1]?.trim().replace(/^['"]|['"]$/g, "") ?? "";
      }
    }
  } catch {
    return "";
  }

  return "";
}

function makeSnapshot(error: string): Api4ComTelemetryDashboard {
  const emptySummary: Api4ComTelemetrySummary = {
    activeSdrs: 0,
    callsTotal: 0,
    connectionsTotal: 0,
    connectionRate: 0,
    previousCallsTotal: 0,
    previousConnectionsTotal: 0,
    previousConnectionRate: 0,
    callDelta: 0,
    connectionRateDelta: 0,
    talkMinutes: 0,
    sharedSdrs: 0,
  };

  return {
    source: "snapshot",
    generatedAt: new Date().toISOString(),
    currentWindowLabel: "Sem leitura viva",
    previousWindowLabel: "Sem comparativo vivo",
    summary: emptySummary,
    sdrRows: [],
    operationRows: [],
    error,
  };
}

function mapHangups(raw: [string, number][] | undefined): Api4ComHangupStat[] {
  return Array.isArray(raw)
    ? raw
        .filter((item): item is [string, number] => Array.isArray(item) && item.length >= 2)
        .map(([cause, count]) => ({
          cause: String(cause || "UNKNOWN"),
          count: asNumber(count),
        }))
    : [];
}

function mergeSdrRows(payload: RawApi4ComPayload): Api4ComSdrTelemetryRow[] {
  const current = payload.currentSummary ?? {};
  const previous = payload.previousSummary ?? {};
  const extensions = Array.from(new Set([...Object.keys(current), ...Object.keys(previous)])).sort();

  return extensions
    .map((extension) => {
      const currentRow = current[extension] ?? {};
      const previousRow = previous[extension] ?? {};
      const operations = Array.isArray(currentRow.operations)
        ? currentRow.operations
        : Array.isArray(previousRow.operations)
          ? previousRow.operations
          : [];
      const callsTotal = asNumber(currentRow.calls_total);
      const connectionsTotal = asNumber(currentRow.connections_total);
      const previousCallsTotal = asNumber(previousRow.calls_total);
      const previousConnectionsTotal = asNumber(previousRow.connections_total);
      const connectionRate =
        callsTotal > 0 ? (connectionsTotal / callsTotal) * 100 : asNumber(currentRow.connection_rate);
      const previousConnectionRate =
        previousCallsTotal > 0
          ? (previousConnectionsTotal / previousCallsTotal) * 100
          : asNumber(previousRow.connection_rate);
      const avgDurationConnectedSeconds = asNumber(currentRow.avg_duration_connected);
      const operationIds = operationIdsFromLabels(operations);

      return {
        extension,
        name: String(currentRow.name || previousRow.name || extension),
        email: String(currentRow.email || previousRow.email || ""),
        role: String(currentRow.role || previousRow.role || ""),
        operations,
        operationIds,
        callsTotal,
        connectionsTotal,
        connectionRate,
        avgDurationConnectedSeconds,
        recordingsTotal: asNumber(currentRow.recordings_total),
        uniqueNumbersTotal: asNumber(currentRow.unique_numbers_total),
        hangupsTop: mapHangups(currentRow.hangups_top),
        previousCallsTotal,
        previousConnectionsTotal,
        previousConnectionRate,
        callDelta: callsTotal - previousCallsTotal,
        connectionRateDelta: connectionRate - previousConnectionRate,
        talkMinutes: Math.round((avgDurationConnectedSeconds * connectionsTotal) / 60),
        attributionMode: operationIds.length <= 1 ? "dedicated" : "shared",
      };
    })
    .filter((row) => row.callsTotal > 0 || row.previousCallsTotal > 0 || row.operationIds.length > 0);
}

function buildSummary(rows: Api4ComSdrTelemetryRow[]): Api4ComTelemetrySummary {
  const callsTotal = rows.reduce((sum, row) => sum + row.callsTotal, 0);
  const connectionsTotal = rows.reduce((sum, row) => sum + row.connectionsTotal, 0);
  const previousCallsTotal = rows.reduce((sum, row) => sum + row.previousCallsTotal, 0);
  const previousConnectionsTotal = rows.reduce((sum, row) => sum + row.previousConnectionsTotal, 0);

  return {
    activeSdrs: rows.filter((row) => row.callsTotal > 0).length,
    callsTotal,
    connectionsTotal,
    connectionRate: callsTotal > 0 ? (connectionsTotal / callsTotal) * 100 : 0,
    previousCallsTotal,
    previousConnectionsTotal,
    previousConnectionRate:
      previousCallsTotal > 0 ? (previousConnectionsTotal / previousCallsTotal) * 100 : 0,
    callDelta: callsTotal - previousCallsTotal,
    connectionRateDelta:
      (callsTotal > 0 ? (connectionsTotal / callsTotal) * 100 : 0) -
      (previousCallsTotal > 0 ? (previousConnectionsTotal / previousCallsTotal) * 100 : 0),
    talkMinutes: rows.reduce((sum, row) => sum + row.talkMinutes, 0),
    sharedSdrs: rows.filter((row) => row.attributionMode === "shared").length,
  };
}

function buildOperationRows(rows: Api4ComSdrTelemetryRow[], allowedOperationIds: string[] | "all") {
  const bucket = new Map<string, Api4ComOperationTelemetryRow>();

  for (const row of rows) {
    for (const operationId of row.operationIds) {
      if (allowedOperationIds !== "all" && !allowedOperationIds.includes(operationId)) {
        continue;
      }
      const operationName =
        row.operations.find((label) => operationIdByLabel[label] === operationId) ?? operationId;
      const existing = bucket.get(operationId) ?? {
        operationId,
        operationName,
        sdrOwners: [],
        attributedSdrs: 0,
        callsTotal: 0,
        connectionsTotal: 0,
        connectionRate: 0,
        previousCallsTotal: 0,
        previousConnectionsTotal: 0,
        previousConnectionRate: 0,
        callDelta: 0,
        connectionRateDelta: 0,
        talkMinutes: 0,
        topHangups: [],
        attributionMode: "dedicated" as const,
      };

      existing.sdrOwners = Array.from(new Set([...existing.sdrOwners, row.name]));
      existing.attributedSdrs += 1;
      existing.callsTotal += row.callsTotal;
      existing.connectionsTotal += row.connectionsTotal;
      existing.previousCallsTotal += row.previousCallsTotal;
      existing.previousConnectionsTotal += row.previousConnectionsTotal;
      existing.talkMinutes += row.talkMinutes;
      existing.attributionMode =
        existing.attributionMode === "dedicated" && row.attributionMode === "dedicated"
          ? "dedicated"
          : existing.attributionMode === "shared" && row.attributionMode === "shared"
            ? "shared"
            : "mixed";

      const hangupMap = new Map(existing.topHangups.map((item) => [item.cause, item.count]));
      for (const hangup of row.hangupsTop) {
        hangupMap.set(hangup.cause, (hangupMap.get(hangup.cause) ?? 0) + hangup.count);
      }
      existing.topHangups = Array.from(hangupMap.entries())
        .map(([cause, count]) => ({ cause, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 3);

      bucket.set(operationId, existing);
    }
  }

  return Array.from(bucket.values())
    .map((row) => ({
      ...row,
      connectionRate: row.callsTotal > 0 ? (row.connectionsTotal / row.callsTotal) * 100 : 0,
      previousConnectionRate:
        row.previousCallsTotal > 0
          ? (row.previousConnectionsTotal / row.previousCallsTotal) * 100
          : 0,
      callDelta: row.callsTotal - row.previousCallsTotal,
      connectionRateDelta:
        (row.callsTotal > 0 ? (row.connectionsTotal / row.callsTotal) * 100 : 0) -
        (row.previousCallsTotal > 0
          ? (row.previousConnectionsTotal / row.previousCallsTotal) * 100
          : 0),
    }))
    .sort((a, b) => b.callsTotal - a.callsTotal || a.operationName.localeCompare(b.operationName));
}

export async function loadApi4ComTelemetryDashboard(params?: {
  operationIds?: string[] | "all";
}): Promise<Api4ComTelemetryDashboard> {
  const token = await loadApi4ComToken();
  if (!token) {
    return makeSnapshot("API4COM_TOKEN não encontrado.");
  }

  try {
    const { stdout } = await execFileAsync(
      "python3",
      [REPORT_SCRIPT, "--format", "json"],
      {
        env: {
          ...process.env,
          API4COM_TOKEN: token,
        },
        maxBuffer: 10 * 1024 * 1024,
        timeout: 45_000,
      },
    );

    const payload = JSON.parse(stdout) as RawApi4ComPayload;
    const allRows = mergeSdrRows(payload);
    const operationIds = params?.operationIds ?? "all";
    const scopedRows =
      operationIds === "all"
        ? allRows
        : allRows.filter((row) => row.operationIds.some((operationId) => operationIds.includes(operationId)));

    return {
      source: "live",
      generatedAt: String(payload.generatedAt || new Date().toISOString()),
      currentWindowLabel: String(payload.currentWindow?.label || "Janela atual"),
      previousWindowLabel: String(payload.previousWindow?.label || "Comparativo anterior"),
      summary: buildSummary(scopedRows),
      sdrRows: scopedRows,
      operationRows: buildOperationRows(scopedRows, operationIds),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Falha ao carregar API4Com.";
    return makeSnapshot(message);
  }
}
