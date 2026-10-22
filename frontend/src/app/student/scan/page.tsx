"use client";

import { useState } from "react";
import QRScanner from "@/components/QRScanner";
import StatusBanner from "@/components/StatusBanner";
import api from "@/utils/api";
import Link from "next/link";
import { 
  CheckCircle2, QrCode, Smartphone, MapPin, 
  ArrowRight, ShieldCheck, Clock, RefreshCw, AlertCircle
} from "lucide-react";
import toast from "react-hot-toast";

interface CheckInDetails {
  courseCode: string;
  courseTitle: string;
  sessionTitle: string;
  checkedInAt: string;
  distance: number;
  method: string;
}

export default function ScanPage() {
  const [activeTab, setActiveTab] = useState<"qr" | "code">("qr");
  const [isScanning, setIsScanning] = useState(true);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [status, setStatus] = useState<"success" | "error" | null>(null);
  const [message, setMessage] = useState("");
  const [checkInResult, setCheckInResult] = useState<CheckInDetails | null>(null);

  // Manual 6-digit OTP code state
  const [otpCode, setOtpCode] = useState("");
  const [codeSubmitting, setCodeSubmitting] = useState(false);

  // Helper to obtain GPS and post check-in payload
  const performCheckIn = (payloadData: { qrToken?: string; otpCode?: string }) => {
    setIsCheckingIn(true);
    setStatus(null);
    setMessage("");

    const submitWithCoords = (lat: number, lng: number, accuracy?: number) => {
      api.post("/attendance/check-in", {
        ...payloadData,
        studentLat: lat,
        studentLng: lng,
        studentAccuracy: accuracy
      })
      .then((res) => {
        if (res.data.success) {
          setStatus("success");
          setMessage(res.data.message || "Attendance verified successfully!");
          setCheckInResult(res.data.data);
          setIsScanning(false);
          toast.success("Attendance verified!");
        }
      })
      .catch((err: any) => {
        const errorMsg = err.response?.data?.message || "Failed to check in. Please verify and try again.";
        setStatus("error");
        setMessage(errorMsg);
        toast.error(errorMsg);
        if (activeTab === "qr") {
          setTimeout(() => setIsScanning(true), 3500);
        }
      })
      .finally(() => {
        setIsCheckingIn(false);
        setCodeSubmitting(false);
      });
    };

    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          submitWithCoords(pos.coords.latitude, pos.coords.longitude, pos.coords.accuracy);
        },
        (error) => {
          setIsCheckingIn(false);
          setCodeSubmitting(false);
          let errorMsg = "Location access is required to verify that you are physically inside the lecture hall.";
          if (error.code === error.PERMISSION_DENIED) {
            errorMsg = "Location permission denied. Please allow location access in your browser to verify attendance.";
          } else if (error.code === error.TIMEOUT) {
            errorMsg = "GPS location request timed out. Please ensure high-accuracy location is enabled and try again.";
          } else if (error.code === error.POSITION_UNAVAILABLE) {
            errorMsg = "GPS position is unavailable. Please check your device location settings.";
          }
          setStatus("error");
          setMessage(errorMsg);
          toast.error(errorMsg);
          if (activeTab === "qr") {
            setTimeout(() => setIsScanning(true), 3500);
          }
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    } else {
      setIsCheckingIn(false);
      setCodeSubmitting(false);
      const msg = "Geolocation is not supported by your browser. Please use a modern mobile browser with GPS.";
      setStatus("error");
      setMessage(msg);
      toast.error(msg);
    }
  };


  const handleScanSuccess = (decodedText: string) => {
    performCheckIn({ qrToken: decodedText });
  };

  const handleCodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpCode || otpCode.trim().length < 4) {
      toast.error("Please enter a valid attendance code");
      return;
    }
    setCodeSubmitting(true);
    performCheckIn({ otpCode: otpCode.trim() });
  };

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto bg-[#F7F9FC]">
      <div className="w-full max-w-lg animate-in fade-in zoom-in-95 duration-300 mt-4 md:mt-8">
        
        {/* Card Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black bg-emerald-100 text-[#0F5A37] mb-3">
            <ShieldCheck size={14} /> Geofenced Verification
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-gray-900 tracking-tight">Classroom Check-In</h2>
          <p className="text-xs md:text-sm font-medium text-gray-500 mt-1">
            Scan the live rotating QR code on the lecture screen or enter the 6-digit passcode.
          </p>
        </div>

        {/* Status Banner */}
        <div className="w-full mb-6">
          <StatusBanner status={status} message={message} />
        </div>

        {/* Main Interaction Container */}
        <div className="bg-white rounded-[2.5rem] p-6 md:p-8 shadow-sm border border-gray-100">
          
          {/* SUCCESS RECEIPT STATE */}
          {status === "success" && checkInResult ? (
            <div className="flex flex-col items-center text-center py-4 animate-in zoom-in-95 duration-300">
              <div className="w-20 h-20 bg-emerald-50 text-[#0F5A37] rounded-3xl flex items-center justify-center mb-6 border-4 border-emerald-100 shadow-lg shadow-emerald-500/10">
                <CheckCircle2 size={44} />
              </div>

              <span className="text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-3 py-1 rounded-full mb-2">
                Verified Present
              </span>

              <h3 className="text-2xl font-black text-gray-900 mb-1">
                {checkInResult.courseCode}
              </h3>
              <p className="text-sm font-bold text-gray-600 mb-6">
                {checkInResult.courseTitle}
              </p>

              {/* Receipt Details Box */}
              <div className="w-full bg-gray-50 rounded-2xl p-4 border border-gray-200/70 text-left space-y-3 mb-6">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                    <Clock size={14} /> Recorded At:
                  </span>
                  <span className="font-bold text-gray-900">
                    {new Date(checkInResult.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                    <MapPin size={14} /> Classroom Proximity:
                  </span>
                  <span className="font-bold text-emerald-700">
                    {checkInResult.distance}m away (Within bounds)
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-gray-500 flex items-center gap-1.5">
                    <ShieldCheck size={14} /> Method:
                  </span>
                  <span className="font-bold text-gray-900">
                    {checkInResult.method === "OTP" ? "6-Digit Passcode" : "Dynamic QR Scan"}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full">
                <Link
                  href="/student"
                  className="flex-1 py-4 bg-[#0F5A37] hover:bg-[#156F45] text-white rounded-2xl font-black text-xs text-center shadow-lg shadow-[#0F5A37]/20 transition-all flex items-center justify-center gap-2"
                >
                  Return to Dashboard <ArrowRight size={14} />
                </Link>
                <button
                  onClick={() => {
                    setStatus(null);
                    setCheckInResult(null);
                    setIsScanning(true);
                  }}
                  className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl font-bold text-xs transition-colors"
                >
                  Scan Another
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Tab Selector: Scan QR vs Enter Passcode */}
              <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("qr");
                    setIsScanning(true);
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                    activeTab === "qr"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <QrCode size={16} /> Scan QR Code
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab("code");
                    setIsScanning(false);
                  }}
                  className={`flex-1 py-2.5 rounded-xl font-black text-xs transition-all flex items-center justify-center gap-2 ${
                    activeTab === "code"
                      ? "bg-white text-gray-900 shadow-sm"
                      : "text-gray-500 hover:text-gray-900"
                  }`}
                >
                  <Smartphone size={16} /> Enter 6-Digit Code
                </button>
              </div>

              {/* TAB 1: CAMERA SCANNER */}
              {activeTab === "qr" && (
                <div className="flex flex-col items-center">
                  <div className="w-full aspect-square rounded-[2.5rem] overflow-hidden bg-black border-4 border-gray-100 shadow-inner relative">
                    <QRScanner
                      onScanSuccess={handleScanSuccess}
                      isScanning={isScanning}
                      isCheckingIn={isCheckingIn}
                    />
                  </div>

                  <p className="text-xs font-semibold text-gray-400 text-center mt-4">
                    Point your camera directly at the lecture screen. Code automatically verifies upon scanning.
                  </p>
                </div>
              )}

              {/* TAB 2: MANUAL PASSCODE INPUT */}
              {activeTab === "code" && (
                <form onSubmit={handleCodeSubmit} className="space-y-6 py-4">
                  <div className="text-center">
                    <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-2">
                      Classroom Attendance Code
                    </label>
                    <p className="text-xs text-gray-500 mb-4">
                      Enter the 6-digit code displayed below the QR code on the lecture screen.
                    </p>

                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000000"
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value.replace(/[^0-9]/g, ""))}
                      className="w-full max-w-xs mx-auto text-center tracking-[0.5em] text-3xl font-black font-mono bg-gray-50 border-2 border-gray-200 focus:border-[#0F5A37] rounded-2xl py-4 outline-none"
                    />
                  </div>

                  <div className="bg-emerald-50/70 p-4 rounded-2xl border border-emerald-100 flex items-start gap-3">
                    <MapPin className="text-[#0F5A37] shrink-0 mt-0.5" size={18} />
                    <p className="text-xs font-semibold text-emerald-950">
                      Your GPS location will be automatically verified when submitting this code.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={codeSubmitting || isCheckingIn || otpCode.length < 6}
                    className={`w-full py-4 rounded-2xl font-black text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                      otpCode.length === 6 && !codeSubmitting
                        ? "bg-[#0F5A37] hover:bg-[#156F45] text-white shadow-[#0F5A37]/20"
                        : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
                    }`}
                  >
                    {codeSubmitting || isCheckingIn ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        Verifying Presence...
                      </>
                    ) : (
                      <>Submit Code & Check In</>
                    )}
                  </button>
                </form>
              )}
            </>
          )}

        </div>

        {/* Security / Help Footer */}
        <div className="mt-6 text-center text-xs font-semibold text-gray-400 flex items-center justify-center gap-2">
          <ShieldCheck size={14} className="text-emerald-600" />
          <span>Presente Anti-Proxy Protection Active</span>
        </div>

      </div>
    </main>
  );
}
