// Where to go after signing in. Only same-site paths, so a crafted link cannot
// send people to another website.
export function safeNext(value: string | null): string {
  return typeof value === "string" && /^\/(?![/\\])/.test(value) ? value : "/";
}
