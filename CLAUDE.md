# Movy Web — Documentação do Projeto

## Visão Geral

SaaS de transporte — sistema de gerenciamento e reserva de viagens.

**Stack:** React 19 · TanStack Router (file-based routing) · TanStack React Start · Tailwind CSS · shadcn/ui · Zod

**API Backend:** `VITE_API_URL` (DDD + Clean Architecture)

---

## Papéis do Sistema

| Role   | Capacidades |
|--------|-------------|
| User   | Ver viagens públicas, reservar viagens, gerenciar inscrições |
| Driver | Extensão de User — confirmar presença, marcar pagamentos |
| Admin  | Criar e gerenciar organização, templates, viagens, motoristas |

Roles detectados em runtime via `RoleContext` após autenticação.

---

## Contextos de Acesso

1. **Público** (`/public/*`) — sem autenticação
2. **Usuário autenticado** (`/_protected/*`) — guard centralizado em `_protected.tsx`
3. **Admin** — mesmo guard que usuário; diferenciado pelo `BottomNav` e `index.tsx`

---

## Estrutura de Rotas

```
/ → redirect inteligente por role
/login, /signup → autenticação pública

/public/trip-instances/       → marketplace de viagens
/public/trip-instances/$id/   → detalhe público
/public/organizations/$slug/  → perfil público da organização

/_protected/                  ← layout pathless com guard de auth
  my-bookings/                → inscrições do usuário
  my-bookings/$bookingId/     → detalhe da inscrição
  organizations/              → lista de organizações
  trips/$orgId/               → viagens de uma organização
  trips/$orgId/$tripId/       → detalhe da viagem
  trips/$orgId/$tripId/book/  → formulário de inscrição
  setup/                      → wizard de criação de organização (admin)
```

### Guard Centralizado

`src/routes/_protected.tsx` — pathless layout que verifica autenticação uma vez para todas as rotas aninhadas. Elimina `useEffect` duplicado em cada rota.

---

## Arquitetura de Features

O frontend segue uma arquitetura de **feature modules**, equivalente à camada de aplicação do backend Clean Architecture.

```
src/
├── routes/                  TanStack Router file-based routes (thin controllers)
│   ├── __root.tsx            Providers: AuthProvider → RoleProvider
│   ├── _protected.tsx        Pathless auth guard layout
│   └── ...
│
├── features/                Módulos de domínio (hooks + components por feature)
│   ├── trips/
│   │   ├── hooks/
│   │   │   ├── usePublicTrips.ts    Busca + filtro do marketplace público
│   │   │   ├── useTrips.ts          Lista por orgId ou slug
│   │   │   └── useTripDetail.ts     Detalhe + disponibilidade de inscrição
│   │   └── components/
│   │       ├── TripCard.tsx         Card compacto (lista protegida)
│   │       ├── TripsList.tsx        Lista com links para detalhe
│   │       ├── PublicTripCard.tsx   Card rico do marketplace (buttons ver empresa/viagem)
│   │       └── TripDetailView.tsx   Detalhe completo + botão de inscrição
│   │
│   ├── bookings/
│   │   ├── hooks/
│   │   │   ├── useBookings.ts       Lista inscrições do usuário
│   │   │   ├── useBookingDetail.ts  Detalhe + cancel()
│   │   │   └── useBookingForm.ts    Form state + prefill() + submit()
│   │   └── components/
│   │       ├── BookingCard.tsx
│   │       ├── BookingsList.tsx     Lista com empty state
│   │       └── BookingDetailView.tsx Detalhe + AlertDialog de cancelamento
│   │
│   └── organizations/
│       ├── hooks/
│       │   └── useOrganizations.ts  Lista organizações ativas
│       └── components/
│           ├── OrgCard.tsx
│           └── OrgsList.tsx         Lista com links para trips
│
├── services/                Abstração de chamadas de API (repository pattern)
│   ├── trips.service.ts
│   ├── bookings.service.ts
│   └── organizations.service.ts
│
├── components/
│   ├── ui/                  shadcn/ui — não modificar diretamente
│   ├── layout/
│   │   ├── AppShell.tsx     Layout base (header + BottomNav)
│   │   └── BottomNav.tsx    Tabs por role (passenger / admin)
│   └── feedback/
│       ├── LoadingList.tsx  Skeletons de lista
│       └── ErrorCard.tsx    Card de erro
│
└── lib/
    ├── api.ts               Cliente HTTP com auto-refresh de token
    ├── auth-context.tsx     AuthProvider + useAuth()
    ├── role-context.tsx     RoleProvider + useRole()
    ├── types.ts             Tipos TypeScript do domínio
    ├── format.ts            Helpers de formatação (datas, status, preços)
    └── utils.ts
```

