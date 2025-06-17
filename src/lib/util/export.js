import ExcelJS from "exceljs";

export async function exportToExcel(data, filename) {
  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet("Relatório");

  // Adicionar cabeçalhos
  const headers = Object.keys(data[0]);
  worksheet.addRow(headers);

  // Adicionar dados
  data.forEach((row) => worksheet.addRow(Object.values(row)));

  // Salvar arquivo
  const buffer = await workbook.xlsx.writeBuffer();
  return { buffer, filename: `${filename}.xlsx` };
}
