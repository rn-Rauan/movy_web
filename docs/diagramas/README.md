# Diagramas do TCC (fontes "diagram-as-code")

Fontes versionadas dos diagramas do TCC. Cada um é exportado para **PDF vetorial**
(nítido na impressão) e colocado em `../imagens/`, de onde o `DOC-TCC.tex` os anexa
via `\includegraphics`.

Princípio: **exemplo legível no corpo + versão completa no anexo**. Diagrama cheio de
tudo fica ilegível impresso; por isso o corpo usa versões representativas.

## Arquivos

| Fonte                      | Tipo                 | Seção do TCC     | Papel                                                                      |
| -------------------------- | -------------------- | ---------------- | -------------------------------------------------------------------------- |
| `arquitetura.mmd`          | Mermaid flowchart    | 3.4 Arquitetura  | Camadas do cliente → API (Clean Arch.) → banco                             |
| `casos-de-uso.puml`        | PlantUML             | 3.2 Casos de uso | Exemplo: 4 atores + casos principais (lista exaustiva = Tabela RF)         |
| `classes-mapa.mmd`         | Mermaid classDiagram | 3.3 Classes      | Mapa panorâmico (entidades + associações, sem atributos)                   |
| `classes-ctx-reservas.mmd` | Mermaid classDiagram | 3.3 Classes      | Exemplo detalhado: contexto Reservas/Pagamentos (DDD: VOs, enums, métodos) |
| `der-simplificado.mmd`     | Mermaid erDiagram    | 3.5 DER          | Entidades + PK/FK (corpo, retrato)                                         |
| `der-completo.mmd`         | Mermaid erDiagram    | Anexo B          | Todas as colunas (paisagem)                                                |

## Como renderizar

**Mermaid (`.mmd`) → PDF vetorial** (recomendado — não pixeliza quando o LaTeX
escala a imagem). A flag `--pdfFit` recorta a página do PDF ao tamanho do diagrama
(sem ela o mmdc gera uma página A4 com o desenho minúsculo num canto — foi o que
"deu problema"):

```bash
cd docs/diagramas
npx -p @mermaid-js/mermaid-cli mmdc -i arquitetura.mmd          -o ../imagens/arquitetura.pdf          --pdfFit
npx -p @mermaid-js/mermaid-cli mmdc -i classes-mapa.mmd         -o ../imagens/classes-mapa.pdf         --pdfFit
npx -p @mermaid-js/mermaid-cli mmdc -i classes-ctx-reservas.mmd -o ../imagens/classes-ctx-reservas.pdf --pdfFit
npx -p @mermaid-js/mermaid-cli mmdc -i der-simplificado.mmd     -o ../imagens/der-simplificado.pdf     --pdfFit
npx -p @mermaid-js/mermaid-cli mmdc -i der-completo.mmd         -o ../imagens/der-completo.pdf         --pdfFit
```

O `\includegraphics{...pdf}` escala vetor sem perda — fica nítido em qualquer zoom.

**Fallback PNG de alta resolução** (se precisar mesmo de PNG): use escala alta e
fundo branco. Para os DER (largos), force também uma largura grande:

```bash
npx -p @mermaid-js/mermaid-cli mmdc -i der-completo.mmd -o ../imagens/der-completo.png -s 4 -w 3000 -b white
```

Alternativa sem instalar nada: colar em <https://mermaid.live> → ícone de export → **SVG**
(vetor) e converter o SVG para PDF (Inkscape/`rsvg-convert`). O PNG do mermaid.live
sai em baixa resolução e vai pixelar — evite para os DER.

**PlantUML (`.puml`) → PDF** (precisa de Java + `plantuml.jar`):

```bash
java -jar plantuml.jar -tpdf casos-de-uso.puml -o ../imagens
```

Alternativa: colar em <https://www.plantuml.com/plantuml> e exportar.

## Linhas a ajustar no DOC-TCC.tex (quando os PDFs existirem)

- **3.2** (linha ~252): `usecases_diagram.png` → `imagens/casos-de-uso.pdf`
- **3.3** (linha ~264): `diagrama de classes (mapa geral).png` → `imagens/classes-mapa.pdf`
  - inserir nova figura com `imagens/classes-ctx-reservas.pdf` (exemplo detalhado)
- **3.4**: adicionar figura nova com `imagens/arquitetura.pdf` (hoje a seção só tem blocos ASCII)
- **3.5** (linha ~284): `Subscription Payment-...png` → `imagens/der-simplificado.pdf`
- **Anexo B** (linha ~546): `der-completo.png` → `imagens/der-completo.pdf`

> Observação: o TeXpage/Overleaf não roda Mermaid/PlantUML nativamente — renderize os
> PDFs localmente (comandos acima) e faça upload deles na pasta `imagens/` do projeto.
