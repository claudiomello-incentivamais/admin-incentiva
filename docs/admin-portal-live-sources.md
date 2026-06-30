# Admin Portal Live Sources

## Objetivo

Materializar dentro do recorte publicado do portal uma leitura mais real de `Notion` e `Trello`,
sem depender de navegação distribuída para fora do produto.

## O que entrou

- `Notion` no portal agora usa a leitura viva já consolidada na governança via `Supabase`
  (`admin_global_v1`), aproveitando:
  - `notion_total_records`
  - `match_rate_pct`
  - `canonical_stage_alignment_pct`
  - `status_mismatch_count`
  - `notion_only_count`
  - `refreshed_at`
- `Trello` entrou no recorte publicado como checkpoint operacional a partir do estado já
  materializado na operação, com:
  - card aberto ou ausência de card
  - última observação
  - sinal mínimo de execução para a conta

## Decisão de produto

Não foi criada uma integração fake fingindo sync direto com provedores externos.

Entrou primeiro o melhor sinal real já disponível no stack:

- `Notion` como leitura viva da governança
- `Trello` como estado operacional já rastreado na operação

Assim o produto ganha verdade operacional antes de ganhar profundidade total de provider.

## Resultado

O portal privado por conta passa a mostrar:

- o que já tem reconciliação comercial viva
- o que já tem checkpoint de execução aberto
- quando essa leitura foi observada
- qual camada ainda precisa de aprofundamento

## Próximo passo

Aprofundar essa camada para incluir:

- `owner`
- etapa do card
- histórico
- drill-down da divergência comercial
- sync mais direto por fonte quando a governança de credenciais estiver pronta
