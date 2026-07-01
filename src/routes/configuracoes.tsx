import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  CheckCircle2,
  Copy,
  Database,
  Eye,
  Filter,
  GlobeLock,
  KeyRound,
  Layers3,
  Lock,
  RefreshCcw,
  ShieldCheck,
  Settings2,
  SlidersHorizontal,
  TimerReset,
  TriangleAlert,
  UserRoundCog,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { useAdminAuth } from "@/components/admin/auth-context";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  createAccessInviteServerFn,
  listAccessRegistryServerFn,
  revokeAccessInviteServerFn,
} from "@/lib/admin-auth-rpc";
import { cn } from "@/lib/utils";
import {
  ACCESS_PACKAGE_LABELS,
  ACCESS_ROUTE_PACKAGES,
  ACCESS_REGISTRY_STATUS_LABELS,
  ACCESS_SCOPE_DESCRIPTIONS,
  ACCESS_SCOPE_LABELS,
  ACCESS_OPERATION_OPTIONS,
  ACCESS_PROFILE_LABELS,
  canManageAccessProfile,
  defaultAccessPackageForProfile,
  defaultOperationScopeForProfile,
  defaultVisibilityForProfile,
  formatAllowedRouteLabels,
  type AccessInvitePreview,
  type AccessRegistrySnapshot,
  type AccessScopeMode,
  type AccessProfileId,
  formatOperationScope,
  resolveAccessScopeMode,
  resolveEffectiveInviteStatus,
  type VisibilityMode,
} from "@/lib/admin-auth.shared";

export const Route = createFileRoute("/configuracoes")({
  head: () => ({ meta: [{ title: "Configurações — Console Incentiva" }] }),
  component: SettingsPage,
});

