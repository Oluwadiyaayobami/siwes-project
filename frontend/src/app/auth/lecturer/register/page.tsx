"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import api from "@/utils/api";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

export default function LecturerRegister() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "lecturer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await api.post("/auth/register", formData);
      toast.success("Registration successful! Please login.");
      router.push("/login");
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center" style={{ backgroundColor: "#129285" }}>
      <div className="w-full max-w-sm mx-4 bg-white rounded-[32px] px-8 pt-8 pb-10 shadow-2xl relative overflow-hidden">

        {/* Watermark */}
        <div className="absolute bottom-0 right-0 opacity-[0.04] pointer-events-none">
          <PresenteLogo size={180} />
        </div>

        {/* Back arrow */}
        <Link href="/" className="w-9 h-9 border border-gray-200 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-50 transition-colors mb-8">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 18l-6-6 6-6" />
          </svg>
        </Link>

        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <PresenteLogo size={72} />
          <span className="text-sm font-bold tracking-[0.25em] mt-1" style={{ color: "#129285" }}>PRESENTE</span>
        </div>

        {/* Title */}
        <div className="mb-7">
          <h1 className="text-[26px] font-bold text-gray-900 leading-tight">
            Create <span style={{ color: "#129285" }}>account</span>
          </h1>
          <p className="text-sm text-gray-400 mt-1">Register as a lecturer</p>
        </div>

        {error && (
          <div className="text-red-500 text-xs mb-4 px-1">{error}</div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Full Name */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name & Title</label>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{ backgroundColor: "#E4F4F2" }}>
              <UserIcon />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                placeholder="Dr. Jane Doe"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{ backgroundColor: "#E4F4F2" }}>
              <MailIcon />
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                placeholder="jane.doe@university.edu"
                required
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Password</label>
            <div className="flex items-center gap-3 rounded-xl px-4 py-3.5" style={{ backgroundColor: "#E4F4F2" }}>
              <LockIcon />
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="flex-1 bg-transparent outline-none text-sm text-gray-800 placeholder-gray-400"
                placeholder="Enter your password..."
                required
                minLength={6}
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-3">
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 rounded-xl text-white font-bold text-sm tracking-wide transition-opacity disabled:opacity-70 flex items-center justify-center"
              style={{ backgroundColor: "#129285" }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : "Create Lecturer Account"}
            </button>
          </div>
        </form>

        {/* Footer */}
        <div className="mt-6 text-center text-xs text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="font-semibold" style={{ color: "#129285" }}>Sign in here</Link>
        </div>
      </div>
    </div>
  );
}

function UserIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#129285" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#129285" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  );
}

function LockIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#129285" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

function PresenteLogo({ size = 80 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      {/* Vertical stem */}
      <line x1="22" y1="15" x2="22" y2="105" stroke="#152A4A" strokeWidth="9" strokeLinecap="round" />
      {/* Top horizontal */}
      <line x1="22" y1="15" x2="55" y2="15" stroke="#152A4A" strokeWidth="9" strokeLinecap="round" />
      {/* Bowl arc — teal */}
      <path d="M55 15 Q80 15 80 40 Q80 65 55 65" stroke="#129285" strokeWidth="9" fill="none" strokeLinecap="round" />
      {/* Middle bar closing bowl */}
      <line x1="22" y1="65" x2="55" y2="65" stroke="#152A4A" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}
