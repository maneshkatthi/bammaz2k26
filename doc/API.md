# Bammaz2k26 — API Contract v1.1

## 0. Changelog (v1.0 → v1.1)

| # | Change | Reason |
|---|---|---|
| 1 | Organizer accounts are created by a seed script, never via signup | v1.0 had no way to create organizers |
| 2 | Added `GET /api/auth/me` | Restore session after page refresh |
| 3 | Added `GET /api/events/mine` (organizer) | "My Events" dashboard |
| 4 | `organizerId` now returned in every event object (list, get, create, update) | Consistent event shape |
| 5 | Added `POST /api/uploads/poster` | Project doc says organizers upload a poster |
| 6 | Registration accepts optional `teamName` and `teamMembers` | Events have a `teamSize` |
| 7 | Added `GET /api/registrations/mine` (student) | Student dashboard and confirmation lookup |
| 8 | Registration statuses defined: `registered`, `cancelled` | v1.0 only showed `registered` |
| 9 | Signin user object now matches signup user object | Consistent user shape |
| 10 | Register response now includes `registeredAt` | Consistent registration shape |
| 11 | Full error tables for every endpoint | v1.0 had gaps |
| 12 | Token expiry, delete behaviour, and duplicate rules specified | Undefined in v1.0 |

Endpoints grew from 9 to 13. No existing v1.0 request or response was broken: changes are additive, apart from the shape fixes in items 4, 9 and 10, which only add fields.

---

## 1. Overview

This document is the communication contract between the **Bammaz2k26 frontend and backend**. Both developers treat it as the source of truth. Change the contract **before** changing the code.

```text
Frontend  ──HTTP/JSON──▶  Backend API  ──SQL──▶  PostgreSQL
```

---

## 2. Base URL

| Environment | URL |
|---|---|
| Development | `http://localhost:5000/api` |
| Production | `https://<backend-domain>/api` |

Frontend env variable:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 3. Conventions

- JSON requests use `Content-Type: application/json`. The only exception is the poster upload (multipart).
- All responses are JSON and contain `success` (boolean).
- Field names are `camelCase`.
- Dates are `YYYY-MM-DD`, times are 24-hour `HH:mm`, timestamps are ISO 8601 UTC (e.g. `2026-09-29T18:30:00Z`).
- Money values (`registrationFee`, `prizePool`) are non-negative integers in INR.
- IDs are opaque strings (e.g. `USR001`, `EVT001`, `REG001`). The frontend must not parse them.
- The backend generates all IDs. The frontend never sends an `id` on create.

---

## 4. Authentication

Protected requests carry a token:

```http
Authorization: Bearer <token>
```

- The token is a JWT issued on signin.
- **Expiry: 7 days.** After expiry the backend returns `401` and the frontend sends the user to Signin.
- The backend validates the token, identifies the user, checks the role, and authorizes the operation.
- Passwords are hashed by the backend (bcrypt or argon2) and are **never** returned.

### Auth error responses (apply to every protected endpoint)

| Status | When | Message |
|---|---|---|
| `401` | Header missing, malformed, invalid or expired token | `Authentication required` |
| `403` | Valid token but wrong role | `You do not have permission to perform this action` |

---

## 5. Roles

```text
student
organizer
```

A user has exactly one role.

### Creating accounts

- `POST /auth/signup` **always** creates a `student`. A `role` field in the request body is ignored.
- **Organizer accounts are created by a backend seed script** (e.g. `npm run seed:organizer`), which inserts the user directly into the database with `role = 'organizer'`. There is no public API for this in the MVP.

### Standard user object

Used in signup, signin and `/auth/me`:

```json
{
  "id": "USR001",
  "name": "Manesh Katthi",
  "rollNumber": "23XX1A0501",
  "year": 2,
  "email": "manesh@example.com",
  "role": "student"
}
```

---

## 6. Standard Event Object

Every endpoint that returns an event uses this exact shape (the list endpoints return an array of it):

```json
{
  "id": "EVT001",
  "name": "Bammaz2k26",
  "description": "Annual college technical event",
  "date": "2026-10-10",
  "startTime": "10:00",
  "endTime": "17:00",
  "registrationFee": 100,
  "teamSize": 4,
  "prizePool": 10000,
  "posterUrl": "https://example.com/poster.jpg",
  "organizerId": "USR010"
}
```

`posterUrl` may be `null` if no poster was provided.

