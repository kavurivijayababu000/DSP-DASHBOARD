import React, { useState, useCallback } from 'react';
import { Camera, Video, FileText, MapPin, Calendar, User, Hash, AlertTriangle } from 'lucide-react';

// Crime Evidence Uploader Props Interface
interface CrimeEvidenceUploaderProps {
  caseId?: string;
  userRole: string;
  jurisdiction: string;
  onEvidenceUploaded?: (evidence: EvidenceItem[]) => void;
}

// Evidence interfaces
interface EvidenceItem {
  id: string;
  fileName: string;
  fileType: 'PHOTO' | 'VIDEO' | 'DOCUMENT' | 'AUDIO';
  fileSize: number;
  uploadDate: Date;
  location?: {
    lat: number;
    lng: number;
    address: string;
    accuracy?: number;
  };
  caseId: string;
  evidenceType: 'PHYSICAL' | 'DIGITAL' | 'DOCUMENTARY' | 'TESTIMONIAL';
  description: string;
  collectedBy: string;
  collectedDate: Date;
  chainOfCustody: ChainOfCustodyEntry[];
  tags: string[];
  isSealed: boolean;
  sealNumber?: string;
  witnessInfo?: {
    name: string;
    contact: string;
    statement: string;
  };
  metadata?: {
    dimensions?: { width: number; height: number };
    duration?: number;
    cameraInfo?: string;
    hash?: string;
  };
}

interface ChainOfCustodyEntry {
  id: string;
  handedOverBy: string;
  handedOverTo: string;
  timestamp: Date;
  reason: string;
  location: string;
  witnessSignature?: string;
  condition: 'GOOD' | 'DAMAGED' | 'TAMPERED' | 'SEALED';
  notes?: string;
}

interface EvidenceForm {
  caseId: string;
  evidenceType: 'PHYSICAL' | 'DIGITAL' | 'DOCUMENTARY' | 'TESTIMONIAL';
  description: string;
  collectedDate: string;
  location: string;
  tags: string[];
  isSealed: boolean;
  sealNumber: string;
  witnessName: string;
  witnessContact: string;
  witnessStatement: string;
  notes: string;
}

