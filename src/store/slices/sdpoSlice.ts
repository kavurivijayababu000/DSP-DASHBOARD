import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SDPO {
  id: string;
  name: string;
  district: string;
  range: string;
  jurisdiction: string;
  contactNumber: string;
  email: string;
  joinedDate: string;
  status: 'active' | 'inactive';
  performance: {
    rank: number;
    score: number;
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  };
}

export interface CrimeData {
  id: string;
  sdpoId: string;
  type: string;
  registeredCases: number;
  solvedCases: number;
  pendingCases: number;
  convictionRate: number;
  month: string;
}

export interface FieldActivity {
  id: string;
  sdpoId: string;
  type: 'inspection' | 'patrol' | 'community_meeting' | 'training';
  description: string;
  location: string;
  date: string;
  duration: number;
  mediaFiles: string[];
  status: 'completed' | 'in_progress' | 'scheduled';
}

interface SDPOState {
  sdpos: SDPO[];
  selectedSDPO: SDPO | null;
  crimeData: CrimeData[];
  fieldActivities: FieldActivity[];
  loading: boolean;
  error: string | null;
  filters: {
    range: string | null;
    district: string | null;
    status: string | null;
    performance: string | null;
  };
}

const initialState: SDPOState = {
  sdpos: [],
  selectedSDPO: null,
  crimeData: [],
  fieldActivities: [],
  loading: false,
  error: null,
  filters: {
    range: null,
    district: null,
    status: null,
    performance: null,
  },
};

const sdpoSlice = createSlice({
  name: 'sdpo',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setSDPOs: (state, action: PayloadAction<SDPO[]>) => {
      state.sdpos = action.payload;
    },
    setSelectedSDPO: (state, action: PayloadAction<SDPO | null>) => {
      state.selectedSDPO = action.payload;
    },
    setCrimeData: (state, action: PayloadAction<CrimeData[]>) => {
      state.crimeData = action.payload;
    },
    setFieldActivities: (state, action: PayloadAction<FieldActivity[]>) => {
      state.fieldActivities = action.payload;
    },
    setFilters: (state, action: PayloadAction<Partial<SDPOState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
    updateSDPO: (state, action: PayloadAction<SDPO>) => {
      const index = state.sdpos.findIndex(sdpo => sdpo.id === action.payload.id);
      if (index !== -1) {
        state.sdpos[index] = action.payload;
      }
    },
    addFieldActivity: (state, action: PayloadAction<FieldActivity>) => {
      state.fieldActivities.push(action.payload);
    },
  },
});

export const {
  setLoading,
  setSDPOs,
  setSelectedSDPO,
  setCrimeData,
  setFieldActivities,
  setFilters,
  setError,
  updateSDPO,
  addFieldActivity,
} = sdpoSlice.actions;

export default sdpoSlice.reducer;
