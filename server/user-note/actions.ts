"use server";

import { requireAdmin } from "../auth";
import { deleteUserNote, saveUserNote } from "./mutations";
import {
  UserNoteIdSchema,
  UserNoteIdType,
  UserNoteSchema,
  UserNoteType,
} from "./schema";

export const saveUserNoteAction = async (payload: UserNoteType) => {
  await requireAdmin();
  const parsedPayload = UserNoteSchema.parse(payload);
  return saveUserNote(parsedPayload);
};

export const deleteUserNoteAction = async (payload: UserNoteIdType) => {
  await requireAdmin();
  const parsedPayload = UserNoteIdSchema.parse(payload);
  return deleteUserNote(parsedPayload.id);
};
