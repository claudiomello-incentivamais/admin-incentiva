# Admin Integration Control Center

## Objetivo deste bloco

Subir a frente de `Integrações` como camada explícita do produto.

O objetivo não é só lembrar que existem várias ferramentas.
É mostrar, dentro do Lovable:

- qual sistema faz o quê
- quem é o dono
- qual é a fonte de verdade
- se a leitura é viva, guardada ou manual
- o que já está centralizado
- o que ainda falta integrar

## O que entrou

- rota dedicada de `Integrações`
- mapa central das fontes do produto
- pontes entre sistemas e telas
- fila de integração para o que ainda falta centralizar

## Sistemas já mapeados

- `Supabase`
- `n8n VPS`
- `Notion`
- `Trello`
- `Discord operacional`
- `GitHub`
- `Lovable / Publish`

## Leitura que o bloco entrega

### Fonte

Cada sistema aparece com:

- owner
- estado de sync
- visibilidade
- fonte de verdade
- quais módulos do produto ele alimenta

### Ponte

Cada ponte responde:

- de onde a informação sai
- para onde ela entra
- quão madura essa ligação já está
- qual é o próximo passo para fechar a integração

### Fila

O hub deixa explícito:

- o que ainda falta centralizar de `Notion`
- o que ainda falta tornar visível de `Trello`
- o que ainda falta para `auth + publish privado`

## Ganho prático

Antes:

- o produto já tinha a arquitetura correta
- mas a governança das ferramentas ainda estava distribuída demais entre contexto, memória e telas separadas

Agora:

- existe uma frente que mostra o desenho inteiro de integração
- fica mais fácil decidir a próxima execução sem voltar para “onde mesmo isso vive?”

## Próxima evolução natural

Depois deste bloco, o caminho lógico fica:

- auth real
- permissão por papel
- portal privado por conta
- status vivo de execução e sync de `Trello` e `Notion`
