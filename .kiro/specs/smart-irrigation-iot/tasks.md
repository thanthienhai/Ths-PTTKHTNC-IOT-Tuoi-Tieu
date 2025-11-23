# Implementation Plan - Hệ thống IoT Tưới Tiêu Nông Nghiệp Thông Minh

- [x] 1. Thiết lập cơ sở hạ tầng dự án và CI/CD
  - Tạo monorepo structure với workspaces cho microservices
  - Setup Docker và Docker Compose cho local development
  - Cấu hình GitHub Actions CI/CD pipeline
  - Setup Kubernetes manifests (deployments, services, ingress)
  - Cấu hình monitoring stack (Prometheus, Grafana)
  - _Requirements: 11.1, 12.1, 12.2_

- [x] 2. Implement core data models và database schemas
- [x] 2.1 Tạo TypeScript interfaces cho tất cả data models
  - Implement SensorReading, IrrigationZone, IrrigationSchedule, Device, Alert, User, WeatherForecast interfaces
  - Tạo validation schemas với Zod hoặc Joi
  - _Requirements: 1.1, 3.1, 4.1, 10.1_

- [x] 2.2 Setup PostgreSQL schemas cho relational data
  - Tạo tables: users, devices, irrigation_zones, irrigation_schedules, alerts, farms
  - Implement database migrations với Prisma hoặc TypeORM
  - Setup indexes và constraints
  - _Requirements: 10.4, 10.1, 3.1_

- [x] 2.3 Setup MongoDB collections cho time-series data
  - Tạo collections: sensor_readings, device_logs, irrigation_history, weather_data
  - Configure time-series collections với partitioning
  - Setup indexes cho query optimization
  - _Requirements: 1.1, 1.4_

- [x] 2.4 Setup Redis cho caching và real-time data
  - Configure Redis clusters
  - Implement cache strategies cho active_sessions, device_status, latest_sensor_readings
  - _Requirements: 6.4, 13.2_

- [ ]* 2.5 Write property test cho data model validation
  - **Property 9: Crop configuration persistence**
  - **Validates: Requirements 3.1**

- [x] 3. Implement API Gateway service
- [x] 3.1 Setup Kong hoặc custom Node.js gateway
  - Configure routing rules đến microservices
  - Implement rate limiting middleware
  - Setup load balancing
  - _Requirements: 6.1, 6.5, 15.1_

- [x] 3.2 Implement authentication middleware
  - JWT token generation và validation
  - Password hashing với bcrypt
  - Token refresh mechanism
  - _Requirements: 15.1, 15.2_

- [ ]* 3.3 Write property test cho authentication
  - **Property 23: Authentication token generation**
  - **Property 55: JWT token generation**
  - **Validates: Requirements 6.1, 15.1**

- [x] 3.4 Implement authorization middleware
  - Role-based access control (RBAC)
  - Permission checking logic
  - _Requirements: 6.5, 10.5, 15.2_

- [ ]* 3.5 Write property test cho authorization
  - **Property 27: Authorization enforcement**
  - **Property 45: Role-based access control**
  - **Property 56: Token validation middleware**
  - **Validates: Requirements 6.5, 10.5, 15.2**

- [x] 3.6 Implement brute-force protection
  - Track failed login attempts
  - Account lockout mechanism
  - _Requirements: 15.5_

- [ ]* 3.7 Write property test cho brute-force protection
  - **Property 58: Brute-force protection**
  - **Validates: Requirements 15.5**

- [ ]* 3.8 Write unit tests cho API Gateway
  - Test routing logic
  - Test rate limiting
  - Test error handling

- [x] 4. Implement Sensor Service
- [x] 4.1 Create sensor data ingestion endpoint
  - REST API để nhận sensor readings từ edge controllers
  - Batch processing support
  - Data validation và sanitization
  - _Requirements: 1.1, 1.2_

- [x] 4.2 Implement sensor data processing pipeline
  - Apply calibration coefficients
  - Noise filtering algorithms
  - Data normalization
  - _Requirements: 1.2_

- [ ]* 4.3 Write property test cho data processing
  - **Property 2: Sensor data processing pipeline**
  - **Validates: Requirements 1.2**

