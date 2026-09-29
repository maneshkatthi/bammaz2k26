# Bammaz2k26 — Project Documentation

**Version:** 1.1 (aligned with `API.md` v1.1 and `DATABASE.md` v1.1)

---

## 1. Project Overview

**Project Name:** Bammaz2k26
**Project Type:** Campus Event Management Platform

Bammaz2k26 is a web-based platform for managing college events. Students can discover events, view event details, register for events (individually or as a team), and receive a registration ID. Organizers can create, update, delete and manage events and view registered participants.

The project has a separate frontend and backend so that two developers can work independently using a shared API contract.

---

## 2. Problem Statement

College events are often managed through separate forms, messages, posters and manual registration processes. This makes it difficult for students to discover events and for organizers to manage registrations efficiently.

Bammaz2k26 provides a centralized platform for:

- Discovering college events
- Viewing event information
- Registering for events
- Managing event details
- Viewing event registrations

---

## 3. Project Goals

The MVP should:

1. Provide student authentication.
2. Display available events.
3. Provide detailed event information.
4. Allow students to register for events.
5. Allow organizers to create and manage events.
6. Allow organizers to view event registrations.
7. Provide a clean separation between frontend and backend.

---

# 4. User Roles

The platform has two roles.

## 4.1 Student

A student can:

- Sign up
- Sign in
- View events
- View event details
- Register for an event (as an individual or as a team lead)
- Receive a registration ID
- View their own registrations

## 4.2 Organizer

An organizer can:

- Sign in
- Create events (including poster upload)
- View their events
- Edit events
- Delete events
- View event registrations

The system uses one user table with role-based access:

```text
User
├── Student
└── Organizer
```

## 4.3 How accounts are created

- **Students** create their own accounts through the Signup page. Signup always creates a student.
- **Organizers** cannot sign up publicly. Their accounts are created by a backend seed script (`npm run seed:organizer`), which inserts the user directly into the database with the organizer role.

---

# 5. MVP Scope

## Student Features

### Signup

Fields:

- Name
- Roll Number
- Year
- Email
- Password

### Signin

Fields:

- Email
- Password

### Event Discovery

Students can view:

- Event name
- Event poster
- Description
- Date and time
- Registration fee
- Team size
- Prize pool

### Event Registration

Fields:

- Name
- Branch
- Year
- Phone Number
- Roll Number
- Section
- Team name and team members (only for team events)

**Team events:** when an event's team size is greater than 1, one student registers on behalf of the whole team and acts as team lead. The lead enters the team name and the other members' names and roll numbers. For individual events (team size 1) these fields are not shown.

After successful registration, the system provides a registration ID.

### My Registrations

Students can view a list of the events they have registered for, with their registration IDs.

---

## Organizer Features

### Create Event

Fields:

- Event name
- Event description
- Date and time
- Registration price
- Team size
- Prize pool
- Poster (image upload, or an image URL)

### Manage Event

Organizer can:

- View their events
- Edit event
- Delete event (this also deletes its registrations, so the UI must ask for confirmation)
- View registrations

### View Registrations

Organizer can view:

- Registration ID
- Name
- Branch
- Year
- Phone Number
- Roll Number
- Section
- Team name and team members
- Registration time
- Registration status

---

# 6. Website Pages

The initial website structure is:

```text
Home
│
├── About
│   └── About Event / Organization
│
├── Events
│   ├── Event List
│   └── Event Details
│
├── Venue
│   └── Venue Plan / Location
│
├── FAQ
│
└── Authentication
    ├── Signup
    └── Signin
```

Authenticated areas:

```text
Student
│
└── Student Dashboard
    ├── Events
    ├── Event Details
    ├── Registration Form
    └── My Registrations

Organizer
│
└── Organizer Dashboard
    ├── My Events
    ├── Create Event
    ├── Edit Event
    └── Registrations
```

After signin, the user is redirected by role: students go to the Student Dashboard, organizers to the Organizer Dashboard.

---

# 7. Main User Flows

## Student Flow

```text
Student
   ↓
Signup
   ↓
Signin
   ↓
View Events
   ↓
Select Event
   ↓
View Event Details
   ↓
Register
   ↓
Registration Confirmation (with registration ID)
   ↓
My Registrations
```

## Organizer Flow

