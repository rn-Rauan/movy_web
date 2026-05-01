# Setup e Desenvolvimento — movy_web

## Pré-requisitos

| Ferramenta | Versão mínima recomendada |
|---|---|
| [Bun](https://bun.sh) | >= 1.1 |
| Node.js | >= 20 (usado pelo Wrangler) |

> O projeto usa **Bun** como package manager e runtime. Não use `npm` ou `yarn`.

---

## Instalação

```bash
# Clone o repositório
git clone <url-do-repo>
cd movy_web

# Instale as dependências
bun install
```

---

## Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_URL=https://sua-api.exemplo.com
```

| Variável | Obrigatória | Descrição |
|---|---|---|
| `VITE_API_URL` | ✅ | URL base da API backend REST |

> Prefixo `VITE_` é necessário para que o Vite exponha a variável ao código client-side via `import.meta.env`.

---

## Scripts Disponíveis

```bash
# Inicia o servidor de desenvolvimento (HMR)
bun dev

# Build de produção
bun build

# Build em modo development (com source maps, sem minificação)
bun build:dev

# Visualiza o build de produção localmente
bun preview

# Lint (ESLint)
bun lint

# Formatação (Prettier)
bun format
```

---

## Estrutura do Build

O build é realizado pelo **Vite** usando `@lovable.dev/vite-tanstack-config`, que inclui internamente:

- TanStack Start server handler
- React JSX transform
- Tailwind CSS v4
- TypeScript path aliases (`@/*` → `src/*`)
- Plugin Cloudflare (apenas no build)

O output é compatível com **Cloudflare Workers** via `wrangler`.

---

## Deploy — Cloudflare Workers

```bash
# Deploy para produção
bunx wrangler deploy

# Deploy para preview/staging
bunx wrangler deploy --env staging
```

A configuração do deploy está em `wrangler.jsonc`:

```jsonc
{
  "name": "tanstack-start-app",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry"
}
```

---

## Adicionando Novos Componentes UI (shadcn/ui)

O projeto usa shadcn/ui configurado em `components.json`. Para adicionar novos componentes:

```bash
bunx shadcn@latest add <nome-do-componente>
```

Os componentes são instalados em `src/components/ui/`.

---

## Adicionando Novas Rotas

O TanStack Router usa **file-based routing**. Para criar uma nova rota:

1. Crie o arquivo em `src/routes/` seguindo a convenção de nomes:
   - Pontos (`.`) representam segmentos de caminho: `minha.rota.tsx` → `/minha/rota`
   - Segmentos dinâmicos são prefixados com `$`: `perfil.$userId.tsx` → `/perfil/:userId`
   - Índice de uma rota pai: `minha.rota.index.tsx` → `/minha/rota/`

2. Exporte a constante `Route` usando `createFileRoute`:

```tsx
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/minha/rota")({
  component: MinhaPage,
});

function MinhaPage() {
  return <div>Conteúdo</div>;
}
```

3. A `routeTree.gen.ts` é **gerada automaticamente** ao iniciar `bun dev` — não edite manualmente.

---

## Convenções do Projeto

### Importações

Use o alias `@/` para importar de `src/`:

```ts
import { api } from "@/lib/api";
import { AppShell } from "@/components/AppShell";
import type { TripInstance } from "@/lib/types";
```

### Proteção de Rotas Privadas

Toda página que requer autenticação deve incluir:

```tsx
const { isAuthenticated, loading } = useAuth();
const navigate = useNavigate();

useEffect(() => {
  if (!loading && !isAuthenticated) {
    navigate({ to: "/login" });
  }
}, [loading, isAuthenticated, navigate]);
```

### Busca de Dados

Use o padrão `useEffect` + `useState` com flag de cancelamento para evitar race conditions:

```tsx
useEffect(() => {
  let cancelled = false;
  api<T>("/endpoint")
    .then((res) => { if (!cancelled) setData(res); })
    .catch((err) => { if (!cancelled) setError(err.message); });
  return () => { cancelled = true; };
}, [deps]);
```

### Feedback ao Usuário

Sempre use `toast.error()` para erros de API e `toast.success()` para ações bem-sucedidas:

```tsx
import { toast } from "sonner";

toast.success("Operação realizada!");
toast.error(err.message ?? "Ocorreu um erro");
```

---

## Linting e Formatação

O projeto usa **ESLint** (configurado em `eslint.config.js`) e **Prettier** para formatação.

```bash
# Verifica erros de lint
bun lint

# Formata todos os arquivos
bun format
```
