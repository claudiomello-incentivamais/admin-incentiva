import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  Database,
  GlobeLock,
  MessageCircle,
  PhoneCall,
  ServerCog,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import {
  formatPeriodLabel,
  useAdminFilters,
} from "@/components/admin/admin-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  buildOperationCadenceView,
  buildOperationCockpitFromOperation,
  buildOperationRuntimeView,
  priorityMeta,
  statusMeta,
  type Operation,
  type OperationStatus,
  type Priority,
} from "@/lib/admin-data";
import { loadScopedGlobalDashboardServerFn } from "@/lib/admin-global-rpc";
import { applyPeriodToOperation, buildScopedKpis } from "@/lib/admin-period";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Console Incentiva" }] }),
  loader: async () => loadScopedGlobalDashboardServerFn(),
  component: ClientsPage,
});

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatPercent(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value);
}

function parseFirstNumber(value: string) {
  const normalized = value.replace(/\./g, "");
  const match = normalized.match(/-?\d+(?:,\d+)?/);
  return match ? Number(match[0].replace(",", ".")) : 0;
}

function ClientsPage() {
  const dashboard = Route.useLoaderData();
  const { operations } = dashboard;
  const { selectedOperationId, selectedOperation, selectedPeriod } = useAdminFilters();
  const scopedOperations = operations.map((operation) =>
    applyPeriodToOperation(operation, selectedPeriod),
  );
  const filteredOperations =
    selectedOperationId === "all"
      ? scopedOperations
      : scopedOperations.filter((operation) => operation.id === selectedOperationId);
  const effectiveKpis = buildScopedKpis(dashboard.kpis, filteredOperations, scopedOperations, selectedPeriod);
  const isSingleOperationView = selectedOperationId !== "all";

  const priorityCounts = countByPriority(filteredOperations.map((operation) => operation.priority));
  const healthCounts = countByHealth(filteredOperations.map((operation) => operation.health));
  const totalAccounts = filteredOperations.length;
  const avgCoverage =
    filteredOperations.reduce((sum, operation) => sum + operation.baseCoverage, 0) /
    Math.max(filteredOperations.length, 1);
  const avgConversion =
    filteredOperations.reduce((sum, operation) => sum + operation.monthlyConversion, 0) /
    Math.max(filteredOperations.length, 1);
  const portalReady = filteredOperations.filter((operation) => operation.health === "healthy").length;
  const portalNeedsGovernance = filteredOperations.filter((operation) => operation.health === "monitor").length;
  const portalNotReady = filteredOperations.filter((operation) => operation.health === "risk" || operation.health === "critical").length;
  const operationViews = filteredOperations.map((operation) => {
    const cockpit = buildOperationCockpitFromOperation(operation);
    const cadence = buildOperationCadenceView(operation, cockpit, dashboard.source);
    const runtime = buildOperationRuntimeView(operation, cockpit, dashboard.source);
    return {
      operation,
      cadence,
      runtime,
      primaryCard:
        runtime.cards.find((card) => card.health === "critical" || card.health === "risk") ??
        runtime.cards.find((card) => card.health === "monitor") ??
        runtime.cards[0],
      riskCount: runtime.cards.filter((card) => card.health === "critical" || card.health === "risk").length,
      liveCount: runtime.cards.filter((card) => card.modeLabel === "Live").length,
    };
  });
  const totalUnstarted = operationViews.reduce((sum, view) => {
    const metric = view.cadence.metrics.find((item) => item.id === "canonical-unstarted");
    return sum + parseFirstNumber(metric?.value ?? "0");
  }, 0);
  const totalActiveNow = operationViews.reduce((sum, view) => {
    const metric = view.cadence.metrics.find((item) => item.id === "active-now");
    return sum + parseFirstNumber(metric?.value ?? "0");
  }, 0);
  const coveragePressureCount = operationViews.filter((view) => {
    const metric = view.cadence.metrics.find((item) => item.id === "coverage-days");
    return metric?.tone === "critical" || metric?.tone === "risk";
  }).length;
  const avgLiveCards =
    operationViews.reduce((sum, view) => sum + view.liveCount, 0) /
    Math.max(operationViews.length, 1);

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Clientes"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Leitura de carteira
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                Drilldown interno
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {dashboard.snapshotLabel}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {dashboard.source === "live" ? "Supabase live" : "Snapshot fallback"}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {formatPeriodLabel(selectedPeriod)}
              </Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Clientes
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {isSingleOperationView
                ? `Esta frente agora mostra só ${selectedOperation?.label ?? "a operação filtrada"}, sem misturar outras contas na carteira.`
                : "Esta frente organiza a carteira por conta, prioridade e risco, para ficar claro quais operações pedem atenção executiva e quais já estão mais estáveis."}{" "}
              Ela permanece como drilldown interno enquanto a visão principal da conta é puxada
              para o Portal.
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
            <Link to="/portal">
              <ArrowRight className="h-3.5 w-3.5" />
              Abrir portal da conta
            </Link>
          </Button>
        </section>

        <section className="surface-card p-5">
          <div className="mb-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-primary">
                Fonte ativa
              </div>
              <div className="mt-1 text-sm font-medium text-display">
                {dashboard.source === "live" ? "Supabase live" : "Snapshot fallback"}
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Esta carteira já deixa claro quando a leitura vem de fonte viva e quando ainda está
                apoiada em fallback local.
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Leitura desta camada
              </div>
              <div className="mt-1 text-sm font-medium text-display">Prioridade + saúde + prontidão</div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {isSingleOperationView
                  ? "Esta frente serve para enxergar a prontidão e a exposição segura da operação filtrada."
                  : "Esta frente serve para decidir quais contas precisam de atenção primeiro e quais já estão mais próximas de virar portal apresentável."}
              </p>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold text-display">Como ler esta frente</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Aqui o console deixa de olhar só canal e workflow e passa a responder: quais contas
              estão pressionando mais a carteira?
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <GuideCard
              title="1. Carteira"
              detail={
                isSingleOperationView
                  ? "Primeiro você vê o recorte da operação filtrada dentro do período ativo."
                  : "Primeiro você vê o tamanho da carteira, a média de cobertura e a média de conversão atual."
              }
            />
            <GuideCard
              title="2. Clusters"
              detail="Depois a carteira é quebrada por prioridade e por saúde operacional para deixar a fila executiva mais visível."
            />
            <GuideCard
              title="3. Conta"
              detail="No fim da página entram as operações individuais com cliente, foco principal, score e sinais de risco."
            />
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <ClientKpi
            label="Contas ativas"
            value={String(totalAccounts)}
            detail={isSingleOperationView ? "Recorte da operação filtrada." : "Operações já visíveis na leitura consolidada."}
            icon={Building2}
            tone="info"
          />
          <ClientKpi
            label="Clientes em risco"
            value={String(healthCounts.risk + healthCounts.critical)}
            detail="Contas que mais pedem fila executiva agora."
            icon={ShieldAlert}
            tone="risk"
          />
          <ClientKpi
            label="Clientes estáveis"
            value={String(healthCounts.healthy)}
            detail="Operações já com leitura mais saudável."
            icon={BriefcaseBusiness}
            tone="success"
          />
          <ClientKpi
            label="Cobertura média"
            value={`${formatPercent(avgCoverage)}%`}
            detail="Média de base ponderada da carteira."
            icon={Target}
            tone="monitor"
          />
          <ClientKpi
            label="Conv. média"
            value={`${formatPercent(avgConversion)}%`}
            detail="Conversão mensal média entre as contas."
            icon={TrendingUp}
            tone="success"
          />
          <ClientKpi
            label="Leads totais"
            value={formatNumber(effectiveKpis.totalLeads)}
            detail={isSingleOperationView ? "Base da operação no recorte." : "Base total somada da carteira."}
            icon={Users}
            tone="info"
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Carteira por prioridade</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Quais grupos da carteira exigem mais energia de execução agora.
                </p>
              </div>
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              <PriorityBucket
                label="P0"
                count={priorityCounts.P0}
                detail="Frente mais urgente da carteira; normalmente base, cadência ou risco direto de execução."
              />
              <PriorityBucket
                label="P1"
                count={priorityCounts.P1}
                detail="Conta que já pede ação relevante, mas não necessariamente bloqueia a operação agora."
              />
              <PriorityBucket
                label="P2"
                count={priorityCounts.P2}
                detail="Camada de monitoramento e ajustes de qualidade, sem pressão executiva máxima."
              />
              <PriorityBucket
                label="P3"
                count={priorityCounts.P3}
                detail="Conta mais estável ou com menor urgência relativa no retrato atual."
              />
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Carteira por saúde</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Como a pressão da carteira está distribuída entre healthy, monitor, risk e critical.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Ver Admin Global <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <HealthBucket label="Healthy" status="healthy" count={healthCounts.healthy} />
              <HealthBucket label="Monitor" status="monitor" count={healthCounts.monitor} />
              <HealthBucket label="Risk" status="risk" count={healthCounts.risk} />
              <HealthBucket label="Critical" status="critical" count={healthCounts.critical} />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Prontidão para portal</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Corte inicial do Bloco 4 para separar o que pode virar visão cliente e o que ainda precisa maturar.
                </p>
              </div>
              <GlobeLock className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <PortalReadinessCard
                title="Prontas"
                count={portalReady}
                tone="healthy"
                detail="Operações mais próximas de uma leitura externa controlada."
              />
              <PortalReadinessCard
                title="Pedem governança"
                count={portalNeedsGovernance}
                tone="monitor"
                detail="Já têm base boa, mas ainda exigem curadoria antes de abrir para cliente."
              />
              <PortalReadinessCard
                title="Ainda não prontas"
                count={portalNotReady}
                tone="risk"
                detail="Continuam em foco interno porque a camada operacional ainda está pressionada."
              />
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Modelo de exposição por conta</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  A visão cliente não deve espelhar o admin inteiro; deve abrir só o recorte útil da própria operação.
                </p>
              </div>
              <Users className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {filteredOperations.map((operation) => (
                <PortalOperationCard key={operation.id} operation={operation} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Cadência consolidada da carteira</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  A carteira agora mostra pressão comercial agregada, e não só score e saúde isolados por conta.
                </p>
              </div>
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <PortfolioStateCard
                label="Não iniciados somados"
                value={formatNumber(totalUnstarted)}
                detail="Base disponível para alimentar a cadência sem depender de reativação."
                tone="info"
              />
              <PortfolioStateCard
                label="Ativos no recorte"
                value={formatNumber(totalActiveNow)}
                detail="Volume que efetivamente se moveu entre as contas no período filtrado."
                tone="success"
              />
              <PortfolioStateCard
                label="Contas com pressão de cobertura"
                value={String(coveragePressureCount)}
                detail="Operações cuja sustentação da cadência já está curta para o ritmo atual."
                tone="risk"
              />
              <PortfolioStateCard
                label="Fontes live por conta"
                value={avgLiveCards.toFixed(1)}
                detail="Média de camadas já em leitura viva por operação neste retrato."
                tone="monitor"
              />
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                Leitura executiva
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                Esta camada passa a responder duas perguntas ao mesmo tempo: quanta base ainda
                sustenta a carteira e quantas operações já têm runtime suficiente para subir como
                visão mais viva, sem depender só de snapshot.
              </p>
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Runtime por conta</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Cada conta agora explicita qual camada está mais pressionada: Supabase, Notion, n8n, Evolution ou API4Com.
                </p>
              </div>
              <ServerCog className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {operationViews.map((view) => (
                <ClientRuntimeCard key={view.operation.id} view={view} />
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-display">Operações / contas em carteira</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Leitura direta por conta, juntando cliente, foco principal, score e pressão operacional.
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px] text-mono h-5">
              {totalAccounts} contas
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border bg-muted/20">
                  <th className="text-left font-medium px-4 py-2.5">Conta</th>
                  <th className="text-left font-medium px-3 py-2.5">Cliente</th>
                  <th className="text-left font-medium px-3 py-2.5">Foco principal</th>
                  <th className="text-left font-medium px-3 py-2.5">Prio.</th>
                  <th className="text-right font-medium px-3 py-2.5">Score</th>
                  <th className="text-right font-medium px-3 py-2.5">Cobertura</th>
                  <th className="text-right font-medium px-3 py-2.5">Conv. mensal</th>
                  <th className="text-left font-medium px-4 py-2.5">Saúde</th>
                </tr>
              </thead>
              <tbody>
                {filteredOperations.map((operation) => (
                  <OperationRow key={operation.id} operation={operation} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

function portalExposureRule(health: OperationStatus) {
  if (health === "healthy") {
    return {
      label: "Portal quase pronto",
      detail: "Pode evoluir para leitura cliente controlada assim que publish privado e perfis forem fechados.",
    };
  }

  if (health === "monitor") {
    return {
      label: "Portal com curadoria",
      detail: "Já pode herdar alguns módulos, mas ainda precisa esconder ruído operacional interno.",
    };
  }

  return {
    label: "Só uso interno",
    detail: "Ainda não deveria abrir visão externa porque a operação segue pressionada ou em ajuste.",
  };
}

function countByPriority(items: Priority[]) {
  return items.reduce(
    (acc, item) => {
      acc[item] += 1;
      return acc;
    },
    { P0: 0, P1: 0, P2: 0, P3: 0 } as Record<Priority, number>,
  );
}

function countByHealth(items: OperationStatus[]) {
  return items.reduce(
    (acc, item) => {
      acc[item] += 1;
      return acc;
    },
    { healthy: 0, monitor: 0, risk: 0, critical: 0 } as Record<OperationStatus, number>,
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

function ClientKpi({
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
  tone: "risk" | "success" | "monitor" | "info";
}) {
  const toneMap = {
    risk: "border-[color:var(--color-warning)]/20 bg-[color:var(--color-warning)]/5",
    success: "border-[color:var(--color-success)]/20 bg-[color:var(--color-success)]/5",
    monitor: "border-[color:var(--color-info)]/20 bg-[color:var(--color-info)]/5",
    info: "border-primary/20 bg-primary/5",
  } as const;

  return (
    <div className={cn("surface-card p-4 flex flex-col gap-3", toneMap[tone])}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </span>
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <div className="text-[28px] leading-none font-semibold text-display tracking-tight">{value}</div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function PriorityBucket({
  label,
  count,
  detail,
}: {
  label: Priority;
  count: number;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <Badge variant="outline" className={cn("text-[10px] font-semibold text-mono tracking-wider h-5 px-1.5", priorityMeta[label])}>
          {label}
        </Badge>
        <span className="text-[22px] leading-none font-semibold text-display">{count}</span>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function HealthBucket({
  label,
  status,
  count,
}: {
  label: string;
  status: OperationStatus;
  count: number;
}) {
  const meta = statusMeta[status];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{label}</div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {count}
        </Badge>
      </div>
      <div className="mt-3 h-2 rounded-full bg-muted overflow-hidden">
        <div className={cn("h-full rounded-full", meta.bg)} style={{ width: `${Math.max(count * 12, count ? 20 : 6)}%` }} />
      </div>
    </div>
  );
}

function PortalReadinessCard({
  title,
  count,
  tone,
  detail,
}: {
  title: string;
  count: number;
  tone: OperationStatus;
  detail: string;
}) {
  const meta = statusMeta[tone];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{title}</div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <div className="mt-4 text-[24px] leading-none font-semibold tracking-tight text-display">{count}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function PortalOperationCard({
  operation,
}: {
  operation: (Awaited<ReturnType<typeof loadScopedGlobalDashboardServerFn>>)["operations"][number];
}) {
  const meta = statusMeta[operation.health];
  const exposure = portalExposureRule(operation.health);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{operation.name}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{operation.client}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <div className="mt-3 text-[12px] font-medium">{exposure.label}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{exposure.detail}</p>
    </div>
  );
}

function PortfolioStateCard({
  label,
  value,
  detail,
  tone,
}: {
  label: string;
  value: string;
  detail: string;
  tone: "risk" | "success" | "monitor" | "info";
}) {
  const toneMap = {
    risk: "border-[color:var(--color-warning)]/20 bg-[color:var(--color-warning)]/5",
    success: "border-[color:var(--color-success)]/20 bg-[color:var(--color-success)]/5",
    monitor: "border-[color:var(--color-info)]/20 bg-[color:var(--color-info)]/5",
    info: "border-primary/20 bg-primary/5",
  } as const;

  return (
    <div className={cn("rounded-xl border p-4", toneMap[tone])}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-2 text-[24px] leading-none font-semibold tracking-tight text-display">{value}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function ClientRuntimeCard({
  view,
}: {
  view: {
    operation: Operation;
    cadence: ReturnType<typeof buildOperationCadenceView>;
    runtime: ReturnType<typeof buildOperationRuntimeView>;
    primaryCard: ReturnType<typeof buildOperationRuntimeView>["cards"][number];
    riskCount: number;
    liveCount: number;
  };
}) {
  const meta = statusMeta[view.primaryCard.health];
  const stageTwo = view.cadence.stages[1];
  const Icon = runtimeCardIconMap[view.primaryCard.id];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-sm font-medium text-display">{view.operation.name}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">{view.operation.client}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-3 grid gap-3 sm:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-xl border border-border bg-card px-3 py-3">
          <div className="flex items-center gap-2 text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            <Icon className="h-3.5 w-3.5 text-primary" />
            Camada em foco
          </div>
          <div className="mt-2 text-sm font-medium text-foreground">{view.primaryCard.title}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">{view.primaryCard.modeLabel}</div>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{view.primaryCard.headline}</p>
        </div>

        <div className="rounded-xl border border-border bg-card px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            Pulso comercial
          </div>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            <MiniRuntimeStat label="Etapa 2" value={stageTwo?.conversionLabel ?? "Sem leitura"} />
            <MiniRuntimeStat label="Ativos" value={view.cadence.windows[1]?.activeLabel ?? "Sem leitura"} />
            <MiniRuntimeStat label="Risco técnico" value={`${view.riskCount} camadas`} />
            <MiniRuntimeStat label="Camadas live" value={`${view.liveCount}/5`} />
          </div>
        </div>
      </div>
    </div>
  );
}

function MiniRuntimeStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/70 bg-surface px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[12px] font-medium text-foreground">{value}</div>
    </div>
  );
}

function OperationRow({
  operation,
}: {
  operation: {
    id: string;
    name: string;
    client: string;
    priority: Priority;
    focus: string;
    score: number;
    baseCoverage: number;
    monthlyConversion: number;
    health: OperationStatus;
  };
}) {
  const meta = statusMeta[operation.health];

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-[13px]">{operation.name}</div>
      </td>
      <td className="px-3 py-3 text-[12px] text-muted-foreground">{operation.client}</td>
      <td className="px-3 py-3">
        <span className="text-[12px]">{operation.focus}</span>
      </td>
      <td className="px-3 py-3">
        <Badge variant="outline" className={cn("text-[10px] font-semibold text-mono tracking-wider h-5 px-1.5", priorityMeta[operation.priority])}>
          {operation.priority}
        </Badge>
      </td>
      <td className="px-3 py-3 text-right tabular-nums">{operation.score}</td>
      <td className="px-3 py-3 text-right tabular-nums">{formatPercent(operation.baseCoverage)}%</td>
      <td className="px-3 py-3 text-right tabular-nums">{formatPercent(operation.monthlyConversion)}%</td>
      <td className="px-4 py-3">
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </td>
    </tr>
  );
}

const runtimeCardIconMap = {
  supabase: Database,
  notion: BriefcaseBusiness,
  n8n: Workflow,
  evolution: MessageCircle,
  api4com: PhoneCall,
} as const;