```text
Organizer (account created by seed script)
   ↓
Signin
   ↓
Organizer Dashboard (My Events)
   ↓
Create Event
   ↓
Manage Event
   ├── Edit
   ├── Delete
   └── View Registrations
```

---

# 8. Data Model

The MVP requires three primary database entities:

```text
Users
Events
Registrations
```

The complete schema (types, constraints, indexes, SQL) is in `DATABASE.md`. A summary follows.

## 8.1 Users

| Field | Type | Description |
|---|---|---|
| id | String | Unique user ID (e.g. `USR001`) |
| name | String | User's name |
| roll_number | String | College roll number (required for students) |
| year | Integer | Academic year, 1–4 (required for students) |
| email | String | User email, unique, lowercase |
| password_hash | String | Hashed password |
| role | Enum | `student` / `organizer` |
| created_at | Timestamp | Account creation time |

---

## 8.2 Events

| Field | Type | Description |
|---|---|---|
| id | String | Unique event ID (e.g. `EVT001`) |
| name | String | Event name |
| description | Text | Event description |
| date | Date | Event date |
| start_time | Time | Starting time |
| end_time | Time | Ending time |
| registration_fee | Integer | Registration fee in INR (0 = free) |
| team_size | Integer | Team size (1 = individual event) |
| prize_pool | Integer | Prize pool in INR |
| poster_url | String | Poster location (optional) |
| organizer_id | String | Event creator |
| created_at | Timestamp | Creation time |
| updated_at | Timestamp | Last update time |

---

## 8.3 Registrations

| Field | Type | Description |
|---|---|---|
| id | String | Registration ID (e.g. `REG001`) |
| event_id | String | Registered event |
| user_id | String | Registered student |
| name | String | Participant name |
| branch | String | Academic branch |
| year | Integer | Academic year |
| phone_number | String | Contact number (10 digits) |
| roll_number | String | College roll number |
| section | String | College section |
| team_name | String | Team name (team events only) |
| team_members | JSON array | Other team members (name and roll number) |
| registered_at | Timestamp | Registration time |
| status | String | `registered` or `cancelled` |

---

# 9. Database Relationships

```text
USER
 │
 ├───────────────┐
 │               │
 ↓               ↓
EVENT         REGISTRATION
 │               ↑
 └───────────────┘
```

More specifically:

```text
One Organizer
     │
     └── creates ──→ Many Events

One Student
     │
     └── makes ────→ Many Registrations

One Event
     │
     └── has ──────→ Many Registrations
```

Foreign keys:

```text
events.organizer_id        → users.id
registrations.event_id     → events.id   (delete event → delete its registrations)
registrations.user_id      → users.id
```

Rules:

- A student can register for a given event only once.
- Deleting an event deletes all of its registrations.

---

# 10. System Architecture

The project follows a three-layer architecture:

```text
┌──────────────────────────┐
│        FRONTEND          │
│      React + Vite        │
└────────────┬─────────────┘
             │
             │ REST API / JSON
             ↓
┌──────────────────────────┐
│         BACKEND          │
│     Node.js + Express    │
└────────────┬─────────────┘
             │
             │ Database Queries
             ↓
┌──────────────────────────┐
│        DATABASE          │
│        PostgreSQL        │
└──────────────────────────┘
```

The frontend never communicates directly with the database.

---

# 11. API Contract

The API is the communication layer between frontend and backend.

## Authentication

```http
POST /api/auth/signup
POST /api/auth/signin
GET  /api/auth/me
```

## Events

```http
GET    /api/events
GET    /api/events/mine
GET    /api/events/:eventId
POST   /api/events
PUT    /api/events/:eventId
DELETE /api/events/:eventId
```

## Uploads

```http
POST /api/uploads/poster
```

## Registrations

```http
POST /api/events/:eventId/register
GET  /api/events/:eventId/registrations
GET  /api/registrations/mine
```

The complete request/response definitions are maintained in `API.md`.

---

# 12. API Access Rules

