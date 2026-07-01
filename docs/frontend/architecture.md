# Arquitetura do Frontend

O frontend segue uma arquitetura em módulos de feature. A separação principal é entre rotas, casos de uso de tela, services de API, componentes de apresentação e infraestrutura compartilhada.

## Camadas

| Camada              | Pasta            | Responsabilidade                                                               |
| ------------------- | ---------------- | ------------------------------------------------------------------------------ |
| Rotas               | `src/routes`     | Controladores finos, parâmetros de rota, guards herdados e composição da tela. |
| Features            | `src/features`   | Hooks de caso de uso e componentes ligados a um domínio.                       |
| Services            | `src/services`   | Abstração das chamadas HTTP para a API.                                        |
| Componentes globais | `src/components` | Layout, feedback, primitivas visuais e shadcn/ui.                              |
| Infra compartilhada | `src/lib`        | Cliente HTTP, contextos, tipos, formatação, timezone e tratamento de erros.    |

## Fluxo de Dados

```text
Rota
  -> hook de feature
    -> service
      -> lib/api.ts
        -> API REST
```

As regras de negócio autoritativas pertencem ao backend. O frontend valida entradas para feedback rápido, organiza estado de tela e apresenta os fluxos ao usuário.

## Rotas Como Controladores Finos

Uma rota deve:

- Ler parâmetros e search params.
- Invocar hooks.
- Escolher entre carregamento, erro, vazio e conteúdo.
- Delegar renderização para componentes.

Uma rota não deve:

- Fazer chamadas HTTP diretamente.
- Duplicar lógica de autorização.
- Concentrar regra de negócio que já existe no backend.

## Feature Modules

Cada feature agrupa hooks e componentes por domínio:

- `bookings`: inscrições, detalhes, formulário e linhas operacionais.
- `trips`: catálogo público, viagens admin, detalhe operacional e viagens do motorista.
- `drivers`: perfil do motorista, listagem admin, vínculo e remoção.
- `organizations`: organizações protegidas e públicas.
- `templates`: modelos de rota e geração manual de instâncias.
- `vehicles`: frota.
- `scheduling`: configuração de geração automática.
- `subscriptions`: assinaturas.
- `financial`: agregações financeiras no cliente.

## Infraestrutura Compartilhada

Arquivos centrais:

- `src/lib/api.ts`: cliente HTTP, token storage, auto-refresh e `ApiError`.
- `src/lib/auth-context.tsx`: sessão do usuário.
- `src/lib/role-context.tsx`: papéis e organização administrativa.
- `src/lib/handle-error.ts`: tradução de erros de domínio para mensagens de UI.
- `src/lib/types.ts`: tipos TypeScript do domínio consumidos pelo frontend.
- `src/lib/format.ts`: formatação de status, datas e valores.
- `src/lib/timezone.ts`: conversão entre horário de Brasília e UTC para horários recorrentes.
