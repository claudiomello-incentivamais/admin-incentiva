import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Eye,
  GlobeLock,
  GitBranch,
  LockKeyhole,
  MessageSquareShare,
  NotebookPen,
  RadioTower,
  ShieldCheck,
  Sparkles,
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
  buildOperationCockpitFromOperation,
  buildOperationNotionView,
  buildPortalLiveSourceCards,
  buildPortalPublishPacket,
  getScoreDrivers,
  loadGlobalDashboard,
  statusMeta,
} from "@/lib/admin-data";
import { applyPeriodToCockpit, applyPeriodToOperation } from "@/lib/admin-period";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "Portal — Console Incentiva" }] }),
  validateSearch: z.object({
    operationId: z.string().optional(),
  }),
  loader: async () => loadGlobalDashboard(),
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
  const actionPlan = buildOperationActionPlan(scopedPortalOperation);
  const publishPacket = buildPortalPublishPacket(scopedPortalOperation);
  const liveSourceCards = buildPortalLiveSourceCards(scopedPortalOperation, dashboard.source);
  const notionView = buildOperationNotionView(scopedPortalOperation, cockpit, dashboard.source);
  const drivers = getScoreDrivers(scopedPortalOperation).slice(0, 3);
  const exposedModules =
    selectedVisibilityMode === "client"
      ? [
          "Resumo executivo da operação",
          "Cobertura de base e conversão",
          "Saúde geral da operação",
          "Próximo marco acordado",
        ]
      : [
          "Resumo executivo da operação",
          "Cobertura e conversão",
          "Saúde por canal",
          "Drivers do score",
          "Próxima alavanca sugerida",
        ];
  const protectedModules =
    selectedVisibilityMode === "client"
      ? [
          "Fila executiva completa da carteira",
          "Alertas internos e incidentes do cockpit",
          "Runbooks, owner interno e action packets",
          "Comparativo com outras operações",
        ]
      : [
          "Credenciais, logs técnicos e governança sensível",
          "Publish / access management",
          "Diagnóstico estrutural cross-operação",
        ];

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
              Esta camada transforma o admin em experiência governada por audiência, separando o
              que pode sair para leitura privada do que continua restrito ao cockpit interno.
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
                  ? "Recorte pronto para leitura privada, com foco em saúde geral, cobertura e próximo marco acordado."
                  : "Preview interno do portal, ainda preservando mais contexto operacional para calibrar a publicação."}{" "}
                O período ativo também já recorta este preview.
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
                <h2 className="text-sm font-semibold text-display">O que esta audiência pode ver</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Corte de conteúdo liberado para o recorte atual do portal.
                </p>
              </div>
              <Eye className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {exposedModules.map((item) => (
                <VisibilityCard key={item} title={item} tone="healthy" />
              ))}
              {protectedModules.map((item) => (
                <VisibilityCard key={item} title={item} tone="risk" />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Próximo marco da conta</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O portal não precisa mostrar tudo. Ele precisa deixar claro o que vem agora.
                </p>
              </div>
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Próxima alavanca sugerida
              </div>
              <div className="mt-1 text-base font-semibold text-display">
                {actionPlan.actions[0]}
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                {actionPlan.headline}
              </p>
            </div>

            <div className="mt-3 space-y-3">
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
                <h2 className="text-sm font-semibold text-display">Contrato de confiança do portal</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que sustenta a leitura privada sem virar ruído ou exposição indevida.
                </p>
              </div>
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              <PortalPrinciple
                title="Fonte principal clara"
                detail="Cobertura, score e governança seguem ancorados em Supabase e cockpit operacional."
              />
              <PortalPrinciple
                title="Corte por audiência"
                detail="A visão cliente não mostra fila interna, governança sensível ou comparativo entre contas."
              />
              <PortalPrinciple
                title="Marco acordado visível"
                detail="Toda visão externa precisa sair com próximo passo inteligível, não só com diagnóstico."
              />
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Pacote de ativação privada</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Itens mínimos para esta operação entrar em uso real como portal externo governado.
                </p>
              </div>
              <GlobeLock className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              <ActivationRow
                title="Conta alvo"
                detail={publishPacket.clientLabel}
                icon={Building2}
              />
              <ActivationRow
                title="Visão liberada"
                detail={publishPacket.visibility}
                icon={Eye}
              />
              <ActivationRow
                title="Autenticação"
                detail={publishPacket.authLayer}
                icon={LockKeyhole}
              />
              <ActivationRow
                title="Owner sugerido"
                detail={publishPacket.owner}
                icon={ShieldCheck}
              />
              <ActivationRow
                title="Rota alvo"
                detail={publishPacket.privatePath}
                icon={GlobeLock}
              />
              <ActivationRow
                title="Corte externo final"
                detail={publishPacket.externalCutover}
                icon={RadioTower}
              />
              <ActivationRow
                title="Mensagem base"
                detail={actionPlan.discordMessage}
                icon={MessageSquareShare}
                multiline
              />
            </div>
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[0.9fr_1.1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Pacote de publish por conta</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Artefato objetivo para sair de preview interno e abrir portal privado desta conta.
                </p>
              </div>
              <RadioTower className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
              <div className="flex items-center gap-2 flex-wrap">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-[10px] uppercase tracking-[0.16em] h-5",
                    statusMeta[publishPacket.publishHealth].color,
                  )}
                >
                  {publishPacket.publishStage}
                </Badge>
                <Badge variant="secondary" className="text-[10px] uppercase tracking-[0.16em] h-5">
                  slug {publishPacket.privateSlug}
                </Badge>
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.18em] text-primary">
                    Prontidão do corte externo
                  </div>
                  <div className="mt-1 text-2xl font-semibold text-display">
                    {publishPacket.finalCutoverReadinessPct}%
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                    Etapa final
                  </div>
                  <div className="mt-1 text-sm font-medium text-display">
                    {publishPacket.finalCutoverStage}
                  </div>
                </div>
              </div>
              <div className="mt-3 h-2 rounded-full bg-primary/10 overflow-hidden">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${publishPacket.finalCutoverReadinessPct}%` }}
                />
              </div>
              <div className="mt-2 text-base font-semibold text-display">
                {publishPacket.headline}
              </div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                Audiência: {publishPacket.audience}
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {publishPacket.checkpoints.map((checkpoint) => (
                <PublishCheckpointCard key={checkpoint.id} checkpoint={checkpoint} />
              ))}
            </div>

            <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Blockers do fechamento externo
              </div>
              <div className="mt-3 space-y-2">
                {publishPacket.cutoverBlockers.map((blocker) => (
                  <div
                    key={blocker}
                    className="rounded-xl border border-border/80 bg-background/70 px-3 py-2 text-sm text-foreground"
                  >
                    {blocker}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Recorte privado desta operação</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que sai junto quando esta conta virar portal ativo governado.
                </p>
              </div>
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              <VisibilityCard title="Resumo executivo da conta" tone="healthy" />
              <VisibilityCard title="Cobertura, score e conversão da própria operação" tone="healthy" />
              <VisibilityCard title="Próximo marco e mensagem base acordada" tone="healthy" />
              <VisibilityCard title="Leitura externa sem fila interna cross-operação" tone="healthy" />
              <VisibilityCard title="Governança sensível, backlog interno e comparativos" tone="risk" />
              <VisibilityCard title="Execução crua de Trello / Discord / workflow técnico" tone="risk" />
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Fontes vivas no recorte publicado</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                O portal passa a mostrar o que já entrou com sinal real da operação e o que ainda
                depende de maior amarração.
              </p>
            </div>
            <GlobeLock className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {liveSourceCards.map((card) => (
              <LiveSourceCard key={card.id} card={card} />
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4 gap-3">
            <div>
              <h2 className="text-sm font-semibold text-display">Visão nativa do Notion</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Primeira camada de gestão centralizada do pipeline comercial desta conta, sem
                depender só de link externo.
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
            </div>

            <div className="rounded-2xl border border-border bg-surface p-4">
              <div className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Próximo passo desta conta
              </div>
              <div className="mt-1 text-base font-semibold text-display">{notionView.nextStep}</div>
              <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                {notionView.availabilityLabel}
              </p>

              <div className="mt-4 space-y-3">
                {notionView.actions.slice(0, 3).map((action) => (
                  <div key={action.id} className="rounded-xl border border-border bg-card p-4">
                    <div className="text-sm font-medium text-foreground">{action.title}</div>
                    <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                      {action.detail}
                    </p>
                  </div>
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

function VisibilityCard({ title, tone }: { title: string; tone: "healthy" | "risk" }) {
  return (
    <div
      className={cn(
        "rounded-xl border p-4 text-[12px] leading-relaxed",
        tone === "healthy"
          ? "border-emerald-500/20 bg-emerald-500/5 text-foreground"
          : "border-rose-500/20 bg-rose-500/5 text-muted-foreground",
      )}
    >
      {title}
    </div>
  );
}

function PortalPrinciple({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-sm font-medium">{title}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
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

function PublishCheckpointCard({
  checkpoint,
}: {
  checkpoint: {
    title: string;
    status: "ready" | "monitor" | "blocked";
    detail: string;
  };
}) {
  const toneClass =
    checkpoint.status === "ready"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      : checkpoint.status === "blocked"
        ? "border-rose-500/20 bg-rose-500/5 text-rose-600"
        : "border-amber-500/20 bg-amber-500/5 text-amber-600";

  const label =
    checkpoint.status === "ready"
      ? "Pronto"
      : checkpoint.status === "blocked"
        ? "Bloqueado"
        : "Monitorar";

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium">{checkpoint.title}</div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", toneClass)}>
          {label}
        </Badge>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{checkpoint.detail}</p>
    </div>
  );
}

function LiveSourceCard({
  card,
}: {
  card: {
    id: "notion" | "trello";
    title: string;
    health: "healthy" | "monitor" | "risk" | "critical";
    mode: "live" | "operational";
    headline: string;
    detail: string;
    lastSync: string;
    ctaLabel: string;
    ctaValue: string;
    facts: { label: string; value: string }[];
    nextStep: string;
  };
}) {
  const meta = statusMeta[card.health];
  const Icon = card.id === "notion" ? NotebookPen : GitBranch;

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
              {card.mode === "live" ? "live" : "operational"}
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
        </div>
      </div>
    </div>
  );
}
