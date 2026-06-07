# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# Movy Web — Documentação do Projeto

## Visão Geral

SaaS de transporte — sistema de gerenciamento e reserva de viagens.

**Stack:** React 19 · TanStack Router (file-based routing) · TanStack React Start · Tailwind CSS · shadcn/ui · Zod

**API Backend:** `VITE_API_URL` (DDD + Clean Architecture)

---

## Comandos de Desenvolvimento

```bash
npm run dev          # servidor Vite em modo dev
npm run build        # build de produção
npm run build:dev    # build em modo development
npm run lint         # ESLint
npm run format       # Prettier (auto-fix)
```

**Setup de ambiente:** copie `.env.example` para `.env` e ajuste `VITE_API_URL` (padrão: `http://localhost:5701`).

**Sem framework de testes** configurado no projeto.

---

## Configurações Importantes

- **Path alias:** `@/*` → `src/*` (configurado em tsconfig.json e Vite)
- **Vite:** usa `@lovable.dev/vite-tanstack-config` — **não adicionar plugins manualmente** ao `vite.config.ts` (causará duplicação e quebra)
- **shadcn/ui:** adicionar componentes via `npx shadcn@latest add <componente>` — nunca editar `src/components/ui/` diretamente

---

## Papéis do Sistema

| Role   | Capacidades                                                   |
| ------ | ------------------------------------------------------------- |
| User   | Ver viagens públicas, reservar viagens, gerenciar inscrições  |
| Driver | Extensão de User — confirmar presença, marcar pagamentos      |
| Admin  | Criar e gerenciar organização, templates, viagens, motoristas |

Roles detectados em runtime via `RoleContext` após autenticação.

---

## Contextos de Acesso

1. **Público** (`/public/*`) — sem autenticação
2. **Usuário autenticado** (`/_protected/*`) — guard em `_protected.tsx`
3. **Admin** (`/_protected/_admin/*`) — guard adicional em `_protected/_admin.tsx` (redireciona não-admins para `/`)
4. **Driver** (`/_protected/_driver/*`) — guard adicional em `_protected/_driver.tsx` (redireciona não-drivers para `/`)
5. **Onboarding** (`/setup`) — exceção: aberto a usuários autenticados sem org (transforma user em admin); redireciona admins existentes para `/organizations`

### Como adicionar uma rota guardada por role

Use o padrão flat naming com prefixo pathless. A URL fica sem o prefixo do guard — `_protected._admin.drivers.tsx` vira URL `/drivers`, `_protected._driver.my-trips.tsx` vira URL `/my-trips`. O guard do layout pai (`_admin.tsx` ou `_driver.tsx`) verifica o role antes de renderizar.

```tsx
// src/routes/_protected._admin.drivers.tsx (admin only)
export const Route = createFileRoute("/_protected/_admin/drivers")({
  component: DriversPage,
});

// src/routes/_protected._driver.my-trips.tsx (driver only)
export const Route = createFileRoute("/_protected/_driver/my-trips")({
  component: DriverTripsPage,
});
```

**Importante:** o arquivo do layout (`_admin.tsx` / `_driver.tsx`) precisa ter pelo menos uma rota filha — senão TanStack Router trata o layout como rota leaf e gera conflito de URL com `/`.

---

## Estrutura de Rotas

