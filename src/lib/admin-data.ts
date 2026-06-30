// Mock data layer grounded in the current governance snapshot.
// Replace these functions with real API calls later — component layer should not change.

export type OperationStatus = "healthy" | "monitor" | "risk" | "critical";
export type Priority = "P0" | "P1" | "P2" | "P3";

export interface Operation {
  id: string;
  name: string;
  client: string;
  priority: Priority;
  focus: string;
  score: number; // 0-100, lower means worse
  baseCoverage: number; // 0-100 %
  dataReconciliation: number; // 0-100 %
  monthlyConversion: number; // 0-100 %
  health: OperationStatus;
  owner: string;
}

export interface GlobalKpis {
  monitored: number;
  atRisk: number;
  critical: number;
  baseCoverage: number; // %
  totalLeads: number;
  monthlyConversions: number;
  conversionDelta: number; // % vs prev period
  leadsDelta: number;
  coverageDelta: number;
  riskDelta: number;
}

export interface ExecutiveInsight {
  id: string;
  severity: "critical" | "risk" | "monitor" | "info";
  title: string;
  detail: string;
  operationId?: string;
  timestamp: string;
}

export interface IncentivaCockpitSummary {
  health: OperationStatus;
  focus: string;
  priorityScore: number;
  stageAlignmentPct: number;
  matchRatePct: number;
  avgLeadScore: number;
  supabaseRecords: number;
  notionRecords: number;
  activeWorkflows: number;
  totalWorkflows: number;
  success7d: number;
  error7d: number;
  waiting7d: number;
}

export interface IncentivaFunnelStage {
  id: string;
  label: string;
  count: number;
  touchedThisMonth?: number;
}

export interface IncentivaBaseMetric {
  id: string;
  label: string;
  value: number;
  unit?: string;
  tone?: "default" | "success" | "warning" | "destructive" | "info";
  detail: string;
}

export interface IncentivaChannelStatus {
  id: string;
  label: string;
  health: OperationStatus;
  activeWorkflows: number;
  totalWorkflows: number;
  headline: string;
  detail: string;
}

export interface IncentivaWorkflowFamily {
  id: string;
  label: string;
  total: number;
  active: number;
  health: OperationStatus;
  summary: string;
}

export interface IncentivaWorkflowRun {
  name: string;
  family: string;
  active: boolean;
  executions7d: number;
  success7d: number;
  error7d: number;
  waiting7d: number;
  lastRun: string;
}

export interface IncentivaWhatsappHealthMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaWhatsappHealthTrack {
  id: string;
  label: string;
  health: OperationStatus;
  headline: string;
  detail: string;
  workflows: string;
}

export interface IncentivaEmailHealthMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaEmailHealthTrack {
  id: string;
  label: string;
  health: OperationStatus;
  headline: string;
  detail: string;
  recommendation: string;
}

export interface IncentivaWorkflowInsightMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaWorkflowInsight {
  id: string;
  familyId: string;
  label: string;
  health: OperationStatus;
  headline: string;
  detail: string;
  recommendation: string;
}

export interface IncentivaProspectingMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaProspectingLane {
  id: string;
  label: string;
  health: OperationStatus;
  headline: string;
  detail: string;
  recommendation: string;
}

export interface IncentivaExecutionBacklogMetric {
  id: string;
  label: string;
  value: string;
  tone?: "healthy" | "monitor" | "risk" | "critical" | "success" | "info";
  detail: string;
}

export interface IncentivaExecutionBacklogItem {
  id: string;
  lane: string;
  priority: "P0" | "P1" | "P2";
  health: OperationStatus;
  owner: string;
  headline: string;
  detail: string;
  nextStep: string;
}

export interface IncentivaCockpitAlert {
  id: string;
  severity: "critical" | "risk" | "monitor" | "info";
  title: string;
  detail: string;
}

export interface IncentivaCockpitData {
  operationName: string;
  snapshotLabel: string;
  source: "snapshot" | "live";
  summary: IncentivaCockpitSummary;
  funnel: IncentivaFunnelStage[];
  baseMetrics: IncentivaBaseMetric[];
  prospectingReadiness: {
    metrics: IncentivaProspectingMetric[];
    lanes: IncentivaProspectingLane[];
  };
  executionBacklog: {
    metrics: IncentivaExecutionBacklogMetric[];
    items: IncentivaExecutionBacklogItem[];
  };
  emailHealth: {
    metrics: IncentivaEmailHealthMetric[];
    tracks: IncentivaEmailHealthTrack[];
  };
  whatsappHealth: {
    metrics: IncentivaWhatsappHealthMetric[];
    tracks: IncentivaWhatsappHealthTrack[];
  };
  workflowIntelligence: {
    metrics: IncentivaWorkflowInsightMetric[];
    insights: IncentivaWorkflowInsight[];
  };
  channels: IncentivaChannelStatus[];
  workflowFamilies: IncentivaWorkflowFamily[];
  topWorkflows: IncentivaWorkflowRun[];
  alerts: IncentivaCockpitAlert[];
}

export interface GlobalDashboardData {
  source: "snapshot" | "live";
  snapshotLabel: string;
  kpis: GlobalKpis;
  operations: Operation[];
  distribution: Record<OperationStatus, number>;
  insights: ExecutiveInsight[];
}

