import { z } from "zod";

export type SlotUpsert = {
  id: string;
  start: Date;
  end: Date;
  label?: string | null;
};

export const SlotUpsertSchema = z.object({
  id: z.string(),
  start: z.date(),
  end: z.date(),
  label: z.string().nullable().optional(),
});

export const saveAvailabilitySlotsSchema = z.object({
  upserted: z.array(SlotUpsertSchema),
  deletedIds: z.array(z.string()),
});

export type SaveAvailabilitySlotsType = z.infer<
  typeof saveAvailabilitySlotsSchema
>;

export const getAvailabilitySlotsSchema = z.object({
  from: z.date(),
  to: z.date(),
});

export type GetAvailabilitySlotsType = z.infer<
  typeof getAvailabilitySlotsSchema
>;
