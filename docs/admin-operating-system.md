# Admin Operating System

## Objetivo

Transformar o painel da Incentiva em um software operacional central, reduzindo dependência de reports soltos e consolidando leitura, diagnóstico, ação e acompanhamento em um único fluxo.

## Princípio de desenho

- `Admin` = governança, diagnóstico, observabilidade e comando
- `Notion` = operação SDR e pipeline por operação
- `Trello` = execução, follow-up e visibilidade de tarefa
- `Discord` = acionamento, exceção e handoff
- `Supabase + n8n VPS + VPS + integrações` = motores e fontes de verdade

## O que o admin central precisa cobrir

### 1. Carteira e visão executiva

- operações
- clientes
- score
- prioridade
- risco
- cobertura
- conversão
- faturamento
- concentração de receita

### 2. Saúde operacional

- workflows do `n8n VPS`
- waiting
- erro
- throughput
- gargalos por família
- alertas críticos
- fila operacional

### 3. Saúde de infraestrutura

- VPS
- n8n VPS
- Evolution API
- serviços críticos
- CPU, RAM e disco
- uptime

### 4. Governança de IA

- agentes ativos
- modelo configurado
- fallback
- sessão válida
- cobertura operacional

### 5. Camada de ação

- plano de ação sugerido
- criação/atualização de card no `Trello`
- acionamento no `Discord`
- acionamento do `Claw`
- acionamento do `Sales Ops`

## O que continua fora do admin

### Notion

Continua como frente principal de operação SDR.

Usos mantidos:

- pipeline da operação
- motivos de perda
- qualificação manual
- leitura tática comercial
- operação diária do time

### Trello

Continua como frente principal de execução.

Usos mantidos:

- cards
- dono
- prazo
- etapa
- follow-up

### Discord

Continua como camada de acionamento.

Usos mantidos:

- alerta crítico
- exceção
- handoff
- desbloqueio rápido

## Fonte de verdade por camada

- `Supabase` = base, estágio canônico, score, governança, SLA, dados replicáveis por operação
- `n8n VPS` = saúde dos workflows, waiting, erro, throughput, webhook
- `Notion` = pipeline operacional e rotina SDR
- `Trello` = execução e acompanhamento
- `Admin` = consolidação e leitura transversal

## Perfis previstos

- `Direção`
  - visão total do sistema
- `Sales Ops / SDR`
  - acesso só às operações atribuídas
- `Cliente`
  - acesso apenas à própria operação

## Gatilho para subida de plano Lovable

Permanecer em `Pro` enquanto:

- o painel estiver em montagem
- o uso for controlado
- a URL publicada ainda não exigir privacidade real por perfil

Subir para `Business` quando entrar um destes gatilhos:

- login privado de verdade
- uso interno com múltiplos perfis
- restrição de acesso ao app publicado
- portal por cliente/operação

## Roadmap

### Até 2026-07-03

- fechar arquitetura `Admin x Notion x Trello x Discord`
- consolidar mapa de módulos
- consolidar papéis e fronteiras
- deixar o admin mais navegável e menos teórico

### Até 2026-07-10

- fortalecer V1 interna
- subir primeira camada relevante de observabilidade
- consolidar diagnóstico + ação

### 2026-07-13 a 2026-07-24

- perfis
- privacidade
- portal por operação/cliente
- avaliação real de migração para `Business`

## Regra de ouro

O objetivo não é criar mais uma tela.

O objetivo é criar um sistema onde:

1. o dado é consolidado
2. o problema é explicado
3. a ação é aberta
4. a execução é acompanhada
5. o fechamento é validado
