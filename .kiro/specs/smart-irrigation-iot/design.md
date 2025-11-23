# Tài liệu Thiết kế - Hệ thống IoT Tưới Tiêu Nông Nghiệp Thông Minh

## Tổng quan (Overview)

Hệ thống IoT Tưới Tiêu Nông Nghiệp Thông Minh là một giải pháp phân tán, dựa trên kiến trúc microservices, được thiết kế để tự động hóa hoàn toàn quy trình tưới tiêu nông nghiệp. Hệ thống kết hợp các cảm biến IoT, bộ điều khiển nhúng, dịch vụ đám mây, và giao diện người dùng để tạo ra một hệ sinh thái thông minh, có khả năng tự học và tối ưu hóa việc sử dụng nước.

### Mục tiêu thiết kế chính:

1. **Tính mô-đun cao**: Mỗi microservice độc lập, có thể phát triển, triển khai và mở rộng riêng biệt
2. **Khả năng chịu lỗi**: Hệ thống tiếp tục hoạt động ngay cả khi một số thành phần gặp sự cố
3. **Hoạt động Offline**: Bộ điều khiển edge có thể hoạt động độc lập khi mất kết nối
4. **Khả năng mở rộng**: Hỗ trợ từ trang trại nhỏ đến hệ thống lớn với hàng nghìn cảm biến
5. **Bảo mật**: Mã hóa end-to-end, xác thực đa lớp, và phân quyền chi tiết

## Kiến trúc (Architecture)

### Kiến trúc tổng thể

Hệ thống được thiết kế theo mô hình 3 tầng với kiến trúc microservices:

```
┌─────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER                        │
│  ┌──────────────────┐  ┌──────────────────┐  ┌───────────────┐ │
│  │  Web Dashboard   │  │  Mobile App      │  │  Admin Portal │ │
│  └──────────────────┘  └──────────────────┘  └───────────────┘ │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                      APPLICATION LAYER (Cloud)                   │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                      API Gateway                          │  │
│  │  - Authentication & Authorization                         │  │
│  │  - Rate Limiting & Load Balancing                        │  │
│  │  - Request Routing                                        │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐           │
│  │   Sensor    │  │ Irrigation  │  │   Weather    │           │
│  │   Service   │  │   Service   │  │   Service    │           │
│  └─────────────┘  └─────────────┘  └──────────────┘           │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐           │
│  │    Alert    │  │    User     │  │    Device    │           │
│  │   Service   │  │   Service   │  │   Service    │           │
│  └─────────────┘  └─────────────┘  └──────────────┘           │
│                                                                   │
│  ┌─────────────┐  ┌─────────────┐  ┌──────────────┐           │
│  │  Analytics  │  │   Report    │  │   Message    │           │
│  │   Service   │  │   Service   │  │    Queue     │           │
│  └─────────────┘  └─────────────┘  └──────────────┘           │
└─────────────────────────────────────────────────────────────────┘
                                 │
                                 ▼
┌─────────────────────────────────────────────────────────────────┐
│                         EDGE LAYER (Field)                       │
│                                                                   │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │           Edge Controller (Raspberry Pi / ESP32)          │  │
│  │  - Local Data Storage (SQLite)                            │  │
│  │  - Offline Scheduling Engine                              │  │
│  │  - Sensor Data Collection & Processing                    │  │
│  │  - Device Control Logic                                   │  │
│  │  - Cloud Sync Manager                                     │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐       │
│  │ Soil     │  │ Weather  │  │ Water    │  │ Light    │       │
│  │ Sensors  │  │ Sensors  │  │ Level    │  │ Sensors  │       │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘       │
│                                                                   │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐                      │
│  │ Valves   │  │ Pumps    │  │ Flow     │                      │
│  │          │  │          │  │ Meters   │                      │
│  └──────────┘  └──────────┘  └──────────┘                      │
└─────────────────────────────────────────────────────────────────┘
```

### Luồng dữ liệu chính

1. **Sensor → Cloud**: Cảm biến → Edge Controller → Message Queue → Sensor Service → Database
2. **Cloud → Actuator**: Dashboard → API Gateway → Irrigation Service → Message Queue → Edge Controller → Valves/Pumps
3. **Offline Mode**: Cảm biến → Edge Controller → Local Storage → Local Scheduling → Valves/Pumps

### Công nghệ stack đề xuất

**Edge Layer:**
- Hardware: Raspberry Pi 4 / ESP32
- OS: Raspberry Pi OS Lite / FreeRTOS
- Language: Python 3.11+ / C++
- Local DB: SQLite
- Communication: MQTT, Modbus RTU

**Application Layer:**
- Container: Docker, Kubernetes
- API Gateway: Kong / Nginx
- Microservices: Node.js (TypeScript) / Python (FastAPI)
- Message Queue: RabbitMQ / Apache Kafka
- Databases: PostgreSQL (relational), MongoDB (time-series), Redis (cache)
- Authentication: JWT, OAuth 2.0

