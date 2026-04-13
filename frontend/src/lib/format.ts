const moneyFormatter = new Intl.NumberFormat("es-ES", {
  style: "currency",
  currency: "EUR",
  minimumFractionDigits: 2,
})

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
})

export function formatMoney(value: number) {
  return moneyFormatter.format(value)
}

export function formatDateTime(value: string) {
  return dateFormatter.format(new Date(value))
}