const operations: Operation[] = [
  {
    id: "cafe-fazenda-brasil",
    name: "Café Fazenda Brasil",
    client: "Café Fazenda Brasil",
    priority: "P0",
    focus: "Reposição de base",
    score: 34,
    baseCoverage: 41,
    dataReconciliation: 62,
    monthlyConversion: 6.2,
    health: "critical",
    owner: "Sales Ops",
  },
  {
    id: "acelerato",
    name: "Acelerato",
    client: "Acelerato",
    priority: "P0",
    focus: "Reposição de base",
    score: 46,
    baseCoverage: 49,
    dataReconciliation: 98.2,
    monthlyConversion: 8.4,
    health: "risk",
    owner: "Sales Ops",
  },
  {
    id: "incentiva",
    name: "Incentiva",
    client: "Incentiva Mais",
    priority: "P0",
    focus: "Reposição de base",
    score: 49,
    baseCoverage: 52,
    dataReconciliation: 95.7,
    monthlyConversion: 9.8,
    health: "risk",
    owner: "Sales Ops",
  },
  {
    id: "nimbus",
    name: "Nimbus",
    client: "Nimbus",
    priority: "P0",
    focus: "Reposição de base",
    score: 51,
    baseCoverage: 54,
    dataReconciliation: 96.2,
    monthlyConversion: 8.7,
    health: "risk",
    owner: "Sales Ops",
  },
  {
    id: "prime-action",
    name: "Prime Action",
    client: "Prime Action",
    priority: "P1",
    focus: "Ajuste de funil",
    score: 57,
    baseCoverage: 63,
    dataReconciliation: 89.4,
    monthlyConversion: 10.9,
    health: "risk",
    owner: "Sales Ops",
  },
  {
    id: "plan-idiomas",
    name: "Plan Idiomas",
    client: "Plan Idiomas",
    priority: "P1",
    focus: "Normalização comercial",
    score: 61,
    baseCoverage: 68,
    dataReconciliation: 89.2,
    monthlyConversion: 11.4,
    health: "monitor",
    owner: "Sales Ops",
  },
  {
    id: "trial-ambiental",
    name: "Trial Ambiental",
    client: "Trial Ambiental",
    priority: "P1",
    focus: "Confiabilidade de dados",
    score: 64,
    baseCoverage: 71,
    dataReconciliation: 85.5,
    monthlyConversion: 10.2,
    health: "monitor",
    owner: "Sales Ops",
  },
  {
    id: "docseg",
    name: "DocSeg",
    client: "DocSeg",
    priority: "P2",
    focus: "Monitoramento",
    score: 69,
    baseCoverage: 77,
    dataReconciliation: 96.0,
    monthlyConversion: 12.8,
    health: "monitor",
    owner: "Sales Ops",
  },
  {
    id: "lima-duarte",
    name: "Lima Duarte Alimentos",
    client: "Lima Duarte Alimentos",
    priority: "P2",
    focus: "Cadência multicanal",
    score: 74,
    baseCoverage: 81,
    dataReconciliation: 90.0,
    monthlyConversion: 13.6,
    health: "healthy",
    owner: "Sales Ops",
  },
  {
    id: "iamit",
    name: "Iamit",
    client: "Iamit",
    priority: "P2",
    focus: "Reconciliação semântica",
    score: 78,
    baseCoverage: 85,
    dataReconciliation: 75.1,
    monthlyConversion: 12.1,
    health: "healthy",
    owner: "Sales Ops",
  },
  {
    id: "we9",
    name: "We9",
    client: "Shopping Jaraguá Araraquara",
    priority: "P3",
    focus: "Refino de estágio",
    score: 82,
    baseCoverage: 89,
    dataReconciliation: 74.0,
    monthlyConversion: 14.2,
    health: "healthy",
    owner: "Sales Ops",
  },
];

const insights: ExecutiveInsight[] = [
  {
    id: "i1",
    severity: "critical",
    title: "Café Fazenda Brasil sem lastro operacional consolidado",
    detail:
      "A operação aparece com leitura comercial no Notion, mas ainda não está refletida com força suficiente na camada operacional do Supabase.",
    operationId: "cafe-fazenda-brasil",
    timestamp: "agora",
  },
  {
    id: "i2",
    severity: "risk",
    title: "Acelerato, Incentiva e Nimbus puxam a fila de reposição de base",
    detail:
      "As três operações compartilham o mesmo padrão: cobertura de não iniciados abaixo da banda ideal e risco direto sobre continuidade de cadência.",
    timestamp: "há 18 min",
  },
  {
    id: "i3",
    severity: "monitor",
    title: "Prime Action e Plan Idiomas já pedem leitura mais semântica do funil",
    detail:
      "O ponto principal deixou de ser identidade do lead e passou a ser alinhamento entre estágio operacional e estágio comercial.",
    timestamp: "há 34 min",
  },
  {
    id: "i4",
    severity: "info",
    title: "Incentiva já tem maturidade para cockpit profundo por operação",
    detail:
      "A operação concentra volume, automação multicanal e telemetria suficiente para justificar drill-down de workflow, WhatsApp health e inteligência por ICP.",
    operationId: "incentiva",
    timestamp: "há 52 min",
  },
];

