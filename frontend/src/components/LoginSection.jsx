import { ShieldCheck, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const LoginSection = () => {
  return (
    <div id="login" className="py-24 bg-slate-50 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Platform Access</h2>
          <p className="mt-4 text-lg leading-8 text-slate-600">
            Secure login portal for approved companies and administrative staff.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-lg">
          
          <Link to="/login" className="flex flex-col items-center justify-between p-10 bg-white rounded-3xl shadow-lg ring-1 ring-slate-200 hover:shadow-xl hover:ring-indigo-300 transition-all cursor-pointer group block">
            <div className="flex flex-col items-center">
              <div className="h-20 w-20 bg-indigo-50 rounded-full flex items-center justify-center mb-6 group-hover:bg-indigo-100 transition-colors">
                <Building2 className="h-10 w-10 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Company Login</h3>
              <p className="text-slate-500 text-center text-sm">Access your scheduling dashboard, manage meetings, and view customer details.</p>
            </div>
            <div className="mt-8 w-full block rounded-xl bg-indigo-50 px-3.5 py-3 text-center text-sm font-semibold text-indigo-600 hover:bg-indigo-100 transition-colors">
              Log In as Company
            </div>
            <p className="mt-4 text-xs text-amber-600 text-center font-medium bg-amber-50 px-3 py-1 rounded-full">
              Requires Master Admin approval
            </p>
          </Link>

        </div>
      </div>
    </div>
  );
};
