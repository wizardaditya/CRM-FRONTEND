import api from '@/api/axios';

const dashboardService = {
  getKpis:             () => api.get('/dashboard/kpis'),
  getMonthlyGrowth:    () => api.get('/dashboard/monthly-growth'),
  getRevenueChart:     () => api.get('/dashboard/revenue-chart'),
  getLeadSources:      () => api.get('/dashboard/lead-sources'),
  getPipelineSummary:  () => api.get('/dashboard/pipeline-summary'),
  getRecentActivities: () => api.get('/dashboard/recent-activities'),
};

export default dashboardService;
