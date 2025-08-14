import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Users, 
  Calendar, 
  Phone, 
  Mail, 
  MapPin, 
  Filter,
  Search,
  Eye,
  MessageSquare,
  User,
  Bookmark,
  TrendingUp,
  BarChart3,
  PieChart,
  Target,
  ThumbsUp,
  Star,
  Award,
  Bell,
  ArrowRight,
  Download,
  Upload,
  RefreshCw,
  Hash,
  Clock3,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Grievance interfaces
interface Grievance {
  id: string;
  grievanceId: string;
  title: string;
  description: string;
  category: 'CORRUPTION' | 'MISCONDUCT' | 'DELAY' | 'HARASSMENT' | 'FACILITIES' | 'PROCESS' | 'OTHER';
  subcategory: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'SUBMITTED' | 'ACKNOWLEDGED' | 'UNDER_REVIEW' | 'INVESTIGATING' | 'ACTION_TAKEN' | 'RESOLVED' | 'REJECTED' | 'ESCALATED';
  submittedDate: Date;
  complainantInfo: {
    name: string;
    phone: string;
    email: string;
    address: string;
    citizenId?: string;
    anonymous: boolean;
  };
  targetDepartment: string;
  targetOfficer?: string;
  location: {
    station: string;
    district: string;
    coordinates?: { lat: number; lng: number };
  };
  attachments: string[];
  assignedTo: string;
  reviewedBy?: string;
  actionTaken?: string;
  resolution?: string;
  feedbackRating?: number;
  feedbackComments?: string;
  timeline: {
    date: Date;
    status: string;
    remarks: string;
    actionBy: string;
  }[];
  slaDeadline: Date;
  escalationLevel: number;
  isPublic: boolean;
  tags: string[];
}

interface GrievanceStats {
  total: number;
  pending: number;
  resolved: number;
  overdue: number;
  byCategory: { [category: string]: number };
  byStatus: { [status: string]: number };
  avgResolutionTime: number;
  satisfactionRating: number;
}

