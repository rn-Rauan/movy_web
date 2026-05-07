# Backlog — Próximas tarefas acionáveis

> Lista priorizada das próximas tarefas. Cada uma deve ser concluível em 1–3 dias. Pra contexto estratégico, ver [ROADMAP.md](./ROADMAP.md). Pra estado geral, ver [PROGRESS.md](./PROGRESS.md). Pra contexto de retomada, ver [HANDOFF.md](./HANDOFF.md).

**Última atualização:** 2026-05-07 (W2 100% fechado · W3.1 + W3.4 parciais entregues · W3.2/W3.3 promovidos ao topo)

**Como usar:** Pegue do topo. Quando concluir, marque o item correspondente em PROGRESS.md e remova daqui.

---

## Top próximas — W3 (plans, subscriptions & payments)

### W3.2 — Tela `/_admin/payments`

**O quê:** Lista paginada de pagamentos da subscription, badges de status (`PENDING` / `CONFIRMED` / `FAILED`), filtros por mês.

**Onde mexer:**

- Novo `src/services/payments.service.ts` com `listByOrgId(orgId, page?, size?)` → `GET /organizations/{id}/payments`.
- Nova rota `src/routes/_protected._admin.payments.tsx` (admin guard implícito pelo prefixo `_admin`).
- Adicionar link em `_admin.organization.tsx` (no `PlanCard` ou logo abaixo) e/ou na bottom nav admin.

**Critério de aceite:** admin abre `/payments`, vê lista paginada com badges e formatação BRL. Erro/loading tratados.

---

### W3.3 — Modal de upgrade de plano

**O quê:** Botão "Escolher um plano" do `PlanCard` abre `<Dialog>` que lista planos disponíveis e cria nova subscription.

**Onde mexer:**

- `subscriptionsService.create(orgId, planId)` em `src/services/subscriptions.service.ts` (`POST /organizations/{id}/subscriptions`).
- Habilitar o botão `disabled` em `PlanCard` (em `_protected._admin.organization.tsx`).
- Dialog reutilizando padrão dos outros forms da rota: lista de cards de plano com `plansService.list()`, seleciona, confirma.
- Após sucesso: refetch de `subscription` ativa + `plan` correspondente, toast.

**Critério de aceite:** admin escolhe outro plano, `PlanCard` reflete sem F5; limites se ajustam.

---

### W3.5 — Plan-usage em uma chamada (depende de backend)

**O quê:** Substituir contagem local de veículos/motoristas no `PlanCard` por `GET /organizations/{id}/plan-usage`.

**Pré-requisito:** endpoint não existe — pedir ao backend (gap aberto na análise da API). Sem ele, mantém o fallback atual.

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

## Limpeza pendente

### P1. Profile — telephone

**O quê:** Tipo `AuthUser` não tem `telephone`. Signup B2C envia o campo, profile envia no update, mas não há como exibir. Pedir backend pra incluir `telephone` em `TokenResponse.user` e em `GET /users/me`. Depois adicionar no `AuthUser` e renderizar no `_protected.profile.tsx`.

### P2. Cancelamento < 30 min — mensagem amigável

`BookingRow` (admin) mostra erro cru do backend ao tentar cancelar < 30 min antes da partida ou trip em status terminal. Identificar a mensagem padrão do backend e mostrar `toast.error("Cancelamento não permitido a menos de 30 minutos da partida")` em vez do erro raw.

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
