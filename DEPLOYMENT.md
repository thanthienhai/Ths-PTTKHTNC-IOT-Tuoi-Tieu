# Deployment Guide

## Prerequisites

### Required Tools
- Docker 24+
- Docker Compose 2.20+
- kubectl 1.28+
- Node.js 20+
- Python 3.11+ (for edge controller)

### Required Accounts
- Docker Hub account (for image registry)
- Kubernetes cluster (AWS EKS, GKE, or AKS)
- GitHub account (for CI/CD)

## Local Development Deployment

### 1. Initial Setup

```bash
# Clone repository
git clone <repository-url>
cd smart-irrigation-iot

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

### 2. Start Infrastructure

```bash
# Start all services
docker-compose up -d

# Check service status
docker-compose ps

# View logs
docker-compose logs -f
```

### 3. Verify Services

```bash
# Check API Gateway
curl http://localhost:3000/health

# Check Prometheus
open http://localhost:9090

# Check Grafana
open http://localhost:3100
```

## Staging Deployment

### 1. Configure Kubernetes Cluster

```bash
# Set kubectl context
kubectl config use-context staging-cluster

# Verify connection
kubectl cluster-info
```

### 2. Create Secrets

```bash
# Create secrets file from template
cp k8s/secrets.yml.example k8s/secrets.yml

# Edit with staging credentials
nano k8s/secrets.yml

# Apply secrets
kubectl apply -f k8s/secrets.yml
```

### 3. Deploy Application

```bash
# Create namespace
kubectl apply -f k8s/namespace.yml

# Apply configuration
kubectl apply -f k8s/configmap.yml

# Deploy services
kubectl apply -f k8s/deployments/
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yml

# Wait for rollout
kubectl rollout status deployment -n irrigation-staging --timeout=10m
```

### 4. Verify Deployment

```bash
# Check pods
kubectl get pods -n irrigation-staging

# Check services
kubectl get services -n irrigation-staging

# Check ingress
kubectl get ingress -n irrigation-staging

# View logs
kubectl logs -f deployment/api-gateway -n irrigation-staging
```

## Production Deployment

### 1. Pre-deployment Checklist

- [ ] All tests passing in CI
- [ ] Staging deployment successful
- [ ] Database migrations prepared
- [ ] Backup created
- [ ] Rollback plan documented
- [ ] Team notified

### 2. Blue-Green Deployment

```bash
# Set production context
kubectl config use-context production-cluster

# Create production secrets
kubectl apply -f k8s/secrets.yml

# Deploy green environment
export VERSION=v1.0.0
kubectl apply -f k8s/namespace.yml
kubectl apply -f k8s/configmap.yml

# Deploy new version
envsubst < k8s/deployments/api-gateway.yml | kubectl apply -f -
# Repeat for all services...

# Wait for rollout
kubectl rollout status deployment -n irrigation-production --timeout=10m
```

### 3. Run Smoke Tests

```bash
# Install test dependencies
npm ci

# Run smoke tests
npm run test:smoke -- --env=production

# Verify critical endpoints
curl https://api.irrigation.example.com/health
```

### 4. Switch Traffic

```bash
# Update services to point to new deployment
kubectl apply -f k8s/services/
kubectl apply -f k8s/ingress.yml

# Monitor metrics
kubectl top pods -n irrigation-production
```

### 5. Post-Deployment Verification

```bash
# Check all pods are running
kubectl get pods -n irrigation-production

# Check service endpoints
kubectl get endpoints -n irrigation-production

# Monitor logs for errors
kubectl logs -f deployment/api-gateway -n irrigation-production --tail=100

# Check Prometheus metrics
open https://prometheus.irrigation.example.com

# Check Grafana dashboards
open https://grafana.irrigation.example.com
```

## Rollback Procedure

### Automatic Rollback (if deployment fails)

```bash
# Rollback to previous version
kubectl rollout undo deployment -n irrigation-production

# Verify rollback
kubectl rollout status deployment -n irrigation-production
```

### Manual Rollback

```bash
# List deployment history
kubectl rollout history deployment/api-gateway -n irrigation-production

