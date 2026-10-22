"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, FileText, Upload, Plus, Calendar, Users, FileUp, Settings, HelpCircle, Copy, Trash2 
} from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/api";

export default function LecturerCourseDetail({ params }: { params: Promise<{ courseId: string }> }) {
  const unwrappedParams = use(params);
  const courseId = unwrappedParams.courseId;
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"overview" | "materials" | "assignments" | "quizzes">("overview");
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [uploadingMaterial, setUploadingMaterial] = useState(false);
  const [materials, setMaterials] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<any[]>([]);
  const [materialTitle, setMaterialTitle] = useState("");
  const [materialToDelete, setMaterialToDelete] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        if (res.data.success) {
          setCourse(res.data.data);
          setMaterials(res.data.data.materials || []);
        }

        const assignRes = await api.get(`/assignments/course/${courseId}`);
        if (assignRes.data.success) {
          setAssignments(assignRes.data.data);
        }
      } catch (err) {
        console.error("Failed to fetch course details", err);
        toast.error("Failed to load course details");
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return (
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center bg-gray-50/50">
        <p className="text-gray-500 font-bold">Loading course details...</p>
      </main>
    );
  }

  if (!course) {
    return (
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center bg-gray-50/50">
        <p className="text-gray-500 font-bold">Course not found.</p>
      </main>
    );
  }

  const handleCopyJoinLink = () => {
    if (course?.joinCode) {
      const inviteLink = `${window.location.origin}/join/${course.joinCode}`;
      navigator.clipboard.writeText(inviteLink);
      toast.success("Invite link copied to clipboard!");
    }
  };

  const handleCopyJoinCode = () => {
    if (course?.joinCode) {
      navigator.clipboard.writeText(course.joinCode);
      toast.success("Join code copied to clipboard!");
    }
  };

  const confirmDeleteMaterial = (materialId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setMaterialToDelete(materialId);
  };

  const executeDeleteMaterial = async () => {
    if (!materialToDelete) return;

    const toastId = toast.loading("Deleting material...");
    try {
      const res = await api.delete(`/courses/${courseId}/materials/${materialToDelete}`);
      if (res.data.success) {
        setMaterials(res.data.data.materials);
        toast.success("Material deleted successfully", { id: toastId });
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete material", { id: toastId });
    } finally {
      setMaterialToDelete(null);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!materialTitle.trim()) {
      toast.error("Please enter a name for the PDF first");
      e.target.value = '';
      return;
    }

    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploadingMaterial(true);
    const toastId = toast.loading("Uploading PDF...");

    try {
      // 1. Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: "POST",
        body: formData,
      });

      const cloudinaryData = await cloudinaryRes.json();
      
      if (!cloudinaryData.secure_url) {
        throw new Error("Cloudinary upload failed");
      }

      // 2. Save to backend
      const res = await api.post(`/courses/${courseId}/materials`, {
        title: materialTitle.trim(),
        fileUrl: cloudinaryData.secure_url
      });

      if (res.data.success) {
        setMaterials(res.data.data.materials);
        toast.success("Material uploaded successfully!", { id: toastId });
      }
    } catch (error) {
      console.error("Upload error", error);
      toast.error("Failed to upload material.", { id: toastId });
    } finally {
      setUploadingMaterial(false);
      setMaterialTitle("");
      // Reset input
      e.target.value = '';
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto bg-gray-50/50">
      <div className="w-full max-w-7xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Back Button */}
        <button 
          onClick={() => router.push('/lecturer/courses')}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0F5A37] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Courses
        </button>

        {/* Hero Section */}
        <div 
          className="bg-[#0F5A37] rounded-[2.5rem] p-8 md:p-12 relative overflow-hidden shadow-xl mb-8"
          style={{
            backgroundImage: 'linear-gradient(to right, rgba(15, 90, 55, 0.95), rgba(27, 131, 84, 0.7)), url("/images/course_hero_bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        >
          <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl"></div>
          
          <div className="relative z-10">
            <span className="text-xs font-bold px-3 py-1 bg-white/10 text-white rounded-lg border border-white/20 mb-4 inline-block tracking-wider">
              {course.courseCode}
            </span>
            <h1 className="text-3xl md:text-5xl font-extrabold text-white mb-6 leading-tight max-w-2xl">
              {course.title}
            </h1>
            
            <div className="flex flex-wrap items-center gap-6">
              <div className="flex items-center gap-2 text-green-100 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Users size={18} />
                <span className="text-sm font-bold">{course.studentCount} Students Enrolled</span>
              </div>
              <div className="flex items-center gap-2 text-green-100 bg-black/10 px-4 py-2 rounded-xl backdrop-blur-sm border border-white/10">
                <Calendar size={18} />
                <span className="text-sm font-bold">
                  {course.schedule && course.schedule.length > 0 
                    ? `${course.schedule[0].dayOfWeek}, ${course.schedule[0].startTime}` 
                    : 'TBD'}
                </span>
              </div>
              <div className="flex items-center gap-3 bg-[#1B8354] p-1.5 rounded-xl backdrop-blur-sm shadow-md border border-white/20">
                <button 
                  onClick={handleCopyJoinCode}
                  className="flex items-center gap-2 text-white hover:bg-[#0F5A37] px-3 py-1.5 rounded-lg transition-all group"
                  title="Copy Join Code"
                >
                  <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">Code:</span>
                  <span className="text-base font-black tracking-widest">{course.joinCode}</span>
                  <Copy size={16} className="ml-1 opacity-70 group-hover:opacity-100" />
                </button>
                <div className="w-px h-6 bg-white/20"></div>
                <button 
                  onClick={handleCopyJoinLink}
                  className="flex items-center gap-2 text-white hover:bg-[#0F5A37] px-3 py-1.5 rounded-lg transition-all group"
                  title="Copy Invite Link"
                >
                  <span className="text-sm font-bold opacity-80 group-hover:opacity-100 transition-opacity">Copy Link</span>
                  <Copy size={16} className="ml-1 opacity-70 group-hover:opacity-100" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-gray-100 w-fit mb-8 overflow-x-auto max-w-full">
          {[
            { id: "overview", label: "Overview & Settings" },
            { id: "materials", label: "Lecture Materials (PDF)" },
            { id: "assignments", label: "Assignments" },
            { id: "quizzes", label: "Quizzes" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 whitespace-nowrap ${
                activeTab === tab.id 
                  ? "bg-[#0F5A37] text-white shadow-md shadow-[#0F5A37]/20" 
                  : "text-gray-500 hover:text-gray-900 hover:bg-gray-50"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content Area */}
        <div className="w-full">
          
          {/* MATERIALS TAB */}
          {activeTab === "materials" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-xl font-bold text-gray-900">Uploaded Materials</h3>
                  </div>
                  
                  <div className="space-y-4">
                    {materials.length > 0 ? (
                      materials.map((mat: any, idx: number) => (
                        <div key={idx} onClick={() => window.open(mat.fileUrl, '_blank')} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100 hover:border-[#0F5A37]/30 transition-colors cursor-pointer group">
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-xl flex items-center justify-center">
                              <FileText size={24} />
                            </div>
                            <div>
                              <h4 className="font-bold text-gray-900 text-sm group-hover:text-[#0F5A37] transition-colors">{mat.title}</h4>
                              <p className="text-xs font-medium text-gray-500 mt-0.5">
                                Uploaded {new Date(mat.uploadedAt).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <button 
                            onClick={(e) => confirmDeleteMaterial(mat._id, e)}
                            className="p-2 text-gray-400 hover:text-red-500 bg-white rounded-full shadow-sm opacity-0 group-hover:opacity-100 transition-all border border-gray-100 hover:border-red-100 hover:bg-red-50"
                            title="Delete Material"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm font-medium text-gray-500">No materials uploaded yet.</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-[2rem] p-8 border border-blue-100 shadow-sm text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-blue-500 shadow-sm mx-auto mb-6">
                    <FileUp size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Drop PDF Material</h3>
                  <p className="text-sm font-medium text-gray-500 mb-6">
                    Share slides, notes, and readings with your students.
                  </p>
                  <input 
                    type="text"
                    placeholder="Enter material title..."
                    value={materialTitle}
                    onChange={(e) => setMaterialTitle(e.target.value)}
                    className="w-full mb-4 px-4 py-3 rounded-xl border border-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white/60 font-bold text-gray-900 placeholder:text-gray-400 placeholder:font-medium"
                  />
                  <label className={`w-full bg-blue-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-blue-700 transition-colors flex items-center justify-center gap-2 cursor-pointer ${uploadingMaterial ? 'opacity-70 cursor-not-allowed' : ''}`}>
                    {uploadingMaterial ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Upload size={18} />
                    )}
                    {uploadingMaterial ? "Uploading..." : "Upload PDF"}
                    <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploadingMaterial} />
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* ASSIGNMENTS TAB */}
          {activeTab === "assignments" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <div className="flex items-center justify-between mb-8">
                <h3 className="text-2xl font-bold text-gray-900">Course Assignments</h3>
                <button 
                  onClick={() => router.push(`/lecturer/assignments/new?courseId=${courseId}`)}
                  className="bg-[#0F5A37] text-white px-5 py-3 rounded-2xl text-sm font-bold shadow-md shadow-[#0F5A37]/20 hover:-translate-y-0.5 transition-transform flex items-center gap-2"
                >
                  <Plus size={18} /> Create Assignment
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {assignments.length === 0 ? (
                  <div className="col-span-full bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm text-center">
                    <p className="text-gray-500 font-medium">No assignments created yet.</p>
                  </div>
                ) : (
                  assignments.map(assignment => {
                    const isPastDue = new Date(assignment.dueDate) < new Date();
                    return (
                      <div 
                        key={assignment._id}
                        onClick={() => router.push(`/lecturer/assignments/${assignment._id}`)}
                        className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm hover:shadow-lg transition-all cursor-pointer group flex flex-col"
                      >
                        <div className="flex items-start justify-between mb-6">
                          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isPastDue ? 'bg-red-50 text-red-600' : 'bg-amber-50 text-amber-600'}`}>
                            <FileText size={24} />
                          </div>
                          <span className={`${isPastDue ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'} px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider`}>
                            {isPastDue ? 'Closed' : 'Active'}
                          </span>
                        </div>
                        <h4 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-[#0F5A37] transition-colors">{assignment.title}</h4>
                        <p className="text-sm font-medium text-gray-500 mb-6 line-clamp-2 flex-grow">{assignment.description || "No description provided."}</p>
                        
                        <div className="flex flex-col gap-2 mb-4">
                          <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Due Date</div>
                          <div className="text-sm font-semibold text-gray-700">{new Date(assignment.dueDate).toLocaleString()}</div>
                        </div>

                        <div className="flex items-center justify-between border-t border-gray-50 pt-4 mt-auto">
                          <div className="text-sm">
                            <span className="font-bold text-gray-900">{assignment.submissionsCount || 0}</span> <span className="text-gray-500 font-medium">Submitted</span>
                          </div>
                          <span className="text-xs font-bold text-[#0F5A37]">View Submissions &rarr;</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === "quizzes" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-1 lg:grid-cols-3 gap-8">
               <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Active & Past Quizzes</h3>
                  <div className="p-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-2xl bg-gray-50">
                    <p className="text-sm font-bold">No quizzes created yet.</p>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-1">
                <div className="bg-gradient-to-br from-violet-50 to-fuchsia-50 rounded-[2rem] p-8 border border-violet-100 shadow-sm text-center">
                  <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center text-violet-500 shadow-sm mx-auto mb-6">
                    <HelpCircle size={32} />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">Create a Quiz</h3>
                  <p className="text-sm font-medium text-gray-500 mb-6">
                    Test student knowledge with multiple choice or short answer quizzes.
                  </p>
                  <button className="w-full bg-violet-600 text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-violet-700 transition-colors flex items-center justify-center gap-2">
                    <Plus size={18} /> Build Quiz
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
               <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-xl font-bold text-gray-900 mb-6">Course Analytics Snapshot</h3>
                  <p className="text-gray-500 font-medium mb-4">You can manage the core settings for {course.code} here, view quick analytics, or jump into materials.</p>
               </div>
            </div>
          )}

        </div>
      </div>

      {/* Custom Delete Confirmation Modal */}
      {materialToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-red-50 rounded-2xl flex items-center justify-center text-red-500 mx-auto mb-6">
              <Trash2 size={32} />
            </div>
            <h3 className="text-xl font-bold text-center text-gray-900 mb-2">Delete Material?</h3>
            <p className="text-sm text-center text-gray-500 mb-8 font-medium">
              This action cannot be undone. Are you sure you want to permanently delete this lecture note?
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setMaterialToDelete(null)}
                className="flex-1 py-3 rounded-xl font-bold text-gray-600 bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={executeDeleteMaterial}
                className="flex-1 py-3 rounded-xl font-bold text-white bg-red-500 hover:bg-red-600 shadow-md shadow-red-500/20 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
