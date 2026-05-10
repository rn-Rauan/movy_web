# Handoff — Contexto pra retomar (notebook)

> Documento "pegue aqui e continue". Snapshot completo: o que foi feito, onde paramos, o que vem agora, e o que tá no horizonte. Para detalhes vivos por área: [PROGRESS.md](./PROGRESS.md). Para próxima ação concreta: [BACKLOG.md](./BACKLOG.md). Para por quê de decisões: [DECISIONS.md](./DECISIONS.md). Para roadmap longo: [ROADMAP.md](./ROADMAP.md).

**Última atualização:** 2026-05-10
**Próxima sessão:** Driver Flow (D1–D4) — depende do backend entregar `GET /trip-instances/driver/me`.

---

## TL;DR

- **W1 (bug-fixes admin) — 100%** entregue em 2026-05-03.
- **W2 (admin operacional) — 100%** entregue em 2026-05-05.
- **W3 (planos / subscriptions / payments) — 100%** fechado em 2026-05-10, incluindo cleanup W3.6/W3.7 e P3 (warnings exhaustive-deps).
- **Bugs do passenger (B1, B2) — resolvidos** em 2026-05-10. Bônus: telas de detalhe consolidadas (intermediário removido), paradas via `<Select>`, guard contra inscrição duplicada (`useUserBookingForTrip`).
- **Landing page e signup B2B prontos:** `/` mostra landing pra não-autenticado e redireciona admin pra `/dashboard`; `/signup/empresa` cria conta + organização em uma chamada (`POST /auth/register-organization`).
- **Próximo passo:** Driver Flow (D1) — bloqueado pelo backend até existir `GET /trip-instances/driver/me`. Enquanto isso: P1 (telephone em `TokenResponse.user` — também depende de backend) e P2 (endpoint dedicado de duplicate-check, opcional).

---

## O que foi feito desde o último handoff (2026-05-07 → 2026-05-10)

### W3 — fechado em 2026-05-09 → 2026-05-10

- **W3.1–W3.5 (commit anterior):** PlanCard com plan-usage do backend, modal de upgrade, tela `/payments`, helper `handleApiError`.
- **W3.6 (2026-05-10):** `handleApiError` plugado em `_admin.payments` e `_admin.templates`.
- **W3.7 (2026-05-10):** `useBookingDetail` (passenger) usa `bookingCancelErrorMessage` pra mensagens estáveis de cancelamento.
- **P3 (2026-05-10):** `loadDrivers`/`loadTemplates` viraram `useCallback([adminOrgId])` — warnings `react-hooks/exhaustive-deps` zerados em `_admin.drivers.tsx` e `_admin.templates.tsx`.

### Bugs do passenger e consolidação de UX (2026-05-10)

- **B1 — "Ver detalhes" pedia admin:** parent `_protected.trips.$orgId.tsx` ganhou Outlet pattern; tela duplicada `_protected.trips.$orgId.$tripId.tsx` removida — `/public/trip-instances/$id` é a tela única de detalhe (logado e deslogado). `TripsList` aponta pra ela.
- **B2 — Viagens "lotadas" no perfil da org:** `/public/organizations/$slug` usava fallback `?? 0`; trocado por `?? trip.totalCapacity`.
- **Form de booking:** `<Input>` substituído por `<Select>` listando paradas (`origem + template.stops + destino` deduplicado); opção espelhada desabilitada no outro select; Zod `.refine(boarding !== alighting)`.
- **Guard de duplicata:** `useUserBookingForTrip(tripId)` busca booking ATIVO. UI vira "Ver inscrição" e `/book` redireciona via `replace: true` com toast.
- **`useTripDetail` parameterizado:** opção `{ authenticated: true }` rota o fetch pra `getById` (JWT enriquecido) em rotas protegidas.

### Arquivos removidos

