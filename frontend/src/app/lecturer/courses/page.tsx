"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { BookOpen, Users, Clock, ArrowUpRight, Search, Plus, MoreHorizontal } from "lucide-react";

export default function LecturerCourses() {
  const router = useRouter();

  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses/lecturer');
        if (res.data.success) {
          setCourses(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch courses", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-10 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">My Courses</h2>
            <p className="text-sm font-medium text-gray-500 mt-2 flex items-center gap-2">
              Manage your modules and track student progress.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search courses..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 shadow-sm transition-all" />
            </div>
            <button 
              onClick={() => router.push('/lecturer/courses/new')}
              className="bg-[#0F5A37] text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md shadow-[#0F5A37]/20 hover:shadow-lg hover:-translate-y-0.5 transition-all flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} /> New Course
            </button>
          </div>
        </div>

        {/* Course Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="p-8 text-center text-gray-500 col-span-full">Loading courses...</div>
          ) : courses.length === 0 ? (
            <div className="p-8 text-center text-gray-500 col-span-full">No courses found.</div>
          ) : (
            courses.map((course, idx) => (
              <div 
                key={course._id} 
                className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between group cursor-pointer"
                onClick={() => router.push(`/lecturer/course/${course._id}`)}
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-green-50 flex items-center justify-center text-[#0F5A37]">
                      <BookOpen size={24} />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-600`}>
                        Active
                      </span>
                      <button className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-50 text-gray-400 transition-colors">
                        <MoreHorizontal size={18} />
                      </button>
                    </div>
                  </div>

                  <div className="mb-6">
                    <p className="text-xs font-bold uppercase tracking-wider mb-2 text-gray-400">{course.courseCode}</p>
                    <h3 className="font-extrabold text-gray-900 text-xl leading-tight mb-2 group-hover:text-[#0F5A37] transition-colors line-clamp-2">
                      {course.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5 text-sm font-semibold text-gray-500">
                      <Users size={16} className="text-gray-400" /> {course.enrolledStudents?.length || 0} Students
                    </div>
                  </div>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#0F5A37] group-hover:text-white transition-colors text-gray-400">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </main>
  );
}
