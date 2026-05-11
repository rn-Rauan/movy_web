# Padronização do fluxo Admin

## Diagnóstico

`.instructions.md` exige rotas como **thin controllers (~15 linhas)** com lógica em `features/<nome>/{hooks,components}`. Hoje as rotas admin não seguem isso:

| Rota | Linhas | Status |
|---|---|---|
| `_admin.tsx` | 29 | OK (guard) |
| `_admin.dashboard.tsx` | 95 | aceitável, usa `useTrips` |
| `_admin.payments.tsx` | 122 | precisa extrair (`ApiError` direto, fetch inline) |
| `_admin.drivers.tsx` | 432 | refatorar |
| `_admin.trips.tsx` | 447 | refatorar |
| `_admin.trips.$tripId.tsx` | 422 | refatorar |
| `_admin.templates.tsx` | 586 | refatorar |
| `_admin.organization.tsx` | 858 | refatorar (importa `ApiError`, plan card + form + sheet veículos misturados) |

Outras pendências menores:
- `payments.tsx` e `organization.tsx` importam `ApiError` direto — aceitável só se vier via service. Mover error handling pro hook.
- Empty states já padronizados via `EmptyState` (ok).
- `handleApiError` já usado em drivers/trips/organization (ok).

## Plano

Criar feature modules faltantes e mover hooks/components pra eles. Rotas viram controllers finos (~15-30 linhas) seguindo padrão de `_protected.my-bookings.tsx`.

### 1. `features/drivers/`
- `hooks/useDrivers.ts` — list/refetch por orgId
- `hooks/useDriverForm.ts` — lookup + add + update + remove/restore
- `components/DriversList.tsx`, `DriverCard.tsx`, `DriverFormSheet.tsx`
- Rota `_admin.drivers.tsx` → controller fino

### 2. `features/templates/`
- `hooks/useTemplates.ts`, `hooks/useTemplateForm.ts`
- `components/TemplatesList.tsx`, `TemplateCard.tsx`, `TemplateFormSheet.tsx`
- Rota → controller fino

### 3. `features/trips/` (extender p/ admin)
- `hooks/useAdminTrips.ts` (CRUD), `hooks/useTripPassengersAdmin.ts`, `hooks/useTripActions.ts` (status changes)
- `components/admin/TripFormSheet.tsx`, `TripDetailAdminView.tsx`, `PassengersList.tsx`
- Rotas `_admin.trips.tsx` e `_admin.trips.$tripId.tsx` → controllers finos

### 4. `features/organizations/` (extender p/ admin)
- `hooks/useOrganizationDetail.ts`, `hooks/useOrganizationForm.ts`, `hooks/useVehicles.ts`
- `hooks/usePlanUsage.ts` (substitui fetch inline de subscription+plan)
- `components/OrgDetailView.tsx`, `PlanCard.tsx`, `VehiclesSheet.tsx`
- Rota `_admin.organization.tsx` → controller fino (3 cards: PlanCard, OrgForm, VehiclesSheet)

### 5. `features/payments/`
- `hooks/usePayments.ts` (paginação)
- `components/PaymentsList.tsx`, `PaymentCard.tsx`
- Rota `_admin.payments.tsx` → controller fino

### Convenções aplicadas
- Hooks encapsulam fetch + state + toast/error handling via `handleApiError`
- Components recebem dados via props, não fazem fetch
- Services continuam sendo único acesso a `api()` — remover imports de `ApiError` das rotas
- Mantém `EmptyState`, `LoadingList`, `ErrorCard` já existentes
- Mantém comportamento atual (não muda funcionalidade, só estrutura)

### Verificação final
- `npm run format` + `npm run format:check` + `npm run lint:ci`

## Detalhes técnicos

Padrão do controller após refactor:

```tsx
function DriversPage() {
  const { adminOrgId } = useRole();
  const { drivers, loading, error, refetch } = useDrivers(adminOrgId);
  const [sheetOpen, setSheetOpen] = useState(false);
  return (
    <AppShell title="Motoristas">
      {loading ? <LoadingList /> :
       error ? <ErrorCard message={error} /> :
       <DriversList drivers={drivers ?? []} onAdd={() => setSheetOpen(true)} />}
      <DriverFormSheet open={sheetOpen} onOpenChange={setSheetOpen} orgId={adminOrgId} onSaved={refetch} />
    </AppShell>
  );
}
```

## Escopo

Mudança grande (~3000 linhas movidas, sem mudança funcional). Posso:
- **A) Fazer tudo de uma vez** — refactor completo dos 7 arquivos admin
- **B) Fazer incremental** — começar pelos menores (payments, drivers) pra você revisar antes
- **C) Escolher só os piores** (organization 858 + templates 586)

Qual prefere?
