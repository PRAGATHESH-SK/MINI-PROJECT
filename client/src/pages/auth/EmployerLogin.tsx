import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { Building2, ArrowRight, Lock, Mail, Sparkles } from 'lucide-react';

export const EmployerLogin: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { success, error: toastError } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      success('Signed in to Industry & Employer Workspace.');
      navigate('/employer/dashboard');
    } catch (err: any) {
      toastError(err.message || 'Invalid employer credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoFill = async () => {
    setEmail('tcs.careers@tcs-demo.com');
    setPassword('Employer@123');
    setLoading(true);
    try {
      await login('tcs.careers@tcs-demo.com', 'Employer@123');
      success('Signed in as demo employer: Tata Consultancy Services.');
      navigate('/employer/dashboard');
    } catch (err: any) {
      toastError(err.message || 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white rounded-3xl p-8 border border-slate-200/90 shadow-xl space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-navy-50 text-navy-800 flex items-center justify-center mx-auto">
            <Building2 className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">Employer Portal Sign In</h2>
          <p className="text-xs text-slate-500">
            Manage workplace geofenced internships and verified intern attendance
          </p>
        </div>

        {/* 1-Click Demo Button */}
        <button
          type="button"
          onClick={handleDemoFill}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 p-3 rounded-xl bg-gradient-to-r from-navy-900 to-navy-800 text-white font-semibold text-xs hover:from-navy-800 hover:to-navy-700 transition-all shadow-md group"
        >
          <Sparkles className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
          <span>Quick Demo Employer: TCS Siruseri</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-slate-200 w-full" />
          <span className="bg-white px-3 text-[11px] font-semibold text-slate-400 uppercase tracking-wider absolute">
            Or corporate credentials
          </span>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Corporate Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="recruiter@company.com"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block font-semibold text-slate-700">Password</label>
              <Link to="/forgot-password" className="text-navy-700 hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-600 text-slate-900"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
          >
            {loading ? 'Authenticating...' : 'Sign In as Employer'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
          <span>New corporate partner? </span>
          <Link to="/register/employer" className="font-bold text-navy-900 hover:text-cyan-600">
            Register your company
          </Link>
        </div>
      </div>
    </div>
  );
};