- `src/routes/_protected.trips.$orgId.$tripId.tsx` (duplicado da tela pública)
- `src/features/trips/hooks/useTripPassengers.ts` (órfão)
- `src/features/trips/components/TripDetailView.tsx` (órfão)

---

## O que foi feito antes (2026-05-04 → 2026-05-07)

### W2 — fechado em 2026-05-05 (commit `01d6173`)

| Item                                   | Arquivos                                                                                                                        | O que mudou                                                                                                                                                                                                         |
| -------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **W2.1** Lista de bookings na viagem   | `src/features/bookings/components/BookingRow.tsx` (novo), `_protected._admin.trips.$tripId.tsx`, `services/bookings.service.ts` | `listByTripInstance(tripId)` adicionado. Detalhe da viagem agora cruza `bookings` com `passengers` por `userId` e renderiza `BookingRow` com status, presença, `enrollmentType`, `paymentMethod` e `recordedPrice`. |
| **W2.2** Confirmar presença + cancelar | `BookingRow.tsx`, `_protected._admin.trips.$tripId.tsx`, `services/bookings.service.ts`                                         | `confirmPresence(bookingId)` no service. Botões "Marcar presença" e "Cancelar" no row, com handlers que atualizam state local e dão toast.                                                                          |
| **W2.3** Editar motorista              | `_protected._admin.drivers.tsx`, `services/drivers.service.ts`                                                                  | `driversService.update(id, { cnh, cnhCategory, cnhExpiresAt, status })`. Botão `Pencil` em cada card abre dialog com Selects (categoria A-E, status ACTIVE/INACTIVE/SUSPENDED).                                     |
| **W2.4** Undo de remoção               | `_protected._admin.drivers.tsx`, `services/drivers.service.ts`                                                                  | `restoreMembership(userId, roleId, orgId)` no service. Toast pós-remoção tem action "Desfazer" que restaura.                                                                                                        |
| **W2.5** Hidratar `bookedCount`        | `_protected._admin.dashboard.tsx`, `features/trips/components/TripCard.tsx`                                                     | Dashboard mostra `X / Y inscritos`. Renomeado `availableSeats` → `availableSlots` (alinha com nome do backend) em `TripInstance` e `PublicTripCard`/`TripCard`.                                                     |

Bônus: `TripPassenger.userId` adicionado em `lib/types.ts` (match exato com `Booking.userId`).

### W3.1 — Card de plano em `/_admin/organization` (commit `7f86954`)

- `services/plans.service.ts` (`list()`, `getById()`) e `services/subscriptions.service.ts` (`getActive()`, `list()`).
- `_protected._admin.organization.tsx` busca `subscriptions.getActive(orgId)` e em sequência `plans.getById(planId)`.
- Componente `PlanCard` mostra plano, preço/mês, validade, e duas `UsageRow` (Veículos/Motoristas) com `Progress` bar e badge vermelha se atinge limite. Estado vazio com CTA "Escolher um plano" (disabled — modal de upgrade é W3.3).

### W3.4 parcial — handler genérico de 403 (commit `fd0f427`)

- `src/lib/handle-error.ts` exporta `handleApiError(err, fallbackMsg)`. Detecta `ApiError` 403 com mensagens contendo `plan|limit|excedido` e mostra toast "Você atingiu o limite do seu plano" com action "Ver planos" → `/organization`.
- Plugado em `_admin.drivers.tsx`, `_admin.organization.tsx`, `_admin.trips.tsx`, `signup.tsx`.

### Landing page e signup B2B

- `src/routes/index.tsx` agora mostra `LandingPage` pra não-autenticado. Admin autenticado → `/dashboard`; user comum → `/public/trip-instances`.
- `signup.tsx` virou layout (`Outlet`) — formulário B2C movido pra `signup.index.tsx`.
- `signup.empresa.tsx` (nova rota `/signup/empresa`) — formulário único combinando dados do user + organização. Chama `POST /auth/register-organization`. Trata 409 (slug em uso ou e-mail duplicado) com toast amigável. Redireciona pra `/dashboard` no sucesso.

