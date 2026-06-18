"use server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { requireAdmin } from "../auth";
import { addCategory, editCategory, removeCategory } from "./mutations";
import {
  addCategorySchema,
  AddCategoryType,
  editCategorySchema,
  EditCategoryType,
  removeCategorySchema,
  RemoveCategoryType,
} from "./schema";

export const AddCategoryAction = async (payload: AddCategoryType) => {
  await requireAdmin();
  const validatedPayload = addCategorySchema.parse(payload);
  const response = await addCategory(validatedPayload);
  revalidatePath("/admin/post-categories");
  return response;
};

export const EditCategoryAction = async (payload: EditCategoryType) => {
  await requireAdmin();
  const validatedPayload = editCategorySchema.parse(payload);
  const response = await editCategory(validatedPayload);
  revalidatePath("/admin/post-categories");
  return response;
};

export const RemoveCategoryAction = async (payload: RemoveCategoryType) => {
  await requireAdmin();
  const validatedPayload = removeCategorySchema.parse(payload);
  const response = await removeCategory(validatedPayload);
  revalidatePath("/admin/post-categories");
  return response;
};