**Presentation Layer:**
- Web: React.js / Vue.js
- Mobile: React Native / Flutter
- State Management: Redux / Zustand
- API Client: Axios / Fetch API

**DevOps:**
- CI/CD: GitHub Actions / GitLab CI
- Container Registry: Docker Hub / AWS ECR
- Orchestration: Kubernetes (K8s)
- Monitoring: Prometheus + Grafana
- Logging: ELK Stack (Elasticsearch, Logstash, Kibana)

## Các thành phần và giao diện (Components and Interfaces)

### 1. Edge Controller (Bộ điều khiển biên)

**Trách nhiệm:**
- Thu thập dữ liệu từ cảm biến mỗi 5 phút
- Xử lý và lọc nhiễu dữ liệu cảm biến
- Lưu trữ dữ liệu cục bộ khi offline
- Thực thi lịch trình tưới tự động
- Điều khiển van nước và máy bơm
- Đồng bộ dữ liệu với cloud khi có kết nối

**Interfaces:**
```typescript
interface IEdgeController {
  // Sensor management
  registerSensor(sensor: SensorConfig): Promise<void>;
  readSensorData(sensorId: string): Promise<SensorReading>;
  calibrateSensor(sensorId: string, calibrationData: CalibrationData): Promise<void>;
  
  // Device control
  openValve(valveId: string, flowRate: number): Promise<boolean>;
  closeValve(valveId: string): Promise<boolean>;
  startPump(pumpId: string, flowRate: number): Promise<boolean>;
  stopPump(pumpId: string): Promise<boolean>;
  
  // Scheduling
  loadSchedule(schedule: IrrigationSchedule): Promise<void>;
  executeSchedule(): Promise<void>;
  
  // Data sync
  syncToCloud(): Promise<SyncResult>;
  receiveCloudCommand(command: Command): Promise<void>;
}
```

### 2. API Gateway

**Trách nhiệm:**
- Xác thực và phân quyền người dùng
- Định tuyến request đến microservice phù hợp
- Rate limiting và load balancing
- Logging và monitoring
- API versioning

**Interfaces:**
```typescript
interface IAPIGateway {
  // Authentication
  login(credentials: LoginCredentials): Promise<AuthToken>;
  refreshToken(token: string): Promise<AuthToken>;
  logout(token: string): Promise<void>;
  
  // Request routing
  route(request: APIRequest): Promise<APIResponse>;
  
  // Authorization
  authorize(token: string, resource: string, action: string): Promise<boolean>;
}
```

### 3. Sensor Service

**Trách nhiệm:**
- Nhận và lưu trữ dữ liệu cảm biến từ edge
- Validate và chuẩn hóa dữ liệu
- Phát hiện bất thường trong dữ liệu
- Cung cấp API truy vấn dữ liệu lịch sử
- Tính toán thống kê và xu hướng

**Interfaces:**
```typescript
interface ISensorService {
  // Data ingestion
  ingestSensorData(data: SensorReading[]): Promise<void>;
  
  // Data retrieval
  getSensorData(sensorId: string, timeRange: TimeRange): Promise<SensorReading[]>;
  getLatestReading(sensorId: string): Promise<SensorReading>;
  
  // Analytics
  detectAnomalies(sensorId: string): Promise<Anomaly[]>;
  calculateStatistics(sensorId: string, timeRange: TimeRange): Promise<Statistics>;
}
```

### 4. Irrigation Service

**Trách nhiệm:**
- Tính toán nhu cầu nước cho từng vùng tưới
- Lập lịch trình tưới tự động
- Quản lý xung đột tài nguyên
- Tối ưu hóa thời gian tưới
- Gửi lệnh điều khiển đến edge controller

**Interfaces:**
```typescript
interface IIrrigationService {
  // Water demand calculation
  calculateWaterDemand(zoneId: string): Promise<WaterDemand>;
  
  // Scheduling
  createSchedule(zoneId: string, demand: WaterDemand): Promise<IrrigationSchedule>;
  optimizeSchedule(schedules: IrrigationSchedule[]): Promise<IrrigationSchedule[]>;
  resolveConflicts(schedules: IrrigationSchedule[]): Promise<IrrigationSchedule[]>;
  
  // Execution
  executeSchedule(scheduleId: string): Promise<ExecutionResult>;
  manualControl(command: ManualCommand): Promise<boolean>;
  
  // Resource management
  checkWaterAvailability(): Promise<WaterAvailability>;
  activateConservationMode(): Promise<void>;
}
```

### 5. Weather Service

**Trách nhiệm:**
- Tích hợp với API dự báo thời tiết bên ngoài
- Lưu trữ dữ liệu dự báo 7 ngày
- Tính toán tỷ lệ thoát hơi nước (ET)
- Cung cấp dữ liệu thời tiết cho irrigation service

