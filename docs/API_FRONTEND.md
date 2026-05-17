# Movy API — Frontend Reference

Base URL (dev): `http://localhost:5701`  
Swagger UI (dev): `http://localhost:5701/api`

## Authentication

All protected routes require a Bearer token in the `Authorization` header:

```
Authorization: Bearer <accessToken>
```

The access token expires in **1 hour**. Use `POST /auth/refresh` to get a new one without re-logging in.

---

## Pagination

Paginated endpoints accept `?page=1&limit=10` query params and always return:

```json
{
  "data": [...],
  "total": 100,
  "page": 1,
  "limit": 10,
  "totalPages": 10
}
```

---

## Access Levels

| Label     | Meaning                                          |
| --------- | ------------------------------------------------ |
| 🌐 Public | No auth required                                 |
| 🔒 JWT    | Any logged-in user                               |
| 🛡️ ADMIN  | Requires ADMIN role in the relevant organization |
| 🧑‍💻 DEV    | Dev-only emails (bypass all tenant checks)       |

---

## Auth

### `POST /auth/register`

Register a new individual user account (no organization).

**Body**
| Field | Type | Required |
|---|---|---|
| `name` | string | ✅ |
| `email` | string | ✅ |
| `password` | string (min 8) | ✅ |
| `telephone` | string | ✅ |

