# Progress — Estado atual por área

> Snapshot vivo do que existe vs. o que falta. Atualizar a cada feature concluída. Pra **próxima ação**, ver [BACKLOG.md](./BACKLOG.md). Pra **roadmap de longo prazo**, ver [ROADMAP.md](./ROADMAP.md).

**Última atualização:** 2026-05-14 (rodada de polish sem backend: filtros em /my-bookings e /organizations · dashboard admin com métricas reais (ocupação, passageiros, receita prevista) · ShareButton reusável (Web Share API + clipboard fallback) plugado em detalhe de viagem e perfil público de empresa · página pública /public/plans · busca + filtros (data + turno) no perfil público de empresa)

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
- [x] Error handling padronizado — `handleApiError` plugado em admin (drivers, organization, trips, signup, payments, templates); `bookingCancelErrorMessage` em passenger e admin

## Autenticação

- [x] Login (`/login`)
- [x] Signup B2C (`/signup` — usuário comum)
- [x] Signup B2B (`/signup/empresa` — cria conta + organização em uma chamada via `POST /auth/register-organization`)
- [x] Logout
- [x] Refresh automático em 401
- [x] Alterar senha (em `/profile`)
- [x] Senha mínima 8 caracteres no signup
- [ ] Forgot password / recuperação por e-mail
- [ ] Confirmação de e-mail no signup
- [-] 2FA (Fase 4+)

## Marketplace público

- [x] Lista de trip-instances públicas (`/public/trip-instances`)
- [x] Detalhe público (`/public/trip-instances/$id`) — com botão "Compartilhar" (Web Share API + clipboard fallback via `ShareButton`)
- [x] Perfil público de organização (`/public/organizations/$slug`) — busca + filtros (data + turno) reusando `lib/date-filters` + botão "Compartilhar" no header
- [x] Filtros (turno, intervalo de datas) — `usePublicTrips` centraliza search + shift + dateRange + sortBy
- [x] Busca textual (origem, destino, organização)
- [x] Ordenação (data ↑↓, preço ↑↓)
- [x] Página pública de planos (`/public/plans`) — comparativo de planos via `plansService.list()`, "Mais popular" no segundo, CTA pra `/signup/empresa`. Link adicionado na landing page.

## Passenger flow

- [x] Lista "minhas inscrições" (`/_protected/my-bookings`) — busca por origem/destino/empresa + filtro por status (Ativas/Canceladas) com pills + empty state com "Limpar filtros". `useBookings` agora expõe `filtered`/`hasActiveFilters`.
- [x] Detalhe da inscrição (`/_protected/my-bookings/$bookingId`)
- [x] Reservar viagem (`/_protected/trips/$orgId/$tripId/book`) — paradas selecionáveis via `<Select>` com validação anti-duplicado
- [x] Cancelar inscrição (do próprio passageiro) — mensagens PT-BR estáveis via `bookingCancelErrorMessage`
- [x] Lista de organizações (`/_protected/organizations`) — busca por nome/slug; `useOrganizations` expõe `filtered`
- [x] Lista de viagens de uma org (`/_protected/trips/$orgId`)
- [x] Detalhe de viagem — tela única em `/public/trip-instances/$id` (funciona logado e deslogado; intermediário `/_protected/trips/$orgId/$tripId` removido por ser duplicado)
- [x] Guard contra inscrição duplicada (`useUserBookingForTrip`) — botão "Inscrever-se" vira "Ver inscrição" e `/book` redireciona se já há booking ATIVO
- [x] Profile (visualizar, editar nome/email, alterar senha)
- [ ] Notificação quando viagem reservada é cancelada/alterada

## Admin

### Setup

- [x] Wizard 4 passos: criar org → template → instância → driver opcional (`/_protected/setup`)
- [x] Redireciona admin existente pra `/organizations`

### Dashboard

- [x] Cards de métricas (viagens ativas / próximos 7 dias / passageiros inscritos / ocupação média %)
- [x] Card destacado de receita prevista (soma de `bookedCount × priceOneWay` em viagens não canceladas/finalizadas)
- [x] Lista das próximas 5 viagens ordenadas por data — itens clicáveis pra `/trip/$tripId`, mostram ocupação % e alerta visual "Sem motorista"
- [ ] Métricas de receita realizada (depende de payments confirmados)
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
- [x] Filtrar por intervalo de data (hoje · amanhã · esta semana · próxima semana) — pills com utilitário `lib/date-filters`
- [x] Buscar por origem/destino (com lookup correto de template)
- [x] Criar viagem (sheet — driver+veículo obrigatórios quando `SCHEDULED`)
- [x] Detalhe de viagem (`/$tripId` — template hidratado: origem, destino, paradas)
- [x] Transição de status (DRAFT → SCHEDULED → CONFIRMED → IN_PROGRESS → FINISHED, ou CANCELED)
- [x] Atribuir motorista
- [x] Atribuir veículo
- [x] Listar passageiros (nome + parada de embarque)
- [x] Ver presença/pagamento de cada inscrição (W2.1 — `BookingRow` mostra status, `enrollmentType`, `paymentMethod`, `recordedPrice`)
- [x] Marcar presença (W2.2 — `PATCH /bookings/{id}/confirm-presence`)
- [x] Cancelar inscrição individual (W2.2 — admin pode cancelar; bloqueio de 30 min/status terminal vem do backend)
- [x] Hidratar `bookedCount` na lista e dashboard (W2.5)

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
- [x] Editar motorista (categoria CNH, validade, status) — W2.3
- [x] Restaurar membership após remoção (toast "Desfazer") — W2.4

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

## Plans, Subscriptions & Payments (W3)

