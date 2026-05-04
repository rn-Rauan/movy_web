# Backlog — Próximas tarefas acionáveis

> Lista priorizada das próximas tarefas. Cada uma deve ser concluível em 1–3 dias. Pra contexto estratégico, ver [ROADMAP.md](./ROADMAP.md). Pra estado geral, ver [PROGRESS.md](./PROGRESS.md). Pra contexto de retomada, ver [HANDOFF.md](./HANDOFF.md).

**Última atualização:** 2026-05-04 (W1 admin completo · W2 desbloqueado pelo backend e promovido ao topo · driver flow renumerado)

**Como usar:** Pegue do topo. Quando concluir, marque o item correspondente em PROGRESS.md e remova daqui.

---

## Top próximas — W2 (fechar 100% admin)

Todos desbloqueados em 2026-05-04 (backend recebeu os ajustes críticos). Ordem respeita dependências.

### W2.1 — Lista completa de bookings por viagem (admin)

**O quê:** Em `/_admin/trips/$tripId`, evoluir o card "Passageiros" pra mostrar status (`ACTIVE`/`INACTIVE`), `presenceConfirmed`, `enrollmentType`, `paymentMethod` e `recordedPrice` de cada inscrição.

**Por quê:** Hoje admin só vê nome+stop. Sem isso não consegue auditar a viagem.

**Onde mexer:**

- Estender `src/services/bookings.service.ts` com `listByTripInstance(tripId)` chamando `GET /bookings/trip-instance/{id}` (paginado).
- Em `_protected._admin.trips.$tripId.tsx`: buscar `bookings` + `passengers` em paralelo. Construir `Map<userId, name>` a partir dos passengers (match exato — `TripPassengerResponse` já traz `userId`).
- Criar `src/features/bookings/components/BookingRow.tsx` com props `{ booking, passengerName?, onConfirmPresence?, onCancel?, busy? }`.
- `paymentMethod` pode vir `null` em bookings antigos — tratar.

**Critério de aceite:** lista mostra nome real do passageiro, badges de status/presença, método e valor formatado em BRL.

---

### W2.2 — Confirmar presença + cancelar inscrição (admin)

**O quê:** Botões "Marcar presença" e "Cancelar" em cada `BookingRow`.

**Por quê:** Fechar o loop operacional do lado admin (admin pode auditar e corrigir).

**Onde mexer:**

- Service: `bookingsService.confirmPresence(bookingId)` chamando `PATCH /bookings/{id}/confirm-presence`. (`cancel` já existe.)
- `BookingRow` com handlers via callback. AlertDialog de confirmação no cancel.
- Após cancel: refetch da lista pra atualizar contagem.
- **Backend bloqueia cancel se trip está `IN_PROGRESS`/`FINISHED` ou faltar < 30 min pra partida.** Capturar erro e mostrar toast amigável ("Cancelamento não permitido a menos de 30 minutos da partida").

**Critério de aceite:** marcar presença persiste; cancelar reabre vaga.

---

### W2.3 — Editar driver (categoria CNH, validade, status)

**O quê:** Em `/_admin/drivers`, botão `Pencil` em cada card abre `<Dialog>` com CNH, categoria (A-E), validade (`type="date"`), status (Ativo/Inativo/Suspenso).

**Onde mexer:**

- Service: `driversService.update(id, { cnh?, cnhCategory?, cnhExpiresAt?, status? })` chamando `PUT /drivers/{id}`.
- UI: dialog reutilizando o padrão dos outros forms da rota.

**Critério de aceite:** mudança persiste após refresh; badge de status reflete.

---

### W2.4 — Restaurar membership ("Desfazer remoção")

**O quê:** Toast com action "Desfazer" após remover motorista — chama `PATCH /memberships/{userId}/{roleId}/{orgId}/restore`.

**Onde mexer:**

- Service: `driversService.restoreMembership(userId, roleId, orgId)`.
- Trocar `toast.success("Motorista removido")` por `toast.success(..., { action: { label: "Desfazer", onClick: ... } })`.

**Critério de aceite:** clicar "Desfazer" no toast traz o motorista de volta sem reabrir dialog.

---

### W2.5 — Hidratar `bookedCount` na lista de viagens

**O quê:** Lista admin (`/_admin/trips`) e dashboard (`/_admin/dashboard`) mostram `0 inscritos`. Backend agora popula `bookedCount` em `GET /trip-instances/organization/{id}`.

**Onde mexer:**

- Validar empiricamente no DevTools que o campo chega.
- Remover o `?? 0` enganoso quando o real chegar.
- **Bônus:** simplificar W1.1 na lista — backend agora retorna `departurePoint`, `destination`, prices, `isRecurring` no mesmo endpoint. Dá pra remover o `Map<id, TripTemplate>` e o preload de templates só pra lookup. **Manter** `templatesService.getById` na tela de detalhe (detalhe não retorna campos enriquecidos).

**Critério de aceite:** dashboard e lista mostram contagem real.

---

