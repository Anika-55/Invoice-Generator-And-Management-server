import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

export const getInvoiceForPdf = async (userId: string, invoiceId: string) => {
  const invoice = await prisma.invoice.findFirst({
    where: {
      id: invoiceId,
      userId
    },
    include: {
      client: true,
      items: true,
      user: true
    }
  });

  if (!invoice) {
    throw new AppError("Invoice not found", 404);
  }

  return invoice;
};
