export interface Api4ComHangupStat {
  cause: string;
  count: number;
}

export interface Api4ComSdrTelemetryRow {
  extension: string;
  name: string;
  email: string;
  role: string;
  operations: string[];
  operationIds: string[];
  callsTotal: number;
  connectionsTotal: number;
  connectionRate: number;
  avgDurationConnectedSeconds: number;
  recordingsTotal: number;
  uniqueNumbersTotal: number;
  hangupsTop: Api4ComHangupStat[];
  previousCallsTotal: number;
  previousConnectionsTotal: number;
  previousConnectionRate: number;
  callDelta: number;
  connectionRateDelta: number;
  talkMinutes: number;
  attributionMode: "dedicated" | "shared";
}

export interface Api4ComOperationTelemetryRow {
  operationId: string;
  operationName: string;
  sdrOwners: string[];
  attributedSdrs: number;
  callsTotal: number;
  connectionsTotal: number;
  connectionRate: number;
  previousCallsTotal: number;
  previousConnectionsTotal: number;
  previousConnectionRate: number;
  callDelta: number;
  connectionRateDelta: number;
  talkMinutes: number;
  topHangups: Api4ComHangupStat[];
  attributionMode: "dedicated" | "shared" | "mixed";
}

export interface Api4ComTelemetrySummary {
  activeSdrs: number;
  callsTotal: number;
  connectionsTotal: number;
  connectionRate: number;
  previousCallsTotal: number;
  previousConnectionsTotal: number;
  previousConnectionRate: number;
  callDelta: number;
  connectionRateDelta: number;
  talkMinutes: number;
  sharedSdrs: number;
}

export interface Api4ComTelemetryDashboard {
  source: "live" | "snapshot";
  generatedAt: string;
  currentWindowLabel: string;
  previousWindowLabel: string;
  summary: Api4ComTelemetrySummary;
  sdrRows: Api4ComSdrTelemetryRow[];
  operationRows: Api4ComOperationTelemetryRow[];
  error?: string;
}
