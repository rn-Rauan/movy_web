# Tipos TypeScript — movy_web

Todos os tipos de domínio estão definidos em `src/lib/types.ts`.

---

## `AuthUser`

Representa o usuário autenticado, retornado pela API de login/cadastro e armazenado no `localStorage`.

```ts
type AuthUser = {
  id: string;
  name: string;
  email: string;
};
```

---

## `Organization`

Representa uma empresa de transporte.

```ts
type Organization = {
  id: string;
  name: string;
  slug?: string;          // identificador público na URL (ex: "empresa-abc")
  description?: string;  // descrição opcional exibida na listagem
  isActive?: boolean;     // apenas organizações ativas são exibidas
};
```

---

## `TripStatus`

Union type com todos os possíveis estados de uma viagem:

```ts
type TripStatus =
  | "DRAFT"        // rascunho — não visível publicamente
  | "SCHEDULED"    // agendada — inscrições abertas
  | "CONFIRMED"    // confirmada — inscrições abertas
  | "IN_PROGRESS"  // em andamento
  | "COMPLETED"    // concluída
  | "CANCELLED";   // cancelada
```

> Apenas `SCHEDULED` e `CONFIRMED` permitem novas inscrições (verificado por `canEnroll()`).

---

## `TripInstance`

Representa uma instância concreta de uma viagem (uma saída específica com data/hora).

```ts
type TripInstance = {
  id: string;
  organizationId: string;
  tripTemplateId: string;
  driverId?: string | null;
  vehicleId?: string | null;
  tripStatus: TripStatus;
  minRevenue?: number;           // receita mínima para confirmação
  autoCancelAt?: string;         // ISO date — data limite para cancelamento automático
  forceConfirm?: boolean;
  totalCapacity: number;         // capacidade total do veículo
  bookedCount?: number;          // inscrições confirmadas
  availableSeats?: number;       // vagas disponíveis (calculado pelo backend)
  departureTime: string;         // ISO date
  arrivalEstimate?: string;      // ISO date — chegada estimada
  origin?: string;               // nome/descrição da origem
  destination?: string;          // nome/descrição do destino
  price?: number;                // preço por passageiro
  createdAt?: string;
  updatedAt?: string;
};
```

**Campos derivados no cliente:**
- Vagas disponíveis: `availableSeats ?? (totalCapacity - bookedCount)`

**Campos adicionais retornados pela API pública** (não no tipo base, mas usados nas páginas):
- `organizationName?: string` — nome da empresa
- `organizationSlug?: string` — slug da empresa

---

## `BookingStatus`

```ts
type BookingStatus = "ACTIVE" | "CANCELLED" | "COMPLETED" | "NO_SHOW";
```

---

## `Booking`

Representa uma inscrição de um usuário em uma viagem.

```ts
type Booking = {
  id: string;
  organizationId: string;
  userId: string;
  tripInstanceId: string;
  enrollmentDate: string;                      // ISO date
  status: BookingStatus;
  presenceConfirmed: boolean;
  enrollmentType: "ONE_WAY" | "ROUND_TRIP";   // tipo de viagem
  recordedPrice?: number;                      // preço registrado no momento da inscrição
  boardingStop: string;                        // parada de embarque
  alightingStop: string;                       // parada de desembarque
  createdAt?: string;
  updatedAt?: string;
  tripInstance?: TripInstance;                 // pode vir populado no detalhe
};
```

---

## `Paginated<T>`

Tipo genérico para respostas paginadas da API:

```ts
type Paginated<T> = {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
};
```

> **Nota de compatibilidade:** A API às vezes retorna arrays diretamente em vez de `Paginated<T>`. O código nas páginas sempre verifica: `Array.isArray(res) ? res : res.data ?? []`.

---

## Utilitários de Formatação (`src/lib/format.ts`)

Funções auxiliares relacionadas aos tipos de domínio:

### `formatDateTime(iso, timeOnly?)`
Formata uma string ISO em data/hora legível em pt-BR.
- `timeOnly = false` (padrão): `"DD/MM HH:mm"`
- `timeOnly = true`: `"HH:mm"`

### `formatFullDate(iso)`
Formata uma string ISO com dia da semana por extenso: `"sexta-feira, 02 de maio de 2025"`.

### `statusLabel(status)`
Converte `TripStatus` para label em português:
| Status | Label |
|---|---|
| `DRAFT` | Rascunho |
| `SCHEDULED` | Agendada |
| `CONFIRMED` | Confirmada |
| `IN_PROGRESS` | Em curso |
| `COMPLETED` | Concluída |
| `CANCELLED` | Cancelada |

### `statusVariant(status)`
Retorna a variante de `Badge` correspondente ao status.

### `canEnroll(status)`
Retorna `true` se o status permite novas inscrições (`SCHEDULED` ou `CONFIRMED`).

### `bookingStatusLabel(status)`
Converte `BookingStatus` para label em português:
| Status | Label |
|---|---|
| `ACTIVE` | Ativa |
| `CANCELLED` | Cancelada |
| `COMPLETED` | Concluída |
| `NO_SHOW` | Faltou |

---

## Utilitários Gerais (`src/lib/utils.ts`)

### `cn(...inputs)`
Combina classes Tailwind usando `clsx` + `tailwind-merge`, evitando conflitos:

```ts
import { cn } from "@/lib/utils";

cn("px-4 py-2", isActive && "bg-primary", "px-6")
// → "py-2 bg-primary px-6" (px-4 sobrescrito por px-6)
```
