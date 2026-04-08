import { useState } from 'react';
import toast from 'react-hot-toast';
import { QrCode, UploadCloud, CheckCircle2, Building2, UserCircle, CreditCard } from 'lucide-react';
import { supabase } from '../supabase';

export const RegistrationPayFlow = () => {
  const [step, setStep] = useState('company'); // company -> admin -> payment -> success
  const [transactionId, setTransactionId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [details, setDetails] = useState({
    companyName: '',
    industry: '',
    phone: '',
    address: '',
    userName: '',
    userEmail: '',
    userPassword: ''
  });

  const handleCompanySubmit = (e) => {
    e.preventDefault();
    setStep('admin');
  };

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setStep('payment');
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!transactionId || transactionId.trim() === '') {
        toast.error('Please enter a valid Transaction ID');
        return;
    }
    
    setIsSubmitting(true);
    try {
      // 1. Securely register the user via Supabase Auth (This sends the email!)
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: details.userEmail,
        password: details.userPassword,
        options: {
          data: {
            full_name: details.userName
          }
        }
      });

      if (authError) throw new Error(authError.message);

      // 2. Pass the generated Auth ID to the backend to create the Company record
      const res = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          ...details,
          paymentDetails: transactionId,
          auth_id: authData.user?.id
        })
      });
      const data = await res.json();
      
      if (!res.ok) throw new Error(data.message || 'Registration payload failed');
      
      toast.success('Registration complete! Please check your email to verify your account.');
      setStep('success');
    } catch (err) {
      toast.error(err.message || 'Error occurred during registration');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-24 bg-white sm:py-32 overflow-hidden relative">
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-indigo-800">
            Join the Schedulr Network
          </h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Register your company, set up your admin profile, and start collecting bookings dynamically.
          </p>
        </div>

        <div className="mx-auto max-w-2xl bg-white rounded-3xl shadow-2xl ring-1 ring-slate-200 p-8 sm:p-12 relative overflow-hidden">
          {/* Progress Indicators */}
          {step !== 'success' && (
            <div className="flex justify-center mb-10 gap-x-4">
               <div className={`flex flex-col items-center gap-1 ${step === 'company' ? 'opacity-100' : 'opacity-40'}`}>
                 <Building2 className={`h-6 w-6 ${step === 'company' ? 'text-indigo-600' : 'text-slate-500'}`}/>
                 <span className="text-xs font-semibold text-slate-700">Company</span>
               </div>
               <div className={`h-px w-8 bg-slate-300 mt-3`}></div>
               <div className={`flex flex-col items-center gap-1 ${step === 'admin' ? 'opacity-100' : 'opacity-40'}`}>
                 <UserCircle className={`h-6 w-6 ${step === 'admin' ? 'text-indigo-600' : 'text-slate-500'}`}/>
                 <span className="text-xs font-semibold text-slate-700">Admin</span>
               </div>
               <div className={`h-px w-8 bg-slate-300 mt-3`}></div>
               <div className={`flex flex-col items-center gap-1 ${step === 'payment' ? 'opacity-100' : 'opacity-40'}`}>
                 <CreditCard className={`h-6 w-6 ${step === 'payment' ? 'text-indigo-600' : 'text-slate-500'}`}/>
                 <span className="text-xs font-semibold text-slate-700">Payment</span>
               </div>
            </div>
          )}

          {step === 'company' && (
            <form onSubmit={handleCompanySubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              <h3 className="text-2xl font-semibold text-slate-900 mb-6 border-b border-slate-100 pb-2">Company Configuration</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Company Name</label>
                  <input required type="text" value={details.companyName} onChange={e => setDetails({...details, companyName: e.target.value})} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 transition-colors" placeholder="Acme Corp" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Industry</label>
                  <input required type="text" value={details.industry} onChange={e => setDetails({...details, industry: e.target.value})} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-colors" placeholder="Software, Real Estate..." />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700">Business Phone</label>
                  <input required type="text" value={details.phone} onChange={e => setDetails({...details, phone: e.target.value})} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-colors" placeholder="+1 (555) 000-0000" />
                </div>
                <div className="col-span-1 sm:col-span-2">
                  <label className="block text-sm font-medium text-slate-700">Public Address</label>
                  <input required type="text" value={details.address} onChange={e => setDetails({...details, address: e.target.value})} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-colors" placeholder="123 Tech Blvd, Austin TX" />
                </div>
              </div>
              <button type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all mt-6">Continue to Admin Setup</button>
            </form>
          )}

          {step === 'admin' && (
            <form onSubmit={handleAdminSubmit} className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-500">
               <div className="flex items-center gap-3 mb-6 border-b border-slate-100 pb-2">
                  <button type="button" onClick={() => setStep('company')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">← Back</button>
                  <h3 className="text-2xl font-semibold text-slate-900">Admin Account</h3>
               </div>
               
               <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Your Full Name</label>
                    <input required type="text" value={details.userName} onChange={e => setDetails({...details, userName: e.target.value})} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-colors" placeholder="John Admin" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Login Email</label>
                    <input required type="email" value={details.userEmail} onChange={e => setDetails({...details, userEmail: e.target.value})} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-colors" placeholder="john@acmecorp.com" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700">Password</label>
                    <input required type="password" value={details.userPassword} onChange={e => setDetails({...details, userPassword: e.target.value})} className="mt-2 block w-full rounded-xl border border-slate-300 px-4 py-3 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-indigo-600 transition-colors" placeholder="••••••••" />
                  </div>
               </div>
               <button type="submit" className="w-full rounded-xl bg-indigo-600 px-4 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 transition-all mt-6">Continue to Payment</button>
            </form>
          )}

          {step === 'payment' && (
            <form onSubmit={handlePayment} className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-2">
                  <button type="button" onClick={() => setStep('admin')} className="text-sm font-medium text-indigo-600 hover:text-indigo-800 transition-colors">← Back</button>
                  <h3 className="text-2xl font-semibold text-slate-900">Subscription Payment</h3>
              </div>
              
              <div className="bg-slate-50 rounded-2xl p-6 border border-slate-200">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-slate-600 font-medium">Platform Fee</span>
                  <span className="text-2xl font-bold text-slate-900">$49<span className="text-sm text-slate-500 font-normal">/mo</span></span>
                </div>
                <div className="flex justify-center py-6 bg-white rounded-xl border border-slate-200 shadow-sm border-dashed">
                  <div className="text-center">
                    <QrCode className="mx-auto h-24 w-24 text-slate-300" />
                    <p className="mt-2 text-sm font-medium text-slate-500">Scan dummy QR to pay</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Upload Transaction ID</label>
                <div className="flex max-w-md rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-slate-300 px-3 text-slate-500 sm:text-sm bg-slate-50">
                    TXN-
                  </span>
                  <input
                    type="text"
                    required
                    value={transactionId}
                    onChange={(e) => setTransactionId(e.target.value)}
                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-slate-300 px-3 py-2 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder="12345678"
                  />
                </div>
                <p className="mt-2 flex items-center gap-1 text-xs text-slate-500">
                  <UploadCloud className="h-4 w-4" /> This will be verified by the Master Admin.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center py-3.5 px-4 border border-transparent rounded-xl shadow-sm text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-600 disabled:opacity-70 disabled:cursor-not-allowed transition-all"
              >
                {isSubmitting ? (
                  <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  'Complete Registration'
                )}
              </button>
            </form>
          )}

          {step === 'success' && (
            <div className="text-center py-8 animate-in zoom-in-95 duration-500">
              <div className="mx-auto h-24 w-24 bg-emerald-100 rounded-full flex items-center justify-center mb-6 shadow-inner ring-4 ring-emerald-50">
                <CheckCircle2 className="h-12 w-12 text-emerald-600" />
              </div>
              <h3 className="text-3xl font-extrabold text-slate-900 tracking-tight">Registration Complete!</h3>
              <p className="mt-4 text-slate-600 max-w-sm mx-auto">
                Your payment details have been submitted and your account is currently <span className="font-semibold text-amber-600">Pending</span>.
              </p>
              <div className="mt-8 bg-slate-50 rounded-xl p-6 border border-slate-200 text-left">
                <h4 className="font-semibold text-slate-900 mb-2 flex items-center gap-2">What happens next?</h4>
                <ul className="space-y-2 text-sm text-slate-600">
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">1</div>
                    The Master Admin will verify your transaction ID.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">2</div>
                    Once approved, your dashboard access will be unlocked.
                  </li>
                  <li className="flex items-start gap-2">
                    <div className="h-5 w-5 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-xs font-bold mt-0.5 shrink-0">3</div>
                    You can then log in using your user credentials to manage your calendar.
                  </li>
                </ul>
              </div>
              <button
                onClick={() => window.location.href = '/login'}
                className="mt-8 text-sm font-semibold text-indigo-600 hover:text-indigo-500 transition-colors"
              >
                Go to Login Page →
              </button>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
