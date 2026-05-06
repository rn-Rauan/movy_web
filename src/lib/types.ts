export type AuthUser = {
  id: string;
  name: string;
  email: string;
};

export type Organization = {
  id: string;
  name: string;
  slug: string;
  cnpj?: string;
  email?: string;
  telephone?: string;
  address?: string;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
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
  availableSlots?: number;
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
  paymentMethod?: PaymentMethod | null;
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

export type Weekday =
  | "SUNDAY"
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY";

export type TripTemplate = {
  id: string;
  organizationId: string;
  departurePoint: string;
  destination: string;
  stops: string[];
  shift: "MORNING" | "AFTERNOON" | "EVENING";
  priceOneWay?: number;
  priceReturn?: number;
  priceRoundTrip?: number;
  isPublic: boolean;
  isRecurring?: boolean;
  frequency?: Weekday[];
  minRevenue?: number;
  autoCancelEnabled?: boolean;
  autoCancelOffset?: number;
  status?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Paginated<T> = {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
  totalPages?: number;
};

export type Driver = {
  id: string;
  userId: string;
  cnh: string;
  cnhCategory: "A" | "B" | "C" | "D" | "E";
  cnhExpiresAt: string;
  driverStatus: "ACTIVE" | "INACTIVE" | "SUSPENDED";
  userName?: string;
  userEmail?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Vehicle = {
  id: string;
  plate: string;
  model: string;
  type: "VAN" | "BUS" | "MINIBUS" | "CAR";
  maxCapacity: number;
  status: "ACTIVE" | "INACTIVE";
  organizationId: string;
  createdAt?: string;
  updatedAt?: string;
};

export type TripPassenger = {
  userId: string;
  name: string;
  boardingStop: string;
};

export type SubscriptionStatus = "ACTIVE" | "CANCELED" | "EXPIRED";

export type Subscription = {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  startDate: string;
  expiresAt: string;
  createdAt?: string;
  updatedAt?: string;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  maxVehicles: number;
  maxDrivers: number;
  maxMonthlyTrips: number;
  durationDays: number;
  isActive: boolean;
};