// Mock data generator
const generateMockGrievances = (count: number, userRole: string, jurisdiction: string): Grievance[] => {
  const categories = ['CORRUPTION', 'MISCONDUCT', 'DELAY', 'HARASSMENT', 'FACILITIES', 'PROCESS', 'OTHER'];
  const subcategories = {
    'CORRUPTION': ['Bribery', 'Misuse of Power', 'Financial Irregularity'],
    'MISCONDUCT': ['Rude Behavior', 'Negligence', 'Abuse of Authority'],
    'DELAY': ['FIR Registration', 'Investigation', 'Case Disposal'],
    'HARASSMENT': ['Physical', 'Mental', 'Discrimination'],
    'FACILITIES': ['Infrastructure', 'Equipment', 'Accessibility'],
    'PROCESS': ['Documentation', 'Procedure Violation', 'System Issues'],
    'OTHER': ['General Complaint', 'Suggestion', 'Feedback']
  };

  const statuses = ['SUBMITTED', 'ACKNOWLEDGED', 'UNDER_REVIEW', 'INVESTIGATING', 'ACTION_TAKEN', 'RESOLVED', 'REJECTED', 'ESCALATED'];
  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
  
  const stations = {
    'Anantapur': ['Anantapur Town', 'Anantapur Rural', 'Kadiri', 'Kalyandurg', 'Rayadurg'],
    'Chittoor': ['Chittoor', 'Tirupati Urban', 'Tirupati Rural', 'Madanapalle', 'Srikalahasti'],
    'Guntur': ['Guntur', 'Vijayawada', 'Tenali', 'Narasaraopet', 'Chilakaluripet'],
    'Krishna': ['Machilipatnam', 'Gudivada', 'Jaggayyapet', 'Nuzvidu', 'Avanigadda'],
    'Kurnool': ['Kurnool', 'Nandyal', 'Adoni', 'Yemmiganur', 'Allagadda']
  };

  const grievances: Grievance[] = [];

  // Scale data based on role
  const roleMultiplier = {
    'DGP': 1.0,
    'DIG': 0.8,
    'SP': 0.6,
    'DSP': 0.4,
    'CI': 0.3,
    'SI': 0.2,
    'ASI': 0.1,
    'HC': 0.05,
    'PC': 0.03
  }[userRole] || 0.5;

  const adjustedCount = Math.max(3, Math.floor(count * roleMultiplier));

  for (let i = 0; i < adjustedCount; i++) {
    const category = categories[Math.floor(Math.random() * categories.length)] as keyof typeof subcategories;
    const subcategoryList = subcategories[category];
    const subcategory = subcategoryList[Math.floor(Math.random() * subcategoryList.length)];
    const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
    const priority = priorities[Math.floor(Math.random() * priorities.length)] as 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
    
    const submittedDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const grievanceId = `GRV-${new Date().getFullYear()}-${String(i + 1).padStart(6, '0')}`;
    
    // SLA deadlines based on priority
    const slaDays = {
      'CRITICAL': 3,
      'HIGH': 7,
      'MEDIUM': 15,
      'LOW': 30
    }[priority];
    
    const slaDeadline = new Date(submittedDate.getTime() + slaDays * 24 * 60 * 60 * 1000);
    
    const district = jurisdiction === 'All' ? 
      Object.keys(stations)[Math.floor(Math.random() * Object.keys(stations).length)] : 
      jurisdiction;
    
    const stationList = (stations as any)[district] || ['Local Station'];
    const station = stationList[Math.floor(Math.random() * stationList.length)];

    // Generate timeline
    const timeline = [
      {
        date: submittedDate,
        status: 'SUBMITTED',
        remarks: 'Grievance submitted by complainant',
        actionBy: 'System'
      }
    ];

    if (status !== 'SUBMITTED') {
      timeline.push({
        date: new Date(submittedDate.getTime() + 24 * 60 * 60 * 1000),
        status: 'ACKNOWLEDGED',
        remarks: 'Grievance acknowledged and assigned for review',
        actionBy: `${userRole}-${district}`
      });
    }

    if (['UNDER_REVIEW', 'INVESTIGATING', 'ACTION_TAKEN', 'RESOLVED', 'REJECTED'].includes(status)) {
      timeline.push({
        date: new Date(submittedDate.getTime() + 3 * 24 * 60 * 60 * 1000),
        status: 'UNDER_REVIEW',
        remarks: 'Initial review completed, investigation initiated',
        actionBy: `SI-Investigation`
      });
    }

    if (['RESOLVED', 'ACTION_TAKEN', 'REJECTED'].includes(status)) {
      timeline.push({
        date: new Date(submittedDate.getTime() + 10 * 24 * 60 * 60 * 1000),
        status: status,
        remarks: status === 'RESOLVED' ? 'Issue resolved satisfactorily' : 
                 status === 'REJECTED' ? 'Insufficient evidence' : 'Corrective action taken',
        actionBy: `DSP-${district}`
      });
    }

    const grievance: Grievance = {
      id: `grv-${i + 1}`,
      grievanceId,
      title: `${category.replace('_', ' ')} - ${subcategory}`,
      description: `Detailed complaint regarding ${subcategory.toLowerCase()} issue at ${station} station. ${
        category === 'CORRUPTION' ? 'Officer demanded unauthorized payment for services.' :
        category === 'MISCONDUCT' ? 'Unprofessional behavior and negligence in duty.' :
        category === 'DELAY' ? 'Unnecessary delay in processing without valid reason.' :
        category === 'HARASSMENT' ? 'Inappropriate conduct causing mental distress.' :
        'Issue needs immediate attention and resolution.'
      }`,
      category,
      subcategory,
      priority,
      status,
      submittedDate,
      complainantInfo: {
        name: Math.random() > 0.3 ? `Complainant ${i + 1}` : 'Anonymous',
        phone: Math.random() > 0.3 ? `+91-${Math.floor(Math.random() * 9000000000) + 1000000000}` : 'Not Provided',
        email: Math.random() > 0.3 ? `complainant${i + 1}@email.com` : 'Not Provided',
        address: `${station}, ${district} District, Andhra Pradesh`,
        citizenId: Math.random() > 0.3 ? `CID${Math.floor(Math.random() * 1000000000)}` : undefined,
        anonymous: Math.random() > 0.7
      },
      targetDepartment: station,
      targetOfficer: Math.random() > 0.5 ? `Officer-${Math.floor(Math.random() * 100)}` : undefined,
      location: {
        station,
        district,
        coordinates: {
          lat: 14.0 + Math.random() * 4,
          lng: 78.0 + Math.random() * 4
        }
      },
      attachments: Math.random() > 0.6 ? [`evidence_${i + 1}.jpg`, `complaint_${i + 1}.pdf`] : [],
      assignedTo: `${userRole}-${district}`,
      reviewedBy: status !== 'SUBMITTED' ? `Review-Officer-${district}` : undefined,
      actionTaken: ['ACTION_TAKEN', 'RESOLVED'].includes(status) ? 
        'Counseling provided to officer, process improvements implemented' : undefined,
      resolution: status === 'RESOLVED' ? 
        'Issue resolved through mediation, complainant satisfied' : undefined,
      feedbackRating: status === 'RESOLVED' ? Math.floor(Math.random() * 3) + 3 : undefined, // 3-5 stars
      feedbackComments: status === 'RESOLVED' ? 
        'Thank you for prompt resolution of my complaint' : undefined,
      timeline,
      slaDeadline,
      escalationLevel: priority === 'CRITICAL' ? 2 : priority === 'HIGH' ? 1 : 0,
      isPublic: Math.random() > 0.3,
      tags: [category.toLowerCase(), subcategory.toLowerCase(), priority.toLowerCase()]
    };

    grievances.push(grievance);
  }

  return grievances.sort((a, b) => b.submittedDate.getTime() - a.submittedDate.getTime());
};

