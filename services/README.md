# Microservices

This directory contains all microservices for the Smart Irrigation IoT System.

## Services

### Core Services
- **api-gateway** (Port 3000): Central API gateway with authentication and routing
- **sensor-service** (Port 3001): Sensor data ingestion and processing
- **irrigation-service** (Port 3002): Irrigation scheduling and water management
- **weather-service** (Port 3003): Weather data integration and forecasting
- **alert-service** (Port 3004): Alert management and notifications
- **user-service** (Port 3005): User management and authentication
- **device-service** (Port 3006): IoT device registration and management
- **analytics-service** (Port 3007): Data analytics and insights
- **report-service** (Port 3008): Report generation and export

## Service Structure

Each service follows this structure:

```
service-name/
├── src/
│   ├── index.ts           # Entry point
│   ├── routes/            # API routes
│   ├── controllers/       # Request handlers
│   ├── services/          # Business logic
│   ├── models/            # Data models
│   ├── middleware/        # Express middleware
│   └── utils/             # Utility functions
├── tests/                 # Test files
├── Dockerfile            # Docker configuration
├── package.json          # Dependencies
├── tsconfig.json         # TypeScript config
└── jest.config.js        # Test configuration
```

## Development

### Running a Single Service

```bash
# Install dependencies
npm install

# Run in development mode
npm run dev --workspace=services/sensor-service

# Build
npm run build --workspace=services/sensor-service

# Run tests
npm test --workspace=services/sensor-service
```

### Running All Services

```bash
# Use Docker Compose
docker-compose up

# Or run individually
npm run dev --workspaces
```

## Adding a New Service

1. Create service directory: `services/new-service/`
2. Copy structure from existing service
3. Update `package.json` with service name and dependencies
4. Add service to `docker-compose.yml`
5. Create Kubernetes deployment in `k8s/deployments/`
6. Add service to CI/CD pipeline in `.github/workflows/`

## Inter-Service Communication

Services communicate via:
- **REST APIs**: Through API Gateway
- **Message Queue**: RabbitMQ for async operations
- **Shared Database**: PostgreSQL for relational data
- **Cache**: Redis for shared state

## Environment Variables

Each service requires:
- `NODE_ENV`: Environment (development/staging/production)
- `PORT`: Service port
- Database connection strings
- Message queue URLs
- Service-specific API keys

See `.env.example` in project root for full list.
