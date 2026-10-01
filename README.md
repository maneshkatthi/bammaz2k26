# Bammaz2k26

A campus event management platform built for **CMR College of Engineering & Technology's** annual fest. Students discover events and register for them; organizers create and manage events and view registrations.

> **Purpose:** This project was built as a **team learning exercise** to understand full-stack web development — with each team member taking ownership of a separate layer (frontend or backend) independently, then integrating them together.

> **Status:** MVP complete

---

## About This Project

Bammaz2k26 was created by a small team of B.Tech students to gain hands-on experience with real-world full-stack development. The key idea was to **build the frontend and backend completely separately** — just like professional teams do — and then connect them through a well-defined REST API contract.

Each team member focused on their own layer:
- The **frontend developer** built the React UI, pages, forms, and API integration independently.
- The **backend developer** built the Express API, authentication, database, and business logic independently.
- Both collaborated on the API contract and integration.

This separation helped each person deeply understand their own side of the stack before seeing how the full system fits together.

---

## Features

**Students**
- Sign up and sign in
- Browse events and view event details
- Register for an event (individual or team) and receive a registration ID
- can View their own registrations

**Organizers**
- Sign in
- Create, edit and delete their own events (with poster upload)
- View registrations for their events

Out of scope for the MVP: online payments, email/SMS notifications, QR check-in, certificates, forgot-password, social login. See `docs/PROJECT.md` for the full list.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS (or plain CSS), JavaScript |
| Backend | Node.js, Express.js, JavaScript |
| Database | PostgreSQL |
| Auth | JWT (Bearer token), bcrypt password hashing |
| Tools | Git, GitHub, Postman / Thunder Client |

---

## Architecture

```text
┌──────────────────────────┐
│        FRONTEND          │
│      React + Vite        │
└────────────┬─────────────┘
             │  REST API / JSON
             ▼
┌──────────────────────────┐
│         BACKEND          │
│     Node.js + Express    │
└────────────┬─────────────┘
             │  SQL
             ▼
┌──────────────────────────┐
│        DATABASE          │
│        PostgreSQL        │
└──────────────────────────┘
```

The frontend never talks to the database directly.

---

## Repository Structure

```text
bammaz2k26/
├── frontend/          # React + Vite app
│   ├── src/
│   ├── public/
│   └── package.json
│
├── backend/           # Express API
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   └── models/
│   ├── db/
│   │   └── schema.sql
│   ├── scripts/
│   │   └── seedOrganizer.js
│   └── package.json
│
├── docs/
│   ├── PROJECT.md     # Project definition and scope
│   ├── API.md         # Frontend ↔ backend contract (source of truth)
│   └── DATABASE.md    # Schema and relationships
│
├── README.md
└── .gitignore
```

---

## Documentation

| Document | Purpose |
|---|---|
| [`docs/PROJECT.md`](docs/PROJECT.md) | Scope, roles, pages, user flows, milestones |
| [`docs/API.md`](docs/API.md) | Every endpoint, request, response and error (**v1.1**) |
| [`docs/DATABASE.md`](docs/DATABASE.md) | PostgreSQL schema, constraints, queries (**v1.1**) |

**`API.md` is the contract between frontend and backend.** Do not change request or response shapes without updating it first.

---

## Getting Started

### Prerequisites

- Node.js 18 or newer
- PostgreSQL 14 or newer
- Git

### 1. Clone the repository

```bash
git clone https://github.com/<your-username>/bammaz2k26.git
cd bammaz2k26
```

### 2. Set up the database

```bash
createdb bammaz2k26
psql -d bammaz2k26 -f backend/db/schema.sql
```

### 3. Set up the backend

```bash
cd backend
npm install
cp .env.example .env      # then edit the values
npm run seed:organizer    # creates an organizer account
npm run dev               # starts the API on http://localhost:5000
```

`backend/.env`:

```text
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@localhost:5432/bammaz2k26
JWT_SECRET=<long-random-string>
JWT_EXPIRES_IN=7d
CORS_ORIGIN=http://localhost:5173

# Used by the organizer seed script
ORGANIZER_NAME=Bammaz Organizer
ORGANIZER_EMAIL=organizer@example.com
ORGANIZER_PASSWORD=<choose-a-strong-password>
```

### 4. Set up the frontend

```bash
cd frontend
npm install
cp .env.example .env
npm run dev               # starts the app on http://localhost:5173
```

`frontend/.env`:

```text
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## API at a Glance

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Access |
|---|---|---|
| POST | `/auth/signup` | Public |
| POST | `/auth/signin` | Public |
| GET | `/auth/me` | Logged in |
| GET | `/events` | Public |
| GET | `/events/mine` | Organizer |
| GET | `/events/:eventId` | Public |
| POST | `/events` | Organizer |
| PUT | `/events/:eventId` | Organizer (owner) |
| DELETE | `/events/:eventId` | Organizer (owner) |
| POST | `/uploads/poster` | Organizer |
| POST | `/events/:eventId/register` | Student |
| GET | `/events/:eventId/registrations` | Organizer (owner) |
| GET | `/registrations/mine` | Student |

Protected requests send `Authorization: Bearer <token>`. Full details are in [`docs/API.md`](docs/API.md).

---

## Roles and Accounts

- **Students** create their own accounts through the Signup page.
- **Organizers** cannot sign up publicly. Their accounts are created with `npm run seed:organizer` using the values in `backend/.env`.

---

## Team

| Role | Responsibility |
|---|---|
| Frontend developer | Pages, UI, forms, API integration, auth state, responsive design |
| Backend developer | API, auth, validation, database, authorization |
| Both | API contract, database design, integration, testing, deployment |

---

## Git Workflow

- `main` holds stable, working code. Do not commit to it directly.
- Create a branch per task: `feature/<short-name>` or `fix/<short-name>`.
- Open a pull request into `main` and have the other developer review it.
- Write clear commit messages, e.g. `Add event registration endpoint`.
- Never commit `.env` files, secrets or `node_modules`.

---

## Development Order

1. Finalize MVP, pages, database and API contract (done)
2. Set up repository, frontend, backend and database
3. Build backend and frontend in parallel (the frontend can use mock data)
4. Test the backend APIs
5. Connect frontend and backend
6. Integration testing
7. Deploy
8. Final testing and demo

The MVP is complete when a student can sign up, sign in, view events, register and receive a registration ID, and an organizer can sign in, create, edit and delete events and view registrations.

---

## Suggested `.gitignore`

```text
node_modules/
.env
.env.*
!.env.example
dist/
build/
uploads/
.DS_Store
*.log
.vscode/
```

---