### Outras mudanças menores

- Senha mínima do signup endurecida para 8 caracteres.
- `routeTree.gen.ts` regenerado várias vezes (TanStack Router).

---

## Onde paramos (estado atual)

### Frontend

- Branch: `main`. Working tree pode ter ajustes pendentes desta sessão até commit final.
- `npm run lint` — esperado: 0 erros, **1 warning** pré-existente (`react-refresh/only-export-components` em `role-context.tsx`). Os warnings de `exhaustive-deps` foram zerados nesta sessão.
- `npx tsc --noEmit` — verde.
- Recomendado: rodar `npm run dev` e testar manualmente os fluxos do passenger (detalhe + booking + duplicata) antes de declarar W3 + bug-fixes 100% comprovados.

### Backend (snapshot conforme `docs/API_FRONTEND.md`)

Resolvidos desde a janela anterior:

- ✅ `GET /trip-instances/{id}` agora retorna `template`, `bookedCount`, `availableSlots`.
- ✅ `GET /trip-instances/organization/{id}` denormaliza `departurePoint`, `destination`, `bookedCount`.
- ✅ `GET /organizations/{id}/plan-usage` existe e é a source-of-truth do `PlanCard`.
- ✅ Error codes estáveis (`BOOKING_CANCEL_WINDOW_CLOSED_BAD_REQUEST` etc).

Gaps ainda abertos:

- `TokenResponse.user` sem `telephone` (bloqueia P1).
- **`GET /trip-instances/driver/me` ainda não existe** — bloqueia driver flow inteiro (D1–D4).
- `DELETE /drivers/{id}` parece hard-delete (inconsistente com soft-delete dos outros recursos).

---

## Próximas tarefas (em ordem)

### 🟡 D1-D4 — Driver flow (depende de backend)

Bloqueado até existir `GET /trip-instances/driver/me`. Pedir ao backend antes de começar. Roteiro detalhado em `BACKLOG.md` (D1-D4).

---

### 🟡 P1 — Profile + telephone (depende de backend)

`AuthUser` não tem `telephone`. O signup envia, e a tela `/profile` envia no update, mas não temos onde mostrar. Idealmente backend inclui `telephone` em `TokenResponse.user` e no `GET /users/me`.

---

### 🟢 P2 — Endpoint dedicado de duplicate-check (opcional)

`useUserBookingForTrip` hoje baixa `listForUser` inteiro e filtra client-side. Se a lista crescer, considerar `GET /bookings/by-trip/{tripId}/mine` no backend, ou adotar React Query (ADR-002) pra cachear.

---

## Riscos / pontos de atenção

1. **Validar manualmente em browser** o fluxo do passenger pós-consolidação: detalhe único → "Inscrever-se" → form com selects de parada → confirmação. E o caminho do guard de duplicata (tentar inscrever 2x; colar URL `/book` quando já há booking ATIVO).

2. **`paymentMethod` pode ser `null`** em bookings antigos — `BookingRow` já trata.

3. **`useUserBookingForTrip` baixa lista completa** de bookings do usuário pra detectar duplicata. Aceitável no MVP; trocar quando a lista crescer (ver P2).

4. **Sobra 1 warning de lint:** `react-refresh/only-export-components` em `role-context.tsx` (RoleProvider + useRole no mesmo arquivo). Cosmético, não causa runtime issue. Resolução envolve separar em 2 arquivos.

---

## Comandos úteis pra retomar

```bash
git status
git diff --stat
npm run dev
npm run lint
npm run format
npm run build
```

Linha do tempo de leitura sugerida:

1. `docs/HANDOFF.md` (este — visão geral)
2. `docs/PROGRESS.md` (estado atual por feature)
3. `docs/BACKLOG.md` (próxima ação concreta)
4. `docs/API_FRONTEND.md` (sempre que duvidar do contrato)
