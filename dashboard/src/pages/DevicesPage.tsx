import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Add, CloudUpload } from '@mui/icons-material';
import { format } from 'date-fns';
import apiClient from '@/api/client';
import { Device } from '@/types';

export default function DevicesPage() {
  const [devices, setDevices] = useState<Device[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    type: 'sensor' as const,
    model: '',
    location: { latitude: 0, longitude: 0 },
  });

  useEffect(() => {
    fetchDevices();
  }, []);

  const fetchDevices = async () => {
    try {
      const response = await apiClient.get<Device[]>('/devices');
      setDevices(response.data);
    } catch (err) {
      console.error('Failed to fetch devices:', err);
    }
  };

  const handleRegister = async () => {
    try {
      await apiClient.post('/devices/register', formData);
      setOpenDialog(false);
      fetchDevices();
      setFormData({
        type: 'sensor',
        model: '',
        location: { latitude: 0, longitude: 0 },
      });
    } catch (err) {
      console.error('Failed to register device:', err);
    }
  };

  const getStatusColor = (status: string) => {
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

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Devices</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
          Register Device
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>ID</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Model</TableCell>
              <TableCell>Firmware</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Last Seen</TableCell>
              <TableCell>Location</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {devices.map((device) => (
              <TableRow key={device.id}>
                <TableCell>{device.id.substring(0, 8)}</TableCell>
                <TableCell>{device.type.toUpperCase()}</TableCell>
                <TableCell>{device.model}</TableCell>
                <TableCell>{device.firmwareVersion}</TableCell>
                <TableCell>
                  <Chip
                    label={device.status}
                    size="small"
                    color={getStatusColor(device.status) as any}
                  />
                </TableCell>
                <TableCell>{format(new Date(device.lastSeen), 'MMM dd, HH:mm')}</TableCell>
                <TableCell>
                  {device.location.latitude.toFixed(4)}, {device.location.longitude.toFixed(4)}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Register New Device</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Device Type</InputLabel>
              <Select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as any })}
                label="Device Type"
              >
                <MenuItem value="sensor">Sensor</MenuItem>
                <MenuItem value="valve">Valve</MenuItem>
                <MenuItem value="pump">Pump</MenuItem>
                <MenuItem value="controller">Controller</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Model"
              value={formData.model}
              onChange={(e) => setFormData({ ...formData, model: e.target.value })}
              fullWidth
            />
            <TextField
              label="Latitude"
              type="number"
              value={formData.location.latitude}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, latitude: Number(e.target.value) },
                })
              }
              fullWidth
            />
            <TextField
              label="Longitude"
              type="number"
              value={formData.location.longitude}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  location: { ...formData.location, longitude: Number(e.target.value) },
                })
              }
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleRegister} variant="contained">
            Register
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