**Interfaces:**
```typescript
interface IWeatherService {
  // External API integration
  fetchForecast(location: Location): Promise<WeatherForecast>;
  
  // Data storage
  storeForecast(forecast: WeatherForecast): Promise<void>;
  getForecast(location: Location, days: number): Promise<WeatherForecast>;
  
  // Calculations
  calculateEvapotranspiration(weather: WeatherData, cropType: string): Promise<number>;
  
  // Alerts
  checkRainPrediction(location: Location, hours: number): Promise<RainPrediction>;
}
```

### 6. Alert Service

**Trách nhiệm:**
- Tạo và quản lý cảnh báo
- Phân loại mức độ ưu tiên cảnh báo
- Gửi thông báo đến người dùng (push, email, SMS)
- Theo dõi trạng thái xử lý cảnh báo

**Interfaces:**
```typescript
interface IAlertService {
  // Alert creation
  createAlert(alert: Alert): Promise<string>;
  
  // Alert management
  getAlerts(filter: AlertFilter): Promise<Alert[]>;
  acknowledgeAlert(alertId: string, note: string): Promise<void>;
  resolveAlert(alertId: string): Promise<void>;
  
  // Notification
  sendNotification(userId: string, alert: Alert): Promise<void>;
  
  // Rules
  configureAlertRules(rules: AlertRule[]): Promise<void>;
}
```

### 7. User Service

**Trách nhiệm:**
- Quản lý tài khoản người dùng
- Xác thực và phân quyền
- Quản lý vai trò và quyền hạn
- Lưu trữ preferences người dùng

**Interfaces:**
```typescript
interface IUserService {
  // User management
  createUser(user: User): Promise<string>;
  updateUser(userId: string, updates: Partial<User>): Promise<void>;
  deleteUser(userId: string): Promise<void>;
  getUser(userId: string): Promise<User>;
  
  // Authentication
  authenticate(credentials: LoginCredentials): Promise<AuthToken>;
  validateToken(token: string): Promise<boolean>;
  
  // Authorization
  assignRole(userId: string, role: Role): Promise<void>;
  checkPermission(userId: string, resource: string, action: string): Promise<boolean>;
}
```

### 8. Device Service

**Trách nhiệm:**
- Đăng ký và quản lý thiết bị IoT
- Theo dõi trạng thái thiết bị
- Quản lý firmware và cập nhật OTA
- Lưu trữ cấu hình thiết bị

**Interfaces:**
```typescript
interface IDeviceService {
  // Device registration
  registerDevice(device: Device): Promise<string>;
  authenticateDevice(deviceId: string, secret: string): Promise<boolean>;
  
  // Device management
  getDevice(deviceId: string): Promise<Device>;
  updateDeviceStatus(deviceId: string, status: DeviceStatus): Promise<void>;
  
  // Firmware management
  uploadFirmware(firmware: Firmware): Promise<string>;
  deployFirmware(deviceId: string, firmwareId: string): Promise<void>;
  
  // Configuration
  getDeviceConfig(deviceId: string): Promise<DeviceConfig>;
  updateDeviceConfig(deviceId: string, config: DeviceConfig): Promise<void>;
}
```

### 9. Analytics Service

**Trách nhiệm:**
- Phân tích dữ liệu lịch sử
- Tính toán hiệu quả sử dụng nước
- Dự đoán xu hướng
- Đề xuất tối ưu hóa

**Interfaces:**
```typescript
interface IAnalyticsService {
  // Historical analysis
  analyzeWaterUsage(zoneId: string, timeRange: TimeRange): Promise<WaterUsageAnalysis>;
  comparezones(zoneIds: string[], timeRange: TimeRange): Promise<ComparisonReport>;
  
  // Predictions
  predictWaterDemand(zoneId: string, days: number): Promise<Prediction>;
  
  // Recommendations
  generateRecommendations(zoneId: string): Promise<Recommendation[]>;
}
```

### 10. Report Service

**Trách nhiệm:**
- Tạo báo cáo theo yêu cầu
- Xuất báo cáo dạng PDF/CSV
- Lập lịch báo cáo tự động
- Tạo biểu đồ và visualization

**Interfaces:**
```typescript
interface IReportService {
  // Report generation
  generateReport(config: ReportConfig): Promise<Report>;
  exportReport(reportId: string, format: 'PDF' | 'CSV'): Promise<Buffer>;
  
  // Scheduled reports
  scheduleReport(config: ReportConfig, schedule: CronExpression): Promise<string>;
  
  // Visualization
  generateChart(data: ChartData, type: ChartType): Promise<Chart>;
}
```

## Mô hình dữ liệu (Data Models)

### Core Entities

