import React, { useState, useEffect } from 'react';
import CommunicationService, { Task, Officer } from '../../services/communicationService';
import { getAllDistricts, getAllRanges } from '../../services/policeDataService';

interface TaskAssignmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  assignedBy: string; // DGP officer ID
  onTaskCreated?: (task: Task) => void;
}

const TaskAssignmentModal: React.FC<TaskAssignmentModalProps> = ({
  isOpen,
  onClose,
  assignedBy,
  onTaskCreated
}) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'MEDIUM' as Task['priority'],
    category: 'ROUTINE' as Task['category'],
    dueDate: '',
    assignmentType: 'INDIVIDUAL' as 'INDIVIDUAL' | 'DISTRICT' | 'RANGE' | 'COMMISSIONERATE' | 'ALL_SDPOS' | 'ALL_SPS' | 'STATE_WIDE',
    targetJurisdiction: [] as string[],
    selectedOfficers: [] as Officer[],
    tags: [] as string[]
  });

  const [availableOfficers, setAvailableOfficers] = useState<Officer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentTag, setCurrentTag] = useState('');

  useEffect(() => {
    if (isOpen) {
      // Reset form when modal opens
      setFormData({
        title: '',
        description: '',
        priority: 'MEDIUM',
        category: 'ROUTINE',
        dueDate: '',
        assignmentType: 'INDIVIDUAL',
        targetJurisdiction: [],
        selectedOfficers: [],
        tags: []
      });
      setSearchTerm('');
      setCurrentTag('');
      
      // Load all officers
      setAvailableOfficers(CommunicationService.getAllOfficers());
    }
  }, [isOpen]);

  useEffect(() => {
    // Update available officers based on assignment type
    let officers: Officer[] = [];
    
    switch (formData.assignmentType) {
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
  }, [formData.assignmentType, formData.targetJurisdiction, searchTerm]);

  const handleSubmit = () => {
    if (!formData.title.trim() || !formData.description.trim() || !formData.dueDate) {
      alert('Please fill in all required fields');
      return;
    }

    let assignedTo: Officer[] = [];
    
    if (formData.assignmentType === 'INDIVIDUAL') {
      assignedTo = formData.selectedOfficers;
    } else {
      assignedTo = availableOfficers;
    }

    if (assignedTo.length === 0) {
      alert('Please select at least one officer or target jurisdiction');
      return;
    }

    const task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'> = {
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: 'PENDING',
      assignedBy,
      assignedTo,
      assignedToType: formData.assignmentType,
      targetJurisdiction: formData.targetJurisdiction.length > 0 ? formData.targetJurisdiction : undefined,
      dueDate: formData.dueDate,
      category: formData.category,
      tags: formData.tags
    };

    const createdTask = CommunicationService.createTask(task);
    
    if (onTaskCreated) {
      onTaskCreated(createdTask);
    }

    alert(`Task "${formData.title}" assigned successfully to ${assignedTo.length} officer(s)!`);
    onClose();
  };

  const addTag = () => {
    if (currentTag.trim() && !formData.tags.includes(currentTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, currentTag.trim()]
      }));
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const toggleOfficerSelection = (officer: Officer) => {
    setFormData(prev => ({
      ...prev,
      selectedOfficers: prev.selectedOfficers.some(o => o.id === officer.id)
        ? prev.selectedOfficers.filter(o => o.id !== officer.id)
        : [...prev.selectedOfficers, officer]
    }));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-4xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-800">Assign Task</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            ✕
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column - Task Details */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Task Details</h3>
              
              {/* Title */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Task Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter task title"
                />
              </div>

              {/* Description */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter detailed task description"
                />
              </div>

              {/* Priority and Category */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as Task['priority'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                    <option value="URGENT">Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Task['category'] }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="ROUTINE">Routine</option>
                    <option value="INVESTIGATION">Investigation</option>
                    <option value="OPERATION">Operation</option>
                    <option value="ADMIN">Administrative</option>
                    <option value="TRAINING">Training</option>
                    <option value="EMERGENCY">Emergency</option>
                  </select>
                </div>
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Due Date *
                </label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, dueDate: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {/* Tags */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Tags
                </label>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addTag()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Add tag"
                  />
                  <button
                    onClick={addTag}
                    className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    🏷️
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {formData.tags.map(tag => (
                    <span key={tag} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                      {tag}
                      <button onClick={() => removeTag(tag)} className="text-blue-600 hover:text-blue-800">
                        ✕
                      </button>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Column - Assignment */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Assignment</h3>

              {/* Assignment Type */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Assignment Type
                </label>
                <select
                  value={formData.assignmentType}
                  onChange={(e) => setFormData(prev => ({ 
                    ...prev, 
                    assignmentType: e.target.value as typeof formData.assignmentType,
                    targetJurisdiction: [],
                    selectedOfficers: []
                  }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="INDIVIDUAL">Individual Officers</option>
                  <option value="DISTRICT">District-wise</option>
                  <option value="RANGE">Range-wise</option>
                  <option value="COMMISSIONERATE">Commissionerate-wise</option>
                  <option value="ALL_SDPOS">All SDPOs</option>
                  <option value="ALL_SPS">All SPs/CPs</option>
                  <option value="STATE_WIDE">State-wide (All Officers)</option>
                </select>
              </div>

              {/* Target Jurisdiction Selection */}
              {['DISTRICT', 'RANGE', 'COMMISSIONERATE'].includes(formData.assignmentType) && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Select {formData.assignmentType === 'DISTRICT' ? 'Districts' : 
                           formData.assignmentType === 'RANGE' ? 'Ranges' : 'Commissionerates'}
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
                    {formData.assignmentType === 'DISTRICT' && getAllDistricts().map(district => (
                      <option key={district} value={district}>{district}</option>
                    ))}
                    {formData.assignmentType === 'RANGE' && getAllRanges().map(range => (
                      <option key={range} value={range}>{range}</option>
                    ))}
                    {formData.assignmentType === 'COMMISSIONERATE' && ['Visakhapatnam City', 'Vijayawada City'].map(comm => (
                      <option key={comm} value={comm}>{comm}</option>
                    ))}
                  </select>
                  <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                </div>
              )}

              {/* Officer Search and Selection */}
              {formData.assignmentType === 'INDIVIDUAL' && (
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

              {/* Officers List */}
              <div className="border border-gray-300 rounded-md max-h-60 overflow-y-auto">
                <div className="p-3 bg-gray-50 border-b">
                  <h4 className="font-medium text-sm text-gray-700">
                    {formData.assignmentType === 'INDIVIDUAL' ? 'Available Officers' : 'Target Officers'} 
                    ({availableOfficers.length})
                  </h4>
                </div>
                <div className="p-2 space-y-1 max-h-48 overflow-y-auto">
                  {availableOfficers.map(officer => (
                    <div
                      key={officer.id}
                      className={`p-2 rounded cursor-pointer border ${
                        formData.assignmentType === 'INDIVIDUAL' && formData.selectedOfficers.some(o => o.id === officer.id)
                          ? 'bg-blue-100 border-blue-300'
                          : 'bg-white border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => formData.assignmentType === 'INDIVIDUAL' && toggleOfficerSelection(officer)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium text-sm">{officer.name}</p>
                          <p className="text-xs text-gray-600">{officer.designation} - {officer.jurisdiction}</p>
                        </div>
                        {formData.assignmentType === 'INDIVIDUAL' && (
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
                  {availableOfficers.length === 0 && (
                    <p className="text-center text-gray-500 py-4">No officers found</p>
                  )}
                </div>
              </div>

              {/* Assignment Summary */}
              <div className="bg-gray-50 p-3 rounded-md">
                <h4 className="font-medium text-sm text-gray-700 mb-2">Assignment Summary</h4>
                <p className="text-sm text-gray-600">
                  Task will be assigned to: <span className="font-medium">{availableOfficers.length} officer(s)</span>
                </p>
                {formData.assignmentType !== 'INDIVIDUAL' && (
                  <p className="text-xs text-gray-500 mt-1">
                    Assignment Type: {formData.assignmentType.replace('_', ' ')}
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
            📤 Assign Task
          </button>
        </div>
      </div>
    </div>
  );
};

export default TaskAssignmentModal;
