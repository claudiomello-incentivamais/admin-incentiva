import { createFileRoute } from "@tanstack/react-router";
import {
  ArrowRight,
  BriefcaseBusiness,
  Building2,
  ChevronRight,
  GlobeLock,
  ShieldAlert,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  loadGlobalDashboard,
  priorityMeta,
  statusMeta,
  type OperationStatus,
  type Priority,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/clientes")({
  head: () => ({ meta: [{ title: "Clientes — Console Incentiva" }] }),
  loader: async () => loadGlobalDashboard(),
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

function ClientsPage() {
  const dashboard = Route.useLoaderData();
  const { operations } = dashboard;

  const priorityCounts = countByPriority(operations.map((operation) => operation.priority));
  const healthCounts = countByHealth(operations.map((operation) => operation.health));
  const totalAccounts = operations.length;
  const avgCoverage =
    operations.reduce((sum, operation) => sum + operation.baseCoverage, 0) /
    Math.max(operations.length, 1);
  const avgConversion =
    operations.reduce((sum, operation) => sum + operation.monthlyConversion, 0) /
    Math.max(operations.length, 1);
  const portalReady = operations.filter((operation) => operation.health === "healthy").length;
  const portalNeedsGovernance = operations.filter((operation) => operation.health === "monitor").length;
  const portalNotReady = operations.filter((operation) => operation.health === "risk" || operation.health === "critical").length;

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Clientes"]} />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Leitura de carteira
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {dashboard.snapshotLabel}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {dashboard.source === "live" ? "Supabase live" : "Snapshot fallback"}
              </Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Clientes
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Esta frente organiza a carteira por conta, prioridade e risco, para ficar claro quais
              operações pedem atenção executiva e quais já estão mais estáveis.
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface">
            <ArrowRight className="h-3.5 w-3.5" />
            Próximo passo: Faturamento
          </Button>
        </section>

        <section className="surface-card p-5">
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
              detail="Primeiro você vê o tamanho da carteira, a média de cobertura e a média de conversão atual."
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
            detail="Operações já visíveis na leitura consolidada."
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
            value={formatNumber(dashboard.kpis.totalLeads)}
            detail="Base total somada da carteira."
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
              {operations.map((operation) => (
                <PortalOperationCard key={operation.id} operation={operation} />
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
                {operations.map((operation) => (
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
  operation: (Awaited<ReturnType<typeof loadGlobalDashboard>>)["operations"][number];
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
