import React, { useState, useEffect, useRef } from 'react';
import { 
  User, 
  Edit3, 
  Save, 
  X, 
  Camera, 
  Shield, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar, 
  Award, 
  Settings,
  Lock,
  Eye,
  EyeOff,
  Bell,
  Globe,
  Clock,
  Star,
  TrendingUp,
  Users,
  FileText,
  Activity,
  Key,
  Smartphone,
  Wifi,
  Database,
  AlertTriangle,
  CheckCircle,
  Download,
  Upload,
  RefreshCw,
  Trash2,
  Plus,
  Minus,
  Badge,
  Briefcase,
  GraduationCap,
  Heart,
  Home
} from 'lucide-react';

// Enhanced user profile interfaces
interface UserProfile {
  id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  rank: string;
  designation: string;
  department: string;
  jurisdiction: string;
  station: string;
  avatar: string;
  joinDate: Date;
  lastLogin: Date;
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED' | 'ON_LEAVE';
  
  // Personal Information
  personalInfo: {
    dateOfBirth: Date;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
    address: {
      street: string;
      city: string;
      district: string;
      state: string;
      pincode: string;
    };
    emergencyContact: {
      name: string;
      relationship: string;
      phone: string;
    };
    bloodGroup: string;
    maritalStatus: 'SINGLE' | 'MARRIED' | 'DIVORCED' | 'WIDOWED';
  };
  
  // Professional Information
  professionalInfo: {
    badgeNumber: string;
    serviceNumber: string;
    dateOfJoining: Date;
    currentPosting: string;
    previousPostings: Array<{
      location: string;
      designation: string;
      fromDate: Date;
      toDate: Date;
    }>;
    qualifications: Array<{
      degree: string;
      institution: string;
      year: number;
      grade: string;
    }>;
    trainings: Array<{
      program: string;
      institution: string;
      duration: string;
      completedDate: Date;
      certificate: string;
    }>;
    specializations: string[];
    languages: string[];
  };
  
  // Performance Metrics
  performance: {
    overallScore: number;
    casesSolved: number;
    averageResponseTime: number;
    citizenFeedback: number;
    commendations: Array<{
      title: string;
      description: string;
      date: Date;
      issuedBy: string;
    }>;
    penalties: Array<{
      type: string;
      description: string;
      date: Date;
      status: 'ACTIVE' | 'RESOLVED';
    }>;
  };
  
  // Security Settings
  security: {
    lastPasswordChange: Date;
    twoFactorEnabled: boolean;
    sessionTimeout: number;
    allowedIPs: string[];
    loginHistory: Array<{
      timestamp: Date;
      ipAddress: string;
      location: string;
      device: string;
      success: boolean;
    }>;
  };
  
  // Preferences
  preferences: {
    theme: 'LIGHT' | 'DARK' | 'AUTO';
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      categories: { [key: string]: boolean };
    };
    dashboard: {
      defaultTab: string;
      layout: 'COMPACT' | 'DETAILED';
      refreshRate: number;
    };
  };
}

interface ProfileManagementProps {
  userRole: string;
  userId: string;
  onProfileUpdate?: (profile: UserProfile) => void;
}

