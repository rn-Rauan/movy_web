# Handoff — Contexto pra retomar (notebook)

> Documento "pegue aqui e continue". Snapshot completo: o que foi feito, onde paramos, o que vem agora, e o que tá no horizonte (W3/W4). Para detalhes vivos por área: [PROGRESS.md](./PROGRESS.md). Para próxima ação concreta: [BACKLOG.md](./BACKLOG.md). Para por quê de decisões: [DECISIONS.md](./DECISIONS.md). Para roadmap longo: [ROADMAP.md](./ROADMAP.md).

**Última atualização:** 2026-05-04
**Próxima sessão:** notebook, do dia 2026-05-04 ao próximo fim de semana

---

## TL;DR

- **W1 (bug-fixes admin) — 100% concluído** em 2026-05-03. 5/5 itens entregues. Build/lint verdes.
- **API foi atualizada** em 2026-05-04 e resolveu **3 dos 3 bloqueios críticos** que tínhamos pra W2. Ainda restam 6 gaps menores no backend (não-bloqueantes).
- **W2 está pronto pra começar.** Todos os 5 itens (W2.1–W2.5) estão desbloqueados. W2.1+W2.5 ficaram simplificados pelas mudanças de API.
- **Próximo passo:** abrir W2.1 (lista completa de bookings no detalhe da viagem admin) — match exato por `userId` agora.

---

## O que foi feito hoje (sessões 2026-05-03 e 2026-05-04)

### Onda 1 — Bug-fixes admin (5/5 fechados em 2026-05-03)

| Item                                                 | Arquivos                                                                              | O que mudou            |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | --------------------  |
| **W1.1** Hidratar template em `TripInstance`         | `src/routes/_protected._admin.trips.tsx`, `src/routes/_protected._admin.trips.$tripId.tsx`            | `templatesService.getById` no detalhe + `Map<id, TripTemplate>` na lista pra mostrar origem→destino reais (era "—" sempre). Filtro de busca usa o template.                                                           |
| **W1.2** Validar driver+veículo pra `SCHEDULED`      | `src/routes/_protected._admin.trips.tsx`                                                              | `superRefine` no `tripSchema` exige `driverId`+`vehicleId` se `initialStatus === "SCHEDULED"`. 2 selects condicionais com asterisco vermelho.                                                                         |
| **W1.3** Validação de placa (7 chars)                | `src/routes/_protected._admin.organization.tsx`                                                       | `vehicleSchema.plate` foi de `min(7).max(8)` para `min(7).max(7)` + `<Input maxLength={7}>`.                                                                                                                          |
| **W1.4** Remover sheet de drivers em `/organization` | `src/routes/_protected._admin.organization.tsx`                                                       | `DriversSheet` (180 linhas) removido inteiro + estado `driversOpen` + `driverSchema` + `DRIVER_ROLE_ID` + import `UserX`. Card "Motoristas" virou `<Link to="/drivers">`.                                             |
| **W1.5** Templates: campos faltantes                 | `src/lib/types.ts`, `src/services/templates.service.ts`, `src/routes/_protected._admin.templates.tsx` | Tipo `Weekday` exportado. Template ganhou `frequency`, `minRevenue`, `autoCancelOffset`. UI: 7 toggles Dom-Sáb (visíveis se `isRecurring`); checkbox + 2 inputs de auto-cancel; `superRefine` valida obrigatoriedade. |

### Sessão 2026-05-04 (revisão + handoff)

- Análise da `docs/API_FRONTEND.md` revelou que `BookingResponse.userName` **não era necessário** — `TripPassengerResponse` já retorna `userId`, então o match com `BookingResponse.userId` é exato. Bloqueio de W2.1 era falso (erro meu de leitura).
- Listei 11 ajustes recomendados de backend (3 críticos, 4 importantes, 4 cosméticos) — ver seção "Análise da API" abaixo.
- Você aplicou 3 dos 3 ajustes críticos no backend (parabéns 🎯).

---

## Onde paramos (status atual)

### Frontend

