export function formatPrice(cents: number | null | undefined): string | null {
  if (cents == null) return null;
  return `${Math.round(cents / 100)} €`;
}

export function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