const settings = {
  snapshotLabel: "Camada de ambiente e parâmetros",
  sources: [
    {
      title: "Supabase",
      detail: "Fonte principal para cobertura, estágio, score, base e governança operacional.",
      owner: "Claw/main",
    },
    {
      title: "n8n VPS",
      detail: "Origem da saúde técnica, execuções, waiting, error e inteligência por workflow.",
      owner: "Claw/main",
    },
    {
      title: "Notion",
      detail: "Camada auxiliar de contexto, CRM operacional e leitura complementar por operação.",
      owner: "Sales Ops + Claw",
    },
    {
      title: "Planilha Análise de Performance",
      detail: "Fonte auxiliar para cortes comerciais e financeiros, não para governança operacional principal.",
      owner: "Claw/main",
    },
  ],
  groups: [
    {
      title: "Parâmetros globais",
      items: [
        "Janela de snapshot",
        "Fonte prioritária por frente",
        "Meta diária de ativação",
        "Critério de saúde / severity",
      ],
    },
    {
      title: "Filtros visuais",
      items: [
        "Operação",
        "Canal",
        "Família de workflow",
        "Prioridade / health",
      ],
    },
    {
      title: "Governança de ambiente",
      items: [
        "Publish / deploy",
        "Credenciais externas",
        "Versionamento do painel",
        "Fallback de snapshot",
      ],
    },
    {
      title: "Segurança e acesso",
      items: [
        "Escopo por agente",
        "Leitura vs edição",
        "Origem homologada",
        "Checkpoints sensíveis",
      ],
    },
  ],
  principles: [
    "Supabase é a fonte principal para a saúde operacional da carteira.",
    "n8n VPS é a fonte principal para a leitura técnica dos workflows.",
    "Planilha entra como apoio comercial/financeiro, não como verdade operacional absoluta.",
    "Qualquer corte publicado precisa deixar claro o que está live, o que está guarded e o que ainda está em snapshot.",
  ],
  profiles: [
    {
      title: "Direção",
      scope: "Vê a carteira inteira e a camada executiva do sistema.",
      publish: "Acompanha o todo",
      portal: "Não depende de recorte por conta",
    },
    {
      title: "Claw/main",
      scope: "Opera integrações, governança e ajustes estruturais.",
      publish: "Homologa e corrige",
      portal: "Prepara e valida o recorte",
    },
    {
      title: "Sales Ops",
      scope: "Vê a carteira inteira em visão operacional.",
      publish: "Opera sem abrir a camada técnica",
      portal: "Acompanha o recorte das contas",
    },
    {
      title: "SDR",
      scope: "Vê somente as operações explicitamente liberadas.",
      publish: "Não herda a carteira inteira",
      portal: "Entra no recorte operacional do que foi liberado",
    },
    {
      title: "Cliente",
      scope: "Vê somente a própria conta, em leitura externa controlada.",
      publish: "Não acessa o admin interno",
      portal: "Entra na área da própria conta",
    },
  ],
  publishStages: [
    {
      title: "Atual · sessão real por cookie",
      detail: "A entrada já nasce no servidor e sustenta RBAC e escopo por operação no produto.",
      health: "healthy",
    },
    {
      title: "Próximo · publish privado por conta",
      detail: "Cada operação passa a sair com recorte próprio, checkpoint explícito e abertura externa controlada.",
      health: "monitor",
    },
    {
      title: "Atual · fontes vivas no recorte publicado",
      detail:
        "Notion já entra com reconciliação viva da governança e Trello já aparece com checkpoint operacional dentro do mesmo recorte publicado.",
      health: "monitor",
    },
  ],
  rolloutGates: [
    "Sessão real por papel já fechada no servidor.",
    "Recorte cliente-safe por operação já definido no portal.",
    "Pacote privado por conta precisa virar checkpoint padrão de abertura externa.",
    "Trello e Notion já aparecem na visão publicada; agora falta aprofundar sync direto, owner e etapa de execução sem sair do produto.",
  ],
  finalPublishReadiness: {
    stage: "Publicação validada / consolidação operacional",
    percent: 100,
    headline:
      "A publicação externa já foi materializada e validada. O foco desta frente saiu de deploy/cutover e entrou em consolidação do produto: responsividade, clareza entre fontes vivas e snapshots, além da preparação da camada de acesso por conta.",
    completed: [
      "Auth real por cookie já no servidor",
      "RBAC e escopo por operação já ativos",
      "Portal privado por conta já estruturado",
      "Centro de integrações já materializado",
      "Notion já entra com leitura viva, faixa de reconciliação e ação sugerida",
      "Trello já entra com owner, etapa e follow-up em cards reais mapeados no produto",
      "Operações e Portal já mostram drill-down por conta",
      "Portal já mostra régua de prontidão e blockers do corte externo por operação",
      "workers.dev e lovable.app já refletem o corte publicado validado",
    ],
    missing: [
      "Eliminar a dependência de snapshot intermediário e ligar o board real do Trello de forma mais direta no painel",
      "Aprofundar o drill-down da divergência comercial do Notion",
      "Fechar a responsividade do console logado para desktop, tablet e celular",
      "Subir Integrações V2 com Evolution API, Drive/Sheets e demais fontes faltantes",
      "Preparar a camada de acesso real por usuário, convite e escopo por conta",
    ],
    risks: [
      "Hoje o produto está mais avançado em governança interna do que em UX final de uso diário",
      "Ainda existe dependência de sinais operacionais intermediários em parte da camada Trello",
      "Nem todas as fontes ainda estão expostas como leitura centralizada no hub de integrações",
    ],
  },
  publicCutover: {
    detail:
      "O cutover externo já foi concluído. Esta régua agora serve para manter a paridade entre o produto publicado e as próximas rodadas de evolução, sem voltar a confundir deploy concluído com console pronto para escala.",
    steps: [
      {
        title: "Corte interno validado",
        status: "ready" as const,
        detail: "Build, sessão real, portal privado e integração viva inicial já estão amarrados no produto.",
      },
      {
        title: "Paridade do recorte publicado",
        status: "ready" as const,
        detail:
          "A publicação externa já reflete o corte homologado desta etapa.",
      },
      {
        title: "Homologação externa diária",
        status: "monitor" as const,
        detail:
          "Antes do fechamento final, a conta precisa provar leitura útil no uso real, sem depender de interpretação manual do cockpit.",
      },
      {
        title: "Abertura escalável",
        status: "monitor" as const,
        detail:
          "O próximo salto é sair de publicação validada para produto confortável, responsivo e pronto para usuários com perfis distintos.",
      },
    ],
  },
  finalCutoverChecklist: [
    {
      title: "Publicação externa validada",
      owner: "Claw/main",
      status: "ready" as const,
      evidence: "`workers.dev` e `lovable.app` já respondem com o corte novo.",
      exit: "O deploy deixa de ser assunto da etapa e vira base estável para as próximas evoluções.",
    },
    {
      title: "Paridade produto x URL",
      owner: "Claw/main",
      status: "monitor" as const,
      evidence: "Os textos e estados críticos da URL pública acompanham o repositório atual sem drift relevante.",
      exit: "Não existe mais narrativa antiga de blocker técnico no produto publicado.",
    },
    {
      title: "Responsividade do console",
      owner: "Claw/main",
      status: "monitor" as const,
      evidence: "Topbar, shell, cards e telas principais ficam usáveis sem estouro lateral em desktop, tablet e celular.",
      exit: "A navegação do console logado fica confortável para apresentação e operação em múltiplas telas.",
    },
    {
      title: "Acesso por perfil e conta",
      owner: "Claw/main + Sales Ops",
      status: "monitor" as const,
      evidence: "A camada de usuário, convite e escopo por operação fica pronta para Lucas, SDRs e clientes.",
      exit: "Cada perfil entra com seu acesso e vê só o que deve ver, sem depender de chave compartilhada.",
    },
  ],
};

