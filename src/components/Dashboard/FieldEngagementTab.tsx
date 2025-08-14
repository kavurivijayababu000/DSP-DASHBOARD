import React, { useState, useEffect } from 'react';
import { MapPin, Users, Clock, Activity, Navigation, AlertTriangle, CheckCircle } from 'lucide-react';

// Field Engagement Props Interface
interface FieldEngagementTabProps {
  userRole: string;
  jurisdiction: string;
}

// Field Operations Interfaces
interface FieldOfficer {
  id: string;
  name: string;
  designation: string;
  badgeNumber: string;
  currentLocation: {
    lat: number;
    lng: number;
    address: string;
    lastUpdate: Date;
  };
  status: 'ON_DUTY' | 'OFF_DUTY' | 'ON_PATROL' | 'RESPONDING' | 'BREAK';
  assignedBeat: string;
  shift: 'MORNING' | 'AFTERNOON' | 'NIGHT';
  contact: string;
  vehicle?: {
    type: 'BIKE' | 'CAR' | 'FOOT_PATROL';
    number?: string;
  };
}

interface PatrolActivity {
  id: string;
  officerId: string;
  officerName: string;
  type: 'ROUTINE_PATROL' | 'INCIDENT_RESPONSE' | 'CHECKPOST' | 'VIP_SECURITY' | 'COMMUNITY_POLICING';
  location: string;
  startTime: Date;
  endTime?: Date;
  status: 'ACTIVE' | 'COMPLETED' | 'INTERRUPTED';
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  incidentId?: string;
}

interface BeatAssignment {
  beatId: string;
  beatName: string;
  area: string;
  assignedOfficers: string[];
  coverage: number; // percentage
  lastPatrolled: Date;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  landmarks: string[];
  population: number;
}

interface FieldStats {
  totalOfficers: number;
  activeOfficers: number;
  onPatrolOfficers: number;
  respondingOfficers: number;
  averageResponseTime: number;
  beatCoverage: number;
  incidentsToday: number;
  completedPatrols: number;
}

