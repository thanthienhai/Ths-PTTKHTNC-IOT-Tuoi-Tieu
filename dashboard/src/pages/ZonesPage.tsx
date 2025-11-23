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
} from '@mui/material';
import { Edit, Delete, Add } from '@mui/icons-material';
import apiClient from '@/api/client';
import { IrrigationZone } from '@/types';

export default function ZonesPage() {
  const [zones, setZones] = useState<IrrigationZone[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingZone, setEditingZone] = useState<IrrigationZone | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    area: 0,
    cropType: '',
    growthStage: 'seedling' as const,
    soilType: '',
    priority: 5,
  });

  useEffect(() => {
    fetchZones();
  }, []);

  const fetchZones = async () => {
    try {
      const response = await apiClient.get<IrrigationZone[]>('/zones');
      setZones(response.data);
    } catch (err) {
      console.error('Failed to fetch zones:', err);
    }
  };

  const handleSave = async () => {
    try {
      if (editingZone) {
        await apiClient.put(`/zones/${editingZone.id}`, formData);
      } else {
        await apiClient.post('/zones', formData);
      }
      setOpenDialog(false);
      fetchZones();
      resetForm();
    } catch (err) {
      console.error('Failed to save zone:', err);
    }
  };

  const handleEdit = (zone: IrrigationZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      area: zone.area,
      cropType: zone.cropType,
      growthStage: zone.growthStage,
      soilType: zone.soilType,
      priority: zone.priority,
    });
    setOpenDialog(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this zone?')) {
      try {
        await apiClient.delete(`/zones/${id}`);
        fetchZones();
      } catch (err) {
        console.error('Failed to delete zone:', err);
      }
    }
  };

  const resetForm = () => {
    setEditingZone(null);
    setFormData({
      name: '',
      area: 0,
      cropType: '',
      growthStage: 'seedling',
      soilType: '',
      priority: 5,
    });
  };

  return (
    <Box>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h4">Irrigation Zones</Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            resetForm();
            setOpenDialog(true);
          }}
        >
          Add Zone
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Name</TableCell>
              <TableCell>Area (m²)</TableCell>
              <TableCell>Crop Type</TableCell>
              <TableCell>Growth Stage</TableCell>
              <TableCell>Soil Type</TableCell>
              <TableCell>Priority</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {zones.map((zone) => (
              <TableRow key={zone.id}>
                <TableCell>{zone.name}</TableCell>
                <TableCell>{zone.area}</TableCell>
                <TableCell>{zone.cropType}</TableCell>
                <TableCell>{zone.growthStage}</TableCell>
                <TableCell>{zone.soilType}</TableCell>
                <TableCell>{zone.priority}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(zone)}>
                    <Edit />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(zone.id)}>
                    <Delete />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingZone ? 'Edit Zone' : 'Add Zone'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Area (m²)"
              type="number"
              value={formData.area}
              onChange={(e) => setFormData({ ...formData, area: Number(e.target.value) })}
              fullWidth
            />
            <TextField
              label="Crop Type"
              value={formData.cropType}
              onChange={(e) => setFormData({ ...formData, cropType: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Growth Stage</InputLabel>
              <Select
                value={formData.growthStage}
                onChange={(e) => setFormData({ ...formData, growthStage: e.target.value as any })}
                label="Growth Stage"
              >
                <MenuItem value="seedling">Seedling</MenuItem>
                <MenuItem value="vegetative">Vegetative</MenuItem>
                <MenuItem value="flowering">Flowering</MenuItem>
                <MenuItem value="fruiting">Fruiting</MenuItem>
                <MenuItem value="harvest">Harvest</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Soil Type"
              value={formData.soilType}
              onChange={(e) => setFormData({ ...formData, soilType: e.target.value })}
              fullWidth
            />
            <TextField
              label="Priority (1-10)"
              type="number"
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: Number(e.target.value) })}
              fullWidth
              inputProps={{ min: 1, max: 10 }}
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
