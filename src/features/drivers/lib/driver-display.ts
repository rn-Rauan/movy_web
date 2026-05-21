import type { Driver } from "@/lib/types";

/**
 * Versão síncrona / string-only do display name — útil pra props como `textValue` ou `aria-label`
 * onde precisamos de texto puro (sem JSX). Usa apenas dados inline; não dispara busca.
 */
export function driverDisplayString(driver: Driver, fallback = "Motorista"): string {
  return driver.userName?.trim() || driver.userEmail?.trim() || fallback;
}
