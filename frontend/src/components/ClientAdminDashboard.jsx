import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Building2, 
  Calendar, 
  Clock, 
  CheckCircle, 
  XCircle, 
  CalendarDays,
  Menu,
  Bell,
  Search,
  Users,
  AlertCircle,
  Plus,
  LogOut,
  Settings,
  Sun,
  User,
  Camera,
  CreditCard,
  Globe,
  LayoutDashboard
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import CalendarComponent from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

export const ClientAdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [meetings, setMeetings] = useState([]);
  const [timeSlots, setTimeSlots] = useState([]);
  const [newSlot, setNewSlot] = useState('');
  const [company, setCompany] = useState(null);
  const [loading, setLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();
  
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
  const [profileName, setProfileName] = useState('');
  const [avatar, setAvatar] = useState(null);

  useEffect(() => {
    if (company) setProfileName(company.name);
  }, [company]);

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  // Blocked Dates State
  const [blockedDates, setBlockedDates] = useState([]);

  useEffect(() => {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const parsedUser = JSON.parse(userStr);
      setCompany(parsedUser.company || parsedUser); // Fallback if admin
    } else {
      setInitialLoad(false);
    }
  }, []);

  useEffect(() => {
    if (company?.id) {
      fetchMeetings();
    }
  }, [company]);

  const fetchMeetings = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/company/${company.id}/dashboard`);
      const data = await res.json();
      if (data.success) {
        setMeetings(data.meetings);
      }
      
      const slotsRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/company/${company.id}/availability`);
      const slotsData = await slotsRes.json();
      if (slotsData.success) {
        setTimeSlots(slotsData.timeSlots || []);
      }

      const blockedRes = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/company/${company.id}/blocked-dates`);
      const blockedData = await blockedRes.json();
      if (blockedData.success) {
        setBlockedDates(blockedData.blockedDates || []);
      }
      
    } catch (error) {
      toast.error('Failed to load dashboard data');
    } finally {
      setInitialLoad(false);
    }
  };

  const formatDateString = (dateObj) => {
    // We adjust for timezone offset so JS doesn't accidentally move to the day before
    const offsetDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
    return offsetDate.toISOString().split('T')[0];
  };

  const isDateBlocked = (dateObj) => {
    const formattedDate = formatDateString(dateObj);
    return blockedDates.some(bd => bd.blocked_date === formattedDate);
  };

  const toggleDateBlock = async (dateObj) => {
    const formattedDate = formatDateString(dateObj);
    const existingBlock = blockedDates.find(bd => bd.blocked_date === formattedDate);

    setLoading(true);
    try {
      if (existingBlock) {
        // Unblock
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/company/blocked-dates/${existingBlock.id}`, { method: 'DELETE' });
        if (!res.ok) throw new Error('Failed to unblock date');
        setBlockedDates(blockedDates.filter(bd => bd.id !== existingBlock.id));
        toast.success(`Unblocked ${formattedDate}`);
      } else {
        // Block
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/company/${company.id}/block-date`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ blocked_date: formattedDate })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.message);
        setBlockedDates([...blockedDates, data.blockedDate]);
        toast.error(`Blocked ${formattedDate} from bookings`);
      }
    } catch (err) {
      toast.error(err.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e) => {
    e.preventDefault();
    if (!newSlot.trim()) return;
    
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/company/${company.id}/availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ time_slot: newSlot })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setTimeSlots([...timeSlots, data.slot]);
      setNewSlot('');
      toast.success('Time slot added successfully');
    } catch (err) {
      toast.error(err.message || 'Failed to add time slot');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveSlot = async (id) => {
    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/company/availability/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      
      setTimeSlots(timeSlots.filter(s => s.id !== id));
      toast.success('Slot removed');
    } catch (err) {
      toast.error('Failed to remove slot');
    } finally {
      setLoading(false);
    }
  };

  // Gating access simulating Supabase logic
  if (initialLoad) {
    return <div className="min-h-screen flex items-center justify-center bg-slate-50"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div></div>;
  }

  if (!company || company.subscription_status !== 'active') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6">
        <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md text-center border border-rose-100">
          <AlertCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-600 mb-6">Your subscription is currently inactive or pending Master Admin approval. Please check back later or log in with verified credentials.</p>
          <a href="/" className="inline-block bg-indigo-600 px-6 py-2.5 rounded-lg text-white font-semibold hover:bg-indigo-500 transition-colors">Return Home</a>
        </div>
      </div>
    );
  }

  const filteredMeetings = meetings.filter(m => {
    if (!searchQuery) return true;
    return JSON.stringify(m).toLowerCase().includes(searchQuery.toLowerCase());
  });

  const pendingRequests = filteredMeetings.filter(m => m.status === 'pending');
  const confirmedMeetings = filteredMeetings.filter(m => m.status === 'confirmed');
  const todaysMeetings = confirmedMeetings.filter(m => m.date === '2026-03-30');

  const handleConfirm = async (meeting) => {
    setLoading(true);
    
    // 1. Update local state
    setMeetings(meetings.map(m => m.id === meeting.id ? { ...m, status: 'confirmed' } : m));
    
    // 2. Trigger Backend API Call (Placeholder)
    try {
      console.log(`Sending API request to /api/meetings/confirm for meeting ID: ${meeting.id}...`);
      
      // Make real backend API call
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meetings/confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          meetingId: meeting.id,
          customerName: meeting.customer_details?.name || 'Customer',
          customerEmail: meeting.customer_details?.email || 'test@example.com',
          companyName: company.name,
          date: meeting.date,
          time: meeting.time_slot
        })
      });

      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Failed to trigger confirmation API');

      toast.success(data.message || 'Meeting Confirmed. Calendar invite sent.');
      if (data.emailPreviewUrl) {
          console.log("Mock Email Preview:", data.emailPreviewUrl);
          toast.success('Check terminal console for email preview URL!', { icon: '📧' });
      }
    } catch (error) {
      console.error('Failed to confirm meeting:', error);
      toast.error('Failed to trigger email confirmation');
      // Revert status on failure
      setMeetings(meetings.map(m => m.id === meeting.id ? { ...m, status: 'pending' } : m));
    } finally {
      setLoading(false);
    }
  };

  const handleDecline = async (id) => {
    setLoading(true);
    setMeetings(meetings.map(m => m.id === id ? { ...m, status: 'declined' } : m));
    
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meetings/decline`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ meetingId: id })
      });
      if (!response.ok) throw new Error('Failed to decline via API');
      toast.success('Meeting declined.');
    } catch (error) {
      toast.error('Failed to update meeting status remotely.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col fixed inset-y-0 left-0 z-10">
        <div className="p-6 flex items-center gap-3 bg-slate-950/50 border-b border-slate-800">
          <div className="h-8 w-8 bg-indigo-500 rounded-lg flex items-center justify-center">
            <Building2 className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-bold text-white tracking-tight">{company.name}</span>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('pending')}
            className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'pending' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <div className="flex items-center gap-3">
              <Clock className="h-5 w-5" />
              Pending Requests
            </div>
            {pendingRequests.length > 0 && (
              <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
                {pendingRequests.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setActiveTab('schedule')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'schedule' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Calendar className="h-5 w-5" />
            Schedule Overview
          </button>
          <button 
            onClick={() => setActiveTab('availability')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'availability' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Clock className="h-5 w-5" />
            Manage Calendar
          </button>
          <button 
            onClick={() => setActiveTab('settings')}
            className={`w-full flex items-center gap-3 px-4 py-3 text-sm font-medium rounded-xl transition-all ${activeTab === 'settings' ? 'bg-indigo-600 text-white shadow-md' : 'hover:bg-slate-800 hover:text-white'}`}
          >
            <Settings className="h-5 w-5" />
            Settings
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 sticky top-0 z-10">
          <div className="flex items-center gap-4 flex-1">
            <div className="relative w-96 hidden md:block">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-4 w-4 text-slate-400" />
              </div>
              <input 
                type="text" 
                placeholder="Search meetings, customers..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
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
              {pendingRequests.length > 0 && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-rose-500 ring-2 ring-white"></span>}
              <Bell className="h-5 w-5" />
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute top-12 right-12 w-80 bg-white rounded-xl shadow-lg border border-slate-200 py-2 z-50">
                <div className="px-4 py-2 border-b border-slate-100"><h3 className="font-semibold text-slate-900">Notifications</h3></div>
                {pendingRequests.length > 0 ? (
                  <div className="max-h-64 overflow-y-auto">
                    {pendingRequests.map(req => (
                      <div key={req.id} className="px-4 py-3 hover:bg-slate-50 border-b border-slate-50 last:border-0 cursor-pointer" onClick={() => { setActiveTab('pending'); setShowNotifications(false); }}>
                        <p className="text-sm text-slate-800"><span className="font-semibold">{req.customer_details?.name}</span> requested a meeting.</p>
                        <p className="text-xs text-slate-500 mt-1">{req.date} at {req.time_slot}</p>
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
                className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center hover:ring-2 hover:ring-indigo-500 hover:ring-offset-2 transition-all focus:outline-none"
              >
                <span className="text-sm font-bold text-indigo-700">
                  {avatar ? (
                     <img src={URL.createObjectURL(avatar)} className="h-full w-full object-cover rounded-full" />
                  ) : (
                     profileName?.charAt(0) || company.name?.charAt(0) || 'C'
                  )}
                </span>
              </button>
              
              {/* Profile Dropdown */}
              {showProfileMenu && (
                <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-50">
                  <div className="px-4 py-3 border-b border-slate-100 mb-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{profileName || company.name}</p>
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

        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            
            {/* Dashboard Overview Tab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Overview</h1>
                  <p className="mt-1 text-sm text-slate-500">Welcome back! Here's a quick look at your schedule.</p>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Today's Meetings widget */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <CalendarDays className="h-5 w-5 text-indigo-600" />
                        Today's Schedule
                      </div>
                      <span className="text-sm text-slate-500">{todaysMeetings.length} meetings</span>
                    </div>
                    {todaysMeetings.length > 0 ? (
                      <div className="space-y-4">
                        {todaysMeetings.map(meeting => (
                          <div key={meeting.id} className="flex gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100">
                            <div className="flex flex-col items-center justify-center bg-indigo-100 text-indigo-700 px-3 py-1 rounded-lg min-w-[80px]">
                              <span className="text-lg font-bold">{meeting.time_slot?.split(' ')[0] || ''}</span>
                              <span className="text-xs font-semibold">{meeting.time_slot?.split(' ')[1] || ''}</span>
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{meeting.customer_details?.name || 'Customer'}</p>
                              <p className="text-sm text-slate-500">{meeting.customer_details?.reason} • {meeting.customer_details?.members} Member(s)</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic py-4">No meetings scheduled for today.</p>
                    )}
                  </div>

                  {/* Pending Snapshot */}
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                      <div className="flex items-center gap-2 text-slate-900 font-semibold">
                        <Clock className="h-5 w-5 text-amber-500" />
                        Pending Requests Snapshot
                      </div>
                      <button onClick={() => setActiveTab('pending')} className="text-sm text-indigo-600 font-medium hover:text-indigo-500">View All</button>
                    </div>
                    {pendingRequests.length > 0 ? (
                      <div className="space-y-4">
                        {pendingRequests.slice(0, 3).map(meeting => (
                          <div key={meeting.id} className="flex flex-col sm:flex-row justify-between p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                            <div>
                              <p className="font-semibold text-slate-900">{meeting.customer_details?.name}</p>
                              <p className="text-sm text-slate-600">{meeting.date} at {meeting.time_slot}</p>
                            </div>
                            <div className="mt-2 sm:mt-0 flex gap-2">
                              <button onClick={() => handleConfirm(meeting)} disabled={loading} className="px-3 py-1 bg-white border border-slate-200 text-emerald-600 text-sm font-medium rounded-lg hover:bg-emerald-50 transition-colors">Confirm</button>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-slate-500 italic py-4">No pending meeting requests.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Pending Requests Tab */}
            {activeTab === 'pending' && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Pending meeting requests</h1>
                  <p className="mt-1 text-sm text-slate-500">Review and confirm customer booking requests. Confirming will send a calendar invite automatically.</p>
                </div>
                
                {pendingRequests.length === 0 ? (
                  <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
                    <CheckCircle className="h-12 w-12 text-emerald-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-slate-900">You're all caught up!</h3>
                    <p className="text-slate-500 mt-1">There are no pending requests to review.</p>
                  </div>
                ) : (
                  <div className="grid gap-6">
                    {pendingRequests.map(meeting => (
                      <div key={meeting.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                        <div className="flex flex-col sm:flex-row justify-between gap-6">
                          <div className="flex gap-4">
                            <div className="h-12 w-12 bg-indigo-50 text-indigo-600 font-bold rounded-full flex items-center justify-center flex-shrink-0 text-xl">
                              {meeting.customer_details?.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                              <h3 className="text-lg font-semibold text-slate-900">{meeting.customer_details?.name || 'Customer'}</h3>
                              <div className="flex flex-wrap gap-4 mt-2 text-sm text-slate-600">
                                <span className="flex items-center gap-1"><CalendarDays className="h-4 w-4" /> {meeting.date}</span>
                                <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {meeting.time_slot}</span>
                                <span className="flex items-center gap-1"><Users className="h-4 w-4" /> {meeting.customer_details?.members} Member(s)</span>
                              </div>
                              <div className="mt-3 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-1">Reason for meeting</span>
                                <p className="text-sm text-slate-800">{meeting.customer_details?.reason}</p>
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex sm:flex-col gap-3 justify-center sm:justify-start">
                            <button 
                              onClick={() => handleConfirm(meeting)}
                              disabled={loading}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50"
                            >
                              <CheckCircle className="h-4 w-4" /> Confirm & Send Invite
                            </button>
                            <button 
                              onClick={() => handleDecline(meeting.id)}
                              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2 border border-rose-200 text-rose-600 hover:bg-rose-50 rounded-xl text-sm font-semibold transition-colors"
                            >
                              <XCircle className="h-4 w-4" /> Decline
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Schedule Overview Tab */}
            {activeTab === 'schedule' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Schedule Overview</h1>
                    <p className="mt-1 text-sm text-slate-500">A detailed list of your confirmed meetings.</p>
                  </div>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-slate-200">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="py-3.5 pl-6 pr-3 text-left text-sm font-semibold text-slate-900">Customer</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Date & Time</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Reason</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-slate-900">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 bg-white">
                      {filteredMeetings.filter(m => m.status !== 'pending').map((meeting) => (
                        <tr key={meeting.id} className="hover:bg-slate-50 transition-colors">
                          <td className="whitespace-nowrap py-4 pl-6 pr-3 text-sm">
                            <div className="font-medium text-slate-900">{meeting.customer_details?.name}</div>
                            <div className="text-slate-500 text-xs mt-0.5">{meeting.customer_details?.members} Member(s) attending</div>
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm text-slate-500">
                            <div className="font-medium text-slate-900">{meeting.date}</div>
                            <div>{meeting.time_slot}</div>
                          </td>
                          <td className="px-3 py-4 text-sm text-slate-600 max-w-xs truncate">
                            {meeting.customer_details?.reason}
                          </td>
                          <td className="whitespace-nowrap px-3 py-4 text-sm">
                            <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                              meeting.status === 'confirmed' ? 'bg-emerald-50 text-emerald-700 ring-emerald-600/20' : 'bg-rose-50 text-rose-700 ring-rose-600/20'
                            }`}>
                              {meeting.status === 'confirmed' ? 'Confirmed' : 'Declined'}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Manage Availability Tab */}
            {activeTab === 'availability' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Manage Availability</h1>
                  <p className="mt-1 text-sm text-slate-500">Define the explicit time slots that customers are allowed to schedule with you.</p>
                </div>

                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8">
                  <h3 className="text-lg font-semibold text-slate-900 mb-6">Add New Time Slot</h3>
                  <form onSubmit={handleAddSlot} className="flex gap-4 items-end mb-10 max-w-md">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-slate-700 mb-1">Slot format (e.g., "09:00 AM")</label>
                      <input 
                        type="text" 
                        required 
                        value={newSlot}
                        onChange={(e) => setNewSlot(e.target.value)}
                        placeholder="02:30 PM"
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    <button 
                      type="submit" 
                      disabled={loading}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md inline-flex items-center gap-2 transition-colors disabled:opacity-50"
                    >
                      <Plus className="h-4 w-4" /> Add Slot
                    </button>
                  </form>

                  <h3 className="text-lg font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Your Calendar Options</h3>
                  {timeSlots.length === 0 ? (
                    <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                      <p className="text-slate-500 text-sm">No time slots are currently available on your calendar. Customers will not be able to book meetings!</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      {timeSlots.map(slot => (
                        <div key={slot.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50 group hover:border-slate-300 transition-colors">
                          <span className="font-semibold text-slate-700">{slot.time_slot}</span>
                          <button 
                            onClick={() => handleRemoveSlot(slot.id)}
                            disabled={loading}
                            className="text-slate-400 hover:text-rose-500 transition-colors disabled:opacity-50"
                            title="Remove Slot"
                          >
                            <XCircle className="h-5 w-5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12">
                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Block Unavailable Dates</h3>
                      <p className="text-sm text-slate-500 mb-6">Click on a date to mark it as completely unavailable. Your customers will not be able to book meetings on days blocked in red.</p>
                      <div className="custom-calendar-container flex justify-center">
                        <CalendarComponent 
                          onClickDay={toggleDateBlock}
                          tileClassName={({ date, view }) => {
                            if (view === 'month' && isDateBlocked(date)) {
                              return 'custom-blocked-date';
                            }
                            return null;
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                      <h3 className="text-lg font-semibold text-slate-900 mb-2">Blocked Dates ({blockedDates.length})</h3>
                      <p className="text-sm text-slate-500 mb-6">List of all currently blocked out dates.</p>
                      
                      {blockedDates.length === 0 ? (
                        <div className="py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">
                          <p className="text-slate-500 text-sm">No blocked dates. All days with time slots are bookable!</p>
                        </div>
                      ) : (
                        <div className="grid gap-3 max-h-80 overflow-y-auto pr-2">
                          {blockedDates.sort((a,b)=>a.blocked_date.localeCompare(b.blocked_date)).map(bd => (
                            <div key={bd.id} className="flex items-center justify-between p-3 rounded-lg border border-rose-200 bg-rose-50 group transition-colors">
                              <div className="flex items-center gap-3 text-rose-700">
                                <CalendarDays className="h-5 w-5" />
                                <span className="font-semibold">{bd.blocked_date}</span>
                              </div>
                              <button 
                                onClick={() => toggleDateBlock(new Date(bd.blocked_date + 'T12:00:00'))}
                                disabled={loading}
                                className="text-rose-400 hover:text-rose-700 transition-colors disabled:opacity-50"
                                title="Unblock"
                              >
                                <XCircle className="h-5 w-5" />
                              </button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                </div>
              </div>
            )}

            {/* Settings Tab */}
            {activeTab === 'settings' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 max-w-4xl mx-auto">
                <div>
                  <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Settings</h1>
                  <p className="mt-2 text-sm text-slate-500">Manage your profile, platform appearance, and platform preferences.</p>
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
                    <User className="h-5 w-5 text-indigo-500" /> Public Profile
                  </h3>
                  
                  <div className="space-y-6">
                    {/* Avatar Upload */}
                    <div className="flex items-center gap-6">
                      <div className="h-20 w-20 rounded-full bg-indigo-100 flex items-center justify-center border-4 border-slate-50 shadow-sm overflow-hidden relative group">
                        {avatar ? (
                           <img src={URL.createObjectURL(avatar)} className="h-full w-full object-cover" />
                        ) : (
                           <span className="text-2xl font-bold text-indigo-700">{profileName?.charAt(0) || company?.name?.charAt(0) || 'C'}</span>
                        )}
                        <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                          <Camera className="h-6 w-6 text-white" />
                          <input type="file" className="hidden" accept="image/*" onChange={e => setAvatar(e.target.files[0])} />
                        </label>
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">Company Logo or Avatar</p>
                        <p className="text-sm text-slate-500 mb-2">Upload a picture to make your profile stand out.</p>
                      </div>
                    </div>

                    {/* Name Change */}
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1">Company Name</label>
                      <input 
                        type="text" 
                        value={profileName}
                        onChange={(e) => setProfileName(e.target.value)}
                        className="w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-slate-50 transition-colors"
                      />
                    </div>
                    
                    <button 
                      onClick={() => {
                        toast.success('Profile updated successfully!'); 
                        if(company) setCompany({...company, name: profileName}); 
                      }} 
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-xl font-semibold shadow-md transition-colors"
                    >
                      Save Profile Changes
                    </button>
                  </div>
                </div>

                {/* Billing & Timezone Shells */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 opacity-75">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2"><CreditCard className="h-5 w-5 text-slate-400" /> Billing & Subscription</h3>
                    <p className="text-sm text-slate-500 mb-4">Manage your payment methods, view invoices, or change your subscription plan.</p>
                    <button disabled className="px-4 py-2 bg-slate-100 text-slate-400 rounded-lg text-sm font-medium cursor-not-allowed border border-slate-200">Coming Soon</button>
                  </div>
                  
                  <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 opacity-75">
                    <h3 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2"><Globe className="h-5 w-5 text-slate-400" /> Locale & Timezone</h3>
                    <p className="text-sm text-slate-500 mb-4">Configure your default timezone and date/time formatting preferences.</p>
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

// Quick functional component replacement since Lucide import missed one icon
const LayoutDashboardIcon = (props) => (
  <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>
);
