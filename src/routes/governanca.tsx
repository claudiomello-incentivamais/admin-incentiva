import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  AlertOctagon,
  ArrowRight,
  Building2,
  CheckCircle2,
  Database,
  GitBranch,
  Layers3,
  Link2,
  LockKeyhole,
  NotebookPen,
  PhoneCall,
  RadioTower,
  Route as RouteIcon,
  ServerCog,
  ShieldAlert,
  Siren,
  Target,
  TimerReset,
  UserCog,
  Users,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import {
  formatPeriodLabel,
  useAdminFilters,
} from "@/components/admin/admin-filters";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { loadEvolutionTelemetryDashboardServerFn } from "@/lib/admin-evolution-rpc";
import type {
  EvolutionInstanceTelemetryRow,
  EvolutionOperationTelemetryRow,
  EvolutionTelemetryMetricCard,
} from "@/lib/admin-evolution-telemetry";
import { loadN8nTelemetryDashboardServerFn } from "@/lib/admin-n8n-rpc";
import type {
  N8nOperationTelemetryRow,
  N8nTelemetryMetricCard,
  N8nWorkflowTelemetryRow,
} from "@/lib/admin-n8n-telemetry";
import { cn } from "@/lib/utils";
import { statusMeta, type OperationStatus } from "@/lib/admin-data";

