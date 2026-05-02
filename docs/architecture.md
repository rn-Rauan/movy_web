# Arquitetura do Projeto — movy_web

## Visão Geral

**movy_web** é um SaaS de transporte — sistema de gerenciamento e reserva de viagens. Construído mobile-first, suporta três papéis: User (passageiro), Driver (motorista) e Admin (gestão da organização).

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
| HTTP Client | `fetch` nativo com wrapper + auto-refresh |
| Validação de Formulários | Zod |
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
│  __root.tsx → AuthProvider → RoleProvider → Outlet          │
├─────────────────────────────────────────────────────────────┤
│                  Rotas (thin controllers)                     │
│  Público                    │  _protected (guard central)    │
│  /public/trip-instances     │  /organizations                │
│  /public/organizations/:slug│  /trips/:orgId[/:tripId[/book]]│
│  /login  /signup            │  /my-bookings[/:bookingId]     │
│                             │  /setup (wizard admin)         │
├─────────────────────────────────────────────────────────────┤
│               Feature Modules (features/)                    │
│  trips/hooks + components   │  bookings/hooks + components   │
│  organizations/hooks + components                            │
├─────────────────────────────────────────────────────────────┤
│               Services (repository pattern)                  │
│  trips.service.ts  │  bookings.service.ts  │  organizations.service.ts │
├─────────────────────────────────────────────────────────────┤
│                           lib/                               │
│  api.ts (HTTP + tokenStorage + auto-refresh + ApiError)      │
│  auth-context.tsx (AuthProvider / useAuth)                   │
│  role-context.tsx (RoleProvider / useRole)                   │
│  types.ts  │  format.ts  │  utils.ts                        │
├─────────────────────────────────────────────────────────────┤
│                       API Backend (REST)                      │
│  VITE_API_URL → /auth /public /bookings /organizations /etc  │
└─────────────────────────────────────────────────────────────┘
```

---

## Estrutura de Diretórios

```
movy_web/
├── src/
│   ├── features/                  # Feature modules (lógica de domínio)
│   │   ├── trips/
│   │   │   ├── hooks/
│   │   │   │   ├── usePublicTrips.ts    # Marketplace público
│   │   │   │   ├── useTrips.ts          # Lista por orgId ou slug
│   │   │   │   └── useTripDetail.ts     # Detalhe + disponibilidade
│   │   │   └── components/
│   │   │       ├── TripCard.tsx         # Card compacto (lista privada)
│   │   │       ├── TripsList.tsx
│   │   │       ├── PublicTripCard.tsx   # Card rico do marketplace
│   │   │       └── TripDetailView.tsx
│   │   ├── bookings/
│   │   │   ├── hooks/
│   │   │   │   ├── useBookings.ts
│   │   │   │   ├── useBookingDetail.ts
│   │   │   │   └── useBookingForm.ts
│   │   │   └── components/
│   │   │       ├── BookingCard.tsx
│   │   │       ├── BookingsList.tsx
│   │   │       └── BookingDetailView.tsx
│   │   └── organizations/
│   │       ├── hooks/
│   │       │   └── useOrganizations.ts
│   │       └── components/
│   │           ├── OrgCard.tsx
│   │           └── OrgsList.tsx
│   ├── services/                  # Abstração de API (repository pattern)
│   │   ├── trips.service.ts
│   │   ├── bookings.service.ts
│   │   └── organizations.service.ts
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx       # Layout base (header + BottomNav)
│   │   │   └── BottomNav.tsx      # Tabs por role (passenger / admin)
│   │   ├── feedback/
│   │   │   ├── LoadingList.tsx    # Skeletons de lista
│   │   │   └── ErrorCard.tsx      # Card de erro
│   │   └── ui/                    # shadcn/ui — não modificar diretamente
│   ├── hooks/
│   │   └── use-mobile.tsx
│   ├── lib/
│   │   ├── api.ts                 # Cliente HTTP + tokenStorage + auto-refresh
│   │   ├── auth-context.tsx       # AuthProvider + useAuth()
│   │   ├── role-context.tsx       # RoleProvider + useRole()
│   │   ├── format.ts              # Helpers de formatação
│   │   ├── types.ts               # Tipos TypeScript do domínio
│   │   └── utils.ts               # cn() para mesclar classes Tailwind
│   ├── routes/                    # Thin controllers (file-based routing)
│   │   ├── __root.tsx             # Raiz: AuthProvider → RoleProvider → Outlet
│   │   ├── _protected.tsx         # Pathless layout — guard central de auth
│   │   ├── index.tsx              # / → redirect por role
│   │   ├── login.tsx
│   │   ├── signup.tsx
│   │   ├── _protected.organizations.tsx
│   │   ├── _protected.trips.$orgId.tsx
│   │   ├── _protected.trips.$orgId.$tripId.tsx
│   │   ├── _protected.trips.$orgId.$tripId.book.tsx
│   │   ├── _protected.my-bookings.tsx
│   │   ├── _protected.my-bookings.$bookingId.tsx
│   │   ├── _protected.setup.tsx
│   │   ├── public.trip-instances.tsx
│   │   ├── public.trip-instances.index.tsx
│   │   ├── public.trip-instances.$id.tsx
│   │   └── public.organizations.$slug.tsx
│   ├── router.tsx
│   ├── routeTree.gen.ts           # Gerado automaticamente
│   └── styles.css
├── docs/
├── util/
│   └── api-json.json
├── vite.config.ts
├── tsconfig.json
├── wrangler.jsonc
├── bunfig.toml
└── package.json
```

---

## Padrão de Feature Module

Hooks encapsulam fetch + state + side effects. Componentes recebem dados via props.

```tsx
// Hook (caso de uso)
export function useTrips({ orgId, slug }: UseTripsOptions) {
  const [trips, setTrips] = useState<TripInstance[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (slug ? tripsService.listBySlug(slug) : tripsService.listByOrgId(orgId))
      .then((res) => { if (!cancelled) setTrips(Array.isArray(res) ? res : res.data ?? []); })
      .catch((err) => { if (!cancelled) { setError(err.message); toast.error(err.message); } });
    return () => { cancelled = true; };
  }, [orgId, slug]);

  return { trips, loading: trips === null && !error, error };
}

