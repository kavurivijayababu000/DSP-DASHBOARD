/**
 * Crime Management Service
 * 
 * This service handles all crime-related data and operations including FIR management,
 * case tracking, crime analytics, and special crime categories monitoring.
 */

import { getAllDistricts } from './policeDataService';

// Crime Data Interfaces
export interface FIRRecord {
  id: string;
  firNumber: string;
  dateRegistered: Date;
  crimeType: CrimeType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'REGISTERED' | 'UNDER_INVESTIGATION' | 'CHARGE_SHEET_FILED' | 'CLOSED' | 'DISPOSED';
  location: string;
  sdpo: string;
  district: string;
  investigatingOfficer: string;
  description: string;
  evidence: EvidenceItem[];
  suspects: SuspectInfo[];
  victims: VictimInfo[];
  lastUpdated: Date;
}

export interface CrimeType {
  category: 'PROPERTY' | 'VIOLENT' | 'CYBER' | 'TRAFFIC' | 'SPECIAL' | 'OTHER';
  subCategory: string;
  ipcSections: string[];
  isSpecialCrime?: boolean;
  specialCategory?: 'SC_ST_ATROCITY' | 'POCSO' | 'DOWRY_DEATH' | 'CUSTODIAL_DEATH';
}

export interface EvidenceItem {
  id: string;
  type: 'PHYSICAL' | 'DIGITAL' | 'DOCUMENTARY' | 'WITNESS_STATEMENT';
  description: string;
  collectedBy: string;
  collectedDate: Date;
  storageLocation: string;
}

export interface SuspectInfo {
  id: string;
  name: string;
  age: number;
  address: string;
  previousRecords: string[];
  status: 'ABSCONDING' | 'ARRESTED' | 'BAILED' | 'CHARGE_SHEETED';
}

export interface VictimInfo {
  id: string;
  name: string;
  age: number;
  gender: 'MALE' | 'FEMALE' | 'OTHER';
  contactInfo: string;
  medicalStatus?: string;
}

export interface CrimeStatistics {
  totalFIRs: number;
  pendingCases: number;
  solvedCases: number;
  disposalRate: number;
  averageResponseTime: number;
  casesByCategory: { [category: string]: number };
  monthlyTrends: MonthlyTrend[];
  specialCrimeStats: SpecialCrimeStats;
}

export interface MonthlyTrend {
  month: string;
  year: number;
  totalRegistered: number;
  totalSolved: number;
  totalPending: number;
  responseTime: number;
}

export interface SpecialCrimeStats {
  scstAtrocityCases: {
    total: number;
    pending: number;
    solved: number;
    averageDisposalTime: number;
  };
  posocCases: {
    total: number;
    pending: number;
    solved: number;
    averageDisposalTime: number;
  };
  dowryDeaths: {
    total: number;
    pending: number;
    solved: number;
    averageDisposalTime: number;
  };
  custodialDeaths: {
    total: number;
    pending: number;
    solved: number;
    averageDisposalTime: number;
  };
}

export interface CrimeAlert {
  id: string;
  type: 'CRIME_SPIKE' | 'SPECIAL_CRIME' | 'DISPOSAL_RATE_LOW' | 'RESPONSE_TIME_HIGH' | 'MISSING_EVIDENCE';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  affectedArea: string;
  recommendedAction: string;
  timestamp: Date;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
}

