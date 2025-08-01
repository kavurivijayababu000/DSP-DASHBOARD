import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface KPIMetric {
  id: string;
  name: string;
  value: number;
  target: number;
  unit: string;
  trend: 'up' | 'down' | 'stable';
  change: number;
}

export interface PerformanceData {
  sdpoId: string;
  sdpoName: string;
  district: string;
  range: string;
  metrics: KPIMetric[];
  rank: number;
  score: number;
  lastUpdated: string;
}

interface DashboardState {
  kpiMetrics: KPIMetric[];
  performanceData: PerformanceData[];
  selectedRange: string | null;
  selectedDistrict: string | null;
  selectedSDPO: string | null;
  dateRange: {
    start: string;
    end: string;
  };
  loading: boolean;
  error: string | null;
}

const initialState: DashboardState = {
  kpiMetrics: [],
  performanceData: [],
  selectedRange: null,
  selectedDistrict: null,
  selectedSDPO: null,
  dateRange: {
    start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    end: new Date().toISOString().split('T')[0],
  },
  loading: false,
  error: null,
};

const dashboardSlice = createSlice({
  name: 'dashboard',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setKPIMetrics: (state, action: PayloadAction<KPIMetric[]>) => {
      state.kpiMetrics = action.payload;
    },
    setPerformanceData: (state, action: PayloadAction<PerformanceData[]>) => {
      state.performanceData = action.payload;
    },
    setSelectedRange: (state, action: PayloadAction<string | null>) => {
      state.selectedRange = action.payload;
    },
    setSelectedDistrict: (state, action: PayloadAction<string | null>) => {
      state.selectedDistrict = action.payload;
    },
    setSelectedSDPO: (state, action: PayloadAction<string | null>) => {
      state.selectedSDPO = action.payload;
    },
    setDateRange: (state, action: PayloadAction<{ start: string; end: string }>) => {
      state.dateRange = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setLoading,
  setKPIMetrics,
  setPerformanceData,
  setSelectedRange,
  setSelectedDistrict,
  setSelectedSDPO,
  setDateRange,
  setError,
} = dashboardSlice.actions;

export default dashboardSlice.reducer;
