/** Оставляет только цифры в строке зарплаты. */
export function sanitizeSalaryDigits(raw: string): string {
  return raw.replace(/\D/g, '');
}

/** Отображение: `$260000` или пусто. */
export function formatSalaryDisplay(digits: string | undefined): string | undefined {
  const clean = sanitizeSalaryDigits(digits ?? '');
  return clean ? `$${clean}` : undefined;
}
