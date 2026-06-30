import { createFileRoute } from "@tanstack/react-router";
import {
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  LifeBuoy,
  ShieldAlert,
  Siren,
  Wrench,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { statusMeta, type OperationStatus } from "@/lib/admin-data";

export const Route = createFileRoute("/suporte")({
  head: () => ({ meta: [{ title: "Suporte — Console Incentiva" }] }),
  component: SupportPage,
});

const support = {
  snapshotLabel: "30 jun 2026 · 11:33 BRT",
  lanes: [
    {
      id: "incident-prod",
      title: "Incidente produtivo",
      health: "monitor" as OperationStatus,
      detail: "Quebra técnica real em produção, com impacto direto em workflow, webhook, publish ou dado útil.",
      owner: "Claw/main",
    },
    {
      id: "governance-gap",
      title: "Gap de governança",
      health: "risk" as OperationStatus,
      detail: "Falha de ownership, publish, checklist ou leitura operacional que ainda não virou quebra técnica.",
      owner: "Sales Ops + Claw",
    },
    {
      id: "runbook",
      title: "Runbook acionável",
      health: "healthy" as OperationStatus,
      detail: "Correção recorrente ou passo a passo validado para estabilizar uma frente sem reinventar a roda.",
      owner: "Claw/main",
    },
    {
      id: "follow-up",
      title: "Follow-up técnico",
      health: "monitor" as OperationStatus,
      detail: "Tema já contornado, mas que ainda pede observação ou saneamento fino depois do incidente.",
      owner: "Claw/main",
    },
  ],
  metrics: [
    {
      label: "Incidentes abertos",
      value: "2",
      detail: "Hoje o foco principal ficou em publish do Lovable e resíduo técnico de retry histórico.",
      tone: "risk" as const,
      icon: AlertTriangle,
    },
    {
      label: "Workflows normalizados",
      value: "2",
      detail: "Trial e We9 já foram estabilizados no caminho produtivo do webhook.",
      tone: "success" as const,
      icon: CheckCircle2,
    },
    {
      label: "Runbooks úteis",
      value: "4",
      detail: "Publish, n8n, base e governança já têm trilha clara de intervenção.",
      tone: "info" as const,
      icon: BookOpenCheck,
    },
    {
      label: "Fila de follow-up",
      value: "3",
      detail: "Ainda há itens que já saíram do P0, mas merecem observação ativa.",
      tone: "monitor" as const,
      icon: ClipboardList,
    },
  ],
  incidents: [
    {
      id: "lovable-publish",
      title: "Lovable com falha temporária de publish",
      health: "critical" as OperationStatus,
      summary:
        "O código sobe, o build passa, mas a publicação está falhando do lado da infraestrutura do Lovable.",
      action: "Aguardar estabilidade do fornecedor e seguir evoluindo o admin no código em paralelo.",
      status: "Infra externa / publish travado",
    },
    {
      id: "retry-legacy",
      title: "Retry legado ainda quebrando no Postgres Chat Memory",
      health: "monitor" as OperationStatus,
      summary:
        "O caminho produtivo já normalizou, mas execuções históricas em retry ainda herdam o conflito de input.",
      action: "Manter separado de incidente produtivo e tratar como dívida técnica/observabilidade.",
      status: "Contornado em produção",
    },
    {
      id: "billing-source",
      title: "Snapshot local defasado em Faturamento",
      health: "healthy" as OperationStatus,
      summary:
        "A leitura inicial saiu sem InMeta porque a base local estava atrasada; o ajuste já foi aplicado no código.",
      action: "Usar a carteira real atualizada no próximo publish e reforçar a checagem de fonte antes de consolidar valor.",
      status: "Corrigido",
    },
  ],
  runbooks: [
    {
      title: "Publish travado",
      steps: [
        "Validar se o build local passou no repositório.",
        "Tentar Update/Publish 2 ou 3 vezes com intervalo curto.",
        "Se o erro falar em infraestrutura temporária, tratar como incidente do fornecedor.",
        "Enquanto isso, continuar fechando telas no código e publicar depois.",
      ],
    },
    {
      title: "Workflow vermelho em n8n",
      steps: [
        "Separar quebra técnica real de retry histórico ou waiting.",
        "Validar a última execução produtiva por webhook/evento real.",
        "Corrigir o nó ou payload no VPS e revalidar a corrida real.",
        "Só fechar o tema com evidência objetiva de sucesso.",
      ],
    },
    {
      title: "Cobertura de base abaixo da régua",
      steps: [
        "Confirmar contagem real de não iniciados no Supabase.",
        "Se estiver abaixo da banda, abrir report com dono claro.",
        "Criar/acompanhar ação de reposição de lista no fluxo operacional.",
        "Não reabrir alerta repetido sem recuperação real e nova queda.",
      ],
    },
    {
      title: "Leitura comercial inconsistente",
      steps: [
        "Verificar se a origem correta é Supabase, planilha ou snapshot auxiliar.",
        "Checar se há linha nova fora do cache local.",
        "Ajustar o corte do painel antes de consolidar insight financeiro/comercial.",
        "Revalidar o total final com a carteira atual.",
      ],
    },
  ],
  checklist: [
    "Confirmar se é incidente de código, de dado, de workflow ou de fornecedor.",
    "Separar produção real de retry, waiting e ruído visual.",
    "Definir dono único do próximo passo.",
    "Registrar o que já foi contornado e o que ainda está pendente.",
    "Só encerrar com evidência objetiva ou blocker real nomeado.",
  ],
};

function SupportPage() {
  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Suporte"]} />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Incidentes e runbooks
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {support.snapshotLabel}
              </span>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Suporte
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Esta frente organiza incidentes, contornos, checklists e runbooks para quando a
              operação sair do modo leitura e pedir intervenção prática.
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface">
            <ArrowRight className="h-3.5 w-3.5" />
            Próximo passo: Configurações
          </Button>
        </section>

        <section className="surface-card p-5">
          <div>
            <h2 className="text-sm font-semibold text-display">Como ler esta frente</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Aqui o painel deixa claro o que é incidente real, o que já foi contornado e qual o
              passo padrão para estabilizar a frente sem ruído.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            {support.lanes.map((lane) => (
              <LaneCard key={lane.id} lane={lane} />
            ))}
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {support.metrics.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.02fr_0.98fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Incidentes e contornos</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Temas técnicos que já viraram fila explícita de intervenção ou observação.
                </p>
              </div>
              <Siren className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {support.incidents.map((incident) => (
                <IncidentCard key={incident.id} incident={incident} />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Checklist de triagem</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O mínimo que precisa ficar claro antes de chamar algo de resolvido.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Ver Governança <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {support.checklist.map((item) => (
                <div key={item} className="rounded-xl border border-border bg-surface p-4 text-[12px] text-muted-foreground">
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Runbooks rápidos</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Passos padrão para tirar atrito de publish, workflow, base e leitura comercial.
              </p>
            </div>
            <LifeBuoy className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {support.runbooks.map((runbook) => (
              <RunbookCard key={runbook.title} runbook={runbook} />
            ))}
          </div>
        </section>
      </main>
    </>
  );
}

function LaneCard({
  lane,
}: {
  lane: { title: string; detail: string; owner: string; health: OperationStatus };
}) {
  const meta = statusMeta[lane.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium">{lane.title}</div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{lane.detail}</p>
      <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Dono padrão: {lane.owner}
      </div>
    </div>
  );
}

function MetricCard({
  metric,
}: {
  metric: {
    label: string;
    value: string;
    detail: string;
    tone: "success" | "info" | "monitor" | "risk";
    icon: React.ComponentType<{ className?: string }>;
  };
}) {
  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</div>
        <div className={cn("rounded-lg p-2", toneIconClass[metric.tone])}>
          <metric.icon className="h-3.5 w-3.5" />
        </div>
      </div>
      <div className="mt-4 text-[24px] leading-none font-semibold tracking-tight text-display">{metric.value}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{metric.detail}</p>
    </div>
  );
}

function IncidentCard({
  incident,
}: {
  incident: {
    title: string;
    summary: string;
    action: string;
    status: string;
    health: OperationStatus;
  };
}) {
  const meta = statusMeta[incident.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{incident.title}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{incident.status}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{incident.summary}</p>
      <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[12px] text-muted-foreground">
        Próximo passo: {incident.action}
      </div>
    </div>
  );
}

function RunbookCard({
  runbook,
}: {
  runbook: { title: string; steps: string[] };
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Wrench className="h-4 w-4 text-primary" />
        {runbook.title}
      </div>
      <div className="mt-3 space-y-2">
        {runbook.steps.map((step) => (
          <div key={step} className="flex items-start gap-2 text-[12px] text-muted-foreground">
            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span>{step}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const toneIconClass = {
  success: "bg-emerald-500/12 text-emerald-700",
  info: "bg-sky-500/12 text-sky-700",
  monitor: "bg-blue-500/12 text-blue-700",
  risk: "bg-rose-500/12 text-rose-700",
};
