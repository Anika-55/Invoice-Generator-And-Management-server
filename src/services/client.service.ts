import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";

type CreateClientInput = {
  name: string;
  email: string;
  phone?: string;
  address?: string;
};

type UpdateClientInput = Partial<CreateClientInput>;

export const createClient = async (userId: string, data: CreateClientInput) => {
  const client = await prisma.client.create({
    data: {
      ...data,
      userId
    }
  });

  return client;
};

export const listClients = async (userId: string, page: number, pageSize: number) => {
  const skip = (page - 1) * pageSize;

  const [items, total] = await prisma.$transaction([
    prisma.client.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: pageSize
    }),
    prisma.client.count({ where: { userId } })
  ]);

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  return {
    items,
    meta: {
      page,
      pageSize,
      total,
      totalPages
    }
  };
};

export const getClientById = async (userId: string, id: string) => {
  const client = await prisma.client.findFirst({
    where: { id, userId }
  });

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  return client;
};

export const updateClientById = async (
  userId: string,
  id: string,
  data: UpdateClientInput
) => {
  const client = await prisma.client.findFirst({
    where: { id, userId }
  });

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  return prisma.client.update({
    where: { id },
    data
  });
};

export const deleteClientById = async (userId: string, id: string) => {
  const client = await prisma.client.findFirst({
    where: { id, userId }
  });

  if (!client) {
    throw new AppError("Client not found", 404);
  }

  await prisma.client.delete({
    where: { id }
  });

  return { deleted: true };
};
