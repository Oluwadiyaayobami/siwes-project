"use client";

import { useEffect, useState, use } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { Loader2, CheckCircle, XCircle, Users, BookOpen, Clock, ArrowRight, BookMarked, CalendarDays, KeyRound } from "lucide-react";
import Link from "next/link";

export default function JoinCoursePremiumPage({ params }: { params: Promise<{ joinCode: string }> }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const unwrappedParams = use(params);
  const joinCode = unwrappedParams.joinCode;

  const [status, setStatus] = useState<"loading_info" | "ready" | "joining" | "success" | "error">("loading_info");
  const [message, setMessage] = useState("Fetching course details...");
  const [courseInfo, setCourseInfo] = useState<any>(null);

  useEffect(() => {
    if (loading) return;

    if (!user) {
      router.push(`/login?redirect=/join/${joinCode}`);
      return;
    }

    const fetchCourseInfo = async () => {
      try {
        const res = await api.get(`/courses/join/${joinCode}/info`);
        if (res.data.success) {
          setCourseInfo(res.data.data);
          setStatus("ready");
        }
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Invalid join code or course not found.");
      }
    };

    fetchCourseInfo();
  }, [user, loading, joinCode, router]);

  const handleJoinCourse = async () => {
    if (user?.role !== "student") {
      setStatus("error");
      setMessage("Only students can enroll in a course.");
      return;
    }

    setStatus("joining");
    try {
      await api.post("/courses/enroll", { joinCode: joinCode.toUpperCase() });
      setStatus("success");
      setMessage("You have successfully joined the course!");
      
      setTimeout(() => {
        router.push("/student");
      }, 2000);
    } catch (err: any) {
      setStatus("error");
      setMessage(err.response?.data?.message || "Failed to join course.");
    }
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4 sm:p-8 relative"
      style={{
        backgroundImage: 'url("/images/course_hero_bg.jpg")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      <div className="absolute inset-0 bg-black/50 backdrop-blur-md"></div>
      
      <div className="w-full max-w-5xl bg-white/95 backdrop-blur-xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-[600px] animate-in fade-in zoom-in-95 duration-500 border border-white/30 relative z-10">
        
        {/* Left Side: Visual/Branding (Hidden on very small screens) */}
        <div 
          className="hidden md:flex md:w-5/12 relative flex-col justify-between p-12 overflow-hidden"
          style={{
            backgroundImage: 'url("/images/course_hero_bg.jpg")',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-[#0F5A37]/80 backdrop-blur-[2px]"></div>
          
          {/* Abstract patterns (optional, keeps the glow) */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-green-400 opacity-20 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center text-white mb-8 backdrop-blur-sm border border-white/20 shadow-xl">
              <BookMarked size={32} />
            </div>
            <h1 className="text-4xl font-black text-white leading-tight tracking-tight">
              Unlock Your <br />
              <span className="text-green-300">Potential.</span>
            </h1>
          </div>

          <div className="relative z-10">
            <p className="text-green-100 font-medium opacity-80 text-sm">
              Secure enrollment gateway. Please verify the course details before accepting the invitation.
            </p>
          </div>
        </div>

        {/* Right Side: Interaction Panel */}
        <div className="flex-1 p-8 md:p-12 flex flex-col justify-center bg-transparent relative">
          
          {/* Top Cancel Button */}
          <Link 
            href={user?.role === "student" ? "/student" : "/lecturer"}
            className="absolute top-8 right-8 text-sm font-bold text-gray-400 hover:text-gray-900 transition-colors"
          >
            Cancel
          </Link>

          {/* Loading State */}
          {status === "loading_info" && (
            <div className="flex flex-col items-center justify-center h-full animate-pulse">
              <div className="w-16 h-16 border-4 border-[#0F5A37] border-t-transparent rounded-full animate-spin mb-6"></div>
              <h2 className="text-2xl font-bold text-gray-900">Locating Course</h2>
              <p className="text-gray-500 mt-2">Checking invitation link...</p>
            </div>
          )}

          {/* Ready State */}
          {status === "ready" && courseInfo && (
            <div className="animate-in slide-in-from-right-8 duration-500 max-w-md w-full mx-auto">
              
              <div className="mb-10">
                <p className="text-[#0F5A37] font-bold text-sm tracking-widest uppercase mb-3 flex items-center gap-2">
                  <KeyRound size={16} /> Invitation Details
                </p>
                <h2 className="text-3xl font-black text-gray-900 tracking-tight leading-tight mb-2">
                  {courseInfo.title}
                </h2>
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-gray-100 rounded-lg border border-gray-200">
                  <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Code:</span>
                  <span className="text-sm font-black text-gray-900 tracking-widest">{courseInfo.courseCode}</span>
                </div>
              </div>

              <div className="space-y-6 mb-12">
                {/* Lecturer Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E8F3ED] text-[#0F5A37] flex items-center justify-center shrink-0">
                    <Users size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Course Lecturer</p>
                    <p className="text-base font-bold text-gray-900">{courseInfo.lecturer?.name || "Unknown"}</p>
                  </div>
                </div>

                <div className="h-px w-full bg-gray-100"></div>

                {/* Schedule Info */}
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-full bg-[#E8F3ED] text-[#0F5A37] flex items-center justify-center shrink-0">
                    <CalendarDays size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Class Schedule</p>
                    {courseInfo.schedule && courseInfo.schedule.length > 0 ? (
                      <div className="space-y-2">
                        {courseInfo.schedule.map((slot: any, idx: number) => (
                          <div key={idx} className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-[#0F5A37]"></span>
                            <p className="text-sm font-bold text-gray-900">
                              {slot.dayOfWeek}, {slot.startTime} - {slot.endTime}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm font-bold text-gray-900">Schedule to be determined</p>
                    )}
                  </div>
                </div>
              </div>
              
              {user?.role === "student" ? (
                <button 
                  onClick={handleJoinCourse}
                  className="w-full group flex items-center justify-between bg-[#0F5A37] text-white py-4 px-6 rounded-2xl text-lg font-bold shadow-lg shadow-[#0F5A37]/20 hover:bg-[#1B8354] hover:shadow-xl transition-all active:scale-[0.98]"
                >
                  <span>Accept Invitation</span>
                  <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center group-hover:bg-white group-hover:text-[#0F5A37] transition-colors">
                    <ArrowRight size={18} />
                  </div>
                </button>
              ) : (
                <div className="w-full bg-gray-50 text-gray-400 border-2 border-dashed border-gray-200 py-4 rounded-2xl text-sm text-center font-bold">
                  Preview Mode (Lecturers cannot join)
                </div>
              )}
            </div>
          )}

          {/* Joining State */}
          {status === "joining" && (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-300">
              <Loader2 size={56} className="text-[#0F5A37] animate-spin mb-6" />
              <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">Enrolling...</h2>
              <p className="text-gray-500 font-medium">Securing your spot in the class.</p>
            </div>
          )}

          {/* Success State */}
          {status === "success" && (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-500 text-center">
              <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-6">
                <CheckCircle size={48} className="text-green-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">You're In!</h2>
              <p className="text-gray-500 font-medium mb-10 max-w-xs mx-auto">{message}</p>
              
              <div className="w-full max-w-xs bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-green-500 h-full rounded-full animate-[progress_2s_ease-in-out_forwards]"></div>
              </div>
              <p className="text-xs font-bold text-gray-400 mt-4 uppercase tracking-wider">Redirecting</p>
            </div>
          )}

          {/* Error State */}
          {status === "error" && (
            <div className="flex flex-col items-center justify-center h-full animate-in zoom-in duration-500 text-center">
              <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-6">
                <XCircle size={48} className="text-red-500" />
              </div>
              <h2 className="text-3xl font-black text-gray-900 tracking-tight mb-3">Oops!</h2>
              <p className="text-gray-500 font-medium mb-10 max-w-xs mx-auto">{message}</p>
              
              <Link 
                href={user?.role === "student" ? "/student" : "/"}
                className="w-full max-w-xs flex justify-center items-center bg-gray-900 hover:bg-gray-800 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg"
              >
                Return to Dashboard
              </Link>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
