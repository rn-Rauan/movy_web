# API Client — movy_web

## Visão Geral

O projeto consome uma API REST externa. A URL base é configurada via variável de ambiente `VITE_API_URL`.

Todo acesso à API passa pela função `api()` definida em `src/lib/api.ts`. **Nunca chamar `api()` diretamente em rotas ou componentes** — usar os services em `src/services/`.

---

## Função `api()`

```ts
api<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T>
```

### Comportamento

- Concatena `API_BASE_URL + path` e executa `fetch`
- Adiciona `Content-Type: application/json` automaticamente
- Se `auth !== false` (padrão: `true`): injeta o header `Authorization: Bearer <token>`
- Em resposta `401`: tenta renovar o token via `POST /auth/refresh` automaticamente e re-executa a requisição (com deduplicação de chamadas concorrentes)
- Em resposta não-ok após eventual refresh: lança `ApiError` com `message`, `status` e `data`
- Trata resposta vazia (sem body) retornando `null`

### `ApiError`

```ts
class ApiError extends Error {
  status: number;   // HTTP status code
  data: unknown;    // corpo da resposta (parseado como JSON quando possível)
}
```

---

## Services (Repository Pattern)

Cada domínio tem um service que encapsula as chamadas de API:

```ts
// src/services/trips.service.ts
tripsService.listPublic()                 // GET /public/trip-instances
tripsService.listByOrgId(orgId)           // GET /trip-instances/organization/:orgId
tripsService.listBySlug(slug)             // GET /public/trip-instances/org/:slug (sem auth)
tripsService.getPublicById(id)            // GET /public/trip-instances/:id (sem auth)

// src/services/bookings.service.ts
bookingsService.listForUser()             // GET /bookings/user
bookingsService.getDetails(bookingId)     // GET /bookings/:id/details
bookingsService.checkAvailability(tripId) // GET /bookings/availability/:tripId
bookingsService.create({ tripInstanceId, enrollmentType, boardingStop, alightingStop, method })
bookingsService.cancel(bookingId)         // PATCH /bookings/:id/cancel

// src/services/organizations.service.ts
organizationsService.listActive()         // GET /organizations/active
organizationsService.listMine()           // GET /organizations/me
```

---

## Armazenamento de Tokens (`tokenStorage`)

Os tokens JWT são armazenados no `localStorage` com as seguintes chaves:

| Chave | Conteúdo |
|---|---|
| `tt_access` | Access token (JWT) |
| `tt_refresh` | Refresh token |
| `tt_user` | Objeto `AuthUser` serializado em JSON |

```ts
tokenStorage.access    // lê tt_access
tokenStorage.refresh   // lê tt_refresh
tokenStorage.user      // lê tt_user (parseado como JSON)
tokenStorage.set({ accessToken, refreshToken, user })  // salva os 3
tokenStorage.clear()   // remove os 3
```

> Safe server-side: todas as operações verificam `typeof window !== "undefined"` antes de acessar o `localStorage`.

---

## Endpoints Consumidos

### Autenticação

#### `POST /auth/login`
Autentica um usuário existente.

**Request body:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response:**
```json
{
  "accessToken": "string",
  "refreshToken": "string",
  "user": { "id": "string", "name": "string", "email": "string" }
}
```

---

#### `POST /auth/register`
Cadastra um novo usuário.

**Request body:**
```json
{
  "name": "string",
  "email": "string",
  "password": "string",
  "telephone": "string"
}
```

**Response:** Mesmo formato de `/auth/login`.

---

#### `POST /auth/refresh`
Renovação automática de token. Chamado internamente pelo `api.ts` em respostas `401`.

**Request body:** `{ "refreshToken": "string" }`
**Response:** Mesmo formato de `/auth/login`.

---

#### `POST /auth/logout`
Revoga o refresh token server-side. Chamado pelo `logout()` do `AuthProvider`. Idempotente.

**Request body:** `{ "refreshToken": "string" }`

---

### Organizações

#### `GET /organizations/active` 🔒
Lista todas as organizações ativas.

