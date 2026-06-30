# Admin Public Publish Parity

## Objetivo

Transformar a última milha da publicação final em um checkpoint explícito dentro do próprio produto,
separando:

- o que já está pronto no código
- o que já está homologado no portal privado
- o que ainda falta materializar na URL pública final

## O que entrou

- régua de `paridade da publicação final` em `Configurações`
- prontidão de corte externo por operação dentro do `Portal`
- blockers explícitos por conta para fechar o cutover externo
- novo checkpoint de `paridade com a URL publicada` no pacote de publish

## Efeito operacional

A conversa deixa de ser "já está pronto?" de forma subjetiva e passa a ser:

1. corte interno validado
2. recorte publicado em paridade
3. homologação externa diária
4. abertura final

## Nota prática de deploy

O build já explicita a trilha técnica disponível hoje:

- preview local: `npx vite preview`
- deploy do build pré-gerado: `npx nitro deploy --prebuilt`

Isso não substitui a governança do publish, mas reduz a ambiguidade sobre o passo técnico final.

## O que ainda falta

- materializar a publicação pública final com o último corte
- reduzir dependência de snapshot intermediário no Trello
- homologar o uso externo recorrente