- Branch: `main`. Sem PR aberto. Working tree tem mudanças não-commitadas em `src/routes/_protected._admin.organization.tsx`, `src/routes/_protected._admin.trips.$tripId.tsx`, `src/routes/_protected._admin.trips.tsx` (W1) + os 4 docs novos em `docs/`.
- `npm run lint` — 0 erros, 3 warnings pré-existentes (`react-refresh/only-export-components` em `role-context.tsx`; `react-hooks/exhaustive-deps` em `_admin.drivers.tsx` e `_admin.templates.tsx`).
- `npm run build` — verde (9.8s).
- Não testei manualmente em browser. Antes de seguir pra W2, **rode `npm run dev` e valide W1 end-to-end** (checklist em "Verificação manual" do plano `F:\Users\rauan\.claude\plans\eu-quero-fecahr-priemiro-buzzing-knuth.md`).

### Backend (após mudanças de 2026-05-04)

Conforme `docs/API_FRONTEND.md` (snapshot que tenho):

- `TripInstanceResponse` ganhou `bookedCount`, `availableSlots`, `departurePoint`, `destination`, `priceOneWay`, `priceReturn`, `priceRoundTrip`, `isRecurring`, `isPublic` — mas **só** populados em `GET /trip-instances/organization/{id}` (lista paginada). Endpoints `GET /trip-instances/{id}` e `/template/{id}` ainda retornam o schema "magro".
- `BookingResponse` ganhou `paymentMethod` (pode ser `null` em bookings antigos).
- `PATCH /bookings/{id}/cancel` agora documenta que **ADMIN ou DRIVER** da org dona podem cancelar qualquer booking, e bloqueia se `IN_PROGRESS`/`FINISHED` ou se faltar < 30 min pra partida.

---

## Próximas tarefas (W2 — todas desbloqueadas)

Estimativa total: 2–3 dias de trabalho focado. Ordem recomendada respeita dependências (BookingRow precisa existir antes de plugar handlers).

### W2.1 — Lista completa de bookings por viagem (admin)

**Quê:** Em `/_admin/trips/$tripId`, evoluir o card "Passageiros" pra mostrar status (ACTIVE/INACTIVE), presença, tipo de inscrição (`enrollmentType`), método de pagamento (`paymentMethod`) e valor (`recordedPrice`).

**Como:**

1. Estender `src/services/bookings.service.ts` com `listByTripInstance(tripId)` chamando `GET /bookings/trip-instance/{id}` (paginado).
2. Buscar em paralelo `bookingsService.listByTripInstance(tripId)` + `tripsService.listPassengers(tripId)`.
3. Construir `Map<userId, name>` a partir dos passengers e enriquecer cada booking — match exato por `userId`.
4. Criar componente novo `src/features/bookings/components/BookingRow.tsx` (props: `booking`, `passengerName?`, `onConfirmPresence?`, `onCancel?`, `busy?`).
5. Renderizar a lista em `_admin.trips.$tripId.tsx`.

**Aceite:** lista mostra nome real do passageiro (não "Passageiro"), status/presença/método/valor visíveis, ordenação estável.

---

### W2.2 — Confirmar presença + cancelar inscrição (admin)

**Quê:** Adicionar ações em cada `BookingRow` — "Marcar presença" (vira "Presente" + disabled após sucesso) e "Cancelar inscrição" (com `AlertDialog`).

**Como:**

1. Service: `bookingsService.confirmPresence(bookingId)` chamando `PATCH /bookings/{id}/confirm-presence`. (`cancel` já existe.)
2. `BookingRow` com botões + handlers via callback.
3. Handlers no detalhe: chamam o service, atualizam o item local na lista, `toast.success/error`. Após cancelamento, refazer fetch da lista pra recalcular contagem.
4. **Atenção ao erro 30-min:** o backend bloqueia cancel se faltar < 30 min ou trip está `IN_PROGRESS`/`FINISHED`. Mostrar toast amigável ("Cancelamento não permitido a menos de 30 minutos da partida") em vez do erro cru.

**Aceite:** admin marca presença (persiste após reload); cancela inscrição (capacidade reabre na próxima query).