```typescript
// Sensor Reading
interface SensorReading {
  id: string;
  sensorId: string;
  timestamp: Date;
  type: 'temperature' | 'soil_moisture' | 'ph' | 'light' | 'co2' | 'water_level';
  value: number;
  unit: string;
  quality: 'good' | 'degraded' | 'invalid';
  metadata?: Record<string, any>;
}

// Irrigation Zone
interface IrrigationZone {
  id: string;
  name: string;
  farmId: string;
  area: number; // m²
  cropType: string;
  growthStage: 'seedling' | 'vegetative' | 'flowering' | 'fruiting' | 'harvest';
  soilType: string;
  priority: number; // 1-10, higher = more important
  sensors: string[]; // sensor IDs
  actuators: string[]; // valve/pump IDs
  configuration: ZoneConfiguration;
}

// Irrigation Schedule
interface IrrigationSchedule {
  id: string;
  zoneId: string;
  startTime: Date;
  duration: number; // minutes
  flowRate: number; // liters/minute
  waterAmount: number; // liters
  status: 'pending' | 'active' | 'completed' | 'cancelled' | 'failed';
  isManual: boolean;
  createdBy: string;
  executedAt?: Date;
  completedAt?: Date;
}

// Water Demand
interface WaterDemand {
  zoneId: string;
  calculatedAt: Date;
  currentMoisture: number;
  targetMoisture: number;
  deficit: number; // liters
  evapotranspiration: number; // mm/day
  rainfall: number; // mm (predicted)
  adjustedDemand: number; // liters (after considering rain)
}

// Device
interface Device {
  id: string;
  type: 'sensor' | 'valve' | 'pump' | 'controller';
  model: string;
  firmwareVersion: string;
  status: 'online' | 'offline' | 'maintenance' | 'error';
  lastSeen: Date;
  location: Location;
  configuration: DeviceConfig;
  metadata: Record<string, any>;
}

// Alert
interface Alert {
  id: string;
  type: 'sensor_error' | 'device_offline' | 'threshold_exceeded' | 'low_water' | 'system_error';
  severity: 'low' | 'medium' | 'high' | 'critical';
  title: string;
  message: string;
  source: string; // device/sensor ID
  createdAt: Date;
  acknowledgedAt?: Date;
  acknowledgedBy?: string;
  resolvedAt?: Date;
  notes?: string;
}

// User
interface User {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: 'farmer' | 'manager' | 'agronomist' | 'technician' | 'admin';
  permissions: Permission[];
  farms: string[]; // farm IDs
  preferences: UserPreferences;
  createdAt: Date;
  lastLogin?: Date;
}

// Weather Forecast
interface WeatherForecast {
  location: Location;
  timestamp: Date;
  forecasts: DailyForecast[];
}

interface DailyForecast {
  date: Date;
  temperature: { min: number; max: number; avg: number };
  humidity: number; // %
  rainfall: number; // mm
  windSpeed: number; // km/h
  solarRadiation: number; // MJ/m²/day
}

// Location
interface Location {
  latitude: number;
  longitude: number;
  altitude?: number;
  address?: string;
}
```

### Database Schema

**PostgreSQL (Relational Data):**
- users
- devices
- irrigation_zones
- irrigation_schedules
- alerts
- farms
- roles_permissions

**MongoDB (Time-Series Data):**
- sensor_readings (partitioned by month)
- device_logs
- irrigation_history
- weather_data

**Redis (Cache & Real-time):**
- active_sessions
- device_status
- latest_sensor_readings
- rate_limiting_counters


## Thuộc tính đúng đắn (Correctness Properties)

*A property is a characteristic or behavior that should hold true across all valid executions of a system-essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.*

### Property 1: Sensor data collection frequency

*For any* cảm biến môi trường được đăng ký trong hệ thống, dữ liệu phải được thu thập với interval 5 phút (±30 giây tolerance)
**Validates: Requirements 1.1**

### Property 2: Sensor data processing pipeline

*For any* dữ liệu cảm biến thô được thu thập, dữ liệu đã lưu trữ phải đã qua hiệu chuẩn và lọc nhiễu (round-trip: raw → process → stored)
**Validates: Requirements 1.2**

### Property 3: Invalid sensor data handling

*For any* giá trị cảm biến nằm ngoài phạm vi hợp lệ, hệ thống phải tạo log entry và đánh dấu cảm biến với maintenance flag
**Validates: Requirements 1.3**

### Property 4: Cloud synchronization timing

*For any* dữ liệu được lưu trữ cục bộ, khi kết nối Internet available, dữ liệu phải được đồng bộ lên cloud trong vòng 1 phút
**Validates: Requirements 1.4**

### Property 5: Offline operation continuity

*For any* lịch trình tưới đã được lập, khi mất kết nối Internet, bộ điều khiển phải tiếp tục thực thi lịch trình và lưu dữ liệu local
**Validates: Requirements 1.5**

### Property 6: Weather data completeness

*For any* dữ liệu dự báo thời tiết được truy xuất, hệ thống phải lưu trữ đầy đủ nhiệt độ, lượng mưa, và độ ẩm không khí cho 7 ngày
**Validates: Requirements 2.2**

