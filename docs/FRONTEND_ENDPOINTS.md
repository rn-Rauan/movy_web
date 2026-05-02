# Endpoints do Frontend — Mapeamento por Rota

Base URL (dev): `http://localhost:5701`

**Legenda de acesso:**
- 🌐 Público — sem autenticação
- 🔒 JWT — qualquer usuário logado
- 🛡️ ADMIN — role ADMIN na organização
- 🤖 Auto — chamado internamente pelo `api()`, não por uma rota

---

## Camada de autenticação (`src/lib/auth-context.tsx`)

| Ação no frontend | Método | Endpoint | Acesso |
|---|---|---|---|
| `login()` | POST | `/auth/login` | 🌐 |
| `signup()` | POST | `/auth/register` | 🌐 |
| `logout()` | POST | `/auth/logout` | 🌐 |
| Renovação de token (automática no 401) | POST | `/auth/refresh` | 🤖 |

---

## Detecção de Roles (`src/lib/role-context.tsx`)

Chamados automaticamente após login:

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Verificar se é motorista | GET | `/drivers/me` | 🔒 JWT |
| Listar orgs do usuário | GET | `/organizations/me` | 🔒 JWT |
| Verificar role na org | GET | `/memberships/me/role/:orgId` | 🔒 JWT |

---

## `/organizations` — Lista de empresas

**Arquivo:** `src/routes/_protected.organizations.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Carregar organizações ativas | GET | `/organizations/active` | 🔒 JWT |

---

## `/setup` — Wizard de configuração inicial

**Arquivo:** `src/routes/_protected.setup.tsx`

| Passo | Ação | Método | Endpoint | Acesso |
|---|---|---|---|---|
| 1 | Criar organização | POST | `/auth/setup-organization` | 🔒 JWT |
| 1 (pós-criação) | Buscar orgId da org criada | GET | `/organizations/me` | 🔒 JWT |
| 2 | Criar template de viagem | POST | `/trip-templates/organization/{orgId}` | 🛡️ ADMIN |
| 3 | Criar instância de viagem | POST | `/trip-instances/organization/{orgId}` | 🛡️ ADMIN |
| 4 | Associar motorista via email + CNH | POST | `/memberships/driver` | 🛡️ ADMIN |

---

## `/trips/:orgId` — Lista de viagens de uma empresa

**Arquivo:** `src/routes/_protected.trips.$orgId.tsx`

| Condição | Método | Endpoint | Acesso |
|---|---|---|---|
| Com `?slug=...` | GET | `/public/trip-instances/org/{slug}` | 🌐 |
| Sem slug | GET | `/trip-instances/organization/{orgId}` | 🔒 JWT |

---

## `/trips/:orgId/:tripId` — Detalhe de viagem

**Arquivo:** `src/routes/_protected.trips.$orgId.$tripId.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Carregar dados da viagem | GET | `/public/trip-instances/{tripId}` | 🌐 |
| Verificar disponibilidade | GET | `/bookings/availability/{tripId}` | 🔒 JWT |

---

## `/trips/:orgId/:tripId/book` — Formulário de inscrição

**Arquivo:** `src/routes/_protected.trips.$orgId.$tripId.book.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Carregar dados da viagem | GET | `/public/trip-instances/{tripId}` | 🌐 |
| Confirmar inscrição | POST | `/bookings` | 🔒 JWT |

**Body do POST `/bookings`:**
```json
{
  "tripInstanceId": "uuid",
  "enrollmentType": "ONE_WAY | RETURN | ROUND_TRIP",
  "boardingStop": "string",
  "alightingStop": "string",
  "method": "MONEY | PIX | CREDIT_CARD | DEBIT_CARD"
}
```

---

## `/my-bookings` — Minhas inscrições

**Arquivo:** `src/routes/_protected.my-bookings.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Listar inscrições do usuário | GET | `/bookings/user` | 🔒 JWT |

---

## `/my-bookings/:bookingId` — Detalhe de inscrição

**Arquivo:** `src/routes/_protected.my-bookings.$bookingId.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Carregar detalhes da inscrição | GET | `/bookings/{bookingId}/details` | 🔒 JWT |
| Cancelar inscrição | PATCH | `/bookings/{bookingId}/cancel` | 🔒 JWT |

---

## `/public/trip-instances` — Viagens públicas (listagem)

**Arquivo:** `src/routes/public.trip-instances.index.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Listar viagens públicas | GET | `/public/trip-instances` | 🌐 |

---

## `/public/trip-instances/:id` — Viagem pública (detalhe)

**Arquivo:** `src/routes/public.trip-instances.$id.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Carregar viagem pública | GET | `/public/trip-instances/{id}` | 🌐 |

---

## `/public/organizations/:slug` — Página pública de empresa

**Arquivo:** `src/routes/public.organizations.$slug.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Listar viagens da empresa | GET | `/public/trip-instances/org/{slug}` | 🌐 |

---

## Resumo geral

| # | Método | Endpoint | Usado em |
|---|---|---|---|
| 1 | POST | `/auth/login` | auth-context |
| 2 | POST | `/auth/register` | auth-context |
| 3 | POST | `/auth/logout` | auth-context |
| 4 | POST | `/auth/refresh` | api.ts (automático) |
| 5 | GET | `/drivers/me` | role-context |
| 6 | GET | `/organizations/me` | role-context, `/setup` passo 1 |
| 7 | GET | `/memberships/me/role/:orgId` | role-context |
| 8 | GET | `/organizations/active` | `/organizations` |
| 9 | POST | `/auth/setup-organization` | `/setup` passo 1 |
| 10 | POST | `/trip-templates/organization/{orgId}` | `/setup` passo 2 |
| 11 | POST | `/trip-instances/organization/{orgId}` | `/setup` passo 3 |
| 12 | POST | `/memberships/driver` | `/setup` passo 4 |
| 13 | GET | `/public/trip-instances` | `/public/trip-instances/` |
| 14 | GET | `/public/trip-instances/{id}` | `/public/trip-instances/:id`, `/trips/:orgId/:tripId`, `/trips/:orgId/:tripId/book` |
| 15 | GET | `/public/trip-instances/org/{slug}` | `/trips/:orgId`, `/public/organizations/:slug` |
| 16 | GET | `/trip-instances/organization/{orgId}` | `/trips/:orgId` |
| 17 | GET | `/bookings/availability/{tripId}` | `/trips/:orgId/:tripId` |
| 18 | POST | `/bookings` | `/trips/:orgId/:tripId/book` |
| 19 | GET | `/bookings/user` | `/my-bookings` |
| 20 | GET | `/bookings/{id}/details` | `/my-bookings/:bookingId` |
| 21 | PATCH | `/bookings/{id}/cancel` | `/my-bookings/:bookingId` |
