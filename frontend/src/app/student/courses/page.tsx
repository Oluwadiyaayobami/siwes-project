"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { 
  Search, ChevronDown, Plus, X, BookOpen, Clock, 
  ArrowUpRight, Award, Sparkles, Folder
} from "lucide-react";
import toast from "react-hot-toast";

interface Course {
  _id: string;
  title: string;
  courseCode: string;
  lecturer: { name: string; email: string };
  schedule: Array<{
    dayOfWeek: string;
    startTime: string;
    endTime: string;
  }>;
}

const checkCourseStatus = (schedule: any[]) => {
  if (!schedule || schedule.length === 0) return { isLive: false, text: "No schedule" };

  const now = new Date();
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const currentDay = days[now.getDay()];
  const currentHour = now.getHours();
  const currentMinute = now.getMinutes();
  const currentTotalMins = currentHour * 60 + currentMinute;

  let isLive = false;
  let text = "";

  for (const slot of schedule) {
    if (slot.dayOfWeek === currentDay) {
      const [startH, startM] = slot.startTime.split(":").map(Number);
      const [endH, endM] = slot.endTime.split(":").map(Number);
      const startTotalMins = startH * 60 + startM;
      const endTotalMins = endH * 60 + endM;

      if (currentTotalMins >= startTotalMins && currentTotalMins <= endTotalMins) {
        isLive = true;
        const minsLeft = endTotalMins - currentTotalMins;
        const hoursLeft = Math.floor(minsLeft / 60);
        const minsLeftRem = minsLeft % 60;
        text = minsLeft >= 60 ? `${hoursLeft}h ${minsLeftRem}m left` : `${minsLeft}m left`;
        break;
      }
    }
  }

  if (!isLive) {
    text = `${schedule[0].dayOfWeek.slice(0, 3)} ${schedule[0].startTime}`;
  }

  return { isLive, text };
};

