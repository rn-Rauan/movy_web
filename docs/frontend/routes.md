# Rotas

O projeto usa TanStack Router com roteamento baseado em arquivos. Arquivos com prefixo `_` criam layouts sem segmento na URL, usados para guards.

## Contextos de Acesso

| Contexto    | Arquivo/layout           | Finalidade                                                 |
| ----------- | ------------------------ | ---------------------------------------------------------- |
| Público     | rotas sem `_protected`   | Landing, login, cadastro, catálogo, organizações e planos. |
| Autenticado | `_protected.tsx`         | Exige sessão.                                              |
| Admin       | `_protected._admin.tsx`  | Exige sessão e papel ADMIN.                                |
| Motorista   | `_protected._driver.tsx` | Exige perfil de motorista e vínculo DRIVER ativo.          |

## Rotas Públicas

| URL                           | Arquivo                           | Finalidade                                            |
| ----------------------------- | --------------------------------- | ----------------------------------------------------- |
| `/`                           | `index.tsx`                       | Landing para visitante ou redirecionamento por papel. |
| `/login`                      | `login.tsx`                       | Login.                                                |
| `/forgot-password`            | `forgot-password.tsx`             | Solicitação de recuperação de senha.                  |
| `/reset-password?token=...`   | `reset-password.tsx`              | Redefinição de senha com auto-login.                  |
| `/verify-email?token=...`     | `verify-email.tsx`                | Verificação de e-mail e refresh de sessão.            |
| `/signup`                     | `signup.index.tsx`                | Cadastro B2C.                                         |
| `/signup/empresa`             | `signup.empresa.tsx`              | Cadastro B2B com organização e admin.                 |
| `/public/trip-instances`      | `public.trip-instances.index.tsx` | Catálogo público de viagens.                          |
| `/public/trip-instances/:id`  | `public.trip-instances.$id.tsx`   | Detalhe público da viagem.                            |
| `/public/organizations`       | `public.organizations.index.tsx`  | Diretório público de organizações.                    |
| `/public/organizations/:slug` | `public.organizations.$slug.tsx`  | Perfil público da organização.                        |
| `/public/plans`               | `public.plans.tsx`                | Planos públicos.                                      |

## Rotas Autenticadas

| URL                            | Arquivo                                      | Finalidade                                               |
| ------------------------------ | -------------------------------------------- | -------------------------------------------------------- |
| `/my-bookings`                 | `_protected.my-bookings.tsx`                 | Lista de inscrições do usuário.                          |
| `/my-bookings/:bookingId`      | `_protected.my-bookings.$bookingId.tsx`      | Detalhe da inscrição.                                    |
| `/bookings-success/:bookingId` | `_protected.bookings-success.$bookingId.tsx` | Confirmação pós-inscrição.                               |
| `/organizations`               | `_protected.organizations.tsx`               | Organizações disponíveis ao usuário.                     |
| `/trips/:orgId`                | `_protected.trips.$orgId.tsx`                | Viagens de uma organização.                              |
| `/trips/:orgId/:tripId/book`   | `_protected.trips.$orgId.$tripId.book.tsx`   | Formulário de inscrição.                                 |
| `/profile`                     | `_protected.profile.tsx`                     | Perfil do usuário.                                       |
| `/profile/driver`              | `_protected.profile.driver.tsx`              | Perfil self-service de motorista.                        |
| `/setup`                       | `_protected.setup.tsx`                       | Wizard de criação de organização.                        |
| `/trip/:tripId`                | `_protected.trip.$tripId.tsx`                | Detalhe operacional compartilhado por admin e motorista. |

## Rotas Admin

| URL             | Arquivo                              | Finalidade                                  |
| --------------- | ------------------------------------ | ------------------------------------------- |
| `/dashboard`    | `_protected._admin.dashboard.tsx`    | Métricas administrativas.                   |
| `/trips`        | `_protected._admin.trips.tsx`        | Gestão de viagens.                          |
| `/templates`    | `_protected._admin.templates.tsx`    | Gestão de templates de rota.                |
| `/drivers`      | `_protected._admin.drivers.tsx`      | Gestão de motoristas.                       |
| `/vehicles`     | `_protected._admin.vehicles.tsx`     | Gestão de veículos.                         |
| `/organization` | `_protected._admin.organization.tsx` | Configurações da organização e agendamento. |
| `/subscription` | `_protected._admin.subscription.tsx` | Histórico de assinaturas.                   |
| `/financial`    | `_protected._admin.financial.tsx`    | Relatório financeiro mensal.                |

## Rotas Motorista

| URL             | Arquivo                           | Finalidade                       |
| --------------- | --------------------------------- | -------------------------------- |
| `/my-trips`     | `_protected._driver.my-trips.tsx` | Viagens atribuídas ao motorista. |
| `/trip/:tripId` | `_protected.trip.$tripId.tsx`     | Operação da viagem atribuída.    |

## Observações

- A URL final não inclui `_protected`, `_admin` ou `_driver`.
- Layouts `_admin` e `_driver` precisam ter rotas filhas para não virarem rotas leaf conflitantes.
- Quando uma rota pai ganha uma filha, use `Outlet` no pai para não engolir o conteúdo da filha.
