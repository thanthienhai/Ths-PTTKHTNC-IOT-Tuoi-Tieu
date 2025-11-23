# Smart Irrigation IoT System

Hệ thống IoT Tưới Tiêu Nông Nghiệp Thông Minh - A comprehensive microservices-based solution for automated agricultural irrigation.

## Architecture

This system follows a microservices architecture with the following components:

### Cloud Services
- **API Gateway**: Central entry point for all API requests
- **Sensor Service**: Handles sensor data ingestion and processing
- **Irrigation Service**: Manages irrigation scheduling and water demand calculation
- **Weather Service**: Integrates with external weather APIs
- **Alert Service**: Manages alerts and notifications
- **User Service**: User management and authentication
- **Device Service**: IoT device registration and management
- **Analytics Service**: Data analysis and insights
- **Report Service**: Report generation and export

### Edge Layer
- **Edge Controller**: Raspberry Pi/ESP32 based controller for local operations

### Infrastructure
- **PostgreSQL**: Relational data storage
- **MongoDB**: Time-series sensor data
- **Redis**: Caching and real-time data
- **RabbitMQ**: Message queue for inter-service communication
- **Prometheus**: Metrics collection
- **Grafana**: Monitoring dashboards

## Prerequisites

- Node.js 20+
- Docker & Docker Compose
- Python 3.11+ (for edge controller)
- Kubernetes cluster (for production deployment)
- kubectl CLI

## Local Development Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd smart-irrigation-iot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start services with Docker Compose**
   ```bash
   docker-compose up -d
   ```

5. **Access services**
   - API Gateway: http://localhost:3000
   - RabbitMQ Management: http://localhost:15672
   - Prometheus: http://localhost:9090
   - Grafana: http://localhost:3100

## Project Structure

```
smart-irrigation-iot/
├── services/                    # Microservices
│   ├── api-gateway/
│   ├── sensor-service/
│   ├── irrigation-service/
│   ├── weather-service/
│   ├── alert-service/
│   ├── user-service/
│   ├── device-service/
│   ├── analytics-service/
│   └── report-service/
├── edge-controller/             # Edge device code
├── dashboard/                   # Web dashboard
├── mobile-app/                  # Mobile application
├── k8s/                        # Kubernetes manifests
│   ├── deployments/
│   ├── services/
│   ├── configmap.yml
│   ├── secrets.yml.example
│   ├── namespace.yml
│   └── ingress.yml
├── monitoring/                  # Monitoring configuration
│   ├── prometheus.yml
│   └── grafana/
├── .github/workflows/          # CI/CD pipelines
│   ├── ci.yml
│   └── cd.yml
├── docker-compose.yml
└── package.json
```

## CI/CD Pipeline

### Continuous Integration
- Automated testing on every push and pull request
- Linting and code quality checks
- Docker image building
- Integration tests

### Continuous Deployment
- **Staging**: Automatic deployment on push to `main` branch
- **Production**: Manual deployment on version tags (e.g., `v1.0.0`)
- Blue-green deployment strategy
- Automatic rollback on failure

## Kubernetes Deployment

1. **Create secrets**
   ```bash
   cp k8s/secrets.yml.example k8s/secrets.yml
   # Edit k8s/secrets.yml with production values
   kubectl apply -f k8s/secrets.yml
   ```

2. **Deploy to Kubernetes**
   ```bash
   kubectl apply -f k8s/namespace.yml
   kubectl apply -f k8s/configmap.yml
   kubectl apply -f k8s/deployments/
   kubectl apply -f k8s/services/
   kubectl apply -f k8s/ingress.yml
   ```

3. **Verify deployment**
   ```bash
   kubectl get pods -n irrigation-production
   kubectl get services -n irrigation-production
   ```

## Monitoring

Access Grafana at http://localhost:3100 (local) or your configured domain (production).

Default credentials:
- Username: admin
- Password: admin

## Development Workflow

1. Create a feature branch
2. Make changes to the relevant service
3. Write tests
4. Commit and push
5. Create pull request
6. CI pipeline runs automatically
7. After approval and merge, CD pipeline deploys to staging
8. Tag release for production deployment

## Testing

```bash
# Run all tests
npm test

# Run tests for specific service
npm test --workspace=services/sensor-service

# Run integration tests
npm run test:integration
```

## Contributing

Please read CONTRIBUTING.md for details on our code of conduct and the process for submitting pull requests.

## License

This project is licensed under the MIT License - see the LICENSE file for details.
