import { createFileRoute, Link } from "@tanstack/react-router";
import type { ComponentType } from "react";
import {
  Activity,
  AlertOctagon,
  ArrowUpRight,
  BarChart3,
  Bot,
  ChevronRight,
  Database,
  Gauge,
  ListTodo,
  Mail,
  MessageCircle,
  Orbit,
  RefreshCcw,
  ShieldAlert,
  Sparkles,
  Target,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  type IncentivaExecutionBacklogItem,
  loadIncentivaCockpit,
  type IncentivaEmailHealthTrack,
  statusMeta,
  type IncentivaCockpitAlert,
  type IncentivaCockpitData,
  type IncentivaProspectingLane,
  type IncentivaWhatsappHealthTrack,
  type IncentivaWorkflowFamily,
  type IncentivaWorkflowInsight,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/operacoes")({
  head: () => ({ meta: [{ title: "Incentiva Ops — Cockpit Incentiva V1" }] }),
  loader: async () => loadIncentivaCockpit(),
  component: Page,
});

function formatNumber(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatDecimal(value: number, digits = 1) {
  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(value);
}

function Page() {
  const cockpit = Route.useLoaderData();
  const healthMeta = statusMeta[cockpit.summary.health];

  return (
    <>
      <Topbar breadcrumb={["Incentiva Ops", "Operações", "Cockpit Incentiva V1"]} />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Operação piloto
              </Badge>
              <Badge
                variant="outline"
                className={cn(
                  "text-[10px] uppercase tracking-[0.18em] h-5",
                  healthMeta.color,
                )}
              >
                {healthMeta.label}
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {cockpit.snapshotLabel}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {cockpit.source === "live" ? "Supabase live" : "Snapshot fallback"}
              </Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Cockpit Incentiva V1
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Primeira leitura profunda da operação piloto unindo base, funil, reativação e
              telemetria real de automação.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
              <Link to="/">
                <BarChart3 className="h-3.5 w-3.5" />
                Voltar ao Admin Global
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2">
              <RefreshCcw className="h-3.5 w-3.5" />
              Snapshot consolidado
            </Button>
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          <ExecKpi
            label="Saúde da operação"
            value={healthMeta.label}
            icon={ShieldAlert}
            tone={cockpit.summary.health}
            sub={cockpit.summary.focus}
          />
          <ExecKpi
            label="Score executivo"
            value={cockpit.summary.priorityScore.toString()}
            icon={Gauge}
            sub="Prioridade atual"
          />
          <ExecKpi
            label="Alinhamento de estágio"
            value={`${formatDecimal(cockpit.summary.stageAlignmentPct, 2)}%`}
            icon={Target}
            tone="success"
            sub="Canônico Supabase x Notion"
          />
          <ExecKpi
            label="Match rate"
            value={`${formatDecimal(cockpit.summary.matchRatePct, 2)}%`}
            icon={Database}
            tone="info"
            sub="Reconciliação estrutural"
          />
          <ExecKpi
            label="Workflows ativos"
            value={`${cockpit.summary.activeWorkflows}/${cockpit.summary.totalWorkflows}`}
            icon={Workflow}
            sub="n8n VPS · Incentiva"
          />
          <ExecKpi
            label="Execuções 7d"
            value={formatNumber(cockpit.summary.success7d)}
            icon={Activity}
            tone="success"
            sub={`${cockpit.summary.error7d} erros · ${cockpit.summary.waiting7d} waiting`}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.5fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Resumo Executivo</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Leitura direta do ponto em que a Incentiva está agora
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] text-mono h-5">
                Operação piloto
              </Badge>
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <SummaryPanel
                title="Base e cadência"
                icon={ListTodo}
                points={[
                  `A operação fechou com ${cockpit.baseMetrics[0]?.value} não iniciados canônicos.`,
                  `A meta diária atual está em ${cockpit.baseMetrics[1] ? "25 ativações" : "cadência ativa"}.`,
                  `O gargalo real hoje é reposição de base, não falta de workflow.`,
                ]}
              />
              <SummaryPanel
                title="Qualidade de dado"
                icon={Database}
                points={[
                  `${formatNumber(cockpit.summary.supabaseRecords)} registros no Supabase vs ${formatNumber(cockpit.summary.notionRecords)} no Notion.`,
                  `${formatDecimal(cockpit.summary.stageAlignmentPct, 2)}% de alinhamento canônico.`,
                  "A reconciliação estrutural está forte, mas a semântica ainda pede ajuste fino.",
                ]}
              />
              <SummaryPanel
                title="Automação"
                icon={Bot}
                points={[
                  `${cockpit.summary.activeWorkflows} workflows ativos de ${cockpit.summary.totalWorkflows} totais.`,
                  `${formatNumber(cockpit.summary.success7d)} execuções com apenas ${cockpit.summary.error7d} erros em 7 dias.`,
                  "A operação já tem densidade suficiente para workflow intelligence por família.",
                ]}
              />
              <SummaryPanel
                title="Próxima decisão"
                icon={Sparkles}
                points={[
                  "Manter o cockpit da Incentiva como primeira navegação real por operação.",
                  "A próxima iteração natural é substituir os blocos mais críticos por leitura viva do Supabase.",
                  "Email waiting e base de não iniciados merecem prioridade no próximo corte.",
                ]}
              />
            </div>
          </div>

          <AlertsCard alerts={cockpit.alerts} />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.15fr_0.85fr] gap-4">
          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-display">Funil Comercial Canônico</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Contagem por estágio com toque mensal quando disponível
                </p>
              </div>
              <Badge variant="secondary" className="text-[10px] text-mono h-5">
                Jun 2026
              </Badge>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2 xl:grid-cols-4">
              {cockpit.funnel.map((stage) => (
                <div key={stage.id} className="rounded-xl border border-border bg-surface p-4">
                  <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
                    {stage.label}
                  </div>
                  <div className="mt-3 text-[28px] leading-none font-semibold text-display tracking-tight tabular-nums">
                    {formatNumber(stage.count)}
                  </div>
                  <div className="mt-2 text-[11px] text-muted-foreground">
                    {typeof stage.touchedThisMonth === "number"
                      ? `${formatNumber(stage.touchedThisMonth)} tocados no mês`
                      : "Sem corte mensal consolidado neste bloco"}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Base / Reativação</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Primeira camada para lista, reposição e reaproveitamento
                </p>
              </div>
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {cockpit.baseMetrics.map((metric) => (
                <BaseMetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">ICP / Lista / Não Iniciados</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Cobertura de base nova e alavancas imediatas para sustentar a cadência
                </p>
              </div>
              <Target className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.prospectingReadiness.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "icp-coverage"
                      ? ListTodo
                      : metric.id === "coverage-window"
                        ? Gauge
                        : metric.id === "reactivation-volume"
                          ? RefreshCcw
                          : ArrowUpRight
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Alavancas imediatas</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde atacar primeiro para tirar a pressão da operação
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima camada <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.prospectingReadiness.lanes.map((lane) => (
                <ProspectingLaneCard key={lane.id} lane={lane} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">E-mail / Waiting / Throughput</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Leitura do gargalo já confirmado na família de e-mail da Incentiva
                </p>
              </div>
              <Mail className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.emailHealth.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "email-active"
                      ? Mail
                      : metric.id === "email-waiting"
                        ? AlertOctagon
                        : metric.id === "email-throughput"
                          ? Activity
                          : Workflow
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Ponto de intervenção do e-mail</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde atacar para transformar fila em throughput útil
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima camada <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.emailHealth.tracks.map((track) => (
                <EmailTrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">V2 · Backlog Operacional</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Primeira camada de priorização executiva por frente da Incentiva
                </p>
              </div>
              <ListTodo className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.executionBacklog.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "open-fronts"
                      ? Orbit
                      : metric.id === "p0-items"
                        ? AlertOctagon
                        : metric.id === "owner-clusters"
                          ? Bot
                          : Sparkles
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Fila de intervenção</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que entra primeiro, com dono sugerido e próximo passo
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Roteiro V2 <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.executionBacklog.items.map((item) => (
                <ExecutionBacklogCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">WhatsApp Health</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Leitura executiva do canal que mais sente pressão de base e cadência
                </p>
              </div>
              <MessageCircle className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.whatsappHealth.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "infra"
                      ? Workflow
                      : metric.id === "base-pressure"
                        ? Target
                        : metric.id === "lead-lanes-idle"
                          ? AlertOctagon
                          : Activity
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Frentes do canal</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde o WhatsApp está rodando bem e onde já pede a próxima camada
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima leitura <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.whatsappHealth.tracks.map((track) => (
                <WhatsappTrackCard key={track.id} track={track} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Workflow Intelligence</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Leitura de famílias, densidade operacional e ponto de intervenção
                </p>
              </div>
              <Workflow className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2">
              {cockpit.workflowIntelligence.metrics.map((metric) => (
                <ExecKpi
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  sub={metric.detail}
                  icon={
                    metric.id === "active-families"
                      ? Orbit
                      : metric.id === "email-risk"
                        ? AlertOctagon
                        : metric.id === "social-density"
                          ? Sparkles
                          : BarChart3
                  }
                  tone={metric.tone ?? "monitor"}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Pontos de intervenção</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde a próxima rodada deve entrar para gerar mais efeito
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima camada <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="space-y-3">
              {cockpit.workflowIntelligence.insights.map((insight) => (
                <WorkflowInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Canais Ativos</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Fotografia operacional por frente principal
                </p>
              </div>
              <Orbit className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {cockpit.channels.map((channel) => {
                const meta = statusMeta[channel.health];
                const Icon =
                  channel.id === "whatsapp"
                    ? MessageCircle
                    : channel.id === "email"
                      ? Mail
                      : channel.id === "linkedin"
                        ? NetworkIcon
                        : Sparkles;

                return (
                  <div
                    key={channel.id}
                    className="rounded-xl border border-border bg-surface px-4 py-3.5"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={cn(
                            "h-9 w-9 rounded-lg flex items-center justify-center bg-muted",
                            meta.color,
                          )}
                        >
                          <Icon className="h-4 w-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium">{channel.label}</span>
                            <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
                              {meta.label}
                            </Badge>
                          </div>
                          <p className="text-[12px] text-foreground mt-1">{channel.headline}</p>
                          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                            {channel.detail}
                          </p>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-lg font-semibold text-display tabular-nums">
                          {channel.activeWorkflows}/{channel.totalWorkflows}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
                          Workflows ativos
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="surface-card overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border">
              <div>
                <h2 className="text-sm font-semibold text-display">Famílias / Top Workflows</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Famílias ativas e fluxos com maior sinal operacional
                </p>
              </div>
              <Button variant="ghost" size="sm" className="h-7 text-xs gap-1 text-muted-foreground">
                Próxima camada <ChevronRight className="h-3 w-3" />
              </Button>
            </div>

            <div className="grid gap-3 p-5 md:grid-cols-2">
              {cockpit.workflowFamilies.map((family) => (
                <WorkflowFamilyCard key={family.id} family={family} />
              ))}
            </div>

            <div className="border-t border-border px-5 py-4">
              <h3 className="text-sm font-semibold text-display">Top workflows 7d</h3>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground border-b border-border bg-muted/20">
                      <th className="text-left font-medium px-3 py-2.5">Workflow</th>
                      <th className="text-left font-medium px-3 py-2.5">Família</th>
                      <th className="text-right font-medium px-3 py-2.5">Execuções</th>
                      <th className="text-right font-medium px-3 py-2.5">Erro</th>
                      <th className="text-right font-medium px-3 py-2.5">Waiting</th>
                      <th className="text-left font-medium px-3 py-2.5">Última corrida</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cockpit.topWorkflows.map((workflow) => (
                      <tr key={workflow.name} className="border-b border-border last:border-0">
                        <td className="px-3 py-3">
                          <div className="font-medium text-[12.5px]">{workflow.name}</div>
                        </td>
                        <td className="px-3 py-3 text-[11px] text-muted-foreground">
                          {workflow.family}
                        </td>
                        <td className="px-3 py-3 text-right text-mono text-[12px] font-medium">
                          {formatNumber(workflow.executions7d)}
                        </td>
                        <td className="px-3 py-3 text-right text-mono text-[12px]">
                          {workflow.error7d}
                        </td>
                        <td className="px-3 py-3 text-right text-mono text-[12px]">
                          {workflow.waiting7d}
                        </td>
                        <td className="px-3 py-3 text-[11px] text-muted-foreground">
                          {workflow.lastRun}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function ExecKpi({
  label,
  value,
  sub,
  icon: Icon,
  tone = "healthy",
}: {
  label: string;
  value: string;
  sub?: string;
  icon: ComponentType<{ className?: string }>;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
}) {
  const toneMap = {
    healthy: "text-[color:var(--color-success)]",
    monitor: "text-[color:var(--color-info)]",
    risk: "text-[color:var(--color-warning)]",
    critical: "text-destructive",
    success: "text-[color:var(--color-success)]",
    info: "text-[color:var(--color-info)]",
  };

  return (
    <div className="surface-card p-4 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
          {label}
        </span>
        <div
          className={cn(
            "h-6 w-6 rounded-md bg-muted flex items-center justify-center",
            toneMap[tone],
          )}
        >
          <Icon className="h-3 w-3" />
        </div>
      </div>
      <div className={cn("text-[26px] leading-none font-semibold text-display tracking-tight", toneMap[tone])}>
        {value}
      </div>
      {sub && <div className="text-[10px] text-muted-foreground">{sub}</div>}
    </div>
  );
}

function SummaryPanel({
  title,
  icon: Icon,
  points,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  points: string[];
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 mb-3">
        <div className="h-8 w-8 rounded-lg bg-muted flex items-center justify-center text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <h3 className="text-sm font-semibold text-display">{title}</h3>
      </div>
      <div className="space-y-2">
        {points.map((point) => (
          <div key={point} className="flex gap-2 text-[12px] leading-relaxed text-muted-foreground">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span>{point}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function AlertsCard({ alerts }: { alerts: IncentivaCockpitAlert[] }) {
  const meta = {
    critical: { icon: AlertOctagon, color: "text-destructive", bg: "bg-destructive/10" },
    risk: {
      icon: ShieldAlert,
      color: "text-[color:var(--color-warning)]",
      bg: "bg-[color:var(--color-warning)]/10",
    },
    monitor: {
      icon: Activity,
      color: "text-[color:var(--color-info)]",
      bg: "bg-[color:var(--color-info)]/10",
    },
    info: { icon: Sparkles, color: "text-muted-foreground", bg: "bg-muted" },
  } as const;

  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-display">Alertas Prioritários</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">
            Leitura estratégica para a próxima rodada de execução
          </p>
        </div>
        <Badge variant="secondary" className="text-[10px] text-mono h-5">
          {alerts.length}
        </Badge>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => {
          const item = meta[alert.severity];
          const Icon = item.icon;
          return (
            <div key={alert.id} className="flex gap-3 border-b border-border pb-3 last:border-0 last:pb-0">
              <div className={cn("h-8 w-8 rounded-lg flex items-center justify-center shrink-0", item.bg, item.color)}>
                <Icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-[12.5px] font-medium leading-snug">{alert.title}</div>
                <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                  {alert.detail}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function BaseMetricCard({
  metric,
}: {
  metric: IncentivaCockpitData["baseMetrics"][number];
}) {
  const toneMap = {
    default: "text-foreground",
    success: "text-[color:var(--color-success)]",
    warning: "text-[color:var(--color-warning)]",
    destructive: "text-destructive",
    info: "text-[color:var(--color-info)]",
  };
  const tone = toneMap[metric.tone ?? "default"];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground font-medium">
            {metric.label}
          </div>
          <div className={cn("mt-2 text-[24px] leading-none font-semibold text-display tracking-tight tabular-nums", tone)}>
            {formatNumber(metric.value)}
            {metric.unit && <span className="text-sm ml-1">{metric.unit}</span>}
          </div>
        </div>
        <ArrowUpRight className={cn("h-4 w-4 shrink-0", tone)} />
      </div>
      <div className="mt-2 text-[11px] text-muted-foreground leading-relaxed">{metric.detail}</div>
    </div>
  );
}

function WorkflowFamilyCard({ family }: { family: IncentivaWorkflowFamily }) {
  const meta = statusMeta[family.health];
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{family.label}</div>
          <div className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            {family.summary}
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] h-5 shrink-0", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <div className="mt-4 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>Ativos</span>
        <span className="text-mono font-medium text-foreground">
          {family.active}/{family.total}
        </span>
      </div>
      <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={cn("h-full rounded-full", meta.bg)}
          style={{ width: `${(family.active / family.total) * 100}%` }}
        />
      </div>
    </div>
  );
}

function WhatsappTrackCard({ track }: { track: IncentivaWhatsappHealthTrack }) {
  const meta = statusMeta[track.health];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{track.label}</span>
            <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
              {meta.label}
            </Badge>
          </div>
          <p className="text-[12px] text-foreground mt-1">{track.headline}</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            {track.detail}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
            Sinal
          </div>
          <div className="text-[12px] font-medium text-display mt-1">{track.workflows}</div>
        </div>
      </div>
    </div>
  );
}

function WorkflowInsightCard({ insight }: { insight: IncentivaWorkflowInsight }) {
  const meta = statusMeta[insight.health];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{insight.label}</span>
            <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
              {meta.label}
            </Badge>
          </div>
          <p className="text-[12px] text-foreground mt-1">{insight.headline}</p>
          <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
            {insight.detail}
          </p>
          <div className="mt-2 rounded-lg border border-border/80 bg-muted/20 px-3 py-2 text-[11px] leading-relaxed text-foreground">
            <span className="font-medium">Recomendação:</span> {insight.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}

function ProspectingLaneCard({ lane }: { lane: IncentivaProspectingLane }) {
  const meta = statusMeta[lane.health];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-medium">{lane.label}</span>
            <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
              {meta.label}
            </Badge>
          </div>
          <p className="text-[12px] text-foreground">{lane.headline}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{lane.detail}</p>
          <div className="text-[11px] text-primary leading-relaxed">
            {lane.recommendation}
          </div>
        </div>
      </div>
    </div>
  );
}

function EmailTrackCard({ track }: { track: IncentivaEmailHealthTrack }) {
  const meta = statusMeta[track.health];

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="space-y-1.5">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-medium">{track.label}</span>
          <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
            {meta.label}
          </Badge>
        </div>
        <p className="text-[12px] text-foreground">{track.headline}</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed">{track.detail}</p>
        <div className="text-[11px] text-primary leading-relaxed">{track.recommendation}</div>
      </div>
    </div>
  );
}

function ExecutionBacklogCard({ item }: { item: IncentivaExecutionBacklogItem }) {
  const meta = statusMeta[item.health];
  const priorityTone =
    item.priority === "P0"
      ? "border-destructive/30 text-destructive bg-destructive/8"
      : item.priority === "P1"
        ? "border-warning/30 text-warning bg-warning/8"
        : "border-info/30 text-info bg-info/8";

  return (
    <div className="rounded-xl border border-border bg-surface px-4 py-3.5">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="outline" className={cn("text-[10px] h-5 font-semibold", priorityTone)}>
              {item.priority}
            </Badge>
            <span className="text-sm font-medium">{item.lane}</span>
            <Badge variant="outline" className={cn("text-[10px] h-5", meta.color)}>
              {meta.label}
            </Badge>
          </div>
          <p className="text-[12px] text-foreground">{item.headline}</p>
          <p className="text-[11px] text-muted-foreground leading-relaxed">{item.detail}</p>
          <div className="text-[11px] text-muted-foreground">
            Dono sugerido: <span className="text-foreground">{item.owner}</span>
          </div>
          <div className="text-[11px] text-primary leading-relaxed">{item.nextStep}</div>
        </div>
      </div>
    </div>
  );
}

function NetworkIcon({ className }: { className?: string }) {
  return <Orbit className={className} />;
}
