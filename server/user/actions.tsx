"use server";

import { requireAdmin } from "../auth";
import { createNonOAuthUser, updateUserNickname } from "./mutations";
import { NonOAuthUserSchema, UserNicknameSchema } from "./schema";

export const updateUserNicknameAction = async (payload: any) => {
  requireAdmin();
  UserNicknameSchema.parse(payload);
  if (!payload.userId) throw new Error("User ID is required");
  return await updateUserNickname(payload.userId, payload.nickname);
};

export const createNonOAuthUserAction = async (payload: any) => {
  requireAdmin();
  NonOAuthUserSchema.parse(payload);
  return await createNonOAuthUser(payload.name, payload.email, payload.phone);
};
