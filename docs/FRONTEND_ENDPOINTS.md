# Endpoints do Frontend — Mapeamento por Rota

Base URL (dev): `http://localhost:5701`

**Legenda de acesso:**
- 🌐 Público — sem autenticação
- 🔒 JWT — qualquer usuário logado
- 🛡️ ADMIN — role ADMIN na organização
- 🤖 Auto — chamado internamente pelo `api()`, não por uma rota

---

## Camada de autenticação (`src/lib/auth-context.tsx`)

Estas chamadas são feitas pelo contexto de auth, não por rotas diretamente.

| Ação no frontend | Método | Endpoint | Acesso |
|---|---|---|---|
| `login()` | POST | `/auth/login` | 🌐 |
| `signup()` | POST | `/auth/register` | 🌐 |
| `logout()` | POST | `/auth/logout` | 🌐 |
| Renovação de token (automática no 401) | POST | `/auth/refresh` | 🤖 |

---

## `/organizations` — Lista de empresas

**Arquivo:** `src/routes/organizations.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Carregar lista de organizações ativas | GET | `/organizations/active` | 🔒 JWT |

---

## `/setup` — Wizard de configuração inicial

**Arquivo:** `src/routes/setup.tsx`

| Passo | Ação | Método | Endpoint | Acesso |
|---|---|---|---|---|
| 1 | Criar organização | POST | `/auth/setup-organization` | 🔒 JWT |
| 1 (pós-criação) | Buscar orgId da org criada | GET | `/organizations/me` | 🔒 JWT |
| 2 | Criar roteiro de viagem | POST | `/trip-templates/organization/{orgId}` | 🛡️ ADMIN |
| 3 | Criar instância de viagem | POST | `/trip-instances/organization/{orgId}` | 🛡️ ADMIN |
| 4 | Associar motorista via email + CNH | POST | `/memberships/driver` | 🛡️ ADMIN |

---

## `/trips/:orgId` — Lista de viagens de uma empresa

**Arquivo:** `src/routes/trips.$orgId.tsx`

Usa uma de duas rotas dependendo se o parâmetro `slug` está presente na URL:

| Condição | Método | Endpoint | Acesso |
|---|---|---|---|
| Com `?slug=...` (link de empresa) | GET | `/public/trip-instances/org/{slug}` | 🌐 |
| Sem slug (navegação interna) | GET | `/trip-instances/organization/{orgId}` | 🔒 JWT |

---

## `/trips/:orgId/:tripId` — Detalhe de viagem

**Arquivo:** `src/routes/trips.$orgId.$tripId.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Carregar dados da viagem | GET | `/public/trip-instances/{tripId}` | 🌐 |
| Verificar disponibilidade de vagas | GET | `/bookings/availability/{tripId}` | 🔒 JWT |

---

## `/trips/:orgId/:tripId/book` — Formulário de inscrição

**Arquivo:** `src/routes/trips.$orgId.$tripId.book.tsx`

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
  "method": "PIX | CREDIT_CARD | DEBIT_CARD | MONEY"
}
```

---

## `/my-bookings` — Minhas inscrições

**Arquivo:** `src/routes/my-bookings.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Listar inscrições do usuário | GET | `/bookings/user` | 🔒 JWT |

---

## `/my-bookings/:bookingId` — Detalhe de inscrição

**Arquivo:** `src/routes/my-bookings.$bookingId.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Carregar detalhes da inscrição | GET | `/bookings/{bookingId}/details` | 🔒 JWT |
| Cancelar inscrição | PATCH | `/bookings/{bookingId}/cancel` | 🔒 JWT |

---

## `/public/trip-instances` — Viagens públicas (listagem)

**Arquivo:** `src/routes/public.trip-instances.index.tsx`

| Ação | Método | Endpoint | Acesso |
|---|---|---|---|
| Listar todas as viagens públicas | GET | `/public/trip-instances` | 🌐 |

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
| Listar viagens da empresa pelo slug | GET | `/public/trip-instances/org/{slug}` | 🌐 |

---

## Resumo geral

| # | Método | Endpoint | Usado em |
|---|---|---|---|
| 1 | POST | `/auth/login` | auth-context |
| 2 | POST | `/auth/register` | auth-context |
| 3 | POST | `/auth/logout` | auth-context |
| 4 | POST | `/auth/refresh` | api.ts (automático) |
| 5 | POST | `/auth/setup-organization` | `/setup` passo 1 |
| 6 | GET | `/organizations/me` | `/setup` passo 1 |
| 7 | GET | `/organizations/active` | `/organizations` |
| 8 | POST | `/trip-templates/organization/{orgId}` | `/setup` passo 2 |
| 9 | POST | `/trip-instances/organization/{orgId}` | `/setup` passo 3 |
| 10 | POST | `/memberships/driver` | `/setup` passo 4 |
| 11 | GET | `/public/trip-instances/org/{slug}` | `/trips/:orgId`, `/public/organizations/:slug` |
| 12 | GET | `/trip-instances/organization/{orgId}` | `/trips/:orgId` |
| 13 | GET | `/public/trip-instances/{id}` | `/trips/:orgId/:tripId`, `/trips/:orgId/:tripId/book`, `/public/trip-instances/:id` |
| 14 | GET | `/bookings/availability/{tripId}` | `/trips/:orgId/:tripId` |
| 15 | POST | `/bookings` | `/trips/:orgId/:tripId/book` |
| 16 | GET | `/bookings/user` | `/my-bookings` |
| 17 | GET | `/bookings/{id}/details` | `/my-bookings/:bookingId` |
| 18 | PATCH | `/bookings/{id}/cancel` | `/my-bookings/:bookingId` |
| 19 | GET | `/public/trip-instances` | `/public/trip-instances` |
