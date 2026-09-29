# Bammaz2k26 — Database Design v1.1

This document defines the PostgreSQL schema. It is written to match **API.md v1.1**. If the API contract changes, update this document as well.

- **Database:** PostgreSQL 14+
- **Tables:** `users`, `events`, `registrations`
- **Naming:** `snake_case` in the database, `camelCase` in the API (the backend maps between them)

---

## 1. Entity Relationship Diagram

```text
┌──────────────────────┐
│        users         │
│──────────────────────│
│ id (PK)              │
│ name                 │
│ roll_number          │
│ year                 │
│ email (unique)       │
│ password_hash        │
│ role                 │
│ created_at           │
└───────┬───────┬──────┘
        │       │
        │ 1     │ 1
        │       │
        │ N     │ N
┌───────▼────┐ ┌▼──────────────────────┐
│   events   │ │     registrations     │
│────────────│ │───────────────────────│
│ id (PK)    │ │ id (PK)               │
│ name       │ │ event_id (FK) ────────┼──┐
│ ...        │ │ user_id  (FK)         │  │
│organizer_id│ │ name, branch, year    │  │
│  (FK)      │ │ phone_number          │  │
│ created_at │ │ roll_number, section  │  │
│ updated_at │ │ team_name             │  │
└──────┬─────┘ │ team_members (JSONB)  │  │
       │ 1     │ registered_at, status │  │
       │       └───────────────────────┘  │
       └───────────── N ──────────────────┘
```

### Relationships

| Relationship | Type | On delete |
|---|---|---|
| `events.organizer_id` → `users.id` | Many events to one organizer | `RESTRICT` (an organizer with events cannot be deleted) |
| `registrations.event_id` → `events.id` | Many registrations to one event | `CASCADE` (deleting an event deletes its registrations) |
| `registrations.user_id` → `users.id` | Many registrations to one student | `RESTRICT` |

The unique pair `(event_id, user_id)` guarantees a student registers for an event at most once.

---

## 2. Complete Schema (SQL)

Save as `backend/db/schema.sql` and run it once on an empty database.

```sql
-- ============================================================
-- Bammaz2k26 schema v1.1
-- ============================================================

-- ---------- ID sequences ----------
-- IDs look like USR001, EVT001, REG001 (matches API.md examples).
-- The number grows beyond 3 digits automatically (USR1000, ...).
CREATE SEQUENCE user_id_seq;
CREATE SEQUENCE event_id_seq;
CREATE SEQUENCE registration_id_seq;

-- ---------- Enum ----------
CREATE TYPE user_role AS ENUM ('student', 'organizer');

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE users (
    id             TEXT PRIMARY KEY
                   DEFAULT ('USR' || lpad(nextval('user_id_seq')::text, 3, '0')),
    name           VARCHAR(100) NOT NULL,
    roll_number    VARCHAR(20),
    year           SMALLINT,
    email          VARCHAR(255) NOT NULL,
    password_hash  TEXT NOT NULL,
    role           user_role NOT NULL DEFAULT 'student',
    created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT users_email_lowercase CHECK (email = lower(email)),
    CONSTRAINT users_year_range CHECK (year IS NULL OR year BETWEEN 1 AND 4),
    -- Students must have a roll number and year. Organizers may omit them.
    CONSTRAINT users_student_fields CHECK (
        role <> 'student' OR (roll_number IS NOT NULL AND year IS NOT NULL)
    )
);

CREATE UNIQUE INDEX users_email_key ON users (email);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE events (
    id                TEXT PRIMARY KEY
                      DEFAULT ('EVT' || lpad(nextval('event_id_seq')::text, 3, '0')),
    name              VARCHAR(150) NOT NULL,
    description       TEXT NOT NULL,
    date              DATE NOT NULL,
    start_time        TIME NOT NULL,
    end_time          TIME NOT NULL,
    registration_fee  INTEGER NOT NULL DEFAULT 0,
    team_size         INTEGER NOT NULL DEFAULT 1,
    prize_pool        INTEGER NOT NULL DEFAULT 0,
    poster_url        TEXT,
    organizer_id      TEXT NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),

    CONSTRAINT events_time_order CHECK (end_time > start_time),
    CONSTRAINT events_fee_nonneg CHECK (registration_fee >= 0),
    CONSTRAINT events_team_size_min CHECK (team_size >= 1),
    CONSTRAINT events_prize_nonneg CHECK (prize_pool >= 0)
);

CREATE INDEX events_date_idx ON events (date, start_time);
CREATE INDEX events_organizer_idx ON events (organizer_id);

-- ============================================================
-- REGISTRATIONS
-- ============================================================
CREATE TABLE registrations (
    id             TEXT PRIMARY KEY
                   DEFAULT ('REG' || lpad(nextval('registration_id_seq')::text, 3, '0')),
    event_id       TEXT NOT NULL REFERENCES events (id) ON DELETE CASCADE,
    user_id        TEXT NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
    name           VARCHAR(100) NOT NULL,
    branch         VARCHAR(50)  NOT NULL,
    year           SMALLINT     NOT NULL,
    phone_number   VARCHAR(10)  NOT NULL,
    roll_number    VARCHAR(20)  NOT NULL,
    section        VARCHAR(10)  NOT NULL,
    team_name      VARCHAR(100),
    team_members   JSONB NOT NULL DEFAULT '[]'::jsonb,
    registered_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    status         VARCHAR(20) NOT NULL DEFAULT 'registered',

    CONSTRAINT registrations_one_per_event UNIQUE (event_id, user_id),
    CONSTRAINT registrations_year_range CHECK (year BETWEEN 1 AND 4),
    CONSTRAINT registrations_phone_format CHECK (phone_number ~ '^[0-9]{10}$'),
    CONSTRAINT registrations_status_values CHECK (status IN ('registered', 'cancelled')),
    CONSTRAINT registrations_team_members_array CHECK (jsonb_typeof(team_members) = 'array')
);

-- The UNIQUE constraint already indexes (event_id, user_id).
-- This index serves "my registrations" lookups.
CREATE INDEX registrations_user_idx ON registrations (user_id);

-- ============================================================
-- Auto-update events.updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER events_set_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
```

