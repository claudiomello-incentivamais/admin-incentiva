import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  CheckCircle2,
  Database,
  GitBranch,
  LockKeyhole,
  NotebookPen,
  RadioTower,
  RefreshCcw,
  ServerCog,
  ShieldCheck,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  loadIntegrationHub,
  statusMeta,
  type IntegrationActionLane,
  type IntegrationBridge,
  type IntegrationMetric,
  type IntegrationSource,
  type OperationStatus,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/integracoes")({
  head: () => ({ meta: [{ title: "Integrações — Console Incentiva" }] }),
  loader: async () => loadIntegrationHub(),
  component: IntegrationsPage,
});

function IntegrationsPage() {
  const hub = Route.useLoaderData();

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Integrações"]} />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Centro de integração
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {hub.snapshotLabel}
              </span>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Integrações
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Esta frente consolida o papel de cada sistema no produto, o estado do sync, a saúde
              das pontes e o que ainda falta para a gestão ficar realmente centralizada.
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
            <Link to="/configuracoes">
              <ArrowRight className="h-3.5 w-3.5" />
              Próximo passo: Auth e publish
            </Link>
          </Button>
        </section>

        <section className="surface-card p-5">
          <div>
            <h2 className="text-sm font-semibold text-display">Como ler esta frente</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              O objetivo aqui não é listar ferramentas. É mostrar como cada sistema entra na
              operação, o que ele alimenta e onde ainda existe checkpoint manual.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-3">
            <GuideCard
              title="1. Fonte"
              detail="Cada sistema aparece com owner, sync, visibilidade e qual parte do produto ele abastece."
            />
            <GuideCard
              title="2. Ponte"
              detail="As pontes mostram se a informação já entrou de verdade no admin ou se ainda depende de leitura distribuída."
            />
            <GuideCard
              title="3. Fila"
              detail="O hub deixa explícito o que ainda falta integrar para a gestão ficar concentrada numa tela só."
            />
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-4">
          {hub.metrics.map((metric) => (
            <IntegrationMetricCard key={metric.id} metric={metric} />
          ))}
        </section>

        <section className="space-y-1">
          <h2 className="text-sm font-semibold text-display">Mapa central das fontes</h2>
          <p className="text-[11px] text-muted-foreground">
            Aqui fica claro o papel de Supabase, n8n, Notion, Trello, Discord, GitHub e publish na
            operação como produto.
          </p>
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {hub.sources.map((source) => (
            <IntegrationSourceCard key={source.id} source={source} />
          ))}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Pontes críticas</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde a informação já aterrissa no produto e onde ela ainda pede mais amarração.
                </p>
              </div>
              <RefreshCcw className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {hub.bridges.map((bridge) => (
                <IntegrationBridgeCard key={bridge.id} bridge={bridge} />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Fila de integração</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que ainda falta para o Lovable concentrar gestão, execução e leitura sem voltar
                  para uma operação espalhada.
                </p>
              </div>
              <Workflow className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {hub.actionLanes.map((lane) => (
                <IntegrationActionLaneCard key={lane.id} lane={lane} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
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

function toneClass(tone?: IntegrationMetric["tone"]) {
  switch (tone) {
    case "success":
    case "healthy":
      return "border-emerald-500/20 bg-emerald-500/5 text-emerald-600";
    case "critical":
      return "border-destructive/20 bg-destructive/5 text-destructive";
    case "risk":
      return "border-[color:var(--color-warning)]/20 bg-[color:var(--color-warning)]/8 text-[color:var(--color-warning)]";
    case "monitor":
      return "border-[color:var(--color-info)]/20 bg-[color:var(--color-info)]/8 text-[color:var(--color-info)]";
    default:
      return "border-primary/20 bg-primary/5 text-primary";
  }
}

function IntegrationMetricCard({ metric }: { metric: IntegrationMetric }) {
  const iconMap = {
    "connected-layers": LayersIcon,
    "live-reads": Activity,
    "manual-checkpoints": ShieldCheck,
    "action-targets": GitBranch,
  } as const;

  const Icon = iconMap[metric.id as keyof typeof iconMap] ?? Activity;

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {metric.label}
          </div>
          <div className="mt-1 text-2xl font-semibold text-display">{metric.value}</div>
        </div>
        <div className={cn("rounded-xl border p-2.5", toneClass(metric.tone))}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground">{metric.detail}</p>
    </div>
  );
}

function IntegrationSourceCard({ source }: { source: IntegrationSource }) {
  const iconMap = {
    supabase: Database,
    n8n: ServerCog,
    notion: NotebookPen,
    trello: GitBranch,
    discord: RadioTower,
    github: GitBranch,
    publish: LockKeyhole,
  } as const;

  const Icon = iconMap[source.id as keyof typeof iconMap] ?? Database;
  const health = statusMeta[source.health];

  return (
    <div className="surface-card p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em] h-5">
              {source.category}
            </Badge>
            <Badge
              variant="outline"
              className={cn("text-[10px] uppercase tracking-[0.16em] h-5", health.color)}
            >
              {health.label}
            </Badge>
          </div>
          <h3 className="mt-2 text-base font-semibold text-display">{source.title}</h3>
          <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">{source.headline}</p>
        </div>
        <div className={cn("rounded-xl border p-2.5", toneClass(source.health))}>
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <SourceFact label="Owner" value={source.owner} />
        <SourceFact label="Sync" value={source.syncStatus} />
        <SourceFact label="Visibilidade" value={source.visibility} />
        <SourceFact label="Último estado" value={source.lastSync} />
      </div>

      <div className="mt-4 rounded-xl border border-border bg-surface p-4">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          Fonte de verdade
        </div>
        <div className="mt-1 text-sm text-foreground">{source.sourceOfTruth}</div>
        <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{source.detail}</p>
      </div>

      <div className="mt-4">
        <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
          O que esta camada já alimenta
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {source.powers.map((power) => (
            <Badge key={power} variant="outline" className="h-6 text-[10px] uppercase tracking-[0.14em]">
              {power}
            </Badge>
          ))}
        </div>
      </div>
    </div>
  );
}

function SourceFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm text-foreground">{value}</div>
    </div>
  );
}

function IntegrationBridgeCard({ bridge }: { bridge: IntegrationBridge }) {
  const health = statusMeta[bridge.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {bridge.from} → {bridge.to}
          </div>
          <div className="mt-1 text-sm font-medium">{bridge.title}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", health.color)}>
          {health.label}
        </Badge>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{bridge.detail}</p>
      <div className="mt-3 rounded-lg border border-primary/15 bg-primary/5 px-3 py-2 text-[12px] text-foreground">
        Próximo passo: {bridge.nextStep}
      </div>
    </div>
  );
}

function IntegrationActionLaneCard({ lane }: { lane: IntegrationActionLane }) {
  const health = statusMeta[lane.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {lane.target}
          </div>
          <div className="mt-1 text-sm font-medium">{lane.title}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", health.color)}>
          {health.label}
        </Badge>
      </div>
      <div className="mt-2 text-[12px] text-muted-foreground">Owner: {lane.owner}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{lane.detail}</p>
      <div className="mt-3 rounded-lg border border-border bg-background px-3 py-2 text-[12px] text-foreground">
        {lane.nextStep}
      </div>
    </div>
  );
}

function LayersIcon(props: React.ComponentProps<typeof Workflow>) {
  return <CheckCircle2 {...props} />;
}
