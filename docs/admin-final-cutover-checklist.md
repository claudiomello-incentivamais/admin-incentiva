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
