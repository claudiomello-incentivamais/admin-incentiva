# Admin Auth RBAC Foundation

## Objetivo deste bloco

Subir a fundação de `auth + RBAC + escopo por operação` dentro do produto.

Sem isso, o portal e as integrações continuam navegáveis, mas ainda não fecham produção real.

## O que entrou

- sessão no shell
- tela de entrada controlada
- perfis operacionais reais
- escopo por operação
- restrição de rota por papel

## Perfis materializados

- `Direção`
- `Claw/main`
- `Sales Ops`
- `Cliente`

## Comportamento novo

### Sessão

O produto agora exige entrada antes de abrir o cockpit.

### Papel

Cada identidade entra com:

- perfil
- visibilidade padrão
- conjunto de rotas liberadas
- conjunto de operações liberadas

### Escopo

- `Direção` e `Claw/main` podem navegar a carteira inteira
- `Sales Ops` fica limitado às operações atribuídas
- `Cliente` fica restrito ao portal da própria conta

## Ganho prático

Antes:

- havia corte visual e conceitual de perfil

Agora:

- existe base concreta de sessão
- existe bloqueio de rota
- existe limitação de operação
- o produto começa a se comportar como software multiusuário governado

## Próxima evolução natural

Depois desta fundação, o caminho mais lógico passa a ser:

- trocar a camada local de sessão por auth conectada ao backend real
- fechar publish privado por conta
- puxar sync vivo de `Trello` e `Notion` dentro do painel