const incentivaCockpit: IncentivaCockpitData = {
  operationName: "Incentiva",
  snapshotLabel: "Snapshot real consolidado em 29 jun 2026",
  source: "snapshot",
  summary: {
    health: "risk",
    focus: "Reposição de base",
    priorityScore: 55,
    stageAlignmentPct: 95.69,
    matchRatePct: 99.85,
    avgLeadScore: 71.36,
    supabaseRecords: 2737,
    notionRecords: 2965,
    activeWorkflows: 41,
    totalWorkflows: 52,
    success7d: 4835,
    error7d: 7,
    waiting7d: 5,
  },
  funnel: [
    { id: "prospecting", label: "Prospecting", count: 2443, touchedThisMonth: 28 },
    { id: "lead-interessado", label: "Lead Interessado", count: 35, touchedThisMonth: 25 },
    { id: "mql-agendado", label: "MQL Agendado", count: 7, touchedThisMonth: 2 },
    { id: "mql-realizado", label: "MQL Realizado", count: 5, touchedThisMonth: 0 },
    { id: "negotiation", label: "Negociação", count: 8, touchedThisMonth: 0 },
    { id: "won", label: "Cliente Ganho", count: 2, touchedThisMonth: 1 },
    { id: "lost", label: "Perdido", count: 452 },
  ],
  baseMetrics: [
    {
      id: "unstarted",
      label: "Não iniciados canônicos",
      value: 6,
      tone: "destructive",
      detail: "Cobertura muito abaixo da meta diária atual de 25 ativações.",
    },
    {
      id: "coverage-days",
      label: "Cobertura em dias",
      value: 0,
      unit: "d",
      tone: "destructive",
      detail: "A base atual não sustenta a cadência com folga operacional.",
    },
    {
      id: "reactivation",
      label: "Pool de reativação",
      value: 812,
      tone: "warning",
      detail: "Volume grande o suficiente para virar alavanca de curto prazo.",
    },
    {
      id: "suppressed",
      label: "Supressões ativas",
      value: 398,
      tone: "info",
      detail: "Base já tem massa relevante fora de cadência produtiva.",
    },
    {
      id: "reprospeccao",
      label: "Reprospecção elegível",
      value: 6,
      tone: "warning",
      detail: "Baixo volume elegível imediato para reaproveitamento.",
    },
    {
      id: "retomada",
      label: "Retomada elegível",
      value: 10,
      tone: "info",
      detail: "Fila de retomada pequena, mas acionável em paralelo.",
    },
  ],
  prospectingReadiness: {
    metrics: [
      {
        id: "icp-coverage",
        label: "Cobertura vs meta diária",
        value: "6 / 25",
        tone: "critical",
        detail: "A base nova cobre só uma fração da meta diária atual de ativações.",
      },
      {
        id: "coverage-window",
        label: "Janela de sustentação",
        value: "0 d",
        tone: "critical",
        detail: "O funil novo não sustenta sequer um dia cheio de cadência com folga.",
      },
      {
        id: "reactivation-volume",
        label: "Pulmão de base",
        value: "812",
        tone: "warning",
        detail: "O maior volume reaproveitável hoje está na camada de reativação.",
      },
      {
        id: "recovery-lanes",
        label: "Faixas acionáveis",
        value: "16",
        tone: "monitor",
        detail: "Reprospecção e retomada somadas ainda são pequenas, mas já operáveis.",
      },
    ],
    lanes: [
      {
        id: "new-list",
        label: "Lista nova / ICP",
        health: "critical",
        headline: "Reposição de lista continua sendo o gargalo nº1 da Incentiva.",
        detail: "Com apenas 6 não iniciados canônicos, o problema central já não é execução e sim abastecimento qualificado da cadência.",
        recommendation: "Priorizar reposição de lista e cobertura de ICP antes de buscar ganho marginal em copy ou workflow.",
      },
      {
        id: "reactivation",
        label: "Reativação",
        health: "monitor",
        headline: "Reativação é a maior alavanca de amortecimento de curto prazo.",
        detail: "O pool atual já é grande o suficiente para segurar parte da pressão enquanto a lista nova é refeita.",
        recommendation: "Usar reativação como colchão tático, sem confundir isso com solução estrutural de base.",
      },
      {
        id: "reprospeccao",
        label: "Reprospecção",
        health: "monitor",
        headline: "Reprospecção existe, mas ainda não muda o jogo sozinha.",
        detail: "O volume elegível imediato é baixo e serve mais como complemento do que como motor principal da operação.",
        recommendation: "Acionar essa fila em paralelo, mas não contar com ela como cobertura central do mês.",
      },
      {
        id: "retomada",
        label: "Retomada",
        health: "healthy",
        headline: "Retomada já é uma faixa pequena e executável sem grande fricção.",
        detail: "A fila é curta, porém com boa chance de virar tração rápida em cima de conversa já iniciada.",
        recommendation: "Manter retomada rodando como camada tática enquanto a lista nova e a reativação ganham escala.",
      },
    ],
  },
  executionBacklog: {
    metrics: [
      {
        id: "open-fronts",
        label: "Frentes abertas",
        value: "4",
        tone: "monitor",
        detail: "A Incentiva já tem quatro blocos claros que pedem ação executiva dedicada.",
      },
      {
        id: "p0-items",
        label: "Ações P0",
        value: "2",
        tone: "critical",
        detail: "Reposição de base e fila de e-mail seguem como prioridades imediatas.",
      },
      {
        id: "owner-clusters",
        label: "Donos sugeridos",
        value: "3",
        tone: "info",
        detail: "Sales Ops, Lista/ICP e Claw já cobrem a maior parte da próxima rodada.",
      },
      {
        id: "v2-readiness",
        label: "Pronto para V2",
        value: "Sim",
        tone: "success",
        detail: "A operação já tem densidade e clareza suficiente para uma camada V2 orientada a intervenção.",
      },
    ],
    items: [
      {
        id: "backlog-base",
        lane: "ICP / Lista",
        priority: "P0",
        health: "critical",
        owner: "Bruna + Sales Ops",
        headline: "Reposição de não iniciados continua sendo a ação mais urgente.",
        detail: "A operação está com apenas 6 não iniciados canônicos para uma meta diária de 25 ativações, o que trava a sustentação da cadência.",
        nextStep: "Abrir reposição de lista por ICP como entrega imediata e medir a recuperação da cobertura em dias.",
      },
      {
        id: "backlog-email",
        lane: "E-mail FUP",
        priority: "P0",
        health: "risk",
        owner: "Claw",
        headline: "FUP2 precisa sair da zona de waiting antes de escalar invisivelmente.",
        detail: "O canal de e-mail não parece quebrado estruturalmente, mas já apresenta fila sem throughput útil no workflow mais crítico.",
        nextStep: "Abrir drill-down do FUP2 com throughput, fila e saída útil por workflow na próxima iteração da V2.",
      },
      {
        id: "backlog-whatsapp",
        lane: "WhatsApp",
        priority: "P1",
        health: "monitor",
        owner: "Sales Ops",
        headline: "Canal está íntegro, mas depende demais da recomposição da base.",
        detail: "A infraestrutura do WhatsApp está saudável; o principal risco é o canal perder tração por falta de abastecimento novo.",
        nextStep: "Reavaliar o peso de outbound, reativação e retomada assim que a cobertura de base voltar a subir.",
      },
      {
        id: "backlog-linkedin",
        lane: "LinkedIn Social",
        priority: "P2",
        health: "monitor",
        owner: "Claw + Sales Ops",
        headline: "A frente social já pede leitura mais semântica, não mais estrutural.",
        detail: "Há densidade real de workflows e sinais de uso, mas ainda falta separar descoberta, fila, engajamento e risco numa camada mais clara.",
        nextStep: "Na V2, quebrar LinkedIn em submódulos operacionais para enxergar social selling com mais nitidez.",
      },
    ],
  },
  emailHealth: {
    metrics: [
      {
        id: "email-active",
        label: "Infra de e-mail ativa",
        value: "5/5",
        tone: "success",
        detail: "Todos os workflows FUP de e-mail seguem ativos na camada atual.",
      },
      {
        id: "email-waiting",
        label: "Waiting concentrado",
        value: "5",
        tone: "risk",
        detail: "O snapshot fechou o FUP2 com 5 itens em waiting e sem erro explícito.",
      },
      {
        id: "email-throughput",
        label: "Throughput útil 7d",
        value: "0",
        tone: "critical",
        detail: "O principal workflow monitorado de e-mail não converteu waiting em sucesso no período.",
      },
      {
        id: "email-family-risk",
        label: "Família sob risco",
        value: "FUP2",
        tone: "monitor",
        detail: "O gargalo atual é específico, não uma quebra total da frente de e-mail.",
      },
    ],
    tracks: [
      {
        id: "email-fup2",
        label: "FUP2 / fila",
        health: "risk",
        headline: "FUP2 virou o primeiro gargalo silencioso do canal.",
        detail: "Há corrida recente, mas ela acumulou waiting sem sucesso confirmado, o que já justifica leitura de throughput e fila.",
        recommendation: "A próxima intervenção deve abrir o detalhe do FUP2 antes que a fila escale invisivelmente.",
      },
      {
        id: "email-family",
        label: "Família E-mail FUP",
        health: "monitor",
        headline: "A família está viva, mas ainda sem observabilidade executiva suficiente.",
        detail: "Os 5 workflows estão ativos, porém o cockpit ainda não diferencia claramente throughput, fila e sucesso por etapa.",
        recommendation: "Na V2, separar throughput, waiting e saída útil por workflow da família de e-mail.",
      },
      {
        id: "email-priority",
        label: "Próxima prioridade",
        health: "healthy",
        headline: "O problema de e-mail já está isolado o bastante para virar módulo próprio.",
        detail: "Não parece uma quebra estrutural do canal inteiro, e sim um ponto localizado que agora já merece drill-down.",
        recommendation: "Depois deste bloco, o próximo corte natural é dashboard de throughput por workflow e backlog operacional por frente.",
      },
    ],
  },
  whatsappHealth: {
    metrics: [
      {
        id: "infra",
        label: "Infraestrutura ativa",
        value: "8/8",
        tone: "success",
        detail: "Todos os workflows FUP de WhatsApp estão ativos na camada atual do n8n VPS.",
      },
      {
        id: "base-pressure",
        label: "Pressão de base",
        value: "6",
        tone: "critical",
        detail: "Só 6 não iniciados canônicos sustentam hoje a cadência de WhatsApp.",
      },
      {
        id: "outbound-runs",
        label: "Outbound com corrida",
        value: "4",
        tone: "healthy",
        detail: "Os FUPs outbound 1 a 4 rodaram no snapshot dos últimos 7 dias.",
      },
      {
        id: "lead-lanes-idle",
        label: "Leads sem giro",
        value: "4",
        tone: "risk",
        detail: "Os FUPs de leads seguem ativos, mas sem execução recente no corte atual.",
      },
    ],
    tracks: [
      {
        id: "outbound",
        label: "Outbound WhatsApp",
        health: "healthy",
        headline: "FUP1 a FUP4 ativos e com execução recente.",
        detail: "A cadência outbound está tecnicamente íntegra; o gargalo deixou de ser workflow e virou reposição de base.",
        workflows: "4 workflows com corrida",
      },
      {
        id: "leads",
        label: "Leads WhatsApp",
        health: "risk",
        headline: "FUP1 a FUP4 ativos, mas sem tráfego recente.",
        detail: "O bloco de leads não acusa quebra técnica, porém ficou sem giro no snapshot e pede leitura de entrada real da fila.",
        workflows: "4 workflows ativos / 0 execuções",
      },
      {
        id: "reativacao",
        label: "Reativação / Retomada",
        health: "monitor",
        headline: "Canal apto para amortecer a falta de base nova.",
        detail: "Retomada em WhatsApp já mostrou corrida recente e pode ganhar peso enquanto a reposição de lista é atacada.",
        workflows: "1 workflow com corrida",
      },
    ],
  },
  workflowIntelligence: {
    metrics: [
      {
        id: "active-families",
        label: "Famílias ativas",
        value: "11",
        tone: "success",
        detail: "A Incentiva já opera com densidade multicanal suficiente para leitura por família.",
      },
      {
        id: "email-risk",
        label: "Famílias sob risco",
        value: "1",
        tone: "risk",
        detail: "E-mail FUP concentra o principal sinal de fila silenciosa nesta camada.",
      },
      {
        id: "social-density",
        label: "Social selling ativo",
        value: "26/23",
        tone: "monitor",
        detail: "LinkedIn social + conexão + Instagram já sustentam uma malha densa de automação.",
      },
      {
        id: "top-engine",
        label: "Motor dominante",
        value: "Instagram",
        tone: "info",
        detail: "Instagram concentra a maior parte das execuções e hoje é o principal motor de volume.",
      },
    ],
    insights: [
      {
        id: "email-fup-bottleneck",
        familyId: "email_fup",
        label: "E-mail FUP",
        health: "risk",
        headline: "Waiting concentrado no FUP2 já merece leitura dedicada.",
        detail: "A família está 100% ativa, mas o FUP2 fechou o snapshot com 5 waiting e zero sucesso no período.",
        recommendation: "Abrir a próxima intervenção em throughput e fila do e-mail antes de virar gargalo invisível.",
      },
      {
        id: "instagram-engine",
        familyId: "instagram",
        label: "Instagram",
        health: "healthy",
        headline: "Instagram é hoje o motor operacional mais confiável da Incentiva.",
        detail: "Lead Inbound Sync, Action Queue e Engagement Score concentram volume alto e erro marginal.",
        recommendation: "Usar Instagram como referência de padrão visual e de observabilidade do cockpit.",
      },
      {
        id: "linkedin-spread",
        familyId: "linkedin_social",
        label: "LinkedIn Social",
        health: "monitor",
        headline: "Família extensa, porém ainda heterogênea em uso real.",
        detail: "Há boa cobertura de workflows ativos, mas a distribuição de execuções ainda é rasa e muito dispersa.",
        recommendation: "Separar descoberta, fila, engajamento e risco em leitura mais semântica na próxima V2.",
      },
      {
        id: "whatsapp-base-dependency",
        familyId: "whatsapp_fup",
        label: "WhatsApp FUP",
        health: "monitor",
        headline: "A infraestrutura está íntegra, mas o canal depende demais da reposição de base.",
        detail: "Os workflows de WhatsApp estão ativos e sem erro recente relevante, mas a sustentação comercial está pressionada pela falta de não iniciados.",
        recommendation: "Tratar a próxima melhoria do canal junto com ICP / lista / não iniciados, não isoladamente.",
      },
    ],
  },
  channels: [
    {
      id: "whatsapp",
      label: "WhatsApp",
      health: "monitor",
      activeWorkflows: 8,
      totalWorkflows: 8,
      headline: "Cadência ativa com cobertura de base pressionada",
      detail: "A camada técnica está operacional, mas a reposição de não iniciados virou o gargalo real.",
    },
    {
      id: "email",
      label: "E-mail",
      health: "risk",
      activeWorkflows: 5,
      totalWorkflows: 5,
      headline: "Fila com waiting recorrente em FUP2",
      detail: "A telemetria já mostra waiting acumulado, pedindo leitura mais fina de throughput.",
    },
    {
      id: "linkedin",
      label: "LinkedIn",
      health: "monitor",
      activeWorkflows: 14,
      totalWorkflows: 23,
      headline: "Social selling ativo, mas ainda heterogêneo",
      detail: "A operação já tem densidade real de workflows sociais e de follow-up para drill-down executivo.",
    },
    {
      id: "instagram-inbound",
      label: "Instagram / Inbound",
      health: "healthy",
      activeWorkflows: 7,
      totalWorkflows: 7,
      headline: "Canal mais volumoso da telemetria recente",
      detail: "Instagram concentrou a maior parte das execuções dos últimos 7 dias e já sustenta leitura de automação viva.",
    },
  ],
  workflowFamilies: [
    {
      id: "linkedin-social",
      label: "LinkedIn Social",
      total: 17,
      active: 9,
      health: "monitor",
      summary: "Família mais extensa da operação e base principal para social selling assistido.",
    },
    {
      id: "whatsapp-fup",
      label: "WhatsApp FUP",
      total: 8,
      active: 8,
      health: "healthy",
      summary: "Cadência 100% ativa na camada de workflows, com pressão hoje mais em base do que em infraestrutura.",
    },
    {
      id: "instagram",
      label: "Instagram",
      total: 6,
      active: 6,
      health: "healthy",
      summary: "Frente com maior volume recente e boa estabilidade operacional.",
    },
    {
      id: "email-fup",
      label: "E-mail FUP",
      total: 5,
      active: 5,
      health: "risk",
      summary: "Volume baixo com waiting presente, bom candidato para a próxima camada de workflow intelligence.",
    },
    {
      id: "reativacao",
      label: "Reativação",
      total: 3,
      active: 3,
      health: "monitor",
      summary: "Ativa e com espaço para ganhar protagonismo enquanto a base nova segue curta.",
    },
  ],
  topWorkflows: [
    {
      name: "Incentiva - Instagram - Lead Inbound Sync",
      family: "instagram",
      active: true,
      executions7d: 1281,
      success7d: 1280,
      error7d: 1,
      waiting7d: 0,
      lastRun: "29 jun 2026 · 20:35",
    },
    {
      name: "Incentiva - Instagram - Action Queue",
      family: "instagram",
      active: true,
      executions7d: 1280,
      success7d: 1278,
      error7d: 2,
      waiting7d: 0,
      lastRun: "29 jun 2026 · 20:34",
    },
    {
      name: "Incentiva - Instagram - Engagement Score",
      family: "instagram",
      active: true,
      executions7d: 1280,
      success7d: 1278,
      error7d: 2,
      waiting7d: 0,
      lastRun: "29 jun 2026 · 20:35",
    },
    {
      name: "Incentiva - Instagram - Agente Conversa",
      family: "agente_conversa",
      active: true,
      executions7d: 640,
      success7d: 639,
      error7d: 1,
      waiting7d: 0,
      lastRun: "29 jun 2026 · 20:34",
    },
    {
      name: "Incentiva - Prospecção Ativa - Outbound - Email - FUP2",
      family: "email_fup",
      active: true,
      executions7d: 5,
      success7d: 0,
      error7d: 0,
      waiting7d: 5,
      lastRun: "29 jun 2026 · 19:30",
    },
  ],
  alerts: [
    {
      id: "base-risk",
      severity: "critical",
      title: "Cobertura de não iniciados entrou em zona vermelha",
      detail: "A Incentiva fechou o snapshot com apenas 6 não iniciados canônicos para uma meta diária de 25 ativações.",
    },
    {
      id: "reconciliation",
      severity: "risk",
      title: "Reconciliação estrutural boa, semântica ainda pede ajuste",
      detail: "O match rate está em 99,85%, mas ainda existem 2.452 divergências de status e 283 registros só no Notion.",
    },
    {
      id: "email-waiting",
      severity: "monitor",
      title: "E-mail já mostrou waiting recorrente no FUP2",
      detail: "A família de e-mail está viva, mas a fila pede observação antes de virar gargalo silencioso.",
    },
    {
      id: "social-density",
      severity: "info",
      title: "Incentiva já tem densidade real para workflow intelligence",
      detail: "O volume de automação em Instagram, LinkedIn e Agente Conversa já justifica cockpit profundo por canal e família.",
    },
  ],
};

