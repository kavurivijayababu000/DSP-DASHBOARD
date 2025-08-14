/**
 * Grievance Service
 * 
 * This service handles grievance management operations including
 * submission, tracking, resolution, and analytics for public grievances.
 */

// Grievance interfaces (already defined in GrievanceTab.tsx, but included here for service)
export interface Grievance {
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

export interface GrievanceSubmission {
  title: string;
  description: string;
  category: string;
  subcategory: string;
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
  attachments?: File[];
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  isPublic?: boolean;
  tags?: string[];
}

export interface GrievanceUpdate {
  status: string;
  remarks: string;
  actionTaken?: string;
  resolution?: string;
  assignedTo?: string;
}

export interface GrievanceSearchQuery {
  query?: string;
  status?: string;
  category?: string;
  priority?: string;
  department?: string;
  assignedTo?: string;
  dateFrom?: Date;
  dateTo?: Date;
  jurisdiction?: string;
  tags?: string[];
}

export interface GrievanceStats {
  total: number;
  pending: number;
  resolved: number;
  overdue: number;
  byCategory: { [category: string]: number };
  byStatus: { [status: string]: number };
  byPriority: { [priority: string]: number };
  avgResolutionTime: number;
  satisfactionRating: number;
  escalationRate: number;
  slaComplianceRate: number;
}

export interface SLAConfiguration {
  category: string;
  priority: string;
  acknowledgmentTime: number; // hours
  resolutionTime: number; // hours
  escalationLevels: {
    level: number;
    afterHours: number;
    escalateTo: string;
  }[];
}

export interface NotificationPreferences {
  email: boolean;
  sms: boolean;
  inApp: boolean;
  frequency: 'IMMEDIATE' | 'HOURLY' | 'DAILY' | 'WEEKLY';
}

class GrievanceService {
  private static instance: GrievanceService;
  private grievanceDatabase: Map<string, Grievance> = new Map();
  private slaConfigurations: SLAConfiguration[] = [];
  private notificationQueue: Array<{ grievanceId: string; type: string; message: string }> = [];

  private constructor() {
    this.initializeSLAConfigurations();
    this.initializeMockData();
    this.startSLAMonitoring();
  }

  public static getInstance(): GrievanceService {
    if (!GrievanceService.instance) {
      GrievanceService.instance = new GrievanceService();
    }
    return GrievanceService.instance;
  }

  private initializeSLAConfigurations(): void {
    this.slaConfigurations = [
      {
        category: 'CORRUPTION',
        priority: 'CRITICAL',
        acknowledgmentTime: 2,
        resolutionTime: 72,
        escalationLevels: [
          { level: 1, afterHours: 24, escalateTo: 'DIG' },
          { level: 2, afterHours: 48, escalateTo: 'DGP' }
        ]
      },
      {
        category: 'CORRUPTION',
        priority: 'HIGH',
        acknowledgmentTime: 4,
        resolutionTime: 168,
        escalationLevels: [
          { level: 1, afterHours: 72, escalateTo: 'DIG' }
        ]
      },
      {
        category: 'MISCONDUCT',
        priority: 'HIGH',
        acknowledgmentTime: 6,
        resolutionTime: 168,
        escalationLevels: [
          { level: 1, afterHours: 96, escalateTo: 'SP' }
        ]
      },
      {
        category: 'DELAY',
        priority: 'MEDIUM',
        acknowledgmentTime: 12,
        resolutionTime: 360,
        escalationLevels: [
          { level: 1, afterHours: 240, escalateTo: 'DSP' }
        ]
      }
    ];
  }

  private initializeMockData(): void {
    // Initialize with comprehensive mock grievances
    const mockGrievances = this.generateMockGrievances(50);
    mockGrievances.forEach(grievance => {
      this.grievanceDatabase.set(grievance.id, grievance);
    });
  }

