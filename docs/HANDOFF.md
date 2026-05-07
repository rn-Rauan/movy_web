# Handoff — Contexto pra retomar (notebook)

> Documento "pegue aqui e continue". Snapshot completo: o que foi feito, onde paramos, o que vem agora, e o que tá no horizonte. Para detalhes vivos por área: [PROGRESS.md](./PROGRESS.md). Para próxima ação concreta: [BACKLOG.md](./BACKLOG.md). Para por quê de decisões: [DECISIONS.md](./DECISIONS.md). Para roadmap longo: [ROADMAP.md](./ROADMAP.md).

**Última atualização:** 2026-05-07
**Próxima sessão:** seguir com W3.2 (tela `/payments`) ou destravar driver flow (depende de backend).

---

## TL;DR

- **W1 (bug-fixes admin) — 100%** entregue em 2026-05-03.
- **W2 (admin operacional) — 100%** entregue em 2026-05-05 no commit `01d6173` (BookingRow com presença/cancelamento, edição de motorista, undo de remoção, hidratação de `bookedCount`).
- **W3 começou:** card de plano em `/_admin/organization` (W3.1) + tratamento contextual de 403 limite-de-plano (W3.4 parcial via `handleApiError` em `src/lib/handle-error.ts`).
- **Landing page e signup B2B prontos:** `/` mostra landing pra não-autenticado e redireciona admin pra `/dashboard`; `/signup/empresa` cria conta + organização em uma chamada (`POST /auth/register-organization`).
- **Próximo passo:** W3.2 (tela `/_admin/payments`) ou D1 (driver flow) se o backend já tiver `GET /trip-instances/driver/me`.

---

## O que foi feito desde o último handoff (2026-05-04 → 2026-05-07)

### W2 — fechado em 2026-05-05 (commit `01d6173`)

| Item                                   | Arquivos                                                                                       | O que mudou                                                                                                                                                                          |
| -------------------------------------- | ---------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **W2.1** Lista de bookings na viagem   | `src/features/bookings/components/BookingRow.tsx` (novo), `_protected._admin.trips.$tripId.tsx`, `services/bookings.service.ts` | `listByTripInstance(tripId)` adicionado. Detalhe da viagem agora cruza `bookings` com `passengers` por `userId` e renderiza `BookingRow` com status, presença, `enrollmentType`, `paymentMethod` e `recordedPrice`. |
| **W2.2** Confirmar presença + cancelar | `BookingRow.tsx`, `_protected._admin.trips.$tripId.tsx`, `services/bookings.service.ts`        | `confirmPresence(bookingId)` no service. Botões "Marcar presença" e "Cancelar" no row, com handlers que atualizam state local e dão toast.                                            |
| **W2.3** Editar motorista              | `_protected._admin.drivers.tsx`, `services/drivers.service.ts`                                  | `driversService.update(id, { cnh, cnhCategory, cnhExpiresAt, status })`. Botão `Pencil` em cada card abre dialog com Selects (categoria A-E, status ACTIVE/INACTIVE/SUSPENDED).        |
| **W2.4** Undo de remoção               | `_protected._admin.drivers.tsx`, `services/drivers.service.ts`                                  | `restoreMembership(userId, roleId, orgId)` no service. Toast pós-remoção tem action "Desfazer" que restaura.                                                                          |
| **W2.5** Hidratar `bookedCount`        | `_protected._admin.dashboard.tsx`, `features/trips/components/TripCard.tsx`                     | Dashboard mostra `X / Y inscritos`. Renomeado `availableSeats` → `availableSlots` (alinha com nome do backend) em `TripInstance` e `PublicTripCard`/`TripCard`.                       |

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

- Branch: `main`. Working tree limpo. Tudo commitado.
- `npm run lint` — esperado: 0 erros, ~3 warnings pré-existentes (`react-refresh/only-export-components` em `role-context.tsx`; `react-hooks/exhaustive-deps` em `_admin.drivers.tsx` e `_admin.templates.tsx`).
- `npm run build` — esperado: verde (não validado nesta sessão).
- W2 e W3.1 não foram testados manualmente em browser nesta sessão. Antes de declarar W2 100% comprovado, abrir `npm run dev` e validar fluxo de presença/cancelamento.