export function fetchOperations(): Operation[] {
  return [...operations].sort((a, b) => a.score - b.score);
}

export function fetchGlobalKpis(): GlobalKpis {
  const monitored = operations.length;
  const atRisk = operations.filter((o) => o.health === "risk").length;
  const critical = operations.filter((o) => o.health === "critical").length;
  const baseCoverage =
    operations.reduce((sum, operation) => sum + operation.baseCoverage, 0) / operations.length;

  return {
    monitored,
    atRisk,
    critical,
    baseCoverage: Math.round(baseCoverage * 10) / 10,
    totalLeads: 18_669,
    monthlyConversions: 98,
    conversionDelta: 6.8,
    leadsDelta: 4.2,
    coverageDelta: -3.1,
    riskDelta: -1.0,
  };
}

export function fetchStatusDistribution(): Record<OperationStatus, number> {
  return operations.reduce(
    (acc, operation) => {
      acc[operation.health] += 1;
      return acc;
    },
    { healthy: 0, monitor: 0, risk: 0, critical: 0 } as Record<OperationStatus, number>,
  );
}

export function fetchInsights(): ExecutiveInsight[] {
  return insights;
}

export function fetchIncentivaCockpit(): IncentivaCockpitData {
  return incentivaCockpit;
}

type GovernanceAdminGlobalRow = {
  operation_name: string;
  status_health: string;
  primary_focus: string;
  priority_score: number | string;
  supabase_total_records: number | string | null;
  notion_total_records: number | string | null;
  reactivation_count: number | string | null;
  reprospeccao_eligible_count: number | string | null;
  retomada_eligible_count: number | string | null;
  suppressed_count: number | string | null;
  avg_lead_score: number | string | null;
  daily_activation_target: number | string | null;
  coverage_days: number | string | null;
  canonical_unstarted_count: number | string | null;
  prospecting_count: number | string | null;
  lead_interessado_count: number | string | null;
  mql_agendado_count: number | string | null;
  mql_realizado_count: number | string | null;
  negotiation_count: number | string | null;
  won_count: number | string | null;
  lost_count: number | string | null;
  active_funnel_touched_this_month: number | string | null;
  lead_interessado_touched_this_month: number | string | null;
  mql_agendado_touched_this_month: number | string | null;
  mql_realizado_touched_this_month: number | string | null;
  negotiation_touched_this_month: number | string | null;
  won_touched_this_month: number | string | null;
  match_rate_pct: number | string | null;
  status_mismatch_count: number | string | null;
  notion_only_count: number | string | null;
  canonical_stage_alignment_pct: number | string | null;
  refreshed_at: string | null;
};

