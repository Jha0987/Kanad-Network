# Telecom Deployment & NOC Management System

Enterprise-grade MERN stack application for telecom site installation tracking, commissioning management, configuration versioning, alarm monitoring, and NOC operations.

## 🚀 Features

### Core Modules
- **Site Installation Tracker** - Track site deployment progress with completion percentage
- **Commissioning Checklist** - Validate site readiness with automated status updates
- **Configuration Versioning** - Maintain parameter history with auto-incrementing versions
- **Alarm & NOC Console** - Real-time alarm monitoring with MTTR calculation
- **Dashboard & Reporting** - Comprehensive metrics and KPI visualization

### Technical Features
- ✅ Clean Architecture (Routes → Controllers → Services → Models)
- ✅ JWT Authentication with Refresh Tokens
- ✅ Role-Based Access Control (RBAC)
- ✅ Real-time Updates via Socket.io
- ✅ MongoDB with Optimized Indexing
- ✅ Input Validation with Joi
- ✅ Security Best Practices (Helmet, Rate Limiting, CORS)
- ✅ Dark Mode Support
- ✅ Responsive Design
- ✅ Docker Support

## 📋 Tech Stack

**Backend:**
- Node.js + Express.js
- MongoDB + Mongoose
- JWT + Bcrypt
- Socket.io
- Helmet, CORS, Rate Limiting

**Frontend:**
- React 18 + Vite
- Tailwind CSS
- React Router v6
- Axios
- Socket.io Client
- Lucide Icons

## 🛠️ Installation

### Prerequisites
- Node.js 18+
- MongoDB 7+
- npm or yarn

### Backend Setup

```bash
cd server
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Frontend Setup

```bash
cd client
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### Docker Setup

```bash
# Create .env file in root directory
cp .env.example .env

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down
```

## 🔐 Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/telecom_noc
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## 📁 Project Structure

```
KANAD_net/
├── server/
│   ├── config/          # Database & environment config
│   ├── models/          # Mongoose schemas
│   ├── services/        # Business logic
│   ├── controllers/     # Request handlers
│   ├── routes/          # API endpoints
│   ├── middleware/      # Auth, validation, error handling
│   ├── sockets/         # WebSocket handlers
│   ├── utils/           # Helper functions
│   ├── app.js           # Express app
│   └── server.js        # Entry point
│
├── client/
│   ├── src/
│   │   ├── api/         # API services
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── context/     # React context
│   │   ├── hooks/       # Custom hooks
│   │   ├── routes/      # Route protection
│   │   ├── utils/       # Helper functions
│   │   ├── App.jsx      # Main app
│   │   └── main.jsx     # Entry point
│   └── public/
│
└── docker-compose.yml
```

## 🔑 User Roles

- **Admin** - Full system access
- **Field Engineer** - Site installation updates
- **Commissioning Engineer** - Commissioning checklist management
- **NOC Engineer** - Alarm monitoring and management
- **Manager** - View reports and metrics

## 📡 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Sites
- `GET /api/sites` - Get all sites (with pagination)
- `GET /api/sites/:siteId` - Get site by ID
- `POST /api/sites` - Create new site
- `PUT /api/sites/:siteId` - Update site
- `PATCH /api/sites/:siteId/equipment` - Update equipment status
- `DELETE /api/sites/:siteId` - Delete site
- `GET /api/sites/stats` - Get site statistics

### Alarms
- `GET /api/alarms` - Get all alarms (with filters)
- `GET /api/alarms/:id` - Get alarm by ID
- `POST /api/alarms` - Create new alarm
- `PUT /api/alarms/:id` - Update alarm
- `PATCH /api/alarms/:id/assign` - Assign engineer
- `DELETE /api/alarms/:id` - Delete alarm
- `GET /api/alarms/stats` - Get alarm statistics

### Commissioning
- `GET /api/commissioning` - Get all commissioning records
- `GET /api/commissioning/:siteId` - Get by site
- `POST /api/commissioning` - Create commissioning record
- `PATCH /api/commissioning/:siteId/checklist` - Update checklist

### Configuration
- `POST /api/configurations` - Create configuration
- `GET /api/configurations/:siteId/latest` - Get latest version
- `GET /api/configurations/:siteId/history` - Get version history
- `GET /api/configurations/:siteId/version/:version` - Get specific version

### Dashboard
- `GET /api/dashboard/metrics` - Get dashboard metrics
- `GET /api/dashboard/charts` - Get chart data

## 🔄 Real-time Features

WebSocket events:
- `newAlarm` - Broadcast when new alarm is created
- `alarmUpdated` - Broadcast when alarm is updated
- `alarmAssigned` - Broadcast when engineer is assigned

## 🚀 Deployment

### Render/Railway Deployment

1. Create new Web Service
2. Connect GitHub repository
3. Set environment variables
4. Deploy

### MongoDB Atlas Setup

1. Create cluster at mongodb.com
2. Get connection string
3. Update MONGO_URI in .env

## 📊 Database Schema

### User
- name, email, password (hashed)
- role (Admin, Field Engineer, etc.)
- isActive, timestamps

### Site
- siteId, location (lat, lng, address)
- vendor, equipment[]
- installationStatus, completionPercentage
- assignedEngineer, timestamps

### Alarm
- siteId, alarmType, severity
- status, description
- assignedEngineer, raisedAt, resolvedAt
- mttr, slaBreached, timestamps

### Commissioning
- siteId, checklist[]
- isCommissioned, engineer
- commissionedAt, timestamps

### Configuration
- siteId, version, parameters
- changedBy, changeReason, timestamps

## 🔒 Security Features

- Password hashing with bcrypt
- JWT access tokens (15min expiry)
- Refresh tokens (7 days, httpOnly cookies)
- Helmet for HTTP headers
- Rate limiting (100 req/15min)
- CORS whitelist
- MongoDB sanitization
- Input validation with Joi
- Role-based access control

## 🎨 UI Features

- Dark mode toggle
- Responsive design
- Loading skeletons
- Toast notifications
- Modal confirmations
- Severity color coding
- Real-time alarm indicators
- Pagination
- Search and filters

## 📝 License

MIT

## 👨‍💻 Author

Enterprise Kanad Networks Management System

---

**Note:** This is a production-ready application suitable for portfolio and enterprise deployment.
"# Kanad-Network" 