class CrimeManagementService {
  private static instance: CrimeManagementService;
  private crimeDatabase: FIRRecord[] = [];

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): CrimeManagementService {
    if (!CrimeManagementService.instance) {
      CrimeManagementService.instance = new CrimeManagementService();
    }
    return CrimeManagementService.instance;
  }

  private initializeMockData(): void {
    this.generateMockFIRRecords();
  }

  private generateMockFIRRecords(): void {
    const districts = getAllDistricts();
    const crimeTypes: CrimeType[] = [
      { category: 'PROPERTY', subCategory: 'Theft', ipcSections: ['379', '380'] },
      { category: 'VIOLENT', subCategory: 'Assault', ipcSections: ['322', '323'] },
      { category: 'CYBER', subCategory: 'Online Fraud', ipcSections: ['420', '66D'] },
      { category: 'TRAFFIC', subCategory: 'Accident', ipcSections: ['279', '304A'] },
      { category: 'SPECIAL', subCategory: 'SC/ST Atrocity', ipcSections: ['3', '4'], isSpecialCrime: true, specialCategory: 'SC_ST_ATROCITY' }
    ];

    for (let i = 0; i < 100; i++) {
      const district = districts[Math.floor(Math.random() * districts.length)];
      const crimeType = crimeTypes[Math.floor(Math.random() * crimeTypes.length)];
      
      const fir: FIRRecord = {
        id: `FIR-${Date.now()}-${i}`,
        firNumber: `FIR-${2024}-${String(i + 1).padStart(4, '0')}`,
        dateRegistered: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Last 90 days
        crimeType: crimeType,
        severity: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any,
        status: ['REGISTERED', 'UNDER_INVESTIGATION', 'CHARGE_SHEET_FILED', 'CLOSED', 'DISPOSED'][Math.floor(Math.random() * 5)] as any,
        location: `${district} - Area ${i + 1}`,
        sdpo: `SDPO ${district}`,
        district: district,
        investigatingOfficer: `Officer ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
        description: `Mock crime incident ${i + 1} - ${crimeType.subCategory}`,
        evidence: [],
        suspects: [],
        victims: [],
        lastUpdated: new Date()
      };

      this.crimeDatabase.push(fir);
    }
  }

  // FIR Management Methods
  public async registerFIR(firData: Partial<FIRRecord>): Promise<FIRRecord> {
    const firDefaults = {
      id: `FIR-${Date.now()}`,
      firNumber: `FIR-${new Date().getFullYear()}-${String(this.crimeDatabase.length + 1).padStart(4, '0')}`,
      dateRegistered: new Date(),
      status: 'REGISTERED' as const,
      evidence: [],
      suspects: [],
      victims: [],
      lastUpdated: new Date(),
    };

    const newFIR: FIRRecord = {
      ...firDefaults,
      ...firData
    } as FIRRecord;

    this.crimeDatabase.push(newFIR);
    return newFIR;
  }

  public async getFIRById(firId: string): Promise<FIRRecord | null> {
    return this.crimeDatabase.find(fir => fir.id === firId) || null;
  }

  public async getFIRsByJurisdiction(jurisdiction: string, userRole: string): Promise<FIRRecord[]> {
    if (userRole === 'DGP') {
      return this.crimeDatabase;
    } else if (userRole === 'DIG') {
      return this.crimeDatabase.filter(fir => fir.district.includes(jurisdiction));
    } else if (userRole === 'SP' || userRole === 'CP') {
      return this.crimeDatabase.filter(fir => fir.district === jurisdiction);
    } else {
      return this.crimeDatabase.filter(fir => fir.sdpo.includes(jurisdiction));
    }
  }

  // Crime Statistics Methods
  public async getCrimeStatistics(jurisdiction: string, userRole: string, timeRange: string = '6months'): Promise<CrimeStatistics> {
    const firs = await this.getFIRsByJurisdiction(jurisdiction, userRole);
    
    const now = new Date();
    let startDate = new Date();
    
    switch (timeRange) {
      case '1month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      case '3months':
        startDate.setMonth(now.getMonth() - 3);
        break;
      case '1year':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default: // 6months
        startDate.setMonth(now.getMonth() - 6);
    }

    const filteredFIRs = firs.filter(fir => fir.dateRegistered >= startDate);
    
    const totalFIRs = filteredFIRs.length;
    const solvedCases = filteredFIRs.filter(fir => fir.status === 'DISPOSED' || fir.status === 'CLOSED').length;
    const pendingCases = filteredFIRs.filter(fir => fir.status !== 'DISPOSED' && fir.status !== 'CLOSED').length;
    
    const casesByCategory = filteredFIRs.reduce((acc, fir) => {
      const category = fir.crimeType.category;
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {} as { [category: string]: number });

    const monthlyTrends = this.generateMonthlyTrends(filteredFIRs);
    const specialCrimeStats = this.calculateSpecialCrimeStats(filteredFIRs);

    return {
      totalFIRs,
      pendingCases,
      solvedCases,
      disposalRate: totalFIRs > 0 ? (solvedCases / totalFIRs) * 100 : 0,
      averageResponseTime: 15.5, // Mock average response time in minutes
      casesByCategory,
      monthlyTrends,
      specialCrimeStats
    };
  }

  private generateMonthlyTrends(firs: FIRRecord[]): MonthlyTrend[] {
    const monthlyData = new Map<string, MonthlyTrend>();
    
    firs.forEach(fir => {
      const monthKey = `${fir.dateRegistered.getFullYear()}-${fir.dateRegistered.getMonth()}`;
      const month = fir.dateRegistered.toLocaleDateString('en-US', { month: 'short' });
      const year = fir.dateRegistered.getFullYear();
      
      if (!monthlyData.has(monthKey)) {
        monthlyData.set(monthKey, {
          month,
          year,
          totalRegistered: 0,
          totalSolved: 0,
          totalPending: 0,
          responseTime: 15 + Math.random() * 10 // Mock response time
        });
      }
      
      const data = monthlyData.get(monthKey)!;
      data.totalRegistered++;
      
      if (fir.status === 'DISPOSED' || fir.status === 'CLOSED') {
        data.totalSolved++;
      } else {
        data.totalPending++;
      }
    });
    
    return Array.from(monthlyData.values()).sort((a, b) => {
      if (a.year !== b.year) return a.year - b.year;
      return new Date(`${a.month} 1, ${a.year}`).getMonth() - new Date(`${b.month} 1, ${b.year}`).getMonth();
    });
  }

  private calculateSpecialCrimeStats(firs: FIRRecord[]): SpecialCrimeStats {
    const specialCrimes = firs.filter(fir => fir.crimeType.isSpecialCrime);
    
    const scstCases = specialCrimes.filter(fir => fir.crimeType.specialCategory === 'SC_ST_ATROCITY');
    const posocCases = specialCrimes.filter(fir => fir.crimeType.specialCategory === 'POCSO');
    const dowryDeaths = specialCrimes.filter(fir => fir.crimeType.specialCategory === 'DOWRY_DEATH');
    const custodialDeaths = specialCrimes.filter(fir => fir.crimeType.specialCategory === 'CUSTODIAL_DEATH');

    return {
      scstAtrocityCases: {
        total: scstCases.length,
        pending: scstCases.filter(fir => fir.status !== 'DISPOSED' && fir.status !== 'CLOSED').length,
        solved: scstCases.filter(fir => fir.status === 'DISPOSED' || fir.status === 'CLOSED').length,
        averageDisposalTime: 45 // Mock average disposal time in days
      },
      posocCases: {
        total: posocCases.length,
        pending: posocCases.filter(fir => fir.status !== 'DISPOSED' && fir.status !== 'CLOSED').length,
        solved: posocCases.filter(fir => fir.status === 'DISPOSED' || fir.status === 'CLOSED').length,
        averageDisposalTime: 35
      },
      dowryDeaths: {
        total: dowryDeaths.length,
        pending: dowryDeaths.filter(fir => fir.status !== 'DISPOSED' && fir.status !== 'CLOSED').length,
        solved: dowryDeaths.filter(fir => fir.status === 'DISPOSED' || fir.status === 'CLOSED').length,
        averageDisposalTime: 60
      },
      custodialDeaths: {
        total: custodialDeaths.length,
        pending: custodialDeaths.filter(fir => fir.status !== 'DISPOSED' && fir.status !== 'CLOSED').length,
        solved: custodialDeaths.filter(fir => fir.status === 'DISPOSED' || fir.status === 'CLOSED').length,
        averageDisposalTime: 30
      }
    };
  }

  // Alert Management Methods
  public async getCrimeAlerts(jurisdiction: string, userRole: string): Promise<CrimeAlert[]> {
    const baseAlerts: CrimeAlert[] = [
      {
        id: 'ALERT-001',
        type: 'CRIME_SPIKE',
        severity: 'HIGH',
        message: 'Property crime incidents increased by 25% this month',
        affectedArea: jurisdiction,
        recommendedAction: 'Increase patrol frequency in affected areas',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        isAcknowledged: false
      },
      {
        id: 'ALERT-002',
        type: 'SPECIAL_CRIME',
        severity: 'CRITICAL',
        message: 'New POCSO case requires immediate attention and fast-track processing',
        affectedArea: jurisdiction,
        recommendedAction: 'Assign specialized investigation team immediately',
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        isAcknowledged: false
      },
      {
        id: 'ALERT-003',
        type: 'DISPOSAL_RATE_LOW',
        severity: 'MEDIUM',
        message: 'Case disposal rate fell below 85% target threshold',
        affectedArea: jurisdiction,
        recommendedAction: 'Review pending cases and expedite charge sheet filing',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        isAcknowledged: true,
        acknowledgedBy: 'System Admin'
      }
    ];

    return baseAlerts;
  }

  public async acknowledgeAlert(alertId: string, acknowledgedBy: string): Promise<boolean> {
    console.log(`Alert ${alertId} acknowledged by ${acknowledgedBy}`);
    return true;
  }
}

// Export singleton instance
export const crimeManagementService = CrimeManagementService.getInstance();
export default crimeManagementService;
