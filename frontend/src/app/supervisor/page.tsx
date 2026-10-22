"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import api from "@/utils/api";
import { QRCodeSVG } from "qrcode.react";
import { LogOut, Users, CheckCircle, XCircle, RefreshCw, LayoutDashboard, BookOpen, Plus, Copy, Clock, CalendarDays } from "lucide-react";
import toast from "react-hot-toast";

interface AttendanceRecord {
  _id: string;
  student: { _id: string; name: string; matricNo?: string };
  venue: { name: string };
  status: string;
  createdAt: string;
}

interface Stats {
  recentActivity: AttendanceRecord[];
  summary: { present: number; total: number; outOfBounds: number };
}

interface Course {
  _id: string;
  title: string;
  courseCode: string;
  joinCode: string;
  studentCount: number;
  schedule: { dayOfWeek: string; startTime: string; endTime: string }[];
}

export default function SupervisorDashboard() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  
  const [activeTab, setActiveTab] = useState<"attendance" | "subjects">("attendance");
  
  // Attendance State
  const [qrToken, setQrToken] = useState("");
  const [venueName, setVenueName] = useState("");
  const [timeLeft, setTimeLeft] = useState(30);
  const [stats, setStats] = useState<Stats | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Courses State
  const [courses, setCourses] = useState<Course[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newCourse, setNewCourse] = useState({ title: "", courseCode: "", dayOfWeek: "Monday", startTime: "09:00", endTime: "11:00" });

  // Auth guard
  useEffect(() => {
    if (!loading && (!user || (user.role !== "supervisor" && user.role !== "admin"))) {
      router.push("/login");
    }
  }, [user, loading, router]);

  // Fetch Methods
  const fetchQRToken = useCallback(async () => {
    try {
      const res = await api.get("/supervisor/generate-qr");
      setQrToken(res.data.data.qrToken);
      setVenueName(res.data.data.venueName);
      setTimeLeft(res.data.data.expiresIn);
    } catch (error) {
      console.error("Failed to fetch QR token", error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setIsRefreshing(true);
    try {
      const res = await api.get("/supervisor/stats");
      setStats(res.data.data);
    } catch (error) {
      console.error("Failed to fetch stats", error);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  const fetchCourses = useCallback(async () => {
    try {
      const res = await api.get("/courses/lecturer");
      setCourses(res.data.data);
    } catch (error) {
      console.error("Failed to fetch courses", error);
    }
  }, []);

  // Initial Load
  useEffect(() => {
    if (user && (user.role === "supervisor" || user.role === "admin")) {
      fetchQRToken();
      fetchStats();
      fetchCourses();
    }
  }, [user, fetchQRToken, fetchStats, fetchCourses]);

  // QR Timer
  useEffect(() => {
    if (!qrToken || activeTab !== "attendance") return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          fetchQRToken(); return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [qrToken, fetchQRToken, activeTab]);

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        title: newCourse.title,
        courseCode: newCourse.courseCode,
        schedule: [{ dayOfWeek: newCourse.dayOfWeek, startTime: newCourse.startTime, endTime: newCourse.endTime }]
      };
      await api.post("/courses/create", payload);
      setIsModalOpen(false);
      setNewCourse({ title: "", courseCode: "", dayOfWeek: "Monday", startTime: "09:00", endTime: "11:00" });
      fetchCourses();
    } catch (error) {
      console.error("Failed to create course", error);
      toast.error("Failed to create course.");
    }
  };

  const copyInviteLink = (joinCode: string) => {
    const link = `${window.location.origin}/join/${joinCode}`;
    navigator.clipboard.writeText(link);
    toast.success(`Invite link copied!\n${link}`);
  };

  if (loading || !user) return <div className="text-center mt-20">Loading...</div>;

  return (
    <div className="max-w-6xl mx-auto h-full flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-xl flex items-center justify-center">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lecturer Portal</h1>
            <p className="text-gray-500">Welcome, {user.name}</p>
          </div>
        </div>
        <button 
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors font-medium"
        >
          <LogOut size={20} />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button 
          onClick={() => setActiveTab("attendance")}
          className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "attendance" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          Live Attendance
        </button>
        <button 
          onClick={() => setActiveTab("subjects")}
          className={`pb-3 px-2 font-medium text-sm transition-colors border-b-2 ${activeTab === "subjects" ? "border-indigo-600 text-indigo-600" : "border-transparent text-gray-500 hover:text-gray-700"}`}
        >
          My Subjects
        </button>
      </div>

      {activeTab === "attendance" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in">
          {/* Left Column: QR Code */}
          <div className="lg:col-span-1 flex flex-col gap-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center text-center">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Live Attendance QR</h2>
              <p className="text-sm text-gray-500 mb-6">{venueName || "Loading Venue..."}</p>
              
              <div className="bg-white p-4 rounded-2xl shadow-sm border-2 border-gray-100 mb-6 relative">
                {qrToken ? (
                  <QRCodeSVG value={qrToken} size={220} level="H" />
                ) : (
                  <div className="w-[220px] h-[220px] bg-gray-100 rounded flex items-center justify-center animate-pulse">
                    <span className="text-gray-400">Generating...</span>
                  </div>
                )}
              </div>
              
              <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
                <div 
                  className="bg-indigo-500 h-2 rounded-full transition-all duration-1000 ease-linear" 
                  style={{ width: `${(timeLeft / 30) * 100}%` }}
                ></div>
              </div>
              <p className="text-sm font-medium text-gray-600 flex items-center gap-1.5">
                <RefreshCw size={14} className={timeLeft < 5 ? "animate-spin text-red-500" : ""} />
                Refreshes in {timeLeft}s
              </p>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                <div className="text-gray-500 mb-2 flex items-center gap-2 text-sm font-medium">
                  <Users size={18} /> Total Present
                </div>
                <div className="text-3xl font-bold text-gray-900">{stats?.summary.present || 0}</div>
                <div className="text-xs text-gray-400 mt-2">out of {stats?.summary.total || 0} students</div>
              </div>
              <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex flex-col">
                 <div className="text-gray-500 mb-2 flex items-center gap-2 text-sm font-medium">
                  <XCircle size={18} /> Out of Bounds
                </div>
                <div className="text-3xl font-bold text-red-600">{stats?.summary.outOfBounds || 0}</div>
                 <div className="text-xs text-gray-400 mt-2">rejected attempts</div>
              </div>
            </div>
          </div>

          {/* Right Column: Attendance List */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                <p className="text-sm text-gray-500">Live feed of student check-ins</p>
              </div>
              <button 
                onClick={fetchStats}
                disabled={isRefreshing}
                className="p-2 bg-white text-gray-500 border border-gray-200 rounded-lg hover:text-indigo-600 hover:border-indigo-200 transition-colors disabled:opacity-50"
              >
                <RefreshCw size={18} className={isRefreshing ? "animate-spin" : ""} />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-0">
              {stats?.recentActivity && stats.recentActivity.length > 0 ? (
                <table className="w-full text-left border-collapse">
                  <thead className="bg-gray-50 border-b border-gray-100 sticky top-0">
                    <tr>
                      <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Student</th>
                      <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Time</th>
                      <th className="py-3 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {stats.recentActivity.map((record) => (
                      <tr key={record._id} className="hover:bg-gray-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="font-medium text-gray-900">{record.student.name}</div>
                          <div className="text-xs text-gray-500">{record.student.matricNo || "No Matric"}</div>
                        </td>
                        <td className="py-4 px-6 text-sm text-gray-600">
                          {new Date(record.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                        <td className="py-4 px-6">
                          {record.status === "PRESENT" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-50 text-green-700 border border-green-200">
                              <CheckCircle size={14} /> Present
                            </span>
                          ) : record.status === "REJECTED_OUT_OF_BOUNDS" ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-700 border border-red-200">
                              <XCircle size={14} /> Out of Bounds
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200">
                              <XCircle size={14} /> Expired QR
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="h-64 flex flex-col items-center justify-center text-gray-400">
                  <Users size={48} className="mb-4 opacity-20" />
                  <p>No attendance records for today yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {activeTab === "subjects" && (
        <div className="animate-in fade-in flex flex-col gap-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold text-gray-900">Manage Subjects</h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl transition-colors shadow-sm font-medium"
            >
              <Plus size={20} /> Create Subject
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.length === 0 ? (
              <div className="col-span-full py-12 text-center text-gray-500 bg-white rounded-2xl border border-gray-100 border-dashed">
                <BookOpen className="mx-auto mb-3 opacity-30" size={48} />
                <p>You haven't created any subjects yet.</p>
              </div>
            ) : (
              courses.map(course => (
                <div key={course._id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg">{course.title}</h3>
                      <p className="text-indigo-600 font-medium text-sm">{course.courseCode}</p>
                    </div>
                    <div className="bg-gray-100 text-gray-700 text-xs font-bold px-2 py-1 rounded-md tracking-wider">
                      {course.joinCode}
                    </div>
                  </div>
                  
                  <div className="space-y-3 mb-6 flex-1">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Users size={16} className="text-gray-400" />
                      {course.studentCount} student{course.studentCount !== 1 ? 's' : ''} enrolled
                    </div>
                    {course.schedule.map((slot, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-sm text-gray-600">
                        <CalendarDays size={16} className="text-gray-400" />
                        {slot.dayOfWeek}, {slot.startTime} - {slot.endTime}
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => copyInviteLink(course.joinCode)}
                    className="w-full flex justify-center items-center gap-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 px-4 py-2 rounded-xl transition-colors font-medium text-sm"
                  >
                    <Copy size={16} /> Copy Invite Link
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Create Subject Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">Create New Subject</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                <XCircle size={24} />
              </button>
            </div>
            <form onSubmit={handleCreateCourse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Subject Title</label>
                <input 
                  type="text" required value={newCourse.title} onChange={e => setNewCourse({...newCourse, title: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                  placeholder="e.g. Data Structures"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Course Code</label>
                <input 
                  type="text" required value={newCourse.courseCode} onChange={e => setNewCourse({...newCourse, courseCode: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all uppercase"
                  placeholder="e.g. CSC 301"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Start Time</label>
                  <input 
                    type="time" required value={newCourse.startTime} onChange={e => setNewCourse({...newCourse, startTime: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">End Time</label>
                  <input 
                    type="time" required value={newCourse.endTime} onChange={e => setNewCourse({...newCourse, endTime: e.target.value})}
                    className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Day of Week</label>
                <select 
                  value={newCourse.dayOfWeek} onChange={e => setNewCourse({...newCourse, dayOfWeek: e.target.value})}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"].map(day => (
                    <option key={day} value={day}>{day}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 mt-2 flex gap-3">
                <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 font-medium rounded-xl hover:bg-gray-200 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="flex-1 px-4 py-3 bg-indigo-600 text-white font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-sm">
                  Create Course
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
