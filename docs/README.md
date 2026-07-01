# Documentação do Movy Web

Esta pasta reúne a documentação do frontend do Movy e os materiais de apoio do projeto. A documentação oficial fica separada dos anexos do TCC e dos registros históricos para evitar leitura de arquivos desatualizados.

## Leitura Recomendada

| Documento                                                  | Uso                                                               |
| ---------------------------------------------------------- | ----------------------------------------------------------------- |
| [frontend/README.md](frontend/README.md)                   | Ponto de entrada da documentação técnica do frontend.             |
| [frontend/development.md](frontend/development.md)         | Setup local, scripts, variáveis e convenções de trabalho.         |
| [frontend/architecture.md](frontend/architecture.md)       | Organização em rotas, features, services, componentes e `lib`.    |
| [frontend/routes.md](frontend/routes.md)                   | Mapa atual de rotas públicas, protegidas, admin e motorista.      |
| [frontend/auth-and-access.md](frontend/auth-and-access.md) | Autenticação, sessão, RBAC e guards de rota.                      |
| [frontend/api-integration.md](frontend/api-integration.md) | Cliente HTTP, services, tratamento de erros e contrato com a API. |
| [frontend/components.md](frontend/components.md)           | Padrões de UI, layout, shadcn/ui e componentes reutilizáveis.     |
| [frontend/testing.md](frontend/testing.md)                 | Estratégia de verificação e relação com o roteiro manual.         |
| [frontend/deployment.md](frontend/deployment.md)           | Deploy do frontend em Cloudflare Workers.                         |

## Referências

| Documento                                                | Uso                                                |
| -------------------------------------------------------- | -------------------------------------------------- |
| [reference/api-frontend.md](reference/api-frontend.md)   | Contrato detalhado da API consumida pelo frontend. |
| [adr/decisions.md](adr/decisions.md)                     | Decisões arquiteturais relevantes do frontend.     |
| [frontend/manual-testing.md](frontend/manual-testing.md) | Roteiro de testes manuais E2E.                     |

## Processos

| Documento                                                                    | Uso                                                            |
| ---------------------------------------------------------------------------- | -------------------------------------------------------------- |
| [process/captures.md](process/captures.md)                                   | Guia de capturas de tela usadas no relatório/TCC.              |
| [process/deploy-cloudflare-workers.md](process/deploy-cloudflare-workers.md) | Registro do deploy do frontend na Cloudflare.                  |
| [process/deploy-neon-render.md](process/deploy-neon-render.md)               | Registro do ambiente online com API no Render e banco no Neon. |

## TCC

O TCC em LaTeX continua em [doc-tcc.tex](doc-tcc.tex), com seções em [sections/](sections/) e imagens em [imagens/](imagens/). Rascunhos auxiliares em Markdown foram isolados em [tcc/](tcc/).

## Arquivo Histórico

Materiais antigos, handoffs e protótipos foram movidos para [archive/](archive/). Eles não devem ser usados como fonte atual de implementação.
