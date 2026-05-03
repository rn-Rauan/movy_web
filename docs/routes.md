# Rotas — movy_web

## Visão Geral do Roteamento

O projeto usa **TanStack Router** com roteamento baseado em arquivos. A `routeTree.gen.ts` é gerada automaticamente pelo plugin do Vite a cada modificação em `src/routes/`.

### Conceito: Pathless Layout (`_protected.tsx`)

O prefixo `_` cria um layout sem segmento na URL. Todas as rotas cujo nome começa com `_protected.` ficam aninhadas sob esse layout, que executa o guard de autenticação uma única vez.

- **Arquivo:** `_protected.organizations.tsx` → **URL:** `/organizations`
- O `_protected` não aparece na URL do browser

---

## Árvore de Rotas

```
/                                               (index.tsx) — redirect por role
│
├── /login                                      (login.tsx)
├── /signup                                     (signup.tsx)
│
├── /public/
│   ├── /trip-instances/                        (public.trip-instances.tsx — layout Outlet)
│   │   ├── /                                   (public.trip-instances.index.tsx)
│   │   └── /$id                                (public.trip-instances.$id.tsx)
│   └── /organizations/$slug                   (public.organizations.$slug.tsx)
│
└── _protected [pathless layout — guard auth]  (_protected.tsx)
    ├── /organizations                          (_protected.organizations.tsx) 🔒
    ├── /trips/$orgId                           (_protected.trips.$orgId.tsx) 🔒
    │   └── /$tripId                            (_protected.trips.$orgId.$tripId.tsx) 🔒
    │       └── /book                           (_protected.trips.$orgId.$tripId.book.tsx) 🔒
    ├── /my-bookings                            (_protected.my-bookings.tsx) 🔒
    │   └── /$bookingId                         (_protected.my-bookings.$bookingId.tsx) 🔒
    └── /setup                                  (_protected.setup.tsx) 🔒 (wizard admin)

🔒 = Guard centralizado em _protected.tsx — não requer proteção individual
```

---

## Guard de Autenticação

**Arquivo:** `src/routes/_protected.tsx`

Pathless layout que verifica autenticação para todas as rotas filhas. **Não duplicar em rotas individuais.**

