import type { Api4ComTelemetryDashboard } from "./admin-api4com.shared";

export type BillingTone = "success" | "info" | "monitor" | "warning" | "risk";

export type BillingAccount = {
  client: string;
  operationId?: string;
  vertical: string;
  ticket: number;
  delivery: string;
  sdr: string;
  cycleMonths: number | null;
  contractSignal: string;
  loyaltySignal: string;
  reading: string;
  risk: BillingTone;
  api4comSnapshot?: string;
};

export interface BillingDashboardData {
  source: "snapshot" | "live";
  snapshotLabel: string;
  sourceLabel: string;
  accounts: BillingAccount[];
}

export const billingOperationIdByClient: Record<string, string> = {
  Iamit: "iamit",
  Nimbus: "nimbus",
  "Prime Action": "prime-action",
  Acelerato: "acelerato",
  "Lima Duarte Alimentos": "lima-duarte-alimentos",
  "Trial Ambiental": "trial-ambiental",
  We9: "we9",
  "Plan Idiomas": "plan-idiomas",
  Incentiva: "incentiva",
  DocSeg: "docseg",
  "Café Fazenda": "cafe-fazenda-brasil",
};

const billingSnapshot: BillingAccount[] = [
  {
    client: "Iamit",
    operationId: "iamit",
    vertical: "TI",
    ticket: 6500,
    delivery: "Outbound",
    sdr: "Ana Livia",
    cycleMonths: 14,
    contractSignal: "Aviso prévio",
    loyaltySignal: "Sem fidelidade ativa",
    reading: "Maior ticket da carteira atual; pede retenção e execução consistente.",
    risk: "monitor",
  },
  {
    client: "Nimbus",
    operationId: "nimbus",
    vertical: "Meteorologia",
    ticket: 5346.09,
    delivery: "Outbound",
    sdr: "Ester",
    cycleMonths: 31,
    contractSignal: "Aviso prévio",
    loyaltySignal: "Sem fidelidade ativa",
    reading: "Conta madura e relevante para caixa, mas com sinal contratual que merece atenção.",
    risk: "monitor",
  },
  {
    client: "Prime Action",
    operationId: "prime-action",
    vertical: "Consultoria",
    ticket: 5000,
    delivery: "Funil em Y",
    sdr: "Karen",
    cycleMonths: 31,
    contractSignal: "Aviso prévio",
    loyaltySignal: "Sem fidelidade ativa",
    reading: "Receita alta com operação já mais estruturada; vale blindar expansão e renovação.",
    risk: "monitor",
  },
  {
    client: "Acelerato",
    operationId: "acelerato",
    vertical: "Varejo",
    ticket: 4000,
    delivery: "Outbound",
    sdr: "Ana Livia",
    cycleMonths: 7,
    contractSignal: "Abr/26",
    loyaltySignal: "Fidelidade até jan/26",
    reading: "Conta pagante importante, ainda relativamente nova e com espaço para ganhar tração.",
    risk: "info",
  },
  {
    client: "Lima Duarte Alimentos",
    operationId: "lima-duarte-alimentos",
    vertical: "Varejo",
    ticket: 4000,
    delivery: "Outbound",
    sdr: "Ana Livia",
    cycleMonths: 4,
    contractSignal: "Aviso prévio",
    loyaltySignal: "Fidelidade até abr/26",
    reading: "Conta nova na carteira; receita já relevante, mas ainda em fase de consolidação.",
    risk: "info",
  },
  {
    client: "Trial Ambiental",
    operationId: "trial-ambiental",
    vertical: "Eng. Ambiental",
    ticket: 4000,
    delivery: "Outbound",
    sdr: "João",
    cycleMonths: 2,
    contractSignal: "Mar/27",
    loyaltySignal: "Fidelidade até set/26",
    reading: "Boa previsibilidade contratual no curto prazo; o foco aqui é provar valor rápido.",
    risk: "success",
  },
  {
    client: "We9",
    operationId: "we9",
    vertical: "Shopping Center",
    ticket: 4000,
    delivery: "Outbound",
    sdr: "João",
    cycleMonths: 1,
    contractSignal: "Sem data registrada",
    loyaltySignal: "Sem fidelidade registrada",
    reading: "Receita relevante, mas ainda muito jovem; governança e evolução precisam ficar próximas.",
    risk: "warning",
  },
  {
    client: "Plan Idiomas",
    operationId: "plan-idiomas",
    vertical: "Educação",
    ticket: 3000,
    delivery: "Outbound",
    sdr: "Ester",
    cycleMonths: 15,
    contractSignal: "Aviso prévio",
    loyaltySignal: "Sem fidelidade ativa",
    reading: "Ticket intermediário com boa maturidade operacional; vale proteger margem e estabilidade.",
    risk: "monitor",
  },
  {
    client: "InMeta",
    operationId: "inmeta",
    vertical: "A confirmar",
    ticket: 3000,
    delivery: "Outbound",
    sdr: "-",
    cycleMonths: null,
    contractSignal: "Cliente novo no recorte atual",
    loyaltySignal: "A confirmar",
    reading: "Conta nova adicionada à carteira real depois do snapshot local anterior; entra para corrigir a leitura de receita.",
    risk: "info",
  },
  {
    client: "DocSeg",
    operationId: "docseg",
    vertical: "Jurídico",
    ticket: 2500,
    delivery: "Outbound",
    sdr: "Ana Livia",
    cycleMonths: 9,
    contractSignal: "Aviso prévio",
    loyaltySignal: "Fidelidade até jan/26",
    reading: "Menor ticket pagante; leitura útil para churn, eficiência e potencial de expansão.",
    risk: "info",
  },
  {
    client: "Incentiva",
    operationId: "incentiva",
    vertical: "Inside Sales",
    ticket: 0,
    delivery: "Funil em Y",
    sdr: "Karen",
    cycleMonths: null,
    contractSignal: "Uso interno",
    loyaltySignal: "N/A",
    reading: "Conta interna/referência operacional; não entra no caixa da carteira.",
    risk: "success",
  },
  {
    client: "Café Fazenda",
    operationId: "cafe-fazenda-brasil",
    vertical: "Café",
    ticket: 0,
    delivery: "Outbound",
    sdr: "Ester",
    cycleMonths: 39,
    contractSignal: "Sem ticket registrado",
    loyaltySignal: "N/A",
    reading: "Conta ativa no snapshot, mas sem valor refletido na coluna D; precisa de saneamento comercial.",
    risk: "risk",
  },
];