```
/ → landing page (não-autenticado) ou redirect inteligente por role
/login → autenticação (com link "Esqueci a senha")
/forgot-password → solicita link de recuperação (anti-enumeração — sempre mesma confirmação)
/reset-password?token=… → redefine senha, auto-login via setSession + redirect /
/verify-email?token=… → verifica email, refresh JWT, redirect /
/signup/ → cadastro de usuário comum (B2C)
/signup/empresa → cadastro empresa + admin em uma chamada (B2B)

/public/trip-instances/       → marketplace de viagens (agrupado por rota/template; busca + filtros: data/turno/ordenação)
/public/trip-instances/$id/   → detalhe público (ShareButton + datas alternativas da mesma rota via useTripDates)
/public/organizations/        → diretório público de organizações ativas (usePublicOrganizations + busca)
/public/organizations/$slug/  → perfil público da organização (busca + filtros + ShareButton)
/public/plans/                → comparativo público de planos (CTA → /signup/empresa)

/_protected/                  ← layout pathless com guard de auth
  my-bookings/                → inscrições do usuário (busca + filtro por status)
  my-bookings/$bookingId/     → detalhe da inscrição
  bookings-success/$bookingId/ → tela de confirmação pós-inscrição (com confetti)
  organizations/              → lista de organizações (busca)
  trips/$orgId/               → viagens de uma organização (lista; sem tela de detalhe própria)
  trips/$orgId/$tripId/book/  → formulário de inscrição (paradas via Select)
  profile/                    → perfil e senha do usuário autenticado
  setup/                      → wizard de criação de organização (admin)

  profile/driver/             → opt-in self-service de perfil de motorista (CNH + categorias múltiplas + validade)

  trip/$tripId/               → detalhe da viagem — compartilhada admin+driver via prop `role` (admin: assignment + todas transições; driver: só IN_PROGRESS/FINISHED, sem edit).
                                 Gestão de inscrições inline: por passageiro (BookingRow) confirma presença (bookingsService.confirmPresence) e pagamento (paymentsService.confirm), além de cancelar — via useAdminTripDetail.

  _admin/ (guard: isAdmin)
    dashboard/                → métricas (ativas/próximos 7 dias/passageiros/ocupação%) + receita prevista + próximas viagens
    trips/                    → CRUD de instâncias de viagem
    templates/                → CRUD de templates de rota + dialog de geração manual de instâncias
    drivers/                  → gestão de motoristas da organização
    vehicles/                 → CRUD de veículos da organização
    organization/             → configurações + card de plano (uso vs. limite) + SchedulingConfigCard
    subscription/             → histórico de assinaturas da org (Subscription: plano, status, validade)
    financial/                → relatório mensal (receita confirmada/pendente/perdida, viagens por status, top rotas, export CSV) — acessado via link no dashboard

  _driver/ (guard: isDriver)
    my-trips/                 → lista de viagens atribuídas ao motorista (GET /trip-instances/driver/me)
```

**Nota sobre rotas-pai com filho:** quando uma rota como `profile.tsx` ganha uma filha (`profile.driver.tsx`), o TanStack passa a tratar `profile.tsx` como layout. Pra evitar que o conteúdo do pai engula a filha, o componente precisa retornar `<Outlet />` quando `location.pathname` é da filha — ver `_protected.trips.$orgId.tsx:14-22` e `_protected.profile.tsx`.

### Guard Centralizado

`src/routes/_protected.tsx` — pathless layout que verifica autenticação uma vez para todas as rotas aninhadas. Elimina `useEffect` duplicado em cada rota.

---

## Arquitetura de Features

O frontend segue uma arquitetura de **feature modules**, equivalente à camada de aplicação do backend Clean Architecture.

