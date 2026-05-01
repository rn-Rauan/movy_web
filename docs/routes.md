# Rotas — movy_web

## Visão Geral do Roteamento

O projeto usa **TanStack Router** com roteamento baseado em arquivos. A `routeTree.gen.ts` é gerada automaticamente pelo plugin `@tanstack/router-plugin` do Vite a cada modificação de arquivo em `src/routes/`.

---

## Árvore de Rotas

```
/                                          (index.tsx)
│  → Redireciona para /public/trip-instances
│
├── /login                                 (login.tsx)
├── /signup                                (signup.tsx)
│
├── /public/
│   ├── /trip-instances                    (public.trip-instances.tsx — layout)
│   │   ├── /                              (public.trip-instances.index.tsx)
│   │   └── /$id                           (public.trip-instances.$id.tsx)
│   └── /organizations/$slug              (public.organizations.$slug.tsx)
│
├── /organizations                         (organizations.tsx) 🔒
│
├── /trips/
│   └── /$orgId                            (trips.$orgId.tsx) 🔒
│       └── /$tripId                       (trips.$orgId.$tripId.tsx) 🔒
│           └── /book                      (trips.$orgId.$tripId.book.tsx) 🔒
│
└── /my-bookings                           (my-bookings.tsx) 🔒
    └── /$bookingId                        (my-bookings.$bookingId.tsx) 🔒

🔒 = Requer autenticação (redireciona para /login se não autenticado)
```

---

## Detalhamento por Rota

### `/` — Redirect

**Arquivo:** `src/routes/index.tsx`  
**Auth:** Não requerida  
**Comportamento:** Redireciona automaticamente para `/public/trip-instances`.

---

### `/login` — Página de Login

**Arquivo:** `src/routes/login.tsx`  
**Auth:** Não requerida  
**Search params:** `redirect?: string` — URL para redirecionar após login bem-sucedido

**Funcionalidades:**
- Formulário de email + senha
- Validação via Zod antes de submeter
- Em caso de sucesso: salva tokens e navega para `redirect` ou `/organizations`
- Exibe toast de erro em falha

---

### `/signup` — Cadastro

**Arquivo:** `src/routes/signup.tsx`  
**Auth:** Não requerida

**Campos do formulário:**
| Campo | Tipo | Validação |
|---|---|---|
| `name` | texto | mín. 2 caracteres |
| `email` | email | formato válido |
| `telephone` | tel | mín. 8 caracteres |
| `password` | senha | mín. 6 caracteres |

Em sucesso: navega para `/organizations`.

---

### `/public/trip-instances` — Layout

**Arquivo:** `src/routes/public.trip-instances.tsx`  
**Auth:** Não requerida  
**Função:** Apenas renderiza `<Outlet />` — é a rota pai que agrupa as sub-rotas públicas de viagens.

---

### `/public/trip-instances/` — Listagem Pública de Viagens

**Arquivo:** `src/routes/public.trip-instances.index.tsx`  
**Auth:** Não requerida  
**SEO:** `<title>Viagens disponíveis</title>`

**Funcionalidades:**
- Lista todas as viagens públicas via `GET /public/trip-instances`
- Campo de busca por origem/destino (filtro local no cliente)
- Cada card exibe: organização, status badge, origem/destino, data, vagas, preço
- Botões: "Ver empresa" → `/public/organizations/:slug` | "Ver viagem" → `/public/trip-instances/:id`
- Skeleton loading (3 placeholders)

---

### `/public/trip-instances/$id` — Detalhe Público de Viagem

**Arquivo:** `src/routes/public.trip-instances.$id.tsx`  
**Auth:** Não requerida  
**Parâmetros:** `id` (ID da TripInstance)  
**SEO:** `<title>Detalhe da viagem</title>`

**Funcionalidades:**
- Busca dados via `GET /public/trip-instances/:id`
- Exibe: data de saída, status badge, origem, destino, horário, chegada estimada, vagas, preço
- **Se autenticado:** botão "Ver detalhes e reservar" → `/trips/:orgId/:tripId`
- **Se não autenticado:** botão "Entrar para reservar" → `/login?redirect=...`
- Botão desabilitado se viagem lotada

---

### `/public/organizations/$slug` — Perfil Público de Empresa

**Arquivo:** `src/routes/public.organizations.$slug.tsx`  
**Auth:** Não requerida  
**Parâmetros:** `slug` (identificador da organização)  
**SEO:** `<title>Empresa de transporte</title>`

