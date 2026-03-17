# API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication

All protected endpoints require JWT token in Authorization header:
```
Authorization: Bearer <access_token>
```

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message",
  "errorCode": "ERROR_CODE"
}
```

## Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "Field Engineer"
}
```

#### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Profile
```http
GET /auth/profile
Authorization: Bearer <token>
```

### Sites

#### Create Site
```http
POST /sites
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteId": "SITE001",
  "location": {
    "lat": 40.7128,
    "lng": -74.0060,
    "address": "New York, NY"
  },
  "vendor": "Ericsson",
  "equipment": [
    {
      "name": "RRU",
      "quantity": 3,
      "installed": false
    }
  ]
}
```

#### Get All Sites
```http
GET /sites?page=1&limit=10&vendor=Ericsson&status=Installed
Authorization: Bearer <token>
```

#### Update Equipment Status
```http
PATCH /sites/SITE001/equipment
Authorization: Bearer <token>
Content-Type: application/json

{
  "equipmentUpdates": [
    {
      "equipmentId": "64abc123...",
      "installed": true
    }
  ]
}
```

### Alarms

#### Create Alarm
```http
POST /alarms
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteId": "SITE001",
  "alarmType": "Power Failure",
  "severity": "Critical",
  "description": "Main power supply failure detected"
}
```

#### Get Alarms with Filters
```http
GET /alarms?severity=Critical&status=Open&page=1&limit=10
Authorization: Bearer <token>
```

#### Assign Engineer
```http
PATCH /alarms/64abc123.../assign
Authorization: Bearer <token>
Content-Type: application/json

{
  "engineerId": "64def456..."
}
```

#### Update Alarm
```http
PUT /alarms/64abc123...
Authorization: Bearer <token>
Content-Type: application/json

{
  "status": "Resolved",
  "notes": "Issue fixed by replacing power supply"
}
```

### Commissioning

#### Create Commissioning Record
```http
POST /commissioning
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteId": "SITE001",
  "engineer": "64def456...",
  "checklist": [
    {
      "item": "Power supply verified",
      "status": false
    },
    {
      "item": "Antenna alignment completed",
      "status": false
    }
  ]
}
```

#### Update Checklist
```http
PATCH /commissioning/SITE001/checklist
Authorization: Bearer <token>
Content-Type: application/json

{
  "checklistUpdates": [
    {
      "itemId": "64ghi789...",
      "status": true,
      "remarks": "Verified and approved"
    }
  ]
}
```

### Configuration

#### Create Configuration
```http
POST /configurations
Authorization: Bearer <token>
Content-Type: application/json

{
  "siteId": "SITE001",
  "parameters": {
    "ipAddress": "192.168.1.100",
    "vlan": "100",
    "pci": "150",
    "frequency": "2100MHz",
    "softwareVersion": "v2.5.1"
  },
  "changeReason": "Initial configuration"
}
```

#### Get Latest Configuration
```http
GET /configurations/SITE001/latest
Authorization: Bearer <token>
```

#### Get Configuration History
```http
GET /configurations/SITE001/history
Authorization: Bearer <token>
```

### Dashboard

#### Get Dashboard Metrics
```http
GET /dashboard/metrics
Authorization: Bearer <token>
```

Response:
```json
{
  "success": true,
  "data": {
    "totalSites": 150,
    "commissionedSites": 120,
    "completionRate": 80,
    "activeAlarms": 25,
    "criticalAlarms": 5,
    "avgMTTR": 45,
    "slaCompliance": 95
  }
}
```

## Error Codes

- `AUTH_401` - Unauthorized
- `FORBIDDEN_403` - Insufficient permissions
- `NOT_FOUND_404` - Resource not found
- `VALIDATION_ERROR` - Input validation failed
- `USER_EXISTS` - User already registered
- `SITE_EXISTS` - Site ID already exists
- `INVALID_CREDENTIALS` - Wrong email or password
- `SERVER_ERROR` - Internal server error

## Rate Limiting

- 100 requests per 15 minutes per IP
- Returns 429 status when exceeded

## WebSocket Events

Connect to: `ws://localhost:5000`

Authentication:
```javascript
const socket = io('http://localhost:5000', {
  auth: { token: accessToken }
});
```

Events:
- `newAlarm` - New alarm created
- `alarmUpdated` - Alarm status changed
- `alarmAssigned` - Engineer assigned to alarm
