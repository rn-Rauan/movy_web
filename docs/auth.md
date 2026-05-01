# Autenticação — movy_web

## Visão Geral

A autenticação é baseada em **JWT (JSON Web Tokens)** com par access/refresh token. O gerenciamento de estado é feito via **React Context** (`AuthContext`), acessível em toda a aplicação através do hook `useAuth()`.

---

## Fluxo Completo

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
6. navigate({ to: redirect ?? "/organizations" })
```

---

## `AuthProvider`

**Arquivo:** `src/lib/auth-context.tsx`

Deve envolver toda a aplicação. Já está posicionado no `RootComponent` em `src/routes/__root.tsx`.

### Estado exposto

| Propriedade | Tipo | Descrição |
|---|---|---|
| `user` | `AuthUser \| null` | Dados do usuário autenticado |
| `isAuthenticated` | `boolean` | `true` se `user !== null` |
| `loading` | `boolean` | `true` durante a inicialização (leitura do localStorage) |
| `login` | `Function` | Autentica via API e atualiza o estado |
| `signup` | `Function` | Cadastra e autentica via API |
| `logout` | `Function` | Limpa tokens e reseta o estado |

### Inicialização

Na montagem do `AuthProvider`, o estado é restaurado do `localStorage`:

```ts
useEffect(() => {
  setUser(tokenStorage.user); // lê tt_user do localStorage
  setLoading(false);
}, []);
```

O `loading = true` durante essa inicialização evita redirecionamentos prematuros para `/login` nas rotas protegidas.

---

## Hook `useAuth()`

```tsx
import { useAuth } from "@/lib/auth-context";

function MinhaPage() {
  const { user, isAuthenticated, loading, login, logout } = useAuth();
  // ...
}
```

Lança erro se usado fora do `AuthProvider`.

---

## `tokenStorage`

**Arquivo:** `src/lib/api.ts`

Interface de acesso ao `localStorage` para tokens:

```ts
tokenStorage.access    // lê tt_access
tokenStorage.refresh   // lê tt_refresh
tokenStorage.user      // lê tt_user (parseado como JSON)
tokenStorage.set({ accessToken, refreshToken, user }) // salva os 3
tokenStorage.clear()   // remove os 3
```

> Safe server-side: todas as operações verificam `typeof window !== "undefined"` antes de acessar o `localStorage`.

---

## Logout

O logout é imperativo — limpa os tokens e reseta o estado:

```ts
const logout = () => {
  tokenStorage.clear();
  setUser(null);
};
```

O botão de logout é exibido no `AppShell` (header) quando `isAuthenticated === true`.

---

## Considerações de Segurança

- Os tokens são armazenados em `localStorage`. Isso é conveniente, mas os torna acessíveis via JavaScript (XSS). Para aplicações de alta segurança, considere `httpOnly cookies`.
- O `refreshToken` é armazenado (`tt_refresh`) mas **não há lógica de renovação automática** implementada. Quando o `accessToken` expirar, as requisições autenticadas falharão com `401` e o usuário precisará fazer login novamente.
- Validação de formulários com **Zod** no cliente previne envio de dados malformados, mas a validação real de segurança deve sempre ocorrer no backend.
