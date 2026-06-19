"use server";

import { requireAdmin, requireUser } from "../auth";
import {
  cancelClientBooking,
  confirmBooking,
  createAdminBooking,
  createClientBooking,
  deleteBookingWithNotification,
  updateBookingFromDialog,
  updateBookingStatus,
} from "./mutations";
import {
  getBookingsWithUsers,
  getClientAbsolvedBookings,
  getDashboardBookingsFiltered,
  getFinishedBookingsFiltered,
} from "./queries";
import {
  BookingsDateFilterSchema,
  BookingsFilterSchema,
  cancelClientBookingSchema,
  CancelClientBookingType,
  ClientAbsolvedBookingsFilterSchema,
  confirmBookingSchema,
  ConfirmBookingType,
  createAdminBookingInputSchema,
  CreateAdminBookingType,
  createClientBookingSchema,
  CreateClientBookingType,
  deleteBookingSchema,
  DeleteBookingType,
  updateBookingFromDialogSchema,
  UpdateBookingFromDialogType,
  updateBookingStatusSchema,
  UpdateBookingStatusType,
} from "./schema";

// Queries
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

// Mutations
export const createAdminBookingAction = async (
  payload: CreateAdminBookingType,
) => {
  await requireAdmin();
  const parsedPayload = createAdminBookingInputSchema.parse(payload);
  return await createAdminBooking(parsedPayload);
};

export const deleteBookingWithNotificationAction = async (
  payload: DeleteBookingType,
) => {
  await requireAdmin();
  const parsedPayload = deleteBookingSchema.parse(payload);
  return await deleteBookingWithNotification(parsedPayload);
};

export const updateBookingStatusAction = async (
  payload: UpdateBookingStatusType,
) => {
  await requireAdmin();
  const parsedPayload = updateBookingStatusSchema.parse(payload);
  return await updateBookingStatus(parsedPayload);
};

export const confirmBookingAction = async (payload: ConfirmBookingType) => {
  await requireAdmin();
  const parsedPayload = confirmBookingSchema.parse(payload);
  return await confirmBooking(parsedPayload.id);
};

export const updateBookingFromDialogAction = async (
  payload: UpdateBookingFromDialogType,
) => {
  await requireAdmin();
  const parsedPayload = updateBookingFromDialogSchema.parse(payload);
  return await updateBookingFromDialog(parsedPayload);
};

export const createClientBookingAction = async (
  payload: CreateClientBookingType,
) => {
  await requireUser();
  const parsedPayload = createClientBookingSchema.parse(payload);
  return await createClientBooking(parsedPayload);
};

export const cancelClientBookingAction = async (
  payload: CancelClientBookingType,
) => {
  await requireUser();
  const parsedPayload = cancelClientBookingSchema.parse(payload);
  return await cancelClientBooking(parsedPayload);
};