**Response:** `Organization[]` ou `Paginated<Organization>`

---

#### `GET /organizations/me` 🔒
Lista organizações às quais o usuário pertence.

**Response:** `Paginated<Organization>`

---

### Viagens (Públicas — sem auth)

#### `GET /public/trip-instances`
Lista todas as instâncias de viagem públicas.

**Response:** `Paginated<TripInstance>` (com campos `organizationName` e `organizationSlug`)

---

#### `GET /public/trip-instances/:id`
Retorna detalhes de uma viagem específica.

**Response:** `TripInstance`

---

#### `GET /public/trip-instances/org/:slug`
Lista viagens de uma organização pelo seu slug público.

**Response:** `TripInstance[]` ou `Paginated<TripInstance>`

---

### Viagens (Privadas)

#### `GET /trip-instances/organization/:orgId` 🔒
Lista viagens de uma organização pelo ID.

**Response:** `TripInstance[]` ou `Paginated<TripInstance>`

---

### Inscrições (Bookings)

#### `GET /bookings/user` 🔒
Lista todas as inscrições do usuário autenticado.

**Response:** `Booking[]` ou `{ data: Booking[] }`

---

#### `GET /bookings/:bookingId/details` 🔒
Retorna detalhes completos de uma inscrição específica.

**Response:** `BookingDetails`

---

#### `GET /bookings/availability/:tripId` 🔒
Retorna disponibilidade de vagas de uma viagem.

**Response:**
```json
{
  "tripInstanceId": "string",
  "tripStatus": "SCHEDULED",
  "totalCapacity": 40,
  "activeCount": 12,
  "availableSlots": 28,
  "isBookable": true
}
```

---

#### `POST /bookings` 🔒
Cria uma nova inscrição em uma viagem.

**Request body:**
```json
{
  "tripInstanceId": "string",
  "enrollmentType": "ONE_WAY | RETURN | ROUND_TRIP",
  "boardingStop": "string",
  "alightingStop": "string",
  "method": "MONEY | PIX | CREDIT_CARD | DEBIT_CARD"
}
```

**Response:** `Booking`

---

#### `PATCH /bookings/:bookingId/cancel` 🔒
Cancela uma inscrição ativa.

**Response:** `Booking` atualizado

---

## Resumo dos Endpoints

| Método | Endpoint | Auth | Usado em |
|---|---|---|---|
| POST | `/auth/login` | ❌ | `auth-context` |
| POST | `/auth/register` | ❌ | `auth-context` |
| POST | `/auth/logout` | ❌ | `auth-context` |
| POST | `/auth/refresh` | ❌ | `api.ts` (automático) |
| GET | `/public/trip-instances` | ❌ | `tripsService.listPublic()` |
| GET | `/public/trip-instances/:id` | ❌ | `tripsService.getPublicById()` |
| GET | `/public/trip-instances/org/:slug` | ❌ | `tripsService.listBySlug()` |
| GET | `/organizations/active` | ✅ | `organizationsService.listActive()` |
| GET | `/organizations/me` | ✅ | `organizationsService.listMine()` |
| GET | `/trip-instances/organization/:orgId` | ✅ | `tripsService.listByOrgId()` |
| GET | `/bookings/user` | ✅ | `bookingsService.listForUser()` |
| GET | `/bookings/:id/details` | ✅ | `bookingsService.getDetails()` |
| GET | `/bookings/availability/:tripId` | ✅ | `bookingsService.checkAvailability()` |
| POST | `/bookings` | ✅ | `bookingsService.create()` |
| PATCH | `/bookings/:id/cancel` | ✅ | `bookingsService.cancel()` |
| GET | `/bookings/:bookingId` | ✅ | `/my-bookings/:bookingId` |
| GET | `/bookings/availability/:tripId` | ✅ | `/trips/:orgId/:tripId` |
| POST | `/bookings` | ✅ | `/trips/:orgId/:tripId/book` |
| PATCH | `/bookings/:bookingId/cancel` | ✅ | `/my-bookings/:bookingId` |

🔒 = Requer header `Authorization: Bearer <token>`
