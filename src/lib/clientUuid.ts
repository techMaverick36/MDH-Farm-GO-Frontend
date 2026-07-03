// Creates indempotency keys for retryable creates (milk, deliveries, delivery
// confirmation, payments). The API dedupes on this UUID, so a retried submit
// after a dropped connection returns the original record instead of a duplicate.
export function newClientUuid(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for older browsers.
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
