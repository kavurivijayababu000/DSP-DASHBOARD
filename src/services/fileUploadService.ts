/**
 * File Upload Service
 * 
 * This service handles file uploads, storage, metadata management,
 * and provides secure file operations for evidence and documents.
 */

// File and upload interfaces
export interface FileMetadata {
  id: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  mimeType: string;
  uploadDate: Date;
  uploadedBy: string;
  category: 'CRIME_EVIDENCE' | 'INCIDENT_REPORT' | 'PATROL_LOG' | 'COMPLAINT' | 'DOCUMENT' | 'PHOTO' | 'VIDEO' | 'AUDIO';
  status: 'UPLOADING' | 'COMPLETED' | 'FAILED' | 'PROCESSING' | 'QUARANTINE';
  tags: string[];
  description?: string;
  location?: {
    lat: number;
    lng: number;
    address: string;
  };
  caseId?: string;
  officerId?: string;
  jurisdiction: string;
  securityInfo: {
    hash: string;
    checksum: string;
    isEncrypted: boolean;
    accessLevel: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
  };
  virusScan?: {
    scanned: boolean;
    clean: boolean;
    scanDate?: Date;
    threats?: string[];
  };
}

export interface UploadOptions {
  category: string;
  tags?: string[];
  description?: string;
  caseId?: string;
  location?: { lat: number; lng: number; address: string };
  encrypt?: boolean;
  accessLevel?: 'PUBLIC' | 'RESTRICTED' | 'CONFIDENTIAL' | 'SECRET';
}

export interface UploadProgress {
  fileId: string;
  fileName: string;
  progress: number; // 0-100
  status: 'UPLOADING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  error?: string;
}

export interface FileSearchQuery {
  query?: string;
  category?: string;
  tags?: string[];
  caseId?: string;
  uploadedBy?: string;
  dateFrom?: Date;
  dateTo?: Date;
  jurisdiction?: string;
  status?: string;
}

