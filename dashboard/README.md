# Smart Irrigation Dashboard

React-based web dashboard for monitoring and controlling the smart irrigation system.

## Features

- **Real-time Dashboard**: View sensor readings, device status, and active alerts
- **Irrigation Control**: Manual control of valves/pumps and schedule management
- **Zone Management**: Configure irrigation zones with crop types and growth stages
- **Water Resources**: Monitor water levels and manage water sources
- **Alert Management**: View and acknowledge system alerts
- **Reports**: Generate and export water usage and sensor data reports
- **Device Management**: Register and monitor IoT devices
- **User Management**: Create users and assign roles (admin only)

## Technology Stack

- React 18 with TypeScript
- Vite for fast development and building
- Material-UI (MUI) for UI components
- Zustand for state management
- React Router for navigation
- Recharts for data visualization
- Axios for API communication
- date-fns for date formatting

## Prerequisites

- Node.js 18+
- npm or yarn

## Development

1. Install dependencies:
```bash
cd dashboard
npm install
```

2. Create `.env` file:
```bash
cp .env.example .env
```

3. Configure API URL in `.env`:
```
VITE_API_URL=http://localhost:8080
VITE_WS_URL=ws://localhost:8080
```

4. Start development server:
```bash
npm run dev
```

The dashboard will be available at http://localhost:3000

## Build

Build for production:
```bash
npm run build
```

Preview production build:
```bash
npm run preview
```

## Docker

Build Docker image:
```bash
docker build -t smart-irrigation-dashboard .
```

Run container:
```bash
docker run -p 80:80 smart-irrigation-dashboard
```

## Project Structure

```
dashboard/
├── src/
│   ├── api/              # API client
│   ├── components/       # Reusable components
│   ├── pages/            # Page components
│   ├── store/            # State management
│   ├── types/            # TypeScript types
│   ├── App.tsx           # Main app component
│   ├── main.tsx          # Entry point
│   └── theme.ts          # MUI theme configuration
├── public/               # Static assets
├── Dockerfile            # Docker configuration
├── nginx.conf            # Nginx configuration
└── package.json          # Dependencies
```

## Features Implementation

### Authentication
- JWT token-based authentication
- Auto token refresh
- Protected routes
- Role-based access control

### Dashboard Home
- Real-time sensor readings (auto-refresh every minute)
- Device status overview
- Active alerts display
- System health indicators

### Irrigation Control
- View all irrigation schedules
- Create manual schedules
- Quick start/stop controls for zones
- Cancel pending schedules

### Zone Management
- Create/edit/delete irrigation zones
- Configure crop types and growth stages
- Set zone priorities
- Manage soil types

### Water Resources
- Monitor water source levels
- Visual indicators for low water
- Add new water sources
- Track pump rates

### Alerts
- View all system alerts
- Filter by severity
- Acknowledge alerts with notes
- Real-time alert updates

### Reports
- Generate water usage reports
- Sensor data visualization
- Export to PDF/CSV
- Custom date ranges

### Device Management
- Register new IoT devices
- Monitor device status
- View firmware versions
- Track last seen timestamps

### User Management (Admin Only)
- Create new users
- Assign roles
- Delete users
- View user information

## API Integration

The dashboard communicates with the API Gateway at `/api/*`. All requests include JWT authentication tokens.

Key endpoints:
- `/api/auth/login` - User authentication
- `/api/auth/refresh` - Token refresh
- `/api/sensors/latest` - Latest sensor readings
- `/api/devices` - Device management
- `/api/zones` - Zone management
- `/api/irrigation/*` - Irrigation control
- `/api/alerts` - Alert management
- `/api/reports/*` - Report generation
- `/api/users` - User management

## Environment Variables

- `VITE_API_URL` - API Gateway URL (default: http://localhost:8080)
- `VITE_WS_URL` - WebSocket URL for real-time updates (default: ws://localhost:8080)

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
