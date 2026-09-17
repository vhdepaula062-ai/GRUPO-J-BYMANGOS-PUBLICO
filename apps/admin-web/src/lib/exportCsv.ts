/**
 * Utilitário de exportação universal de CSV compatível com Microsoft Excel (UTF-8 com BOM)
 */
export interface CsvColumn<T> {
  key: keyof T | string;
  header: string;
  format?: (value: any, item: T) => string;
}

export function exportToCsv<T extends Record<string, any>>(
  filename: string,
  columns: CsvColumn<T>[],
  data: T[]
): void {
  if (!data || data.length === 0) {
    alert("Não há dados para exportar com os filtros atuais.");
    return;
  }

  const escapeField = (val: any): string => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headers = columns.map((c) => escapeField(c.header)).join(";");

  const rows = data.map((item) => {
    return columns
      .map((col) => {
        const rawVal = (item as any)[col.key];
        const val = col.format ? col.format(rawVal, item) : rawVal;
        return escapeField(val);
      })
      .join(";");
  });

  // \uFEFF adiciona o Byte Order Mark (BOM) UTF-8 para o Excel abrir com acentuação correta
  const csvContent = "\uFEFF" + [headers, ...rows].join("\r\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);

  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
