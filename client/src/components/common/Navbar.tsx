import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { useToast } from '../../context/ToastContext.js';
import { api } from '../../services/api.js';
import { NotificationItem } from '../../types/index.js';
import {
  Bell,
  LogOut,
  User as UserIcon,
  Shield,
  Briefcase,
  GraduationCap,
  Menu,
} from 'lucide-react';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const { user, logout } = useAuth();
  const { success } = useToast();
  const navigate = useNavigate();

  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    if (user) {
      api.get<{ data: NotificationItem[]; unreadCount: number }>('/notifications')
        .then((res) => {
          if (res.success && res.data) {
            setNotifications(res.data as any);
            setUnreadCount(res.pagination?.total || (res as any).unreadCount || 0);
          }
        })
        .catch(() => {});
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    success('You have been signed out.');
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left brand & mobile toggle */}
          <div className="flex items-center gap-3">
            {user && (
              <button
                onClick={onToggleSidebar}
                className="lg:hidden p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg"
                title="Toggle Menu"
              >
                <Menu className="w-5 h-5" />
              </button>
            )}

            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-navy-900 to-navy-700 flex items-center justify-center text-cyan-400 font-bold shadow-md shadow-navy-900/10 group-hover:scale-105 transition-transform">
                <span className="text-xl tracking-tighter">CT</span>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-lg tracking-tight text-navy-900 group-hover:text-cyan-600 transition-colors">
                    Connecting Tech
                  </span>
                  <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-50 text-cyan-700 border border-cyan-200">
                    Naan Mudhalvan
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                  Tamil Nadu Industry & University Geofenced Internship Platform
                </p>
              </div>
            </Link>
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-3">

            {user ? (
              <>
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="p-2 text-slate-600 hover:text-navy-900 hover:bg-slate-100 rounded-lg relative"
                    title="Notifications"
                  >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                      <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-cyan-500 rounded-full ring-2 ring-white"></span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-2 w-80 bg-white rounded-xl shadow-xl border border-slate-200 py-2 z-50 animate-in fade-in-50">
                      <div className="px-4 py-2 border-b border-slate-100 flex items-center justify-between">
                        <span className="font-semibold text-sm text-navy-900">Notifications</span>
                        <span className="text-xs text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded-full font-medium">
                          {unreadCount} unread
                        </span>
                      </div>
                      <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 text-xs">
                        {notifications.length === 0 ? (
                          <div className="p-4 text-center text-slate-400">No notifications yet</div>
                        ) : (
                          notifications.map((n) => (
                            <div key={n.id} className="p-3 hover:bg-slate-50 transition-colors">
                              <p className="font-semibold text-slate-800">{n.title}</p>
                              <p className="text-slate-600 mt-0.5 leading-snug">{n.message}</p>
                              <span className="text-[10px] text-slate-400 mt-1 block">
                                {new Date(n.createdAt).toLocaleDateString()}
                              </span>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* Profile menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center gap-2 p-1.5 rounded-lg hover:bg-slate-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-lg bg-navy-900 text-white font-bold flex items-center justify-center text-xs">
                      {user.email.charAt(0).toUpperCase()}
                    </div>
                    <div className="hidden md:block text-left">
                      <p className="text-xs font-semibold text-navy-900 leading-none">
                        {(user.profile as any)?.fullName || (user.profile as any)?.companyName || user.email.split('@')[0]}
                      </p>
                      <span className="text-[10px] text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                        {user.role === 'STUDENT' && <GraduationCap className="w-3 h-3 text-cyan-600" />}
                        {user.role === 'EMPLOYER' && <Briefcase className="w-3 h-3 text-navy-600" />}
                        {user.role === 'ADMIN' && <Shield className="w-3 h-3 text-amber-600" />}
                        {user.role}
                      </span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-200 py-1.5 z-50 animate-in fade-in-50">
                      <div className="px-4 py-2 border-b border-slate-100">
                        <p className="text-xs font-semibold text-slate-900 truncate">{user.email}</p>
                        <span className="text-[10px] font-bold tracking-wider uppercase text-cyan-600">
                          {user.role}
                        </span>
                      </div>
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 transition-colors"
                      >
                        <UserIcon className="w-4 h-4 text-slate-400" /> Profile & Settings
                      </Link>
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-4 py-2 text-xs text-rose-600 hover:bg-rose-50 transition-colors border-t border-slate-100"
                      >
                        <LogOut className="w-4 h-4" /> Sign Out
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/login/student"
                  className="px-3.5 py-1.5 text-xs font-semibold text-navy-900 hover:text-cyan-600 transition-colors"
                >
                  Student Sign In
                </Link>
                <Link
                  to="/login/employer"
                  className="px-3.5 py-1.5 text-xs font-semibold text-slate-600 hover:text-navy-900 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                >
                  Employer
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
