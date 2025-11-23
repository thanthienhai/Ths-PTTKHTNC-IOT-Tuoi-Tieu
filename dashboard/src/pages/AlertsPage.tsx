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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
} from '@mui/material';
import { CheckCircle } from '@mui/icons-material';
import { format } from 'date-fns';
import apiClient from '@/api/client';
import { Alert } from '@/types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [note, setNote] = useState('');

  useEffect(() => {
    fetchAlerts();
  }, []);

  const fetchAlerts = async () => {
    try {
      const response = await apiClient.get<Alert[]>('/alerts');
      setAlerts(response.data);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const handleAcknowledge = async () => {
    if (!selectedAlert) return;

    try {
      await apiClient.post(`/alerts/${selectedAlert.id}/acknowledge`, { note });
      setOpenDialog(false);
      setNote('');
      fetchAlerts();
    } catch (err) {
      console.error('Failed to acknowledge alert:', err);
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical':
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

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Alerts
      </Typography>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Severity</TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Message</TableCell>
              <TableCell>Source</TableCell>
              <TableCell>Created</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {alerts.map((alert) => (
              <TableRow key={alert.id}>
                <TableCell>
                  <Chip
                    label={alert.severity}
                    size="small"
                    color={getSeverityColor(alert.severity) as any}
                  />
                </TableCell>
                <TableCell>{alert.title}</TableCell>
                <TableCell>{alert.message}</TableCell>
                <TableCell>{alert.source}</TableCell>
                <TableCell>{format(new Date(alert.createdAt), 'MMM dd, HH:mm')}</TableCell>
                <TableCell>
                  {alert.acknowledgedAt ? (
                    <Chip label="Acknowledged" size="small" color="success" />
                  ) : (
                    <Chip label="Active" size="small" color="warning" />
                  )}
                </TableCell>
                <TableCell>
                  {!alert.acknowledgedAt && (
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => {
                        setSelectedAlert(alert);
                        setOpenDialog(true);
                      }}
                    >
                      <CheckCircle />
                    </IconButton>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Acknowledge Alert</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Typography variant="body2" gutterBottom>
              {selectedAlert?.message}
            </Typography>
            <TextField
              label="Notes"
              multiline
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              fullWidth
              sx={{ mt: 2 }}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAcknowledge} variant="contained">
            Acknowledge
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
