"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import api from "@/utils/api";
import { ArrowLeft, CheckCircle, XCircle, FileText, CalendarCheck } from "lucide-react";

export default function StudentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  
  const courseId = params.courseId as string;
  const studentId = params.studentId as string;

  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/students/${studentId}`);
        if (res.data.success) {
          setDetails(res.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch student details", err);
      } finally {
        setLoading(false);
      }
    };
    if (courseId && studentId) {
      fetchDetails();
    }
  }, [courseId, studentId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading student details...</div>;
  }

  if (!details) {
    return <div className="p-8 text-center text-red-500">Failed to load student details.</div>;
  }

  const { student, course, attendance, assignments } = details;

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto bg-gray-50/50 min-h-screen">
      <div className="w-full max-w-5xl animate-in fade-in zoom-in-95 duration-300">
        
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0F5A37] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Students
        </button>

        {/* Student Profile Header */}
        <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col md:flex-row items-center md:items-start gap-8 mb-8">
          <div className="w-32 h-32 rounded-3xl bg-gradient-to-tr from-[#0F5A37] to-[#1B8354] flex items-center justify-center text-white font-extrabold text-4xl shadow-lg shadow-[#0F5A37]/20 overflow-hidden shrink-0">
            {student.avatar ? (
              <img src={student.avatar} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              student.name?.charAt(0) || '?'
            )}
          </div>
          <div className="text-center md:text-left flex-1">
            <h1 className="text-3xl font-black text-gray-900">{student.name}</h1>
            <p className="text-gray-500 font-medium mt-1">{student.email}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-4">
              <span className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold">
                Matric No: {student.matricNo || 'N/A'}
              </span>
              <span className="bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-bold">
                Course: {course.courseCode}
              </span>
            </div>
          </div>

          <div className="bg-gray-50 rounded-2xl p-6 text-center min-w-[150px]">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Attendance</p>
            <p className={`text-4xl font-black ${attendance.percentage >= 75 ? 'text-emerald-500' : attendance.percentage >= 50 ? 'text-amber-500' : 'text-red-500'}`}>
              {attendance.percentage}%
            </p>
            <p className="text-xs font-bold text-gray-400 mt-1">
              {attendance.presentCount || 0} / {attendance.totalSessions || 0} Sessions
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Assignments & Grades */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <FileText size={24} className="text-[#0F5A37]" /> Assignments & Grades
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
              {assignments.length === 0 ? (
                <p className="text-sm text-gray-500">No assignments created for this course yet.</p>
              ) : (
                assignments.map((assignment: any) => (
                  <div key={assignment._id} className="p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-bold text-gray-900 text-sm">{assignment.title}</h4>
                      {assignment.submission?.status === 'Graded' ? (
                        <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-1 rounded-lg">Graded</span>
                      ) : assignment.submission ? (
                        <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-lg">Submitted</span>
                      ) : (
                        <span className="text-xs font-bold bg-gray-200 text-gray-600 px-2 py-1 rounded-lg">Pending</span>
                      )}
                    </div>
                    
                    <div className="flex justify-between items-end mt-4">
                      <div>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Score</p>
                        <p className="font-black text-gray-900">
                          {assignment.submission?.grade !== undefined && assignment.submission?.grade !== null 
                            ? `${assignment.submission.grade}/${assignment.maxScore || 100}` 
                            : `- / ${assignment.maxScore || 100}`}
                        </p>
                      </div>
                      
                      {assignment.submission && (
                        <a 
                          href={assignment.submission.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-[#0F5A37] hover:underline"
                        >
                          View File &rarr;
                        </a>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Attendance History */}
          <div className="bg-white rounded-[2.5rem] p-8 border border-gray-100 shadow-sm flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <CalendarCheck size={24} className="text-[#0F5A37]" /> Attendance History
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4">
              {attendance.records.length === 0 ? (
                <p className="text-sm text-gray-500">No attendance records found.</p>
              ) : (
                attendance.records.map((record: any) => (
                  <div key={record._id} className="flex items-center justify-between p-4 rounded-2xl bg-gray-50 border border-gray-100">
                    <div className="flex items-center gap-4">
                      {record.status === 'PRESENT' ? (
                        <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
                          <CheckCircle size={20} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center">
                          <XCircle size={20} />
                        </div>
                      )}
                      <div>
                        <p className="text-sm font-bold text-gray-900">{new Date(record.createdAt).toLocaleDateString()}</p>
                        <p className="text-xs font-medium text-gray-500">{new Date(record.createdAt).toLocaleTimeString()} • {record.venue?.name || 'Unknown Venue'}</p>
                      </div>
                    </div>
                    <span className={`text-[10px] font-bold px-3 py-1.5 rounded-full uppercase tracking-wider ${
                      record.status === 'PRESENT' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'
                    }`}>
                      {record.status === 'PRESENT' ? 'Present' : 'Absent'}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
