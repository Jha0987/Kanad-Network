# MongoDB Connection Fix

## Issue
MongoDB is not running on your system.

## Solutions

### Option 1: Start Local MongoDB (Windows)

**If MongoDB is installed:**
```bash
# Open Command Prompt as Administrator
net start MongoDB
```

**Or start manually:**
```bash
"C:\Program Files\MongoDB\Server\7.0\bin\mongod.exe" --dbpath="C:\data\db"
```

### Option 2: Use MongoDB Atlas (Cloud - Recommended)

1. Go to https://www.mongodb.com/cloud/atlas
2. Create free account
3. Create free cluster (M0)
4. Create database user
5. Whitelist IP: 0.0.0.0/0
6. Get connection string
7. Update `server/.env`:

```env
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/telecom_noc?retryWrites=true&w=majority
```

### Option 3: Use Docker MongoDB

```bash
docker run -d -p 27017:27017 --name mongodb mongo:7
```

Then in `server/.env`:
```env
MONGO_URI=mongodb://localhost:27017/telecom_noc
```

## Verify MongoDB is Running

```bash
# Test connection
mongosh mongodb://localhost:27017

# Or
mongo
```

## Quick Fix for Development

Update `server/.env`:
```env
MONGO_URI=mongodb://127.0.0.1:27017/telecom_noc
```

(Use 127.0.0.1 instead of localhost to avoid IPv6 issues)

## After Starting MongoDB

```bash
cd server
npm run dev
```

Server should connect successfully!
