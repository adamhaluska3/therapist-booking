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
  nickname: z
    .string()
    .max(100, "Prezývka musí byť kratšia než 100 znakov")
    .nullable(),
});

export const NonOAuthUserSchema = z.object({
  name: z
    .string()
    .min(1, "Meno je povinné")
    .max(100, "Meno musí byť kratšie než 100 znakov"),
  email: z
    .email("Neplatný email")
    .max(255, "Email musí byť kratší než 255 znakov"),
  phone: z
    .string()
    .max(20, "Telefónne číslo musí byť kratšie než 20 znakov")
    .optional(),
});

export type UserNicknameType = z.infer<typeof UserNicknameSchema>;
export type NonOAuthUserType = z.infer<typeof NonOAuthUserSchema>;
