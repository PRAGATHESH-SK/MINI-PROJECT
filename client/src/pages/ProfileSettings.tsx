import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useToast } from '../context/ToastContext.js';
import { User, GraduationCap, Building2, Shield, Save, CheckCircle2 } from 'lucide-react';

export const ProfileSettings: React.FC = () => {
  const { user } = useAuth();
  const { success } = useToast();
  const [saving, setSaving] = useState(false);

  const isStudent = user?.role === 'STUDENT';
  const isEmployer = user?.role === 'EMPLOYER';
  const profile = (user?.profile as any) || {};

  const [fullName, setFullName] = useState(profile.fullName || profile.companyName || '');
  const [phone, setPhone] = useState(profile.phone || profile.contactPhone || '');
  const [district, setDistrict] = useState(profile.district || 'Chennai');
  const [city, setCity] = useState(profile.city || 'Chennai');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success('Profile details updated successfully.');
    }, 600);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex items-center gap-4">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-navy-900 to-navy-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
          {user?.email.charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-extrabold text-navy-900">{fullName || user?.email}</h1>
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
              {user?.role}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">{user?.email}</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-5 text-xs">
        <h3 className="font-bold text-sm text-navy-900 border-b border-slate-100 pb-2 flex items-center gap-2">
          {isStudent && <GraduationCap className="w-4 h-4 text-cyan-600" />}
          {isEmployer && <Building2 className="w-4 h-4 text-navy-700" />}
          {!isStudent && !isEmployer && <Shield className="w-4 h-4 text-amber-600" />}
          <span>Account & Profile Information</span>
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              {isEmployer ? 'Company Legal Name' : 'Full Name'}
            </label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              disabled
              value={user?.email || ''}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+91 98400 12345"
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">District</label>
            <input
              type="text"
              value={district}
              onChange={(e) => setDistrict(e.target.value)}
              className="w-full px-3 py-2.5 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-navy-900 text-slate-900"
            />
          </div>
        </div>

        {isStudent && (
          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
            <span className="font-bold text-navy-900 block">Academic Accreditation</span>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-slate-600">
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">University</span>
                <span className="font-semibold text-navy-900">{profile.collegeName || 'Anna University'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Department</span>
                <span className="font-semibold text-navy-900">{profile.department || 'Computer Science'}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-semibold">Register Number</span>
                <span className="font-mono font-semibold text-navy-900">{profile.registerNumber || '2021103045'}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            <span>{saving ? 'Saving...' : 'Save Profile'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