- [x] Card de plano em `/_admin/organization` — plano atual, preço, validade, uso vs. limite (Veículos, Motoristas, Viagens este mês) — W3.1
- [x] Handler genérico de 403 limite-de-plano (`src/lib/handle-error.ts`) — toast com action "Ver planos" — usa `errorCode` estável (`NO_ACTIVE_SUBSCRIPTION_FORBIDDEN`, `*_PLAN_LIMIT_*`) — W3.4
- [x] Tela `/_admin/payments` — lista paginada com "Carregar mais", badges (`PENDING`/`CONFIRMED`/`FAILED`), formatação BRL — W3.2
- [x] Modal de upgrade — `UpgradePlanDialog` em `_admin.organization.tsx`: lista planos via `plansService.list()`, RadioGroup, troca/cria subscription via `POST /organizations/{id}/subscriptions` ou `PATCH .../{id}` — W3.3
- [x] Plan-usage em uma chamada — `subscriptionsService.getPlanUsage()` consome `GET /organizations/{id}/plan-usage`; `PlanCard` mostra Veículos / Motoristas / Viagens este mês alinhado com `PlanLimitService` do backend — W3.5
- [x] `handleApiError` plugado em `_admin.payments` e `_admin.templates` — W3.6
- [x] `bookingCancelErrorMessage` em `useBookingDetail` (passenger) — W3.7

## Landing & Onboarding

- [x] Landing page em `/` (redireciona admin → `/dashboard`, user → `/public/trip-instances`)
- [x] Signup B2C separado (`/signup`)
- [x] Signup B2B (`/signup/empresa`) — formulário único, cria conta + organização via `POST /auth/register-organization`

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
- **`TokenResponse.user` sem `telephone`**: profile faz `/users/me` extra após login.
- **Sem endpoint `/trip-instances/driver/me`**: bloqueia driver flow (W4 / Fase 1 do roadmap).
- **`DELETE /drivers/{id}` parece hard-delete**: inconsistente com o padrão soft dos outros recursos.
- **`useUserBookingForTrip` faz `listForUser` completo**: client-side filtering pra detectar duplicata. Funciona, mas se a lista crescer, considerar endpoint dedicado (ex: `GET /bookings/by-trip/{tripId}/mine`) ou cache.

## Resolvido em 2026-05-14

- Filtros em `/_protected/my-bookings`: busca + pills de status (ACTIVE/INACTIVE) + empty state com "Limpar filtros". Hook `useBookings` reescrito pra gerenciar filter state.
- Busca em `/_protected/organizations`: hook `useOrganizations` reescrito.
- Dashboard admin com métricas reais: 4 cards (viagens ativas, próximos 7 dias, passageiros, ocupação %) + card destacado de receita prevista + lista clicável de próximas viagens.
- `ShareButton` reusável (`src/components/ShareButton.tsx`) — Web Share API quando disponível, clipboard como fallback, estado visual "copiado" 2s.
- Detalhe público da viagem (`/public/trip-instances/$id`) e perfil público da empresa (`/public/organizations/$slug`) ganharam botão Compartilhar.
- Perfil público da empresa também ganhou input de busca + pills de intervalo de data (reusando `lib/date-filters`).
- Nova rota pública `/public/plans` — comparativo de planos via `plansService.list()`, segundo plano destacado como "Mais popular". Link na landing page (`index.tsx`).

## Resolvido em 2026-05-10

- ~~B1 "Ver detalhes" pedia role de admin~~: parent `_protected.trips.$orgId.tsx` não tinha `<Outlet />`; ao navegar pro filho, disparava o fetch admin-only e dava 403. Adicionado Outlet pattern (renderiza filhos quando pathname é filho), e a tela duplicada `_protected.trips.$orgId.$tripId.tsx` foi removida (consolidada em `/public/trip-instances/$id`).
- ~~B2 Viagens aparecem como "lotadas"~~: `/public/organizations/$slug` usava fallback `?? 0`; trocado por `?? trip.totalCapacity` (endpoint público não retorna `availableSlots`).
- ~~Bug de inscrição duplicada~~: `useUserBookingForTrip` checa booking ATIVO do usuário; UI vira "Ver inscrição" e `/book` redireciona/desabilita submit.
- ~~Form de booking pedia digitação livre~~: trocado por `<Select>` listando as paradas da viagem (origem + stops + destino), com opção espelhada desabilitada no outro select e validação Zod `embarque !== desembarque`.
- ~~`useTripDetail` (passenger) usava `getPublicById` magro~~: agora aceita `{ authenticated: true }` que rota o fetch pra `getById` (JWT, enriquecido).
- ~~W3.6 `handleApiError` faltando em payments/templates~~: plugado.
- ~~W3.7 cancel de booking do passenger sem mensagens PT-BR~~: `useBookingDetail` usa `bookingCancelErrorMessage`.
- ~~Warnings `react-hooks/exhaustive-deps` em drivers/templates~~: `loadDrivers`/`loadTemplates` viraram `useCallback([adminOrgId])`.

## Resolvido em 2026-05-09

- ~~Detalhe de trip-instance "magro"~~: backend agora retorna `template`, `bookedCount`, `availableSlots` em `GET /trip-instances/{id}`. Admin removeu o `templatesService.getById` extra.
- ~~Lista admin de trips precisava de lookup de templates~~: `GET /trip-instances/organization/{id}` agora vem com `departurePoint`, `destination`, `bookedCount` denormalizados.
- ~~Mensagem crua de erro ao cancelar booking~~: backend padronizou `errorCode` (`BOOKING_CANCEL_WINDOW_CLOSED_BAD_REQUEST` etc); helper `bookingCancelErrorMessage` em `lib/handle-error.ts` mapeia pra PT-BR.
- ~~Plan-usage calculado localmente~~: `GET /organizations/{id}/plan-usage` é a nova source-of-truth do `PlanCard`.