function SettingsPage() {
  const { session } = useAdminAuth();
  const canManageAccess = !!session && canManageAccessProfile(session.profileId);
  const [inviteName, setInviteName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteProfileId, setInviteProfileId] = useState<AccessProfileId>("cliente");
  const [inviteAccessPackageId, setInviteAccessPackageId] = useState(
    defaultAccessPackageForProfile("cliente"),
  );
  const [inviteAllowedRoutes, setInviteAllowedRoutes] = useState<string[]>(
    ACCESS_ROUTE_PACKAGES[defaultAccessPackageForProfile("cliente")].allowedRoutes,
  );
  const [inviteScopeMode, setInviteScopeMode] = useState<AccessScopeMode>("single");
  const [inviteVisibility, setInviteVisibility] = useState<VisibilityMode>("client");
  const [inviteExpiresInHours, setInviteExpiresInHours] = useState("168");
  const [inviteOperationIds, setInviteOperationIds] = useState<string[]>(["incentiva"]);
  const [inviteResult, setInviteResult] = useState<AccessInvitePreview | null>(null);
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [isInviteSubmitting, setIsInviteSubmitting] = useState(false);
  const [registrySnapshot, setRegistrySnapshot] = useState<AccessRegistrySnapshot | null>(null);
  const [registryError, setRegistryError] = useState<string | null>(null);
  const [isRegistryLoading, setIsRegistryLoading] = useState(false);
  const [revokingRegistryId, setRevokingRegistryId] = useState<string | null>(null);

  const isFullPortfolioProfile =
    inviteProfileId === "direcao" || inviteProfileId === "claw" || inviteProfileId === "sales_ops";
  const effectiveInviteScopeMode = isFullPortfolioProfile
    ? "all"
    : inviteProfileId === "cliente"
      ? "single"
      : "multi";

  const inviteOperationScope =
    effectiveInviteScopeMode === "all" ? "all" : inviteOperationIds;

  const inviteMessage = inviteResult
    ? `Acesso liberado para ${inviteResult.name}\nE-mail: ${inviteResult.email}\nPerfil: ${ACCESS_PROFILE_LABELS[inviteResult.profileId]}\nEscopo: ${formatOperationScope(inviteResult.operationIds)}\nVisão liberada: ${ACCESS_PACKAGE_LABELS[inviteResult.accessPackageId]}\nLink: ${inviteResult.inviteUrl}\nValidade: ${new Date(inviteResult.expiresAt).toLocaleString("pt-BR")}`
    : "";

  useEffect(() => {
    const packageRoutes = ACCESS_ROUTE_PACKAGES[inviteAccessPackageId].allowedRoutes;
    setInviteAllowedRoutes((current) => {
      const scoped = current.filter((route) => packageRoutes.includes(route));
      return scoped.length > 0 ? scoped : packageRoutes;
    });
  }, [inviteAccessPackageId]);

  const loadRegistry = async () => {
    if (!canManageAccess) return;

    setIsRegistryLoading(true);
    setRegistryError(null);

    const response = await listAccessRegistryServerFn();
    const payload = (await response.json()) as
      | { ok: true; snapshot: AccessRegistrySnapshot }
      | { ok: false; error?: string };

    setIsRegistryLoading(false);

    if (!response.ok || !payload.ok) {
      setRegistrySnapshot(null);
      setRegistryError(payload.ok ? "Falha ao carregar o registry." : payload.error ?? "Falha ao carregar o registry.");
      return;
    }

    setRegistrySnapshot(payload.snapshot);
    setRegistryError(payload.snapshot.error ?? null);
  };

  useEffect(() => {
    void loadRegistry();
  }, [canManageAccess]);

  const toggleOperation = (operationId: string) => {
    setInviteOperationIds((current) => {
      if (effectiveInviteScopeMode === "single") {
        return current.includes(operationId) ? current : [operationId];
      }

      return current.includes(operationId)
        ? current.filter((value) => value !== operationId)
        : [...current, operationId];
    });
  };

  const applyProfileDefaults = (profileId: AccessProfileId) => {
    const nextPackageId = defaultAccessPackageForProfile(profileId);
    setInviteProfileId(profileId);
    setInviteAccessPackageId(nextPackageId);
    setInviteAllowedRoutes(ACCESS_ROUTE_PACKAGES[nextPackageId].allowedRoutes);
    setInviteVisibility(defaultVisibilityForProfile(profileId));

    const defaultScope = defaultOperationScopeForProfile(profileId);
    if (defaultScope === "all") {
      setInviteScopeMode("all");
      setInviteOperationIds([]);
      return;
    }

    const nextOperationIds =
      defaultScope.length > 0 ? defaultScope : profileId === "cliente" ? ["incentiva"] : [];
    setInviteScopeMode(profileId === "cliente" ? "single" : "multi");
    setInviteOperationIds(nextOperationIds);
  };

  const toggleAllowedRoute = (route: string) => {
    if (inviteProfileId === "direcao" || inviteProfileId === "claw") {
      return;
    }

    const packageRoutes = ACCESS_ROUTE_PACKAGES[inviteAccessPackageId].allowedRoutes;
    if (!packageRoutes.includes(route)) return;

    setInviteAllowedRoutes((current) => {
      const next = current.includes(route)
        ? current.filter((value) => value !== route)
        : [...current, route];
      return next.length > 0 ? next : current;
    });
  };

  const handleCreateInvite = async () => {
    setIsInviteSubmitting(true);
    setInviteError(null);

    const response = await createAccessInviteServerFn({
      data: {
        name: inviteName.trim(),
        email: inviteEmail.trim().toLowerCase(),
        profileId: inviteProfileId,
        accessPackageId: inviteAccessPackageId,
        allowedRoutes: inviteAllowedRoutes,
        operationIds: inviteOperationScope,
        defaultVisibility: inviteVisibility,
        expiresInHours: Number(inviteExpiresInHours) || 168,
      },
    });

    const payload = (await response.json()) as
      | { ok: true; invite: AccessInvitePreview; registry?: { persisted: boolean; backendLabel: string; error?: string | null } }
      | { ok: false; error?: string };

    setIsInviteSubmitting(false);

    if (!response.ok || !payload.ok) {
      setInviteResult(null);
      setInviteError(payload.ok ? "Falha ao gerar o convite." : payload.error ?? "Falha ao gerar o convite.");
      return;
    }

    setInviteResult(payload.invite);
    if (payload.registry?.error) {
      setRegistryError(payload.registry.error);
    } else if (payload.registry?.persisted) {
      await loadRegistry();
    }
  };

  const handleRevokeInvite = async (registryId: string) => {
    setRevokingRegistryId(registryId);
    setRegistryError(null);

    const response = await revokeAccessInviteServerFn({
      data: {
        registryId,
        reason: "Revogado no admin",
      },
    });

    const payload = (await response.json()) as
      | { ok: true }
      | { ok: false; error?: string };

    setRevokingRegistryId(null);

    if (!response.ok || !payload.ok) {
      setRegistryError(payload.ok ? "Falha ao revogar convite." : payload.error ?? "Falha ao revogar convite.");
      return;
    }

    await loadRegistry();
  };

  const copyText = async (value: string) => {
    if (!value || typeof navigator === "undefined" || !navigator.clipboard) return;
    await navigator.clipboard.writeText(value);
  };

  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Configurações"]} />

      <main className="flex-1 w-full max-w-[1600px] mx-auto space-y-6 px-4 py-4 md:px-6 md:py-6">
        <section className="flex flex-wrap items-end justify-between gap-4 pb-2">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge
                variant="outline"
                className="text-[10px] uppercase tracking-[0.18em] border-primary/40 text-primary bg-primary/5 h-5"
              >
                Ambiente e parâmetros
              </Badge>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground text-mono">
                {settings.snapshotLabel}
              </span>
            </div>
            <h1 className="text-[28px] leading-tight font-semibold text-display tracking-tight">
              Configurações
            </h1>
            <p className="text-sm text-muted-foreground max-w-3xl">
              Esta frente organiza fontes, filtros, parâmetros e checkpoints do ambiente para que o
              painel continue legível, governável e seguro à medida que crescer.
            </p>
          </div>

          <Button variant="outline" size="sm" className="h-9 gap-2 bg-surface" asChild>
            <Link to="/portal">
              <ArrowRight className="h-3.5 w-3.5" />
              Ver portal privado
            </Link>
          </Button>
        </section>

        <section className="surface-card p-5">
          <div>
            <h2 className="text-sm font-semibold text-display">Como ler esta frente</h2>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Aqui não entram KPIs de negócio. Esta é a camada que explica de onde vêm os dados,
              quais parâmetros movem o painel e quais checkpoints mantêm o console confiável.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-4">
            <GuideCard
              title="Fontes"
              detail="Mostra qual sistema alimenta cada tipo de leitura."
              icon={Database}
            />
            <GuideCard
              title="Filtros"
              detail="Organiza como a navegação futura vai quebrar operação, canal e família."
              icon={Filter}
            />
            <GuideCard
              title="Parâmetros"
              detail="Centraliza metas, thresholds e regras visuais de interpretação."
              icon={SlidersHorizontal}
            />
            <GuideCard
              title="Segurança"
              detail="Deixa claro onde existe checkpoint de acesso, publish ou credencial sensível."
              icon={Lock}
            />
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Fontes homologadas</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  De onde o console puxa leitura operacional, técnica e comercial.
                </p>
              </div>
              <Database className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {settings.sources.map((source) => (
                <div key={source.title} className="rounded-xl border border-border bg-surface p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="text-sm font-medium">{source.title}</div>
                    <Badge variant="secondary" className="text-[10px] text-mono h-5">
                      {source.owner}
                    </Badge>
                  </div>
                  <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{source.detail}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Princípios do ambiente</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Regras simples para não confundir fonte auxiliar com verdade operacional.
                </p>
              </div>
              <Eye className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {settings.principles.map((principle) => (
                <div key={principle} className="rounded-xl border border-border bg-surface p-4 text-[12px] text-muted-foreground">
                  {principle}
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Grupos de configuração</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Blocos que devem existir quando a camada de configuração deixar de ser só explicativa.
              </p>
            </div>
            <Settings2 className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {settings.groups.map((group) => (
              <GroupCard key={group.title} group={group} />
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Perfis de acesso</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                O perfil define automaticamente o que a pessoa pode ver e quantas operações ela pode abrir.
              </p>
            </div>
            <UserRoundCog className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
            {settings.profiles.map((profile) => (
              <div key={profile.title} className="rounded-xl border border-border bg-surface p-4">
                <div className="text-sm font-medium">{profile.title}</div>
                <div className="mt-2 space-y-2 text-[12px] text-muted-foreground">
                  <p>{profile.scope}</p>
                  <p>{profile.publish}</p>
                  <p>{profile.portal}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Convidar acesso</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Aqui você gera um link de acesso e envia para a pessoa por WhatsApp ou e-mail. Hoje o convite abre uma sessão controlada; ainda não existe senha própria por usuário nesta etapa.
              </p>
            </div>
            <KeyRound className="h-3.5 w-3.5 text-primary" />
          </div>

          {!canManageAccess ? (
            <div className="rounded-xl border border-border bg-surface p-4 text-[12px] text-muted-foreground">
              Esta área fica disponível apenas para perfis de direção e Claw/main. Quando o Lucas entrar como direção, herda esta capacidade automaticamente.
            </div>
          ) : (
            <>
              <div className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
                <div className="rounded-2xl border border-border bg-surface p-4">
                <div className="mb-4 rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-[12px] text-muted-foreground">
                  Fluxo: você informa <span className="text-foreground font-medium">nome</span>, <span className="text-foreground font-medium">e-mail real</span>, escolhe o <span className="text-foreground font-medium">perfil</span>, define as <span className="text-foreground font-medium">operações</span> quando fizer sentido e gera um <span className="text-foreground font-medium">link</span> para enviar.
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      Nome da pessoa
                    </label>
                    <Input
                      value={inviteName}
                      onChange={(event) => setInviteName(event.target.value)}
                      placeholder="Ex.: João Silva"
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      E-mail real
                    </label>
                    <Input
                      type="email"
                      value={inviteEmail}
                      onChange={(event) => setInviteEmail(event.target.value)}
                      placeholder="nome@empresa.com"
                      className="bg-background"
                    />
                  </div>
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      Perfil
                    </label>
                    <select
                      value={inviteProfileId}
                      onChange={(event) => applyProfileDefaults(event.target.value as AccessProfileId)}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="cliente">Cliente</option>
                      <option value="sdr">SDR</option>
                      <option value="sales_ops">Sales Ops</option>
                      <option value="direcao">Direção</option>
                      <option value="claw">Claw/main</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      Regra de acesso
                    </label>
                    <div className="rounded-xl border border-input bg-background px-3 py-2 text-sm text-foreground min-h-10 flex items-center">
                      {ACCESS_SCOPE_LABELS[effectiveInviteScopeMode]}
                    </div>
                    <p className="text-[11px] leading-relaxed text-muted-foreground">{ACCESS_SCOPE_DESCRIPTIONS[effectiveInviteScopeMode]}</p>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                      Validade
                    </label>
                    <select
                      value={inviteExpiresInHours}
                      onChange={(event) => setInviteExpiresInHours(event.target.value)}
                      className="h-10 w-full rounded-xl border border-input bg-background px-3 text-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
                    >
                      <option value="24">24 horas</option>
                      <option value="72">3 dias</option>
                      <option value="168">7 dias</option>
                      <option value="720">30 dias</option>
                    </select>
                  </div>
                </div>

                <div className="mt-4 rounded-xl border border-border bg-background/80 p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                    Operações liberadas
                  </div>
                  {inviteOperationScope === "all" ? (
                    <p className="mt-2 text-[12px] text-muted-foreground">
                      Este perfil já enxerga a carteira inteira por padrão.
                    </p>
                  ) : (
                    <div className="mt-3">
                      <p className="mb-3 text-[12px] text-muted-foreground">
                        {effectiveInviteScopeMode === "single"
                          ? "Escolha a única operação que esta pessoa poderá abrir."
                          : "Escolha uma ou mais operações liberadas para esta pessoa."}
                      </p>
                      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-3">
                      {ACCESS_OPERATION_OPTIONS.map((operation) => {
                        const checked = inviteOperationIds.includes(operation.id);
                        return (
                          <label
                            key={operation.id}
                            className={cn(
                              "flex items-center gap-2 rounded-lg border px-3 py-2 text-[12px] transition-colors cursor-pointer",
                              checked
                                ? "border-primary/40 bg-primary/5 text-foreground"
                                : "border-border bg-background text-muted-foreground",
                            )}
                          >
                            <input
                              type={effectiveInviteScopeMode === "single" ? "radio" : "checkbox"}
                              name="invite-operation-scope"
                              checked={checked}
                              onChange={() => toggleOperation(operation.id)}
                              className="h-3.5 w-3.5"
                            />
                            <span>{operation.label}</span>
                          </label>
                        );
                      })}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-4 rounded-xl border border-border bg-background/80 p-4 text-[12px] text-muted-foreground">
                  <span className="text-foreground font-medium">Visão liberada:</span>{" "}
                  {ACCESS_PACKAGE_LABELS[inviteAccessPackageId]}. O sistema define isso automaticamente com base no perfil para evitar erro de configuração.
                </div>

                {inviteError && (
                  <div className="mt-4 rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                    {inviteError}
                  </div>
                )}

                <div className="mt-4 flex flex-wrap gap-3">
                  <Button
                    type="button"
                    onClick={handleCreateInvite}
                    disabled={isInviteSubmitting}
                  >
                    {isInviteSubmitting ? "Gerando link..." : "Gerar link de acesso"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setInviteResult(null);
                      setInviteError(null);
                    }}
                  >
                    Limpar
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-surface p-4">
                  <div className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">Link pronto para envio</div>
                {inviteResult ? (
                  <div className="mt-3 space-y-4">
                    <div className="rounded-xl border border-border bg-background/80 p-4">
                      <div className="text-sm font-medium text-foreground">{inviteResult.name}</div>
                      <div className="mt-1 text-[12px] text-muted-foreground">
                        {inviteResult.email}
                      </div>
                      <div className="mt-3 grid gap-3 md:grid-cols-2">
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            Perfil
                          </div>
                          <div className="mt-1 text-[12px] text-foreground">
                            {ACCESS_PROFILE_LABELS[inviteResult.profileId]}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            Operações
                          </div>
                          <div className="mt-1 text-[12px] text-foreground">
                            {formatOperationScope(inviteResult.operationIds)}
                          </div>
                        </div>
                        <div>
                          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            Nível
                          </div>
                          <div className="mt-1 text-[12px] text-foreground">
                            {ACCESS_SCOPE_LABELS[resolveAccessScopeMode(inviteResult.operationIds)]}
                          </div>
                        </div>
                        <div className="md:col-span-2">
                          <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                            Visão liberada
                          </div>
                          <div className="mt-1 text-[12px] text-foreground">
                            {ACCESS_PACKAGE_LABELS[inviteResult.accessPackageId]}
                          </div>
                        </div>
                      </div>
                      <div className="mt-3 text-[12px] text-muted-foreground">
                        Válido até {new Date(inviteResult.expiresAt).toLocaleString("pt-BR")}.
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Link de convite
                      </label>
                      <Input readOnly value={inviteResult.inviteUrl} className="bg-background text-[12px]" />
                    </div>

                    <div className="space-y-2">
                      <label className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                        Texto pronto para enviar
                      </label>
                      <Textarea readOnly value={inviteMessage} className="min-h-[150px] bg-background text-[12px]" />
                    </div>

                    <div className="flex flex-wrap gap-3">
                      <Button type="button" variant="outline" onClick={() => void copyText(inviteResult.inviteUrl)}>
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Copiar link
                      </Button>
                      <Button type="button" variant="outline" onClick={() => void copyText(inviteMessage)}>
                        <Copy className="mr-2 h-3.5 w-3.5" />
                        Copiar texto
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="mt-3 rounded-xl border border-dashed border-border bg-background/60 p-4 text-[12px] text-muted-foreground">
                    Gere um link para receber aqui o resumo do acesso e um texto pronto para distribuição.
                  </div>
                )}
                </div>
              </div>

              <div className="mt-4 rounded-2xl border border-border bg-surface p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="text-sm font-semibold text-display">Acessos emitidos</div>
                  <p className="mt-1 text-[11px] text-muted-foreground">
                    Aqui aparecem apenas convites reais emitidos. Nada de e-mail exemplo ou diretório fictício.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className={cn(
                      "h-5 text-[10px] uppercase tracking-[0.16em]",
                      registrySnapshot?.configured
                        ? "border-primary/30 text-primary"
                        : "border-border text-muted-foreground",
                    )}
                  >
                    {registrySnapshot?.backendLabel ?? "Carregando backend"}
                  </Badge>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-8 gap-2"
                    onClick={() => void loadRegistry()}
                    disabled={isRegistryLoading}
                  >
                    <RefreshCcw className={cn("h-3.5 w-3.5", isRegistryLoading && "animate-spin")} />
                    Atualizar
                  </Button>
                </div>
              </div>

              {registryError && (
                <div className="mt-4 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-[12px] text-amber-700 dark:text-amber-300">
                  {registryError}
                </div>
              )}

              {!registrySnapshot?.configured ? (
                <div className="mt-4 rounded-xl border border-dashed border-border bg-background/60 p-4 text-[12px] text-muted-foreground">
                  O link funciona, mas o histórico ainda não está salvo no backend.
                </div>
              ) : registrySnapshot.entries.length === 0 ? (
                <div className="mt-4 rounded-xl border border-dashed border-border bg-background/60 p-4 text-[12px] text-muted-foreground">
                  Nenhum acesso foi emitido ainda.
                </div>
              ) : (
                <div className="mt-4 space-y-3">
                  {registrySnapshot.entries.map((entry) => {
                    const effectiveStatus = resolveEffectiveInviteStatus(entry);
                    const canRevoke = effectiveStatus === "issued";

                    return (
                      <div key={entry.id} className="rounded-xl border border-border bg-background/80 p-4">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-medium text-foreground">{entry.name}</div>
                            <div className="mt-1 text-[12px] text-muted-foreground">{entry.email}</div>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            <Badge variant="outline" className="h-5 text-[10px] uppercase tracking-[0.16em]">
                              {ACCESS_PROFILE_LABELS[entry.profileId]}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "h-5 text-[10px] uppercase tracking-[0.16em]",
                                effectiveStatus === "accepted" && "border-primary/30 text-primary",
                                effectiveStatus === "revoked" && "border-destructive/30 text-destructive",
                                effectiveStatus === "expired" && "border-amber-500/30 text-amber-700 dark:text-amber-300",
                              )}
                            >
                              {ACCESS_REGISTRY_STATUS_LABELS[effectiveStatus]}
                            </Badge>
                          </div>
                        </div>

                        <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                          <RegistryMeta
                            label="Nível"
                            value={ACCESS_SCOPE_LABELS[resolveAccessScopeMode(entry.operationIds)]}
                          />
                          <RegistryMeta label="Visão" value={ACCESS_PACKAGE_LABELS[entry.accessPackageId]} />
                          <RegistryMeta label="Operações" value={formatOperationScope(entry.operationIds)} />
                          <RegistryMeta
                            label="Emitido em"
                            value={new Date(entry.inviteIssuedAt).toLocaleString("pt-BR")}
                          />
                          <RegistryMeta
                            label="Expira em"
                            value={new Date(entry.inviteExpiresAt).toLocaleString("pt-BR")}
                          />
                        </div>

                        <div className="mt-3 text-[12px] text-muted-foreground">
                          Emitido por <span className="text-foreground font-medium">{entry.invitedByName}</span>
                          {entry.acceptedAt
                            ? ` • aceito em ${new Date(entry.acceptedAt).toLocaleString("pt-BR")}`
                            : ""}
                          {entry.revokedAt
                            ? ` • revogado em ${new Date(entry.revokedAt).toLocaleString("pt-BR")}`
                            : ""}
                        </div>

                        {canRevoke ? (
                          <div className="mt-3">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => void handleRevokeInvite(entry.id)}
                              disabled={revokingRegistryId === entry.id}
                            >
                              {revokingRegistryId === entry.id ? "Revogando..." : "Revogar convite"}
                            </Button>
                          </div>
                        ) : null}
                      </div>
                    );
                  })}
                </div>
              )}
              </div>
            </>
          )}
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Visões de acesso</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Resumo do que cada tipo de acesso libera hoje no produto.
              </p>
            </div>
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            {Object.entries(ACCESS_ROUTE_PACKAGES).map(([packageId, pkg]) => (
              <div key={packageId} className="rounded-xl border border-border bg-surface p-4">
                <div className="text-sm font-medium text-foreground">{pkg.label}</div>
                <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">
                  {pkg.description}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {formatAllowedRouteLabels(pkg.allowedRoutes).map((label) => (
                    <Badge key={`${packageId}-${label}`} variant="secondary" className="h-5 text-[10px]">
                      {label}
                    </Badge>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Abertura externa</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  O que já está controlado e o que ainda depende de evolução do produto.
                </p>
              </div>
              <GlobeLock className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {settings.publishStages.map((stage) => (
                <PublishStageCard key={stage.title} stage={stage} />
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Como o link funciona</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Nesta etapa, o acesso acontece por link controlado.
                </p>
              </div>
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              <div className="rounded-xl border border-border bg-surface p-4 text-[12px] text-muted-foreground">
                1. Você informa o nome e o e-mail real da pessoa.
              </div>
              <div className="rounded-xl border border-border bg-surface p-4 text-[12px] text-muted-foreground">
                2. O sistema define o escopo pelo perfil e pelas operações liberadas.
              </div>
              <div className="rounded-xl border border-border bg-surface p-4 text-[12px] text-muted-foreground">
                3. Você envia o link por WhatsApp ou e-mail.
              </div>
              <div className="rounded-xl border border-border bg-surface p-4 text-[12px] text-muted-foreground">
                4. A pessoa abre o link e ativa a sessão controlada para aquele acesso.
              </div>
            </div>
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Prontidão para publicação final</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Régua executiva do quanto já fechamos do rollout final em relação ao que foi alinhado.
              </p>
            </div>
            <TimerReset className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-1">
                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.16em] h-5 border-primary/30 text-primary">
                  {settings.finalPublishReadiness.stage}
                </Badge>
                <div className="text-3xl font-semibold text-display">
                  {settings.finalPublishReadiness.percent}%
                </div>
                <p className="text-[12px] leading-relaxed text-muted-foreground max-w-3xl">
                  {settings.finalPublishReadiness.headline}
                </p>
              </div>

              <div className="min-w-[220px] rounded-xl border border-border bg-background/80 px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                  Etapa atual
                </div>
                <div className="mt-1 text-sm font-medium text-foreground">
                  Homologação avançada com última milha pendente
                </div>
                <div className="mt-2 h-2 rounded-full bg-border overflow-hidden">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{ width: `${settings.finalPublishReadiness.percent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-3">
            <ReadinessColumn
              title="Já fechado"
              icon={CheckCircle2}
              items={settings.finalPublishReadiness.completed}
              tone="healthy"
            />
            <ReadinessColumn
              title="Falta fechar"
              icon={Workflow}
              items={settings.finalPublishReadiness.missing}
              tone="monitor"
            />
            <ReadinessColumn
              title="Risco material"
              icon={TriangleAlert}
              items={settings.finalPublishReadiness.risks}
              tone="risk"
            />
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Paridade da publicação final</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {settings.publicCutover.detail}
              </p>
            </div>
            <GlobeLock className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 xl:grid-cols-4">
            {settings.publicCutover.steps.map((step) => (
              <PublishParityCard
                key={step.title}
                title={step.title}
                detail={step.detail}
                status={step.status}
              />
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Checklist mínimo da próxima rodada</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Dono, evidência e critério de saída para fechar a próxima etapa sem ambiguidade.
              </p>
            </div>
            <Workflow className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 xl:grid-cols-2">
            {settings.finalCutoverChecklist.map((item) => (
              <CutoverChecklistCard
                key={item.title}
                title={item.title}
                owner={item.owner}
                status={item.status}
                evidence={item.evidence}
                exit={item.exit}
              />
            ))}
          </div>
        </section>

        <section className="surface-card p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-sm font-semibold text-display">Gates do portal</h2>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Checklist do que precisa estar pronto antes de abrir o software para leitura externa real.
              </p>
            </div>
            <ShieldCheck className="h-3.5 w-3.5 text-primary" />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            {settings.rolloutGates.map((gate) => (
              <div key={gate} className="rounded-xl border border-border bg-surface p-4 text-[12px] text-muted-foreground">
                {gate}
              </div>
            ))}
          </div>
        </section>

        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <MiniCard
            icon={Workflow}
            title="Deploy / publish"
            detail="O deploy já saiu do caminho crítico; agora esse checkpoint serve para manter paridade entre a URL publicada e a evolução rápida do produto."
          />
          <MiniCard
            icon={Layers3}
            title="Snapshot fallback"
            detail="A frente já deixa claro quando a leitura veio de snapshot local e quando veio de fonte principal ao vivo."
          />
          <MiniCard
            icon={KeyRound}
            title="Credenciais sensíveis"
            detail="Acesso e alteração estrutural continuam concentrados em Claw/main e nos checkpoints homologados."
          />
        </section>
      </main>
    </>
  );
}

function RegistryMeta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.16em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-[12px] text-foreground">{value}</div>
    </div>
  );
}

function GuideCard({
  title,
  detail,
  icon: Icon,
}: {
  title: string;
  detail: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function GroupCard({
  group,
}: {
  group: { title: string; items: string[] };
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="text-sm font-medium">{group.title}</div>
      <div className="mt-3 space-y-2">
        {group.items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-[12px] text-muted-foreground">
            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function MiniCard({
  icon: Icon,
  title,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  detail: string;
}) {
  return (
    <div className="surface-card p-5">
      <div className="flex items-center gap-2 text-sm font-medium">
        <Icon className="h-4 w-4 text-primary" />
        {title}
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function PublishStageCard({
  stage,
}: {
  stage: { title: string; detail: string; health: "healthy" | "monitor" | "risk" | "critical" };
}) {
  const meta = {
    healthy: "text-[color:var(--color-success)]",
    monitor: "text-[color:var(--color-info)]",
    risk: "text-[color:var(--color-warning)]",
    critical: "text-destructive",
  } as const;

  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="text-sm font-medium">{stage.title}</div>
        <Badge variant="outline" className={meta[stage.health]}>
          {stage.health}
        </Badge>
      </div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{stage.detail}</p>
    </div>
  );
}

function ReadinessColumn({
  title,
  icon: Icon,
  items,
  tone,
}: {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: string[];
  tone: "healthy" | "monitor" | "risk";
}) {
  const toneClass =
    tone === "healthy"
      ? "border-emerald-500/20 bg-emerald-500/5 text-emerald-600"
      : tone === "risk"
        ? "border-amber-500/20 bg-amber-500/5 text-amber-700"
        : "border-primary/20 bg-primary/5 text-primary";

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <div className={toneClass + " rounded-xl border p-2"}>
          <Icon className="h-4 w-4" />
        </div>
        {title}
      </div>
      <div className="mt-3 space-y-2">
        {items.map((item) => (
          <div key={item} className="flex items-start gap-2 text-[12px] leading-relaxed text-muted-foreground">
            <div className="mt-1 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
            <span>{item}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function PublishParityCard({
  title,
  detail,
  status,
}: {
  title: string;
  detail: string;
  status: "ready" | "monitor" | "blocked";
}) {
  const meta =
    status === "ready"
      ? {
          label: "Fechado",
          className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
        }
      : status === "monitor"
        ? {
            label: "Em fechamento",
            className: "border-amber-500/20 bg-amber-500/10 text-amber-700",
          }
        : {
            label: "Ainda não",
            className: "border-rose-500/20 bg-rose-500/10 text-rose-700",
          };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", meta.className)}>
        {meta.label}
      </Badge>
      <div className="mt-3 text-sm font-medium text-foreground">{title}</div>
      <p className="mt-2 text-[12px] leading-relaxed text-muted-foreground">{detail}</p>
    </div>
  );
}

function CutoverChecklistCard({
  title,
  owner,
  status,
  evidence,
  exit,
}: {
  title: string;
  owner: string;
  status: "ready" | "monitor" | "blocked";
  evidence: string;
  exit: string;
}) {
  const meta =
    status === "ready"
      ? {
          label: "Fechado",
          className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-700",
        }
      : status === "monitor"
        ? {
            label: "Em fechamento",
            className: "border-amber-500/20 bg-amber-500/10 text-amber-700",
          }
        : {
            label: "Bloqueado",
            className: "border-rose-500/20 bg-rose-500/10 text-rose-700",
          };

  return (
    <div className="rounded-2xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-medium text-foreground">{title}</div>
          <div className="mt-1 text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {owner}
          </div>
        </div>
        <Badge variant="outline" className={cn("text-[10px] uppercase tracking-[0.16em] h-5", meta.className)}>
          {meta.label}
        </Badge>
      </div>
      <div className="mt-3 space-y-2 text-[12px] leading-relaxed text-muted-foreground">
        <p>
          <span className="font-medium text-foreground">Evidência:</span> {evidence}
        </p>
        <p>
          <span className="font-medium text-foreground">Critério de saída:</span> {exit}
        </p>
      </div>
    </div>
  );
}
