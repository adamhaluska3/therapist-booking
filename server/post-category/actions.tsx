"use server";
import { revalidatePath } from "next/dist/server/web/spec-extension/revalidate";
import { requireAdmin } from "../auth";
import { addCategory, editCategory, removeCategory } from "./mutations";
import {
  addCategorySchema,
  editCategorySchema,
  removeCategorySchema,
} from "./schema";

export const AddCategoryAction = async (payload: any) => {
  await requireAdmin();
  addCategorySchema.parse(payload);
  const response = await addCategory(payload);
  revalidatePath("/admin/post-categories");
  return response;
};

export const EditCategoryAction = async (payload: any) => {
  await requireAdmin();
  editCategorySchema.parse(payload);
  const { id, ...data } = payload;
  const response = await editCategory(id, data);
  revalidatePath("/admin/post-categories");
  return response;
};

export const RemoveCategoryAction = async (payload: any) => {
  await requireAdmin();
  const { id } = payload;
  if (!id) {
    throw new Error("ID is required");
  }
  removeCategorySchema.parse(payload);
  const response = await removeCategory(id, payload.newCategoryId);
  revalidatePath("/admin/post-categories");
  return response;
};
