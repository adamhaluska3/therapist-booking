"use server";

import { requireAdmin } from "../auth";
import { deleteUserNote, saveUserNote } from "./mutations";
import { UserNotePayload, UserNoteSchema } from "./schema";

export const saveUserNoteAction = async (payload: UserNotePayload) => {
  requireAdmin();
  UserNoteSchema.parse(payload);
  return saveUserNote(payload);
};

export const deleteUserNoteAction = async (id: string) => {
  requireAdmin();
  if (!id) throw new Error("ID is required");
  return deleteUserNote(id);
};
