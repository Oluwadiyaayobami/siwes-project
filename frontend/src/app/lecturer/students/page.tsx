"use client";

import { Search, Filter, MoreHorizontal, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import api from "@/utils/api";

export default function LecturerStudents() {
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const res = await api.get('/courses/lecturer/students');
        if (res.data.success) {
          setStudents(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch students", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStudents();
  }, []);

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Students List</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">
              View and manage all students enrolled across your modules.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search by name or ID..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 shadow-sm transition-all" />
            </div>
            <button className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
              <Filter size={18} /> Filter
            </button>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50 border-b border-gray-100 text-xs font-bold text-gray-500 uppercase tracking-wider">
                  <th className="px-6 py-5 whitespace-nowrap">Student Details</th>
                  <th className="px-6 py-5 whitespace-nowrap">ID</th>
                  <th className="px-6 py-5 whitespace-nowrap">Course</th>
                  <th className="px-6 py-5 whitespace-nowrap">Overall Attendance</th>
                  <th className="px-6 py-5 whitespace-nowrap">Status</th>
                  <th className="px-6 py-5 whitespace-nowrap text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      Loading students...
                    </td>
                  </tr>
                ) : students.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                      No students found enrolled in your courses.
                    </td>
                  </tr>
                ) : (
                  students.map((student, idx) => (
                    <tr 
                      key={student._id || idx} 
                      className="hover:bg-gray-50/50 transition-colors group cursor-pointer"
                      onClick={() => window.location.href = `/lecturer/students/${student.courseId}/${student._id}`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#0F5A37] to-[#1B8354] flex items-center justify-center text-white font-bold text-sm shadow-sm overflow-hidden">
                            {student.avatar ? (
                              <img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                              student.name?.charAt(0) || '?'
                            )}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-gray-900">{student.name}</p>
                            <p className="text-xs font-medium text-gray-500">{student.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-gray-600">{student.matricNo || student._id?.substring(0, 8)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs font-bold bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                          {student.course}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col gap-1.5">
                          <div className="flex items-center gap-3">
                            <div className="w-24 h-2 bg-gray-100 rounded-full overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${student.attendance >= 80 ? 'bg-emerald-500' : student.attendance >= 60 ? 'bg-amber-500' : 'bg-red-500'}`}
                                style={{ width: `${student.attendance || 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-bold text-gray-900">{student.attendance || 0}%</span>
                          </div>
                          {student.totalSessions !== undefined && (
                            <span className="text-[11px] font-semibold text-gray-400">
                              {student.presentCount || 0} / {student.totalSessions} {student.totalSessions === 1 ? 'session' : 'sessions'}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {student.attendance >= 80 ? (
                          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-bold bg-emerald-50 px-3 py-1 rounded-full w-fit">
                            <CheckCircle size={14} /> {student.status}
                          </div>
                        ) : student.attendance >= 60 ? (
                          <div className="flex items-center gap-1.5 text-amber-600 text-xs font-bold bg-amber-50 px-3 py-1 rounded-full w-fit">
                            <CheckCircle size={14} /> {student.status}
                          </div>
                        ) : (
                          <div className="flex items-center gap-1.5 text-red-600 text-xs font-bold bg-red-50 px-3 py-1 rounded-full w-fit">
                            <XCircle size={14} /> {student.status}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        <button className="text-gray-400 hover:text-gray-900 p-2 rounded-full hover:bg-white transition-colors">
                          <MoreHorizontal size={20} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
          
          <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-between text-sm font-medium text-gray-500 bg-gray-50/30">
            <span>Showing {students.length} students</span>
            <div className="flex items-center gap-2">
              <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white transition-colors">Previous</button>
              <button className="px-4 py-2 border border-gray-200 rounded-xl hover:bg-white transition-colors">Next</button>
            </div>
          </div>
        </div>

      </div>
    </main>
  );
}