const FieldEngagementTab: React.FC<FieldEngagementTabProps> = ({ userRole, jurisdiction }) => {
  const [activeView, setActiveView] = useState('overview');
  const [fieldStats, setFieldStats] = useState<FieldStats | null>(null);
  const [officers, setOfficers] = useState<FieldOfficer[]>([]);
  const [patrolActivities, setPatrolActivities] = useState<PatrolActivity[]>([]);
  const [beatAssignments, setBeatAssignments] = useState<BeatAssignment[]>([]);
  const [selectedOfficer, setSelectedOfficer] = useState<string | null>(null);
  const [refreshInterval, setRefreshInterval] = useState(30); // seconds

  // Generate mock field data based on user role and jurisdiction
  useEffect(() => {
    const generateFieldData = () => {
      const baseMultiplier = userRole === 'DGP' ? 50 : 
                           userRole === 'DIG' ? 10 : 
                           userRole === 'SP' || userRole === 'CP' ? 3 : 1;

      // Generate field statistics
      const mockStats: FieldStats = {
        totalOfficers: Math.round(120 * baseMultiplier + Math.random() * 20),
        activeOfficers: Math.round(95 * baseMultiplier + Math.random() * 15),
        onPatrolOfficers: Math.round(60 * baseMultiplier + Math.random() * 10),
        respondingOfficers: Math.round(8 * baseMultiplier + Math.random() * 5),
        averageResponseTime: Math.round((8 + Math.random() * 6) * 10) / 10,
        beatCoverage: Math.round((82 + Math.random() * 15) * 10) / 10,
        incidentsToday: Math.round(45 * baseMultiplier * 0.3 + Math.random() * 10),
        completedPatrols: Math.round(156 * baseMultiplier * 0.5 + Math.random() * 20)
      };

      // Generate mock officers
      const mockOfficers: FieldOfficer[] = [];
      const statuses = ['ON_DUTY', 'ON_PATROL', 'RESPONDING', 'BREAK'] as const;
      const shifts = ['MORNING', 'AFTERNOON', 'NIGHT'] as const;
      const vehicleTypes = ['BIKE', 'CAR', 'FOOT_PATROL'] as const;

      for (let i = 0; i < Math.min(mockStats.activeOfficers, 50); i++) {
        mockOfficers.push({
          id: `OFFICER-${i + 1}`,
          name: `Officer ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
          designation: ['Constable', 'Head Constable', 'ASI', 'SI'][Math.floor(Math.random() * 4)],
          badgeNumber: `${Math.floor(100000 + Math.random() * 900000)}`,
          currentLocation: {
            lat: 15.9129 + (Math.random() - 0.5) * 0.1,
            lng: 79.7400 + (Math.random() - 0.5) * 0.1,
            address: `${jurisdiction} - Sector ${i + 1}, Beat ${Math.floor(i / 5) + 1}`,
            lastUpdate: new Date(Date.now() - Math.random() * 3600000) // Last hour
          },
          status: statuses[Math.floor(Math.random() * statuses.length)],
          assignedBeat: `Beat-${Math.floor(i / 5) + 1}`,
          shift: shifts[Math.floor(Math.random() * shifts.length)],
          contact: `+91-9${Math.floor(100000000 + Math.random() * 900000000)}`,
          vehicle: {
            type: vehicleTypes[Math.floor(Math.random() * vehicleTypes.length)],
            number: Math.random() > 0.3 ? `AP${Math.floor(10 + Math.random() * 90)}${String.fromCharCode(65 + Math.floor(Math.random() * 26))}${Math.floor(1000 + Math.random() * 9000)}` : undefined
          }
        });
      }

      // Generate patrol activities
      const mockPatrols: PatrolActivity[] = [];
      const activityTypes = ['ROUTINE_PATROL', 'INCIDENT_RESPONSE', 'CHECKPOST', 'VIP_SECURITY', 'COMMUNITY_POLICING'] as const;
      const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'] as const;

      for (let i = 0; i < Math.min(mockStats.completedPatrols, 30); i++) {
        const officer = mockOfficers[Math.floor(Math.random() * mockOfficers.length)];
        const startTime = new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000);
        const isActive = Math.random() > 0.7;
        
        mockPatrols.push({
          id: `PATROL-${i + 1}`,
          officerId: officer?.id || `OFFICER-${i + 1}`,
          officerName: officer?.name || `Officer ${i + 1}`,
          type: activityTypes[Math.floor(Math.random() * activityTypes.length)],
          location: `${jurisdiction} - Area ${Math.floor(Math.random() * 20) + 1}`,
          startTime,
          endTime: isActive ? undefined : new Date(startTime.getTime() + Math.random() * 4 * 60 * 60 * 1000),
          status: isActive ? 'ACTIVE' : ['COMPLETED', 'INTERRUPTED'][Math.floor(Math.random() * 2)] as any,
          description: `Patrol activity ${i + 1} - ${activityTypes[Math.floor(Math.random() * activityTypes.length)].replace(/_/g, ' ').toLowerCase()}`,
          priority: priorities[Math.floor(Math.random() * priorities.length)]
        });
      }

      // Generate beat assignments
      const mockBeats: BeatAssignment[] = [];
      for (let i = 0; i < Math.min(15, baseMultiplier * 3); i++) {
        mockBeats.push({
          beatId: `BEAT-${i + 1}`,
          beatName: `Beat ${i + 1}`,
          area: `${jurisdiction} Sector ${i + 1}`,
          assignedOfficers: mockOfficers.filter(o => o.assignedBeat === `Beat-${i + 1}`).map(o => o.id),
          coverage: Math.round((70 + Math.random() * 25) * 10) / 10,
          lastPatrolled: new Date(Date.now() - Math.random() * 6 * 60 * 60 * 1000),
          riskLevel: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'][Math.floor(Math.random() * 4)] as any,
          landmarks: [`Market ${i + 1}`, `School ${i + 1}`, `Hospital ${i + 1}`, `Station ${i + 1}`].slice(0, Math.floor(Math.random() * 3) + 1),
          population: Math.floor(5000 + Math.random() * 15000)
        });
      }

      setFieldStats(mockStats);
      setOfficers(mockOfficers);
      setPatrolActivities(mockPatrols);
      setBeatAssignments(mockBeats);
    };

    generateFieldData();

    // Set up real-time refresh
    const interval = setInterval(generateFieldData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [userRole, jurisdiction, refreshInterval]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ON_PATROL': return 'bg-green-100 text-green-800 border-green-200';
      case 'RESPONDING': return 'bg-red-100 text-red-800 border-red-200';
      case 'ON_DUTY': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'BREAK': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'OFF_DUTY': return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'ACTIVE': return 'bg-green-100 text-green-800 border-green-200';
      case 'COMPLETED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'INTERRUPTED': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskLevelColor = (risk: string) => {
    switch (risk) {
      case 'CRITICAL': return 'bg-red-100 text-red-800 border-red-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!fieldStats) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading field operations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Real-time Status */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Field Operations Command Center</h2>
            <p className="text-blue-100 mt-1">{jurisdiction} - Real-time Field Monitoring</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Live Updates</span>
            </div>
            <select 
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-white/20 border border-white/30 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-white/50"
            >
              <option value={10}>10s refresh</option>
              <option value={30}>30s refresh</option>
              <option value={60}>1m refresh</option>
            </select>
            <button className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg transition-colors text-sm">
              📡 Command Center
            </button>
          </div>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Officers</p>
              <p className="text-3xl font-bold text-gray-900">{fieldStats.activeOfficers}</p>
              <p className="text-sm text-gray-500">of {fieldStats.totalOfficers} total</p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-6 h-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">On Patrol</p>
              <p className="text-3xl font-bold text-gray-900">{fieldStats.onPatrolOfficers}</p>
              <p className="text-sm text-blue-600">↗ Active patrols</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Navigation className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Avg Response Time</p>
              <p className="text-3xl font-bold text-gray-900">{fieldStats.averageResponseTime}</p>
              <p className="text-sm text-orange-600">minutes</p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Beat Coverage</p>
              <p className="text-3xl font-bold text-gray-900">{fieldStats.beatCoverage}%</p>
              <p className="text-sm text-green-600">↑ 3.2% today</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <MapPin className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
        <nav className="flex space-x-4 mb-6">
          {[
            { id: 'overview', label: 'Live Overview', icon: '📊' },
            { id: 'officers', label: 'Officer Tracking', icon: '👮' },
            { id: 'patrols', label: 'Patrol Activities', icon: '🚔' },
            { id: 'beats', label: 'Beat Management', icon: '🗺️' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === tab.id
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab Content */}
        {activeView === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Real-time Activity Feed */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2 text-blue-600" />
                  Real-time Activity Feed
                </h3>
                <div className="space-y-3 max-h-80 overflow-y-auto">
                  {patrolActivities.slice(0, 8).map((activity) => (
                    <div key={activity.id} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                      <div>
                        <p className="font-medium text-sm">{activity.officerName}</p>
                        <p className="text-xs text-gray-600">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.location}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                        <p className="text-xs text-gray-500 mt-1">
                          {activity.startTime.toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-gray-50 rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <button className="w-full bg-red-600 hover:bg-red-700 text-white p-3 rounded-lg text-left flex items-center justify-between transition-colors">
                    <span>🚨 Emergency Dispatch</span>
                    <AlertTriangle className="w-5 h-5" />
                  </button>
                  <button className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg text-left flex items-center justify-between transition-colors">
                    <span>📍 Assign New Patrol</span>
                    <MapPin className="w-5 h-5" />
                  </button>
                  <button className="w-full bg-green-600 hover:bg-green-700 text-white p-3 rounded-lg text-left flex items-center justify-between transition-colors">
                    <span>✅ Mark Beat Complete</span>
                    <CheckCircle className="w-5 h-5" />
                  </button>
                  <button className="w-full bg-purple-600 hover:bg-purple-700 text-white p-3 rounded-lg text-left flex items-center justify-between transition-colors">
                    <span>📊 Generate Report</span>
                    <Activity className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeView === 'officers' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Officer Tracking</h3>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Status</option>
                  <option>On Patrol</option>
                  <option>Responding</option>
                  <option>On Duty</option>
                </select>
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Shifts</option>
                  <option>Morning</option>
                  <option>Afternoon</option>
                  <option>Night</option>
                </select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {officers.slice(0, 12).map((officer) => (
                <div key={officer.id} className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold text-sm">{officer.name}</h4>
                      <p className="text-xs text-gray-600">{officer.designation} - {officer.badgeNumber}</p>
                    </div>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(officer.status)}`}>
                      {officer.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs text-gray-600">
                    <div className="flex items-center">
                      <MapPin className="w-3 h-3 mr-1" />
                      <span className="truncate">{officer.currentLocation.address}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      <span>Updated {Math.floor((Date.now() - officer.currentLocation.lastUpdate.getTime()) / 60000)}m ago</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Beat: {officer.assignedBeat}</span>
                      <span className="text-blue-600">{officer.shift}</span>
                    </div>
                  </div>
                  <button 
                    onClick={() => setSelectedOfficer(selectedOfficer === officer.id ? null : officer.id)}
                    className="mt-3 w-full bg-blue-50 hover:bg-blue-100 text-blue-700 text-xs py-2 rounded transition-colors"
                  >
                    {selectedOfficer === officer.id ? 'Hide Details' : 'View Details'}
                  </button>
                  {selectedOfficer === officer.id && (
                    <div className="mt-3 pt-3 border-t border-gray-200 text-xs space-y-1">
                      <div>Contact: {officer.contact}</div>
                      <div>Vehicle: {officer.vehicle?.type} {officer.vehicle?.number || 'N/A'}</div>
                      <div>Location: {officer.currentLocation.lat.toFixed(4)}, {officer.currentLocation.lng.toFixed(4)}</div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {activeView === 'patrols' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Patrol Activities</h3>
              <div className="flex space-x-2">
                <select className="border border-gray-300 rounded px-3 py-1 text-sm">
                  <option>All Activities</option>
                  <option>Routine Patrol</option>
                  <option>Incident Response</option>
                  <option>VIP Security</option>
                </select>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded text-sm transition-colors">
                  + New Patrol
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Officer</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Activity</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Location</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Priority</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Status</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Duration</th>
                    <th className="text-left py-3 px-4 font-semibold text-sm text-gray-600">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {patrolActivities.slice(0, 15).map((activity) => (
                    <tr key={activity.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 text-sm">{activity.officerName}</td>
                      <td className="py-3 px-4 text-sm">{activity.type.replace(/_/g, ' ')}</td>
                      <td className="py-3 px-4 text-sm">{activity.location}</td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getPriorityColor(activity.priority)}`}>
                          {activity.priority}
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(activity.status)}`}>
                          {activity.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm">
                        {activity.status === 'ACTIVE' 
                          ? `${Math.floor((Date.now() - activity.startTime.getTime()) / 60000)}m`
                          : activity.endTime 
                            ? `${Math.floor((activity.endTime.getTime() - activity.startTime.getTime()) / 60000)}m`
                            : 'N/A'
                        }
                      </td>
                      <td className="py-3 px-4">
                        <button className="text-blue-600 hover:text-blue-800 text-sm">View</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeView === 'beats' && (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-semibold">Beat Management</h3>
              <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm transition-colors">
                📍 Optimize Beats
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {beatAssignments.map((beat) => (
                <div key={beat.beatId} className="bg-white rounded-lg border border-gray-200 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold">{beat.beatName}</h4>
                    <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium border ${getRiskLevelColor(beat.riskLevel)}`}>
                      {beat.riskLevel} Risk
                    </span>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="text-gray-600">Area:</span> {beat.area}
                    </div>
                    <div>
                      <span className="text-gray-600">Coverage:</span> {beat.coverage}%
                    </div>
                    <div>
                      <span className="text-gray-600">Assigned Officers:</span> {beat.assignedOfficers.length}
                    </div>
                    <div>
                      <span className="text-gray-600">Population:</span> {beat.population.toLocaleString()}
                    </div>
                    <div>
                      <span className="text-gray-600">Last Patrol:</span> {Math.floor((Date.now() - beat.lastPatrolled.getTime()) / 3600000)}h ago
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="text-xs text-gray-600">
                      <span className="font-medium">Landmarks:</span> {beat.landmarks.join(', ')}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FieldEngagementTab;
