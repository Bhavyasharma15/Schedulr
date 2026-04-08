import { Link } from 'react-router-dom';

export const Hero = () => (
  <section className="relative overflow-hidden pt-24 pb-32 sm:pt-32 sm:pb-40">
    <div className="absolute inset-x-0 -top-40 -z-10 transform-gpu overflow-hidden blur-3xl sm:-top-80">
      <div className="relative left-[calc(50%-11rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 rotate-[30deg] bg-gradient-to-tr from-[#ff80b5] to-[#9089fc] opacity-30 sm:left-[calc(50%-30rem)] sm:w-[72.1875rem]"></div>
    </div>
    <div className="mx-auto max-w-7xl px-6 lg:px-8">
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-slate-900 sm:text-6xl">
          The Ultimate SaaS Scheduling Platform
        </h1>
        <p className="mt-6 text-lg leading-8 text-slate-600">
          Streamline your company's meetings. Manage customers effortlessly, track schedules in real-time, and boost productivity with our modern toolkit.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Link
            to="/register"
            className="rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white shadow-lg hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 transition-all duration-300"
          >
            Get started
          </Link>
          <Link to="/login" className="text-sm font-semibold leading-6 text-slate-900 hover:text-indigo-600 transition-colors">
            Log in to your account <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </div>
  </section>
);
