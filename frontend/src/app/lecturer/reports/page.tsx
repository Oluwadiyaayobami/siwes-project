"use client";

import { BarChart3, TrendingUp, Users, AlertTriangle, ArrowUpRight, Download } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/utils/api";

export default function LecturerReports() {
  const [stats, setStats] = useState<any>({
    totalCourses: 0,
    totalStudents: 0,
    averageAttendance: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/analytics/lecturer');
        if (res.data.success) {
          setStats(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load stats", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-8 h-8 border-4 border-[#0F5A37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Analytics & Reports</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">
              Comprehensive overview of student engagement and attendance trends.
            </p>
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2 w-fit">
            <Download size={18} /> Export PDF Report
          </button>
        </div>

        {/* Top KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-[#0F5A37] mb-4">
              <TrendingUp size={24} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Overall Attendance</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-gray-900">{stats.averageAttendance}%</h3>
              <span className="text-xs font-bold text-emerald-500 flex items-center mb-1"><ArrowUpRight size={14} /> 4.2%</span>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mb-4">
              <Users size={24} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Total Enrolled</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-gray-900">{stats.totalStudents}</h3>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-red-50 rounded-2xl flex items-center justify-center text-red-600 mb-4">
              <AlertTriangle size={24} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">At Risk Students</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-gray-900">{stats.atRiskStudents || 0}</h3>
              <span className="text-xs font-bold text-red-500 mb-1">Below 70%</span>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-6 border border-gray-100 shadow-sm flex flex-col">
            <div className="w-12 h-12 bg-amber-50 rounded-2xl flex items-center justify-center text-amber-600 mb-4">
              <BarChart3 size={24} />
            </div>
            <p className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-1">Classes Held</p>
            <div className="flex items-end gap-2">
              <h3 className="text-3xl font-black text-gray-900">{stats.classesHeld || 0}</h3>
              <span className="text-xs font-bold text-gray-400 mb-1">This semester</span>
            </div>
          </div>
        </div>

        {/* Charts Placeholder */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Attendance Trend (Past 8 Weeks)</h3>
            <div className="flex-1 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center bg-gray-50/50">
              <p className="text-sm font-bold text-gray-400">Chart Visualization Area</p>
            </div>
          </div>

          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm min-h-[400px] flex flex-col">
            <h3 className="text-xl font-bold text-gray-900 mb-6">Course Comparison</h3>
            <div className="flex-1 border-2 border-dashed border-gray-100 rounded-2xl flex items-center justify-center bg-gray-50/50">
              <p className="text-sm font-bold text-gray-400">Bar Chart Area</p>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
