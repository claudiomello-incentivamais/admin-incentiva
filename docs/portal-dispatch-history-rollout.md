# Portal Dispatch History Rollout

## Objetivo

Trocar a leitura histórica de `E-mail`, `WhatsApp` e `LinkedIn` no `Portal` de colunas
sobrepostas de estado para uma trilha append-only de disparos por tentativa.

## Regra de modelagem

- `status_email`, `status_whatsapp`, `status_linkedin`, `Disparo Mensagem` e `step`
  continuam valendo apenas para `estado atual / último touch`.
- O histórico de volume por canal passa a ler exclusivamente `portal_dispatch_events_v1`.
- Cada workflow deve gravar `1` linha por `envio/tentativa`.
- A gravação deve ser idempotente via `idempotency_key`.

## Contrato mínimo por evento

Campos obrigatórios:

- `operation_name`
- `channel`
- `event_type`
- `event_at`

Campos recomendados para rastreabilidade:

- `page_id`
- `lead_key`
- `nome`
- `empresa`
- `workflow_name`
- `execution_id`
- `provider_message_id`
- `metadata`

## Convenção de evento

Esta tabela deve guardar apenas eventos de `disparo/tentativa`, não replies nem sinais
sociais paralelos. Assim o card do Portal pode contar linhas sem inflar volume.

Eventos recomendados:

- `attempt_sent`
- `attempt_invalid_target`
- `attempt_provider_error`
- `attempt_suppressed`

## Evidência viva auditada no n8n VPS em 2026-07-02

### E-mail

Família viva auditada:

- `Incentiva - Prospecção Ativa - Outbound - E-mail - FUP1 (1/2)`
- `Incentiva - Prospecção Ativa - Outbound - Email - FUP1 (2/2)`
- `Incentiva - Prospecção Ativa - Outbound - Email - FUP2`
- `Incentiva - Prospecção Ativa - Outbound - Email - FUP3`
- `Incentiva - Prospecção Ativa - Outbound - Email - FUP4`

Escrita legada observada:

- `Supabase/Sheets`: `Status`, `Data do Envio`, `Estágio`, `Data de Início`
- `Notion`: `FollowUp`, `Status`, `Data de Envio`, `Disparo de Mensagem = E-mail`

Leitura importante:

- nos workflows vivos auditados, o histórico de e-mail não está nascendo de `Status E-mail`
- o sinal histórico real que ainda sobra hoje está em `Disparo de Mensagem` no Notion

### WhatsApp

Família viva auditada:

- `Incentiva - Prospecção Ativa - Outbound - WhatsApp - FUP1`
- `Incentiva - Prospecção Ativa - Outbound - WhatsApp - FUP2`
- `Incentiva - Prospecção Ativa - Outbound - WhatsApp - FUP3`
- `Incentiva - Prospecção Ativa - Outbound - WhatsApp - FUP4`
- `Incentiva - Prospecção Ativa - Leads - WhatsApp - FUP1`
- `Incentiva - Prospecção Ativa - Leads - WhatsApp - FUP2`
- `Incentiva - Prospecção Ativa - Leads - WhatsApp - FUP3`
- `Incentiva - Prospecção Ativa - Leads - WhatsApp - FUP4`

Escrita legada observada:

- `Supabase/Sheets`: `Status = FollowUp*_wpp`, `Data do Envio`
- `Supabase`: `followup_locked`, `next_followup_allowed_at`
- `Notion`: `FollowUp`, `Data de Envio`, `Disparo de Mensagem = WhatsApp`

Leitura importante:

- nos workflows vivos auditados da Incentiva, o histórico de envio não está apoiado em
  `Status_wpp`; ele está espalhado entre `Status` operacional e `Disparo de Mensagem`
- dumps legados de cloud ainda mostram uso de `Status_wpp`, então essa coluna segue como
  passivo de compatibilidade, não como fonte confiável de volume

### LinkedIn

Família viva auditada:

- `Incentiva - Prospecção Ativa - Outbound - LinkedIn - Conexão`
- `Incentiva - Prospecção Ativa - Outbound - LinkedIn - FUP1`
- `Incentiva - Prospecção Ativa - Outbound - LinkedIn - FUP2`
- `Incentiva - Prospecção Ativa - Outbound - LinkedIn - FUP3`
- `Incentiva - Prospecção Ativa - Outbound - LinkedIn - FUP4`
- `Incentiva - Prospecção Ativa - Outbound - LinkedIn - Visitar Perfil`
- `Incentiva - Prospecção Ativa - Leads - LinkedIn - FUP1`
- `Incentiva - Prospecção Ativa - Leads - LinkedIn - FUP2`
- `Incentiva - Prospecção Ativa - Leads - LinkedIn - FUP3`
- `Incentiva - Prospecção Ativa - Leads - Linkedin - FUP4`
- `7. Incentiva - Prospecção Ativa - Agente Conversa Unipile LinkedIn`

Escrita legada observada:

- `Supabase`: `Status LinkedIn`
- `Supabase`: `linkedin_stage`, `linkedin_last_event_at`, `linkedin_last_message_at`,
  `linkedin_next_best_action`, `linkedin_cooldown_until`, `send_suppressed_until`,
  `suppression_reason`, `cross_channel_last_touch_at`, `linkedin_touch_count_7d`
- `Notion`: `Status LinkedIn`

Leitura importante:

- LinkedIn hoje já tem semântica operacional mais rica que E-mail/WhatsApp
- isso não substitui a trilha append-only de disparos/tentativas para o Portal

## `step`

Na auditoria viva da Incentiva, não apareceu escrita explícita de `step` dentro dos
workflows principais de cadência auditados acima.

Corte atual:

- `step` segue tratado como fallback eventual de `raw_properties` no Portal
- não deve entrar como dependência do histórico novo
- se houver uso residual, ele precisa ser localizado em bridge secundária, não na régua
  principal de disparos

## Regra de implantação por workflow

Em cada workflow de envio:

1. manter as escritas atuais de estado operacional
2. logo após a tentativa real de envio, chamar `portal_dispatch_event_ingest_v1`
3. usar `idempotency_key` no padrão:

`<operation_name>:<channel>:<workflow_name>:<execution_id>:<lead_key_or_page_id>`

4. gravar `event_type` conforme o desfecho da tentativa

## Ordem recomendada de rollout

1. Incentiva `E-mail`
2. Incentiva `WhatsApp`
3. Incentiva `LinkedIn`
4. replicar a mesma instrumentação nas operações blueprint equivalentes

## Critério de saída

- cards de canal do `Portal` lendo `events` em vez de `fallback`
- volume histórico por canal independente de colunas sobrepostas
- colunas legadas preservadas apenas como `último touch`
