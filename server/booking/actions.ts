import { requireAdmin } from "../auth";
import {
  getBookingsWithUsers,
  getClientAbsolvedBookings,
  getDashboardBookingsFiltered,
  getFinishedBookingsFiltered,
} from "./queries";
import {
  BookingsDateFilterSchema,
  BookingsFilterSchema,
  ClientAbsolvedBookingsFilterSchema,
} from "./schema";

export const getDashboardBookingsFilteredAction = async (payload: any) => {
  await requireAdmin();
  const parsedPayload = BookingsFilterSchema.parse(payload);
  return await getDashboardBookingsFiltered(parsedPayload);
};

export const getFinishedBookingsFilteredAction = async (payload: any) => {
  await requireAdmin();
  const parsedPayload = BookingsFilterSchema.parse(payload);
  return await getFinishedBookingsFiltered(parsedPayload);
};

export const getBookingsWithUsersAction = async (payload: any) => {
  await requireAdmin();
  const parsedPayload = BookingsDateFilterSchema.parse(payload);
  return await getBookingsWithUsers(parsedPayload);
};

export const getClientAbsolvedBookingsAction = async (payload: any) => {
  await requireAdmin();
  const parsedPayload = ClientAbsolvedBookingsFilterSchema.parse(payload);
  return await getClientAbsolvedBookings(parsedPayload);
};
