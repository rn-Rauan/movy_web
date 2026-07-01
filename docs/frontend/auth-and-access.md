# Autenticação e Controle de Acesso

## Sessão

A sessão usa access token, refresh token e dados básicos do usuário no `localStorage`.

| Chave        | Conteúdo                         |
| ------------ | -------------------------------- |
| `tt_access`  | Access token JWT.                |
| `tt_refresh` | Refresh token.                   |
| `tt_user`    | Usuário autenticado serializado. |

O acesso a essas chaves fica centralizado em `src/lib/api.ts`.

## AuthProvider

`src/lib/auth-context.tsx` expõe:

- `user`
- `isAuthenticated`
- `loading`
- `login`
- `signup`
- `setSession`
- `logout`
- `refreshUser`

`setSession` deve ser usado em fluxos que retornam `TokenResponse`, como reset de senha.

## Auto-refresh

O cliente HTTP intercepta respostas `401`, chama `POST /auth/refresh`, salva a nova sessão e repete a requisição original. Chamadas concorrentes aguardam a mesma renovação para evitar múltiplos refresh simultâneos.

## RoleProvider

`src/lib/role-context.tsx` deriva capacidades a partir do usuário autenticado:

- `isAdmin`: usuário possui papel ADMIN em alguma organização.
- `hasDriverProfile`: usuário tem perfil de motorista criado.
- `isDriver`: usuário tem perfil de motorista e membership DRIVER ativa em alguma organização.
- `adminOrgId`: primeira organização onde o usuário é admin.
- `refetchRole`: força nova leitura dos papéis.

## Semântica de Motorista

Ter perfil de motorista não significa ter acesso à área de motorista. Acesso a `/_driver` exige:

1. Perfil de motorista criado (`GET /drivers/me`).
2. Vínculo ativo como DRIVER em uma organização.

Isso permite que um passageiro cadastre seu perfil e fique aguardando vínculo de uma organização.

## Guards

| Guard       | Arquivo                  | Comportamento                     |
| ----------- | ------------------------ | --------------------------------- |
| Autenticado | `_protected.tsx`         | Redireciona visitante para login. |
| Admin       | `_protected._admin.tsx`  | Redireciona não-admin para `/`.   |
| Driver      | `_protected._driver.tsx` | Redireciona não-driver para `/`.  |

Evite duplicar verificações de acesso dentro de rotas filhas. Use os layouts.

## Fluxos Relacionados

- Login: `POST /auth/login`.
- Cadastro B2C: `POST /auth/register`.
- Cadastro B2B: `POST /auth/register-organization`.
- Recuperação de senha: `POST /auth/forgot-password` e `POST /auth/reset-password`.
- Verificação de e-mail: `POST /auth/verify-email`, seguida de refresh para atualizar dados da sessão.
