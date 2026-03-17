# System Architecture

## Overview

The Kanad Networks Management System follows **Clean Architecture** principles with clear separation of concerns across multiple layers.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENT LAYER                         │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   React    │  │  Tailwind  │  │ Socket.io  │            │
│  │   Router   │  │    CSS     │  │   Client   │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/WebSocket
┌─────────────────────────────────────────────────────────────┐
│                      API GATEWAY LAYER                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   CORS     │  │   Helmet   │  │    Rate    │            │
│  │            │  │  Security  │  │  Limiting  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       MIDDLEWARE LAYER                       │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │    Auth    │  │    RBAC    │  │ Validation │            │
│  │    JWT     │  │   Roles    │  │    Joi     │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                        ROUTES LAYER                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Auth     │  │   Sites    │  │   Alarms   │            │
│  │  Routes    │  │  Routes    │  │  Routes    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                     CONTROLLERS LAYER                        │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │   Request  │  │  Response  │  │   Error    │            │
│  │ Validation │  │ Formatting │  │  Handling  │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      SERVICES LAYER                          │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Business  │  │    Data    │  │   Logic    │            │
│  │   Logic    │  │ Processing │  │   Rules    │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                       MODELS LAYER                           │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐            │
│  │  Mongoose  │  │   Schema   │  │   Indexes  │            │
│  │   Models   │  │ Validation │  │            │            │
│  └────────────┘  └────────────┘  └────────────┘            │
└─────────────────────────────────────────────────────────────┘
                            ↕
┌─────────────────────────────────────────────────────────────┐
│                      DATABASE LAYER                          │
│                        MongoDB                               │
└─────────────────────────────────────────────────────────────┘
```

## Layer Responsibilities

### 1. Client Layer (React Frontend)
**Purpose**: User interface and interaction

**Components**:
- Pages (Dashboard, Sites, Alarms, etc.)
- Layout components (Navbar, Sidebar)
- Common components (Button, Card, Input)
- Context providers (Auth, Socket)

**Responsibilities**:
- Render UI components
- Handle user interactions
- Manage client-side state
- Real-time updates via WebSocket
- API communication

### 2. API Gateway Layer
**Purpose**: Request filtering and security

**Components**:
- CORS configuration
- Helmet security headers
- Rate limiting
- Request sanitization

**Responsibilities**:
- Validate request origin
- Apply security headers
- Prevent abuse
- Sanitize inputs

### 3. Middleware Layer
**Purpose**: Request processing pipeline

**Components**:
- Authentication (JWT verification)
- Authorization (RBAC)
- Validation (Joi schemas)
- Error handling

**Responsibilities**:
- Verify user identity
- Check permissions
- Validate request data
- Handle errors centrally

### 4. Routes Layer
**Purpose**: Endpoint definition

**Components**:
- Auth routes
- Site routes
- Alarm routes
- Configuration routes

**Responsibilities**:
- Define API endpoints
- Apply middleware
- Route to controllers
- No business logic

### 5. Controllers Layer
**Purpose**: Request/response handling

**Components**:
- Auth controller
- Site controller
- Alarm controller
- Dashboard controller

**Responsibilities**:
- Parse request data
- Call service methods
- Format responses
- Handle HTTP status codes
- No business logic

### 6. Services Layer
**Purpose**: Business logic implementation

**Components**:
- Auth service
- Site service
- Alarm service
- Dashboard service

**Responsibilities**:
- Implement business rules
- Data processing
- Model interactions
- Reusable logic
- No HTTP handling

### 7. Models Layer
**Purpose**: Data structure and validation

**Components**:
- User model
- Site model
- Alarm model
- Configuration model

**Responsibilities**:
- Define schemas
- Data validation
- Indexes
- Schema methods
- Pre/post hooks

### 8. Database Layer
**Purpose**: Data persistence

**Technology**: MongoDB

**Responsibilities**:
- Store data
- Execute queries
- Maintain indexes
- Handle transactions

## Data Flow

### Request Flow (Create Alarm Example)

```
1. Client → POST /api/alarms
   ↓
2. API Gateway → CORS, Helmet, Rate Limit
   ↓
3. Middleware → Auth (JWT), RBAC (NOC Engineer), Validation
   ↓
4. Routes → alarm.routes.js
   ↓
5. Controller → alarmController.createAlarm()
   ↓
6. Service → alarmService.createAlarm()
   ↓
7. Model → Alarm.create()
   ↓
8. Database → MongoDB Insert
   ↓
