import { create } from 'zustand';
import { SensorReading, Device, Alert } from '@/types';
import apiClient from '@/api/client';

interface DashboardState {
  sensorReadings: SensorReading[];
  devices: Device[];
  alerts: Alert[];
  isLoading: boolean;
  lastUpdate: Date | null;
  fetchDashboardData: () => Promise<void>;
  acknowledgeAlert: (alertId: string, note: string) => Promise<void>;
}

export const useDashboardStore = create<DashboardState>((set, get) => ({
  sensorReadings: [],
  devices: [],
  alerts: [],
  isLoading: false,
  lastUpdate: null,

  fetchDashboardData: async () => {
    set({ isLoading: true });
    try {
      const [sensorsRes, devicesRes, alertsRes] = await Promise.all([
        apiClient.get<SensorReading[]>('/sensors/latest'),
        apiClient.get<Device[]>('/devices'),
        apiClient.get<Alert[]>('/alerts?status=active'),
      ]);

      set({
        sensorReadings: sensorsRes.data,
        devices: devicesRes.data,
        alerts: alertsRes.data,
        lastUpdate: new Date(),
        isLoading: false,
      });
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
      set({ isLoading: false });
    }
  },

  acknowledgeAlert: async (alertId: string, note: string) => {
    try {
      await apiClient.post(`/alerts/${alertId}/acknowledge`, { note });
      
      // Update local state
      const alerts = get().alerts.map((alert) =>
        alert.id === alertId
          ? { ...alert, acknowledgedAt: new Date(), notes: note }
          : alert
      );
      set({ alerts });
    } catch (error) {
      console.error('Failed to acknowledge alert:', error);
      throw error;
    }
  },
}));