| Endpoint | Student | Organizer | Authentication |
|---|:---:|:---:|:---:|
| POST `/auth/signup` | Yes | Yes | No |
| POST `/auth/signin` | Yes | Yes | No |
| GET `/auth/me` | Yes | Yes | Required |
| GET `/events` | Yes | Yes | No |
| GET `/events/mine` | No | Yes | Required |
| GET `/events/:id` | Yes | Yes | No |
| POST `/events` | No | Yes | Required |
| PUT `/events/:id` | No | Yes (owner) | Required |
| DELETE `/events/:id` | No | Yes (owner) | Required |
| POST `/uploads/poster` | No | Yes | Required |
| POST `/events/:id/register` | Yes | No | Required |
| GET `/events/:id/registrations` | No | Yes (owner) | Required |
| GET `/registrations/mine` | Yes | No | Required |

Organizers can only manage events they own.

---

# 13. Authentication

The backend is responsible for authentication and authorization.

After successful signin:

```text
User
 ↓
Signin
 ↓
Backend validates credentials
 ↓
Authentication token (JWT, valid 7 days)
 ↓
Frontend stores authentication state
 ↓
Token sent with protected requests
 ↓
On page refresh, frontend calls GET /auth/me to restore the session
```

Protected requests use:

```http
Authorization: Bearer <token>
```

When a request returns `401`, the frontend clears the stored token and sends the user to Signin.

Passwords must be securely hashed by the backend and must never be returned through the API.

---

# 14. Frontend Responsibilities

The frontend developer is responsible for:

- Page structure
- Navigation
- UI components
- Forms
- Client-side validation
- API integration
- Loading states
- Error display
- Authentication state and role-based redirects
- Responsive design

The frontend should use mock data while the backend is being developed if necessary.

---

# 15. Backend Responsibilities

The backend developer is responsible for:

- API implementation
- Authentication
- Authorization
- Password hashing
- Request validation
- Database connection
- Database operations
- Event ownership checks
- Registration rules
- Poster upload handling
- Organizer seed script
- Error handling
- API responses

---

# 16. Static Content

Not every piece of information needs an API.

The following can initially be static frontend content:

### About

- Event introduction
- College/organization information
- Event objectives
- Contact information

### Venue

- Venue name
- Address
- Map link
- Venue description

### FAQ

- Frequently asked questions
- Answers

If these need to be managed dynamically later, they can be moved to the backend.

---

# 17. MVP Exclusions

The following features are outside the initial MVP:

- Online payment gateway
- Email notifications
- SMS notifications
- Push notifications
- QR-code check-in
- Attendance tracking
- Certificate generation
- Event reviews
- Event recommendations
- Chat
- Advanced analytics
- Social login
- Advanced team formation (invitations, team accounts)
- Forgot-password workflow
- Social media integration
- Registration cancellation (the `cancelled` status exists but has no API yet)
- Public organizer signup or admin panel

These can be considered for future versions.

---

# 18. Suggested Technology Stack

## Frontend

```text
React
Vite
CSS / Tailwind CSS
JavaScript
```

## Backend

```text
Node.js
Express.js
JavaScript
```

## Database

```text
PostgreSQL
```

## Authentication

```text
JWT (token-based authentication)
Password hashing (bcrypt or argon2)
```

## Development Tools

```text
Git
GitHub
Postman / Thunder Client
VS Code
```

The exact technology can be changed if both developers agree before implementation.

---

# 19. Project Repository Structure

```text
bammaz2k26/
│
├── frontend/
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── ...
│
├── backend/
│   ├── src/
│   │   ├── routes/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── ...
│   ├── db/
│   │   └── schema.sql
│   ├── scripts/
│   │   └── seedOrganizer.js
│   ├── package.json
│   └── ...
│
├── docs/
│   ├── PROJECT.md
│   ├── API.md
│   └── DATABASE.md
│
├── README.md
└── .gitignore
```

---

# 20. Development Workflow

The project should be developed in this order:

```text
1. Finalize MVP
       ↓
2. Finalize pages and user flows
       ↓
3. Finalize database design
       ↓
4. Finalize API contract
       ↓
5. Setup Git/GitHub
       ↓
6. Split frontend/backend work
       ↓
7. Develop frontend and backend separately
       ↓
8. Test backend APIs
       ↓
9. Connect frontend with backend
       ↓
10. Integration testing
       ↓
11. Deployment
       ↓
12. Final testing
```

---

# 21. Two-Person Team Division

## Developer 1 — Frontend

Primary ownership:

