# 🚗 Movy Web

SaaS de transporte — plataforma de gerenciamento e reserva de viagens com **PWA mobile-first**. Sistema completo com três papéis de usuário (passageiro, motorista e admin) que conversa com uma API backend (DDD + Clean Architecture).

**[🌐 Acesse a plataforma](https://movy-app.rn-labs.workers.dev/)** · **[📖 Documentação Completa](docs/)**

---

## 🛠️ Tech Stack

| Camada          | Tecnologias                                  |
| --------------- | -------------------------------------------- |
| **Frontend**    | React 19 · TypeScript (strict mode)          |
| **Roteamento**  | TanStack Router · File-based routing         |
| **Styling**     | Tailwind CSS v4 · shadcn/ui (Radix UI)       |
| **Validação**   | Zod · date-fns                               |
| **Build**       | Vite 7 · `@lovable.dev/vite-tanstack-config` |
| **Deploy**      | Cloudflare Workers · Wrangler                |
| **Componentes** | lucide-react · recharts · sonner             |

---

## ⚡ Quick Start

### Pré-requisitos

- **Node.js** 20+ (desenvolvido em Node 24)
- **npm** (compatível com `bun`, mas scripts usam npm)

### Setup Local

```bash
# 1. Instalar dependências
npm install

# 2. Configurar variáveis de ambiente
cp .env.example .env
# Ajuste VITE_API_URL conforme necessário

# 3. Iniciar servidor de desenvolvimento
npm run dev
```

A app sobe em `http://localhost:5173` (Vite). Por padrão, a API é esperada em `http://localhost:5701`.

### Variáveis de Ambiente

| Variável       | Padrão                  | Descrição               |
| -------------- | ----------------------- | ----------------------- |
| `VITE_API_URL` | `http://localhost:5701` | URL base da API backend |

---

## 📋 Scripts Disponíveis

```bash
npm run dev              # Servidor Vite em modo dev
npm run build            # Build de produção
npm run build:dev        # Build em modo development
npm run preview          # Preview do build local
npm run lint             # Análise com ESLint
npm run format           # Formatação automática (Prettier)
npm run format:check     # Verificação de formatação (sem alterar)
```

---

## 🏗️ Arquitetura

O frontend segue o padrão **feature modules com thin controllers**. A estrutura separa responsabilidades de forma clara:

```
routes/ (thin controllers)
  ↓
features/ (hooks + components)
  ↓
services/ (repository pattern)
  ↓
lib/api.ts (cliente HTTP)
  ↓
Backend API
```

### Estrutura de Pastas

```
src/
├── routes/        # Rotas file-based do TanStack Router
├── features/      # Módulos de domínio (hooks de caso de uso + components)
├── services/      # Abstração das chamadas de API
├── components/    # Componentes reutilizáveis
│   ├── ui/        # shadcn/ui (Radix UI)
│   ├── layout/    # Layouts
│   ├── feedback/  # Feedback visual (toasts, dialogs)
│   └── visual/    # Componentes visuais específicos
├── lib/           # Utilitários
│   ├── api.ts     # Cliente HTTP + interceptadores
│   ├── auth-context.ts
│   ├── role-context.ts
│   └── types.ts
├── hooks/         # Hooks genéricos compartilhados
└── styles.css     # Tailwind + design tokens
```

### Papéis de Usuário (RBAC)

| Role           | Capacidades                                                 |
| -------------- | ----------------------------------------------------------- |
| **Passageiro** | Explorar viagens, reservar, gerenciar inscrições            |
| **Motorista**  | Tudo de Passageiro + confirmar presença, marcar pagamentos  |
| **Admin**      | Criar/gerenciar organização, templates, viagens, motoristas |

Os roles são detectados em runtime via `RoleContext` após autenticação. As rotas são protegidas por **pathless layouts**:

- `public/*` — sem autenticação
- `_protected/*` — requer autenticação (guard em `_protected.tsx`)
- `_protected/_admin/*` — admin only
- `_protected/_driver/*` — driver only

### Autenticação & Sessão

- **Tokens:** `localStorage` (`tt_access`, `tt_refresh`, `tt_user`)
- **Renovação automática:** Interceptador HTTP em `lib/api.ts`
- **Deduplicação:** Requisições concorrentes 401 são sincronizadas
- **Logout:** Limpa tokens e redireciona para login

---

## 📦 Convenções Importantes

- **Path alias:** `@/*` → `src/*`
- **shadcn/ui:** Use `npx shadcn@latest add <componente>` — nunca edite `src/components/ui/` manualmente
- **Vite:** Não adicione plugins manualmente em `vite.config.ts` (o preset já os inclui)
- **Services obrigatório:** Nunca chame `api()` diretamente em rotas/componentes — sempre use services
- **Guias completos:** Consulte [AGENTS.md](AGENTS.md) e [docs/frontend/](docs/frontend/)

---

## 🚀 Deploy

### Build para Produção

```bash
npm run build
```

### Deploy na Cloudflare Workers

```bash
npx wrangler deploy
```

Ou configure CI/CD automático (veja [GitHub Actions](https://github.com/rn-Rauan/movy_web/actions)).

**Documentação:** [docs/process/deploy-cloudflare-workers.md](docs/process/deploy-cloudflare-workers.md)

---

## 📚 Documentação

A documentação técnica completa está em [`docs/`](docs/).

### Início Recomendado

| Documento                                                            | Propósito                   |
| -------------------------------------------------------------------- | --------------------------- |
| [docs/frontend/README.md](docs/frontend/README.md)                   | Ponto de entrada técnico    |
| [docs/frontend/development.md](docs/frontend/development.md)         | Setup, scripts, convenções  |
| [docs/frontend/architecture.md](docs/frontend/architecture.md)       | Design patterns e estrutura |
| [docs/frontend/routes.md](docs/frontend/routes.md)                   | Mapa completo de rotas      |
| [docs/frontend/auth-and-access.md](docs/frontend/auth-and-access.md) | Autenticação e RBAC         |
| [docs/frontend/api-integration.md](docs/frontend/api-integration.md) | Integração com API backend  |
| [docs/reference/api-frontend.md](docs/reference/api-frontend.md)     | Contrato da API             |

### Testes

Não há framework de testes automatizado configurado. Os cenários de teste manuais pré-deploy estão em [docs/frontend/manual-testing.md](docs/frontend/manual-testing.md).

---

## 📝 License

UNLICENSED

---

## 👤 Autor

**Rauan** — [GitHub](https://github.com/rn-Rauan) 2026
