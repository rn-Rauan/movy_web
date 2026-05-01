# Documentação — movy_web

Bem-vindo à documentação do projeto **movy_web**, uma aplicação web de reserva de transporte de passageiros.

---

## Índice

| Documento | Descrição |
|---|---|
| [architecture.md](./architecture.md) | Visão geral da arquitetura, stack, estrutura de diretórios, padrões e deploy |
| [setup.md](./setup.md) | Como instalar, configurar o ambiente e rodar o projeto localmente |
| [routes.md](./routes.md) | Todas as rotas da aplicação com parâmetros, requisitos de auth e funcionalidades |
| [components.md](./components.md) | AppShell, componentes UI (shadcn/ui) e padrões de interface |
| [api.md](./api.md) | Endpoints REST consumidos, cliente HTTP e armazenamento de tokens |
| [types.md](./types.md) | Tipos TypeScript do domínio e utilitários de formatação |
| [auth.md](./auth.md) | Fluxo de autenticação, AuthProvider, tokenStorage e segurança |

---

## Resumo do Projeto

**movy_web** é um PWA mobile-first que permite:

- **Usuários não autenticados** descobrirem viagens públicas disponíveis e perfis de empresas de transporte
- **Usuários autenticados** se inscreverem em viagens, gerenciarem suas inscrições e cancelarem quando necessário

### Tecnologias Principais

- **React 19** + **TypeScript** (strict)
- **TanStack Start** (roteamento full-stack, file-based routing)
- **Tailwind CSS v4** + **shadcn/ui** (Radix UI)
- **Cloudflare Workers** (deploy)
- **Bun** (package manager)

### Início Rápido

```bash
bun install
echo "VITE_API_URL=https://sua-api.com" > .env
bun dev
```