- [x] 4.4 Implement invalid data detection
  - Range validation
  - Anomaly detection algorithms
  - Maintenance flag setting
  - _Requirements: 1.3_

- [ ]* 4.5 Write property test cho invalid data handling
  - **Property 3: Invalid sensor data handling**
  - **Validates: Requirements 1.3**

- [x] 4.6 Implement sensor data storage
  - Save to MongoDB time-series collection
  - Update Redis cache với latest readings
  - _Requirements: 1.1, 1.4_

- [ ]* 4.7 Write property test cho data collection frequency
  - **Property 1: Sensor data collection frequency**
  - **Validates: Requirements 1.1**

- [x] 4.8 Implement sensor data query APIs
  - Get latest reading
  - Get historical data với time range
  - Calculate statistics
  - _Requirements: 9.1_

- [ ]* 4.9 Write unit tests cho Sensor Service
  - Test data validation
  - Test query endpoints
  - Test error scenarios

- [x] 5. Implement Weather Service
- [x] 5.1 Integrate với external weather API
  - Setup API client (OpenWeatherMap hoặc WeatherAPI)
  - Implement retry logic với exponential backoff
  - _Requirements: 2.1_

- [x] 5.2 Implement weather data caching
  - Store 7-day forecast trong database
  - Cache recent forecasts trong Redis
  - _Requirements: 2.2, 2.4_

- [ ]* 5.3 Write property test cho weather data storage
  - **Property 6: Weather data completeness**
  - **Validates: Requirements 2.2**

- [x] 5.4 Implement fallback mechanism
  - Use cached data khi external API unavailable
  - _Requirements: 2.4_

- [ ]* 5.5 Write property test cho weather fallback
  - **Property 8: Weather service fallback**
  - **Validates: Requirements 2.4**

- [x] 5.6 Implement evapotranspiration calculation
  - Calculate ET based on temperature, humidity, solar radiation
  - Adjust for crop type
  - _Requirements: 3.4_

- [ ]* 5.7 Write property test cho ET adjustment
  - **Property 12: ET coefficient adjustment**
  - **Validates: Requirements 3.4**

- [x] 5.8 Implement rain prediction checking
  - Check forecast cho heavy rain trong 24h
  - _Requirements: 2.3_

- [ ]* 5.9 Write unit tests cho Weather Service
  - Test API integration
  - Test caching logic
  - Test ET calculations

- [x] 6. Implement Irrigation Service
- [x] 6.1 Implement water demand calculation
  - Get current soil moisture từ Sensor Service
  - Get crop info và growth stage
  - Get weather forecast từ Weather Service
  - Calculate water deficit
  - _Requirements: 3.2, 3.3_

- [ ]* 6.2 Write property test cho water demand calculation
  - **Property 10: Water demand calculation inputs**
  - **Property 11: Moisture deficit calculation**
  - **Validates: Requirements 3.2, 3.3**

- [x] 6.3 Implement schedule creation logic
  - Generate schedule với start time, duration, flow rate
  - Optimize timing cho early morning hoặc evening
  - _Requirements: 4.1, 4.5_

- [ ]* 6.4 Write property test cho schedule creation
  - **Property 13: Schedule completeness**
  - **Property 17: Optimal irrigation timing**
  - **Validates: Requirements 4.1, 4.5**

- [x] 6.5 Implement conflict detection và resolution
  - Check overlapping schedules
  - Resolve resource conflicts
  - _Requirements: 4.2, 4.4_

- [ ]* 6.6 Write property test cho conflict resolution
  - **Property 14: Resource conflict resolution**
  - **Property 16: Schedule conflict detection**
  - **Validates: Requirements 4.2, 4.4**

- [x] 6.7 Implement water availability checking
  - Query water level từ Sensor Service
  - Check if sufficient cho all zones
  - _Requirements: 7.2, 7.4_

- [x] 6.8 Implement zone prioritization
  - Sort zones by priority
  - Allocate water to high-priority zones first
  - _Requirements: 4.3_

- [ ]* 6.9 Write property test cho prioritization
  - **Property 15: Zone prioritization under scarcity**
  - **Validates: Requirements 4.3**

- [x] 6.10 Implement conservation mode
  - Activate khi water insufficient
  - Reduce water allocation by 30% cho non-priority zones
  - _Requirements: 7.4, 7.5_