// Rota thin (~15 linhas)
function TripsPage() {
  const { orgId } = Route.useParams();
  const { slug } = Route.useSearch();
  const { trips, loading, error } = useTrips({ orgId, slug });
  return (
    <AppShell title="Viagens" back>
      {loading ? <LoadingList /> : error ? <ErrorCard message={error} /> : <TripsList trips={trips ?? []} orgId={orgId} />}
    </AppShell>
  );
}
```

---

## Guard de Autenticação

O arquivo `_protected.tsx` é um **pathless layout** que centraliza o guard para todas as rotas filhas. Não duplicar `useEffect` de auth em rotas individuais.

```tsx
// src/routes/_protected.tsx
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);

  if (loading || !isAuthenticated) return null;
  return <Outlet />;
}
```

---

## Fluxo de Autenticação e Roles

```
Login (POST /auth/login) → tokenStorage.set() → AuthProvider.setUser()
        │
        ▼
RoleProvider detecta roles:
  GET /drivers/me          → isDriver
  GET /organizations/me    → tem org?
  GET /memberships/me/role/:orgId → role === "ADMIN"?
        │
        ▼
index.tsx redireciona por role:
  Admin  → /_protected/organizations
  User   → /public/trip-instances
```

O `api.ts` intercepta respostas `401` e renova o access token automaticamente via `POST /auth/refresh`, com deduplicação de chamadas concorrentes.

---

## Deploy — Cloudflare Workers

```jsonc
// wrangler.jsonc
{
  "name": "tanstack-start-app",
  "compatibility_date": "2025-09-24",
  "compatibility_flags": ["nodejs_compat"],
  "main": "@tanstack/react-start/server-entry"
}
```

---

## Variáveis de Ambiente

| Variável | Descrição |
|---|---|
| `VITE_API_URL` | URL base da API backend (ex: `https://api.movy.app`) |
