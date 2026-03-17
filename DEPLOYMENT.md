# Deployment Guide

## Table of Contents
1. [Local Development](#local-development)
2. [Docker Deployment](#docker-deployment)
3. [Cloud Deployment](#cloud-deployment)
4. [MongoDB Atlas Setup](#mongodb-atlas-setup)
5. [Environment Configuration](#environment-configuration)

---

## Local Development

### Prerequisites
- Node.js 18+
- MongoDB 7+
- Git

### Step 1: Clone Repository
```bash
git clone <repository-url>
cd KANAD_net
```

### Step 2: Backend Setup
```bash
cd server
npm install
cp .env.example .env
```

Edit `.env`:
```env
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/telecom_noc
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_REFRESH_SECRET=your-refresh-secret-key-min-32-chars
CLIENT_URL=http://localhost:5173
```

Start backend:
```bash
npm run dev
```

### Step 3: Frontend Setup
```bash
cd ../client
npm install
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

Start frontend:
```bash
npm run dev
```

### Step 4: Access Application
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Health Check: http://localhost:5000/api/health

---

## Docker Deployment

### Prerequisites
- Docker
- Docker Compose

### Step 1: Create Environment File
```bash
cp .env.example .env
```

Edit `.env`:
```env
JWT_SECRET=your-production-secret-key
JWT_REFRESH_SECRET=your-production-refresh-key
```

### Step 2: Build and Run
```bash
docker-compose up -d
```

### Step 3: View Logs
```bash
docker-compose logs -f
```

### Step 4: Stop Services
```bash
docker-compose down
```

### Step 5: Clean Up
```bash
docker-compose down -v  # Remove volumes
```

---

## Cloud Deployment

### Option 1: Render.com

#### Backend Deployment
1. Create account at render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repository
4. Configure:
   - **Name**: telecom-noc-backend
   - **Root Directory**: server
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Environment**: Node

5. Add Environment Variables:
   ```
   NODE_ENV=production
   MONGO_URI=<your-mongodb-atlas-uri>
   JWT_SECRET=<your-secret>
   JWT_REFRESH_SECRET=<your-refresh-secret>
   CLIENT_URL=<your-frontend-url>
   ```

6. Click "Create Web Service"

#### Frontend Deployment
1. Click "New +" → "Static Site"
2. Connect GitHub repository
3. Configure:
   - **Name**: telecom-noc-frontend
   - **Root Directory**: client
   - **Build Command**: `npm install && npm run build`
   - **Publish Directory**: dist

4. Add Environment Variable:
   ```
   VITE_API_URL=<your-backend-url>/api
   ```

5. Click "Create Static Site"

### Option 2: Railway.app

#### Backend Deployment
1. Create account at railway.app
2. Click "New Project" → "Deploy from GitHub repo"
3. Select repository
4. Configure:
   - **Root Directory**: /server
   - **Start Command**: npm start

5. Add Environment Variables (same as Render)

6. Deploy

#### Frontend Deployment
1. Click "New" → "GitHub Repo"
2. Configure:
   - **Root Directory**: /client
   - **Build Command**: npm run build
   - **Start Command**: npm run preview

3. Add Environment Variables
4. Deploy

### Option 3: Vercel (Frontend) + Render (Backend)

#### Backend on Render
Follow Render backend steps above

#### Frontend on Vercel
1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Deploy:
   ```bash
   cd client
   vercel
   ```

3. Add Environment Variables in Vercel Dashboard:
   ```
   VITE_API_URL=<your-backend-url>/api
   ```

4. Redeploy:
   ```bash
   vercel --prod
   ```

---

## MongoDB Atlas Setup

### Step 1: Create Account
1. Go to mongodb.com/cloud/atlas
2. Sign up for free account

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "Free" tier (M0)
3. Select cloud provider and region
4. Click "Create Cluster"

### Step 3: Create Database User
1. Go to "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Set username and password
5. Set role to "Read and write to any database"
6. Click "Add User"

### Step 4: Configure Network Access
1. Go to "Network Access"
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" → "Connect"
2. Choose "Connect your application"
3. Copy connection string
4. Replace `<password>` with your database user password
5. Replace `<dbname>` with `telecom_noc`

Example:
```
mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/telecom_noc?retryWrites=true&w=majority
```

---

## Environment Configuration

### Production Environment Variables

#### Backend
```env
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://user:pass@cluster.mongodb.net/telecom_noc
JWT_SECRET=<generate-strong-secret-min-32-chars>
JWT_REFRESH_SECRET=<generate-strong-secret-min-32-chars>
CLIENT_URL=https://your-frontend-domain.com
```

#### Frontend
```env
VITE_API_URL=https://your-backend-domain.com/api
```

### Generating Secure Secrets

Using Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Using OpenSSL:
```bash
openssl rand -hex 32
```

---

## Post-Deployment Checklist

- [ ] Backend health check responds: `/api/health`
- [ ] MongoDB connection successful
- [ ] User registration works
- [ ] User login works
- [ ] JWT tokens are generated
- [ ] Protected routes require authentication
- [ ] WebSocket connection established
- [ ] Real-time alarm updates work
- [ ] CORS configured correctly
- [ ] Environment variables set
- [ ] HTTPS enabled (production)
- [ ] Rate limiting active
- [ ] Error logging configured

---

## Troubleshooting

### Backend won't start
- Check MongoDB connection string
- Verify all environment variables are set
- Check Node.js version (18+)
- Review logs for errors

### Frontend can't connect to backend
- Verify VITE_API_URL is correct
- Check CORS configuration
- Ensure backend is running
- Check browser console for errors

### WebSocket not connecting
- Verify Socket.io server is running
- Check JWT token is valid
- Ensure firewall allows WebSocket connections
- Check browser console for connection errors

### Database connection fails
- Verify MongoDB Atlas IP whitelist
- Check database user credentials
- Ensure connection string is correct
- Test connection with MongoDB Compass

---

## Monitoring & Maintenance

### Logs
```bash
# Docker logs
docker-compose logs -f backend

# PM2 logs (if using PM2)
pm2 logs telecom-backend
```

### Database Backup
```bash
# MongoDB dump
mongodump --uri="<your-connection-string>" --out=./backup

# Restore
mongorestore --uri="<your-connection-string>" ./backup
```

### Performance Monitoring
- Use MongoDB Atlas monitoring dashboard
- Set up alerts for high CPU/memory usage
- Monitor API response times
- Track error rates

---

## Security Recommendations

1. **Never commit .env files**
2. **Use strong JWT secrets** (min 32 characters)
3. **Enable HTTPS** in production
4. **Regularly update dependencies**
5. **Monitor for security vulnerabilities**
6. **Implement rate limiting**
7. **Use MongoDB Atlas IP whitelist**
8. **Regular database backups**
9. **Implement audit logging**
10. **Use environment-specific configs**

---

## Support

For issues or questions:
1. Check logs for error messages
2. Review API documentation
3. Verify environment configuration
4. Test with Postman/Thunder Client
5. Check MongoDB Atlas status

---

**Deployment Complete! 🚀**
