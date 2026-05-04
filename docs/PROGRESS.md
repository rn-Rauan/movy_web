# Progress — Estado atual por área

> Snapshot vivo do que existe vs. o que falta. Atualizar a cada feature concluída. Pra **próxima ação**, ver [BACKLOG.md](./BACKLOG.md). Pra **roadmap de longo prazo**, ver [ROADMAP.md](./ROADMAP.md).

**Última atualização:** 2026-05-04 (W1 admin completo · API recebeu os ajustes críticos · W2 desbloqueado)

> Para contexto de retomada (notebook), ver [HANDOFF.md](./HANDOFF.md).

**Legenda:** `[x]` Done · `[~]` Em progresso · `[ ]` Planejado · `[-]` Adiado conscientemente (ver DECISIONS.md)

---

## Infraestrutura

- [x] Cliente HTTP com refresh deduplicado (`src/lib/api.ts`)
- [x] AuthProvider + useAuth (`src/lib/auth-context.tsx`)
- [x] RoleProvider + useRole (admin/driver/adminOrgId) (`src/lib/role-context.tsx`)
- [x] Pathless layout guards (`_protected`, `_admin`, `_driver`)
- [x] CI: format check + lint + build (`.github/workflows/ci.yml`)
- [x] Toaster global (sonner) montado no `__root`
- [-] React Query — instalado mas não usado (ver ADR-002)
- [ ] Framework de testes (ver ADR-003)
- [ ] Error handling padronizado (retry/fallback)

## Autenticação

- [x] Login (`/login`)
- [x] Signup (`/signup`)
- [x] Logout
- [x] Refresh automático em 401
- [x] Alterar senha (em `/profile`)
- [ ] Forgot password / recuperação por e-mail
- [ ] Confirmação de e-mail no signup
- [-] 2FA (Fase 4+)

## Marketplace público

- [x] Lista de trip-instances públicas (`/public/trip-instances`)
- [x] Detalhe público (`/public/trip-instances/$id`)
- [x] Perfil público de organização (`/public/organizations/$slug`)
- [ ] Filtros (data, origem, destino, preço)
- [ ] Busca textual
- [ ] Ordenação

## Passenger flow

- [x] Lista "minhas inscrições" (`/_protected/my-bookings`)
- [x] Detalhe da inscrição (`/_protected/my-bookings/$bookingId`)
- [x] Reservar viagem (`/_protected/trips/$orgId/$tripId/book`)
- [x] Cancelar inscrição (do próprio passageiro)
- [x] Lista de organizações (`/_protected/organizations`)
- [x] Lista de viagens de uma org (`/_protected/trips/$orgId`)
- [x] Detalhe de viagem (`/_protected/trips/$orgId/$tripId`)
- [x] Profile (visualizar, editar nome/email, alterar senha)
- [ ] Notificação quando viagem reservada é cancelada/alterada

## Admin

### Setup

- [x] Wizard 4 passos: criar org → template → instância → driver opcional (`/_protected/setup`)
- [x] Redireciona admin existente pra `/organizations`

### Dashboard

- [x] Cards de contagem (total, agendadas, confirmadas, finalizadas)
- [x] Lista das próximas 5 viagens
- [ ] Métricas de receita (prevista vs. realizada)
- [ ] Taxa de ocupação média
- [ ] Top rotas / cancelamentos

### Empresa (`/_protected/_admin/organization`)

- [x] Visualizar dados da organização
- [x] Editar dados da organização
- [x] Sheet de veículos (CRUD: criar, editar, desativar — placa validada com 7 caracteres)
- [x] Card de motoristas (apenas contador + link pra `/drivers` — sheet duplicado removido)
- [-] Multi-organização (ADR-001 — Fase 3)

### Viagens (`/_protected/_admin/trips`)

