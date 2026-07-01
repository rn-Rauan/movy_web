# Frontend Movy

O Movy Web é a aplicação cliente do SaaS de transporte universitário intermunicipal. O frontend é uma aplicação React mobile-first com rotas públicas, área autenticada, área administrativa e área do motorista, consumindo uma API REST externa.

## Stack

| Área       | Tecnologia                              |
| ---------- | --------------------------------------- |
| UI         | React 19 + TypeScript                   |
| Roteamento | TanStack Router + TanStack Start        |
| Estilo     | Tailwind CSS + shadcn/ui                |
| Validação  | Zod                                     |
| HTTP       | `fetch` encapsulado em `src/lib/api.ts` |
| Deploy     | Cloudflare Workers                      |

## Como a documentação está organizada

- [development.md](development.md): setup, scripts e convenções.
- [architecture.md](architecture.md): organização interna do código.
- [routes.md](routes.md): mapa atual de rotas.
- [auth-and-access.md](auth-and-access.md): autenticação, sessão e RBAC.
- [api-integration.md](api-integration.md): services, cliente HTTP e erros.
- [components.md](components.md): padrões de interface e componentes.
- [testing.md](testing.md): verificação manual e lacunas de teste.
- [deployment.md](deployment.md): publicação em Cloudflare Workers.

## Regra de ouro

As rotas devem ser controladores finos. A lógica de caso de uso fica em hooks de `features/`, as chamadas HTTP ficam em `services/`, e temas transversais ficam em `lib/`.

```text
routes/ -> features/*/hooks -> services/ -> lib/api.ts -> API REST
```

## Estado dos testes

O projeto ainda não possui framework de testes automatizados configurado. A verificação funcional atual é manual e documentada em [manual-testing.md](manual-testing.md).
