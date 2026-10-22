"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter, useParams } from "next/navigation";
import api from "@/utils/api";
import { 
  ArrowLeft, MapPin, Clock, CheckCircle, XCircle, AlertCircle, 
  Calendar, Scan, BookOpen, FileText, Download, 
  ChevronRight, PlayCircle, Folder, Sparkles, User
} from "lucide-react";

interface CourseDetail {
  _id: string;
  title: string;
  courseCode: string;
  joinCode: string;
  lecturer: { name: string; email: string };
  schedule: { dayOfWeek: string; startTime: string; endTime: string }[];
}

export default function CourseDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useParams();
  const courseId = params.courseId as string;

  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [activeTab, setActiveTab] = useState<"overview" | "syllabus" | "assignments">("overview");
  
  // Overview / Attendance State
  const [currentTime, setCurrentTime] = useState(new Date());
  const [checkedIn, setCheckedIn] = useState(false);
  const [attendanceOverview, setAttendanceOverview] = useState<{
    totalSessions: number;
    present: number;
    late: number;
    absent: number;
    percentage: number;
    activeSession: {
      _id: string;
      title: string;
      expiresAt: string;
      durationMinutes?: number;
      isCheckedIn: boolean;
    } | null;
    records: any[];
  }>({
    totalSessions: 0,
    present: 0,
    late: 0,
    absent: 0,
    percentage: 100,
    activeSession: null,
    records: []
  });

  // Real Data State
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchCourse = useCallback(async () => {
    try {
      const [coursesRes, assignRes, attendanceRes] = await Promise.all([
        api.get("/courses/student"),
        api.get(`/assignments/course/${courseId}`),
        api.get(`/attendance/course/${courseId}/student-stats`).catch(() => ({ data: { success: false, data: null } }))
      ]);

      if (coursesRes.data && coursesRes.data.data) {
        const found = coursesRes.data.data.find((c: any) => c._id === courseId);
        if (found) {
          setCourse(found);
          setMaterials(found.materials || []);
        }
      }
      
      if (assignRes.data && assignRes.data.success) {
        setAssignments(assignRes.data.data);
      }

      if (attendanceRes.data && attendanceRes.data.success && attendanceRes.data.data) {
        setAttendanceOverview(attendanceRes.data.data);
        if (attendanceRes.data.data.activeSession?.isCheckedIn) {
          setCheckedIn(true);
        }
      }
    } catch (err) {
      console.log("Failed to fetch course details.", err);
    }
  }, [courseId]);

  useEffect(() => {
    if (user) fetchCourse();
  }, [user, fetchCourse]);

  // Live clock
  useEffect(() => {
    const interval = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  const hours = currentTime.getHours();
  const minutes = currentTime.getMinutes().toString().padStart(2, "0");
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = (hours % 12 || 12).toString().padStart(2, "0");
  
  const todayDate = currentTime.toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
  const todayDay = currentTime.toLocaleDateString("en-US", { weekday: "long" });
  const todaySchedule = course?.schedule.find(s => s.dayOfWeek.toLowerCase() === todayDay.toLowerCase());

  if (loading || !user) return null;

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-6xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Navigation */}
        <button 
          onClick={() => router.push('/student/courses')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0F5A37] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Courses
        </button>

        {/* Hero Banner (3D Glassmorphism with Image) */}
        <div 
          className="rounded-[2.5rem] p-8 md:p-12 shadow-2xl border border-[#1B8354] mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-end justify-between gap-8 group bg-[#0F5A37]"
          style={{ 
            backgroundImage: "linear-gradient(to right, rgba(15,90,55,0.9), rgba(15,90,55,0.7)), url('/hero-bg.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          
          {/* Decorative Background Elements (Still kept for ambient glow over the image) */}
          <div className="absolute -right-20 -top-20 w-96 h-96 bg-[#1B8354] rounded-full blur-3xl opacity-50 pointer-events-none group-hover:scale-110 transition-transform duration-700"></div>
          <div className="absolute -left-10 -bottom-10 w-48 h-48 bg-[#FFF176] rounded-full blur-3xl opacity-10 pointer-events-none group-hover:scale-125 transition-transform duration-700"></div>

          <div className="relative z-10 max-w-2xl">
            <div className="flex items-center gap-3 mb-4">
              <span className="px-3 py-1 bg-white/10 text-white text-xs font-bold rounded-lg backdrop-blur-md border border-white/20">
                {course?.courseCode || "CODE"}
              </span>
              <span className="px-3 py-1 bg-[#FFF176]/20 text-[#FFF176] text-xs font-bold rounded-lg backdrop-blur-md border border-[#FFF176]/20 flex items-center gap-1.5 shadow-sm">
                <Sparkles size={12} /> Live Learning
              </span>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4 leading-tight">
              {course?.title || "Loading Course..."}
            </h1>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white font-bold">
                {course?.lecturer?.name?.charAt(0) || "L"}
              </div>
              <p className="text-sm md:text-base font-medium text-green-50">
                {course?.lecturer?.name || "Loading..."}
              </p>
            </div>
          </div>

          <div className="relative z-10 w-full md:w-auto min-w-[280px] bg-white/10 p-5 rounded-[2rem] backdrop-blur-xl border border-white/20 shrink-0 shadow-lg flex flex-col gap-4">
            <h3 className="text-white text-sm font-bold border-b border-white/20 pb-2">Course Overview</h3>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileText size={16} className="text-green-300" />
                <span className="text-xs font-medium text-green-50">Assignments</span>
              </div>
              <span className="text-sm font-black text-white">{assignments.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <BookOpen size={16} className="text-green-300" />
                <span className="text-xs font-medium text-green-50">Lecture Notes</span>
              </div>
              <span className="text-sm font-black text-white">{materials.length}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Calendar size={16} className="text-green-300" />
                <span className="text-xs font-medium text-green-50">Schedule</span>
              </div>
              <div className="flex flex-col items-end">
                {course?.schedule?.length ? (
                  course.schedule.map((slot, idx) => (
                    <span key={idx} className="text-[10px] font-bold text-white leading-tight">
                      {slot.dayOfWeek.slice(0,3)} {slot.startTime}
                    </span>
                  ))
                ) : (
                  <span className="text-[10px] text-white">N/A</span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Custom Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit mx-auto mb-8 overflow-x-auto max-w-full">
          {[
            { id: "overview", label: "Overview & Check-In" },
            { id: "syllabus", label: "Lecture Notes" },
            { id: "assignments", label: "Assignments" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-[#0F5A37] text-white shadow-md shadow-[#0F5A37]/20" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="w-full">
          
          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              {/* Check-In Card (Green Theme 3D) */}
              <div className="bg-gradient-to-br from-[#0F5A37] to-[#1B8354] rounded-[2.5rem] p-8 text-white shadow-xl relative overflow-hidden flex flex-col items-center justify-center min-h-[300px]">
                <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-5 rounded-full blur-2xl"></div>
                
                <div className="relative z-10 flex flex-col items-center">
                  <p className="text-green-100 font-semibold uppercase tracking-widest text-xs mb-4">{todayDate}</p>
                  
                  <div className="flex items-center justify-center gap-2 mb-2 drop-shadow-md">
                    <span className="text-7xl font-black tracking-tighter">{displayHours}</span>
                    <span className="text-5xl font-bold text-green-300 animate-pulse pb-2">:</span>
                    <span className="text-7xl font-black tracking-tighter">{minutes}</span>
                    <span className="text-2xl font-bold text-green-200 ml-1 mt-6 self-start">{period}</span>
                  </div>

                  {attendanceOverview.activeSession ? (
                    <div className="flex flex-col items-center w-full">
                      {/* Active Class Indicator */}
                      <div className="flex items-center gap-2 mb-3 bg-emerald-400/20 border border-emerald-400/40 px-4 py-1.5 rounded-full animate-pulse">
                        <div className="w-2.5 h-2.5 bg-emerald-400 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                        <span className="text-emerald-100 font-bold text-xs tracking-wider uppercase">Class Attendance Live</span>
                      </div>
                      
                      <p className="text-green-50 mb-1 font-bold text-base text-center max-w-xs">{attendanceOverview.activeSession.title}</p>
                      
                      <div className="w-full h-px bg-white/10 my-4"></div>

                      <div className="flex flex-col items-center">
                        {attendanceOverview.activeSession.isCheckedIn || checkedIn ? (
                          <div className="flex items-center gap-2 text-emerald-300 bg-white/10 px-6 py-3 rounded-full border border-white/20 backdrop-blur-md">
                            <CheckCircle size={20} /> <span className="font-bold">You are Checked In ✓</span>
                          </div>
                        ) : (
                          <>
                            <button 
                              onClick={() => router.push('/student/scan')}
                              className="bg-white text-[#0F5A37] px-8 py-3.5 rounded-full font-black text-base hover:scale-105 active:scale-95 transition-all shadow-[0_8px_30px_rgb(0,0,0,0.12)] flex items-center gap-2.5 w-full justify-center sm:w-auto"
                            >
                              <Scan size={22} /> Scan QR to Check-In
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  ) : todaySchedule ? (
                    <div className="flex flex-col items-center w-full">
                      <div className="flex items-center gap-2 mb-2 bg-white/10 border border-white/20 px-4 py-1.5 rounded-full">
                        <Clock size={14} className="text-emerald-300" />
                        <span className="text-green-100 font-bold text-xs tracking-wider uppercase">Today's Class Schedule</span>
                      </div>
                      <p className="text-green-50 mb-1 font-bold text-lg">{todaySchedule.startTime} - {todaySchedule.endTime}</p>
                      <div className="flex items-center gap-1.5 text-green-200 font-medium text-xs">
                        <MapPin size={14} /> Classroom Lecture Hall
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 flex items-center gap-2 text-green-200 bg-black/10 px-5 py-2.5 rounded-full border border-white/10">
                      <Clock size={16} /> <span className="font-bold text-xs">No active attendance session right now</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Attendance Overview Stats Card */}
              <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-xl font-black text-gray-900">Attendance Overview</h3>
                    <span className={`text-xs font-black px-3 py-1 rounded-full ${
                      attendanceOverview.percentage >= 75
                        ? "bg-emerald-100 text-emerald-800"
                        : attendanceOverview.percentage >= 50
                        ? "bg-amber-100 text-amber-800"
                        : "bg-red-100 text-red-800"
                    }`}>
                      {attendanceOverview.percentage}% Rate
                    </span>
                  </div>

                  <p className="text-xs font-medium text-gray-400 mb-6">
                    {attendanceOverview.totalSessions === 0 ? (
                      "No attendance sessions conducted for this course yet."
                    ) : (
                      <>Conducted <b>{attendanceOverview.totalSessions}</b> {attendanceOverview.totalSessions === 1 ? 'session' : 'sessions'} total so far.</>
                    )}
                  </p>

                  <div className="grid grid-cols-3 gap-3 md:gap-4">
                    <div className="bg-[#F0FDF4] border border-[#DCFCE7] p-4 rounded-3xl text-center group hover:-translate-y-1 transition-transform">
                      <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                        <CheckCircle size={20}/>
                      </div>
                      <p className="text-3xl font-black text-gray-900">{attendanceOverview.present}</p>
                      <p className="text-[10px] font-black text-emerald-700 uppercase tracking-wider mt-1">Present</p>
                    </div>

                    <div className="bg-[#FFFBEB] border border-[#FEF3C7] p-4 rounded-3xl text-center group hover:-translate-y-1 transition-transform">
                      <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                        <AlertCircle size={20}/>
                      </div>
                      <p className="text-3xl font-black text-gray-900">{attendanceOverview.late}</p>
                      <p className="text-[10px] font-black text-amber-700 uppercase tracking-wider mt-1">Late</p>
                    </div>

                    <div className="bg-[#FEF2F2] border border-[#FEE2E2] p-4 rounded-3xl text-center group hover:-translate-y-1 transition-transform">
                      <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-2.5 group-hover:scale-110 transition-transform">
                        <XCircle size={20}/>
                      </div>
                      <p className="text-3xl font-black text-gray-900">{attendanceOverview.absent}</p>
                      <p className="text-[10px] font-black text-red-700 uppercase tracking-wider mt-1">Absent</p>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-6 pt-5 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs font-bold text-gray-500 mb-2">
                    <span>Course Attendance Standing</span>
                    <span className="text-gray-900 font-black">
                      {attendanceOverview.present} / {attendanceOverview.totalSessions} Sessions
                    </span>
                  </div>
                  <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-700 ${
                        attendanceOverview.percentage >= 75
                          ? "bg-emerald-500"
                          : attendanceOverview.percentage >= 50
                          ? "bg-amber-500"
                          : "bg-red-500"
                      }`}
                      style={{ width: `${Math.min(100, attendanceOverview.percentage)}%` }}
                    />
                  </div>
                </div>
              </div>

              {/* Roster / History under overview */}
              {attendanceOverview.records && attendanceOverview.records.length > 0 && (
                <div className="lg:col-span-2 bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                  <h4 className="text-base font-black text-gray-900 mb-4 flex items-center gap-2">
                    <CheckCircle size={18} className="text-[#0F5A37]" /> Your Check-in History for {course?.courseCode}
                  </h4>
                  <div className="space-y-3">
                    {attendanceOverview.records.map((rec: any, idx: number) => (
                      <div 
                        key={rec._id || idx}
                        className="p-4 bg-gray-50/80 rounded-2xl border border-gray-100 flex items-center justify-between gap-4"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                            <CheckCircle size={18} />
                          </div>
                          <div>
                            <p className="text-xs font-extrabold text-gray-900">
                              {rec.session?.title || `${course?.courseCode} Lecture Session`}
                            </p>
                            <p className="text-[10px] font-medium text-gray-400">
                              {new Date(rec.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })} at {new Date(rec.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </p>
                          </div>
                        </div>

                        <div className="text-right shrink-0">
                          <span className="text-[10px] font-black uppercase text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-full">
                            {rec.status}
                          </span>
                          <span className="text-[9px] font-semibold text-gray-400 block mt-1">
                            {rec.method || "QR"} • {rec.distance !== undefined ? `${rec.distance}m` : "Verified"}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}


          {/* SYLLABUS / NOTES TAB */}
          {activeTab === "syllabus" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
              {materials.length === 0 ? (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm p-8 text-center text-gray-500 font-medium">
                  No materials uploaded for this course yet.
                </div>
              ) : (
                <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {materials.map((mat: any, idx: number) => (
                    <div 
                      key={idx} 
                      onClick={() => window.open(mat.fileUrl, '_blank')}
                      className="flex items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-[#0F5A37]/30 hover:bg-[#F9FCFA] transition-colors group cursor-pointer shadow-sm"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                          <FileText size={24} />
                        </div>
                        <div>
                          <span className="text-base font-bold text-gray-900 group-hover:text-[#0F5A37] transition-colors">{mat.title}</span>
                          <p className="text-xs font-medium text-gray-400 mt-0.5">PDF Document • {new Date(mat.uploadedAt).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <button className="p-3 text-gray-400 hover:text-[#0F5A37] bg-white rounded-full shadow-sm transition-colors border border-gray-50 group-hover:bg-green-50">
                        <Download size={18} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === "assignments" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="bg-white rounded-[2.5rem] p-6 lg:p-8 shadow-sm border border-gray-50">
                <div className="space-y-4">
                  {assignments.length === 0 ? (
                    <div className="text-center text-gray-500 p-8">No assignments for this course.</div>
                  ) : (
                    assignments.map(item => (
                    <div 
                      key={item._id} 
                      onClick={() => router.push(`/student/assignments/${item._id}`)}
                      className="flex flex-col sm:flex-row sm:items-center justify-between p-5 rounded-2xl border border-gray-100 hover:border-[#1B8354]/30 hover:bg-[#F9FCFA] transition-colors group cursor-pointer"
                    >
                      <div className="flex items-center gap-4 mb-4 sm:mb-0">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-[#E8F3ED] text-[#0F5A37]">
                          <FileText size={20} />
                        </div>
                        <div>
                          <h4 className="font-bold text-gray-900 text-base group-hover:text-[#0F5A37] transition-colors">{item.title}</h4>
                          <p className="text-xs font-semibold text-gray-500 mt-1">Due Date: {new Date(item.dueDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between sm:justify-end gap-6 sm:w-1/2">
                        <div className="w-24 text-right">
                          {item.status === 'graded' ? (
                            <div className="flex flex-col items-end">
                              <span className="text-base font-black text-[#0F5A37]">{item.score || 0}<span className="text-xs text-gray-400 font-bold">/{item.maxScore || 100}</span></span>
                              <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full mt-1">Graded</span>
                            </div>
                          ) : item.status === 'submitted' ? (
                            <div className="flex flex-col items-end">
                              <span className="text-base font-bold text-gray-400">-</span>
                              <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full mt-1">Submitted</span>
                            </div>
                          ) : (
                            <div className="flex flex-col items-end">
                              <span className="text-base font-bold text-gray-400">-</span>
                              <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full mt-1 flex items-center gap-1">
                                <Clock size={10} /> Pending
                              </span>
                            </div>
                          )}
                        </div>
                        
                        <button className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center text-gray-400 group-hover:bg-[#1B8354] group-hover:text-white transition-colors">
                          <ChevronRight size={20} />
                        </button>
                      </div>
                    </div>
                  )))}
                </div>
              </div>
            </div>
          )}
          
        </div>
      </div>
    </main>
  );
}