---

## 3. Table Reference

### 3.1 `users`

| Column | Type | Null | Notes |
|---|---|:---:|---|
| `id` | TEXT | No | PK, generated (`USR001`) |
| `name` | VARCHAR(100) | No | |
| `roll_number` | VARCHAR(20) | Yes | Required for students, optional for organizers |
| `year` | SMALLINT | Yes | 1–4. Required for students |
| `email` | VARCHAR(255) | No | Unique, always stored lowercase |
| `password_hash` | TEXT | No | bcrypt or argon2 hash. Never returned by the API |
| `role` | user_role | No | `student` (default) or `organizer` |
| `created_at` | TIMESTAMPTZ | No | Defaults to now |

### 3.2 `events`

| Column | Type | Null | Notes |
|---|---|:---:|---|
| `id` | TEXT | No | PK, generated (`EVT001`) |
| `name` | VARCHAR(150) | No | |
| `description` | TEXT | No | |
| `date` | DATE | No | |
| `start_time` | TIME | No | |
| `end_time` | TIME | No | Must be after `start_time` |
| `registration_fee` | INTEGER | No | INR, ≥ 0. `0` means free |
| `team_size` | INTEGER | No | ≥ 1. `1` means individual |
| `prize_pool` | INTEGER | No | INR, ≥ 0 |
| `poster_url` | TEXT | Yes | |
| `organizer_id` | TEXT | No | FK to `users.id` |
| `created_at` | TIMESTAMPTZ | No | |
| `updated_at` | TIMESTAMPTZ | No | Maintained by trigger |

### 3.3 `registrations`

| Column | Type | Null | Notes |
|---|---|:---:|---|
| `id` | TEXT | No | PK, generated (`REG001`). This is the registration ID shown to the student |
| `event_id` | TEXT | No | FK to `events.id`, cascade delete |
| `user_id` | TEXT | No | FK to `users.id` |
| `name` | VARCHAR(100) | No | Participant name as entered on the form |
| `branch` | VARCHAR(50) | No | |
| `year` | SMALLINT | No | 1–4 |
| `phone_number` | VARCHAR(10) | No | Exactly 10 digits |
| `roll_number` | VARCHAR(20) | No | |
| `section` | VARCHAR(10) | No | |
| `team_name` | VARCHAR(100) | Yes | Required by the API when the event's `team_size` > 1 |
| `team_members` | JSONB | No | Array of `{ "name", "rollNumber" }`. Default `[]` |
| `registered_at` | TIMESTAMPTZ | No | |
| `status` | VARCHAR(20) | No | `registered` (default) or `cancelled` |

---

## 4. Column ↔ API Field Mapping

| Database | API |
|---|---|
| `users.roll_number` | `rollNumber` |
| `events.start_time` | `startTime` |
| `events.end_time` | `endTime` |
| `events.registration_fee` | `registrationFee` |
| `events.team_size` | `teamSize` |
| `events.prize_pool` | `prizePool` |
| `events.poster_url` | `posterUrl` |
| `events.organizer_id` | `organizerId` |
| `registrations.event_id` | `eventId` |
| `registrations.phone_number` | `phoneNumber` |
| `registrations.roll_number` | `rollNumber` |
| `registrations.team_name` | `teamName` |
| `registrations.team_members` | `teamMembers` |
| `registrations.registered_at` | `registeredAt` |

`password_hash` and `user_id` (on registrations) are never sent in API responses.

> **Format note:** `pg` returns `DATE` and `TIME` columns as JavaScript `Date` objects or strings depending on configuration. Format them to `YYYY-MM-DD` and `HH:mm` before responding, since the API contract requires those formats. For `TIME`, `to_char(start_time, 'HH24:MI')` in the query is the simplest approach.

---

## 5. Business Rules Enforced by the Database