## Em seguida — Driver Flow (Fase 1 do ROADMAP)

Bloqueado pelo backend até existir `GET /trip-instances/driver/me` (ou equivalente). Sem isso o motorista não consegue listar suas viagens. Pedir esse endpoint antes de começar.

### D1. Driver — listar viagens designadas

**O quê:** Substituir o placeholder em `src/routes/_protected._driver.my-trips.tsx` por uma lista de viagens onde o usuário logado é o `driverId`.

**Onde mexer:**

- Backend: criar `GET /trip-instances/driver/me` 🔒 JWT (paginado, ordenado por `departureTime`).
- Service: `tripsService.listForDriver()` ou `driversService.listMyTrips()`.
- Hook: `src/features/trips/hooks/useDriverTrips.ts` (padrão feature hooks).
- Componente: reaproveitar `TripCard` ou criar `DriverTripCard`.

**Aceite:** motorista loga, vê lista das suas viagens (futuras + passadas, agrupadas por status), pode clicar pra ver detalhe.

---

### D2. Driver — detalhe da viagem com passageiros

**O quê:** Tela de detalhe da viagem para o motorista — dados da viagem + lista de passageiros usando `BookingRow` (criado em W2.1).

**Onde mexer:**

- Nova rota: `src/routes/_protected._driver.my-trips.$tripId.tsx`.
- Reutiliza `bookingsService.listByTripInstance` + `tripsService.listPassengers` + `BookingRow` da W2.

**Aceite:** motorista abre viagem e vê cards dos passageiros com presença + pagamento.

---

### D3. Driver — marcar presença

**O quê:** Mesmo handler de W2.2 (`PATCH /bookings/{id}/confirm-presence`), agora exposto pro motorista no detalhe da sua viagem.

**Aceite:** motorista marca, persiste após refresh.

---

### D4. Driver — registrar pagamento

**O quê:** Marcar cada passageiro como pago (dinheiro/Pix/cartão) — sem gateway.

**Pendente backend:** confirmar permissão de driver em `PATCH /organizations/{id}/payments/{id}/confirm` (hoje só 🛡️ ADMIN). Alternativa: backend cria `/bookings/{id}/payment` com permissão driver.

**Aceite:** ao terminar uma viagem, motorista consegue marcar 100% das presenças e pagamentos.

---

## Limpeza pendente

### P1. Profile — verificar persistência de telefone

**O quê:** O formulário de editar perfil envia `telephone`, mas `AuthUser` (`src/lib/types.ts`) não tem o campo, e `TokenResponse.user` (login) também não. Verificar se backend grava e expor o campo no tipo + UI.

**Onde mexer:** `src/lib/types.ts` (`AuthUser`), `src/routes/_protected.profile.tsx`. Idealmente backend inclui `telephone` em `TokenResponse.user` (gap #3 da análise da API).

---

## W3 — Plans, Subscriptions & Payments (próximo ciclo)

Endpoints já existem (linhas 683-762 da API doc). Esboço dos entregáveis:

### W3.1. Card de plano em `/_admin/organization`

Mostra plano atual (nome, preço, validade), uso vs. limite (X de Y veículos/motoristas/viagens-mês), CTA "Mudar plano".

**Pré-requisito:** endpoint `GET /organizations/{id}/plan-usage` (gap #5 da análise da API). Sem ele, contar localmente como fallback.

### W3.2. Tela `/_admin/payments`

Lista paginada de pagamentos da subscription, badges de status (`PENDING`/`CONFIRMED`/`FAILED`), filtros por mês.

### W3.3. Modal de upgrade

Lista planos via `GET /plans`, seleciona, chama `POST /organizations/{id}/subscriptions`.

### W3.4. Tratamento contextual de 403 "limite excedido"

Quando `POST /memberships/driver` ou `POST /vehicles/...` retornar 403, mostrar dialog "Você atingiu o limite do seu plano" com link pra `/organization`.

**Estimativa total W3:** 3-4 dias.

---

## Backlog Fase 2 (sketch — refinar quando chegar)

- Forgot password (precisa endpoint backend `POST /auth/forgot-password` + `/auth/reset-password`)
- Notificação in-app: passageiro vê badge quando viagem reservada muda de status
- Adotar React Query em uma rota piloto (sugerido: `/_admin/trips`) — ver ADR-002
- Convergir padrão de fetching: definir e migrar
- Camada de error handling: util `handleApiError(err, fallbackMsg)` substituindo `err instanceof Error ? err.message : "..."`

---

## Backlog Fase 3+ (não refinar ainda)

Títulos pra não esquecer — refinar antes de começar:

- Filtros + busca + ordenação no marketplace público
- Dashboard rico (receita, ocupação, top rotas)
- Multi-organização (encerra ADR-001)
- Pagamento real (Pix)
- LGPD (termos, política, exclusão de conta)
- Confirmação de e-mail no signup
- 2FA + hardening de XSS (revisitar tokens em localStorage)
- Framework de testes (ADR-003 — provavelmente Vitest + Testing Library)
