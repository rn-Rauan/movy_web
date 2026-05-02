# Movy Web — Documentação do Projeto

## Visão Geral

SaaS de transporte — sistema de gerenciamento e reserva de viagens.

**Stack:** React 19 · TanStack Router (file-based routing) · TanStack React Start · Tailwind CSS · shadcn/ui · Zod · React Hook Form

**API Backend:** `VITE_API_URL` (DDD + Clean Architecture)

---

## Papéis do Sistema

| Role   | Capacidades |
|--------|-------------|
| User   | Ver viagens públicas, reservar viagens, gerenciar inscrições |
| Driver | Extensão de User — confirmar presença, marcar pagamentos |
| Admin  | Criar e gerenciar organização, templates, viagens, motoristas |

Roles são detectados em runtime via `RoleContext` após autenticação.

---

## Contextos de Acesso

1. **Público** (`/public/*`) — sem autenticação
2. **Usuário autenticado** (`/_protected/*`) — guard centralizado em `_protected.tsx`
3. **Admin** — mesmo guarda que usuário; diferenciado pelo `BottomNav` e `index.tsx`

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

`src/routes/_protected.tsx` — pathless layout que verifica autenticação UMA vez para todas as rotas aninhadas. Elimina o padrão de `useEffect` duplicado em cada rota.

---

## Estrutura de Pastas

```
src/
├── routes/              TanStack Router file-based routes
│   ├── __root.tsx       Providers: AuthProvider → RoleProvider
│   ├── _protected.tsx   Pathless auth guard layout
│   └── ...
├── components/
│   ├── ui/              shadcn/ui (não modificar diretamente)
│   ├── layout/
│   │   ├── AppShell.tsx Layout base com header e bottom nav
│   │   └── BottomNav.tsx Tabs por role (passenger / admin)
│   └── domain/          Componentes de domínio reutilizáveis
│       ├── TripCard.tsx
│       └── BookingCard.tsx
├── services/            Abstração de chamadas de API por domínio
│   ├── trips.service.ts
│   └── bookings.service.ts
└── lib/
    ├── api.ts           Cliente HTTP com auto-refresh de token
    ├── auth-context.tsx AuthProvider + useAuth()
    ├── role-context.tsx RoleProvider + useRole()
    ├── types.ts         Tipos TypeScript do domínio
    └── format.ts        Helpers de formatação (datas, status, preços)
```

---

## Autenticação e Roles

**Tokens:** localStorage (`tt_access`, `tt_refresh`, `tt_user`)

**Auto-refresh:** `api.ts` intercepta 401 e renova token automaticamente (com deduplicação de requisições concorrentes).

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

Usar os services em vez de `api()` diretamente nas rotas:

```typescript
import { tripsService } from "@/services/trips.service";
import { bookingsService } from "@/services/bookings.service";

// Exemplos
tripsService.listPublic()
tripsService.listByOrgId(orgId)
tripsService.listBySlug(slug)
tripsService.getPublicById(id)

bookingsService.listForUser()
bookingsService.getDetails(bookingId)
bookingsService.checkAvailability(tripId)
bookingsService.create({ tripInstanceId, enrollmentType, boardingStop, alightingStop, method })
bookingsService.cancel(bookingId)
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

- **Pathless layouts:** prefixo `_` no arquivo (ex: `_protected.tsx`)
- **Rotas protegidas:** usar path `/_protected/...` no `createFileRoute` e em todos os `Link`/`navigate`
- **URLs no browser:** mesmo sem o prefixo `_protected` (ex: `/my-bookings`)
- **Após alterar arquivos de rota:** o TanStack Router regenera `routeTree.gen.ts` automaticamente em dev mode

---

## O Que NÃO Fazer (MVP)

- Não adicionar React Query — Context API é suficiente para o TCC
- Não criar OrganizationContext global — `adminOrgId` do `useRole()` é suficiente
- Não criar `/admin/dashboard` ainda — usar `/_protected/organizations` e `/_protected/trips/$orgId`
- Não modificar `src/components/ui/` — componentes shadcn, atualizar via CLI
- Não duplicar lógica de auth guard — adicionar ao `_protected` pathless layout
