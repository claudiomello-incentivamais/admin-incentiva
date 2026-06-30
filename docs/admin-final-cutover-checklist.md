# Admin Final Cutover Checklist

## Objetivo

Transformar a última milha da publicação final em um checklist mínimo, com:

- dono claro
- evidência objetiva
- critério de saída

## Checklist

1. Credencial de deploy ativa
- Dono: `Claudio + Claw`
- Evidência: `CLOUDFLARE_API_TOKEN` disponível no runtime
- Saída: `nitro deploy --prebuilt` sem erro de autenticação

2. Cutover da URL pública
- Dono: `Claw/main`
- Evidência: URL publicada responde com o corte novo em `Configurações` e `Portal`
- Saída: marcadores de paridade e prontidão do corte externo visíveis ao vivo

3. Paridade produto x URL
- Dono: `Claw/main`
- Evidência: estados e textos críticos da URL pública batem com o repositório atual
- Saída: sem drift visível entre local e publicado

4. Homologação diária real
- Dono: `Sales Ops + Claw`
- Evidência: leitura real sustentada sem depender de interpretação manual do cockpit
- Saída: software publicado de fato, não só homologado internamente

## Roteiro direto de execução

1. Disponibilizar a credencial no runtime

```bash
export CLOUDFLARE_API_TOKEN='<token>'
```

2. Rodar o deploy final

```bash
cd /root/.openclaw/workspace/admin-incentiva
npx nitro deploy --prebuilt
```

Atalho operacional já disponível:

```bash
npm run cutover:final
```

3. Validar a URL publicada

```bash
curl -L -s https://incentivamais-admin.lovable.app/configuracoes | rg "Paridade da publicação final|90%"
curl -L -s https://incentivamais-admin.lovable.app/portal | rg "Prontidão do corte externo|Blockers do fechamento externo"
```

Atalho operacional já disponível:

```bash
npm run verify:publish
```

## Critério objetivo de fechamento

Considerar produção final fechada apenas quando:

- o deploy terminar sem erro de autenticação
- a URL pública refletir os marcadores novos do produto
- não houver drift visível entre repositório e publicação
- a homologação externa inicial tiver sido concluída
