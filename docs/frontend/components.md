# Componentes e UI

## Princípio Geral

Componentes de feature recebem dados via props. Fetch e side effects pertencem aos hooks. Componentes globais ficam em `src/components`.

## Layout

| Componente      | Arquivo                                   | Uso                                                               |
| --------------- | ----------------------------------------- | ----------------------------------------------------------------- |
| `AppShell`      | `src/components/layout/AppShell.tsx`      | Layout de telas autenticadas, com cabeçalho e navegação inferior. |
| `PublicShell`   | `src/components/layout/PublicShell.tsx`   | Moldura de páginas públicas.                                      |
| `BottomNav`     | `src/components/layout/BottomNav.tsx`     | Navegação por papel: passenger, driver ou admin.                  |
| `ContextBanner` | `src/components/layout/ContextBanner.tsx` | Comunicação contextual de tela.                                   |

## Feedback

| Componente      | Uso                                            |
| --------------- | ---------------------------------------------- |
| `LoadingList`   | Skeletons de carregamento.                     |
| `ErrorCard`     | Estado de erro reutilizável.                   |
| `EmptyState`    | Estado vazio com ação opcional.                |
| `FormError`     | Mensagem de erro em formulário.                |
| `LoginRequired` | Bloqueio amigável para ações que exigem login. |

## Primitivas Visuais

`src/components/visual` concentra elementos reutilizáveis que não pertencem ao shadcn/ui:

- `BottomSheet`
- `KpiCard`
- `StatusPill`
- `Timeline`
- `RouteVisual`
- `UsageBar`
- `OccupancyBar`

Use `BottomSheet` para formulários e edições quando o padrão da tela for folha inferior.

## shadcn/ui

`src/components/ui` contém componentes gerados. Não edite manualmente.

Para adicionar um componente:

```bash
npx shadcn@latest add <componente>
```

## Componentes de Feature

Componentes específicos ficam dentro da própria feature. Exemplos:

- `features/trips/components/AdminTripDetailView.tsx`
- `features/bookings/components/BookingRow.tsx`
- `features/drivers/components/DriverProfileForm.tsx`
- `features/templates/components/TemplateFormSheet.tsx`
- `features/vehicles/components/VehicleFormDialog.tsx`

## Formulários

Padrão recomendado:

1. Estado local controlado na rota ou no hook.
2. Validação com Zod.
3. Mutação via service.
4. Erro traduzido com `handleApiError` quando for erro de API.
5. Feedback com toast e atualização do estado local.
