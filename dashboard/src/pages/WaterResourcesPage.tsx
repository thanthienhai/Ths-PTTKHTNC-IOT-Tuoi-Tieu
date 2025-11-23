import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardContent,
  LinearProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { Add, Opacity } from '@mui/icons-material';
import apiClient from '@/api/client';
import { WaterSource } from '@/types';

export default function WaterResourcesPage() {
  const [waterSources, setWaterSources] = useState<WaterSource[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    capacity: 0,
    currentLevel: 0,
    pumpRate: 0,
  });

  useEffect(() => {
    fetchWaterSources();
  }, []);

  const fetchWaterSources = async () => {
    try {
      const response = await apiClient.get<WaterSource[]>('/water-sources');
      setWaterSources(response.data);
    } catch (err) {
      console.error('Failed to fetch water sources:', err);
    }
  };

  const handleSave = async () => {
    try {
      await apiClient.post('/water-sources', formData);
      setOpenDialog(false);
      fetchWaterSources();
      setFormData({ name: '', capacity: 0, currentLevel: 0, pumpRate: 0 });
    } catch (err) {
      console.error('Failed to save water source:', err);
    }
  };

  const getWaterLevelColor = (percentage: number) => {
    if (percentage < 20) return 'error';
    if (percentage < 50) return 'warning';
    return 'success';
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Water Resources</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={() => setOpenDialog(true)}>
          Add Water Source
        </Button>
      </Box>

      <Grid container spacing={3}>
        {waterSources.map((source) => {
          const percentage = (source.currentLevel / source.capacity) * 100;
          return (
            <Grid item xs={12} md={6} key={source.id}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center" mb={2}>
                    <Opacity color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6">{source.name}</Typography>
                  </Box>
                  <Box mb={2}>
                    <Box display="flex" justifyContent="space-between" mb={1}>
                      <Typography variant="body2" color="text.secondary">
                        Water Level
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {source.currentLevel} / {source.capacity} L ({percentage.toFixed(1)}%)
                      </Typography>
                    </Box>
                    <LinearProgress
                      variant="determinate"
                      value={percentage}
                      color={getWaterLevelColor(percentage)}
                      sx={{ height: 10, borderRadius: 5 }}
                    />
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    Pump Rate: {source.pumpRate} L/min
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add Water Source</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Capacity (L)"
              type="number"
              value={formData.capacity}
              onChange={(e) => setFormData({ ...formData, capacity: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Current Level (L)"
              type="number"
              value={formData.currentLevel}
              onChange={(e) => setFormData({ ...formData, currentLevel: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Pump Rate (L/min)"
              type="number"
              value={formData.pumpRate}
              onChange={(e) => setFormData({ ...formData, pumpRate: Number(e.target.value) })}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