```tsx
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

## Detalhamento por Rota

### `/` — Redirect por Role

**Arquivo:** `src/routes/index.tsx`  
**Auth:** Não requerida

Redireciona por estado:

- Não autenticado → `/public/trip-instances`
- Admin (`isAdmin`) → `/_protected/organizations`
- Usuário → `/public/trip-instances`

---

### `/login` — Página de Login

**Arquivo:** `src/routes/login.tsx`  
**Auth:** Não requerida  
**Search params:** `redirect?: string`

- Formulário email + senha com validação Zod
- Em sucesso: navega para `redirect` ou `/public/trip-instances`
- Toast de erro em falha

---

### `/signup` — Cadastro

**Arquivo:** `src/routes/signup.tsx`  
**Auth:** Não requerida

| Campo       | Validação      |
| ----------- | -------------- |
| `name`      | mín. 2 chars   |
| `email`     | formato válido |
| `telephone` | mín. 8 chars   |
| `password`  | mín. 6 chars   |

Em sucesso: navega para `/public/trip-instances`.

---

### `/public/trip-instances/` — Marketplace de Viagens

**Arquivo:** `src/routes/public.trip-instances.index.tsx`  
**Auth:** Não requerida

- Hook: `usePublicTrips()`
- Campo de busca por origem/destino (filtro local)
- Cards: `PublicTripCard` — botões "Ver empresa" → `/public/organizations/:slug` | "Ver viagem" → `/public/trip-instances/:id`

---

### `/public/trip-instances/$id` — Detalhe Público

**Arquivo:** `src/routes/public.trip-instances.$id.tsx`  
**Auth:** Não requerida  
**Parâmetros:** `id`

- Hook: `useTripDetail(id)`
- Se autenticado: botão "Ver detalhes e reservar" → `/_protected/trips/:orgId/:tripId`
- Se não autenticado: botão "Entrar para reservar" → `/login?redirect=...`
- Botão desabilitado se viagem lotada ou `!canEnroll(status)`

---

### `/public/organizations/$slug` — Perfil Público de Empresa

**Arquivo:** `src/routes/public.organizations.$slug.tsx`  
**Auth:** Não requerida  
**Parâmetros:** `slug`

- Hook: `useTrips({ orgId: slug, slug })` com endpoint público
- Lista viagens da empresa com botão "Ver viagem"

---

### `/organizations` — Lista de Empresas 🔒

**Arquivo:** `src/routes/_protected.organizations.tsx`  
**Auth:** Requerida (guard via `_protected.tsx`)

- Hook: `useOrganizations()`
- Service: `organizationsService.listActive()`
- Cards: `OrgsList` → clique → `/_protected/trips/:orgId?slug=:slug`

---

### `/trips/$orgId` — Viagens de uma Empresa 🔒

**Arquivo:** `src/routes/_protected.trips.$orgId.tsx`  
**Parâmetros:** `orgId`  
**Search params:** `slug?: string`

- Hook: `useTrips({ orgId, slug })`
- Com `slug`: usa `tripsService.listBySlug(slug)` (público)
- Sem `slug`: usa `tripsService.listByOrgId(orgId)` (autenticado)
- Lista ordenada por `departureTime` crescente

---

### `/trips/$orgId/$tripId` — Detalhe de Viagem 🔒

**Arquivo:** `src/routes/_protected.trips.$orgId.$tripId.tsx`  
**Parâmetros:** `orgId`, `tripId`

- Hook: `useTripDetail(tripId)`
- Busca paralela: dados da viagem + disponibilidade
- Botão "Inscrever-se" → `/_protected/trips/:orgId/:tripId/book`

---

### `/trips/$orgId/$tripId/book` — Formulário de Inscrição 🔒

**Arquivo:** `src/routes/_protected.trips.$orgId.$tripId.book.tsx`  
**Parâmetros:** `orgId`, `tripId`

| Campo            | Opções                                         |
| ---------------- | ---------------------------------------------- |
| `enrollmentType` | `ONE_WAY` · `RETURN` · `ROUND_TRIP`            |
| `boardingStop`   | texto livre                                    |
| `alightingStop`  | texto livre                                    |
| `method`         | `MONEY` · `PIX` · `CREDIT_CARD` · `DEBIT_CARD` |

- Hook: `useBookingForm()`
- Service: `bookingsService.create()`
- Em sucesso: navega para `/_protected/my-bookings`

---

### `/my-bookings` — Minhas Inscrições 🔒

**Arquivo:** `src/routes/_protected.my-bookings.tsx`

- Hook: `useBookings()`
- Service: `bookingsService.listForUser()`
- Lista: `BookingsList` → clique → `/_protected/my-bookings/:bookingId`

---

### `/my-bookings/$bookingId` — Detalhe de Inscrição 🔒

**Arquivo:** `src/routes/_protected.my-bookings.$bookingId.tsx`  
**Parâmetros:** `bookingId`

- Hook: `useBookingDetail(bookingId)`
- Se `status === "ACTIVE"`: botão cancelar com `AlertDialog` de confirmação
- Service: `bookingsService.cancel(bookingId)`

---

### `/setup` — Wizard Admin 🔒

**Arquivo:** `src/routes/_protected.setup.tsx`

Wizard de 4 passos para configuração inicial de organização:

| Passo | Ação                          | Endpoint                                   |
| ----- | ----------------------------- | ------------------------------------------ |
| 1     | Criar organização             | `POST /auth/setup-organization`            |
| 2     | Criar template de viagem      | `POST /trip-templates/organization/:orgId` |
| 3     | Criar instância de viagem     | `POST /trip-instances/organization/:orgId` |
| 4     | Associar motorista (opcional) | `POST /memberships/driver`                 |

Usa `api()` diretamente (não via service) por ser fluxo de setup único. Após conclusão → `/_protected/organizations`.

---

## Convenções de Nomenclatura

| Arquivo                                    | URL no browser               |
| ------------------------------------------ | ---------------------------- |
| `_protected.tsx`                           | (pathless — sem URL)         |
| `_protected.organizations.tsx`             | `/organizations`             |
| `_protected.trips.$orgId.tsx`              | `/trips/:orgId`              |
| `_protected.trips.$orgId.$tripId.book.tsx` | `/trips/:orgId/:tripId/book` |
| `public.trip-instances.index.tsx`          | `/public/trip-instances/`    |
| `public.trip-instances.$id.tsx`            | `/public/trip-instances/:id` |

**Regras:**

- Pontos (`.`) = segmentos de path
- `$` prefix = parâmetro dinâmico
- `_` prefix = pathless layout (não adiciona segmento)
- `.index` = índice da rota pai
