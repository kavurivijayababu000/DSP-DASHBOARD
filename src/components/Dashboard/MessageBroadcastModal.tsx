import React, { useState, useEffect } from 'react';
import CommunicationService, { Message, Officer } from '../../services/communicationService';
import { getAllDistricts, getAllRanges } from '../../services/policeDataService';

interface MessageBroadcastModalProps {
  isOpen: boolean;
  onClose: () => void;
  sentBy: string; // DGP officer ID
  onMessageSent?: (message: Message) => void;
}

const MessageBroadcastModal: React.FC<MessageBroadcastModalProps> = ({
  isOpen,
  onClose,
  sentBy,
  onMessageSent
}) => {
  const [formData, setFormData] = useState({
    subject: '',
    content: '',
    priority: 'MEDIUM' as Message['priority'],
    messageType: 'ANNOUNCEMENT' as Message['messageType'],
    broadcastType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'DISTRICT' | 'RANGE' | 'COMMISSIONERATE' | 'ALL_SDPOS' | 'ALL_SPS' | 'STATE_WIDE',
    targetJurisdiction: [] as string[],
    selectedOfficers: [] as Officer[],
    isUrgent: false
  });

  const [availableOfficers, setAvailableOfficers] = useState<Officer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        subject: '',
        content: '',
        priority: 'MEDIUM',
        messageType: 'ANNOUNCEMENT',
        broadcastType: 'INDIVIDUAL',
        targetJurisdiction: [],
        selectedOfficers: [],
        isUrgent: false
      });
      setSearchTerm('');
      
      // Load all officers
      setAvailableOfficers(CommunicationService.getAllOfficers());
    }
  }, [isOpen]);

  useEffect(() => {
    // Update available officers based on broadcast type
    let officers: Officer[] = [];
    
    switch (formData.broadcastType) {
      case 'INDIVIDUAL':
        officers = CommunicationService.getAllOfficers();
        break;
      case 'DISTRICT':
        if (formData.targetJurisdiction.length > 0) {
          officers = formData.targetJurisdiction.flatMap(district => 
            CommunicationService.getOfficersByDistrict(district)
          );
        }
        break;
      case 'RANGE':
        if (formData.targetJurisdiction.length > 0) {
          officers = formData.targetJurisdiction.flatMap(range => 
            CommunicationService.getOfficersByRange(range)
          );
        }
        break;
      case 'COMMISSIONERATE':
        if (formData.targetJurisdiction.length > 0) {
          officers = formData.targetJurisdiction.flatMap(comm => 
            CommunicationService.getOfficersByCommissionerate(comm)
          );
        }
        break;
      case 'ALL_SDPOS':
        officers = CommunicationService.getRecipientsForBroadcast('ALL_SDPOS', formData.targetJurisdiction);
        break;
      case 'ALL_SPS':
        officers = CommunicationService.getRecipientsForBroadcast('ALL_SPS', formData.targetJurisdiction);
        break;
      case 'STATE_WIDE':
        officers = CommunicationService.getRecipientsForBroadcast('STATE_WIDE');
        break;
    }

    // Filter by search term
    if (searchTerm) {
      officers = officers.filter(officer => 
        officer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.designation.toLowerCase().includes(searchTerm.toLowerCase()) ||
        officer.jurisdiction.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setAvailableOfficers(officers);
  }, [formData.broadcastType, formData.targetJurisdiction, searchTerm]);

  const handleSubmit = () => {
    if (!formData.subject.trim() || !formData.content.trim()) {
      alert('Please fill in subject and message content');
      return;
    }

    let sentTo: Officer[] = [];
    
    if (formData.broadcastType === 'INDIVIDUAL') {
      sentTo = formData.selectedOfficers;
    } else {
      sentTo = availableOfficers;
    }

    if (sentTo.length === 0) {
      alert('Please select at least one recipient');
      return;
    }

    const message: Omit<Message, 'id' | 'sentAt'> = {
      subject: formData.subject,
      content: formData.content,
      priority: formData.priority,
      sentBy,
      sentTo,
      sentToType: formData.broadcastType,
      targetJurisdiction: formData.targetJurisdiction.length > 0 ? formData.targetJurisdiction : undefined,
      messageType: formData.messageType,
      isUrgent: formData.isUrgent
    };

    const sentMessage = CommunicationService.sendMessage(message);
    
    if (onMessageSent) {
      onMessageSent(sentMessage);
    }

    alert(`Message "${formData.subject}" sent successfully to ${sentTo.length} officer(s)!`);
    onClose();
  };

  const toggleOfficerSelection = (officer: Officer) => {
    setFormData(prev => ({
      ...prev,
      selectedOfficers: prev.selectedOfficers.some(o => o.id === officer.id)
        ? prev.selectedOfficers.filter(o => o.id !== officer.id)
        : [...prev.selectedOfficers, officer]
    }));
  };

  const getMessageTemplate = (type: Message['messageType']) => {
    const templates = {
      ANNOUNCEMENT: 'Dear Officers,\n\nI am pleased to announce...\n\nBest regards,\nDGP, AP Police',
      DIRECTIVE: 'Dear Officers,\n\nYou are hereby directed to...\n\nThis directive is effective immediately.\n\nDGP, AP Police',
      INFORMATION: 'Dear Officers,\n\nFor your information...\n\nRegards,\nDGP, AP Police',
      ALERT: '🚨 URGENT ALERT 🚨\n\nImmediate attention required...\n\nDGP, AP Police',
      CIRCULAR: 'CIRCULAR\n\nSubject: ...\n\nAll concerned officers are informed that...\n\nDGP, AP Police'
    };
    return templates[type];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-5xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Send Message</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left Column - Message Details */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Message Details</h3>
              
              {/* Message Type and Priority */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Message Type
                  </label>
                  <select
                    value={formData.messageType}
                    onChange={(e) => {
                      const type = e.target.value as Message['messageType'];
                      setFormData(prev => ({ 
                        ...prev, 
                        messageType: type,
                        content: getMessageTemplate(type)
                      }));
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ANNOUNCEMENT">📢 Announcement</option>
                    <option value="DIRECTIVE">📋 Directive</option>
                    <option value="INFORMATION">ℹ️ Information</option>
                    <option value="ALERT">🚨 Alert</option>
                    <option value="CIRCULAR">📄 Circular</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Message['priority'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">🟢 Low</option>
                    <option value="MEDIUM">🟡 Medium</option>
                    <option value="HIGH">🟠 High</option>
                    <option value="URGENT">🔴 Urgent</option>
                  </select>
                </div>
              </div>

              {/* Urgent Checkbox */}
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isUrgent"
                  checked={formData.isUrgent}
                  onChange={(e) => setFormData(prev => ({ ...prev, isUrgent: e.target.checked }))}
                  className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                />
                <label htmlFor="isUrgent" className="ml-2 block text-sm text-gray-900">
                  🚨 Mark as Urgent (Immediate Attention Required)
                </label>
              </div>

              {/* Subject */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter message subject"
                />
              </div>

              {/* Content */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Message Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your message here..."
                />
                <div className="flex justify-between items-center mt-2">
                  <p className="text-xs text-gray-500">
                    Characters: {formData.content.length}
                  </p>
                  <button
                    onClick={() => setFormData(prev => ({ ...prev, content: getMessageTemplate(prev.messageType) }))}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    📝 Use Template
                  </button>
                </div>
              </div>
            </div>

            {/* Right Column - Recipients */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Recipients</h3>

              {/* Broadcast Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Broadcast Type
                </label>
                <select
                  value={formData.broadcastType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    broadcastType: e.target.value as typeof formData.broadcastType,
                    targetJurisdiction: [],
                    selectedOfficers: []
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INDIVIDUAL">👤 Individual Officers</option>
                  <option value="DISTRICT">🏛️ District-wise</option>
                  <option value="RANGE">📍 Range-wise</option>
                  <option value="COMMISSIONERATE">🏢 Commissionerate-wise</option>
                  <option value="ALL_SDPOS">👥 All SDPOs</option>
                  <option value="ALL_SPS">👨‍💼 All SPs/CPs</option>
                  <option value="STATE_WIDE">🌐 State-wide (All Officers)</option>
                </select>
              </div>

              {/* Target Jurisdiction Selection */}
              {['DISTRICT', 'RANGE', 'COMMISSIONERATE'].includes(formData.broadcastType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select {formData.broadcastType === 'DISTRICT' ? 'Districts' : 
                           formData.broadcastType === 'RANGE' ? 'Ranges' : 'Commissionerates'}
                  </label>
                  <select
                    multiple
                    value={formData.targetJurisdiction}
                    onChange={(e) => setFormData(prev => ({ 
                      ...prev, 
                      targetJurisdiction: Array.from(e.target.selectedOptions, option => option.value)
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[100px]"
                  >
                    {formData.broadcastType === 'DISTRICT' && getAllDistricts().map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                    {formData.broadcastType === 'RANGE' && getAllRanges().map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                    {formData.broadcastType === 'COMMISSIONERATE' && ['Visakhapatnam City', 'Vijayawada City'].map(comm => (
                      <option key={comm} value={comm}>{comm}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              )}

              {/* Officer Search and Selection */}
              {formData.broadcastType === 'INDIVIDUAL' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Search Officers
                  </label>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 mb-2"
                    placeholder="Search by name, designation, or jurisdiction"
                  />
                </div>
              )}

              {/* Recipients List */}
              <div className="border border-gray-300 rounded-md max-h-60 overflow-hidden">
                <div className="p-3 bg-gray-50 border-b">
                  <h4 className="font-medium text-sm text-gray-700">
                    {formData.broadcastType === 'INDIVIDUAL' ? 'Available Officers' : 'Target Recipients'} 
                    ({availableOfficers.length})
                  </h4>
                </div>
                <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                  {availableOfficers.slice(0, 50).map(officer => (
                    <div
                      key={officer.id}
                      className={`p-2 rounded cursor-pointer border ${
                        formData.broadcastType === 'INDIVIDUAL' && formData.selectedOfficers.some(o => o.id === officer.id)
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => formData.broadcastType === 'INDIVIDUAL' && toggleOfficerSelection(officer)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{officer.name}</p>
                          <p className="text-xs text-gray-600">{officer.designation} - {officer.jurisdiction}</p>
                        </div>
                        {formData.broadcastType === 'INDIVIDUAL' && (
                          <input
                            type="checkbox"
                            checked={formData.selectedOfficers.some(o => o.id === officer.id)}
                            onChange={() => toggleOfficerSelection(officer)}
                            className="rounded"
                          />
                        )}
                      </div>
                    </div>
                  ))}
                  {availableOfficers.length > 50 && (
                    <p className="text-center text-gray-500 py-2 text-xs">
                      ... and {availableOfficers.length - 50} more officers
                    </p>
                  )}
                  {availableOfficers.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No officers found</p>
                  )}
                </div>
              </div>

              {/* Broadcast Summary */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Broadcast Summary</h4>
                <p className="text-sm text-gray-600">
                  Message will be sent to: <span className="font-medium">{availableOfficers.length} officer(s)</span>
                </p>
                {formData.broadcastType !== 'INDIVIDUAL' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Broadcast Type: {formData.broadcastType.replace('_', ' ')}
                  </p>
                )}
                {formData.isUrgent && (
                  <p className="text-xs text-red-600 mt-1 font-medium">
                    🚨 Marked as URGENT
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            📤 Send Message
          </button>
        </div>
      </div>
    </div>
  );
};

export default MessageBroadcastModal;