function toNumber(value: number | string | null | undefined, fallback = 0) {
  if (typeof value === "number") return Number.isFinite(value) ? value : fallback;
  if (typeof value === "string") {
    const normalized = value.trim().replace(",", ".");
    if (!normalized) return fallback;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function toLabelDate(value: string | null | undefined) {
  if (!value) return "Leitura viva do Supabase";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Leitura viva do Supabase";
  return `Leitura viva do Supabase · ${date.toLocaleDateString("pt-BR")} ${date.toLocaleTimeString(
    "pt-BR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  )}`;
}

function normalizeHealth(value: string | null | undefined): OperationStatus {
  if (value === "critical") return "critical";
  if (value === "risk") return "risk";
  if (value === "healthy") return "healthy";
  return "monitor";
}

function coveragePctFromRow(row: GovernanceAdminGlobalRow) {
  const unstarted = toNumber(row.canonical_unstarted_count);
  const target = Math.max(1, toNumber(row.daily_activation_target, 1));
  return Math.max(0, Math.min(100, (unstarted / target) * 100));
}

function monthlyConversionPctFromRow(row: GovernanceAdminGlobalRow) {
  const wonTouched = toNumber(row.won_touched_this_month);
  const funnelTouched = Math.max(1, toNumber(row.active_funnel_touched_this_month));
  return (wonTouched / funnelTouched) * 100;
}

function applyLiveGovernanceRow(base: IncentivaCockpitData, row: GovernanceAdminGlobalRow): IncentivaCockpitData {
  const dailyActivationTarget = toNumber(row.daily_activation_target, 25);
  const canonicalUnstarted = toNumber(row.canonical_unstarted_count);
  const coverageDays = toNumber(row.coverage_days);
  const reactivationCount = toNumber(row.reactivation_count);
  const reprospeccaoEligible = toNumber(row.reprospeccao_eligible_count);
  const retomadaEligible = toNumber(row.retomada_eligible_count);
  const suppressedCount = toNumber(row.suppressed_count);
  const stageAlignmentPct = toNumber(row.canonical_stage_alignment_pct);
  const matchRatePct = toNumber(row.match_rate_pct);
  const avgLeadScore = toNumber(row.avg_lead_score);
  const priorityScore = toNumber(row.priority_score);
  const supabaseRecords = toNumber(row.supabase_total_records);
  const notionRecords = toNumber(row.notion_total_records);
  const activeFunnelTouched = toNumber(row.active_funnel_touched_this_month);
  const leadInteressadoTouched = toNumber(row.lead_interessado_touched_this_month);
  const mqlAgendadoTouched = toNumber(row.mql_agendado_touched_this_month);
  const mqlRealizadoTouched = toNumber(row.mql_realizado_touched_this_month);
  const negotiationTouched = toNumber(row.negotiation_touched_this_month);
  const wonTouched = toNumber(row.won_touched_this_month);
  const statusMismatchCount = toNumber(row.status_mismatch_count);
  const notionOnlyCount = toNumber(row.notion_only_count);

  return {
    ...base,
    source: "live",
    snapshotLabel: toLabelDate(row.refreshed_at),
    summary: {
      ...base.summary,
      health: normalizeHealth(row.status_health),
      focus: row.primary_focus,
      priorityScore,
      stageAlignmentPct,
      matchRatePct,
      avgLeadScore,
      supabaseRecords,
      notionRecords,
    },
    funnel: [
      { id: "prospecting", label: "Prospecting", count: toNumber(row.prospecting_count), touchedThisMonth: activeFunnelTouched },
      { id: "lead-interessado", label: "Lead Interessado", count: toNumber(row.lead_interessado_count), touchedThisMonth: leadInteressadoTouched },
      { id: "mql-agendado", label: "MQL Agendado", count: toNumber(row.mql_agendado_count), touchedThisMonth: mqlAgendadoTouched },
      { id: "mql-realizado", label: "MQL Realizado", count: toNumber(row.mql_realizado_count), touchedThisMonth: mqlRealizadoTouched },
      { id: "negotiation", label: "Negociação", count: toNumber(row.negotiation_count), touchedThisMonth: negotiationTouched },
      { id: "won", label: "Cliente Ganho", count: toNumber(row.won_count), touchedThisMonth: wonTouched },
      { id: "lost", label: "Perdido", count: toNumber(row.lost_count) },
    ],
    baseMetrics: [
      {
        id: "unstarted",
        label: "Não iniciados canônicos",
        value: canonicalUnstarted,
        tone: canonicalUnstarted < dailyActivationTarget ? "destructive" : "success",
        detail: `Meta diária atual: ${dailyActivationTarget} ativações.`,
      },
      {
        id: "coverage-days",
        label: "Cobertura em dias",
        value: coverageDays,
        unit: "d",
        tone: coverageDays < 1 ? "destructive" : coverageDays < 3 ? "warning" : "success",
        detail: "Leitura viva da cobertura operacional da base.",
      },
      {
        id: "reactivation",
        label: "Pool de reativação",
        value: reactivationCount,
        tone: reactivationCount > 200 ? "warning" : "info",
        detail: "Leads hoje classificados para reativação na operação.",
      },
      {
        id: "suppressed",
        label: "Supressões ativas",
        value: suppressedCount,
        tone: "info",
        detail: "Base temporariamente fora de cadência por regras de supressão.",
      },
      {
        id: "reprospeccao",
        label: "Reprospecção elegível",
        value: reprospeccaoEligible,
        tone: reprospeccaoEligible < 10 ? "warning" : "info",
        detail: "Volume imediato de reaproveitamento via reprospecção.",
      },
      {
        id: "retomada",
        label: "Retomada elegível",
        value: retomadaEligible,
        tone: "info",
        detail: "Leads prontos para retomada de conversa.",
      },
    ],
    prospectingReadiness: {
      metrics: base.prospectingReadiness.metrics.map((metric) => {
        if (metric.id === "icp-coverage") {
          return {
            ...metric,
            value: `${canonicalUnstarted} / ${dailyActivationTarget}`,
            tone:
              canonicalUnstarted < dailyActivationTarget
                ? "critical"
                : canonicalUnstarted < dailyActivationTarget * 2
                  ? "risk"
                  : "success",
            detail: "Leitura viva da cobertura de não iniciados frente à meta diária atual.",
          };
        }

        if (metric.id === "coverage-window") {
          return {
            ...metric,
            value: `${coverageDays} d`,
            tone:
              coverageDays < 1 ? "critical" : coverageDays < 3 ? "risk" : "success",
            detail: "Janela real de sustentação operacional da base nova.",
          };
        }

        if (metric.id === "reactivation-volume") {
          return {
            ...metric,
            value: String(reactivationCount),
            tone: reactivationCount > 200 ? "warning" : "info",
            detail: "Volume vivo hoje classificado para reativação no Supabase.",
          };
        }

        if (metric.id === "recovery-lanes") {
          const recoveryTotal = reprospeccaoEligible + retomadaEligible;

          return {
            ...metric,
            value: String(recoveryTotal),
            tone: recoveryTotal < 20 ? "monitor" : "info",
            detail: "Soma viva de reprospecção e retomada já acionáveis na operação.",
          };
        }

        return metric;
      }),
      lanes: base.prospectingReadiness.lanes.map((lane) => {
        if (lane.id === "new-list") {
          return {
            ...lane,
            health:
              canonicalUnstarted < dailyActivationTarget ? "critical" : "monitor",
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? `A leitura viva confirma a pressão de lista: ${canonicalUnstarted} não iniciados para uma meta diária de ${dailyActivationTarget}.`
                : `A cobertura viva já saiu da zona crítica e sustenta melhor a meta diária de ${dailyActivationTarget} ativações.`,
          };
        }

        if (lane.id === "reactivation") {
          return {
            ...lane,
            health: reactivationCount > 200 ? "monitor" : "healthy",
            detail: `A leitura viva mostra ${reactivationCount} leads hoje classificados para reativação dentro da operação.`,
          };
        }

        if (lane.id === "reprospeccao") {
          return {
            ...lane,
            health: reprospeccaoEligible < 10 ? "monitor" : "healthy",
            detail: `Há ${reprospeccaoEligible} leads em reprospecção elegível na leitura viva atual.`,
          };
        }

        if (lane.id === "retomada") {
          return {
            ...lane,
            health: retomadaEligible < 10 ? "monitor" : "healthy",
            detail: `A fila viva de retomada traz ${retomadaEligible} leads hoje prontos para nova conversa.`,
          };
        }

        return lane;
      }),
    },
    executionBacklog: {
      metrics: base.executionBacklog.metrics.map((metric) => {
        if (metric.id === "p0-items") {
          const p0Count = base.executionBacklog.items.filter((item) => item.priority === "P0").length;

          return {
            ...metric,
            value: String(p0Count),
            detail: "O backlog vivo segue concentrado nas frentes mais urgentes já validadas pelo cockpit.",
          };
        }

        if (metric.id === "open-fronts") {
          return {
            ...metric,
            value: String(base.executionBacklog.items.length),
            detail: "Quantidade de frentes já claras para intervenção executiva dentro da Incentiva.",
          };
        }

        return metric;
      }),
      items: base.executionBacklog.items.map((item) => {
        if (item.id === "backlog-base") {
          return {
            ...item,
            health:
              canonicalUnstarted < dailyActivationTarget ? "critical" : "monitor",
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? `A leitura viva mantém a frente em P0: ${canonicalUnstarted} não iniciados para meta diária de ${dailyActivationTarget}.`
                : `A leitura viva já mostra recuperação de cobertura frente à meta diária de ${dailyActivationTarget} ativações.`,
          };
        }

        if (item.id === "backlog-whatsapp") {
          return {
            ...item,
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? "A camada WhatsApp continua tecnicamente estável, mas ainda opera sob dependência direta da reposição de base."
                : item.detail,
          };
        }

        return item;
      }),
    },
    emailHealth: {
      metrics: base.emailHealth.metrics.map((metric) => {
        if (metric.id === "email-active") {
          const emailChannel = base.channels.find((channel) => channel.id === "email");
          const activeWorkflows = emailChannel?.activeWorkflows ?? 5;
          const totalWorkflows = emailChannel?.totalWorkflows ?? 5;

          return {
            ...metric,
            value: `${activeWorkflows}/${totalWorkflows}`,
            detail: "A leitura viva preserva a família de e-mail ativa; a próxima camada ainda precisa abrir fila por workflow.",
          };
        }

        if (metric.id === "email-waiting") {
          return {
            ...metric,
            value: String(base.summary.waiting7d),
            tone: base.summary.waiting7d > 0 ? "risk" : "success",
            detail: "Sem telemetria viva por workflow nesta camada, mantemos o principal sinal de waiting do snapshot consolidado.",
          };
        }

        if (metric.id === "email-throughput") {
          return {
            ...metric,
            value: "snapshot",
            tone: "monitor",
            detail: "A governança live ainda não abriu throughput por workflow de e-mail; mantido o retrato já validado no snapshot.",
          };
        }

        return metric;
      }),
      tracks: base.emailHealth.tracks.map((track) => {
        if (track.id === "email-fup2") {
          return {
            ...track,
            detail: "A leitura viva da governança ainda não separa a fila por workflow; mantido o FUP2 como principal risco já confirmado no snapshot.",
          };
        }

        if (track.id === "email-family") {
          return {
            ...track,
            detail: "A família segue íntegra em ativação, mas a observabilidade fina por workflow ainda é a principal lacuna desta camada live.",
          };
        }

        return track;
      }),
    },
    alerts: [
      {
        id: "base-risk",
        severity: canonicalUnstarted < dailyActivationTarget ? "critical" : "monitor",
        title:
          canonicalUnstarted < dailyActivationTarget
            ? "Cobertura de não iniciados ainda abaixo da meta diária"
            : "Cobertura de base já saiu da zona crítica",
        detail: `A Incentiva está com ${canonicalUnstarted} não iniciados canônicos para uma meta atual de ${dailyActivationTarget} ativações.`,
      },
      {
        id: "reconciliation",
        severity: stageAlignmentPct < 90 || matchRatePct < 95 ? "risk" : "monitor",
        title: "Reconciliação estrutural e semântica em leitura viva",
        detail: `Match rate em ${matchRatePct.toFixed(2)}% e alinhamento canônico em ${stageAlignmentPct.toFixed(2)}%, com ${statusMismatchCount} divergências de status e ${notionOnlyCount} registros só no Notion.`,
      },
      base.alerts[2],
      base.alerts[3],
    ],
    whatsappHealth: {
      ...base.whatsappHealth,
      metrics: base.whatsappHealth.metrics.map((metric) => {
        if (metric.id === "base-pressure") {
          return {
            ...metric,
            value: String(canonicalUnstarted),
            tone:
              canonicalUnstarted < dailyActivationTarget
                ? "critical"
                : canonicalUnstarted < dailyActivationTarget * 2
                  ? "risk"
                  : "success",
            detail: `A leitura viva mostra ${canonicalUnstarted} não iniciados canônicos para uma meta de ${dailyActivationTarget} ativações diárias.`,
          };
        }

        if (metric.id === "infra") {
          return {
            ...metric,
            detail: `Camada WhatsApp preservada na leitura live, com ${base.summary.activeWorkflows}/${base.summary.totalWorkflows} workflows totais ativos na operação.`,
          };
        }

        return metric;
      }),
      tracks: base.whatsappHealth.tracks.map((track) => {
        if (track.id === "outbound") {
          return {
            ...track,
            health:
              canonicalUnstarted < dailyActivationTarget ? "monitor" : track.health,
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? "A cadência outbound continua íntegra, mas já opera sob pressão direta da falta de base nova."
                : track.detail,
          };
        }

        if (track.id === "leads") {
          return {
            ...track,
            detail: `Sem nova telemetria viva por workflow nesta camada; mantido o último retrato do snapshot para o bloco de leads WhatsApp.`,
          };
        }

        return track;
      }),
    },
    workflowIntelligence: {
      ...base.workflowIntelligence,
      metrics: base.workflowIntelligence.metrics.map((metric) => {
        if (metric.id === "email-risk") {
          return {
            ...metric,
            detail:
              "A leitura viva da governança ainda não abriu telemetria por workflow; mantido o principal risco já confirmado no snapshot.",
          };
        }

        if (metric.id === "active-families") {
          return {
            ...metric,
            detail: `A operação segue com ${base.workflowFamilies.length} famílias já mapeadas no cockpit atual.`,
          };
        }

        return metric;
      }),
      insights: base.workflowIntelligence.insights.map((insight) => {
        if (insight.id === "whatsapp-base-dependency") {
          return {
            ...insight,
            health:
              canonicalUnstarted < dailyActivationTarget ? "risk" : "monitor",
            detail:
              canonicalUnstarted < dailyActivationTarget
                ? `A leitura viva reforça a dependência do WhatsApp sobre a base: ${canonicalUnstarted} não iniciados para meta diária de ${dailyActivationTarget}.`
                : insight.detail,
          };
        }

        return insight;
      }),
    },
  };
}

async function fetchGovernanceAdminGlobalRow(operationName: string): Promise<GovernanceAdminGlobalRow | null> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) return null;

  const endpoint = new URL(`${url.replace(/\/$/, "")}/rest/v1/admin_global_v1`);
  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("operation_name", `eq.${operationName}`);
  endpoint.searchParams.set("limit", "1");

  const response = await fetch(endpoint.toString(), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      "Accept-Profile": "governance",
    },
  });

  if (!response.ok) {
    throw new Error(`supabase_admin_global_fetch_failed_${response.status}`);
  }

  const rows = (await response.json()) as GovernanceAdminGlobalRow[];
  return rows[0] ?? null;
}

