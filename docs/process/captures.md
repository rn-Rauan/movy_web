# Guia de capturas de tela (Seção 3.6 — Interfaces)

As capturas devem ser salvas em `docs/imagens/` com **exatamente** os nomes abaixo (o
LaTeX já as referencia via `\IfFileExists`; enquanto o arquivo não existir, aparece um
marcador "[Captura de tela pendente]" no lugar, e o documento continua compilando).

## Cuidados (obrigatórios)

- Usar **dados fictícios** de demonstração.
- **Não** exibir tokens, e-mails reais, chaves de API, URLs privadas ou IDs sensíveis.
- App é _mobile-first_: prefira capturas em viewport estreito (≈ 390 px) para as telas
  de passageiro/motorista; o painel admin pode ser capturado um pouco mais largo.
- Exportar em PNG, nitidez alta (idealmente 2× / retina).

## Conjunto mínimo (6)

| Arquivo                 | Rota                         | Tela                              | RF evidenciados              |
| ----------------------- | ---------------------------- | --------------------------------- | ---------------------------- |
| `fe-catalogo.png`       | `/public/trip-instances`     | Catálogo público                  | RF04, RF07, RF22             |
| `fe-detalhe-viagem.png` | `/public/trip-instances/:id` | Detalhe público da viagem         | RF04, RF07                   |
| `fe-formulario.png`     | `/trips/:orgId/:tripId/book` | Formulário de inscrição           | RF07, RF09, RF10, RF24       |
| `fe-dashboard.png`      | `/dashboard`                 | Painel administrativo             | RF15, RF16, RF19             |
| `fe-gestao-viagens.png` | `/trips` (admin)             | Gestão de viagens                 | RF04, RF05, RF06, RF21, RF23 |
| `fe-operacional.png`    | `/trip/:tripId`              | Detalhe operacional (passageiros) | RF11, RF12, RF13, RF14, RF25 |

## Conjunto ideal (adiciona)

| Arquivo                    | Rota                           | Tela                     | RF evidenciados  |
| -------------------------- | ------------------------------ | ------------------------ | ---------------- |
| `fe-sucesso.png`           | `/bookings-success/:bookingId` | Confirmação da inscrição | RF07             |
| `fe-minhas-inscricoes.png` | `/my-bookings`                 | Minhas inscrições        | RF08             |
| `fe-detalhe-inscricao.png` | `/my-bookings/:bookingId`      | Detalhe da inscrição     | RF08             |
| `fe-gestao-templates.png`  | `/templates` (admin)           | Gestão de templates      | RF04, RF06, RF23 |
| `fe-motoristas.png`        | `/drivers` (admin)             | Gestão de motoristas     | RF03             |
| `fe-veiculos.png`          | `/vehicles` (admin)            | Gestão de veículos       | RF20             |
| `fe-motorista-viagens.png` | `/my-trips` (motorista)        | Viagens do motorista     | RF13, RF14       |

## Diagrama de casos de uso (re-render)

Fonte atualizada: `docs/diagramas/casos-de-uso.puml`. Renderize para
`docs/imagens/casos-de-uso.png` (o LaTeX usa esse nome; se ausente, cai no antigo
`diagrama de casos de uso.png`). Ex.:

```
java -jar plantuml.jar -tpng docs/diagramas/casos-de-uso.puml -o ../imagens
```

## Logo institucional

Salvar o logo vertical do IFPI em `docs/imagens/Logo-IFPI-Vertical.png` (usado na capa).
