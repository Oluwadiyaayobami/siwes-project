"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, CheckCircle2, MessageSquare, Download, Filter, Search, Clock } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/api";

export default function AssignmentSubmissions({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const assignmentId = unwrappedParams.id;

  const [assignment, setAssignment] = useState<any>(null);
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [feedback, setFeedback] = useState("");
  const [grade, setGrade] = useState("");

  useEffect(() => {
    const fetchAssignmentAndSubmissions = async () => {
      try {
        const [assignmentRes, submissionsRes] = await Promise.all([
          api.get(`/assignments/${assignmentId}`),
          api.get(`/assignments/${assignmentId}/submissions`)
        ]);
        
        if (assignmentRes.data.success) {
          setAssignment(assignmentRes.data.data);
        }
        if (submissionsRes.data.success) {
          setSubmissions(submissionsRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch assignment details", err);
        toast.error("Failed to load data");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignmentAndSubmissions();
  }, [assignmentId]);

  const handleSaveFeedback = async () => {
    const numericGrade = Number(grade.split('/')[0]) || Number(grade);
    const maxScore = assignment?.maxScore || 100;
    
    if (numericGrade > maxScore) {
      toast.error(`Grade cannot exceed the maximum score of ${maxScore}`);
      return;
    }

    try {
      const res = await api.put(`/assignments/submissions/${selectedStudent._id}/grade`, {
        grade: numericGrade,
        feedback
      });
      if (res.data.success) {
        toast.success(`Feedback and Grade saved for ${selectedStudent.student.name}`);
        setSubmissions(prev => prev.map(s => s._id === selectedStudent._id ? { ...s, status: 'Graded', grade: res.data.data.grade, feedback: res.data.data.feedback } : s));
        setSelectedStudent(null);
        setFeedback("");
        setGrade("");
      }
    } catch (err) {
      toast.error("Failed to save grade");
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-y-auto">
        <p className="font-bold text-gray-500">Loading submissions...</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col xl:flex-row gap-8 overflow-hidden bg-gray-50/50">
      
      {/* Main List Area */}
      <div className="flex-1 flex flex-col min-w-0 animate-in fade-in zoom-in-95 duration-300">
        
        <button 
          onClick={() => router.push('/lecturer/assignments')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0F5A37] transition-colors mb-6 w-fit"
        >
          <ArrowLeft size={16} /> Back to Assignments
        </button>

        <div className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-lg uppercase tracking-wider mb-2 inline-block">{assignment?.course?.courseCode}</span>
            <h2 className="text-2xl font-extrabold text-gray-900">{assignment?.title}</h2>
            <p className="text-sm font-medium text-gray-500 mt-1">Due: {assignment ? new Date(assignment.dueDate).toLocaleDateString() : 'N/A'} • {submissions.length} Submitted</p>
          </div>
          <button className="bg-white border border-gray-200 text-gray-700 px-5 py-3 rounded-2xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2">
            <Download size={18} /> Download All Submissions
          </button>
        </div>

        <div className="bg-white rounded-[2rem] border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden">
          <div className="p-4 md:p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div className="relative w-full max-w-sm">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input type="text" placeholder="Search student name..." className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 shadow-sm transition-all" />
            </div>
            <button className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-600 shadow-sm hover:bg-gray-50">
              <Filter size={18} />
            </button>
          </div>

          <div className="overflow-y-auto flex-1">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-white border-b border-gray-100 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-4 sticky top-0 bg-white shadow-[0_1px_0_#f3f4f6] z-10">Student</th>
                  <th className="px-6 py-4 sticky top-0 bg-white shadow-[0_1px_0_#f3f4f6] z-10">Status</th>
                  <th className="px-6 py-4 sticky top-0 bg-white shadow-[0_1px_0_#f3f4f6] z-10">Submitted</th>
                  <th className="px-6 py-4 sticky top-0 bg-white shadow-[0_1px_0_#f3f4f6] z-10">Grade</th>
                  <th className="px-6 py-4 sticky top-0 bg-white shadow-[0_1px_0_#f3f4f6] z-10 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {submissions.map((sub) => (
                  <tr 
                    key={sub._id} 
                    className={`transition-colors cursor-pointer ${selectedStudent?._id === sub._id ? 'bg-[#F0FDF4]' : 'hover:bg-gray-50/50'}`}
                    onClick={() => { setSelectedStudent(sub); setGrade(sub.grade?.toString() || ""); setFeedback(sub.feedback || ""); }}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-[#0F5A37] text-white flex items-center justify-center font-bold text-xs">
                          {sub.student.name.charAt(0)}
                        </div>
                        <span className="text-sm font-bold text-gray-900">{sub.student.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider ${
                        sub.status === 'Graded' ? 'bg-emerald-100 text-emerald-700' :
                        'bg-amber-100 text-amber-700'
                      }`}>
                        {sub.status || 'Submitted'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-500">
                      {new Date(sub.submittedAt).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {sub.grade !== undefined && sub.grade !== null ? `${sub.grade}/${assignment?.maxScore || 100}` : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                       <button className="text-[#0F5A37] text-sm font-bold hover:underline">Grade</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Grading Sidebar */}
      {selectedStudent && (
        <div className="w-full xl:w-96 bg-white border-l border-gray-100 xl:border xl:rounded-[2.5rem] shadow-xl xl:shadow-sm flex flex-col shrink-0 animate-in slide-in-from-right-4 duration-300 xl:h-[calc(100vh-8rem)]">
          
          <div className="p-6 border-b border-gray-100 flex items-center justify-between">
            <h3 className="font-extrabold text-gray-900 text-lg">Grading Panel</h3>
            <button onClick={() => setSelectedStudent(null)} className="text-gray-400 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
            </button>
          </div>

          <div className="p-6 overflow-y-auto flex-1 flex flex-col gap-6">
            
            <div className="flex items-center gap-4 mb-2">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#0F5A37] to-[#1B8354] text-white flex items-center justify-center font-bold text-lg shadow-md shadow-[#0F5A37]/20">
                {selectedStudent.student.name.charAt(0)}
              </div>
              <div>
                <h4 className="text-base font-bold text-gray-900">{selectedStudent.student.name}</h4>
                <p className="text-xs font-medium text-gray-500 flex items-center gap-1"><Clock size={12}/> Submitted {new Date(selectedStudent.createdAt).toLocaleString()}</p>
              </div>
            </div>

            <div className="bg-gray-50 rounded-2xl p-4 border border-gray-200">
              <h5 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Submitted File</h5>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-red-100 text-red-600 rounded-lg flex items-center justify-center"><Download size={16}/></div>
                  <span className="text-sm font-semibold text-gray-900 truncate max-w-[150px]">Submission File</span>
                </div>
                <a href={selectedStudent.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs font-bold text-[#0F5A37] hover:underline">View</a>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Assign Grade</label>
              <input 
                type="number" 
                max={assignment?.maxScore || 100}
                placeholder={`Max: ${assignment?.maxScore || 100}`}
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full bg-white border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none shadow-sm"
              />
            </div>

            <div className="flex-1 flex flex-col">
              <label className="block text-sm font-bold text-gray-700 mb-2 flex items-center gap-2">
                <MessageSquare size={16} className="text-gray-400" /> Private Feedback
              </label>
              <textarea 
                placeholder="Great job on the 3NF normalizations, but watch out for..." 
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                className="w-full flex-1 min-h-[150px] bg-white border border-gray-200 text-gray-900 text-sm font-medium rounded-2xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none resize-none shadow-sm"
              />
            </div>

          </div>

          <div className="p-6 border-t border-gray-100 bg-gray-50/50">
            <button 
              onClick={handleSaveFeedback}
              className="w-full bg-[#0F5A37] text-white py-4 rounded-2xl text-sm font-bold shadow-md shadow-[#0F5A37]/20 hover:-translate-y-0.5 transition-transform flex items-center justify-center gap-2"
            >
              <CheckCircle2 size={18} /> Save & Return
            </button>
          </div>
          
        </div>
      )}

    </main>
  );
}
