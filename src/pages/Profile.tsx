import React, { useState, useEffect } from 'react';
import { Routes, Route, useNavigate, useParams } from 'react-router-dom';
import { Search, FileText, Bell, User, Edit, CreditCard, RefreshCw } from 'lucide-react';
import DocumentCard from '../component/DocumentCard';
import BiddingDocCard from '../component/BiddingCard';
import Navbar from '../component/Layout/Navbar';
import TenderDocPage from './TenderDetailpage';
import { useAuth } from '../Redux/UseAuth';

// --- shadcn/ui components ---
const Button = ({ children, className = '', variant = 'default', size = 'default', ...props }) => {
  let sizeClasses = '';
  switch (size) {
    case 'sm': sizeClasses = 'h-8 px-3 text-sm'; break;
    case 'lg': sizeClasses = 'h-11 px-8 text-lg'; break;
    default: sizeClasses = 'h-10 px-4 py-2 text-base';
  }

  let variantClasses = '';
  switch (variant) {
    case 'outline': variantClasses = 'border border-gray-200 bg-white text-gray-900 shadow-sm hover:bg-gray-100'; break;
    case 'ghost': variantClasses = 'hover:bg-gray-100 text-gray-900'; break;
    case 'secondary': variantClasses = 'bg-gray-100 text-gray-900 hover:bg-gray-200'; break;
    default: variantClasses = 'bg-blue-600 text-white shadow-sm hover:bg-blue-700';
  }

  return (
    <button 
      className={`inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ${variantClasses} ${sizeClasses} ${className}`} 
      {...props}
    >
      {children}
    </button>
  );
};

const Input = (props) => (
  <input 
    className="flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm placeholder:text-gray-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50" 
    {...props} 
  />
);

