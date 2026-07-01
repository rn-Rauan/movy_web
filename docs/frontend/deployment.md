# Deploy do Frontend

O frontend é publicado na Cloudflare Workers. A API fica em serviço separado no Render e o banco PostgreSQL no Neon.

## Variável Obrigatória

```env
VITE_API_URL=https://sua-api.example.com
```

Essa variável é embutida no bundle durante o build. Ajuste antes de executar `npm run build`.

## Build

```bash
npm run build
```

## Publicação

O projeto usa `wrangler.jsonc` com entrada do TanStack Start:

```json
{
  "main": "@tanstack/react-start/server-entry"
}
```

O registro operacional detalhado está em [../process/deploy-cloudflare-workers.md](../process/deploy-cloudflare-workers.md).

## Checklist Pré-deploy

- `.env` aponta para a API correta.
- `npm run lint` sem erros.
- `npm run build` concluído.
- API permite CORS para o domínio do Worker.
- Fluxos principais validados pelo roteiro manual.
- Nenhum dado sensível ficou em capturas, logs ou documentação.
