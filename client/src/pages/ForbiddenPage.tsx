import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Home } from 'lucide-react';

export const ForbiddenPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto my-16 text-center space-y-5">
      <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto border border-rose-200">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <div className="space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-rose-600">
          Error 403 &bull; Access Restricted
        </span>
        <h1 className="text-3xl font-extrabold text-navy-900 tracking-tight">Access Prohibited</h1>
        <p className="text-xs text-slate-500 leading-relaxed max-w-sm mx-auto">
          You do not have authorization to view this resource. Your role permissions do not permit access to this section.
        </p>
      </div>

      <div className="flex items-center justify-center gap-3 pt-2">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors shadow-sm"
        >
          <Home className="w-4 h-4" />
          <span>Return Home</span>
        </Link>
      </div>
    </div>
  );
};
