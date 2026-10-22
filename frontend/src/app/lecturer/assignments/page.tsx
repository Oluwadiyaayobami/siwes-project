"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import api from "@/utils/api";
import { ClipboardList, Search, Plus, Filter, ArrowUpRight } from "lucide-react";

export default function LecturerAssignmentsList() {
  const router = useRouter();

  const [assignments, setAssignments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const res = await api.get('/assignments/lecturer');
        if (res.data.success) {
          setAssignments(res.data.data);
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
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto bg-gray-50/50">
      <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between mb-8 gap-6">
          <div>
            <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">All Assignments</h2>
            <p className="text-sm font-medium text-gray-500 mt-2">
              Manage assignments across all your courses.
            </p>
          </div>
          
          <div className="flex items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 lg:w-72">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search assignments..." className="w-full pl-10 pr-4 py-3 bg-white border border-gray-100 rounded-2xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 shadow-sm transition-all" />
            </div>
            <button className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
              <Filter size={18} />
            </button>
            <button 
              onClick={() => router.push('/lecturer/assignments/new')}
              className="bg-[#0F5A37] text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md shadow-[#0F5A37]/20 hover:-translate-y-0.5 transition-transform flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={18} /> New Assignment
            </button>
          </div>
        </div>

        {/* Assignments List */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {loading ? (
            <div className="p-8 text-center text-gray-500 col-span-full">Loading assignments...</div>
          ) : assignments.length === 0 ? (
            <div className="p-8 text-center text-gray-500 col-span-full">No assignments found.</div>
          ) : (
            assignments.map((assignment) => {
              const enrolledCount = assignment.course?.enrolledStudents?.length || 0;
              const submittedCount = assignment.submissionsCount || 0;
              const rate = enrolledCount > 0 ? Math.round((submittedCount / enrolledCount) * 100) : 0;

              return (
              <div 
                key={assignment._id}
                onClick={() => router.push(`/lecturer/assignments/${assignment._id}`)}
                className="bg-white rounded-[2.5rem] p-6 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer group flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between mb-6">
                    <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
                      <ClipboardList size={24} />
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                      new Date() > new Date(assignment.dueDate) ? 'bg-blue-50 text-blue-600' : 'bg-emerald-50 text-emerald-600'
                    }`}>
                      {new Date() > new Date(assignment.dueDate) ? 'Grading' : 'Active'}
                    </span>
                  </div>
                  
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">{assignment.course?.courseCode || 'Unknown Course'}</p>
                  <h3 className="font-extrabold text-gray-900 text-xl leading-tight mb-4 group-hover:text-[#0F5A37] transition-colors">
                    {assignment.title}
                  </h3>
                  
                  <div className="bg-gray-50 rounded-xl p-3 mb-6">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-gray-500">Submission Rate</span>
                      <span className="text-xs font-black text-gray-900">{rate}%</span>
                    </div>
                    <div className="w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-[#0F5A37] rounded-full transition-all duration-500"
                        style={{ width: `${rate}%` }}
                      ></div>
                    </div>
                    <p className="text-[10px] font-medium text-gray-500 mt-2 text-right">{submittedCount} / {enrolledCount} submitted</p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-gray-50 pt-4">
                  <span className="text-xs font-bold text-red-500">Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                  <div className="w-10 h-10 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-[#0F5A37] group-hover:text-white transition-colors text-gray-400">
                    <ArrowUpRight size={18} />
                  </div>
                </div>
              </div>
            )})
          )}
        </div>

      </div>
    </main>
  );
}
