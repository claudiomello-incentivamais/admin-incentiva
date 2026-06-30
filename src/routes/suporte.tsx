import { createFileRoute } from "@tanstack/react-router";
import {
  Activity,
  AlertTriangle,
  ArrowRight,
  BookOpenCheck,
  CheckCircle2,
  ChevronRight,
  ClipboardList,
  Database,
  LifeBuoy,
  RadioTower,
  Send,
  ServerCog,
  ShieldAlert,
  Siren,
  SquareChartGantt,
  Wrench,
  Bot,
  Gauge,
  Mail,
  MessageCircleMore,
  Orbit,
  TimerReset,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { ActionPacketCard } from "@/components/admin/action-packet-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  loadIncentivaCockpit,
  statusMeta,
  type IncentivaCockpitData,
  type OperationStatus,
} from "@/lib/admin-data";

export const Route = createFileRoute("/suporte")({
  loader: async () => loadIncentivaCockpit(),
  head: () => ({ meta: [{ title: "Suporte — Console Incentiva" }] }),
  component: SupportPage,
});

type SupportSeverity = OperationStatus | "info";

function getSeverityMeta(severity: SupportSeverity) {
  if (severity === "info") {
    return {
      label: "Info",
      color: "text-[color:var(--color-info)]",
      bg: "bg-[color:var(--color-info)]",
      ring: "ring-[color:var(--color-info)]/30",
    };
  }

  return statusMeta[severity];
}

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
      detail: "Hoje o foco principal ficou em resíduo técnico de retry histórico e na observabilidade ainda rasa por família de workflow.",
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
      title: "Publicação externa já validada; agora o ponto é manter paridade visual e semântica",
      health: "monitor" as OperationStatus,
      summary:
        "O corte já foi materializado externamente. O risco residual agora é publicar novas rodadas sem limpar a diferença entre leitura viva, snapshot e narrativa antiga dentro do produto.",
      action:
        "Usar esta frente para detectar drift entre o que está no repositório, o que está publicado e o que ainda precisa de clareza visual para virar software confortável no dia a dia.",
      status: "Publicado e em consolidação",
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
      title: "Validação rápida de paridade publicada",
      steps: [
        "Abrir a URL publicada e comparar a navegação com o corte local mais recente.",
        "Validar `/configuracoes`, `/portal`, `/integracoes` e a shell logada em pelo menos uma viewport menor.",
        "Se a URL ainda servir texto antigo ou layout quebrado, tratar como drift de publicação ou pendência de UX, não como quebra de deploy.",
        "Registrar o desvio no admin e no Trello com dono e evidência visual.",
        "Só chamar a etapa de estável quando a leitura ficar clara para operação interna e apresentação externa.",
      ],
    },
    {
      title: "Publish com drift",
      steps: [
        "Validar se o build local passou no repositório.",
        "Comparar a URL publicada com o corte atual do produto em uma tela crítica.",
        "Se o deploy já tiver acontecido, tratar o desvio como paridade semântica ou asset antigo antes de chamar incidente de infraestrutura.",
        "Atualizar a narrativa do produto para separar `live`, `guarded` e `snapshot` quando a ambiguidade for a causa da confusão.",
        "Enquanto isso, continuar fechando telas no código e mantendo a régua de paridade no produto.",
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
  observability: [
    {
      id: "n8n",
      title: "n8n VPS",
      health: "monitor" as OperationStatus,
      headline: "Workflows produtivos estáveis, mas falta drill-down mais fino por família.",
      detail:
        "Hoje já conseguimos separar produção real de retry histórico, mas a próxima evolução útil é expor waiting, erro e throughput por conjunto de workflow.",
      owner: "Claw/main",
      icon: Workflow,
    },
    {
      id: "vps",
      title: "VPS",
      health: "healthy" as OperationStatus,
      headline: "Infra principal sem sinal atual de colapso operacional.",
      detail:
        "A necessidade aqui não é reescrever infraestrutura, e sim trazer leitura consolidada de saúde, consumo e incidentes para dentro do admin.",
      owner: "Claw/main",
      icon: ServerCog,
    },
    {
      id: "agents",
      title: "Agentes e modelos",
      health: "monitor" as OperationStatus,
      headline: "A governança já existe, mas ainda não está visível em tela única.",
      detail:
        "Falta expor sessão, cobertura, modelo configurado, fallback e frente descoberta para reduzir dependência de reporte manual.",
      owner: "Claw/main",
      icon: Bot,
    },
    {
      id: "publish",
      title: "Publish / Lovable",
      health: "monitor" as OperationStatus,
      headline: "Publicação externa validada; foco agora é paridade de UX, copy e fontes expostas.",
      detail:
        "O risco atual não está em colocar a URL no ar, e sim em deixar a camada publicada coerente com a evolução rápida do console e das integrações.",
      owner: "Claudio + Claw",
      icon: RadioTower,
    },
  ],
  alertQueue: [
    {
      id: "publish-lock",
      severity: "monitor" as OperationStatus,
      title: "URL publicada precisa acompanhar a evolução semântica e visual do produto",
      trigger: "Nova rodada de UX, responsividade ou integração muda a leitura do console",
      owner: "Claw/main",
      nextStep: "Validar a paridade da URL publicada após cada rodada relevante e eliminar textos antigos ou estados ambíguos do console.",
    },
    {
      id: "email-drilldown",
      severity: "risk" as OperationStatus,
      title: "Família de e-mail pede observabilidade granular",
      trigger: "Waiting e throughput ainda agregados demais",
      owner: "Claw/main",
      nextStep: "Quebrar a leitura por família e workflow para separar gargalo técnico de pressão comercial.",
    },
    {
      id: "agents-visibility",
      severity: "monitor" as OperationStatus,
      title: "Status de agentes e modelos ainda depende de contexto externo",
      trigger: "Sem painel único para sessão, fallback e cobertura",
      owner: "Claw/main",
      nextStep: "Subir camada inicial de observabilidade de agentes dentro do admin interno.",
    },
  ],
  actionCenter: [
    {
      title: "Ação recomendada no Trello",
      detail:
        "Criar ou atualizar card sempre que um alerta sair de leitura e entrar em intervenção com dono, prazo e evidência esperada.",
      output: "Card de execução com dono e etapa visível",
      icon: SquareChartGantt,
    },
    {
      title: "Ação recomendada no Discord",
      detail:
        "Disparar só quando houver blocker real, incidente relevante, desvio crítico ou necessidade objetiva de handoff.",
      output: "Mensagem de acionamento por exceção",
      icon: Send,
    },
    {
      title: "Ação recomendada no admin",
      detail:
        "Registrar o status como detectado, em análise, em execução, aguardando ou resolvido para fechar o ciclo de governança.",
      output: "Fila visível de ação e fechamento",
      icon: ClipboardList,
    },
  ],
};

function SupportPage() {
  const cockpit = Route.useLoaderData();
  const topAlert = cockpit.alerts[0];
  const topWorkflow = cockpit.topWorkflows[0];
  const supportKpis = [
    {
      label: "Canais observados",
      value: String(cockpit.channels.length),
      detail: "A leitura já separa os canais críticos com headline, saúde e densidade operacional.",
      tone: "info" as const,
      icon: Orbit,
    },
    {
      label: "Famílias mapeadas",
      value: String(cockpit.workflowFamilies.length),
      detail: "A telemetria já consegue diferenciar os principais blocos de workflow da operação.",
      tone: "success" as const,
      icon: Workflow,
    },
    {
      label: "Workflows ativos",
      value: `${cockpit.summary.activeWorkflows}/${cockpit.summary.totalWorkflows}`,
      detail: "A camada profunda já mostra o quanto da malha operacional está realmente em campo.",
      tone: "monitor" as const,
      icon: Gauge,
    },
    {
      label: "Alertas vivos",
      value: String(cockpit.alerts.length),
      detail: "O suporte já enxerga alertas que saem de saúde genérica e entram em workflow intelligence.",
      tone: "risk" as const,
      icon: Siren,
    },
  ];
  const practicalPackets = [
    {
      channel: "discord" as const,
      title: "Acionamento de incidente / exceção",
      detail: "Mensagem pronta para abrir o tema no Discord com sintoma, risco e próximo passo.",
      content:
        `Suporte ${cockpit.operationName}: alerta ${topAlert.title}. ` +
        `${topAlert.detail} Próximo foco técnico: ${topWorkflow.name} (${topWorkflow.waiting7d} waiting / ${topWorkflow.error7d} errors).`,
      owner: "Claw/main",
    },
    {
      channel: "trello" as const,
      title: "Card técnico de intervenção",
      detail: "Pacote mínimo para transformar gargalo técnico em execução visível.",
      content:
        `${cockpit.operationName} · intervenção técnica em ${topWorkflow.family}\n\n` +
        `Workflow foco: ${topWorkflow.name}\n` +
        `Execuções 7d: ${topWorkflow.executions7d}\n` +
        `Waiting 7d: ${topWorkflow.waiting7d}\n` +
        `Error 7d: ${topWorkflow.error7d}\n` +
        `Alerta associado: ${topAlert.title}`,
      owner: "Claw/main",
    },
    {
      channel: "admin" as const,
      title: "Registro executivo do suporte",
      detail: "Resumo pronto para registrar status, dono e critério de saída no admin.",
      content:
        `Operação: ${cockpit.operationName}\n` +
        `Canal foco: ${cockpit.channels[0]?.label ?? "n/a"}\n` +
        `Alerta principal: ${topAlert.title}\n` +
        `Workflow foco: ${topWorkflow.name}\n` +
        `Critério de saída: reduzir waiting/erro e confirmar corrida útil`,
      owner: "Claw/main",
    },
  ];

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Suporte"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Workflow intelligence
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {cockpit.snapshotLabel}
              </span>
              <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-5">
                {cockpit.operationName} · operação referência
              </Badge>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Suporte
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Esta frente deixou de ser só triagem de incidente e agora começa a consolidar
              observabilidade profunda por canal, família e workflow, usando a Incentiva como
              primeira operação-referência.
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
          {supportKpis.map((metric) => (
            <MetricCard key={metric.label} metric={metric} />
          ))}
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Saúde da stack</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Primeira camada de observabilidade do software: o que já está estável, o que ainda
                pede drill-down e onde existe dependência externa.
              </p>
            </div>
            <Activity className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {support.observability.map((item) => (
              <ObservabilityCard key={item.id} item={item} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Saúde por canal</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Primeira camada profunda do bloco 3: leitura separada por canal operacional.
                </p>
              </div>
              <MessageCircleMore className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {cockpit.channels.map((channel) => (
                <ChannelCard key={channel.id} channel={channel} />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Famílias de workflow</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O cockpit já distingue quais blocos estão estáveis, pressionados ou virando foco.
                </p>
              </div>
              <SquareChartGantt className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {cockpit.workflowFamilies.map((family) => (
                <WorkflowFamilyCard key={family.id} family={family} />
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Workflows em foco</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Agora já existe camada concreta para throughput, waiting, erro e última corrida por workflow.
              </p>
            </div>
            <TimerReset className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {cockpit.topWorkflows.map((workflow) => (
              <WorkflowFocusCard key={workflow.name} workflow={workflow} />
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <ChannelHealthSection
            title="Saúde de e-mail"
            subtitle="Leitura de fila, throughput útil e gargalo dominante da família."
            icon={Mail}
            metrics={cockpit.emailHealth.metrics}
            tracks={cockpit.emailHealth.tracks}
          />
          <ChannelHealthSection
            title="Saúde de WhatsApp"
            subtitle="Separação entre outbound, leads e reativação com leitura prática de uso."
            icon={MessageCircleMore}
            metrics={cockpit.whatsappHealth.metrics}
            tracks={cockpit.whatsappHealth.tracks}
          />
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Workflow intelligence</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  A camada que separa infraestrutura viva de gargalo comercial silencioso.
                </p>
              </div>
              <Bot className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="grid gap-3 md:grid-cols-2">
              {cockpit.workflowIntelligence.metrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>

            <div className="mt-4 space-y-3">
              {cockpit.workflowIntelligence.insights.map((insight) => (
                <WorkflowInsightCard key={insight.id} insight={insight} />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Alertas vivos do cockpit</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que já está saindo da observabilidade e entrando em decisão operacional.
                </p>
              </div>
              <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {cockpit.alerts.map((alert) => (
                <CockpitAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Camada de ação prática</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                O suporte agora também entrega o pacote pronto para virar execução, acionamento e registro.
              </p>
            </div>
            <Send className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 xl:grid-cols-3">
            {practicalPackets.map((packet) => (
              <ActionPacketCard key={packet.channel} {...packet} />
            ))}
          </div>
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

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Fila de alertas acionáveis</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que já deveria gerar acompanhamento operacional, sem depender de memória ou
                  reporte solto.
                </p>
              </div>
              <ShieldAlert className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {support.alertQueue.map((alert) => (
                <ActionAlertCard key={alert.id} alert={alert} />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Central de ação</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  A camada que amarra leitura, decisão e execução até fechar o ciclo de governança.
                </p>
              </div>
              <Siren className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {support.actionCenter.map((item) => (
                <ActionCenterCard key={item.title} item={item} />
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
    tone: "success" | "info" | "monitor" | "risk" | "healthy" | "critical";
    icon?: React.ComponentType<{ className?: string }>;
  };
}) {
  const Icon = metric.icon;

  return (
    <div className="surface-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{metric.label}</div>
        {Icon ? (
          <div className={cn("rounded-lg p-2", toneIconClass[metric.tone])}>
            <Icon className="h-3.5 w-3.5" />
          </div>
        ) : null}
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

function ObservabilityCard({
  item,
}: {
  item: {
    title: string;
    headline: string;
    detail: string;
    owner: string;
    health: OperationStatus;
    icon: React.ComponentType<{ className?: string }>;
  };
}) {
  const meta = statusMeta[item.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {item.title}
          </div>
          <h3 className="mt-1 text-sm font-medium">{item.headline}</h3>
        </div>
        <item.icon className="h-4 w-4 text-primary shrink-0" />
      </div>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
        <Badge variant="secondary" className="text-[10px] text-mono h-5">
          {item.owner}
        </Badge>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{item.detail}</p>
    </div>
  );
}

function ActionAlertCard({
  alert,
}: {
  alert: {
    title: string;
    trigger: string;
    owner: string;
    nextStep: string;
    severity: OperationStatus;
  };
}) {
  const meta = statusMeta[alert.severity];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{alert.title}</h3>
          <div className="text-[11px] text-muted-foreground mt-1">Trigger: {alert.trigger}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Dono sugerido: {alert.owner}
      </div>
      <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[12px] text-muted-foreground">
        Próximo passo: {alert.nextStep}
      </div>
    </div>
  );
}

function ActionCenterCard({
  item,
}: {
  item: {
    title: string;
    detail: string;
    output: string;
    icon: React.ComponentType<{ className?: string }>;
  };
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <item.icon className="h-4 w-4 text-primary" />
        {item.title}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{item.detail}</p>
      <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
        Saída esperada: {item.output}
      </div>
    </div>
  );
}

function ChannelCard({
  channel,
}: {
  channel: IncentivaCockpitData["channels"][number];
}) {
  const meta = statusMeta[channel.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{channel.label}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {channel.activeWorkflows}/{channel.totalWorkflows} workflows ativos
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <p className="mt-3 text-[12px] font-medium leading-relaxed">{channel.headline}</p>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{channel.detail}</p>
    </div>
  );
}

function WorkflowFamilyCard({
  family,
}: {
  family: IncentivaCockpitData["workflowFamilies"][number];
}) {
  const meta = statusMeta[family.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{family.label}</div>
          <div className="text-[11px] text-muted-foreground mt-0.5">
            {family.active}/{family.total} ativos
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

function WorkflowFocusCard({
  workflow,
}: {
  workflow: IncentivaCockpitData["topWorkflows"][number];
}) {
  const health =
    workflow.waiting7d > 0 ? "risk" : workflow.error7d > 0 ? "monitor" : "healthy";
  const meta = statusMeta[health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {workflow.family}
          </div>
          <div className="mt-1 text-[12px] font-medium leading-snug">{workflow.name}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
        <div className="rounded-lg bg-muted/40 px-2.5 py-2">
          <div className="text-muted-foreground">Execuções 7d</div>
          <div className="mt-1 font-semibold text-display">{workflow.executions7d}</div>
        </div>
        <div className="rounded-lg bg-muted/40 px-2.5 py-2">
          <div className="text-muted-foreground">Success 7d</div>
          <div className="mt-1 font-semibold text-display">{workflow.success7d}</div>
        </div>
        <div className="rounded-lg bg-muted/40 px-2.5 py-2">
          <div className="text-muted-foreground">Error 7d</div>
          <div className="mt-1 font-semibold text-display">{workflow.error7d}</div>
        </div>
        <div className="rounded-lg bg-muted/40 px-2.5 py-2">
          <div className="text-muted-foreground">Waiting 7d</div>
          <div className="mt-1 font-semibold text-display">{workflow.waiting7d}</div>
        </div>
      </div>
      <div className="mt-3 text-[11px] text-muted-foreground">
        Última corrida: {workflow.lastRun}
      </div>
    </div>
  );
}

function ChannelHealthSection({
  title,
  subtitle,
  icon: Icon,
  metrics,
  tracks,
}: {
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  metrics: Array<{
    id: string;
    label: string;
    value: string;
    tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
    detail: string;
  }>;
  tracks: Array<{
    id: string;
    label: string;
    health: OperationStatus;
    headline: string;
    detail: string;
    recommendation?: string;
    workflows?: string;
  }>;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-semibold text-display">{title}</h2>
          <p className="text-[11px] text-muted-foreground mt-0.5">{subtitle}</p>
        </div>
        <Icon className="h-3.5 w-3.5 text-primary" />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {metrics.map((metric) => (
          <MetricCard key={metric.id} metric={metric} />
        ))}
      </div>

      <div className="mt-4 space-y-3">
        {tracks.map((track) => (
          <ChannelTrackCard key={track.id} track={track} />
        ))}
      </div>
    </div>
  );
}

function ChannelTrackCard({
  track,
}: {
  track: {
    label: string;
    health: OperationStatus;
    headline: string;
    detail: string;
    recommendation?: string;
    workflows?: string;
  };
}) {
  const meta = statusMeta[track.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium">{track.label}</div>
          <div className="text-[12px] mt-1 leading-relaxed">{track.headline}</div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{track.detail}</p>
      {track.workflows ? (
        <div className="mt-3 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
          Workflows: {track.workflows}
        </div>
      ) : null}
      {track.recommendation ? (
        <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[12px] text-muted-foreground">
          Próximo passo: {track.recommendation}
        </div>
      ) : null}
    </div>
  );
}

function WorkflowInsightCard({
  insight,
}: {
  insight: IncentivaCockpitData["workflowIntelligence"]["insights"][number];
}) {
  const meta = statusMeta[insight.health];

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
            {insight.label}
          </div>
          <h3 className="mt-1 text-sm font-medium">{insight.headline}</h3>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>

      <p className="mt-3 text-[12px] leading-relaxed text-muted-foreground">{insight.detail}</p>
      <div className="mt-3 rounded-lg bg-muted/40 px-3 py-2 text-[12px] text-muted-foreground">
        Próximo passo: {insight.recommendation}
      </div>
    </div>
  );
}

function CockpitAlertCard({
  alert,
}: {
  alert: IncentivaCockpitData["alerts"][number];
}) {
  const meta = getSeverityMeta(alert.severity);

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-medium">{alert.title}</h3>
          <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{alert.detail}</p>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.14em]", meta.color)}>
          {meta.label}
        </Badge>
      </div>
    </div>
  );
}

const toneIconClass = {
  success: "bg-emerald-500/12 text-emerald-700",
  info: "bg-sky-500/12 text-sky-700",
  monitor: "bg-blue-500/12 text-blue-700",
  risk: "bg-rose-500/12 text-rose-700",
  healthy: "bg-emerald-500/12 text-emerald-700",
  critical: "bg-red-500/12 text-red-700",
};
