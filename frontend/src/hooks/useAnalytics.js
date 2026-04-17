import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function useAnalytics(defaultDays = 30) {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refresh = useCallback(async (days = defaultDays) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.get('/analytics/dashboard', { params: { days } });
      setDashboardData(res.data);
    } catch (err) {
      setError('Failed to load dashboard data.');
      console.error('Dashboard error:', err);
    } finally {
      setLoading(false);
    }
  }, [defaultDays]);

  useEffect(() => { refresh(); }, [refresh]);

  return { dashboardData, loading, error, refresh };
}
