# Autenticação e Roles — movy_web

## Visão Geral

A autenticação é baseada em **JWT (JSON Web Tokens)** com par access/refresh token. O gerenciamento de estado é dividido em dois contexts:

- **`AuthContext`** — identidade do usuário (login/signup/logout)
- **`RoleContext`** — role do usuário na organização (admin/driver)

Ambos estão em `src/lib/` e são consumidos via hooks `useAuth()` e `useRole()`.

---

## Fluxo de Autenticação

```
1. Usuário preenche email + senha em /login
        │
        ▼
2. Validação Zod no cliente
        │ (inválido) → toast.error()
        │ (válido) ↓
        ▼
3. POST /auth/login → { accessToken, refreshToken, user }
        │
        ▼
4. tokenStorage.set() → salva no localStorage:
   - tt_access   = accessToken
   - tt_refresh  = refreshToken
   - tt_user     = JSON.stringify(user)
        │
        ▼
5. AuthProvider.setUser(user) → isAuthenticated = true
        │
        ▼
6. RoleProvider detecta roles automaticamente:
   - GET /drivers/me            → isDriver
   - GET /organizations/me      → lista de orgs
   - GET /memberships/me/role/:orgId → role === "ADMIN"?
        │
        ▼
7. index.tsx redireciona por role:
   - Admin  → /_protected/organizations
   - User   → /public/trip-instances
```

---

## Auto-refresh de Token

O `api.ts` intercepta respostas `401` e renova o access token automaticamente:

1. Chama `POST /auth/refresh` com o `refreshToken` do `localStorage`
2. Salva os novos tokens via `tokenStorage.set()`
3. Re-executa a requisição original com o novo token
4. Deduplicação: chamadas concorrentes aguardam o mesmo refresh (não disparam múltiplos refreshes)

Se o refresh também falhar (`401`), a sessão é encerrada e o usuário precisa fazer login novamente.

---

## `AuthProvider`

**Arquivo:** `src/lib/auth-context.tsx`

Deve envolver toda a aplicação. Posicionado no `__root.tsx` como ancestral do `RoleProvider`.

### Estado exposto

| Propriedade       | Tipo               | Descrição                                                       |
| ----------------- | ------------------ | --------------------------------------------------------------- |
| `user`            | `AuthUser \| null` | Dados do usuário autenticado                                    |
| `isAuthenticated` | `boolean`          | `true` se `user !== null`                                       |
| `loading`         | `boolean`          | `true` durante a inicialização (leitura do localStorage)        |
| `login`           | `Function`         | Autentica via API e atualiza o estado                           |
| `signup`          | `Function`         | Cadastra e autentica via API                                    |
| `logout`          | `Function`         | Revoga token server-side, limpa localStorage e reseta estado    |
| `refreshUser`     | `Function`         | Relê `tokenStorage.user` e atualiza o estado (usado após setup) |

### Inicialização

```ts
useEffect(() => {
  setUser(tokenStorage.user); // lê tt_user do localStorage
  setLoading(false);
}, []);
```

`loading = true` durante essa inicialização evita redirecionamentos prematuros.

---

## Hook `useAuth()`

```tsx
import { useAuth } from "@/lib/auth-context";

const { user, isAuthenticated, loading, login, signup, logout, refreshUser } = useAuth();
```

Lança erro se usado fora do `AuthProvider`.

---

## `RoleProvider`

**Arquivo:** `src/lib/role-context.tsx`

Detecta automaticamente o role do usuário após o login, chamando a API em paralelo.

### Estado exposto

| Propriedade   | Tipo             | Descrição                           |
| ------------- | ---------------- | ----------------------------------- |
| `isAdmin`     | `boolean`        | User tem role ADMIN na organização  |
| `isDriver`    | `boolean`        | User está cadastrado como motorista |
| `adminOrgId`  | `string \| null` | ID da organização onde é admin      |
| `roleLoading` | `boolean`        | `true` enquanto detecta roles       |
| `refetchRole` | `Function`       | Re-detecta roles (usar após setup)  |

### Detecção de roles

```ts
const [driverResult, orgsResult] = await Promise.allSettled([
  api("/drivers/me"), // resolve → isDriver = true
  api("/organizations/me"), // resolve → tem org, verifica role
]);
// GET /memberships/me/role/:orgId → { name: "ADMIN" } → isAdmin = true
```

---

## Hook `useRole()`

```tsx
import { useRole } from "@/lib/role-context";

const { isAdmin, isDriver, adminOrgId, roleLoading, refetchRole } = useRole();
```

---

## `tokenStorage`

**Arquivo:** `src/lib/api.ts`

```ts
tokenStorage.access; // lê tt_access
tokenStorage.refresh; // lê tt_refresh
tokenStorage.user; // lê tt_user (parseado como JSON)
tokenStorage.set({ accessToken, refreshToken, user }); // salva os 3
tokenStorage.clear(); // remove os 3
```

> Safe server-side: todas as operações verificam `typeof window !== "undefined"`.

---

## Logout

```ts
const logout = () => {
  // Revoga refresh token server-side (fire-and-forget)
  api("/auth/logout", {
    method: "POST",
    auth: false,
    body: JSON.stringify({ refreshToken }),
  }).catch(() => {});
  tokenStorage.clear();
  setUser(null);
};
```

---

## Guard de Rotas

O guard de autenticação está centralizado no pathless layout `_protected.tsx`. **Não adicionar guard individual em rotas filhas.**

```tsx
// src/routes/_protected.tsx
function ProtectedLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  useEffect(() => {
    if (!loading && !isAuthenticated) navigate({ to: "/login" });
  }, [loading, isAuthenticated, navigate]);
  if (loading || !isAuthenticated) return null;
  return <Outlet />;
}
```

---

## Considerações de Segurança

- Tokens em `localStorage` são acessíveis via JavaScript (XSS). Para aplicações de alta segurança, usar `httpOnly cookies`.
- Validação de formulários com **Zod** no cliente previne dados malformados, mas a validação real de segurança sempre ocorre no backend.
- O auto-refresh garante experiência contínua sem re-login a cada hora.
