import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import {
  LayoutDashboard,
  Search,
  FileCheck2,
  MapPin,
  Briefcase,
  Users,
  ClipboardList,
  Shield,
  SlidersHorizontal,
  X,
  FileSpreadsheet,
} from 'lucide-react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  if (!user) return null;

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/student/internships', label: 'Explore Internships', icon: Search },
    { to: '/student/applications', label: 'My Applications', icon: FileCheck2 },
    { to: '/student/attendance', label: 'GPS Attendance', icon: MapPin },
  ];

  const employerLinks = [
    { to: '/employer/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/employer/internships', label: 'Manage Listings', icon: Briefcase },
    { to: '/employer/applications', label: 'Applicants', icon: Users },
    { to: '/employer/attendance', label: 'Verified Attendance', icon: FileSpreadsheet },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Analytics & KPIs', icon: LayoutDashboard },
    { to: '/admin/users', label: 'User Directory', icon: Users },
    { to: '/admin/moderation', label: 'Listing Moderation', icon: ClipboardList },
    { to: '/admin/attendance', label: 'Geofence Audit Logs', icon: MapPin },
    { to: '/admin/settings', label: 'System Policies', icon: SlidersHorizontal },
  ];

  const links =
    user.role === 'STUDENT'
      ? studentLinks
      : user.role === 'EMPLOYER'
      ? employerLinks
      : adminLinks;

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-slate-900/40 backdrop-blur-sm lg:hidden"
        />
      )}

      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-4 space-y-6">
          <div className="flex items-center justify-between lg:hidden mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <button onClick={onClose} className="p-1 text-slate-500 hover:text-slate-800">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Card */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
            <div className="flex items-center gap-2 text-xs font-semibold text-navy-900">
              {user.role === 'STUDENT' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
              {user.role === 'EMPLOYER' && <div className="w-2 h-2 rounded-full bg-navy-600" />}
              {user.role === 'ADMIN' && <div className="w-2 h-2 rounded-full bg-amber-500" />}
              <span className="uppercase tracking-wider text-[11px] text-slate-500">Active Workspace</span>
            </div>
            <p className="font-bold text-sm text-navy-900 mt-1 truncate">
              {(user.profile as any)?.fullName || (user.profile as any)?.companyName || user.email}
            </p>
            <span className="inline-block mt-1 text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-white text-navy-800 border border-slate-200">
              {user.role} Portal
            </span>
          </div>

          {/* Nav links */}
          <nav className="space-y-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <NavLink
                  key={link.to}
                  to={link.to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-navy-900 text-white shadow-sm font-semibold'
                        : 'text-slate-600 hover:text-navy-900 hover:bg-slate-100'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{link.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer info badge */}
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 text-[11px] text-slate-400 flex items-center justify-between">
          <div className="flex items-center gap-1.5 font-medium">
            <Shield className="w-3.5 h-3.5 text-cyan-500" />
            <span>PostGIS Geofence v2.4</span>
          </div>
        </div>
      </aside>
    </>
  );
};