9. WebSocket → Broadcast 'newAlarm' event
   ↓
10. Response → { success: true, data: alarm }
```

### Real-time Flow (Alarm Update)

```
1. Alarm Created/Updated
   ↓
2. Service Layer
   ↓
3. Controller emits Socket event
   ↓
4. Socket.io broadcasts to connected clients
   ↓
5. React components receive update
   ↓
6. UI updates automatically
```

## Design Patterns

### 1. Repository Pattern
Services act as repositories, abstracting data access logic.

### 2. Dependency Injection
Controllers receive service instances, promoting testability.

### 3. Middleware Pattern
Express middleware chain for request processing.

### 4. Observer Pattern
Socket.io for real-time event broadcasting.

### 5. Factory Pattern
Model creation through Mongoose schemas.

## Security Architecture

### Authentication Flow

```
1. User Login
   ↓
2. Validate Credentials
   ↓
3. Generate JWT Access Token (15min)
   ↓
4. Generate Refresh Token (7 days)
   ↓
5. Store Refresh Token in httpOnly Cookie
   ↓
6. Return Access Token to Client
   ↓
7. Client stores Access Token in memory
   ↓
8. Include Access Token in API requests
   ↓
9. Token expires → Use Refresh Token
   ↓
10. Get new Access Token
```

### Authorization Flow

```
1. Request with JWT Token
   ↓
2. Auth Middleware verifies token
   ↓
3. Extract user from token
   ↓
4. Attach user to request
   ↓
5. RBAC Middleware checks role
   ↓
6. Allow/Deny based on permissions
```

## Database Design

### Indexing Strategy

**User Collection**:
- Index on `email` (unique)

**Site Collection**:
- Index on `siteId` (unique)
- Index on `vendor`
- Index on `installationStatus`

**Alarm Collection**:
- Index on `siteId`
- Index on `severity`
- Index on `status`
- Index on `raisedAt` (descending)

**Configuration Collection**:
- Compound index on `siteId` + `version` (descending)

### Relationships

```
User ←→ Site (assignedEngineer)
User ←→ Alarm (assignedEngineer)
User ←→ Commissioning (engineer)
User ←→ Configuration (changedBy)
Site ←→ Commissioning (siteId)
Site ←→ Configuration (siteId)
Site ←→ Alarm (siteId)
```

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- JWT tokens (no session storage)
- MongoDB replica sets
- Load balancer ready

### Vertical Scaling
- Optimized queries with indexes
- Pagination for large datasets
- Efficient data structures
- Minimal memory footprint

### Caching Strategy (Future)
- Redis for session management
- Cache dashboard metrics
- Cache frequently accessed sites
- Invalidate on updates

### Microservices Ready
- Clear service boundaries
- Independent deployment capability
- API versioning support
- Service discovery ready

## Performance Optimization

### Backend
- Database indexing
- Query optimization
- Pagination
- Async/await throughout
- Connection pooling

### Frontend
- Code splitting
- Lazy loading
- Memoization
- Debounced search
- Virtual scrolling (future)

## Monitoring & Logging

### Application Logs
- Request/response logging
- Error logging
- Authentication attempts
- Business events

### Metrics to Track
- API response times
- Database query performance
- Active WebSocket connections
- Error rates
- User activity

## Technology Choices

### Why MERN?
- **MongoDB**: Flexible schema for telecom data
- **Express**: Minimal, flexible Node.js framework
- **React**: Component-based UI, virtual DOM
- **Node.js**: JavaScript everywhere, async I/O

### Why Socket.io?
- Real-time bidirectional communication
- Automatic reconnection
- Room support for targeted broadcasts
- Fallback mechanisms

### Why JWT?
- Stateless authentication
- Scalable across servers
- Self-contained tokens
- Industry standard

### Why Tailwind CSS?
- Utility-first approach
- Rapid development
- Consistent design system
- Dark mode support

## Future Enhancements

1. **Redis Integration** - Caching and session management
2. **Message Queue** - RabbitMQ/Kafka for async processing
3. **Elasticsearch** - Advanced search capabilities
4. **Grafana** - Metrics visualization
5. **Kubernetes** - Container orchestration
6. **CI/CD Pipeline** - Automated testing and deployment
7. **API Gateway** - Kong/AWS API Gateway
8. **Service Mesh** - Istio for microservices

---

This architecture ensures:
- ✅ Maintainability
- ✅ Scalability
- ✅ Testability
- ✅ Security
- ✅ Performance
- ✅ Extensibility
