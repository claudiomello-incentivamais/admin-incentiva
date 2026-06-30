# Admin Observability and Action

## Objetivo deste bloco

Adicionar ao admin uma primeira camada material de observabilidade e acionamento, para reduzir dependência de reports paralelos e transformar leitura em execução.

## O que entrou neste corte

### Saúde da stack

- `n8n VPS`
- `VPS`
- `agentes e modelos`
- `publish / Lovable`

Cada frente passa a ter:

- status
- headline
- explicação curta
- dono sugerido

### Fila de alertas acionáveis

O painel passa a explicitar quais alertas já deveriam virar acompanhamento operacional:

- publish travado
- observabilidade granular de e-mail
- visibilidade de agentes/modelos

### Central de ação

O fluxo de ação fica organizado em três saídas principais:

- `Trello` para execução
- `Discord` para acionamento por exceção
- `Admin` para registrar estado da ação

## Regra operacional

Leitura sozinha não basta.

O ciclo correto é:

1. detectar
2. explicar
3. atribuir dono
4. abrir ação
5. acompanhar
6. validar fechamento

## Próxima evolução natural

Depois deste bloco, a sequência mais lógica é:

- detalhar saúde do `n8n VPS` por família e workflow
- expor status de agentes/modelos/sessões
- amarrar geração prática de ação para `Trello` e `Discord`
- começar a consolidar visão de infra dentro do admin