- [x] Listar viagens da org (origem→destino hidratados via lookup de templates)
- [x] Filtrar por status
- [x] Buscar por origem/destino (com lookup correto de template)
- [x] Criar viagem (sheet — driver+veículo obrigatórios quando `SCHEDULED`)
- [x] Detalhe de viagem (`/$tripId` — template hidratado: origem, destino, paradas)
- [x] Transição de status (DRAFT → SCHEDULED → CONFIRMED → IN_PROGRESS → FINISHED, ou CANCELED)
- [x] Atribuir motorista
- [x] Atribuir veículo
- [x] Listar passageiros (nome + parada de embarque)
- [ ] Ver presença/pagamento de cada inscrição (W2.1 — desbloqueado: match por `userId` de `TripPassengerResponse`, e `BookingResponse` agora traz `paymentMethod`)
- [ ] Cancelar inscrição individual (W2.2 — desbloqueado: doc agora explicita permissão admin/driver, com bloqueio de 30 min antes da partida)
- [ ] Hidratar `bookedCount` na lista (W2.5 — desbloqueado: backend agora popula em `GET /trip-instances/organization/{id}`)

### Templates (`/_protected/_admin/templates`)

- [x] Listar templates
- [x] Criar template (com frequência semanal quando recorrente + auto-cancel opcional)
- [x] Editar template (todos os campos, incluindo frequency, minRevenue, autoCancelOffset)
- [x] Remover template

### Motoristas (`/_protected/_admin/drivers`)

- [x] Listar motoristas
- [x] Adicionar (associar por email+CNH)
- [x] Remover (desvincular membership)
- [x] Tela única (sheet duplicado em `/organization` removido)
- [ ] Editar motorista (categoria CNH, validade, status) — W2.3
- [ ] Restaurar membership após remoção (toast "Desfazer") — W2.4

## Driver flow

- [x] Guard `_driver` redireciona não-drivers
- [~] `/_protected/_driver/my-trips` — placeholder ("em construção")
- [ ] Listar viagens designadas ao motorista logado
- [ ] Marcar presença de cada passageiro
- [ ] Marcar pagamento de cada passageiro (string: dinheiro/Pix/cartão — sem gateway nesta fase)

## Pagamento

- [x] Registrar `method` ao criar booking (string apenas, sem cobrança real)
- [ ] Atualizar status de pagamento pós-booking (driver marca como pago)
- [-] Integração com gateway real (Fase 4)
- [-] Recibo / comprovante (Fase 4)

## Notificações

- [ ] Sistema in-app (badge / toast persistente)
- [ ] Notificar passageiro quando viagem é cancelada
- [ ] Notificar passageiro quando status da viagem muda
- [-] Push notifications (Fase 3+ ou Fase 4)
- [-] E-mail transacional (Fase 4)

## LGPD / Compliance

- [ ] Termos de uso
- [ ] Política de privacidade
- [-] Tudo o resto (Fase 4)

---

## Dívida técnica conhecida

- **Padrão dual de fetching**: rotas passenger usam feature hooks (`useTrips`, `useBookings`); rotas admin usam `useState + useEffect + service.then()` direto. Convergir um padrão único.
- **Tokens em localStorage**: vetor XSS aceito no MVP. Revisitar antes de produção comercial (Fase 4).
- **`RoleContext` pega só `orgs[0]`**: ver ADR-001.
- **Detalhe de trip-instance é "magro"**: `GET /trip-instances/{id}` não retorna campos enriquecidos (template, ocupação). Frontend continua fazendo 2 requests (`templatesService.getById`). Pedir backend pra estender o detalhe ou criar `/details` análogo a `BookingDetailsResponse`.
- **`stops` não denormalizado em `TripInstanceResponse`**: detalhe da viagem precisa do template lookup só pra mostrar paradas.
- **`TokenResponse.user` sem `telephone`**: profile faz `/users/me` extra após login.
- **Sem endpoint `/trip-instances/driver/me`**: bloqueia driver flow (W4 / Fase 1 do roadmap).
- **`DELETE /drivers/{id}` parece hard-delete**: inconsistente com o padrão soft dos outros recursos.
