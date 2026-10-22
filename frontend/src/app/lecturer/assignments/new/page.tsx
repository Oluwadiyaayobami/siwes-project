"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Upload, FileText, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/api";
import { useAuth } from "@/context/AuthContext";

function CreateAssignmentContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultCourseId = searchParams.get("courseId");
  
  const { user } = useAuth();
  
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    courseId: defaultCourseId || "",
    dueDate: "",
    maxScore: "100",
  });
  
  const [fileUrl, setFileUrl] = useState("");
  const [fileName, setFileName] = useState("");

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses/lecturer");
        if (res.data.success) {
          setCourses(res.data.data);
          if (res.data.data.length > 0 && !defaultCourseId) {
            setFormData(prev => ({ ...prev, courseId: res.data.data[0]._id }));
          }
        }
      } catch (error) {
        console.error(error);
        toast.error("Failed to load your courses");
      }
    };
    fetchCourses();
  }, []);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Please upload a PDF file");
      return;
    }

    setUploading(true);
    const toastId = toast.loading("Uploading PDF...");

    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "");

      const cloudinaryRes = await fetch(`https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`, {
        method: "POST",
        body: fd,
      });

      const data = await cloudinaryRes.json();
      if (!data.secure_url) throw new Error("Upload failed");

      setFileUrl(data.secure_url);
      setFileName(file.name);
      toast.success("Attachment uploaded!", { id: toastId });
    } catch (error) {
      console.error(error);
      toast.error("Failed to upload attachment", { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.courseId || !formData.dueDate) {
      toast.error("Please fill in all required fields.");
      return;
    }

    if (new Date(formData.dueDate) < new Date()) {
      toast.error("Due date cannot be in the past.");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/assignments", {
        title: formData.title,
        description: formData.description,
        course: formData.courseId,
        lecturer: user?.id,
        dueDate: formData.dueDate,
        maxScore: Number(formData.maxScore),
        fileUrl: fileUrl || undefined,
      });

      if (res.data.success) {
        toast.success("Assignment created successfully!");
        router.push(`/lecturer/course/${formData.courseId}`);
      }
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || "Failed to create assignment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto bg-gray-50/50">
      <div className="w-full max-w-3xl animate-in fade-in zoom-in-95 duration-300">
        
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0F5A37] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-gray-900 mb-2">Create New Assignment</h1>
          <p className="text-gray-500 font-medium mb-8">Set up a new task, project, or exercise for your students.</p>
          
          <form onSubmit={handleSubmit} className="space-y-6">
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Select Course *</label>
                <select 
                  value={formData.courseId}
                  onChange={(e) => setFormData({ ...formData, courseId: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 font-medium appearance-none"
                  required
                >
                  {courses.length === 0 && <option value="">Loading courses...</option>}
                  {courses.map(course => (
                    <option key={course._id} value={course._id}>{course.courseCode} - {course.title}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Due Date *</label>
                <input 
                  type="datetime-local" 
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  min={new Date().toISOString().slice(0, 16)}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 font-medium"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Assignment Title *</label>
                <input 
                  type="text" 
                  placeholder="e.g. Chapter 3 Normalization Exercises"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 font-medium"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Max Score *</label>
                <input 
                  type="number" 
                  min="1"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: e.target.value })}
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 font-medium"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Instructions / Description</label>
              <textarea 
                placeholder="Describe what the students need to do..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 font-medium min-h-[150px] resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Attachment (PDF)</label>
              <div className="border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center bg-gray-50/50 hover:bg-gray-50 transition-colors">
                {fileUrl ? (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-4">
                      <CheckCircle2 size={32} />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">{fileName}</p>
                    <p className="text-xs text-gray-500 font-medium mb-4">Ready to be attached.</p>
                    <button 
                      type="button"
                      onClick={() => { setFileUrl(""); setFileName(""); }}
                      className="text-red-500 text-sm font-bold hover:underline"
                    >
                      Remove Attachment
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-4">
                      <FileText size={32} />
                    </div>
                    <p className="font-bold text-gray-900 mb-1">Attach a PDF Document</p>
                    <p className="text-xs text-gray-500 font-medium mb-6">Optional supporting material for the assignment.</p>
                    
                    <label className={`bg-white border border-gray-200 text-gray-700 px-6 py-2.5 rounded-full font-bold text-sm shadow-sm hover:bg-gray-50 transition-colors cursor-pointer flex items-center gap-2 ${uploading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                      {uploading ? (
                        <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <Upload size={16} />
                      )}
                      {uploading ? "Uploading..." : "Browse Files"}
                      <input type="file" accept="application/pdf" className="hidden" onChange={handleFileUpload} disabled={uploading} />
                    </label>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
              <button 
                type="button"
                onClick={() => router.back()}
                className="px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={loading || uploading}
                className="bg-[#0F5A37] text-white px-8 py-3 rounded-xl font-bold shadow-md shadow-[#0F5A37]/20 hover:bg-[#1B8354] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>}
                Create Assignment
              </button>
            </div>

          </form>
        </div>
      </div>
    </main>
  );
}

export default function CreateAssignment() {
  return (
    <Suspense fallback={
      <main className="flex-1 p-4 md:p-8 flex items-center justify-center bg-gray-50/50">
        <p className="text-gray-500 font-bold">Loading...</p>
      </main>
    }>
      <CreateAssignmentContent />
    </Suspense>
  );
}
