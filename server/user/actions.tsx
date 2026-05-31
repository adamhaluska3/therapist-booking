"use server";

import { requireAdmin } from "../auth";
import { createNonOAuthUser, updateUserNickname } from "./mutations";
import {
  NonOAuthUserPayload,
  NonOAuthUserSchema,
  UserNicknamePayload,
  UserNicknameSchema,
} from "./schema";

export const updateUserNicknameAction = async (
  payload: UserNicknamePayload,
) => {
  requireAdmin();
  UserNicknameSchema.parse(payload);
  if (!payload.userId) throw new Error("User ID is required");
  return await updateUserNickname(payload.userId, payload.nickname);
};

export const createNonOAuthUserAction = async (
  payload: NonOAuthUserPayload,
) => {
  requireAdmin();
  NonOAuthUserSchema.parse(payload);
  return await createNonOAuthUser(payload.name, payload.email, payload.phone);
};