### Property 7: Rain-based schedule adjustment

*For any* lịch trình tưới đã lập, khi dự báo có mưa lớn trong 24h, lịch trình phải được cancel hoặc postpone
**Validates: Requirements 2.3**

### Property 8: Weather service fallback

*For any* request dự báo thời tiết, khi external service unavailable, hệ thống phải sử dụng cached forecast data gần nhất
**Validates: Requirements 2.4**

### Property 9: Crop configuration persistence

*For any* thông tin cây trồng được cấu hình, tất cả fields (loại cây, giai đoạn sinh trưởng, hệ số ET) phải được lưu trữ đầy đủ
**Validates: Requirements 3.1**

### Property 10: Water demand calculation inputs

*For any* calculation nhu cầu nước, function phải sử dụng tất cả inputs: độ ẩm đất, loại cây, giai đoạn sinh trưởng, và weather forecast
**Validates: Requirements 3.2**

### Property 11: Moisture deficit calculation

*For any* vùng tưới có độ ẩm đất thấp hơn ngưỡng minimum, water deficit phải được tính toán và > 0
**Validates: Requirements 3.3**

### Property 12: ET coefficient adjustment

*For any* điều kiện nhiệt độ cao và độ ẩm không khí thấp, hệ số thoát hơi nước phải được tăng lên so với baseline
**Validates: Requirements 3.4**

### Property 13: Schedule completeness

*For any* nhu cầu nước được xác định, lịch trình tưới được tạo phải chứa start time, duration, và flow rate
**Validates: Requirements 4.1**

### Property 14: Resource conflict resolution

*For any* tập hợp schedules có overlapping time windows, schedules cuối cùng không được có xung đột về tài nguyên (water, pumps)
**Validates: Requirements 4.2**

### Property 15: Zone prioritization under scarcity

*For any* scenario nguồn nước không đủ, các vùng có priority cao hơn phải nhận được water allocation trước
**Validates: Requirements 4.3**

### Property 16: Schedule conflict detection

*For any* schedule mới được tạo, hệ thống phải kiểm tra conflicts với existing schedules trước khi save
**Validates: Requirements 4.4**

### Property 17: Optimal irrigation timing

*For any* schedule được tạo tự động, start time phải ưu tiên nằm trong time windows 5-8h hoặc 17-19h
**Validates: Requirements 4.5**

### Property 18: Scheduled valve control

*For any* schedule có start time đến, valve command phải được gửi đến đúng zone trong vòng 10 giây
**Validates: Requirements 5.1**

### Property 19: Pump-valve coordination

*For any* valve được mở, pump phải được activated với flow rate tương ứng trong vòng 5 giây
**Validates: Requirements 5.2**

### Property 20: Irrigation completion cleanup

*For any* irrigation session, khi duration expires, cả valve và pump phải được turned off
**Validates: Requirements 5.3**


### Property 21: Command retry mechanism

*For any* device command không nhận được acknowledgment trong 10 giây, command phải được retry tối đa 3 lần
**Validates: Requirements 5.4**

### Property 22: Device failure alerting

*For any* device không response sau 3 retry attempts, alert phải được tạo và logged
**Validates: Requirements 5.5**

### Property 23: Authentication token generation

*For any* valid login credentials, API Gateway phải trả về JWT token có expiration time
**Validates: Requirements 6.1**

### Property 24: Manual control latency

*For any* manual control command từ dashboard, command phải đến edge controller trong vòng 5 giây
**Validates: Requirements 6.2**

### Property 25: Manual override tagging

*For any* schedule được ghi đè thủ công, schedule mới phải có isManual flag = true
**Validates: Requirements 6.3**

### Property 26: Dashboard data freshness

*For any* device status request, data được hiển thị phải có timestamp trong vòng 1 phút
**Validates: Requirements 6.4**

### Property 27: Authorization enforcement

*For any* request từ user không có quyền, API Gateway phải trả về HTTP 403
**Validates: Requirements 6.5**

### Property 28: Water source configuration completeness

*For any* water source được cấu hình, tất cả fields (capacity, current level, pump rate) phải được lưu trữ
**Validates: Requirements 7.1**

### Property 29: Water level update frequency

*For any* water level sensor, readings phải được cập nhật mỗi 10 phút (±1 phút tolerance)
**Validates: Requirements 7.2**

### Property 30: Low water alerting

*For any* water source có level < 20% capacity, alert phải được tạo và notification sent
**Validates: Requirements 7.3**

### Property 31: Conservation mode activation

*For any* scenario water availability không đủ cho all zones, conservation mode phải được activated
**Validates: Requirements 7.4**

### Property 32: Water reduction in conservation mode

*For any* non-priority zone khi conservation mode active, water allocation phải được giảm 30%
**Validates: Requirements 7.5**

### Property 33: Threshold-based alert creation

