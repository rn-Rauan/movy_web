# Handoff — movy

> Arquivo histórico. Este pacote foi preservado como referência visual antiga e não deve ser usado como fonte atual de implementação sem comparação com `docs/frontend`.

Redesign do app de gestão de viagens (admin / operador de empresa de transporte). Pacote estruturado para implementação assistida por agente.

## Como usar este pacote

- **`preview.html`** — abra no navegador para ver TODAS as telas lado a lado. Use isso como referência visual.
- **`screens/`** — uma pasta com **um markdown por tela**. Cada arquivo é curto e auto-contido. Peça ao agente para ler **uma tela por vez** ao implementar.
- **`tokens.md`** — paleta, tipografia, espaçamentos, raios. Implementar primeiro.
- **`components.md`** — componentes compartilhados (StatusPill, Route, Card, etc) usados em várias telas. Implementar antes das telas.
- **`source/`** — código JSX exato dos protótipos. Use como referência pixel-perfect quando o markdown não bastar.

## Sobre os arquivos de design

Os arquivos em `source/` e `preview.html` são **referências de design feitas em HTML/React** — protótipos mostrando aparência e comportamento, **não código de produção**. A tarefa é **recriar esses designs no codebase de destino** usando o framework já estabelecido (React Native, Flutter, Vue, etc.) e os padrões/bibliotecas existentes.

## Fidelidade

**Alta fidelidade.** Cores, tipografia, espaçamentos e radii são finais. Implementar pixel-perfect usando o sistema de design existente do codebase (substituir tokens onde houver equivalente).

## Ordem de implementação sugerida

1. `tokens.md` — adicionar paleta e tipografia ao tema
2. `components.md` — implementar átomos compartilhados
3. `screens/01-dashboard.md` — a home (sem ela nada funciona)
4. `screens/02-viagens.md` — listagem
5. `screens/05-trip-detail.md` — detalhe
6. `screens/06-modal-new-trip.md` + `screens/07-modal-new-template.md` — criação
7. `screens/03-empresa.md` + `screens/04-perfil.md` — perfil/empresa
8. `screens/08-report-finance.md` ou `09-report-ops.md` — relatório completo (escolher uma variação)

## Índice de telas

| #   | Arquivo                                                              | Tela                   | Tipo                     |
| --- | -------------------------------------------------------------------- | ---------------------- | ------------------------ |
| 01  | [screens/01-dashboard.md](screens/01-dashboard.md)                   | Dashboard (home)       | Full screen              |
| 02  | [screens/02-viagens.md](screens/02-viagens.md)                       | Lista de viagens       | Full screen              |
| 03  | [screens/03-empresa.md](screens/03-empresa.md)                       | Empresa                | Full screen              |
| 04  | [screens/04-perfil.md](screens/04-perfil.md)                         | Perfil                 | Full screen              |
| 05  | [screens/05-trip-detail.md](screens/05-trip-detail.md)               | Detalhe da viagem      | Full screen              |
| 06  | [screens/06-modal-new-trip.md](screens/06-modal-new-trip.md)         | Nova viagem            | Bottom sheet             |
| 07  | [screens/07-modal-new-template.md](screens/07-modal-new-template.md) | Novo template          | Bottom sheet             |
| 08  | [screens/08-report-finance.md](screens/08-report-finance.md)         | Relatório · Financeiro | Full screen (variação A) |
| 09  | [screens/09-report-ops.md](screens/09-report-ops.md)                 | Relatório · Operação   | Full screen (variação B) |

## Navegação principal

Bottom-nav fixa com 5 itens: **Dashboard · Viagens · Templates · Empresa · Perfil**.

Fluxos:

- Dashboard → botão "Ver relatório completo" → tela 08 (ou 09)
- Viagens → toque em item → tela 05 (Detalhe)
- Viagens → botão "+" → tela 06 (modal Nova viagem)
- Templates → botão "+" → tela 07 (modal Novo template)
- Detalhe → ação "Confirmar" → atualiza status
- Detalhe → ação "Cancelar" → confirmação + atualiza status

## Tamanho de referência

Todas as telas foram desenhadas para **390×844px** (iPhone 14/15). Densidade mobile.
