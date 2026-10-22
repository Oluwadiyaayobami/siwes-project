"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  LogOut, BookOpen, Clock, ScanLine, 
  LayoutGrid, FileText, Bell, Settings, Menu, Search, Mail, ChevronDown, Award
} from "lucide-react";

export default function StudentLayout({ children }: { children: React.ReactNode }) {
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

  if (!user || user.role !== 'student') {
    router.push('/login');
    return null;
  }

  // Active state checker
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
            href="/student"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/student') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <LayoutGrid size={18} strokeWidth={2.5} className={isActive('/student') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            Dashboard
          </Link>
          
          <Link 
            href="/student/schedule"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/student/schedule') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Clock size={18} strokeWidth={2.5} className={isActive('/student/schedule') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            Class Schedule
          </Link>
          
          <Link 
            href="/student/courses"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/student/courses') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <BookOpen size={18} strokeWidth={2.5} className={isActive('/student/courses') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            Courses
          </Link>

          <Link 
            href="/student/scan"
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/student/scan') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <ScanLine size={18} strokeWidth={2.5} className={isActive('/student/scan') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            Check-In
          </Link>
          
          <Link href="/student/assignments" onClick={() => setMobileMenuOpen(false)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/student/assignments') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}>
            <FileText size={18} strokeWidth={2.5} className={isActive('/student/assignments') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            Assignments
          </Link>
          
          <Link href="/student/certificates" onClick={() => setMobileMenuOpen(false)} className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/student/certificates') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}>
            <Award size={18} strokeWidth={2.5} className={isActive('/student/certificates') ? 'text-[#0F5A37]' : 'text-gray-400'} />
            Certificates
          </Link>
        </div>

        {/* Bottom Nav */}
        <div className="p-4 mb-4 flex flex-col gap-1">
          <Link 
            href="/student/settings" 
            onClick={() => setMobileMenuOpen(false)}
            className={`w-full flex items-center gap-4 px-5 py-3.5 rounded-2xl transition-all font-semibold text-sm ${isActive('/student/settings') ? 'bg-[#E8F3ED] text-[#0F5A37]' : 'text-gray-500 hover:text-gray-900'}`}
          >
            <Settings size={18} strokeWidth={2.5} className={isActive('/student/settings') ? 'text-[#0F5A37]' : 'text-gray-400'} />
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

      {/* MAIN LAYOUT */}
      <div className="flex-1 flex flex-col min-h-screen overflow-x-hidden">
        
        {/* TOP HEADER */}
        <header className="h-24 px-6 md:px-10 flex items-center justify-between shrink-0">
          
          {/* Mobile Menu Toggle & Search */}
          <div className="flex items-center gap-4 flex-1">
            <button 
              className="md:hidden p-2 -ml-2 text-gray-700 bg-white rounded-lg shadow-sm"
              onClick={() => setMobileMenuOpen(true)}
            >
              <Menu size={20} />
            </button>
            
            <div className="relative hidden md:flex items-center w-full max-w-sm">
              <input 
                type="text" 
                placeholder="Search" 
                className="w-full bg-white border-none rounded-full py-3 pl-5 pr-12 text-sm font-medium shadow-sm focus:ring-2 focus:ring-[#0F5A37]/20 focus:outline-none placeholder:text-gray-400"
              />
              <Search size={18} className="absolute right-5 text-gray-400" />
            </div>
          </div>

          {/* Profile & Icons */}
          <div className="flex items-center gap-5 md:gap-7">
            <div className="hidden md:flex items-center gap-5">
              <button className="text-gray-600 hover:text-[#0F5A37] transition-colors"><Mail size={22} strokeWidth={2.5} /></button>
              <button className="text-gray-600 hover:text-[#0F5A37] transition-colors"><Bell size={22} strokeWidth={2.5} /></button>
            </div>
            
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-gray-50 shrink-0">
                <img src={user.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${user.name}&backgroundColor=0F5A37,1B8354`} alt="avatar" className="w-full h-full object-cover" />
              </div>
              <div className="hidden md:block text-right mr-1">
                <h3 className="text-sm font-bold text-gray-900 leading-tight">{user.name}</h3>
                <p className="text-[11px] font-medium text-gray-500">Student</p>
              </div>
              <button className="hidden md:flex w-6 h-6 bg-[#1B8354] rounded-full items-center justify-center text-white shadow-sm hover:bg-[#0F5A37] transition-colors shrink-0">
                <ChevronDown size={14} strokeWidth={3} />
              </button>
            </div>
          </div>
        </header>

        {children}

      </div>
    </div>
  );
}
