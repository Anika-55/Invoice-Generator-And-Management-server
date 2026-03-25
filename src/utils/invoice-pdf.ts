import PDFDocument from "pdfkit";
import type { Invoice, InvoiceItem, Client, User } from "@prisma/client";

type InvoiceWithRelations = Invoice & {
  items: InvoiceItem[];
  client: Client;
  user: User;
};

const formatMoney = (value: unknown) => {
  const numberValue = typeof value === "number" ? value : Number(value);
  return numberValue.toFixed(2);
};

export const generateInvoicePdfBuffer = async (invoice: InvoiceWithRelations) => {
  const doc = new PDFDocument({ margin: 50 });

  const chunks: Buffer[] = [];
  doc.on("data", (chunk) => chunks.push(chunk));

  const done = new Promise<Buffer>((resolve, reject) => {
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
  });

  doc.fontSize(20).text(invoice.user.companyName);
  doc.moveDown(0.5);
  doc.fontSize(12).text(`Invoice #: ${invoice.invoiceNumber}`);
  doc.text(`Status: ${invoice.status}`);
  doc.text(`Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}`);

  doc.moveDown();
  doc.fontSize(14).text("Bill To");
  doc.fontSize(12).text(invoice.client.name);
  doc.text(invoice.client.email);
  if (invoice.client.phone) {
    doc.text(invoice.client.phone);
  }
  if (invoice.client.address) {
    doc.text(invoice.client.address);
  }

  doc.moveDown();
  doc.fontSize(14).text("Items");

  const tableTop = doc.y + 10;
  const itemX = 50;
  const qtyX = 320;
  const priceX = 380;
  const totalX = 470;

  doc.fontSize(11).text("Description", itemX, tableTop);
  doc.text("Qty", qtyX, tableTop);
  doc.text("Price", priceX, tableTop);
  doc.text("Total", totalX, tableTop);

  let rowY = tableTop + 20;
  invoice.items.forEach((item) => {
    const lineTotal = Number(item.price) * item.quantity;
    doc.text(item.description, itemX, rowY, { width: 250 });
    doc.text(String(item.quantity), qtyX, rowY);
    doc.text(formatMoney(item.price), priceX, rowY);
    doc.text(formatMoney(lineTotal), totalX, rowY);
    rowY += 20;
  });

  doc.moveDown(2);
  const totalsY = Math.max(rowY + 10, doc.y + 10);
  doc.fontSize(12).text(`Subtotal: ${formatMoney(invoice.subtotal)}`, totalX, totalsY, {
    align: "right"
  });
  doc.text(`Tax: ${formatMoney(invoice.tax)}`, totalX, totalsY + 20, { align: "right" });
  doc.fontSize(13).text(`Total: ${formatMoney(invoice.total)}`, totalX, totalsY + 40, {
    align: "right"
  });

  doc.end();

  return done;
};
