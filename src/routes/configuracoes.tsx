import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  Database,
  Eye,
  Filter,
  GlobeLock,
  KeyRound,
  Layers3,
  Lock,
  ShieldCheck,
  Settings2,
  SlidersHorizontal,
  UserRoundCog,
  Workflow,
} from "lucide-react";

import { Topbar } from "@/components/admin/Topbar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
    "Qualquer publish precisa virar checkpoint explícito enquanto o deploy não estiver automático.",
  ],
  profiles: [
    {
      title: "Direção",
      scope: "Carteira inteira + governança + suporte + faturamento",
      publish: "Pode ver tudo",
      portal: "Não usa portal; usa admin completo",
    },
    {
      title: "Claw/main",
      scope: "Leitura e edição estrutural do sistema",
      publish: "Pode validar corte e publish",
      portal: "Pode preparar e homologar o portal",
    },
    {
      title: "Sales Ops",
      scope: "Só operações atribuídas e suas frentes de execução",
      publish: "Leitura autenticada por escopo",
      portal: "Pode operar o portal da própria carteira",
    },
    {
      title: "Cliente",
      scope: "Só a própria operação e leitura externa homologada",
      publish: "Leitura privada e limitada",
      portal: "Consome o portal da própria conta",
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
      title: "Posterior · fontes vivas na camada externa",
      detail: "Trello e Notion entram no mesmo recorte publicado sem obrigar leitura distribuída fora do produto.",
      health: "risk",
    },
  ],
  rolloutGates: [
    "Sessão real por papel já fechada no servidor.",
    "Recorte cliente-safe por operação já definido no portal.",
    "Pacote privado por conta precisa virar checkpoint padrão de abertura externa.",
    "Trello e Notion ainda precisam entrar como leitura viva dentro da visão publicada.",
  ],
};

function SettingsPage() {
  return (
    <>
      <Topbar breadcrumb={["Console Incentiva", "Configurações"]} />

      <main className="flex-1 px-6 py-6 space-y-6 max-w-[1600px] w-full mx-auto">
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

        <section className="grid grid-cols-1 xl:grid-cols-[1fr_1fr] gap-4">
          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Perfis e visibilidade</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Base material do Bloco 4 para separar direção, operação e leitura cliente.
                </p>
              </div>
              <UserRoundCog className="h-3.5 w-3.5 text-primary" />
            </div>

            <div className="space-y-3">
              {settings.profiles.map((profile) => (
                <div key={profile.title} className="rounded-xl border border-border bg-surface p-4">
                  <div className="text-sm font-medium">{profile.title}</div>
                  <div className="mt-2 space-y-2 text-[12px] text-muted-foreground">
                    <p><span className="text-foreground font-medium">Escopo:</span> {profile.scope}</p>
                    <p><span className="text-foreground font-medium">Publish:</span> {profile.publish}</p>
                    <p><span className="text-foreground font-medium">Portal:</span> {profile.portal}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="surface-card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-display">Privacidade de publish</h2>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Evolução esperada da publicação até virar software governado por papel.
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
            detail="Enquanto a publicação não refletir automaticamente o branch, esse checkpoint continua sendo parte da configuração do ambiente."
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