const GrievanceTab: React.FC = () => {
  const [grievances, setGrievances] = useState<Grievance[]>([]);
  const [filteredGrievances, setFilteredGrievances] = useState<Grievance[]>([]);
  const [stats, setStats] = useState<GrievanceStats | null>(null);
  const [selectedGrievance, setSelectedGrievance] = useState<Grievance | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'overview' | 'list' | 'analytics' | 'sla'>('overview');
  
  // Filter states
  const [filters, setFilters] = useState({
    status: 'ALL',
    category: 'ALL',
    priority: 'ALL',
    department: 'ALL',
    timeRange: '30' // days
  });

  // Simulated user context
  const userRole = 'SDPO'; // This would come from auth context
  const jurisdiction = 'Anantapur'; // This would come from user profile

  // Initialize data
  useEffect(() => {
    const mockGrievances = generateMockGrievances(100, userRole, jurisdiction);
    setGrievances(mockGrievances);
    setFilteredGrievances(mockGrievances);
    
    // Calculate stats
    const totalGrievances = mockGrievances.length;
    const pendingCount = mockGrievances.filter(g => 
      !['RESOLVED', 'REJECTED'].includes(g.status)
    ).length;
    const resolvedCount = mockGrievances.filter(g => g.status === 'RESOLVED').length;
    const overdueCount = mockGrievances.filter(g => 
      new Date() > g.slaDeadline && !['RESOLVED', 'REJECTED'].includes(g.status)
    ).length;

    const byCategory = mockGrievances.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const byStatus = mockGrievances.reduce((acc, g) => {
      acc[g.status] = (acc[g.status] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const resolvedGrievances = mockGrievances.filter(g => g.status === 'RESOLVED');
    const avgResolutionTime = resolvedGrievances.length > 0 ? 
      resolvedGrievances.reduce((sum, g) => {
        const resolution = g.timeline.find(t => t.status === 'RESOLVED');
        if (resolution) {
          return sum + (resolution.date.getTime() - g.submittedDate.getTime()) / (1000 * 60 * 60 * 24);
        }
        return sum;
      }, 0) / resolvedGrievances.length : 0;

    const satisfactionRating = resolvedGrievances
      .filter(g => g.feedbackRating)
      .reduce((sum, g) => sum + (g.feedbackRating || 0), 0) / 
      resolvedGrievances.filter(g => g.feedbackRating).length || 0;

    setStats({
      total: totalGrievances,
      pending: pendingCount,
      resolved: resolvedCount,
      overdue: overdueCount,
      byCategory,
      byStatus,
      avgResolutionTime,
      satisfactionRating
    });
  }, [userRole, jurisdiction]);

  // Apply filters
  useEffect(() => {
    let filtered = grievances;

    // Search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(g =>
        g.title.toLowerCase().includes(query) ||
        g.description.toLowerCase().includes(query) ||
        g.grievanceId.toLowerCase().includes(query) ||
        g.complainantInfo.name.toLowerCase().includes(query) ||
        g.targetDepartment.toLowerCase().includes(query)
      );
    }

    // Status filter
    if (filters.status !== 'ALL') {
      filtered = filtered.filter(g => g.status === filters.status);
    }

    // Category filter
    if (filters.category !== 'ALL') {
      filtered = filtered.filter(g => g.category === filters.category);
    }

    // Priority filter
    if (filters.priority !== 'ALL') {
      filtered = filtered.filter(g => g.priority === filters.priority);
    }

    // Department filter
    if (filters.department !== 'ALL') {
      filtered = filtered.filter(g => g.targetDepartment === filters.department);
    }

    // Time range filter
    const daysAgo = parseInt(filters.timeRange);
    if (daysAgo > 0) {
      const cutoff = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
      filtered = filtered.filter(g => g.submittedDate >= cutoff);
    }

    setFilteredGrievances(filtered);
  }, [grievances, searchQuery, filters]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUBMITTED': return 'text-blue-600 bg-blue-100';
      case 'ACKNOWLEDGED': return 'text-indigo-600 bg-indigo-100';
      case 'UNDER_REVIEW': return 'text-yellow-600 bg-yellow-100';
      case 'INVESTIGATING': return 'text-orange-600 bg-orange-100';
      case 'ACTION_TAKEN': return 'text-purple-600 bg-purple-100';
      case 'RESOLVED': return 'text-green-600 bg-green-100';
      case 'REJECTED': return 'text-red-600 bg-red-100';
      case 'ESCALATED': return 'text-red-700 bg-red-200';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'text-green-600 bg-green-100';
      case 'MEDIUM': return 'text-yellow-600 bg-yellow-100';
      case 'HIGH': return 'text-orange-600 bg-orange-100';
      case 'CRITICAL': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const getDaysFromSubmission = (date: Date) => {
    return Math.floor((Date.now() - date.getTime()) / (1000 * 60 * 60 * 24));
  };

  const isOverdue = (grievance: Grievance) => {
    return new Date() > grievance.slaDeadline && !['RESOLVED', 'REJECTED'].includes(grievance.status);
  };

  // Overview Tab Content
  const renderOverview = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Total Grievances</p>
                <p className="text-2xl font-bold text-white">{stats.total}</p>
              </div>
              <FileText className="h-8 w-8 text-white/60" />
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Pending</p>
                <p className="text-2xl font-bold text-yellow-300">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-300/60" />
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Resolved</p>
                <p className="text-2xl font-bold text-green-300">{stats.resolved}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-300/60" />
            </div>
          </div>
          
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/80 text-sm">Overdue</p>
                <p className="text-2xl font-bold text-red-300">{stats.overdue}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-300/60" />
            </div>
          </div>
        </div>
      )}

      {/* Recent High Priority Grievances */}
      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-400" />
            High Priority Grievances
          </h3>
          <span className="text-white/60 text-sm">Last 7 days</span>
        </div>
        
        <div className="space-y-3">
          {filteredGrievances
            .filter(g => g.priority === 'HIGH' || g.priority === 'CRITICAL')
            .slice(0, 5)
            .map(grievance => (
              <div 
                key={grievance.id} 
                className="bg-white/10 backdrop-blur-sm rounded-lg p-4 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => setSelectedGrievance(grievance)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-white/80 font-medium">{grievance.grievanceId}</span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(grievance.priority)}`}>
                        {grievance.priority}
                      </span>
                      {isOverdue(grievance) && (
                        <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full">
                          OVERDUE
                        </span>
                      )}
                    </div>
                    <p className="text-white/90 font-medium mb-1">{grievance.title}</p>
                    <p className="text-white/70 text-sm">
                      {grievance.targetDepartment} • {formatDate(grievance.submittedDate)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grievance.status)}`}>
                      {grievance.status.replace('_', ' ')}
                    </span>
                    <ArrowRight className="h-4 w-4 text-white/40" />
                  </div>
                </div>
              </div>
            ))}
        </div>
      </div>

      {/* Category Breakdown */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <PieChart className="h-5 w-5 text-blue-400" />
              By Category
            </h3>
            <div className="space-y-3">
              {Object.entries(stats.byCategory).map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="text-white/80">{category.replace('_', ' ')}</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-white/20 rounded-full h-2">
                      <div 
                        className="h-2 bg-blue-400 rounded-full" 
                        style={{ width: `${(count / stats.total) * 100}%` }}
                      />
                    </div>
                    <span className="text-white/90 font-medium w-8 text-right">{count}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              Performance Metrics
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-white/80 text-sm mb-1">
                  <span>Resolution Rate</span>
                  <span>{((stats.resolved / stats.total) * 100).toFixed(1)}%</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="h-2 bg-green-400 rounded-full" 
                    style={{ width: `${(stats.resolved / stats.total) * 100}%` }}
                  />
                </div>
              </div>
              
              <div>
                <div className="flex justify-between text-white/80 text-sm mb-1">
                  <span>Avg. Resolution Time</span>
                  <span>{stats.avgResolutionTime.toFixed(1)} days</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="h-2 bg-blue-400 rounded-full" 
                    style={{ width: `${Math.min((15 - stats.avgResolutionTime) / 15, 1) * 100}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-white/80 text-sm mb-1">
                  <span>Satisfaction Rating</span>
                  <span className="flex items-center gap-1">
                    {stats.satisfactionRating.toFixed(1)}
                    <Star className="h-3 w-3 text-yellow-400 fill-current" />
                  </span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div 
                    className="h-2 bg-yellow-400 rounded-full" 
                    style={{ width: `${(stats.satisfactionRating / 5) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Grievance List Tab Content
  const renderGrievanceList = () => (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-white/60" />
            <input
              type="text"
              placeholder="Search grievances..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors flex items-center gap-2"
          >
            <Filter className="h-4 w-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            <select
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
              className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">All Status</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="ACKNOWLEDGED">Acknowledged</option>
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="ACTION_TAKEN">Action Taken</option>
              <option value="RESOLVED">Resolved</option>
              <option value="REJECTED">Rejected</option>
              <option value="ESCALATED">Escalated</option>
            </select>

            <select
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
              className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">All Categories</option>
              <option value="CORRUPTION">Corruption</option>
              <option value="MISCONDUCT">Misconduct</option>
              <option value="DELAY">Delay</option>
              <option value="HARASSMENT">Harassment</option>
              <option value="FACILITIES">Facilities</option>
              <option value="PROCESS">Process</option>
              <option value="OTHER">Other</option>
            </select>

            <select
              value={filters.priority}
              onChange={(e) => setFilters({...filters, priority: e.target.value})}
              className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>

            <select
              value={filters.timeRange}
              onChange={(e) => setFilters({...filters, timeRange: e.target.value})}
              className="px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
            >
              <option value="0">All Time</option>
              <option value="7">Last 7 days</option>
              <option value="30">Last 30 days</option>
              <option value="90">Last 3 months</option>
            </select>

            <button
              onClick={() => {
                setFilters({
                  status: 'ALL',
                  category: 'ALL',
                  priority: 'ALL',
                  department: 'ALL',
                  timeRange: '30'
                });
                setSearchQuery('');
              }}
              className="px-4 py-2 bg-red-600/80 text-white rounded-lg hover:bg-red-700/80 transition-colors"
            >
              Clear
            </button>
          </div>
        )}
      </div>

      {/* Grievances List */}
      <div className="space-y-3">
        {filteredGrievances.map(grievance => (
          <div 
            key={grievance.id}
            className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-4 cursor-pointer hover:bg-white/30 transition-colors"
            onClick={() => setSelectedGrievance(grievance)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-white font-medium">{grievance.grievanceId}</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(grievance.priority)}`}>
                    {grievance.priority}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(grievance.status)}`}>
                    {grievance.status.replace('_', ' ')}
                  </span>
                  {isOverdue(grievance) && (
                    <span className="px-2 py-1 bg-red-600 text-white text-xs rounded-full flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      OVERDUE
                    </span>
                  )}
                </div>
                
                <h3 className="text-white/90 font-medium mb-1">{grievance.title}</h3>
                <p className="text-white/70 text-sm mb-2 line-clamp-2">{grievance.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 text-white/60 text-sm">
                  <span className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    {grievance.complainantInfo.anonymous ? 'Anonymous' : grievance.complainantInfo.name}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {grievance.targetDepartment}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {formatDate(grievance.submittedDate)} ({getDaysFromSubmission(grievance.submittedDate)} days ago)
                  </span>
                  {grievance.attachments.length > 0 && (
                    <span className="flex items-center gap-1">
                      <FileText className="h-4 w-4" />
                      {grievance.attachments.length} attachment(s)
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <button className="p-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors">
                  <Eye className="h-4 w-4" />
                </button>
                <ArrowRight className="h-4 w-4 text-white/40" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredGrievances.length === 0 && (
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-8 text-center">
          <FileText className="h-12 w-12 text-white/40 mx-auto mb-4" />
          <p className="text-white/80 text-lg">No grievances found</p>
          <p className="text-white/60">Try adjusting your search criteria or filters</p>
        </div>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Grievance Management</h1>
              <p className="text-white/80">Monitor, track, and resolve public grievances efficiently</p>
            </div>
            <div className="flex items-center gap-3">
              <button className="px-4 py-2 bg-green-600/80 text-white rounded-lg hover:bg-green-700/80 transition-colors flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Import Grievances
              </button>
              <button className="px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors flex items-center gap-2">
                <Download className="h-4 w-4" />
                Export Report
              </button>
              <button className="p-2 bg-gray-600/80 text-white rounded-lg hover:bg-gray-700/80 transition-colors">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            {[
              { id: 'overview', label: 'Overview', icon: BarChart3 },
              { id: 'list', label: 'Grievance List', icon: FileText },
              { id: 'analytics', label: 'Analytics', icon: TrendingUp },
              { id: 'sla', label: 'SLA Tracking', icon: Target }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                  activeTab === tab.id 
                    ? 'bg-white/20 text-white shadow-sm' 
                    : 'text-white/70 hover:text-white hover:bg-white/10'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'list' && renderGrievanceList()}
        
        {/* Grievance Detail Modal */}
        {selectedGrievance && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white/95 backdrop-blur-sm rounded-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      {selectedGrievance.grievanceId}
                    </h2>
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPriorityColor(selectedGrievance.priority)}`}>
                        {selectedGrievance.priority}
                      </span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedGrievance.status)}`}>
                        {selectedGrievance.status.replace('_', ' ')}
                      </span>
                      {isOverdue(selectedGrievance) && (
                        <span className="px-3 py-1 bg-red-600 text-white text-sm rounded-full flex items-center gap-1">
                          <AlertTriangle className="h-4 w-4" />
                          OVERDUE
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => setSelectedGrievance(null)}
                    className="p-2 hover:bg-gray-100 rounded-lg"
                  >
                    <XCircle className="h-6 w-6 text-gray-500" />
                  </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Main Content */}
                  <div className="lg:col-span-2 space-y-6">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{selectedGrievance.title}</h3>
                      <p className="text-gray-700 leading-relaxed">{selectedGrievance.description}</p>
                    </div>

                    {/* Timeline */}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <Clock3 className="h-5 w-5" />
                        Timeline
                      </h3>
                      <div className="space-y-4">
                        {selectedGrievance.timeline.map((event, index) => (
                          <div key={index} className="flex items-start gap-4">
                            <div className="flex-shrink-0">
                              <div className={`w-3 h-3 rounded-full ${
                                event.status === 'RESOLVED' ? 'bg-green-500' :
                                event.status === 'REJECTED' ? 'bg-red-500' :
                                'bg-blue-500'
                              }`} />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-gray-900">{event.status.replace('_', ' ')}</span>
                                <span className="text-gray-500 text-sm">{formatDate(event.date)}</span>
                              </div>
                              <p className="text-gray-700 text-sm">{event.remarks}</p>
                              <p className="text-gray-500 text-xs mt-1">By: {event.actionBy}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Action Taken & Resolution */}
                    {selectedGrievance.actionTaken && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Action Taken</h3>
                        <p className="text-gray-700 bg-blue-50 p-3 rounded-lg">{selectedGrievance.actionTaken}</p>
                      </div>
                    )}

                    {selectedGrievance.resolution && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Resolution</h3>
                        <p className="text-gray-700 bg-green-50 p-3 rounded-lg">{selectedGrievance.resolution}</p>
                      </div>
                    )}

                    {/* Feedback */}
                    {selectedGrievance.feedbackRating && (
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Complainant Feedback</h3>
                        <div className="bg-yellow-50 p-3 rounded-lg">
                          <div className="flex items-center gap-1 mb-2">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`h-4 w-4 ${i < selectedGrievance.feedbackRating! ? 'text-yellow-500 fill-current' : 'text-gray-300'}`} 
                              />
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                              {selectedGrievance.feedbackRating}/5
                            </span>
                          </div>
                          {selectedGrievance.feedbackComments && (
                            <p className="text-gray-700 text-sm">{selectedGrievance.feedbackComments}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Sidebar */}
                  <div className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Grievance Details</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Category:</span>
                          <span className="font-medium">{selectedGrievance.category.replace('_', ' ')}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Sub-category:</span>
                          <span className="font-medium">{selectedGrievance.subcategory}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Submitted:</span>
                          <span className="font-medium">{formatDate(selectedGrievance.submittedDate)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">SLA Deadline:</span>
                          <span className={`font-medium ${isOverdue(selectedGrievance) ? 'text-red-600' : 'text-gray-900'}`}>
                            {formatDate(selectedGrievance.slaDeadline)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Days Since:</span>
                          <span className="font-medium">{getDaysFromSubmission(selectedGrievance.submittedDate)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Complainant Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Complainant Information</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Name:</span>
                          <p className="font-medium">{selectedGrievance.complainantInfo.name}</p>
                        </div>
                        {!selectedGrievance.complainantInfo.anonymous && (
                          <>
                            <div>
                              <span className="text-gray-600">Phone:</span>
                              <p className="font-medium">{selectedGrievance.complainantInfo.phone}</p>
                            </div>
                            <div>
                              <span className="text-gray-600">Email:</span>
                              <p className="font-medium">{selectedGrievance.complainantInfo.email}</p>
                            </div>
                          </>
                        )}
                        <div>
                          <span className="text-gray-600">Address:</span>
                          <p className="font-medium">{selectedGrievance.complainantInfo.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Location Info */}
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h3 className="font-semibold text-gray-900 mb-3">Location & Department</h3>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-600">Station:</span>
                          <p className="font-medium">{selectedGrievance.location.station}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">District:</span>
                          <p className="font-medium">{selectedGrievance.location.district}</p>
                        </div>
                        <div>
                          <span className="text-gray-600">Target Department:</span>
                          <p className="font-medium">{selectedGrievance.targetDepartment}</p>
                        </div>
                        {selectedGrievance.targetOfficer && (
                          <div>
                            <span className="text-gray-600">Target Officer:</span>
                            <p className="font-medium">{selectedGrievance.targetOfficer}</p>
                          </div>
                        )}
                        <div>
                          <span className="text-gray-600">Assigned To:</span>
                          <p className="font-medium">{selectedGrievance.assignedTo}</p>
                        </div>
                      </div>
                    </div>

                    {/* Attachments */}
                    {selectedGrievance.attachments.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Attachments</h3>
                        <div className="space-y-2">
                          {selectedGrievance.attachments.map((attachment, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <FileText className="h-4 w-4 text-gray-500" />
                              <span className="font-medium text-blue-600 cursor-pointer hover:underline">
                                {attachment}
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Tags */}
                    {selectedGrievance.tags.length > 0 && (
                      <div className="bg-gray-50 p-4 rounded-lg">
                        <h3 className="font-semibold text-gray-900 mb-3">Tags</h3>
                        <div className="flex flex-wrap gap-2">
                          {selectedGrievance.tags.map((tag, index) => (
                            <span 
                              key={index}
                              className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GrievanceTab;
