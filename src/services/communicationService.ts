import { 
  getAllDistricts, 
  getActualRanges,
  getSDPOsForDistrict,
  apPoliceStructure 
} from './policeDataService';

// Types for communication and task management
export interface Officer {
  id: string;
  name: string;
  designation: 'DGP' | 'DIG' | 'SP' | 'CP' | 'SDPO';
  jurisdiction: string;
  district?: string;
  range?: string;
  commissionerate?: string;
  email: string;
  phone: string;
  badgeNumber: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'OVERDUE';
  assignedBy: string;
  assignedTo: Officer[];
  assignedToType: 'INDIVIDUAL' | 'DISTRICT' | 'RANGE' | 'COMMISSIONERATE' | 'ALL_SDPOS' | 'ALL_SPS' | 'STATE_WIDE';
  targetJurisdiction?: string[];
  dueDate: string;
  createdAt: string;
  updatedAt: string;
  category: 'ROUTINE' | 'INVESTIGATION' | 'OPERATION' | 'ADMIN' | 'TRAINING' | 'EMERGENCY';
  attachments?: string[];
  tags?: string[];
}

export interface Message {
  id: string;
  subject: string;
  content: string;
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  sentBy: string;
  sentTo: Officer[];
  sentToType: 'INDIVIDUAL' | 'DISTRICT' | 'RANGE' | 'COMMISSIONERATE' | 'ALL_SDPOS' | 'ALL_SPS' | 'STATE_WIDE';
  targetJurisdiction?: string[];
  messageType: 'ANNOUNCEMENT' | 'DIRECTIVE' | 'INFORMATION' | 'ALERT' | 'CIRCULAR';
  sentAt: string;
  readBy?: { officerId: string; readAt: string }[];
  attachments?: string[];
  isUrgent: boolean;
}

// Mock officer data based on our corrected police structure
const generateOfficerData = (): Officer[] => {
  const officers: Officer[] = [];

  // Generate DGP
  officers.push({
    id: 'dgp-001',
    name: 'Rajesh Kumar Singh',
    designation: 'DGP',
    jurisdiction: 'Andhra Pradesh',
    email: 'dgp@appolice.gov.in',
    phone: '+91-9876543210',
    badgeNumber: 'DGP001'
  });

  // Generate DIGs for actual ranges only (not commissionerates)
  const actualRanges = getActualRanges(); // Only get the 5 actual ranges
  actualRanges.forEach((range, index) => {
    officers.push({
      id: `dig-${String(index + 1).padStart(3, '0')}`,
      name: `DIG ${['Ramesh', 'Suresh', 'Mahesh', 'Ganesh', 'Naresh'][index]} ${['Kumar', 'Reddy', 'Rao', 'Sharma', 'Gupta'][index]}`,
      designation: 'DIG',
      jurisdiction: range,
      range: range,
      email: `dig.${range.toLowerCase().replace(/\s+/g, '')}@appolice.gov.in`,
      phone: `+91-98765432${String(10 + index).slice(-2)}`,
      badgeNumber: `DIG${String(index + 1).padStart(3, '0')}`
    });
  });

  // Generate SPs for each district
  getAllDistricts().forEach((district, index) => {
    const range = Object.keys(apPoliceStructure.ranges).find(r => 
      apPoliceStructure.ranges[r]?.districts?.includes(district)
    ) || district;

    const isCommissionerate = apPoliceStructure.commissionerates.includes(district);
    
    officers.push({
      id: `${isCommissionerate ? 'cp' : 'sp'}-${String(index + 1).padStart(3, '0')}`,
      name: `${isCommissionerate ? 'CP' : 'SP'} ${['Priya', 'Kavitha', 'Sunitha', 'Lakshmi', 'Padma'][index % 5]} ${['Sharma', 'Devi', 'Kumari', 'Rani', 'Reddy'][index % 5]}`,
      designation: isCommissionerate ? 'CP' : 'SP',
      jurisdiction: district,
      district: district,
      range: range,
      commissionerate: isCommissionerate ? district : undefined,
      email: `${isCommissionerate ? 'cp' : 'sp'}.${district.toLowerCase().replace(/\s+/g, '')}@appolice.gov.in`,
      phone: `+91-98765433${String(10 + index).slice(-2)}`,
      badgeNumber: `${isCommissionerate ? 'CP' : 'SP'}${String(index + 1).padStart(3, '0')}`
    });
  });

  // Generate SDPOs for each district
  getAllDistricts().forEach((district) => {
    const sdpoLocations = getSDPOsForDistrict(district);
    const range = Object.keys(apPoliceStructure.ranges).find(r => 
      apPoliceStructure.ranges[r]?.districts?.includes(district)
    ) || district;

    sdpoLocations.forEach((location, index) => {
      officers.push({
        id: `sdpo-${district.toLowerCase().replace(/\s+/g, '')}-${String(index + 1).padStart(2, '0')}`,
        name: `SDPO ${['Rajesh', 'Amit', 'Vikram', 'Arun', 'Kiran'][index % 5]} ${['Kumar', 'Singh', 'Reddy', 'Rao', 'Sharma'][index % 5]}`,
        designation: 'SDPO',
        jurisdiction: location.jurisdiction,
        district: district,
        range: range,
        email: `sdpo.${location.jurisdiction.toLowerCase().replace(/\s+/g, '')}@appolice.gov.in`,
        phone: `+91-98765434${String(10 + index).slice(-2)}`,
        badgeNumber: `SDPO${district.substring(0, 3).toUpperCase()}${String(index + 1).padStart(2, '0')}`
      });
    });
  });

  return officers;
};

