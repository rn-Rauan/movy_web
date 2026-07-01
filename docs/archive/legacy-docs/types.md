# Tipos TypeScript — movy_web

Todos os tipos de domínio estão definidos em `src/lib/types.ts`.

---

## `AuthUser`

```ts
type AuthUser = {
  id: string;
  name: string;
  email: string;
};
```

---

## `Organization`

```ts
type Organization = {
  id: string;
  name: string;
  slug: string;
  cnpj?: string;
  email?: string;
  telephone?: string;
  address?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

---

## `TripStatus`

```ts
type TripStatus =
  | "DRAFT" // rascunho
  | "SCHEDULED" // agendada — inscrições abertas
  | "CONFIRMED" // confirmada — inscrições abertas
  | "IN_PROGRESS" // em andamento
  | "FINISHED" // concluída
  | "CANCELED"; // cancelada
```

> Apenas `SCHEDULED` e `CONFIRMED` permitem novas inscrições — verificado por `canEnroll()`.

---

## `TripInstance`

```ts
type TripInstance = {
  id: string;
  organizationId: string;
  tripTemplateId?: string;
  driverId?: string | null;
  vehicleId?: string | null;
  tripStatus: TripStatus;
  minRevenue?: number;
  autoCancelAt?: string;
  forceConfirm?: boolean;
  totalCapacity: number;
  bookedCount?: number;
  availableSeats?: number;
  departureTime: string; // ISO date
  arrivalEstimate?: string; // ISO date
  /** Campos do endpoint público (PublicTripInstanceResponse) */
  departurePoint?: string;
  destination?: string;
  priceOneWay?: number;
  priceReturn?: number;
  priceRoundTrip?: number;
  isRecurring?: boolean;
  /** Helpers retornados por alguns endpoints */
  organizationName?: string;
  organizationSlug?: string;
  stops?: string[];
  createdAt?: string;
  updatedAt?: string;
};
```

---

## `EnrollmentType`

```ts
type EnrollmentType = "ONE_WAY" | "RETURN" | "ROUND_TRIP";
```

---

## `PaymentMethod`

```ts
type PaymentMethod = "MONEY" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD";
```

---

## `BookingStatus`

```ts
type BookingStatus = "ACTIVE" | "INACTIVE";
```

---

## `Booking`

```ts
type Booking = {
  id: string;
  organizationId: string;
  userId: string;
  tripInstanceId: string;
  enrollmentDate: string; // ISO date
  status: BookingStatus;
  presenceConfirmed: boolean;
  enrollmentType: EnrollmentType;
  recordedPrice?: number;
  boardingStop: string;
  alightingStop: string;
  createdAt?: string;
  updatedAt?: string;
  tripInstance?: TripInstance; // populado no detalhe
};
```

---

## `BookingDetails`

Retornado por `GET /bookings/:id/details`:

```ts
type BookingDetails = Booking & {
  tripDepartureTime?: string;
  tripArrivalEstimate?: string;
  tripStatus?: TripStatus;
  totalCapacity?: number;
  availableSlots?: number;
};
```

---

## `BookingAvailability`

Retornado por `GET /bookings/availability/:tripInstanceId`:

```ts
type BookingAvailability = {
  tripInstanceId: string;
  tripStatus: TripStatus;
  totalCapacity: number;
  activeCount: number;
  availableSlots: number;
  isBookable: boolean;
};
```

---

## `TripTemplate`

```ts
type TripTemplate = {
  id: string;
  organizationId: string;
  departurePoint: string;
  destination: string;
  stops: string[];
  shift: "MORNING" | "AFTERNOON" | "EVENING";
  priceOneWay?: number;
  priceReturn?: number;
  priceRoundTrip?: number;
  isPublic: boolean;
  isRecurring?: boolean;
  autoCancelEnabled?: boolean;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};
```

---

## `Paginated<T>`

```ts
type Paginated<T> = {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};
```

> **Nota de compatibilidade:** A API pode retornar arrays diretamente. Os services e hooks sempre normalizam: `Array.isArray(res) ? res : (res.data ?? [])`.

---

## Utilitários de Formatação (`src/lib/format.ts`)

### `formatDateTime(iso, timeOnly?)`

- `timeOnly = false` (padrão): `"DD/MM HH:mm"`
- `timeOnly = true`: `"HH:mm"`

### `formatFullDate(iso)`

Dia da semana por extenso: `"sexta-feira, 02 de maio de 2025"`

### `statusLabel(status)`

| Status        | Label      |
| ------------- | ---------- |
| `DRAFT`       | Rascunho   |
| `SCHEDULED`   | Agendada   |
| `CONFIRMED`   | Confirmada |
| `IN_PROGRESS` | Em curso   |
| `FINISHED`    | Concluída  |
| `CANCELED`    | Cancelada  |

### `statusVariant(status)`

Retorna a variante de `Badge`:
| Status | Variante |
|---|---|
| `CONFIRMED`, `IN_PROGRESS` | `default` |
| `SCHEDULED` | `secondary` |
| `CANCELED` | `destructive` |
| demais | `outline` |

### `canEnroll(status)`

`true` se `SCHEDULED` ou `CONFIRMED`.

### `bookingStatusLabel(status)`

| Status     | Label     |
| ---------- | --------- |
| `ACTIVE`   | Ativa     |
| `INACTIVE` | Cancelada |

### `enrollmentTypeLabel(type)`

| Tipo         | Label         |
| ------------ | ------------- |
| `ONE_WAY`    | Somente ida   |
| `RETURN`     | Somente volta |
| `ROUND_TRIP` | Ida e volta   |

### `paymentMethodLabel(method)`

| Método        | Label             |
| ------------- | ----------------- |
| `MONEY`       | Dinheiro          |
| `PIX`         | PIX               |
| `CREDIT_CARD` | Cartão de crédito |
| `DEBIT_CARD`  | Cartão de débito  |

---

## Utilitários Gerais (`src/lib/utils.ts`)

### `cn(...inputs)`

Combina classes Tailwind usando `clsx` + `tailwind-merge`:

```ts
import { cn } from "@/lib/utils";
cn("px-4 py-2", isActive && "bg-primary", "px-6");
// → "py-2 bg-primary px-6"
```
