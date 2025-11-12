// Format example: 2025-10-29T07:15:22.701Z => 29/10/2025 07:15
export function isoStringToDateTime(isoString: Date): string {
  const date = new Date(isoString)

  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')

  return `${day}/${month}/${year} ${hours}:${minutes}`
}

// Format example: 2025-10-29T07:15:22.701Z => 29/10/2025
export function isoStringToDate(isoString: Date): string {
  const date = new Date(isoString)
  const day = String(date.getDate()).padStart(2, '0')
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()
  return `${day}-${month}-${year}`
}

// Format example: 2025-10-29T07:15:22.701Z => 2025-10-29
export function isoStringToDateInputValue(isoString: Date): string {
  return new Date(isoString).toISOString().split('T')[0]
}

// Create slug from text, example: "Hello World" => "hello-world-1731369322701"
export function createSlug(text: string): string {
  return (
    text
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .replace(/[^a-z0-9\s-]/g, '')
      .trim()
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-') +
    '-' +
    new Date().getTime()
  )
}
