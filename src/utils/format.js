function formatMoney(amount, currency = "THB") {
  const value = Number(amount);
  if (!Number.isFinite(value)) return String(amount ?? "");

  try {
    return new Intl.NumberFormat("th-TH", {
      style: "currency",
      currency,
      minimumFractionDigits: 2,
    }).format(value);
  } catch {
    return `${currency} ${value.toFixed(2)}`;
  }
}

module.exports = { formatMoney };
