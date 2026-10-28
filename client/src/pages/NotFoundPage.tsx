import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, Home } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-16 text-center space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-slate-100 text-slate-700 flex items-center justify-center mx-auto border border-slate-200">
        <Compass className="w-8 h-8 text-cyan-600 animate-pulse" />
      </div>
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600">
          Error 404 &bull; Page Not Found
        </span>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">Location Off The Map</h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          The requested URL path does not exist on the Connecting Tech portal or may have been relocated.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Return to Homepage</span>
        </Link>
      </div>
    </div>
  );
};
