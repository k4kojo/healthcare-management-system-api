## MediConnect Backend (Express + Drizzle ORM)

A Node/Express API for MediConnect, backed by PostgreSQL using Drizzle ORM and Zod for validation. It supports authentication, appointments, user/patient profiles, notifications, payments, prescriptions, lab results, reviews, chat, and more.

### Tech Stack
- Runtime: Node.js (ESM)
- Framework: Express
- ORM: Drizzle ORM (PostgreSQL)
- Auth: JWT (Bearer)
- Validation: Zod
- Email/SMS: Nodemailer, Twilio (optional)

### Repository Layout (backend/)
- `src/server.js`: App bootstrap and route mounting (API prefix: `/api/v0`)
- `src/config/`: env, db, and optional arcjet
- `src/db/schema/`: normalized database schema definitions
- `src/routes/`: endpoint routers
- `src/controllers/`: route handlers
- `src/middlewares/`: auth, ownership, FK validation, and role checks
- `src/validators/`: Zod schemas for inputs
- `src/services/`: notifications providers (email, in-app, sms) and video
- `src/db/seeds/`: seed scripts (development/demo data)

### Prerequisites
- Node 18+
- PostgreSQL 14+

### Installation
```
cd backend
npm install
```

### Environment Configuration
Environment variables are loaded from `.env.<NODE_ENV>.local` via `src/config/env.js`.

Create `backend/.env.development.local` and set at least:
```
PORT=3000
NODE_ENV=development
DATABASE_URI=postgres://USER:PASSWORD@HOST:5432/DB_NAME
JWT_SECRET=replace_me
JWT_EXPIRES_IN=7d

# Optional providers
EMAIL_HOST=smtp.example.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=you@example.com
EMAIL_PASSWORD=app_password
EMAIL_FROM_NAME=MediConnect
EMAIL_FROM_ADDRESS=noreply@mediconnect.local

TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_PHONE_NUMBER=

# Arcjet (optional)
ARCJET_KEY=
ARCJET_ENV=
```

### Database
- Schemas are defined under `src/db/schema/`
- Drizzle config: `drizzle.config.js`

Migrations are checked into `src/db/migrations/`. For development/demo, you can seed the DB:
```
npm run seed
```
Notes:
- The seed script clears tables in non-production before inserting demo data. Do not run it against production data.

### Running the Server
```
# Development (with nodemon)
npm run dev

# Production
npm start
```
By default, the server listens on `http://localhost:<PORT>` and exposes routes under `/api/v0`.

### Authentication
- Use the `Authorization: Bearer <token>` header
- Roles supported: `admin`, `doctor`, `patient`
- Middleware enforces access control and ownership

### Selected API Endpoints (non-exhaustive)
- Auth and User
  - `POST /api/v0/user/sign-up`
  - `POST /api/v0/user/sign-in`
  - `PUT  /api/v0/user/:userId` (partial update)
  - `GET  /api/v0/patient-profile/me` (combined user + patient profile)
  - `PUT  /api/v0/patient-profile/me` (upsert fields)

- Appointments
  - `GET  /api/v0/appointments` (scoped by role)
  - `POST /api/v0/appointments` (patient/admin)
  - `GET  /api/v0/appointments/:id`
  - `PUT  /api/v0/appointments/:id` (doctor/admin)
  - `DELETE /api/v0/appointments/:id` (doctor/admin)

- Notifications
  - `GET  /api/v0/notifications/user/notifications` (user + global)
  - `PUT  /api/v0/notifications/notifications/:id/read` (mark as read)
  - Admin only: `GET/POST/PUT/DELETE /api/v0/notifications/...`

Other domains include chat, doctor availability/profile, lab results, medical records, prescriptions, reviews, payments, settings, and activity logs. See `src/routes/*.route.js` for the full set.

### Notifications Flow
- In-app notifications are stored in the `notifications` table.
- After creating an appointment, a notification is created for the patient.
- Mobile app calls `GET /notifications/user/notifications` and `PUT /notifications/notifications/:id/read`.

### CORS
`cors()` is enabled globally in `src/server.js`. Adjust origin/headers as needed.

### Testing
Dependencies for Jest and Supertest are included. Add tests under `src/__tests__/` (not included by default) and run with Jest once configured.

### Troubleshooting
- Ensure `DATABASE_URI` is reachable and the DB user has DDL/DML permissions
- Verify `JWT_SECRET` is set
- For mobile integration, confirm the mobile app’s base URL (see `mobile/services/api.ts`) points to the correct IP/port
- Seeding errors: check Postgres version and extensions

### License
ISC (see `package.json`)