*For any* environmental parameter vượt configured threshold, alert phải được tạo với appropriate severity level
**Validates: Requirements 8.1**

### Property 34: Alert notification latency

*For any* alert được tạo, notification phải được gửi đến dashboard và mobile app trong vòng 30 giây
**Validates: Requirements 8.2**

### Property 35: Sensor timeout detection

*For any* sensor không gửi data trong 15 phút, sensor error alert phải được tạo
**Validates: Requirements 8.3**

### Property 36: Device malfunction alerting

*For any* valve hoặc pump không hoạt động correctly, device error alert phải được tạo
**Validates: Requirements 8.4**

### Property 37: Alert acknowledgment tracking

*For any* alert được acknowledged bởi user, alert status phải được updated và note được lưu
**Validates: Requirements 8.5**

### Property 38: Report time range filtering

*For any* report request với time range, report data phải chỉ chứa records trong time range đó
**Validates: Requirements 9.1**

### Property 39: Report chart completeness

*For any* report được generated, report phải chứa charts cho temperature, soil moisture, water usage, và irrigation count
**Validates: Requirements 9.2**

### Property 40: Report export format validity

*For any* report được export, file output phải có valid PDF hoặc CSV format và complete data
**Validates: Requirements 9.3**

### Property 41: Zone comparison visualization

*For any* comparison request với multiple zones, comparison chart phải được generated với water efficiency metrics
**Validates: Requirements 9.5**

### Property 42: Device registration uniqueness

*For any* device được registered, device phải nhận unique ID và unique security key
**Validates: Requirements 10.1**

### Property 43: Device authentication

*For any* device connection attempt, authentication phải verify security key trước khi allow communication
**Validates: Requirements 10.2**

### Property 44: User role assignment

*For any* user account được tạo, user phải được assigned một role (farmer, manager, agronomist, technician, admin)
**Validates: Requirements 10.4**

### Property 45: Role-based access control

*For any* resource access attempt, API Gateway phải verify user permissions based on role trước khi allow
**Validates: Requirements 10.5**

### Property 46: Microservice fault isolation

*For any* microservice failure, other microservices phải continue operating normally
**Validates: Requirements 11.2**

### Property 47: Command execution latency

*For any* control command từ dashboard, edge controller phải execute command trong vòng 5 giây
**Validates: Requirements 13.1**

### Property 48: API response time

*For any* data request đến API Gateway, response phải được trả về trong vòng 1 phút
**Validates: Requirements 13.2**

### Property 49: Data accuracy preservation

*For any* batch sensor readings được collected, ít nhất 99.9% phải được stored correctly without corruption
**Validates: Requirements 13.3**

### Property 50: Offline schedule execution

*For any* pre-loaded schedule, khi offline, edge controller phải execute schedule đúng thời gian
**Validates: Requirements 14.1**

### Property 51: Offline data persistence

*For any* sensor reading khi offline, data phải được stored locally với complete metadata
**Validates: Requirements 14.2**

### Property 52: Post-reconnection synchronization

*For any* locally stored data, sau khi reconnect, tất cả data phải được synced to cloud
**Validates: Requirements 14.3**

### Property 53: Sync conflict resolution

*For any* data conflict giữa local và cloud, conflict resolution logic phải được applied và data consistency maintained
**Validates: Requirements 14.4**

### Property 54: Local storage cleanup

*For any* local storage reaching 80% capacity, oldest synced data phải được deleted để free space
**Validates: Requirements 14.5**

### Property 55: JWT token generation

*For any* successful login, JWT token phải được generated với valid expiration time
**Validates: Requirements 15.1**

### Property 56: Token validation middleware

*For any* API request, JWT token phải được validated trước khi request reaches microservice
**Validates: Requirements 15.2**

### Property 57: Sensitive data encryption

*For any* sensitive data được stored (passwords, keys), data phải được encrypted trong database
**Validates: Requirements 15.4**

### Property 58: Brute-force protection

*For any* account với 5+ failed login attempts trong 5 phút, account phải được locked trong 15 phút
**Validates: Requirements 15.5**


## Xử lý lỗi (Error Handling)

### Chiến lược xử lý lỗi tổng thể

Hệ thống áp dụng chiến lược "fail-safe" với các nguyên tắc:

1. **Graceful Degradation**: Khi một thành phần gặp lỗi, hệ thống giảm chức năng nhưng vẫn duy trì hoạt động cốt lõi
2. **Retry with Exponential Backoff**: Các lỗi tạm thời được retry với delay tăng dần
3. **Circuit Breaker**: Ngăn chặn cascade failures bằng cách tạm dừng requests đến services đang lỗi
4. **Fallback Mechanisms**: Sử dụng cached data hoặc default values khi services không available

### Xử lý lỗi theo layer

**Edge Layer:**
- Sensor read failures → Log error, use last known good value, set quality flag
- Device control failures → Retry 3 times, create alert if persistent
- Network disconnection → Switch to offline mode, queue data locally
- Storage full → Delete oldest synced data, create warning alert