  private generateMockGrievances(count: number): Grievance[] {
    const categories = ['CORRUPTION', 'MISCONDUCT', 'DELAY', 'HARASSMENT', 'FACILITIES', 'PROCESS', 'OTHER'];
    const subcategories = {
      'CORRUPTION': ['Bribery', 'Misuse of Power', 'Financial Irregularity', 'Unauthorized Collection'],
      'MISCONDUCT': ['Rude Behavior', 'Negligence', 'Abuse of Authority', 'Dereliction of Duty'],
      'DELAY': ['FIR Registration Delay', 'Investigation Delay', 'Case Disposal Delay', 'Document Processing Delay'],
      'HARASSMENT': ['Physical Harassment', 'Mental Harassment', 'Gender Discrimination', 'Caste Discrimination'],
      'FACILITIES': ['Poor Infrastructure', 'Equipment Issues', 'Accessibility Problems', 'Cleanliness Issues'],
      'PROCESS': ['Documentation Issues', 'Procedure Violation', 'System Failures', 'Communication Problems'],
      'OTHER': ['General Complaint', 'Service Suggestion', 'Process Feedback', 'Information Request']
    };

    const statuses = [
      'SUBMITTED', 'ACKNOWLEDGED', 'UNDER_REVIEW', 
      'INVESTIGATING', 'ACTION_TAKEN', 'RESOLVED', 'REJECTED', 'ESCALATED'
    ];
    const priorities = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'];
    
    const districts = ['Anantapur', 'Chittoor', 'Guntur', 'Krishna', 'Kurnool'];
    const stations = {
      'Anantapur': ['Anantapur Town', 'Anantapur Rural', 'Kadiri', 'Kalyandurg', 'Rayadurg'],
      'Chittoor': ['Chittoor', 'Tirupati Urban', 'Tirupati Rural', 'Madanapalle', 'Srikalahasti'],
      'Guntur': ['Guntur', 'Vijayawada', 'Tenali', 'Narasaraopet', 'Chilakaluripet'],
      'Krishna': ['Machilipatnam', 'Gudivada', 'Jaggayyapet', 'Nuzvidu', 'Avanigadda'],
      'Kurnool': ['Kurnool', 'Nandyal', 'Adoni', 'Yemmiganur', 'Allagadda']
    };

    const grievances: Grievance[] = [];

    for (let i = 0; i < count; i++) {
      const category = categories[Math.floor(Math.random() * categories.length)] as keyof typeof subcategories;
      const subcategoryList = subcategories[category];
      const subcategory = subcategoryList[Math.floor(Math.random() * subcategoryList.length)];
      const status = statuses[Math.floor(Math.random() * statuses.length)] as any;
      const priority = priorities[Math.floor(Math.random() * priorities.length)] as any;
      
      const district = districts[Math.floor(Math.random() * districts.length)];
      const stationList = (stations as any)[district];
      const station = stationList[Math.floor(Math.random() * stationList.length)];
      
      const submittedDate = new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000); // Last 60 days
      const grievanceId = `GRV-${submittedDate.getFullYear()}-${String(100000 + i).padStart(6, '0')}`;
      
      // SLA calculation
      const slaConfig = this.getSLAConfiguration(category, priority);
      const slaDeadline = new Date(submittedDate.getTime() + (slaConfig?.resolutionTime || 720) * 60 * 60 * 1000);
      
      // Generate realistic timeline
      const timeline = this.generateGrievanceTimeline(submittedDate, status, district);
      
      const isAnonymous = Math.random() > 0.7;
      
      const grievance: Grievance = {
        id: `grv-${i + 1}`,
        grievanceId,
        title: `${subcategory} complaint at ${station}`,
        description: this.generateGrievanceDescription(category, subcategory, station),
        category,
        subcategory,
        priority,
        status,
        submittedDate,
        complainantInfo: {
          name: isAnonymous ? 'Anonymous Complainant' : `Complainant ${String.fromCharCode(65 + (i % 26))}${Math.floor(i / 26) + 1}`,
          phone: isAnonymous ? 'Not Provided' : `+91-${7000000000 + Math.floor(Math.random() * 999999999)}`,
          email: isAnonymous ? 'Not Provided' : `complainant${i + 1}@email.com`,
          address: `${station}, ${district} District, Andhra Pradesh - ${500000 + Math.floor(Math.random() * 99999)}`,
          citizenId: isAnonymous ? undefined : `CID${String(Math.floor(Math.random() * 1000000000)).padStart(10, '0')}`,
          anonymous: isAnonymous
        },
        targetDepartment: station,
        targetOfficer: Math.random() > 0.6 ? `${['SI', 'CI', 'Inspector'][Math.floor(Math.random() * 3)]}-${station}-${Math.floor(Math.random() * 99) + 1}` : undefined,
        location: {
          station,
          district,
          coordinates: {
            lat: 14.0 + Math.random() * 4, // AP latitude range
            lng: 78.0 + Math.random() * 4  // AP longitude range
          }
        },
        attachments: this.generateAttachments(category, i),
        assignedTo: `${['SDPO', 'SP', 'DSP'][Math.floor(Math.random() * 3)]}-${district}`,
        reviewedBy: status !== 'SUBMITTED' ? `Review-Officer-${district}` : undefined,
        actionTaken: ['ACTION_TAKEN', 'RESOLVED'].includes(status) ? 
          this.generateActionTaken(category) : undefined,
        resolution: status === 'RESOLVED' ? 
          this.generateResolution(category) : undefined,
        feedbackRating: status === 'RESOLVED' && Math.random() > 0.3 ? 
          Math.floor(Math.random() * 3) + 3 : undefined, // 3-5 stars
        feedbackComments: status === 'RESOLVED' && Math.random() > 0.5 ? 
          this.generateFeedbackComment() : undefined,
        timeline,
        slaDeadline,
        escalationLevel: this.calculateEscalationLevel(submittedDate, slaDeadline, status),
        isPublic: Math.random() > 0.2, // 80% public
        tags: this.generateTags(category, subcategory, priority)
      };

      grievances.push(grievance);
    }

