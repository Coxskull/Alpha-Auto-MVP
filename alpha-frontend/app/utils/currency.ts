export function formatCurrency(
  amount: number,
  currency: string
) {
  const locale =
    currency === "PHP"
      ? "en-PH"
      : currency === "MXN"
      ? "es-MX"
      : "en-US";

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}