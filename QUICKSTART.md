# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Option 1: Local Development (Recommended for Development)

#### Step 1: Install Prerequisites
- Node.js 18+ ([Download](https://nodejs.org/))
- MongoDB 7+ ([Download](https://www.mongodb.com/try/download/community))

#### Step 2: Clone and Setup Backend
```bash
cd server
npm install
cp .env.example .env
```

Edit `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/telecom_noc
JWT_SECRET=your-secret-key-min-32-characters
JWT_REFRESH_SECRET=your-refresh-secret-min-32-chars
```

#### Step 3: Start Backend
```bash
npm run dev
```
Backend runs on: http://localhost:5000

#### Step 4: Setup Frontend (New Terminal)
```bash
cd client
npm install
cp .env.example .env
npm run dev
```
Frontend runs on: http://localhost:5173

#### Step 5: Seed Test Data (Optional)
```bash
cd server
node seed.js
```

#### Step 6: Login
Open http://localhost:5173/login

Test credentials:
- **Admin**: admin@telecom.com / admin123
- **Engineer**: john@telecom.com / john123
- **NOC**: mike@telecom.com / mike123

---

### Option 2: Docker (Recommended for Production)

#### Step 1: Install Docker
- Docker Desktop ([Download](https://www.docker.com/products/docker-desktop))

#### Step 2: Create Environment File
```bash
cp .env.example .env
```

Edit `.env`:
```env
JWT_SECRET=your-production-secret-key
JWT_REFRESH_SECRET=your-production-refresh-key
```

#### Step 3: Start All Services
```bash
docker-compose up -d
```

#### Step 4: Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- MongoDB: localhost:27017

#### Step 5: View Logs
```bash
docker-compose logs -f
```

#### Step 6: Stop Services
```bash
docker-compose down
```

---

### Option 3: Cloud Deployment (MongoDB Atlas)

#### Step 1: Create MongoDB Atlas Account
1. Go to [mongodb.com/cloud/atlas](https://www.mongodb.com/cloud/atlas)
2. Create free cluster
3. Create database user
4. Whitelist IP: 0.0.0.0/0
5. Get connection string

#### Step 2: Update Environment
```env
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/telecom_noc
```

#### Step 3: Deploy Backend (Render.com)
1. Create account at [render.com](https://render.com)
2. New Web Service → Connect GitHub
3. Root Directory: `server`
4. Build: `npm install`
5. Start: `npm start`
6. Add environment variables

#### Step 4: Deploy Frontend (Vercel)
```bash
cd client
npm i -g vercel
vercel
```

---

## 📱 First Steps After Login

### 1. Dashboard
View system metrics and KPIs

### 2. Create a Site
- Go to Sites → Add Site
- Fill in site details
- Assign engineer

### 3. Create an Alarm
- Go to Alarms → Create Alarm
- Select site and severity
- Watch real-time updates

### 4. Commission a Site
- Go to Commissioning
- Complete checklist items
- Auto-marks as commissioned

### 5. Add Configuration
- Go to Configuration
- Add site parameters
- Version history tracked

---

## 🔧 Troubleshooting

### Backend won't start
```bash
# Check MongoDB is running
mongosh

# Check port 5000 is free
netstat -ano | findstr :5000

# Check environment variables
cat server/.env
```

### Frontend can't connect
```bash
# Verify backend is running
curl http://localhost:5000/api/health

# Check CORS settings in server/app.js
# Verify VITE_API_URL in client/.env
```

### Database connection fails
```bash
# Test MongoDB connection
mongosh mongodb://localhost:27017/telecom_noc

# For Atlas, verify:
# - IP whitelist includes your IP
# - Username/password correct
# - Connection string format correct
```

---

## 📚 Next Steps

1. Read [README.md](README.md) for full documentation
2. Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
3. Review [ARCHITECTURE.md](ARCHITECTURE.md) for system design
4. Follow [DEPLOYMENT.md](DEPLOYMENT.md) for production setup

---

## 🎯 Key Features to Try

✅ **Real-time Alarms** - Create alarm and watch live updates
✅ **Site Tracking** - Monitor installation progress
✅ **Role-Based Access** - Login with different roles
✅ **Dark Mode** - Toggle theme in navbar
✅ **Dashboard Metrics** - View live statistics
✅ **Configuration Versioning** - Track parameter changes

---

## 💡 Tips

- Use **Admin** account for full access
- **Field Engineer** can update sites
- **NOC Engineer** manages alarms
- **Commissioning Engineer** handles checklists
- **Manager** has read-only access

---

## 🆘 Need Help?

1. Check logs: `docker-compose logs -f`
2. Verify environment variables
3. Test API: http://localhost:5000/api/health
4. Check MongoDB connection
5. Review browser console for errors

---

**You're all set! 🎉**

Start by logging in with test credentials and exploring the dashboard.