# Rollback to specific revision
kubectl rollout undo deployment/api-gateway --to-revision=2 -n irrigation-production

# Repeat for all services
```

## CI/CD Configuration

### GitHub Secrets Required

```
DOCKER_USERNAME          # Docker Hub username
DOCKER_PASSWORD          # Docker Hub password
KUBE_CONFIG_STAGING      # Base64 encoded kubeconfig for staging
KUBE_CONFIG_PRODUCTION   # Base64 encoded kubeconfig for production
SLACK_WEBHOOK           # Slack webhook for notifications
WEATHER_API_KEY         # External weather API key
```

### Setting Up Secrets

```bash
# Encode kubeconfig
cat ~/.kube/config | base64

# Add to GitHub repository secrets
# Settings > Secrets and variables > Actions > New repository secret
```

## Monitoring Setup

### Prometheus Configuration

```bash
# Apply Prometheus configuration
kubectl apply -f monitoring/prometheus.yml

# Verify Prometheus is scraping targets
open http://prometheus.irrigation.example.com/targets
```

### Grafana Setup

```bash
# Access Grafana
open http://grafana.irrigation.example.com

# Login with default credentials
# Username: admin
# Password: admin

# Import dashboards from monitoring/grafana/dashboards/
```

## Troubleshooting

### Pods Not Starting

```bash
# Describe pod to see events
kubectl describe pod <pod-name> -n irrigation-production

# Check logs
kubectl logs <pod-name> -n irrigation-production

# Check resource constraints
kubectl top pods -n irrigation-production
```

### Service Connectivity Issues

```bash
# Test service DNS
kubectl run -it --rm debug --image=busybox --restart=Never -- nslookup api-gateway.irrigation-production.svc.cluster.local

# Check service endpoints
kubectl get endpoints -n irrigation-production

# Test connectivity from another pod
kubectl run -it --rm debug --image=curlimages/curl --restart=Never -- curl http://api-gateway:3000/health
```

### Database Connection Issues

```bash
# Check database pods
kubectl get pods -n irrigation-production | grep postgres

# Test database connection
kubectl run -it --rm psql --image=postgres:16 --restart=Never -- psql -h postgres-service -U irrigation_user -d irrigation_db
```

## Scaling

### Manual Scaling

```bash
# Scale specific deployment
kubectl scale deployment api-gateway --replicas=5 -n irrigation-production

# Verify scaling
kubectl get pods -n irrigation-production
```

### Horizontal Pod Autoscaling

```bash
# Create HPA
kubectl autoscale deployment api-gateway --cpu-percent=70 --min=2 --max=10 -n irrigation-production

# Check HPA status
kubectl get hpa -n irrigation-production
```

## Backup and Recovery

### Database Backup

```bash
# Backup PostgreSQL
kubectl exec -it postgres-0 -n irrigation-production -- pg_dump -U irrigation_user irrigation_db > backup.sql

# Backup MongoDB
kubectl exec -it mongodb-0 -n irrigation-production -- mongodump --out=/backup
```

### Restore from Backup

```bash
# Restore PostgreSQL
kubectl exec -i postgres-0 -n irrigation-production -- psql -U irrigation_user irrigation_db < backup.sql

# Restore MongoDB
kubectl exec -it mongodb-0 -n irrigation-production -- mongorestore /backup
```

## Security Considerations

1. **Secrets Management**: Use Kubernetes secrets or external secret managers (HashiCorp Vault, AWS Secrets Manager)
2. **Network Policies**: Implement network policies to restrict pod-to-pod communication
3. **RBAC**: Configure role-based access control for kubectl access
4. **TLS/SSL**: Ensure all external traffic uses HTTPS
5. **Image Scanning**: Scan Docker images for vulnerabilities before deployment
6. **Regular Updates**: Keep dependencies and base images updated

## Support

For issues or questions:
- Check logs: `kubectl logs -f deployment/<service-name> -n irrigation-production`
- Review metrics: Prometheus and Grafana dashboards
- Contact DevOps team: devops@irrigation.example.com
