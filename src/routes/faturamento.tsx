import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BanknoteArrowUp,
  Building2,
  CalendarClock,
  CircleDollarSign,
  ReceiptText,
  ShieldAlert,
  Wallet,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import {
  formatPeriodLabel,
  useAdminFilters,
} from "@/components/admin/admin-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { fetchOperations } from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faturamento")({
  head: () => ({ meta: [{ title: "Faturamento — Console Incentiva" }] }),
  component: BillingPage,
});

type BillingTone = "success" | "info" | "monitor" | "warning" | "risk";

type BillingAccount = {
  client: string;
  vertical: string;
  ticket: number;
  delivery: string;
  sdr: string;
  cycleMonths: number | null;
  contractSignal: string;
  loyaltySignal: string;
  reading: string;
  risk: BillingTone;
};

const billingSnapshot = {
  snapshotLabel: "Análise de Performance · coluna D (Ticket)",
  sourceLabel: "Snapshot local da planilha",
  accounts: [
    {
      client: "Iamit",
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
  ] satisfies BillingAccount[],
};

const billingOperationIdByClient: Record<string, string> = {
  Iamit: "iamit",
  Nimbus: "nimbus",
  "Prime Action": "prime-action",
  Acelerato: "acelerato",
  "Lima Duarte Alimentos": "lima-duarte",
  "Trial Ambiental": "trial-ambiental",
  We9: "we9",
  "Plan Idiomas": "plan-idiomas",
  Incentiva: "incentiva",
  DocSeg: "docseg",
  "Café Fazenda": "cafe-fazenda-brasil",
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 2,
  }).format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function BillingPage() {
  const { selectedOperationId, selectedOperation, selectedPeriod } = useAdminFilters();
  const operationIds = new Set(fetchOperations().map((operation) => operation.id));
  const filteredAccounts =
    selectedOperationId === "all"
      ? billingSnapshot.accounts
      : billingSnapshot.accounts.filter(
          (account) =>
            billingOperationIdByClient[account.client] === selectedOperationId ||
            (!operationIds.has(selectedOperationId) && account.client === selectedOperation?.label),
        );
  const paidAccounts = filteredAccounts.filter((account) => account.ticket > 0);
  const zeroTicketAccounts = filteredAccounts.filter((account) => account.ticket === 0);
  const recurringRevenue = paidAccounts.reduce((sum, account) => sum + account.ticket, 0);
  const averageTicket = recurringRevenue / Math.max(paidAccounts.length, 1);
  const annualizedRevenue = recurringRevenue * 12;
  const topThreeShare =
    (paidAccounts
      .slice()
      .sort((a, b) => b.ticket - a.ticket)
      .slice(0, 3)
      .reduce((sum, account) => sum + account.ticket, 0) /
      Math.max(recurringRevenue, 1)) *
    100;

  const revenueBands = [
    {
      label: "R$ 5k+",
      count: paidAccounts.filter((account) => account.ticket >= 5000).length,
      detail: "Contas que mais puxam a receita da carteira hoje.",
    },
    {
      label: "R$ 4k a R$ 4,9k",
      count: paidAccounts.filter((account) => account.ticket >= 4000 && account.ticket < 5000).length,
      detail: "Miolo da carteira recorrente atual.",
    },
    {
      label: "Abaixo de R$ 4k",
      count: paidAccounts.filter((account) => account.ticket > 0 && account.ticket < 4000).length,
      detail: "Camada de menor ticket, útil para margem e expansão.",
    },
    {
      label: "Sem ticket",
      count: zeroTicketAccounts.length,
      detail: "Linhas que exigem tratamento comercial ou saneamento de cadastro.",
    },
  ];

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Faturamento"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Receita e previsibilidade
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {billingSnapshot.snapshotLabel}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {billingSnapshot.sourceLabel}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {formatPeriodLabel(selectedPeriod)}
              </Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Faturamento
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {selectedOperationId === "all"
                ? "Esta frente responde quanto a carteira paga hoje, quão concentrada essa receita está e quais contas pedem atenção de retenção, renovação ou saneamento comercial."
                : `Esta frente agora recorta só ${selectedOperation?.label ?? "a conta filtrada"} dentro do snapshot financeiro disponível.`}
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface">
            <ArrowRight className="h-3.5 w-3.5" />
            Próximo passo: Performance
          </Button>
        </section>

        <section className="surface-card p-5">
          <div>
            <h2 className="text-sm font-semibold text-display">Como ler esta frente</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Aqui a pergunta deixa de ser só operacional e passa a ser econômica: quais contas
              realmente sustentam a carteira e onde está o risco de receita? O filtro por operação já
              isola a conta; o período ainda é apenas referência visual nesta camada.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <GuideCard
              title="1. Receita base"
              detail="Primeiro entram MRR, ticket médio pagante e receita anualizada para dar a ordem de grandeza da carteira."
            />
            <GuideCard
              title="2. Concentração"
              detail="Depois a tela mostra quanto da receita está nas maiores contas e como a carteira está distribuída por faixa."
            />
            <GuideCard
              title="3. Retenção"
              detail="Por fim entram sinais de aviso prévio, fidelidade e linhas sem ticket para orientar ação comercial."
            />
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <BillingKpi
            label="MRR visível"
            value={formatCurrency(recurringRevenue)}
            detail="Soma dos tickets positivos do snapshot."
            icon={CircleDollarSign}
            tone="success"
          />
          <BillingKpi
            label="Contas pagantes"
            value={String(paidAccounts.length)}
            detail="Linhas com ticket acima de zero."
            icon={Wallet}
            tone="info"
          />
          <BillingKpi
            label="Ticket médio"
            value={formatCurrency(averageTicket)}
            detail="Média entre as contas pagantes."
            icon={ReceiptText}
            tone="monitor"
          />
          <BillingKpi
            label="ARR estimado"
            value={formatCurrency(annualizedRevenue)}
            detail="MRR anualizado, sem considerar expansão ou churn."
            icon={BanknoteArrowUp}
            tone="success"
          />
          <BillingKpi
            label="Top 3 da receita"
            value={`${formatPercent(topThreeShare)}%`}
            detail="Participação das três maiores contas no MRR."
            icon={Building2}
            tone="warning"
          />
          <BillingKpi
            label="Sem ticket"
            value={String(zeroTicketAccounts.length)}
            detail="Linhas que precisam saneamento ou classificação comercial."
            icon={AlertTriangle}
            tone="risk"
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Faixas de receita</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Distribuição simples para enxergar densidade e concentração da carteira.
                </p>
              </div>
              <Wallet className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {revenueBands.map((band) => (
                <RevenueBandCard key={band.label} band={band} />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Leitura executiva</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que já dá para concluir sobre a receita sem abrir ainda o detalhe financeiro completo.
                </p>
              </div>
              <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <InsightCard
                title="Base econômica atual"
                value={formatCurrency(recurringRevenue)}
                detail="A carteira já mostra uma base recorrente clara, mesmo ainda com linhas sem saneamento completo."
                tone="success"
              />
              <InsightCard
                title="Concentração"
                value={`${formatPercent(topThreeShare)}%`}
                detail="As três maiores contas carregam uma fatia relevante da receita; retenção aqui vale mais."
                tone="warning"
              />
              <InsightCard
                title="Risco contratual"
                value="Aviso prévio"
                detail="Boa parte das contas maduras está marcada com aviso prévio, então churn não pode ser lido só por performance."
                tone="monitor"
              />
              <InsightCard
                title="Higiene comercial"
                value={`${zeroTicketAccounts.length} linhas`}
                detail="Conta sem ticket ou com cadastro incompleto bagunça leitura financeira e precisa de saneamento."
                tone="risk"
              />
            </div>
          </div>
        </section>

        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-display">Carteira por conta</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Ticket, maturidade e leitura executiva por cliente, a partir do snapshot indicado.
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px] text-mono h-5">
              {filteredAccounts.length} linha{filteredAccounts.length === 1 ? "" : "s"} principais
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border bg-muted/20">
                  <th className="text-left font-medium px-4 py-2.5">Conta</th>
                  <th className="text-left font-medium px-3 py-2.5">Entrega</th>
                  <th className="text-right font-medium px-3 py-2.5">Ticket</th>
                  <th className="text-left font-medium px-3 py-2.5">SDR</th>
                  <th className="text-right font-medium px-3 py-2.5">Ciclo</th>
                  <th className="text-left font-medium px-3 py-2.5">Contrato</th>
                  <th className="text-left font-medium px-3 py-2.5">Fidelidade</th>
                  <th className="text-left font-medium px-4 py-2.5">Leitura</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account) => (
                  <BillingRow key={account.client} account={account} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

function BillingKpi({
  label,
  value,
  detail,
  icon: Icon,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: BillingTone;
}) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
        <div className={cn("rounded-lg p-2", toneIconClass[tone])}>
          <Icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-4 text-[24px] leading-none font-semibold tracking-tight text-display">{value}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function RevenueBandCard({
  band,
}: {
  band: { label: string; count: number; detail: string };
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{band.label}</div>
        <Badge variant="secondary" className="text-[10px] text-mono h-5">
          {band.count} contas
        </Badge>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{band.detail}</p>
    </div>
  );
}

function InsightCard({
  title,
  value,
  detail,
  tone,
}: {
  title: string;
  value: string;
  detail: string;
  tone: BillingTone;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{title}</div>
          <div className="mt-2 text-lg font-semibold text-display">{value}</div>
        </div>
        <div className={cn("h-2.5 w-2.5 rounded-full", toneDotClass[tone])} />
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function BillingRow({ account }: { account: BillingAccount }) {
  return (
    <tr className="border-b border-border/70 last:border-0 align-top">
      <td className="px-4 py-3.5">
        <div className="font-medium">{account.client}</div>
        <div className="text-[11px] text-muted-foreground mt-0.5">{account.vertical}</div>
      </td>
      <td className="px-3 py-3.5 text-muted-foreground">{account.delivery}</td>
      <td className="px-3 py-3.5 text-right font-medium text-display">
        {formatCurrency(account.ticket)}
      </td>
      <td className="px-3 py-3.5 text-muted-foreground">{account.sdr}</td>
      <td className="px-3 py-3.5 text-right text-muted-foreground">
        {account.cycleMonths ? `${account.cycleMonths}m` : "-"}
      </td>
      <td className="px-3 py-3.5">
        <div className="inline-flex items-center gap-1.5 text-[12px] text-muted-foreground">
          <CalendarClock className="h-3.5 w-3.5 text-primary" />
          {account.contractSignal}
        </div>
      </td>
      <td className="px-3 py-3.5 text-muted-foreground">{account.loyaltySignal}</td>
      <td className="px-4 py-3.5">
        <div className="flex items-start gap-2">
          <div className={cn("mt-1 h-2.5 w-2.5 rounded-full shrink-0", toneDotClass[account.risk])} />
          <span className="text-[12px] leading-relaxed text-muted-foreground">{account.reading}</span>
        </div>
      </td>
    </tr>
  );
}

function GuideCard({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-sm font-medium">{title}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

const toneIconClass: Record<BillingTone, string> = {
  success: "bg-emerald-500/12 text-emerald-700",
  info: "bg-sky-500/12 text-sky-700",
  monitor: "bg-blue-500/12 text-blue-700",
  warning: "bg-amber-500/12 text-amber-700",
  risk: "bg-rose-500/12 text-rose-700",
};

const toneDotClass: Record<BillingTone, string> = {
  success: "bg-emerald-500",
  info: "bg-sky-500",
  monitor: "bg-blue-500",
  warning: "bg-amber-500",
  risk: "bg-rose-500",
};
