import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  IconButton,
  Alert,
} from '@mui/material';
import { PlayArrow, Stop, Edit, Delete } from '@mui/icons-material';
import { format } from 'date-fns';
import apiClient from '@/api/client';
import { IrrigationSchedule, IrrigationZone } from '@/types';

export default function IrrigationPage() {
  const [schedules, setSchedules] = useState<IrrigationSchedule[]>([]);
  const [zones, setZones] = useState<IrrigationZone[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedZone, setSelectedZone] = useState('');
  const [duration, setDuration] = useState(30);
  const [flowRate, setFlowRate] = useState(10);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchSchedules();
    fetchZones();
  }, []);

  const fetchSchedules = async () => {
    try {
      const response = await apiClient.get<IrrigationSchedule[]>('/irrigation/schedules');
      setSchedules(response.data);
    } catch (err) {
      console.error('Failed to fetch schedules:', err);
    }
  };

  const fetchZones = async () => {
    try {
      const response = await apiClient.get<IrrigationZone[]>('/zones');
      setZones(response.data);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    }
  };

  const handleManualControl = async (zoneId: string, action: 'start' | 'stop') => {
    try {
      await apiClient.post('/irrigation/manual', {
        zoneId,
        action,
        duration: action === 'start' ? duration : undefined,
        flowRate: action === 'start' ? flowRate : undefined,
      });
      setSuccess(`Manual ${action} command sent successfully`);
      fetchSchedules();
    } catch (err: any) {
      setError(err.response?.data?.message || `Failed to ${action} irrigation`);
    }
  };

  const handleCreateSchedule = async () => {
    if (!selectedZone) {
      setError('Please select a zone');
      return;
    }

    try {
      await apiClient.post('/irrigation/schedules', {
        zoneId: selectedZone,
        duration,
        flowRate,
        isManual: true,
      });
      setSuccess('Schedule created successfully');
      setOpenDialog(false);
      fetchSchedules();
      setSelectedZone('');
      setDuration(30);
      setFlowRate(10);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to create schedule');
    }
  };

  const handleCancelSchedule = async (scheduleId: string) => {
    try {
      await apiClient.patch(`/irrigation/schedules/${scheduleId}`, {
        status: 'cancelled',
      });
      setSuccess('Schedule cancelled successfully');
      fetchSchedules();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to cancel schedule');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'pending':
        return 'info';
      case 'completed':
        return 'default';
      case 'cancelled':
        return 'warning';
      case 'failed':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Irrigation Control</Typography>
        <Button variant="contained" onClick={() => setOpenDialog(true)}>
          Create Manual Schedule
        </Button>
      </Box>

      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {/* Quick Controls */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Quick Manual Control
        </Typography>
        <Box display="flex" gap={2} flexWrap="wrap">
          {zones.map((zone) => (
            <Box key={zone.id} display="flex" gap={1}>
              <Button
                variant="outlined"
                startIcon={<PlayArrow />}
                onClick={() => handleManualControl(zone.id, 'start')}
              >
                Start {zone.name}
              </Button>
              <Button
                variant="outlined"
                color="error"
                startIcon={<Stop />}
                onClick={() => handleManualControl(zone.id, 'stop')}
              >
                Stop
              </Button>
            </Box>
          ))}
        </Box>
      </Paper>

      {/* Schedules Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Zone</TableCell>
              <TableCell>Start Time</TableCell>
              <TableCell>Duration (min)</TableCell>
              <TableCell>Flow Rate (L/min)</TableCell>
              <TableCell>Water Amount (L)</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {schedules.map((schedule) => (
              <TableRow key={schedule.id}>
                <TableCell>{schedule.zoneName || schedule.zoneId}</TableCell>
                <TableCell>
                  {format(new Date(schedule.startTime), 'MMM dd, HH:mm')}
                </TableCell>
                <TableCell>{schedule.duration}</TableCell>
                <TableCell>{schedule.flowRate}</TableCell>
                <TableCell>{schedule.waterAmount}</TableCell>
                <TableCell>
                  <Chip
                    label={schedule.status}
                    size="small"
                    color={getStatusColor(schedule.status) as any}
                  />
                </TableCell>
                <TableCell>
                  <Chip
                    label={schedule.isManual ? 'Manual' : 'Auto'}
                    size="small"
                    variant="outlined"
                  />
                </TableCell>
                <TableCell>
                  {schedule.status === 'pending' && (
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleCancelSchedule(schedule.id)}
                    >
                      <Delete />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Create Schedule Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Create Manual Irrigation Schedule</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Zone</InputLabel>
              <Select
                value={selectedZone}
                onChange={(e) => setSelectedZone(e.target.value)}
                label="Zone"
              >
                {zones.map((zone) => (
                  <MenuItem key={zone.id} value={zone.id}>
                    {zone.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="Duration (minutes)"
              type="number"
              value={duration}
              onChange={(e) => setDuration(Number(e.target.value))}
              fullWidth
            />
            <TextField
              label="Flow Rate (L/min)"
              type="number"
              value={flowRate}
              onChange={(e) => setFlowRate(Number(e.target.value))}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleCreateSchedule} variant="contained">
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
