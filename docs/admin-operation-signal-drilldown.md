# Admin Operation Signal Drilldown

## Objetivo

Subir um segundo nível de leitura para `Notion` e `Trello` dentro do produto, saindo de
`tem sinal / não tem sinal` para uma leitura mais operacional por conta.

## O que entrou

- `Portal`
  - cards de fonte agora mostram:
    - `owner`
    - `etapa`
    - `segmento`
    - `histórico`
    - próximo salto recomendado
- `Operações`
  - a conta selecionada ganhou o mesmo drill-down dentro do cockpit, sem depender de abrir o portal

## Sinais usados

### Notion

Leitura viva já consolidada na governança:

- `notion_total_records`
- `match_rate_pct`
- `canonical_stage_alignment_pct`
- `status_mismatch_count`
- `notion_only_count`
- `refreshed_at`

### Trello

Leitura operacional derivada do estado já materializado da operação:

- `status`
- `count`
- `lastAlertAt`
- `lastObservedAt`
- `cardUrl`
- recorte por tabela/segmento da operação
- apoio de `base_hygiene` / `lastMentionedAt` quando disponível

## Decisão de produto

Não tentamos fingir leitura direta de provider onde ainda não existe governança pronta.

O produto agora mostra:

- quem segura a camada comercial
- em que estágio está a reconciliação
- que segmento/tabela caiu em checkpoint de execução
- qual histórico recente já existe para a conta

## Próximo passo

Fechar profundidade final com:

- `owner` real do card
- etapa real do card no board
- histórico navegável
- link entre divergência comercial e ação operacional correspondente