const CrimeEvidenceUploader: React.FC<CrimeEvidenceUploaderProps> = ({
  caseId: initialCaseId,
  userRole,
  jurisdiction,
  onEvidenceUploaded
}) => {
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [currentForm, setCurrentForm] = useState<EvidenceForm>({
    caseId: initialCaseId || '',
    evidenceType: 'PHYSICAL',
    description: '',
    collectedDate: new Date().toISOString().split('T')[0],
    location: '',
    tags: [],
    isSealed: false,
    sealNumber: '',
    witnessName: '',
    witnessContact: '',
    witnessStatement: '',
    notes: ''
  });
  const [activeStep, setActiveStep] = useState(1);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [gpsLocation, setGpsLocation] = useState<GeolocationPosition | null>(null);

  // Get current GPS location
  React.useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setGpsLocation(position),
        (error) => console.log('GPS error:', error),
        { enableHighAccuracy: true, timeout: 10000 }
      );
    }
  }, []);

  // Initialize with mock evidence items
  React.useEffect(() => {
    const mockEvidence: EvidenceItem[] = [
      {
        id: 'evidence-1',
        fileName: 'Crime_Scene_Photo_001.jpg',
        fileType: 'PHOTO',
        fileSize: 2048576,
        uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        location: {
          lat: 15.9129,
          lng: 79.7400,
          address: `${jurisdiction} - Crime Scene Location`,
          accuracy: 5
        },
        caseId: initialCaseId || 'CASE-2024-001',
        evidenceType: 'PHYSICAL',
        description: 'Primary crime scene photograph showing the position of evidence',
        collectedBy: `${userRole} - ${jurisdiction}`,
        collectedDate: new Date(Date.now() - 3 * 60 * 60 * 1000),
        chainOfCustody: [
          {
            id: 'custody-1',
            handedOverBy: `${userRole} - ${jurisdiction}`,
            handedOverTo: 'Evidence Locker',
            timestamp: new Date(),
            reason: 'Initial collection and storage',
            location: `${jurisdiction} Police Station`,
            condition: 'SEALED'
          }
        ],
        tags: ['crime-scene', 'physical-evidence', 'photograph'],
        isSealed: true,
        sealNumber: 'SEAL-2024-001',
        metadata: {
          dimensions: { width: 1920, height: 1080 },
          cameraInfo: 'Canon EOS R5',
          hash: 'sha256:abcd1234...'
        }
      },
      {
        id: 'evidence-2',
        fileName: 'Witness_Statement_Recording.mp4',
        fileType: 'VIDEO',
        fileSize: 52428800,
        uploadDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        caseId: initialCaseId || 'CASE-2024-001',
        evidenceType: 'TESTIMONIAL',
        description: 'Video recorded witness statement',
        collectedBy: `SI Investigation`,
        collectedDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
        chainOfCustody: [],
        tags: ['witness', 'statement', 'video'],
        isSealed: true,
        sealNumber: 'SEAL-2024-002',
        witnessInfo: {
          name: 'John Doe',
          contact: '+91-9876543210',
          statement: 'Witnessed the incident at approximately 10:30 PM'
        },
        metadata: {
          duration: 1200, // 20 minutes
          hash: 'sha256:efgh5678...'
        }
      }
    ];
    setEvidenceItems(mockEvidence);
  }, [initialCaseId, userRole, jurisdiction]);

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
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setSelectedFiles(prev => [...prev, ...files]);
  }, []);

  const handleFormChange = (field: keyof EvidenceForm, value: any) => {
    setCurrentForm(prev => ({ ...prev, [field]: value }));
  };

  const handleTagAdd = (tag: string) => {
    if (tag && !currentForm.tags.includes(tag)) {
      handleFormChange('tags', [...currentForm.tags, tag.toLowerCase()]);
    }
  };

  const handleTagRemove = (tagToRemove: string) => {
    handleFormChange('tags', currentForm.tags.filter(tag => tag !== tagToRemove));
  };

  const generateSealNumber = () => {
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.random().toString(36).substr(2, 4).toUpperCase();
    return `SEAL-${new Date().getFullYear()}-${timestamp}-${random}`;
  };

  const handleSubmitEvidence = async () => {
    if (!currentForm.caseId || !currentForm.description || selectedFiles.length === 0) {
      alert('Please fill all required fields and select files');
      return;
    }

    setUploading(true);

    try {
      const newEvidenceItems: EvidenceItem[] = [];

      for (const file of selectedFiles) {
        const evidenceItem: EvidenceItem = {
          id: `evidence-${Date.now()}-${Math.random()}`,
          fileName: file.name,
          fileType: file.type.startsWith('image/') ? 'PHOTO' :
                   file.type.startsWith('video/') ? 'VIDEO' :
                   file.type.startsWith('audio/') ? 'AUDIO' : 'DOCUMENT',
          fileSize: file.size,
          uploadDate: new Date(),
          location: gpsLocation ? {
            lat: gpsLocation.coords.latitude,
            lng: gpsLocation.coords.longitude,
            address: currentForm.location || `${jurisdiction} - Field Location`,
            accuracy: gpsLocation.coords.accuracy
          } : undefined,
          caseId: currentForm.caseId,
          evidenceType: currentForm.evidenceType,
          description: currentForm.description,
          collectedBy: `${userRole} - ${jurisdiction}`,
          collectedDate: new Date(currentForm.collectedDate),
          chainOfCustody: [
            {
              id: `custody-${Date.now()}`,
              handedOverBy: `${userRole} - ${jurisdiction}`,
              handedOverTo: 'Evidence Processing',
              timestamp: new Date(),
              reason: 'Initial digital upload and processing',
              location: `${jurisdiction} Police Station`,
              condition: 'GOOD'
            }
          ],
          tags: currentForm.tags,
          isSealed: currentForm.isSealed,
          sealNumber: currentForm.isSealed ? currentForm.sealNumber || generateSealNumber() : undefined,
          witnessInfo: currentForm.witnessName ? {
            name: currentForm.witnessName,
            contact: currentForm.witnessContact,
            statement: currentForm.witnessStatement
          } : undefined,
          metadata: {
            hash: `sha256:${Math.random().toString(36).substr(2, 16)}...`,
            ...(file.type.startsWith('image/') && {
              dimensions: { width: 1920, height: 1080 } // Would be extracted from actual image
            }),
            ...(file.type.startsWith('video/') && {
              duration: 300 // Would be extracted from actual video
            })
          }
        };

        newEvidenceItems.push(evidenceItem);
      }

      // Simulate upload delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      setEvidenceItems(prev => [...newEvidenceItems, ...prev]);
      
      // Reset form
      setCurrentForm({
        caseId: initialCaseId || '',
        evidenceType: 'PHYSICAL',
        description: '',
        collectedDate: new Date().toISOString().split('T')[0],
        location: '',
        tags: [],
        isSealed: false,
        sealNumber: '',
        witnessName: '',
        witnessContact: '',
        witnessStatement: '',
        notes: ''
      });
      setSelectedFiles([]);
      setActiveStep(1);

      if (onEvidenceUploaded) {
        onEvidenceUploaded(newEvidenceItems);
      }

    } catch (error) {
      console.error('Evidence upload error:', error);
      alert('Failed to upload evidence. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getEvidenceTypeIcon = (type: string) => {
    switch (type) {
      case 'PHYSICAL': return '🔍';
      case 'DIGITAL': return '💻';
      case 'DOCUMENTARY': return '📋';
      case 'TESTIMONIAL': return '🎤';
      default: return '📎';
    }
  };

  const getFileTypeIcon = (type: string) => {
    switch (type) {
      case 'PHOTO': return '📷';
      case 'VIDEO': return '🎥';
      case 'AUDIO': return '🎵';
      case 'DOCUMENT': return '📄';
      default: return '📎';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-red-600 to-orange-600 rounded-xl shadow-lg p-6 text-white">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-2xl font-bold">Crime Evidence Management</h2>
            <p className="text-red-100 mt-1">{jurisdiction} - Secure Evidence Collection & Chain of Custody</p>
          </div>
          <div className="flex items-center space-x-4 mt-4 lg:mt-0">
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm">Secure Upload</span>
            </div>
            <div className="text-sm">
              <span className="text-red-100">Evidence Items: </span>
              <span className="font-bold">{evidenceItems.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Step Progress */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold ${
                  activeStep >= step 
                    ? 'bg-red-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                {step < 4 && (
                  <div className={`w-16 h-1 mx-2 ${
                    activeStep > step ? 'bg-red-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-sm text-gray-600">
            Step {activeStep} of 4: {
              activeStep === 1 ? 'File Upload' :
              activeStep === 2 ? 'Evidence Details' :
              activeStep === 3 ? 'Chain of Custody' :
              'Review & Submit'
            }
          </div>
        </div>

        {/* Step 1: File Upload */}
        {activeStep === 1 && (
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Select Evidence Files</h3>
              
              {/* File Upload Area */}
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver 
                    ? 'border-red-500 bg-red-50' 
                    : 'border-gray-300 hover:border-gray-400'
                }`}
              >
                <input
                  type="file"
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.txt"
                  onChange={handleFileInput}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <div className="space-y-4">
                  <div className="text-6xl">
                    {dragOver ? '📂' : '🔒'}
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold text-gray-700">
                      Secure Evidence Upload
                    </h4>
                    <p className="text-gray-500 mt-2">
                      Drop evidence files here or click to browse
                    </p>
                    <p className="text-sm text-gray-400 mt-1">
                      Supports: Images, Videos, Audio, Documents (Max 500MB per file)
                    </p>
                  </div>
                </div>
              </div>

              {/* Selected Files */}
              {selectedFiles.length > 0 && (
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Selected Files ({selectedFiles.length})</h4>
                  <div className="space-y-2">
                    {selectedFiles.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div className="text-2xl">
                            {file.type.startsWith('image/') ? '📷' :
                             file.type.startsWith('video/') ? '🎥' :
                             file.type.startsWith('audio/') ? '🎵' : '📄'}
                          </div>
                          <div>
                            <p className="font-medium text-sm">{file.name}</p>
                            <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedFiles(prev => prev.filter((_, i) => i !== index))}
                          className="text-red-600 hover:text-red-800"
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setActiveStep(2)}
                disabled={selectedFiles.length === 0}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-300 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Next: Evidence Details →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Evidence Details */}
        {activeStep === 2 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Evidence Information</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Hash className="w-4 h-4 inline mr-1" />
                  Case ID *
                </label>
                <input
                  type="text"
                  value={currentForm.caseId}
                  onChange={(e) => handleFormChange('caseId', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Enter Case ID"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidence Type *
                </label>
                <select
                  value={currentForm.evidenceType}
                  onChange={(e) => handleFormChange('evidenceType', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                >
                  <option value="PHYSICAL">🔍 Physical Evidence</option>
                  <option value="DIGITAL">💻 Digital Evidence</option>
                  <option value="DOCUMENTARY">📋 Documentary Evidence</option>
                  <option value="TESTIMONIAL">🎤 Testimonial Evidence</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Evidence Description *
                </label>
                <textarea
                  value={currentForm.description}
                  onChange={(e) => handleFormChange('description', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Detailed description of the evidence..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Collection Date *
                </label>
                <input
                  type="date"
                  value={currentForm.collectedDate}
                  onChange={(e) => handleFormChange('collectedDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Location
                </label>
                <input
                  type="text"
                  value={currentForm.location}
                  onChange={(e) => handleFormChange('location', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder={gpsLocation ? `GPS: ${gpsLocation.coords.latitude.toFixed(6)}, ${gpsLocation.coords.longitude.toFixed(6)}` : 'Enter location'}
                />
                {gpsLocation && (
                  <button
                    onClick={() => handleFormChange('location', `GPS: ${gpsLocation.coords.latitude.toFixed(6)}, ${gpsLocation.coords.longitude.toFixed(6)}`)}
                    className="mt-1 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Use current GPS location
                  </button>
                )}
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Evidence Tags
              </label>
              <div className="flex flex-wrap gap-2 mb-2">
                {currentForm.tags.map((tag, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full"
                  >
                    {tag}
                    <button
                      onClick={() => handleTagRemove(tag)}
                      className="ml-1 text-red-600 hover:text-red-800"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <input
                type="text"
                placeholder="Add tag and press Enter"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    const target = e.target as HTMLInputElement;
                    handleTagAdd(target.value);
                    target.value = '';
                  }
                }}
              />
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(1)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setActiveStep(3)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Next: Chain of Custody →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Chain of Custody */}
        {activeStep === 3 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Chain of Custody & Security</h3>
            
            <div className="space-y-6">
              {/* Sealing */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="isSealed"
                    checked={currentForm.isSealed}
                    onChange={(e) => handleFormChange('isSealed', e.target.checked)}
                    className="rounded border-gray-300 text-red-600 focus:ring-red-500"
                  />
                  <label htmlFor="isSealed" className="ml-2 font-medium text-gray-700">
                    🔒 Evidence is sealed/secured
                  </label>
                </div>
                {currentForm.isSealed && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Seal Number
                    </label>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        value={currentForm.sealNumber}
                        onChange={(e) => handleFormChange('sealNumber', e.target.value)}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                        placeholder="Enter seal number"
                      />
                      <button
                        onClick={() => handleFormChange('sealNumber', generateSealNumber())}
                        className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg transition-colors"
                      >
                        Generate
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Witness Information */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h4 className="font-semibold text-gray-700 mb-4">
                  <User className="w-4 h-4 inline mr-1" />
                  Witness Information (Optional)
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Witness Name
                    </label>
                    <input
                      type="text"
                      value={currentForm.witnessName}
                      onChange={(e) => handleFormChange('witnessName', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Enter witness name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Contact Number
                    </label>
                    <input
                      type="tel"
                      value={currentForm.witnessContact}
                      onChange={(e) => handleFormChange('witnessContact', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="+91-XXXXXXXXXX"
                    />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Witness Statement
                    </label>
                    <textarea
                      value={currentForm.witnessStatement}
                      onChange={(e) => handleFormChange('witnessStatement', e.target.value)}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Brief witness statement..."
                    />
                  </div>
                </div>
              </div>

              {/* Additional Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Additional Notes
                </label>
                <textarea
                  value={currentForm.notes}
                  onChange={(e) => handleFormChange('notes', e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Any additional notes about evidence collection, handling, or special considerations..."
                />
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(2)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={() => setActiveStep(4)}
                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Next: Review →
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {activeStep === 4 && (
          <div className="space-y-6">
            <h3 className="text-lg font-semibold">Review & Submit Evidence</h3>
            
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-600">Case ID:</span>
                  <p className="font-semibold">{currentForm.caseId}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Evidence Type:</span>
                  <p className="font-semibold">{getEvidenceTypeIcon(currentForm.evidenceType)} {currentForm.evidenceType.replace('_', ' ')}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Collection Date:</span>
                  <p className="font-semibold">{new Date(currentForm.collectedDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Location:</span>
                  <p className="font-semibold">{currentForm.location || 'Not specified'}</p>
                </div>
              </div>
              
              <div>
                <span className="text-sm text-gray-600">Description:</span>
                <p className="font-semibold">{currentForm.description}</p>
              </div>
              
              {currentForm.tags.length > 0 && (
                <div>
                  <span className="text-sm text-gray-600">Tags:</span>
                  <div className="flex flex-wrap gap-2 mt-1">
                    {currentForm.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 text-xs bg-red-100 text-red-800 rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {currentForm.isSealed && (
                <div className="bg-yellow-100 border border-yellow-300 rounded p-3">
                  <p className="text-sm">
                    🔒 <strong>Sealed Evidence</strong> - Seal Number: {currentForm.sealNumber}
                  </p>
                </div>
              )}
            </div>

            {/* Files Summary */}
            <div>
              <h4 className="font-semibold mb-3">Files to Upload ({selectedFiles.length})</h4>
              <div className="space-y-2">
                {selectedFiles.map((file, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <div className="text-xl">
                        {file.type.startsWith('image/') ? '📷' :
                         file.type.startsWith('video/') ? '🎥' :
                         file.type.startsWith('audio/') ? '🎵' : '📄'}
                      </div>
                      <div>
                        <p className="font-medium text-sm">{file.name}</p>
                        <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Security Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-red-700">
                  <p className="font-semibold">Security & Legal Notice</p>
                  <ul className="mt-2 space-y-1 text-xs">
                    <li>• Evidence will be digitally signed and hash-verified</li>
                    <li>• Chain of custody will be automatically logged</li>
                    <li>• Tampering detection mechanisms are active</li>
                    <li>• All uploads are legally admissible in court</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="flex justify-between">
              <button
                onClick={() => setActiveStep(3)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg transition-colors"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmitEvidence}
                disabled={uploading}
                className="bg-red-600 hover:bg-red-700 disabled:bg-gray-400 text-white px-6 py-2 rounded-lg transition-colors flex items-center"
              >
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Uploading...
                  </>
                ) : (
                  '🔒 Submit Evidence'
                )}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Evidence Gallery */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200/50 p-6">
        <h3 className="text-lg font-semibold mb-4">Uploaded Evidence Items</h3>
        
        {evidenceItems.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-4">📭</div>
            <p className="text-gray-500">No evidence uploaded yet</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {evidenceItems.map((evidence) => (
              <div key={evidence.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-xl">{getFileTypeIcon(evidence.fileType)}</span>
                    <span className="text-sm">{getEvidenceTypeIcon(evidence.evidenceType)}</span>
                  </div>
                  {evidence.isSealed && (
                    <div className="flex items-center space-x-1 text-xs text-yellow-600">
                      <span>🔒</span>
                      <span>Sealed</span>
                    </div>
                  )}
                </div>
                
                <h4 className="font-medium text-sm truncate mb-2" title={evidence.fileName}>
                  {evidence.fileName}
                </h4>
                
                <div className="space-y-1 text-xs text-gray-600">
                  <div>Case: {evidence.caseId}</div>
                  <div>Size: {formatFileSize(evidence.fileSize)}</div>
                  <div>Collected: {evidence.collectedDate.toLocaleDateString()}</div>
                  <div>By: {evidence.collectedBy}</div>
                  {evidence.sealNumber && (
                    <div className="text-yellow-600">Seal: {evidence.sealNumber}</div>
                  )}
                </div>
                
                <div className="flex flex-wrap gap-1 mt-3">
                  {evidence.tags.slice(0, 3).map((tag, index) => (
                    <span
                      key={index}
                      className="inline-block px-1 py-0.5 text-xs bg-red-100 text-red-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                  {evidence.tags.length > 3 && (
                    <span className="text-xs text-gray-400">+{evidence.tags.length - 3}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CrimeEvidenceUploader;