    return grievances.sort((a, b) => b.submittedDate.getTime() - a.submittedDate.getTime());
  }

  private generateGrievanceDescription(category: string, subcategory: string, station: string): string {
    const descriptions = {
      'CORRUPTION': [
        `Officer at ${station} demanded unauthorized payment of Rs. 500 for routine service that should be free.`,
        `Bribery incident reported where officer requested money to expedite case processing.`,
        `Misuse of official position observed - officer using government resources for personal work.`,
        `Financial irregularity noticed in the handling of seized property documentation.`
      ],
      'MISCONDUCT': [
        `Officer displayed extremely rude behavior and used inappropriate language with complainant.`,
        `Negligence in duty - officer was absent during crucial evidence collection time.`,
        `Abuse of authority - officer threatened complainant without valid reason.`,
        `Officer failed to follow proper procedure and showed unprofessional conduct.`
      ],
      'DELAY': [
        `FIR registration was delayed for 3 days without any valid justification provided.`,
        `Investigation has been pending for over 2 months without any progress update.`,
        `Case disposal is taking unreasonably long time affecting justice delivery.`,
        `Document verification process is stuck for weeks causing inconvenience.`
      ],
      'HARASSMENT': [
        `Mental harassment by officer during questioning - inappropriate behavior noted.`,
        `Gender-based discrimination experienced during complaint filing process.`,
        `Physical intimidation used by officer to discourage legitimate complaint.`,
        `Repeated harassment despite following all proper procedures.`
      ],
      'FACILITIES': [
        `Station infrastructure is in poor condition affecting service delivery.`,
        `Essential equipment not working properly causing delays in processing.`,
        `No proper seating arrangements for complainants waiting for service.`,
        `Cleanliness issues at the station creating unhygienic environment.`
      ],
      'PROCESS': [
        `Documentation process is confusing with contradictory instructions given.`,
        `Procedure violations observed in evidence handling and storage.`,
        `System failures causing data loss and process delays.`,
        `Communication gaps between departments affecting case coordination.`
      ],
      'OTHER': [
        `General complaint about service quality that needs management attention.`,
        `Suggestion for process improvement to enhance citizen experience.`,
        `Feedback on recent policy changes and their implementation challenges.`,
        `Request for information about case status and next steps.`
      ]
    };

    const categoryDescriptions = (descriptions as any)[category] || descriptions['OTHER'];
    return categoryDescriptions[Math.floor(Math.random() * categoryDescriptions.length)];
  }