---

### W2.3 — Editar driver (categoria CNH, validade, status)

**Quê:** Em `/_admin/drivers`, botão de edição (ícone `Pencil`) em cada card abre `<Dialog>` com CNH, categoria (A-E), validade (`<Input type="date">`), status (Ativo/Inativo/Suspenso).

**Como:**

1. Service: `driversService.update(id, { cnh?, cnhCategory?, cnhExpiresAt?, status? })` chamando `PUT /drivers/{id}`.
2. UI no `_protected._admin.drivers.tsx`: dialog reutilizando o padrão dos outros forms da rota.

**Aceite:** mudança persiste após refresh; badge de status reflete.

---

### W2.4 — Restaurar membership ("Desfazer remoção")

**Quê:** Após `handleRemove` em `/_admin/drivers`, mostrar toast com action "Desfazer" que chama `PATCH /memberships/{userId}/{roleId}/{organizationId}/restore`.

**Como:**

1. Service: `driversService.restoreMembership(userId, roleId, orgId)`.
2. Trocar `toast.success("Motorista removido")` por `toast.success(..., { action: { label: "Desfazer", onClick: ... } })`. Sonner 2.0.7 (instalado) suporta isso.

**Aceite:** clicar "Desfazer" no toast traz o motorista de volta sem reabrir o dialog de "adicionar".

---

### W2.5 — Hidratar `bookedCount` na lista de viagens

**Quê:** Lista admin (`/_admin/trips`) e dashboard (`/_admin/dashboard`) mostram `0 inscritos` em todas as viagens. Backend agora popula `bookedCount` e `availableSlots` no endpoint `GET /trip-instances/organization/{id}`.

**Como:**

1. Não precisa mais de fallback via `availability` — usar direto `t.bookedCount` (já existe no tipo `TripInstance`, só remover o `?? 0` enganoso quando o valor real chegar).
2. Verificar empiricamente que o backend está retornando o campo (uma chamada no DevTools resolve).
3. **Opcional/extra:** já que o backend agora retorna `departurePoint`, `destination`, `priceOneWay/Return/RoundTrip`, `isRecurring` na lista enriquecida, **dá pra simplificar W1.1 na lista** removendo o `Map<id, TripTemplate>` e o preload de templates só pra lookup de origem/destino. **Cuidado:** o detalhe (`GET /trip-instances/{id}`) **não** retorna esses campos enriquecidos — manter `templatesService.getById` lá pra `stops` e origem/destino.

**Aceite:** dashboard e lista mostram contagem real.

---

## Análise da API atualizada

### ✅ Resolvido nesta atualização (3/3 críticos)

1. **`TripInstanceResponse.bookedCount` + `availableSlots`** — adicionados (apenas em `GET /trip-instances/organization/{id}`).
2. **`BookingResponse.paymentMethod`** — adicionado, com caveat de `null` para bookings antigos.
3. **Permissão de cancel** — documentada: ADMIN/DRIVER da org pode cancelar; bloqueio se `IN_PROGRESS`/`FINISHED` ou < 30 min.

Bônus: `TripInstanceResponse` da lista também ganhou denormalização de template (`departurePoint`, `destination`, prices, `isRecurring`, `isPublic`).

### ⚠️ Restante (não-bloqueantes, mas valiosos)

#### Importantes

1. **`stops` não foi denormalizado** em `TripInstanceResponse`. Detalhe da viagem ainda precisa do template lookup pra renderizar paradas. **Sugestão:** incluir `stops` no enriquecimento da lista E também no `GET /trip-instances/{id}` (detalhe).
2. **`GET /trip-instances/{id}` (detalhe) não traz os campos enriquecidos.** Frontend ainda paga 2 requests pra mostrar o detalhe. **Sugestão:** estender o detalhe com o mesmo enriquecimento (ou criar `GET /trip-instances/{id}/details` análogo ao `BookingDetailsResponse`).
3. **`TokenResponse.user` não traz `telephone`.** Profile precisa de `/users/me` extra logo após login. **Sugestão:** incluir `telephone` (e `status`) no `TokenResponse.user`.

