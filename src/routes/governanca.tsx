import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Database,
  Layers3,
  ShieldAlert,
  Siren,
  Users,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { statusMeta, type OperationStatus } from "@/lib/admin-data";

export const Route = createFileRoute("/governanca")({
  head: () => ({ meta: [{ title: "Governança — Console Incentiva" }] }),
  component: GovernancePage,
});

const governance = {
  snapshotLabel: "30 jun 2026 · 11:12 BRT",
  health: "monitor" as OperationStatus,
  metrics: [
    {
      label: "Saúde geral",
      value: "Monitor",
      detail: "A camada técnica está estável, mas ainda há pendências de observabilidade e leitura por frente.",
      tone: "monitor" as const,
      icon: ShieldAlert,
    },
    {
      label: "Alertas P0",
      value: "2",
      detail: "Hoje o foco principal ficou em Agente Conversa, com residual de retry histórico em duas operações.",
      tone: "critical" as const,
      icon: AlertOctagon,
    },
    {
      label: "Webhook produtivo",
      value: "OK",
      detail: "Trial e We9 já voltaram a sucesso no caminho real de produção.",
      tone: "success" as const,
      icon: CheckCircle2,
    },
    {
      label: "Fila de ownership",
      value: "3",
      detail: "Base, observabilidade de e-mail e publicação visual seguem como próximos donos claros.",
      tone: "info" as const,
      icon: Users,
    },
    {
      label: "Checkpoints críticos",
      value: "4",
      detail: "Dados, n8n, ownership e publish são os quatro checkpoints que mais importam agora.",
      tone: "monitor" as const,
      icon: Layers3,
    },
    {
      label: "Pronto para escala",
      value: "Parcial",
      detail: "A estrutura existe; a prioridade agora é clareza visual e observabilidade fina por workflow.",
      tone: "warning" as const,
      icon: Workflow,
    },
  ],
  scopes: [
    {
      title: "Qualidade de dado",
      detail: "Ver se Supabase, Notion e estágio canônico estão coerentes o suficiente para a operação ser legível.",
      icon: Database,
    },
    {
      title: "Saúde do n8n",
      detail: "Separar quebra técnica real de ruído, waiting e retry herdado, sem misturar isso com problema comercial.",
      icon: Activity,
    },
    {
      title: "Ownership e SLA",
      detail: "Deixar claro quem atua em base, quem atua em workflow e quem fecha o ponto de governança.",
      icon: Users,
    },
    {
      title: "Checkpoints de rollout",
      detail: "Garantir que publish, env, MCP, webhook e workflow estejam coerentes antes de chamar algo de pronto.",
      icon: Siren,
    },
  ],
  issues: [
    {
      id: "trial-retry",
      health: "monitor" as OperationStatus,
      lane: "Trial Ambiental",
      title: "Webhook produtivo já normalizado; retry histórico ainda falha.",
      detail:
        "O caminho real do workflow já voltou a sucesso. O resíduo atual está nas execuções de retry antigas do Postgres Chat Memory, não na produção ao vivo.",
      action: "Tratar retry como dívida técnica de observabilidade, sem recolocar a operação em incidente produtivo.",
    },
    {
      id: "we9-retry",
      health: "monitor" as OperationStatus,
      lane: "We9",
      title: "Mesmo padrão da Trial: produção voltou, retry herdado segue quebrando.",
      detail:
        "As últimas execuções por webhook já passaram. O erro remanescente aparece em retry histórico com conflito de input no memory node.",
      action: "Fechar como normalizado em produção e abrir correção específica se quisermos suportar retry legado.",
    },
    {
      id: "email-observability",
      health: "risk" as OperationStatus,
      lane: "E-mail",
      title: "Observabilidade ainda está rasa por workflow.",
      detail:
        "O cockpit já mostra waiting e throughput, mas a governança ainda não abre bem o gargalo workflow a workflow dentro da família de e-mail.",
      action: "Próxima camada útil é quebrar e-mail por família e workflow com status, fila e throughput granular.",
    },
    {
      id: "publish-sync",
      health: "critical" as OperationStatus,
      lane: "Publish",
      title: "Deploy ainda depende de publish autenticado fora do código.",
      detail:
        "O branch sobe e build passa, mas a URL publicada não reflete automaticamente sem publish autenticado do lado do Lovable/Cloudflare.",
      action: "Formalizar o publish como checkpoint operacional explícito dessa frente.",
    },
  ],
  checkpoints: [
    {
      title: "Código e build",
      status: "healthy" as OperationStatus,
      detail: "O corte atual já sobe em `main` com build validado.",
    },
    {
      title: "Deploy e URL pública",
      status: "critical" as OperationStatus,
      detail: "Ainda depende de publish autenticado para a URL materializar o corte novo.",
    },
    {
      title: "Workflows produtivos",
      status: "healthy" as OperationStatus,
      detail: "Trial e We9 já voltaram a sucesso no webhook real.",
    },
    {
      title: "Retry legado",
      status: "monitor" as OperationStatus,
      detail: "Permanece como dívida técnica separada do caminho produtivo.",
    },
  ],
  connections: [
    {
      title: "Admin Global",
      detail: "Mostra onde a carteira inteira está mais pressionada.",
    },
    {
      title: "Operações",
      detail: "Transforma essa governança em leitura profunda da Incentiva.",
    },
    {
      title: "Pipelines",
      detail: "Desce do problema de governança para o workflow que precisa de intervenção.",
    },
    {
      title: "Clientes",
      detail: "Fecha a leitura por conta, prioridade e risco operacional de cada operação.",
    },
  ],
};

