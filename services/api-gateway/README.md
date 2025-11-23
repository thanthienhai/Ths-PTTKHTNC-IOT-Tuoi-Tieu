# API Gateway

Central API gateway for the Smart Irrigation IoT System. Handles authentication, authorization, rate limiting, and request routing to microservices.

## Features

- **Authentication**: JWT-based authentication with session management
- **Authorization**: Role-based access control (RBAC) and permission checking
- **Rate Limiting**: Per-user, per-endpoint rate limiting
- **Brute-Force Protection**: Account lockout after failed login attempts
- **Request Routing**: Proxy requests to appropriate microservices
- **Metrics**: Prometheus metrics for monitoring
- **Health Checks**: Health and readiness endpoints

## Architecture

```
Client → API Gateway → Microservices
         ↓
    Authentication
    Authorization
    Rate Limiting
    Metrics
```

## Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/refresh` - Refresh access token
- `POST /api/auth/logout` - Logout user
- `GET /api/auth/me` - Get current user info

### Proxied Routes
- `/api/sensors/*` → Sensor Service
- `/api/irrigation/*` → Irrigation Service
- `/api/weather/*` → Weather Service
- `/api/alerts/*` → Alert Service
- `/api/users/*` → User Service
- `/api/devices/*` → Device Service
- `/api/analytics/*` → Analytics Service
- `/api/reports/*` → Report Service

### System
- `GET /health` - Health check
- `GET /ready` - Readiness check
- `GET /metrics` - Prometheus metrics

## Security Features

### Authentication
- JWT tokens with configurable expiration
- Refresh tokens for extended sessions
- Session storage in Redis
- Automatic session refresh on activity

### Authorization
- Role hierarchy: farmer < technician < agronomist < manager < admin
- Permission-based access control
- Farm-level access control
- Resource ownership validation

### Brute-Force Protection
- Track failed login attempts
- Account lockout after 5 failed attempts in 5 minutes
- 15-minute lockout period
- Automatic reset on successful login

### Rate Limiting
- 100 requests per minute per user (default)
- 5 login attempts per minute
- Configurable per endpoint
- Redis-based distributed rate limiting

## Configuration

Environment variables (see `.env.example`):

```env
NODE_ENV=development
PORT=3000
POSTGRES_URL=postgresql://...
REDIS_URL=redis://...
JWT_SECRET=your_secret
JWT_EXPIRATION=24h
CORS_ORIGIN=*
```

## Development

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev

# Build
npm run build

# Start production
npm start

# Run tests
npm test

# Lint
npm run lint
```

## User Roles

1. **farmer** - Basic access to own farms
2. **technician** - Device management and maintenance
3. **agronomist** - Crop and irrigation planning
4. **manager** - Farm management and reporting
5. **admin** - Full system access

## Request Flow

1. Client sends request with JWT token
2. API Gateway validates token
3. Session checked in Redis
4. User permissions verified
5. Rate limit checked
6. Request proxied to microservice
7. User context forwarded in headers

## Headers

### Request Headers
- `Authorization: Bearer <token>` - JWT token
- `Content-Type: application/json`

### Response Headers
- `X-RateLimit-Limit` - Rate limit maximum
- `X-RateLimit-Remaining` - Remaining requests
- `X-RateLimit-Reset` - Reset timestamp
- `X-Request-Id` - Unique request ID

### Forwarded Headers (to microservices)
- `X-User-Id` - Authenticated user ID
- `X-User-Role` - User role
- `X-Request-Id` - Request tracking ID

## Error Responses

All errors follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable message",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "requestId": "uuid"
}
```

### Common Error Codes
- `UNAUTHORIZED` - Not authenticated
- `FORBIDDEN` - Insufficient permissions
- `RATE_LIMIT_EXCEEDED` - Too many requests
- `ACCOUNT_LOCKED` - Brute-force protection triggered
- `VALIDATION_ERROR` - Invalid input
- `NOT_FOUND` - Resource not found
- `INTERNAL_ERROR` - Server error

## Monitoring

Prometheus metrics available at `/metrics`:

- `http_requests_total` - Total HTTP requests
- `http_request_duration_seconds` - Request duration histogram
- Default Node.js metrics (memory, CPU, etc.)

## Testing

```bash
# Run all tests
npm test

# Watch mode
npm run test:watch

# Coverage
npm test -- --coverage
```

## Deployment

See main project README for deployment instructions.

## Dependencies

- express - Web framework
- jsonwebtoken - JWT handling
- bcrypt - Password hashing
- http-proxy-middleware - Request proxying
- prom-client - Prometheus metrics
- helmet - Security headers
- cors - CORS handling
- @irrigation/shared - Shared types and utilities
