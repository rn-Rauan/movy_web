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
  | "COMPLETED"
  | "CANCELLED";

export type TripInstance = {
  id: string;
  organizationId: string;
  tripTemplateId: string;
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
  origin?: string;
  destination?: string;
  price?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type BookingStatus = "ACTIVE" | "CANCELLED" | "COMPLETED" | "NO_SHOW";

export type Booking = {
  id: string;
  organizationId: string;
  userId: string;
  tripInstanceId: string;
  enrollmentDate: string;
  status: BookingStatus;
  presenceConfirmed: boolean;
  enrollmentType: "ONE_WAY" | "ROUND_TRIP";
  recordedPrice?: number;
  boardingStop: string;
  alightingStop: string;
  createdAt?: string;
  updatedAt?: string;
  tripInstance?: TripInstance;
};

export type Paginated<T> = {
  data: T[];
  total?: number;
  page?: number;
  limit?: number;
};
