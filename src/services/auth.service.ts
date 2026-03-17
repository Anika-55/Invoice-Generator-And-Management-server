import bcrypt from "bcryptjs";
import { prisma } from "../config/prisma.js";
import { AppError } from "../utils/app-error.js";
import { env } from "../config/env.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../utils/jwt.js";
import { generateToken, hashToken } from "../utils/token.js";

export const registerUser = async (
  email: string,
  password: string,
  name: string,
  companyName: string
) => {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new AppError("Email already in use", 409);
  }

  const passwordHash = await bcrypt.hash(password, 12);
  const user = await prisma.user.create({
    data: { email, passwordHash, name, companyName }
  });

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });
  const refreshTokenHash = hashToken(refreshToken);
  const refreshExpiresAt = new Date(
    Date.now() + parseJwtExpiryToMs(env.JWT_REFRESH_EXPIRES_IN)
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt: refreshExpiresAt
    }
  });
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      companyName: user.companyName
    }
  };
};

export const loginUser = async (email: string, password: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new AppError("Invalid credentials", 401);
  }

  const accessToken = signAccessToken({ userId: user.id });
  const refreshToken = signRefreshToken({ userId: user.id });
  const refreshTokenHash = hashToken(refreshToken);
  const refreshExpiresAt = new Date(
    Date.now() + parseJwtExpiryToMs(env.JWT_REFRESH_EXPIRES_IN)
  );

  await prisma.refreshToken.create({
    data: {
      tokenHash: refreshTokenHash,
      userId: user.id,
      expiresAt: refreshExpiresAt
    }
  });
  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      companyName: user.companyName
    }
  };
};

export const getCurrentUser = async (userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      id: true,
      email: true,
      name: true,
      companyName: true,
      createdAt: true
    }
  });

  if (!user) {
    throw new AppError("User not found", 404);
  }

  return user;
};

export const refreshSession = async (refreshToken: string) => {
  const payload = verifyRefreshToken(refreshToken);
  const tokenHash = hashToken(refreshToken);

  const stored = await prisma.refreshToken.findUnique({
    where: { tokenHash }
  });

  if (!stored || stored.revokedAt) {
    throw new AppError("Invalid refresh token", 401);
  }

  if (stored.expiresAt.getTime() < Date.now()) {
    throw new AppError("Refresh token expired", 401);
  }

  const accessToken = signAccessToken({ userId: payload.userId });
  const nextRefreshToken = signRefreshToken({ userId: payload.userId });
  const nextRefreshHash = hashToken(nextRefreshToken);
  const nextRefreshExpiresAt = new Date(
    Date.now() + parseJwtExpiryToMs(env.JWT_REFRESH_EXPIRES_IN)
  );

  await prisma.refreshToken.update({
    where: { tokenHash },
    data: { revokedAt: new Date() }
  });

  await prisma.refreshToken.create({
    data: {
      tokenHash: nextRefreshHash,
      userId: payload.userId,
      expiresAt: nextRefreshExpiresAt
    }
  });

  return { accessToken, refreshToken: nextRefreshToken };
};

export const createPasswordReset = async (email: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return { ok: true };
  }

  const rawToken = generateToken();
  const tokenHash = hashToken(rawToken);
  const expiresAt = new Date(
    Date.now() + env.RESET_TOKEN_EXPIRES_MINUTES * 60 * 1000
  );

  await prisma.passwordResetToken.create({
    data: {
      tokenHash,
      userId: user.id,
      expiresAt
    }
  });

  return { ok: true, resetToken: rawToken };
};

export const resetPassword = async (token: string, newPassword: string) => {
  const tokenHash = hashToken(token);
  const record = await prisma.passwordResetToken.findUnique({
    where: { tokenHash }
  });

  if (!record || record.usedAt) {
    throw new AppError("Invalid or used reset token", 400);
  }

  if (record.expiresAt.getTime() < Date.now()) {
    throw new AppError("Reset token expired", 400);
  }

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.$transaction([
    prisma.user.update({
      where: { id: record.userId },
      data: { passwordHash }
    }),
    prisma.passwordResetToken.update({
      where: { tokenHash },
      data: { usedAt: new Date() }
    })
  ]);

  return { ok: true };
};

const parseJwtExpiryToMs = (value: string) => {
  const match = value.match(/^(\d+)([smhd])$/);
  if (!match) {
    return 30 * 24 * 60 * 60 * 1000;
  }
  const amount = Number(match[1]);
  const unit = match[2];
  switch (unit) {
    case "s":
      return amount * 1000;
    case "m":
      return amount * 60 * 1000;
    case "h":
      return amount * 60 * 60 * 1000;
    case "d":
      return amount * 24 * 60 * 60 * 1000;
    default:
      return 30 * 24 * 60 * 60 * 1000;
  }
};