```
src/
├── routes/                  TanStack Router file-based routes (thin controllers)
│   ├── __root.tsx            Providers: AuthProvider → RoleProvider
│   ├── _protected.tsx        Pathless auth guard layout
│   └── ...
│
├── features/                Módulos de domínio (hooks + components por feature)
│   ├── trips/
│   │   ├── hooks/
│   │   │   ├── usePublicTrips.ts    Busca + filtro do marketplace público
│   │   │   ├── useTrips.ts          Lista por orgId ou slug
│   │   │   ├── useTripDetail.ts     Detalhe + disponibilidade de inscrição
│   │   │   ├── useTripPassengers.ts Lista passageiros (silencia 403 se não-membro)
│   │   │   ├── useAdminTripDetail.ts Detalhe admin + transições de status/assignment
│   │   │   ├── useTripCreateOptions.ts Opções (templates/drivers/vehicles) p/ criar instância
│   │   │   ├── useTripDates.ts      Saídas irmãs da mesma rota (mesmo template) → datas alternativas no detalhe
│   │   │   ├── useTripsAvailability.ts Ocupação real por viagem (GET /bookings/availability/{id}, só logado) p/ a lista pública
│   │   │   └── useDriverTrips.ts    Viagens atribuídas ao motorista (GET /trip-instances/driver/me)
│   │   └── components/
│   │       ├── TripCard.tsx         Card compacto (lista protegida)
│   │       ├── TripsList.tsx        Lista com links para detalhe
│   │       ├── PublicTripCard.tsx   Card rico do marketplace (buttons ver empresa/viagem)
│   │       └── TripDetailView.tsx   Detalhe completo + botão de inscrição
│   │
│   ├── bookings/
│   │   ├── hooks/
│   │   │   ├── useBookings.ts       Lista inscrições do usuário
│   │   │   ├── useBookingDetail.ts  Detalhe + cancel()
│   │   │   ├── useBookingForm.ts    Form state + prefill() + submit()
│   │   │   └── useUserBookingForTrip.ts Inscrição do user p/ uma viagem (gate "Ver inscrição" no detalhe público)
│   │   └── components/
│   │       ├── BookingCard.tsx
│   │       ├── BookingsList.tsx     Lista com empty state
│   │       ├── BookingRow.tsx       Linha de passageiro no detalhe da viagem (admin/driver): chips "Marcar presença" + pgto + cancelar; risca cancelados
│   │       └── BookingDetailView.tsx Detalhe + AlertDialog de cancelamento
│   │
│   ├── organizations/
│   │   ├── hooks/
│   │   │   ├── useOrganizations.ts  Lista organizações ativas (protegido)
│   │   │   └── usePublicOrganizations.ts Diretório público (GET /public/organizations) + busca; ordena por nome
│   │   └── components/
│   │       ├── CompanyCard.tsx      Renderiza contato/endereço quando presentes
│   │       └── OrgsList.tsx         Lista com links para trips
│   │
│   ├── drivers/                Self-service (useMyDriver, DriverProfileForm, EditMyDriverDialog) + admin (DriverCard sem edit — só remove)
│   │   ├── components/
│   │   │   ├── DriverProfileForm.tsx   Form usado em create e edit (schema factory makeDriverSchema com initialExpiresAt)
│   │   │   ├── EditMyDriverDialog.tsx  Wrapper BottomSheet do form modo edit (chama PATCH /drivers/me)
│   │   │   ├── CnhCategoriesField.tsx  Grid de checkboxes A–E (multi-categoria)
│   │   │   ├── DriverDisplayName.tsx   Renderiza nome via useDriverName (cache global); fallback "Motorista"
│   │   │   ├── DriverCard.tsx          Card admin com badge de status + botão remover (sem pencil — admin não edita CNH)
│   │   │   ├── AddDriverDialog.tsx     Lookup por email+CNH (POST /memberships/driver)
│   │   │   └── RemoveDriverDialog.tsx  Soft-remove via DELETE /memberships
│   │   ├── hooks/
│   │   │   ├── useMyDriver.ts          GET /drivers/me com notFound flag (404 ≠ erro)
│   │   │   ├── useMyDriverOrgs.ts      Orgs onde o user tem role DRIVER (sem endpoint dedicado — itera /organizations/me + /memberships/me/role/{orgId}, igual RoleContext)
│   │   │   ├── useDriverName.ts        Cache global + dedup inflight pra /drivers/{id}/name
│   │   │   └── useDrivers.ts           Lista por org
│   │   └── lib/
│   │       └── driver-display.ts       driverDisplayString(d) — versão string-only (pra textValue de SelectItem)
│   ├── templates/              CRUD admin de templates de rota + GenerateInstancesDialog
│   ├── vehicles/               CRUD admin de veículos (hooks/ + components/)
│   ├── scheduling/             SchedulingConfigCard + useSchedulingConfig (toggle + daysAhead — cron é global no backend)
│   ├── subscriptions/          Histórico de assinaturas da org (useSubscriptions + SubscriptionCard/List) — resolve planId→Plan via /public/plans
│   │                           (payments.service segue existindo p/ tarifas de viagem, consumido só por financial/dashboard — sem tela própria)
│   └── financial/              Relatório financeiro admin — `useFinancialReport(orgId, monthStart)` agrega payments + trip-instances no client (sem endpoint dedicado no backend); `useOrgRevenue` expõe receita prevista p/ o dashboard
│
├── services/                Abstração de chamadas de API (repository pattern)
│   ├── trips.service.ts
│   ├── bookings.service.ts
│   ├── organizations.service.ts
│   ├── drivers.service.ts
│   ├── templates.service.ts
│   ├── vehicles.service.ts
│   ├── scheduling.service.ts
│   ├── plans.service.ts
│   ├── payments.service.ts
│   └── subscriptions.service.ts
│
├── components/
│   ├── ui/                  shadcn/ui — não modificar diretamente
│   ├── layout/
│   │   ├── AppShell.tsx     Layout base (header + BottomNav)
│   │   └── BottomNav.tsx    Tabs por role (passenger / driver / admin) — tab "Perfil" em todos
│   ├── feedback/
│   │   ├── LoadingList.tsx  Skeletons de lista
│   │   ├── ErrorCard.tsx    Card de erro
│   │   └── EmptyState.tsx   Estado vazio com action opcional
│   ├── visual/             Primitivas de apresentação reutilizáveis (fora do shadcn/ui)
│   │   ├── BottomSheet.tsx  Sheet de baixo (Radix Dialog) — title/description/footer/sheetTop; padrão p/ forms e edição
│   │   ├── KpiCard.tsx      Card de métrica (dashboard)
│   │   ├── StatusPill.tsx   Badge de status
│   │   ├── Timeline.tsx · RouteVisual.tsx  Visuais de viagem/rota
│   │   └── UsageBar.tsx · OccupancyBar.tsx Barras de uso/ocupação
│   └── ShareButton.tsx      Web Share API + clipboard fallback
│
└── lib/
    ├── api.ts               Cliente HTTP com auto-refresh de token
    ├── auth-context.tsx     AuthProvider + useAuth()
    ├── role-context.tsx     RoleProvider + useRole()
    ├── types.ts             Tipos TypeScript do domínio
    ├── format.ts            Helpers de formatação (datas, status, preços)
    ├── date-filters.ts      DateRange + isInDateRange — compartilhado entre marketplaces
    ├── timezone.ts          brHourToUtc / utcHourToBr — converte HH:mm BR↔UTC (UTC−3, sem DST)
    ├── handle-error.ts      handleApiError + bookingCancelErrorMessage + TRIP_SCHEDULING_MESSAGES
    └── utils.ts
```

