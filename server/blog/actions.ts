import { requireAdmin } from "../auth";
import {
  createPost,
  deletePost,
  setPostPublicity,
  updatePost,
} from "./mutations";
import {
  createPostSchema,
  CreatePostType,
  deletePostSchema,
  DeletePostType,
  setPublicitySchema,
  SetPublicityType,
  updatePostSchema,
  UpdatePostType,
} from "./schema";

export const createPostAction = async (payload: CreatePostType) => {
  await requireAdmin();
  const validatedPayload = createPostSchema.parse(payload);
  const response = await createPost(validatedPayload);
  return response;
};

export const updatePostAction = async (payload: UpdatePostType) => {
  await requireAdmin();
  const validatedPayload = updatePostSchema.parse(payload);
  const response = await updatePost(validatedPayload);
  return response;
};

export const deletePostAction = async (payload: DeletePostType) => {
  await requireAdmin();
  const validatedPayload = deletePostSchema.parse(payload);
  const response = await deletePost(validatedPayload);
  return response;
};

export const setPostPublicityAction = async (payload: SetPublicityType) => {
  await requireAdmin();
  const validatedPayload = setPublicitySchema.parse(payload);
  const response = await setPostPublicity(validatedPayload);
  return response;
};