// Communication service
export class CommunicationService {
  private static officers: Officer[] = generateOfficerData();
  private static tasks: Task[] = [];
  private static messages: Message[] = [];

  // Officer management
  static getAllOfficers(): Officer[] {
    return this.officers;
  }

  static getOfficersByDesignation(designation: Officer['designation']): Officer[] {
    return this.officers.filter(officer => officer.designation === designation);
  }

  static getOfficersByDistrict(district: string): Officer[] {
    return this.officers.filter(officer => officer.district === district);
  }

  static getOfficersByRange(range: string): Officer[] {
    return this.officers.filter(officer => officer.range === range);
  }

  static getOfficersByCommissionerate(commissionerate: string): Officer[] {
    return this.officers.filter(officer => officer.commissionerate === commissionerate);
  }

  static getOfficerById(id: string): Officer | undefined {
    return this.officers.find(officer => officer.id === id);
  }

  // Task management
  static createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Task {
    const newTask: Task = {
      ...task,
      id: `task-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.tasks.push(newTask);
    return newTask;
  }

  static getAllTasks(): Task[] {
    return this.tasks.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  static getTasksAssignedBy(officerId: string): Task[] {
    return this.tasks.filter(task => task.assignedBy === officerId);
  }

  static getTasksAssignedTo(officerId: string): Task[] {
    return this.tasks.filter(task => 
      task.assignedTo.some(officer => officer.id === officerId)
    );
  }

  static updateTaskStatus(taskId: string, status: Task['status']): boolean {
    const task = this.tasks.find(t => t.id === taskId);
    if (task) {
      task.status = status;
      task.updatedAt = new Date().toISOString();
      return true;
    }
    return false;
  }

  // Message management
  static sendMessage(message: Omit<Message, 'id' | 'sentAt'>): Message {
    const newMessage: Message = {
      ...message,
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      sentAt: new Date().toISOString(),
      readBy: []
    };

    this.messages.push(newMessage);
    return newMessage;
  }

  static getAllMessages(): Message[] {
    return this.messages.sort((a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime());
  }

  static getMessagesSentBy(officerId: string): Message[] {
    return this.messages.filter(message => message.sentBy === officerId);
  }

  static getMessagesForOfficer(officerId: string): Message[] {
    return this.messages.filter(message => 
      message.sentTo.some(officer => officer.id === officerId)
    );
  }

  static markMessageAsRead(messageId: string, officerId: string): boolean {
    const message = this.messages.find(m => m.id === messageId);
    if (message) {
      if (!message.readBy) message.readBy = [];
      const existingRead = message.readBy.find(r => r.officerId === officerId);
      if (!existingRead) {
        message.readBy.push({
          officerId,
          readAt: new Date().toISOString()
        });
      }
      return true;
    }
    return false;
  }

  // Utility functions for recipient selection
  static getRecipientsForBroadcast(
    broadcastType: 'ALL_SDPOS' | 'ALL_SPS' | 'STATE_WIDE',
    targetJurisdiction?: string[]
  ): Officer[] {
    switch (broadcastType) {
      case 'ALL_SDPOS':
        if (targetJurisdiction && targetJurisdiction.length > 0) {
          return this.officers.filter(officer => 
            officer.designation === 'SDPO' && 
            targetJurisdiction.some(jurisdiction => 
              officer.district === jurisdiction || officer.range === jurisdiction
            )
          );
        }
        return this.getOfficersByDesignation('SDPO');

      case 'ALL_SPS':
        if (targetJurisdiction && targetJurisdiction.length > 0) {
          return this.officers.filter(officer => 
            (officer.designation === 'SP' || officer.designation === 'CP') && 
            targetJurisdiction.some(jurisdiction => 
              officer.district === jurisdiction || officer.range === jurisdiction
            )
          );
        }
        return [...this.getOfficersByDesignation('SP'), ...this.getOfficersByDesignation('CP')];

      case 'STATE_WIDE':
        return this.officers;

      default:
        return [];
    }
  }

  // Statistics
  static getStatistics() {
    const totalOfficers = this.officers.length;
    const totalTasks = this.tasks.length;
    const totalMessages = this.messages.length;
    
    const tasksByStatus = {
      pending: this.tasks.filter(t => t.status === 'PENDING').length,
      inProgress: this.tasks.filter(t => t.status === 'IN_PROGRESS').length,
      completed: this.tasks.filter(t => t.status === 'COMPLETED').length,
      overdue: this.tasks.filter(t => t.status === 'OVERDUE').length
    };

    const messagesByPriority = {
      low: this.messages.filter(m => m.priority === 'LOW').length,
      medium: this.messages.filter(m => m.priority === 'MEDIUM').length,
      high: this.messages.filter(m => m.priority === 'HIGH').length,
      urgent: this.messages.filter(m => m.priority === 'URGENT').length
    };

    return {
      totalOfficers,
      totalTasks,
      totalMessages,
      tasksByStatus,
      messagesByPriority,
      officersByDesignation: {
        dgp: this.getOfficersByDesignation('DGP').length,
        dig: this.getOfficersByDesignation('DIG').length,
        sp: this.getOfficersByDesignation('SP').length,
        cp: this.getOfficersByDesignation('CP').length,
        sdpo: this.getOfficersByDesignation('SDPO').length
      }
    };
  }
}

export default CommunicationService;