class FileUploadService {
  private static instance: FileUploadService;
  private fileDatabase: Map<string, FileMetadata> = new Map();
  private uploadProgressCallbacks: Map<string, (progress: UploadProgress) => void> = new Map();

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): FileUploadService {
    if (!FileUploadService.instance) {
      FileUploadService.instance = new FileUploadService();
    }
    return FileUploadService.instance;
  }

  private initializeMockData(): void {
    // Initialize with some mock files
    const mockFiles: FileMetadata[] = [
      {
        id: 'file-001',
        fileName: 'crime_scene_photo_001.jpg',
        originalName: 'IMG_20240813_143022.jpg',
        fileSize: 2048576,
        mimeType: 'image/jpeg',
        uploadDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        uploadedBy: 'SDPO-Anantapur',
        category: 'CRIME_EVIDENCE',
        status: 'COMPLETED',
        tags: ['crime-scene', 'evidence', 'photograph'],
        description: 'Primary crime scene photograph',
        location: {
          lat: 15.9129,
          lng: 79.7400,
          address: 'Anantapur District, AP'
        },
        caseId: 'CASE-2024-001',
        jurisdiction: 'Anantapur',
        securityInfo: {
          hash: 'sha256:abcd1234567890',
          checksum: 'md5:efgh1234567890',
          isEncrypted: true,
          accessLevel: 'RESTRICTED'
        },
        virusScan: {
          scanned: true,
          clean: true,
          scanDate: new Date(Date.now() - 2 * 60 * 60 * 1000)
        }
      },
      {
        id: 'file-002',
        fileName: 'incident_report_fir_234.pdf',
        originalName: 'FIR-234-Theft-Report.pdf',
        fileSize: 512000,
        mimeType: 'application/pdf',
        uploadDate: new Date(Date.now() - 4 * 60 * 60 * 1000),
        uploadedBy: 'SI-Investigation',
        category: 'INCIDENT_REPORT',
        status: 'COMPLETED',
        tags: ['fir', 'theft', 'report'],
        description: 'FIR for theft case #234',
        caseId: 'CASE-2024-002',
        jurisdiction: 'Anantapur',
        securityInfo: {
          hash: 'sha256:ijkl1234567890',
          checksum: 'md5:mnop1234567890',
          isEncrypted: false,
          accessLevel: 'PUBLIC'
        },
        virusScan: {
          scanned: true,
          clean: true,
          scanDate: new Date(Date.now() - 4 * 60 * 60 * 1000)
        }
      },
      {
        id: 'file-003',
        fileName: 'patrol_log_beat5_morning.docx',
        originalName: 'Morning-Patrol-Beat5-13082024.docx',
        fileSize: 256000,
        mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        uploadDate: new Date(Date.now() - 6 * 60 * 60 * 1000),
        uploadedBy: 'Constable-Beat5',
        category: 'PATROL_LOG',
        status: 'COMPLETED',
        tags: ['patrol', 'beat-5', 'morning-shift'],
        description: 'Morning shift patrol log for Beat 5',
        jurisdiction: 'Anantapur',
        securityInfo: {
          hash: 'sha256:qrst1234567890',
          checksum: 'md5:uvwx1234567890',
          isEncrypted: false,
          accessLevel: 'RESTRICTED'
        },
        virusScan: {
          scanned: true,
          clean: true,
          scanDate: new Date(Date.now() - 6 * 60 * 60 * 1000)
        }
      }
    ];

    mockFiles.forEach(file => {
      this.fileDatabase.set(file.id, file);
    });
  }

  // File upload methods
  public async uploadFile(
    file: File, 
    options: UploadOptions, 
    uploadedBy: string,
    jurisdiction: string,
    onProgress?: (progress: UploadProgress) => void
  ): Promise<FileMetadata> {
    const fileId = `file-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Generate file metadata
    const metadata: FileMetadata = {
      id: fileId,
      fileName: this.sanitizeFileName(file.name),
      originalName: file.name,
      fileSize: file.size,
      mimeType: file.type,
      uploadDate: new Date(),
      uploadedBy,
      category: options.category as any,
      status: 'UPLOADING',
      tags: options.tags || [],
      description: options.description,
      location: options.location,
      caseId: options.caseId,
      jurisdiction,
      securityInfo: {
        hash: await this.generateFileHash(file),
        checksum: await this.generateChecksum(file),
        isEncrypted: options.encrypt || false,
        accessLevel: options.accessLevel || 'RESTRICTED'
      }
    };

    // Store metadata
    this.fileDatabase.set(fileId, metadata);

    // Register progress callback
    if (onProgress) {
      this.uploadProgressCallbacks.set(fileId, onProgress);
    }

    // Simulate file upload with progress
    await this.simulateUpload(fileId, file);

    return this.fileDatabase.get(fileId)!;
  }

  private async simulateUpload(fileId: string, file: File): Promise<void> {
    const callback = this.uploadProgressCallbacks.get(fileId);
    
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 90; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        
        if (callback) {
          callback({
            fileId,
            fileName: file.name,
            progress,
            status: 'UPLOADING'
          });
        }
        
        // Update metadata
        const metadata = this.fileDatabase.get(fileId)!;
        metadata.status = 'UPLOADING';
        this.fileDatabase.set(fileId, metadata);
      }

      // Simulate virus scan
      if (callback) {
        callback({
          fileId,
          fileName: file.name,
          progress: 95,
          status: 'PROCESSING'
        });
      }

      await this.simulateVirusScan(fileId);

      // Complete upload
      const metadata = this.fileDatabase.get(fileId)!;
      metadata.status = 'COMPLETED';
      metadata.virusScan = {
        scanned: true,
        clean: true,
        scanDate: new Date()
      };
      this.fileDatabase.set(fileId, metadata);

      if (callback) {
        callback({
          fileId,
          fileName: file.name,
          progress: 100,
          status: 'COMPLETED'
        });
      }

    } catch (error) {
      // Handle upload failure
      const metadata = this.fileDatabase.get(fileId)!;
      metadata.status = 'FAILED';
      this.fileDatabase.set(fileId, metadata);

      if (callback) {
        callback({
          fileId,
          fileName: file.name,
          progress: 0,
          status: 'FAILED',
          error: error instanceof Error ? error.message : 'Upload failed'
        });
      }

      throw error;
    } finally {
      // Cleanup callback
      this.uploadProgressCallbacks.delete(fileId);
    }
  }

  private async simulateVirusScan(fileId: string): Promise<void> {
    // Simulate virus scanning delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Mock virus scan - 99% clean rate
    const isClean = Math.random() > 0.01;
    
    if (!isClean) {
      const metadata = this.fileDatabase.get(fileId)!;
      metadata.status = 'QUARANTINE';
      metadata.virusScan = {
        scanned: true,
        clean: false,
        scanDate: new Date(),
        threats: ['Trojan.Generic.Suspicious']
      };
      this.fileDatabase.set(fileId, metadata);
      
      throw new Error('File contains potential threats and has been quarantined');
    }
  }

  // File retrieval methods
  public async getFileById(fileId: string): Promise<FileMetadata | null> {
    return this.fileDatabase.get(fileId) || null;
  }

  public async getFilesByJurisdiction(jurisdiction: string, userRole?: string): Promise<FileMetadata[]> {
    const files = Array.from(this.fileDatabase.values());
    
    // Filter by jurisdiction
    let filteredFiles = files.filter(file => 
      file.jurisdiction === jurisdiction || userRole === 'DGP'
    );

    // Apply role-based access control
    if (userRole && userRole !== 'DGP') {
      filteredFiles = filteredFiles.filter(file => {
        switch (file.securityInfo.accessLevel) {
          case 'PUBLIC':
            return true;
          case 'RESTRICTED':
            return ['DGP', 'DIG', 'SP', 'CP'].includes(userRole);
          case 'CONFIDENTIAL':
            return ['DGP', 'DIG'].includes(userRole);
          case 'SECRET':
            return userRole === 'DGP';
          default:
            return false;
        }
      });
    }

    return filteredFiles.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }

  public async searchFiles(query: FileSearchQuery): Promise<FileMetadata[]> {
    let files = Array.from(this.fileDatabase.values());

    // Apply filters
    if (query.query) {
      const searchTerm = query.query.toLowerCase();
      files = files.filter(file => 
        file.fileName.toLowerCase().includes(searchTerm) ||
        file.originalName.toLowerCase().includes(searchTerm) ||
        file.description?.toLowerCase().includes(searchTerm) ||
        file.tags.some(tag => tag.toLowerCase().includes(searchTerm))
      );
    }

    if (query.category) {
      files = files.filter(file => file.category === query.category);
    }

    if (query.tags && query.tags.length > 0) {
      files = files.filter(file => 
        query.tags!.some(tag => file.tags.includes(tag))
      );
    }

    if (query.caseId) {
      files = files.filter(file => file.caseId === query.caseId);
    }

    if (query.uploadedBy) {
      files = files.filter(file => file.uploadedBy === query.uploadedBy);
    }

    if (query.jurisdiction) {
      files = files.filter(file => file.jurisdiction === query.jurisdiction);
    }

    if (query.status) {
      files = files.filter(file => file.status === query.status);
    }

    if (query.dateFrom) {
      files = files.filter(file => file.uploadDate >= query.dateFrom!);
    }

    if (query.dateTo) {
      files = files.filter(file => file.uploadDate <= query.dateTo!);
    }

    return files.sort((a, b) => b.uploadDate.getTime() - a.uploadDate.getTime());
  }

  // File management methods
  public async deleteFile(fileId: string, deletedBy: string): Promise<boolean> {
    if (this.fileDatabase.has(fileId)) {
      // In a real system, we'd move to trash/archive instead of deleting
      console.log(`File ${fileId} deleted by ${deletedBy}`);
      this.fileDatabase.delete(fileId);
      return true;
    }
    return false;
  }

  public async updateFileMetadata(
    fileId: string, 
    updates: Partial<Pick<FileMetadata, 'tags' | 'description' | 'category' | 'caseId'>>
  ): Promise<FileMetadata | null> {
    const file = this.fileDatabase.get(fileId);
    if (!file) return null;

    const updatedFile: FileMetadata = {
      ...file,
      ...updates
    };

    this.fileDatabase.set(fileId, updatedFile);
    return updatedFile;
  }

  // Security and utility methods
  private sanitizeFileName(fileName: string): string {
    // Remove special characters and spaces, keep extension
    const name = fileName.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase();
    return `${Date.now()}_${name}`;
  }

  private async generateFileHash(file: File): Promise<string> {
    // In a real implementation, we'd use crypto APIs
    // For now, simulate a hash
    const buffer = await file.arrayBuffer();
    let hash = 0;
    const view = new Uint8Array(buffer);
    
    for (let i = 0; i < Math.min(view.length, 1000); i++) {
      hash = ((hash << 5) - hash + view[i]) & 0xffffffff;
    }
    
    return `sha256:${Math.abs(hash).toString(16).padStart(16, '0')}`;
  }

  private async generateChecksum(file: File): Promise<string> {
    // Simplified checksum generation
    return `md5:${Math.random().toString(36).substr(2, 16)}`;
  }

  // Statistics methods
  public async getFileStatistics(jurisdiction?: string): Promise<{
    totalFiles: number;
    totalSize: number;
    byCategory: { [category: string]: number };
    byStatus: { [status: string]: number };
    recentUploads: number; // last 24 hours
  }> {
    let files = Array.from(this.fileDatabase.values());
    
    if (jurisdiction) {
      files = files.filter(file => file.jurisdiction === jurisdiction);
    }

    const totalSize = files.reduce((sum, file) => sum + file.fileSize, 0);
    
    const byCategory = files.reduce((acc, file) => {
      acc[file.category] = (acc[file.category] || 0) + 1;
      return acc;
    }, {} as { [category: string]: number });

    const byStatus = files.reduce((acc, file) => {
      acc[file.status] = (acc[file.status] || 0) + 1;
      return acc;
    }, {} as { [status: string]: number });

    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const recentUploads = files.filter(file => file.uploadDate > yesterday).length;

    return {
      totalFiles: files.length,
      totalSize,
      byCategory,
      byStatus,
      recentUploads
    };
  }

  // Bulk operations
  public async uploadMultipleFiles(
    files: File[], 
    options: UploadOptions, 
    uploadedBy: string,
    jurisdiction: string,
    onProgress?: (fileId: string, progress: UploadProgress) => void
  ): Promise<FileMetadata[]> {
    const uploadPromises = files.map(file => 
      this.uploadFile(
        file, 
        options, 
        uploadedBy, 
        jurisdiction, 
        onProgress ? (progress) => onProgress(progress.fileId, progress) : undefined
      )
    );

    try {
      return await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Bulk upload error:', error);
      throw error;
    }
  }

  public async deleteMultipleFiles(fileIds: string[], deletedBy: string): Promise<boolean[]> {
    const deletePromises = fileIds.map(id => this.deleteFile(id, deletedBy));
    return await Promise.all(deletePromises);
  }

  // File validation
  public validateFile(file: File, category: string): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];
    
    // Size limits by category (in bytes)
    const sizeLimits: { [key: string]: number } = {
      'CRIME_EVIDENCE': 100 * 1024 * 1024, // 100MB
      'INCIDENT_REPORT': 25 * 1024 * 1024,  // 25MB
      'PATROL_LOG': 15 * 1024 * 1024,       // 15MB
      'COMPLAINT': 20 * 1024 * 1024,        // 20MB
      'DOCUMENT': 30 * 1024 * 1024,         // 30MB
      'PHOTO': 25 * 1024 * 1024,            // 25MB
      'VIDEO': 200 * 1024 * 1024,           // 200MB
      'AUDIO': 50 * 1024 * 1024             // 50MB
    };

    // Allowed file types by category
    const allowedTypes: { [key: string]: string[] } = {
      'CRIME_EVIDENCE': ['image/', 'video/', 'application/pdf', 'application/msword'],
      'INCIDENT_REPORT': ['application/pdf', 'application/msword', 'text/'],
      'PATROL_LOG': ['application/pdf', 'application/msword', 'text/', 'image/'],
      'COMPLAINT': ['application/pdf', 'application/msword', 'text/', 'image/'],
      'DOCUMENT': ['application/pdf', 'application/msword', 'text/', 'application/vnd.ms-excel'],
      'PHOTO': ['image/'],
      'VIDEO': ['video/'],
      'AUDIO': ['audio/']
    };

    // Check file size
    const maxSize = sizeLimits[category] || 50 * 1024 * 1024; // Default 50MB
    if (file.size > maxSize) {
      errors.push(`File size exceeds maximum allowed size of ${Math.round(maxSize / (1024 * 1024))}MB`);
    }

    // Check file type
    const allowed = allowedTypes[category] || ['*'];
    const isAllowed = allowed.some(type => 
      type === '*' || file.type.startsWith(type)
    );
    
    if (!isAllowed) {
      errors.push(`File type '${file.type}' is not allowed for category '${category}'`);
    }

    // Check file name
    if (!file.name || file.name.length > 255) {
      errors.push('Invalid file name');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }
}

// Export singleton instance
export const fileUploadService = FileUploadService.getInstance();
export default fileUploadService;
