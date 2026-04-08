import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { 
  Search, 
  Calendar as CalendarIcon, 
  Clock, 
  User, 
  Mail, 
  Phone, 
  Users, 
  HelpCircle,
  Building2,
  ChevronRight,
  CheckCircle2
} from 'lucide-react';
import CalendarComponent from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

// Dynamic slots retrieved from backend


export const CustomerBooking = () => {
  const [step, setStep] = useState(1); // 1: Search, 2: Calendar & Time, 3: Form, 4: Success
  
  // State for Booking Flow
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCompany, setSelectedCompany] = useState(null);
  
  const [availableDates, setAvailableDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [availableSlots, setAvailableSlots] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    gender: 'prefer-not-to-say',
    members: 1,
    reason: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize available dates (Today + next 7 days) and fetch companies
  useEffect(() => {
    const dates = [];
    const today = new Date();
    
    for (let i = 0; i <= 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    setAvailableDates(dates);
    fetchCompanies();
  }, []);

  const fetchCompanies = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/companies`);
      const data = await res.json();
      if (data.success) {
        setCompanies(data.companies);
      }
    } catch (error) {
      console.error('Failed to load companies');
    }
  };

  const formatDate = (dateObj) => {
    const offsetDate = new Date(dateObj.getTime() - (dateObj.getTimezoneOffset() * 60000));
    return offsetDate.toISOString().split('T')[0];
  };

  const getDayName = (date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  const filteredCompanies = companies.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectCompany = (company) => {
    setSelectedCompany(company);
    setStep(2);
  };

  const handleSelectDate = async (date) => {
    setSelectedDate(date);
    setSelectedTime(null); // Reset time when date changes
    setAvailableSlots([]); // Reset available slots while loading

    if (selectedCompany && date) {
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meetings/slots?company_id=${selectedCompany.id}&date=${formatDate(date)}`);
        const data = await res.json();
        if (data.success) {
          if (data.isBlocked) {
            toast.error("This date is unavailable for booking. Please select another date.", { id: 'blocked-date-toast' });
            setAvailableSlots([]);
          } else {
            setAvailableSlots(data.availableSlots || []);
          }
        }
      } catch (error) {
        toast.error("Failed to load available time slots.");
      }
    }
  };

  const handleProceedToForm = () => {
    if (selectedDate && selectedTime) {
      setStep(3);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 1. Prepare data for Supabase
      const bookingPayload = {
        company_id: selectedCompany.id,
        customer_details: formData,
        date: formatDate(selectedDate),
        time_slot: selectedTime,
        status: 'pending' // Initial status
      };

      console.log('Sending to Supabase Meetings Table:', bookingPayload);

      // Simulate network request to Express Backend
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/meetings/book`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingPayload)
      });
      
      const data = await response.json();
      if (!response.ok || !data.success) throw new Error(data.message || 'Server error');

      toast.success('Successfully requested meeting!');
      setStep(4);
    } catch (error) {
      console.error('Error submitting booking:', error);
      toast.error('Failed to book meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Helper to get available slots for currently selected date
  const getAvailableTimeSlots = () => {
    if (!selectedDate) return [];
    return availableSlots;
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <CalendarIcon className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Schedulr</span>
          </div>
          <nav className="hidden sm:flex items-center gap-6">
            <a href="/" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Home</a>
            <a href="#help" className="text-sm font-medium text-slate-600 hover:text-indigo-600">Help Center</a>
          </nav>
        </div>
      </header>

      <main className="flex-1 max-w-3xl w-full mx-auto p-6 flex flex-col py-12">
        {/* Progress Tracker */}
        {step < 4 && (
          <div className="mb-8 overflow-hidden rounded-full bg-slate-200 h-2">
            <div 
              className="h-2 bg-indigo-600 rounded-full transition-all duration-500 ease-out" 
              style={{ width: `${(step / 3) * 100}%` }}
            ></div>
          </div>
        )}

        {/* STEP 1: Search Company */}
        {step === 1 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center mb-10">
              <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Book a Meeting</h1>
              <p className="mt-3 text-slate-500 text-lg">Search for a registered company to schedule your appointment.</p>
            </div>
            
            <div className="relative max-w-xl mx-auto mb-8">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-12 pr-4 py-4 border border-slate-200 rounded-xl text-lg placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm bg-slate-50 focus:bg-white"
                placeholder="E.g., Acme Corp..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            <div className="max-w-xl mx-auto space-y-3">
              {filteredCompanies.length > 0 ? (
                filteredCompanies.map(company => (
                  <button
                    key={company.id}
                    onClick={() => handleSelectCompany(company)}
                    className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-indigo-300 hover:shadow-md bg-white hover:bg-slate-50 transition-all group text-left"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-indigo-50 flex items-center justify-center border border-indigo-100">
                        <Building2 className="h-6 w-6 text-indigo-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{company.name}</h3>
                        <p className="text-sm text-slate-500">Verified Platform Partner</p>
                      </div>
                    </div>
                    <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                  </button>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">
                  No companies found matching "{searchQuery}"
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 2: Calendar & Time Slots */}
        {step === 2 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-slate-900 p-6 sm:p-8 text-white">
              <button 
                onClick={() => setStep(1)}
                className="text-indigo-400 hover:text-white text-sm font-medium mb-4 transition-colors"
              >
                ← Back to search
              </button>
              <h2 className="text-2xl font-bold">Schedule with {selectedCompany.name}</h2>
              <p className="mt-2 text-slate-400">Select a date within the next 7 days and pick an available time slot.</p>
            </div>

            <div className="p-6 sm:p-8 flex flex-col items-center">
              <h3 className="text-lg font-semibold text-slate-900 mb-6 flex items-center gap-2 self-start w-full">
                <CalendarIcon className="h-5 w-5 text-indigo-600" /> 
                1. Select Date
              </h3>
              
              <div className="custom-calendar-container shadow-sm border border-slate-100 rounded-xl bg-slate-50 p-2 mb-8 w-full max-w-sm flex justify-center">
                <CalendarComponent 
                  onChange={handleSelectDate}
                  value={selectedDate}
                  minDate={new Date()} // Prevent booking in the past
                />
              </div>

              {/* Time Slots */}
              {selectedDate && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <Clock className="h-5 w-5 text-indigo-600" /> 
                    2. Available Time Slots
                  </h3>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {getAvailableTimeSlots().map((slot, idx) => {
                      const isSelected = selectedTime === slot;
                      return (
                        <button
                          key={idx}
                          onClick={() => setSelectedTime(slot)}
                          className={`py-3 px-4 rounded-xl text-sm font-semibold border-2 transition-all text-center ${
                            isSelected
                              ? 'border-indigo-600 bg-indigo-600 text-white shadow-md'
                              : 'border-slate-200 bg-white hover:border-indigo-300 hover:bg-slate-50 text-slate-700'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                    {getAvailableTimeSlots().length === 0 && (
                      <div className="col-span-full py-6 text-center text-slate-500 bg-slate-50 rounded-xl border border-slate-200">
                        No available slots for this date.
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="mt-10 flex justify-end">
                <button
                  onClick={handleProceedToForm}
                  disabled={!selectedDate || !selectedTime}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  Continue
                </button>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Booking Form */}
        {step === 3 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden animate-in fade-in slide-in-from-right-4 duration-500">
            <div className="flex flex-col sm:flex-row border-b border-slate-200">
              <div className="bg-slate-50 p-6 sm:p-8 sm:w-1/3 border-r border-slate-200">
                <button 
                  onClick={() => setStep(2)}
                  className="text-indigo-600 hover:text-indigo-800 text-sm font-medium mb-6 transition-colors"
                >
                  ← Back
                </button>
                <h3 className="text-lg font-bold text-slate-900 mb-4">Booking Summary</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Company</p>
                    <p className="font-medium text-slate-900 mt-1">{selectedCompany.name}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</p>
                    <p className="font-medium text-slate-900 mt-1">{selectedDate && getDayName(selectedDate)}, {selectedDate && formatDate(selectedDate)}</p>
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time</p>
                    <p className="font-medium text-slate-900 mt-1">{selectedTime}</p>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8 sm:w-2/3">
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight mb-6">Your Details</h2>
                <form onSubmit={handleSubmit} className="space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><User className="h-4 w-4"/> Full Name</label>
                      <input required type="text" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Jane Doe" 
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Mail className="h-4 w-4"/> Email</label>
                      <input required type="email" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="jane@example.com" 
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Phone className="h-4 w-4"/> Phone Number</label>
                      <input required type="tel" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="+1 (555) 000-0000" 
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><Users className="h-4 w-4"/> Number of Members</label>
                      <input required type="number" min="1" max="20" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" 
                        value={formData.members} onChange={e => setFormData({...formData, members: parseInt(e.target.value)})} />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div className="col-span-1 sm:col-span-2">
                       <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1">Gender</label>
                       <select className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                         value={formData.gender} onChange={e => setFormData({...formData, gender: e.target.value})}>
                         <option value="prefer-not-to-say">Prefer not to say</option>
                         <option value="female">Female</option>
                         <option value="male">Male</option>
                         <option value="other">Other</option>
                       </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1 flex items-center gap-1"><HelpCircle className="h-4 w-4"/> Reason for Meeting</label>
                    <textarea required rows="3" className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none" placeholder="Provide a brief description of what you'd like to discuss..."
                      value={formData.reason} onChange={e => setFormData({...formData, reason: e.target.value})}></textarea>
                  </div>

                  <div className="pt-4 mt-6 border-t border-slate-200 flex justify-end">
                    <button 
                      type="submit" 
                      disabled={isSubmitting}
                      className="bg-indigo-600 hover:bg-indigo-500 text-white px-8 py-3 rounded-xl font-semibold shadow-md transition-all flex items-center justify-center min-w-[160px] disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        'Request Booking'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Success Screen */}
        {step === 4 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 sm:p-12 text-center animate-in zoom-in-95 duration-500 max-w-lg mx-auto w-full mt-10">
            <div className="h-20 w-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <CheckCircle2 className="h-10 w-10 text-emerald-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight mb-2">Booking Requested!</h2>
            <p className="text-slate-600 mb-8 max-w-sm mx-auto">
              Your meeting request with <span className="font-semibold text-slate-900">{selectedCompany.name}</span> has been submitted and is currently <span className="font-semibold text-amber-600">Pending</span>.
            </p>
            
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6 text-left mb-8 shadow-sm">
              <h4 className="text-sm font-semibold tracking-wider text-slate-500 uppercase mb-4">Next Steps</h4>
              <ul className="space-y-3">
                <li className="flex gap-3 text-slate-700 text-sm">
                  <span className="text-indigo-600 font-bold">1.</span>
                  The company will review your requested time slot.
                </li>
                <li className="flex gap-3 text-slate-700 text-sm">
                  <span className="text-indigo-600 font-bold">2.</span>
                  Once approved, you will automatically receive an email with the calendar invite and meeting link.
                </li>
              </ul>
            </div>

            <button 
              onClick={() => window.location.href = '/'}
              className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        )}
      </main>
    </div>
  );
};