### Backend (snapshot conforme `docs/API_FRONTEND.md`, sem alterações nesta janela)

Permanece com os 3 críticos resolvidos. Gaps abertos:

- `stops` não denormalizado em `TripInstanceResponse` (detalhe ainda precisa de template lookup).
- `GET /trip-instances/{id}` (detalhe) não traz campos enriquecidos.
- `TokenResponse.user` sem `telephone`.
- **`GET /trip-instances/driver/me` ainda não existe** — bloqueia driver flow.
- **`GET /organizations/{id}/plan-usage` ainda não existe** — `PlanCard` hoje conta veículos/motoristas localmente.

---

## Próximas tarefas (em ordem)

### 🟢 W3.2 — Tela `/_admin/payments`

**Quê:** Lista paginada de pagamentos da subscription com badges (`PENDING` / `CONFIRMED` / `FAILED`).

**Como:**

1. Criar `src/services/payments.service.ts` com `listByOrgId(orgId, page?, size?)` chamando `GET /organizations/{id}/payments`.
2. Criar rota `src/routes/_protected._admin.payments.tsx` (admin guard).
3. Adicionar link no `BottomNav` ou em "Configurações" da org.
4. Reutilizar `LoadingList` + `ErrorCard`.

**Aceite:** admin abre `/payments`, vê histórico paginado com filtro por status.

---

### 🟢 W3.3 — Modal de upgrade de plano

**Quê:** Lista planos via `GET /plans`, seleciona, chama `POST /organizations/{id}/subscriptions`.

**Como:**

1. Habilitar o botão "Escolher um plano" no `PlanCard` (`_admin.organization.tsx`).
2. Criar `<Dialog>` que carrega `plansService.list()`.
3. `subscriptionsService.create(orgId, planId)` — adicionar no service (não existe ainda).
4. Refetch da subscription ativa após sucesso. Toast.

**Aceite:** admin troca plano, card reflete novo plano + limites sem F5.

---

### 🟢 W3.5 — Plan-usage em uma chamada (depende de backend)

Substituir o cálculo local de `vehiclesCount`/`driversCount` no `PlanCard` por `GET /organizations/{id}/plan-usage`. Pedir esse endpoint ao backend (gap aberto). Sem ele, fica como está.

---

### 🟡 D1-D4 — Driver flow (depende de backend)

Bloqueado até existir `GET /trip-instances/driver/me`. Pedir ao backend antes de começar. Roteiro detalhado em `BACKLOG.md` (D1-D4).

---

### 🟡 P1 — Profile + telephone

`AuthUser` não tem `telephone`. O signup envia, e a tela `/profile` envia no update, mas não temos onde mostrar. Idealmente backend inclui `telephone` em `TokenResponse.user` e no `GET /users/me`.

---

## Riscos / pontos de atenção

1. **Validar W2 + W3.1 manualmente em browser.** Implementação fechada e build passou na CI, mas a operação real (presença, cancelamento dentro de 30 min, undo de remoção, atualização do plan card) não foi testada nesta sessão.

2. **`paymentMethod` pode ser `null`** em bookings antigos — `BookingRow` já trata (só renderiza se truthy).

3. **Cancelamento dentro de 30 min ou status terminal** — backend bloqueia. `BookingRow` mostra erro cru via `toast.error(err.message)`. Considerar adicionar tratamento específico ("Cancelamento não permitido a menos de 30 minutos da partida") quando o backend retornar a mensagem identificável.

4. **`react-hooks/exhaustive-deps` warnings** continuam em `_admin.drivers.tsx` e `_admin.templates.tsx`. Pré-existentes.

5. **Detalhe de trip-instance ainda é "magro"** — `_admin.trips.$tripId.tsx` continua chamando `templatesService.getById` pra obter `stops`/origem/destino. Aguardando backend.

6. **`PlanCard` conta limites localmente** (do array de veículos/drivers carregado na própria tela). Se um deles falhar, mostra `0 / N`. Endpoint `/plan-usage` resolveria.

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