### Padrão de Feature Module

Cada feature tem hooks (casos de uso) e components (apresentação). As rotas são thin controllers:

```tsx
// Rota thin — ~15 linhas
function TripsPage() {
  const { orgId } = Route.useParams();
  const { slug } = Route.useSearch();
  const { trips, loading, error } = useTrips({ orgId, slug });
  return (
    <AppShell title="Viagens" back>
      {loading ? (
        <LoadingList />
      ) : error ? (
        <ErrorCard message={error} />
      ) : (
        <TripsList trips={trips ?? []} orgId={orgId} />
      )}
    </AppShell>
  );
}
```

**Para adicionar uma nova feature:** criar `features/<nome>/hooks/use<Feature>.ts` + `features/<nome>/components/<Feature>View.tsx`, depois referenciar na rota.

---

## Autenticação e Roles

**Tokens:** localStorage (`tt_access`, `tt_refresh`, `tt_user`)

**Auto-refresh:** `api.ts` intercepta 401 e renova token automaticamente (com deduplicação).

**useAuth()** → `{ user, isAuthenticated, loading, login, signup, setSession, logout, refreshUser }`

`setSession(authResponse)` persiste o `TokenResponse` (de `/auth/reset-password` ou `/auth/refresh`) e ativa o user no contexto — use em fluxos de auto-login (reset de senha, verify-email).

**useRole()** → `{ isAdmin, isDriver, hasDriverProfile, adminOrgId, roleLoading, refetchRole }`

- `isAdmin`: user tem role ADMIN em alguma organização (itera `/organizations/me` + `/memberships/me/role/{orgId}` em cada uma)
- `hasDriverProfile`: user tem perfil de driver criado (`GET /drivers/me` 200). Habilita só `/profile/driver`.
- `isDriver`: `hasDriverProfile` **E** tem membership ativa de role `DRIVER` em alguma org. Habilita tab "Como motorista" + rotas sob `_driver/`.
- `adminOrgId`: ID da primeira org onde é admin

> A semântica `hasDriverProfile ≠ isDriver` evita que qualquer user que ativou perfil saia tendo acesso às funcionalidades de motorista — só quem foi vinculado por um admin via `POST /memberships/driver` vê a UI de driver. Chame `refetchRole()` depois de criar/editar driver pra atualizar BottomNav sem reload.

---

## Navegação por Role

`BottomNav.tsx` mostra tabs diferentes por role (precedência: admin > driver > passenger):

- **Passenger:** Explorar · Empresas · Inscrições · Perfil
- **Driver:** Explorar · Como motorista · Inscrições · Perfil
- **Admin:** Dashboard · Viagens · Templates · Empresa · Perfil

`index.tsx` redireciona:

- Não autenticado → mostra `LandingPage` (CTAs pra `/login`, `/signup`, `/signup/empresa`)
- Admin → `/_protected/dashboard`
- Usuário → `/public/trip-instances`

---

## Serviços de API

Usar sempre os services — nunca `api()` direto nas rotas ou componentes. A única exceção é `profile.tsx`, que chama `api("/users/me")` diretamente por não ter service de usuário.

