import { randomBytes } from "crypto";

const toSlug = (title: string) => {
  return title
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]/g, "");
};

const generateSlug = (title: string, isPublic: boolean) => {
  if (!isPublic || !title.trim()) {
    return randomBytes(16).toString("hex");
  }
  return toSlug(title);
};

export { generateSlug };
