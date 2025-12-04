/**
 * Helpers para formato de placa LLLNLNN (ex.: ABC1D23)
 */
export const PLATE_REGEX = /^[A-Z]{3}[0-9][A-Z][0-9]{2}$/;

export function normalizePlate(input = ""): string {
  return String(input)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 7);
}

export function isPlateValid(input = ""): boolean {
  return PLATE_REGEX.test(normalizePlate(input));
}

/** Exibição: se quiser com hífen troque a implementação */
export function formatPlateDisplay(input = ""): string {
  const p = normalizePlate(input);
  if (!p) return "";
  // Ex.: ABC1D23 (sem hífen). Se quiser com hífen: return `${p.slice(0,3)}-${p.slice(3)}`
  return p;
}