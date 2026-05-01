export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type Organization = {
  id: string;
  name: string;
  slug?: string;
  description?: string;
  isActive?: boolean;
};

export type TripStatus =
  | "DRAFT"
  | "SCHEDULED"
  | "CONFIRMED"
  | "IN_PROGRESS"
  | "FINISHED"
  | "CANCELED";

export type TripInstance = {
  id: string;
  organizationId: string;
  tripTemplateId?: string;
  driverId?: string | null;
  vehicleId?: string | null;
  tripStatus: TripStatus;
  minRevenue?: number;
  autoCancelAt?: string;
  forceConfirm?: boolean;
  totalCapacity: number;
  bookedCount?: number;
  availableSeats?: number;
  departureTime: string;
  arrivalEstimate?: string;
  /** Public trip fields (PublicTripInstanceResponse) */
  departurePoint?: string;
  destination?: string;
  priceOneWay?: number;
  priceReturn?: number;
  priceRoundTrip?: number;
  isRecurring?: boolean;
  /** Optional helpers possibly returned by some endpoints */
  organizationName?: string;
  organizationSlug?: string;
  stops?: string[];
  createdAt?: string;
  updatedAt?: string;
};

export type BookingStatus = "ACTIVE" | "INACTIVE";

export type EnrollmentType = "ONE_WAY" | "RETURN" | "ROUND_TRIP";

export type PaymentMethod = "MONEY" | "PIX" | "CREDIT_CARD" | "DEBIT_CARD";

export type Booking = {
  id: string;
  organizationId: string;
  userId: string;
  tripInstanceId: string;
  enrollmentDate: string;
  status: BookingStatus;
  presenceConfirmed: boolean;
  enrollmentType: EnrollmentType;
  recordedPrice?: number;
  boardingStop: string;
  alightingStop: string;
  createdAt?: string;
  updatedAt?: string;
  tripInstance?: TripInstance;
};

/** Returned by GET /bookings/{id}/details */
export type BookingDetails = Booking & {
  tripDepartureTime?: string;
  tripArrivalEstimate?: string;
  tripStatus?: TripStatus;
  totalCapacity?: number;
  availableSlots?: number;
};

/** Returned by GET /bookings/availability/{tripInstanceId} */
export type BookingAvailability = {
  tripInstanceId: string;
  tripStatus: TripStatus;
  totalCapacity: number;
  activeCount: number;
  availableSlots: number;
  isBookable: boolean;
};

export type Paginated<T> = {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
};
