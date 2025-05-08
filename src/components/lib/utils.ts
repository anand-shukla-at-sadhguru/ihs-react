export function cn(...args: any[]) {
  return args
    .flat(Infinity)
    .filter(Boolean)
    .join(" ");
}
