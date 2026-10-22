"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LogOut, BookOpen, Clock, QrCode, 
  LayoutGrid, Users, Settings, Award, ClipboardList
} from "lucide-react";

export default function LecturerLayout({ children }: { children: React.ReactNode }) {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F3F5F9]">
        <div className="w-8 h-8 border-4 border-[#0F5A37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user || user.role !== 'lecturer' && user.role !== 'admin' && user.role !== 'supervisor') {
    router.push('/login');
    return null;
  }

  const isActive = (path: string) => pathname === path;

  return (
    <div className="min-h-screen bg-[#F3F5F9] font-sans flex flex-col md:flex-row text-gray-800">
      
      {/* MOBILE SIDEBAR OVERLAY */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/20 z-[60] md:hidden backdrop-blur-sm" 
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* SIDEBAR */}
      <aside className={`
        fixed inset-y-0 left-0 w-64 bg-white flex flex-col z-[70] shadow-[4px_0_24px_rgba(0,0,0,0.02)]
        transform transition-transform duration-300 ease-in-out
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'}
        md:translate-x-0 md:relative md:flex shrink-0
      `}>
        {/* Logo */}
        <div className="p-8 flex items-center gap-3">
          <img src="/icon.svg" alt="Presente Logo" className="w-8 h-8" />
          <span className="font-extrabold text-gray-900 text-xl tracking-tight">Presente</span>
        </div>
        
        {/* Nav Links */}
        <div className="flex flex-col gap-1 px-4 flex-1 mt-2">
          
          <Link 
            href="/lecturer"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/lecturer') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <LayoutGrid size={18} strokeWidth={2.5} className={isActive('/lecturer') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            Dashboard
          </Link>
          
          <Link 
            href="/lecturer/courses"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/lecturer/courses') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <BookOpen size={18} strokeWidth={2.5} className={isActive('/lecturer/courses') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            My Courses
          </Link>

          <Link 
            href="/lecturer/attendance"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/lecturer/attendance') ? 'bg-red-50 text-red-600' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <QrCode size={18} strokeWidth={2.5} className={isActive('/lecturer/attendance') ? 'text-red-500' : 'text-gray-400'} />
            Start Attendance
          </Link>
          
          <Link href="/lecturer/students" onClick={() => setMobileMenuOpen(false)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/lecturer/students') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}>
            <Users size={18} strokeWidth={2.5} className={isActive('/lecturer/students') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            Students List
          </Link>
          
          <Link href="/lecturer/assignments" onClick={() => setMobileMenuOpen(false)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/lecturer/assignments') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}>
            <ClipboardList size={18} strokeWidth={2.5} className={isActive('/lecturer/assignments') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            Assignments
          </Link>
          
          <Link href="/lecturer/reports" onClick={() => setMobileMenuOpen(false)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/lecturer/reports') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}>
            <Award size={18} strokeWidth={2.5} className={isActive('/lecturer/reports') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            Reports
          </Link>
        </div>

        {/* Bottom Nav */}
        <div className="p-4 mb-4 flex flex-col gap-1">
          <Link href="/lecturer/settings" className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm text-gray-500 hover:text-gray-900">
            <Settings size={18} strokeWidth={2.5} className="text-gray-400" />
            Settings
          </Link>

          <button 
            onClick={logout}
            className="w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm text-gray-500 hover:text-red-600"
          >
            <LogOut size={18} strokeWidth={2.5} className="text-gray-400" />
            Log out
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        {/* TOP HEADER */}
        <header className="h-20 bg-white/50 backdrop-blur-md border-b border-gray-100 flex items-center justify-between px-4 md:px-8 shrink-0 z-50">
          <div className="flex items-center gap-4 md:hidden">
            <button 
              onClick={() => setMobileMenuOpen(true)}
              className="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center text-gray-600 border border-gray-100"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
            </button>
          </div>
          
          <div className="hidden md:flex items-center gap-3">
            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-[#0F5A37]">
              <Clock size={20} strokeWidth={2.5} />
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Lecturer Portal</span>
              <span className="text-sm font-extrabold text-gray-900">{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full border border-gray-100 shadow-sm">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#0F5A37] to-[#1B8354] flex items-center justify-center text-white font-bold text-xs">
                {user.name.charAt(0)}
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-bold text-gray-900 leading-tight">{user.name}</span>
                <span className="text-[10px] font-semibold text-gray-500">Lecturer</span>
              </div>
            </div>
          </div>
        </header>

        {children}
      </div>
    </div>
  );
}
