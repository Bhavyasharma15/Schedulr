import React from 'react';
import { RegistrationPayFlow } from './RegistrationPayFlow';
import { Link } from 'react-router-dom';
import { ArrowLeft, CalendarDays } from 'lucide-react';

export const RegisterPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col pt-12">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-slate-500 hover:text-indigo-600 flex items-center gap-2 font-medium transition-colors">
            <ArrowLeft className="h-4 w-4" /> Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center shadow-md">
              <CalendarDays className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 tracking-tight">Schedulr</span>
          </div>
          <Link to="/login" className="text-indigo-600 font-semibold hover:text-indigo-800 transition-colors">
            Already registered? Sign in
          </Link>
        </div>
      </div>
      
      <div className="-mt-12">
        {/* We reuse the flow previously designed in RegistrationPayFlow */}
        <RegistrationPayFlow />
      </div>
    </div>
  );
};
