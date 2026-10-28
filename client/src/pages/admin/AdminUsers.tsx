import React, { useState, useEffect, useCallback } from 'react';
import { api } from '../../services/api.js';
import { useToast } from '../../context/ToastContext.js';
import { User, Role } from '../../types/index.js';
import {
  Users,
  Search,
  CheckCircle2,
  XCircle,
  Building2,
  GraduationCap,
  Shield,
  Filter,
} from 'lucide-react';

export const AdminUsers: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [roleFilter, setRoleFilter] = useState<string>('ALL');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (roleFilter !== 'ALL') params.set('role', roleFilter);
      if (search) params.set('search', search);

      const res = await api.get<{ data: User[] }>(`/admin/users?${params.toString()}`);
      if (res.data) setUsers(res.data as any);
    } catch (err: any) {
      toastError(err.message || 'Failed to fetch users.');
    } finally {
      setLoading(false);
    }
  }, [roleFilter, search, toastError]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleToggleVerification = async (user: User) => {
    try {
      const newStatus = !user.isVerified;
      await api.patch(`/admin/users/${user.id}/status`, { isVerified: newStatus });
      success(`User ${user.email} marked as ${newStatus ? 'VERIFIED' : 'UNVERIFIED'}.`);
      fetchUsers();
    } catch (err: any) {
      toastError(err.message || 'Failed to update user status.');
    }
  };

  const handleToggleActive = async (user: User) => {
    try {
      const newStatus = !user.isActive;
      await api.patch(`/admin/users/${user.id}/status`, { isActive: newStatus });
      success(`User ${user.email} marked as ${newStatus ? 'ACTIVE' : 'DEACTIVATED'}.`);
      fetchUsers();
    } catch (err: any) {
      toastError(err.message || 'Failed to update user status.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
            <Users className="w-4 h-4 text-cyan-600" />
            <span>State University & Corporate Directory</span>
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            User Directory & Verification
          </h1>
          <p className="text-xs text-slate-500">
            Audit student profiles, verify corporate employers, and oversee account access.
          </p>
        </div>

        {/* Filter controls */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search user or email..."
              className="pl-9 pr-3 py-2 rounded-xl border border-slate-200 text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-navy-900"
            />
          </div>

          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-navy-900 focus:outline-none focus:ring-2 focus:ring-navy-900"
          >
            <option value="ALL">All Roles</option>
            <option value="STUDENT">Students</option>
            <option value="EMPLOYER">Employers</option>
            <option value="ADMIN">Admins</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Entity Name</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Email Address</th>
                <th className="py-3 px-3">Institution / Region</th>
                <th className="py-3 px-3">Verification</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No users matching criteria.
                  </td>
                </tr>
              ) : (
                users.map((u) => {
                  const displayName =
                    (u.profile as any)?.fullName ||
                    (u.profile as any)?.companyName ||
                    u.email.split('@')[0];
                  const details =
                    (u.profile as any)?.collegeName ||
                    (u.profile as any)?.industry ||
                    'System Governance';

                  return (
                    <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3.5 px-3">
                        <span className="font-bold text-navy-900 block">{displayName}</span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="inline-flex items-center gap-1 font-semibold text-slate-700">
                          {u.role === 'STUDENT' && <GraduationCap className="w-3.5 h-3.5 text-cyan-600" />}
                          {u.role === 'EMPLOYER' && <Building2 className="w-3.5 h-3.5 text-navy-700" />}
                          {u.role === 'ADMIN' && <Shield className="w-3.5 h-3.5 text-amber-600" />}
                          {u.role}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-slate-600 font-mono text-[11px]">{u.email}</td>
                      <td className="py-3.5 px-3 text-slate-600 max-w-xs truncate">{details}</td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            u.isVerified
                              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                              : 'bg-amber-50 text-amber-800 border border-amber-200'
                          }`}
                        >
                          {u.isVerified ? 'VERIFIED' : 'PENDING'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                            u.isActive
                              ? 'bg-slate-100 text-slate-700'
                              : 'bg-rose-50 text-rose-800 border border-rose-200'
                          }`}
                        >
                          {u.isActive ? 'ACTIVE' : 'DEACTIVATED'}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => handleToggleVerification(u)}
                          className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 text-[11px] font-semibold transition-colors"
                        >
                          {u.isVerified ? 'Revoke' : 'Verify'}
                        </button>
                        <button
                          type="button"
                          onClick={() => handleToggleActive(u)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-colors ${
                            u.isActive
                              ? 'bg-rose-50 hover:bg-rose-100 text-rose-700'
                              : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