function buildApi4ComSnapshotLabel(api4com: Api4ComTelemetryDashboard | undefined, operationId?: string) {
  if (!api4com || api4com.source !== "live" || !operationId) return "";
  const row = api4com.operationRows.find((item) => item.operationId === operationId);
  if (!row) return "";
  const base = `${row.callsTotal} lig. / ${row.connectionsTotal} conex. (${row.connectionRate.toFixed(1)}%)`;
  if (row.attributionMode === "dedicated") return `${base} · API4Com viva`;
  return `${base} · API4Com viva compartilhada`;
}

export function loadScopedBillingDashboard(params?: {
  operationIds?: string[] | "all";
  api4com?: Api4ComTelemetryDashboard;
}): BillingDashboardData {
  const operationIds = params?.operationIds ?? "all";
  const accounts =
    operationIds === "all"
      ? billingSnapshot
      : billingSnapshot.filter((account) => account.operationId && operationIds.includes(account.operationId));

  const enrichedAccounts = accounts.map((account) => ({
    ...account,
    api4comSnapshot: buildApi4ComSnapshotLabel(params?.api4com, account.operationId),
  }));

  return {
    source: params?.api4com?.source === "live" ? "live" : "snapshot",
    snapshotLabel: "Análise de Performance · coluna D (Ticket)",
    sourceLabel:
      params?.api4com?.source === "live"
        ? `Snapshot financeiro + API4Com viva (${params.api4com.currentWindowLabel})`
        : "Snapshot local da planilha",
    accounts: enrichedAccounts,
  };
}