  private generateGrievanceTimeline(
    submittedDate: Date, 
    currentStatus: string, 
    district: string
  ): Array<{ date: Date; status: string; remarks: string; actionBy: string }> {
    const timeline = [
      {
        date: submittedDate,
        status: 'SUBMITTED',
        remarks: 'Grievance submitted through online portal',
        actionBy: 'Grievance Management System'
      }
    ];

    const statusFlow = [
      'SUBMITTED', 'ACKNOWLEDGED', 'UNDER_REVIEW', 
      'INVESTIGATING', 'ACTION_TAKEN', 'RESOLVED'
    ];

    const currentIndex = statusFlow.indexOf(currentStatus);
    if (currentIndex === -1) {
      // Handle special statuses
      if (currentStatus === 'REJECTED') {
        timeline.push({
          date: new Date(submittedDate.getTime() + 24 * 60 * 60 * 1000),
          status: 'ACKNOWLEDGED',
          remarks: 'Grievance received and initial review completed',
          actionBy: `Grievance Officer - ${district}`
        });
        timeline.push({
          date: new Date(submittedDate.getTime() + 72 * 60 * 60 * 1000),
          status: 'REJECTED',
          remarks: 'Grievance rejected due to insufficient evidence or duplicate complaint',
          actionBy: `Review Officer - ${district}`
        });
      } else if (currentStatus === 'ESCALATED') {
        timeline.push({
          date: new Date(submittedDate.getTime() + 24 * 60 * 60 * 1000),
          status: 'ACKNOWLEDGED',
          remarks: 'Grievance acknowledged and assigned for review',
          actionBy: `SDPO - ${district}`
        });
        timeline.push({
          date: new Date(submittedDate.getTime() + 96 * 60 * 60 * 1000),
          status: 'ESCALATED',
          remarks: 'Grievance escalated due to SLA breach or complexity',
          actionBy: `SP - ${district}`
        });
      }
      return timeline;
    }

    // Build timeline up to current status
    let currentDate = submittedDate.getTime();
    for (let i = 1; i <= currentIndex; i++) {
      const status = statusFlow[i];
      currentDate += (12 + Math.random() * 48) * 60 * 60 * 1000; // 12-60 hours between steps
      
      const remarks = this.getTimelineRemarks(status);
      const actionBy = this.getTimelineActionBy(status, district);
      
      timeline.push({
        date: new Date(currentDate),
        status,
        remarks,
        actionBy
      });
    }

    return timeline;
  }

  private getTimelineRemarks(status: string): string {
    const remarks = {
      'ACKNOWLEDGED': 'Grievance acknowledged and assigned to appropriate department',
      'UNDER_REVIEW': 'Initial review completed, detailed investigation initiated',
      'INVESTIGATING': 'Investigation in progress, evidence being collected and analyzed',
      'ACTION_TAKEN': 'Corrective action implemented based on investigation findings',
      'RESOLVED': 'Grievance resolved satisfactorily, complainant notified of resolution'
    };
    return (remarks as any)[status] || 'Status updated';
  }

  private getTimelineActionBy(status: string, district: string): string {
    const actionBy = {
      'ACKNOWLEDGED': `Grievance Cell - ${district}`,
      'UNDER_REVIEW': `Review Officer - ${district}`,
      'INVESTIGATING': `Investigation Team - ${district}`,
      'ACTION_TAKEN': `SDPO - ${district}`,
      'RESOLVED': `SP - ${district}`
    };
    return (actionBy as any)[status] || `Officer - ${district}`;
  }

  private generateAttachments(category: string, index: number): string[] {
    if (Math.random() > 0.6) return []; // 40% chance of having attachments
    
    const attachments = [];
    const count = Math.floor(Math.random() * 3) + 1; // 1-3 attachments
    
    for (let i = 0; i < count; i++) {
      const types = {
        'CORRUPTION': ['evidence_photo', 'receipt', 'conversation_recording'],
        'MISCONDUCT': ['incident_video', 'witness_statement', 'medical_report'],
        'DELAY': ['application_copy', 'correspondence', 'timeline_document'],
        'HARASSMENT': ['incident_report', 'witness_video', 'medical_certificate'],
        'FACILITIES': ['facility_photo', 'complaint_letter', 'before_after_photos'],
        'PROCESS': ['process_document', 'error_screenshot', 'communication_trail'],
        'OTHER': ['supporting_document', 'reference_material', 'complaint_form']
      };
      
      const categoryTypes = (types as any)[category] || types['OTHER'];
      const type = categoryTypes[Math.floor(Math.random() * categoryTypes.length)];
      const extension = ['jpg', 'pdf', 'mp4', 'docx', 'png'][Math.floor(Math.random() * 5)];
      
      attachments.push(`${type}_${index}_${i + 1}.${extension}`);
    }
    
    return attachments;
  }