### Event validation rules

| Field | Rule |
|---|---|
| `name` | Required, 1–150 characters |
| `description` | Required, 1–5000 characters |
| `date` | Required, valid `YYYY-MM-DD` |
| `startTime`, `endTime` | Required, valid `HH:mm`; `endTime` must be after `startTime` |
| `registrationFee` | Required, integer ≥ 0 (`0` = free) |
| `teamSize` | Required, integer ≥ 1 (`1` = individual event) |
| `prizePool` | Required, integer ≥ 0 |
| `posterUrl` | Optional, valid `http(s)` URL or `null` |

---

## 7. Auth APIs

### 7.1 Signup

`POST /api/auth/signup` — **Auth: not required**

**Request**

```json
{
  "name": "Manesh Katthi",
  "rollNumber": "23XX1A0501",
  "year": 2,
  "email": "manesh@example.com",
  "password": "password123"
}
```

| Field | Type | Required | Rule |
|---|---|---|---|
| `name` | string | Yes | 1–100 characters |
| `rollNumber` | string | Yes | 1–20 characters, stored uppercase |
| `year` | integer | Yes | 1–4 |
| `email` | string | Yes | Valid email, stored lowercase, unique |
| `password` | string | Yes | Minimum 8 characters |

**Success — `201 Created`**

```json
{
  "success": true,
  "message": "Account created successfully",
  "user": {
    "id": "USR001",
    "name": "Manesh Katthi",
    "rollNumber": "23XX1A0501",
    "year": 2,
    "email": "manesh@example.com",
    "role": "student"
  }
}
```

Signup does **not** log the user in. The frontend redirects to Signin.

**Errors**

| Status | Message |
|---|---|
| `400` | `Validation failed` (with `errors` object, see section 15) |
| `409` | `Email already registered` |

---

### 7.2 Signin

`POST /api/auth/signin` — **Auth: not required**

**Request**

```json
{
  "email": "manesh@example.com",
  "password": "password123"
}
```

**Success — `200 OK`**

```json
{
  "success": true,
  "message": "Login successful",
  "token": "<jwt>",
  "user": {
    "id": "USR001",
    "name": "Manesh Katthi",
    "rollNumber": "23XX1A0501",
    "year": 2,
    "email": "manesh@example.com",
    "role": "student"
  }
}
```

The frontend redirects by `user.role`: students to the Student Dashboard, organizers to the Organizer Dashboard.

**Errors**

| Status | Message |
|---|---|
| `400` | `Email and password are required` |
| `401` | `Invalid email or password` (same message for unknown email and wrong password) |

---

### 7.3 Get Current User *(new)*

`GET /api/auth/me` — **Auth: required, any role**

Used on app load to validate a stored token and restore the session.

**Success — `200 OK`**

```json
{
  "success": true,
  "user": {
    "id": "USR001",
    "name": "Manesh Katthi",
    "rollNumber": "23XX1A0501",
    "year": 2,
    "email": "manesh@example.com",
    "role": "student"
  }
}
```

**Errors:** `401 Authentication required`.

---

## 8. Event APIs

### 8.1 Get All Events

`GET /api/events` — **Auth: not required**

Returns all events, ordered by `date` ascending, then `startTime`.

**Success — `200 OK`**

```json
{
  "success": true,
  "events": [
    {
      "id": "EVT001",
      "name": "Bammaz2k26",
      "description": "Annual college technical event",
      "date": "2026-10-10",
      "startTime": "10:00",
      "endTime": "17:00",
      "registrationFee": 100,
      "teamSize": 4,
      "prizePool": 10000,
      "posterUrl": "https://example.com/poster.jpg",
      "organizerId": "USR010"
    }
  ]
}
```

An empty list is `{ "success": true, "events": [] }`, not an error.

---

### 8.2 Get My Events *(new)*

`GET /api/events/mine` — **Auth: required, role `organizer`**

Returns only the events created by the authenticated organizer. Same response shape as 8.1.

> **Route order:** register `/events/mine` **before** `/events/:eventId` in Express, otherwise `mine` is treated as an event ID.

**Success — `200 OK`**

```json
{
  "success": true,
  "events": []
}
```

**Errors:** `401`, `403` (see section 4).

---

### 8.3 Get Event by ID

`GET /api/events/:eventId` — **Auth: not required**

**Success — `200 OK`**

