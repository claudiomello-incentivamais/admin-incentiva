# Admin Support Workflow Intelligence

## Objetivo deste bloco

Fechar o `Bloco 3` transformando a tela de `Suporte` em uma frente de observabilidade mais profunda, saindo de status genérico e entrando em leitura por:

- canal
- família
- workflow
- gargalo dominante
- alerta vivo

## O que entrou neste corte

### 1. Operação-referência viva

A tela de `Suporte` agora usa a `Incentiva` como primeira operação-referência para workflow intelligence.

Isso permite mostrar em tela:

- snapshot vivo
- canais observados
- famílias mapeadas
- workflows ativos
- alertas do cockpit

### 2. Saúde por canal

Entrou leitura separada para:

- `WhatsApp`
- `E-mail`
- `LinkedIn`
- `Instagram / Inbound`

Cada canal já aparece com:

- saúde
- headline
- densidade de workflows
- leitura operacional curta

### 3. Famílias de workflow

O suporte agora mostra as famílias mais relevantes já quebradas por:

- total
- ativos
- saúde
- resumo semântico

Isso ajuda a sair de uma leitura “workflow verde/vermelho” e entrar numa leitura de blocos operacionais reais.

### 4. Workflows em foco

Entrou camada concreta para:

- execuções 7d
- success 7d
- error 7d
- waiting 7d
- última corrida

Ou seja: o painel já consegue apontar onde existe fila silenciosa, throughput forte ou risco localizado.

### 5. Saúde específica de e-mail e WhatsApp

O bloco agora separa:

- métricas do canal
- trilhas/tipos de uso
- recomendação de próximo passo

No caso de `E-mail`, o painel já mostra o `FUP2` como gargalo localizado.

No caso de `WhatsApp`, o painel já diferencia:

- outbound
- leads
- reativação / retomada

## Ganho prático

Antes:

- o suporte mostrava stack, incidentes e ação sugerida

Agora:

- o suporte também mostra onde o gargalo vive
- em qual canal
- em qual família
- em qual workflow
- com qual tipo de sintoma

## Estado do bloco

Com este corte, o `Bloco 3` deixa de ser só “iniciado” e passa a ter uma camada material de workflow intelligence.

Ainda existem evoluções naturais futuras, mas a base do bloco ficou fechada.

## Próxima evolução natural

Depois deste corte, o próximo avanço mais lógico é:

- transformar essa leitura em ação prática plugada
- abrir geração prática para `Trello`
- abrir saída prática para `Discord`
- conectar a observabilidade profunda com a fila executiva do `Admin Global`