  private generateActionTaken(category: string): string {
    const actions = {
      'CORRUPTION': [
        'Departmental inquiry initiated against the officer. Counseling provided on ethical conduct.',
        'Officer suspended pending detailed investigation. Process audit conducted.',
        'Warning issued and officer transferred. Additional monitoring implemented.',
        'Financial audit conducted. Recovery proceedings initiated for unauthorized collection.'
      ],
      'MISCONDUCT': [
        'Officer counseled on professional behavior. Sensitivity training provided.',
        'Show-cause notice issued. Officer assigned to desk duty temporarily.',
        'Disciplinary action taken. Additional supervision implemented.',
        'Departmental training arranged on citizen interaction protocols.'
      ],
      'DELAY': [
        'Process streamlined and timeline adherence emphasized. Officer briefed.',
        'System improvements implemented to prevent future delays.',
        'Additional staff deployed to handle backlog efficiently.',
        'Standard Operating Procedure updated and staff trained.'
      ],
      'HARASSMENT': [
        'Officer transferred immediately. Victim support provided.',
        'Counseling arranged for officer. Behavioral monitoring implemented.',
        'Strict warning issued. Gender sensitization training mandated.',
        'Complaint escalated to higher authority for disciplinary action.'
      ],
      'FACILITIES': [
        'Immediate repairs initiated. Infrastructure upgrade planned.',
        'Equipment replacement ordered. Temporary arrangements made.',
        'Facility cleaning schedule enhanced. Additional amenities provided.',
        'Budget allocation approved for comprehensive facility improvement.'
      ],
      'PROCESS': [
        'Process documentation updated. Staff training conducted.',
        'System bugs fixed. User training material updated.',
        'Inter-department coordination improved. Communication protocol established.',
        'Standard Operating Procedure revised based on feedback.'
      ],
      'OTHER': [
        'Feedback acknowledged and incorporated in process improvement.',
        'Suggestion implemented after feasibility analysis.',
        'Information provided as requested. Follow-up mechanism established.',
        'General improvement measures implemented based on complaint.'
      ]
    };

    const categoryActions = (actions as any)[category] || actions['OTHER'];
    return categoryActions[Math.floor(Math.random() * categoryActions.length)];
  }

  private generateResolution(category: string): string {
    const resolutions = {
      'CORRUPTION': [
        'Issue resolved through disciplinary action and process improvement. Complainant compensated for any loss.',
        'Officer held accountable and appropriate action taken. System strengthened to prevent recurrence.',
        'Investigation completed and corrective measures implemented. Transparency enhanced in the process.'
      ],
      'MISCONDUCT': [
        'Officer behavior corrected through counseling and training. Service quality improved.',
        'Disciplinary measures enforced and professional standards reinforced throughout department.',
        'Issue addressed with immediate effect and long-term behavioral improvement measures implemented.'
      ],
      'DELAY': [
        'Process expedited and case resolved within stipulated timeline. System efficiency improved.',
        'Backlog cleared and additional resources deployed for faster processing.',
        'Timeline adherence enforced and monitoring mechanism established for future cases.'
      ],
      'HARASSMENT': [
        'Immediate relief provided to complainant. Officer accountability ensured through appropriate action.',
        'Safety measures implemented and support provided. Departmental sensitivity training enhanced.',
        'Issue resolved with zero tolerance approach. Prevention measures strengthened.'
      ],
      'FACILITIES': [
        'Infrastructure issues addressed and facility upgraded as per requirements.',
        'Equipment replaced and facility made fully functional for citizen services.',
        'Comprehensive facility improvement completed ensuring better service delivery.'
      ],
      'PROCESS': [
        'Process simplified and made more citizen-friendly. Documentation requirements reduced.',
        'System issues resolved and user experience significantly improved.',
        'Process standardized and made more efficient with reduced turnaround time.'
      ],
      'OTHER': [
        'Complaint addressed satisfactorily and necessary improvements implemented.',
        'Feedback incorporated and service quality enhanced as per expectations.',
        'Issue resolved through collaborative approach with all stakeholders.'
      ]
    };

    const categoryResolutions = (resolutions as any)[category] || resolutions['OTHER'];
    return categoryResolutions[Math.floor(Math.random() * categoryResolutions.length)];
  }

  private generateFeedbackComment(): string {
    const comments = [
      'Thank you for the prompt resolution of my complaint. Very satisfied with the service.',
      'Good response time and professional handling. Appreciate the follow-up.',
      'Issue resolved satisfactorily. Hope such efficiency continues in future.',
      'Professional approach and timely resolution. Thank you for your service.',
      'Excellent handling of the complaint. Very pleased with the outcome.',
      'Quick action taken and issue resolved. Grateful for the support provided.',
      'Fair investigation and appropriate action. Trust in system restored.',
      'Responsive service and effective resolution. Would recommend to others.',
      'Transparent process and satisfactory outcome. Thank you for listening.',
      'Problem solved efficiently. Appreciate the dedication of the team.'
    ];
    
    return comments[Math.floor(Math.random() * comments.length)];
  }

