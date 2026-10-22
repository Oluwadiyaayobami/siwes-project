"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import api from "@/utils/api";
import { 
  Users, BookOpen, Clock, ChevronRight, QrCode, 
  MapPin, CheckCircle, BarChart3, Plus, ArrowUpRight
} from "lucide-react";

export default function LecturerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [stats, setStats] = useState<any>({
    totalCourses: 0,
    totalStudents: 0,
    averageAttendance: 0,
    recentActivity: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [coursesRes, statsRes] = await Promise.all([
          api.get('/courses/lecturer'),
          api.get('/analytics/lecturer')
        ]);
        
        if (coursesRes.data.success) {
          setCourses(coursesRes.data.data);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load lecturer courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col xl:flex-row gap-8 overflow-y-auto animate-in fade-in zoom-in-95 duration-300">
      
      {/* LEFT AREA (Main Content) */}
      <div className="flex-1 flex flex-col gap-8 min-w-0">
        
        {/* Hero Banner */}
        <div 
          className="rounded-[2.5rem] p-8 md:p-10 relative overflow-hidden shadow-lg flex flex-col justify-center min-h-[240px]"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(15, 90, 55, 0.95), rgba(27, 131, 84, 0.85)), url("/images/modern_university_bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute -right-20 -top-20 w-72 h-72 bg-white opacity-5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10 w-full md:w-3/4">
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-4">
              Welcome back, {user?.name?.split(' ')[0] || "Lecturer"}
            </h1>
            <p className="text-green-50 text-base font-medium opacity-90 max-w-md">
              You have <span className="font-bold text-white">{stats.totalCourses} active {stats.totalCourses === 1 ? 'class' : 'classes'}</span>. Your overall student attendance rate this semester is {stats.averageAttendance}%.
            </p>
          </div>
          
          <div className="absolute right-8 bottom-8 hidden md:block opacity-90 transform -rotate-12">
            <Users size={120} className="text-white/20 drop-shadow-2xl" strokeWidth={1} />
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Start Attendance Action */}
          <div 
            onClick={() => router.push('/lecturer/attendance')}
            className="bg-gradient-to-br from-red-500 to-rose-600 rounded-[2rem] p-8 text-white shadow-xl shadow-red-500/20 cursor-pointer hover:scale-[1.02] transition-transform relative overflow-hidden group"
          >
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-white opacity-10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md">
              <QrCode size={28} className="text-white" />
            </div>
            <h3 className="text-2xl font-bold mb-2">Start Attendance</h3>
            <p className="text-red-100 text-sm font-medium">Generate a dynamic QR code and activate geolocation for your current class.</p>
          </div>

          {/* Create Course Action */}
          <div 
            onClick={() => router.push('/lecturer/courses/new')}
            className="bg-white border border-gray-100 rounded-[2rem] p-8 shadow-sm cursor-pointer hover:shadow-md hover:border-gray-200 transition-all group"
          >
            <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center mb-6 text-gray-600 group-hover:bg-[#0F5A37] group-hover:text-white transition-colors">
              <Plus size={28} />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Create New Course</h3>
            <p className="text-gray-500 text-sm font-medium">Set up a new module, define schedules, and enroll your students.</p>
          </div>
        </div>

        {/* My Classes Overview */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold text-gray-900">Your Active Courses</h2>
            <Link href="/lecturer/courses" className="text-sm font-bold text-[#0F5A37] hover:underline">View All</Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {loading ? (
              <div className="p-8 text-center text-gray-500 col-span-full">Loading your courses...</div>
            ) : courses.length === 0 ? (
              <div className="p-8 text-center text-gray-500 col-span-full">No active courses found.</div>
            ) : (
              courses.slice(0, 4).map((course, idx) => (
                <div 
                  key={course._id} 
                  className={`bg-white rounded-[2rem] p-6 border ${idx === 0 ? 'border-[#0F5A37]/20 shadow-md ring-4 ring-[#0F5A37]/5' : 'border-gray-100 shadow-sm'} flex flex-col justify-between`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-bold px-3 py-1 bg-gray-50 text-gray-600 rounded-lg">{course.courseCode}</span>
                      {idx === 0 && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-600 rounded-full border border-red-100 animate-pulse">
                          <div className="w-2 h-2 rounded-full bg-red-500"></div>
                          <span className="text-[10px] font-bold uppercase tracking-wider">Live Next</span>
                        </div>
                      )}
                    </div>
                    <h3 className="font-extrabold text-gray-900 text-lg mb-1">{course.title}</h3>
                    <div className="flex items-center gap-4 text-sm font-medium text-gray-500 mb-6">
                      <span className="flex items-center gap-1"><Users size={16} className="text-gray-400" /> {course.studentCount}</span>
                      <span className="flex items-center gap-1"><Clock size={16} className="text-gray-400" /> {course.schedule && course.schedule.length > 0 ? `${course.schedule[0].dayOfWeek}, ${course.schedule[0].startTime}` : 'TBD'}</span>
                    </div>
                  </div>
                  
                  <button 
                    onClick={() => router.push(`/lecturer/course/${course._id}`)}
                    className={`w-full py-3 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition-colors ${
                      idx === 0 
                        ? 'bg-[#0F5A37] text-white hover:bg-[#0a4228]' 
                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    Manage Course <ArrowUpRight size={16} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* RIGHT AREA (Analytics Sidebar) */}
      <div className="w-full xl:w-80 shrink-0 flex flex-col gap-8">
        
        {/* Quick Stats */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Overview</h2>
          <div className="bg-[#0F5A37] rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute right-0 top-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl"></div>
            
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <Users size={24} className="text-green-300" />
              </div>
              <div>
                <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Total Students</p>
                <h3 className="text-3xl font-black">{stats.totalStudents}</h3>
              </div>
            </div>

            <div className="w-full h-px bg-white/10 mb-6"></div>

            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20">
                <BarChart3 size={24} className="text-green-300" />
              </div>
              <div>
                <p className="text-green-100 text-xs font-bold uppercase tracking-wider">Avg Attendance</p>
                <div className="flex items-baseline gap-2">
                  <h3 className="text-3xl font-black">{stats.averageAttendance}<span className="text-xl">%</span></h3>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Check-ins Timeline */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-5">Recent Activity</h2>
          <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
            <div className="space-y-6">
              
              {stats.recentActivity && stats.recentActivity.length > 0 ? (
                stats.recentActivity.map((activity: any, idx: number) => (
                  <div key={idx} className="flex gap-4 relative">
                    <div className="absolute left-4 top-10 bottom-[-24px] w-0.5 bg-gray-100"></div>
                    <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border-2 border-white z-10">
                      <CheckCircle size={14} />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">{activity.title || 'Activity'}</h4>
                      <p className="text-xs font-medium text-gray-500 mt-0.5">{activity.description || 'Action performed'}</p>
                      <span className="text-[10px] font-bold text-gray-400 mt-2 block">Recently</span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm font-medium text-gray-500">
                  No recent activity found.
                </div>
              )}

            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
