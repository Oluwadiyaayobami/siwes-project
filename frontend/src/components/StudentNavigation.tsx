"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Menu, X, Home, BookOpen, Newspaper, CalendarDays, FileText, CalendarOff, Search, Globe, HelpCircle } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function StudentNavigation({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  const menuItems = [
    { icon: Home, label: "Home", href: "/student" },
    { icon: BookOpen, label: "Subject-wise attendance", href: "/student/subjects" },
    { icon: Newspaper, label: "News and Updates", href: "/student/news" },
    { icon: CalendarDays, label: "Timetable", href: "/student/timetable" },
    { icon: FileText, label: "Marks card", href: "/student/marks" },
    { icon: CalendarOff, label: "Apply for leave", href: "/student/leave" },
    { icon: Search, label: "Find faculty", href: "/student/faculty" },
    { icon: Globe, label: "Go to website", href: "#" },
  ];

  return (
    <div className="relative h-screen w-full bg-app-gray flex flex-col overflow-hidden">
      {/* Top App Bar - Always visible */}
      <div className="bg-app-navy text-white px-6 pt-6 pb-4 rounded-b-[30px] z-20 shrink-0">
        <div className="flex justify-between items-center">
          <button onClick={() => setMenuOpen(true)} className="p-1 -ml-1">
            <Menu size={24} />
          </button>
          <div className="font-semibold text-lg">{user?.name || "Student"}</div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto w-full relative z-10 bg-app-gray">
        {children}
      </div>

      {/* Slide-out Menu Overlay */}
      {menuOpen && (
        <div className="absolute inset-0 z-50 flex">
          {/* Menu Drawer */}
          <div className="w-[85%] bg-app-navy text-white h-full shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Drawer Header */}
            <div className="p-6 pt-12 border-b border-white/10 flex justify-between items-start">
              <div>
                <p className="text-sm opacity-70">Hi,</p>
                <h2 className="text-2xl font-bold">{user?.name}</h2>
                <p className="text-[10px] opacity-60 mt-1">{user?.email}</p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center overflow-hidden">
                <UserIconPlaceholder />
              </div>
            </div>

            {/* Grid of Options */}
            <div className="flex-1 overflow-y-auto p-4">
              <div className="grid grid-cols-2 gap-3">
                {menuItems.map((item, idx) => {
                  const isActive = pathname === item.href;
                  return (
                    <Link 
                      key={idx} 
                      href={item.href}
                      onClick={() => setMenuOpen(false)}
                      className={`flex flex-col items-center justify-center p-4 rounded-2xl transition-colors ${
                        isActive ? "bg-white/10 text-white" : "bg-app-navy text-white/70 hover:bg-white/5"
                      }`}
                    >
                      <item.icon size={24} className="mb-2" />
                      <span className="text-[10px] text-center leading-tight font-medium w-full truncate px-1">
                        {item.label}
                      </span>
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Bottom Help */}
            <div className="p-6 border-t border-white/10 mt-auto">
              <button className="flex items-center gap-2 text-xs font-medium opacity-80 hover:opacity-100">
                <HelpCircle size={16} /> Help and Feedback
              </button>
            </div>
          </div>
          
          {/* Backdrop */}
          <div 
            className="flex-1 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300" 
            onClick={() => setMenuOpen(false)}
          >
             <button className="absolute top-12 right-6 text-white p-2">
               <X size={28} />
             </button>
          </div>
        </div>
      )}
    </div>
  );
}

function UserIconPlaceholder() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 21V19C20 16.7909 18.2091 15 16 15H8C5.79086 15 4 16.7909 4 19V21" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M12 11C14.2091 11 16 9.20914 16 7C16 4.79086 14.2091 3 12 3C9.79086 3 8 4.79086 8 7C8 9.20914 9.79086 11 12 11Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