#### Habilitam features futuras

4. **`GET /trip-instances/driver/me` (não existe).** Bloqueia W4 (driver flow). Sem isso o motorista não consegue listar suas próprias viagens. **Sugestão:** novo endpoint 🔒 JWT que filtra por `driverId = currentUser.driverProfile.id`, paginado e ordenado por `departureTime`.
5. **`GET /organizations/{id}/plan-usage` (não existe).** Habilita cards de plano em `/organization` e mensagens contextuais ao bater limite. **Sugestão:** retornar `{ vehiclesUsed/Max, driversUsed/Max, monthlyTripsUsed/Max }`. Necessário pra W3.

#### Cosméticos / consistência

6. **`DELETE /drivers/{id}`** parece hard-delete (doc diz só "Delete a driver profile"). Outros recursos (vehicles, orgs, templates, bookings) são soft. **Sugestão:** padronizar pra soft (status=INACTIVE) ou explicitar na doc se for intencional.
7. **`GET /drivers/organization/{id}`** não aceita `?status=`. Frontend filtra no cliente. OK pra MVP.
8. **`POST /drivers`** doc diz CNH "9-12 chars" mas frontend só valida `min(9)`. Adicionar `max(11)` no schema do frontend para alinhar (CNH brasileira é 11 dígitos).
9. **Linha 335 da doc**: emoji `🛡️` quebrado (`�️`). Cosmético.

---

## W3 — Plans, Subscriptions & Payments (próximo ciclo)

**Status:** intencionalmente fora do W1+W2. Esboço pra você ter visão.

**Objetivo:** dar ao admin visibilidade do plano contratado, dos limites consumidos, e do histórico de pagamentos da subscription.

**Endpoints já existem no backend** (lines 683-762 da API doc): `GET/POST /organizations/{id}/subscriptions`, `GET /plans`, `GET /organizations/{id}/payments`, `PATCH .../confirm`, `PATCH .../fail`.

**Entregáveis sugeridos:**

