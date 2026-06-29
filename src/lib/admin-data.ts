// Mock data layer. Replace these functions with real API calls later —
// component layer should not change.

export type OperationStatus = "healthy" | "monitor" | "risk" | "critical";
export type Priority = "P0" | "P1" | "P2" | "P3";

export interface Operation {
  id: string;
  name: string;
  client: string;
  priority: Priority;
  focus: string;
  score: number; // 0-100
  baseCoverage: number; // 0-100 %
  dataReconciliation: number; // 0-100 %
  monthlyConversion: number; // 0-100 %
  health: OperationStatus;
  owner: string;
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

const operations: Operation[] = [
  {
    id: "op-acme",
    name: "ACME Industrial",
    client: "ACME S.A.",
    priority: "P0",
    focus: "Recuperação de churn",
    score: 42,
    baseCoverage: 58,
    dataReconciliation: 71,
    monthlyConversion: 9.2,
    health: "critical",
    owner: "M. Silva",
  },
  {
    id: "op-northwind",
    name: "Northwind Logística",
    client: "Northwind Co.",
    priority: "P0",
    focus: "Ativação de base fria",
    score: 56,
    baseCoverage: 64,
    dataReconciliation: 82,
    monthlyConversion: 12.4,
    health: "risk",
    owner: "C. Rojas",
  },
  {
    id: "op-helix",
    name: "Helix Pharma",
    client: "Helix Group",
    priority: "P1",
    focus: "Expansão Enterprise",
    score: 71,
    baseCoverage: 79,
    dataReconciliation: 88,
    monthlyConversion: 18.6,
    health: "monitor",
    owner: "L. Pérez",
  },
  {
    id: "op-orion",
    name: "Orion Financeira",
    client: "Banco Orion",
    priority: "P1",
    focus: "Cross-sell",
    score: 84,
    baseCoverage: 91,
    dataReconciliation: 95,
    monthlyConversion: 22.1,
    health: "healthy",
    owner: "P. Costa",
  },
  {
    id: "op-vertex",
    name: "Vertex Telecom",
    client: "Vertex Telco",
    priority: "P2",
    focus: "Retenção PME",
    score: 78,
    baseCoverage: 86,
    dataReconciliation: 90,
    monthlyConversion: 16.3,
    health: "healthy",
    owner: "A. Lima",
  },
  {
    id: "op-sigma",
    name: "Sigma Energia",
    client: "Sigma Holdings",
    priority: "P1",
    focus: "Upsell B2B",
    score: 63,
    baseCoverage: 70,
    dataReconciliation: 76,
    monthlyConversion: 14.8,
    health: "monitor",
    owner: "R. Mendes",
  },
  {
    id: "op-atlas",
    name: "Atlas Seguros",
    client: "Atlas Insurance",
    priority: "P2",
    focus: "Reativação",
    score: 88,
    baseCoverage: 94,
    dataReconciliation: 97,
    monthlyConversion: 25.4,
    health: "healthy",
    owner: "J. Tavares",
  },
  {
    id: "op-quanta",
    name: "Quanta Varejo",
    client: "Quanta Retail",
    priority: "P3",
    focus: "Onboarding",
    score: 67,
    baseCoverage: 73,
    dataReconciliation: 81,
    monthlyConversion: 11.7,
    health: "monitor",
    owner: "F. Duarte",
  },
];

const insights: ExecutiveInsight[] = [
  {
    id: "i1",
    severity: "critical",
    title: "ACME Industrial: score caiu 18 pts em 7 dias",
    detail:
      "Reconciliação de dados estagnada em 71%. Conversão mensal abaixo do piso contratual (9.2% vs 15% SLA).",
    operationId: "op-acme",
    timestamp: "há 12 min",
  },
  {
    id: "i2",
    severity: "risk",
    title: "Northwind: cobertura de base sem evolução há 14 dias",
    detail:
      "Pipeline de ativação travado em 64%. Necessário revisar regras de segmentação da operação.",
    operationId: "op-northwind",
    timestamp: "há 1h",
  },
  {
    id: "i3",
    severity: "monitor",
    title: "Helix Pharma: conversão acelerando (+4.1pp MoM)",
    detail: "Tendência positiva — candidata a expansão de meta no próximo ciclo.",
    operationId: "op-helix",
    timestamp: "há 3h",
  },
  {
    id: "i4",
    severity: "info",
    title: "Atlas Seguros lidera ranking consolidado",
    detail: "Score 88 com todas as métricas operacionais acima da banda saudável.",
    operationId: "op-atlas",
    timestamp: "há 6h",
  },
];

export function fetchOperations(): Operation[] {
  return [...operations].sort((a, b) => a.score - b.score);
}

export function fetchGlobalKpis(): GlobalKpis {
  const monitored = operations.length;
  const atRisk = operations.filter((o) => o.health === "risk").length;
  const critical = operations.filter((o) => o.health === "critical").length;
  const baseCoverage =
    operations.reduce((s, o) => s + o.baseCoverage, 0) / operations.length;
  const monthlyConversions = Math.round(
    operations.reduce((s, o) => s + o.monthlyConversion * 142, 0),
  );

  return {
    monitored,
    atRisk,
    critical,
    baseCoverage: Math.round(baseCoverage * 10) / 10,
    totalLeads: 184_320,
    monthlyConversions,
    conversionDelta: 8.4,
    leadsDelta: 12.1,
    coverageDelta: 3.7,
    riskDelta: -2,
  };
}

export function fetchStatusDistribution(): Record<OperationStatus, number> {
  return operations.reduce(
    (acc, o) => {
      acc[o.health] += 1;
      return acc;
    },
    { healthy: 0, monitor: 0, risk: 0, critical: 0 } as Record<OperationStatus, number>,
  );
}

export function fetchInsights(): ExecutiveInsight[] {
  return insights;
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
