# Movy Web — Documentação Técnica do Frontend

**Versão:** v1.0 (preparação pra deploy) · **Última atualização:** 2026-05-20

Referência técnica abrangente do frontend do Movy. Para deep-dives em áreas específicas, ver: [`architecture.md`](./architecture.md) (camadas), [`auth.md`](./auth.md) (auth detalhada), [`components.md`](./components.md) (catálogo de componentes), [`routes.md`](./routes.md) (mapa de rotas), [`types.md`](./types.md) (tipos), [`API_FRONTEND.md`](./API_FRONTEND.md) (contrato do backend). Para casos de teste manuais, ver [`E2E_MANUAL.md`](./E2E_MANUAL.md).

---

## Índice

1. [Visão Geral do Produto](#1-visão-geral-do-produto)
2. [Stack & Ferramentas](#2-stack--ferramentas)
3. [Estrutura de Diretórios](#3-estrutura-de-diretórios)
4. [Roteamento (TanStack Router)](#4-roteamento-tanstack-router)
5. [Autenticação & Autorização](#5-autenticação--autorização)
6. [Camada de Dados: Services + Hooks](#6-camada-de-dados-services--hooks)
7. [Componentes & UI](#7-componentes--ui)
8. [Tratamento de Erros](#8-tratamento-de-erros)
9. [Internacionalização & Timezone](#9-internacionalização--timezone)
10. [Fluxos de Negócio](#10-fluxos-de-negócio)
11. [Build & Deploy](#11-build--deploy)
12. [Como Adicionar Funcionalidades](#12-como-adicionar-funcionalidades)
13. [Convenções & Anti-patterns](#13-convenções--anti-patterns)
14. [Glossário](#14-glossário)

---

## 1. Visão Geral do Produto

**Movy** é um SaaS B2B/B2C de transporte fretado — empresas de transporte cadastram suas rotas (templates), geram viagens (instâncias) sob essas rotas, e usuários reservam vagas. Mobile-first, otimizado pra rotas de fretamento curtas (universidade, trabalho, eventos).

### Três personas

| Persona           | Como entra                                                      | O que faz                                                                                  |
| ----------------- | --------------------------------------------------------------- | ------------------------------------------------------------------------------------------ |
| **Passageiro**    | `POST /auth/register` (B2C)                                     | Busca viagens no marketplace, reserva vaga, gerencia inscrições, opcional: vira motorista. |
| **Motorista**     | Passageiro + admin vincula                                      | Vê viagens atribuídas, inicia/finaliza viagem, edita próprio perfil de CNH.                |
| **Administrador** | `POST /auth/register-organization` (B2B) ou via wizard `/setup` | CRUD de templates/viagens/drivers/vehicles, gestão de plano, dashboard com métricas.       |

### Contextos de acesso

1. **Público** (`/public/*`) — sem autenticação. Marketplace, perfil público de organização, comparativo de planos.
2. **Usuário autenticado** (`/_protected/*`) — guard em `_protected.tsx`. Inscrições, perfil, organizações que pertence.
3. **Admin** (`/_protected/_admin/*`) — guard adicional em `_protected/_admin.tsx`.
4. **Driver** (`/_protected/_driver/*`) — guard adicional em `_protected/_driver.tsx`.
5. **Onboarding** (`/setup`) — exceção: aberto a autenticados sem org (transforma passenger em admin).

---

## 2. Stack & Ferramentas

| Camada                  | Tecnologia                                         | Por quê                                                                                |
| ----------------------- | -------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Framework UI            | **React 19**                                       | Hooks, Server Components opcional, ecossistema maduro                                  |
| Roteamento + Full-stack | **TanStack Router + TanStack Start**               | Type-safe, file-based, SSR opcional, otimizado pra app multi-tela com guards aninhados |
| Linguagem               | **TypeScript** (strict)                            | Reduz erros em runtime, contratos explícitos com a API                                 |
| Estilo                  | **Tailwind CSS v4**                                | Utility-first, design system implícito, perfeito pra mobile-first                      |
| Componentes             | **shadcn/ui** (sobre Radix)                        | Componentes ownership-style (copiados pro repo), acessíveis, customizáveis sem fork    |
| Validação               | **Zod**                                            | Schemas declarativos compartilhados entre form e tipos (`z.infer`)                     |
| HTTP                    | `fetch` nativo + wrapper (`src/lib/api.ts`)        | Sem dependência externa; refresh-on-401 e errorCode parsing centralizados              |
| Notificações            | **Sonner**                                         | Toasts leves, ações inline                                                             |
| Ícones                  | **Lucide React**                                   | Conjunto consistente, tree-shakeable                                                   |
| Build                   | **Vite** + `@lovable.dev/vite-tanstack-config`     | Build rápido; o preset cuida do router-plugin + TS paths automaticamente               |
| Deploy                  | **Cloudflare Workers** (`@cloudflare/vite-plugin`) | Edge runtime, free tier generoso                                                       |
| Package manager         | **npm** (bun também funciona)                      | Default; lockfile commitado                                                            |

### Por que `@tanstack/react-query` está no `package.json` mas não é usado?

Está presente desde antes do projeto consolidar o padrão Context + hooks. **Nenhuma rota o consome.** Decisão consciente: manter como dependência pra migração futura, mas continuar com Context + hooks por simplicidade até haver necessidade real (ex.: invalidação cross-component, polling complexo). Ver `docs/DECISIONS.md` ADR-002.

---

## 3. Estrutura de Diretórios

```
movy_web/
├── src/
│   ├── routes/              # File-based routes (TanStack Router)
│   │   ├── __root.tsx       # Providers (Auth → Role)
│   │   ├── _protected.tsx   # Pathless guard de auth
│   │   ├── _protected._admin.tsx  # Pathless guard de admin role
│   │   ├── _protected._driver.tsx # Pathless guard de driver role
│   │   ├── index.tsx        # Landing / redirect por role
│   │   ├── login.tsx
│   │   ├── signup*.tsx      # signup, signup.index (B2C), signup.empresa (B2B)
│   │   ├── forgot-password.tsx + reset-password.tsx + verify-email.tsx
│   │   └── _protected.<area>.<resource>.tsx  # Naming flat com prefixo de guard
│   │
│   ├── features/            # Módulos de domínio
│   │   ├── trips/           # hooks + components
│   │   ├── bookings/
│   │   ├── organizations/
│   │   ├── drivers/
│   │   ├── templates/
│   │   ├── vehicles/
│   │   ├── scheduling/
│   │   └── payments/
│   │
│   ├── services/            # Repository pattern — encapsulam chamadas HTTP
│   │   ├── auth.service.ts          # forgot/reset/verify email + refresh
│   │   ├── trips.service.ts
│   │   ├── bookings.service.ts
│   │   ├── drivers.service.ts
│   │   ├── templates.service.ts
│   │   ├── vehicles.service.ts
│   │   ├── organizations.service.ts
│   │   ├── plans.service.ts          # GET /public/plans (anônimo)
│   │   ├── payments.service.ts
│   │   ├── subscriptions.service.ts
│   │   └── scheduling.service.ts
│   │
│   ├── components/
│   │   ├── ui/              # shadcn/ui — NÃO editar manualmente
│   │   ├── layout/
│   │   │   ├── AppShell.tsx     # Header + main + BottomNav
│   │   │   └── BottomNav.tsx    # Tabs por role
│   │   ├── feedback/
│   │   │   ├── LoadingList.tsx
│   │   │   ├── ErrorCard.tsx
│   │   │   └── EmptyState.tsx
│   │   └── ShareButton.tsx
│   │
│   ├── lib/                 # Utilitários e contexto global
│   │   ├── api.ts                  # HTTP client + tokenStorage + ApiError
│   │   ├── auth-context.tsx        # AuthProvider + useAuth
│   │   ├── role-context.tsx        # RoleProvider + useRole
│   │   ├── handle-error.ts         # handleApiError + bookingCancelErrorMessage
│   │   ├── types.ts                # Tipos de domínio
│   │   ├── format.ts               # Date, money, status, isUnlimitedPlanLimit
│   │   ├── timezone.ts             # brHourToUtc / utcHourToBr (UTC−3 sem DST)
│   │   ├── date-filters.ts         # DateRange + isInDateRange
│   │   └── utils.ts                # cn() do shadcn
│   │
│   └── routeTree.gen.ts     # Gerado — não editar manualmente
│
├── docs/                    # Esta pasta
├── public/                  # Assets estáticos
├── .env.example
├── CLAUDE.md                # Guia pra agentes IA
├── package.json
├── tsconfig.json            # `@/*` → `src/*`
├── vite.config.ts           # Mínimo — preset cuida do resto
└── eslint.config.js
```

### Path alias

`@/*` mapeia pra `src/*`. Configurado em `tsconfig.json` + Vite via `vite-tsconfig-paths`. Sempre use `@/lib/api` em vez de `../../../lib/api`.

---

## 4. Roteamento (TanStack Router)

### File-based conventions

| Padrão                                            | URL gerada            | Comportamento                                                      |
| ------------------------------------------------- | --------------------- | ------------------------------------------------------------------ |
| `routes/index.tsx`                                | `/`                   | Rota raiz                                                          |
| `routes/login.tsx`                                | `/login`              | Rota simples                                                       |
| `routes/_protected.tsx`                           | (nenhuma)             | **Pathless layout** — prefixo `_`. Cria guard sem segmento na URL. |
| `routes/_protected.my-bookings.tsx`               | `/my-bookings`        | URL **sem** o `_protected` — só herda o guard                      |
| `routes/_protected._admin.trips.tsx`              | `/trips`              | Dois guards aninhados (auth + admin), URL plana                    |
| `routes/_protected.trips.$orgId.tsx`              | `/trips/abc-123`      | Parâmetro dinâmico                                                 |
| `routes/_protected.trips.$orgId.$tripId.book.tsx` | `/trips/abc/xyz/book` | Múltiplos parâmetros + segmento literal                            |

Após adicionar/renomear um arquivo em `routes/`, o Vite plugin regenera `routeTree.gen.ts` automaticamente em dev mode (e durante build). **Nunca edite `routeTree.gen.ts` manualmente.**

### Pathless layouts e guards aninhados

```
_protected.tsx              ←  Guard 1: usa useAuth() — redireciona pra /login se !isAuthenticated
└── _protected._admin.tsx   ←  Guard 2: usa useRole() — redireciona pra / se !isAdmin
    └── _protected._admin.trips.tsx   ←  Renderiza só se passou nos 2 guards acima
```

URL pra qualquer rota sob `_admin` é simplesmente `/<resource>` — o `_admin` some.

### Detalhe importante: rotas-pai com filhos

Quando uma rota como `_protected.profile.tsx` ganha uma filha (`_protected.profile.driver.tsx`), o TanStack começa a tratar `profile.tsx` como layout. Pra evitar que o conteúdo do pai engula a filha:

```tsx
function ProfilePage() {
  const location = useLocation();
  if (location.pathname.startsWith("/profile/driver")) {
    return <Outlet />;
  }
  return <ProfileContent />;
}
```

Ver `_protected.trips.$orgId.tsx:14-22` e `_protected.profile.tsx` como exemplos.

### Rota unificada `/trip/$tripId`

Decisão recente: tela de detalhe de viagem é a **mesma rota** pra admin e driver (`/_protected/trip/$tripId`, fora do guard `_admin`). O componente recebe `role: "admin" | "driver"` e gateia ações:

- **Admin:** assignment de driver/veículo, todas as transições, cancelar viagem.
- **Driver:** vê passageiros + transitions `IN_PROGRESS`/`FINISHED` apenas.

Isso elimina duplicação de UI e simplifica navegação.

---

## 5. Autenticação & Autorização

### Tokens

Armazenados em `localStorage` via `src/lib/api.ts → tokenStorage`:

```
tt_access   → JWT de acesso (TTL 1h)
tt_refresh  → refresh token (rotacionado em cada uso)
tt_user     → snapshot do AuthUser (JSON)
```

### Auto-refresh on 401

O wrapper `api()` em `src/lib/api.ts`:

1. Adiciona `Authorization: Bearer <access>` por default (passe `{ auth: false }` pra rota pública).
2. Se a resposta é 401 **e** `auth=true` **e** ainda não tentou retry:
   - Dispara `POST /auth/refresh` com o `refreshToken`.
   - **Deduplica:** se já tem refresh em curso, aguarda o mesmo Promise (evita race em chamadas concorrentes).
   - Salva novos tokens, repete a chamada original com flag `_retry=true`.
3. Se o refresh também falhar (401), limpa o storage e propaga o erro — caller decide redirecionar pro login.

### `AuthContext` (`lib/auth-context.tsx`)

API:

```ts
const {
  user,              // AuthUser | null
  isAuthenticated,   // !!user
  loading,           // true durante hidratação inicial
  login(email, password),
  signup({ name, email, password, telephone }),
  setSession(authResponse),   // pra auto-login pós reset/verify
  logout(),
  refreshUser(),
} = useAuth();
```

`setSession` é o ponto único pra externalizar um login feito por outro endpoint (`POST /auth/reset-password` retorna `TokenResponse` direto — usa `setSession` em vez de re-implementar storage).

### `RoleContext` (`lib/role-context.tsx`)

Carregado depois do AuthContext, dispara após autenticação:

```ts
const {
  isAdmin, // true se membership ACTIVE de role ADMIN em ≥1 org
  isDriver, // true se hasDriverProfile && membership ACTIVE de role DRIVER em ≥1 org
  hasDriverProfile, // true se GET /drivers/me retornou 200 (perfil existe, mesmo sem membership)
  adminOrgId, // ID da primeira org onde é admin
  roleLoading,
  refetchRole, // dispare depois de criar/vincular driver
} = useRole();
```

**Importante:** `hasDriverProfile ≠ isDriver`. Quem criou perfil de driver via `POST /drivers` mas ainda não foi vinculado a uma org só vê `/profile/driver`, não vê a tab "Como motorista" nem rotas sob `_driver/`.

Algoritmo:

```
isAdmin = await Promise.race([
  for (org of /organizations/me) {
    if (/memberships/me/role/<org.id> = "ADMIN") return true;
  }
  return false;
])

hasDriverProfile = (GET /drivers/me) === 200
isDriver = hasDriverProfile && /memberships/me/role/<org.id> = "DRIVER" pra alguma org
```

### Navegação por role (`BottomNav.tsx`)

Precedência: **admin > driver > passenger**. Cada role vê 4-5 tabs:

| Role          | Tabs                                               |
| ------------- | -------------------------------------------------- |
| **Passenger** | Explorar · Empresas · Inscrições · Perfil          |
| **Driver**    | Explorar · Como motorista · Inscrições · Perfil    |
| **Admin**     | Dashboard · Viagens · Templates · Empresa · Perfil |

Index (`/`) redireciona inteligentemente:

```
Não autenticado → LandingPage (com CTAs pra /login, /signup, /signup/empresa)
Admin           → /dashboard
Passenger/Driver→ /public/trip-instances
```

---

## 6. Camada de Dados: Services + Hooks

### Filosofia

Três camadas de responsabilidade:

```
┌─────────────────┐   ┌──────────────────┐   ┌─────────────┐
│ Components/Routes│ → │ Hooks (use cases)│ → │ Services    │ → fetch
└─────────────────┘   └──────────────────┘   └─────────────┘
```

- **Services** (`src/services/<resource>.service.ts`): repositório dos endpoints. Chamam `api()`. Sem lógica de UI.
- **Hooks** (`src/features/<feature>/hooks/use<Name>.ts`): casos de uso. Encapsulam fetch + state + side effects.
- **Components/Routes**: apresentação. Recebem dados via props ou via hooks. Nunca chamam `api()` direto.

A exceção é `routes/_protected.profile.tsx`, que chama `api("/users/me")` por não haver service de usuário ainda. Tudo o mais usa services.

### Services existentes

```ts
// auth.service.ts (anônimos)
authService.forgotPassword(email)              // POST /auth/forgot-password — 204 sempre (anti-enumeração)
authService.resetPassword(token, newPassword)  // POST /auth/reset-password — retorna TokenResponse
authService.verifyEmail(token)                 // POST /auth/verify-email — 204
authService.refresh(refreshToken)              // POST /auth/refresh

// trips.service.ts
tripsService.listPublic()                      // GET /public/trip-instances — anônimo
tripsService.listByOrgId(orgId)                // GET /trip-instances/organization/{orgId}
tripsService.listBySlug(slug)                  // GET /public/trip-instances/org/{slug}
tripsService.listForDriver(page?, limit?, status?) // GET /trip-instances/driver/me — driver self-service
tripsService.getPublicById(id) / getById(id)
tripsService.create(orgId, { tripTemplateId, departureDate, totalCapacity, ... })
tripsService.updateStatus(id, newStatus)       // PATCH /trip-instances/{id}/status
tripsService.assignDriver(id, driverId?)
tripsService.assignVehicle(id, vehicleId?)
tripsService.listPassengers(tripId)

// bookings.service.ts
bookingsService.listForUser() / listByTripInstance(tripId)
bookingsService.create({ tripInstanceId, enrollmentType, boardingStop, alightingStop, method })
bookingsService.checkAvailability(tripId)
bookingsService.cancel(id) / confirmPresence(id)
bookingsService.getDetails(id)

// drivers.service.ts
driversService.createMe({ cnh, cnhCategories, cnhExpiresAt })  // self-service POST /drivers
driversService.getMe() / updateMe({ cnhCategories?, cnhExpiresAt? })  // PATCH /drivers/me
driversService.listByOrgId(orgId) / lookup(email, cnh)
driversService.addToOrg(userEmail, cnh)
driversService.removeMembership(userId, roleId, orgId) / restoreMembership(...)
// driversService.update(id, ...) ← exposto mas SEM UI que chama (admin não edita driver)

// templates.service.ts
templatesService.listByOrgId(orgId) / getById(id)
templatesService.create(orgId, { departurePoint, destination, stops, shift, departureTimeOfDay, arrivalTimeOfDay, defaultCapacity, defaultDriverId?, defaultVehicleId?, ... })
templatesService.update(id, partial) / remove(id)
templatesService.generateInstances(id, daysAhead?)

// vehicles.service.ts, organizations.service.ts, payments.service.ts, subscriptions.service.ts, scheduling.service.ts, plans.service.ts
// ... seguem o mesmo padrão
```

### Padrão de hook

```ts
// features/trips/hooks/useTrips.ts
export function useTrips({ orgId, slug }) {
  const [trips, setTrips] = useState<TripInstance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const fetch = slug ? tripsService.listBySlug(slug) : tripsService.listByOrgId(orgId);
    fetch
      .then((res) => {
        if (cancelled) return;
        setTrips(unwrap(res));
      })
      .catch((err) => {
        if (cancelled) return;
        setError(err.message);
        handleApiError(err, "Erro ao carregar viagens");
      });
    return () => {
      cancelled = true;
    };
  }, [orgId, slug, tick]);

  return { trips, loading: trips === null && !error, error, refetch: () => setTick((t) => t + 1) };
}
```

Convenções:

- Use `cancelled` flag pra ignorar respostas após unmount.
- Exponha `refetch` quando faz sentido invalidar (após mutação externa).
- Sempre chame `handleApiError` no catch — toast unificado por errorCode.
- Loading = `data === null && !error`.

### Padrão `notFound` (404 ≠ erro)

Quando 404 é estado legítimo (ex.: `GET /drivers/me` retorna 404 pra user sem perfil; `GET /scheduling-config` pra org legacy), o hook separa em flag `notFound: true`:

```ts
// useMyDriver.ts
function isDriverNotFound(err: ApiError): boolean {
  if (err.status === 404) return true;
  if (err.errorCode === "DRIVER_NOT_FOUND") return true;
  // heurística defensiva caso backend não padronize
  const msg = String(err.message ?? "").toLowerCase();
  return msg.includes("driver") && msg.includes("not found");
}

// No catch:
if (err instanceof ApiError && isDriverNotFound(err)) {
  setNotFound(true);
  return; // não dispara toast — não é erro
}
```

### Caching: `useDriverName` + `<DriverDisplayName>`

Endpoints de listagem de driver não trazem `userName`/`userEmail`. Pra evitar exibir "CNH 12345…" como label principal:

- `useDriverName(driverId)` — cache global (`Map`) + dedup de inflight Promises. Busca `GET /drivers/{id}/name`.
- `<DriverDisplayName driver={d} />` — renderiza nome via cache; mostra "Carregando..." inicial e depois o nome.
- `driverDisplayString(driver)` em `features/drivers/lib/driver-display.ts` — versão síncrona pra `textValue` de `<SelectItem>` (texto puro, sem JSX).

---

## 7. Componentes & UI

### shadcn/ui — política rígida

Componentes em `src/components/ui/` são **ownership-style** (copiados do registry). **Não edite manualmente**. Pra adicionar novo:

```bash
npx shadcn@latest add <componente>
```

Pra atualizar um existente, rode o mesmo comando. Não criar wrappers que renomeiem ou removam props — sempre passe-through.

### `AppShell` (`components/layout/AppShell.tsx`)

Wrapper padrão de toda tela autenticada (e quase todas anônimas).

```tsx
<AppShell title="Minhas viagens" back showTabs>
  {/* conteúdo */}
</AppShell>
```

- `title`: aparece no header.
- `back`: bool — se true, mostra `<ArrowLeft>` que faz `router.history.back()`.
- `showTabs`: default `true` — renderiza `<BottomNav>` no rodapé.

Logout fica como ícone no canto direito do header pra todo user autenticado.

### Feedback components

| Componente      | Quando usar                                                                                                                                   |
| --------------- | --------------------------------------------------------------------------------------------------------------------------------------------- |
| `<LoadingList>` | Listagem carregando — N skeletons. Configurável (count, height).                                                                              |
| `<ErrorCard>`   | Erro inesperado durante fetch — mostra mensagem.                                                                                              |
| `<EmptyState>`  | Lista vazia legítima. Variants: trips, bookings, drivers, templates, payments, search. Inclui ilustração SVG inline + action button opcional. |

### Padrão "View Card + Pencil → Dialog"

Pra todas as telas de edição de dados do próprio user / org / driver / template, seguimos:

```tsx
<Card>
  <Header>
    <Title /> <StatusBadge /> <PencilButton onClick={openEdit} />
  </Header>
  <ReadOnlyDataView />   {/* dl / Badges / texto */}
</Card>
<EditDialog open={editing} onClose={() => setEditing(false)} onUpdated={setData} />
```

Exemplos: `_protected.profile.tsx`, `_protected._admin.organization.tsx`, `_protected.profile.driver.tsx`. **Não** misture form inline com view no mesmo card.

### `ShareButton` (`components/ShareButton.tsx`)

Web Share API quando disponível (mobile); clipboard fallback (desktop). Use em telas públicas que merecem compartilhamento (detalhe de viagem, perfil de org).

---

## 8. Tratamento de Erros

### `ApiError` (`lib/api.ts`)

```ts
class ApiError extends Error {
  status: number;
  data: unknown;
  errorCode: string | null; // do campo `error` do payload
}
```

### Sempre prefira `errorCode` a parsing de `message`

`errorCode` é contrato estável documentado em `docs/API_FRONTEND.md`. `message` é mutável e localizado.

```ts
// ❌
if (err.message.includes("plan limit")) ...

// ✅
if (err.errorCode === "MONTHLY_TRIP_PLAN_LIMIT_FORBIDDEN") ...
```

Exceção: heurística defensiva em hooks `notFound` quando o backend retorna 400/500 ao invés de 404.

### `handleApiError(err, fallbackMsg)`

```ts
import { handleApiError } from "@/lib/handle-error";

try {
  await bookingsService.create(...);
} catch (err) {
  handleApiError(err, "Erro ao criar inscrição");
}
```

O helper:

1. Detecta 403 de limite de plano (`*PLAN_LIMIT*`, `NO_ACTIVE_SUBSCRIPTION_FORBIDDEN`) → toast com action "Ver planos" → `/organization`.
2. Detecta erros de scheduling de viagem (`INVALID_TRIP_TIME_OF_DAY_FORMAT`, `INVALID_TRIP_TEMPLATE_MISSING_SCHEDULE`, etc.) → mensagem mapeada em PT-BR.
3. Detecta erros de driver/auth (`TRIP_NOT_ASSIGNED_TO_DRIVER_FORBIDDEN`, `INVALID_OR_EXPIRED_RESET_TOKEN_BAD_REQUEST`, 14 códigos no total) → mensagem mapeada.
4. Fallback: toast com `err.message` ou `fallbackMsg`.

### `bookingCancelErrorMessage(err)`

Helper specialized pra cancelamento de booking — retorna **string** (não toast). Pra usar em diálogos onde já temos UI customizada.

Mapas:

- `BOOKING_CANCEL_WINDOW_CLOSED_BAD_REQUEST` → "Cancelamento bloqueado: faltam menos de 30 minutos…"
- `BOOKING_TRIP_TERMINAL_BAD_REQUEST` → "Esta viagem já começou…"
- `BOOKING_ALREADY_INACTIVE_BAD_REQUEST` → "Esta inscrição já foi cancelada."

---

## 9. Internacionalização & Timezone

### Idioma

PT-BR fixo. Não há sistema de i18n. Datas, moeda e textos diretos no código.

### Timezone (`lib/timezone.ts`)

Backend armazena `departureTimeOfDay` / `arrivalTimeOfDay` (templates) e crons (`generationCron`, `autoCancelCron`) em **UTC**. UI sempre mostra em **horário de Brasília (UTC−3, sem DST)**.

Helpers:

```ts
brHourToUtc("07:30"); // "10:30"
utcHourToBr("10:30"); // "07:30"
```

**Regra rígida:** nunca expor HH:mm UTC literal na UI. Nunca expor cron string crua (`"0 2 * * *"`). Use widgets amigáveis (time picker pra cron diário, Select de presets pra recorrente).

### Formatação (`lib/format.ts`)

```ts
formatDateTime(iso, timeOnly?)   // "10/05 07:30" ou "07:30"
formatFullDate(iso)              // "segunda-feira, 10 de maio de 2026"
formatPrice(value)               // "R$ 12,50"
statusLabel(s)                   // "Agendada" / "Confirmada" / "Em curso" etc.
statusVariant(s)                 // "default" | "secondary" | "destructive" | "outline"
canEnroll(s)                     // true se SCHEDULED ou CONFIRMED
bookingStatusLabel(s)            // "Ativa" / "Cancelada"
enrollmentTypeLabel(t)           // "Somente ida" etc.
paymentMethodLabel(m) / paymentStatusLabel(s) / paymentStatusVariant(s)
tripPriceFor(trip, type)         // computa preço pela enrollmentType escolhida
isUnlimitedPlanLimit(max)        // true se max >= 1000 — pra renderizar "ilimitado"
```

---

## 10. Fluxos de Negócio

### 10.1 Signup B2C (passageiro)

```
/ → "Cadastre-se" → /signup
  ↓ form (nome, email, telefone, senha)
  ↓ POST /auth/register
  ↓ tokens salvos
  ↓ redirect /public/trip-instances (BottomNav passenger)
```

### 10.2 Signup B2B (empresa + admin atomicamente)

```
/ → "Sou empresa" → /signup/empresa
  ↓ form completo (user + org com CNPJ, slug, etc.)
  ↓ POST /auth/register-organization (atômico)
  ↓ user vira admin direto, sem passar pelo /setup
  ↓ redirect /dashboard
```

### 10.3 Setup admin (B2C → admin)

User B2C já cadastrado faz upgrade:

```
/setup → wizard 4 passos:
  1. POST /auth/setup-organization (cria org, user vira admin)
  2. POST /trip-templates/organization/{orgId} (1+ templates)
  3. POST /trip-instances/organization/{orgId} (com departureDate, NÃO departureTime)
  4. POST /memberships/driver (opcional)
→ redirect /organizations
```

### 10.4 Booking (passageiro)

```
/public/trip-instances → buscar/filtrar → clicar viagem
  ↓ /public/trip-instances/$id (detalhe)
  ↓ "Inscrever-se" → /trips/$orgId/$tripId/book
  ↓ Select de paradas embarque + desembarque (impede igual)
  ↓ tipo (Ida/Volta/Ambos) + método (Pix/Dinheiro/Cartão)
  ↓ POST /bookings → booking + payment criados
  ↓ /bookings-success/$bookingId (confetti)
  ↓ /my-bookings
```

Detalhes:

- Deslogado: botão vira "Entrar para reservar" → `/login?redirect=…`.
- Já inscrito: botão vira "Ver inscrição" → `/my-bookings/$bookingId`. Guard via `useUserBookingForTrip`.
- Cancelamento: AlertDialog. Bloqueia se < 30min antes ou trip em status terminal.

### 10.5 Driver onboarding (split em 2 etapas)

A separação `hasDriverProfile vs isDriver` previne que qualquer user "vire driver" sem aprovação:

```
Etapa 1 — Self-service (qualquer user autenticado):
  /profile → card "Trabalhar como motorista" → /profile/driver
  → form com alert amarelo + checkbox obrigatório
  → POST /drivers (cnh, cnhCategories[], cnhExpiresAt)
  → user tem hasDriverProfile=true, mas NÃO é driver ainda
  → tab "Como motorista" NÃO aparece

Etapa 2 — Vínculo (admin de uma org):
  /drivers (admin) → "Adicionar" → lookup por email + CNH
  → POST /memberships/driver
  → user agora tem membership DRIVER ativa
  → próximo login (ou refetchRole()) habilita tab "Como motorista"

Etapa 3 — Editar próprios dados (driver):
  /profile/driver → Card read-only com pencil
  → Dialog "Editar dados do motorista"
  → PATCH /drivers/me (cnhCategories, cnhExpiresAt apenas)
  → cnh fica readonly — só admin pode trocar via PUT /drivers/{id} (sem UI hoje)
```

**Admin não edita driver.** Decisão de UX: admin só remove (soft, reversível). Mudanças de dados ficam com o próprio driver. Isso preserva integridade cross-org — admin de Org X não muda dados de driver que pode pertencer a outras orgs.

### 10.6 Trip Scheduling (templates + cron)

```
Admin cria template recorrente:
  - departureTimeOfDay / arrivalTimeOfDay (BR no input, UTC no payload)
  - defaultCapacity
  - frequency: dias da semana
  - Opcionalmente: defaultDriverId + defaultVehicleId

  Se ambos defaults setados → badge "Auto-publica" no TemplateCard

Scheduling automático (backend cron):
  - 0 2 * * * UTC (configurável por org)
  - Gera instâncias dos próximos daysAhead dias
  - Se template tem defaults → instância já criada como SCHEDULED
  - Sem defaults → DRAFT (admin precisa atribuir driver/vehicle manualmente)

Geração manual:
  - Botão "Gerar instâncias agora" no TemplateCard (só pra recorrentes ACTIVE)
  - Mesma lógica do cron, mas imediato
  - Toast: "{created} criadas · {skipped} ignoradas · {failed} falhas"
```

Configuração por org em `/organization → SchedulingConfigCard`:

- `enabled` toggle.
- `daysAhead` (1–90).
- Horário de geração diária (input BR, convertido pra cron UTC).
- Frequência de auto-cancel (Select de presets: "A cada 15 min", "A cada 1h", etc.).

### 10.7 Auth flows: forgot/reset password + verify email

**Forgot:**

```
/login → "Esqueci a senha" → /forgot-password
  ↓ POST /auth/forgot-password (sempre 204, anti-enumeração)
  ↓ tela genérica "Se o email estiver cadastrado…"
  ↓ user recebe link por email
```

**Reset:**

```
/reset-password?token=<token>
  ↓ form (nova senha + confirmação)
  ↓ POST /auth/reset-password → TokenResponse
  ↓ authContext.setSession(res)
  ↓ redirect / (auto-login)
```

**Verify email:**

```
/verify-email?token=<token>
  ↓ POST /auth/verify-email (204)
  ↓ POST /auth/refresh (pra pegar JWT com emailVerifiedAt populado)
  ↓ setSession(refreshed)
  ↓ redirect /
```

Em dev mode, tokens saem por `GET /dev/emails/latest?to=<email>` (mock email service).

### 10.8 Plano premium "ilimitado"

Backend usa valores sentinela (`maxMonthlyTrips = 9999`) pra planos premium. UI trata como ilimitado se ≥1000 (`isUnlimitedPlanLimit`):

- `/public/plans` PlanCard → "Viagens ilimitadas por mês"
- `/organization` UsageRow → "X (ilimitado)" sem barra de progresso
- `UpgradePlanDialog` → "viagens ilimitadas/mês" no subtítulo

---

## 11. Build & Deploy

### Setup local

```bash
cp .env.example .env
# Ajustar VITE_API_URL (default: http://localhost:5701)
npm install
npm run dev          # Vite dev server
```

### Scripts

```bash
npm run dev          # Dev server (Vite + TanStack Router watch)
npm run build        # Build de produção
npm run build:dev    # Build em modo development (sourcemaps, sem minify)
npm run preview      # Preview do build
npm run lint         # ESLint
npm run lint:ci      # Same, sem auto-fix
npm run format       # Prettier --write
npm run format:check # Prettier --check
```

### Variáveis de ambiente

| Var            | Descrição                     | Padrão                  |
| -------------- | ----------------------------- | ----------------------- |
| `VITE_API_URL` | Base URL do backend Movy Java | `http://localhost:5701` |

Sem outras envs no FE. Tudo o mais é constante.

### Deploy

Cloudflare Workers via `@cloudflare/vite-plugin`. O build gera artefatos em `dist/` prontos pro Wrangler.

### `vite.config.ts` — não tocar

Usa o preset `@lovable.dev/vite-tanstack-config` que já inclui:

- TanStack router plugin
- React plugin
- Tailwind CSS plugin
- tsconfig paths
- Cloudflare adapter

**Adicionar plugins manualmente quebra o build** (duplicação). Se precisar de plugin novo, criar issue no preset upstream.

### Sem framework de testes

Decisão consciente: o ROI de unit tests pra app B2B em estágio inicial é baixo. Validação é manual via `docs/E2E_MANUAL.md` (97 cenários estruturados). Migração futura possivelmente Playwright pra E2E + Vitest pra unit. Ver `docs/DECISIONS.md`.

---

## 12. Como Adicionar Funcionalidades

### Adicionar uma rota nova

1. **Criar arquivo** em `src/routes/` seguindo o naming flat: `_protected.<area>.<resource>.tsx`. Exemplos:
   - Pública: `routes/about.tsx` → `/about`
   - Autenticada: `routes/_protected.my-stats.tsx` → `/my-stats`
   - Admin: `routes/_protected._admin.reports.tsx` → `/reports`
   - Driver: `routes/_protected._driver.deliveries.tsx` → `/deliveries`
   - Com parâmetro: `routes/_protected.invoice.$id.tsx` → `/invoice/abc-123`

2. **Esqueleto:**

```tsx
import { createFileRoute } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";

export const Route = createFileRoute("/_protected/_admin/reports")({
  component: ReportsPage,
});

function ReportsPage() {
  return (
    <AppShell title="Relatórios" back>
      {/* ... */}
    </AppShell>
  );
}
```

3. **Vite plugin regenera** `routeTree.gen.ts` automaticamente em dev. Em build, roda como parte do `npm run build`.

4. **Se o layout pai (`_admin.tsx` / `_driver.tsx`) ainda não tem filho**, adicione esta rota pra evitar o conflito de URL com `/`.

5. **Sem framework de testes** → validar manualmente.

### Adicionar uma feature module

```
src/features/<feature>/
├── hooks/
│   ├── use<Feature>.ts          # Use case: lista, detalhe, etc.
│   └── use<Feature>Detail.ts    # Se precisar separar
└── components/
    ├── <Feature>Card.tsx        # Item de lista
    ├── <Feature>List.tsx        # Container com EmptyState
    └── <Feature>FormSheet.tsx   # CRUD form (em Sheet) ou Dialog
```

1. Criar service em `src/services/<feature>.service.ts` se o endpoint não existe.
2. Criar hook que combina state + fetch + side effects.
3. Criar componentes apresentacionais (recebem dados via props).
4. Adicionar rota fina que usa o hook.

### Adicionar um novo errorCode

1. Backend documenta o novo code em `docs/API_FRONTEND.md`.
2. Em `src/lib/handle-error.ts`, adicione no mapa apropriado:
   - `BOOKING_CANCEL_MESSAGES` → cancelamento de booking
   - `TRIP_SCHEDULING_MESSAGES` → criação/edição de template ou instância
   - `DRIVER_AND_AUTH_MESSAGES` → driver, auth, payment, CNH
   - Criar mapa novo se for área diferente.
3. Mensagem em PT-BR, curta e acionável.

### Adicionar um componente shadcn

```bash
npx shadcn@latest add <componente>
```

Edita `src/components/ui/<componente>.tsx`. **Não edite o arquivo gerado**. Pra customizar styles, use Tailwind classes nas instâncias onde renderizar.

---

## 13. Convenções & Anti-patterns

### Faça

- **Use services** pra chamadas HTTP (nunca `api()` direto em rotas/componentes).
- **Use hooks** pra encapsular lógica de fetch + state. Hooks são casos de uso.
- **Use `errorCode`** estável do backend pra mapear erros pra mensagens.
- **Use o padrão Card view + pencil → Dialog** pra edição de dados.
- **Use `<DriverDisplayName>`** ou `driverDisplayString` pra exibir nomes de motoristas.
- **Use `isUnlimitedPlanLimit`** pra renderizar limites altos como "ilimitado".
- **Converta horários BR↔UTC** sempre via `timezone.ts` — nunca exiba UTC literal.

### Não faça

- ❌ Chamar `api()` direto em componente/rota — use o service.
- ❌ Duplicar guard de auth em rota individual — `_protected.tsx` cobre.
- ❌ Modificar `src/components/ui/` manualmente — use CLI do shadcn.
- ❌ Adicionar React Query num PR sem decisão explícita (ver ADR-002 em `docs/DECISIONS.md`).
- ❌ Adicionar plugins ao `vite.config.ts` — o preset já cuida.
- ❌ Tratar `cnhCategory` como string única — virou array (`cnhCategories: ("A"|"B"|"C"|"D"|"E")[]`) na Phase 5.
- ❌ Chamar `PUT /drivers/{id}` em self-service — admin-only. Use `updateMe`.
- ❌ Expor edição de dados de driver pra admin — só remove via membership.
- ❌ Mostrar "CNH 12345" como nome principal — use display component.
- ❌ Buscar template separado pra hidratar `TripInstance` — endpoints `/trip-instances/...` já vêm enriquecidos.
- ❌ Enviar `departureTime`/`arrivalEstimate` ao criar `TripInstance` — só `departureDate`.
- ❌ Expor cron strings (`"0 2 * * *"`) ou UTC literal na UI — sempre BR + widgets.
- ❌ Usar `_driver.tsx` como guard pra rotas que só dependem de `hasDriverProfile` (ex.: `/profile/driver`). Use `_protected/` direto.

---

## 14. Glossário

| Termo                      | Definição                                                                                                   |
| -------------------------- | ----------------------------------------------------------------------------------------------------------- |
| **TripTemplate**           | Modelo de rota recorrente (origem, destino, paradas, turno, horários, preços, frequência semanal).          |
| **TripInstance**           | Ocorrência concreta de um template — uma viagem agendada num dia específico. Tem driver/veículo atribuídos. |
| **Booking** (= Enrollment) | Inscrição de um passageiro numa `TripInstance`. Tem status ACTIVE/INACTIVE, tipo (ONE_WAY/RETURN/...).      |
| **Payment**                | Registro de pagamento atrelado a um booking. Status PENDING/CONFIRMED/FAILED.                               |
| **Subscription**           | Assinatura ativa da organização num `Plan`. Define limites (vehicles, drivers, monthlyTrips).               |
| **PlanUsage**              | Snapshot atual do uso vs limite do plano. Vem de `GET /organizations/{id}/plan-usage`.                      |
| **Membership**             | Vínculo entre user + role + organização. Roles: ADMIN, DRIVER. Soft-removível via `removedAt`.              |
| **SchedulingConfig**       | Configuração por org do cron de geração automática de instâncias + auto-cancel de trips baixa receita.      |
| **hasDriverProfile**       | User criou perfil de driver (`POST /drivers`) — mas ainda não foi vinculado a uma org.                      |
| **isDriver**               | `hasDriverProfile && membership DRIVER ativa em ≥1 org`. Habilita tab "Como motorista" + rotas `_driver/`.  |
| **Pathless layout**        | Rota TanStack com prefixo `_` que não adiciona segmento na URL. Usada pra guards/providers aninhados.       |
| **errorCode**              | Campo `error` no payload de resposta do backend. Contrato estável, documentado em `API_FRONTEND.md`.        |
| **Auto-publica**           | Template com `defaultDriverId` E `defaultVehicleId` setados — instâncias geradas vão direto pra SCHEDULED.  |
| **Limite ilimitado**       | `maxMonthlyTrips >= 1000` no plano. UI mostra "ilimitado" em vez do número (valor sentinela).               |
| **Cross-flow**             | Fluxo que cruza rotas/contextos (ex.: criar B2C → voltar → criar B2B). Cobertos em `E2E_MANUAL.md`.         |

---

## Manutenção desta doc

Esta doc deve ser revisada quando:

1. **Nova feature** ou rota for adicionada → atualizar seções 3, 4, 6, 10.
2. **Mudança de pattern** (ex.: começamos a usar React Query) → atualizar seções 6, 13.
3. **Novo padrão de erros** → atualizar seção 8.
4. **Nova decisão arquitetural** → registrar em `docs/DECISIONS.md` E atualizar aqui.

Para detalhes que ficaram fora dessa overview, consulte:

- [`API_FRONTEND.md`](./API_FRONTEND.md) — contrato completo da API.
- [`E2E_MANUAL.md`](./E2E_MANUAL.md) — 97 cenários de teste manuais.
- [`DECISIONS.md`](./DECISIONS.md) — ADRs (Architecture Decision Records).
- [`HANDOFF.md`](./HANDOFF.md), [`PROGRESS.md`](./PROGRESS.md), [`BACKLOG.md`](./BACKLOG.md) — operacional/histórico.
- [`architecture.md`](./architecture.md), [`auth.md`](./auth.md), [`routes.md`](./routes.md), [`components.md`](./components.md), [`types.md`](./types.md), [`setup.md`](./setup.md) — deep-dives por área (podem ter trechos desatualizados; esta doc é a fonte canônica pra v1.0).