### Padrão de Feature Module

Cada feature tem hooks (casos de uso) e components (apresentação). As rotas são thin controllers:

```tsx
// Rota thin — ~15 linhas
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

**Para adicionar uma nova feature:** criar `features/<nome>/hooks/use<Feature>.ts` + `features/<nome>/components/<Feature>View.tsx`, depois referenciar na rota.

---

## Autenticação e Roles

**Tokens:** localStorage (`tt_access`, `tt_refresh`, `tt_user`)

**Auto-refresh:** `api.ts` intercepta 401 e renova token automaticamente (com deduplicação).

**useAuth()** → `{ user, isAuthenticated, loading, login, signup, logout, refreshUser }`

**useRole()** → `{ isAdmin, isDriver, adminOrgId, roleLoading, refetchRole }`
- `isAdmin`: user tem role ADMIN na organização
- `isDriver`: user está cadastrado como motorista
- `adminOrgId`: ID da organização onde é admin

---

## Navegação por Role

`BottomNav.tsx` mostra tabs diferentes por role:
- **Passenger/Driver:** Explorar · Empresas · Inscrições
- **Admin:** Explorar · Viagens · Configurar

`index.tsx` redireciona:
- Não autenticado → `/public/trip-instances`
- Admin → `/_protected/organizations`
- Usuário → `/public/trip-instances`

---

## Serviços de API

Usar sempre os services — nunca `api()` direto nas rotas ou componentes:

```typescript
// trips.service.ts
tripsService.listPublic()
tripsService.listByOrgId(orgId)
tripsService.listBySlug(slug)          // público, sem auth
tripsService.getPublicById(id)

// bookings.service.ts
bookingsService.listForUser()
bookingsService.getDetails(bookingId)
bookingsService.checkAvailability(tripId)
bookingsService.create({ tripInstanceId, enrollmentType, boardingStop, alightingStop, method })
bookingsService.cancel(bookingId)

// organizations.service.ts
organizationsService.listActive()
organizationsService.listMine()
```

---

## Caminho de Booking (Usuário)

1. Browse `/public/trip-instances`
2. Detalhe `/public/trip-instances/$id`
3. "Ver detalhes" → `/_protected/trips/$orgId/$tripId` (requer auth)
4. "Inscrever-se" → `/_protected/trips/$orgId/$tripId/book`
5. Após confirmação → `/_protected/my-bookings`

---

## Fluxo Admin (Setup)

1. Cadastro → Login
2. `/_protected/setup` → wizard 4 passos:
   - Passo 1: Criar organização (`POST /auth/setup-organization`)
   - Passo 2: Criar template de viagem (`POST /trip-templates/organization/{orgId}`)
   - Passo 3: Criar instância de viagem (`POST /trip-instances/organization/{orgId}`)
   - Passo 4: Associar motorista (`POST /memberships/driver`) — opcional
3. Após setup → `/_protected/organizations`

---

## Convenções Importantes

- **Pathless layouts:** prefixo `_` no arquivo (`_protected.tsx`)
- **Rotas protegidas:** usar path `/_protected/...` no `createFileRoute` e em todos os `Link`/`navigate`
- **URLs no browser:** sem o `_protected` (ex: `/my-bookings`)
- **Após alterar rotas:** TanStack Router regenera `routeTree.gen.ts` automaticamente em dev mode
- **Hooks como use cases:** cada hook de feature encapsula fetch + state + side effects; nunca duplicar lógica entre hooks
- **Componentes de feature:** recebem dados via props, não fazem fetch próprio — separação pura de apresentação

---

## O Que NÃO Fazer

- Não chamar `api()` diretamente em rotas ou componentes — usar services
- Não duplicar lógica de fetch — criar/reutilizar hook de feature
- Não modificar `src/components/ui/` — componentes shadcn, atualizar via CLI
- Não duplicar guard de auth — adicionar apenas em `_protected.tsx`
- Não adicionar React Query ainda — Context API + hooks é suficiente para o MVP
- Não criar OrganizationContext global — `adminOrgId` do `useRole()` é suficiente
