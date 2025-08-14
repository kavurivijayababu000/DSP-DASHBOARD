import React, { useState, useCallback } from 'react';
import { Upload, File, X, Check, AlertCircle, Download, Eye, Trash2 } from 'lucide-react';

// File Upload Props Interface
interface FileUploadComponentProps {
  userRole: string;
  jurisdiction: string;
  allowedTypes?: string[];
  maxFileSize?: number; // in MB
  maxFiles?: number;
  onFilesUploaded?: (files: UploadedFile[]) => void;
}

// File interfaces
interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  uploadDate: Date;
  uploadedBy: string;
  status: 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'PROCESSING';
  category: 'CRIME_EVIDENCE' | 'INCIDENT_REPORT' | 'PATROL_LOG' | 'COMPLAINT' | 'DOCUMENT' | 'PHOTO' | 'VIDEO';
  tags: string[];
  description?: string;
  url?: string;
  thumbnail?: string;
  metadata?: {
    dimensions?: { width: number; height: number };
    duration?: number;
    location?: { lat: number; lng: number };
    caseId?: string;
    officerId?: string;
  };
}

interface FileCategory {
  id: string;
  label: string;
  icon: string;
  allowedTypes: string[];
  maxSize: number;
  description: string;
}

const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  userRole,
  jurisdiction,
  allowedTypes = ['*'],
  maxFileSize = 50, // 50MB default
  maxFiles = 10,
  onFilesUploaded
}) => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('DOCUMENT');
  const [uploadProgress, setUploadProgress] = useState<{ [key: string]: number }>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFiles, setSelectedFiles] = useState<string[]>([]);
  const [activeView, setActiveView] = useState<'upload' | 'gallery' | 'categories'>('upload');

  // File categories based on user role
  const fileCategories: FileCategory[] = [
    {
      id: 'CRIME_EVIDENCE',
      label: 'Crime Evidence',
      icon: '🔍',
      allowedTypes: ['image/*', 'video/*', '.pdf', '.doc', '.docx'],
      maxSize: 100,
      description: 'Photos, videos, and documents related to criminal cases'
    },
    {
      id: 'INCIDENT_REPORT',
      label: 'Incident Reports',
      icon: '📋',
      allowedTypes: ['.pdf', '.doc', '.docx', '.txt'],
      maxSize: 25,
      description: 'Official incident and investigation reports'
    },
    {
      id: 'PATROL_LOG',
      label: 'Patrol Logs',
      icon: '🚔',
      allowedTypes: ['.pdf', '.doc', '.docx', '.txt', 'image/*'],
      maxSize: 15,
      description: 'Daily patrol logs and field observations'
    },
    {
      id: 'COMPLAINT',
      label: 'Complaints',
      icon: '📝',
      allowedTypes: ['.pdf', '.doc', '.docx', '.txt', 'image/*'],
      maxSize: 20,
      description: 'Citizen complaints and grievances'
    },
    {
      id: 'DOCUMENT',
      label: 'General Documents',
      icon: '📄',
      allowedTypes: ['.pdf', '.doc', '.docx', '.txt', '.xls', '.xlsx'],
      maxSize: 30,
      description: 'Administrative and operational documents'
    },
    {
      id: 'PHOTO',
      label: 'Photos',
      icon: '📷',
      allowedTypes: ['image/*'],
      maxSize: 25,
      description: 'Photographs and images'
    },
    {
      id: 'VIDEO',
      label: 'Videos',
      icon: '🎥',
      allowedTypes: ['video/*'],
      maxSize: 200,
      description: 'Video recordings and surveillance footage'
    }
  ];

  // Initialize with mock uploaded files
  React.useEffect(() => {
    const mockFiles: UploadedFile[] = [
      {
        id: 'file-1',
        name: 'Crime_Scene_Photo_001.jpg',
        size: 2048576,
        type: 'image/jpeg',
        uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        uploadedBy: `Officer ${userRole}`,
        status: 'COMPLETED',
        category: 'CRIME_EVIDENCE',
        tags: ['crime-scene', 'evidence', 'case-2024-001'],
        description: 'Primary crime scene photograph',
        url: '/mock/photo1.jpg',
        thumbnail: '/mock/thumb1.jpg',
        metadata: {
          dimensions: { width: 1920, height: 1080 },
          location: { lat: 15.9129, lng: 79.7400 },
          caseId: 'CASE-2024-001'
        }
      },
      {
        id: 'file-2',
        name: 'Incident_Report_FIR_0234.pdf',
        size: 512000,
        type: 'application/pdf',
        uploadDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        uploadedBy: `SI ${jurisdiction}`,
        status: 'COMPLETED',
        category: 'INCIDENT_REPORT',
        tags: ['fir', 'report', 'theft'],
        description: 'FIR for theft case',
        url: '/mock/report.pdf'
      },
      {
        id: 'file-3',
        name: 'Patrol_Log_Beat5_Morning.docx',
        size: 256000,
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
        uploadedBy: `Constable Beat5`,
        status: 'COMPLETED',
        category: 'PATROL_LOG',
        tags: ['patrol', 'beat-5', 'morning-shift'],
        description: 'Morning shift patrol log for Beat 5',
        url: '/mock/patrol.docx'
      }
    ];
    setUploadedFiles(mockFiles);
  }, [userRole, jurisdiction]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, [selectedCategory]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, [selectedCategory]);

  const handleFiles = async (files: File[]) => {
    if (files.length === 0) return;
    
    const category = fileCategories.find(cat => cat.id === selectedCategory);
    if (!category) return;

    setUploading(true);
    
    for (const file of files) {
      // Validate file type
      const isValidType = category.allowedTypes.some(type => {
        if (type === '*') return true;
        if (type.startsWith('.')) return file.name.toLowerCase().endsWith(type.toLowerCase());
        if (type.includes('/')) return file.type.match(new RegExp(type.replace('*', '.*')));
        return false;
      });

      if (!isValidType) {
        alert(`File ${file.name} is not allowed for ${category.label}`);
        continue;
      }

      // Validate file size
      if (file.size > category.maxSize * 1024 * 1024) {
        alert(`File ${file.name} exceeds maximum size of ${category.maxSize}MB`);
        continue;
      }

      // Simulate upload
      const uploadedFile: UploadedFile = {
        id: `file-${Date.now()}-${Math.random()}`,
        name: file.name,
        size: file.size,
        type: file.type,
        uploadDate: new Date(),
        uploadedBy: `${userRole} - ${jurisdiction}`,
        status: 'UPLOADING',
        category: selectedCategory as any,
        tags: [selectedCategory.toLowerCase(), jurisdiction.toLowerCase()],
        description: '',
        url: URL.createObjectURL(file)
      };

      setUploadedFiles(prev => [uploadedFile, ...prev]);
      
      // Simulate upload progress
      const fileId = uploadedFile.id;
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        setUploadProgress(prev => ({ ...prev, [fileId]: progress }));
      }
      
      // Complete upload
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId ? { ...f, status: 'COMPLETED' as const } : f
      ));
      
      setUploadProgress(prev => {
        const newProgress = { ...prev };
        delete newProgress[fileId];
        return newProgress;
      });
    }
    
    setUploading(false);
    
    if (onFilesUploaded) {
      onFilesUploaded(uploadedFiles);
    }
  };

  const handleDeleteFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
    setSelectedFiles(prev => prev.filter(id => id !== fileId));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (type: string, category: string) => {
    if (type.startsWith('image/')) return '🖼️';
    if (type.startsWith('video/')) return '🎥';
    if (type.includes('pdf')) return '📕';
    if (type.includes('word') || type.includes('document')) return '📄';
    if (type.includes('excel') || type.includes('spreadsheet')) return '📊';
    return fileCategories.find(cat => cat.id === category)?.icon || '📄';
  };

  const filteredFiles = uploadedFiles.filter(file => 
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())) ||
    file.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-700 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">File Management System</h2>
            <p className="text-indigo-100 mt-1">{jurisdiction} - Document & Evidence Management</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="text-sm">
              <span className="text-indigo-100">Total Files: </span>
              <span className="font-bold">{uploadedFiles.length}</span>
            </div>
            <div className="text-sm">
              <span className="text-indigo-100">Storage: </span>
              <span className="font-bold">
                {formatFileSize(uploadedFiles.reduce((sum, file) => sum + file.size, 0))}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
        <nav className="flex space-x-4 mb-6">
          {[
            { id: 'upload', label: 'Upload Files', icon: '📤' },
            { id: 'gallery', label: 'File Gallery', icon: '🗂️' },
            { id: 'categories', label: 'Categories', icon: '📂' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveView(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                activeView === tab.id
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Upload View */}
        {activeView === 'upload' && (
          <div className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">Select File Category</label>
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
                {fileCategories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`p-3 rounded-lg border-2 transition-colors text-center ${
                      selectedCategory === category.id
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="text-2xl mb-1">{category.icon}</div>
                    <div className="text-xs font-medium">{category.label}</div>
                    <div className="text-xs text-gray-500 mt-1">Max {category.maxSize}MB</div>
                  </button>
                ))}
              </div>
              {selectedCategory && (
                <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-600">
                    {fileCategories.find(cat => cat.id === selectedCategory)?.description}
                  </p>
                </div>
              )}
            </div>

            {/* Drag & Drop Upload Area */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                dragOver 
                  ? 'border-indigo-500 bg-indigo-50' 
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <input
                type="file"
                multiple
                accept={fileCategories.find(cat => cat.id === selectedCategory)?.allowedTypes.join(',') || '*'}
                onChange={handleFileInput}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={uploading}
              />
              <div className="space-y-4">
                <div className="text-6xl">
                  {uploading ? '⏳' : dragOver ? '📂' : '📤'}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-700">
                    {uploading ? 'Uploading...' : 'Drop files here or click to browse'}
                  </h3>
                  <p className="text-gray-500 mt-2">
                    Support for {fileCategories.find(cat => cat.id === selectedCategory)?.allowedTypes.join(', ') || 'all file types'}
                  </p>
                  <p className="text-sm text-gray-400 mt-1">
                    Maximum file size: {fileCategories.find(cat => cat.id === selectedCategory)?.maxSize || maxFileSize}MB
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Progress */}
            {Object.keys(uploadProgress).length > 0 && (
              <div className="space-y-3">
                <h3 className="font-semibold text-gray-700">Uploading Files</h3>
                {Object.entries(uploadProgress).map(([fileId, progress]) => {
                  const file = uploadedFiles.find(f => f.id === fileId);
                  return (
                    <div key={fileId} className="flex items-center space-x-3">
                      <div className="flex-shrink-0">
                        <File className="w-5 h-5 text-gray-500" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium">{file?.name}</span>
                          <span className="text-sm text-gray-500">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div 
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Gallery View */}
        {activeView === 'gallery' && (
          <div className="space-y-6">
            {/* Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="Search files by name, tags, or category..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
              <div className="flex space-x-2">
                <button className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors">
                  <Download className="w-4 h-4 inline mr-2" />
                  Download Selected
                </button>
                <button 
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                  onClick={() => {
                    selectedFiles.forEach(id => handleDeleteFile(id));
                    setSelectedFiles([]);
                  }}
                  disabled={selectedFiles.length === 0}
                >
                  <Trash2 className="w-4 h-4 inline mr-2" />
                  Delete Selected
                </button>
              </div>
            </div>

            {/* File Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredFiles.map((file) => (
                <div
                  key={file.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={selectedFiles.includes(file.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedFiles(prev => [...prev, file.id]);
                          } else {
                            setSelectedFiles(prev => prev.filter(id => id !== file.id));
                          }
                        }}
                        className="rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                      />
                      <div className="text-2xl">
                        {getFileIcon(file.type, file.category)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <div className={`w-3 h-3 rounded-full ${
                        file.status === 'COMPLETED' ? 'bg-green-500' :
                        file.status === 'UPLOADING' ? 'bg-yellow-500' :
                        file.status === 'PROCESSING' ? 'bg-blue-500' :
                        'bg-red-500'
                      }`} />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="font-medium text-sm truncate" title={file.name}>
                      {file.name}
                    </h4>
                    
                    <div className="flex items-center justify-between text-xs text-gray-500">
                      <span>{formatFileSize(file.size)}</span>
                      <span>{file.uploadDate.toLocaleDateString()}</span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1">
                      {file.tags.slice(0, 2).map((tag, index) => (
                        <span
                          key={index}
                          className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                      {file.tags.length > 2 && (
                        <span className="text-xs text-gray-400">+{file.tags.length - 2}</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-center pt-2 border-t border-gray-100">
                      <button
                        className="text-indigo-600 hover:text-indigo-800 text-xs flex items-center"
                        onClick={() => window.open(file.url, '_blank')}
                      >
                        <Eye className="w-3 h-3 mr-1" />
                        View
                      </button>
                      <button
                        className="text-red-600 hover:text-red-800 text-xs flex items-center"
                        onClick={() => handleDeleteFile(file.id)}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {filteredFiles.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📭</div>
                <h3 className="text-lg font-medium text-gray-700">No files found</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Try adjusting your search criteria' : 'Upload some files to get started'}
                </p>
              </div>
            )}
          </div>
        )}

        {/* Categories View */}
        {activeView === 'categories' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {fileCategories.map((category) => {
                const categoryFiles = uploadedFiles.filter(f => f.category === category.id);
                const totalSize = categoryFiles.reduce((sum, file) => sum + file.size, 0);
                
                return (
                  <div key={category.id} className="bg-white border border-gray-200 rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="text-3xl">{category.icon}</div>
                        <div>
                          <h3 className="font-semibold">{category.label}</h3>
                          <p className="text-sm text-gray-500">{category.description}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Files:</span>
                        <span className="font-medium">{categoryFiles.length}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Total Size:</span>
                        <span className="font-medium">{formatFileSize(totalSize)}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Max File Size:</span>
                        <span className="font-medium">{category.maxSize}MB</span>
                      </div>
                      <div className="pt-2 border-t border-gray-100">
                        <p className="text-xs text-gray-500">
                          Allowed types: {category.allowedTypes.join(', ')}
                        </p>
                      </div>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedCategory(category.id);
                        setActiveView('upload');
                      }}
                      className="w-full mt-4 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 py-2 rounded-lg transition-colors text-sm font-medium"
                    >
                      Upload {category.label}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FileUploadComponent;
