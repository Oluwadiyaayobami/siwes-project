"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import api from "@/utils/api";
import { 
  BookOpen, Clock, ChevronRight, ChevronLeft, Award,
  MapPin, FileText, ChevronDown, MoreHorizontal, GraduationCap, Image as ImageIcon
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  courseCode: string;
  lecturer: { name: string; email: string };
}

export default function StudentDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [coursesPage, setCoursesPage] = useState(0);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [joinCodeInput, setJoinCodeInput] = useState("");
  const [joinLoading, setJoinLoading] = useState(false);
  
  const [analyticsFilter, setAnalyticsFilter] = useState("This Week");
  const [showAnalyticsDropdown, setShowAnalyticsDropdown] = useState(false);
  
  const [stats, setStats] = useState({
    averageAttendance: 0,
    weeklyData: [
      { day: 'Mon', attended: 0, missed: 0 },
      { day: 'Tue', attended: 0, missed: 0 },
      { day: 'Wed', attended: 0, missed: 0 },
      { day: 'Thu', attended: 0, missed: 0 },
      { day: 'Fri', attended: 0, missed: 0 },
      { day: 'Sat', attended: 0, missed: 0 },
      { day: 'Sun', attended: 0, missed: 0 }
    ]
  });

  const [currentDate, setCurrentDate] = useState("");
  const [calendarMonth, setCalendarMonth] = useState("");
  const [calendarDays, setCalendarDays] = useState<{date: number, isCurrentMonth: boolean, isToday: boolean}[]>([]);

  useEffect(() => {
    const d = new Date();
    const month = d.toLocaleDateString("en-US", { month: "long" });
    const day = d.getDate();
    const weekday = d.toLocaleDateString("en-US", { weekday: "long" });
    setCurrentDate(`${month} ${day}, ${weekday}`);
    setCalendarMonth(month);

    const dayOfWeek = d.getDay(); 
    const diffToMonday = d.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
    const startOfWeek = new Date(d.setDate(diffToMonday));
    
    const days = [];
    for (let i = 0; i < 14; i++) {
      const date = new Date(startOfWeek);
      date.setDate(date.getDate() + i);
      days.push({
        date: date.getDate(),
        isCurrentMonth: date.getMonth() === new Date().getMonth(),
        isToday: date.getDate() === new Date().getDate() && date.getMonth() === new Date().getMonth()
      });
    }
    setCalendarDays(days);
  }, []);

  useEffect(() => {
    if (!loading && (!user || user.role !== "student")) {
      router.push("/login");
    }
  }, [user, loading, router]);

  const fetchCourses = useCallback(async () => {
    try {
      setCoursesLoading(true);
      const res = await api.get("/courses/student");
      if (res.data && res.data.data) {
        // Randomly shuffle courses and store
        const shuffled = [...res.data.data].sort(() => 0.5 - Math.random());
        setAllCourses(shuffled);
      }
      const statsRes = await api.get("/analytics/student");
      if (statsRes.data && statsRes.data.data) {
        setStats(statsRes.data.data);
      }
      const assignRes = await api.get("/assignments/student");
      if (assignRes.data && assignRes.data.data) {
        setAssignments(assignRes.data.data.slice(0, 3)); // Only show top 3 on dashboard
      }
    } catch (error) {
      console.log("Failed to fetch student data", error);
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

  if (loading || !user) return null;

  return (
    <main className="flex-1 p-4 md:p-8 md:pt-2 flex flex-col xl:flex-row gap-8 overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
      
      {/* LEFT AREA (Main Content) */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Hero Banner */}
        <div 
          className="rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-lg shadow-[#1B8354]/20 flex flex-col justify-center min-h-[220px]"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(15, 90, 55, 0.95), rgba(27, 131, 84, 0.85)), url("/images/modern_university_bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl"></div>
          <div className="absolute right-10 bottom-0 w-64 h-64 bg-[#0F5A37] opacity-20 rounded-full blur-2xl"></div>
          
          <div className="relative z-10 w-full md:w-3/4">
            <p className="text-green-100 text-sm font-medium mb-4">
              {currentDate}
            </p>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">
              Welcome back, {user.name.split(' ')[0]}!
            </h1>
            <p className="text-green-50 text-sm font-medium opacity-90">
              You've maintained a {stats.averageAttendance}% attendance rate so far! Keep it up.
            </p>
          </div>
          
          <div className="absolute right-8 bottom-8 hidden md:block opacity-90 transform -rotate-12 hover:rotate-0 transition-transform duration-500">
            <GraduationCap size={120} className="text-white drop-shadow-2xl" strokeWidth={1} />
          </div>
        </div>

        {/* My Courses */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">
              My Active Courses {allCourses.length > 0 && <span className="text-sm font-medium text-gray-400 ml-2">({allCourses.length} total)</span>}
            </h2>
            <div className="flex items-center gap-4">
              {allCourses.length > 4 && (
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => setCoursesPage(Math.max(0, coursesPage - 1))}
                    disabled={coursesPage === 0}
                    className="p-1 rounded-full text-gray-400 hover:text-[#0F5A37] hover:bg-green-50 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button 
                    onClick={() => setCoursesPage(Math.min(Math.ceil(allCourses.length / 4) - 1, coursesPage + 1))}
                    disabled={coursesPage >= Math.ceil(allCourses.length / 4) - 1}
                    className="p-1 rounded-full text-gray-400 hover:text-[#0F5A37] hover:bg-green-50 disabled:opacity-30 disabled:hover:bg-transparent"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
              <div className="w-px h-4 bg-gray-200"></div>
              <button onClick={() => router.push('/student/courses')} className="text-sm font-bold text-[#0F5A37] hover:underline">View All</button>
            </div>
          </div>
          
          <div className="flex gap-5 overflow-x-auto pb-4 -mx-4 px-4 md:mx-0 md:px-0 snap-x hide-scrollbar">
            {coursesLoading ? (
              <div className="w-full py-12 flex justify-center items-center text-[#0F5A37]">
                <div className="w-8 h-8 border-4 border-[#0F5A37] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : allCourses.length > 0 ? allCourses.slice(coursesPage * 4, (coursesPage + 1) * 4).map((course, i) => {
              const themes = [
                { bg: "bg-[#eff6ff]", border: "border-[#3b82f6]", icon: "text-[#3b82f6]", bar: "bg-[#3b82f6]" },
                { bg: "bg-[#ecfdf5]", border: "border-[#10b981]", icon: "text-[#10b981]", bar: "bg-[#10b981]" },
                { bg: "bg-[#f5f3ff]", border: "border-[#8b5cf6]", icon: "text-[#8b5cf6]", bar: "bg-[#8b5cf6]" },
                { bg: "bg-[#fffbeb]", border: "border-[#f59e0b]", icon: "text-[#f59e0b]", bar: "bg-[#f59e0b]" }
              ];
              const theme = themes[i % 4];
              
              return (
                <div 
                  key={course._id}
                  onClick={() => router.push(`/student/course/${course._id}`)}
                  className={`
                    shrink-0 w-64 rounded-3xl p-6 snap-center cursor-pointer transition-all hover:-translate-y-1
                    ${theme.bg} border-2 ${theme.border} shadow-sm hover:shadow-md
                  `}
                >
                  <div className="w-16 h-16 mb-8 rounded-2xl bg-white shadow-sm flex items-center justify-center">
                     <ImageIcon size={28} className={theme.icon} />
                  </div>
                  <h3 className="font-bold text-gray-900 text-sm mb-1 truncate">{course.title}</h3>
                  <p className="text-[10px] text-gray-500 font-semibold mb-6 truncate">{course.lecturer.name}</p>
                  
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-black/10 rounded-full overflow-hidden">
                      <div className={`h-full ${theme.bar} rounded-full`} style={{ width: `${stats.averageAttendance}%` }}></div>
                    </div>
                    <span className="text-[9px] font-bold text-gray-700">{stats.averageAttendance}%</span>
                  </div>
                  <p className="text-[9px] font-semibold text-gray-400 mt-2 text-left">Attendance</p>
                </div>
              )
            }) : (
              <div className="w-full py-12 text-center text-gray-400 border-2 border-dashed border-gray-200 rounded-3xl">
                <p className="text-sm font-medium">No courses joined yet.</p>
              </div>
            )}
          </div>
        </div>

        {/* Live Check-In */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Live Check-In</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="bg-[#fffbeb] border border-amber-100 rounded-3xl p-6 flex flex-col h-full relative overflow-hidden group">
              <div className="absolute right-4 top-4 text-amber-400 opacity-50 group-hover:scale-110 transition-transform"><Award size={48} fill="currentColor" /></div>
              <h3 className="font-bold text-amber-700 text-lg mb-6 w-3/4 leading-tight">Ready to verify attendance?</h3>
              <Link 
                href="/student/scan"
                className="mt-auto self-start bg-amber-500 text-white text-xs font-bold px-6 py-2 rounded-full shadow-sm hover:bg-amber-600 transition-colors inline-block"
              >
                Scan QR
              </Link>
            </div>

            <div className="bg-[#f5f3ff] border border-violet-100 rounded-3xl p-6 flex flex-col h-full relative overflow-hidden group">
              <div className="absolute right-4 top-4 text-violet-400 opacity-50 group-hover:scale-110 transition-transform"><MapPin size={48} fill="currentColor" /></div>
              <h3 className="font-bold text-violet-700 text-lg mb-6 w-3/4 leading-tight">Geofence Location Status</h3>
              <button className="mt-auto self-start bg-violet-500 text-white text-xs font-bold px-6 py-2 rounded-full shadow-sm hover:bg-violet-600 transition-colors">
                Active
              </button>
            </div>
          </div>
        </div>

        {/* Analytics Section */}
        <div>
          <div className="bg-white rounded-[2rem] p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-bold text-gray-900">Attendance Activity</h3>
              <div className="flex items-center gap-3 relative">
                <div className="relative">
                  <button 
                    onClick={() => setShowAnalyticsDropdown(!showAnalyticsDropdown)}
                    className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-full text-xs font-bold text-gray-600 hover:bg-gray-50 transition-colors"
                  >
                    {analyticsFilter} <ChevronDown size={14} className={`transition-transform ${showAnalyticsDropdown ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {showAnalyticsDropdown && (
                    <div className="absolute right-0 top-full mt-2 w-36 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-20">
                      {["Today", "This Week", "This Month"].map((option) => (
                        <button
                          key={option}
                          onClick={() => {
                            setAnalyticsFilter(option);
                            setShowAnalyticsDropdown(false);
                          }}
                          className={`w-full text-left px-4 py-2 text-xs font-bold hover:bg-gray-50 transition-colors ${
                            analyticsFilter === option ? "text-[#0F5A37] bg-green-50" : "text-gray-600"
                          }`}
                        >
                          {option}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <button className="text-gray-400 hover:text-gray-900">
                  <MoreHorizontal size={20} />
                </button>
              </div>
            </div>

            <div className="flex items-end gap-2 mb-10">
              <span className="text-4xl font-extrabold text-gray-900">{stats.averageAttendance}</span>
              <span className="text-sm font-bold text-gray-500 mb-1">% Average</span>
            </div>

            <div className="relative h-48 w-full flex items-end justify-between px-1 mb-8">
              <div className="absolute left-0 top-0 bottom-8 w-full flex flex-col justify-between z-0">
                {[100, 75, 50, 25, 0].map(val => (
                  <div key={val} className="w-full flex items-center gap-4">
                    <span className="text-[10px] font-bold text-gray-400 w-6 text-right">{val}%</span>
                    <div className="flex-1 border-b border-gray-100"></div>
                  </div>
                ))}
              </div>

              {stats.weeklyData.map((data, idx) => {
                const attended = data.attended;
                const missed = data.missed;
                const hasData = attended > 0 || missed > 0;
                
                return (
                  <div key={data.day} className="relative z-10 flex flex-col items-center gap-4 w-10">
                    <div className="w-5 h-40 bg-gray-100 rounded-full flex flex-col justify-end overflow-hidden group cursor-pointer relative shadow-inner">
                       {hasData && (
                         <>
                           <div className="w-full bg-red-400 transition-all duration-300 relative group-hover:brightness-110" style={{ height: `${missed}%` }}>
                             <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/5 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white">{missed}%</span>
                             </div>
                           </div>
                           <div className="w-full bg-[#1B8354] transition-all duration-300 relative group-hover:brightness-110" style={{ height: `${attended}%` }}>
                              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-black/5 flex items-center justify-center">
                                <span className="text-[8px] font-bold text-white">{attended}%</span>
                             </div>
                           </div>
                         </>
                       )}
                    </div>
                    <span className="text-[11px] font-bold text-gray-400">{data.day}</span>
                  </div>
                )
              })}
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="bg-[#f0fdf4] rounded-2xl p-4 border border-green-50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                 <h4 className="font-extrabold text-gray-900 text-sm">{stats.weeklyData.reduce((acc, curr) => acc + curr.attended, 0)} Classes</h4>
                 <p className="text-[10px] font-semibold text-gray-500 mt-1">Attended this week</p>
              </div>
              <div className="bg-[#fff1f2] rounded-2xl p-4 border border-red-50 shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                 <h4 className="font-extrabold text-gray-900 text-sm">{stats.weeklyData.reduce((acc, curr) => acc + curr.missed, 0)} Classes</h4>
                 <p className="text-[10px] font-semibold text-gray-500 mt-1">Missed this week</p>
              </div>
              <div className="bg-[#f5f3ff] rounded-2xl p-4 border border-violet-50 shadow-sm hover:shadow-md transition-shadow cursor-pointer hidden md:block">
                 <h4 className="font-extrabold text-gray-900 text-sm">{stats.averageAttendance}% Overall</h4>
                 <p className="text-[10px] font-semibold text-gray-500 mt-1">Attendance Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT AREA (Sidebar Panel) */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-8">
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">My Schedule</h2>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-6 px-2">
              <button className="text-gray-400 hover:text-gray-900"><ChevronLeft size={16} strokeWidth={3} /></button>
              <span className="font-bold text-gray-900 text-sm">{calendarMonth || "..."}</span>
              <button className="text-gray-400 hover:text-gray-900"><ChevronRight size={16} strokeWidth={3} /></button>
            </div>
            
            <div className="grid grid-cols-7 gap-y-3 text-center mb-2">
              {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
                <div key={i} className="text-[10px] font-bold text-[#1B8354]">{d}</div>
              ))}
              
              {calendarDays.map((d, i) => (
                <div 
                  key={i} 
                  className={`text-xs font-semibold py-1.5 ${
                    d.isToday 
                      ? 'text-white bg-[#0F5A37] rounded-full w-7 h-7 flex items-center justify-center mx-auto shadow-md'
                      : d.isCurrentMonth ? 'text-gray-900' : 'text-gray-400'
                  }`}
                >
                  {d.date}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Upcoming Tasks</h2>
            <Link href="/student/assignments" className="text-xs font-bold text-gray-400 hover:text-[#0F5A37]">See All</Link>
          </div>
          
          <div className="space-y-6">
            <div>
              <div className="space-y-3">
                {assignments.length === 0 ? (
                  <p className="text-xs text-gray-400 font-medium py-4 text-center border border-dashed border-gray-200 rounded-2xl">No upcoming tasks.</p>
                ) : assignments.map((item, idx) => (
                  <div key={item._id} onClick={() => router.push(`/student/assignments/${item._id}`)} className="bg-white rounded-2xl p-3 flex items-center gap-4 shadow-sm border border-gray-100 cursor-pointer hover:border-[#1B8354] transition-colors">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${idx % 2 === 0 ? 'bg-red-50 text-red-500' : 'bg-amber-50 text-amber-500'}`}>
                      <FileText size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-gray-900 text-xs truncate">{item.title}</h4>
                      <p className="text-[10px] text-gray-500 font-medium truncate mt-0.5">{item.course?.courseCode || 'Course'}</p>
                    </div>
                    <ChevronRight size={16} className="text-gray-300 shrink-0 mr-1" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
