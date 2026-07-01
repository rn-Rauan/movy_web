# Integração com a API

## Cliente HTTP

Toda comunicação passa por `src/lib/api.ts`.

Responsabilidades:

- Montar URL com `VITE_API_URL`.
- Enviar `Content-Type: application/json`.
- Anexar `Authorization: Bearer <token>` por padrão.
- Permitir chamadas públicas com `auth: false`.
- Renovar token em `401`.
- Normalizar falhas em `ApiError`.

## Services

Rotas e componentes não devem chamar `api()` diretamente. Use services em `src/services`.

| Service                    | Responsabilidade                                                |
| -------------------------- | --------------------------------------------------------------- |
| `auth.service.ts`          | Forgot/reset password, verify email e refresh.                  |
| `trips.service.ts`         | Viagens públicas, admin, motorista, status e atribuições.       |
| `bookings.service.ts`      | Inscrições, detalhes, disponibilidade, cancelamento e presença. |
| `organizations.service.ts` | Organizações públicas, ativas, do usuário e atualização.        |
| `drivers.service.ts`       | Perfil self-service, listagem admin, lookup e vínculo.          |
| `templates.service.ts`     | CRUD de templates e geração manual de instâncias.               |
| `vehicles.service.ts`      | CRUD e desativação de veículos.                                 |
| `scheduling.service.ts`    | Configuração de geração automática.                             |
| `plans.service.ts`         | Planos públicos e consulta por ID.                              |
| `payments.service.ts`      | Pagamentos e confirmação/falha.                                 |
| `subscriptions.service.ts` | Assinaturas e uso do plano.                                     |

## Erros

`ApiError` carrega:

- `status`
- `message`
- `data`
- `errorCode`

Prefira `errorCode` ao texto da mensagem. O contrato de códigos fica em [../reference/api-frontend.md](../reference/api-frontend.md).

O mapeamento de mensagens de UI fica em `src/lib/handle-error.ts`.

## Endpoints Públicos

Chamadas públicas devem passar `auth: false` quando o endpoint não exige sessão. Exemplos:

- `GET /public/trip-instances`
- `GET /public/trip-instances/:id`
- `GET /public/organizations`
- `GET /public/organizations/:slug`
- `GET /public/plans`

## CORS

O frontend roda em Cloudflare Workers e consome a API no Render. A API precisa permitir a origem pública do Worker e o ambiente local durante desenvolvimento.

Checklist mínimo:

- `http://localhost:<porta>` permitido em desenvolvimento.
- Domínio do Worker permitido em produção.
- Métodos usados pela aplicação liberados.
- Header `Authorization` liberado.
