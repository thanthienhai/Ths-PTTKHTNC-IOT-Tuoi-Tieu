# Project Structure Overview

## Directory Layout

```
smart-irrigation-iot/
│
├── .github/                          # GitHub configuration
│   └── workflows/                    # CI/CD pipelines
│       ├── ci.yml                   # Continuous Integration
│       └── cd.yml                   # Continuous Deployment
│
├── services/                         # Microservices (Node.js/TypeScript)
│   ├── api-gateway/                 # Port 3000 - API Gateway
│   ├── sensor-service/              # Port 3001 - Sensor data management
│   ├── irrigation-service/          # Port 3002 - Irrigation control
│   ├── weather-service/             # Port 3003 - Weather integration
│   ├── alert-service/               # Port 3004 - Alert management
│   ├── user-service/                # Port 3005 - User management
│   ├── device-service/              # Port 3006 - Device management
│   ├── analytics-service/           # Port 3007 - Analytics
│   ├── report-service/              # Port 3008 - Report generation
│   ├── Dockerfile.template          # Template for service Dockerfiles
│   └── README.md                    # Services documentation
│
├── edge-controller/                  # Edge device code (Python)
│   └── README.md                    # Edge controller documentation
│
├── dashboard/                        # Web dashboard (React)
│   └── README.md                    # Dashboard documentation
│
├── mobile-app/                       # Mobile app (React Native)
│   └── README.md                    # Mobile app documentation
│
├── k8s/                             # Kubernetes manifests
│   ├── deployments/                 # Deployment configurations
│   │   ├── api-gateway.yml
│   │   ├── sensor-service.yml
│   │   ├── irrigation-service.yml
│   │   ├── weather-service.yml
│   │   ├── alert-service.yml
│   │   ├── user-service.yml
│   │   ├── device-service.yml
│   │   ├── analytics-service.yml
│   │   └── report-service.yml
│   ├── services/                    # Service definitions
│   │   └── services.yml
│   ├── namespace.yml                # Namespace configuration
│   ├── configmap.yml                # Configuration maps
│   ├── secrets.yml.example          # Secrets template
│   └── ingress.yml                  # Ingress configuration
│
├── monitoring/                       # Monitoring configuration
│   ├── prometheus.yml               # Prometheus config
│   └── grafana/                     # Grafana configuration
│       ├── datasources/             # Data source configs
│       │   └── prometheus.yml
│       └── dashboards/              # Dashboard configs
│           └── dashboard.yml
│
├── documents/                        # Project documentation
│   └── docs.md
│
├── .kiro/                           # Kiro specifications
│   └── specs/
│       └── smart-irrigation-iot/
│           ├── requirements.md      # Requirements document
│           ├── design.md           # Design document
│           └── tasks.md            # Implementation tasks
│
├── docker-compose.yml               # Local development setup
├── package.json                     # Root package.json (monorepo)
├── .gitignore                       # Git ignore rules
├── .env.example                     # Environment variables template
├── README.md                        # Main project README
├── DEPLOYMENT.md                    # Deployment guide
├── CONTRIBUTING.md                  # Contribution guidelines
└── PROJECT_STRUCTURE.md            # This file
```

## Component Responsibilities

### Cloud Services Layer

#### API Gateway (Port 3000)
- Authentication & authorization
- Request routing
- Rate limiting
- Load balancing
- API versioning

#### Sensor Service (Port 3001)
- Sensor data ingestion
- Data validation & processing
- Anomaly detection
- Historical data queries
- Statistics calculation

#### Irrigation Service (Port 3002)
- Water demand calculation
- Schedule creation & optimization
- Conflict resolution
- Resource management
- Manual control

#### Weather Service (Port 3003)
- External API integration
- Forecast caching
- Evapotranspiration calculation
- Rain prediction

#### Alert Service (Port 3004)
- Alert creation & management
- Notification delivery
- Alert rules configuration
- Acknowledgment tracking

#### User Service (Port 3005)
- User CRUD operations
- Authentication
- Role management
- Permissions

#### Device Service (Port 3006)
- Device registration
- Status tracking
- Firmware management
- Configuration management

#### Analytics Service (Port 3007)
- Water usage analysis
- Zone comparison
- Trend analysis
- Recommendations

#### Report Service (Port 3008)
- Report generation
- Export (PDF/CSV)
- Scheduled reports
- Visualization

### Edge Layer

#### Edge Controller
- Local sensor reading
- Offline scheduling
- Device control
- Cloud synchronization
- Local storage

### Presentation Layer

#### Web Dashboard
- Real-time monitoring
- Control interface
- Report viewing
- User management
- Configuration

#### Mobile App
- Monitoring
- Push notifications
- Quick controls
- Alert management

## Infrastructure Components

### Databases
- **PostgreSQL**: Relational data (users, devices, zones, schedules)
- **MongoDB**: Time-series data (sensor readings, logs)
- **Redis**: Caching and real-time data

### Message Queue
- **RabbitMQ**: Inter-service communication, event streaming

### Monitoring
- **Prometheus**: Metrics collection
- **Grafana**: Visualization and dashboards

## Development Workflow

1. **Local Development**: Docker Compose
2. **Testing**: Jest (Node.js), Pytest (Python)
3. **CI**: GitHub Actions - automated testing
4. **CD**: GitHub Actions - automated deployment
5. **Staging**: Kubernetes cluster
6. **Production**: Kubernetes cluster with blue-green deployment

## Technology Stack Summary

### Backend
- **Language**: TypeScript (Node.js 20)
- **Framework**: Express.js
- **Databases**: PostgreSQL, MongoDB, Redis
- **Message Queue**: RabbitMQ
- **Testing**: Jest, Supertest

### Edge
- **Language**: Python 3.11+
- **Database**: SQLite
- **Communication**: MQTT, Modbus

### Frontend
- **Web**: React 18, TypeScript, Redux
- **Mobile**: React Native, TypeScript
- **UI**: Material-UI

### DevOps
- **Containers**: Docker
- **Orchestration**: Kubernetes
- **CI/CD**: GitHub Actions
- **Monitoring**: Prometheus, Grafana
- **Logging**: ELK Stack (future)

## Port Allocation

| Service | Port | Protocol |
|---------|------|----------|
| API Gateway | 3000 | HTTP |
| Sensor Service | 3001 | HTTP |
| Irrigation Service | 3002 | HTTP |
| Weather Service | 3003 | HTTP |
| Alert Service | 3004 | HTTP |
| User Service | 3005 | HTTP |
| Device Service | 3006 | HTTP |
| Analytics Service | 3007 | HTTP |
| Report Service | 3008 | HTTP |
| PostgreSQL | 5432 | TCP |
| MongoDB | 27017 | TCP |
| Redis | 6379 | TCP |
| RabbitMQ | 5672 | AMQP |
| RabbitMQ Management | 15672 | HTTP |
| Prometheus | 9090 | HTTP |
| Grafana | 3100 | HTTP |

## Environment-Specific Configuration

### Development
- Local Docker Compose
- Hot reload enabled
- Debug logging
- Mock external services

### Staging
- Kubernetes cluster
- Reduced replicas
- Integration with test weather API
- Staging database

### Production
- Kubernetes cluster
- High availability (multiple replicas)
- Production weather API
- Production database
- SSL/TLS enabled
- Monitoring and alerting

## Next Steps

Refer to `tasks.md` for the implementation plan. The infrastructure is now set up and ready for service implementation starting with task 2.