- [ ]* 6.11 Write property test cho conservation mode
  - **Property 31: Conservation mode activation**
  - **Property 32: Water reduction in conservation mode**
  - **Validates: Requirements 7.4, 7.5**

- [x] 6.12 Implement rain-based schedule adjustment
  - Cancel/postpone schedules khi heavy rain predicted
  - _Requirements: 2.3_

- [ ]* 6.13 Write property test cho rain adjustment
  - **Property 7: Rain-based schedule adjustment**
  - **Validates: Requirements 2.3**

- [x] 6.14 Implement manual control endpoint
  - Allow manual valve/pump control
  - Tag schedules as manual override
  - _Requirements: 6.2, 6.3_

- [ ]* 6.15 Write property test cho manual control
  - **Property 24: Manual control latency**
  - **Property 25: Manual override tagging**
  - **Validates: Requirements 6.2, 6.3**

- [ ]* 6.16 Write unit tests cho Irrigation Service
  - Test calculation logic
  - Test scheduling algorithms
  - Test edge cases

- [x] 7. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 8. Implement Device Service
- [x] 8.1 Implement device registration
  - Generate unique device ID
  - Generate security key
  - Store device info trong database
  - _Requirements: 10.1_

- [ ]* 8.2 Write property test cho device registration
  - **Property 42: Device registration uniqueness**
  - **Validates: Requirements 10.1**

- [x] 8.3 Implement device authentication
  - Verify security key on connection
  - _Requirements: 10.2_

- [ ]* 8.4 Write property test cho device authentication
  - **Property 43: Device authentication**
  - **Validates: Requirements 10.2**

- [x] 8.5 Implement device status tracking
  - Update last_seen timestamp
  - Track online/offline status
  - _Requirements: 6.4_

- [x] 8.6 Implement firmware management
  - Upload firmware files
  - Deploy firmware to devices (OTA)
  - _Requirements: 10.3_

- [x] 8.7 Implement device configuration management
  - Store device configs
  - Update configs remotely
  - _Requirements: 10.1_

- [ ]* 8.8 Write unit tests cho Device Service
  - Test registration flow
  - Test authentication
  - Test firmware deployment

- [x] 9. Implement Alert Service
- [x] 9.1 Implement alert creation logic
  - Create alerts với severity levels
  - Store trong database
  - _Requirements: 8.1_

- [ ]* 9.2 Write property test cho threshold alerts
  - **Property 33: Threshold-based alert creation**
  - **Validates: Requirements 8.1**

- [x] 9.2 Implement sensor timeout detection
  - Monitor sensor last_seen timestamps
  - Create alert khi timeout > 15 minutes
  - _Requirements: 8.3_

- [ ]* 9.3 Write property test cho sensor timeout
  - **Property 35: Sensor timeout detection**
  - **Validates: Requirements 8.3**

- [x] 9.4 Implement device malfunction detection
  - Monitor device error states
  - Create alerts cho valve/pump failures
  - _Requirements: 8.4_

- [ ]* 9.5 Write property test cho device malfunction
  - **Property 36: Device malfunction alerting**
  - **Validates: Requirements 8.4**

- [x] 9.6 Implement low water alerting
  - Monitor water levels
  - Create alert khi < 20% capacity
  - _Requirements: 7.3_

- [ ]* 9.7 Write property test cho low water alerts
  - **Property 30: Low water alerting**
  - **Validates: Requirements 7.3**

- [x] 9.8 Implement notification delivery
  - Send push notifications đến mobile app
  - Send notifications đến dashboard
  - Ensure delivery trong 30 seconds
  - _Requirements: 8.2_

- [ ]* 9.9 Write property test cho notification latency
  - **Property 34: Alert notification latency**
  - **Validates: Requirements 8.2**

- [x] 9.10 Implement alert acknowledgment
  - Update alert status
  - Store user notes
  - _Requirements: 8.5_

- [ ]* 9.11 Write property test cho alert acknowledgment
  - **Property 37: Alert acknowledgment tracking**
  - **Validates: Requirements 8.5**

- [ ]* 9.12 Write unit tests cho Alert Service
  - Test alert creation
  - Test notification delivery
  - Test alert lifecycle

