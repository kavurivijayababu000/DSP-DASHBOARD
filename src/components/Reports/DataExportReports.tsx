import React, { useState, useEffect, useCallback } from 'react';
import {
  FileText,
  Download,
  Upload,
  Filter,
  Calendar,
  BarChart3,
  PieChart,
  TrendingUp,
  TrendingDown,
  Activity,
  Users,
  MapPin,
  Clock,
  Settings,
  Search,
  RefreshCw,
  Eye,
  Share2,
  Mail,
  Printer,
  FileDown,
  FileSpreadsheet,
  FileImage,
  Database,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  Zap,
  Target,
  Award,
  Shield,
  Phone,
  MessageSquare,
  Clipboard,
  List,
  Grid,
  Plus,
  Minus,
  Save,
  X,
  ExternalLink,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

// Report interfaces
interface ReportTemplate {
  id: string;
  name: string;
  description: string;
  category: 'CRIME' | 'PERFORMANCE' | 'ANALYTICS' | 'GRIEVANCE' | 'FIELD' | 'ADMIN';
  type: 'SUMMARY' | 'DETAILED' | 'COMPARATIVE' | 'TREND';
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | 'CUSTOM';
  format: ('PDF' | 'EXCEL' | 'CSV' | 'JSON')[];
  parameters: ReportParameter[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  usage: number;
  lastGenerated?: Date;
}

interface ReportParameter {
  id: string;
  name: string;
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT' | 'MULTISELECT' | 'BOOLEAN';
  required: boolean;
  defaultValue?: any;
  options?: string[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
}

interface GeneratedReport {
  id: string;
  templateId: string;
  templateName: string;
  name: string;
  parameters: { [key: string]: any };
  format: 'PDF' | 'EXCEL' | 'CSV' | 'JSON';
  status: 'GENERATING' | 'COMPLETED' | 'FAILED' | 'SCHEDULED';
  progress: number;
  generatedAt: Date;
  generatedBy: string;
  fileSize: string;
  downloadUrl?: string;
  error?: string;
  scheduledFor?: Date;
  isScheduled: boolean;
}

interface ReportStats {
  totalReports: number;
  reportsToday: number;
  averageGenerationTime: number;
  mostUsedTemplate: string;
  storageUsed: string;
  categories: {
    [key: string]: {
      count: number;
      size: string;
    };
  };
}

interface DataExportReportsProps {
  userRole: string;
  permissions: string[];
}

const DataExportReports: React.FC<DataExportReportsProps> = ({ userRole, permissions }) => {
  const [activeTab, setActiveTab] = useState<'templates' | 'reports' | 'scheduled' | 'analytics'>('templates');
  const [templates, setTemplates] = useState<ReportTemplate[]>([]);
  const [generatedReports, setGeneratedReports] = useState<GeneratedReport[]>([]);
  const [stats, setStats] = useState<ReportStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [selectedTemplate, setSelectedTemplate] = useState<ReportTemplate | null>(null);
  const [showGenerateModal, setShowGenerateModal] = useState(false);
  const [reportParameters, setReportParameters] = useState<{ [key: string]: any }>({});
  const [generatingReports, setGeneratingReports] = useState<Set<string>>(new Set());
  const [autoRefresh, setAutoRefresh] = useState(false);

  // Initialize data
  useEffect(() => {
    loadReportsData();
  }, []);

  // Auto-refresh for report status
  useEffect(() => {
    if (!autoRefresh) return;

    const interval = setInterval(() => {
      loadReportsData();
    }, 30000); // Every 30 seconds

    return () => clearInterval(interval);
  }, [autoRefresh]);

  const loadReportsData = async () => {
    setLoading(true);

    // Simulate API calls
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock report templates
    const mockTemplates: ReportTemplate[] = [
      {
        id: 'template1',
        name: 'Crime Statistics Report',
        description: 'Comprehensive crime statistics with trends and analysis',
        category: 'CRIME',
        type: 'SUMMARY',
        frequency: 'MONTHLY',
        format: ['PDF', 'EXCEL'],
        parameters: [
          {
            id: 'dateRange',
            name: 'dateRange',
            label: 'Date Range',
            type: 'DATE',
            required: true
          },
          {
            id: 'jurisdiction',
            name: 'jurisdiction',
            label: 'Jurisdiction',
            type: 'SELECT',
            required: false,
            options: ['All', 'Anantapur', 'Kurnool', 'Guntur']
          },
          {
            id: 'crimeTypes',
            name: 'crimeTypes',
            label: 'Crime Types',
            type: 'MULTISELECT',
            required: false,
            options: ['Theft', 'Assault', 'Fraud', 'Traffic Violation', 'Other']
          }
        ],
        createdAt: new Date('2024-01-15'),
        updatedAt: new Date('2024-02-10'),
        isActive: true,
        usage: 45,
        lastGenerated: new Date('2024-01-28')
      },
      {
        id: 'template2',
        name: 'Performance Dashboard Report',
        description: 'Officer performance metrics and KPI analysis',
        category: 'PERFORMANCE',
        type: 'DETAILED',
        frequency: 'WEEKLY',
        format: ['PDF', 'EXCEL', 'CSV'],
        parameters: [
          {
            id: 'period',
            name: 'period',
            label: 'Reporting Period',
            type: 'SELECT',
            required: true,
            options: ['Last Week', 'Last Month', 'Last Quarter', 'Custom']
          },
          {
            id: 'department',
            name: 'department',
            label: 'Department',
            type: 'SELECT',
            required: false,
            options: ['All', 'Traffic', 'Crime Investigation', 'Law & Order']
          }
        ],
        createdAt: new Date('2024-01-20'),
        updatedAt: new Date('2024-02-05'),
        isActive: true,
        usage: 32,
        lastGenerated: new Date('2024-01-30')
      },
      {
        id: 'template3',
        name: 'Grievance Analysis Report',
        description: 'Public grievance trends and resolution metrics',
        category: 'GRIEVANCE',
        type: 'TREND',
        frequency: 'MONTHLY',
        format: ['PDF', 'EXCEL'],
        parameters: [
          {
            id: 'timeframe',
            name: 'timeframe',
            label: 'Time Frame',
            type: 'SELECT',
            required: true,
            options: ['Last 3 Months', 'Last 6 Months', 'Last Year']
          },
          {
            id: 'priority',
            name: 'priority',
            label: 'Priority Level',
            type: 'SELECT',
            required: false,
            options: ['All', 'High', 'Medium', 'Low']
          }
        ],
        createdAt: new Date('2024-01-25'),
        updatedAt: new Date('2024-02-15'),
        isActive: true,
        usage: 28,
        lastGenerated: new Date('2024-01-25')
      },
      {
        id: 'template4',
        name: 'Field Operations Summary',
        description: 'Field team activities and patrol effectiveness report',
        category: 'FIELD',
        type: 'SUMMARY',
        frequency: 'DAILY',
        format: ['PDF', 'CSV'],
        parameters: [
          {
            id: 'date',
            name: 'date',
            label: 'Report Date',
            type: 'DATE',
            required: true
          },
          {
            id: 'includeGPS',
            name: 'includeGPS',
            label: 'Include GPS Tracking Data',
            type: 'BOOLEAN',
            required: false,
            defaultValue: false
          }
        ],
        createdAt: new Date('2024-02-01'),
        updatedAt: new Date('2024-02-20'),
        isActive: true,
        usage: 67,
        lastGenerated: new Date()
      }
    ];

    // Mock generated reports
    const mockReports: GeneratedReport[] = [
      {
        id: 'report1',
        templateId: 'template1',
        templateName: 'Crime Statistics Report',
        name: 'Crime Statistics - January 2024',
        parameters: { dateRange: 'January 2024', jurisdiction: 'Anantapur' },
        format: 'PDF',
        status: 'COMPLETED',
        progress: 100,
        generatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        generatedBy: 'Rajesh Kumar',
        fileSize: '2.4 MB',
        downloadUrl: '/reports/crime-stats-jan2024.pdf',
        isScheduled: false
      },
      {
        id: 'report2',
        templateId: 'template2',
        templateName: 'Performance Dashboard Report',
        name: 'Performance Report - Week 4',
        parameters: { period: 'Last Week', department: 'All' },
        format: 'EXCEL',
        status: 'GENERATING',
        progress: 65,
        generatedAt: new Date(),
        generatedBy: 'System',
        fileSize: '0 MB',
        isScheduled: false
      },
      {
        id: 'report3',
        templateId: 'template4',
        templateName: 'Field Operations Summary',
        name: 'Field Ops - 31st January 2024',
        parameters: { date: '2024-01-31', includeGPS: true },
        format: 'CSV',
        status: 'FAILED',
        progress: 0,
        generatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000),
        generatedBy: 'System',
        fileSize: '0 MB',
        error: 'Insufficient data for the selected date',
        isScheduled: false
      },
      {
        id: 'report4',
        templateId: 'template1',
        templateName: 'Crime Statistics Report',
        name: 'Monthly Crime Report - February 2024',
        parameters: { dateRange: 'February 2024' },
        format: 'PDF',
        status: 'SCHEDULED',
        progress: 0,
        generatedAt: new Date(),
        generatedBy: 'System',
        fileSize: '0 MB',
        scheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000),
        isScheduled: true
      }
    ];

    // Mock stats
    const mockStats: ReportStats = {
      totalReports: 156,
      reportsToday: 8,
      averageGenerationTime: 2.3,
      mostUsedTemplate: 'Field Operations Summary',
      storageUsed: '1.2 GB',
      categories: {
        CRIME: { count: 45, size: '450 MB' },
        PERFORMANCE: { count: 32, size: '280 MB' },
        GRIEVANCE: { count: 28, size: '320 MB' },
        FIELD: { count: 67, size: '180 MB' },
        ANALYTICS: { count: 15, size: '95 MB' }
      }
    };

    setTemplates(mockTemplates);
    setGeneratedReports(mockReports);
    setStats(mockStats);
    setLoading(false);
  };

  const generateReport = async (template: ReportTemplate, parameters: any, format: string) => {
    const reportId = `report_${Date.now()}`;
    setGeneratingReports(prev => new Set(prev).add(reportId));

    const newReport: GeneratedReport = {
      id: reportId,
      templateId: template.id,
      templateName: template.name,
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      parameters,
      format: format as any,
      status: 'GENERATING',
      progress: 0,
      generatedAt: new Date(),
      generatedBy: userRole,
      fileSize: '0 MB',
      isScheduled: false
    };

    setGeneratedReports(prev => [newReport, ...prev]);

    // Simulate report generation progress
    const progressInterval = setInterval(() => {
      setGeneratedReports(prev => prev.map(report => {
        if (report.id === reportId) {
          const newProgress = Math.min(report.progress + Math.random() * 20, 100);
          return {
            ...report,
            progress: newProgress,
            status: newProgress === 100 ? 'COMPLETED' : 'GENERATING',
            fileSize: newProgress === 100 ? `${(Math.random() * 5 + 1).toFixed(1)} MB` : '0 MB',
            downloadUrl: newProgress === 100 ? `/reports/${reportId}.${format.toLowerCase()}` : undefined
          };
        }
        return report;
      }));

      const currentReport = generatedReports.find(r => r.id === reportId);
      if (currentReport && currentReport.progress >= 100) {
        clearInterval(progressInterval);
        setGeneratingReports(prev => {
          const newSet = new Set(prev);
          newSet.delete(reportId);
          return newSet;
        });
      }
    }, 1000);

    setShowGenerateModal(false);
    setSelectedTemplate(null);
    setReportParameters({});
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'CRIME': return <Shield className="h-4 w-4" />;
      case 'PERFORMANCE': return <TrendingUp className="h-4 w-4" />;
      case 'ANALYTICS': return <BarChart3 className="h-4 w-4" />;
      case 'GRIEVANCE': return <MessageSquare className="h-4 w-4" />;
      case 'FIELD': return <MapPin className="h-4 w-4" />;
      case 'ADMIN': return <Settings className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const getStatusIcon = (status: GeneratedReport['status']) => {
    switch (status) {
      case 'COMPLETED': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'GENERATING': return <RefreshCw className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'FAILED': return <XCircle className="h-4 w-4 text-red-500" />;
      case 'SCHEDULED': return <Clock className="h-4 w-4 text-yellow-500" />;
      default: return <Info className="h-4 w-4 text-gray-500" />;
    }
  };

  const getFormatIcon = (format: string) => {
    switch (format) {
      case 'PDF': return <FileText className="h-4 w-4 text-red-500" />;
      case 'EXCEL': return <FileSpreadsheet className="h-4 w-4 text-green-500" />;
      case 'CSV': return <Database className="h-4 w-4 text-blue-500" />;
      case 'JSON': return <FileDown className="h-4 w-4 text-purple-500" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === 'ALL' || template.category === filterCategory;
    return matchesSearch && matchesCategory;
  });

  const filteredReports = generatedReports.filter(report => {
    const matchesSearch = report.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         report.templateName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'ALL' || report.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  // Templates Tab Content
  const renderTemplatesTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Report Templates</h3>
          <p className="text-white/70">Manage and configure report templates</p>
        </div>
        <button className="px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Template
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search templates..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="ALL">All Categories</option>
          <option value="CRIME">Crime</option>
          <option value="PERFORMANCE">Performance</option>
          <option value="ANALYTICS">Analytics</option>
          <option value="GRIEVANCE">Grievance</option>
          <option value="FIELD">Field</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map(template => (
          <div key={template.id} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6 hover:bg-white/15 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600/80 rounded-lg">
                  {getCategoryIcon(template.category)}
                </div>
                <div>
                  <h4 className="font-semibold text-white">{template.name}</h4>
                  <p className="text-white/70 text-sm">{template.category}</p>
                </div>
              </div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                template.isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100'
              }`}>
                {template.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>

            <p className="text-white/80 text-sm mb-4 line-clamp-2">{template.description}</p>

            <div className="space-y-3 mb-6">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Type</span>
                <span className="text-white">{template.type}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Frequency</span>
                <span className="text-white">{template.frequency}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Usage</span>
                <span className="text-white">{template.usage} reports</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Formats</span>
                <div className="flex items-center gap-1">
                  {template.format.map(format => (
                    <div key={format} className="flex items-center gap-1">
                      {getFormatIcon(format)}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedTemplate(template);
                  setShowGenerateModal(true);
                }}
                className="flex-1 px-3 py-2 bg-green-600/80 text-white rounded-lg hover:bg-green-700/80 transition-colors flex items-center justify-center gap-2 text-sm"
              >
                <Download className="h-4 w-4" />
                Generate
              </button>
              <button className="px-3 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors flex items-center justify-center">
                <Eye className="h-4 w-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12 text-white/60">
          <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <p>No templates found matching your criteria</p>
        </div>
      )}
    </div>
  );

  // Generated Reports Tab Content
  const renderReportsTab = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-xl font-semibold text-white mb-1">Generated Reports</h3>
          <p className="text-white/70">View and manage generated reports</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
              autoRefresh 
                ? 'bg-green-600/80 text-white hover:bg-green-700/80' 
                : 'bg-gray-600/80 text-white hover:bg-gray-700/80'
            }`}
          >
            <RefreshCw className={`h-4 w-4 ${autoRefresh ? 'animate-spin' : ''}`} />
            {autoRefresh ? 'Auto Refresh' : 'Manual Refresh'}
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex gap-4">
        <div className="flex-1">
          <input
            type="text"
            placeholder="Search reports..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-4 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
        >
          <option value="ALL">All Status</option>
          <option value="COMPLETED">Completed</option>
          <option value="GENERATING">Generating</option>
          <option value="FAILED">Failed</option>
          <option value="SCHEDULED">Scheduled</option>
        </select>
      </div>

      {/* Reports List */}
      <div className="space-y-4">
        {filteredReports.map(report => (
          <div key={report.id} className="bg-white/10 backdrop-blur-sm rounded-lg border border-white/20 p-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-4 flex-1">
                <div className="p-2 bg-purple-600/80 rounded-lg">
                  {getFormatIcon(report.format)}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h4 className="font-semibold text-white">{report.name}</h4>
                    {getStatusIcon(report.status)}
                    <span className="text-white/70 text-sm">
                      {report.format} • {report.fileSize}
                    </span>
                  </div>
                  
                  <p className="text-white/70 text-sm mb-2">Template: {report.templateName}</p>
                  
                  {report.status === 'GENERATING' && (
                    <div className="mb-2">
                      <div className="flex justify-between items-center text-sm text-white/70 mb-1">
                        <span>Progress</span>
                        <span>{Math.round(report.progress)}%</span>
                      </div>
                      <div className="w-full bg-white/20 rounded-full h-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${report.progress}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {report.error && (
                    <div className="mb-2 p-2 bg-red-500/20 border border-red-500/30 rounded text-red-200 text-sm">
                      {report.error}
                    </div>
                  )}
                  
                  <div className="flex items-center gap-4 text-sm text-white/60">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {report.generatedBy}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {report.generatedAt.toLocaleString('en-IN')}
                    </span>
                    {report.scheduledFor && (
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Scheduled: {report.scheduledFor.toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2 ml-4">
                {report.status === 'COMPLETED' && report.downloadUrl && (
                  <>
                    <button className="px-3 py-1 bg-green-600/80 text-white rounded hover:bg-green-700/80 transition-colors text-sm flex items-center gap-1">
                      <Download className="h-3 w-3" />
                      Download
                    </button>
                    <button className="px-3 py-1 bg-blue-600/80 text-white rounded hover:bg-blue-700/80 transition-colors text-sm flex items-center gap-1">
                      <Share2 className="h-3 w-3" />
                      Share
                    </button>
                  </>
                )}
                {report.status === 'FAILED' && (
                  <button className="px-3 py-1 bg-orange-600/80 text-white rounded hover:bg-orange-700/80 transition-colors text-sm flex items-center gap-1">
                    <RefreshCw className="h-3 w-3" />
                    Retry
                  </button>
                )}
                <button className="p-1 text-white/60 hover:text-white hover:bg-white/10 rounded">
                  <Eye className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        ))}
        
        {filteredReports.length === 0 && (
          <div className="text-center py-12 text-white/60">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No reports found matching your criteria</p>
          </div>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-8 text-center">
          <RefreshCw className="h-12 w-12 text-white/60 mx-auto mb-4 animate-spin" />
          <p className="text-white/80 text-lg">Loading Reports System...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-3 bg-indigo-600/80 rounded-lg">
              <FileText className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-white">Data Export & Reports</h1>
              <p className="text-white/70">Generate comprehensive reports and export data</p>
            </div>
          </div>

          {/* Quick Stats */}
          {stats && (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Total Reports</p>
                    <p className="text-2xl font-bold text-white">{stats.totalReports}</p>
                  </div>
                  <FileText className="h-8 w-8 text-blue-400" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Today</p>
                    <p className="text-2xl font-bold text-white">{stats.reportsToday}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-green-400" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Avg Time</p>
                    <p className="text-2xl font-bold text-white">{stats.averageGenerationTime}m</p>
                  </div>
                  <Clock className="h-8 w-8 text-yellow-400" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Storage Used</p>
                    <p className="text-2xl font-bold text-white">{stats.storageUsed}</p>
                  </div>
                  <Database className="h-8 w-8 text-purple-400" />
                </div>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white/70 text-sm">Most Used</p>
                    <p className="text-lg font-bold text-white text-xs leading-tight">{stats.mostUsedTemplate}</p>
                  </div>
                  <Award className="h-8 w-8 text-orange-400" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            {[
              { id: 'templates', label: 'Templates', icon: FileText },
              { id: 'reports', label: 'Generated Reports', icon: Download },
              { id: 'scheduled', label: 'Scheduled Reports', icon: Calendar },
              { id: 'analytics', label: 'Report Analytics', icon: BarChart3 }
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
        <div className="bg-white/10 backdrop-blur-sm border border-white/30 rounded-xl p-6">
          {activeTab === 'templates' && renderTemplatesTab()}
          {activeTab === 'reports' && renderReportsTab()}
          
          {/* Placeholder for other tabs */}
          {!['templates', 'reports'].includes(activeTab) && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📊</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1).replace(/([A-Z])/g, ' $1')} Section
              </h3>
              <p className="text-white/80">Advanced reporting features under development</p>
            </div>
          )}
        </div>

        {/* Generate Report Modal */}
        {showGenerateModal && selectedTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-[600px] max-h-[80vh] overflow-y-auto">
              <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="text-xl font-semibold">Generate Report</h3>
                  <button
                    onClick={() => {
                      setShowGenerateModal(false);
                      setSelectedTemplate(null);
                      setReportParameters({});
                    }}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="text-white/90 mt-2">{selectedTemplate.name}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Report Parameters */}
                {selectedTemplate.parameters.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-800 mb-4">Report Parameters</h4>
                    <div className="space-y-4">
                      {selectedTemplate.parameters.map(param => (
                        <div key={param.id}>
                          <label className="block text-gray-700 font-medium mb-1">
                            {param.label}
                            {param.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          
                          {param.type === 'TEXT' && (
                            <input
                              type="text"
                              value={reportParameters[param.id] || param.defaultValue || ''}
                              onChange={(e) => setReportParameters({
                                ...reportParameters,
                                [param.id]: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                              placeholder={`Enter ${param.label.toLowerCase()}`}
                            />
                          )}
                          
                          {param.type === 'DATE' && (
                            <input
                              type="date"
                              value={reportParameters[param.id] || param.defaultValue || ''}
                              onChange={(e) => setReportParameters({
                                ...reportParameters,
                                [param.id]: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            />
                          )}
                          
                          {param.type === 'SELECT' && (
                            <select
                              value={reportParameters[param.id] || param.defaultValue || ''}
                              onChange={(e) => setReportParameters({
                                ...reportParameters,
                                [param.id]: e.target.value
                              })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500/50"
                            >
                              <option value="">Select {param.label.toLowerCase()}</option>
                              {param.options?.map(option => (
                                <option key={option} value={option}>{option}</option>
                              ))}
                            </select>
                          )}
                          
                          {param.type === 'BOOLEAN' && (
                            <label className="flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={reportParameters[param.id] || param.defaultValue || false}
                                onChange={(e) => setReportParameters({
                                  ...reportParameters,
                                  [param.id]: e.target.checked
                                })}
                                className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                              />
                              <span className="text-gray-700">Enable {param.label.toLowerCase()}</span>
                            </label>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Format Selection */}
                <div>
                  <h4 className="font-semibold text-gray-800 mb-4">Output Format</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {selectedTemplate.format.map(format => (
                      <button
                        key={format}
                        onClick={() => generateReport(selectedTemplate, reportParameters, format)}
                        className="flex items-center justify-center gap-2 p-3 border-2 border-gray-300 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-colors"
                      >
                        {getFormatIcon(format)}
                        <span className="font-medium">{format}</span>
                      </button>
                    ))}
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

export default DataExportReports;
