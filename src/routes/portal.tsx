import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Building2,
  Eye,
  LockKeyhole,
  MessageCircle,
  NotebookPen,
  PhoneCall,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { z } from "zod";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatPeriodLabel,
  formatVisibilityModeLabel,
  useAdminFilters,
} from "@/components/admin/admin-filters";
import {
  buildOperationActionPlan,
  buildOperationCadenceView,
  buildOperationCockpitFromOperation,
  buildOperationNotionView,
  buildOperationTrelloView,
  getScoreDrivers,
  statusMeta,
} from "@/lib/admin-data";
import { loadScopedGlobalDashboardServerFn } from "@/lib/admin-global-rpc";
import { applyPeriodToCockpit, applyPeriodToOperation } from "@/lib/admin-period";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "Portal — Console Incentiva" }] }),
  validateSearch: z.object({
    operationId: z.string().optional(),
  }),
  loader: async () => loadScopedGlobalDashboardServerFn(),
  component: PortalPage,
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

function PortalPage() {
  const dashboard = Route.useLoaderData();
  const search = Route.useSearch();
  const {
    selectedOperationId,
    selectedAccessProfile,
    selectedPeriod,
    selectedVisibilityMode,
  } = useAdminFilters();
  const requestedOperationId = search.operationId;

  const portalOperation =
    ((requestedOperationId
      ? dashboard.operations.find((operation) => operation.id === requestedOperationId)
      : null) ??
      (selectedOperationId === "all"
      ? dashboard.operations.find((operation) => operation.health === "healthy") ??
        dashboard.operations.find((operation) => operation.health === "monitor") ??
        dashboard.operations[0]
      : dashboard.operations.find((operation) => operation.id === selectedOperationId))) ?? null;

  if (!portalOperation) {
    return (
      <>
        <Topbar breadcrumb={["Console Incentiva", "Portal"]} />
        <main className="flex-1 w-full max-w-[1600px] mx-auto px-4 py-4 md:px-6 md:py-6">
          <div className="surface-card p-6 text-sm text-muted-foreground">
            Nenhuma operação disponível para montar a visão de portal.
          </div>
        </main>
      </>
    );
  }

  const scopedPortalOperation = applyPeriodToOperation(portalOperation, selectedPeriod);
  const cockpit = applyPeriodToCockpit(
    buildOperationCockpitFromOperation(scopedPortalOperation),
    selectedPeriod,
  );
  const cadenceView = buildOperationCadenceView(scopedPortalOperation, cockpit, dashboard.source);
  const actionPlan = buildOperationActionPlan(scopedPortalOperation);
  const notionView = buildOperationNotionView(scopedPortalOperation, cockpit, dashboard.source);
  const trelloView = buildOperationTrelloView(scopedPortalOperation, cockpit);
  const drivers = getScoreDrivers(scopedPortalOperation).slice(0, 3);
  const openNotionAction = notionView.actions.find((action) => action.id === "open-notion");
  const openBoardAction = trelloView.actions.find((action) => action.id === "open-board");

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Portal"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Portal privado
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {selectedAccessProfile.label}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {formatVisibilityModeLabel(selectedVisibilityMode)}
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {formatPeriodLabel(selectedPeriod)}
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {dashboard.snapshotLabel}
              </span>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Portal de Operação
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Visão de gestão da operação com foco em saúde, gargalos, conversão e próximo passo,
              sem poluição de bastidor técnico.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
              <Link to="/configuracoes">
                <LockKeyhole className="h-3.5 w-3.5" />
                Ajustar regras de acesso
              </Link>
            </Button>
            <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
              <Link to="/clientes">
                <ArrowRight className="h-3.5 w-3.5" />
                Voltar para carteira
              </Link>
            </Button>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em] h-5">
                  {portalOperation.client}
                </Badge>
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase tracking-[0.16em] h-5",
                    statusMeta[portalOperation.health].tone,
                  )}
                >
                  {statusMeta[portalOperation.health].label}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold text-display">{portalOperation.name}</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                {selectedVisibilityMode === "client"
                  ? "Recorte pronto para leitura privada, com foco em saúde da operação, cobertura, conversão e próximos passos."
                  : "Visão operacional filtrada para apoiar leitura de gestão, sem abrir a camada técnica inteira."}{" "}
                O período ativo também recorta este painel.
              </p>
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3 max-w-sm">
              <div className="text-[10px] uppercase tracking-[0.18em] text-primary">
                Regra de exposição ativa
              </div>
              <div className="mt-1 text-sm font-medium text-display">
                {selectedAccessProfile.scope}
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {selectedAccessProfile.description}
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-primary/20 bg-primary/5 px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-primary">
                Visão ativa
              </div>
              <div className="mt-1 text-sm font-medium text-display">
                {formatVisibilityModeLabel(selectedVisibilityMode)}
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {selectedVisibilityMode === "client"
                  ? "Este recorte foi pensado para leitura externa controlada, sem bastidor interno e sem comparativos sensíveis."
                  : "Este recorte preserva contexto operacional extra para calibrar o que ainda deve ou não sair para cliente."}
              </p>
            </div>
            <div className="rounded-2xl border border-border bg-surface px-4 py-3">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Fonte principal
              </div>
              <div className="mt-1 text-sm font-medium text-display">
                {dashboard.source === "live" ? "Leitura viva" : "Snapshot governado"}
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                O portal já mostra de forma mais clara se a leitura desta operação vem de fonte
                ativa ou de fallback curado, sem misturar outras contas no recorte.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <PortalKpi
              label="Leads monitorados"
              value={formatNumber(cockpit.summary.supabaseRecords)}
              detail="Base visível neste recorte."
              icon={Users}
              tone="info"
            />
            <PortalKpi
              label="Cobertura"
              value={`${formatPercent(scopedPortalOperation.baseCoverage)}%`}
              detail="Cobertura de base atual."
              icon={Target}
              tone="monitor"
            />
            <PortalKpi
              label="Conversão"
              value={`${formatPercent(scopedPortalOperation.monthlyConversion)}%`}
              detail="Conversão mensal da operação."
              icon={TrendingUp}
              tone="success"
            />
            <PortalKpi
              label="Score operacional"
              value={String(scopedPortalOperation.score)}
              detail={`Prioridade ${scopedPortalOperation.priority}`}
              icon={Building2}
              tone="info"
            />
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Leitura executiva da conta</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que importa agora para decidir onde agir.
                </p>
              </div>
              <Eye className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-primary">
                Próxima alavanca sugerida
              </div>
              <div className="mt-1 text-base font-semibold text-display">
                {actionPlan.actions[0]}
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                {actionPlan.headline}
              </p>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {actionPlan.causes.map((item) => (
                <PortalNarrativeCard
                  key={item}
                  label="Sinal principal"
                  title={item.split(":")[0] ?? "Leitura"}
                  detail={item}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Gargalos e oportunidades</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Onde a operação está puxando para cima ou travando resultado.
                </p>
              </div>
              <TrendingUp className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {drivers.map((driver) => (
                <div key={driver.label} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-medium">{driver.label}</div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] uppercase tracking-[0.16em] h-5",
                        driver.weight > 0 ? "border-emerald-500/30 text-emerald-600" : "border-rose-500/30 text-rose-600",
                      )}
                    >
                      {driver.weight > 0 ? `+${driver.weight}` : driver.weight}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {driver.explanation}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Acessos rápidos da operação</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Tudo que precisa ser aberto para tocar a conta sem caçar em outras telas.
                </p>
              </div>
              <Activity className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {openBoardAction ? (
                <LiveActionCard
                  title="Abrir Trello da operação"
                  detail={trelloView.detail}
                  href={openBoardAction.href}
                  external
                  buttonLabel={openBoardAction.label}
                />
              ) : (
                <PortalNarrativeCard
                  label="Trello"
                  title="Quadro ainda não homologado"
                  detail={trelloView.availabilityLabel}
                />
              )}
              {openNotionAction ? (
                <LiveActionCard
                  title={openNotionAction.title}
                  detail={openNotionAction.detail}
                  href={openNotionAction.href}
                  external={openNotionAction.external}
                  buttonLabel="Abrir Notion da operação"
                />
              ) : (
                <PortalNarrativeCard
                  label="Notion"
                  title="Base ainda sem link direto"
                  detail="A leitura comercial continua disponível no painel, mas o link direto da base ainda não foi homologado neste recorte."
                />
              )}
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-4">
              {trelloView.metrics.slice(0, 4).map((metric) => (
                <PortalMiniMetric
                  key={metric.id}
                  label={metric.label}
                  value={metric.value}
                  detail={metric.detail}
                />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Próximas ações da operação</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que fazer agora, em linguagem de gestão e sem bastidor técnico.
                </p>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {actionPlan.actions.slice(0, 3).map((action, index) => (
                <ActivationRow
                  key={action}
                  title={`Ação ${index + 1}`}
                  detail={action}
                  icon={ArrowRight}
                />
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Cadência e conversão</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Acompanhamento do ritmo comercial sem depender de leitura manual da operação.
              </p>
            </div>
            <Activity className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="text-sm font-medium text-display">{cadenceView.headline}</div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                {cadenceView.detail}
              </p>
              <div className="mt-3 text-[11px] text-muted-foreground">{cadenceView.syncLabel}</div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {cadenceView.metrics.map((metric) => (
                  <PortalMiniMetric
                    key={metric.id}
                    label={metric.label}
                    value={metric.value}
                    detail={metric.detail}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                {cadenceView.stages.map((stage) => (
                  <PortalNarrativeCard
                    key={stage.id}
                    label={stage.label}
                    title={formatNumber(stage.count)}
                    detail={`${stage.shareLabel}. ${stage.conversionLabel}.`}
                  />
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Janelas de acompanhamento
              </div>
              <div className="mt-1 text-base font-semibold text-display">
                7d, 30d, 90d e mês acumulado
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                Essas janelas ajudam a diferenciar oscilação curta de tendência estrutural sem depender só de sensação de operação.
              </p>

              <div className="mt-4 grid gap-3">
                {cadenceView.windows.map((window) => (
                  <PortalNarrativeCard
                    key={window.id}
                    label={window.label}
                    title={`${window.activeLabel} · ${window.conversionLabel}`}
                    detail={`${window.velocityLabel}. ${window.detail}`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-sm font-semibold text-display">Pipeline e próximos passos</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Leitura operacional do pipeline com acesso rápido ao detalhe quando necessário.
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-[0.16em] h-5",
                statusMeta[notionView.health].color,
              )}
            >
              {notionView.mode === "live" ? "Notion live" : "Notion governado"}
            </Badge>
          </div>

          <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="flex items-start gap-3">
                <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
                  <NotebookPen className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-sm font-medium text-display">{notionView.headline}</div>
                  <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                    {notionView.detail}
                  </p>
                </div>
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-3">
                <PortalMiniMetric
                  label="Pipeline"
                  value={notionView.stageLabel}
                  detail="Estado da reconciliação comercial."
                />
                <PortalMiniMetric
                  label="Exposição"
                  value={notionView.exposureLabel}
                  detail="Quão seguro está o recorte para leitura externa."
                />
                <PortalMiniMetric
                  label="Sync"
                  value={notionView.syncLabel}
                  detail="Última leitura útil desta camada."
                />
              </div>

              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                {notionView.metrics.slice(0, 4).map((metric) => (
                  <PortalMiniMetric
                    key={metric.id}
                    label={metric.label}
                    value={metric.value}
                    detail={metric.detail}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-3 xl:grid-cols-[1.05fr_0.95fr]">
                <PortalNarrativeCard
                  label="Etapa em foco"
                  title={notionView.stageDrilldown[0]?.label ?? "Etapa não mapeada"}
                  detail={
                    notionView.stageDrilldown[0]?.detail ??
                    "A leitura detalhada por etapa ainda não foi homologada neste recorte."
                  }
                />
                <PortalNarrativeCard
                  label="Próximo passo desta etapa"
                  title={notionView.stageDrilldown[0]?.priorityLabel ?? "Próximo passo pendente"}
                  detail={
                    notionView.stageDrilldown[0]?.nextStep ??
                    "Fechar telemetria viva antes de aprofundar a navegação nativa do pipeline."
                  }
                />
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Execução e acompanhamento
              </div>
              <div className="mt-1 text-base font-semibold text-display">{trelloView.headline}</div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                {trelloView.availabilityLabel}
              </p>

              <div className="mt-4 grid gap-3">
                {trelloView.columns[0]?.cards.slice(0, 2).map((card) => (
                  <PortalNarrativeCard
                    key={card.id}
                    label={card.segmentLabel}
                    title={card.title}
                    detail={card.detail}
                  />
                ))}
              </div>

              <div className="mt-4 grid gap-3">
                {trelloView.columns[2]?.cards.slice(0, 2).map((card) => (
                  <PortalNarrativeCard
                    key={card.id}
                    label={card.owner}
                    title={card.title}
                    detail={card.followUp}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function PortalKpi({
  label,
  value,
  detail,
  icon: Icon,
  tone = "info",
}: {
  label: string;
  value: string;
  detail: string;
  icon: typeof Users;
  tone?: "info" | "monitor" | "success";
}) {
  const toneClass =
    tone === "success"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      : tone === "monitor"
        ? "border-amber-500/20 bg-amber-500/5 text-amber-600"
        : "border-primary/20 bg-primary/5 text-primary";

  return (
    <div className="rounded-2xl border border-border bg-card px-4 py-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
          <div className="mt-1 text-2xl font-semibold text-display">{value}</div>
        </div>
        <div className={cn("rounded-xl border p-2.5", toneClass)}>
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2 text-[12px] text-muted-foreground">{detail}</p>
    </div>
  );
}

function PortalMiniMetric({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function PortalNarrativeCard({
  label,
  title,
  detail,
}: {
  label: string;
  title: string;
  detail: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card px-3 py-3">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{title}</div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function LiveActionCard({
  title,
  detail,
  href,
  external,
  buttonLabel = "Abrir link",
}: {
  title: string;
  detail: string;
  href?: string;
  external?: boolean;
  buttonLabel?: string;
}) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="text-sm font-medium text-foreground">{title}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
      {href ? (
        <Button variant="outline" size="sm" className="mt-3 h-8 w-full gap-2" asChild>
          <a
            href={href}
            target={external ? "_blank" : undefined}
            rel={external ? "noreferrer" : undefined}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            {buttonLabel}
          </a>
        </Button>
      ) : null}
    </div>
  );
}

function ActivationRow({
  title,
  detail,
  icon: Icon,
  multiline = false,
}: {
  title: string;
  detail: string;
  icon: typeof Users;
  multiline?: boolean;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start gap-3">
        <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
          <Icon className="h-4 w-4" />
        </div>
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{title}</div>
          <div className={cn("mt-1 text-sm text-foreground", multiline && "whitespace-pre-line")}>
            {detail}
          </div>
        </div>
      </div>
    </div>
  );
}

function LiveSourceCard({
  card,
}: {
  card: {
    id: "supabase" | "notion" | "trello" | "n8n" | "evolution" | "api4com";
    title: string;
    health: "healthy" | "monitor" | "risk" | "critical";
    mode: "live" | "operational" | "guarded" | "snapshot";
    headline: string;
    detail: string;
    lastSync: string;
    ctaLabel: string;
    ctaValue: string;
    facts: { label: string; value: string }[];
    nextStep: string;
    actionLabel?: string;
    actionHref?: string;
    actionExternal?: boolean;
    availabilityLabel?: string;
  };
}) {
  const meta = statusMeta[card.health];
  const Icon =
    card.id === "supabase"
      ? Database
      : card.id === "notion"
        ? NotebookPen
        : card.id === "n8n"
          ? ServerCog
          : card.id === "evolution"
            ? MessageCircle
            : card.id === "api4com"
              ? PhoneCall
              : GitBranch;

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <div className="rounded-xl border border-primary/20 bg-primary/5 p-2 text-primary">
              <Icon className="h-3.5 w-3.5" />
            </div>
            <div className="text-sm font-medium">{card.title}</div>
            <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em] h-5">
              {card.mode === "live"
                ? "live"
                : card.mode === "operational"
                  ? "operational"
                  : card.mode === "guarded"
                    ? "guarded"
                    : "snapshot"}
            </Badge>
          </div>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{card.headline}</p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-[1fr_auto]">
        <div className="rounded-xl border border-border bg-card px-3 py-3">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">Leitura</div>
          <div className="mt-1 text-[12px] leading-relaxed text-foreground">{card.detail}</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {card.facts.map((fact) => (
              <div key={`${card.id}-${fact.label}`} className="rounded-lg border border-border bg-surface px-2.5 py-2">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  {fact.label}
                </div>
                <div className="mt-1 text-[11px] leading-relaxed text-foreground">{fact.value}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-primary/15 bg-primary/5 px-3 py-3 min-w-[150px]">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{card.ctaLabel}</div>
          <div className="mt-1 text-sm font-medium text-foreground">{card.ctaValue}</div>
          <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{card.lastSync}</div>
          <div className="mt-3 rounded-lg border border-primary/10 bg-background/70 px-2.5 py-2">
            <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Próximo salto
            </div>
            <div className="mt-1 text-[11px] leading-relaxed text-foreground">{card.nextStep}</div>
          </div>
          {card.availabilityLabel ? (
            <div className="mt-2 text-[11px] leading-relaxed text-muted-foreground">
              {card.availabilityLabel}
            </div>
          ) : null}
        </div>
      </div>

      {card.actionHref && card.actionLabel ? (
        <Button variant="outline" size="sm" className="mt-4 h-8 w-full gap-2" asChild>
          <a
            href={card.actionHref}
            target={card.actionExternal ? "_blank" : undefined}
            rel={card.actionExternal ? "noreferrer" : undefined}
          >
            <ArrowRight className="h-3.5 w-3.5" />
            {card.actionLabel}
          </a>
        </Button>
      ) : null}
    </div>
  );
}