**Funcionalidades:**
- Busca viagens via `GET /public/trip-instances/org/:slug`
- Exibe card da empresa (nome derivado das viagens ou o próprio slug)
- Lista viagens com origem/destino, status, vagas, preço
- Botão "Ver viagem" → `/public/trip-instances/:id`

---

### `/organizations` — Lista de Empresas (Privada) 🔒

**Arquivo:** `src/routes/organizations.tsx`  
**Auth:** Requerida → redireciona para `/login`

**Funcionalidades:**
- Busca via `GET /organizations/active`
- Lista empresas ativas em cards clicáveis
- Clique → `/trips/:orgId?slug=:slug`
- Exibe nome + descrição de cada organização

---

### `/trips/$orgId` — Viagens de uma Empresa 🔒

**Arquivo:** `src/routes/trips.$orgId.tsx`  
**Auth:** Requerida  
**Parâmetros:** `orgId` (ID da organização)  
**Search params:** `slug?: string`

**Funcionalidades:**
- Se `slug` disponível: usa endpoint público `GET /public/trip-instances/org/:slug`
- Caso contrário: usa `GET /trip-instances/organization/:orgId` (autenticado)
- Lista viagens ordenadas por data de partida (crescente)
- Cada card: data, status badge, vagas disponíveis, chegada estimada

---

### `/trips/$orgId/$tripId` — Detalhe de Viagem (Privada) 🔒

**Arquivo:** `src/routes/trips.$orgId.$tripId.tsx`  
**Auth:** Requerida  
**Parâmetros:** `orgId`, `tripId`

**Funcionalidades:**
- Busca detalhes da viagem em paralelo:
  - `GET /public/trip-instances/:tripId` — dados gerais
  - `GET /bookings/availability/:tripId` — disponibilidade real de vagas
- Exibe horário de saída, chegada estimada, vagas, preço mínimo
- Aviso se viagem não aceita inscrições (`canEnroll()`)
- Botão "Inscrever-se" → `/trips/:orgId/:tripId/book`

---

### `/trips/$orgId/$tripId/book` — Formulário de Inscrição 🔒

**Arquivo:** `src/routes/trips.$orgId.$tripId.book.tsx`  
**Auth:** Requerida  
**Parâmetros:** `orgId`, `tripId`

**Campos do formulário:**

| Campo | Tipo | Opções |
|---|---|---|
| `enrollmentType` | select | `ONE_WAY` (Somente ida) / `ROUND_TRIP` (Ida e volta) |
| `boardingStop` | texto | parada de embarque |
| `alightingStop` | texto | parada de desembarque |
| `method` | select | PIX / Cartão de crédito / Dinheiro / Assinatura |

- Submete via `POST /bookings`
- Em sucesso: navega para `/my-bookings`

---

### `/my-bookings` — Minhas Inscrições 🔒

**Arquivo:** `src/routes/my-bookings.tsx`  
**Auth:** Requerida

**Funcionalidades:**
- Busca via `GET /bookings/user`
- Lista inscrições com data, status badge, rota (embarque → desembarque)
- Clique no item → `/my-bookings/:bookingId`
- Estado vazio: ícone + mensagem informativa

---

### `/my-bookings/$bookingId` — Detalhe de Inscrição 🔒

**Arquivo:** `src/routes/my-bookings.$bookingId.tsx`  
**Auth:** Requerida  
**Parâmetros:** `bookingId`

**Funcionalidades:**
- Busca via `GET /bookings/:bookingId`
- Exibe: data, horário, parada de embarque, parada de desembarque, tipo de viagem, valor
- Se `status === "ACTIVE"`: exibe botão de cancelamento com `AlertDialog` de confirmação
- Cancelamento via `PATCH /bookings/:bookingId/cancel`

---

## Convenções de Nomenclatura de Arquivos

O TanStack Router usa pontos (`.`) no nome do arquivo para representar segmentos aninhados da URL:

| Arquivo | URL |
|---|---|
| `public.trip-instances.tsx` | `/public/trip-instances` |
| `public.trip-instances.index.tsx` | `/public/trip-instances/` |
| `public.trip-instances.$id.tsx` | `/public/trip-instances/:id` |
| `trips.$orgId.$tripId.book.tsx` | `/trips/:orgId/:tripId/book` |

Parâmetros dinâmicos são prefixados com `$` no nome do arquivo.
