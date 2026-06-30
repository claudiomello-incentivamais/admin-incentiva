# Admin Incentiva — Sessão Real por Cookie

## Objetivo do bloco

Trocar a sessão puramente local por uma sessão real do produto, emitida no servidor e persistida por cookie, sem ainda acoplar o painel a um provedor externo definitivo.

## O que entrou

- sessão emitida via servidor
- cookie de autenticação para sustentar refresh e entrada direta por URL
- leitura inicial da sessão no `root loader`
- gate de rota mantendo RBAC e escopo por operação
- base pronta para publish privado e cutover para auth definitiva

## Decisão de arquitetura

Em vez de acoplar agora a um provider externo ainda não homologado para esta frente, a fundação sobe primeiro como:

- `TanStack Start` no servidor
- `server functions` para `sign in`, `sign out` e `read session`
- cookie assinado para sustentar a sessão

Isso fecha o maior buraco do estágio anterior:

- antes: o acesso existia só no navegador local
- agora: a sessão passa a existir como estado do produto

## O que isso resolve

- refresh não derruba mais a leitura do papel
- entrada por rota protegida já nasce com a sessão lida no servidor
- a navegação passa a refletir sessão real, não apenas estado local
- a fundação de portal privado deixa de depender de mock

## O que ainda não fecha

- provedor final de identidade
- convite/reset de acesso
- gestão operacional de usuários fora da base seed
- publicação privada por cliente com governança completa
- integração viva de Trello e Notion dentro do painel

## Próximo passo natural

Com a sessão real resolvida, o próximo bloco recomendado passa a ser:

1. mover a base seed para governança operacional de acessos
2. fechar publish privado por conta
3. conectar `Trello` e `Notion` como fontes vivas dentro do produto
