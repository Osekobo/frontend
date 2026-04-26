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
  FiUserX,
  FiTrendingUp,
  FiShield
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
    sendTo: 'all'
  });
  const [notification, setNotification] = useState({ show: false, type: '', message: '' });

  useEffect(() => {
    fetchSubscribers();
    fetchCount();
  }, []);

  useEffect(() => {
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
      <div className="flex justify-center items-center h-64 bg-warm">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-terra"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm py-8 px-4">
      <div className="container mx-auto max-w-7xl">
        {/* Notification */}
        {notification.show && (
          <div className={`fixed top-20 right-4 z-50 p-4 border-4 shadow-hard-sm flex items-center space-x-2 ${
            notification.type === 'success' ? 'bg-green-500 text-white border-black' : 'bg-red-500 text-white border-black'
          }`}>
            {notification.type === 'success' ? (
              <FiCheckCircle className="w-5 h-5" />
            ) : (
              <FiAlertCircle className="w-5 h-5" />
            )}
            <span>{notification.message}</span>
          </div>
        )}

        {/* Page Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-terra border-4 border-black shadow-hard-sm mb-4">
            <FiMail className="w-8 h-8 text-white" />
          </div>
          <h1 className="font-h text-3xl md:text-4xl font-bold text-black uppercase mb-2">Newsletter Management</h1>
          <div className="brick-line mx-auto"></div>
          <p className="text-ash mt-2">Manage your subscribers and send email campaigns</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white border-4 border-black shadow-hard-sm p-6 text-center hover:-translate-y-1 transition-all">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-terra border-4 border-black mb-3">
              <FiUsers className="w-6 h-6 text-white" />
            </div>
            <p className="text-ash text-sm uppercase tracking-wider">Total Subscribers</p>
            <p className="font-h text-3xl font-bold text-black mt-1">{count}</p>
          </div>
          <div className="bg-white border-4 border-black shadow-hard-sm p-6 text-center hover:-translate-y-1 transition-all">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-terra border-4 border-black mb-3">
              <FiSend className="w-6 h-6 text-white" />
            </div>
            <p className="text-ash text-sm uppercase tracking-wider">Active Campaigns</p>
            <p className="font-h text-3xl font-bold text-black mt-1">0</p>
          </div>
          <div className="bg-white border-4 border-black shadow-hard-sm p-6 text-center hover:-translate-y-1 transition-all">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-terra border-4 border-black mb-3">
              <FiTrendingUp className="w-6 h-6 text-white" />
            </div>
            <p className="text-ash text-sm uppercase tracking-wider">Open Rate</p>
            <p className="font-h text-3xl font-bold text-black mt-1">0%</p>
          </div>
        </div>

        {/* Actions Bar */}
        <div className="bg-white border-4 border-black shadow-hard-sm p-4 mb-6">
          <div className="flex justify-between items-center flex-wrap gap-4">
            <div className="flex flex-wrap gap-3">
              {selectedEmails.length > 0 && (
                <>
                  <button
                    onClick={() => openEmailModal('selected')}
                    className="bg-terra text-white px-4 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2"
                  >
                    <FiSend className="w-5 h-5" />
                    <span>Send to Selected ({selectedEmails.length})</span>
                  </button>
                  <button
                    onClick={handleBulkDelete}
                    className="bg-red-600 text-white px-4 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2"
                  >
                    <FiTrash2 className="w-5 h-5" />
                    <span>Delete Selected</span>
                  </button>
                </>
              )}
              <button
                onClick={() => openEmailModal('all')}
                className="bg-terra text-white px-4 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2"
              >
                <FiSend className="w-5 h-5" />
                <span>Send to All</span>
              </button>
              <button
                onClick={handleExportCSV}
                className="bg-terra text-white px-4 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2"
              >
                <FiDownload className="w-5 h-5" />
                <span>Export CSV</span>
              </button>
              <button
                onClick={fetchSubscribers}
                className="bg-terra text-white px-4 py-2 font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all flex items-center space-x-2"
              >
                <FiRefreshCw className="w-5 h-5" />
                <span>Refresh</span>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative">
              <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-ash" />
              <input
                type="text"
                placeholder="Search subscribers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra w-64"
              />
            </div>
          </div>
        </div>

        {/* Subscribers Table */}
        <div className="bg-white border-4 border-black shadow-hard-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y-2 divide-black">
              <thead className="bg-terra/10">
                <tr>
                  <th className="px-6 py-3 text-left">
                    <input
                      type="checkbox"
                      checked={selectedEmails.length === filteredSubscribers.length && filteredSubscribers.length > 0}
                      onChange={handleSelectAll}
                      className="w-4 h-4 border-2 border-black accent-terra"
                    />
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Subscribed Date</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y-2 divide-black">
                {filteredSubscribers.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center text-ash">
                      <FiMail className="w-12 h-12 mx-auto mb-3 text-ash" />
                      <p>No subscribers found</p>
                    </td>
                  </tr>
                ) : (
                  filteredSubscribers.map((subscriber) => (
                    <tr key={subscriber.id} className="hover:bg-terra/5 transition-colors">
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={selectedEmails.includes(subscriber.email)}
                          onChange={() => handleSelectEmail(subscriber.email)}
                          className="w-4 h-4 border-2 border-black accent-terra"
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ash">{subscriber.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FiMail className="w-4 h-4 text-terra mr-2" />
                          <span className="text-sm text-black">{subscriber.email}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-ash">
                        <div className="flex items-center">
                          <FiCalendar className="w-4 h-4 text-terra mr-2" />
                          {new Date(subscriber.subscribed_at).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 py-1 text-xs font-bold uppercase bg-green-100 text-green-800 border border-green-500">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => {
                              setSelectedEmails([subscriber.email]);
                              openEmailModal('single');
                            }}
                            className="text-terra hover:text-terra-dark transition-colors"
                            title="Send Email"
                          >
                            <FiSend className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDeleteSubscriber(subscriber.email)}
                            className="text-red-600 hover:text-red-700 transition-colors"
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
        </div>

        {/* Email Modal */}
        {showEmailModal && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="bg-white border-4 border-black shadow-hard-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center p-6 border-b-4 border-black">
                <h2 className="font-h text-2xl font-bold text-black uppercase">Send Newsletter Email</h2>
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="text-ash hover:text-terra transition-colors"
                >
                  <FiX className="w-6 h-6" />
                </button>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                    Recipients
                  </label>
                  <div className="bg-terra/5 border-2 border-terra p-3">
                    {emailData.sendTo === 'all' && (
                      <p className="text-black font-semibold">All subscribers ({subscribers.length} recipients)</p>
                    )}
                    {emailData.sendTo === 'selected' && (
                      <p className="text-black font-semibold">{selectedEmails.length} selected subscribers</p>
                    )}
                    {emailData.sendTo === 'single' && (
                      <p className="text-black font-semibold">Single subscriber: {selectedEmails[0]}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                    Subject *
                  </label>
                  <input
                    type="text"
                    value={emailData.subject}
                    onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                    placeholder="Enter email subject"
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-black uppercase tracking-wider mb-2">
                    Message *
                  </label>
                  <textarea
                    value={emailData.message}
                    onChange={(e) => setEmailData({ ...emailData, message: e.target.value })}
                    placeholder="Enter your email message here..."
                    rows="8"
                    className="w-full px-3 py-2 border-2 border-black focus:outline-none focus:ring-2 focus:ring-terra resize-none"
                  />
                </div>

                <div className="bg-terra/5 border-2 border-terra p-4">
                  <p className="text-sm text-black">
                    <strong className="text-terra">💡 Tip:</strong> Personalize your message by using placeholders like {'{name}'} or {'{email}'} that will be replaced automatically.
                  </p>
                </div>
              </div>

              <div className="flex justify-end space-x-3 p-6 border-t-4 border-black">
                <button
                  onClick={() => setShowEmailModal(false)}
                  className="px-4 py-2 bg-gray-300 text-black font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSendEmail}
                  disabled={isSending}
                  className="px-4 py-2 bg-terra text-white font-bold uppercase tracking-wider border-4 border-black shadow-hard-sm hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-none transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
                >
                  {isSending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
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
    </div>
  );
};

export default NewsletterSubscribers;