export default function CoursesPage() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [courses, setCourses] = useState<Course[]>([]);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);

  const fetchCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const res = await api.get("/courses/student");
      if (res.data && res.data.success) {
        setCourses(res.data.data);
      }
    } catch (error) {
      console.log("Failed to load courses from API", error);
    } finally {
      setCoursesLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user && user.role === "student") fetchCourses();
  }, [user, fetchCourses]);

  const handleJoinCourse = (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCodeInput.trim()) return;
    router.push(`/join/${joinCodeInput.trim()}`);
  };

  const colors = [
    { bg: "from-[#F0FDF4] to-[#DCFCE7]", text: "text-emerald-700", accent: "bg-emerald-100", shadow: "shadow-emerald-200/30" },
    { bg: "from-[#F5F3FF] to-[#EDE9FE]", text: "text-violet-700", accent: "bg-violet-100", shadow: "shadow-violet-200/30" },
    { bg: "from-[#FFFBEB] to-[#FEF3C7]", text: "text-amber-700", accent: "bg-amber-100", shadow: "shadow-amber-200/30" },
    { bg: "from-[#EFF6FF] to-[#DBEAFE]", text: "text-blue-700", accent: "bg-blue-100", shadow: "shadow-blue-200/30" },
  ];

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Dynamic Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Your Learning Path</h2>
            <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-400" /> Continue where you left off
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search your courses..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 shadow-sm transition-all" />
            </div>
            <button 
              onClick={() => setShowJoinModal(true)}
              className="bg-[#0F5A37] text-white px-6 py-3 rounded-2xl font-bold text-sm hover:bg-[#1B8354] transition-all shadow-lg shadow-[#0F5A37]/30 flex items-center gap-2 active:scale-95 shrink-0"
            >
              <Plus size={18} /> Join Class
            </button>
          </div>
        </div>

        {/* Premium Grid Layout */}
        {coursesLoading ? (
          <div className="w-full py-20 flex justify-center items-center text-[#0F5A37]">
            <div className="w-10 h-10 border-4 border-[#0F5A37] border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : courses.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {courses.map((course, idx) => {
              const theme = colors[idx % colors.length];
              const status = checkCourseStatus(course.schedule);
              const isActive = status.isLive;

              return (
                <div 
                  key={course._id} 
                  onClick={() => router.push(`/student/course/${course._id}`)}
                  className={`group relative overflow-hidden rounded-[2.5rem] cursor-pointer transition-all duration-300 hover:-translate-y-1 ${
                    isActive 
                      ? "p-[6px] shadow-[0_0_40px_rgba(239,68,68,0.8)] ring-[6px] ring-red-500/40"
                      : `p-1 bg-gradient-to-br ${theme.bg} hover:shadow-md ${theme.shadow}`
                  }`}
                >
                  {isActive && (
                    <div className="absolute inset-0 bg-red-500 animate-[pulse_1.5s_ease-in-out_infinite]"></div>
                  )}
                  {/* Glassmorphism Inner Card */}
                  <div className="bg-white/90 backdrop-blur-md rounded-[2.2rem] p-6 h-full border border-white/70 relative z-10 flex flex-col justify-between">
                    
                    {/* Top Row: Icon & Status */}
                    <div className="flex items-start justify-between mb-6">
                      <div className={`w-14 h-14 rounded-2xl ${theme.accent} flex items-center justify-center shadow-sm`}>
                        <Folder size={24} className={`${theme.text} opacity-80`} />
                      </div>
                      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-white rounded-xl shadow-sm">
                        <Clock size={12} className={isActive ? "text-red-500 animate-pulse" : "text-gray-400"} />
                        <span className={`text-[10px] font-bold ${isActive ? "text-red-600" : "text-gray-600"}`}>
                          {status.text}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="mb-8">
                      <p className={`text-xs font-bold uppercase tracking-wider mb-2 ${theme.text}`}>{course.courseCode}</p>
                      <h3 className="font-extrabold text-gray-900 text-xl leading-tight mb-2 group-hover:text-[#0F5A37] transition-colors line-clamp-2">
                        {course.title}
                      </h3>
                      <p className="text-sm font-semibold text-gray-500">
                        {course.lecturer.name}
                      </p>
                    </div>

                    {/* Bottom Row: Progress & Action */}
                    <div className="flex items-center justify-between pt-4 border-t border-white/40">
                      
                      {/* Active Class Indicator */}
                      <div className="flex items-center gap-3">
                        {isActive ? (
                          <div className="flex items-center gap-2 bg-red-50 px-3 py-1.5 rounded-full border border-red-100 shadow-sm">
                            <div className="relative flex h-2.5 w-2.5">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.8)]"></span>
                            </div>
                            <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Live Now</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 px-3 py-1.5">
                            <div className="w-2.5 h-2.5 rounded-full bg-gray-300"></div>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Not Active</span>
                          </div>
                        )}
                      </div>

                      {/* Go Button */}
                      <div className={`w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm group-hover:bg-[#0F5A37] group-hover:text-white transition-colors text-gray-400`}>
                        <ArrowUpRight size={18} />
                      </div>

                    </div>
                  </div>

                  {/* Abstract Background Elements */}
                  <div className={`absolute -right-10 -bottom-10 w-40 h-40 ${theme.accent} rounded-full blur-3xl opacity-60 pointer-events-none group-hover:scale-150 transition-transform duration-700`}></div>
                  <div className={`absolute -left-10 -top-10 w-32 h-32 ${theme.accent} rounded-full blur-2xl opacity-40 pointer-events-none group-hover:scale-125 transition-transform duration-700`}></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center p-20 bg-white rounded-[2.5rem] shadow-sm border border-gray-50">
            <BookOpen size={64} className="mx-auto text-gray-200 mb-6" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">No courses joined yet</h3>
            <p className="font-medium text-sm text-gray-500 mb-8">Click the button below to join your first class using a 6-character code.</p>
            <button 
              onClick={() => setShowJoinModal(true)}
              className="bg-[#0F5A37] text-white px-8 py-3 rounded-full font-bold text-sm hover:bg-[#1B8354] transition-all shadow-lg shadow-[#0F5A37]/30"
            >
              Join a Class
            </button>
          </div>
        )}
      </div>

      {/* JOIN COURSE MODAL */}
      {showJoinModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-[2.5rem] p-8 w-full max-w-sm shadow-2xl relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowJoinModal(false)}
              className="absolute top-6 right-6 text-gray-400 hover:text-gray-900 bg-gray-50 p-2 rounded-full transition-colors"
            >
              <X size={16} />
            </button>
            
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-[#E8F3ED] text-[#0F5A37] rounded-3xl flex items-center justify-center mx-auto mb-6 transform rotate-3">
                <Plus size={32} strokeWidth={3} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">Join a Subject</h2>
              <p className="text-sm text-gray-500 mt-2">Enter your 6-character class code.</p>
            </div>
            
            <form onSubmit={handleJoinCourse} className="space-y-5">
              <input 
                type="text" 
                placeholder="X7K9P2" 
                value={joinCodeInput} 
                onChange={(e) => setJoinCodeInput(e.target.value.toUpperCase())}
                maxLength={6}
                required
                autoFocus
                className="w-full px-6 py-5 bg-gray-50 border-2 border-gray-100 rounded-[1.5rem] focus:outline-none focus:border-[#0F5A37] uppercase font-bold text-center tracking-[0.5em] text-xl transition-all"
              />
              <button 
                type="submit" 
                disabled={joinLoading || joinCodeInput.length < 6}
                className="w-full bg-[#0F5A37] text-white py-5 rounded-[1.5rem] font-bold text-base shadow-lg shadow-[#0F5A37]/30 active:scale-95 transition-all disabled:opacity-50 disabled:active:scale-100"
              >
                {joinLoading ? "Enrolling..." : "Enroll Now"}
              </button>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
