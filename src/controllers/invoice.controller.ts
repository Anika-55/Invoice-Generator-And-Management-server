import type { Request, Response } from "express";
import { Resend } from "resend";
import { getInvoiceForPdf } from "../services/invoice.service.js";
import { AppError } from "../utils/app-error.js";
import { sendSuccess } from "../utils/response.js";
import { generateInvoicePdfBuffer } from "../utils/invoice-pdf.js";
import { env } from "../config/env.js";

export const downloadInvoicePdf = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { id } = req.params as { id: string };
  const invoice = await getInvoiceForPdf(userId, id);

  const fileName = `invoice-${invoice.invoiceNumber}.pdf`;

  const pdfBuffer = await generateInvoicePdfBuffer(invoice);

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader("Content-Disposition", `attachment; filename=\"${fileName}\"`);
  res.send(pdfBuffer);
};

export const sendInvoiceEmail = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { id } = req.params as { id: string };
  const invoice = await getInvoiceForPdf(userId, id);
  const pdfBuffer = await generateInvoicePdfBuffer(invoice);

  const paymentLink = `${env.PAYMENT_LINK_BASE.replace(/\/$/, "")}/invoices/${invoice.id}/pay`;

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; color: #111;">
      <h2 style="margin-bottom: 8px;">Invoice ${invoice.invoiceNumber}</h2>
      <p>Hello ${invoice.client.name},</p>
      <p>Please find your invoice attached. You can pay using the link below:</p>
      <p><a href="${paymentLink}">${paymentLink}</a></p>
      <h3>Summary</h3>
      <ul>
        <li>Subtotal: ${invoice.subtotal}</li>
        <li>Tax: ${invoice.tax}</li>
        <li>Total: ${invoice.total}</li>
        <li>Due Date: ${new Date(invoice.dueDate).toLocaleDateString()}</li>
      </ul>
      <p>Thank you,<br/>${invoice.user.companyName}</p>
    </div>
  `;

  const resend = new Resend(env.RESEND_API_KEY);
  const fileName = `invoice-${invoice.invoiceNumber}.pdf`;

  await resend.emails.send({
    from: env.EMAIL_FROM,
    to: invoice.client.email,
    subject: `Invoice ${invoice.invoiceNumber} from ${invoice.user.companyName}`,
    html: emailHtml,
    attachments: [
      {
        filename: fileName,
        content: pdfBuffer.toString("base64"),
        contentType: "application/pdf"
      }
    ]
  });

  return sendSuccess(res, { sent: true }, "Invoice sent");
};
