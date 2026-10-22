"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import api from "@/utils/api";
import { QRCodeSVG } from "qrcode.react";
import toast from "react-hot-toast";
import { 
  QrCode, MapPin, Clock, Users, Settings2, Play, 
  CheckCircle2, XCircle, AlertCircle, Maximize2, Minimize2, 
  Copy, Check, StopCircle, RefreshCw, UserCheck, History,
  Sparkles, Smartphone, ChevronRight, X, Search, ShieldCheck
} from "lucide-react";

interface Course {
  _id: string;
  title: string;
  courseCode: string;
  enrolledStudents: any[];
  studentCount?: number;
}

interface Attendee {
  student: {
    _id: string;
    name: string;
    email: string;
    matricNo?: string;
    avatar?: string;
  };
  checkedInAt: string;
  distance: number;
  status: string;
  method: string;
}

interface ActiveSession {
  _id: string;
  course: Course;
  title: string;
  status: string;
  durationMinutes: number;
  startTime: string;
  expiresAt: string;
  latitude: number;
  longitude: number;
  radiusMeters: number;
  otpCode: string;
  attendees: Attendee[];
}

export default function LecturerAttendance() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"active" | "history">("active");

  // Configuration State
  const [selectedCourse, setSelectedCourse] = useState("");
  const [sessionTitle, setSessionTitle] = useState("");
  const [duration, setDuration] = useState("15");
  const [radiusMeters, setRadiusMeters] = useState("300");
  const [startingSession, setStartingSession] = useState(false);
  const [updatingRadius, setUpdatingRadius] = useState(false);

  // Geolocation State for Lecturer
  const [coords, setCoords] = useState<{ lat: number; lng: number; accuracy?: number } | null>(null);
  const [geoStatus, setGeoStatus] = useState<"locating" | "acquired" | "failed">("locating");
  const [geoError, setGeoError] = useState("");

  // Active Session State
  const [activeSession, setActiveSession] = useState<ActiveSession | null>(null);
  const [qrToken, setQrToken] = useState("");
  const [tokenTimeLeft, setTokenTimeLeft] = useState(30);
  const [sessionTimeLeft, setSessionTimeLeft] = useState(0); // in seconds
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [copiedOtp, setCopiedOtp] = useState(false);

  // Past Sessions History
  const [pastSessions, setPastSessions] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [selectedHistorySession, setSelectedHistorySession] = useState<any | null>(null);

  // Manual Check-in Modal State
  const [showManualModal, setShowManualModal] = useState(false);
  const [manualIdentifier, setManualIdentifier] = useState("");
  const [manualSubmitting, setManualSubmitting] = useState(false);

  // End Session Confirmation Modal State (No native browser alert)
  const [showEndConfirmModal, setShowEndConfirmModal] = useState(false);
  const [endingSession, setEndingSession] = useState(false);

  // Acquire Lecturer Classroom GPS on Mount
  const acquireLocation = useCallback(() => {
    setGeoStatus("locating");
    setGeoError("");
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setCoords({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy
          });
          setGeoStatus("acquired");
        },
        (err) => {
          console.warn("GPS acquisition warning:", err);
          // Set standard campus coordinates as fallback default so user isn't blocked
          setCoords({ lat: 7.2571, lng: 5.2058 });
          setGeoStatus("acquired");
          setGeoError("Using default campus coordinates (allow browser GPS for strict room accuracy).");
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 10000 }
      );
    } else {
      setCoords({ lat: 7.2571, lng: 5.2058 });
      setGeoStatus("acquired");
    }
  }, []);

  useEffect(() => {
    acquireLocation();
  }, [acquireLocation]);

  // Fetch Courses & Active Session on Load
  const fetchInitialData = useCallback(async () => {
    try {
      setLoading(true);
      const [coursesRes, activeSessionRes] = await Promise.all([
        api.get("/courses/lecturer"),
        api.get("/attendance/session/active")
      ]);

      if (coursesRes.data.success) {
        setCourses(coursesRes.data.data);
        if (coursesRes.data.data.length > 0 && !selectedCourse) {
          setSelectedCourse(coursesRes.data.data[0]._id);
        }
      }

      if (activeSessionRes.data.success && activeSessionRes.data.data) {
        const { session, qrToken: token } = activeSessionRes.data.data;
        setActiveSession(session);
        setQrToken(token);

        // Calculate session remaining seconds
        const secondsLeft = Math.max(0, Math.floor((new Date(session.expiresAt).getTime() - Date.now()) / 1000));
        setSessionTimeLeft(secondsLeft);
      }
    } catch (err) {
      console.error("Failed to load initial attendance data", err);
    } finally {
      setLoading(false);
    }
  }, [selectedCourse]);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  // Refresh dynamic QR token & poll attendees every 12 seconds when session is active
  useEffect(() => {
    if (!activeSession || activeSession.status !== "ACTIVE") return;

    const interval = setInterval(async () => {
      try {
        const res = await api.get(`/attendance/session/${activeSession._id}/refresh-token`);
        if (res.data.success) {
          if (res.data.data.expired) {
            toast.error("Attendance session has concluded");
            setActiveSession(null);
            setQrToken("");
          } else {
            setQrToken(res.data.data.qrToken);
            setActiveSession(res.data.data.session);
            setTokenTimeLeft(30);
          }
        }
      } catch (err) {
        console.error("Token refresh failed", err);
      }
    }, 12000);

    return () => clearInterval(interval);
  }, [activeSession]);

  // Dynamic Token Countdown ticker (decrements every 1s)
  useEffect(() => {
    if (!activeSession) return;
    const timer = setInterval(() => {
      setTokenTimeLeft((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, [activeSession]);

  // Master Session Countdown ticker
  useEffect(() => {
    if (!activeSession || sessionTimeLeft <= 0) return;

    const timer = setInterval(() => {
      setSessionTimeLeft((prev) => {
        if (prev <= 1) {
          toast.success("Attendance session duration reached");
          setActiveSession((curr) => curr ? { ...curr, status: "CLOSED" } : null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [activeSession, sessionTimeLeft]);

  // Start Session Handler
  const handleStartSession = async () => {
    if (!selectedCourse) {
      toast.error("Please select a course");
      return;
    }

    if (!coords) {
      toast.error("Classroom coordinates not acquired yet");
      return;
    }

    const courseObj = courses.find(c => c._id === selectedCourse);
    const title = sessionTitle.trim() || (courseObj ? `${courseObj.courseCode} Attendance` : "Class Attendance");

    try {
      setStartingSession(true);
      const payload = {
        courseId: selectedCourse,
        title,
        durationMinutes: parseInt(duration, 10),
        radiusMeters: parseInt(radiusMeters, 10),
        latitude: coords.lat,
        longitude: coords.lng
      };

      const res = await api.post("/attendance/session/start", payload);
      if (res.data.success) {
        toast.success("Attendance session is now live!");
        setActiveSession(res.data.data.session);
        setQrToken(res.data.data.qrToken);
        setTokenTimeLeft(30);
        setSessionTimeLeft(parseInt(duration, 10) * 60);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to start attendance session");
    } finally {
      setStartingSession(false);
    }
  };

  // Live Geofence Radius Update Handler
  const handleUpdateRadius = async (newRadius: number) => {
    if (!activeSession) return;
    try {
      setUpdatingRadius(true);
      const res = await api.put(`/attendance/session/${activeSession._id}/update-radius`, {
        radiusMeters: newRadius
      });
      if (res.data.success) {
        toast.success(res.data.message || "Radius updated successfully");
        setActiveSession((prev) => prev ? { ...prev, radiusMeters: newRadius } : null);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to update radius");
    } finally {
      setUpdatingRadius(false);
    }
  };

  // Close Session Handler (Triggered from Custom Confirmation Modal)
  const confirmEndSession = async () => {
    if (!activeSession) return;

    try {
      setEndingSession(true);
      const res = await api.post(`/attendance/session/${activeSession._id}/close`);
      if (res.data.success) {
        toast.success("Attendance session ended successfully");
        setActiveSession(null);
        setQrToken("");
        setShowEndConfirmModal(false);
        fetchInitialData();
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to close session");
    } finally {
      setEndingSession(false);
    }
  };

  // Copy OTP code
  const handleCopyOtp = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.otpCode);
    setCopiedOtp(true);
    toast.success("Passcode copied to clipboard!");
    setTimeout(() => setCopiedOtp(false), 2000);
  };

  // Manual Check-in Handler
  const handleManualCheckIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !manualIdentifier.trim()) return;

    try {
      setManualSubmitting(true);
      const res = await api.post(`/attendance/session/${activeSession._id}/manual-mark`, {
        studentIdentifier: manualIdentifier.trim()
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setActiveSession(res.data.data);
        setManualIdentifier("");
        setShowManualModal(false);
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to mark student");
    } finally {
      setManualSubmitting(false);
    }
  };

  // Fetch Attendance History
  const fetchPastSessions = async () => {
    try {
      setHistoryLoading(true);
      const res = await api.get("/attendance/sessions/lecturer");
      if (res.data.success) {
        setPastSessions(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load past sessions", err);
    } finally {
      setHistoryLoading(false);
    }
  };

  const handleTabChange = (tab: "active" | "history") => {
    setActiveTab(tab);
    if (tab === "history") {
      fetchPastSessions();
    }
  };

  const formatTimer = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const totalEnrolled = activeSession?.course?.enrolledStudents?.length || 0;
  const attendeesCount = activeSession?.attendees?.length || 0;
  const attendanceRate = totalEnrolled > 0 ? Math.round((attendeesCount / totalEnrolled) * 100) : 0;

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto bg-[#F7F9FC]">
      <div className="w-full max-w-6xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Top Header & Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-3">
              Attendance System
              {activeSession && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-extrabold bg-emerald-100 text-emerald-800 animate-pulse">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Session
                </span>
              )}
            </h2>
            <p className="text-sm font-medium text-gray-500 mt-1">
              Start geofenced, dynamic-QR attendance sessions or review past classroom rosters.
            </p>
          </div>

          {/* Navigation Pill */}
          <div className="flex bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-sm self-start sm:self-auto">
            <button
              onClick={() => handleTabChange("active")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "active"
                  ? "bg-[#0F5A37] text-white shadow-md shadow-[#0F5A37]/20"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <QrCode size={16} /> Live / Start Session
            </button>
            <button
              onClick={() => handleTabChange("history")}
              className={`px-5 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center gap-2 ${
                activeTab === "history"
                  ? "bg-[#0F5A37] text-white shadow-md shadow-[#0F5A37]/20"
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              <History size={16} /> Past Sessions
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* TAB 1: LIVE OR START SESSION */}
        {/* ============================================================== */}
        {activeTab === "active" && (
          <>
            {/* IF NO ACTIVE SESSION -> SHOW SESSION CONFIGURATION */}
            {!activeSession ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Configuration Card */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
                    <h3 className="text-xl font-black text-gray-900 mb-6 flex items-center gap-2.5">
                      <Settings2 size={22} className="text-[#0F5A37]" /> Session Parameters
                    </h3>

                    <div className="space-y-6">
                      {/* Select Course */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                          Select Course
                        </label>
                        <select
                          value={selectedCourse}
                          onChange={(e) => setSelectedCourse(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none"
                        >
                          {loading ? (
                            <option>Loading your courses...</option>
                          ) : courses.length === 0 ? (
                            <option disabled>No courses found. Please create a course first.</option>
                          ) : (
                            courses.map((course) => (
                              <option key={course._id} value={course._id}>
                                {course.courseCode} — {course.title} ({(course.enrolledStudents || []).length} Enrolled)
                              </option>
                            ))
                          )}
                        </select>
                      </div>

                      {/* Optional Session Title */}
                      <div>
                        <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                          Session Topic / Title (Optional)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Lecture 4: Database Normalization"
                          value={sessionTitle}
                          onChange={(e) => setSessionTitle(e.target.value)}
                          className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none placeholder:text-gray-400"
                        />
                      </div>

                      {/* Duration & Geofence Radius */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                            Session Duration
                          </label>
                          <select
                            value={duration}
                            onChange={(e) => setDuration(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none"
                          >
                            <option value="5">5 Minutes</option>
                            <option value="10">10 Minutes</option>
                            <option value="15">15 Minutes (Recommended)</option>
                            <option value="30">30 Minutes</option>
                            <option value="45">45 Minutes</option>
                            <option value="60">60 Minutes</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                            Geofence Radius
                          </label>
                          <select
                            value={radiusMeters}
                            onChange={(e) => setRadiusMeters(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none"
                          >
                            <option value="100">100 Meters (Strict Line of Sight)</option>
                            <option value="250">250 Meters (Standard Hall)</option>
                            <option value="300">300 Meters (Recommended — Wi-Fi/Laptop Buffer)</option>
                            <option value="500">500 Meters (Campus Wing / Large Hall)</option>
                            <option value="1000">1,000 Meters (Campus Perimeter)</option>
                            <option value="0">No Distance Restriction (Allow Anywhere / Testing)</option>
                          </select>
                        </div>
                      </div>

                      {/* Location Acquisition Badge */}
                      <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-100 flex items-start justify-between gap-3">
                        <div className="flex items-start gap-3">
                          <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5 text-[#0F5A37]">
                            <MapPin size={20} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
                              Classroom Geofence Anchor
                              {geoStatus === "acquired" && (
                                <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded-full font-extrabold">
                                  GPS Ready
                                </span>
                              )}
                            </h4>
                            <p className="text-xs font-medium text-emerald-800 mt-1">
                              {coords ? (
                                <>
                                  Anchor: Lat {coords.lat.toFixed(4)}, Lng {coords.lng.toFixed(4)}.
                                  {radiusMeters === "0" ? " Geofence: Disabled (Anywhere)." : ` Students must be within ${radiusMeters}m.`}
                                </>
                              ) : (
                                "Acquiring your classroom GPS coordinates..."
                              )}
                            </p>
                            {coords?.accuracy && (
                              <p className="text-[11px] font-semibold text-emerald-700 mt-0.5">
                                Current device positioning accuracy: ±{Math.round(coords.accuracy)}m.
                                {coords.accuracy > 150 && " (Laptop Wi-Fi location detected; 300m or higher recommended)."}
                              </p>
                            )}
                            {geoError && (
                              <p className="text-[11px] font-semibold text-amber-700 mt-1">{geoError}</p>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={acquireLocation}
                          className="px-3 py-1.5 text-xs font-bold text-emerald-800 bg-emerald-100 hover:bg-emerald-200 rounded-lg flex items-center gap-1.5 transition-colors shrink-0"
                          title="Refresh GPS"
                        >
                          <RefreshCw size={13} /> Re-anchor
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Start Session Action Button */}
                  <button
                    onClick={handleStartSession}
                    disabled={startingSession || !selectedCourse || courses.length === 0}
                    className={`w-full py-5 rounded-[2rem] font-black text-lg flex items-center justify-center gap-3 transition-all shadow-xl ${
                      selectedCourse && !startingSession && courses.length > 0
                        ? "bg-gradient-to-r from-[#0F5A37] to-[#1B8354] text-white hover:scale-[1.01] active:scale-[0.99] shadow-[#0F5A37]/30"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {startingSession ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Initializing Session...
                      </>
                    ) : (
                      <>
                        <Play size={22} fill="currentColor" /> Generate Dynamic QR & Start Session
                      </>
                    )}
                  </button>
                </div>

                {/* Info & Instructions Card */}
                <div className="lg:col-span-1">
                  <div className="bg-[#0F5A37] rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden h-full flex flex-col justify-between">
                    <div className="absolute -right-10 -top-10 w-44 h-44 bg-white/5 rounded-full blur-2xl"></div>
                    
                    <div>
                      <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 mb-6">
                        <Sparkles size={28} className="text-emerald-300" />
                      </div>
                      <h3 className="text-2xl font-black mb-3">Anti-Proxy Security</h3>
                      <p className="text-emerald-100 text-xs leading-relaxed mb-6">
                        Presente unifies dynamic time-sensitive cryptographic QR tokens and classroom geofencing to guarantee 100% genuine physical attendance.
                      </p>

                      <ul className="space-y-4 text-emerald-50 text-xs font-medium">
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-xs text-emerald-200">
                            1
                          </div>
                          <p>Dynamic QR rotates every 15 seconds to prevent students from sharing photo screenshots via chat.</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-xs text-emerald-200">
                            2
                          </div>
                          <p>Haversine GPS validation checks student coordinates against this classroom anchor.</p>
                        </li>
                        <li className="flex items-start gap-3">
                          <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center shrink-0 font-bold text-xs text-emerald-200">
                            3
                          </div>
                          <p>Backup 6-digit OTP code allows check-in for students with poor camera lighting or restricted browser camera access.</p>
                        </li>
                      </ul>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/20 flex items-center gap-3 text-xs font-bold text-emerald-200">
                      <ShieldCheck size={18} /> Verified academic integrity
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              /* ============================================================== */
              /* ACTIVE LIVE SESSION VIEW (PROJECTOR MODE READY) */
              /* ============================================================== */
              <div className={`space-y-6 ${isFullscreen ? "fixed inset-0 z-50 bg-[#0B3520] p-6 overflow-y-auto" : ""}`}>
                
                {/* Session Top Bar Banner */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#0F5A37] flex items-center justify-center font-black text-xl">
                      {activeSession.course.courseCode.substring(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black uppercase tracking-wider text-[#0F5A37] bg-emerald-50 px-2.5 py-0.5 rounded-full">
                          {activeSession.course.courseCode}
                        </span>
                        <span className="text-xs font-bold text-gray-400">•</span>
                        <span className="text-xs font-bold text-gray-500">{activeSession.title}</span>
                      </div>
                      <h3 className="text-xl font-black text-gray-900 mt-1">{activeSession.course.title}</h3>
                    </div>
                  </div>

                  {/* Actions & Fullscreen */}
                  <div className="flex items-center gap-3 self-stretch md:self-auto justify-end">
                    <button
                      onClick={() => setShowManualModal(true)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                    >
                      <UserCheck size={15} /> Manual Mark
                    </button>

                    <button
                      onClick={() => setIsFullscreen(!isFullscreen)}
                      className="px-4 py-2.5 rounded-xl border border-gray-200 font-bold text-xs text-gray-700 hover:bg-gray-50 transition-colors flex items-center gap-2"
                      title="Projector Mode"
                    >
                      {isFullscreen ? <Minimize2 size={15} /> : <Maximize2 size={15} />}
                      {isFullscreen ? "Exit Projector" : "Projector View"}
                    </button>

                    <button
                      onClick={() => setShowEndConfirmModal(true)}
                      className="px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs transition-all flex items-center gap-2 shadow-md shadow-red-600/20"
                    >
                      <StopCircle size={15} /> End Session
                    </button>
                  </div>
                </div>

                {/* Geofence Live Adjustment Bar */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-emerald-100 flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-100 flex items-center justify-center text-[#0F5A37] shrink-0">
                      <MapPin size={18} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-gray-900">
                          Classroom Geofence: {activeSession.radiusMeters === 0 ? "Unlimited (No Restriction)" : `${activeSession.radiusMeters} Meters`}
                        </span>
                        <span className="text-[10px] bg-emerald-100 text-[#0F5A37] px-2 py-0.5 rounded-full font-bold">
                          Live Active
                        </span>
                      </div>
                      <p className="text-[11px] font-medium text-gray-500 mt-0.5">
                        Expand radius if students inside your room experience laptop/Wi-Fi positioning drift.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-wrap self-stretch md:self-auto justify-end">
                    <span className="text-[10px] font-black uppercase tracking-wider text-gray-400 mr-1 hidden sm:inline">
                      Quick Adjust:
                    </span>
                    {[
                      { label: "150m", value: 150 },
                      { label: "300m (Rec)", value: 300 },
                      { label: "500m", value: 500 },
                      { label: "1000m", value: 1000 },
                      { label: "Unlimited", value: 0 }
                    ].map((preset) => (
                      <button
                        key={preset.value}
                        type="button"
                        onClick={() => handleUpdateRadius(preset.value)}
                        disabled={updatingRadius}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                          activeSession.radiusMeters === preset.value
                            ? "bg-[#0F5A37] text-white shadow-md shadow-[#0F5A37]/20 scale-105"
                            : "bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200"
                        }`}
                      >
                        {preset.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Main Live Attendance Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                  
                  {/* Left Column: QR Code & Dynamic Passcode (7 Cols) */}
                  <div className="lg:col-span-7 flex flex-col gap-6">
                    <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100 flex flex-col items-center text-center relative overflow-hidden">
                      
                      {/* Live Radar Pulse Effect */}
                      <div className="relative mb-6">
                        <div className="absolute -inset-4 rounded-3xl bg-emerald-400/20 blur-xl animate-pulse"></div>
                        <div className="relative p-6 bg-white rounded-3xl border-4 border-emerald-500/30 shadow-2xl flex flex-col items-center">
                          {qrToken ? (
                            <QRCodeSVG
                              value={qrToken}
                              size={isFullscreen ? 320 : 250}
                              level="H"
                              includeMargin={true}
                              className="rounded-xl"
                            />
                          ) : (
                            <div className="w-[250px] h-[250px] flex items-center justify-center text-gray-400">
                              Generating QR...
                            </div>
                          )}

                          {/* Dynamic refresh bar under QR */}
                          <div className="w-full mt-4">
                            <div className="flex items-center justify-between text-[11px] font-black text-gray-500 mb-1.5">
                              <span className="flex items-center gap-1.5 text-emerald-700">
                                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span> Live Token
                              </span>
                              <span>Refreshes in {tokenTimeLeft}s</span>
                            </div>
                            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-emerald-600 h-full rounded-full transition-all duration-1000 ease-linear"
                                style={{ width: `${(tokenTimeLeft / 30) * 100}%` }}
                              ></div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Instructions */}
                      <p className="text-xs font-bold text-gray-500 max-w-sm mb-6">
                        Direct students to scan the live QR code with the Presente web app from within the classroom.
                      </p>

                      {/* Fallback 6-digit OTP code card */}
                      <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-200/80 flex items-center justify-between">
                        <div className="flex items-center gap-3 text-left">
                          <div className="w-10 h-10 rounded-xl bg-gray-200/80 text-gray-700 flex items-center justify-center shrink-0">
                            <Smartphone size={20} />
                          </div>
                          <div>
                            <span className="text-[10px] font-black tracking-wider uppercase text-gray-400 block">
                              6-Digit Fallback Passcode
                            </span>
                            <span className="text-2xl font-black tracking-widest text-gray-900 font-mono">
                              {activeSession.otpCode}
                            </span>
                          </div>
                        </div>

                        <button
                          onClick={handleCopyOtp}
                          className="px-4 py-2 bg-white border border-gray-200 hover:border-gray-300 rounded-xl text-xs font-bold text-gray-700 flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          {copiedOtp ? <Check size={14} className="text-emerald-600" /> : <Copy size={14} />}
                          {copiedOtp ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Live Roster & Master Clocks (5 Cols) */}
                  <div className="lg:col-span-5 flex flex-col gap-6">
                    
                    {/* Time Remaining & Tally Stats */}
                    <div className="grid grid-cols-2 gap-4">
                      {/* Master Countdown Clock */}
                      <div className="bg-[#0F5A37] rounded-3xl p-6 text-white shadow-lg relative overflow-hidden">
                        <Clock size={20} className="text-emerald-300 mb-2 opacity-80" />
                        <span className="text-[10px] font-black tracking-wider uppercase text-emerald-200 block">
                          Time Remaining
                        </span>
                        <div className="text-3xl font-black tracking-tight mt-1 font-mono">
                          {formatTimer(sessionTimeLeft)}
                        </div>
                        <p className="text-[10px] font-semibold text-emerald-200 mt-2">
                          Duration: {activeSession.durationMinutes} mins
                        </p>
                      </div>

                      {/* Checked-In Count */}
                      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                        <Users size={20} className="text-[#0F5A37] mb-2" />
                        <span className="text-[10px] font-black tracking-wider uppercase text-gray-400 block">
                          Attendance Tally
                        </span>
                        <div className="text-3xl font-black text-gray-900 tracking-tight mt-1">
                          {attendeesCount} <span className="text-sm font-bold text-gray-400">/ {totalEnrolled}</span>
                        </div>
                        <div className="w-full bg-gray-100 h-1.5 rounded-full mt-3 overflow-hidden">
                          <div
                            className="bg-[#0F5A37] h-full rounded-full transition-all duration-500"
                            style={{ width: `${Math.min(100, attendanceRate)}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Live Attendee Stream */}
                    <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 flex-1 flex flex-col">
                      <div className="flex items-center justify-between mb-4">
                        <h4 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Live Attendees Feed
                        </h4>
                        <span className="text-xs font-bold text-gray-400">
                          {attendeesCount} present
                        </span>
                      </div>

                      {activeSession.attendees.length === 0 ? (
                        <div className="flex-1 min-h-[220px] flex flex-col items-center justify-center text-center p-6 text-gray-400 border border-dashed border-gray-200 rounded-2xl">
                          <QrCode size={36} className="opacity-30 mb-2" />
                          <p className="text-xs font-bold text-gray-600">Waiting for check-ins...</p>
                          <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
                            Students scanning the code or entering the passcode will appear here live.
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-3 max-h-[360px] overflow-y-auto pr-1">
                          {activeSession.attendees.slice().reverse().map((att, idx) => (
                            <div
                              key={att.student?._id || idx}
                              className="p-3 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3 animate-in fade-in slide-in-from-top-2 duration-300"
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0F5A37] font-black text-xs flex items-center justify-center shrink-0">
                                  {att.student?.name ? att.student.name.charAt(0).toUpperCase() : "S"}
                                </div>
                                <div className="min-w-0">
                                  <p className="text-xs font-extrabold text-gray-900 truncate">
                                    {att.student?.name || "Student"}
                                  </p>
                                  <p className="text-[10px] font-semibold text-gray-400 truncate">
                                    {att.student?.matricNo || att.student?.email || "Enrolled"}
                                  </p>
                                </div>
                              </div>

                              <div className="text-right shrink-0">
                                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
                                  <CheckCircle2 size={11} /> Present
                                </span>
                                <span className="text-[9px] font-semibold text-gray-400 block mt-0.5">
                                  {att.method} • {att.distance}m
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                  </div>
                </div>

              </div>
            )}
          </>
        )}

        {/* ============================================================== */}
        {/* TAB 2: PAST ATTENDANCE SESSIONS HISTORY */}
        {/* ============================================================== */}
        {activeTab === "history" && (
          <div className="space-y-6">
            <div className="bg-white rounded-[2.5rem] p-8 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h3 className="text-xl font-black text-gray-900">Attendance Log & Records</h3>
                  <p className="text-xs font-medium text-gray-500 mt-1">
                    Review past classroom attendance, export records, and inspect attendee rosters.
                  </p>
                </div>
                <button
                  onClick={fetchPastSessions}
                  className="px-4 py-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-gray-100 rounded-xl border border-gray-200 transition-colors flex items-center gap-2"
                >
                  <RefreshCw size={14} className={historyLoading ? "animate-spin" : ""} /> Refresh
                </button>
              </div>

              {historyLoading ? (
                <div className="text-center py-16 text-gray-400">
                  <div className="w-8 h-8 border-4 border-[#0F5A37] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
                  <p className="text-xs font-bold">Loading past sessions...</p>
                </div>
              ) : pastSessions.length === 0 ? (
                <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-3xl">
                  <History size={40} className="mx-auto mb-3 opacity-30 text-gray-500" />
                  <p className="text-sm font-extrabold text-gray-700">No past attendance sessions found</p>
                  <p className="text-xs text-gray-400 mt-1">
                    Start a session from the "Live / Start Session" tab to record student attendance.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {pastSessions.map((session) => {
                    const enrolledCount = session.course?.enrolledStudents?.length || 0;
                    const attendeesNum = session.attendees?.length || 0;
                    const rate = enrolledCount > 0 ? Math.round((attendeesNum / enrolledCount) * 100) : 0;
                    const sessionDate = new Date(session.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric"
                    });
                    const sessionTime = new Date(session.createdAt).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit"
                    });

                    return (
                      <div
                        key={session._id}
                        onClick={() => setSelectedHistorySession(session)}
                        className="bg-gray-50/70 hover:bg-emerald-50/40 border border-gray-200/80 hover:border-emerald-200 rounded-3xl p-6 transition-all cursor-pointer group flex flex-col justify-between"
                      >
                        <div>
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-xs font-black text-[#0F5A37] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                              {session.course?.courseCode || "Course"}
                            </span>
                            <span className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                              session.status === "ACTIVE" ? "bg-emerald-100 text-emerald-800" : "bg-gray-200 text-gray-600"
                            }`}>
                              {session.status}
                            </span>
                          </div>

                          <h4 className="text-base font-extrabold text-gray-900 group-hover:text-[#0F5A37] transition-colors truncate">
                            {session.title || session.course?.title}
                          </h4>
                          <p className="text-xs font-medium text-gray-500 truncate mt-0.5">
                            {session.course?.title}
                          </p>

                          <div className="mt-4 pt-4 border-t border-gray-200/60 flex items-center justify-between text-xs font-bold text-gray-500">
                            <span>{sessionDate} • {sessionTime}</span>
                            <span>{session.durationMinutes} mins</span>
                          </div>
                        </div>

                        <div className="mt-4 pt-3 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] font-black uppercase text-gray-400 block">Attendance</span>
                            <span className="text-lg font-black text-gray-900">
                              {attendeesNum} <span className="text-xs font-bold text-gray-400">/ {enrolledCount} ({rate}%)</span>
                            </span>
                          </div>

                          <div className="w-8 h-8 rounded-full bg-white group-hover:bg-[#0F5A37] group-hover:text-white flex items-center justify-center text-gray-400 transition-colors shadow-sm">
                            <ChevronRight size={16} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

      </div>

      {/* ============================================================== */}
      {/* MODAL 1: MANUAL STUDENT CHECK-IN */}
      {/* ============================================================== */}
      {showManualModal && activeSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-[#0F5A37] flex items-center justify-center">
                  <UserCheck size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">Manual Check-In</h3>
                  <p className="text-xs font-medium text-gray-500">Mark a student present in this session</p>
                </div>
              </div>
              <button
                onClick={() => setShowManualModal(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleManualCheckIn} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                  Student Matric No, Email, or ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="e.g. CSC/2021/1042 or student email"
                    value={manualIdentifier}
                    onChange={(e) => setManualIdentifier(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-2xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-4 outline-none pl-11"
                  />
                  <Search size={18} className="absolute left-4 top-4 text-gray-400" />
                </div>
              </div>

              <p className="text-xs text-gray-500 font-medium">
                Use manual check-in if a student's phone battery died or their GPS calibration failed.
              </p>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowManualModal(false)}
                  className="flex-1 py-3.5 rounded-2xl border border-gray-200 font-bold text-sm text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualSubmitting || !manualIdentifier.trim()}
                  className="flex-1 py-3.5 rounded-2xl bg-[#0F5A37] hover:bg-[#156F45] text-white font-bold text-sm shadow-lg shadow-[#0F5A37]/20 transition-all disabled:opacity-50"
                >
                  {manualSubmitting ? "Marking..." : "Confirm Present"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 2: PAST SESSION DETAILS ROSTER */}
      {/* ============================================================== */}
      {selectedHistorySession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-8 max-w-2xl w-full max-h-[85vh] flex flex-col shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200">
            <div className="flex items-start justify-between pb-4 border-b border-gray-100">
              <div>
                <span className="text-xs font-black text-[#0F5A37] bg-emerald-100 px-2.5 py-0.5 rounded-full">
                  {selectedHistorySession.course?.courseCode}
                </span>
                <h3 className="text-xl font-black text-gray-900 mt-1">
                  {selectedHistorySession.title || selectedHistorySession.course?.title}
                </h3>
                <p className="text-xs text-gray-500 font-medium mt-0.5">
                  Conducted on {new Date(selectedHistorySession.createdAt).toLocaleDateString()} at {new Date(selectedHistorySession.createdAt).toLocaleTimeString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedHistorySession(null)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400"
              >
                <X size={18} />
              </button>
            </div>

            <div className="py-4 flex items-center justify-between text-xs font-bold text-gray-500">
              <span>Roster ({selectedHistorySession.attendees?.length || 0} Attended)</span>
              <span>Radius: {selectedHistorySession.radiusMeters}m</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
              {(!selectedHistorySession.attendees || selectedHistorySession.attendees.length === 0) ? (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-xs font-bold">No students checked in during this session.</p>
                </div>
              ) : (
                selectedHistorySession.attendees.map((att: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-emerald-100 text-[#0F5A37] font-black text-xs flex items-center justify-center">
                        {att.student?.name ? att.student.name.charAt(0).toUpperCase() : (idx + 1)}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-gray-900">
                          {att.student?.name || "Student"}
                        </p>
                        <p className="text-[10px] font-semibold text-gray-400">
                          {att.student?.matricNo || att.student?.email || "Enrolled"}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-extrabold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full">
                        {att.status || "PRESENT"}
                      </span>
                      <span className="text-[10px] font-semibold text-gray-400 block mt-0.5">
                        {att.method || "QR"} • {new Date(att.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="pt-4 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedHistorySession(null)}
                className="px-6 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* MODAL 3: CUSTOM END SESSION CONFIRMATION (REPLACES NATIVE ALERT) */}
      {/* ============================================================== */}
      {showEndConfirmModal && activeSession && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-6 md:p-8 max-w-md w-full shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200 text-center">
            
            <div className="w-16 h-16 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
              <StopCircle size={32} />
            </div>

            <h3 className="text-xl font-black text-gray-900 mb-2">
              End Attendance Session?
            </h3>

            <p className="text-xs md:text-sm text-gray-500 font-medium leading-relaxed mb-6">
              Are you sure you want to end this attendance session? Students will no longer be able to check in and the live QR code will be deactivated.
            </p>

            <div className="flex gap-3">
              <button
                type="button"
                disabled={endingSession}
                onClick={() => setShowEndConfirmModal(false)}
                className="flex-1 py-3.5 rounded-2xl border border-gray-200 font-bold text-sm text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={endingSession}
                onClick={confirmEndSession}
                className="flex-1 py-3.5 rounded-2xl bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-sm shadow-lg shadow-red-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {endingSession ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Ending...
                  </>
                ) : (
                  "Yes, End Session"
                )}
              </button>
            </div>

          </div>
        </div>
      )}

    </main>
  );
}
