// Display helpers. The API speaks integer MINOR units for money and integer
// BASE units for quantities (ml, pieces, g). Users must never see raw units, so
// every screen formats through these helpers and converts back on submit.

/**
 * Format integer minor units as a currency string. Money is stored as minor
 * units (value x 100) for every currency; we let Intl use each currency's
 * natural decimals, so UGX shows "UGX 15,000" while USD shows "$15,000.00".
 */
export function formatMoney(minor: number, currency = "UGX"): string {
  const major = minor / 100;
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      currencyDisplay: "code",
    }).format(major);
  } catch {
    // Unknown/invalid currency code: fall back to a plain number + code.
    return `${major.toLocaleString()} ${currency}`;
  }
}

/** Minor units -> major units, for editing in a form. */
export function minorToMajor(minor: number): number {
  return Math.round(minor) / 100;
}

/** Major units (what the user typed) -> integer minor units, for submit. */
export function majorToMinor(major: number): number {
  return Math.round(major * 100);
}

/** Millilitres -> litres for display. */
export function mlToLitres(ml: number): number {
  return ml / 1000;
}

/** Format millilitres as a friendly litre string, e.g. "12.5 L". */
export function formatLitres(ml: number, fractionDigits = 1): string {
  const litres = mlToLitres(ml);
  return `${litres.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: fractionDigits,
  })} L`;
}

/** Litres (typed) -> integer millilitres for submit. */
export function litresToMl(litres: number): number {
  return Math.round(litres * 1000);
}

/** Format a base-unit quantity with its unit label (e.g. "1,200 ml"). */
export function formatQuantity(quantity: number, unit: string): string {
  return `${quantity.toLocaleString()} ${unit}`;
}

// Stock items carry a base unit ("ml", "piece", "g"). For milk (ml) we present
// litres so the user never sees raw millilitres; other units pass through.
function baseFactor(unit: string): number {
  return unit === "ml" ? 1000 : 1;
}

/** Friendly label for a stock unit (ml -> L). */
export function displayUnitLabel(unit: string): string {
  return unit === "ml" ? "L" : unit;
}

/** Base-unit quantity -> the value shown/edited in the friendly unit. */
export function baseToDisplayQty(quantityBase: number, unit: string): number {
  return quantityBase / baseFactor(unit);
}

/** Friendly-unit value (what the user typed) -> integer base units for submit. */
export function displayQtyToBase(value: number, unit: string): number {
  return Math.round(value * baseFactor(unit));
}

/** Format a base-unit quantity in its friendly unit (e.g. "3 L", "12 piece"). */
export function formatUnitQty(quantityBase: number, unit: string): string {
  if (unit === "ml") return formatLitres(quantityBase);
  return `${quantityBase.toLocaleString()} ${unit}`;
}

/**
 * A price typed per friendly unit (e.g. per litre) -> integer minor units per
 * BASE unit, which is what the API stores. For milk this divides by 1000; pick
 * round per-litre prices to avoid sub-cent rounding.
 */
export function displayPriceToBaseMinor(pricePerDisplay: number, unit: string): number {
  return Math.round(majorToMinor(pricePerDisplay) / baseFactor(unit));
}

/** Inverse of displayPriceToBaseMinor, for showing a line's per-unit price. */
export function baseMinorToDisplayPrice(unitPriceMinorPerBase: number, unit: string): number {
  return minorToMajor(unitPriceMinorPerBase * baseFactor(unit));
}

const dateFmt = new Intl.DateTimeFormat(undefined, {
  year: "numeric",
  month: "short",
  day: "numeric",
});
const dateTimeFmt = new Intl.DateTimeFormat(undefined, {
  month: "short",
  day: "numeric",
  hour: "numeric",
  minute: "2-digit",
});

export function formatDate(iso: string | Date | null | undefined): string {
  if (!iso) return "-";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "-";
  return dateFmt.format(d);
}

export function formatDateTime(iso: string | Date | null | undefined): string {
  if (!iso) return "-";
  const d = typeof iso === "string" ? new Date(iso) : iso;
  if (Number.isNaN(d.getTime())) return "-";
  return dateTimeFmt.format(d);
}

/** A datetime-local input value (local time) -> ISO 8601 string for the API. */
export function localInputToIso(value: string): string {
  return new Date(value).toISOString();
}

/** Now as a value suitable for a <input type="datetime-local">. */
export function nowForInput(): string {
  const d = new Date();
  const off = d.getTimezoneOffset();
  const local = new Date(d.getTime() - off * 60_000);
  return local.toISOString().slice(0, 16);
}

/** ISO string -> a <input type="date"> value (YYYY-MM-DD). */
export function isoToDateInput(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

/** A <input type="date"> value -> ISO 8601 (midnight UTC), for the API. */
export function dateInputToIso(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}

/** Whole-year age from a date of birth, or null if unknown. */
export function ageInYears(dob: string | null | undefined): number | null {
  if (!dob) return null;
  const d = new Date(dob);
  if (Number.isNaN(d.getTime())) return null;
  const ms = Date.now() - d.getTime();
  if (ms < 0) return null;
  return Math.floor(ms / (365.25 * 86_400_000));
}
