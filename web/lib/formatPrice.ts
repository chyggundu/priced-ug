/** Price presentation, matching the mobile app's lib/formatPrice.ts. */
export const PRICE_TYPE_OPTIONS = [
  { value: "exact", label: "UGX" },
  { value: "from", label: "From UGX" },
  { value: "upto", label: "Up to UGX" },
] as const;

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

/** Opens a WhatsApp chat with a business, never the phone dialer. */
export function whatsappHref(phone: string, text?: string): string {
  const digits = phone.replace(/\D/g, "");
  const query = text ? `?text=${encodeURIComponent(text)}` : "";
  return `https://wa.me/${digits}${query}`;
}