| Rule | Enforced by |
|---|---|
| Email is unique, case-insensitive | Lowercase `CHECK` plus unique index (the backend must lowercase before insert) |
| A student cannot register twice for one event | `UNIQUE (event_id, user_id)` (violation code `23505`, map to API `409`) |
| Deleting an event removes its registrations | `ON DELETE CASCADE` |
| End time is after start time | `CHECK` |
| Fees, prize pool and team size are valid | `CHECK` |
| Registration status is valid | `CHECK` |
| Students always have roll number and year | `CHECK` |

### Rules the backend must enforce itself

These cannot be expressed cleanly as plain constraints, so the API layer handles them:

- Only users with `role = 'organizer'` can be `events.organizer_id`.
- Only users with `role = 'student'` can register.
- The organizer must own the event to update, delete or view registrations.
- `team_name` is required, and `team_members` has at most `team_size - 1` entries, when the event's `team_size` > 1.
- Registration is blocked once `events.date` has passed.

---

## 6. Common Queries

Use parameterized queries only (`$1`, `$2`, ...). Never build SQL by string concatenation.

**Signup: insert student**

```sql
INSERT INTO users (name, roll_number, year, email, password_hash)
VALUES ($1, upper($2), $3, lower($4), $5)
RETURNING id, name, roll_number, year, email, role;
```

**Signin: find user by email**

```sql
SELECT id, name, roll_number, year, email, role, password_hash
FROM users
WHERE email = lower($1);
```

**GET /events**

```sql
SELECT id, name, description,
       to_char(date, 'YYYY-MM-DD')     AS date,
       to_char(start_time, 'HH24:MI')  AS start_time,
       to_char(end_time, 'HH24:MI')    AS end_time,
       registration_fee, team_size, prize_pool, poster_url, organizer_id
FROM events
ORDER BY date, start_time;
```

**GET /events/mine**: same query with `WHERE organizer_id = $1`.

**Ownership check (update, delete, view registrations)**

```sql
SELECT organizer_id FROM events WHERE id = $1;
-- no row            -> 404 Event not found
-- organizer_id <> user id -> 403 You are not authorized to manage this event
```

**Register for event**

```sql
INSERT INTO registrations
  (event_id, user_id, name, branch, year, phone_number, roll_number, section, team_name, team_members)
VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb)
RETURNING *;
-- error code 23505 -> 409 You are already registered for this event
```

**GET /events/:id/registrations**

```sql
SELECT id, name, branch, year, phone_number, roll_number, section,
       team_name, team_members, registered_at, status
FROM registrations
WHERE event_id = $1
ORDER BY registered_at;
```

**GET /registrations/mine**

```sql
SELECT r.id, r.event_id, e.name AS event_name,
       to_char(e.date, 'YYYY-MM-DD') AS event_date,
       r.name, r.branch, r.year, r.phone_number, r.roll_number, r.section,
       r.team_name, r.team_members, r.registered_at, r.status
FROM registrations r
JOIN events e ON e.id = r.event_id
WHERE r.user_id = $1
ORDER BY r.registered_at DESC;
```

**Delete event**

```sql
DELETE FROM events WHERE id = $1;   -- registrations removed by cascade
```

---

## 7. Seeding Organizer Accounts

Signup only creates students, so organizers are inserted by a seed script (e.g. `backend/scripts/seedOrganizer.js`, run with `npm run seed:organizer`).

The script should hash the password with the same library the signin route uses, then run:

```sql
INSERT INTO users (name, email, password_hash, role)
VALUES ('Bammaz Organizer', 'organizer@example.com', '<bcrypt-hash>', 'organizer')
ON CONFLICT (email) DO NOTHING;
```

Read the organizer email and password from environment variables or command-line arguments. Do not commit real credentials to Git.

---

## 8. Setup Steps

```bash
# 1. Create the database
createdb bammaz2k26

# 2. Apply the schema
psql -d bammaz2k26 -f backend/db/schema.sql

# 3. Set the connection string in backend/.env
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/bammaz2k26

# 4. Seed an organizer
npm run seed:organizer
```

Add `.env` to `.gitignore`.

---

## 9. Notes and Future Changes

- **Migrations:** for the MVP a single `schema.sql` is fine. After the first deployment, switch to a migration tool (node-pg-migrate, Knex or Prisma) so schema changes are versioned.
- **Team members as JSONB:** this keeps the MVP simple. If you later need to search or report on team members, move them to a separate `registration_members` table.
- **Payments:** `registration_fee` is display-only, since payments are outside the MVP. A future payment feature would add a payment status and transaction table.
- **Cancellation:** the `cancelled` status exists but has no API yet. If added, a cancelled row still blocks re-registering unless the unique rule is changed to a partial index on `status = 'registered'`.
- **Sequences and IDs:** IDs from sequences are readable but guessable. That is fine here because every sensitive endpoint checks ownership. If you prefer unguessable IDs, use `gen_random_uuid()`. The API treats IDs as opaque strings, so this is a safe change.
- **Deleting users:** there is no user deletion in the MVP. `RESTRICT` prevents accidental loss of events and registrations.

---

**Database design v1.1 for Bammaz2k26, matching API contract v1.1.**
