"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown, CheckCircle, Clock, FileText, AlertCircle, ArrowUpRight } from "lucide-react";
import api from "@/utils/api";

export default function AssignmentsPage() {
  const router = useRouter();
  const [selectedSubject, setSelectedSubject] = useState("All Subjects");
  const [animatedScore, setAnimatedScore] = useState(0);

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>({ averageAttendance: 0 });

  useEffect(() => {
    let animationFrame: number;
    const startTime = performance.now();
    const duration = 1500;
    const targetScore = stats.averageAttendance || 0;

    const easeOutElastic = (t: number): number => {
      const c4 = (2 * Math.PI) / 3;
      return t === 0 ? 0 : t === 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
    };

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      setAnimatedScore(Math.floor(easeOutElastic(progress) * targetScore));
      
      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [stats.averageAttendance]);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get('/assignments/student');
        if (res.data.success) {
          setAssignments(res.data.data);
        }
        const statsRes = await api.get('/analytics/student');
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch assignments", err);
      } finally {
        setLoading(false);
      }
    };
    fetchAssignments();
  }, []);

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-6xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Assignments & Performance</h2>
            <p className="text-sm text-gray-500 mt-1">Track your coursework and overall progress</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search size={14} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search assignments..." className="pl-10 pr-4 py-2.5 bg-white border border-gray-100 rounded-full text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 w-64 shadow-sm" />
            </div>
            <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-100 rounded-full text-sm font-bold text-gray-700 shadow-sm hover:bg-gray-50">
              {selectedSubject} <ChevronDown size={14} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT: Assignments List */}
          <div className="xl:col-span-2 flex flex-col gap-6">
            
            <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-50">
              <h3 className="text-lg font-bold text-gray-900 mb-6">Recent Assignments</h3>
              
              <div className="space-y-4">
                {loading ? (
                  <p className="text-sm text-gray-500 text-center py-4">Loading assignments...</p>
                ) : assignments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No assignments yet.</p>
                ) : assignments.map(item => (
                  <div 
                    key={item._id} 
                    onClick={() => router.push(`/student/assignments/${item._id}`)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-2xl border border-gray-100 hover:border-[#1B8354]/30 hover:bg-[#F9FCFA] transition-colors group cursor-pointer"
                  >
                    
                    <div className="flex items-center gap-4 mb-4 sm:mb-0">
                      <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-emerald-50 text-emerald-500">
                        <FileText size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#0F5A37] transition-colors">{item.title}</h4>
                        <p className="text-xs font-semibold text-gray-500 mt-1">{item.course?.courseCode || "Course"} • Assignment</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                      <div className="text-right">
                        <p className="text-xs font-bold text-gray-400 mb-1">Due Date</p>
                        <p className="text-sm font-bold text-gray-900">{new Date(item.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
                      </div>
                      
                      <div className="w-24 text-right">
                        {item.status === 'Graded' ? (
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-extrabold text-[#0F5A37]">{item.score || 0}<span className="text-[10px] text-gray-400 font-bold">/{item.maxScore || 100}</span></span>
                            <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Graded</span>
                          </div>
                        ) : item.status === 'Submitted' ? (
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-400">-</span>
                            <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">Submitted</span>
                          </div>
                        ) : (
                          <div className="flex flex-col items-end">
                            <span className="text-sm font-bold text-gray-400">-</span>
                            <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1">
                              <Clock size={10} /> Pending
                            </span>
                          </div>
                        )}
                      </div>
                      
                      <button className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#1B8354] group-hover:text-white transition-colors">
                        <ArrowUpRight size={16} />
                      </button>
                    </div>

                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* RIGHT: Performance Replicated UI */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-[2rem] p-6 lg:p-8 shadow-xl shadow-gray-200/40 border border-gray-50 sticky top-8">
              
              <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
                <h3 className="text-xl font-bold text-gray-900 shrink-0">Performance</h3>
                <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50 shrink-0 whitespace-nowrap shadow-sm">
                  Last 6 Months <ChevronDown size={14} />
                </button>
              </div>

              {/* Gauge and Legend Area */}
              <div className="flex flex-wrap 2xl:flex-nowrap flex-col sm:flex-row xl:flex-col items-center justify-center gap-8 mb-8">
                
                {/* Perfect Gauge Chart Replica with 3D vibe */}
                <div className="relative w-48 h-28 flex items-end justify-center overflow-visible shrink-0 mx-auto">
                  <svg viewBox="0 0 200 100" className="w-full h-full absolute top-0 left-0 overflow-visible">
                    <defs>
                      <filter id="gaugeShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="#000" floodOpacity="0.08" />
                      </filter>
                      <filter id="knobGlow" x="-50%" y="-50%" width="200%" height="200%">
                        <feDropShadow dx="0" dy="4" stdDeviation="4" floodColor="#ED8936" floodOpacity="0.5" />
                      </filter>
                    </defs>
                    <g transform="rotate(180 100 100)">
                      {/* Dotted inner arc */}
                      <circle cx="100" cy="100" r="55" fill="none" stroke="#E2E8F0" strokeWidth="2" strokeDasharray="3 7" />
                      
                      <g filter="url(#gaugeShadow)">
                        {/* Green (Participation) */}
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#68D391" strokeWidth="12" strokeLinecap="round" strokeDasharray="120 472" strokeDashoffset="0" />
                        
                        {/* Yellow (Class Quiz) */}
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#F6E05E" strokeWidth="12" strokeLinecap="round" strokeDasharray="26 472" strokeDashoffset="-129.5" />
                        
                        {/* Orange (Exam) */}
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#ED8936" strokeWidth="12" strokeLinecap="round" strokeDasharray="15 472" strokeDashoffset="-164.8" />
                        
                        {/* Red (Absent) */}
                        <circle cx="100" cy="100" r="75" fill="none" stroke="#E53E3E" strokeWidth="12" strokeLinecap="round" strokeDasharray="15 472" strokeDashoffset="-188.3" />
                      </g>
                    </g>
                    
                    {/* Knob (at dynamic % mark) with ammeter bounce animation */}
                    <style>{`
                      @keyframes ammeterSweep {
                        0% { transform: rotate(0deg); }
                        40% { transform: rotate(${(stats.averageAttendance || 0) * 1.8 + (stats.averageAttendance ? 11 : 0)}deg); }
                        60% { transform: rotate(${(stats.averageAttendance || 0) * 1.8 - (stats.averageAttendance ? 5 : 0)}deg); }
                        80% { transform: rotate(${(stats.averageAttendance || 0) * 1.8 + (stats.averageAttendance ? 2 : 0)}deg); }
                        100% { transform: rotate(${(stats.averageAttendance || 0) * 1.8}deg); }
                      }
                      .animate-needle {
                        transform-origin: 100px 100px;
                        animation: ammeterSweep 1.5s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                      }
                    `}</style>
                    <g className="animate-needle" filter="url(#knobGlow)">
                      <circle cx="25" cy="100" r="6" fill="white" stroke="#ED8936" strokeWidth="4" />
                    </g>
                  </svg>
                  
                  <div className="absolute bottom-1 text-center w-full z-10">
                    <span className="block text-3xl font-extrabold text-[#1A202C] leading-none tracking-tight drop-shadow-sm">{stats.averageAttendance}%</span>
                    <span className="text-[10px] font-bold text-gray-400 mt-0.5 block">Attendance Score</span>
                  </div>
                </div>

                {/* Legend */}
                <div className="space-y-3 w-full sm:w-auto px-2">
                  <div className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#68D391]"></div>
                      <span className="text-xs font-bold text-gray-700">Present</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{stats.averageAttendance || 0}%</span>
                  </div>
                  <div className="flex items-center justify-between gap-8">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-[#E53E3E]"></div>
                      <span className="text-xs font-bold text-gray-700">Absent</span>
                    </div>
                    <span className="text-xs font-semibold text-gray-500">{100 - (stats.averageAttendance || 0)}%</span>
                  </div>
                </div>

              </div>

              {/* Area Chart Area */}
              <div className="mt-8 bg-[#F8F9FE] rounded-xl pt-6 pb-2 px-1 relative">
                
                {/* Stats Overlay inside the purple box */}
                <div className="flex flex-col items-center justify-center mb-6 relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl font-extrabold text-[#1A202C]">{stats.averageAttendance}%</span>
                    <span className="text-[10px] font-bold text-green-600 bg-[#E6F4EA] px-1.5 py-0.5 rounded-md">+3.4%</span>
                  </div>
                  <span className="text-[10px] font-bold text-gray-400 mt-1">Overall Average</span>
                </div>

                {/* Chart Container */}
                <div className="relative h-24 w-full flex flex-col justify-end">
                  {/* Y-Axis Grid */}
                  <div className="absolute left-0 top-0 bottom-0 w-full flex flex-col justify-between z-0 pb-6">
                    {[100, 75, 50, 25, 0].map(val => (
                      <div key={val} className="w-full flex items-center gap-2">
                        <span className="text-[9px] font-bold text-gray-400 w-8 text-right pr-1">{val}%</span>
                        <div className="flex-1 border-b border-gray-200 opacity-50"></div>
                      </div>
                    ))}
                  </div>

                  {/* Wavy Area Chart SVG Fixed */}
                  <div className="absolute left-[40px] right-2 bottom-6 top-0 z-0 overflow-hidden">
                    <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="w-full h-full">
                      <defs>
                        <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#A78BFA" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#A78BFA" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      <path 
                        d="M 0 40 L 5 15 L 10 30 L 15 25 L 20 35 L 25 25 L 30 20 L 35 30 L 40 25 L 45 25 L 50 18 L 55 25 L 60 20 L 65 30 L 70 25 L 75 15 L 80 25 L 85 25 L 90 32 L 95 28 L 100 32 L 100 40 Z" 
                        fill="url(#areaGradient)" 
                      />
                      <path 
                        d="M 0 40 L 5 15 L 10 30 L 15 25 L 20 35 L 25 25 L 30 20 L 35 30 L 40 25 L 45 25 L 50 18 L 55 25 L 60 20 L 65 30 L 70 25 L 75 15 L 80 25 L 85 25 L 90 32 L 95 28 L 100 32" 
                        fill="none" 
                        stroke="#A78BFA" 
                        strokeWidth="1.5" 
                        vectorEffect="non-scaling-stroke"
                      />
                    </svg>
                  </div>
                  
                  {/* X-Axis */}
                  <div className="flex justify-between pl-[40px] pr-2 pt-2 relative z-10 border-t border-gray-200">
                    {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul'].map(m => (
                      <span key={m} className="text-[9px] font-bold text-gray-400">{m}</span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Motivational Quote Box */}
              <div className="mt-6 bg-[#FEF9C3] rounded-xl p-4 border border-[#FEF08A]">
                <p className="text-[11px] font-bold text-amber-800 leading-relaxed text-center">
                  Success is the sum of small efforts, repeated day in and day out. Keep pushing forward! 😉
                </p>
              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
