# Setup e Desenvolvimento — movy_web

## Pré-requisitos

| Ferramenta            | Versão mínima recomendada   |
| --------------------- | --------------------------- |
| [Bun](https://bun.sh) | >= 1.1                      |
| Node.js               | >= 20 (usado pelo Wrangler) |

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

| Variável       | Obrigatória | Descrição                    |
| -------------- | ----------- | ---------------------------- |
| `VITE_API_URL` | ✅          | URL base da API backend REST |

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

O build é realizado pelo **Vite** usando `@lovable.dev/vite-tanstack-config`, que inclui:

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

A configuração está em `wrangler.jsonc`.

---

## Adicionando Novos Componentes UI (shadcn/ui)

```bash
bunx shadcn@latest add <nome-do-componente>
```

Os componentes são instalados em `src/components/ui/`. **Nunca modificar diretamente.**

---

## Adicionando Novas Features

Siga o padrão de **feature modules**:

1. Crie `src/features/<nome>/hooks/use<Feature>.ts` — fetch + state + side effects
2. Crie `src/features/<nome>/components/<Feature>View.tsx` — apresentação pura (recebe dados via props)
3. Crie/atualize o service em `src/services/<nome>.service.ts` — chamadas de API
4. Crie a rota thin em `src/routes/` — apenas conecta hook → componente

---

## Adicionando Novas Rotas

1. Crie o arquivo em `src/routes/` seguindo a convenção de nomes:
   - Pontos (`.`) = segmentos de caminho: `minha.rota.tsx` → `/minha/rota`
   - `$` prefix = parâmetro dinâmico: `perfil.$userId.tsx` → `/perfil/:userId`
   - `_` prefix = pathless layout: `_protected.tsx` (não adiciona segmento)
   - `.index` = índice da rota pai

2. **Rotas privadas:** prefixe o arquivo com `_protected.` — não implementar guard individual.

3. Exporte a constante `Route` via `createFileRoute`:

```tsx
// Rota pública
export const Route = createFileRoute("/minha/rota")({ component: MinhaPage });

// Rota protegida
export const Route = createFileRoute("/_protected/minha-rota")({ component: MinhaPage });
```

4. A `routeTree.gen.ts` é **gerada automaticamente** ao iniciar `bun dev` — não edite manualmente.

---

## Convenções do Projeto

### Importações

```ts
import { api } from "@/lib/api";
import { AppShell } from "@/components/layout/AppShell";
import { LoadingList } from "@/components/feedback/LoadingList";
import { ErrorCard } from "@/components/feedback/ErrorCard";
import type { TripInstance } from "@/lib/types";
```

### Padrão de Rota Thin

```tsx
function TripsPage() {
  const { orgId } = Route.useParams();
  const { slug } = Route.useSearch();
  const { trips, loading, error } = useTrips({ orgId, slug });
  return (
    <AppShell title="Viagens" back>
      {loading ? (
        <LoadingList />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <TripsList trips={trips ?? []} orgId={orgId} />
      )}
    </AppShell>
  );
}
```

### Padrão de Hook de Feature

```tsx
export function useTrips({ orgId, slug }: UseTripsOptions) {
  const [trips, setTrips] = useState<TripInstance[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    tripsService
      .listByOrgId(orgId)
      .then((res) => {
        if (!cancelled) setTrips(Array.isArray(res) ? res : (res.data ?? []));
      })
      .catch((err) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : "Erro");
          toast.error(err.message);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, slug]);

  return { trips, loading: trips === null && !error, error };
}
```

### Feedback ao Usuário

```tsx
import { toast } from "sonner";
toast.success("Operação realizada!");
toast.error(err instanceof Error ? err.message : "Ocorreu um erro");
```

---

## Linting e Formatação

O projeto usa **ESLint** (configurado em `eslint.config.js`) e **Prettier**.

```bash
bun lint    # verificar erros
bun format  # formatar código
```

```bash
# Verifica erros de lint
bun lint

# Formata todos os arquivos
bun format
```
