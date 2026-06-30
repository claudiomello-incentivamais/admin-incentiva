# Admin Incentiva — Publish Privado por Conta

## Objetivo do bloco

Transformar o portal de uma experiência governada em um artefato de abertura externa realmente operacional por conta.

## O que entrou

- pacote de publish privado por operação dentro do portal
- rota alvo explícita por conta
- estágio de abertura por operação
- checkpoints de liberação externa
- recorte do que sai junto e do que continua protegido

## O que isso resolve

- deixa de existir a ideia genérica de `portal externo`
- cada operação passa a ter um pacote próprio de ativação
- o time consegue ver o que já está pronto e o que ainda bloqueia abertura real
- a conversa de publish sai do abstrato e vira checkpoint operacional visível

## Estrutura do pacote

Cada operação passa a carregar:

- `slug` privado
- rota alvo da conta
- audiência prevista
- camada de autenticação
- owner sugerido
- estágio de publish
- checkpoints de abertura

## O que ainda falta depois deste bloco

- materialização final da URL privada por conta
- governança definitiva do domínio/publish externo
- Trello e Notion como fontes vivas dentro do mesmo recorte publicado

## Próximo passo natural

Depois do pacote privado por conta, a prioridade sobe para:

1. ligar `Trello` como execução viva no painel
2. ligar `Notion` como camada comercial viva
3. fechar a publicação externa privada já com essas leituras no mesmo produto
