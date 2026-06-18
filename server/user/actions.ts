"use server";

import { requireAdmin } from "../auth";
import { createNonOAuthUser, updateUserNickname } from "./mutations";
import { NonOAuthUserSchema, UserNicknameSchema } from "./schema";

export const updateUserNicknameAction = async (payload: any) => {
  await requireAdmin();
  const parsedPayload = UserNicknameSchema.parse(payload);
  return await updateUserNickname(parsedPayload);
};

export const createNonOAuthUserAction = async (payload: any) => {
  await requireAdmin();
  const parsedPayload = NonOAuthUserSchema.parse(payload);
  return await createNonOAuthUser(parsedPayload);
};
