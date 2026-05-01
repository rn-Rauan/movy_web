# Arquitetura do Projeto — movy_web

## Visão Geral

**movy_web** é uma aplicação web de reserva de transporte (passageiros), construída com uma stack moderna e orientada a mobile-first. Permite que usuários descubram viagens públicas, se autentiquem e realizem inscrições em viagens de empresas de transporte.

---

## Stack Tecnológica

| Camada | Tecnologia |
|---|---|
| Framework UI | React 19 |
| Framework Full-Stack | TanStack Start (TanStack Router) |
| Linguagem | TypeScript (strict mode) |
| Estilização | Tailwind CSS v4 |
| Componentes UI | shadcn/ui (Radix UI) |
| Roteamento | TanStack Router (file-based) |
| Gerenciamento de Estado | React Context + `useState` local |
| HTTP Client | `fetch` nativo com wrapper customizado |
| Validação de Formulários | Zod + react-hook-form |
| Notificações | Sonner (toasts) |
| Ícones | Lucide React |
| Build | Vite + `@lovable.dev/vite-tanstack-config` |
| Deploy | Cloudflare Workers (via Wrangler) |
| Package Manager | Bun |

---

## Diagrama de Camadas

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser / CF Workers                  │
├─────────────────────────────────────────────────────────────┤
│                    TanStack Router (SSR/SPA)                  │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  __root.tsx  →  AuthProvider  →  Outlet (Toaster)    │   │
│  └──────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────┤
│                          Rotas (Pages)                        │
│  Public (sem auth)          │  Privado (requer auth)         │
│  /public/trip-instances     │  /organizations                │
│  /public/organizations/:slug│  /trips/:orgId                 │
│  /login  /signup            │  /trips/:orgId/:tripId         │
│                             │  /trips/:orgId/:tripId/book    │
│                             │  /my-bookings                  │
│                             │  /my-bookings/:bookingId       │
├─────────────────────────────────────────────────────────────┤
│                     Componentes Compartilhados                │
│  AppShell (layout)  │  shadcn/ui (40+ componentes Radix)    │
├─────────────────────────────────────────────────────────────┤
│                           lib/                               │
│  api.ts (HTTP Client + tokenStorage)                         │
│  auth-context.tsx (AuthProvider / useAuth)                   │
│  types.ts (interfaces TypeScript)                            │
│  format.ts (formatação de data, status labels)              │
│  utils.ts (cn — Tailwind class merge)                        │
├─────────────────────────────────────────────────────────────┤
│                       API Backend (REST)                      │
│  VITE_API_URL  →  endpoints /auth /public /bookings /orgs   │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Diretórios

```
movy_web/
├── src/
│   ├── components/
│   │   ├── AppShell.tsx          # Layout principal (header + bottom nav)
│   │   └── ui/                   # shadcn/ui — componentes de UI puros
│   ├── hooks/
│   │   └── use-mobile.tsx        # Hook para detectar viewport mobile
│   ├── lib/
│   │   ├── api.ts                # Cliente HTTP + armazenamento de tokens
│   │   ├── auth-context.tsx      # Context de autenticação (login/signup/logout)
│   │   ├── format.ts             # Utilitários de formatação (datas, status)
│   │   ├── types.ts              # Tipos TypeScript do domínio
│   │   └── utils.ts              # cn() para mesclar classes Tailwind
│   ├── routes/                   # Páginas (file-based routing)
│   │   ├── __root.tsx            # Raiz: HTML shell + AuthProvider + Toaster
│   │   ├── index.tsx             # / → redireciona para /public/trip-instances
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── organizations.tsx
│   │   ├── trips.$orgId.tsx
│   │   ├── trips.$orgId.$tripId.tsx
│   │   ├── trips.$orgId.$tripId.book.tsx
│   │   ├── my-bookings.tsx
│   │   ├── my-bookings.$bookingId.tsx
│   │   ├── public.trip-instances.tsx         # Layout route
│   │   ├── public.trip-instances.index.tsx   # Listagem pública
│   │   ├── public.trip-instances.$id.tsx     # Detalhe público
│   │   └── public.organizations.$slug.tsx    # Perfil público de empresa
│   ├── router.tsx                # Configuração do roteador + error boundary
│   ├── routeTree.gen.ts          # Gerado automaticamente pelo TanStack Router
│   └── styles.css                # Estilos globais (Tailwind)
├── docs/                         # Documentação do projeto
├── util/
│   └── api-json.json             # Especificação/schema da API
├── vite.config.ts
├── tsconfig.json
├── wrangler.jsonc                # Configuração Cloudflare Workers
├── bunfig.toml                   # Configuração do Bun
└── package.json
```

---

## Fluxo de Autenticação

```
Usuário não autenticado
        │
        ▼
  /public/trip-instances  (acesso livre)
        │
        │  clica "Entrar para reservar"
        ▼
  /login  →  POST /auth/login
        │
        │  sucesso: salva tokens em localStorage
        │  (tt_access, tt_refresh, tt_user)
        ▼
  AuthProvider.setUser()  →  isAuthenticated = true
        │
        ▼
  /organizations  (área autenticada)
```

O estado de autenticação é inicializado na montagem do `AuthProvider` lendo diretamente o `localStorage` (via `tokenStorage.user`). Não há renovação automática de token — o `tt_refresh` é armazenado mas não usado por lógica de refresh no cliente.

---

## Padrão de Proteção de Rotas

Todas as rotas privadas utilizam um padrão imperativo de guarda via `useEffect`:

```tsx
useEffect(() => {
  if (!loading && !isAuthenticated) {
    navigate({ to: "/login" });
  }
}, [loading, isAuthenticated, navigate]);
```

Não há um componente de Higher-Order Route Guard — cada página é responsável pela sua própria proteção.

---

## Padrão de Busca de Dados

O projeto usa busca imperativa com `useEffect` + `useState` — não usa React Query nas páginas (apesar de `@tanstack/react-query` estar instalado como dependência).

```tsx
const [data, setData] = useState<T | null>(null);
const [error, setError] = useState<string | null>(null);

useEffect(() => {
  api<T>("/endpoint").then(setData).catch((err) => {
    setError(err.message);
    toast.error(err.message);
  });
}, [deps]);
```

Estados de carregamento são representados por `data === null && error === null`, exibindo `<Skeleton>`.

---

## Deploy — Cloudflare Workers

O arquivo `wrangler.jsonc` configura o deploy para a Cloudflare:

```jsonc
{
  "name": "tanstack-start-app",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry"
}
```

O build é feito com `vite build` e o entry point é o server handler do TanStack Start, compatível com o runtime da Cloudflare.

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API backend (ex: `https://api.movy.app`) |

Definida via `.env` local ou configuração do ambiente de deploy.
