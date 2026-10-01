-- ============================================================
-- Bammaz2k26 schema v1.1
-- ============================================================

-- ---------- ID sequences ----------
-- IDs look like USR001, EVT001, REG001 (matches API.md examples).
-- The number grows beyond 3 digits automatically (USR1000, ...).
CREATE SEQUENCE IF NOT EXISTS user_id_seq;
CREATE SEQUENCE IF NOT EXISTS event_id_seq;
CREATE SEQUENCE IF NOT EXISTS registration_id_seq;

-- ---------- Enum ----------
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('student', 'organizer');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================
-- USERS
-- ============================================================
CREATE TABLE IF NOT EXISTS users (
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

CREATE UNIQUE INDEX IF NOT EXISTS users_email_key ON users (email);

-- ============================================================
-- EVENTS
-- ============================================================
CREATE TABLE IF NOT EXISTS events (
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

CREATE INDEX IF NOT EXISTS events_date_idx ON events (date, start_time);
CREATE INDEX IF NOT EXISTS events_organizer_idx ON events (organizer_id);

-- ============================================================
-- REGISTRATIONS
-- ============================================================
CREATE TABLE IF NOT EXISTS registrations (
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
CREATE INDEX IF NOT EXISTS registrations_user_idx ON registrations (user_id);

-- ============================================================
-- Auto-update events.updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION set_updated_at() RETURNS trigger AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS events_set_updated_at ON events;
CREATE TRIGGER events_set_updated_at
BEFORE UPDATE ON events
FOR EACH ROW EXECUTE FUNCTION set_updated_at();
