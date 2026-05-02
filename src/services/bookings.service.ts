import { api } from "@/lib/api";
import type { Booking, BookingDetails, BookingAvailability } from "@/lib/types";
import type { EnrollmentType, PaymentMethod } from "@/lib/types";

export const bookingsService = {
  listForUser: () =>
    api<Booking[] | { data: Booking[] }>("/bookings/user"),

  getDetails: (bookingId: string) =>
    api<BookingDetails>(`/bookings/${bookingId}/details`),

  checkAvailability: (tripId: string) =>
    api<BookingAvailability>(`/bookings/availability/${tripId}`),

  create: (data: {
    tripInstanceId: string;
    enrollmentType: EnrollmentType;
    boardingStop: string;
    alightingStop: string;
    method: PaymentMethod;
  }) =>
    api("/bookings", { method: "POST", body: JSON.stringify(data) }),

  cancel: (bookingId: string) =>
    api(`/bookings/${bookingId}/cancel`, { method: "PATCH" }),
};
