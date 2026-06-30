import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Building2,
  Eye,
  GlobeLock,
  LockKeyhole,
  MessageSquareShare,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  formatVisibilityModeLabel,
  useAdminFilters,
} from "@/components/admin/admin-filters";
import {
  buildOperationActionPlan,
  buildOperationCockpitFromOperation,
  getScoreDrivers,
  loadGlobalDashboard,
  statusMeta,
} from "@/lib/admin-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/portal")({
  head: () => ({ meta: [{ title: "Portal — Console Incentiva" }] }),
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
  const {
    selectedOperationId,
    selectedOperation,
    selectedAccessProfile,
    selectedVisibilityMode,
  } = useAdminFilters();

  const portalOperation =
    (selectedOperationId === "all"
      ? dashboard.operations.find((operation) => operation.health === "healthy") ??
        dashboard.operations.find((operation) => operation.health === "monitor") ??
        dashboard.operations[0]
      : dashboard.operations.find((operation) => operation.id === selectedOperationId)) ?? null;

  if (!portalOperation) {
    return (
      <>
        <Topbar breadcrumb={["Console Incentiva", "Portal"]} />
        <main className="flex-1 px-6 py-6 max-w-[1600px] w-full mx-auto">
          <div className="surface-card p-6 text-sm text-muted-foreground">
            Nenhuma operação disponível para montar a visão de portal.
          </div>
        </main>
      </>
    );
  }

  const cockpit = buildOperationCockpitFromOperation(portalOperation);
  const actionPlan = buildOperationActionPlan(portalOperation);
  const drivers = getScoreDrivers(portalOperation).slice(0, 3);
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

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
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
                  : "Preview interno do portal, ainda preservando mais contexto operacional para calibrar a publicação."}
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
              value={`${formatPercent(portalOperation.baseCoverage)}%`}
              detail="Cobertura de base atual."
              icon={Target}
              tone="monitor"
            />
            <PortalKpi
              label="Conversão"
              value={`${formatPercent(portalOperation.monthlyConversion)}%`}
              detail="Conversão mensal da operação."
              icon={TrendingUp}
              tone="success"
            />
            <PortalKpi
              label="Score operacional"
              value={String(portalOperation.score)}
              detail={`Prioridade ${portalOperation.priority}`}
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
                detail={selectedOperation?.client ?? portalOperation.client}
                icon={Building2}
              />
              <ActivationRow
                title="Visão liberada"
                detail={formatVisibilityModeLabel(selectedVisibilityMode)}
                icon={Eye}
              />
              <ActivationRow
                title="Owner sugerido"
                detail={portalOperation.owner}
                icon={ShieldCheck}
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