const Select = ({ value, onChange, children, className = '', ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className={`flex h-10 w-full rounded-md border border-gray-200 bg-white px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    {...props}
  >
    {children}
  </select>
);

// --- Interfaces ---
interface TenderDoc {
  id: number;
  name: string;
  title: string;
  file: string;
  price?: string | null;
  type: 'FREE' | 'PAID';
  createdAt: string;
  tenderId: number;
  customers: number;
}

interface BiddingDoc {
  id: number;
  title: string;
  description?: string;
  company: string;
  file: string;
  price?: string | null;
  type: 'FREE' | 'PAID';
  tenderId: number;
  customers: number;
}

interface Category { id: number; name: string; }
interface Subcategory { id: number; name: string; }
interface Region { id: number; name: string; }

interface Tender {
  id: number;
  title: string;
  description?: string;
  type: 'FREE' | 'PAID';
  biddingOpen?: string;
  biddingClosed?: string;
  categoryId: number;
  category: Category;
  subcategoryId: number;
  subcategory: Subcategory;
  regionId?: number;
  region?: Region;
}

interface Pagination {
  currentPage: number;
  totalPages: number;
  totalDocs: number;
  limit: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface Notification {
  id: number;
  message: string;
  isRead: boolean;
  type: string;
  tenderId?: number;
  createdAt: string;
}

interface Customer {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: 'CUSTOMER' | 'SUPERUSER' | 'ADMIN' | 'DATAENTRY';
  isSubscribed: boolean;
  endDate?: string;
  createdAt: string;
  type: string;
  payments: { price: number; howLong?: 'TENDER' | 'THREEMONTHLY' | 'SIXMONTHLY' | 'YEARLY' }[];
}

// --- Enhanced Custom Styles ---
const customStyles = `
  .animate-fade-in { animation: fadeIn 0.5s ease-out; }
  .animate-slide-in { animation: slideIn 0.6s ease-out; }
  .animate-spin-slow { animation: spin 2s linear infinite; }
  .profile-card { background: linear-gradient(135deg, #ffffff 0%, #e5e7eb 100%); }
  .error-card { background: linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%); }
  .tab-active { transform: scale(1.05); transition: transform 0.3s ease, background-color 0.3s ease; }
  .tab-inactive:hover { transform: scale(1.03); transition: transform 0.3s ease, background-color 0.3s ease; }
  .notification-pulse { animation: pulse 1.5s ease-in-out infinite; }
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  @keyframes slideIn {
    from { transform: translateY(20px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(59, 130, 246, 0); }
    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
  }
`;

const Profile = () => {
  const navigate = useNavigate();
  const { user, token, status, error, isAuthenticated, logout, fetchUser, clearError } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'documents' | 'notifications' | 'subscription'>('profile');
  const [tenderSearch, setTenderSearch] = useState('');
  const [biddingSearch, setBiddingSearch] = useState('');
  const [tenderPage, setTenderPage] = useState(1);
  const [biddingPage, setBiddingPage] = useState(1);
  const [tenderFilter, setTenderFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [biddingFilter, setBiddingFilter] = useState<'ALL' | 'FREE' | 'PAID'>('ALL');
  const [tenderDocs, setTenderDocs] = useState<TenderDoc[]>([]);
  const [biddingDocs, setBiddingDocs] = useState<BiddingDoc[]>([]);
  const [tenderPagination, setTenderPagination] = useState<Pagination | null>(null);
  const [biddingPagination, setBiddingPagination] = useState<Pagination | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({ firstName: '', lastName: '', phone: '' });
  const [retryCount, setRetryCount] = useState(0);
  const itemsPerPage = 6;

  // Handle redirect in useEffect
  useEffect(() => {
    if (status !== 'loading' && !isAuthenticated) {
      navigate('/login');
    }
  }, [status, isAuthenticated, navigate]);

  // Fetch additional data and initialize form
  useEffect(() => {
    if (status === 'idle' && token && !user) {
      fetchUser();
    } else if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        phone: user.phone || '',
      });
      fetchAdditionalData();
    }
  }, [status, token, user, tenderPage, biddingPage, tenderSearch, tenderFilter, biddingSearch, biddingFilter]);

  const fetchAdditionalData = async () => {
    try {
      const tenderParams = new URLSearchParams({
        page: tenderPage.toString(),
        limit: itemsPerPage.toString(),
        ...(tenderSearch && { search: tenderSearch }),
        ...(tenderFilter !== 'ALL' && { type: tenderFilter }),
      });
      const tenderDocsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/tenderdoc/PurchasedTenderDocs?${tenderParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!tenderDocsResponse.ok) throw new Error('Failed to fetch purchased tender documents');
      const tenderDocsData = await tenderDocsResponse.json();
      setTenderDocs(Array.isArray(tenderDocsData.data) ? tenderDocsData.data : []);
      setTenderPagination(tenderDocsData.pagination || null);

      const biddingParams = new URLSearchParams({
        page: biddingPage.toString(),
        limit: itemsPerPage.toString(),
        ...(biddingSearch && { search: biddingSearch }),
        ...(biddingFilter !== 'ALL' && { type: biddingFilter }),
      });
      const biddingDocsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/tenderdoc/PurchasedBiddingDocs?${biddingParams}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!biddingDocsResponse.ok) throw new Error('Failed to fetch purchased bidding documents');
      const biddingDocsData = await biddingDocsResponse.json();
      setBiddingDocs(Array.isArray(biddingDocsData.data) ? biddingDocsData.data : []);
      setBiddingPagination(biddingDocsData.pagination || null);

      const notificationsResponse = await fetch(`${process.env.REACT_APP_API_URL}/api/notification/customer`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!notificationsResponse.ok) throw new Error('Failed to fetch notifications');
      const notificationsData = await notificationsResponse.json();
      setNotifications(Array.isArray(notificationsData.data) ? notificationsData.data : []);
    } catch (err: any) {
      console.error('Error fetching additional data:', err);
    }
  };

  const handleEditProfile = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/users/updateCustomerProfile`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
      await fetchUser();
      setEditMode(false);
    } catch (err: any) {
      console.error('Error updating profile:', err);
      alert(`Failed to update profile: ${err.message}`);
    }
  };

  const handleMarkAsRead = async (notificationId: number) => {
    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/notification/${notificationId}/mark-read`, {
        method: 'PATCH',
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error('Failed to mark notification as read');
      setNotifications(notifications.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
    } catch (err: any) {
      console.error('Error marking notification as read:', err);
      alert(`Failed to mark notification as read: ${err.message}`);
    }
  };

  const handleDownload = async (file: string, name: string, type: 'FREE' | 'PAID') => {
    try {
      const response = await fetch(file, {
        headers: type === 'PAID' ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!response.ok) throw new Error('Failed to fetch file');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = name || 'document';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      console.error('Download error:', err);
      alert(`Failed to download the file: ${err.message}`);
    }
  };

  const renderPagination = (currentPage: number, totalPages: number, setPage: (page: number) => void) => (
    <div className="flex justify-center items-center gap-2 mt-6 animate-fade-in">
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === 1}
        onClick={() => setPage(currentPage - 1)}
      >
        Previous
      </Button>
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
        <Button
          key={page}
          variant={currentPage === page ? 'default' : 'outline'}
          size="sm"
          onClick={() => setPage(page)}
        >
          {page}
        </Button>
      ))}
      <Button
        variant="outline"
        size="sm"
        disabled={currentPage === totalPages}
        onClick={() => setPage(currentPage + 1)}
      >
        Next
      </Button>
    </div>
  );

  const ProfilePage = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50">
      <Navbar />
      <style>{customStyles}</style>
      <div className="max-w-[1600px] mx-auto px-4 py-8 pt-24">
        <div className="text-center mb-8 animate-slide-in">
          <h1 className="font-bold text-4xl text-gray-900 mb-2">Your Profile Dashboard</h1>
          <p className="text-lg text-gray-600">Manage your account, documents, and notifications with ease</p>
        </div>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="flex border-b border-gray-200 max-w-7xl mx-auto">
            {[
              { tab: 'profile', icon: User, label: 'Profile' },
              { tab: 'documents', icon: FileText, label: 'Documents', count: (tenderPagination?.totalDocs || 0) + (biddingPagination?.totalDocs || 0) },
              { tab: 'notifications', icon: Bell, label: 'Notifications', count: notifications.length },
              { tab: 'subscription', icon: CreditCard, label: 'Subscription' },
            ].map(({ tab, icon: Icon, label, count }) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as any)}
                className={`flex-1 px-8 py-6 text-center font-bold text-lg transition-all duration-300 flex items-center justify-center ${
                  activeTab === tab
                    ? 'text-blue-600 bg-blue-50 tab-active'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 tab-inactive'
                }`}
              >
                <Icon className="w-5 h-5 mr-2" />
                {label}
                {count !== undefined && (
                  <span className="ml-2 px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
                    {count}
                  </span>
                )}
              </button>
            ))}
          </div>

          <div className="p-8">
            {activeTab === 'profile' && (
              <div className="animate-fade-in">
                {status === 'loading' && (
                  <div className="text-center py-12">
                    <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
                    <p className="text-lg text-gray-600">Loading your profile...</p>
                  </div>
                )}
                {status === 'failed' && (
                  <div className="error-card p-8 rounded-lg shadow-lg text-center max-w-md mx-auto">
                    <User className="w-16 h-16 text-red-400 mx-auto mb-4" />
                    <h3 className="font-bold text-xl text-red-600 mb-2">Oops, Something Went Wrong</h3>
                    <p className="text-gray-600 mb-4">{error || 'Unable to load profile data.'}</p>
                    <Button
                      variant="default"
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => {
                        clearError();
                        fetchUser();
                        setRetryCount(prev => prev + 1);
                      }}
                      disabled={retryCount >= 3}
                    >
                      <RefreshCw className="w-4 h-4 mr-2" />
                      {retryCount >= 3 ? 'Max Retries Reached' : 'Try Again'}
                    </Button>
                    {retryCount >= 3 && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-4"
                        onClick={() => navigate('/login')}
                      >
                        Back to Login
                      </Button>
                    )}
                  </div>
                )}
                {user && status === 'succeeded' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="profile-card p-6 rounded-lg shadow-sm">
                      <div className="flex justify-between items-center mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">Personal Information</h2>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setEditMode(!editMode)}
                          >
                            <Edit className="w-4 h-4 mr-2" />
                            {editMode ? 'Cancel' : 'Edit Profile'}
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => logout()}
                          >
                            Logout
                          </Button>
                        </div>
                      </div>
                      {editMode ? (
                        <div className="space-y-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700">First Name</label>
                            <Input
                              value={formData.firstName}
                              onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                              placeholder="First Name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Last Name</label>
                            <Input
                              value={formData.lastName}
                              onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                              placeholder="Last Name"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700">Phone</label>
                            <Input
                              value={formData.phone}
                              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                              placeholder="Phone Number"
                            />
                          </div>
                          <Button onClick={handleEditProfile} className="bg-blue-600 hover:bg-blue-700">
                            Save Changes
                          </Button>
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <p className="text-gray-600"><span className="font-semibold">Name:</span> {user.firstName} {user.lastName}</p>
                          <p className="text-gray-600"><span className="font-semibold">Email:</span> {user.email}</p>
                          <p className="text-gray-600"><span className="font-semibold">Phone:</span> {user.phone || 'Not provided'}</p>
                          <p className="text-gray-600"><span className="font-semibold">Role:</span> {user.role}</p>
                          <p className="text-gray-600"><span className="font-semibold">Joined:</span> {new Date(user.createdAt).toLocaleDateString()}</p>
                        </div>
                      )}
                    </div>
                    <div className="profile-card p-6 rounded-lg shadow-sm">
                      <h2 className="text-2xl font-bold text-gray-900 mb-4">Account Summary</h2>
                      <div className="space-y-2">
                        <p className="text-gray-600"><span className="font-semibold">Purchased Documents:</span> {(tenderDocs.length + biddingDocs.length)}</p>
                        <p className="text-gray-600"><span className="font-semibold">Notifications:</span> {notifications.length} (Unread: {notifications.filter(n => !n.isRead).length})</p>
                        <p className="text-gray-600"><span className="font-semibold">Subscription:</span> {user.isSubscribed ? 'Active' : 'Inactive'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'documents' && (
              <div className="animate-fade-in">
                <div className="mb-8 flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="relative max-w-md w-full">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                    <Input
                      placeholder="Search your documents..."
                      value={tenderSearch}
                      onChange={(e) => {
                        setTenderSearch(e.target.value);
                        setBiddingSearch(e.target.value);
                        setTenderPage(1);
                        setBiddingPage(1);
                      }}
                      className="pl-10 py-3 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                    />
                  </div>
                  <Select
                    value={tenderFilter}
                    onChange={(e) => {
                      setTenderFilter(e.target.value as 'ALL' | 'FREE' | 'PAID');
                      setBiddingFilter(e.target.value as 'ALL' | 'FREE' | 'PAID');
                      setTenderPage(1);
                      setBiddingPage(1);
                    }}
                    className="max-w-[150px]"
                  >
                    <option value="ALL">All</option>
                    <option value="FREE">Free</option>
                    <option value="PAID">Paid</option>
                  </Select>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {tenderDocs.map((doc, index) => (
                    <DocumentCard
                      key={doc.id}
                      document={doc}
                      delay={index * 100}
                      canAccess={true}
                      onDownload={() => handleDownload(doc.file, doc.name, doc.type)}
                      onPreview={() => navigate(`/profile/tender/${doc.tenderId}`)}
                    />
                  ))}
                  {biddingDocs.map((doc, index) => (
                    <BiddingDocCard
                      key={doc.id}
                      doc={doc}
                      delay={index * 100}
                      onDownload={() => handleDownload(doc.file, doc.title, doc.type)}
                      onPreview={() => navigate(`/profile/tender/${doc.tenderId}`)}
                    />
                  ))}
                </div>

                {(tenderDocs.length === 0 && biddingDocs.length === 0) && (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin-slow" />
                    <h3 className="font-bold text-xl text-gray-500 mb-2">No Documents Found</h3>
                    <p className="text-gray-400">Try adjusting your search or filter to find documents.</p>
                  </div>
                )}

                {(tenderPagination?.totalPages > 1 || biddingPagination?.totalPages > 1) && (
                  <div className="mt-6">
                    {tenderPagination && tenderPagination.totalPages > 1 && (
                      <>
                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Tender Documents</h3>
                        {renderPagination(tenderPagination.currentPage, tenderPagination.totalPages, setTenderPage)}
                      </>
                    )}
                    {biddingPagination && biddingPagination.totalPages > 1 && (
                      <>
                        <h3 className="text-lg font-semibold text-gray-700 mt-4 mb-2">Bidding Proposals</h3>
                        {renderPagination(biddingPagination.currentPage, biddingPagination.totalPages, setBiddingPage)}
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="animate-fade-in">
                <div className="grid grid-cols-1 gap-4">
                  {notifications.map((notification, index) => (
                    <div
                      key={notification.id}
                      className={`p-4 rounded-lg shadow-sm flex justify-between items-center transition-all duration-300 ${
                        notification.isRead ? 'bg-gray-100' : 'bg-blue-50 notification-pulse'
                      }`}
                      style={{ animationDelay: `${index * 100}ms` }}
                    >
                      <div>
                        <p className="text-gray-900 font-medium">{notification.message}</p>
                        <p className="text-sm text-gray-500">
                          {new Date(notification.createdAt).toLocaleString()} • Type: {notification.type}
                        </p>
                        {notification.tenderId && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => navigate(`/profile/tender/${notification.tenderId}`)}
                          >
                            View Tender
                          </Button>
                        )}
                      </div>
                      {!notification.isRead && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleMarkAsRead(notification.id)}
                        >
                          Mark as Read
                        </Button>
                      )}
                    </div>
                  ))}
                </div>
                {notifications.length === 0 && (
                  <div className="text-center py-12">
                    <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4 animate-spin-slow" />
                    <h3 className="font-bold text-xl text-gray-500 mb-2">No Notifications</h3>
                    <p className="text-gray-400">You're all caught up!</p>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'subscription' && (
              <div className="animate-fade-in">
                <div className="profile-card p-6 rounded-lg shadow-sm">
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Subscription Details</h2>
                  {user ? (
                    <>
                      <p className="text-gray-600"><span className="font-semibold">Status:</span> {user.isSubscribed ? 'Active' : 'Inactive'}</p>
                      {user.isSubscribed && user.endDate && (
                        <p className="text-gray-600"><span className="font-semibold">End Date:</span> {new Date(user.endDate).toLocaleDateString()}</p>
                      )}
                      {user.payments.length > 0 && (
                        <div>
                          <p className="text-gray-600"><span className="font-semibold">Plan:</span> {user.payments[0].howLong || 'Not specified'}</p>
                          <p className="text-gray-600"><span className="font-semibold">Price:</span> ${user.payments[0].price.toFixed(2)}</p>
                        </div>
                      )}
                      <Button
                        variant="default"
                        className="mt-4 bg-blue-600 hover:bg-blue-700"
                        onClick={() => navigate('/subscribe')}
                      >
                        {user.isSubscribed ? 'Manage Subscription' : 'Subscribe Now'}
                      </Button>
                    </>
                  ) : (
                    <p className="text-gray-600">No subscription information available.</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Routes>
      <Route path="/" element={<ProfilePage />} />
      <Route path="/tender/:tenderId" element={<TenderDocPageWrapper />} />
    </Routes>
  );
};

// TenderDocPageWrapper
const TenderDocPageWrapper = () => {
  const { tenderId } = useParams();
  const [tender, setTender] = useState<Tender | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const { token, user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    const fetchTender = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_API_URL}/api/tender/${tenderId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to fetch tender');
        }
        const data = await response.json();
        setTender(data.data || null);
      } catch (err: any) {
        setError(err.message || 'Tender not found');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTender();
  }, [tenderId, isAuthenticated, token, navigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <p className="text-lg text-gray-600">Loading tender...</p>
        </div>
      </div>
    );
  }

  if (error || !tender) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-cyan-50 flex items-center justify-center">
        <div className="error-card p-8 rounded-lg shadow-lg text-center max-w-md">
          <FileText className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <h3 className="font-bold text-xl text-red-600 mb-2">Tender Not Found</h3>
          <p className="text-gray-600 mb-4">{error || 'The requested tender could not be loaded.'}</p>
          <Button
            variant="default"
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => navigate('/profile')}
          >
            Back to Profile
          </Button>
        </div>
      </div>
    );
  }

  return (
    <TenderDocPage
      tender={tender}
      isSubscribed={!!user?.isSubscribed}
      onBack={() => navigate('/profile')}
    />
  );
};

export default Profile;