export async function loadIncentivaCockpit(): Promise<IncentivaCockpitData> {
  try {
    const row = await fetchGovernanceAdminGlobalRow("Incentiva");
    if (!row) return incentivaCockpit;
    return applyLiveGovernanceRow(incentivaCockpit, row);
  } catch (error) {
    console.error(error);
    return incentivaCockpit;
  }
}

async function fetchGovernanceAdminGlobalRows(): Promise<GovernanceAdminGlobalRow[] | null> {
  const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

  if (!url || !key) return null;

  const endpoint = new URL(`${url.replace(/\/$/, "")}/rest/v1/admin_global_v1`);
  endpoint.searchParams.set("select", "*");
  endpoint.searchParams.set("order", "priority_score.desc,operation_name.asc");

  const response = await fetch(endpoint.toString(), {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      Accept: "application/json",
      "Accept-Profile": "governance",
    },
  });

  if (!response.ok) {
    throw new Error(`supabase_admin_global_list_failed_${response.status}`);
  }

  return (await response.json()) as GovernanceAdminGlobalRow[];
}

function mapPriority(score: number): Priority {
  if (score >= 60) return "P0";
  if (score >= 45) return "P1";
  if (score >= 25) return "P2";
  return "P3";
}

function mapLiveRowsToOperations(rows: GovernanceAdminGlobalRow[]): Operation[] {
  return rows
    .map((row) => {
      const name = row.operation_name;
      const score = toNumber(row.priority_score);
      const baseCoverage = coveragePctFromRow(row);
      const dataReconciliation = toNumber(row.canonical_stage_alignment_pct);
      const monthlyConversion = monthlyConversionPctFromRow(row);

      return {
        id: name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
        name,
        client: name === "Incentiva" ? "Incentiva Mais" : name,
        priority: mapPriority(score),
        focus: row.primary_focus,
        score,
        baseCoverage,
        dataReconciliation,
        monthlyConversion,
        health: normalizeHealth(row.status_health),
        owner: "Sales Ops",
      } satisfies Operation;
    })
    .sort((a, b) => a.score - b.score);
}

