import { z } from "zod";

export type BookingUser = {
  id: string;
  name: string;
  nickname: string | null;
  email: string;
};

export type ClientTableRow = {
  id: string;
  name: string;
  avatarUrl: string | null;
  lastSessionAt: number | null;
  totalSessions: number;
};

export type UserOption = {
  id: string;
  name: string;
  nickname: string | null;
  email: string;
};

export const UserNicknameSchema = z.object({
  userId: z.string(),
  nickname: z.string().max(100, "Prezývka musí byť kratšia než 100 znakov"),
});

export const NonOAuthUserSchema = z.object({
  name: z
    .string()
    .min(1, "Meno je povinné")
    .max(100, "Meno musí být kratší než 100 znaků"),
  email: z
    .email("Neplatný email")
    .max(255, "Email musí být kratší než 255 znaků"),
  phone: z
    .string()
    .max(20, "Telefonní číslo musí být kratší než 20 znaků")
    .optional(),
});

export type UserNicknamePayload = z.infer<typeof UserNicknameSchema>;
export type NonOAuthUserPayload = z.infer<typeof NonOAuthUserSchema>;
