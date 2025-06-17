import ExcelJS from "exceljs";
import { jsPDF } from "jspdf";

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

export async function exportToPDF(data, title, filename) {
  const doc = new jsPDF();

  // Cabeçalho
  doc.setFontSize(20);
  doc.text(title, 105, 20, { align: "center" });
  doc.setFontSize(12);
  doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 190, 30, {
    align: "right",
  });
  doc.setFontSize(14);
  doc.text("Ações Registradas", 20, 40);

  // Tabela
  const headers = ["ID Usuário", "Ação", "Detalhes", "Data/Hora"];
  const colWidths = [30, 40, 80, 40];
  let y = 50;

  // Cabeçalho da tabela
  doc.setFontSize(10);
  let x = 20;
  headers.forEach((header, i) => {
    doc.text(header, x, y);
    x += colWidths[i];
  });
  doc.line(20, y + 2, 190, y + 2); // Linha abaixo do cabeçalho

  // Dados da tabela
  y += 10;
  data.forEach((item) => {
    x = 20;
    doc.text(item.id_usuario.toString(), x, y);
    x += colWidths[0];
    doc.text(item.acao, x, y);
    x += colWidths[1];
    doc.text(item.detalhes, x, y, { maxWidth: colWidths[2] });
    x += colWidths[2];
    doc.text(new Date(item.data_hora).toLocaleString("pt-BR"), x, y);
    y += 10;
    doc.line(20, y, 190, y); // Linha separadora
  });

  // Gerar buffer
  const buffer = doc.output("arraybuffer");
  return { buffer: Buffer.from(buffer), filename: `${filename}.pdf` };
}
