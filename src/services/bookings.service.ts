import { api } from "@/lib/api";
import type { Booking, BookingDetails, BookingAvailability, Paginated } from "@/lib/types";
import type { EnrollmentType, PaymentMethod } from "@/lib/types";

export const bookingsService = {
  listForUser: () => api<Booking[] | { data: Booking[] }>("/bookings/user"),

  getDetails: (bookingId: string) => api<BookingDetails>(`/bookings/${bookingId}/details`),

  checkAvailability: (tripId: string) =>
    api<BookingAvailability>(`/bookings/availability/${tripId}`),

  listByTripInstance: (tripId: string) =>
    api<Booking[] | Paginated<Booking>>(`/bookings/trip-instance/${tripId}`),

  create: (data: {
    tripInstanceId: string;
    enrollmentType: EnrollmentType;
    boardingStop: string;
    alightingStop: string;
    method: PaymentMethod;
  }) => api("/bookings", { method: "POST", body: JSON.stringify(data) }),

  cancel: (bookingId: string) => api<Booking>(`/bookings/${bookingId}/cancel`, { method: "PATCH" }),

  confirmPresence: (bookingId: string) =>
    api<Booking>(`/bookings/${bookingId}/confirm-presence`, { method: "PATCH" }),
};