```typescript
// trips.service.ts
tripsService.listPublic({ organizationId?, page?, limit? }); // marketplace; passa auth:true só p/ anexar token quando houver (anônimo não toma 401)
tripsService.listByOrgId(orgId);
tripsService.listBySlug(slug); // público, sem auth
tripsService.getPublicById(id);
tripsService.listPassengers(tripId);
tripsService.listForDriver(page?, limit?, status?); // GET /trip-instances/driver/me — driver self-service, retorna [] se sem perfil/inactive

// bookings.service.ts
bookingsService.listForUser();
bookingsService.getDetails(bookingId);
bookingsService.checkAvailability(tripId);
bookingsService.create({ tripInstanceId, enrollmentType, boardingStop, alightingStop, method });
bookingsService.cancel(bookingId);

// organizations.service.ts
organizationsService.listActive();
organizationsService.listPublic(page?, limit?); // GET /public/organizations — anônimo; lista TODAS as orgs ativas (mesmo sem viagens públicas) com contato/endereço
organizationsService.listMine();
organizationsService.getBySlug(slug);           // GET /public/organizations/{slug} — perfil público
organizationsService.update(id, data);

// drivers.service.ts
driversService.createMe({ cnh, cnhCategories, cnhExpiresAt }); // self-service POST /drivers (cnhCategories: ("A"|"B"|"C"|"D"|"E")[])
driversService.getMe();                                        // GET /drivers/me
driversService.updateMe({ cnhCategories?, cnhExpiresAt? });    // self-service PATCH /drivers/me (cnh e status são admin-only)
driversService.listByOrgId(orgId);
driversService.lookup(email, cnh);
driversService.addToOrg(userEmail, cnh);
driversService.removeMembership(userId, roleId, orgId);

// templates.service.ts
templatesService.listByOrgId(orgId);
templatesService.getById(id);
templatesService.create(orgId, data);   // departureTimeOfDay/arrivalTimeOfDay (UTC HH:mm), defaultCapacity, opcionalmente defaultDriverId + defaultVehicleId (UUID|null)
templatesService.update(id, data);      // PUT — passe defaultDriverId/defaultVehicleId = null pra limpar
templatesService.remove(id);
templatesService.generateInstances(id, daysAhead?); // POST /trip-templates/{id}/generate-instances → { created, skipped, failed }

// vehicles.service.ts
vehiclesService.listByOrgId(orgId);
vehiclesService.create(orgId, data);
vehiclesService.update(id, data);
vehiclesService.deactivate(id);

// drivers.service.ts (admin-only — endpoint ainda exposto no service, mas SEM UI que chame; admin não edita mais dados de driver)
// driversService.update(id, { cnh?, cnhCategories?, cnhExpiresAt?, status? }); // disponível mas não usado pela UI
driversService.restoreMembership(userId, roleId, orgId);

// bookings.service.ts (continuação — adicionados em W2)
bookingsService.listByTripInstance(tripId);
bookingsService.confirmPresence(bookingId);  // PATCH — marca presença do passageiro no detalhe da viagem (admin/driver)

// plans.service.ts
plansService.list();      // GET /public/plans — anônimo, paginado
plansService.getById(id); // GET /plans/{id} — JWT

// auth.service.ts
authService.forgotPassword(email);          // POST /auth/forgot-password — sempre 204 (anti-enumeração)
authService.resetPassword(token, newPassword); // POST /auth/reset-password — retorna TokenResponse (passe pro AuthContext.setSession)
authService.verifyEmail(token);             // POST /auth/verify-email — 204; chame authService.refresh depois pra atualizar emailVerifiedAt no JWT
authService.refresh(refreshToken);          // POST /auth/refresh

// payments.service.ts
paymentsService.list(orgId, page?, size?);
paymentsService.getById(orgId, id);
paymentsService.confirm(orgId, paymentId); // PATCH .../confirm — marca pagamento COMPLETED (botão "Pgto. pendente" no BookingRow)
paymentsService.fail(orgId, paymentId);    // PATCH .../fail

// subscriptions.service.ts
subscriptionsService.getActive(orgId);
subscriptionsService.list(orgId);
subscriptionsService.create(orgId, planId);
subscriptionsService.changePlan(orgId, subscriptionId, planId);
subscriptionsService.getPlanUsage(orgId);   // GET /organizations/{id}/plan-usage — fonte única do PlanCard

// scheduling.service.ts
schedulingService.getConfig(orgId);                  // GET /organizations/{id}/scheduling-config
schedulingService.updateConfig(orgId, patch);        // PATCH parcial (enabled, daysAhead) — cron expressions removidos do contrato em 22/05/2026
```

**Tratamento de erros:** `src/lib/handle-error.ts` exporta:

