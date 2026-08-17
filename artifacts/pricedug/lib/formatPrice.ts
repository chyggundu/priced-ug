export const PRICE_TYPE_OPTIONS = [
  { value: "exact", label: "UGX" },
  { value: "from", label: "From UGX" },
  { value: "upto", label: "Up to UGX" },
] as const;

export type PriceType = (typeof PRICE_TYPE_OPTIONS)[number]["value"];

export function formatPrice(
  price: string | null | undefined,
  priceType: string | null | undefined,
): string | null {
  if (!price) return null;
  switch (priceType) {
    case "from":
      return `From UGX ${price}`;
    case "upto":
      return `Up to UGX ${price}`;
    default:
      return `UGX ${price}`;
  }
}
