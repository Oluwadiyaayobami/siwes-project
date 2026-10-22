"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, BookOpen, Clock, Users, Link as LinkIcon, 
  Save, Calendar, CheckCircle2, Copy 
} from "lucide-react";
import toast from "react-hot-toast";

import api from "@/utils/api";

export default function CreateCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Form State
  const [courseCode, setCourseCode] = useState("");
  const [courseTitle, setCourseTitle] = useState("");
  const [department, setDepartment] = useState("");
  const [description, setDescription] = useState("");
  
  // Schedule Strategy State
  const [scheduleStrategy, setScheduleStrategy] = useState<"manual" | "delegate">("manual");
  
  // Manual Schedule State
  const [scheduleDays, setScheduleDays] = useState([
    { dayOfWeek: "Monday", selected: false, startTime: "", endTime: "" },
    { dayOfWeek: "Tuesday", selected: false, startTime: "", endTime: "" },
    { dayOfWeek: "Wednesday", selected: false, startTime: "", endTime: "" },
    { dayOfWeek: "Thursday", selected: false, startTime: "", endTime: "" },
    { dayOfWeek: "Friday", selected: false, startTime: "", endTime: "" },
  ]);
  
  const handleCopyLink = () => {
    navigator.clipboard.writeText("https://presente.edu/delegate/schedule/req-xyz123");
    toast.success("Link copied to clipboard! Send this to the course rep.");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      let finalSchedule: any[] = [];
      if (scheduleStrategy === "manual") {
        finalSchedule = scheduleDays
          .filter(d => d.selected)
          .map(d => ({
            dayOfWeek: d.dayOfWeek,
            startTime: d.startTime,
            endTime: d.endTime
          }));

        if (finalSchedule.length === 0) {
          toast.error("Please select at least one day and set the times.");
          setLoading(false);
          return;
        }

        // Validate times
        const hasMissingTimes = finalSchedule.some(d => !d.startTime || !d.endTime);
        if (hasMissingTimes) {
          toast.error("Please provide both start and end times for all selected days.");
          setLoading(false);
          return;
        }
      }

      const res = await api.post('/courses/create', {
        courseCode,
        title: courseTitle,
        department,
        description,
        schedule: finalSchedule
      });
      if (res.data.success) {
        toast.success("Course successfully created!");
        router.push("/lecturer/courses");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to create course");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto bg-gray-50/50">
      <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Back Button */}
        <button 
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-[#0F5A37] transition-colors mb-6"
        >
          <ArrowLeft size={16} /> Back to Courses
        </button>

        <div className="mb-8">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Create New Course</h2>
          <p className="text-sm font-medium text-gray-500 mt-2">
            Set up a new module, define the schedule, and get ready for enrollment.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-8">
          
          {/* SECTION 1: Course Details */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <BookOpen size={20} className="text-[#0F5A37]" /> Course Details
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Course Code</label>
                <input 
                  type="text" 
                  placeholder="e.g. CS301" 
                  required
                  value={courseCode}
                  onChange={(e) => setCourseCode(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none" 
                />
              </div>
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Course Title</label>
                <input 
                  type="text" 
                  placeholder="e.g. Database Systems" 
                  required
                  value={courseTitle}
                  onChange={(e) => setCourseTitle(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Department / Faculty</label>
                <input 
                  type="text" 
                  placeholder="e.g. Computer Science" 
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none" 
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-bold text-gray-700 mb-2">Description / Syllabus Overview</label>
                <textarea 
                  rows={3}
                  placeholder="Brief description of what this course entails..." 
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-medium rounded-2xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none resize-none" 
                />
              </div>
            </div>
          </div>

          {/* SECTION 2: Schedule & Logistics */}
          <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
            <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2 border-b border-gray-100 pb-4">
              <Calendar size={20} className="text-[#0F5A37]" /> Class Schedule
            </h3>

            <p className="text-sm font-medium text-gray-500 mb-6">
              How would you like to set up the time and date for this course?
            </p>

            {/* Strategy Selector */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div 
                onClick={() => setScheduleStrategy("manual")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  scheduleStrategy === "manual" 
                    ? "border-[#0F5A37] bg-green-50/50" 
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2"><Clock size={18} className={scheduleStrategy === "manual" ? "text-[#0F5A37]" : "text-gray-400"} /> Set Manually</h4>
                  {scheduleStrategy === "manual" && <CheckCircle2 size={20} className="text-[#0F5A37]" />}
                </div>
                <p className="text-xs font-medium text-gray-500">I know the exact day and time for this class.</p>
              </div>

              <div 
                onClick={() => setScheduleStrategy("delegate")}
                className={`p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                  scheduleStrategy === "delegate" 
                    ? "border-blue-500 bg-blue-50/50" 
                    : "border-gray-100 hover:border-gray-200"
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-gray-900 flex items-center gap-2"><Users size={18} className={scheduleStrategy === "delegate" ? "text-blue-500" : "text-gray-400"} /> Delegate to Course Rep</h4>
                  {scheduleStrategy === "delegate" && <CheckCircle2 size={20} className="text-blue-500" />}
                </div>
                <p className="text-xs font-medium text-gray-500">Share a link with the course rep to finalize the timetable.</p>
              </div>
            </div>

            {/* Strategy Form Render */}
            <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
              {scheduleStrategy === "manual" ? (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
                  <p className="block text-xs font-bold text-gray-700 mb-4 uppercase tracking-wider">Select Days and Times</p>
                  <div className="space-y-4">
                    {scheduleDays.map((dayItem, index) => (
                      <div key={dayItem.dayOfWeek} className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                        <label className="flex items-center gap-3 cursor-pointer sm:w-32">
                          <input 
                            type="checkbox" 
                            checked={dayItem.selected}
                            onChange={(e) => {
                              const newDays = [...scheduleDays];
                              newDays[index].selected = e.target.checked;
                              setScheduleDays(newDays);
                            }}
                            className="w-5 h-5 text-[#0F5A37] border-gray-300 rounded focus:ring-[#0F5A37] cursor-pointer" 
                          />
                          <span className="font-bold text-gray-800 text-sm">{dayItem.dayOfWeek}</span>
                        </label>
                        
                        {dayItem.selected && (
                          <div className="flex items-center gap-3 flex-1">
                            <div className="flex-1">
                              <label className="sr-only">Start Time</label>
                              <input 
                                type="time" 
                                value={dayItem.startTime}
                                onChange={(e) => {
                                  const newDays = [...scheduleDays];
                                  newDays[index].startTime = e.target.value;
                                  setScheduleDays(newDays);
                                }}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-lg focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-2.5 outline-none" 
                              />
                            </div>
                            <span className="text-gray-400 font-bold text-sm">to</span>
                            <div className="flex-1">
                              <label className="sr-only">End Time</label>
                              <input 
                                type="time" 
                                value={dayItem.endTime}
                                onChange={(e) => {
                                  const newDays = [...scheduleDays];
                                  newDays[index].endTime = e.target.value;
                                  setScheduleDays(newDays);
                                }}
                                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-lg focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-2.5 outline-none" 
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 shrink-0">
                    <LinkIcon size={20} />
                  </div>
                  <div className="flex-1">
                    <h4 className="text-sm font-bold text-gray-900">Course Rep Delegation Link</h4>
                    <p className="text-xs font-medium text-gray-500 mt-1">Send this unique link to the course representative. They will be able to set the time and date without needing an account.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={handleCopyLink}
                    className="shrink-0 bg-white border border-gray-200 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold shadow-sm hover:bg-gray-50 transition-all flex items-center gap-2"
                  >
                    <Copy size={16} /> Copy Link
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-4 mt-4 mb-10">
            <button 
              type="button"
              onClick={() => router.back()}
              className="px-6 py-4 rounded-2xl text-sm font-bold text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={loading}
              className={`bg-gradient-to-r from-[#0F5A37] to-[#1B8354] text-white px-10 py-4 rounded-2xl text-base font-bold shadow-xl shadow-[#0F5A37]/30 hover:scale-[1.02] hover:shadow-2xl transition-all flex items-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
            >
              <Save size={20} /> {loading ? "Creating..." : "Create Course"}
            </button>
          </div>

        </form>

      </div>
    </main>
  );
}