- `handleApiError(err, fallbackMsg)` — detecta 403 limite-de-plano via `errorCode` estável (`NO_ACTIVE_SUBSCRIPTION_FORBIDDEN`, `*_PLAN_LIMIT_*`) com toast + action "Ver planos" → `/organization`. Também mapeia `errorCode`s de trip-scheduling (`INVALID_TRIP_TIME_OF_DAY_FORMAT`, `INVALID_TRIP_TEMPLATE_MISSING_SCHEDULE`, etc.) e o mapa `DRIVER_AND_AUTH_MESSAGES` (driver/vehicle access, CNH validation, payment driver, reset/verify token expirado) pra mensagens em PT-BR. Plugar nas rotas que fazem mutações sujeitas a limite ou ao contrato de scheduling/driver.
- `bookingCancelErrorMessage(err)` — mapeia `errorCode` de cancelamento (`BOOKING_CANCEL_WINDOW_CLOSED_BAD_REQUEST`, `BOOKING_TRIP_TERMINAL_BAD_REQUEST`, `BOOKING_ALREADY_INACTIVE_BAD_REQUEST`) pra mensagens em PT-BR.

`ApiError` (em `lib/api.ts`) carrega `status`, `message`, `data` e `errorCode` (campo `error` do payload). Sempre prefira `errorCode` a parsing de `message` — é o contrato estável documentado em `docs/API_FRONTEND.md`.

**Padrão `notFound` em hooks (404 ≠ erro):** quando um recurso pode legitimamente não existir ainda (ex: `GET /drivers/me` retorna 404 pra user sem perfil; `GET /organizations/{id}/scheduling-config` pra orgs legacy), o hook deve separar 404 num flag `notFound: true` sem disparar toast. Ver `useMyDriver` e `useSchedulingConfig`. Se o backend não padroniza 404 e retorna a mensagem dentro de um 400/500, usar heurística defensiva no hook (ver `isDriverNotFound` em `useMyDriver.ts`).

---

## Caminho de Booking (Usuário)

1. Browse `/public/trip-instances`
2. Detalhe `/public/trip-instances/$id` (tela única de detalhe — funciona logado e deslogado)
   - Deslogado: botão "Entrar para reservar" → `/login`
   - Logado sem inscrição: botão "Inscrever-se" → `/_protected/trips/$orgId/$tripId/book`
   - Logado já inscrito: botão "Ver inscrição" → `/_protected/my-bookings/$bookingId` (guard via `useUserBookingForTrip`)
3. Form de inscrição (`/book`): paradas de embarque/desembarque via `<Select>` (lista as paradas da viagem; impede selecionar a mesma)
4. Confirmação → `/_protected/bookings-success/$bookingId` (confetti)
5. Voltar pra `/_protected/my-bookings`

---

## Fluxo Admin (Setup)

1. Cadastro → Login
2. `/_protected/setup` → wizard 4 passos:
   - Passo 1: Criar organização (`POST /auth/setup-organization`)
   - Passo 2: Criar template de viagem (`POST /trip-templates/organization/{orgId}`) — campos obrigatórios: `departureTimeOfDay` + `arrivalTimeOfDay` (admin digita em BR, FE converte pra UTC via `brHourToUtc`) + `defaultCapacity`.
   - Passo 3: Criar instância de viagem (`POST /trip-instances/organization/{orgId}`) — body atual usa **`departureDate` (YYYY-MM-DD)**; o servidor combina com o time-of-day do template. **Não enviar mais `departureTime`/`arrivalEstimate`** (breaking change).
   - Passo 4: Associar motorista (`POST /memberships/driver`) — opcional
3. Após setup → `/_protected/organizations`

---

## Agendamento automático (Trip Scheduling)

O backend gera `TripInstance`s automaticamente a partir de templates recorrentes e cancela viagens de baixa receita. O cron é **global** (NestJS `@Cron()` resolve em module load — não dá pra ter expressões por org):

- **Geração:** `0 2 * * *` UTC = **23:00 BR** todo dia.
- **Auto-cancel:** a cada **15 minutos UTC**.

A única configuração por org é `enabled` (master switch dos dois jobs) e `daysAhead` (1–90 — quantos dias à frente a geração cria instâncias por execução). `generationCron`/`autoCancelCron` foram removidos do contrato em 22/05/2026.

