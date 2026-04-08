import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  Users, 
  CheckSquare, 
  Settings, 
  Bell, 
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Calendar,
  MoreVertical,
  Activity,
  LogOut,
  Sun,
  User,
  Camera,
  CreditCard,
  Globe
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MasterAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [companies, setCompanies] = useState([]);
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [profileName, setProfileName] = useState('Master Admin');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/dashboard`);
      const data = await res.json();
      if (data.success) {
        setCompanies(data.companies);
        setMeetings(data.meetings);
      }
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const filteredMeetings = meetings.filter(m => {
    if (!searchQuery) return true;
    return JSON.stringify(m).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const filteredCompanies = companies.filter(c => {
    if (!searchQuery) return true;
    return JSON.stringify(c).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pendingCompanies = filteredCompanies.filter(c => c.subscription_status === 'pending');
  const activeClientsCount = companies.filter(c => c.subscription_status === 'active').length;

  const updateCompanyStatus = async (id, action, newStatus = null) => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/admin/company/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, status: newStatus })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      toast.success(action === 'reject' ? 'Company rejected' : 'Company updated');
      fetchDashboardData();
    } catch (error) {
      toast.error('Failed to update company');
    }
  };

  const handleApprove = (id) => updateCompanyStatus(id, 'approve');
  const handleReject = (id) => updateCompanyStatus(id, 'reject');
  const toggleSubscription = (id, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    updateCompanyStatus(id, 'toggle', newStatus);
  };

  const handleExportData = () => {
    const headers = ['Company Name', 'Email', 'Industry', 'Status', 'Joined Date'];
    const rows = companies.map(c => [
      `"${c.name}"`, 
      `"${c.email || ''}"`, 
      `"${c.industry || ''}"`, 
      `"${c.subscription_status}"`, 
      `"${new Date(c.created_at).toLocaleDateString()}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows.map(e => e.join(','))].join("\n");
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "client_data_export.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast.success('Client data exported to CSV');
  };

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex transition-colors">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-10 transition-all duration-300">
        <div className="p-6 flex items-center gap-3 bg-slate-950/50 border-b border-slate-800">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center overflow-hidden">
            {avatar ? <img src={URL.createObjectURL(avatar)} className="h-full w-full object-cover" /> : <LayoutDashboard className="h-5 w-5 text-white" />}
          </div>
          <span className="text-xl font-bold text-white tracking-tight">{profileName}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'overview' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Activity className="h-5 w-5" />
            Global Overview
          </button>
          <button 
            onClick={() => setActiveTab('approvals')}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'approvals' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <CheckSquare className="h-5 w-5" />
              Pending Approvals
            </div>
            {pendingCompanies.length > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingCompanies.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('clients')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'clients' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Users className="h-5 w-5" />
            Client Management
          </button>
        </nav>
        
        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 transition-colors">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="Search clients, transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 dark:border-slate-700 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all bg-slate-50 dark:bg-slate-800 dark:text-white"
              />
            </div>
          </div>
          <div className="flex items-center gap-4 relative">
            <button 
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              className="relative p-2 text-slate-400 hover:text-slate-500 transition-colors"
            >
              {pendingCompanies.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>}
              <Bell className="h-5 w-5" />
            </button>
            
            {/* Notification Dropdown */}
            {showNotifications && (
               <div className="absolute top-12 right-12 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100"><h3 className="font-semibold text-slate-900">Notifications</h3></div>
                {pendingCompanies.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {pendingCompanies.map(comp => (
                      <div key={comp.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer" onClick={() => { setActiveTab('approvals'); setShowNotifications(false); }}>
                        <p className="text-sm text-slate-800"><span className="font-semibold">{comp.name}</span> is pending approval.</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="px-4 py-6 text-center text-sm text-slate-500">No new notifications</div>
                )}
              </div>
            )}

            <div className="relative">
              <button 
                onClick={() => {
                  setShowProfileMenu(!showProfileMenu);
                  setShowNotifications(false);
                }}
                className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center border border-indigo-200 hover:ring-2 hover:ring-indigo-500 transition-all focus:outline-none overflow-hidden"
              >
                <span className="text-sm font-bold text-indigo-700">
                  {avatar ? (
                     <img src={URL.createObjectURL(avatar)} className="h-full w-full object-cover rounded-full" />
                  ) : (
                     profileName.charAt(0) || 'M'
                  )}
                </span>
              </button>

              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{profileName}</p>
                  </div>
                  <button 
                    onClick={() => {
                      localStorage.removeItem('user');
                      navigate('/login');
                    }}
                    className="w-full text-left px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 flex items-center gap-2"
                  >
                    <LogOut className="h-4 w-4" />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dynamic Content Area */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-7xl mx-auto">
            
            {/* OVERVIEW TAB */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Global Overview</h1>
                
                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white dark:!bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:!border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="h-12 w-12 bg-indigo-50 dark:!bg-indigo-500/10 rounded-xl flex items-center justify-center">
                      <Users className="h-6 w-6 text-indigo-600 dark:!text-indigo-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:!text-slate-400">Active Clients</p>
                      <p className="text-2xl font-bold text-slate-900 dark:!text-white">{activeClientsCount}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:!bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:!border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="h-12 w-12 bg-rose-50 dark:!bg-rose-500/10 rounded-xl flex items-center justify-center">
                      <Clock className="h-6 w-6 text-rose-600 dark:!text-rose-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:!text-slate-400">Pending Approvals</p>
                      <p className="text-2xl font-bold text-slate-900 dark:!text-white">{pendingCompanies.length}</p>
                    </div>
                  </div>
                  <div className="bg-white dark:!bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:!border-slate-800 shadow-sm flex items-center gap-4 transition-colors">
                    <div className="h-12 w-12 bg-emerald-50 dark:!bg-emerald-500/10 rounded-xl flex items-center justify-center">
                      <Calendar className="h-6 w-6 text-emerald-600 dark:!text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-500 dark:!text-slate-400">Total Meetings Scheduled</p>
                      <p className="text-2xl font-bold text-slate-900 dark:!text-white">{meetings.length}</p>
                    </div>
                  </div>
                </div>

                {/* Feed */}
                <div className="bg-white dark:!bg-slate-900 rounded-2xl border border-slate-200 dark:!border-slate-800 shadow-sm overflow-hidden transition-colors">
                  <div className="px-6 py-5 border-b border-slate-200 dark:!border-slate-800 bg-slate-50/50 dark:!bg-transparent dark:!bg-slate-900/50">
                    <h3 className="text-base font-semibold leading-6 text-slate-900 dark:!text-white">Platform Meeting Feed</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:!text-slate-400">Real-time overview of meetings across all companies.</p>
                  </div>
                  <ul role="list" className="divide-y divide-slate-100 dark:!divide-slate-800">
                    {filteredMeetings.map((meeting) => (
                      <li key={meeting.id} className="px-6 py-5 hover:bg-slate-50 dark:hover:!bg-slate-800/50 hover:text-slate-900 dark:hover:!text-white transition-colors group">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4">
                            <div className="h-10 w-10 bg-slate-100 dark:!bg-slate-800 rounded-full flex items-center justify-center border border-slate-200 dark:!border-slate-700">
                              <span className="text-xs font-bold text-slate-500 dark:!text-slate-300">{meeting.companyName.substring(0,2).toUpperCase()}</span>
                            </div>
                            <div>
                              <p className="text-sm font-medium text-slate-900 dark:!text-slate-100 group-hover:text-slate-900 dark:group-hover:!text-white transition-colors">
                                {meeting.companyName} <span className="text-slate-400 dark:!text-slate-500 font-normal mx-1">meeting with</span> {meeting.customer_details?.name || 'Customer'}
                              </p>
                              <p className="text-xs text-slate-500 dark:!text-slate-400 mt-0.5">{meeting.date} at {meeting.time_slot}</p>
                            </div>
                          </div>
                          <div>
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              meeting.status === 'scheduled' ? 'bg-indigo-50 text-indigo-700 ring-indigo-600/20 dark:!bg-indigo-500/20 dark:!text-indigo-300 dark:!ring-indigo-500/20' : 
                              meeting.status === 'completed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20 dark:!bg-emerald-500/20 dark:!text-emerald-300 dark:!ring-emerald-500/20' : 
                              'bg-slate-50 text-slate-600 ring-slate-500/10 dark:!bg-slate-800 dark:!text-slate-300 dark:!ring-slate-500/20'
                            }`}>
                              {meeting.status.charAt(0).toUpperCase() + meeting.status.slice(1)}
                            </span>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* APPROVALS TAB */}
            {activeTab === 'approvals' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Subscription Approvals</h1>
                  <p className="mt-2 text-sm text-slate-600">Review payment details and verify new company registrations.</p>
                </div>
                
                {pendingCompanies.length === 0 ? (
                  <div className="flex flex-col items-center justify-center bg-white border border-slate-200 rounded-2xl p-16 shadow-sm">
                    <CheckCircle2 className="h-16 w-16 text-emerald-400 mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">All caught up!</h3>
                    <p className="text-slate-500 mt-1">There are no pending company approvals at this time.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {pendingCompanies.map((company) => (
                      <div key={company.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                        <div className="flex items-start gap-4">
                          <div className="h-12 w-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-lg font-bold text-amber-700">{company.name.charAt(0)}</span>
                          </div>
                          <div>
                            <h3 className="text-lg font-semibold text-slate-900">{company.name}</h3>
                            <p className="text-sm text-slate-500">{company.email} • Registered on {new Date(company.created_at).toLocaleDateString()}</p>
                            <div className="mt-3 bg-slate-50 rounded-lg p-3 border border-slate-100 inline-block">
                              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Payment Reference</p>
                              <p className="text-sm text-slate-900 font-mono bg-white px-2 py-1 rounded border border-slate-200">{company.payment_proof || 'None'}</p>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handleReject(company.id)}
                            className="flex items-center gap-2 px-4 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-semibold transition-colors"
                          >
                            <XCircle className="h-4 w-4" />
                            Reject
                          </button>
                          <button 
                            onClick={() => handleApprove(company.id)}
                            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm text-sm font-semibold transition-colors focus:ring-2 focus:ring-offset-2 focus:ring-emerald-600"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Approve
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* CLIENT MANAGEMENT TAB */}
            {activeTab === 'clients' && (
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Client Management</h1>
                    <p className="mt-2 text-sm text-slate-600">Manage all registered companies and their platform access.</p>
                  </div>
                  <button 
                    onClick={handleExportData}
                    className="bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 px-4 py-2 rounded-lg text-sm font-medium shadow-sm transition-colors"
                  >
                    Export Data
                  </button>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-slate-200 sm:rounded-2xl overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-slate-900 sm:pl-6">Company</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Joined</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
                        <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Access Control</th>
                        <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-6">
                          <span className="sr-only">Actions</span>
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredCompanies.filter(c => c.subscription_status !== 'pending').map((company) => (
                        <tr key={company.id} className="hover:bg-slate-50 transition-colors">
                          <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-6">
                            <div className="flex items-center">
                              <div className="h-10 w-10 flex-shrink-0">
                                <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                                  {company.name.charAt(0)}
                                </div>
                              </div>
                              <div className="ml-4">
                                <div className="font-medium text-slate-900">{company.name}</div>
                                <div className="mt-1 text-slate-500">{company.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500">
                            {new Date(company.created_at).toLocaleDateString()}
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              company.subscription_status === 'active' 
                                ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' 
                                : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                            }`}>
                              {company.subscription_status === 'active' ? 'Active' : 'Stopped'}
                            </span>
                          </td>
                          <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500">
                            {/* Toggle Switch */}
                            <button
                              type="button"
                              onClick={() => toggleSubscription(company.id, company.subscription_status)}
                              className={`${
                                company.subscription_status === 'active' ? 'bg-indigo-600' : 'bg-slate-200'
                              } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2`}
                              role="switch"
                              aria-checked={company.subscription_status === 'active'}
                            >
                              <span className="sr-only">Toggle access</span>
                              <span
                                aria-hidden="true"
                                className={`${
                                  company.subscription_status === 'active' ? 'translate-x-5' : 'translate-x-0'
                                } pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                              />
                            </button>
                            <span className="ml-3 text-xs font-medium text-slate-500">
                              {company.subscription_status === 'active' ? 'Access Granted' : 'Access Revoked'}
                            </span>
                          </td>
                          <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                            <button className="text-slate-400 hover:text-slate-600 transition-colors">
                              <MoreVertical className="h-5 w-5" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                 <div>
                   <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Platform Settings</h1>
                   <p className="mt-2 text-sm text-slate-600">Configure global platform preferences and master profile.</p>
                 </div>

                {/* Appearance Settings */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <Sun className="h-5 w-5 text-amber-500" /> Appearance
                  </h3>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">Light / Dark Mode</p>
                      <p className="text-sm text-slate-500">Toggle between light and dark themes.</p>
                    </div>
                    <button 
                      onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                      className={`relative inline-flex h-7 w-14 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:ring-offset-2 ${theme === 'dark' ? 'bg-indigo-600' : 'bg-slate-200'}`}
                    >
                      <span className={`pointer-events-none inline-block h-6 w-6 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${theme === 'dark' ? 'translate-x-7' : 'translate-x-0'}`} />
                    </button>
                  </div>
                </div>

                {/* Profile Settings */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8">
                  <h3 className="text-xl font-semibold text-slate-900 mb-6 flex items-center gap-2">
                    <User className="h-5 w-5 text-indigo-500" /> Master Admin Profile
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-slate-50 shadow-sm overflow-hidden relative group">
                        {avatar ? (
                           <img src={URL.createObjectURL(avatar)} className="h-full w-full object-cover" />
                        ) : (
                           <span className="text-2xl font-bold text-indigo-700">{profileName.charAt(0) || 'M'}</span>
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Camera className="h-6 w-6 text-white" />
                          <input type="file" className="hidden" accept="image/*" onChange={e => setAvatar(e.target.files[0])} />
                        </label>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Profile Avatar</p>
                        <p className="text-sm text-slate-500 mb-2">Upload a picture to personalize your admin account.</p>
                      </div>
                    </div>

                    {/* Name Change */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Display Name</label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors"
                      />
                    </div>
                    
                    <button 
                      onClick={() => toast.success('Profile updated successfully!')} 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-colors"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </div>

                {/* Billing & Timezone Shells */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 opacity-75">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2"><CreditCard className="h-5 w-5 text-slate-400" /> Platform Billing Plans</h3>
                    <p className="text-sm text-slate-500 mb-4">Configure available subscription tiers and pricing options.</p>
                    <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed border border-slate-200">Coming Soon</button>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 opacity-75">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2"><Globe className="h-5 w-5 text-slate-400" /> System Timezone</h3>
                    <p className="text-sm text-slate-500 mb-4">Set the global server timezone tracking for audit logs.</p>
                    <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed border border-slate-200">Coming Soon</button>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </main>
    </div>
  );
};
