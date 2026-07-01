# Desenvolvimento

## Pré-requisitos

- Node.js 20 ou superior.
- npm.
- Backend configurado em `VITE_API_URL`.

O repositório possui lockfile do Bun por histórico do projeto, mas os scripts oficiais usam npm.

## Setup Local

```bash
npm install
cp .env.example .env
npm run dev
```

Por padrão, a API local esperada é:

```env
VITE_API_URL=http://localhost:5701
```

## Scripts

| Comando                | Uso                                 |
| ---------------------- | ----------------------------------- |
| `npm run dev`          | Servidor local Vite/TanStack Start. |
| `npm run build`        | Build de produção.                  |
| `npm run build:dev`    | Build em modo development.          |
| `npm run preview`      | Preview local do build.             |
| `npm run lint`         | ESLint.                             |
| `npm run format`       | Prettier com escrita.               |
| `npm run format:check` | Prettier somente verificação.       |

## Convenções Importantes

- Use o alias `@/*` para imports a partir de `src/*`.
- Não edite `src/components/ui/` manualmente; componentes shadcn/ui devem ser adicionados via CLI.
- Não adicione plugins manualmente em `vite.config.ts`; o preset `@lovable.dev/vite-tanstack-config` já configura o necessário.
- Não chame `api()` diretamente em rotas ou componentes; crie ou reutilize um service em `src/services`.
- Não duplique lógica de fetch entre rotas; crie ou reutilize hooks de feature.
- Não duplique guards de autenticação; use os layouts `_protected`, `_admin` e `_driver`.

## Como Adicionar Uma Feature

1. Crie ou reaproveite um service em `src/services`.
2. Crie um hook de caso de uso em `src/features/<feature>/hooks`.
3. Crie componentes de apresentação em `src/features/<feature>/components`.
4. Crie a rota em `src/routes` usando o padrão file-based do TanStack Router.
5. Deixe a rota responsável apenas por parâmetros, composição de hooks e escolha de estados de UI.

## Arquivos Gerados

`src/routeTree.gen.ts` é gerado automaticamente pelo plugin do TanStack Router. Não edite esse arquivo manualmente.