- [x] 10. Implement User Service
- [x] 10.1 Implement user CRUD operations
  - Create, read, update, delete users
  - Hash passwords với bcrypt
  - _Requirements: 10.4_

- [x] 10.2 Implement role assignment
  - Assign roles: farmer, manager, agronomist, technician, admin
  - _Requirements: 10.4_

- [ ]* 10.3 Write property test cho user role assignment
  - **Property 44: User role assignment**
  - **Validates: Requirements 10.4**

- [x] 10.4 Implement user preferences management
  - Store user settings
  - Notification preferences
  - _Requirements: 10.4_

- [ ]* 10.5 Write unit tests cho User Service
  - Test CRUD operations
  - Test password hashing
  - Test role management

- [x] 11. Implement Analytics Service
- [x] 11.1 Implement water usage analysis
  - Calculate total water used per zone
  - Calculate efficiency metrics
  - _Requirements: 9.1, 9.5_

- [x] 11.2 Implement zone comparison
  - Compare water efficiency across zones
  - Generate comparison metrics
  - _Requirements: 9.5_

- [ ]* 11.3 Write property test cho zone comparison
  - **Property 41: Zone comparison visualization**
  - **Validates: Requirements 9.5**

- [x] 11.4 Implement trend analysis
  - Analyze historical patterns
  - Identify optimization opportunities
  - _Requirements: 9.4_

- [ ]* 11.5 Write unit tests cho Analytics Service
  - Test calculation accuracy
  - Test aggregation logic

- [x] 12. Implement Report Service
- [x] 12.1 Implement report generation
  - Query data từ time range
  - Generate charts (temperature, moisture, water usage, irrigation count)
  - _Requirements: 9.1, 9.2_

- [ ]* 12.2 Write property test cho report generation
  - **Property 38: Report time range filtering**
  - **Property 39: Report chart completeness**
  - **Validates: Requirements 9.1, 9.2**

- [x] 12.3 Implement report export
  - Export to PDF format
  - Export to CSV format
  - _Requirements: 9.3_

- [ ]* 12.4 Write property test cho report export
  - **Property 40: Report export format validity**
  - **Validates: Requirements 9.3**

- [ ]* 12.5 Write unit tests cho Report Service
  - Test report generation
  - Test export functionality

- [ ] 13. Implement Edge Controller (Raspberry Pi/ESP32)
- [x] 13.1 Setup Python project structure
  - Create modules: sensors, actuators, scheduler, sync
  - Setup logging
  - _Requirements: 1.1, 5.1_

- [x] 13.2 Implement sensor reading logic
  - Read từ I2C/SPI sensors
  - Apply calibration
  - Filter noise
  - _Requirements: 1.1, 1.2_

- [x] 13.3 Implement local data storage
  - Setup SQLite database
  - Store sensor readings locally
  - _Requirements: 1.5, 14.2_

- [ ]* 13.4 Write property test cho offline data persistence
  - **Property 51: Offline data persistence**
  - **Validates: Requirements 14.2**

- [x] 13.4 Implement offline scheduling engine
  - Load schedules từ cloud
  - Execute schedules locally khi offline
  - _Requirements: 1.5, 14.1_

- [ ]* 13.5 Write property test cho offline execution
  - **Property 5: Offline operation continuity**
  - **Property 50: Offline schedule execution**
  - **Validates: Requirements 1.5, 14.1**

- [x] 13.6 Implement device control logic
  - Control valves via GPIO/relay
  - Control pumps với PWM
  - Implement retry mechanism
  - _Requirements: 5.1, 5.2, 5.3, 5.4_

- [ ]* 13.7 Write property test cho device control
  - **Property 18: Scheduled valve control**
  - **Property 19: Pump-valve coordination**
  - **Property 20: Irrigation completion cleanup**
  - **Property 21: Command retry mechanism**
  - **Validates: Requirements 5.1, 5.2, 5.3, 5.4**

- [x] 13.8 Implement cloud sync manager
  - Sync data khi connection available
  - Sync trong 1 minute
  - Handle sync conflicts
  - _Requirements: 1.4, 14.3, 14.4_

- [ ]* 13.9 Write property test cho cloud sync
  - **Property 4: Cloud synchronization timing**
  - **Property 52: Post-reconnection synchronization**
  - **Property 53: Sync conflict resolution**
  - **Validates: Requirements 1.4, 14.3, 14.4**

