import type { CnhCategory } from "./types";

/**
 * Regra de negócio das categorias de CNH:
 * - uma única categoria (A, B, C, D ou E), OU
 * - a categoria A combinada com exatamente uma outra (AB, AC, AD, AE).
 * Só a categoria A pode ser combinada; o limite total é 2.
 */
export const MAX_CNH_CATEGORIES = 2;

export const CNH_COMBO_MESSAGE =
  "Apenas a categoria A combina com outra (ex.: AB, AC). Máximo de 2 categorias.";

/** Valida a combinação selecionada (não checa o caso vazio — use `.min(1)` no schema). */
export function isValidCnhCombination(cats: CnhCategory[]): boolean {
  if (cats.length === 1) return true;
  return cats.length === MAX_CNH_CATEGORIES && cats.includes("A");
}

/**
 * Pode marcar `cat` dado o estado atual `value`? Usado para desabilitar checkboxes que
 * formariam uma combinação inválida.
 * - já marcado → true (permite desmarcar);
 * - nada marcado → true;
 * - par completo (2) → false para os demais;
 * - exatamente 1 marcado → só forma par com A (a categoria marcada é A, ou estamos marcando A).
 */
export function canSelectCnhCategory(value: CnhCategory[], cat: CnhCategory): boolean {
  if (value.includes(cat)) return true;
  if (value.length === 0) return true;
  if (value.length >= MAX_CNH_CATEGORIES) return false;
  return cat === "A" || value[0] === "A";
}