  private generateTags(category: string, subcategory: string, priority: string): string[] {
    const baseTags = [
      category.toLowerCase().replace('_', '-'),
      subcategory.toLowerCase().replace(/\s+/g, '-'),
      priority.toLowerCase()
    ];
    
    const additionalTags = {
      'CORRUPTION': ['financial-crime', 'ethics-violation', 'transparency'],
      'MISCONDUCT': ['behavior-issue', 'professional-conduct', 'discipline'],
      'DELAY': ['service-delay', 'timeline-issue', 'efficiency'],
      'HARASSMENT': ['abuse', 'discrimination', 'safety'],
      'FACILITIES': ['infrastructure', 'maintenance', 'accessibility'],
      'PROCESS': ['system-issue', 'procedure', 'workflow'],
      'OTHER': ['general', 'feedback', 'improvement']
    };
    
    const categoryTags = (additionalTags as any)[category] || additionalTags['OTHER'];
    const randomTag = categoryTags[Math.floor(Math.random() * categoryTags.length)];
    
    return [...baseTags, randomTag];
  }

  private calculateEscalationLevel(submittedDate: Date, slaDeadline: Date, status: string): number {
    if (['RESOLVED', 'REJECTED'].includes(status)) return 0;
    
    const now = new Date();
    const timeSinceSubmission = now.getTime() - submittedDate.getTime();
    const slaTimeLimit = slaDeadline.getTime() - submittedDate.getTime();
    
    if (now > slaDeadline) {
      const overdueTime = now.getTime() - slaDeadline.getTime();
      if (overdueTime > slaTimeLimit * 0.5) return 2; // Level 2 escalation
      return 1; // Level 1 escalation
    }
    
    return 0; // No escalation
  }

  private getSLAConfiguration(category: string, priority: string): SLAConfiguration | undefined {
    return this.slaConfigurations.find(config => 
      config.category === category && config.priority === priority
    ) || this.slaConfigurations.find(config => 
      config.priority === priority
    );
  }

  private startSLAMonitoring(): void {
    // Monitor SLA compliance every hour
    setInterval(() => {
      this.checkSLACompliance();
    }, 60 * 60 * 1000);
  }

  private checkSLACompliance(): void {
    const now = new Date();
    
    this.grievanceDatabase.forEach(grievance => {
      if (['RESOLVED', 'REJECTED'].includes(grievance.status)) return;
      
      // Check if SLA is breached
      if (now > grievance.slaDeadline) {
        this.handleSLABreach(grievance);
      }
      
      // Check for escalation triggers
      const slaConfig = this.getSLAConfiguration(grievance.category, grievance.priority);
      if (slaConfig) {
        slaConfig.escalationLevels.forEach(escalation => {
          const escalationTime = new Date(
            grievance.submittedDate.getTime() + escalation.afterHours * 60 * 60 * 1000
          );
          
          if (now > escalationTime && grievance.escalationLevel < escalation.level) {
            this.escalateGrievance(grievance.id, escalation.level, escalation.escalateTo);
          }
        });
      }
    });
  }

  private handleSLABreach(grievance: Grievance): void {
    // Add notification for SLA breach
    this.notificationQueue.push({
      grievanceId: grievance.grievanceId,
      type: 'SLA_BREACH',
      message: `SLA breached for grievance ${grievance.grievanceId}. Immediate attention required.`
    });
    
    // Auto-escalate if not already escalated
    if (grievance.escalationLevel === 0) {
      this.escalateGrievance(grievance.id, 1, 'SP');
    }
  }

  // Public API methods
  public async submitGrievance(
    submission: GrievanceSubmission,
    submittedBy: string = 'Citizen'
  ): Promise<Grievance> {
    const grievanceId = `GRV-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;
    const submittedDate = new Date();
    
    // Calculate SLA deadline
    const slaConfig = this.getSLAConfiguration(
      submission.category as any, 
      submission.priority || 'MEDIUM'
    );
    const slaHours = slaConfig?.resolutionTime || 720; // Default 30 days
    const slaDeadline = new Date(submittedDate.getTime() + slaHours * 60 * 60 * 1000);
    
    // Generate unique ID
    const id = `grv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const grievance: Grievance = {
      id,
      grievanceId,
      title: submission.title,
      description: submission.description,
      category: submission.category as any,
      subcategory: submission.subcategory,
      priority: submission.priority || 'MEDIUM',
      status: 'SUBMITTED',
      submittedDate,
      complainantInfo: submission.complainantInfo,
      targetDepartment: submission.targetDepartment,
      targetOfficer: submission.targetOfficer,
      location: submission.location,
      attachments: submission.attachments?.map(file => file.name) || [],
      assignedTo: `SDPO-${submission.location.district}`,
      timeline: [
        {
          date: submittedDate,
          status: 'SUBMITTED',
          remarks: 'Grievance submitted successfully',
          actionBy: submittedBy
        }
      ],
      slaDeadline,
      escalationLevel: 0,
      isPublic: submission.isPublic ?? true,
      tags: submission.tags || []
    };
    
    this.grievanceDatabase.set(id, grievance);
    
    // Add acknowledgment notification
    this.notificationQueue.push({
      grievanceId,
      type: 'SUBMISSION_ACKNOWLEDGMENT',
      message: `Your grievance ${grievanceId} has been submitted successfully and will be reviewed within 24 hours.`
    });
    
    return grievance;
  }

