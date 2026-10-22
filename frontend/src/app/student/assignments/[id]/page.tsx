"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ChevronLeft, FileText, CheckCircle, Clock, AlertCircle, 
  UploadCloud, Download, MessageSquare, Paperclip, 
  Calendar
} from "lucide-react";
import api from "@/utils/api";
import toast from "react-hot-toast";
import { useAuth } from "@/context/AuthContext";

export default function AssignmentDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const unwrappedParams = use(params);
  const assignmentId = unwrappedParams.id;
  
  const [assignment, setAssignment] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAssignment = async () => {
      try {
        const res = await api.get(`/assignments/${assignmentId}`);
        if (res.data.success) {
          setAssignment(res.data.data);
        }
      } catch (err) {
        console.error("Failed to load assignment", err);
        toast.error("Failed to load assignment");
      } finally {
        setLoading(false);
      }
    };
    fetchAssignment();
  }, [assignmentId]);

  const submission = assignment?.submission;
  const status = !submission ? 'pending' : submission.status === 'Graded' ? 'graded' : 'submitted';

  // State for drag & drop file upload
  const [isDragging, setIsDragging] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { user } = useAuth();

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setUploadedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  const handleSubmitAssignment = async () => {
    if (!uploadedFile) return;

    setIsUploading(true);
    const toastId = toast.loading("Uploading submission...");

    try {
      const fd = new FormData();
      fd.append("file", uploadedFile);
      fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await cloudinaryRes.json();
      if (!data.secure_url) throw new Error("Upload failed");

      const res = await api.post(`/assignments/${assignmentId}/submit`, {
        fileUrl: data.secure_url,
        student: user?.id,
      });

      if (res.data.success) {
        toast.success("Assignment submitted successfully!", { id: toastId });
        setAssignment((prev: any) => ({
          ...prev,
          submission: res.data.data
        }));
        setUploadedFile(null);
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to submit assignment", { id: toastId });
    } finally {
      setIsUploading(false);
    }
  };

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-y-auto">
        <p className="font-bold text-gray-500">Loading assignment...</p>
      </main>
    );
  }

  if (!assignment) {
    return (
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center overflow-y-auto">
        <p className="font-bold text-gray-500">Assignment not found.</p>
      </main>
    );
  }

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-6xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Breadcrumb & Navigation */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0F5A37] transition-colors mb-6"
        >
          <ChevronLeft size={16} /> Back to Assignments
        </button>

        {/* Header Hero */}
        <div className="bg-white rounded-[2rem] p-8 md:p-10 shadow-sm border border-gray-50 mb-8 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
          
          {/* Decorative shapes */}
          <div className="absolute -right-20 -top-20 w-64 h-64 bg-[#E8F3ED] rounded-full blur-3xl opacity-50 pointer-events-none"></div>

          <div className="relative z-10">
            <span className="inline-block px-3 py-1 bg-gray-100 text-gray-600 text-xs font-bold rounded-lg mb-4">
              {assignment.course?.courseCode || "Course"}
            </span>
            <h1 className="text-3xl font-extrabold text-gray-900 mb-2">{assignment.title}</h1>
            <p className="text-sm font-semibold text-gray-500 flex items-center gap-2">
              <Calendar size={14} /> Due: {new Date(assignment.dueDate).toLocaleDateString()}
            </p>
          </div>

          <div className="relative z-10 shrink-0">
            {status === 'graded' && (
              <div className="flex flex-col items-end">
                <span className="px-4 py-2 rounded-full bg-[#E6F4EA] text-green-700 text-sm font-bold flex items-center gap-2 border border-green-100">
                  <CheckCircle size={16} /> Graded
                </span>
                <div className="mt-3 text-right">
                  <span className="text-3xl font-extrabold text-[#0F5A37]">{submission.grade || 0}</span>
                  <span className="text-sm font-bold text-gray-400">/{assignment.maxScore || 100}</span>
                </div>
              </div>
            )}
            {status === 'submitted' && (
              <span className="px-4 py-2 rounded-full bg-blue-50 text-blue-600 text-sm font-bold flex items-center gap-2 border border-blue-100">
                <CheckCircle size={16} /> Submitted
              </span>
            )}
            {status === 'pending' && (
              <span className="px-4 py-2 rounded-full bg-amber-50 text-amber-600 text-sm font-bold flex items-center gap-2 border border-amber-100">
                <Clock size={16} /> Pending Submission
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          
          {/* LEFT: Submission Area & Feedback */}
          <div className="xl:col-span-2 flex flex-col gap-8">
            
            {/* Lecturer Feedback (Only if Graded) */}
            {status === 'graded' && submission?.feedback && (
              <div className="bg-[#F8F9FE] rounded-[2rem] p-8 border border-indigo-50 relative">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-indigo-100 flex items-center justify-center shrink-0">
                    <MessageSquare size={20} className="text-indigo-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg mb-1">Lecturer Feedback</h3>
                    <p className="text-xs font-semibold text-indigo-400 mb-4">Lecturer</p>
                    <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-50 text-sm text-gray-700 leading-relaxed font-medium">
                      {submission.feedback}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Submission Form / Area */}
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Submission</h3>

              {/* Already submitted file view */}
              {(status === 'graded' || status === 'submitted') && submission?.fileUrl && (
                <div className="mb-8">
                  <p className="text-sm font-semibold text-gray-500 mb-3">Submitted File</p>
                  <div className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm text-red-500">
                        <FileText size={20} />
                      </div>
                      <div>
                        <a href={submission.fileUrl} target="_blank" rel="noopener noreferrer" className="font-bold text-blue-600 hover:underline text-sm truncate block max-w-[200px] sm:max-w-xs">View File</a>
                        <p className="text-[10px] font-semibold text-gray-400">Submitted on {new Date(submission.submittedAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button className="p-2 text-gray-400 hover:text-blue-600 bg-white rounded-full shadow-sm transition-colors">
                      <Download size={16} />
                    </button>
                  </div>
                </div>
              )}

              {/* Editable Area for Submitted (but not graded) or Pending */}
              {status !== 'graded' && (
                <div>
                  {status === 'submitted' && (
                    <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 mb-6 flex items-start gap-3">
                      <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
                      <div>
                        <h4 className="text-xs font-bold text-amber-800">Need to make changes?</h4>
                        <p className="text-[11px] font-medium text-amber-700 mt-1">
                          The deadline hasn't closed yet. You can upload a new file below to overwrite your previous submission.
                        </p>
                      </div>
                    </div>
                  )}

                  {/* Drag and Drop Zone */}
                  <div 
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                    className={`
                      relative w-full border-2 border-dashed rounded-[2rem] p-10 flex flex-col items-center justify-center text-center transition-all cursor-pointer
                      ${isDragging ? 'border-[#0F5A37] bg-[#F8FCF9]' : 'border-gray-200 bg-gray-50 hover:bg-gray-100 hover:border-gray-300'}
                      ${uploadedFile ? 'bg-[#F8FCF9] border-[#0F5A37]' : ''}
                    `}
                  >
                    <div className={`w-16 h-16 rounded-full flex items-center justify-center mb-4 transition-colors ${uploadedFile ? 'bg-green-100 text-[#0F5A37]' : 'bg-white text-gray-400 shadow-sm'}`}>
                      {uploadedFile ? <CheckCircle size={28} /> : <UploadCloud size={28} />}
                    </div>
                    
                    {uploadedFile ? (
                      <>
                        <p className="font-bold text-gray-900 text-base">{uploadedFile.name}</p>
                        <p className="text-xs font-semibold text-gray-500 mt-1">{(uploadedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                        <button 
                          onClick={(e) => { e.stopPropagation(); setUploadedFile(null); }}
                          className="mt-4 text-xs font-bold text-red-500 hover:underline"
                        >
                          Remove file
                        </button>
                      </>
                    ) : (
                      <>
                        <h4 className="font-bold text-gray-900 text-base mb-1">Click to upload or drag and drop</h4>
                        <p className="text-xs font-medium text-gray-500">PDF, ZIP, DOCX, or Images (Max 20MB)</p>
                        <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onChange={handleFileSelect} />
                      </>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end gap-4 mt-8">
                    <button 
                      onClick={() => setUploadedFile(null)}
                      className="px-6 py-3 rounded-full text-sm font-bold text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSubmitAssignment}
                      disabled={!uploadedFile || isUploading}
                      className={`px-8 py-3 rounded-full text-sm font-bold shadow-md transition-transform active:scale-95 flex items-center gap-2 ${
                        uploadedFile && !isUploading
                          ? 'bg-[#0F5A37] text-white hover:bg-[#1B8354]' 
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isUploading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                      {status === 'submitted' ? 'Update Submission' : 'Turn In Assignment'}
                    </button>
                  </div>

                </div>
              )}

            </div>
          </div>

          {/* RIGHT: Details & Resources */}
          <div className="xl:col-span-1">
            <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-gray-50 sticky top-8">
              
              <h3 className="text-lg font-bold text-gray-900 mb-6">Assignment Info</h3>

              <div className="space-y-6 mb-8">
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Lecturer</p>
                  <p className="text-sm font-bold text-gray-900">{assignment.lecturer?.name || "Lecturer"}</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-1 uppercase tracking-wider">Max Score</p>
                  <p className="text-sm font-bold text-gray-900">{assignment.maxScore || 100} Points</p>
                </div>
                <div>
                  <p className="text-xs font-bold text-gray-400 mb-2 uppercase tracking-wider">Instructions</p>
                  <p className="text-sm font-medium text-gray-600 leading-relaxed whitespace-pre-wrap">
                    {assignment.description}
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-100 pt-6">
                <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <Paperclip size={16} className="text-gray-400" /> Reference Materials
                </h4>
                
                <div className="space-y-3">
                  {assignment.fileUrl ? (
                    <div 
                      onClick={() => window.open(assignment.fileUrl, '_blank')}
                      className="flex items-center justify-between bg-gray-50 p-3 rounded-xl hover:bg-gray-100 cursor-pointer transition-colors group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="text-red-400"><FileText size={16} /></div>
                        <span className="text-xs font-bold text-gray-700 group-hover:text-[#0F5A37] transition-colors truncate max-w-[150px]">
                          Assignment Attachment
                        </span>
                      </div>
                      <Download size={14} className="text-gray-400" />
                    </div>
                  ) : (
                    <p className="text-xs text-gray-500 font-medium">No reference materials provided.</p>
                  )}
                </div>

              </div>

            </div>
          </div>

        </div>
      </div>
    </main>
  );
}
