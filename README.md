# Movy Web

SaaS de transporte — sistema de gerenciamento e reserva de viagens. PWA mobile-first com três papéis de usuário (passageiro, motorista e admin) que conversa com uma API backend (DDD + Clean Architecture).

## Stack

- **React 19** + **TypeScript** (strict)
- **TanStack Start** + **TanStack Router** (full-stack, file-based routing)
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI · estilo `new-york`)
- **Zod** (validação) · **date-fns** · **lucide-react** · **recharts** · **sonner**
- **Vite 7** (preset `@lovable.dev/vite-tanstack-config`)
- **Cloudflare Workers** (deploy via Wrangler)

## Pré-requisitos

- Node.js 20+ (desenvolvido em Node 24)
- npm (o repositório também tem lockfile do `bun`, mas os scripts padrão usam npm)

## Início rápido

```bash
npm install
cp .env.example .env   # ajuste VITE_API_URL se necessário
npm run dev
```

A app sobe em modo dev pelo Vite. Por padrão a API é esperada em `http://localhost:5701`.

### Variáveis de ambiente

| Variável       | Padrão                  | Descrição               |
| -------------- | ----------------------- | ----------------------- |
| `VITE_API_URL` | `http://localhost:5701` | URL base da API backend |

Copie `.env.example` para `.env` e ajuste conforme o ambiente.

## Scripts

| Comando                | Descrição                      |
| ---------------------- | ------------------------------ |
| `npm run dev`          | Servidor Vite em modo dev      |
| `npm run build`        | Build de produção              |
| `npm run build:dev`    | Build em modo development      |
| `npm run preview`      | Preview do build local         |
| `npm run lint`         | ESLint                         |
| `npm run format`       | Prettier (auto-fix)            |
| `npm run format:check` | Prettier (somente verificação) |

> Não há framework de testes configurado. Os cenários de teste manuais pré-deploy ficam em [docs/frontend/manual-testing.md](docs/frontend/manual-testing.md).

## Arquitetura

O frontend segue **feature modules**: as rotas são _thin controllers_ (~15 linhas), a lógica de caso de uso fica em hooks de feature, e toda chamada de API passa por um service (repository pattern).

```
routes/ (thin controllers) → features/ (hooks + components) → services/ → lib/api.ts → Backend
```

```
src/
├── routes/        Rotas file-based do TanStack Router (controllers finos)
├── features/      Módulos de domínio: hooks (casos de uso) + components (apresentação)
├── services/      Abstração das chamadas de API (repository pattern)
├── components/    ui/ (shadcn), layout/, feedback/, visual/
├── lib/           api.ts, auth-context, role-context, types, format, helpers
├── hooks/         Hooks genéricos compartilhados
└── styles.css     Tailwind + tokens
```

### Papéis e contextos de acesso

| Role   | Capacidades                                                   |
| ------ | ------------------------------------------------------------- |
| User   | Explorar viagens públicas, reservar, gerenciar inscrições     |
| Driver | Extensão de User — confirmar presença, marcar pagamentos      |
| Admin  | Criar e gerenciar organização, templates, viagens, motoristas |

Os roles são detectados em runtime via `RoleContext` após a autenticação. As rotas são guardadas por _pathless layouts_:

- **Público** (`/public/*`) — sem autenticação
- **Autenticado** (`/_protected/*`) — guard em `_protected.tsx`
- **Admin** (`/_protected/_admin/*`) — guard adicional
- **Driver** (`/_protected/_driver/*`) — guard adicional

### Autenticação

Tokens em `localStorage` (`tt_access`, `tt_refresh`, `tt_user`). O cliente HTTP (`lib/api.ts`) intercepta `401` e renova o token automaticamente, com deduplicação de requisições concorrentes.

## Convenções importantes

- **Path alias:** `@/*` → `src/*`
- **shadcn/ui:** adicione componentes via `npx shadcn@latest add <componente>` — nunca edite `src/components/ui/` diretamente
- **Vite:** não adicione plugins manualmente ao `vite.config.ts` (o preset `@lovable.dev/vite-tanstack-config` já os inclui)
- **Services sempre:** nunca chame `api()` direto em rotas/componentes — use os services
- O guia completo de padrões está em [AGENTS.md](AGENTS.md) e na documentação oficial em [docs/frontend/](docs/frontend/).

## Deploy

Build com `npm run build` e deploy para **Cloudflare Workers** via Wrangler (configuração em [wrangler.jsonc](wrangler.jsonc)).

## Documentação

A documentação completa está em [docs/](docs/) — comece pelo índice em [docs/README.md](docs/README.md):

- **[docs/frontend/README.md](docs/frontend/README.md)** — ponto de entrada técnico do frontend
- **[docs/frontend/development.md](docs/frontend/development.md)** — setup, scripts e convenções
- **[docs/frontend/architecture.md](docs/frontend/architecture.md)** · **[docs/frontend/routes.md](docs/frontend/routes.md)** · **[docs/frontend/auth-and-access.md](docs/frontend/auth-and-access.md)** — deep-dives atuais
- **[docs/frontend/api-integration.md](docs/frontend/api-integration.md)** — integração com API, services e erros
- **[docs/reference/api-frontend.md](docs/reference/api-frontend.md)** — contrato completo da API