const ProfileManagement: React.FC<ProfileManagementProps> = ({ userRole, userId, onProfileUpdate }) => {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState<'personal' | 'professional' | 'performance' | 'security' | 'preferences'>('personal');
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: ''
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize profile data
  useEffect(() => {
    loadProfile();
  }, [userId]);

  const loadProfile = async () => {
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockProfile: UserProfile = {
      id: userId,
      employeeId: 'AP001234',
      name: 'Rajesh Kumar',
      email: 'rajesh.kumar@ap.police.gov.in',
      phone: '+91-9876543210',
      role: userRole,
      rank: 'Deputy Superintendent of Police',
      designation: 'SDPO',
      department: 'Andhra Pradesh Police',
      jurisdiction: 'Anantapur',
      station: 'Anantapur District',
      avatar: '/api/placeholder/150/150',
      joinDate: new Date('2018-06-15'),
      lastLogin: new Date(),
      status: 'ACTIVE',
      
      personalInfo: {
        dateOfBirth: new Date('1985-03-20'),
        gender: 'MALE',
        address: {
          street: '123 Officers Colony',
          city: 'Anantapur',
          district: 'Anantapur',
          state: 'Andhra Pradesh',
          pincode: '515001'
        },
        emergencyContact: {
          name: 'Priya Kumar',
          relationship: 'Spouse',
          phone: '+91-9876543211'
        },
        bloodGroup: 'B+',
        maritalStatus: 'MARRIED'
      },
      
      professionalInfo: {
        badgeNumber: 'AP-DSP-1234',
        serviceNumber: 'SN001234',
        dateOfJoining: new Date('2018-06-15'),
        currentPosting: 'SDPO Anantapur',
        previousPostings: [
          {
            location: 'Kurnool District',
            designation: 'Circle Inspector',
            fromDate: new Date('2015-01-01'),
            toDate: new Date('2018-06-14')
          },
          {
            location: 'Guntur District',
            designation: 'Sub Inspector',
            fromDate: new Date('2012-07-01'),
            toDate: new Date('2014-12-31')
          }
        ],
        qualifications: [
          {
            degree: 'Bachelor of Arts',
            institution: 'Sri Krishnadevaraya University',
            year: 2007,
            grade: 'First Class'
          },
          {
            degree: 'Master of Public Administration',
            institution: 'Andhra University',
            year: 2009,
            grade: 'Distinction'
          }
        ],
        trainings: [
          {
            program: 'Advanced Crime Investigation',
            institution: 'AP Police Academy',
            duration: '3 months',
            completedDate: new Date('2019-03-15'),
            certificate: 'CERT001'
          },
          {
            program: 'Cyber Crime Prevention',
            institution: 'National Police Academy',
            duration: '2 weeks',
            completedDate: new Date('2020-11-30'),
            certificate: 'CERT002'
          }
        ],
        specializations: ['Crime Investigation', 'Traffic Management', 'Community Policing'],
        languages: ['Telugu', 'English', 'Hindi', 'Tamil']
      },
      
      performance: {
        overallScore: 88.5,
        casesSolved: 245,
        averageResponseTime: 8.2,
        citizenFeedback: 4.3,
        commendations: [
          {
            title: 'Excellence in Service',
            description: 'Outstanding performance in solving complex criminal cases',
            date: new Date('2023-12-15'),
            issuedBy: 'Superintendent of Police'
          },
          {
            title: 'Community Service Award',
            description: 'Exceptional work in community policing initiatives',
            date: new Date('2023-08-20'),
            issuedBy: 'District Collector'
          }
        ],
        penalties: []
      },
      
      security: {
        lastPasswordChange: new Date('2024-01-15'),
        twoFactorEnabled: true,
        sessionTimeout: 30,
        allowedIPs: ['192.168.1.0/24', '10.0.0.0/8'],
        loginHistory: [
          {
            timestamp: new Date(),
            ipAddress: '192.168.1.100',
            location: 'Anantapur, AP',
            device: 'Chrome on Windows',
            success: true
          },
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            ipAddress: '192.168.1.101',
            location: 'Anantapur, AP',
            device: 'Mobile App',
            success: true
          }
        ]
      },
      
      preferences: {
        theme: 'AUTO',
        language: 'English',
        timezone: 'Asia/Kolkata',
        notifications: {
          email: true,
          sms: false,
          push: true,
          categories: {
            'CRIME_ALERT': true,
            'GRIEVANCE_UPDATE': true,
            'SYSTEM_ALERT': false,
            'PERFORMANCE_UPDATE': true
          }
        },
        dashboard: {
          defaultTab: 'overview',
          layout: 'DETAILED',
          refreshRate: 30
        }
      }
    };
    
    setProfile(mockProfile);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!profile) return;
    
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (onProfileUpdate) {
      onProfileUpdate(profile);
    }
    
    setSaving(false);
    setIsEditing(false);
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploadingAvatar(true);
    
    // Simulate upload
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In real implementation, upload to server and get URL
    const avatarUrl = URL.createObjectURL(file);
    
    if (profile) {
      setProfile({ ...profile, avatar: avatarUrl });
    }
    
    setUploadingAvatar(false);
  };

  const handlePasswordChange = async () => {
    if (passwords.new !== passwords.confirm) {
      alert('New passwords do not match');
      return;
    }
    
    setSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (profile) {
      setProfile({
        ...profile,
        security: {
          ...profile.security,
          lastPasswordChange: new Date()
        }
      });
    }
    
    setPasswords({ current: '', new: '', confirm: '' });
    setShowPasswordChange(false);
    setSaving(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'text-green-600 bg-green-100';
      case 'INACTIVE': return 'text-gray-600 bg-gray-100';
      case 'SUSPENDED': return 'text-red-600 bg-red-100';
      case 'ON_LEAVE': return 'text-yellow-600 bg-yellow-100';
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

  if (loading || !profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 p-6 flex items-center justify-center">
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-8 text-center">
          <RefreshCw className="h-12 w-12 text-white/60 mx-auto mb-4 animate-spin" />
          <p className="text-white/80 text-lg">Loading Profile...</p>
        </div>
      </div>
    );
  }

  // Personal Tab Content
  const renderPersonalTab = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="space-y-6">
        <div className="bg-white/10 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-1">Full Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({...profile, name: e.target.value})}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white">{profile.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-1">Date of Birth</label>
              {isEditing ? (
                <input
                  type="date"
                  value={profile.personalInfo.dateOfBirth.toISOString().split('T')[0]}
                  onChange={(e) => setProfile({
                    ...profile, 
                    personalInfo: {
                      ...profile.personalInfo, 
                      dateOfBirth: new Date(e.target.value)
                    }
                  })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white">{formatDate(profile.personalInfo.dateOfBirth)}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-1">Gender</label>
              {isEditing ? (
                <select
                  value={profile.personalInfo.gender}
                  onChange={(e) => setProfile({
                    ...profile, 
                    personalInfo: {
                      ...profile.personalInfo, 
                      gender: e.target.value as any
                    }
                  })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              ) : (
                <p className="text-white">{profile.personalInfo.gender}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-1">Blood Group</label>
              {isEditing ? (
                <select
                  value={profile.personalInfo.bloodGroup}
                  onChange={(e) => setProfile({
                    ...profile, 
                    personalInfo: {
                      ...profile.personalInfo, 
                      bloodGroup: e.target.value
                    }
                  })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                >
                  <option value="A+">A+</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B-">B-</option>
                  <option value="AB+">AB+</option>
                  <option value="AB-">AB-</option>
                  <option value="O+">O+</option>
                  <option value="O-">O-</option>
                </select>
              ) : (
                <p className="text-white">{profile.personalInfo.bloodGroup}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Home className="h-5 w-5" />
            Address
          </h3>
          
          <div className="space-y-3">
            {Object.entries(profile.personalInfo.address).map(([key, value]) => (
              <div key={key}>
                <label className="block text-white/80 text-sm mb-1 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => setProfile({
                      ...profile,
                      personalInfo: {
                        ...profile.personalInfo,
                        address: {
                          ...profile.personalInfo.address,
                          [key]: e.target.value
                        }
                      }
                    })}
                    className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                  />
                ) : (
                  <p className="text-white">{value}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <div className="bg-white/10 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Heart className="h-5 w-5" />
            Emergency Contact
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-1">Name</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.personalInfo.emergencyContact.name}
                  onChange={(e) => setProfile({
                    ...profile,
                    personalInfo: {
                      ...profile.personalInfo,
                      emergencyContact: {
                        ...profile.personalInfo.emergencyContact,
                        name: e.target.value
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white">{profile.personalInfo.emergencyContact.name}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-1">Relationship</label>
              {isEditing ? (
                <input
                  type="text"
                  value={profile.personalInfo.emergencyContact.relationship}
                  onChange={(e) => setProfile({
                    ...profile,
                    personalInfo: {
                      ...profile.personalInfo,
                      emergencyContact: {
                        ...profile.personalInfo.emergencyContact,
                        relationship: e.target.value
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white">{profile.personalInfo.emergencyContact.relationship}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.personalInfo.emergencyContact.phone}
                  onChange={(e) => setProfile({
                    ...profile,
                    personalInfo: {
                      ...profile.personalInfo,
                      emergencyContact: {
                        ...profile.personalInfo.emergencyContact,
                        phone: e.target.value
                      }
                    }
                  })}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white">{profile.personalInfo.emergencyContact.phone}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white/10 rounded-lg p-4">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </h3>
          
          <div className="space-y-4">
            <div>
              <label className="block text-white/80 text-sm mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({...profile, email: e.target.value})}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white">{profile.email}</p>
              )}
            </div>
            
            <div>
              <label className="block text-white/80 text-sm mb-1">Phone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({...profile, phone: e.target.value})}
                  className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                />
              ) : (
                <p className="text-white">{profile.phone}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl p-6 mb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              {/* Avatar */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold overflow-hidden">
                  {profile.avatar ? (
                    <img src={profile.avatar} alt={profile.name} className="w-full h-full object-cover" />
                  ) : (
                    profile.name.split(' ').map(n => n[0]).join('')
                  )}
                </div>
                
                {isEditing && (
                  <>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      className="absolute -bottom-2 -right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors disabled:opacity-50"
                    >
                      {uploadingAvatar ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Camera className="h-4 w-4" />
                      )}
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleAvatarUpload}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              {/* Basic Info */}
              <div>
                <h1 className="text-2xl font-bold text-white mb-1">{profile.name}</h1>
                <p className="text-white/80 text-lg">{profile.rank}</p>
                <p className="text-white/70">{profile.designation} • {profile.jurisdiction}</p>
                <div className="flex items-center gap-4 mt-3">
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(profile.status)}`}>
                    {profile.status}
                  </span>
                  <span className="text-white/60 text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Joined {formatDate(profile.joinDate)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center gap-3">
              {isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(false)}
                    className="px-4 py-2 bg-gray-600/80 text-white rounded-lg hover:bg-gray-700/80 transition-colors flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-green-600/80 text-white rounded-lg hover:bg-green-700/80 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Save className="h-4 w-4" />
                    )}
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600/80 text-white rounded-lg hover:bg-blue-700/80 transition-colors flex items-center gap-2"
                  >
                    <Edit3 className="h-4 w-4" />
                    Edit Profile
                  </button>
                  <button
                    onClick={() => setShowPasswordChange(true)}
                    className="px-4 py-2 bg-purple-600/80 text-white rounded-lg hover:bg-purple-700/80 transition-colors flex items-center gap-2"
                  >
                    <Lock className="h-4 w-4" />
                    Change Password
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-white/10 backdrop-blur-sm rounded-xl p-1">
            {[
              { id: 'personal', label: 'Personal Info', icon: User },
              { id: 'professional', label: 'Professional', icon: Briefcase },
              { id: 'performance', label: 'Performance', icon: TrendingUp },
              { id: 'security', label: 'Security', icon: Shield },
              { id: 'preferences', label: 'Preferences', icon: Settings }
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
          {activeTab === 'personal' && renderPersonalTab()}
          
          {/* Placeholder for other tabs */}
          {activeTab !== 'personal' && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🚧</div>
              <h3 className="text-2xl font-bold text-white mb-2">
                {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)} Section
              </h3>
              <p className="text-white/80">This section is under development</p>
            </div>
          )}
        </div>

        {/* Password Change Modal */}
        {showPasswordChange && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-xl shadow-2xl w-96">
              <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white p-4 rounded-t-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">Change Password</h3>
                  <button
                    onClick={() => setShowPasswordChange(false)}
                    className="p-1 hover:bg-white/20 rounded"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {['current', 'new', 'confirm'].map((field) => (
                  <div key={field}>
                    <label className="block text-gray-700 text-sm font-medium mb-1 capitalize">
                      {field === 'confirm' ? 'Confirm New Password' : `${field} Password`}
                    </label>
                    <div className="relative">
                      <input
                        type={showPasswords[field as keyof typeof showPasswords] ? 'text' : 'password'}
                        value={passwords[field as keyof typeof passwords]}
                        onChange={(e) => setPasswords({
                          ...passwords,
                          [field]: e.target.value
                        })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500/50 pr-10"
                        placeholder={`Enter ${field === 'confirm' ? 'confirm password' : field + ' password'}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPasswords({
                          ...showPasswords,
                          [field]: !showPasswords[field as keyof typeof showPasswords]
                        })}
                        className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[field as keyof typeof showPasswords] ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}
                
                <div className="flex justify-end gap-3 mt-6">
                  <button
                    onClick={() => setShowPasswordChange(false)}
                    className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    disabled={saving || !passwords.current || !passwords.new || passwords.new !== passwords.confirm}
                    className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {saving ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <Lock className="h-4 w-4" />
                    )}
                    {saving ? 'Updating...' : 'Update Password'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileManagement;
