import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';

interface SDPO {
  id: string;
  name: string;
  district: string;
  range: string;
  jurisdiction: string;
  performance: {
    rank: number;
    score: number;
    grade: 'A+' | 'A' | 'B+' | 'B' | 'C' | 'D';
  };
  metrics: {
    casesResolved: number;
    responseTime: number;
    citizenSatisfaction: number;
    inspections: number;
    communityMeetings: number;
  };
  trends: {
    month: string;
    score: number;
    cases: number;
  }[];
}

interface SDPODetailModalProps {
  sdpo: SDPO;
  isOpen: boolean;
  onClose: () => void;
}

const SDPODetailModal: React.FC<SDPODetailModalProps> = ({ sdpo, isOpen, onClose }) => {
  if (!isOpen) return null;

  const caseTypeData = [
    { name: 'Property Crime', value: 35, cases: 45 },
    { name: 'Violent Crime', value: 20, cases: 26 },
    { name: 'Traffic Violations', value: 25, cases: 32 },
    { name: 'Others', value: 20, cases: 25 }
  ];

  const monthlyActivityData = [
    { month: 'Jan', inspections: 12, meetings: 3, patrols: 25 },
    { month: 'Feb', inspections: 14, meetings: 4, patrols: 28 },
    { month: 'Mar', inspections: 16, meetings: 3, patrols: 30 },
    { month: 'Apr', inspections: 15, meetings: 2, patrols: 32 }
  ];

  const COLORS = ['#2563eb', '#f59e0b', '#10b981', '#ef4444'];

  const getGradeColor = (grade: string) => {
    switch (grade) {
      case 'A+': return 'bg-green-500 text-white';
      case 'A': return 'bg-green-400 text-white';
      case 'B+': return 'bg-yellow-500 text-white';
      case 'B': return 'bg-yellow-400 text-black';
      case 'C': return 'bg-orange-500 text-white';
      case 'D': return 'bg-red-500 text-white';
      default: return 'bg-gray-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-800">{sdpo.name}</h2>
            <p className="text-gray-600">{sdpo.jurisdiction}, {sdpo.district}</p>
          </div>
          <div className="flex items-center space-x-3">
            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getGradeColor(sdpo.performance.grade)}`}>
              Grade {sdpo.performance.grade}
            </span>
            <span className="text-sm text-gray-500">Rank #{sdpo.performance.rank}</span>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold"
            >
              ×
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-ap-blue-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-ap-blue-600">{sdpo.performance.score}%</p>
              <p className="text-sm text-gray-600">Overall Score</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-green-600">{sdpo.metrics.casesResolved}%</p>
              <p className="text-sm text-gray-600">Cases Resolved</p>
            </div>
            <div className="bg-yellow-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-yellow-600">{sdpo.metrics.responseTime}</p>
              <p className="text-sm text-gray-600">Avg Response (min)</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-purple-600">{sdpo.metrics.citizenSatisfaction}/5</p>
              <p className="text-sm text-gray-600">Satisfaction</p>
            </div>
            <div className="bg-indigo-50 p-4 rounded-lg text-center">
              <p className="text-2xl font-bold text-indigo-600">{sdpo.metrics.inspections}</p>
              <p className="text-sm text-gray-600">Inspections</p>
            </div>
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Performance Trend */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Trend</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={sdpo.trends}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line type="monotone" dataKey="score" stroke="#2563eb" strokeWidth={3} />
                  <Line type="monotone" dataKey="cases" stroke="#10b981" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Case Types Distribution */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Case Types Distribution</h3>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={caseTypeData}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {caseTypeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Monthly Activities */}
          <div className="bg-white border border-gray-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Activities</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyActivityData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Bar dataKey="inspections" fill="#2563eb" name="Inspections" />
                <Bar dataKey="meetings" fill="#f59e0b" name="Community Meetings" />
                <Bar dataKey="patrols" fill="#10b981" name="Patrols" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Detailed Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Performance Details */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Performance Details</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Crime Prevention Score</span>
                  <span className="font-semibold">92%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Investigation Quality</span>
                  <span className="font-semibold">89%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Community Engagement</span>
                  <span className="font-semibold">94%</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="text-gray-600">Administrative Compliance</span>
                  <span className="font-semibold">87%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600">Training Participation</span>
                  <span className="font-semibold">96%</span>
                </div>
              </div>
            </div>

            {/* Recent Activities */}
            <div className="bg-white border border-gray-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
              <div className="space-y-3">
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">🔍</span>
                  <div>
                    <p className="font-medium text-sm">Station Inspection</p>
                    <p className="text-xs text-gray-600">Conducted surprise inspection at 3 stations</p>
                    <p className="text-xs text-gray-500">2 hours ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">👥</span>
                  <div>
                    <p className="font-medium text-sm">Community Meeting</p>
                    <p className="text-xs text-gray-600">Addressed citizen concerns in village council</p>
                    <p className="text-xs text-gray-500">1 day ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">📋</span>
                  <div>
                    <p className="font-medium text-sm">Case Resolution</p>
                    <p className="text-xs text-gray-600">Solved property theft case within 48 hours</p>
                    <p className="text-xs text-gray-500">2 days ago</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                  <span className="text-lg">🎓</span>
                  <div>
                    <p className="font-medium text-sm">Training Session</p>
                    <p className="text-xs text-gray-600">Conducted cybercrime awareness training</p>
                    <p className="text-xs text-gray-500">3 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
            <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">
              📧 Send Message
            </button>
            <button className="px-4 py-2 bg-ap-blue-600 text-white rounded-lg hover:bg-ap-blue-700">
              📊 View Full Report
            </button>
            <button 
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SDPODetailModal;
