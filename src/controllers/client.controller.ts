import type { Request, Response } from "express";
import {
  createClient,
  deleteClientById,
  getClientById,
  listClients,
  updateClientById
} from "../services/client.service.js";
import { sendSuccess } from "../utils/response.js";
import { AppError } from "../utils/app-error.js";

export const create = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const client = await createClient(userId, req.body);
  return sendSuccess(res, client, "Client created");
};

export const list = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { page, pageSize } = req.query as { page: number; pageSize: number };
  const result = await listClients(userId, page, pageSize);
  return sendSuccess(res, result, "Clients fetched");
};

export const getById = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { id } = req.params as { id: string };
  const client = await getClientById(userId, id);
  return sendSuccess(res, client, "Client fetched");
};

export const updateById = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { id } = req.params as { id: string };
  const client = await updateClientById(userId, id, req.body);
  return sendSuccess(res, client, "Client updated");
};

export const removeById = async (req: Request, res: Response) => {
  const userId = req.user?.id;
  if (!userId) {
    throw new AppError("Unauthorized", 401);
  }

  const { id } = req.params as { id: string };
  const result = await deleteClientById(userId, id);
  return sendSuccess(res, result, "Client deleted");
};
