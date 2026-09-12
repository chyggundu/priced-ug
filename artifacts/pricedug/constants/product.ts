/*
  The website's product form offers the same options from its own copy of this
  list. The two apps share no code by design, so a change here has to be made
  there as well.
*/
export const PRICE_TYPE_OPTIONS = [
  { value: "exact", label: "UGX" },
  { value: "from", label: "From UGX" },
  { value: "upto", label: "Up to UGX" },
] as const;

export const CONDITION_OPTIONS = ["New", "Slightly Used", "Used"] as const;

/** Renders a stored `price_type` as the prefix a buyer sees before the amount. */
export function priceLabel(price: string, priceType: string | null): string {
  if (priceType === "from") return `From UGX ${price}`;
  if (priceType === "upto") return `Up to UGX ${price}`;
  return `UGX ${price}`;
}
