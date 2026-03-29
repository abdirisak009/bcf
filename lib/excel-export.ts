import * as XLSX from 'xlsx'

export type ExcelSheet = {
  name: string
  /** Rows as array-of-arrays (first cells = top-left). */
  rows: (string | number | null | undefined)[][]
}

/** Build a multi-sheet .xlsx and trigger browser download. */
export function downloadExcelFile(filename: string, sheets: ExcelSheet[]): void {
  const wb = XLSX.utils.book_new()
  for (const s of sheets) {
    const name = s.name.replace(/[*?:/\\[\]]/g, '').trim().slice(0, 31) || 'Sheet'
    const ws = XLSX.utils.aoa_to_sheet(s.rows)
    const maxCols = Math.max(1, ...s.rows.map((r) => r.length))
    ws['!cols'] = Array.from({ length: maxCols }, (_, i) => {
      const sample = s.rows.map((row) => String(row[i] ?? ''))
      const wch = Math.min(48, Math.max(10, ...sample.map((c) => Math.min(c.length, 40))))
      return { wch }
    })
    XLSX.utils.book_append_sheet(wb, ws, name)
  }
  const out = filename.toLowerCase().endsWith('.xlsx') ? filename : `${filename}.xlsx`
  XLSX.writeFile(wb, out)
}

export function formatMoneyCell(n: number, currency = 'USD'): string {
  if (!Number.isFinite(n)) return '—'
  return `${n.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })} ${currency}`
}
