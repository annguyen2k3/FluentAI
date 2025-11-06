// Format ISO string to date, example: 2025-10-29T07:15:22.701Z => 29/10/2025
export function formatISOStringToDate(isoString) {
  const date = new Date(isoString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}/${month}/${year}`
}

// Format ISO string to date time, example: 2025-10-29T07:15:22.701Z => 29/10/2025 07:15
export function formatISOStringToDateTime(isoString) {
  const date = new Date(isoString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Format ISO string to date input value, example: 2025-10-29T07:15:22.701Z => 2025-10-29
export function formatISOStringToDateInputValue(isoString) {
  return new Date(isoString).toISOString().split('T')[0]
}
