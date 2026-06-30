import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Bot,
  ChevronRight,
  Gauge,
  Layers3,
  Mail,
  MessageCircle,
  Orbit,
  Sparkles,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  loadIncentivaCockpit,
  statusMeta,
  type IncentivaChannelStatus,
  type IncentivaWorkflowFamily,
  type IncentivaWorkflowRun,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/pipelines")({
  head: () => ({ meta: [{ title: "Pipelines — Console Incentiva" }] }),
  loader: async () => loadIncentivaCockpit(),
  component: PipelinesPage,
});

function PipelinesPage() {
  const cockpit = Route.useLoaderData();

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Pipelines"]} />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Drill-down operacional
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {cockpit.snapshotLabel}
              </span>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Pipelines
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Aqui a leitura desce da operação para canal, família e workflow, separando onde há
              volume, onde há gargalo e onde vale intervir primeiro.
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface">
            <ArrowRight className="h-3.5 w-3.5" />
            Próximo passo: Clientes
          </Button>
        </section>

        <section className="surface-card p-5">
          <div>
            <h2 className="text-sm font-semibold text-display">Como ler esta frente</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              O raciocínio aqui é simples: primeiro canal, depois família, depois workflow em foco.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <GuideCard
              title="1. Canal"
              detail="WhatsApp, E-mail, LinkedIn e Instagram mostram onde a operação está viva, pressionada ou subutilizada."
            />
            <GuideCard
              title="2. Família"
              detail="Cada família agrupa workflows com a mesma função operacional, como WhatsApp FUP, E-mail FUP e LinkedIn Social."
            />
            <GuideCard
              title="3. Workflow"
              detail="No fim da página ficam os fluxos que mais representam volume, benchmark ou risco imediato."
            />
          </div>
        </section>

        <section className="space-y-1">
          <h2 className="text-sm font-semibold text-display">Leitura por canal</h2>
          <p className="text-[11px] text-muted-foreground">
            Primeiro enxergamos onde a tração e o risco estão distribuídos entre os motores da operação.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cockpit.channels.map((channel) => (
            <ChannelCard key={channel.id} channel={channel} />
          ))}
        </section>

        <section className="space-y-1">
          <h2 className="text-sm font-semibold text-display">Leitura por família</h2>
          <p className="text-[11px] text-muted-foreground">
            Aqui aparece a densidade real das famílias e quais delas já merecem módulo próprio.
          </p>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Famílias monitoradas</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Quais blocos já têm massa operacional suficiente para leitura própria.
                </p>
              </div>
              <Layers3 className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {cockpit.workflowFamilies.map((family) => (
                <FamilyCard key={family.id} family={family} />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Pontos de atenção imediatos</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que já dá para concluir sem abrir ainda o drill-down workflow a workflow.
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima camada <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              <PipelineKpi
                label="Família crítica"
                value="E-mail FUP"
                detail="É a família que mais pede drill-down por waiting e throughput útil."
                icon={Mail}
                tone="risk"
              />
              <PipelineKpi
                label="Motor benchmark"
                value="Instagram"
                detail="Hoje é o melhor padrão de volume, estabilidade e clareza operacional."
                icon={Sparkles}
                tone="success"
              />
              <PipelineKpi
                label="Canal sob pressão"
                value="WhatsApp"
                detail="Não por quebra técnica, e sim pela dependência direta da reposição de base."
                icon={MessageCircle}
                tone="monitor"
              />
              <PipelineKpi
                label="Frente heterogênea"
                value="LinkedIn"
                detail="Já saiu da fase estrutural e agora precisa de leitura mais semântica."
                icon={Orbit}
                tone="info"
              />
            </div>
          </div>
        </section>

        <section className="space-y-1">
          <h2 className="text-sm font-semibold text-display">Workflows em foco</h2>
          <p className="text-[11px] text-muted-foreground">
            Esta camada mostra quais fluxos representam benchmark, volume ou gargalo no snapshot atual.
          </p>
        </section>

        <section className="surface-card overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-border">
            <div>
              <h2 className="text-sm font-semibold text-display">Top workflows</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Volume, sucesso, waiting e última corrida em uma mesma leitura.
              </p>
            </div>
            <Badge variant="secondary" className="text-[10px] text-mono h-5">
              Snapshot da operação
            </Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border bg-muted/20">
                  <th className="text-left font-medium px-4 py-2.5">Workflow</th>
                  <th className="text-left font-medium px-3 py-2.5">Família</th>
                  <th className="text-right font-medium px-3 py-2.5">Exec. 7d</th>
                  <th className="text-right font-medium px-3 py-2.5">Success</th>
                  <th className="text-right font-medium px-3 py-2.5">Error</th>
                  <th className="text-right font-medium px-3 py-2.5">Waiting</th>
                  <th className="text-left font-medium px-3 py-2.5">Última corrida</th>
                  <th className="text-left font-medium px-4 py-2.5">Leitura</th>
                </tr>
              </thead>
              <tbody>
                {cockpit.topWorkflows.map((workflow) => (
                  <WorkflowRow key={workflow.name} workflow={workflow} />
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </>
  );
}

function iconForChannel(channelId: string) {
  if (channelId.includes("whatsapp")) return MessageCircle;
  if (channelId.includes("email")) return Mail;
  if (channelId.includes("linkedin")) return Workflow;
  return Sparkles;
}

function ChannelCard({ channel }: { channel: IncentivaChannelStatus }) {
  const meta = statusMeta[channel.health];
  const Icon = iconForChannel(channel.id);

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {channel.label}
          </div>
          <h3 className="mt-1 text-sm font-medium">{channel.headline}</h3>
        </div>
        <Icon className="h-4 w-4 text-primary shrink-0" />
      </div>

      <div className="mt-4 flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
        <Badge variant="secondary" className="text-[10px] text-mono h-5">
          {channel.activeWorkflows}/{channel.totalWorkflows} ativos
        </Badge>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{channel.detail}</p>
    </div>
  );
}

function FamilyCard({ family }: { family: IncentivaWorkflowFamily }) {
  const meta = statusMeta[family.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{family.label}</div>
          <div className="mt-1 text-[11px] text-muted-foreground">
            {family.active}/{family.total} workflows ativos
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{family.summary}</p>
    </div>
  );
}

function WorkflowRow({ workflow }: { workflow: IncentivaWorkflowRun }) {
  const isRisk = workflow.waiting7d > 0 || workflow.error7d > 0;
  const read = workflow.waiting7d > 0
    ? "Gargalo localizado"
    : workflow.executions7d > 100
      ? "Motor de volume"
      : workflow.success7d > 0
        ? "Fluxo saudável"
        : "Baixa tração";

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div className="font-medium text-[13px]">{workflow.name}</div>
      </td>
      <td className="px-3 py-3">
        <Badge variant="secondary" className="text-[10px] h-5">
          {workflow.family}
        </Badge>
      </td>
      <td className="px-3 py-3 text-right tabular-nums">{workflow.executions7d}</td>
      <td className="px-3 py-3 text-right tabular-nums">{workflow.success7d}</td>
      <td className="px-3 py-3 text-right tabular-nums">{workflow.error7d}</td>
      <td className="px-3 py-3 text-right tabular-nums">{workflow.waiting7d}</td>
      <td className="px-3 py-3 text-[12px] text-muted-foreground">{workflow.lastRun}</td>
      <td className="px-4 py-3">
        <span
          className={cn(
            "inline-flex items-center rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.14em]",
            isRisk
              ? "bg-[color:var(--color-warning)]/10 text-[color:var(--color-warning)]"
              : "bg-[color:var(--color-success)]/10 text-[color:var(--color-success-foreground)]",
          )}
        >
          {read}
        </span>
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

function PipelineKpi({
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
      <div className="text-[24px] leading-none font-semibold text-display tracking-tight">{value}</div>
      <p className="text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}
