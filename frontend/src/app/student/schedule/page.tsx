"use client";

import { useEffect, useState } from "react";
import api from "@/utils/api";
import { Clock, FileText, Calendar, AlertCircle, BookOpen } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SchedulePage() {
  const router = useRouter();
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [courseRes, assignRes] = await Promise.all([
          api.get('/courses/student'),
          api.get('/assignments/student')
        ]);
        
        if (courseRes.data.success) {
          setCourses(courseRes.data.data);
        }
        if (assignRes.data.success) {
          setAssignments(assignRes.data.data);
        }
      } catch (err) {
        console.error("Failed to load schedule data", err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const todayIndex = new Date().getDay();
  const todayName = daysOfWeek[todayIndex];

  // Helper to get upcoming classes (today and next available day)
  const getUpcomingClasses = () => {
    let upcoming = [];
    
    // Check next 7 days starting from today
    for (let i = 0; i < 7; i++) {
      const checkDayIndex = (todayIndex + i) % 7;
      const checkDayName = daysOfWeek[checkDayIndex];
      
      const dayClasses = [];
      for (const course of courses) {
        for (const session of course.schedule || []) {
          if (session.dayOfWeek === checkDayName) {
            dayClasses.push({
              course,
              session,
              dayName: checkDayName,
              isToday: i === 0,
              isTomorrow: i === 1
            });
          }
        }
      }

      if (dayClasses.length > 0) {
        // Sort by start time
        dayClasses.sort((a, b) => a.session.startTime.localeCompare(b.session.startTime));
        upcoming.push(...dayClasses);
        // If we found classes and it's not today, we can stop searching further to just show "closest upcoming"
        if (i > 0) break; 
      }
    }
    return upcoming;
  };

  const upcomingClasses = getUpcomingClasses();
  const pendingAssignments = assignments.filter(a => a.status === "Pending" && new Date(a.dueDate) > new Date());

  if (loading) {
    return <div className="p-8 text-center text-gray-500 mt-20">Loading your schedule...</div>;
  }

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto bg-gray-50/50">
      <div className="w-full max-w-5xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Class Schedule</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">
              Your upcoming classes and pending assignments at a glance.
            </p>
          </div>
          <button className="bg-[#0F5A37] text-white px-6 py-3 rounded-2xl font-bold text-sm shadow-md active:scale-95 transition-transform flex items-center justify-center gap-2 w-full md:w-auto">
            <FileText size={18} /> Export PDF
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Schedule Column */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
              <Calendar className="text-[#0F5A37]" size={24} /> 
              Closest Upcoming Classes
            </h3>

            {upcomingClasses.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 border border-gray-100 shadow-sm text-center">
                <Clock size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">No upcoming classes found</h3>
                <p className="text-sm text-gray-500 max-w-md mx-auto">
                  You are either not enrolled in any courses, or your courses have no schedule set.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingClasses.map((item, idx) => (
                  <div key={idx} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col sm:flex-row gap-6 relative overflow-hidden group hover:shadow-md transition-shadow">
                    
                    {/* Date/Time Block */}
                    <div className="bg-gray-50 rounded-2xl p-4 text-center min-w-[140px] flex flex-col justify-center border border-gray-100">
                      <span className={`text-xs font-bold uppercase tracking-wider mb-1 ${item.isToday ? 'text-emerald-600' : item.isTomorrow ? 'text-blue-600' : 'text-gray-500'}`}>
                        {item.isToday ? 'Today' : item.isTomorrow ? 'Tomorrow' : item.dayName}
                      </span>
                      <span className="text-xl font-black text-gray-900">{item.session.startTime}</span>
                      <span className="text-xs font-semibold text-gray-400 mt-1">to {item.session.endTime}</span>
                    </div>

                    {/* Course Info */}
                    <div className="flex-1 flex flex-col justify-center">
                      <span className="text-xs font-bold text-[#0F5A37] bg-emerald-50 px-3 py-1 rounded-lg w-max mb-3">
                        {item.course.courseCode}
                      </span>
                      <h4 className="text-xl font-bold text-gray-900 mb-2">{item.course.title}</h4>
                      <p className="text-sm font-medium text-gray-500 flex items-center gap-2">
                        <BookOpen size={16} /> Lecturer: {item.course.lecturer?.name || 'N/A'}
                      </p>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            
            {/* Pending Assignments */}
            <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm">
              <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-6">
                <AlertCircle className="text-amber-500" size={20} /> 
                Pending Assignments
              </h3>
              
              <div className="space-y-4">
                {pendingAssignments.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">No pending assignments! You're all caught up.</p>
                ) : (
                  pendingAssignments.slice(0, 4).map(assign => (
                    <div 
                      key={assign._id} 
                      onClick={() => router.push(`/student/assignments/${assign._id}`)}
                      className="p-4 rounded-2xl bg-amber-50/50 border border-amber-100/50 cursor-pointer hover:bg-amber-50 transition-colors"
                    >
                      <h4 className="font-bold text-gray-900 text-sm mb-1 truncate">{assign.title}</h4>
                      <p className="text-xs font-semibold text-amber-700">
                        Due: {new Date(assign.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  ))
                )}
                
                {pendingAssignments.length > 4 && (
                  <button 
                    onClick={() => router.push('/student/assignments')}
                    className="w-full text-center text-sm font-bold text-gray-400 hover:text-gray-600 mt-2"
                  >
                    View all {pendingAssignments.length} pending...
                  </button>
                )}
              </div>
            </div>

            {/* Quick Summary Card */}
            <div className="bg-gradient-to-br from-[#0F5A37] to-[#166c44] rounded-[2.5rem] p-8 text-white shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white opacity-5 rounded-full blur-2xl transform translate-x-1/2 -translate-y-1/2"></div>
              <h3 className="text-lg font-bold mb-2">Schedule Overview</h3>
              <p className="text-green-50/80 text-sm font-medium leading-relaxed">
                You have {courses.length} enrolled courses and {pendingAssignments.length} pending assignments. Stay on top of your schedule to maintain good attendance.
              </p>
            </div>

          </div>

        </div>
      </div>
    </main>
  );
}
