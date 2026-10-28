import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api.js';
import { Internship } from '../types/index.js';
import {
  ShieldCheck,
  MapPin,
  Building2,
  GraduationCap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Compass,
  Award,
  Users,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [featuredInternships, setFeaturedInternships] = useState<Internship[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get<{ data: Internship[] }>('/internships?limit=4')
      .then((res) => {
        if (res.success && res.data) {
          setFeaturedInternships(res.data as any);
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const districts = [
    { name: 'Chennai', count: '1,420+ Internships', tag: 'Cloud & SaaS' },
    { name: 'Coimbatore', count: '890+ Internships', tag: 'Embedded & IoT' },
    { name: 'Madurai', count: '540+ Internships', tag: 'Cybersecurity' },
    { name: 'Tiruchirappalli', count: '410+ Internships', tag: 'AI & Data' },
    { name: 'Salem', count: '320+ Internships', tag: 'Smart Manufacturing' },
    { name: 'Krishnagiri / Hosur', count: '280+ Internships', tag: 'Auto Electronics' },
  ];

  return (
    <div className="space-y-16 pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-b from-navy-900 via-navy-950 to-navy-900 text-white p-8 sm:p-14 lg:p-20 shadow-2xl">
        {/* Subtle grid backdrop */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e3a8a15_1px,transparent_1px),linear-gradient(to_bottom,#1e3a8a15_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none" />

        <div className="relative max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/80 border border-cyan-500/30 text-cyan-400 text-xs font-semibold tracking-wide">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>Naan Mudhalvan Industry Immersion Framework</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-[1.15]">
            Bridging Tamil Nadu Universities to{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-300 to-white">
              Pioneering Tech Industries
            </span>
          </h1>

          <p className="text-base sm:text-lg text-slate-300 font-normal leading-relaxed">
            Connecting Tech enables engineering students to discover localized, high-impact internships across Tamil Nadu districts with reliable, browser GPS geofenced attendance verification.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-4">
            <Link
              to="/student/internships"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-navy-950 font-bold text-sm transition-all shadow-lg shadow-cyan-500/25 hover:scale-[1.02]"
            >
              <Compass className="w-4 h-4" /> Discover Local Internships
            </Link>
            <Link
              to="/login/employer"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-navy-800/80 hover:bg-navy-800 border border-slate-700 text-white font-semibold text-sm transition-all hover:border-slate-500"
            >
              <Building2 className="w-4 h-4 text-cyan-400" /> Hire Student Interns
            </Link>
          </div>

          {/* Key trust badges */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-6 text-slate-300 text-xs">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>PostGIS Geofenced Verification</span>
            </div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>University Credit Aligned</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>38 TN Districts Integrated</span>
            </div>
          </div>
        </div>
      </section>

      {/* 2 Role Pathways */}
      <section className="space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
            Tailored Experiences for Every Stakeholder
          </h2>
          <p className="text-sm text-slate-600">
            A unified ecosystem connecting engineering students and corporate employers across Tamil Nadu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {/* Student Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center font-bold">
                <GraduationCap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">For Students</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Filter internships by your home district, required skills, and stipend. Mark daily workplace attendance effortlessly using browser GPS geofencing.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" /> Localized proximity search
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" /> 1-Click verified application
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-600" /> Geofenced check-in map
                </li>
              </ul>
            </div>
            <Link
              to="/login/student"
              className="mt-6 inline-flex items-center justify-between text-xs font-bold text-cyan-600 hover:text-cyan-700 pt-4 border-t border-slate-100"
            >
              <span>Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* Employer Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-xl bg-navy-50 text-navy-800 flex items-center justify-center font-bold">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-navy-900">For Employers</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Post positions with specific workplace coordinates and geofence radii. Access top engineering talent and review automated, tamper-resistant attendance reports.
              </p>
              <ul className="text-xs text-slate-600 space-y-2 pt-2">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-navy-700" /> Interactive Leaflet coordinate picker
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-navy-700" /> Verified intern check-in logs
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-navy-700" /> 1-Click CSV attendance export
                </li>
              </ul>
            </div>
            <Link
              to="/login/employer"
              className="mt-6 inline-flex items-center justify-between text-xs font-bold text-navy-800 hover:text-navy-900 pt-4 border-t border-slate-100"
            >
              <span>Employer Onboarding</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Live Opportunities */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">Active Openings</span>
            <h2 className="text-2xl font-extrabold text-navy-900 tracking-tight">
              Featured Industry Internships
            </h2>
          </div>
          <Link
            to="/student/internships"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-navy-900 hover:text-cyan-600 transition-colors"
          >
            <span>View all opportunities</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-44 bg-white rounded-2xl animate-pulse border border-slate-200" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {featuredInternships.map((internship) => (
              <div
                key={internship.id}
                className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <span className="text-xs font-semibold text-slate-500">
                        {internship.employer?.companyProfile?.companyName || 'Verified Enterprise'}
                      </span>
                      <h4 className="text-base font-bold text-navy-900 mt-0.5">{internship.title}</h4>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-cyan-50 text-cyan-700 border border-cyan-200 uppercase tracking-wider shrink-0">
                      ₹{internship.stipend.toLocaleString()}/mo
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 line-clamp-2">{internship.description}</p>

                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
                    <span className="inline-flex items-center gap-1 text-slate-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      {internship.district}, {internship.city}
                    </span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-slate-500 font-medium">{internship.durationWeeks} Weeks</span>
                    <span className="text-slate-300">&bull;</span>
                    <span className="text-cyan-700 font-semibold bg-cyan-50 px-2 py-0.5 rounded">
                      {internship.geofenceRadiusMeters}m Geofence
                    </span>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                  <div className="flex flex-wrap gap-1.5">
                    {internship.skills.split(',').slice(0, 3).map((s) => (
                      <span key={s} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                        {s.trim()}
                      </span>
                    ))}
                  </div>

                  <Link
                    to={`/student/internships/${internship.id}`}
                    className="inline-flex items-center gap-1 text-xs font-bold text-navy-900 hover:text-cyan-600"
                  >
                    <span>View & Apply</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Regional District Hubs */}
      <section className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200/90 shadow-sm space-y-6">
        <div className="text-center max-w-xl mx-auto space-y-1">
          <span className="text-xs font-bold uppercase tracking-wider text-cyan-600">Statewide Network</span>
          <h3 className="text-2xl font-extrabold text-navy-900 tracking-tight">
            Opportunities Across Tamil Nadu Districts
          </h3>
          <p className="text-xs text-slate-500">
            Localized industrial clusters aligned with the Tamil Nadu Skill Development Mission.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {districts.map((d) => (
            <div
              key={d.name}
              className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/60 hover:bg-white hover:border-cyan-300 hover:shadow-sm transition-all text-center space-y-1"
            >
              <h5 className="font-bold text-sm text-navy-900">{d.name}</h5>
              <p className="text-[11px] font-semibold text-cyan-600">{d.count}</p>
              <span className="inline-block text-[10px] text-slate-400 font-medium">{d.tag}</span>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