  public async updateGrievanceStatus(
    grievanceId: string,
    update: GrievanceUpdate,
    updatedBy: string
  ): Promise<Grievance | null> {
    const grievance = Array.from(this.grievanceDatabase.values())
      .find(g => g.grievanceId === grievanceId);
    
    if (!grievance) return null;
    
    // Update grievance
    grievance.status = update.status as any;
    if (update.assignedTo) grievance.assignedTo = update.assignedTo;
    if (update.actionTaken) grievance.actionTaken = update.actionTaken;
    if (update.resolution) grievance.resolution = update.resolution;
    
    // Add timeline entry
    grievance.timeline.push({
      date: new Date(),
      status: update.status,
      remarks: update.remarks,
      actionBy: updatedBy
    });
    
    this.grievanceDatabase.set(grievance.id, grievance);
    
    // Send notification to complainant
    this.notificationQueue.push({
      grievanceId: grievance.grievanceId,
      type: 'STATUS_UPDATE',
      message: `Your grievance ${grievance.grievanceId} status has been updated to: ${update.status}`
    });
    
    return grievance;
  }

  public async searchGrievances(query: GrievanceSearchQuery): Promise<Grievance[]> {
    let results = Array.from(this.grievanceDatabase.values());
    
    // Apply filters
    if (query.query) {
      const searchTerm = query.query.toLowerCase();
      results = results.filter(g =>
        g.title.toLowerCase().includes(searchTerm) ||
        g.description.toLowerCase().includes(searchTerm) ||
        g.grievanceId.toLowerCase().includes(searchTerm) ||
        g.complainantInfo.name.toLowerCase().includes(searchTerm)
      );
    }
    
    if (query.status) {
      results = results.filter(g => g.status === query.status);
    }
    
    if (query.category) {
      results = results.filter(g => g.category === query.category);
    }
    
    if (query.priority) {
      results = results.filter(g => g.priority === query.priority);
    }
    
    if (query.department) {
      results = results.filter(g => g.targetDepartment === query.department);
    }
    
    if (query.assignedTo) {
      results = results.filter(g => g.assignedTo === query.assignedTo);
    }
    
    if (query.jurisdiction) {
      results = results.filter(g => g.location.district === query.jurisdiction);
    }
    
    if (query.tags && query.tags.length > 0) {
      results = results.filter(g =>
        query.tags!.some(tag => g.tags.includes(tag))
      );
    }
    
    if (query.dateFrom) {
      results = results.filter(g => g.submittedDate >= query.dateFrom!);
    }
    
    if (query.dateTo) {
      results = results.filter(g => g.submittedDate <= query.dateTo!);
    }
    
    return results.sort((a, b) => b.submittedDate.getTime() - a.submittedDate.getTime());
  }

  public async getGrievanceById(grievanceId: string): Promise<Grievance | null> {
    return Array.from(this.grievanceDatabase.values())
      .find(g => g.grievanceId === grievanceId) || null;
  }

