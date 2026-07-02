// "073 123 4567" / "27731234567" / "+27 73 123 4567" -> "+27731234567"
export function normalizeSaPhone(input: string): string | null {
  const digits = input.replace(/[\s\-().]/g, "");
  let rest: string;
  if (digits.startsWith("+27")) rest = digits.slice(3);
  else if (digits.startsWith("27")) rest = digits.slice(2);
  else if (digits.startsWith("0")) rest = digits.slice(1);
  else return null;
  return /^[1-9][0-9]{8}$/.test(rest) ? `+27${rest}` : null;
}