- [x] 13.10 Implement local storage cleanup
  - Delete old synced data khi storage > 80%
  - _Requirements: 14.5_

- [ ]* 13.11 Write property test cho storage cleanup
  - **Property 54: Local storage cleanup**
  - **Validates: Requirements 14.5**

- [x] 13.12 Implement MQTT client
  - Connect to cloud message broker
  - Subscribe to command topics
  - Publish sensor data
  - _Requirements: 1.4, 6.2_

- [ ]* 13.13 Write unit tests cho Edge Controller
  - Test sensor reading
  - Test device control
  - Test sync logic

- [x] 14. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [ ] 15. Implement Message Queue (RabbitMQ/Kafka)
- [x] 15.1 Setup message broker
  - Configure RabbitMQ hoặc Kafka cluster
  - Create topics/queues: sensor_data, commands, alerts, events
  - _Requirements: 11.4_

- [x] 15.2 Implement message producers
  - Sensor Service publishes sensor data
  - Irrigation Service publishes commands
  - Alert Service publishes alerts
  - _Requirements: 11.4_

- [x] 15.3 Implement message consumers
  - Edge Controller consumes commands
  - Dashboard consumes alerts
  - Analytics Service consumes sensor data
  - _Requirements: 11.4_

- [ ]* 15.4 Write unit tests cho message queue integration
  - Test message publishing
  - Test message consumption
  - Test error handling

- [x] 16. Implement Dashboard (Web Frontend)
- [x] 16.1 Setup React/Vue project
  - Configure build tools (Vite/Webpack)
  - Setup routing (React Router)
  - Setup state management (Redux/Zustand)
  - _Requirements: 6.1, 6.4_

- [x] 16.2 Implement authentication pages
  - Login page
  - Token storage trong localStorage
  - Auto-refresh token
  - _Requirements: 6.1, 15.1_

- [x] 16.3 Implement dashboard home page
  - Display real-time sensor data
  - Display device status
  - Display active alerts
  - _Requirements: 6.4_

- [ ]* 16.4 Write property test cho data freshness
  - **Property 26: Dashboard data freshness**
  - **Validates: Requirements 6.4**

- [x] 16.5 Implement irrigation control page
  - View schedules
  - Manual valve/pump control
  - Override schedules
  - _Requirements: 6.2, 6.3_

- [x] 16.6 Implement zone management page
  - Configure zones
  - Set crop types và growth stages
  - _Requirements: 3.1_

- [x] 16.7 Implement water resource management page
  - Configure water sources
  - View water levels
  - _Requirements: 7.1, 7.2_

- [ ]* 16.8 Write property test cho water source config
  - **Property 28: Water source configuration completeness**
  - **Validates: Requirements 7.1**

- [x] 16.9 Implement alerts page
  - View all alerts
  - Acknowledge alerts
  - Add notes
  - _Requirements: 8.5_

- [x] 16.10 Implement reports page
  - Generate reports với date range
  - Display charts
  - Export to PDF/CSV
  - _Requirements: 9.1, 9.2, 9.3_

- [x] 16.11 Implement device management page
  - Register new devices
  - View device status
  - Update firmware
  - _Requirements: 10.1, 10.2, 10.3_

- [x] 16.12 Implement user management page (admin only)
  - Create users
  - Assign roles
  - Manage permissions
  - _Requirements: 10.4, 10.5_

- [ ]* 16.13 Write E2E tests cho Dashboard
  - Test login flow
  - Test irrigation control
  - Test report generation

- [ ] 18. Implement Security Features
- [ ] 18.1 Implement TLS/SSL encryption
  - Configure HTTPS cho all services
  - Setup certificate management
  - _Requirements: 15.3_

- [ ] 18.2 Implement data encryption at rest
  - Encrypt sensitive fields trong database
  - Use encryption keys từ Vault
  - _Requirements: 15.4_

- [ ]* 18.3 Write property test cho data encryption
  - **Property 57: Sensitive data encryption**
  - **Validates: Requirements 15.4**

- [ ]* 18.4 Write security tests
  - Test SQL injection prevention
  - Test XSS prevention
  - Test CSRF protection