**Response `201`** → [TokenResponse](#tokenresponse)

---

### `POST /auth/register-organization`

Atomically register a user + organization. Use this for the onboarding flow.

**Body**
| Field | Type | Required |
|---|---|---|
| `userName` | string | ✅ |
| `userEmail` | string | ✅ |
| `userPassword` | string (min 8) | ✅ |
| `userTelephone` | string | ✅ |
| `organizationName` | string | ✅ |
| `cnpj` | string | ✅ |
| `organizationEmail` | string | ✅ |
| `organizationTelephone` | string | ✅ |
| `address` | string | ✅ |
| `slug` | string | ✅ |

**Response `201`** → [TokenResponse](#tokenresponse)  
**`409`** → User or organization already exists

---

### `POST /auth/login`

Login with email + password.

**Body**
| Field | Type | Required |
|---|---|---|
| `email` | string | ✅ |
| `password` | string | ✅ |

**Response `200`** → [TokenResponse](#tokenresponse)  
**`401`** → Invalid credentials

---

### `POST /auth/refresh`

Exchange a refresh token for a new access token + refresh token pair. Always replace both tokens in storage.

**Body**
| Field | Type | Required |
|---|---|---|
| `refreshToken` | string | ✅ |

**Response `200`** → [TokenResponse](#tokenresponse)  
**`401`** → Refresh token expired or revoked

---

### `POST /auth/logout`

Revoke the refresh token (server-side). Call on user logout. Idempotent — always returns 204 even if token is already expired.

**Body**
| Field | Type | Required |
|---|---|---|
| `refreshToken` | string | ✅ |

**Response `204`** → No content

---

### `POST /auth/setup-organization` 🔒 JWT

Create an organization for a user that already has an account (without a org yet). Returns new tokens with org context embedded.

**Body**
| Field | Type | Required |
|---|---|---|
| `organizationName` | string | ✅ |
| `cnpj` | string | ✅ |
| `organizationEmail` | string | ✅ |
| `organizationTelephone` | string | ✅ |
| `address` | string | ✅ |
| `slug` | string | ✅ |

**Response `201`** → [TokenResponse](#tokenresponse)  
**`409`** → Organization already exists

---

## Users

### `GET /users/me` 🔒 JWT

Get the current user's profile.

**Response `200`** → [UserResponse](#userresponse)

---

### `PUT /users/me` 🔒 JWT

Update the current user's profile. All fields are optional.

**Body**
| Field | Type |
|---|---|
| `name` | string |
| `email` | string |
| `telephone` | string |
| `password` | string (min 8) |

**Response `200`** → [UserResponse](#userresponse)

---

### `DELETE /users/me` 🔒 JWT

Soft-disable the current user's account (status → INACTIVE).

**Response `200`**

```json
{ "success": true, "message": "User account disabled" }
```

---

## Organizations

### `GET /public/organizations/{slug}` 🌐 Public

Resolve an organization by its URL slug. Use on the landing/home page to identify the tenant.

**Path params:** `slug` — e.g., `transport-xpto`

**Response `200`** → [OrganizationResponse](#organizationresponse)  
**`404`** → Org not found or inactive

---

### `GET /organizations/me` 🔒 JWT

List all organizations the current user belongs to (paginated).

**Query:** `?page=1&limit=10`

**Response `200`** → Paginated [[OrganizationResponse](#organizationresponse)]

---

### `GET /organizations/{id}` 🛡️ ADMIN

Get an organization by ID.

**Response `200`** → [OrganizationResponse](#organizationresponse)

---

### `PUT /organizations/{id}` 🛡️ ADMIN

Update an organization.

**Body** (all optional)
| Field | Type |
|---|---|
| `name` | string |
| `email` | string |
| `cnpj` | string |
| `telephone` | string |
| `slug` | string |
| `address` | string |

**Response `200`** → [OrganizationResponse](#organizationresponse)

---

### `DELETE /organizations/{id}` 🛡️ ADMIN

Soft-disable an organization (status → INACTIVE).

**Response `200`** → `boolean`

---

## Memberships

### `GET /memberships/me/role/{organizationId}` 🔒 JWT (ADMIN or DRIVER)

Get the current user's role in a specific organization. Requires the caller to have an ADMIN or DRIVER role in the org.

**Response `200`** → `{ id: number, name: "ADMIN" | "DRIVER" }`

---

### `POST /memberships/driver` 🛡️ ADMIN

Associate a driver to the organization by email **and** CNH. Both must match the same user — this prevents linking someone whose CNH you don't know.

Use `GET /drivers/lookup` first if you only have one of the two identifiers.

**Body**
| Field | Type | Required |
|---|---|---|
| `userEmail` | string | ✅ |
| `cnh` | string | ✅ |

**Response `201`** → [MembershipResponse](#membershipresponse)  
**`400`** → CNH doesn't match the user or user has no driver profile  
**`403`** → Driver plan limit exceeded  
**`404`** → No user found with that email  
**`409`** → Active DRIVER membership already exists

---

### `POST /memberships` 🛡️ ADMIN

Add a user to an organization with a specific role. Lookup the user by email first.

**Body**
| Field | Type | Required |
|---|---|---|
| `userEmail` | string | ✅ |
| `roleId` | number | ✅ |

**Response `201`** → [MembershipResponse](#membershipresponse)

---

### `GET /memberships/organization/{organizationId}` 🛡️ ADMIN

List all memberships in an organization (paginated).

**Response `200`** → Paginated [[MembershipResponse](#membershipresponse)]

---

### `DELETE /memberships/{userId}/{roleId}/{organizationId}` 🛡️ ADMIN

Soft-remove a membership (sets `removedAt`).

**Response `200`** → `boolean`

---

### `PATCH /memberships/{userId}/{roleId}/{organizationId}/restore` 🛡️ ADMIN

Restore a previously removed membership.

**Response `200`** → `boolean`

---

## Drivers

### `POST /drivers` 🔒 JWT

Register a driver profile for the current user. The user must be a member of the org.

**Body**
| Field | Type | Required | Notes |
|---|---|---|---|
| `cnh` | string | ✅ | 9–12 chars |
| `cnhCategory` | `"A"` \| `"B"` \| `"C"` \| `"D"` \| `"E"` | ✅ | |
| `cnhExpiresAt` | string (YYYY-MM-DD) | ✅ | |

**Response `201`** → [DriverResponse](#driverresponse)

---

### `GET /drivers/me` 🔒 JWT

Get the current user's driver profile.

**Response `200`** → [DriverResponse](#driverresponse)

---

### `GET /drivers/lookup` 🛡️ ADMIN

Look up a driver by email + CNH (to get their `userId` before creating a membership).

**Query:** `?email=joao@email.com&cnh=123456789`

**Response `200`** → `{ driverId, userId, userName, userEmail, cnhCategory, cnhExpiresAt, driverStatus }`

---

### `GET /drivers/organization/{organizationId}` 🛡️ ADMIN

List all drivers in an organization (paginated).

**Response `200`** → Paginated [[DriverResponse](#driverresponse)]

---

### `GET /drivers/{id}` 🛡️ ADMIN

Get a driver by ID.

**Response `200`** → [DriverResponse](#driverresponse)

---

### `PUT /drivers/{id}` �️ ADMIN

Update a driver profile. All fields optional.

**Body**
| Field | Type | Notes |
|---|---|---|
| `cnh` | string | |
| `cnhCategory` | `"A"`\|`"B"`\|`"C"`\|`"D"`\|`"E"` | |
| `cnhExpiresAt` | string (YYYY-MM-DD) | |
| `status` | `"ACTIVE"`\|`"INACTIVE"`\|`"SUSPENDED"` | |

**Response `200`** → [DriverResponse](#driverresponse)

---

### `DELETE /drivers/{id}` 🛡️ ADMIN

Delete a driver profile.

**Response `200`** → `boolean`

---

## Vehicles

### `POST /vehicles/organization/{organizationId}` 🛡️ ADMIN

Register a vehicle for an organization.

**Body**
| Field | Type | Required | Notes |
|---|---|---|---|
| `plate` | string (max 7) | ✅ | Old format: `ABC1234` / Mercosul: `ABC1D23` |
| `model` | string | ✅ | e.g. `"Mercedes-Benz Sprinter"` |
| `type` | `"VAN"`\|`"BUS"`\|`"MINIBUS"`\|`"CAR"` | ✅ | |
| `maxCapacity` | number (1–200) | ✅ | |

**Response `201`** → [VehicleResponse](#vehicleresponse)

---

### `GET /vehicles/organization/{organizationId}` 🛡️ ADMIN

List all vehicles in an organization (paginated).

**Response `200`** → Paginated [[VehicleResponse](#vehicleresponse)]

---

### `GET /vehicles/{id}` 🛡️ ADMIN

Get a vehicle by ID.

**Response `200`** → [VehicleResponse](#vehicleresponse)

---

### `PUT /vehicles/{id}` 🛡️ ADMIN

Update a vehicle. All fields optional.

**Body**
| Field | Type |
|---|---|
| `plate` | string |
| `model` | string |
| `type` | `"VAN"`\|`"BUS"`\|`"MINIBUS"`\|`"CAR"` |
| `maxCapacity` | number |
| `status` | `"ACTIVE"`\|`"INACTIVE"` |

**Response `200`** → [VehicleResponse](#vehicleresponse)

---

### `DELETE /vehicles/{id}` 🛡️ ADMIN

Soft-deactivate a vehicle (status → INACTIVE).

**Response `200`** → `boolean`

---

## Trip Templates

A trip template defines the recurring structure of a route (stops, prices, schedule).

### `POST /trip-templates/organization/{organizationId}` 🛡️ ADMIN

Create a trip template.

**Body**
| Field | Type | Required | Notes |
|---|---|---|---|
| `departurePoint` | string (max 255) | ✅ | |
| `destination` | string (max 255) | ✅ | |
| `stops` | string[] (min 2) | ✅ | Ordered stop names |
| `shift` | `"MORNING"`\|`"AFTERNOON"`\|`"EVENING"` | ✅ | |
| `departureTimeOfDay` | string (`HH:mm`, UTC) | ✅ | 24-hour clock, e.g. `"07:30"` |
| `arrivalTimeOfDay` | string (`HH:mm`, UTC) | ✅ | 24-hour clock, e.g. `"08:30"`. May be earlier than `departureTimeOfDay` for trips that cross midnight |
| `defaultCapacity` | integer (min 1) | ✅ | Default seat count copied into each generated `TripInstance` |
| `frequency` | `("SUNDAY"\|"MONDAY"\|...\|"SATURDAY")[]` | | Recurrence days (required when `isRecurring = true`) |
| `priceOneWay` | number | | BRL |
| `priceReturn` | number | | BRL |
| `priceRoundTrip` | number | | BRL |
| `isPublic` | boolean | | Visible on public listing (default: `false`) |
| `isRecurring` | boolean | | When `true`, the scheduler generates `TripInstance`s automatically on the frequency days |
| `autoCancelEnabled` | boolean | | |
| `minRevenue` | number | | Required if `autoCancelEnabled = true` |
| `autoCancelOffset` | number | | Minutes before departure (required if `autoCancelEnabled = true`) |

> At least one of `priceOneWay`, `priceReturn`, or `priceRoundTrip` is required.
> Times are stored in **UTC**. Send the HH:mm value the API should treat as the departure/arrival clock in UTC.

**Response `201`** → [TripTemplateResponse](#triptemplateresponse)
**`400`** → `INVALID_TRIP_TIME_OF_DAY_FORMAT`, `INVALID_TRIP_TEMPLATE_DEFAULT_CAPACITY`

---

### `GET /trip-templates/organization/{organizationId}` 🛡️ ADMIN

List all trip templates in an organization (paginated).

**Response `200`** → Paginated [[TripTemplateResponse](#triptemplateresponse)]

---

### `GET /trip-templates/{id}` 🛡️ ADMIN

Get a trip template by ID.

**Response `200`** → [TripTemplateResponse](#triptemplateresponse)

---

### `PUT /trip-templates/{id}` 🛡️ ADMIN

Update a trip template. All fields optional — only provided fields are applied (partial pricing updates merge with the stored prices).

**Body**
| Field | Type | Notes |
|---|---|---|
| `departurePoint` | string (max 255) | |
| `destination` | string (max 255) | |
| `stops` | string[] (min 2) | |
| `shift` | `"MORNING"`\|`"AFTERNOON"`\|`"EVENING"` | |
| `departureTimeOfDay` | string (`HH:mm`, UTC) | |
| `arrivalTimeOfDay` | string (`HH:mm`, UTC) | |
| `defaultCapacity` | integer (min 1) | |
| `frequency` | `("SUNDAY"\|"MONDAY"\|...\|"SATURDAY")[]` | |
| `priceOneWay` | number | BRL |
| `priceReturn` | number | BRL |
| `priceRoundTrip` | number | BRL |
| `isPublic` | boolean | |
| `isRecurring` | boolean | |
| `autoCancelEnabled` | boolean | |
| `minRevenue` | number | |
| `autoCancelOffset` | number | |

**Response `200`** → [TripTemplateResponse](#triptemplateresponse)

---

### `POST /trip-templates/{id}/generate-instances` 🛡️ ADMIN

Manually generate the rolling-window of `TripInstance`s for a **recurring** template. Mirrors the daily cron sweep (`0 2 * * *` UTC) but scoped to a single template.

Useful right after creating a new recurring template (so admins don't have to wait until 02:00 UTC for the next cron tick) or to backfill after cron downtime. Same idempotency (one instance per `[templateId, calendarDay]`), plan-limit checks (`MONTHLY_TRIP_PLAN_LIMIT_FORBIDDEN`), and unique-constraint race protections as the cron sweep.

Past departures are **skipped** — the endpoint never creates instances with a `departureTime` in the past. To schedule a past-dated trip use `POST /trip-instances/organization/{organizationId}` directly.

**Body** (all optional)
| Field | Type | Notes |
|---|---|---|
| `daysAhead` | integer (1..90) | Rolling-window size. Falls back to the org [Scheduling Config](#scheduling-configuration) `daysAhead`, then to `14` |

**Response `201`** → [GenerateInstancesResponse](#generateinstancesresponse)
**`400`** → `TRIP_TEMPLATE_NOT_RECURRING_BAD_REQUEST`, `INVALID_TRIP_TEMPLATE_MISSING_SCHEDULE`, `INVALID_TRIP_TEMPLATE_MISSING_CAPACITY`, or template inactive
**`403`** → Template belongs to another organization, or plan trip-quota exceeded mid-sweep
**`404`** → Template not found

---

### `DELETE /trip-templates/{id}` 🛡️ ADMIN

Deactivate a trip template (soft delete).

**Response `200`** → `boolean`

---

## Scheduling Configuration

Per-organization knobs for the scheduler that auto-generates `TripInstance`s from recurring templates and auto-cancels low-revenue trips. A row is created automatically on org registration.

### `GET /organizations/{organizationId}/scheduling-config` 🛡️ ADMIN

Fetch the scheduling configuration for the organization.

**Response `200`** → [TripSchedulingConfigResponse](#tripschedulingconfigresponse)
**`404`** → Config not found for the organization

---

### `PATCH /organizations/{organizationId}/scheduling-config` 🛡️ ADMIN

Partially update the scheduling configuration. Any field omitted is left unchanged.

**Body** (all optional)
| Field | Type | Notes |
|---|---|---|
| `daysAhead` | integer (1..90) | How many days ahead the generator creates instances each run |
| `generationCron` | string (cron expression, UTC) | Default `"0 2 * * *"` |
| `autoCancelCron` | string (cron expression, UTC) | Default `"*/15 * * * *"` |
| `enabled` | boolean | Master switch for both jobs on this org |

**Response `200`** → [TripSchedulingConfigResponse](#tripschedulingconfigresponse)
**`400`** → Invalid `daysAhead` or cron expression
**`404`** → Config not found for the organization

---

## Trip Instances

A trip instance is a scheduled occurrence of a trip template (a real departure on a specific date/time).

### `POST /trip-instances/organization/{organizationId}` 🛡️ ADMIN

Create a trip instance from a template.

> ⚠️ **BREAKING CHANGE** — the request body no longer accepts `departureTime` / `arrivalEstimate`. Send `departureDate` (calendar day only) instead; the server combines it with the template's `departureTimeOfDay` / `arrivalTimeOfDay` (UTC) to produce the final timestamps. The response still exposes the absolute `departureTime` and `arrivalEstimate` fields.

**Body**
| Field | Type | Required | Notes |
|---|---|---|---|
| `tripTemplateId` | string (UUID) | ✅ | |
| `departureDate` | string (`YYYY-MM-DD`) | ✅ | e.g. `"2026-05-10"`. Time-of-day is taken from the template |
| `totalCapacity` | number | ✅ | Seat count snapshot (positive integer) |
| `driverId` | string (UUID) | | Required if `initialStatus = "SCHEDULED"` |
| `vehicleId` | string (UUID) | | Required if `initialStatus = "SCHEDULED"` |
| `minRevenue` | number | | Override template min revenue |
| `initialStatus` | `"DRAFT"` \| `"SCHEDULED"` | | Default: `"DRAFT"`. Use `"SCHEDULED"` to publish immediately (requires driver + vehicle) |

**Response `201`** → [TripInstanceResponse](#tripinstanceresponse)
**`400`** → `INVALID_TRIP_TEMPLATE_MISSING_SCHEDULE` (template has no time-of-day) or generic validation
**`403`** → Plan monthly-trip limit exceeded (`MONTHLY_TRIP_PLAN_LIMIT_FORBIDDEN`)

---

### `GET /trip-instances/organization/{organizationId}` 🛡️ ADMIN

List all trip instances for an organization (paginated). Returns an **enriched response** with booking occupancy and denormalized template fields — all resolved in a single query (no N+1).

**Response `200`** → Paginated [[TripInstanceResponse](#tripinstanceresponse)]

---

### `GET /trip-instances/template/{templateId}` 🛡️ ADMIN

List all instances for a specific template (paginated).

**Response `200`** → Paginated [[TripInstanceResponse](#tripinstanceresponse)]

---

### `GET /trip-instances/{id}` 🔒 JWT

Get a trip instance by ID. **Enriched response** — joins the parent template (`id`, `origin`, `destination`, `stops`) and live occupancy (`bookedCount`, `availableSlots`) in a single query, so the FE no longer needs a follow-up `GET /trip-templates/{id}` call.

**Response `200`** → [TripInstanceResponse](#tripinstanceresponse) (with `template`, `bookedCount`, `availableSlots` populated)

---

### `PATCH /trip-instances/{id}/status` 🛡️ ADMIN

Transition a trip instance to a new lifecycle status.

**Status flow:** `DRAFT → SCHEDULED → CONFIRMED → IN_PROGRESS → FINISHED`  
Can also go to `CANCELED` from `DRAFT`, `SCHEDULED`, or `CONFIRMED`.

**Body**
| Field | Type | Required |
|---|---|---|
| `newStatus` | `"DRAFT"`\|`"SCHEDULED"`\|`"CONFIRMED"`\|`"IN_PROGRESS"`\|`"FINISHED"`\|`"CANCELED"` | ✅ |

**Response `200`** → [TripInstanceResponse](#tripinstanceresponse)

---

### `PUT /trip-instances/{id}/driver` 🛡️ ADMIN

Assign or unassign a driver to a trip instance.

**Query:** `?driverId=<uuid>` (omit to unassign)

**Response `200`** → [TripInstanceResponse](#tripinstanceresponse)

---

### `PUT /trip-instances/{id}/vehicle` 🛡️ ADMIN

Assign or unassign a vehicle to a trip instance.

**Query:** `?vehicleId=<uuid>` (omit to unassign)

**Response `200`** → [TripInstanceResponse](#tripinstanceresponse)

---

## Public Trips

No authentication required. Used for the public listing/booking pages.

### `GET /public/trip-instances` 🌐 Public

List all public trips (from `isPublic = true` templates) with status `SCHEDULED` or `CONFIRMED`, ordered by departure time.

**Query**
| Param | Type | Notes |
|---|---|---|
| `page` | number | |
| `limit` | number | |
| `organizationId` | string (UUID) | Optional: filter by org |

**Response `200`** → Paginated [[PublicTripInstanceResponse](#publictripinstanceresponse)]

---

### `GET /public/trip-instances/{id}` 🌐 Public

Get a single bookable trip instance by ID (must be `SCHEDULED` or `CONFIRMED`).

**Response `200`** → [PublicTripInstanceResponse](#publictripinstanceresponse)  
**`404`** → Not found or not bookable

---

### `GET /public/trip-instances/org/{slug}` 🌐 Public

List all `SCHEDULED`/`CONFIRMED` trips for an organization by its slug (org-specific share link page). Returns all trips regardless of `isPublic`.

**Query:** `?page=1&limit=10`

**Response `200`** → Paginated [[PublicTripInstanceResponse](#publictripinstanceresponse)]

---

## Bookings

### `POST /bookings` 🔒 JWT

Enroll the authenticated user in a trip instance. Creates a booking + payment record.

**Body**
| Field | Type | Required | Notes |
|---|---|---|---|
| `tripInstanceId` | string (UUID) | ✅ | |
| `enrollmentType` | `"ONE_WAY"`\|`"RETURN"`\|`"ROUND_TRIP"` | ✅ | |
| `boardingStop` | string | ✅ | Must match a stop in the template |
| `alightingStop` | string | ✅ | Must match a stop in the template |
| `method` | `"MONEY"`\|`"PIX"`\|`"CREDIT_CARD"`\|`"DEBIT_CARD"` | ✅ | |

**Response `201`** → [BookingResponse](#bookingresponse)

---

### `GET /bookings/availability/{tripInstanceId}` 🔒 JWT

Check available slots before booking (use before showing the booking form).

**Response `200`**

```json
{
  "tripInstanceId": "uuid",
  "tripStatus": "SCHEDULED",
  "totalCapacity": 40,
  "activeCount": 28,
  "availableSlots": 12,
  "isBookable": true
}
```

---

### `GET /bookings/user` 🔒 JWT

List the current user's bookings (paginated).

**Query**
| Param | Type | Notes |
|---|---|---|
| `page` | number | |
| `limit` | number | |
| `status` | `"ACTIVE"`\|`"INACTIVE"` | Optional filter |

**Response `200`** → Paginated [[BookingResponse](#bookingresponse)]

---

### `GET /bookings/{id}` 🔒 JWT

Get a booking by ID.

**Response `200`** → [BookingResponse](#bookingresponse)

---

### `GET /bookings/{id}/details` 🔒 JWT

Get a booking with enriched trip data (departure time, trip status, available slots). Use on the booking detail page.

**Response `200`** → [BookingDetailsResponse](#bookingdetailsresponse)

---

### `GET /bookings/trip-instance/{tripInstanceId}` 🔒 JWT

List all bookings for a specific trip instance (paginated). Requires org membership.

**Response `200`** → Paginated [[BookingResponse](#bookingresponse)]

---

### `GET /bookings/trip-instance/{tripInstanceId}/passengers` 🔒 JWT

List the name, boarding stop, and userId of every active passenger on a trip instance.

Access is granted if the caller has an `ACTIVE` booking on the trip **or** is a member of the owning organization. Sensitive fields (email, phone) are never included.

**Response `200`** → [[TripPassengerResponse](#trippassengerresponse)]  
**`403`** → Caller has no active booking and is not an org member  
**`404`** → Trip instance not found

---

### `GET /bookings/organization/{organizationId}` 🛡️ ADMIN

List all bookings in an organization (paginated).

**Response `200`** → Paginated [[BookingResponse](#bookingresponse)]

---

### `PATCH /bookings/{id}/cancel` 🔒 JWT

Cancel a booking (status → INACTIVE). Frees up a seat.

The booking owner can cancel their own booking. ADMIN or DRIVER members of the owning organisation can also cancel any booking within that org. Cancellation is blocked if the trip is `IN_PROGRESS`/`FINISHED` or departure is within 30 minutes.

**Response `200`** → [BookingResponse](#bookingresponse)

---

### `PATCH /bookings/{id}/confirm-presence` 🔒 JWT (or ADMIN)

Mark passenger as present on the trip.

**Response `200`** → [BookingResponse](#bookingresponse)

---

## Subscriptions

### `POST /organizations/{organizationId}/subscriptions` 🛡️ ADMIN

Subscribe an organization to a plan.

**Body**
| Field | Type | Required |
|---|---|---|
| `planId` | number | ✅ |

**Response `201`** → [SubscriptionResponse](#subscriptionresponse)

---

### `GET /organizations/{organizationId}/subscriptions/active` 🛡️ ADMIN

Get the current active subscription for an organization.

**Response `200`** → [SubscriptionResponse](#subscriptionresponse)

---

### `GET /organizations/{organizationId}/subscriptions` 🛡️ ADMIN

List all subscriptions for an organization (paginated).

**Response `200`** → Paginated [[SubscriptionResponse](#subscriptionresponse)]

---

### `PATCH /organizations/{organizationId}/subscriptions/{id}` 🛡️ ADMIN

Replace the plan of an **ACTIVE** subscription. Preserves the same record (`id`, `startDate`, `createdAt`) and recalculates `expiresAt = now + newPlan.durationDays`.

Use this endpoint to switch plans (e.g. upgrade from FREE → PREMIUM) instead of cancelling and resubscribing — it avoids the unique-active-subscription race condition and keeps the historical trail intact.

If `planId` matches the current plan, the call is a no-op and returns the subscription unchanged.

**Body**
| Field | Type | Required |
|---|---|---|
| `planId` | number | ✅ |

**Response `200`** → [SubscriptionResponse](#subscriptionresponse)  
**`400`** → Subscription is not ACTIVE (CANCELED or PAST_DUE)  
**`403`** → Subscription belongs to another organization  
**`404`** → Subscription or plan not found (or plan inactive)

---

### `PATCH /organizations/{organizationId}/subscriptions/{id}/cancel` 🛡️ ADMIN

Cancel a subscription. Takes effect at `expiresAt`.

**Response `200`** → [SubscriptionResponse](#subscriptionresponse)

---

### `GET /organizations/{organizationId}/plan-usage` 🛡️ ADMIN

Return the organization's current consumption against the plan attached to its **active** subscription. Single source of truth for the plan-card UI — replaces the old fan-out (`subscriptions/active` + `plans/{id}` + local counting of vehicles/drivers).

Counts come from the same repository methods used by the backend's plan-limit gates (`PlanLimitService.assert*`), so the displayed `used` value will always match what triggers a `403` on resource creation.

`monthlyTrips.used` covers trip instances created in the current calendar month.

**Response `200`** → [PlanUsageResponse](#planusageresponse)
**`403`** → No active subscription (`NO_ACTIVE_SUBSCRIPTION_FORBIDDEN`)
**`404`** → Plan referenced by the subscription no longer exists

---

## Plans

### `GET /plans` 🔒 JWT

List all available plans (paginated).

**Response `200`** → Paginated [[PlanResponse](#planresponse)]

---

### `GET /plans/{id}` 🔒 JWT

Get a plan by ID.

**Response `200`** → [PlanResponse](#planresponse)

---

## Payments

Payments are created automatically when a booking is made. Use these endpoints to display payment history.

### `GET /organizations/{organizationId}/payments` 🛡️ ADMIN

List all payments for an organization (paginated).

**Response `200`** → Paginated [[PaymentResponse](#paymentresponse)]

---

### `GET /organizations/{organizationId}/payments/{id}` 🛡️ ADMIN

Get a payment by ID.

**Response `200`** → [PaymentResponse](#paymentresponse)

---

### `PATCH /organizations/{organizationId}/payments/{id}/confirm` 🛡️ ADMIN

Confirm a PENDING payment (simulated — no real payment gateway).

**Response `200`** → [PaymentResponse](#paymentresponse)

---

### `PATCH /organizations/{organizationId}/payments/{id}/fail` 🛡️ ADMIN

Fail a PENDING payment (simulated).

**Response `200`** → [PaymentResponse](#paymentresponse)

---

## Response Schemas

### TokenResponse

```json
{
  "accessToken": "eyJ...",
  "refreshToken": "eyJ...",
  "user": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com"
  }
}
```

### UserResponse

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "telephone": "11999999999",
  "status": "ACTIVE",
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

### OrganizationResponse

```json
{
  "id": "uuid",
  "name": "My Org",
  "cnpj": "12345678000199",
  "email": "org@email.com",
  "telephone": "11999999999",
  "slug": "my-org",
  "address": "Rua Exemplo, 123",
  "status": "ACTIVE",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### MembershipResponse

```json
{
  "userId": "uuid",
  "roleId": 1,
  "organizationId": "uuid",
  "assignedAt": "2026-01-01T00:00:00.000Z",
  "removedAt": null
}
```

### DriverResponse

```json
{
  "id": "uuid",
  "userId": "uuid",
  "cnh": "123456789",
  "cnhCategory": "B",
  "cnhExpiresAt": "2028-12-31T00:00:00.000Z",
  "driverStatus": "ACTIVE",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### VehicleResponse

```json
{
  "id": "uuid",
  "plate": "ABC1D23",
  "model": "Mercedes-Benz Sprinter",
  "type": "VAN",
  "maxCapacity": 15,
  "status": "ACTIVE",
  "organizationId": "uuid",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### TripTemplateResponse

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "departurePoint": "Terminal Rodoviário",
  "destination": "Universidade Federal",
  "stops": ["Terminal Rodoviário", "Praça Central", "Universidade Federal"],
  "shift": "MORNING",
  "departureTimeOfDay": "07:30",
  "arrivalTimeOfDay": "08:30",
  "defaultCapacity": 20,
  "frequency": ["MONDAY", "WEDNESDAY", "FRIDAY"],
  "priceOneWay": 12.5,
  "priceReturn": 12.5,
  "priceRoundTrip": 20.0,
  "isPublic": false,
  "isRecurring": true,
  "autoCancelEnabled": false,
  "minRevenue": null,
  "autoCancelOffset": null,
  "status": "ACTIVE",
  "createdAt": "...",
  "updatedAt": "..."
}
```

> `departureTimeOfDay`, `arrivalTimeOfDay`, and `defaultCapacity` may be `null` on legacy templates created before the scheduling feature. These templates cannot be used by the auto-generator until they are populated via `PUT /trip-templates/{id}`.

### TripInstanceResponse

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "tripTemplateId": "uuid",
  "driverId": "uuid or null",
  "vehicleId": "uuid or null",
  "tripStatus": "SCHEDULED",
  "totalCapacity": 40,
  "minRevenue": null,
  "autoCancelAt": null,
  "forceConfirm": false,
  "isPublic": false,
  "departureTime": "2026-05-10T07:30:00.000Z",
  "arrivalEstimate": "2026-05-10T08:15:00.000Z",
  "createdAt": "...",
  "updatedAt": "...",

  // Fields below are populated on GET /trip-instances/{id} and
  // GET /trip-instances/organization/{organizationId} (single JOIN query — no extra round-trips).
  // On other endpoints (POST, PATCH /status, PUT /driver, PUT /vehicle) they default to 0/empty.
  "bookedCount": 28,
  "availableSlots": 12,
  "departurePoint": "Terminal Rodoviário",
  "destination": "Universidade Federal",
  "priceOneWay": 12.5,
  "priceReturn": 12.5,
  "priceRoundTrip": 20.0,
  "isRecurring": true,

  // Only populated on GET /trip-instances/{id}.
  "template": {
    "id": "uuid",
    "origin": "Terminal Rodoviário",
    "destination": "Universidade Federal",
    "stops": ["Terminal Rodoviário", "Praça Central", "Universidade Federal"]
  }
}
```

### PublicTripInstanceResponse

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "tripTemplateId": "uuid",
  "tripStatus": "SCHEDULED",
  "departureTime": "2026-05-10T07:30:00.000Z",
  "arrivalEstimate": "2026-05-10T08:15:00.000Z",
  "totalCapacity": 40,
  "departurePoint": "Terminal Rodoviário",
  "destination": "Universidade Federal",
  "priceOneWay": 12.5,
  "priceReturn": 12.5,
  "priceRoundTrip": 20.0,
  "isRecurring": true
}
```

### BookingResponse

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "userId": "uuid",
  "tripInstanceId": "uuid",
  "enrollmentDate": "2026-05-01T10:00:00.000Z",
  "status": "ACTIVE",
  "presenceConfirmed": false,
  "enrollmentType": "ONE_WAY",
  "recordedPrice": 12.5,
  "boardingStop": "Terminal Rodoviário",
  "alightingStop": "Universidade Federal",
  "paymentMethod": "PIX",
  "createdAt": "...",
  "updatedAt": "..."
}
```

> `paymentMethod` is `null` when the booking was created before this field was introduced or if not resolved from the payment record.

### TripPassengerResponse

```json
[
  { "userId": "uuid", "name": "João Silva", "boardingStop": "A2" },
  { "userId": "uuid", "name": "Maria Souza", "boardingStop": "B1" }
]
```

### BookingDetailsResponse

Same as BookingResponse plus:

```json
{
  "tripDepartureTime": "2026-06-15T07:30:00.000Z",
  "tripArrivalEstimate": "2026-06-15T09:00:00.000Z",
  "tripStatus": "SCHEDULED",
  "totalCapacity": 40,
  "availableSlots": 12
}
```

### SubscriptionResponse

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "planId": 1,
  "status": "ACTIVE",
  "startDate": "2026-01-01T00:00:00.000Z",
  "expiresAt": "2026-02-01T00:00:00.000Z",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### PlanResponse

```json
{
  "id": 1,
  "name": "FREE",
  "price": 0,
  "maxVehicles": 1,
  "maxDrivers": 2,
  "maxMonthlyTrips": 10,
  "durationDays": 30,
  "isActive": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### PlanUsageResponse

```json
{
  "vehicles": { "used": 4, "max": 10 },
  "drivers": { "used": 2, "max": 5 },
  "monthlyTrips": { "used": 17, "max": 50 }
}
```

### PaymentResponse

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "enrollmentId": "uuid",
  "method": "PIX",
  "amount": 12.5,
  "status": "PENDING",
  "createdAt": "...",
  "updatedAt": "..."
}
```

### TripSchedulingConfigResponse

```json
{
  "id": "uuid",
  "organizationId": "uuid",
  "daysAhead": 14,
  "generationCron": "0 2 * * *",
  "autoCancelCron": "*/15 * * * *",
  "enabled": true,
  "createdAt": "...",
  "updatedAt": "..."
}
```

### GenerateInstancesResponse

```json
{
  "created": 6,
  "skipped": 8,
  "failed": 0
}
```

- `created` — `TripInstance` rows inserted by this run.
- `skipped` — days skipped because the day fell outside the template frequency, an instance already existed (idempotency), the departure was in the past, or a parallel writer won the unique-constraint race.
- `failed` — per-day save failures (logged server-side; the sweep does **not** abort on a single failure).

---

## Common Errors

All error responses follow this shape:

```json
{
  "statusCode": 400,
  "timestamp": "2026-05-09T12:34:56.789Z",
  "path": "/bookings/abc/cancel",
  "message": "Cancellation deadline for booking \"abc\" has already passed",
  "error": "BOOKING_CANCEL_WINDOW_CLOSED_BAD_REQUEST"
}
```

The `error` field carries a stable domain error code — use it (not `message`) to drive UI copy.

| HTTP  | When                                           |
| ----- | ---------------------------------------------- |
| `400` | Validation failed (missing/invalid fields)     |
| `401` | Missing or invalid JWT / expired refresh token |
| `403` | Insufficient role or plan limit exceeded       |
| `404` | Resource not found                             |
| `409` | Duplicate (user/org/vehicle already exists)    |

### Booking Cancellation Error Codes

`PATCH /bookings/{id}/cancel` may reject with HTTP `400`. Map the `error` code to user-facing copy:

| `error`                                    | Meaning                             | Suggested copy                                                     |
| ------------------------------------------ | ----------------------------------- | ------------------------------------------------------------------ |
| `BOOKING_CANCEL_WINDOW_CLOSED_BAD_REQUEST` | Departure is within 30 minutes      | "Cancellation closes 30 minutes before departure."                 |
| `BOOKING_TRIP_TERMINAL_BAD_REQUEST`        | Trip is `IN_PROGRESS` or `FINISHED` | "This trip already started — bookings can no longer be cancelled." |
| `BOOKING_ALREADY_INACTIVE_BAD_REQUEST`     | Booking is already cancelled        | "This booking has already been cancelled."                         |

### Trip Scheduling Error Codes

Returned by `POST /trip-templates`, `PUT /trip-templates/{id}`, `POST /trip-templates/{id}/generate-instances`, and `POST /trip-instances/organization/{organizationId}`:

| `error`                                   | HTTP | Meaning                                                                                                                             |
| ----------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------- |
| `INVALID_TRIP_TIME_OF_DAY_FORMAT`         | 400  | `departureTimeOfDay` / `arrivalTimeOfDay` is not in `HH:mm` 24-hour format                                                          |
| `INVALID_TRIP_TIME_OF_DAY_ORDER`          | 400  | Domain-level rejection of an invalid time-of-day pair (reserved; same-day crossings are allowed)                                    |
| `INVALID_TRIP_TEMPLATE_DEFAULT_CAPACITY`  | 400  | `defaultCapacity` is missing or `< 1`                                                                                               |
| `INVALID_TRIP_TEMPLATE_MISSING_SCHEDULE`  | 400  | Template has no `departureTimeOfDay` / `arrivalTimeOfDay`. Populate them via `PUT /trip-templates/{id}` before generating instances |
| `INVALID_TRIP_TEMPLATE_MISSING_CAPACITY`  | 400  | Template has no `defaultCapacity`. Populate it before generating instances                                                          |
| `TRIP_TEMPLATE_NOT_RECURRING_BAD_REQUEST` | 400  | `POST /trip-templates/{id}/generate-instances` was called on a non-recurring or inactive template                                   |
| `MONTHLY_TRIP_PLAN_LIMIT_FORBIDDEN`       | 403  | Organization has reached its plan's monthly trip quota                                                                              |