```json
{
  "success": true,
  "event": {
    "id": "EVT001",
    "name": "Bammaz2k26",
    "description": "Annual college technical event",
    "date": "2026-10-10",
    "startTime": "10:00",
    "endTime": "17:00",
    "registrationFee": 100,
    "teamSize": 4,
    "prizePool": 10000,
    "posterUrl": "https://example.com/poster.jpg",
    "organizerId": "USR010"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `404` | `Event not found` |

---

### 8.4 Create Event

`POST /api/events` — **Auth: required, role `organizer`**

**Request** (validation rules in section 6)

```json
{
  "name": "Bammaz2k26",
  "description": "Annual college technical event",
  "date": "2026-10-10",
  "startTime": "10:00",
  "endTime": "17:00",
  "registrationFee": 100,
  "teamSize": 4,
  "prizePool": 10000,
  "posterUrl": "https://example.com/poster.jpg"
}
```

The backend sets `organizerId` from the token. Any `organizerId` sent by the client is ignored.

**Success — `201 Created`**

```json
{
  "success": true,
  "message": "Event created successfully",
  "event": {
    "id": "EVT001",
    "name": "Bammaz2k26",
    "description": "Annual college technical event",
    "date": "2026-10-10",
    "startTime": "10:00",
    "endTime": "17:00",
    "registrationFee": 100,
    "teamSize": 4,
    "prizePool": 10000,
    "posterUrl": "https://example.com/poster.jpg",
    "organizerId": "USR010"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Validation failed` (with `errors` object) |
| `401` | `Authentication required` |
| `403` | `You do not have permission to perform this action` |

---

### 8.5 Update Event

`PUT /api/events/:eventId` — **Auth: required, role `organizer` (must own the event)**

`PUT` replaces the editable fields, so the request contains **all** event fields (same body as create).

**Request**

```json
{
  "name": "Bammaz2k26",
  "description": "Updated event description",
  "date": "2026-10-11",
  "startTime": "10:00",
  "endTime": "17:00",
  "registrationFee": 150,
  "teamSize": 4,
  "prizePool": 15000,
  "posterUrl": "https://example.com/new-poster.jpg"
}
```

**Success — `200 OK`**

```json
{
  "success": true,
  "message": "Event updated successfully",
  "event": {
    "id": "EVT001",
    "name": "Bammaz2k26",
    "description": "Updated event description",
    "date": "2026-10-11",
    "startTime": "10:00",
    "endTime": "17:00",
    "registrationFee": 150,
    "teamSize": 4,
    "prizePool": 15000,
    "posterUrl": "https://example.com/new-poster.jpg",
    "organizerId": "USR010"
  }
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Validation failed` (with `errors` object) |
| `401` | `Authentication required` |
| `403` | `You are not authorized to manage this event` (organizer does not own it) |
| `403` | `You do not have permission to perform this action` (user is a student) |
| `404` | `Event not found` |

Order of checks: authenticate, then role, then event exists, then ownership, then validation.

---

### 8.6 Delete Event

`DELETE /api/events/:eventId` — **Auth: required, role `organizer` (must own the event)**

**Behaviour:** deleting an event also **deletes all of its registrations** (`ON DELETE CASCADE`). The frontend should show a confirmation dialog warning about this.

**Success — `200 OK`**

```json
{
  "success": true,
  "message": "Event deleted successfully"
}
```

**Errors**

| Status | Message |
|---|---|
| `401` | `Authentication required` |
| `403` | `You are not authorized to manage this event` |
| `403` | `You do not have permission to perform this action` |
| `404` | `Event not found` |

---

## 9. Poster Upload *(new)*

`POST /api/uploads/poster` — **Auth: required, role `organizer`**

Uploads an image and returns a URL. The organizer form calls this first, then puts the returned URL in `posterUrl` when creating or updating an event. Pasting an external URL directly into `posterUrl` still works.

**Request:** `multipart/form-data`

| Field | Type | Rule |
|---|---|---|
| `poster` | file | Required. `image/jpeg`, `image/png` or `image/webp`. Maximum 2 MB |

**Success — `201 Created`**

```json
{
  "success": true,
  "message": "Poster uploaded successfully",
  "posterUrl": "https://<backend-domain>/uploads/posters/abc123.jpg"
}
```

**Errors**

| Status | Message |
|---|---|
| `400` | `Poster file is required` |
| `400` | `Only JPEG, PNG or WebP images are allowed` |
| `401` | `Authentication required` |
| `403` | `You do not have permission to perform this action` |
| `413` | `Poster must be 2 MB or smaller` |

> Storage (local disk, Cloudinary, S3, etc.) is a backend decision. Only the request and response above are part of the contract. Note that local disk storage is wiped on many free hosting tiers.

---

## 10. Registration APIs

### 10.1 Register for Event

`POST /api/events/:eventId/register` — **Auth: required, role `student`**

**Request**

```json
{
  "name": "Manesh Katthi",
  "branch": "ECE",
  "year": 2,
  "phoneNumber": "9876543210",
  "rollNumber": "23XX1A0501",
  "section": "B",
  "teamName": "Byte Force",
  "teamMembers": [
    { "name": "Ravi Kumar", "rollNumber": "23XX1A0502" },
    { "name": "Anita Rao", "rollNumber": "23XX1A0503" }
  ]
}
```

| Field | Type | Required | Rule |
|---|---|---|---|
| `name` | string | Yes | 1–100 characters |
| `branch` | string | Yes | 1–50 characters |
| `year` | integer | Yes | 1–4 |
| `phoneNumber` | string | Yes | 10 digits |
| `rollNumber` | string | Yes | 1–20 characters |
| `section` | string | Yes | 1–10 characters |
| `teamName` | string | Only if event `teamSize` > 1 | 1–100 characters |
| `teamMembers` | array | No | Each item: `name` and `rollNumber`. Length ≤ `teamSize - 1` |

**Team rule:** one student registers on behalf of the whole team and is the team lead. The registrant is not listed in `teamMembers`. For individual events (`teamSize` = 1), `teamName` and `teamMembers` are ignored.

The backend takes `userId` from the token.

**Rules enforced by the backend**

- The event must exist.
- A student may register for a given event only once (unique on `event_id` + `user_id`).
- Past events: registering is blocked once the event `date` has passed.

**Success — `201 Created`**

```json
{
  "success": true,
  "message": "Registration successful",
  "registration": {
    "id": "REG001",
    "eventId": "EVT001",
    "name": "Manesh Katthi",
    "branch": "ECE",
    "year": 2,
    "phoneNumber": "9876543210",
    "rollNumber": "23XX1A0501",
    "section": "B",
    "teamName": "Byte Force",
    "teamMembers": [
      { "name": "Ravi Kumar", "rollNumber": "23XX1A0502" },
      { "name": "Anita Rao", "rollNumber": "23XX1A0503" }
    ],
    "registeredAt": "2026-09-29T18:30:00Z",
    "status": "registered"
  }
}
```

For individual events, `teamName` is `null` and `teamMembers` is `[]`.

**Errors**

| Status | Message |
|---|---|
| `400` | `Validation failed` (with `errors` object) |
| `400` | `Registration is closed for this event` (event date has passed) |
| `401` | `Authentication required` |
| `403` | `You do not have permission to perform this action` (user is an organizer) |
| `404` | `Event not found` |
| `409` | `You are already registered for this event` |

---

### 10.2 Get Event Registrations

`GET /api/events/:eventId/registrations` — **Auth: required, role `organizer` (must own the event)**

**Success — `200 OK`**

```json
{
  "success": true,
  "eventId": "EVT001",
  "registrations": [
    {
      "id": "REG001",
      "name": "Manesh Katthi",
      "branch": "ECE",
      "year": 2,
      "phoneNumber": "9876543210",
      "rollNumber": "23XX1A0501",
      "section": "B",
      "teamName": "Byte Force",
      "teamMembers": [
        { "name": "Ravi Kumar", "rollNumber": "23XX1A0502" }
      ],
      "registeredAt": "2026-09-29T18:30:00Z",
      "status": "registered"
    }
  ]
}
```

Ordered by `registeredAt` ascending. No registrations gives an empty array.

**Errors**

| Status | Message |
|---|---|
| `401` | `Authentication required` |
| `403` | `You are not authorized to manage this event` |
| `403` | `You do not have permission to perform this action` |
| `404` | `Event not found` |

---

### 10.3 Get My Registrations *(new)*

`GET /api/registrations/mine` — **Auth: required, role `student`**

Returns the authenticated student's registrations, each with a summary of its event. Powers the Student Dashboard and lets the student see their registration ID again later.

**Success — `200 OK`**

```json
{
  "success": true,
  "registrations": [
    {
      "id": "REG001",
      "eventId": "EVT001",
      "eventName": "Bammaz2k26",
      "eventDate": "2026-10-10",
      "name": "Manesh Katthi",
      "branch": "ECE",
      "year": 2,
      "phoneNumber": "9876543210",
      "rollNumber": "23XX1A0501",
      "section": "B",
      "teamName": "Byte Force",
      "teamMembers": [],
      "registeredAt": "2026-09-29T18:30:00Z",
      "status": "registered"
    }
  ]
}
```

**Errors:** `401`, `403` (see section 4).

---

### 10.4 Registration status values

| Value | Meaning |
|---|---|
| `registered` | Active registration (the default) |
| `cancelled` | Reserved for future use. No cancel endpoint in the MVP |

---

## 11. Access Summary

| Endpoint | Student | Organizer | Auth |
|---|:---:|:---:|:---:|
| `POST /auth/signup` | ✅ | ✅ | ❌ |
| `POST /auth/signin` | ✅ | ✅ | ❌ |
| `GET /auth/me` | ✅ | ✅ | ✅ |
| `GET /events` | ✅ | ✅ | ❌ |
| `GET /events/mine` | ❌ | ✅ | ✅ |
| `GET /events/:id` | ✅ | ✅ | ❌ |
| `POST /events` | ❌ | ✅ | ✅ |
| `PUT /events/:id` | ❌ | ✅ (owner) | ✅ |
| `DELETE /events/:id` | ❌ | ✅ (owner) | ✅ |
| `POST /uploads/poster` | ❌ | ✅ | ✅ |
| `POST /events/:id/register` | ✅ | ❌ | ✅ |
| `GET /events/:id/registrations` | ❌ | ✅ (owner) | ✅ |
| `GET /registrations/mine` | ✅ | ❌ | ✅ |

---

## 12. Database Requirements Implied by This Contract

For the `DATABASE.md` author:

- `users.email` is unique.
- `registrations` has a unique constraint on `(event_id, user_id)`.
- `registrations.event_id` references `events.id` with `ON DELETE CASCADE`.
- `events.organizer_id` references `users.id`.
- `registrations` gains `team_name` (nullable text) and `team_members` (JSONB, default `[]`).
- `registrations.status` is restricted to `registered` or `cancelled`, defaulting to `registered`.
- `events.poster_url` is nullable.

---

## 13. HTTP Status Codes

| Status | Meaning |
|---|---|
| `200` | Request successful |
| `201` | Resource created |
| `400` | Invalid request or input |
| `401` | Authentication missing, invalid or expired |
| `403` | Authenticated but not permitted |
| `404` | Resource not found |
| `409` | Conflict (duplicate) |
| `413` | Upload too large |
| `500` | Internal server error |

---

## 14. Frontend ↔ Backend Responsibilities

**Frontend:** pages and navigation, collecting input, client-side validation (for user experience only), sending requests, loading and error states, storing the token and auth state, redirecting on `401`. It must never access the database directly.

**Backend:** authentication, authorization, server-side validation (never trust the frontend), password hashing, database operations, ownership checks, registration rules, ID generation, standardized responses.

---

## 15. Error Format

Every error uses:

```json
{
  "success": false,
  "message": "Description of the error"
}
```

Validation errors (`400`) additionally include field-level messages, keyed by the request field name:

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": {
    "email": "Invalid email address",
    "password": "Password must contain at least 8 characters"
  }
}
```

Unexpected server failures return `500` with `{ "success": false, "message": "Internal server error" }`. Stack traces and database errors must never be sent to the client.

---

## 16. Development Rule

If either developer wants to change an endpoint, request or response:

```text
Discuss → Update API.md (bump version) → Update frontend/backend → Test
```

Do not silently change request or response structures.

---

## 17. API Surface (v1.1)

```text
AUTH
  POST   /api/auth/signup
  POST   /api/auth/signin
  GET    /api/auth/me                         (new)

EVENTS
  GET    /api/events
  GET    /api/events/mine                     (new)
  GET    /api/events/:eventId
  POST   /api/events
  PUT    /api/events/:eventId
  DELETE /api/events/:eventId

UPLOADS
  POST   /api/uploads/poster                  (new)

REGISTRATIONS
  POST   /api/events/:eventId/register
  GET    /api/events/:eventId/registrations
  GET    /api/registrations/mine              (new)
```

**API contract v1.1 for Bammaz2k26.**