- [ ] 19. Implement Performance Optimizations
- [ ] 19.1 Implement caching strategies
  - Cache sensor readings trong Redis
  - Cache weather forecasts
  - Cache user sessions
  - _Requirements: 13.2_

- [ ] 19.2 Implement database query optimization
  - Add indexes
  - Optimize slow queries
  - Implement connection pooling
  - _Requirements: 13.2, 13.4_

- [ ]* 19.3 Write property test cho API response time
  - **Property 48: API response time**
  - **Validates: Requirements 13.2**

- [ ] 19.4 Implement data compression
  - Compress API responses
  - Compress sensor data trong transit
  - _Requirements: 13.1_

- [ ]* 19.5 Write property test cho command latency
  - **Property 47: Command execution latency**
  - **Validates: Requirements 13.1**

- [ ]* 19.6 Run performance tests
  - Load testing với k6
  - Measure throughput
  - Identify bottlenecks

- [ ] 20. Implement Fault Tolerance Features
- [ ] 20.1 Implement circuit breaker pattern
  - Add circuit breakers cho external service calls
  - Configure thresholds và timeouts
  - _Requirements: 11.2_

- [ ] 20.2 Implement health checks
  - Add health check endpoints cho all services
  - Configure Kubernetes liveness và readiness probes
  - _Requirements: 11.2_

- [ ]* 20.3 Write property test cho fault isolation
  - **Property 46: Microservice fault isolation**
  - **Validates: Requirements 11.2**

- [ ] 20.4 Implement graceful degradation
  - Fallback mechanisms khi services unavailable
  - Return cached data khi possible
  - _Requirements: 11.2_

- [ ]* 20.5 Write chaos engineering tests
  - Simulate service failures
  - Test recovery mechanisms

- [ ] 21. Implement Data Accuracy Features
- [ ] 21.1 Implement data validation pipeline
  - Validate sensor readings
  - Check data integrity
  - _Requirements: 13.3_

- [ ]* 21.2 Write property test cho data accuracy
  - **Property 49: Data accuracy preservation**
  - **Validates: Requirements 13.3**

- [ ] 21.3 Implement data reconciliation
  - Compare local và cloud data
  - Detect discrepancies
  - _Requirements: 13.3_

- [ ]* 21.4 Write unit tests cho data validation
  - Test validation rules
  - Test error detection

- [ ] 22. Final Integration và Testing
- [ ] 22.1 Run full integration test suite
  - Test all microservices together
  - Test edge-to-cloud communication
  - Test dashboard-to-backend flows
  - _Requirements: All_

- [ ] 22.2 Run all property-based tests
  - Verify all 58 properties pass
  - Increase iterations to 1000 for critical properties
  - _Requirements: All_

- [ ] 22.3 Run E2E tests
  - Test complete user journeys
  - Test offline-to-online transitions
  - Test error recovery scenarios
  - _Requirements: All_

- [ ] 22.4 Run security audit
  - Scan for vulnerabilities
  - Test authentication và authorization
  - Test data encryption
  - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_

- [ ] 22.5 Run performance benchmarks
  - Measure API latencies
  - Measure throughput
  - Verify SLA requirements
  - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [ ] 23. Documentation và Deployment
- [ ] 23.1 Write API documentation
  - Document all REST endpoints
  - Generate OpenAPI/Swagger specs
  - _Requirements: All services_

- [ ] 23.2 Write deployment guide
  - Document Kubernetes deployment
  - Document environment variables
  - Document secrets management
  - _Requirements: 12.3, 12.4_

- [ ] 23.3 Write operations runbook
  - Document monitoring dashboards
  - Document alerting rules
  - Document troubleshooting procedures
  - _Requirements: 12.5_

- [ ] 23.4 Deploy to staging environment
  - Apply Kubernetes manifests
  - Run smoke tests
  - _Requirements: 12.3_

- [ ] 23.5 Deploy to production
  - Blue-green deployment
  - Monitor metrics
  - Verify all services healthy
  - _Requirements: 12.4_

- [ ] 24. Final Checkpoint - Production Verification
  - Ensure all tests pass, ask the user if questions arise.
  - Verify system meets all requirements
  - Verify all 58 correctness properties hold in production
