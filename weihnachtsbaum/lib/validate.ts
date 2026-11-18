/** kleine Helfer für Formulareingaben (Server) */
export function text(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim().slice(0, max) : '';
}
export function multiline(value: unknown, max: number): string {
  return typeof value === 'string' ? value.replace(/\r/g, '').trim().slice(0, max) : '';
}
export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value) && value.length <= 200;
}
export function isPhone(value: string): boolean {
  return /^[+\d][\d\s/()-]{5,24}$/.test(value);
}