function mapLiveRowsToKpis(rows: GovernanceAdminGlobalRow[]): GlobalKpis {
  const operations = mapLiveRowsToOperations(rows);
  const monitored = operations.length;
  const atRisk = operations.filter((o) => o.health === "risk").length;
  const critical = operations.filter((o) => o.health === "critical").length;
  const baseCoverage =
    operations.reduce((sum, operation) => sum + operation.baseCoverage, 0) / Math.max(operations.length, 1);
  const totalLeads = rows.reduce((sum, row) => sum + toNumber(row.supabase_total_records), 0);
  const monthlyConversions = rows.reduce((sum, row) => sum + toNumber(row.won_touched_this_month), 0);

  return {
    monitored,
    atRisk,
    critical,
    baseCoverage: Math.round(baseCoverage * 10) / 10,
    totalLeads,
    monthlyConversions,
    conversionDelta: 6.8,
    leadsDelta: 4.2,
    coverageDelta: -3.1,
    riskDelta: -1.0,
  };
}

function mapLiveRowsToDistribution(rows: GovernanceAdminGlobalRow[]): Record<OperationStatus, number> {
  return rows.reduce(
    (acc, row) => {
      acc[normalizeHealth(row.status_health)] += 1;
      return acc;
    },
    { healthy: 0, monitor: 0, risk: 0, critical: 0 } as Record<OperationStatus, number>,
  );
}

