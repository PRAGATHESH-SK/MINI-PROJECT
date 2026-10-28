import React, { useState } from 'react';
import { useToast } from '../../context/ToastContext.js';
import { SlidersHorizontal, ShieldCheck, Save, Sparkles, CheckCircle2 } from 'lucide-react';

export const AdminSettings: React.FC = () => {
  const { success } = useToast();
  const [maxGpsAccuracy, setMaxGpsAccuracy] = useState(100);
  const [defaultRadius, setDefaultRadius] = useState(150);
  const [demoSimulatorEnabled, setDemoSimulatorEnabled] = useState(true);
  const [anomalyDetectionEnabled, setAnomalyDetectionEnabled] = useState(true);
  const [saving, setSaving] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setTimeout(() => {
      setSaving(false);
      success('System geofencing policies updated successfully.');
    }, 600);
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-1">
        <span className="text-[11px] font-bold uppercase tracking-wider text-cyan-600 flex items-center gap-1.5">
          <SlidersHorizontal className="w-4 h-4 text-cyan-600" />
          <span>System Governance</span>
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-navy-900 tracking-tight">
          Geofencing & Security Policies
        </h1>
        <p className="text-xs text-slate-500">
          Configure statewide GPS thresholds, maximum workplace perimeter limits, and developer simulation settings.
        </p>
      </div>

      <form onSubmit={handleSave} className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 text-xs">
        <div className="space-y-4">
          <h3 className="font-bold text-sm text-navy-900 border-b border-slate-100 pb-2">
            Geospatial & GPS Calibration
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <label className="block font-bold text-navy-900">
                Maximum GPS Accuracy Threshold (meters)
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                If the reported browser GPS error radius exceeds this number, the server automatically rejects the attendance check-in.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="number"
                  min={10}
                  max={300}
                  value={maxGpsAccuracy}
                  onChange={(e) => setMaxGpsAccuracy(Number(e.target.value))}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
                <span className="text-slate-500 font-semibold">meters (Recommended: 100m)</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <label className="block font-bold text-navy-900">
                Standard Default Geofence Radius (meters)
              </label>
              <p className="text-[11px] text-slate-500 leading-relaxed">
                Default circular perimeter radius pre-filled when employers create new industrial internship sites.
              </p>
              <div className="flex items-center gap-3 pt-1">
                <input
                  type="number"
                  min={50}
                  max={500}
                  value={defaultRadius}
                  onChange={(e) => setDefaultRadius(Number(e.target.value))}
                  className="w-28 px-3 py-2 rounded-xl border border-slate-300 font-bold text-slate-900"
                />
                <span className="text-slate-500 font-semibold">meters (Recommended: 150m)</span>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 pt-4 border-t border-slate-100">
          <h3 className="font-bold text-sm text-navy-900 border-b border-slate-100 pb-2">
            Developer Simulator & Anti-Spoofing
          </h3>

          <div className="space-y-3">
            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={demoSimulatorEnabled}
                onChange={(e) => setDemoSimulatorEnabled(e.target.checked)}
                className="mt-1 accent-cyan-500 w-4 h-4 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-navy-900 block">
                  Enable Visible Demo Simulator for Student Attendance
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Allows evaluators and students in non-GPS environments to test inside/borderline/outside geofence conditions with an explicit [DEMO] watermark.
                </span>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/80 cursor-pointer">
              <input
                type="checkbox"
                checked={anomalyDetectionEnabled}
                onChange={(e) => setAnomalyDetectionEnabled(e.target.checked)}
                className="mt-1 accent-cyan-500 w-4 h-4 rounded"
              />
              <div className="text-xs">
                <span className="font-bold text-navy-900 block">
                  Enforce Server-Side Duplicate Check-In Guard
                </span>
                <span className="text-slate-500 block mt-0.5">
                  Enforces database unique constraints preventing students from checking in multiple times on the same date.
                </span>
              </div>
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end pt-4 border-t border-slate-100">
          <button
            type="submit"
            disabled={saving}
            className="px-6 py-2.5 rounded-xl bg-navy-900 hover:bg-navy-800 text-white font-bold text-xs transition-colors flex items-center gap-2 shadow-sm"
          >
            <Save className="w-4 h-4 text-cyan-400" />
            <span>{saving ? 'Saving Changes...' : 'Save System Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
};