  public async getGrievanceStatistics(jurisdiction?: string): Promise<GrievanceStats> {
    let grievances = Array.from(this.grievanceDatabase.values());
    
    if (jurisdiction) {
      grievances = grievances.filter(g => g.location.district === jurisdiction);
    }
    
    const total = grievances.length;
    const pending = grievances.filter(g => 
      !['RESOLVED', 'REJECTED'].includes(g.status)
    ).length;
    const resolved = grievances.filter(g => g.status === 'RESOLVED').length;
    const now = new Date();
    const overdue = grievances.filter(g => 
      now > g.slaDeadline && !['RESOLVED', 'REJECTED'].includes(g.status)
    ).length;
    
    const byCategory = grievances.reduce((acc, g) => {
      acc[g.category] = (acc[g.category] || 0) + 1;
      return acc;
    }, {} as { [category: string]: number });
    
    const byStatus = grievances.reduce((acc, g) => {
      acc[g.status] = (acc[g.status] || 0) + 1;
      return acc;
    }, {} as { [status: string]: number });
    
    const byPriority = grievances.reduce((acc, g) => {
      acc[g.priority] = (acc[g.priority] || 0) + 1;
      return acc;
    }, {} as { [priority: string]: number });
    
    // Calculate average resolution time
    const resolvedGrievances = grievances.filter(g => g.status === 'RESOLVED');
    const avgResolutionTime = resolvedGrievances.length > 0 ?
      resolvedGrievances.reduce((sum, g) => {
        const resolvedEvent = g.timeline.find(t => t.status === 'RESOLVED');
        if (resolvedEvent) {
          return sum + (resolvedEvent.date.getTime() - g.submittedDate.getTime()) / (1000 * 60 * 60 * 24);
        }
        return sum;
      }, 0) / resolvedGrievances.length : 0;
    
    // Calculate satisfaction rating
    const ratedGrievances = resolvedGrievances.filter(g => g.feedbackRating);
    const satisfactionRating = ratedGrievances.length > 0 ?
      ratedGrievances.reduce((sum, g) => sum + (g.feedbackRating || 0), 0) / ratedGrievances.length : 0;
    
    // Calculate escalation rate
    const escalatedCount = grievances.filter(g => g.escalationLevel > 0).length;
    const escalationRate = total > 0 ? (escalatedCount / total) * 100 : 0;
    
    // Calculate SLA compliance rate
    const completedGrievances = grievances.filter(g => ['RESOLVED', 'REJECTED'].includes(g.status));
    const slaCompliantCount = completedGrievances.filter(g => {
      const completionEvent = g.timeline.find(t => ['RESOLVED', 'REJECTED'].includes(t.status));
      return completionEvent && completionEvent.date <= g.slaDeadline;
    }).length;
    const slaComplianceRate = completedGrievances.length > 0 ? 
      (slaCompliantCount / completedGrievances.length) * 100 : 0;
    
    return {
      total,
      pending,
      resolved,
      overdue,
      byCategory,
      byStatus,
      byPriority,
      avgResolutionTime,
      satisfactionRating,
      escalationRate,
      slaComplianceRate
    };
  }

  public async escalateGrievance(
    grievanceId: string, 
    escalationLevel: number, 
    escalateTo: string
  ): Promise<boolean> {
    const grievance = this.grievanceDatabase.get(grievanceId);
    if (!grievance) return false;
    
    grievance.escalationLevel = escalationLevel;
    grievance.assignedTo = escalateTo;
    grievance.status = 'ESCALATED';
    
    grievance.timeline.push({
      date: new Date(),
      status: 'ESCALATED',
      remarks: `Grievance escalated to level ${escalationLevel} and assigned to ${escalateTo}`,
      actionBy: 'System Auto-Escalation'
    });
    
    this.grievanceDatabase.set(grievanceId, grievance);
    
    this.notificationQueue.push({
      grievanceId: grievance.grievanceId,
      type: 'ESCALATION',
      message: `Grievance ${grievance.grievanceId} has been escalated to ${escalateTo} due to SLA requirements.`
    });
    
    return true;
  }

  public async addFeedback(
    grievanceId: string,
    rating: number,
    comments: string
  ): Promise<boolean> {
    const grievance = Array.from(this.grievanceDatabase.values())
      .find(g => g.grievanceId === grievanceId);
    
    if (!grievance || grievance.status !== 'RESOLVED') return false;
    
    grievance.feedbackRating = rating;
    grievance.feedbackComments = comments;
    
    grievance.timeline.push({
      date: new Date(),
      status: 'FEEDBACK_RECEIVED',
      remarks: `Complainant provided feedback: ${rating}/5 stars`,
      actionBy: 'Complainant'
    });
    
    this.grievanceDatabase.set(grievance.id, grievance);
    return true;
  }

  public getNotifications(): Array<{ grievanceId: string; type: string; message: string }> {
    const notifications = [...this.notificationQueue];
    this.notificationQueue = []; // Clear notifications after retrieval
    return notifications;
  }
}

// Export singleton instance
export const grievanceService = GrievanceService.getInstance();
export default grievanceService;
