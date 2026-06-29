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
