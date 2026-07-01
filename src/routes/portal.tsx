import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  ArrowRight,
  Building2,
  Database,
  Eye,
  GitBranch,
  LockKeyhole,
  MessageCircle,
  NotebookPen,
  PhoneCall,
  ServerCog,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import { z } from "zod";

import { Topbar } from "@/components/admin/Topbar";
import { useAdminAuth } from "@/components/admin/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPeriodLabel, useAdminFilters } from "@/components/admin/admin-filters";
import {
  buildOperationActionPlan,
  buildOperationCadenceView,
  buildOperationCockpitFromOperation,
  buildOperationNotionView,
  buildOperationRuntimeView,
  buildOperationTrelloView,
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
  const { session } = useAdminAuth();
  const { selectedOperationId, selectedPeriod } = useAdminFilters();
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
  const runtimeView = buildOperationRuntimeView(
    scopedPortalOperation,
    cockpit,
    dashboard.source,
  );
  const openNotionAction = notionView.actions.find((action) => action.id === "open-notion");
  const openBoardAction = trelloView.actions.find((action) => action.id === "open-board");
  const allowedRoutes = new Set(session?.allowedRoutes ?? ["/portal"]);
  const canAccessSettings = allowedRoutes.has("/configuracoes");
  const canAccessAdminViews = allowedRoutes.has("/clientes") || allowedRoutes.has("/");

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Portal"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {formatPeriodLabel(selectedPeriod)}
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                Atualizado em {dashboard.snapshotLabel}
              </span>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Portal de Operação
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Visão central da operação com foco em base, cobertura, conversão, ações executáveis
              e saúde técnica das integrações.
            </p>
          </div>

          {(canAccessSettings || canAccessAdminViews) && (
            <div className="flex items-center gap-2 flex-wrap">
              {canAccessSettings && (
                <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
                  <Link to="/configuracoes">
                    <LockKeyhole className="h-3.5 w-3.5" />
                    Ajustar regras de acesso
                  </Link>
                </Button>
              )}
              {canAccessAdminViews && (
                <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
                  <Link to={allowedRoutes.has("/clientes") ? "/clientes" : "/"}>
                    <ArrowRight className="h-3.5 w-3.5" />
                    Voltar ao admin
                  </Link>
                </Button>
              )}
            </div>
          )}
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
                    statusMeta[portalOperation.health].color,
                  )}
                >
                  {statusMeta[portalOperation.health].label}
                </Badge>
              </div>
              <h2 className="text-xl font-semibold text-display">{portalOperation.name}</h2>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Cockpit resumido da operação selecionada, com leitura de base, links de trabalho,
                priorização e runtime técnico no mesmo lugar.
              </p>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <PortalKpi
              label="Base monitorada"
              value={formatNumber(cockpit.summary.supabaseRecords)}
              detail="Registros desta operação no recorte selecionado."
              icon={Users}
              tone="info"
            />
            <PortalKpi
              label="Cobertura"
              value={`${formatPercent(scopedPortalOperation.baseCoverage)}%`}
              detail="Percentual atual de base ainda disponível para sustentar a cadência."
              icon={Target}
              tone="monitor"
            />
            <PortalKpi
              label="Conversão mensal"
              value={`${formatPercent(scopedPortalOperation.monthlyConversion)}%`}
              detail="Conversão mensal da operação."
              icon={TrendingUp}
              tone="success"
            />
            <PortalKpi
              label="Reconciliação"
              value={`${formatPercent(scopedPortalOperation.dataReconciliation)}%`}
              detail="Coerência atual entre as camadas operacionais da conta."
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
              <div className="text-[10px] uppercase tracking-[0.18em] text-primary">Prioridade agora</div>
              <div className="mt-1 text-base font-semibold text-display">
                {actionPlan.actions[0]}
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                Foco atual em {scopedPortalOperation.focus.toLowerCase()}, com leitura consolidada
                de cobertura, conversão e reconciliação.
              </p>
            </div>

            <div className="mt-3 grid gap-3 md:grid-cols-3">
              <PortalNarrativeCard
                label="Foco principal"
                title={scopedPortalOperation.focus}
                detail="Tema que mais influencia a priorização atual desta conta."
              />
              <PortalNarrativeCard
                label="Cobertura atual"
                title={`${formatPercent(scopedPortalOperation.baseCoverage)}%`}
                detail="Mostra se ainda existe base suficiente para sustentar a cadência sem reposição imediata."
              />
              <PortalNarrativeCard
                label="Conversão mensal"
                title={`${formatPercent(scopedPortalOperation.monthlyConversion)}%`}
                detail="Leitura consolidada da conversão da operação no recorte mensal atual."
              />
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
                  detail="Entrada direta no quadro da operação para execução, follow-up e priorização."
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
                  detail="Entrada direta na base comercial da operação para owner, estágio e próximos passos."
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
              <PortalMiniMetric
                label="Quadro Trello"
                value={trelloView.boardLabel}
                detail={trelloView.syncLabel}
              />
              <PortalMiniMetric
                label="Cards reais abertos"
                value={trelloView.metrics[0]?.value ?? "0"}
                detail="Cards do Trello já materializados para esta operação."
              />
              <PortalMiniMetric
                label="Pipeline comercial"
                value={notionView.stageLabel}
                detail="Situação atual da leitura comercial no Notion."
              />
              <PortalMiniMetric
                label="Última leitura útil"
                value={notionView.syncLabel}
                detail="Carimbo mais útil da leitura comercial desta operação."
              />
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

            <div className="grid gap-3">
              <PortalNarrativeCard
                label="Cobertura"
                title={`${formatPercent(scopedPortalOperation.baseCoverage)}%`}
                detail="Quando esse número cai, a cadência perde fôlego e reposição de base vira prioridade."
              />
              <PortalNarrativeCard
                label="Reconciliação"
                title={`${formatPercent(scopedPortalOperation.dataReconciliation)}%`}
                detail="Mostra o quanto as camadas operacionais estão coerentes para leitura e decisão."
              />
              <PortalNarrativeCard
                label="Conversão mensal"
                title={`${formatPercent(scopedPortalOperation.monthlyConversion)}%`}
                detail="Indica a capacidade atual da operação de transformar movimento comercial em avanço real."
              />
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
              <div className="text-sm font-medium text-display">
                Base e movimento comercial do recorte
              </div>
              <p className="mt-1 text-[12px] leading-relaxed text-muted-foreground">
                Leitura da base disponível, do volume movimentado e da distribuição atual do funil
                comercial da operação.
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
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">Leitura rápida</div>
              <div className="mt-1 text-base font-semibold text-display">Interpretação do recorte</div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                Aqui fica só a leitura mais útil do recorte atual, sem janela sintética e sem
                extrapolação artificial.
              </p>

              <div className="mt-4 grid gap-3">
                <PortalNarrativeCard
                  label="Não iniciados"
                  title={cadenceView.metrics[0]?.value ?? "0"}
                  detail={cadenceView.metrics[0]?.detail ?? "Base disponível para abastecer a cadência."}
                />
                <PortalNarrativeCard
                  label="Ativos no recorte"
                  title={cadenceView.metrics[1]?.value ?? "0"}
                  detail={cadenceView.metrics[1]?.detail ?? "Registros que efetivamente se moveram no recorte."}
                />
                <PortalNarrativeCard
                  label="Cobertura em dias"
                  title={cadenceView.metrics[2]?.value ?? "0"}
                  detail={cadenceView.metrics[2]?.detail ?? "Dias estimados de sustentação antes de faltar base nova."}
                />
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-sm font-semibold text-display">Saúde técnica da operação</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Supabase, Notion, n8n VPS, Evolution API e API4Com em uma leitura única da conta.
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-[0.16em] h-5",
                statusMeta[portalOperation.health].color,
              )}
            >
              {statusMeta[portalOperation.health].label}
            </Badge>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            {runtimeView.cards.map((card) => (
              <LiveSourceCard
                key={card.id}
                card={{
                  id: card.id,
                  title: card.title,
                  health: card.health,
                  mode:
                    card.modeLabel === "Leitura viva"
                      ? "live"
                      : card.id === "n8n" || card.id === "evolution" || card.id === "api4com"
                        ? "operational"
                        : card.modeLabel === "Leitura governada"
                          ? "guarded"
                          : "snapshot",
                  headline: card.headline,
                  detail: card.detail,
                  lastSync: card.lastSync,
                  ctaLabel: "Modo",
                  ctaValue: card.modeLabel,
                  facts: card.facts,
                  nextStep: card.nextStep,
                  availabilityLabel: card.sourceOfTruth,
                }}
              />
            ))}
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
