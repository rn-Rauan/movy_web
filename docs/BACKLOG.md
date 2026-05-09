# Backlog — Próximas tarefas acionáveis

> Lista priorizada das próximas tarefas. Cada uma deve ser concluível em 1–3 dias. Pra contexto estratégico, ver [ROADMAP.md](./ROADMAP.md). Pra estado geral, ver [PROGRESS.md](./PROGRESS.md). Pra contexto de retomada, ver [HANDOFF.md](./HANDOFF.md).

**Última atualização:** 2026-05-09 (W3 100% fechado — backend entregou plan-usage + detalhe enriquecido + error codes; admin migrado · Bugs do passenger e Driver Flow são as próximas frentes)

**Como usar:** Pegue do topo. Quando concluir, marque o item correspondente em PROGRESS.md e remova daqui.

---

## Top próximas — Bugs do passenger (rápido)

Reportados pelo usuário em 2026-05-09 — afetam a experiência do passageiro logado.

### B1. "Ver detalhes" pede role de admin

**Sintoma:** ao clicar em "Ver detalhes" de uma viagem (provavelmente a partir de `PublicTripCard` ou da landing), a navegação cai numa rota guardada por `_admin`. Investigar `Link to="/_admin/trips/..."` indevido em componentes do passenger.

**Suspeitos:** `src/features/trips/components/PublicTripCard.tsx`, `TripDetailView.tsx`, `index.tsx` (redirects).

---

### B2. Viagens aparecem como "lotadas"

**Sintoma:** no menu do user (passenger), todas as viagens mostram "lotada" mesmo quando há vagas. Provavelmente `bookedCount`/`availableSlots` chegando `undefined` e o componente comparando com 0 / `totalCapacity`.

**Causa provável:** `useTripDetail` em `src/features/trips/hooks/useTripDetail.ts` ainda usa `tripsService.getPublicById` — endpoint público que **não** retorna `bookedCount`/`availableSlots` enriquecidos. Migrar pra `tripsService.getById` (a rota já é `_protected`, então JWT está disponível). Mesma raiz da dívida técnica fechada do lado admin hoje.

**Aceite:** passenger vê "X / Y lugares" correto e botão "Inscrever-se" só desabilita quando realmente não há vaga.

---

## Em seguida — Driver Flow (Fase 1 do ROADMAP)

Bloqueado pelo backend até existir `GET /trip-instances/driver/me` (ou equivalente).

### D1. Driver — listar viagens designadas

**O quê:** Substituir o placeholder em `src/routes/_protected._driver.my-trips.tsx` por lista das viagens onde o usuário logado é o `driverId`.

**Onde mexer:**

- Backend: criar `GET /trip-instances/driver/me` 🔒 JWT (paginado, ordenado por `departureTime`).
- Service: `tripsService.listForDriver()` em `src/services/trips.service.ts`.
- Hook: `src/features/trips/hooks/useDriverTrips.ts`.
- Componente: reaproveitar `TripCard` ou criar `DriverTripCard`.

**Aceite:** motorista loga, vê lista das suas viagens (futuras + passadas, agrupadas por status).

---

### D2. Driver — detalhe da viagem com passageiros

**O quê:** Tela de detalhe da viagem para o motorista — dados da viagem + lista de `BookingRow` com presença.

**Onde mexer:**

- Nova rota: `src/routes/_protected._driver.my-trips.$tripId.tsx`.
- Reutiliza `bookingsService.listByTripInstance` + `tripsService.listPassengers` + `BookingRow` (já existem).

**Aceite:** motorista abre viagem e vê cards dos passageiros com presença + pagamento.

---

### D3. Driver — marcar presença

**O quê:** Mesmo handler de W2.2 (`PATCH /bookings/{id}/confirm-presence`), agora exposto pro motorista.

**Aceite:** motorista marca, persiste após refresh.

---

### D4. Driver — registrar pagamento

**O quê:** Marcar cada passageiro como pago (dinheiro / Pix / cartão — sem gateway).

**Pendente backend:** confirmar permissão de driver em `PATCH /organizations/{id}/payments/{id}/confirm` (hoje só 🛡️ ADMIN). Alternativa: backend cria `/bookings/{id}/payment` com permissão driver.

**Aceite:** ao terminar uma viagem, motorista consegue marcar 100% das presenças e pagamentos.

---

## Pendências W3 (não-bloqueantes)

### W3.6 — Plugar `handleApiError` em `_admin.payments` e `_admin.templates`

Hoje essas duas rotas usam `toast.error(err.message)` cru — perdem o redirect contextual de 403 limite-de-plano e o mapeamento de `errorCode`.

### W3.7 — Aplicar `bookingCancelErrorMessage` em `BookingDetailView` (passenger)

Helper já existe em `lib/handle-error.ts` e é usado em `_admin.trips.$tripId`. Falta plugar no fluxo do passenger (`features/bookings/components/BookingDetailView.tsx`).

---

## Limpeza pendente

### P1. Profile — telephone

**O quê:** Tipo `AuthUser` não tem `telephone`. Signup B2C envia o campo, profile envia no update, mas não há como exibir. Pedir backend pra incluir `telephone` em `TokenResponse.user`. `GET /users/me` já retorna. Depois adicionar no `AuthUser` e renderizar no `_protected.profile.tsx`.

### P3. `react-hooks/exhaustive-deps` warnings

Resolver em `_admin.drivers.tsx` e `_admin.templates.tsx` — embrulhar `loadX` em `useCallback` ou inlinear na useEffect.

---

## Backlog Fase 2 (sketch — refinar quando chegar)

- Forgot password (precisa endpoint backend `POST /auth/forgot-password` + `/auth/reset-password`)
- Notificação in-app: passageiro vê badge quando viagem reservada muda de status
- Adotar React Query em uma rota piloto (sugerido: `/_admin/trips`) — ver ADR-002
- Convergir padrão de fetching: definir e migrar (passenger usa hooks, admin imperativo)
- Generalizar `handleApiError` para todos os fluxos (já existe em `lib/handle-error.ts`, plugar nas rotas restantes)

---

## Backlog Fase 3+ (não refinar ainda)

Títulos pra não esquecer — refinar antes de começar:

- Filtros + busca + ordenação no marketplace público
- Dashboard rico (receita prevista vs. realizada, ocupação, top rotas)
- Multi-organização (encerra ADR-001)
- Pagamento real (Pix)
- LGPD (termos, política, exclusão de conta)
- Confirmação de e-mail no signup
- 2FA + hardening de XSS (revisitar tokens em localStorage)
- Framework de testes (ADR-003 — provavelmente Vitest + Testing Library)