```text
Frontend
├── Home
├── About
├── Venue
├── FAQ
├── Events
├── Event Details
├── Signup
├── Signin
├── Registration Form
├── Student Dashboard (including My Registrations)
└── Organizer Dashboard UI
```

## Developer 2 — Backend

Primary ownership:

```text
Backend
├── Authentication
├── User management
├── Event APIs
├── Registration APIs
├── Poster upload
├── Database
├── Authorization
├── Validation
└── Organizer seed script
```

## Shared Responsibilities

Both developers should work together on:

```text
API Contract
Database relationships
Integration
Testing
Deployment
Bug fixing
```

The team should divide the implementation, not the understanding of the project.

---

# 22. Development Milestones

## Phase 1 — Planning

- [x] Finalize MVP
- [x] Finalize pages
- [x] Finalize user flows
- [x] Finalize database (`DATABASE.md` v1.1)
- [x] Finalize API contract (`API.md` v1.1)

## Phase 2 — Setup

- [ ] Create GitHub repository
- [ ] Setup frontend
- [ ] Setup backend
- [ ] Setup database (run `schema.sql`)
- [ ] Configure environment variables

## Phase 3 — Backend

- [ ] Implement signup
- [ ] Implement signin
- [ ] Implement authentication middleware and `GET /auth/me`
- [ ] Implement organizer seed script
- [ ] Implement event APIs (including `GET /events/mine`)
- [ ] Implement poster upload
- [ ] Implement registration APIs (including `GET /registrations/mine`)
- [ ] Implement authorization and ownership checks
- [ ] Test APIs

## Phase 4 — Frontend

- [ ] Build Home
- [ ] Build About, Venue and FAQ
- [ ] Build Events
- [ ] Build Event Details
- [ ] Build Signup
- [ ] Build Signin
- [ ] Build Registration form (with team fields)
- [ ] Build Student Dashboard and My Registrations
- [ ] Build Organizer Dashboard

## Phase 5 — Integration

- [ ] Connect authentication and session restore
- [ ] Connect event APIs
- [ ] Connect registration APIs
- [ ] Connect organizer APIs and poster upload
- [ ] Test complete user flows

## Phase 6 — Finalization

- [ ] Error handling
- [ ] Responsive design
- [ ] Security checks
- [ ] Final testing
- [ ] Deployment
- [ ] Demo preparation

---

# 23. MVP Completion Criteria

The MVP is complete when a student can:

```text
Signup
  ↓
Signin
  ↓
View Events
  ↓
Open Event
  ↓
Register
  ↓
Receive Registration Confirmation
  ↓
See it under My Registrations
```

And an organizer can:

```text
Signin
  ↓
Create Event
  ↓
View Event
  ↓
Edit Event
  ↓
Delete Event
  ↓
View Registrations
```

The frontend and backend must communicate successfully through the defined API contract.

---

# 24. Important Development Rule

`API.md` is the communication contract between the two developers.

If the frontend expects:

```http
GET /api/events
```

and:

```json
{
  "success": true,
  "events": []
}
```

the backend must provide exactly that contract.

If a change is required:

```text
Discuss
   ↓
Update API.md (and DATABASE.md if the data changes)
   ↓
Update frontend/backend
   ↓
Test
```

Do not silently change API request or response structures during development.

---

# 25. Project Documents

The project maintains these core documents:

```text
docs/
│
├── PROJECT.md
│   └── Overall project definition
│
├── API.md
│   └── Frontend ↔ Backend contract
│
└── DATABASE.md
    └── Database schema and relationships
```

Together with `README.md` in the repository root (setup and overview), these documents should be kept in sync. When one changes, check whether the others need updating.

---

# 26. Changes in v1.1

| Area | Change |
|---|---|
| Organizer accounts | Created by seed script, not public signup |
| Sessions | `GET /auth/me` added for session restore, tokens last 7 days |
| Organizer dashboard | `GET /events/mine` added for My Events |
| Student dashboard | `GET /registrations/mine` added, My Registrations page added |
| Posters | `POST /uploads/poster` added (JPEG, PNG or WebP, up to 2 MB) |
| Team events | One student registers as team lead with team name and members |
| Registration status | `registered` and `cancelled` defined (no cancel API yet) |
| Event deletion | Also deletes the event's registrations |
| Data types | Fees and prize pool are integers in INR |