- **Configuração por org** (`SchedulingConfigCard` em `/organization`): toggle `enabled` + `daysAhead`. O card mostra os horários fixos como info, sem inputs editáveis.
- **Geração manual** (`GenerateInstancesDialog` em `TemplateCard`): visível só pra templates `isRecurring && status === "ACTIVE"`. Toast mostra `${created} criadas · ${skipped} ignoradas · ${failed} falhas`.
- **Time-of-day em UTC**: o backend armazena `departureTimeOfDay`/`arrivalTimeOfDay` como UTC HH:mm. Inputs e displays sempre em horário de Brasília — converter via `brHourToUtc`/`utcHourToBr` em `lib/timezone.ts`. Nunca expor HH:mm UTC literal na UI.
- **Display de ISO timestamps:** `formatDateTime`/`formatFullDate` em `lib/format.ts` usam `timeZone: BR_TZ` (America/Sao_Paulo) — qualquer `Date.toLocaleString()` ad-hoc deve seguir o mesmo padrão ou passar pelo helper.
- **Datas calendário** (ex.: `cnhExpiresAt`, `departureDate`): usar `formatDateOnly(input)` em `lib/format.ts` — parseia "YYYY-MM-DD" sem aplicar timezone, evitando off-by-one.

---

## Driver self-service

`POST /drivers` (JWT) deixa o próprio usuário criar perfil de motorista — mas só admin pode vinculá-lo a uma org via `POST /memberships/driver`. Por isso a UI separa:

- `/profile/driver` (rota sob `_protected/`, NÃO sob `_driver/`):
  - **Modo create** (sem perfil): form com alert amarelo + checkbox obrigatório "Confirmo que vou trabalhar para uma organização cadastrada".
  - **Modo view** (perfil existente): Card read-only com CNH, categorias como Badges, validade. Botão pencil no header abre `EditMyDriverDialog` — padrão consistente com `/profile`, `/organization` e admin `/drivers`. Também lista as organizações em que o user tem vínculo `DRIVER` via `useMyDriverOrgs`.
  - **Modo edit** (dentro do Dialog): `DriverProfileForm` com `cnh` readonly + checkbox group de categorias. Schema (`makeDriverSchema(initialExpiresAt)`) só exige `cnhExpiresAt` ser data **futura se o user mudou o valor** — driver com CNH vencida ainda consegue salvar mudanças em categorias deixando a data intacta.
- `/profile` mostra card condicional: "Trabalhar como motorista" / "Aguardando vínculo com uma empresa" / "Ativo".
- A tab "Como motorista" na BottomNav e rotas sob `_driver/` só aparecem quando `isDriver === true` (= perfil + membership). User com `hasDriverProfile && !isDriver` só acessa `/profile/driver`.

Self-edit usa `PATCH /drivers/me` (campos permitidos: `cnhCategories`, `cnhExpiresAt`). `cnh` e `driverStatus` são admin-only via `PUT /drivers/{id}` — mas a UI atual **não expõe edição de driver pra admin**: admin só consegue **remover** o motorista da org (soft-remove via `DELETE /memberships/{userId}/{roleId}/{orgId}`, reversível via `restoreMembership` ou re-adicionando). Mudanças de dados de driver (CNH, validade, categorias) ficam sob responsabilidade do próprio motorista. Isso preserva integridade cross-org — admin de Org X não muda status global de driver que pode pertencer a outras orgs.

### Renderização de nome do motorista

O backend não inclui `userName`/`userEmail` no payload de `Driver` da maioria dos endpoints (só vem em casos específicos). Pra evitar mostrar "CNH 12345…" como label em Selects/Cards:

- `<DriverDisplayName driver={d} />` — renderiza nome legível, usando `userName`/`userEmail` inline se disponível, ou caindo pra `useDriverName(d.id)` (cache global + dedup). Use em qualquer lugar que renderize um nome de motorista visualmente.
- `driverDisplayString(d)` (em `features/drivers/lib/driver-display.ts`) — versão síncrona/string-only. Use em props que exigem texto puro: `textValue` de `<SelectItem>`, `aria-label`, etc. Sem busca async — só inline.

---

## Convenções Importantes

- **Pathless layouts:** prefixo `_` no arquivo (`_protected.tsx`)
- **Rotas protegidas:** usar path `/_protected/...` no `createFileRoute` e em todos os `Link`/`navigate`
- **URLs no browser:** sem o `_protected` (ex: `/my-bookings`)
- **Após alterar rotas:** TanStack Router regenera `routeTree.gen.ts` automaticamente em dev mode
- **Hooks como use cases:** cada hook de feature encapsula fetch + state + side effects; nunca duplicar lógica entre hooks
- **Componentes de feature:** recebem dados via props, não fazem fetch próprio — separação pura de apresentação
- **Forms e edição usam `BottomSheet`:** o padrão atual é o primitivo compartilhado `components/visual/BottomSheet.tsx` (não `Dialog` cru) — ver `TemplateFormSheet`, `TripFormSheet`, `EditMyDriverDialog`. Cuidado: arquivos com sufixo `*Dialog` (ex: `GenerateInstancesDialog`, `AddDriverDialog`, `RemoveDriverDialog`) podem ainda ser baseados em `Dialog`/`AlertDialog` — o nome é histórico, confira o import antes de assumir.