function buildLiveInsights(rows: GovernanceAdminGlobalRow[]): ExecutiveInsight[] {
  const sorted = [...rows].sort((a, b) => toNumber(b.priority_score) - toNumber(a.priority_score));
  const top = sorted[0];
  const incentiva = rows.find((row) => row.operation_name === "Incentiva");

  return [
    top
      ? {
          id: "live-top-priority",
          severity: normalizeHealth(top.status_health) === "critical" ? "critical" : "risk",
          title: `${top.operation_name} puxa a fila de prioridade executiva`,
          detail: `Foco principal atual: ${top.primary_focus}. Score ${toNumber(top.priority_score)} na leitura viva da governança.`,
          timestamp: "agora",
        }
      : insights[0],
    {
      id: "live-base-coverage",
      severity: "risk",
      title: "Cobertura de base segue como principal risco transversal",
      detail: "A leitura live mantém a reposição de base como gargalo dominante entre as operações críticas e em risco.",
      timestamp: "agora",
    },
    incentiva
      ? {
          id: "live-incentiva",
          severity: "monitor",
          title: "Incentiva já opera como piloto de cockpit profundo",
          detail: `Alinhamento canônico em ${toNumber(incentiva.canonical_stage_alignment_pct).toFixed(2)}% e match rate em ${toNumber(incentiva.match_rate_pct).toFixed(2)}%.`,
          operationId: "incentiva",
          timestamp: "agora",
        }
      : insights[3],
    {
      id: "live-reconciliation",
      severity: "info",
      title: "Reconciliação estrutural já pode dirigir a camada visual",
      detail: "O Admin Global agora está preparado para usar diretamente a view de governança quando a env pública estiver ativa.",
      timestamp: "agora",
    },
  ];
}

export async function loadGlobalDashboard(): Promise<GlobalDashboardData> {
  try {
    const rows = await fetchGovernanceAdminGlobalRows();
    if (!rows || rows.length === 0) {
      return {
        source: "snapshot",
        snapshotLabel: "Snapshot 29 jun 2026 · Base consolidada",
        kpis: fetchGlobalKpis(),
        operations: fetchOperations(),
        distribution: fetchStatusDistribution(),
        insights: fetchInsights(),
      };
    }

    return {
      source: "live",
      snapshotLabel: toLabelDate(rows[0]?.refreshed_at),
      kpis: mapLiveRowsToKpis(rows),
      operations: mapLiveRowsToOperations(rows),
      distribution: mapLiveRowsToDistribution(rows),
      insights: buildLiveInsights(rows),
    };
  } catch (error) {
    console.error(error);
    return {
      source: "snapshot",
      snapshotLabel: "Snapshot 29 jun 2026 · Base consolidada",
      kpis: fetchGlobalKpis(),
      operations: fetchOperations(),
      distribution: fetchStatusDistribution(),
      insights: fetchInsights(),
    };
  }
}

export const statusMeta: Record<
  OperationStatus,
  { label: string; color: string; bg: string; ring: string }
> = {
  healthy: {
    label: "Healthy",
    color: "text-[color:var(--color-success)]",
    bg: "bg-[color:var(--color-success)]",
    ring: "ring-[color:var(--color-success)]/30",
  },
  monitor: {
    label: "Monitor",
    color: "text-[color:var(--color-info)]",
    bg: "bg-[color:var(--color-info)]",
    ring: "ring-[color:var(--color-info)]/30",
  },
  risk: {
    label: "Risk",
    color: "text-[color:var(--color-warning)]",
    bg: "bg-[color:var(--color-warning)]",
    ring: "ring-[color:var(--color-warning)]/30",
  },
  critical: {
    label: "Critical",
    color: "text-destructive",
    bg: "bg-destructive",
    ring: "ring-destructive/30",
  },
};

export const priorityMeta: Record<Priority, string> = {
  P0: "text-destructive border-destructive/40 bg-destructive/10",
  P1: "text-[color:var(--color-warning)] border-[color:var(--color-warning)]/40 bg-[color:var(--color-warning)]/10",
  P2: "text-[color:var(--color-info)] border-[color:var(--color-info)]/40 bg-[color:var(--color-info)]/10",
  P3: "text-muted-foreground border-border bg-muted",
};
