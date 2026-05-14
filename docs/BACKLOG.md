# Backlog — Próximas tarefas acionáveis

> Lista priorizada das próximas tarefas. Cada uma deve ser concluível em 1–3 dias. Pra contexto estratégico, ver [ROADMAP.md](./ROADMAP.md). Pra estado geral, ver [PROGRESS.md](./PROGRESS.md). Pra contexto de retomada, ver [HANDOFF.md](./HANDOFF.md).

**Última atualização:** 2026-05-10 (W3 100% fechado · bugs B1/B2 do passenger resolvidos · consolidação de telas de detalhe + guard de duplicata feitos · próxima frente: Driver Flow, bloqueado por backend)

**Como usar:** Pegue do topo. Quando concluir, marque o item correspondente em PROGRESS.md e remova daqui.

---

## Top próximas — Driver Flow (Fase 1 do ROADMAP)

**Bloqueado pelo backend** até existir `GET /trip-instances/driver/me` (ou equivalente). Pedir ao backend antes de começar.

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

## Limpeza pendente

### P1. Profile — telephone

**O quê:** Tipo `AuthUser` não tem `telephone`. Signup B2C envia o campo, profile envia no update, mas não há como exibir. Pedir backend pra incluir `telephone` em `TokenResponse.user`. `GET /users/me` já retorna. Depois adicionar no `AuthUser` e renderizar no `_protected.profile.tsx`.

### P2. Endpoint dedicado pra checar booking duplicado (opcional)

Hoje `useUserBookingForTrip` baixa `listForUser` inteiro e filtra client-side. Se a lista crescer, considerar `GET /bookings/by-trip/{tripId}/mine` no backend, ou adotar React Query pra cachear.

---

## Backlog Fase 2 (sketch — refinar quando chegar)

- Forgot password (precisa endpoint backend `POST /auth/forgot-password` + `/auth/reset-password`)
- Notificação in-app: passageiro vê badge quando viagem reservada muda de status
- Adotar React Query em uma rota piloto (sugerido: `/_admin/trips`) — ver ADR-002
- Convergir padrão de fetching: definir e migrar (passenger usa hooks, admin imperativo)

---

## Backlog Fase 3+ (não refinar ainda)

Títulos pra não esquecer — refinar antes de começar:

- Dashboard rico (receita prevista vs. realizada, ocupação, top rotas)
- Multi-organização (encerra ADR-001)
- Pagamento real (Pix)
- LGPD (termos, política, exclusão de conta)
- Confirmação de e-mail no signup
- 2FA + hardening de XSS (revisitar tokens em localStorage)
- Framework de testes (ADR-003 — provavelmente Vitest + Testing Library)