1. **Card de plano em `/_admin/organization`** — mostra plano atual (nome, preço, validade), uso vs. limite (X de Y veículos, etc.), CTA "Mudar plano".
   - Depende de **plan-usage** (gap #5 acima) — implementar fallback contando localmente se backend demorar.
2. **Tela `/_admin/payments`** — lista paginada de pagamentos da subscription, com badge de status (PENDING/CONFIRMED/FAILED).
3. **Modal de upgrade** — lista planos via `GET /plans`, seleciona, chama `POST /organizations/{id}/subscriptions`.
4. **Mensagem contextual de 403** — quando `POST /memberships/driver` ou `POST /vehicles/...` retornar 403 "limite excedido", mostrar dialog "Você atingiu o limite do seu plano. Faça upgrade." com link pra `/organization`.

**Estimativa:** 3–4 dias.

**Pré-requisitos:** idealmente o gap #5 (plan-usage endpoint) resolvido. Sem ele, frontend conta limites manualmente — funciona mas é frágil.

---

## W4 — Driver Flow (Fase 1 do roadmap)

**Status:** placeholder hoje. Bloqueado pelo gap #4 da API (endpoint `/trip-instances/driver/me`).

**Por que importa:** sem driver flow, o role driver não tem utilidade — admin atribui motoristas mas eles não veem nada. Fase 1 do `ROADMAP.md` é literalmente "fechar o loop operacional", e isso é o que falta.

**Entregáveis (já no `BACKLOG.md` itens #1-4):**

1. **`/_protected/_driver/my-trips`** — listar viagens designadas (futuras + passadas, agrupadas por status).
   - Service: `driversService.listMyTrips()` ou `tripsService.listForDriver()`.
   - Hook: `src/features/trips/hooks/useDriverTrips.ts` (padrão feature hooks como `useTrips`).
   - Componente: reaproveitar `TripCard` ou criar `DriverTripCard`.

2. **`/_protected/_driver/my-trips/$tripId`** — detalhe da viagem do motorista (rota nova).
   - Mostra dados da viagem + lista de passageiros com status de presença e pagamento.
   - Reutiliza `BookingRow` (criado em W2.1).

3. **Marcar presença** — toggle por passageiro (`PATCH /bookings/{id}/confirm-presence`). Já desbloqueado no backend; mesmo endpoint que admin usa em W2.2.

4. **Registrar pagamento** — `PATCH /organizations/{id}/payments/{id}/confirm` (ou criar `/bookings/{id}/payment` se backend preferir scope diferente). Driver marca como pago. **Verificar com backend** se driver tem permissão pra confirmar pagamento (hoje doc só lista 🛡️ ADMIN).

**Estimativa:** 2–3 dias após gap #4 desbloqueado.

---

## W5+ — Fase 2 e além

Resumo (refinar quando chegar):

- **Forgot password** (Fase 2) — depende de endpoints backend `POST /auth/forgot-password` + `/auth/reset-password`.
- **Notificações in-app** (Fase 2) — toast persistente quando trip-instance reservada muda de status.
- **React Query piloto** (Fase 2) — começar por `/_admin/trips`. Ver ADR-002.
- **Convergir padrão de fetching** (Fase 2) — passenger usa hooks, admin usa imperativo. Decidir um.
- **Filtros + busca + ordenação no marketplace público** (Fase 3).
- **Dashboard rico** (Fase 3) — receita prevista vs. realizada, taxa de ocupação, top rotas.
- **Multi-organização** (Fase 3) — encerra ADR-001. Inclui UI de troca de org + invalidação de caches.
- **Pagamento real (Pix)** (Fase 4) — substitui o mock atual.
- **LGPD** (Fase 4) — termos, política, exclusão de conta.
- **Confirmação de e-mail no signup** (Fase 4).
- **Framework de testes** (Fase 4) — ver ADR-003. Provavelmente Vitest + Testing Library.

---

## Riscos / pontos de atenção pra retomar

1. **Validar W1 manualmente em browser.** Implementação fechada, lint/build verdes, mas nenhum teste end-to-end foi feito. Antes de codar W2, abrir `npm run dev` e rodar o checklist em "Verificação end-to-end" do plano `F:\Users\rauan\.claude\plans\eu-quero-fecahr-priemiro-buzzing-knuth.md`.

2. **Working tree não-committado.** As 3 mudanças do W1 + os 4 docs (`ROADMAP/PROGRESS/BACKLOG/DECISIONS`) + esse `HANDOFF.md` estão sem commit. Recomendado fazer um commit "feat(admin): close W1 bug-fixes + planning docs" antes de entrar no notebook.

3. **`paymentMethod` pode ser `null`.** Em `BookingRow`, tratar caso `null` (mostrar "—" ou esconder a label) — bookings criados antes da feature não têm o campo.

4. **Detalhe de trip-instance ainda é magro.** Como o detalhe não traz campos enriquecidos, a tela continua precisando do `templatesService.getById`. Não regrida W1.1 só porque a lista ficou simplificada.

5. **Cancelamento dentro de 30 min.** Frontend não conhece esse limite. Em W2.2, capturar o erro do backend e mostrar mensagem amigável.

6. **`react-hooks/exhaustive-deps` warnings** em `_admin.drivers.tsx` e `_admin.templates.tsx`. Pré-existentes, não foram introduzidos hoje. Se resolver, embrulhar `loadX` em `useCallback` ou inlinear na useEffect.

---

## Comandos úteis pra retomar

```bash
# Verificar estado
git status
git diff --stat

# Subir dev server
npm run dev

# Validar
npm run lint
npm run format
npm run build
```

Linha do tempo de leitura sugerida ao retomar:

1. `docs/HANDOFF.md` (este — visão geral)
2. `docs/PROGRESS.md` (estado atual por feature)
3. `docs/BACKLOG.md` (próxima ação concreta)
4. `F:\Users\rauan\.claude\plans\eu-quero-fecahr-priemiro-buzzing-knuth.md` (plano detalhado W1+W2)
5. `docs/API_FRONTEND.md` (sempre que duvidar do contrato)
