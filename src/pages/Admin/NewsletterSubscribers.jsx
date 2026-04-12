import { useState, useEffect } from 'react';
import api from '../../api/client';
import { 
  FiMail, 
  FiUsers, 
  FiCalendar, 
  FiTrash2, 
  FiDownload,
  FiSend,
  FiCheckCircle,
  FiAlertCircle,
  FiRefreshCw,
  FiSearch,
  FiX,
  FiUserCheck,
  FiUserX
} from 'react-icons/fi';

const NewsletterSubscribers = () => {
  const [subscribers, setSubscribers] = useState([]);
  const [filteredSubscribers, setFilteredSubscribers] = useState([]);
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedEmails, setSelectedEmails] = useState([]);
  const [isSending, setIsSending] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: '',
    message: '',
    sendTo: 'all' // 'all', 'selected', 'single'
  });
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchSubscribers();
    fetchCount();
  }, []);

  useEffect(() => {
    // Filter subscribers based on search term
    if (searchTerm) {
      const filtered = subscribers.filter(sub => 
        sub.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredSubscribers(filtered);
    } else {
      setFilteredSubscribers(subscribers);
    }
  }, [searchTerm, subscribers]);

  const fetchSubscribers = async () => {
    try {
      const response = await api.get('/newsletter/subscribers');
      setSubscribers(response.data);
      setFilteredSubscribers(response.data);
    } catch (error) {
      console.error('Failed to fetch subscribers:', error);
      showNotification('error', 'Failed to load subscribers');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCount = async () => {
    try {
      const response = await api.get('/newsletter/count');
      setCount(response.data.count);
    } catch (error) {
      console.error('Failed to fetch count:', error);
    }
  };

  const showNotification = (type, message) => {
    setNotification({ show: true, type, message });
    setTimeout(() => {
      setNotification({ show: false, type: '', message: '' });
    }, 5000);
  };

  const handleSelectAll = () => {
    if (selectedEmails.length === filteredSubscribers.length) {
      setSelectedEmails([]);
    } else {
      setSelectedEmails(filteredSubscribers.map(sub => sub.email));
    }
  };

  const handleSelectEmail = (email) => {
    if (selectedEmails.includes(email)) {
      setSelectedEmails(selectedEmails.filter(e => e !== email));
    } else {
      setSelectedEmails([...selectedEmails, email]);
    }
  };

  const handleDeleteSubscriber = async (email) => {
    if (window.confirm(`Are you sure you want to delete ${email} from the newsletter list?`)) {
      try {
        await api.post('/newsletter/unsubscribe', { email });
        showNotification('success', 'Subscriber removed successfully');
        fetchSubscribers();
        fetchCount();
      } catch (error) {
        showNotification('error', 'Failed to remove subscriber');
      }
    }
  };

  const handleBulkDelete = async () => {
    if (selectedEmails.length === 0) {
      showNotification('error', 'No subscribers selected');
      return;
    }

    if (window.confirm(`Are you sure you want to delete ${selectedEmails.length} subscriber(s)?`)) {
      setIsLoading(true);
      try {
        for (const email of selectedEmails) {
          await api.post('/newsletter/unsubscribe', { email });
        }
        showNotification('success', `${selectedEmails.length} subscriber(s) removed successfully`);
        setSelectedEmails([]);
        fetchSubscribers();
        fetchCount();
      } catch (error) {
        showNotification('error', 'Failed to remove subscribers');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleExportCSV = () => {
    if (subscribers.length === 0) {
      showNotification('error', 'No subscribers to export');
      return;
    }

    const csvData = [
      ['ID', 'Email', 'Subscribed Date', 'Status'],
      ...subscribers.map(sub => [
        sub.id,
        sub.email,
        new Date(sub.subscribed_at).toLocaleString(),
        sub.is_active === 1 ? 'Active' : 'Inactive'
      ])
    ];

    const csvContent = csvData.map(row => row.join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `newsletter_subscribers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
    showNotification('success', 'CSV exported successfully');
  };

  const handleSendEmail = async () => {
    if (!emailData.subject || !emailData.message) {
      showNotification('error', 'Please fill in both subject and message');
      return;
    }

    let recipients = [];
    if (emailData.sendTo === 'all') {
      recipients = subscribers.map(sub => sub.email);
    } else if (emailData.sendTo === 'selected') {
      recipients = selectedEmails;
    } else if (emailData.sendTo === 'single') {
      recipients = [selectedEmails[0]];
    }

    if (recipients.length === 0) {
      showNotification('error', 'No recipients selected');
      return;
    }

    setIsSending(true);
    try {
      // You'll need to create this endpoint in your backend
      await api.post('/newsletter/send', {
        recipients,
        subject: emailData.subject,
        message: emailData.message
      });
      showNotification('success', `Email sent to ${recipients.length} subscriber(s)!`);
      setShowEmailModal(false);
      setEmailData({ subject: '', message: '', sendTo: 'all' });
    } catch (error) {
      showNotification('error', 'Failed to send emails');
    } finally {
      setIsSending(false);
    }
  };

  const openEmailModal = (type) => {
    if (type === 'selected' && selectedEmails.length === 0) {
      showNotification('error', 'No subscribers selected');
      return;
    }
    if (type === 'single' && selectedEmails.length !== 1) {
      showNotification('error', 'Please select one subscriber');
      return;
    }
    setEmailData({ ...emailData, sendTo: type });
    setShowEmailModal(true);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      {/* Notification */}
      {notification.show && (
        <div className={`fixed top-20 right-4 z-50 p-4 rounded-lg shadow-lg flex items-center space-x-2 ${
          notification.type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
        }`}>
          {notification.type === 'success' ? (
            <FiCheckCircle className="w-5 h-5" />
          ) : (
            <FiAlertCircle className="w-5 h-5" />
          )}
          <span>{notification.message}</span>
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Newsletter Management</h1>
          <p className="text-gray-600 mt-1">Manage your subscribers and send email campaigns</p>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={handleExportCSV}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
          >
            <FiDownload className="w-5 h-5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={fetchSubscribers}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
          >
            <FiRefreshCw className="w-5 h-5" />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100">Total Subscribers</p>
              <p className="text-3xl font-bold mt-2">{count}</p>
            </div>
            <FiUsers className="w-12 h-12 text-blue-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100">Active Campaigns</p>
              <p className="text-3xl font-bold mt-2">0</p>
            </div>
            <FiSend className="w-12 h-12 text-green-200" />
          </div>
        </div>
        <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100">Open Rate</p>
              <p className="text-3xl font-bold mt-2">0%</p>
            </div>
            <FiMail className="w-12 h-12 text-purple-200" />
          </div>
        </div>
      </div>

      {/* Actions Bar */}
      <div className="flex justify-between items-center mb-6 flex-wrap gap-4">
        <div className="flex space-x-3">
          {selectedEmails.length > 0 && (
            <>
              <button
                onClick={() => openEmailModal('selected')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
              >
                <FiSend className="w-5 h-5" />
                <span>Send to Selected ({selectedEmails.length})</span>
              </button>
              <button
                onClick={handleBulkDelete}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2"
              >
                <FiTrash2 className="w-5 h-5" />
                <span>Delete Selected</span>
              </button>
            </>
          )}
          <button
            onClick={() => openEmailModal('all')}
            className="bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2"
          >
            <FiSend className="w-5 h-5" />
            <span>Send to All</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search subscribers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 w-64"
          />
        </div>
      </div>

      {/* Subscribers Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left">
                <input
                  type="checkbox"
                  checked={selectedEmails.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Subscribed Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredSubscribers.length === 0 ? (
              <tr>
                <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                  <FiMail className="w-12 h-12 mx-auto mb-3 text-gray-400" />
                  <p>No subscribers found</p>
                </td>
              </tr>
            ) : (
              filteredSubscribers.map((subscriber) => (
                <tr key={subscriber.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedEmails.includes(subscriber.email)}
                      onChange={() => handleSelectEmail(subscriber.email)}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{subscriber.id}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FiMail className="w-4 h-4 text-gray-400 mr-2" />
                      <span className="text-sm text-gray-900">{subscriber.email}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <FiCalendar className="w-4 h-4 text-gray-400 mr-2" />
                      {new Date(subscriber.subscribed_at).toLocaleDateString()}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                      Active
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setSelectedEmails([subscriber.email]);
                          openEmailModal('single');
                        }}
                        className="text-blue-600 hover:text-blue-900"
                        title="Send Email"
                      >
                        <FiSend className="w-5 h-5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubscriber(subscriber.email)}
                        className="text-red-600 hover:text-red-900"
                        title="Remove Subscriber"
                      >
                        <FiTrash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h2 className="text-2xl font-bold text-gray-800">Send Newsletter Email</h2>
              <button
                onClick={() => setShowEmailModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Recipients
                </label>
                <div className="bg-gray-100 rounded-lg p-3">
                  {emailData.sendTo === 'all' && (
                    <p className="text-gray-700">All subscribers ({subscribers.length} recipients)</p>
                  )}
                  {emailData.sendTo === 'selected' && (
                    <p className="text-gray-700">{selectedEmails.length} selected subscribers</p>
                  )}
                  {emailData.sendTo === 'single' && (
                    <p className="text-gray-700">Single subscriber: {selectedEmails[0]}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Subject *
                </label>
                <input
                  type="text"
                  value={emailData.subject}
                  onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                  placeholder="Enter email subject"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Message *
                </label>
                <textarea
                  value={emailData.message}
                  onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                  placeholder="Enter your email message here..."
                  rows="8"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <p className="text-sm text-blue-800">
                  <strong>Tip:</strong> Personalize your message by using placeholders like {'{name}'} or {'{email}'} that will be replaced automatically.
                </p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 p-6 border-t border-gray-200">
              <button
                onClick={() => setShowEmailModal(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleSendEmail}
                disabled={isSending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:bg-blue-400 flex items-center space-x-2"
              >
                {isSending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="w-5 h-5" />
                    <span>Send Email</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsletterSubscribers;