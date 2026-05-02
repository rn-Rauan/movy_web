# Documentação — movy_web

Bem-vindo à documentação do projeto **movy_web**, um SaaS de transporte — sistema de gerenciamento e reserva de viagens.

---

## Índice

| Documento | Descrição |
|---|---|
| [architecture.md](./architecture.md) | Stack, estrutura de diretórios, feature modules, guard de auth e deploy |
| [setup.md](./setup.md) | Instalação, variáveis de ambiente, scripts e convenções de desenvolvimento |
| [routes.md](./routes.md) | Todas as rotas, pathless layout `_protected`, guard centralizado e convenções |
| [components.md](./components.md) | AppShell, BottomNav, feedback components, feature components e shadcn/ui |
| [api.md](./api.md) | Cliente HTTP, auto-refresh, services (repository pattern) e endpoints consumidos |
| [auth.md](./auth.md) | Fluxo de autenticação, AuthProvider, RoleProvider, tokenStorage e guard |
| [types.md](./types.md) | Tipos TypeScript do domínio e utilitários de formatação |
| [FRONTEND_ENDPOINTS.md](./FRONTEND_ENDPOINTS.md) | Mapeamento de endpoints por rota (com arquivo e acesso) |
| [API_FRONTEND.md](./API_FRONTEND.md) | Referência completa da API backend (todos os endpoints) |

---

## Resumo do Projeto

**movy_web** é um PWA mobile-first com três papéis de usuário:

| Role | Capacidades |
|---|---|
| User | Explorar viagens públicas, reservar, gerenciar inscrições |
| Driver | Extensão de User — confirmar presença, marcar pagamentos |
| Admin | Criar organização, templates, viagens; gerenciar motoristas |

### Tecnologias Principais

- **React 19** + **TypeScript** (strict)
- **TanStack Start** (roteamento full-stack, file-based routing)
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI)
- **Cloudflare Workers** (deploy)
- **Bun** (package manager)

### Arquitetura

O frontend segue **feature modules**: rotas são thin controllers (~15 linhas), a lógica fica em hooks de feature, e chamadas de API são encapsuladas em services.

```
routes/ (thin controllers) → features/ (hooks + components) → services/ → api.ts → Backend
```

### Início Rápido

```bash
bun install
echo "VITE_API_URL=https://sua-api.com" > .env
bun dev
```