---

## O Que NÃO Fazer

- Não chamar `api()` diretamente em rotas ou componentes — usar services
- Não duplicar lógica de fetch — criar/reutilizar hook de feature
- Não modificar `src/components/ui/` — componentes shadcn, atualizar via CLI
- Não duplicar guard de auth — adicionar apenas em `_protected.tsx`
- Não adicionar React Query ainda — apesar do `@tanstack/react-query` estar no `package.json`, nenhuma rota o consome. Manter padrão Context + hooks até decisão explícita de migrar (ver ADR-002)
- Não criar OrganizationContext global — `adminOrgId` do `useRole()` é suficiente
- Não adicionar plugins ao `vite.config.ts` — o preset `@lovable.dev/vite-tanstack-config` já os inclui
- Não fazer parsing de `err.message` pra detectar tipo de erro — usar `err.errorCode` (campo estável documentado em `docs/API_FRONTEND.md`). Exceção: hooks que detectam "recurso não existe ainda" precisam de heurística defensiva quando o backend não padroniza 404 (ver `useMyDriver`).
- Não buscar `template` separado pra hidratar `TripInstance` — `GET /trip-instances/{id}` e `GET /trip-instances/organization/{id}` já vêm enriquecidos com `template`/`departurePoint`/`destination`/`bookedCount`
- Não enviar `departureTime`/`arrivalEstimate` ao criar `TripInstance` — o backend agora aceita só `departureDate` (YYYY-MM-DD) e combina com o time-of-day do template. Os campos absolutos voltam na resposta.
- Não expor cron expressions cruas (`0 2 * * *`, `*/15 * * * *`) nem horários em UTC literal na UI — converter pra BR e mostrar como info (não como input — o cron é global no backend desde 22/05/2026).
- Não adicionar inputs de `generationCron`/`autoCancelCron` no `SchedulingConfigCard` — esses campos foram removidos do contrato da API. Os horários são fixos: 23:00 BR (geração) e a cada 15min (auto-cancel).
- Não usar `Date.toLocaleString()`/`Date.toLocaleDateString()` ad-hoc com `timeZone: "UTC"` (mostra o instante UTC como se fosse BR) nem sem `timeZone` (usa fuso do navegador). Sempre passar por `formatDateTime`/`formatFullDate`/`formatDateOnly` em `lib/format.ts`, que já usam `America/Sao_Paulo`.
- Não usar `_driver.tsx` como guard de rotas onde o user ainda não foi vinculado (ex.: `/profile/driver`) — esse layout redireciona quem não tem membership de driver. Rotas que só dependem de `hasDriverProfile` ficam direto sob `_protected/`.
- Não tratar `cnhCategory` como string única — backend trocou para `cnhCategories: ("A"|"B"|"C"|"D"|"E")[]` (Phase 5, 19/05/2026). Para listar use `cnhCategories.join(", ")`; para forms use o `<CnhCategoriesField>` em `features/drivers/components/`.
- Não chamar `PUT /drivers/{id}` em fluxo de self-service — admin-only. Use `driversService.updateMe` (PATCH /drivers/me) com `cnhCategories`/`cnhExpiresAt` apenas.
- Não duplicar tela de detalhe de viagem para driver — `/_protected/trip/$tripId` é compartilhada admin+driver via prop `role` no `AdminTripDetailView`. Driver vê só transições `IN_PROGRESS`/`FINISHED` e sem assignment de driver/veículo.
- Não expor edição de dados de driver pro admin (CNH, categorias, validade, status) — admin só remove via `removeMembership`. Mudanças nos dados do driver são self-service via `PATCH /drivers/me`. Esse trade-off preserva integridade cross-org.
- Não mostrar "CNH 12345…" como nome principal de motorista em listas/Selects — use `<DriverDisplayName>` (busca via cache) ou `driverDisplayString` (string puro pra textValue). CNH é OK como linha secundária do item, não como label principal.
- Não tratar limites altos de plano (`maxMonthlyTrips >= 1000`) como número literal — use `isUnlimitedPlanLimit(max)` de `lib/format.ts` pra renderizar "ilimitado" e omitir barra de progresso. Premium plans usam valores sentinela tipo 9999 que ninguém atinge em uso legítimo.
