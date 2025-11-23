import { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Grid,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import { Download } from '@mui/icons-material';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import apiClient from '@/api/client';

export default function ReportsPage() {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [reportType, setReportType] = useState('water_usage');
  const [chartData, setChartData] = useState<any[]>([]);

  const handleGenerate = async () => {
    try {
      const response = await apiClient.post('/reports/generate', {
        type: reportType,
        startDate,
        endDate,
      });
      setChartData(response.data.charts[0]?.data || []);
    } catch (err) {
      console.error('Failed to generate report:', err);
    }
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    try {
      const response = await apiClient.post(
        '/reports/export',
        {
          type: reportType,
          startDate,
          endDate,
          format,
        },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `report.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      console.error('Failed to export report:', err);
    }
  };

  return (
    <Box>
      <Typography variant="h4" mb={3}>
        Reports
      </Typography>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                label="Report Type"
              >
                <MenuItem value="water_usage">Water Usage</MenuItem>
                <MenuItem value="sensor_data">Sensor Data</MenuItem>
                <MenuItem value="irrigation_history">Irrigation History</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              fullWidth
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <Button variant="contained" fullWidth onClick={handleGenerate}>
              Generate Report
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {chartData.length > 0 && (
        <>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              {reportType === 'water_usage' ? 'Water Usage Over Time' : 'Data Visualization'}
            </Typography>
            <ResponsiveContainer width="100%" height={400}>
              {reportType === 'water_usage' ? (
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" fill="#2e7d32" />
                </BarChart>
              ) : (
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="value" stroke="#2e7d32" />
                </LineChart>
              )}
            </ResponsiveContainer>
          </Paper>

          <Box display="flex" gap={2}>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExport('pdf')}
            >
              Export PDF
            </Button>
            <Button
              variant="outlined"
              startIcon={<Download />}
              onClick={() => handleExport('csv')}
            >
              Export CSV
            </Button>
          </Box>
        </>
      )}
    </Box>
  );
}
