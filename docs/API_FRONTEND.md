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

| Label     | Meaning                                           |
| --------- | ------------------------------------------------- |
| 🌐 Public | No auth required                                  |
| 🔒 JWT    | Any logged-in user                                |
| 🛡️ ADMIN  | Requires ADMIN role in the relevant organization  |
| 🚗 DRIVER | Requires DRIVER role in the relevant organization |
| 🧑‍💻 DEV    | Dev-only emails (bypass all tenant checks)        |

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

### `POST /auth/forgot-password` 🌐 Public

Request a password-reset email. **Always returns `204`**, even if the email is not registered — this is a constant-response design to prevent account enumeration. Do **not** show the user a different message based on the status code. Always render the same generic confirmation ("If your email is registered, you'll receive a recovery link").

If the email maps to an `ACTIVE` user, a reset token is emailed (TTL **1 hour**). The user then submits the token to `POST /auth/reset-password`.

> **In dev mode**, the email goes to the in-memory mock (see [`GET /dev/emails/latest`](#get-devemailslatest--dev)). Dev users can pull the token from there to auto-fill the reset screen.

**Body**
| Field | Type | Required |
|---|---|---|
| `email` | string (email format) | ✅ |

**Response `204`** → No content (always, regardless of email existence)

---

### `POST /auth/reset-password` 🌐 Public

Redeem a password-reset token and set a new password. On success, **all the user's active refresh tokens are revoked** (anti-takeover protection) and a fresh access/refresh pair is issued — i.e. the user is auto-logged-in. The FE should save these tokens and redirect to the dashboard, no extra login screen needed.

**Body**
| Field | Type | Required | Notes |
|---|---|---|---|
| `token` | string | ✅ | Raw token received by email (or via `/dev/emails/latest` in dev) |
| `newPassword` | string (min 8) | ✅ | |

**Response `200`** → [TokenResponse](#tokenresponse)
**`400`** → `INVALID_OR_EXPIRED_RESET_TOKEN_BAD_REQUEST` (token missing, expired, or already used — three cases collapse into one error)

---

### `POST /auth/verify-email` 🌐 Public

Mark the authenticated user's email as verified. After a successful call, `user.emailVerifiedAt` on subsequent `TokenResponse`s will be a date (was `null`).

Token TTL is **24 hours**. The token is single-use — calling twice returns `400`.

After a `204`, call `POST /auth/refresh` to obtain a new `TokenResponse` with `user.emailVerifiedAt` populated (the previous JWT was issued before verification and still reflects `null` in the embedded user object).

**Body**
| Field | Type | Required | Notes |
|---|---|---|---|
| `token` | string | ✅ | Raw token received by email (or via `/dev/emails/latest` in dev) |

**Response `204`** → No content
**`400`** → `INVALID_OR_EXPIRED_VERIFICATION_TOKEN_BAD_REQUEST`

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
| `cnhCategories` | `("A" \| "B" \| "C" \| "D" \| "E")[]` | ✅ | At least one entry; up to 5. Drivers may legally hold multiple categories simultaneously (e.g. `["A", "B"]`). Case-insensitive and deduplicated on the server. |
| `cnhExpiresAt` | string (YYYY-MM-DD) | ✅ | |

**Response `201`** → [DriverResponse](#driverresponse)

---

### `GET /drivers/me` 🔒 JWT

Get the current user's driver profile.

**Response `200`** → [DriverResponse](#driverresponse)

---

### `PATCH /drivers/me` 🔒 JWT

Self-service update of the authenticated driver's own profile. Use this from the `/profile/driver` edit screen — the admin-only `PUT /drivers/{id}` is for tenant admins managing other drivers and rejects the driver themselves with `403`.

**Allowed fields** (both optional, partial update — send only what changed):

- `cnhExpiresAt` — refresh the CNH expiry date when the driver renews the document.
- `cnhCategories` — replacement set of held categories. Use this when the driver gains or loses a category (e.g. adds `D` after a course). The list **replaces** the stored set, not merges — to add `D` to an existing `["A", "B"]`, send `["A", "B", "D"]`.

**What is NOT changeable here** (still admin-only via `PUT /drivers/{id}`):

- `cnh` — the license number is identity-grade and requires admin review of the new document.
- `driverStatus` — activation/suspension is an administrative decision.

**Important behaviour:**

- Resolves the driver profile linked to the authenticated `userId`. If the user has no driver profile yet, returns `404` with `DRIVER_PROFILE_NOT_FOUND` — the FE should redirect to the driver-onboarding flow.
- Drivers in `INACTIVE` or `SUSPENDED` state get `403` with `DRIVER_INACTIVE_FORBIDDEN`. An admin must reactivate the profile first.
- An **empty payload is a no-op** — returns the current driver state with `200`. The FE doesn't need to short-circuit empty forms.

**Body** (both optional)
| Field | Type | Notes |
|---|---|---|
| `cnhExpiresAt` | string (YYYY-MM-DD) | Must be a valid ISO date |
| `cnhCategories` | `("A" \| "B" \| "C" \| "D" \| "E")[]` | 1..5 entries. Replaces the stored set |

**Response `200`** → [DriverResponse](#driverresponse)
**`403`** → `DRIVER_INACTIVE_FORBIDDEN` (driver is `INACTIVE`/`SUSPENDED`)
**`404`** → `DRIVER_PROFILE_NOT_FOUND` (authenticated user has no driver profile)

---

### `GET /drivers/lookup` 🛡️ ADMIN

Look up a driver by email + CNH (to get their `userId` before creating a membership).

**Query:** `?email=joao@email.com&cnh=123456789`

**Response `200`** → `{ driverId, userId, userName, userEmail, cnhCategories, cnhExpiresAt, driverStatus }`

---

### `GET /drivers/organization/{organizationId}` 🛡️ ADMIN

List all drivers in an organization (paginated).

**Response `200`** → Paginated [[DriverResponse](#driverresponse)]

---

### `GET /drivers/{id}` 🛡️ ADMIN

Get a driver by ID.

**Response `200`** → [DriverResponse](#driverresponse)

---

### `PUT /drivers/{id}` 🛡️ ADMIN

Update a driver profile (admin-only — for the driver editing their own profile, use [`PATCH /drivers/me`](#patch-driversme--jwt)). All fields optional, but the three CNH fields follow an **all-or-nothing** rule: to change the license you must send `cnh`, `cnhCategories`, and `cnhExpiresAt` together. Sending only some of them returns `400` with `INVALID_PARTIAL_CNH_UPDATE_BAD_REQUEST`.

**Body**
| Field | Type | Notes |
|---|---|---|
| `cnh` | string | 9–12 chars. Send together with `cnhCategories` + `cnhExpiresAt` |
| `cnhCategories` | `("A" \| "B" \| "C" \| "D" \| "E")[]` | 1..5 entries. Send together with `cnh` + `cnhExpiresAt` |
| `cnhExpiresAt` | string (YYYY-MM-DD) | Send together with `cnh` + `cnhCategories` |
| `status` | `"ACTIVE"` \| `"INACTIVE"` \| `"SUSPENDED"` | Independent of the CNH fields |

**Response `200`** → [DriverResponse](#driverresponse)
**`400`** → `INVALID_PARTIAL_CNH_UPDATE_BAD_REQUEST` (only some CNH fields provided)

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
| `defaultDriverId` | string (UUID) | | Default driver assigned to generated instances. Must belong to the same org. When set **together with** `defaultVehicleId`, generated instances are auto-promoted from `DRAFT` to `SCHEDULED` (visible to passengers immediately) |
| `defaultVehicleId` | string (UUID) | | Default vehicle assigned to generated instances. Must belong to the same org. See `defaultDriverId` for the auto-promotion rule |
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
> `defaultDriverId` and `defaultVehicleId` are independent: you can set one without the other. Only when **both** are present does the generator skip `DRAFT` and create the instance directly as `SCHEDULED`. With one or zero defaults, instances stay in `DRAFT` and require manual driver/vehicle assignment before they become public.

**Response `201`** → [TripTemplateResponse](#triptemplateresponse)
**`400`** → `INVALID_TRIP_TIME_OF_DAY_FORMAT`, `INVALID_TRIP_TEMPLATE_DEFAULT_CAPACITY`, `DRIVER_NOT_FOUND_BAD_REQUEST`, `VEHICLE_NOT_FOUND`
**`403`** → `DRIVER_ACCESS_FORBIDDEN`, `VEHICLE_ACCESS_FORBIDDEN` (default driver/vehicle belongs to another org)

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
| `defaultDriverId` | string (UUID) \| `null` | Pass a UUID to set/replace the default driver, or `null` to clear it. Must belong to the same org |
| `defaultVehicleId` | string (UUID) \| `null` | Pass a UUID to set/replace the default vehicle, or `null` to clear it. Must belong to the same org |
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
**`400`** → `DRIVER_NOT_FOUND_BAD_REQUEST`, `VEHICLE_NOT_FOUND`
**`403`** → `DRIVER_ACCESS_FORBIDDEN`, `VEHICLE_ACCESS_FORBIDDEN`

---

### `POST /trip-templates/{id}/generate-instances` 🛡️ ADMIN

Manually generate the rolling-window of `TripInstance`s for a **recurring** template. Mirrors the daily cron sweep (`0 2 * * *` UTC) but scoped to a single template.

Useful right after creating a new recurring template (so admins don't have to wait until 02:00 UTC for the next cron tick) or to backfill after cron downtime. Same idempotency (one instance per `[templateId, calendarDay]`), plan-limit checks (`MONTHLY_TRIP_PLAN_LIMIT_FORBIDDEN`), and unique-constraint race protections as the cron sweep.

Past departures are **skipped** — the endpoint never creates instances with a `departureTime` in the past. To schedule a past-dated trip use `POST /trip-instances/organization/{organizationId}` directly.

**Initial status of generated instances** depends on the template's defaults:

- Template has **both** `defaultDriverId` and `defaultVehicleId` → instances are created as `SCHEDULED` with the defaults pre-assigned (visible on the public listing immediately).
- Template has **neither, or only one** of the defaults → instances are created as `DRAFT` with `driverId = null` and `vehicleId = null`. Admin must assign driver+vehicle (via `PUT /trip-instances/{id}/driver` and `/vehicle`) and then transition to `SCHEDULED` via `PATCH /trip-instances/{id}/status` before passengers can see/book the trip.

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

### `GET /trip-instances/driver/me` 🚗 DRIVER

List trip instances **assigned to the current driver**, scoped to the caller's organization. Self-service equivalent of the admin listing — the driver sees only their own trips.

**Important behaviour:**

- Scoped to `ctx.organizationId` from the JWT — drivers with memberships in multiple orgs only see trips from the org they're currently signed-in to. No cross-tenant leak.
- If the caller has no driver profile (still onboarding) **or** their driver profile is `INACTIVE`/`SUSPENDED`, the endpoint returns an empty page (`data: [], total: 0`) — **not** a 403 or 404. The FE can render "no trips assigned yet" the same way for all three cases.
- Returns the **same enriched shape** as the admin listing (`bookedCount`, `availableSlots`, denormalized template fields) via a single JOIN — no N+1, no follow-up calls needed.

**Query**
| Param | Type | Notes |
|---|---|---|
| `page` | integer (≥1) | Default 1 |
| `limit` | integer (≥1) | Default 10 |
| `status` | `"DRAFT"`\|`"SCHEDULED"`\|`"CONFIRMED"`\|`"IN_PROGRESS"`\|`"FINISHED"`\|`"CANCELED"` | Optional filter |

**Response `200`** → Paginated [[TripInstanceResponse](#tripinstanceresponse)] (with `bookedCount`, `availableSlots`, `departurePoint`, `destination`, prices populated)

---

### `GET /trip-instances/{id}` 🔒 JWT

Get a trip instance by ID. **Enriched response** — joins the parent template (`id`, `origin`, `destination`, `stops`) and live occupancy (`bookedCount`, `availableSlots`) in a single query, so the FE no longer needs a follow-up `GET /trip-templates/{id}` call.

**Response `200`** → [TripInstanceResponse](#tripinstanceresponse) (with `template`, `bookedCount`, `availableSlots` populated)

---

### `PATCH /trip-instances/{id}/status` 🛡️ ADMIN | 🚗 DRIVER

Transition a trip instance to a new lifecycle status.

**Status flow:** `DRAFT → SCHEDULED → CONFIRMED → IN_PROGRESS → FINISHED`
Can also go to `CANCELED` from `DRAFT`, `SCHEDULED`, or `CONFIRMED`.

**Authorization:**

- **ADMIN** of the tenant: any valid state transition (subject to the standard state machine + prerequisite checks).
- **DRIVER** of the tenant: may transition **only trips assigned to themselves**, and **only to** `IN_PROGRESS` (boarding) or `FINISHED` (arrival). Use this from the driver-app flow when the driver departs the origin or arrives at the destination. All other targets (`SCHEDULED`, `CONFIRMED`, `CANCELED`, …) remain admin-only.

The driver's own profile must be `ACTIVE` — `INACTIVE`/`SUSPENDED` drivers are rejected with the same `TRIP_NOT_ASSIGNED_TO_DRIVER_FORBIDDEN` error to avoid leaking driver state to the caller.

**Body**
| Field | Type | Required |
|---|---|---|
| `newStatus` | `"DRAFT"`\|`"SCHEDULED"`\|`"CONFIRMED"`\|`"IN_PROGRESS"`\|`"FINISHED"`\|`"CANCELED"` | ✅ |

**Response `200`** → [TripInstanceResponse](#tripinstanceresponse)
**`400`** → `TRIP_INSTANCE_STATUS_TRANSITION_BAD_REQUEST` (invalid state-machine transition) or `TRIP_INSTANCE_REQUIRED_FIELD_BAD_REQUEST` (driver/vehicle missing for `SCHEDULED`)
**`403`** → `TRIP_NOT_ASSIGNED_TO_DRIVER_FORBIDDEN` (DRIVER caller is not the assigned driver / has no active profile) or `DRIVER_TRIP_STATUS_TRANSITION_FORBIDDEN` (DRIVER caller targeted a status other than `IN_PROGRESS` / `FINISHED`)
**`404`** → `TRIP_INSTANCE_NOT_FOUND`

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

### `GET /public/plans` 🌐 Public

List all **active** plans (paginated), no authentication required. Use this on the onboarding/signup flow to render the "choose your plan" cards before the user has an account.

Only plans with `isActive = true` are returned. Ordered by `id` ascending (matches the price tier order: FREE → BASIC → PRO → PREMIUM).

**Query:** `?page=1&limit=10`

**Response `200`** → Paginated [[PlanResponse](#planresponse)]

---

### `GET /plans` 🔒 JWT

List all available plans (paginated), including inactive ones. For the in-app plan management UI (post-login).

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

### `PATCH /organizations/{organizationId}/payments/{id}/confirm` 🛡️ ADMIN | 🚗 DRIVER

Confirm a PENDING payment (simulated — no real payment gateway).

**Authorization:**

- **ADMIN** of the tenant: always allowed (subject to the standard tenant filter).
- **DRIVER** of the tenant: allowed **only if** the payment's TripInstance is currently assigned to this driver and the driver's profile is `ACTIVE`. Use this for the driver-app flow where the driver collects fare on boarding (e.g. cash) and confirms the payment from their phone.

**Response `200`** → [PaymentResponse](#paymentresponse)
**`400`** → `PAYMENT_ALREADY_PROCESSED_BAD_REQUEST` (payment is no longer `PENDING`)
**`403`** → `PAYMENT_NOT_ASSIGNED_TO_DRIVER_FORBIDDEN` (the calling driver doesn't own this trip, or is `INACTIVE`/`SUSPENDED`)
**`404`** → `PAYMENT_NOT_FOUND` (or payment belongs to a different organization)

---

### `PATCH /organizations/{organizationId}/payments/{id}/fail` 🛡️ ADMIN | 🚗 DRIVER

Fail a PENDING payment (simulated). Same authorization rules and error codes as the `confirm` endpoint above.

**Response `200`** → [PaymentResponse](#paymentresponse)
**`400`** → `PAYMENT_ALREADY_PROCESSED_BAD_REQUEST`
**`403`** → `PAYMENT_NOT_ASSIGNED_TO_DRIVER_FORBIDDEN`
**`404`** → `PAYMENT_NOT_FOUND`

---

## Dev Tools

Routes restricted to **developer accounts** (`DEV_EMAILS` env var on the backend lists which emails get `isDev=true` in the JWT). Used during development to inspect side-effects that would normally happen out-of-band (e.g. email delivery).

### `GET /dev/emails/latest` 🧑‍💻 DEV

Read the in-memory log of emails "sent" by the mock `EmailService`. The backend currently uses `ConsoleEmailService` — every call to `EmailService.send(...)` (password reset, email verification) appends the message to a bounded FIFO buffer (last 50). This endpoint exposes that buffer for the FE dev tooling.

Typical flow: user clicks "Forgot password" → FE polls or fetches this endpoint with `?to=<email>` → grabs the raw token from the latest entry's `metadata.token` → auto-fills the reset-password form.

> **In production**, the backend swaps `ConsoleEmailService` for a real SMTP/Resend adapter. This endpoint will likely return an empty array (the prod implementation won't write to the in-memory log). Treat the FE "pull from mock" UX as **dev-only** and gate it behind a build flag.

**Query**
| Param | Type | Notes |
|---|---|---|
| `to` | string (email) | Optional. When provided, returns only the **latest** email sent to that recipient (wrapped in an array; empty if none). |
| `limit` | integer | Default 10. Ignored when `to` is provided. |

**Response `200`** → array of [SentEmailRecord](#sentemailrecord), newest first

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
    "email": "john@example.com",
    "telephone": "11999999999",
    "emailVerifiedAt": null
  }
}
```

> `telephone` and `emailVerifiedAt` were added on 18 May 2026 (Phase 1 of the FE-blocker mitigation).
> `emailVerifiedAt` is `null` until the user redeems an email-verification token via `POST /auth/verify-email`; once verified, it becomes an ISO-8601 timestamp.

### UserResponse

```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@example.com",
  "telephone": "11999999999",
  "status": "ACTIVE",
  "emailVerifiedAt": null,
  "createdAt": "2026-01-01T00:00:00.000Z",
  "updatedAt": "2026-01-01T00:00:00.000Z"
}
```

> `emailVerifiedAt` is `null` until verified, otherwise an ISO-8601 timestamp.

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
  "cnhCategories": ["A", "B"],
  "cnhExpiresAt": "2028-12-31T00:00:00.000Z",
  "driverStatus": "ACTIVE",
  "createdAt": "...",
  "updatedAt": "..."
}
```

> `cnhCategories` is always an array, even if the driver holds a single category (`["B"]`). The list is server-normalised: deduplicated, upper-cased, and sorted alphabetically. The legacy `cnhCategory: string` field was removed on 19 May 2026 (Phase 5).

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
  "defaultDriverId": "uuid or null",
  "defaultVehicleId": "uuid or null",
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
> `defaultDriverId` and `defaultVehicleId` are independently nullable. They are nullified automatically (FK `ON DELETE SET NULL`) if the referenced driver/vehicle is deleted — the template stays valid, future instances just fall back to `DRAFT`.

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

### SentEmailRecord

Shape returned by `GET /dev/emails/latest` for each entry in the mock email buffer.

```json
{
  "to": "user@example.com",
  "subject": "Confirme seu email — Movy",
  "body": "Olá João,\n\nConfirme seu email...\n\nToken: a8b9d3f0-1234-4abc-9def-fedcba987654\n\nO token expira em 24 horas...",
  "metadata": {
    "kind": "email_verification",
    "userId": "uuid",
    "token": "a8b9d3f0-1234-4abc-9def-fedcba987654"
  },
  "sentAt": "2026-05-18T20:32:43.123Z"
}
```

- `metadata.kind` — either `"email_verification"` (24h TTL) or `"password_reset"` (1h TTL). Use this to know which form to autofill in the FE.
- `metadata.token` — the **raw** token. Same value that's embedded in `body`. Use this one for autofill (the body is just for human-readable rendering in a dev inbox UI).
- `body` is plain text in the current mock implementation.

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

### Auth — Password Reset & Email Verification Error Codes

Returned by `POST /auth/reset-password` and `POST /auth/verify-email`. All collapse three failure modes (missing, expired, already used) into a single error to prevent information leakage — the user-facing copy should always be the same regardless of the underlying cause, with a clear next step (request a new link).

| `error`                                             | HTTP | Meaning                                                     | Suggested copy                                                       |
| --------------------------------------------------- | ---- | ----------------------------------------------------------- | -------------------------------------------------------------------- |
| `INVALID_OR_EXPIRED_RESET_TOKEN_BAD_REQUEST`        | 400  | Reset token missing, expired (>1h), or already used         | "This password recovery link is no longer valid. Request a new one." |
| `INVALID_OR_EXPIRED_VERIFICATION_TOKEN_BAD_REQUEST` | 400  | Verification token missing, expired (>24h), or already used | "This verification link is no longer valid. Request a new one."      |

> `POST /auth/forgot-password` **never** returns these errors — it always responds `204` regardless of email existence. Do not surface "email not found" to the user; show the same generic confirmation in all cases.

### Payment Driver Authorization Error Code

Returned by `PATCH /organizations/{orgId}/payments/{id}/confirm` and `.../fail` when called by a DRIVER.

| `error`                                    | HTTP | Meaning                                                                                                                                                                                                                             |
| ------------------------------------------ | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `PAYMENT_NOT_ASSIGNED_TO_DRIVER_FORBIDDEN` | 403  | The calling driver is not assigned to the TripInstance of this payment, OR their driver profile is `INACTIVE`/`SUSPENDED`, OR the TripInstance has no driver assigned yet. ADMINs of the same tenant are not subject to this check. |

### Trip Status — Driver Authorization Error Codes

Returned by `PATCH /trip-instances/{id}/status` when called by a DRIVER. ADMINs of the tenant are not subject to either check.

| `error`                                   | HTTP | Meaning                                                                                                                                                                                                                       | Suggested copy                                            |
| ----------------------------------------- | ---- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| `TRIP_NOT_ASSIGNED_TO_DRIVER_FORBIDDEN`   | 403  | The calling driver is not the assigned driver of this trip, OR their driver profile is `INACTIVE`/`SUSPENDED`, OR the trip has no driver assigned yet. Three sub-cases collapse into one error to avoid leaking driver state. | "You can only update trips assigned to you."              |
| `DRIVER_TRIP_STATUS_TRANSITION_FORBIDDEN` | 403  | The calling driver targeted a status outside the allowed `IN_PROGRESS` / `FINISHED` whitelist (e.g. tried to `CANCEL`). Cancellations and earlier-stage transitions remain admin-only.                                        | "Drivers can only mark trips as in-progress or finished." |

### Driver Self-Update Error Codes

Returned by `PATCH /drivers/me`.

| `error`                              | HTTP | Meaning                                                                    | Suggested copy                                                               |
| ------------------------------------ | ---- | -------------------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| `DRIVER_PROFILE_NOT_FOUND`           | 404  | The authenticated user has no driver profile yet                           | "You don't have a driver profile yet. Complete the driver onboarding first." |
| `DRIVER_INACTIVE_FORBIDDEN`          | 403  | The driver profile is `INACTIVE` or `SUSPENDED` and cannot be self-updated | "Your driver profile is inactive. Contact an administrator."                 |
| `INVALID_CNH_CATEGORIES_BAD_REQUEST` | 400  | The `cnhCategories` array is empty or contains an unknown category         | "Provide at least one valid CNH category (A, B, C, D, or E)."                |

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
| `DRIVER_NOT_FOUND_BAD_REQUEST`            | 400  | `defaultDriverId` on the template body does not match any driver                                                                    |
| `VEHICLE_NOT_FOUND`                       | 404  | `defaultVehicleId` on the template body does not match any vehicle                                                                  |
| `DRIVER_ACCESS_FORBIDDEN`                 | 403  | `defaultDriverId` belongs to a different organization                                                                               |
| `VEHICLE_ACCESS_FORBIDDEN`                | 403  | `defaultVehicleId` belongs to a different organization                                                                              |
| `MONTHLY_TRIP_PLAN_LIMIT_FORBIDDEN`       | 403  | Organization has reached its plan's monthly trip quota                                                                              |
