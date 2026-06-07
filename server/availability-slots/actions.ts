import { requireAdmin } from "../auth";
import { saveAvailabilitySlots } from "./mutations";
import { getAvailabilitySlots } from "./queries";
import {
  getAvailabilitySlotsSchema,
  GetAvailabilitySlotsType,
  saveAvailabilitySlotsSchema,
  SaveAvailabilitySlotsType,
} from "./schema";

// Queries
export const getAvailabilitySlotsAction = async (
  payload: GetAvailabilitySlotsType,
) => {
  await requireAdmin();
  const validatedPayload = getAvailabilitySlotsSchema.parse(payload);
  return await getAvailabilitySlots(validatedPayload);
};

// Mutations
export const saveAvailabilitySlotsAction = async (
  payload: SaveAvailabilitySlotsType,
) => {
  await requireAdmin();
  const validatedPayload = saveAvailabilitySlotsSchema.parse(payload);
  return await saveAvailabilitySlots(validatedPayload);
};