function GovernancePage() {
  const healthMeta = statusMeta[governance.health];

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Governança"]} />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Governança operacional
              </Badge>
              <Badge
                variant="outline"
                className={cn("text-[10px] uppercase tracking-[0.18em] h-5", healthMeta.color)}
              >
                {healthMeta.label}
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {governance.snapshotLabel}
              </span>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Governança
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Aqui o console separa leitura comercial de integridade operacional: dado, n8n,
              ownership, rollout e checkpoint de execução.
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface">
            <ArrowRight className="h-3.5 w-3.5" />
            Próximo passo: Pipelines
          </Button>
        </section>

        <section className="surface-card p-5">
          <div>
            <h2 className="text-sm font-semibold text-display">O que esta frente cobre</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Esta é a camada que responde se o sistema está confiável o bastante para a leitura de
              negócio fazer sentido.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {governance.scopes.map((scope) => (
              <div key={scope.title} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <scope.icon className="h-4 w-4 text-primary" />
                  {scope.title}
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{scope.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {governance.metrics.map((metric) => (
            <GovernanceMetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Fila de governança</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde a governança ainda precisa intervir com dono e próximo passo claros.
                </p>
              </div>
              <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {governance.issues.map((issue) => (
                <GovernanceIssueCard key={issue.id} issue={issue} />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Checkpoints obrigatórios</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que precisa estar verde para uma frente ser considerada realmente pronta.
                </p>
              </div>
              <Layers3 className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {governance.checkpoints.map((checkpoint) => (
                <CheckpointCard key={checkpoint.title} checkpoint={checkpoint} />
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div>
            <h2 className="text-sm font-semibold text-display">Como esta frente conversa com o resto do console</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Isso ajuda a entender o menu inteiro sem parecer que cada página está solta.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {governance.connections.map((connection) => (
              <div key={connection.title} className="rounded-xl border border-border bg-surface p-4">
                <div className="text-sm font-medium">{connection.title}</div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {connection.detail}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function GovernanceMetricCard({
  metric,
}: {
  metric: {
    label: string;
    value: string;
    detail: string;
    tone: "critical" | "monitor" | "success" | "info" | "warning";
    icon: React.ComponentType<{ className?: string }>;
  };
}) {
  const toneMap = {
    critical: "border-destructive/20 bg-destructive/5",
    monitor: "border-[color:var(--color-info)]/20 bg-[color:var(--color-info)]/5",
    success: "border-[color:var(--color-success)]/20 bg-[color:var(--color-success)]/5",
    info: "border-primary/20 bg-primary/5",
    warning: "border-[color:var(--color-warning)]/20 bg-[color:var(--color-warning)]/5",
  } as const;

  return (
    <div className={cn("surface-card p-4 flex flex-col gap-3", toneMap[metric.tone])}>
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          {metric.label}
        </span>
        <metric.icon className="h-4 w-4 text-primary" />
      </div>
      <div className="text-[28px] leading-none font-semibold text-display tracking-tight">
        {metric.value}
      </div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">{metric.detail}</p>
    </div>
  );
}

function GovernanceIssueCard({
  issue,
}: {
  issue: {
    lane: string;
    title: string;
    detail: string;
    action: string;
    health: OperationStatus;
  };
}) {
  const meta = statusMeta[issue.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {issue.lane}
          </div>
          <h3 className="mt-1 text-sm font-medium">{issue.title}</h3>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{issue.detail}</p>
      <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-[12px]">
        <span className="font-medium">Próximo passo:</span> {issue.action}
      </div>
    </div>
  );
}

function CheckpointCard({
  checkpoint,
}: {
  checkpoint: { title: string; detail: string; status: OperationStatus };
}) {
  const meta = statusMeta[checkpoint.status];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3">
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm font-medium">{checkpoint.title}</div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{checkpoint.detail}</p>
    </div>
  );
}