**Application Layer:**
- Microservice unavailable → Return cached data if available, otherwise HTTP 503
- Database connection lost → Retry with exponential backoff, use read replicas
- Message queue full → Apply backpressure, reject new messages with HTTP 429
- External API timeout → Use cached data, log warning

**Presentation Layer:**
- API request failed → Show user-friendly error message, retry button
- Real-time connection lost → Show offline indicator, queue actions locally
- Invalid user input → Show validation errors inline, prevent submission

### Error codes và responses

```typescript
enum ErrorCode {
  // Client errors (4xx)
  INVALID_INPUT = 'ERR_INVALID_INPUT',
  UNAUTHORIZED = 'ERR_UNAUTHORIZED',
  FORBIDDEN = 'ERR_FORBIDDEN',
  NOT_FOUND = 'ERR_NOT_FOUND',
  CONFLICT = 'ERR_CONFLICT',
  RATE_LIMITED = 'ERR_RATE_LIMITED',
  
  // Server errors (5xx)
  INTERNAL_ERROR = 'ERR_INTERNAL',
  SERVICE_UNAVAILABLE = 'ERR_SERVICE_UNAVAILABLE',
  DATABASE_ERROR = 'ERR_DATABASE',
  EXTERNAL_SERVICE_ERROR = 'ERR_EXTERNAL_SERVICE',
  
  // Domain errors
  SENSOR_ERROR = 'ERR_SENSOR',
  DEVICE_OFFLINE = 'ERR_DEVICE_OFFLINE',
  INSUFFICIENT_WATER = 'ERR_INSUFFICIENT_WATER',
  SCHEDULE_CONFLICT = 'ERR_SCHEDULE_CONFLICT',
}

interface ErrorResponse {
  code: ErrorCode;
  message: string;
  details?: any;
  timestamp: Date;
  requestId: string;
}
```

### Logging và monitoring

- **Structured Logging**: Tất cả logs theo format JSON với correlation IDs
- **Log Levels**: ERROR (requires action), WARN (potential issue), INFO (important events), DEBUG (detailed info)
- **Distributed Tracing**: Sử dụng OpenTelemetry để trace requests across microservices
- **Metrics Collection**: Prometheus metrics cho latency, error rates, throughput
- **Alerting Rules**: Tự động alert khi error rate > 5%, latency > p95 threshold

## Chiến lược kiểm thử (Testing Strategy)

### Dual Testing Approach

Hệ thống sử dụng kết hợp Unit Testing và Property-Based Testing để đảm bảo correctness toàn diện:

- **Unit Tests**: Verify specific examples, edge cases, và error conditions
- **Property Tests**: Verify universal properties across all valid inputs
- Cả hai loại tests đều quan trọng và bổ sung cho nhau

### Property-Based Testing

**Framework**: 
- JavaScript/TypeScript: **fast-check**
- Python: **Hypothesis**

**Configuration**:
- Mỗi property test phải chạy minimum **100 iterations**
- Mỗi property test phải có comment tag: `**Feature: smart-irrigation-iot, Property {number}: {property_text}**`
- Mỗi correctness property phải được implement bởi ĐÚNG MỘT property-based test

**Example Property Test Structure**:

```typescript
import fc from 'fast-check';

/**
 * Feature: smart-irrigation-iot, Property 1: Sensor data collection frequency
 * For any cảm biến môi trường được đăng ký trong hệ thống, 
 * dữ liệu phải được thu thập với interval 5 phút (±30 giây tolerance)
 */
describe('Property 1: Sensor data collection frequency', () => {
  it('should collect sensor data every 5 minutes', () => {
    fc.assert(
      fc.property(
        fc.record({
          sensorId: fc.uuid(),
          sensorType: fc.constantFrom('temperature', 'soil_moisture', 'ph'),
          collectionInterval: fc.integer({ min: 270, max: 330 }) // 4.5-5.5 minutes in seconds
        }),
        async (sensor) => {
          // Test implementation
          const readings = await collectSensorData(sensor, 15); // 15 minutes
          const intervals = calculateIntervals(readings);
          
          // All intervals should be ~5 minutes (±30 seconds)
          intervals.forEach(interval => {
            expect(interval).toBeGreaterThanOrEqual(270);
            expect(interval).toBeLessThanOrEqual(330);
          });
        }
      ),
      { numRuns: 100 }
    );
  });
});
```

### Unit Testing

**Framework**:
- JavaScript/TypeScript: **Jest** hoặc **Vitest**
- Python: **pytest**

**Coverage Requirements**:
- Core business logic: 90%+ coverage
- API endpoints: 80%+ coverage
- Utility functions: 85%+ coverage

**Unit Test Categories**:

