Project: Telecom Deployment & NOC Management System (MERN)
1️⃣ Global Architecture Rules
Architecture Style

Follow Clean Architecture

Layer separation:

Routes → Controllers → Services → Models

No business logic inside routes

No direct DB calls inside controllers

Naming Conventions

camelCase → variables/functions

PascalCase → components/models

UPPER_CASE → constants

REST endpoints → plural nouns (/sites, /alarms)

2️⃣ Backend Structure (Node + Express)
📁 Folder Structure
server/
│
├── config/
│   ├── db.js
│   ├── env.js
│
├── routes/
│   ├── site.routes.js
│   ├── alarm.routes.js
│   ├── auth.routes.js
│
├── controllers/
│   ├── site.controller.js
│   ├── alarm.controller.js
│
├── services/
│   ├── site.service.js
│   ├── alarm.service.js
│
├── models/
│   ├── Site.js
│   ├── Alarm.js
│   ├── User.js
│
├── middleware/
│   ├── auth.middleware.js
│   ├── role.middleware.js
│   ├── error.middleware.js
│
├── utils/
│   ├── logger.js
│   ├── constants.js
│
├── app.js
└── server.js

🔹 Routes Rules

Define only endpoints

Apply middleware

Never write logic inside route file

Example:

router.post("/", auth, role("Admin"), createSite);

🔹 Controllers Rules

Validate request

Call service

Return formatted response

Use try/catch

No DB queries here

🔹 Services Rules

Contains core business logic

Interacts with models

Reusable

No HTTP response handling

🔹 Models Rules (MongoDB + Mongoose)

Add:

timestamps: true

indexes on siteId, status, severity

Validate enums

Use schema methods when required

Example:

severity: {
  type: String,
  enum: ["Critical", "Major", "Minor"],
  required: true
}

🔹 Middleware Rules
auth.middleware.js

Verify JWT

Attach user to request

role.middleware.js

Check role permissions

Reject unauthorized access

error.middleware.js

Centralized error handler

Never expose internal stack traces

3️⃣ Frontend Structure (React)
📁 Folder Structure
client/
│
├── src/
│   ├── api/
│   ├── components/
│   │   ├── layout/
│   │   ├── common/
│   │   ├── dashboard/
│   │
│   ├── pages/
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Sites.jsx
│   │   ├── Alarms.jsx
│   │
│   ├── context/
│   ├── hooks/
│   ├── utils/
│   ├── routes/
│   ├── App.jsx
│   └── main.jsx

4️⃣ UI/UX Design Rules (Professional Look)
🎨 Design System

Use Tailwind CSS + ShadCN UI

Neutral background (gray-100)

Card-based layout

Soft shadows

12-column grid

Consistent spacing (8px system)

🔹 Layout Structure
MainLayout

Sidebar (collapsible)

Top navbar

Content container

Footer

Sidebar:

Dashboard

Sites

Commissioning

Configuration

Alarms

Reports

5️⃣ Authentication Rules
Login & Signup
Backend:

Hash passwords with bcrypt

JWT access token (15m)

Refresh token (7d)

Frontend:

Store access token in memory

Store refresh token in httpOnly cookie

Auto logout on token expiry

6️⃣ Dashboard Design Rules
Widgets

Total Sites

Commissioned Sites

Active Alarms

Critical Alarms

MTTR Value

Use:

Chart.js

Animated counters

Status color coding

7️⃣ Professional Interface Features

Add:

✔ Loading skeletons
✔ Toast notifications
✔ Modal confirmations
✔ Dark mode toggle
✔ Search & filters
✔ Pagination
✔ Debounced search
✔ Error boundary

8️⃣ API Standards

Response Format:

{
  success: true,
  message: "Site created successfully",
  data: {}
}


Error Format:

{
  success: false,
  message: "Unauthorized",
  errorCode: "AUTH_401"
}

9️⃣ Security Best Practices

Helmet

Rate limiting

CORS whitelist

Input validation (Joi/Zod)

Mongo sanitization

Role-based access control

Audit logs

🔟 Advanced Features (Optional but Recommended)

WebSocket for live alarms

Redis caching

SLA auto escalation

PDF export reports

Activity logs

Geo map integration

Microservice-ready structure

1️⃣1️⃣ Code Quality Rules

Use ESLint + Prettier

Max 300 lines per file

Single responsibility principle

DRY principle

Reusable components

Proper folder isolation

1️⃣2️⃣ UI Theme Concept

Professional telecom operator look:

Clean

Data-heavy

Dark console style option

Minimal animations

Clear severity colors:

Critical → Red

Major → Orange

Minor → Yellow

Normal → Green