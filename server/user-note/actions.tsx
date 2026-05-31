"use server";

import { requireAdmin } from "../auth";
import { deleteUserNote, saveUserNote } from "./mutations";
import { UserNoteIdSchema, UserNoteSchema } from "./schema";

export const saveUserNoteAction = async (payload: any) => {
  requireAdmin();
  UserNoteSchema.parse(payload);
  return saveUserNote(payload);
};

export const deleteUserNoteAction = async (payload: any) => {
  requireAdmin();
  UserNoteIdSchema.parse(payload);
  const { id } = payload;
  if (!id) throw new Error("ID is required");
  return deleteUserNote(id);
};