1. **Component Tests**: Test individual functions/classes
2. **Integration Tests**: Test interaction between components
3. **API Tests**: Test REST endpoints với different scenarios
4. **Edge Case Tests**: Test boundary conditions và special cases

**Example Unit Test**:

```typescript
describe('IrrigationService', () => {
  describe('calculateWaterDemand', () => {
    it('should calculate water demand for zone with low moisture', async () => {
      const zone = createTestZone({ currentMoisture: 30, targetMoisture: 60 });
      const demand = await irrigationService.calculateWaterDemand(zone.id);
      
      expect(demand.deficit).toBeGreaterThan(0);
      expect(demand.adjustedDemand).toBeDefined();
    });
    
    it('should return zero demand when moisture is adequate', async () => {
      const zone = createTestZone({ currentMoisture: 65, targetMoisture: 60 });
      const demand = await irrigationService.calculateWaterDemand(zone.id);
      
      expect(demand.deficit).toBe(0);
    });
    
    it('should throw error for invalid zone ID', async () => {
      await expect(
        irrigationService.calculateWaterDemand('invalid-id')
      ).rejects.toThrow('Zone not found');
    });
  });
});
```

### End-to-End Testing

**Framework**: **Playwright** (web), **Detox** (mobile)

**Test Scenarios**:
- User login và authentication flow
- Complete irrigation cycle: schedule creation → execution → completion
- Alert creation và notification delivery
- Report generation và export
- Manual override của automatic schedules

### Performance Testing

**Tools**: **k6** hoặc **Artillery**

**Test Types**:
- Load testing: Simulate normal traffic patterns
- Stress testing: Find breaking points
- Spike testing: Sudden traffic increases
- Endurance testing: Sustained load over time

**Key Metrics**:
- API response time: p50, p95, p99
- Throughput: requests per second
- Error rate: percentage of failed requests
- Resource utilization: CPU, memory, network

### Testing in CI/CD Pipeline

**Pre-commit**:
- Linting (ESLint, Pylint)
- Type checking (TypeScript, mypy)
- Unit tests for changed files

**Pull Request**:
- All unit tests
- Integration tests
- Property-based tests
- Code coverage check

**Pre-deployment**:
- Full test suite
- E2E tests on staging
- Performance tests
- Security scans

## Deployment và DevOps

### Container Strategy

Mỗi microservice được containerized với Docker:

```dockerfile
# Example Dockerfile for Node.js microservice
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

FROM node:18-alpine
WORKDIR /app
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
EXPOSE 3000
CMD ["node", "dist/index.js"]
```

### Kubernetes Deployment

**Resources**:
- Deployments: Stateless microservices
- StatefulSets: Databases, message queues
- Services: Internal communication
- Ingress: External access via API Gateway
- ConfigMaps: Configuration
- Secrets: Sensitive data (encrypted)

**Scaling Strategy**:
- Horizontal Pod Autoscaler (HPA): Scale based on CPU/memory
- Vertical Pod Autoscaler (VPA): Adjust resource requests
- Cluster Autoscaler: Add/remove nodes as needed

### CI/CD Pipeline

**Tools**: GitHub Actions / GitLab CI

**Pipeline Stages**:

1. **Build**:
   - Checkout code
   - Install dependencies
   - Run linters và type checkers
   - Build artifacts

2. **Test**:
   - Run unit tests
   - Run integration tests
   - Run property-based tests
   - Generate coverage reports
   - Run security scans (Snyk, Trivy)

3. **Package**:
   - Build Docker images
   - Tag with version và commit SHA
   - Push to container registry
   - Scan images for vulnerabilities

4. **Deploy to Staging**:
   - Apply Kubernetes manifests
   - Run database migrations
   - Run smoke tests
   - Run E2E tests

5. **Deploy to Production**:
   - Blue-green deployment hoặc Canary release
   - Gradual traffic shift
   - Monitor metrics và error rates
   - Automatic rollback on failures

### Monitoring và Observability

**Metrics** (Prometheus + Grafana):
- System metrics: CPU, memory, disk, network
- Application metrics: Request rate, latency, errors
- Business metrics: Irrigation events, water usage, alerts

**Logging** (ELK Stack):
- Centralized log aggregation
- Structured JSON logs
- Log retention: 30 days hot, 90 days cold

**Tracing** (Jaeger):
- Distributed request tracing
- Service dependency mapping
- Performance bottleneck identification

**Alerting** (Prometheus Alertmanager):
- Critical: Page on-call engineer
- Warning: Create ticket
- Info: Log for review

### Security Measures

- **Network Policies**: Restrict pod-to-pod communication
- **RBAC**: Role-based access control trong Kubernetes
- **Secrets Management**: HashiCorp Vault hoặc AWS Secrets Manager
- **Image Scanning**: Scan containers for vulnerabilities
- **TLS Everywhere**: Encrypt all network traffic
- **API Rate Limiting**: Prevent abuse
- **WAF**: Web Application Firewall cho external traffic