export const Route = createFileRoute("/governanca")({
  head: () => ({ meta: [{ title: "Governança — Console Incentiva" }] }),
  loader: async () => {
    const [telemetry, evolution] = await Promise.all([
      loadN8nTelemetryDashboardServerFn(),
      loadEvolutionTelemetryDashboardServerFn(),
    ]);
    return { telemetry, evolution };
  },
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
      value: "5",
      detail: "Base, n8n VPS, Evolution API, API4Com e publicação visual seguem como próximos donos claros.",
      tone: "info" as const,
      icon: Users,
    },
    {
      label: "Checkpoints críticos",
      value: "6",
      detail: "Dados, n8n, Evolution, API4Com, ownership e clareza de leitura são os checkpoints que mais importam agora.",
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
      title: "Runtime do WhatsApp",
      detail: "Deixar explícito o que é saúde de instância, webhook, fila e disponibilidade da Evolution API.",
      icon: RadioTower,
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
      id: "evolution-health",
      health: "monitor" as OperationStatus,
      lane: "Evolution API",
      title: "Saúde do WhatsApp ainda está implícita demais.",
      detail:
        "A operação já mostra efeito de WhatsApp no cockpit, mas a governança ainda não abre de forma explícita instância, webhook, fila e disponibilidade por operação.",
      action: "Subir Evolution como fonte técnica de primeira classe e cruzar health do canal com cadência e gargalo comercial.",
    },
    {
      id: "api4com-report",
      health: "monitor" as OperationStatus,
      lane: "API4Com",
      title: "O report diário das 17h dos SDRs ainda não virou camada nativa do admin.",
      detail:
        "O sinal de ligações, conexão, produtividade e reunião gerada existe, mas ainda aparece como report lateral e não como leitura governada por operação.",
      action: "Trazer API4Com para dentro do admin e cruzar voz SDR com estágio, atividade e conversão.",
    },
    {
      id: "publish-sync",
      health: "monitor" as OperationStatus,
      lane: "Experiência publicada",
      title: "Publicação externa já fechada; a frente agora pede paridade visual e clareza operacional.",
      detail:
        "O cutover externo já materializou `workers.dev` e `lovable.app`. O ponto pendente agora é reduzir ruído visual, separar o que é leitura viva do que é snapshot e preparar a navegação para operação e cliente.",
      action:
        "Fechar a rodada de UX responsiva, clarificar os estados do produto e continuar o hub de integrações para que a visão publicada fique confiável no uso diário.",
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
      status: "healthy" as OperationStatus,
      detail: "O corte novo já foi materializado externamente; agora o foco é manter paridade visual e semântica com o produto em evolução.",
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
  operatingSystem: [
    {
      title: "Admin",
      detail:
        "Camada-mãe de governança, diagnóstico, observabilidade e comando. Aqui fica a leitura consolidada que reduz report espalhado.",
      icon: Building2,
    },
    {
      title: "Notion",
      detail:
        "Camada operacional do SDR. Continua como frente de pipeline, motivos de perda, qualificação e rotina comercial alimentada pelo n8n.",
      icon: NotebookPen,
    },
    {
      title: "Trello",
      detail:
        "Camada de execução. Toda recomendação do admin que vira ação precisa aterrissar em card com dono, prazo e etapa visível.",
      icon: GitBranch,
    },
    {
      title: "Discord",
      detail:
        "Camada de acionamento e exceção. Serve para alertas relevantes, handoff e destrave, não para substituir o painel nem o Trello.",
      icon: RadioTower,
    },
  ],
  sourceOfTruth: [
    {
      title: "Supabase",
      detail:
        "Fonte principal de base, estágio canônico, locks, score, SLA e estrutura operacional replicável por operação.",
      icon: Database,
    },
    {
      title: "n8n VPS",
      detail:
        "Fonte principal de saúde dos workflows, waiting, erro, throughput, webhook e observabilidade técnica por automação.",
      icon: ServerCog,
    },
    {
      title: "Evolution API",
      detail:
        "Fonte principal de saúde do WhatsApp: instância, webhook, fila, disponibilidade e risco de canal por operação.",
      icon: RadioTower,
    },
    {
      title: "API4Com",
      detail:
        "Fonte principal do report de voz dos SDRs, com leitura diária de ligações, conexão e reunião originada.",
      icon: PhoneCall,
    },
    {
      title: "Notion",
      detail:
        "Fonte principal da operação SDR e da visão humana de pipeline por operação, sem carregar a governança técnica inteira.",
      icon: NotebookPen,
    },
    {
      title: "Trello",
      detail:
        "Fonte principal de status de execução, prioridade aplicada e follow-up das ações decididas no admin.",
      icon: Link2,
    },
  ],
  roles: [
    {
      title: "Direção",
      scope: "Claudio + Lucas",
      detail:
        "Visão total do sistema, carteira inteira, saúde de stack, custos, agentes, governança e leitura cross-operação.",
      icon: UserCog,
    },
    {
      title: "Sales Ops / SDR",
      scope: "Acesso por operação",
      detail:
        "Leitura restrita à operação atribuída, foco em pipeline, gargalo, próximos passos e execução associada.",
      icon: Users,
    },
    {
      title: "Cliente",
      scope: "Portal derivado",
      detail:
        "Vê apenas a própria operação, sem bastidor interno de stack, agentes, outras contas ou governança sensível.",
      icon: LockKeyhole,
    },
  ],
  actionEngine: [
    {
      title: "Detectar",
      detail: "O admin identifica desvio, risco, quebra, queda de cobertura ou pressão operacional relevante.",
      icon: Siren,
    },
    {
      title: "Diagnosticar",
      detail: "A camada de governança explica causa provável, impacto, dono sugerido e urgência real.",
      icon: Target,
    },
    {
      title: "Abrir ação",
      detail: "O problema vira plano de ação, card no Trello, mensagem no Discord ou acionamento direto do Claw.",
      icon: RouteIcon,
    },
    {
      title: "Validar fechamento",
      detail: "Nada encerra sem evidência: card atualizado, workflow corrigido, dado reprocessado ou risco normalizado.",
      icon: TimerReset,
    },
  ],
  roadmap: [
    {
      title: "Até 03 jul",
      status: "healthy" as OperationStatus,
      detail:
        "Fechar a arquitetura do sistema, consolidar a lógica Admin x Notion x Trello x Discord e deixar a navegação do admin materialmente mais utilizável.",
    },
    {
      title: "Até 10 jul",
      status: "monitor" as OperationStatus,
      detail:
        "Subir uma V1 interna forte com diagnóstico, ação e começo da observabilidade central de n8n VPS, Evolution API, API4Com, agentes e alertas.",
    },
    {
      title: "13 a 24 jul",
      status: "monitor" as OperationStatus,
      detail:
        "Entrar em perfis, privacidade, portal por operação/cliente e gatilho real para avaliar a migração de Pro para Business.",
    },
  ],
};

function GovernancePage() {
  const { telemetry, evolution } = Route.useLoaderData();
  const { selectedOperationId, selectedOperation, selectedPeriod } = useAdminFilters();
  const healthMeta = statusMeta[governance.health];
  const isSingleOperationView = selectedOperationId !== "all";
  const operationSignal = selectedOperation?.label ?? "";
  const scopedTelemetryOperations = isSingleOperationView
    ? telemetry.operations.filter((row) => row.operationId === selectedOperationId)
    : telemetry.operations;
  const scopedTelemetryWorkflows = isSingleOperationView
    ? telemetry.workflows.filter((row) => row.operationId === selectedOperationId)
    : telemetry.workflows;
  const scopedTelemetryMetrics = buildScopedTelemetryMetrics(
    telemetry.metrics,
    scopedTelemetryOperations,
    scopedTelemetryWorkflows,
  );
  const telemetryAttention = scopedTelemetryWorkflows
    .filter((row) => row.errorToday > 0 || row.waitingToday > 0 || row.error7d > 0)
    .slice(0, 12);
  const scopedEvolutionOperations = isSingleOperationView
    ? evolution.operations.filter((row) => row.operationId === selectedOperationId)
    : evolution.operations;
  const scopedEvolutionInstances = isSingleOperationView
    ? evolution.instances.filter((row) => row.operationId === selectedOperationId)
    : evolution.instances;
  const scopedEvolutionMetrics = buildScopedEvolutionMetrics(
    evolution.metrics,
    scopedEvolutionOperations,
    scopedEvolutionInstances,
  );
  const evolutionAttention = scopedEvolutionInstances
    .filter((row) => row.severity === "critical" || row.severity === "attention")
    .slice(0, 12);
  const filteredIssues = isSingleOperationView
    ? governance.issues.filter(
        (issue) =>
          issue.lane === operationSignal ||
          issue.title.includes(operationSignal) ||
          issue.detail.includes(operationSignal),
      )
    : governance.issues;
  const filteredConnections = isSingleOperationView
    ? governance.connections.filter((connection) =>
        ["Admin Global", "Operações", "Clientes"].includes(connection.title),
      )
    : governance.connections;

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Governança"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Governança operacional
              </Badge>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                Drilldown interno
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
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.18em] h-5">
                {formatPeriodLabel(selectedPeriod)}
              </Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Governança
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              {isSingleOperationView
                ? `Aqui a governança foi recortada para ${operationSignal}, sem misturar fila de outras operações quando existir sinal específico desta conta.`
                : "Aqui o console separa leitura comercial de integridade operacional: dado, n8n, ownership, rollout e checkpoint de execução."}{" "}
              Esta camada fica como apoio técnico interno, não como navegação principal do produto.
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
            <Link to="/integracoes">
              <ArrowRight className="h-3.5 w-3.5" />
              Próximo passo: Integrações
            </Link>
          </Button>
        </section>

        <section className="surface-card p-5">
          <div>
            <h2 className="text-sm font-semibold text-display">O que esta frente cobre</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              {isSingleOperationView
                ? "Esta é a camada que responde se a operação filtrada está confiável o bastante para a leitura de negócio fazer sentido."
                : "Esta é a camada que responde se o sistema está confiável o bastante para a leitura de negócio fazer sentido."}
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

        <section className="surface-card p-5">
          <div>
            <h2 className="text-sm font-semibold text-display">Sistema operacional da gestão</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Este é o desenho-base aprovado para centralizar a gestão sem canibalizar o que já
              funciona bem hoje.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {governance.operatingSystem.map((item) => (
              <div key={item.title} className="rounded-xl border border-border bg-surface p-4">
                <div className="flex items-center gap-2 text-sm font-medium">
                  <item.icon className="h-4 w-4 text-primary" />
                  {item.title}
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{item.detail}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div>
              <h2 className="text-sm font-semibold text-display">Fonte de verdade por camada</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                O melhor processo aqui não depende de ferramenta nova, e sim de cada camada ter
                dono e função claros.
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {governance.sourceOfTruth.map((item) => (
                <div key={item.title} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <item.icon className="h-4 w-4 text-primary" />
                    {item.title}
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {item.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div>
              <h2 className="text-sm font-semibold text-display">Perfis e exposição</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                A estrutura já nasce pensando em visão total interna e portal derivado por operação.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {governance.roles.map((role) => (
                <div key={role.title} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 text-sm font-medium">
                      <role.icon className="h-4 w-4 text-primary" />
                      {role.title}
                    </div>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase tracking-[0.14em] border-primary/30 text-primary"
                    >
                      {role.scope}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {role.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-6">
          {governance.metrics.map((metric) => (
            <GovernanceMetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="surface-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Telemetria viva do n8n VPS</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {telemetry.source === "live"
                  ? "Esta leitura já nasce do n8n materializado no Supabase e respeita o escopo da sessão atual."
                  : "A camada de telemetria ainda está em fallback. Assim que a sincronização rodar, esta seção passa a mostrar erro, waiting e throughput por operação e workflow."}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-[0.18em] h-5",
                telemetry.source === "live"
                  ? "border-emerald-500/30 text-emerald-600"
                  : "border-[color:var(--color-warning)]/30 text-[color:var(--color-warning)]",
              )}
            >
              {telemetry.snapshotLabel}
            </Badge>
          </div>

          {telemetry.source === "live" ? (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
                {scopedTelemetryMetrics.map((metric) => (
                  <TelemetryMetricCard key={metric.id} metric={metric} />
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium">Recorte por operação</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Hoje, ontem e 7 dias para separar incidente real de ruído herdado.
                      </p>
                    </div>
                    <ServerCog className="h-4 w-4 text-primary" />
                  </div>

                  <div className="mt-4 space-y-3">
                    {scopedTelemetryOperations.map((row) => (
                      <TelemetryOperationCard key={row.operationId} row={row} />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium">Workflows com atenção</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Priorização automática por erro hoje, erro em 7 dias e waiting no dia.
                      </p>
                    </div>
                    <Workflow className="h-4 w-4 text-primary" />
                  </div>

                  <div className="mt-4 space-y-3">
                    {telemetryAttention.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border bg-background px-4 py-4 text-[12px] leading-relaxed text-muted-foreground">
                        Nenhum workflow deste recorte abriu erro ou waiting relevante na janela atual.
                      </div>
                    ) : null}
                    {telemetryAttention.map((row) => (
                      <TelemetryWorkflowCard key={row.workflowId} row={row} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-surface px-4 py-4 text-[12px] leading-relaxed text-muted-foreground">
              A telemetria já está preparada para subir nesta tela, mas ainda precisa da materialização
              periódica no `Supabase` para virar leitura viva publicada.
            </div>
          )}
        </section>

        <section className="surface-card p-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Evolution API viva</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {evolution.source === "live"
                  ? "Esta camada já cruza instância, comportamento de disparo e risco fino do WhatsApp dentro do escopo da sessão."
                  : "A camada da Evolution ainda está em fallback. Assim que a sincronização rodar, esta seção passa a mostrar saúde real de instância e comportamento do número."}
              </p>
            </div>
            <Badge
              variant="outline"
              className={cn(
                "text-[10px] uppercase tracking-[0.18em] h-5",
                evolution.source === "live"
                  ? "border-emerald-500/30 text-emerald-600"
                  : "border-[color:var(--color-warning)]/30 text-[color:var(--color-warning)]",
              )}
            >
              {evolution.snapshotLabel}
            </Badge>
          </div>

          {evolution.source === "live" ? (
            <>
              <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                {scopedEvolutionMetrics.map((metric) => (
                  <TelemetryMetricCard key={metric.id} metric={metric} />
                ))}
              </div>

              <div className="mt-4 grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-4">
                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium">Saúde por operação</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Instâncias, envios, resposta, entrega e risco por operação.
                      </p>
                    </div>
                    <RadioTower className="h-4 w-4 text-primary" />
                  </div>

                  <div className="mt-4 space-y-3">
                    {scopedEvolutionOperations.map((row) => (
                      <EvolutionOperationCard key={row.operationId} row={row} />
                    ))}
                  </div>
                </div>

                <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <h3 className="text-sm font-medium">Instâncias com atenção</h3>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Foco em instância crítica, atenção e risco fino de disparo.
                      </p>
                    </div>
                    <PhoneCall className="h-4 w-4 text-primary" />
                  </div>

                  <div className="mt-4 space-y-3">
                    {evolutionAttention.length === 0 ? (
                      <div className="rounded-xl border border-dashed border-border bg-background px-4 py-4 text-[12px] leading-relaxed text-muted-foreground">
                        Nenhuma instância deste recorte abriu risco técnico ou comportamental relevante na janela atual.
                      </div>
                    ) : null}
                    {evolutionAttention.map((row) => (
                      <EvolutionInstanceCard key={`${row.operationId}-${row.instanceName}`} row={row} />
                    ))}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="mt-4 rounded-xl border border-dashed border-border bg-surface px-4 py-4 text-[12px] leading-relaxed text-muted-foreground">
              A telemetria da Evolution já está preparada para subir nesta tela, mas ainda precisa da materialização
              periódica no `Supabase` para virar leitura viva publicada.
            </div>
          )}
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1.05fr_0.95fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Fila de governança</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isSingleOperationView
                    ? "Onde a governança ainda precisa intervir nesta operação com dono e próximo passo claros."
                    : "Onde a governança ainda precisa intervir com dono e próximo passo claros."}
                </p>
              </div>
              <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {filteredIssues.length === 0 ? (
                <div className="rounded-xl border border-dashed border-border bg-surface px-4 py-4 text-[12px] leading-relaxed text-muted-foreground">
                  Este recorte não tem issue própria publicada nesta camada. A fila global foi ocultada
                  para evitar vazamento de outra operação.
                </div>
              ) : null}
              {filteredIssues.map((issue) => (
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
            {filteredConnections.map((connection) => (
              <div key={connection.title} className="rounded-xl border border-border bg-surface p-4">
                <div className="text-sm font-medium">{connection.title}</div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {connection.detail}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div>
              <h2 className="text-sm font-semibold text-display">Motor de ação</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                O admin só vira software de gestão quando sai de leitura e fecha o ciclo até a
                ação validada.
              </p>
            </div>

            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {governance.actionEngine.map((step) => (
                <div key={step.title} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-center gap-2 text-sm font-medium">
                    <step.icon className="h-4 w-4 text-primary" />
                    {step.title}
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                    {step.detail}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div>
              <h2 className="text-sm font-semibold text-display">Roadmap materializado</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Ordem de execução para não gastar plano, tempo nem energia com sofisticação antes
                da hora.
              </p>
            </div>

            <div className="mt-4 space-y-3">
              {governance.roadmap.map((checkpoint) => (
                <CheckpointCard key={checkpoint.title} checkpoint={checkpoint} />
              ))}
            </div>
          </div>
        </section>
      </main>
    </>
  );
}

function buildScopedTelemetryMetrics(
  fallbackMetrics: N8nTelemetryMetricCard[],
  operations: N8nOperationTelemetryRow[],
  workflows: N8nWorkflowTelemetryRow[],
) {
  if (!operations.length || !workflows.length) {
    return fallbackMetrics;
  }

  const execToday = operations.reduce((sum, row) => sum + row.execToday, 0);
  const successToday = operations.reduce((sum, row) => sum + row.successToday, 0);
  const errorToday = operations.reduce((sum, row) => sum + row.errorToday, 0);
  const waitingToday = operations.reduce((sum, row) => sum + row.waitingToday, 0);
  const exec7d = operations.reduce((sum, row) => sum + row.exec7d, 0);
  const success7d = operations.reduce((sum, row) => sum + row.success7d, 0);
  const activeWorkflows = workflows.filter((row) => row.active).length;

  return [
    {
      id: "scoped-ops",
      label: "Operações neste recorte",
      value: String(operations.length),
      detail: "Apenas operações liberadas para esta sessão e filtro atual.",
      tone: "healthy" as const,
    },
    {
      id: "scoped-exec-today",
      label: "Execuções hoje",
      value: formatInteger(execToday),
      detail: `${formatRate(successToday, execToday)} de sucesso nas execuções do dia.`,
      tone: errorToday > 0 ? "monitor" as const : "healthy" as const,
    },
    {
      id: "scoped-errors",
      label: "Erro hoje",
      value: formatInteger(errorToday),
      detail: waitingToday > 0 ? `${formatInteger(waitingToday)} workflow(s) em waiting hoje.` : "Sem waiting relevante hoje.",
      tone: errorToday >= 10 ? "critical" as const : errorToday > 0 ? "risk" as const : "healthy" as const,
    },
    {
      id: "scoped-success-7d",
      label: "Sucesso 7 dias",
      value: formatRate(success7d, exec7d),
      detail: `${formatInteger(exec7d)} execuções nos últimos 7 dias.`,
      tone: success7d < exec7d * 0.9 ? "monitor" as const : "healthy" as const,
    },
    {
      id: "scoped-active",
      label: "Workflows ativos",
      value: formatInteger(activeWorkflows),
      detail: `${formatInteger(workflows.filter((row) => row.errorToday > 0 || row.error7d > 0 || row.waitingToday > 0).length)} workflow(s) em atenção.`,
      tone: workflows.some((row) => row.errorToday > 0 || row.waitingToday > 0) ? "monitor" as const : "healthy" as const,
    },
  ];
}

function buildScopedEvolutionMetrics(
  fallbackMetrics: EvolutionTelemetryMetricCard[],
  operations: EvolutionOperationTelemetryRow[],
  instances: EvolutionInstanceTelemetryRow[],
) {
  if (!operations.length || !instances.length) {
    return fallbackMetrics;
  }

  const outbound24h = operations.reduce((sum, row) => sum + row.outbound24h, 0);
  const replies24h = operations.reduce((sum, row) => sum + row.replies24h, 0);
  const delivered24h = operations.reduce((sum, row) => sum + row.delivered24h, 0);
  const errors24h = operations.reduce((sum, row) => sum + row.errors24h, 0);
  const stalled24h = operations.reduce((sum, row) => sum + row.stalled24h, 0);
  const attentionInstances = instances.filter((row) => row.severity === "attention").length;
  const criticalInstances = instances.filter((row) => row.severity === "critical").length;

  return [
    {
      id: "evolution-scoped-ops",
      label: "Operações com WhatsApp",
      value: String(operations.length),
      detail: `${formatInteger(instances.length)} instância(s) governadas neste recorte.`,
      tone: "healthy" as const,
    },
    {
      id: "evolution-scoped-critical",
      label: "Instâncias críticas",
      value: formatInteger(criticalInstances),
      detail: `${formatInteger(attentionInstances)} em atenção além das críticas.`,
      tone: criticalInstances > 0 ? "critical" as const : attentionInstances > 0 ? "monitor" as const : "healthy" as const,
    },
    {
      id: "evolution-scoped-outbound",
      label: "Envios 24h",
      value: formatInteger(outbound24h),
      detail: `Reply rate em ${formatRate(replies24h, outbound24h)} neste recorte.`,
      tone: outbound24h >= 50 && replies24h === 0 ? "risk" as const : "healthy" as const,
    },
    {
      id: "evolution-scoped-delivery",
      label: "Entrega 24h",
      value: formatRate(delivered24h, outbound24h),
      detail: `${formatInteger(errors24h)} erro(s) e ${formatInteger(stalled24h)} envio(s) travado(s).`,
      tone: errors24h > 0 || stalled24h > 0 ? "risk" as const : "healthy" as const,
    },
  ];
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

function formatInteger(value: number) {
  return new Intl.NumberFormat("pt-BR").format(value);
}

function formatRate(success: number, total: number) {
  if (total <= 0) return "0%";
  return `${((success / total) * 100).toLocaleString("pt-BR", {
    maximumFractionDigits: success / total >= 0.1 ? 0 : 1,
  })}%`;
}

function formatDateTime(value: string | null) {
  if (!value) return "n/d";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "n/d";
  return date.toLocaleString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function operationHealth(row: N8nOperationTelemetryRow): OperationStatus {
  if (row.errorToday >= 10) return "critical";
  if (row.waitingToday > 0) return "risk";
  if (row.errorToday >= 3) return "risk";
  if (row.errorToday > 0) {
    return row.successToday > row.errorToday ? "monitor" : "risk";
  }
  if (row.error7d > 0 || row.waiting7d > 0) return "monitor";
  return "healthy";
}

function workflowHealth(row: N8nWorkflowTelemetryRow): OperationStatus {
  if (row.errorToday >= 3) return "critical";
  if (row.waitingToday > 0) return "risk";
  if (row.errorToday >= 2) return "risk";
  if (row.errorToday > 0) {
    return row.successToday > row.errorToday ? "monitor" : "risk";
  }
  if (row.error7d > 0 || row.waiting7d > 0) return "monitor";
  return "healthy";
}

function describeWorkflowAttention(row: N8nWorkflowTelemetryRow) {
  if (row.waitingToday > 0) {
    return `${formatInteger(row.waitingToday)} waiting hoje. Isso já pede olhar operacional porque pode virar fila travada.`;
  }

  if (row.errorToday > 0 && row.successToday > row.errorToday) {
    return `Incidente isolado hoje: ${formatInteger(row.errorToday)} erro em ${formatInteger(row.execToday)} execuções, com o restante seguindo saudável.`;
  }

  if (row.errorToday > 0) {
    return `Erro ativo hoje em ${formatInteger(row.errorToday)} execução(ões) dentro deste workflow.`;
  }

  if (row.error7d > 0) {
    return `Sem erro novo hoje, mas ainda houve ${formatInteger(row.error7d)} erro(s) nos últimos 7 dias.`;
  }

  return "Sem atenção técnica relevante na janela atual.";
}

function TelemetryMetricCard({ metric }: { metric: N8nTelemetryMetricCard }) {
  const toneMap = {
    healthy: "border-emerald-500/20 bg-emerald-500/5",
    monitor: "border-[color:var(--color-info)]/20 bg-[color:var(--color-info)]/5",
    risk: "border-[color:var(--color-warning)]/20 bg-[color:var(--color-warning)]/5",
    critical: "border-destructive/20 bg-destructive/5",
  } as const;

  return (
    <div className={cn("rounded-2xl border px-4 py-4", toneMap[metric.tone])}>
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
        {metric.label}
      </div>
      <div className="mt-2 text-[28px] leading-none font-semibold text-display tracking-tight">
        {metric.value}
      </div>
      <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{metric.detail}</p>
    </div>
  );
}

function TelemetryOperationCard({ row }: { row: N8nOperationTelemetryRow }) {
  const meta = statusMeta[operationHealth(row)];

  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{row.operationName}</div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {formatInteger(row.activeWorkflowCount)} ativos de {formatInteger(row.workflowCount)} workflow(s).
          </p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <MiniTelemetryPill label="Hoje" value={formatInteger(row.execToday)} />
        <MiniTelemetryPill label="Erro hoje" value={formatInteger(row.errorToday)} />
        <MiniTelemetryPill label="Waiting hoje" value={formatInteger(row.waitingToday)} />
        <MiniTelemetryPill label="Última corrida" value={formatDateTime(row.lastRunAt)} />
      </div>
    </div>
  );
}

function TelemetryWorkflowCard({ row }: { row: N8nWorkflowTelemetryRow }) {
  const meta = statusMeta[workflowHealth(row)];

  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {row.operationName} · {row.workflowFamily}
          </div>
          <h3 className="mt-1 text-sm font-medium">{row.workflowName}</h3>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <MiniTelemetryPill label="Exec. hoje" value={formatInteger(row.execToday)} />
        <MiniTelemetryPill label="Erro hoje" value={formatInteger(row.errorToday)} />
        <MiniTelemetryPill label="Erro 7 dias" value={formatInteger(row.error7d)} />
        <MiniTelemetryPill label="Waiting hoje" value={formatInteger(row.waitingToday)} />
      </div>

      <div className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Leitura:</span> {describeWorkflowAttention(row)}
        {" · "}
        <span className="font-medium text-foreground">Última corrida:</span> {formatDateTime(row.lastRunAt)}
        {row.lastErrorMessage ? (
          <>
            {" · "}
            <span className="font-medium text-foreground">Último erro:</span> {row.lastErrorMessage}
          </>
        ) : null}
      </div>
    </div>
  );
}

function EvolutionOperationCard({ row }: { row: EvolutionOperationTelemetryRow }) {
  const severity: OperationStatus =
    row.criticalInstances > 0 ? "critical" : row.attentionInstances > 0 ? "risk" : "healthy";
  const meta = statusMeta[severity];

  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{row.operationName}</div>
          <p className="mt-1 text-[11px] text-muted-foreground">
            {formatInteger(row.instanceCount)} instância(s) | {formatInteger(row.healthyInstances)} saudável(is).
          </p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <MiniTelemetryPill label="Envios 24h" value={formatInteger(row.outbound24h)} />
        <MiniTelemetryPill label="Replies 24h" value={formatInteger(row.replies24h)} />
        <MiniTelemetryPill label="Erros 24h" value={formatInteger(row.errors24h)} />
        <MiniTelemetryPill label="Travados" value={formatInteger(row.stalled24h)} />
      </div>
    </div>
  );
}

function EvolutionInstanceCard({ row }: { row: EvolutionInstanceTelemetryRow }) {
  const meta = statusMeta[
    row.severity === "critical" ? "critical" : row.severity === "attention" ? "risk" : "healthy"
  ];

  return (
    <div className="rounded-xl border border-border bg-background px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {row.operationName} · {row.instanceRole}
          </div>
          <h3 className="mt-1 text-sm font-medium">{row.instanceName}</h3>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-4">
        <MiniTelemetryPill label="Envios 24h" value={formatInteger(row.outbound24h)} />
        <MiniTelemetryPill label="Replies 24h" value={formatInteger(row.replyContacts24h)} />
        <MiniTelemetryPill label="Entregues" value={formatInteger(row.delivered24h)} />
        <MiniTelemetryPill label="Erros 24h" value={formatInteger(row.errors24h)} />
      </div>

      <div className="mt-3 text-[12px] leading-relaxed text-muted-foreground">
        <span className="font-medium text-foreground">Leitura:</span> {row.reason}
        {row.disconnectCode ? (
          <>
            {" · "}
            <span className="font-medium text-foreground">Último disconnect:</span> {row.disconnectCode}
          </>
        ) : null}
      </div>
    </div>
  );
}

function MiniTelemetryPill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium">{value}</div>
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
