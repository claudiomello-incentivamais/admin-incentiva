# Admin Portal Experience

## Objetivo deste bloco

Transformar o `Bloco 4` de acesso e portal em experiência navegável de produto, em vez de deixá-lo apenas como arquitetura ou readiness.

## O que entrou

- contexto persistente de audiência
- contexto persistente de visibilidade
- navegação explícita para `Portal`
- preview real de portal por operação

## Camada de audiência

O shell do admin agora carrega e persiste:

- `Direção`
- `Claw/main`
- `Sales Ops`
- `Cliente`

Cada perfil tem:

- escopo resumido
- descrição de uso
- visibilidade padrão

Isso permite trocar de audiência sem perder o resto do contexto do painel.

## Camada de visibilidade

O topo do produto agora diferencia duas leituras:

- `Interno completo`
- `Cliente-safe`

Essa separação é importante para o admin deixar claro:

- o que pode ser mostrado fora do cockpit
- o que continua interno
- qual recorte está ativo no momento

## Rota de portal

Entrou uma rota dedicada de `Portal`, navegável no menu lateral.

Ela materializa:

- operação em foco
- corte privado por audiência
- módulos expostos
- módulos protegidos
- score, cobertura e conversão
- próximo marco da conta
- pacote mínimo de ativação privada

## Ganho prático

Antes:

- acesso e portal estavam desenhados, mas ainda sem experiência real de uso

Agora:

- a audiência já influencia o shell
- a visibilidade já influencia o corte
- o portal já existe como camada concreta do software

## Próxima evolução natural

Depois desta fase, o caminho mais lógico passa a ser:

- autenticação real
- permissão real por papel
- URL privada por conta / operação
- integração viva de publish e acesso
