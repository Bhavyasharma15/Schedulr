import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Hero } from './Hero';
import { LoginSection } from './LoginSection';
import { CalendarDays, LayoutDashboard, Shield, Sun, Moon } from 'lucide-react';

const LandingPage = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('theme', theme);
  }, [theme]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <header className="absolute inset-x-0 top-0 z-50">
        <nav className="flex items-center justify-between p-6 lg:px-8" aria-label="Global">
          <div className="flex lg:flex-1">
            <a href="#" className="-m-1.5 p-1.5 flex items-center gap-2">
              <span className="sr-only">Schedulr</span>
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center">
                <CalendarDays className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-slate-900 tracking-tight">Schedulr</span>
            </a>
          </div>
          <div className="hidden lg:flex lg:gap-x-12">
            <a href="#features" className="text-sm font-semibold leading-6 text-slate-900 hover:text-indigo-600 transition-colors">Features</a>
            <Link to="/register" className="text-sm font-semibold leading-6 text-slate-900 hover:text-indigo-600 transition-colors">Pricing</Link>
            <Link to="/book" className="text-sm font-semibold leading-6 text-indigo-600 active:text-indigo-700 hover:text-indigo-500 transition-colors bg-indigo-50 px-3 py-1.5 rounded-full inline-flex items-center gap-1">
              Book a Meeting
            </Link>
          </div>
          <div className="hidden lg:flex lg:flex-1 lg:justify-end lg:items-center lg:gap-6">
            <button 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="p-1.5 text-slate-500 hover:text-indigo-600 transition-colors rounded-full hover:bg-slate-200"
              aria-label="Toggle dark mode"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900 hover:text-indigo-600 transition-colors flex items-center gap-1">
              Log in <span aria-hidden="true">&rarr;</span>
            </Link>
          </div>
        </nav>
      </header>

      <main className="flex-grow">
        <Hero />
        
        {/* Features section brief */}
        <section id="features" className="py-24 bg-slate-900 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-indigo-400">Deploy faster</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">Everything you need to schedule</p>
              <p className="mt-6 text-lg leading-8 text-slate-300">
                A robust pipeline to handle user booking, company management, and admin oversight completely out of the box.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col items-center lg:items-start lg:text-left text-center">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <LayoutDashboard className="h-6 w-6 text-indigo-400" />
                  </div>
                  <dt className="text-base font-semibold leading-7 text-white">Modern Dashboard</dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-slate-400">
                    <p className="flex-auto">Intuitive tools to manage meetings, view customer details, and track conversions easily.</p>
                  </dd>
                </div>
                <div className="flex flex-col items-center lg:items-start lg:text-left text-center">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <Shield className="h-6 w-6 text-indigo-400" />
                  </div>
                  <dt className="text-base font-semibold leading-7 text-white">Advanced Security</dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-slate-400">
                    <p className="flex-auto">Master Admin approval workflow ensures unverified companies cannot access the platform fully.</p>
                  </dd>
                </div>
                <div className="flex flex-col items-center lg:items-start lg:text-left text-center">
                  <div className="mb-6 flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-500/10 border border-indigo-500/20">
                    <CalendarDays className="h-6 w-6 text-indigo-400" />
                  </div>
                  <dt className="text-base font-semibold leading-7 text-white">Automated Scheduling</dt>
                  <dd className="mt-1 flex flex-auto flex-col text-base leading-7 text-slate-400">
                    <p className="flex-auto">Conflict-free time slot booking integrating directly into customer's native calendars.</p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </section>
        
        <div className="bg-slate-200 h-px w-full max-w-7xl mx-auto"></div>

        <LoginSection />
      </main>

      <footer className="bg-white py-12 border-t border-slate-200">
        <div className="mx-auto max-w-7xl px-6 lg:px-8 text-center text-sm text-slate-500">
          &copy; {new Date().getFullYear()} Schedulr Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
