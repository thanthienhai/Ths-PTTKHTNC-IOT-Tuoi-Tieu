import { useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Card,
  CardContent,
  Chip,
  List,
  ListItem,
  ListItemText,
  CircularProgress,
} from '@mui/material';
import {
  Thermostat,
  WaterDrop,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material';
import { useDashboardStore } from '@/store/dashboardStore';
import { format } from 'date-fns';

export default function DashboardPage() {
  const {
    sensorReadings,
    devices,
    alerts,
    isLoading,
    lastUpdate,
    fetchDashboardData,
  } = useDashboardStore();

  useEffect(() => {
    fetchDashboardData();
    
    // Auto-refresh every minute
    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const getDeviceStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'success';
      case 'offline':
        return 'error';
      case 'maintenance':
        return 'warning';
      default:
        return 'default';
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
        return 'error';
      case 'high':
        return 'error';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  const getSensorIcon = (type: string) => {
    switch (type) {
      case 'temperature':
        return <Thermostat />;
      case 'soil_moisture':
        return <WaterDrop />;
      default:
        return <WaterDrop />;
    }
  };

  if (isLoading && !lastUpdate) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
        <CircularProgress />
      </Box>
    );
  }

  const onlineDevices = devices.filter((d) => d.status === 'online').length;
  const activeAlerts = alerts.filter((a) => !a.acknowledgedAt).length;

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Dashboard</Typography>
        {lastUpdate && (
          <Typography variant="body2" color="text.secondary">
            Last updated: {format(lastUpdate, 'HH:mm:ss')}
          </Typography>
        )}
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} mb={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Devices Online
                  </Typography>
                  <Typography variant="h4">
                    {onlineDevices}/{devices.length}
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Active Alerts
                  </Typography>
                  <Typography variant="h4">{activeAlerts}</Typography>
                </Box>
                <Warning color={activeAlerts > 0 ? 'error' : 'disabled'} sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Sensors
                  </Typography>
                  <Typography variant="h4">{sensorReadings.length}</Typography>
                </Box>
                <Thermostat color="primary" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    System Status
                  </Typography>
                  <Typography variant="h6" color="success.main">
                    Operational
                  </Typography>
                </Box>
                <CheckCircle color="success" sx={{ fontSize: 48 }} />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {/* Sensor Readings */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Latest Sensor Readings
            </Typography>
            <List>
              {sensorReadings.slice(0, 5).map((reading) => (
                <ListItem key={reading.id}>
                  <Box display="flex" alignItems="center" width="100%">
                    {getSensorIcon(reading.type)}
                    <Box ml={2} flexGrow={1}>
                      <Typography variant="body1">
                        {reading.type.replace('_', ' ').toUpperCase()}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        Sensor: {reading.sensorId}
                      </Typography>
                    </Box>
                    <Box textAlign="right">
                      <Typography variant="h6">
                        {reading.value} {reading.unit}
                      </Typography>
                      <Chip
                        label={reading.quality}
                        size="small"
                        color={reading.quality === 'good' ? 'success' : 'warning'}
                      />
                    </Box>
                  </Box>
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Device Status */}
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Device Status
            </Typography>
            <List>
              {devices.slice(0, 5).map((device) => (
                <ListItem key={device.id}>
                  <ListItemText
                    primary={`${device.type.toUpperCase()} - ${device.model}`}
                    secondary={`Last seen: ${format(new Date(device.lastSeen), 'HH:mm:ss')}`}
                  />
                  <Chip
                    label={device.status}
                    size="small"
                    color={getDeviceStatusColor(device.status) as any}
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* Active Alerts */}
        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Active Alerts
            </Typography>
            {alerts.length === 0 ? (
              <Box textAlign="center" py={3}>
                <CheckCircle color="success" sx={{ fontSize: 48, mb: 1 }} />
                <Typography color="text.secondary">No active alerts</Typography>
              </Box>
            ) : (
              <List>
                {alerts.slice(0, 5).map((alert) => (
                  <ListItem key={alert.id}>
                    <Box display="flex" alignItems="center" width="100%">
                      <ErrorIcon color={getAlertSeverityColor(alert.severity) as any} />
                      <Box ml={2} flexGrow={1}>
                        <Typography variant="body1">{alert.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {alert.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(alert.createdAt), 'MMM dd, HH:mm')}
                        </Typography>
                      </Box>
                      <Chip
                        label={alert.severity}
                        size="small"
                        color={getAlertSeverityColor(alert.severity) as any}
                      />
                    </Box>
                  </ListItem>
                ))}
              </List>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
