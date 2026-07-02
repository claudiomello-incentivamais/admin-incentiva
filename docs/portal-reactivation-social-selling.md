# Portal Reactivation + Social Selling

## Objetivo

Abrir duas camadas novas no `Portal` sem misturar maturidades diferentes:

- `Reativação / retomada` entra como módulo operacional já nesta fase
- `Social Selling` entra como frente progressiva de `V2 / V3`

## Regra de produto

- `Portal` é a tela client-facing principal
- `Notion` continua com cara de pipeline e operação do lead
- indicadores mais analíticos, comparativos e cruzados por recorte ficam no `Portal`

## Reativação / retomada

### V1

Entrar no `Portal` com:

- saúde dos workflows da família `reativacao`
- execuções `hoje` e `7d`
- erros e waiting
- nota explícita de que a conversão comercial ainda depende da trilha append-only marcar a origem da ação

### V2

Subir leitura analítica real por recorte:

- disparos de reativação
- respostas de reativação
- conversão de reativação por etapa
- filtros por `setor`, `porte` e `cargo`

### Dependência estrutural

Para a leitura de reativação não canibalizar outbound principal, a trilha append-only deve passar a carregar um campo semântico de origem da ação, por exemplo:

- `motion_scope`: `outbound`, `reativacao`, `social_selling`

Sem isso, o `Portal` consegue mostrar operação técnica da reativação, mas não deve prometer conversão histórica perfeita dessa frente.

## Social Selling

### V1

Entrar só como camada de prontidão:

- workflows `linkedin_social` ativos/inativos
- execuções `hoje` e `7d`
- erros e waiting
- explicação curta de que a frente ainda não tem leitura client-facing completa porque o calendário editorial e a produção ainda estão começando

### V2

Quando a frente de conteúdo começar a operar, o `Portal` passa a ler:

- calendário editorial planejado
- peças em produção
- peças publicadas
- ponte conteúdo -> outreach
- sinais assistidos de LinkedIn social

### V3

Depois da operação viva amadurecer:

- correlação entre conteúdo/social selling e conversão comercial
- leitura por `setor`, `porte` e `cargo`
- comparação entre densidade social e resposta comercial

## Princípio de governança

- não inventar KPI sem fonte viva suficiente
- mostrar prontidão técnica antes de prometer inteligência comercial
- complementar o `Notion`, não duplicar painel com a mesma semântica
