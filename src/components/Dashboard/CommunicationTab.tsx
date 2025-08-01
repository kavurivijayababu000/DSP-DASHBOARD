import React, { useState, useEffect } from 'react';
import CommunicationService, { Task, Message, Officer } from '../../services/communicationService';
import TaskAssignmentModal from './TaskAssignmentModal';
import MessageBroadcastModal from './MessageBroadcastModal';

interface CommunicationTabProps {
  userRole?: string;
  userId?: string;
}

const CommunicationTab: React.FC<CommunicationTabProps> = ({ userRole, userId = 'dgp-001' }) => {
  const [activeSubTab, setActiveSubTab] = useState('overview');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [statistics, setStatistics] = useState<any>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isMessageModalOpen, setIsMessageModalOpen] = useState(false);

  useEffect(() => {
    // Load initial data
    loadData();
  }, []);

  const loadData = () => {
    setTasks(CommunicationService.getAllTasks());
    setMessages(CommunicationService.getAllMessages());
    setStatistics(CommunicationService.getStatistics());
  };

  const handleTaskCreated = (task: Task) => {
    loadData(); // Reload data after task creation
  };

  const handleMessageSent = (message: Message) => {
    loadData(); // Reload data after message sent
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'URGENT': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'IN_PROGRESS': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'COMPLETED': return 'bg-green-100 text-green-800 border-green-200';
      case 'OVERDUE': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (userRole !== 'DGP') {
    return (
      <div className="p-6 text-center">
        <h3 className="text-lg font-medium text-gray-800 mb-2">Access Restricted</h3>
        <p className="text-gray-600">Communication management is only available for DGP users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Communication Management</h2>
          <p className="text-gray-600">Send messages and assign tasks to officers across AP Police</p>
        </div>
        <div className="flex space-x-3 mt-4 sm:mt-0">
          <button
            onClick={() => setIsMessageModalOpen(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2"
          >
            📤 Send Message
          </button>
          <button
            onClick={() => setIsTaskModalOpen(true)}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center gap-2"
          >
            📋 Assign Task
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {statistics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Total Officers</h3>
            <p className="text-3xl font-bold text-gray-900">{statistics.totalOfficers}</p>
            <div className="mt-2 text-xs text-gray-600">
              <div>DGP: {statistics.officersByDesignation.dgp}</div>
              <div>DIGs: {statistics.officersByDesignation.dig}</div>
              <div>SPs: {statistics.officersByDesignation.sp}</div>
              <div>CPs: {statistics.officersByDesignation.cp}</div>
              <div>SDPOs: {statistics.officersByDesignation.sdpo}</div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Active Tasks</h3>
            <p className="text-3xl font-bold text-blue-900">{statistics.totalTasks}</p>
            <div className="mt-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Pending:</span> <span>{statistics.tasksByStatus.pending}</span>
              </div>
              <div className="flex justify-between">
                <span>In Progress:</span> <span>{statistics.tasksByStatus.inProgress}</span>
              </div>
              <div className="flex justify-between">
                <span>Completed:</span> <span>{statistics.tasksByStatus.completed}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Messages Sent</h3>
            <p className="text-3xl font-bold text-green-900">{statistics.totalMessages}</p>
            <div className="mt-2 text-xs text-gray-600">
              <div className="flex justify-between">
                <span>Low:</span> <span>{statistics.messagesByPriority.low}</span>
              </div>
              <div className="flex justify-between">
                <span>Medium:</span> <span>{statistics.messagesByPriority.medium}</span>
              </div>
              <div className="flex justify-between">
                <span>High:</span> <span>{statistics.messagesByPriority.high}</span>
              </div>
              <div className="flex justify-between">
                <span>Urgent:</span> <span>{statistics.messagesByPriority.urgent}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow border">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Communication Health</h3>
            <p className="text-3xl font-bold text-green-600">
              {statistics.totalTasks > 0 ? Math.round((statistics.tasksByStatus.completed / statistics.totalTasks) * 100) : 0}%
            </p>
            <p className="text-xs text-gray-600 mt-2">Task Completion Rate</p>
          </div>
        </div>
      )}

      {/* Sub Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📊 Overview
          </button>
          <button
            onClick={() => setActiveSubTab('tasks')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'tasks'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📋 Tasks ({tasks.length})
          </button>
          <button
            onClick={() => setActiveSubTab('messages')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeSubTab === 'messages'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            📤 Messages ({messages.length})
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      <div>
        {activeSubTab === 'overview' && (
          <div className="space-y-6">
            {/* Recent Activity */}
            <div className="bg-white rounded-lg shadow border overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-200">
                <h3 className="text-lg font-semibold">Recent Activity</h3>
              </div>
              <div className="p-6">
                <div className="space-y-4">
                  {/* Recent Tasks */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recent Tasks</h4>
                    {tasks.slice(0, 3).map(task => (
                      <div key={task.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-sm">{task.title}</p>
                          <p className="text-xs text-gray-600">
                            Assigned to {task.assignedTo.length} officer(s) • {formatDate(task.createdAt)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                    ))}
                    {tasks.length === 0 && (
                      <p className="text-sm text-gray-500">No tasks assigned yet</p>
                    )}
                  </div>

                  {/* Recent Messages */}
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Recent Messages</h4>
                    {messages.slice(0, 3).map(message => (
                      <div key={message.id} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                        <div>
                          <p className="font-medium text-sm">{message.subject}</p>
                          <p className="text-xs text-gray-600">
                            Sent to {message.sentTo.length} officer(s) • {formatDate(message.sentAt)}
                          </p>
                        </div>
                        <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </div>
                    ))}
                    {messages.length === 0 && (
                      <p className="text-sm text-gray-500">No messages sent yet</p>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow border p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Message Templates</h3>
                <div className="space-y-3">
                  {[
                    { type: 'ANNOUNCEMENT', title: '📢 General Announcement', desc: 'Send announcements to all officers' },
                    { type: 'DIRECTIVE', title: '📋 Official Directive', desc: 'Issue official directives and orders' },
                    { type: 'ALERT', title: '🚨 Security Alert', desc: 'Send urgent security alerts' }
                  ].map(template => (
                    <button
                      key={template.type}
                      onClick={() => setIsMessageModalOpen(true)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <p className="font-medium text-sm">{template.title}</p>
                      <p className="text-xs text-gray-600">{template.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-lg shadow border p-6">
                <h3 className="text-lg font-semibold mb-4">Quick Task Templates</h3>
                <div className="space-y-3">
                  {[
                    { type: 'ROUTINE', title: '📋 Routine Inspection', desc: 'Schedule routine inspections' },
                    { type: 'TRAINING', title: '🎓 Training Session', desc: 'Organize training sessions' },
                    { type: 'OPERATION', title: '🚔 Special Operation', desc: 'Plan special operations' }
                  ].map(template => (
                    <button
                      key={template.type}
                      onClick={() => setIsTaskModalOpen(true)}
                      className="w-full text-left p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                    >
                      <p className="font-medium text-sm">{template.title}</p>
                      <p className="text-xs text-gray-600">{template.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeSubTab === 'tasks' && (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">All Tasks</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Task</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Assigned To</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {tasks.map(task => (
                    <tr key={task.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{task.title}</div>
                          <div className="text-sm text-gray-500">{task.description.slice(0, 100)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded border ${getStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {task.assignedTo.length} officer(s)
                        <div className="text-xs text-gray-500">{task.assignedToType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(task.dueDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(task.createdAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {tasks.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No tasks assigned yet</p>
                  <button
                    onClick={() => setIsTaskModalOpen(true)}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Create your first task
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {activeSubTab === 'messages' && (
          <div className="bg-white rounded-lg shadow border overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold">All Messages</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subject</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Recipients</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {messages.map(message => (
                    <tr key={message.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 flex items-center gap-2">
                            {message.isUrgent && <span className="text-red-500">🚨</span>}
                            {message.subject}
                          </div>
                          <div className="text-sm text-gray-500">{message.content.slice(0, 100)}...</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.messageType}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 py-1 text-xs rounded border ${getPriorityColor(message.priority)}`}>
                          {message.priority}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {message.sentTo.length} officer(s)
                        <div className="text-xs text-gray-500">{message.sentToType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(message.sentAt)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {messages.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500">No messages sent yet</p>
                  <button
                    onClick={() => setIsMessageModalOpen(true)}
                    className="mt-2 text-blue-600 hover:text-blue-800"
                  >
                    Send your first message
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <TaskAssignmentModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        assignedBy={userId}
        onTaskCreated={handleTaskCreated}
      />

      <MessageBroadcastModal
        isOpen={isMessageModalOpen}
        onClose={() => setIsMessageModalOpen(false)}
        sentBy={userId}
        onMessageSent={handleMessageSent}
      />
    </div>
  );
};

export default CommunicationTab;
