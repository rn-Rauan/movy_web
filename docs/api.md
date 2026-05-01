# API Client — movy_web

## Visão Geral

O projeto consome uma API REST externa. A URL base é configurada via variável de ambiente `VITE_API_URL`.

Todo acesso à API passa pela função `api()` definida em `src/lib/api.ts`.

---

## Função `api()`

```ts
api<T>(path: string, init?: RequestInit & { auth?: boolean }): Promise<T>
```

### Comportamento

- Concatena `API_BASE_URL + path` e executa `fetch`
- Adiciona `Content-Type: application/json` automaticamente
- Se `auth !== false` (padrão: `true`): injeta o header `Authorization: Bearer <token>`
- Em resposta não-ok: lança `ApiError` com `message`, `status` e `data`
- Trata resposta vazia (sem body) retornando `null`

### `ApiError`

```ts
class ApiError extends Error {
  status: number;  // HTTP status code
  data: any;       // corpo da resposta (parseado como JSON quando possível)
}
```

---

## Armazenamento de Tokens (`tokenStorage`)

Os tokens JWT são armazenados no `localStorage` com as seguintes chaves:

| Chave | Conteúdo |
|---|---|
| `tt_access` | Access token (JWT) |
| `tt_refresh` | Refresh token |
| `tt_user` | Objeto `AuthUser` serializado em JSON |

> **Nota:** O refresh token é armazenado mas não existe lógica de renovação automática implementada. Se o access token expirar, o usuário precisará fazer login novamente.

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

### Organizações

#### `GET /organizations/active` 🔒
Lista todas as organizações ativas.

**Response:** `Organization[]` ou `{ data: Organization[] }`

---

### Viagens (Públicas — sem auth)

#### `GET /public/trip-instances`
Lista todas as instâncias de viagem públicas.

**Response:** `TripInstance[]` ou `Paginated<TripInstance>` (com campo `organizationName` e `organizationSlug` adicionais)

---

#### `GET /public/trip-instances/:id`
Retorna detalhes de uma viagem específica.

**Response:** `TripInstance`

---

#### `GET /public/trip-instances/org/:slug`
Lista viagens de uma organização pelo seu slug público.

**Response:** `TripInstance[]` ou `Paginated<TripInstance>` (com campo `organizationName` adicional)

---

### Viagens (Privadas)

#### `GET /trip-instances/organization/:orgId` 🔒
Lista viagens de uma organização pelo ID (requer auth).

**Response:** `TripInstance[]` ou `{ data: TripInstance[] }`

---

### Inscrições (Bookings)

#### `GET /bookings/user` 🔒
Lista todas as inscrições do usuário autenticado.

**Response:** `Booking[]` ou `{ data: Booking[] }`

---

#### `GET /bookings/:bookingId` 🔒
Retorna detalhes de uma inscrição específica.

**Response:** `Booking`

---

#### `GET /bookings/availability/:tripId` 🔒
Retorna disponibilidade de vagas de uma viagem.

**Response:**
```json
{
  "totalCapacity": 40,
  "bookedCount": 12,
  "availableSeats": 28
}
```

---

#### `POST /bookings` 🔒
Cria uma nova inscrição em uma viagem.

**Request body:**
```json
{
  "tripInstanceId": "string",
  "enrollmentType": "ONE_WAY" | "ROUND_TRIP",
  "boardingStop": "string",
  "alightingStop": "string",
  "method": "PIX" | "CREDIT_CARD" | "CASH" | "SUBSCRIPTION"
}
```

**Response:** `Booking`

---

#### `PATCH /bookings/:bookingId/cancel` 🔒
Cancela uma inscrição ativa.

**Response:** `Booking` (com status atualizado para `CANCELLED`)

---

## Resumo dos Endpoints

| Método | Endpoint | Auth | Usado em |
|---|---|---|---|
| POST | `/auth/login` | ❌ | `/login` |
| POST | `/auth/register` | ❌ | `/signup` |
| GET | `/public/trip-instances` | ❌ | `/public/trip-instances/` |
| GET | `/public/trip-instances/:id` | ❌ | `/public/trip-instances/:id`, `/trips/:orgId/:tripId`, `/trips/:orgId/:tripId/book` |
| GET | `/public/trip-instances/org/:slug` | ❌ | `/public/organizations/:slug`, `/trips/:orgId` |
| GET | `/organizations/active` | ✅ | `/organizations` |
| GET | `/trip-instances/organization/:orgId` | ✅ | `/trips/:orgId` |
| GET | `/bookings/user` | ✅ | `/my-bookings` |
| GET | `/bookings/:bookingId` | ✅ | `/my-bookings/:bookingId` |
| GET | `/bookings/availability/:tripId` | ✅ | `/trips/:orgId/:tripId` |
| POST | `/bookings` | ✅ | `/trips/:orgId/:tripId/book` |
| PATCH | `/bookings/:bookingId/cancel` | ✅ | `/my-bookings/:bookingId` |

🔒 = Requer header `Authorization: Bearer <token>`
