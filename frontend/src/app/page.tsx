"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import Link from "next/link";
import Image from "next/image";

/* ─── SVG Icons ──────────────────────────────────────────────────────────── */
const IconMenu = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
);
const IconClose = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
const IconFileText = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><line x1="16" x2="8" y1="13" y2="13"/><line x1="16" x2="8" y1="17" y2="17"/><line x1="10" x2="8" y1="9" y2="9"/></svg>
);
const IconShieldCheck = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="m9 12 2 2 4-4"/></svg>
);
const IconActivity = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);
const IconCalendar = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
);
const IconQrCode = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/></svg>
);
const IconBookOpen = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
const IconUploadCloud = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M12 12v9"/><path d="m16 16-4-4-4 4"/></svg>
);
const IconBarChart = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="20" y2="10"/><line x1="18" x2="18" y1="20" y2="4"/><line x1="6" x2="6" y1="20" y2="14"/></svg>
);
const SplashIcon = () => (
  <svg viewBox="0 0 300 150" className="absolute inset-0 w-[150%] h-[200%] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#1B8354] z-0 drop-shadow-xl" fill="currentColor">
    {/* Core blob */}
    <path d="M150,20 C200,10 250,30 270,70 C290,110 240,140 150,135 C60,130 20,110 30,70 C40,30 100,30 150,20 Z" />
    
    {/* Splatter arms pointing outwards */}
    <path d="M250,40 L290,10 L260,50 Z" />
    <path d="M270,70 L310,75 L265,90 Z" />
    <path d="M240,120 L280,150 L230,130 Z" />
    <path d="M180,135 L190,170 L160,135 Z" />
    <path d="M120,130 L100,160 L130,130 Z" />
    <path d="M60,110 L20,140 L70,100 Z" />
    <path d="M30,70 L-10,60 L35,50 Z" />
    <path d="M50,40 L20,10 L70,35 Z" />
    <path d="M100,25 L90,-10 L120,20 Z" />
    <path d="M180,20 L200,-5 L190,25 Z" />

    {/* Floating droplets */}
    <circle cx="280" cy="30" r="4" />
    <circle cx="300" cy="50" r="3" />
    <circle cx="295" cy="110" r="5" />
    <circle cx="250" cy="155" r="4" />
    <circle cx="170" cy="165" r="6" />
    <circle cx="110" cy="155" r="3" />
    <circle cx="30" cy="125" r="5" />
    <circle cx="5" cy="80" r="3" />
    <circle cx="15" cy="30" r="4" />
    <circle cx="60" cy="5" r="3" />
    <circle cx="140" cy="-5" r="5" />
    <circle cx="220" cy="5" r="4" />
  </svg>
);

/* ─── Slide Data ─────────────────────────────────────────────────────────── */
const SLIDES = [
  {
    id: 0,
    heading: "Smart Attendance",
    description: "Scan dynamic, location-verified QR codes for instant classroom presence.",
    bgColor: "#FF9EA8", // Pastel Pink
    illustration: <AttendanceIllustration />,
  },
  {
    id: 1,
    heading: "Assignments",
    description: "Submit digital assignments and receive instant, structured feedback.",
    bgColor: "#D5A8FF", // Pastel Purple
    illustration: <ScheduleIllustration />,
  },
  {
    id: 2,
    heading: "Course Hub",
    description: "Centralized access to all your syllabus, lecture slides, and past questions.",
    bgColor: "#7FCEFF", // Pastel Blue
    illustration: <SolutionIllustration />,
  },
  {
    id: 3,
    heading: "Real-time Analytics",
    description: "Monitor student progress and attendance trends with administrative dashboards.",
    bgColor: "#7FE0B2", // Pastel Green
    illustration: <AnalyticsIllustration />,
  },
  {
    id: 4,
    heading: "Class Announcements",
    description: "Stay updated with instant notifications for schedule changes or important news.",
    bgColor: "#FFD166", // Pastel Yellow
    illustration: <AnnouncementsIllustration />,
  },
];

function InteractiveHowItWorks() {
  const [activeTab, setActiveTab] = useState<"students" | "lecturers" | "institutions">("students");

  const content = {
    students: {
      title: "Our Student platform is the central hub for learning.",
      description: "Students can effortlessly track their attendance via QR codes, download course materials instantly, submit assignments seamlessly, and fill out daily logbooks. With a mobile-first approach, they can check schedules and view feedback right from their phones, turning everyday interactions into positive learning moments.",
      img: "/images/3d_abstract_emerald.jpg"
    },
    lecturers: {
      title: "Empower your teaching with real-time tools.",
      description: "Lecturers have full control over their digital classrooms. Generate live, time-sensitive QR codes to capture attendance accurately. Upload syllabi, create assignment deadlines, and review student submissions with ease. Our integrated grading system allows for instant feedback, ensuring students are always aligned with course expectations.",
      img: "/images/3d_dashboard_mockup.jpg"
    },
    institutions: {
      title: "Complete oversight for academic excellence.",
      description: "Administrators and institutions get a macro view of academic performance. Generate comprehensive weekly reports, monitor department-wide attendance trends, and ensure compliance with curriculum standards. Real-time analytics provide actionable insights to support students and staff effectively.",
      img: "/images/3d_abstract_emerald.jpg"
    }
  };

  return (
    <section id="how-it-works" className="w-full bg-[#103623] py-24 md:py-32 px-6 overflow-hidden">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-16">
        {/* Left Side */}
        <div className="w-full lg:w-5/12 flex flex-col pt-4">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tight">Users.</h2>
          <div className="space-y-8">
            <button 
              onClick={() => setActiveTab("students")}
              className={`text-left w-full text-3xl md:text-5xl font-black transition-colors duration-300 flex gap-4 items-start ${activeTab === "students" ? "text-[#FBBF24]" : "text-white/80 hover:text-white"}`}
            >
              <span className="text-sm font-medium mt-2">01</span> Students
            </button>
            <button 
              onClick={() => setActiveTab("lecturers")}
              className={`text-left w-full text-3xl md:text-5xl font-black transition-colors duration-300 flex gap-4 items-start ${activeTab === "lecturers" ? "text-[#FBBF24]" : "text-white/80 hover:text-white"}`}
            >
              <span className="text-sm font-medium mt-2">02</span> Lecturers
            </button>
            <button 
              onClick={() => setActiveTab("institutions")}
              className={`text-left w-full text-3xl md:text-5xl font-black transition-colors duration-300 flex gap-4 items-start ${activeTab === "institutions" ? "text-[#FBBF24]" : "text-white/80 hover:text-white"}`}
            >
              <span className="text-sm font-medium mt-2">03</span> Institutions
            </button>
          </div>
        </div>

        {/* Right Side */}
        <div className="w-full lg:w-7/12">
          <h2 className="text-4xl md:text-6xl font-black text-white mb-12 tracking-tight">Focus.</h2>
          
          <div className="bg-[#FEF2C7] rounded-[2rem] p-8 md:p-12 shadow-2xl relative overflow-hidden flex flex-col justify-between transform transition-all duration-500 min-h-[450px]">
            {/* Sun Icon */}
            <svg width="40" height="40" viewBox="0 0 24 24" fill="#F59E0B" xmlns="http://www.w3.org/2000/svg" className="mb-8 shrink-0">
              <path d="M12 2L14.39 5.26L18.5 4.5L19.26 8.61L22.5 11L19.26 13.39L18.5 17.5L14.39 16.74L12 20L9.61 16.74L5.5 17.5L4.74 13.39L1.5 11L4.74 8.61L5.5 4.5L9.61 5.26L12 2Z" />
            </svg>
            
            <div className="relative z-10 mb-8">
              <p className="text-slate-800 text-lg md:text-xl font-medium leading-relaxed">
                {content[activeTab].description}
              </p>
            </div>
            
            {/* Image mockup inside card at the bottom */}
            <div className="mt-auto -mx-12 -mb-12 rounded-t-3xl overflow-hidden shadow-2xl border-t border-white/50 relative h-64 md:h-80">
               <Image src={content[activeTab].img} alt={activeTab} fill className="object-cover" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

/* ─── Main Page ───────────────────────────────────────────────────────────── */
export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [active, setActive] = useState(1);
  const [direction, setDirection] = useState(1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Auto-redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      router.push(user.role === "student" ? "/student" : "/supervisor");
    }
  }, [user, loading, router]);

  // Handle mobile responsiveness
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    handleResize(); // Initial check
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Auto-switch carousel every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setActive((prev) => (prev + 1) % SLIDES.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const goTo = useCallback(
    (idx: number) => {
      setDirection(idx > active ? 1 : -1);
      setActive(idx);
    },
    [active]
  );

  const handleCta = useCallback(
    (type: "next" | "start" | "loop") => {
      if (type === "next") {
        const next = (active + 1) % SLIDES.length;
        setDirection(1);
        setActive(next);
      } else if (type === "loop") {
        setDirection(-1);
        setActive(0);
      } else {
        router.push("/login");
      }
    },
    [active, router]
  );

  if (loading) return null;

  // Indices for the 3-card display
  const leftIdx = (active - 1 + SLIDES.length) % SLIDES.length;
  const rightIdx = (active + 1) % SLIDES.length;

  return (
    <div className="w-full overflow-x-hidden bg-slate-50 font-sans selection:bg-emerald-200">
      
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md border-b border-slate-200 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-[#0a2e1a]">
            <PresenteLogoWhite size={28} />
            <span className="text-[#0a2e1a] text-lg font-extrabold tracking-[0.2em]">PRESENTE</span>
          </div>
          
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-slate-600">
            <button onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#1B8354] transition-colors">Features</button>
            <button onClick={() => document.getElementById("how-it-works")?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#1B8354] transition-colors">How it Works</button>
            <button onClick={() => document.getElementById("about")?.scrollIntoView({ behavior: 'smooth' })} className="hover:text-[#1B8354] transition-colors">About</button>
          </div>
          
          <div className="hidden md:flex items-center gap-4">
            <button 
              onClick={() => router.push("/login")}
              className="text-sm font-bold text-slate-600 hover:text-[#1B8354] transition-colors"
            >
              Sign In
            </button>
            <button 
              onClick={() => router.push("/auth/student/register")}
              className="px-5 py-2.5 bg-[#1B8354] text-white text-sm font-bold rounded-full hover:bg-[#156641] transition-colors shadow-sm"
            >
              Get Started
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className="md:hidden text-[#0a2e1a] focus:outline-none"
            onClick={() => setIsMobileMenuOpen(true)}
          >
            <IconMenu />
          </button>
        </div>

        {/* Mobile Sidebar */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <>
              {/* Backdrop */}
              <motion.div 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }} 
                exit={{ opacity: 0 }} 
                onClick={() => setIsMobileMenuOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm"
              />
              
              {/* Sidebar */}
              <motion.div 
                initial={{ x: "100%" }}
                animate={{ x: 0 }}
                exit={{ x: "100%" }}
                transition={{ type: "spring", bounce: 0, duration: 0.4 }}
                className="fixed top-0 right-0 w-64 h-[100dvh] bg-[#0a2e1a] border-l border-white/10 shadow-2xl z-50 md:hidden flex flex-col p-6"
              >
                <div className="flex justify-end mb-8">
                  <button 
                    className="text-white focus:outline-none p-2 bg-white/5 rounded-full hover:bg-white/10 transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    <IconClose />
                  </button>
                </div>
                
                <div className="flex flex-col gap-6">
                  <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-emerald-100 hover:text-white transition-colors">Features</Link>
                  <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-emerald-100 hover:text-white transition-colors">How it Works</Link>
                  <Link href="#" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-medium text-emerald-100 hover:text-white transition-colors">About</Link>
                  
                  <div className="pt-6 mt-2 border-t border-white/10 flex flex-col gap-4">
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); router.push("/login"); }}
                      className="w-full py-3 text-sm font-bold text-emerald-100 hover:text-white hover:bg-white/5 rounded-xl transition-colors"
                    >
                      Sign In
                    </button>
                    <button 
                      onClick={() => { setIsMobileMenuOpen(false); router.push("/auth/student/register"); }}
                      className="w-full px-4 py-3 bg-emerald-500 text-white text-sm font-bold rounded-xl hover:bg-emerald-400 shadow-sm transition-colors"
                    >
                      Get Started
                    </button>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </nav>

      {/* ─── Hero Section ─── */}
      <section 
        className="min-h-[100dvh] w-full flex flex-col items-center justify-start pt-24 relative overflow-hidden bg-slate-50"
      >
        {/* University Background Image */}
        <div className="absolute inset-0 z-0">
          <Image 
            src="/images/modern_university_bg.jpg" 
            alt="Modern University Campus" 
            fill 
            className="object-cover" 
            priority
          />
          {/* Light overlay to maintain text readability without hiding the image */}
          <div className="absolute inset-0 bg-white/40" />
        </div>

        {/* Exact Grid Background */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-[0.15] z-0"
          style={{ 
            backgroundImage: "linear-gradient(#1B8354 1.5px, transparent 1.5px), linear-gradient(90deg, #1B8354 1.5px, transparent 1.5px)",
            backgroundSize: "100px 100px",
            transform: "perspective(1000px) rotateX(60deg) scale(3) translateY(-10%)",
            transformOrigin: "top center"
          }} 
        />
        
        {/* Exact Hero Content */}
        <div className="w-full flex flex-col items-center pt-10 md:pt-16 pb-16 px-6 text-center z-10 max-w-5xl mx-auto">
          
          {/* Splash Badge */}
          <div className="relative inline-flex items-center justify-center mb-10 mt-8">
            <SplashIcon />
            <span className="relative text-white text-xl md:text-2xl font-black tracking-tight z-10 px-8 py-2">
              Smart & Secure
            </span>
          </div>

          <h1 className="text-4xl md:text-5xl lg:text-[4.5rem] font-black text-[#1a1a1a] tracking-tighter mb-6 leading-[1.1] max-w-4xl mx-auto">
            The complete school management platform
          </h1>

          <p className="text-slate-600 text-base md:text-xl font-medium leading-relaxed mb-10 px-4 max-w-2xl mx-auto">
            PRESENTE unifies attendance tracking, course uploads, and assignment feedback into one powerful system for students, lecturers, and institutions.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 w-full px-4">
            <button 
              onClick={() => router.push("/auth/student/register")}
              className="w-full sm:w-auto px-8 py-3.5 bg-[#1B8354] text-white text-base font-bold rounded-full hover:bg-[#156641] transition-colors shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
            >
              Get started <span className="text-lg">&rarr;</span>
            </button>
            <button 
              onClick={() => {
                const aboutSec = document.getElementById("about");
                if(aboutSec) aboutSec.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 bg-white text-[#1B8354] border-2 border-slate-200 text-base font-bold rounded-full hover:border-[#1B8354] hover:bg-emerald-50 transition-colors shadow-sm flex items-center justify-center gap-3"
            >
              <IconCalendar /> View Dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ─── FEATURES SECTION ─── */}
      <section id="features" className="w-full bg-white py-24 md:py-32 px-6 border-t border-slate-100 overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-12 md:mb-16 flex flex-col items-center">
            {/* The Reality Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-slate-200 bg-white shadow-sm mb-6">
              <div className="w-2 h-2 rounded-full bg-[#EF4444] animate-pulse" />
              <span className="text-sm font-bold text-slate-700">The Reality</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-black text-[#0a2e1a] mb-6 tracking-tight leading-tight">
              Managing your school day is chaotic.
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-medium leading-relaxed max-w-2xl">
              Missing attendance records, scattered lecture slides, and lost assignments.<br className="hidden md:block"/>
              Keeping track of academics shouldn't be a daily struggle.
            </p>
          </div>
          
          {/* Shuffling Features Carousel matching Image */}
          <div className="w-full max-w-6xl mx-auto relative flex justify-center items-center h-[450px] md:h-[550px] pb-10" style={{ perspective: "1500px" }}>
            {SLIDES.map((slide, i) => {
              const isCenter = i === active;
              const isLeft1 = i === (active - 1 + SLIDES.length) % SLIDES.length;
              const isRight1 = i === (active + 1) % SLIDES.length;
              const isLeft2 = i === (active - 2 + SLIDES.length) % SLIDES.length;
              const isRight2 = i === (active + 2) % SLIDES.length;
              
              let x = "0%";
              let rotateY = 0;
              let scale = isMobile ? 0.85 : 1;
              let zIndex = 0;
              let opacity = 0;
              let z = 0;

              if (isCenter) {
                x = "0%";
                rotateY = 0;
                zIndex = 30;
                opacity = 1;
                scale = 1;
                z = 0;
              } else if (isLeft1) {
                x = isMobile ? "-50%" : "-65%";
                rotateY = 15;
                scale = 0.85;
                zIndex = 20;
                opacity = 1;
                z = -100;
              } else if (isRight1) {
                x = isMobile ? "50%" : "65%";
                rotateY = -15;
                scale = 0.85;
                zIndex = 20;
                opacity = 1;
                z = -100;
              } else if (isLeft2) {
                x = isMobile ? "-90%" : "-125%";
                rotateY = 25;
                scale = 0.7;
                zIndex = 10;
                opacity = 0.8;
                z = -200;
              } else if (isRight2) {
                x = isMobile ? "90%" : "125%";
                rotateY = -25;
                scale = 0.7;
                zIndex = 10;
                opacity = 0.8;
                z = -200;
              }

              return (
                <motion.div
                  key={slide.id}
                  className="absolute cursor-pointer"
                  style={{ zIndex }}
                  initial={false}
                  animate={{ x, scale, rotateY, opacity, z }}
                  transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
                  onClick={() => {
                    if (!isCenter) goTo(i);
                  }}
                >
                  <FeatureCard slide={slide} isActive={isCenter} />
                </motion.div>
              );
            })}
          </div>
          
          {/* Pagination Dots */}
          <div className="flex justify-center gap-2.5 items-center mt-6">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="transition-all duration-300"
              >
                <motion.div
                  animate={{
                    width: i === active ? 28 : 8,
                    backgroundColor: i === active ? "#1B8354" : "#CBD5E1",
                  }}
                  className="h-2 rounded-full"
                  transition={{ duration: 0.3 }}
                />
              </button>
            ))}
          </div>
          
          {/* Bottom Info Section - The Core Dilemma */}
          <div className="mt-20 md:mt-24 relative w-full py-16 px-6 flex flex-col items-center text-center overflow-hidden">
            {/* Subtle background clouds matching the image */}
            <div className="absolute inset-0 pointer-events-none z-0">
              <div className="absolute top-10 left-1/4 w-[300px] h-[300px] bg-purple-200/40 rounded-full blur-[80px]" />
              <div className="absolute bottom-10 right-1/4 w-[400px] h-[300px] bg-purple-300/30 rounded-full blur-[100px]" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-white/60 blur-[40px]" />
            </div>

            <div className="relative z-10 flex flex-col items-center w-full max-w-3xl">
              <div className="inline-flex items-center px-4 py-1.5 rounded bg-emerald-100 mb-6">
                <span className="text-[11px] font-black text-[#1B8354] tracking-[0.15em] uppercase">The PRESENTE Solution</span>
              </div>
              
              <h3 className="text-2xl md:text-4xl font-black text-[#0a2e1a] mb-6 tracking-tight">
                “Everything you need, in one place.”
              </h3>
              
              <p className="text-slate-600 text-base md:text-lg font-medium leading-relaxed max-w-2xl">
                When attendance, coursework, grading, and timetables are seamlessly integrated into a single platform, students and lecturers can finally focus on what matters most—learning.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CONNECTIONS DIAGRAM SECTION (HORIZONTAL) ─── */}
      <section className="w-full bg-white py-24 px-6 relative overflow-hidden flex flex-col items-center">
        <div className="text-center max-w-3xl mx-auto mb-16 md:mb-24 z-10 relative">
          <h2 className="text-3xl md:text-5xl font-black text-[#0a2e1a] mb-6 tracking-tight leading-tight">
            Everything connects into one study plan.
          </h2>
          <p className="text-slate-500 text-lg md:text-xl font-medium">
            Your schedule, materials, and exams synced in real time.
          </p>
        </div>


        {/* ─── CONNECTIONS DIAGRAM (TRUE COMPACT SIDEWAYS FOR MOBILE) ─── */}
        <div className="w-full overflow-hidden pb-8 px-2 md:px-4">
          <div className="relative w-full max-w-[1200px] mx-auto flex flex-row items-center justify-between min-h-[300px] md:min-h-[500px] gap-2 md:gap-10">
            
            {/* Subtle green fill background */}
            <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden flex justify-center items-center">
              <div className="w-full h-full max-w-[800px] max-h-[800px] bg-emerald-100/60 rounded-full blur-[80px] md:blur-[120px] mix-blend-multiply opacity-80" />
            </div>

            {/* SVG Connections Container */}
            <div className="absolute inset-0 pointer-events-none z-0">
              
              {/* 1. PATHS (Using viewBox 0 0 100 100 for responsive stretching) */}
              <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_6px_rgba(110,231,183,0.3)]" viewBox="0 0 100 100" preserveAspectRatio="none">
                <style>
                  {`
                    @keyframes waterFlow {
                      from { stroke-dashoffset: 32; }
                      to { stroke-dashoffset: 0; }
                    }
                    .flow-active {
                      stroke-dasharray: 12 20;
                      animation: waterFlow 1.2s linear infinite;
                      stroke-linecap: round;
                    }
                  `}
                </style>
                <defs>
                  {/* Very faint base path */}
                  <linearGradient id="basePathDark" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#D1FAE5" stopOpacity="0.8" />
                    <stop offset="100%" stopColor="#D1FAE5" stopOpacity="0.8" />
                  </linearGradient>
                  {/* Very light green glowing flow */}
                  <linearGradient id="flowHighlight" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#A7F3D0" stopOpacity="0.9" />
                    <stop offset="50%" stopColor="#6EE7B7" stopOpacity="1" />
                    <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.9" />
                  </linearGradient>
                </defs>

                {/* LEFT TO CENTER PATHS */}
                <path d="M 33 15 L 36 15 L 42 45 L 48 45" stroke="url(#basePathDark)" strokeWidth="2" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <path d="M 33 15 L 36 15 L 42 45 L 48 45" stroke="url(#flowHighlight)" strokeWidth="3" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="flow-active" />
                
                <path d="M 33 38 L 36 38 L 42 48 L 48 48" stroke="url(#basePathDark)" strokeWidth="2" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <path d="M 33 38 L 36 38 L 42 48 L 48 48" stroke="url(#flowHighlight)" strokeWidth="3" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="flow-active" />
                
                <path d="M 33 62 L 36 62 L 42 52 L 48 52" stroke="url(#basePathDark)" strokeWidth="2" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <path d="M 33 62 L 36 62 L 42 52 L 48 52" stroke="url(#flowHighlight)" strokeWidth="3" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="flow-active" />
                
                <path d="M 33 85 L 36 85 L 42 55 L 48 55" stroke="url(#basePathDark)" strokeWidth="2" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <path d="M 33 85 L 36 85 L 42 55 L 48 55" stroke="url(#flowHighlight)" strokeWidth="3" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="flow-active" />


                {/* CENTER TO RIGHT PATHS */}
                <path d="M 52 45 L 58 45 L 64 15 L 67 15" stroke="url(#basePathDark)" strokeWidth="2" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <path d="M 52 45 L 58 45 L 64 15 L 67 15" stroke="url(#flowHighlight)" strokeWidth="3" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="flow-active" />
                
                <path d="M 52 48 L 58 48 L 64 38 L 67 38" stroke="url(#basePathDark)" strokeWidth="2" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <path d="M 52 48 L 58 48 L 64 38 L 67 38" stroke="url(#flowHighlight)" strokeWidth="3" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="flow-active" />
                
                <path d="M 52 52 L 58 52 L 64 62 L 67 62" stroke="url(#basePathDark)" strokeWidth="2" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <path d="M 52 52 L 58 52 L 64 62 L 67 62" stroke="url(#flowHighlight)" strokeWidth="3" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="flow-active" />
                
                <path d="M 52 55 L 58 55 L 64 85 L 67 85" stroke="url(#basePathDark)" strokeWidth="2" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
                <path d="M 52 55 L 58 55 L 64 85 L 67 85" stroke="url(#flowHighlight)" strokeWidth="3" fill="none" strokeLinejoin="round" vectorEffect="non-scaling-stroke" className="flow-active" />
              </svg>

              {/* 2. DOTS (Very light green) */}
              <svg className="absolute inset-0 w-full h-full filter drop-shadow-[0_0_4px_rgba(110,231,183,0.5)]">
                {/* DOTS (Left Side) */}
                <circle cx="33%" cy="15%" r="4" fill="#6EE7B7" />
                <circle cx="33%" cy="38%" r="4" fill="#6EE7B7" />
                <circle cx="33%" cy="62%" r="4" fill="#6EE7B7" />
                <circle cx="33%" cy="85%" r="4" fill="#6EE7B7" />

                {/* DOTS (Center Side) */}
                <circle cx="48%" cy="45%" r="4.5" fill="#6EE7B7" />
                <circle cx="52%" cy="45%" r="4.5" fill="#6EE7B7" />
                
                {/* DOTS (Right Side) */}
                <circle cx="67%" cy="15%" r="4" fill="#6EE7B7" />
                <circle cx="67%" cy="38%" r="4" fill="#6EE7B7" />
                <circle cx="67%" cy="62%" r="4" fill="#6EE7B7" />
                <circle cx="67%" cy="85%" r="4" fill="#6EE7B7" />
              </svg>
            </div>

            {/* Left Column: 4 Input Cards */}
            <div className="flex flex-col justify-between h-[250px] md:h-[400px] w-[36%] md:w-[28%] relative z-10 gap-1.5 md:gap-0 perspective-[1000px]">
              
              {/* Live Attendance */}
              <div className="flex items-center p-1.5 md:p-4 bg-gradient-to-br from-white to-emerald-50/20 border-[1px] border-emerald-100 border-b-[3px] md:border-b-[4px] border-b-emerald-200 rounded-lg md:rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100/50">
                  <IconQrCode />
                </div>
                <div className="ml-1.5 md:ml-4 overflow-hidden">
                  <h4 className="text-[9px] md:text-[15px] font-semibold text-slate-800 leading-tight truncate">Live Attendance</h4>
                  <p className="hidden md:block text-xs text-slate-500 mt-0.5 truncate">Secure QR location scans</p>
                </div>
              </div>

              {/* Course Materials */}
              <div className="flex items-center p-1.5 md:p-4 bg-gradient-to-br from-white to-emerald-50/20 border-[1px] border-emerald-100 border-b-[3px] md:border-b-[4px] border-b-emerald-200 rounded-lg md:rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100/50">
                  <IconUploadCloud />
                </div>
                <div className="ml-1.5 md:ml-4 overflow-hidden">
                  <h4 className="text-[9px] md:text-[15px] font-semibold text-slate-800 leading-tight truncate">Course Materials</h4>
                  <p className="hidden md:block text-xs text-slate-500 mt-0.5 truncate">Syllabi, notes & slides</p>
                </div>
              </div>

              {/* Student Assignments */}
              <div className="flex items-center p-1.5 md:p-4 bg-gradient-to-br from-white to-emerald-50/20 border-[1px] border-emerald-100 border-b-[3px] md:border-b-[4px] border-b-emerald-200 rounded-lg md:rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100/50">
                  <IconFileText />
                </div>
                <div className="ml-1.5 md:ml-4 overflow-hidden">
                  <h4 className="text-[9px] md:text-[15px] font-semibold text-slate-800 leading-tight truncate">Assignments</h4>
                  <p className="hidden md:block text-xs text-slate-500 mt-0.5 truncate">Submissions & deadlines</p>
                </div>
              </div>

              {/* Supervisor Logs */}
              <div className="flex items-center p-1.5 md:p-4 bg-gradient-to-br from-white to-emerald-50/20 border-[1px] border-emerald-100 border-b-[3px] md:border-b-[4px] border-b-emerald-200 rounded-lg md:rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100/50">
                  <IconBookOpen />
                </div>
                <div className="ml-1.5 md:ml-4 overflow-hidden">
                  <h4 className="text-[9px] md:text-[15px] font-semibold text-slate-800 leading-tight truncate">Supervisor Logs</h4>
                  <p className="hidden md:block text-xs text-slate-500 mt-0.5 truncate">Logbook signoffs & notes</p>
                </div>
              </div>

            </div>

            {/* Center Node (3D Enhanced - Light Green) */}
            <div className="relative z-20 bg-gradient-to-b from-white to-emerald-50/50 border-[2px] border-emerald-100 border-b-[6px] md:border-b-[8px] border-b-emerald-200 rounded-2xl md:rounded-[2.5rem] p-4 md:p-10 shadow-xl flex flex-col items-center transform hover:scale-105 hover:-translate-y-2 transition-all duration-500 shrink-0">
              {/* Outer glowing ring behind the node (much softer) */}
              <div className="absolute inset-0 -z-10 rounded-full bg-emerald-200 blur-2xl opacity-30 animate-pulse" />
              
              {/* Styled 'P' */}
              <div className="relative z-10 flex items-center justify-center w-12 h-12 md:w-24 md:h-24 rounded-full bg-emerald-50 shadow-inner border-[2px] md:border-[4px] border-white">
                <span className="text-3xl md:text-6xl font-black text-transparent bg-clip-text bg-gradient-to-br from-emerald-400 to-emerald-300 drop-shadow-sm" style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>
                  P
                </span>
              </div>

              {/* Project Name Pill */}
              <div className="relative z-10 mt-2 md:mt-4 bg-emerald-50/80 border border-emerald-100 shadow-sm text-[#059669] text-[8px] md:text-[14px] font-black px-3 md:px-6 py-1 md:py-2 rounded-full flex items-center gap-1.5 md:gap-2.5 tracking-widest uppercase">
                <div className="w-1.5 h-1.5 md:w-2.5 md:h-2.5 rounded-full bg-emerald-400 shadow-[0_0_4px_rgba(52,211,153,0.5)] animate-pulse" /> PRESENTE
              </div>
            </div>

            {/* Right Column: 4 Output Cards */}
            <div className="flex flex-col justify-between h-[250px] md:h-[400px] w-[36%] md:w-[28%] relative z-10 gap-1.5 md:gap-0 perspective-[1000px]">
              
              {/* Presence Analytics */}
              <div className="flex items-center p-1.5 md:p-4 bg-gradient-to-br from-white to-emerald-50/20 border-[1px] border-emerald-100 border-b-[3px] md:border-b-[4px] border-b-emerald-200 rounded-lg md:rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100/50">
                  <IconBarChart />
                </div>
                <div className="ml-1.5 md:ml-4 overflow-hidden">
                  <h4 className="text-[9px] md:text-[15px] font-semibold text-slate-800 leading-tight truncate">Presence Analytics</h4>
                  <p className="hidden md:block text-xs text-slate-500 mt-0.5 truncate">Real-time tracking trends</p>
                </div>
              </div>

              {/* Automated Grades */}
              <div className="flex items-center p-1.5 md:p-4 bg-gradient-to-br from-white to-emerald-50/20 border-[1px] border-emerald-100 border-b-[3px] md:border-b-[4px] border-b-emerald-200 rounded-lg md:rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100/50">
                  <IconShieldCheck />
                </div>
                <div className="ml-1.5 md:ml-4 overflow-hidden">
                  <h4 className="text-[9px] md:text-[15px] font-semibold text-slate-800 leading-tight truncate">Automated Grades</h4>
                  <p className="hidden md:block text-xs text-slate-500 mt-0.5 truncate">Instant task feedback</p>
                </div>
              </div>

              {/* Weekly Reports */}
              <div className="flex items-center p-1.5 md:p-4 bg-gradient-to-br from-white to-emerald-50/20 border-[1px] border-emerald-100 border-b-[3px] md:border-b-[4px] border-b-emerald-200 rounded-lg md:rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100/50">
                  <IconActivity />
                </div>
                <div className="ml-1.5 md:ml-4 overflow-hidden">
                  <h4 className="text-[9px] md:text-[15px] font-semibold text-slate-800 leading-tight truncate">Weekly Reports</h4>
                  <p className="hidden md:block text-xs text-slate-500 mt-0.5 truncate">Auto-compiled summaries</p>
                </div>
              </div>

              {/* Smart Timetables */}
              <div className="flex items-center p-1.5 md:p-4 bg-gradient-to-br from-white to-emerald-50/20 border-[1px] border-emerald-100 border-b-[3px] md:border-b-[4px] border-b-emerald-200 rounded-lg md:rounded-2xl shadow-sm hover:shadow-md transform hover:-translate-y-1 transition-all duration-300">
                <div className="w-6 h-6 md:w-12 md:h-12 rounded-lg md:rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0 border border-emerald-100/50">
                  <IconCalendar />
                </div>
                <div className="ml-1.5 md:ml-4 overflow-hidden">
                  <h4 className="text-[9px] md:text-[15px] font-semibold text-slate-800 leading-tight truncate">Smart Timetables</h4>
                  <p className="hidden md:block text-xs text-slate-500 mt-0.5 truncate">Synced personal schedules</p>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ─── LECTURER DASHBOARD MOCKUP SECTION ─── */}
      <section className="w-full bg-white py-24 md:py-32 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
          
          {/* Left Text Content */}
          <div className="w-full lg:w-5/12 relative z-10">
            {/* Subtle ambient blob behind the text */}
            <div className="absolute -top-10 -left-20 w-80 h-80 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-3xl -z-10" />
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-black text-[#0a2e1a] leading-[1.1] mb-6 tracking-tight drop-shadow-sm">
              Manage your classroom <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B8354] to-emerald-400">with absolute clarity.</span>
            </h2>
            <p className="text-slate-600 text-lg md:text-xl font-medium leading-relaxed mb-10 max-w-lg">
              PRESENTE's lecturer dashboard gives you real-time insights into attendance, submissions, and student engagement without the administrative headache.
            </p>

            <div className="space-y-5">
              
              {/* Feature Card 1 */}
              <div className="group flex items-start gap-5 p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white hover:shadow-[0_8px_30px_rgba(16,185,129,0.12)] hover:border-emerald-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-200 text-emerald-700 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <IconQrCode />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-emerald-700 transition-colors">Live Attendance Tracking</h4>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">Generate session QRs and watch students check in instantly on your screen.</p>
                </div>
              </div>

              {/* Feature Card 2 */}
              <div className="group flex items-start gap-5 p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white hover:shadow-[0_8px_30px_rgba(59,130,246,0.12)] hover:border-blue-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <IconFileText />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-blue-700 transition-colors">Streamlined Grading</h4>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">Review student submissions and assign grades in a unified workflow.</p>
                </div>
              </div>

              {/* Feature Card 3 */}
              <div className="group flex items-start gap-5 p-5 rounded-2xl bg-white/60 backdrop-blur-xl border border-white/80 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:bg-white hover:shadow-[0_8px_30px_rgba(168,85,247,0.12)] hover:border-purple-100 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700 flex items-center justify-center shrink-0 shadow-inner group-hover:scale-110 transition-transform duration-300">
                  <IconActivity />
                </div>
                <div>
                  <h4 className="text-lg font-extrabold text-slate-900 group-hover:text-purple-700 transition-colors">Instant Student Feedback</h4>
                  <p className="text-slate-500 text-sm mt-1.5 leading-relaxed">Leave comments and feedback on assignments that students see immediately.</p>
                </div>
              </div>

            </div>
          </div>

          {/* Right Mockup */}
          <div className="w-full lg:w-7/12 relative">
            {/* Background Blob */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-emerald-100/50 to-blue-50/50 rounded-full blur-3xl -z-10" />
            
            {/* Window Mockup */}
            <div className="w-full bg-white rounded-2xl md:rounded-3xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] border border-slate-200 overflow-hidden relative z-10 transform rotate-1 hover:rotate-0 transition-transform duration-500">
              {/* Window Header */}
              <div className="bg-slate-50 border-b border-slate-200 px-4 py-3 flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-red-400" />
                <div className="w-3 h-3 rounded-full bg-amber-400" />
                <div className="w-3 h-3 rounded-full bg-green-400" />
                <div className="mx-auto text-xs font-semibold text-slate-400">Lecturer Dashboard</div>
              </div>
              
              {/* Window Body */}
              <div className="p-6 md:p-8 flex gap-6">
                {/* Sidebar Mock */}
                <div className="hidden md:flex flex-col gap-4 w-1/4 border-r border-slate-100 pr-4">
                  <div className="w-full h-8 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center px-2 gap-2">
                    <div className="w-4 h-4 bg-emerald-200 rounded shrink-0" />
                    <div className="w-12 h-2 bg-emerald-600/30 rounded" />
                  </div>
                  <div className="w-3/4 h-6 bg-slate-50 rounded-lg flex items-center px-2 gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded shrink-0" />
                  </div>
                  <div className="w-5/6 h-6 bg-slate-50 rounded-lg flex items-center px-2 gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded shrink-0" />
                  </div>
                  <div className="w-2/3 h-6 bg-slate-50 rounded-lg flex items-center px-2 gap-2">
                    <div className="w-4 h-4 bg-slate-200 rounded shrink-0" />
                  </div>
                  <div className="mt-auto w-full h-24 bg-gradient-to-b from-slate-50 to-white rounded-xl border border-slate-100 p-4">
                     <div className="w-8 h-8 rounded-full bg-emerald-100 mb-2" />
                     <div className="w-1/2 h-2 bg-slate-200 rounded" />
                  </div>
                </div>

                {/* Main Content Mock */}
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-6">
                    <div>
                      <div className="w-24 h-3 bg-slate-300 rounded mb-2" />
                      <div className="w-40 h-6 bg-slate-800 rounded-lg" />
                    </div>
                    <div className="w-24 h-8 bg-emerald-500 rounded-lg shadow-sm flex items-center justify-center">
                      <div className="w-10 h-2 bg-white/80 rounded" />
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="w-16 h-2 bg-slate-300 rounded mb-3" />
                      <div className="w-10 h-5 bg-slate-800 rounded" />
                    </div>
                    <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-100 shadow-sm relative overflow-hidden">
                      <div className="absolute right-0 top-0 bottom-0 w-8 bg-emerald-100/50" />
                      <div className="w-20 h-2 bg-emerald-300 rounded mb-3 relative z-10" />
                      <div className="w-14 h-5 bg-emerald-700 rounded relative z-10" />
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
                      <div className="w-14 h-2 bg-slate-300 rounded mb-3" />
                      <div className="w-8 h-5 bg-slate-800 rounded" />
                    </div>
                  </div>

                  {/* List Mock (Attendance/Submissions) */}
                  <div className="space-y-3">
                    <div className="w-full p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center px-4 gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                      <div className="w-24 h-3 bg-slate-700 rounded" />
                      <div className="w-16 h-4 bg-emerald-100 rounded-full ml-auto flex items-center justify-center">
                        <div className="w-6 h-1 bg-emerald-500 rounded" />
                      </div>
                    </div>
                    <div className="w-full p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center px-4 gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                      <div className="w-20 h-3 bg-slate-700 rounded" />
                      <div className="w-16 h-4 bg-emerald-100 rounded-full ml-auto flex items-center justify-center">
                        <div className="w-6 h-1 bg-emerald-500 rounded" />
                      </div>
                    </div>
                    <div className="w-full p-3 border border-slate-100 bg-slate-50/50 rounded-xl flex items-center px-4 gap-4 hover:bg-slate-50 transition-colors cursor-pointer">
                      <div className="w-8 h-8 rounded-full bg-slate-200 shrink-0" />
                      <div className="w-28 h-3 bg-slate-700 rounded" />
                      <div className="w-20 h-4 bg-amber-100 rounded-full ml-auto flex items-center justify-center">
                        <div className="w-10 h-1 bg-amber-500 rounded" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>
      </section>

      <InteractiveHowItWorks />

      {/* ─── ABOUT SECTION ─── */}
      <section id="about" className="w-full bg-slate-50 py-32 px-6 text-slate-900 border-t border-emerald-900/10 relative overflow-hidden">
        {/* Background decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-[20%] -right-[10%] w-[50%] h-[50%] rounded-full bg-emerald-200/40 blur-[120px]" />
          <div className="absolute top-[60%] -left-[10%] w-[40%] h-[40%] rounded-full bg-emerald-300/30 blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-auto">
            
            {/* Title / Intro Box (Spans 8 columns) */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6 }}
              className="md:col-span-8 bg-white p-8 md:p-12 rounded-[2rem] border border-white/50 shadow-2xl shadow-emerald-900/5 flex flex-col justify-center relative overflow-hidden group"
            >
              {/* Subtle background pattern/shape */}
              <div className="absolute -bottom-20 -right-20 w-80 h-80 bg-gradient-to-br from-emerald-100/50 to-transparent rounded-full blur-3xl" />
              
              {/* 3D Model Image with multiply blending */}
              <div className="absolute -right-20 top-1/2 -translate-y-1/2 w-[300px] h-[300px] lg:w-[400px] lg:h-[400px] pointer-events-none mix-blend-multiply opacity-80 group-hover:scale-105 group-hover:rotate-3 transition-transform duration-1000 hidden md:block">
                <Image src="/images/3d_abstract_emerald.jpg" alt="3D Emerald Shapes" width={600} height={600} className="object-contain" />
              </div>

              <h2 className="text-3xl md:text-5xl font-extrabold tracking-tight mb-4 text-[#0a2e1a] leading-[1.1] relative z-10 w-full md:w-2/3">
                Redefining the <br/>
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#1B8354] to-emerald-400">School Experience</span>
              </h2>
              <p className="text-slate-600 text-base md:text-lg max-w-xl relative z-10 font-medium leading-relaxed w-full md:w-3/4">
                PRESENTE brings students, lecturers, and institutions together on a single, seamlessly integrated platform designed to manage attendance, course materials, and assignments effortlessly.
              </p>
            </motion.div>

            {/* Students Box (Spans 4 columns) */}
            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="md:col-span-4 bg-gradient-to-br from-[#0a2e1a] to-[#0F5A37] p-6 md:p-8 rounded-[2rem] text-white shadow-2xl shadow-emerald-900/20 flex flex-col justify-between group cursor-pointer overflow-hidden relative min-h-[250px]"
            >
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl transform group-hover:scale-150 transition-transform duration-700" />
              <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center mb-6 backdrop-blur-md relative z-10">
                <div className="scale-110"><IconFileText /></div>
              </div>
              <div className="relative z-10">
                <h3 className="text-xl md:text-2xl font-bold mb-2">For Students</h3>
                <p className="text-emerald-100/80 text-sm leading-relaxed">
                  Effortlessly track your attendance, download course materials, and submit assignments. Stay on top of your academic tasks without the hassle.
                </p>
              </div>
            </motion.div>

            {/* Lecturers Box (Spans 6 columns) */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="md:col-span-6 bg-[#E6F4ED] p-6 md:p-8 rounded-[2rem] flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-slate-200/50 group cursor-pointer"
            >
              <div className="w-16 h-16 shrink-0 bg-white rounded-2xl flex items-center justify-center text-[#1B8354] shadow-sm transform group-hover:-translate-y-2 group-hover:rotate-3 transition-all duration-300">
                <div className="scale-125"><IconShieldCheck /></div>
              </div>
              <div className="text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#0a2e1a]">For Lecturers</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Upload lectures, review student submissions, and provide instant feedback on assignments. Use dynamic QR codes for secure, one-click classroom attendance.
                </p>
              </div>
            </motion.div>

            {/* Institutions Box (Spans 6 columns) */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="md:col-span-6 bg-white p-6 md:p-8 rounded-[2rem] border border-slate-100 flex flex-col md:flex-row items-center gap-6 shadow-xl shadow-slate-200/50 group cursor-pointer relative overflow-hidden"
            >
              {/* 3D Dashboard Image */}
              <div className="absolute right-0 bottom-0 w-[150px] h-[150px] md:w-[250px] md:h-[250px] pointer-events-none mix-blend-multiply opacity-20 transform translate-x-10 translate-y-10 group-hover:translate-x-5 group-hover:translate-y-5 transition-transform duration-700">
                <Image src="/images/3d_dashboard_mockup.jpg" alt="3D Dashboard" width={400} height={400} className="object-contain" />
              </div>

              <div className="w-16 h-16 shrink-0 bg-emerald-50 rounded-2xl flex items-center justify-center text-[#1B8354] shadow-sm transform group-hover:-translate-y-2 group-hover:-rotate-3 transition-all duration-300 relative z-10">
                <div className="scale-125"><IconActivity /></div>
              </div>
              <div className="relative z-10 text-center md:text-left">
                <h3 className="text-xl md:text-2xl font-bold mb-2 text-[#0a2e1a]">For Institutions</h3>
                <p className="text-slate-600 text-sm leading-relaxed">
                  Gain real-time insights and comprehensive analytics on academic progress, ensuring high standards across all courses and departments.
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* ─── CTA & FOOTER ─── */}
      <section className="relative w-full bg-[#03150C] text-white overflow-hidden flex flex-col items-center">
        {/* Decorative background glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Dotted pattern overlay */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#10B981 1px, transparent 1px)', backgroundSize: '32px 32px' }} />

        {/* CTA Content */}
        <div className="relative z-10 max-w-4xl mx-auto px-6 py-24 md:py-32 text-center flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tight drop-shadow-lg">
            Take control of your semester.
          </h2>
          <p className="text-emerald-50/70 text-lg md:text-xl font-medium mb-10 max-w-2xl leading-relaxed">
            Plan your week, master your courses, and walk into exam halls with total confidence.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-center">
            <button 
              onClick={() => router.push("/login")}
              className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-white font-bold transition-all duration-300 shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center gap-2 group w-full sm:w-auto justify-center"
            >
              Go to Your Dashboard
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="transform group-hover:translate-x-1 transition-transform">
                <path d="M5 12h14M12 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
            <button 
              onClick={() => router.push("/login")}
              className="px-8 py-4 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-emerald-50 font-bold transition-colors flex items-center gap-2 w-full sm:w-auto justify-center"
            >
              <IconCalendar />
              View Timetable
            </button>
          </div>
        </div>

        {/* Footer Content */}
        <footer className="w-full bg-[#111111] border-t border-white/5 relative z-10 pt-16 pb-8 px-6">
          <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
            
            {/* Left Column (Logo, Description, Contact Card) */}
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-4 mb-6">
                <PresenteLogoWhite size={32} />
                <span className="text-2xl font-black tracking-tight text-white">PRESENTE</span>
                <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-300 bg-emerald-900/40 border border-emerald-500/20 px-3 py-1.5 rounded-full">
                  Academic Planner
                </span>
              </div>
              <p className="text-slate-400 text-sm max-w-sm leading-relaxed mb-8">
                Built for university students to organize schedules, track real subject understanding, and walk into exam halls completely prepared.
              </p>
              
              {/* Help Desk Card */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-4 max-w-sm">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500/20 to-emerald-900/40 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-400">
                  <IconActivity />
                </div>
                <div>
                  <h5 className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Student Help Desk</h5>
                  <div className="flex items-center gap-2 text-white font-bold mb-0.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                    +1 (800) 555-0199
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-xs">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                    support@presente.com
                  </div>
                </div>
              </div>
            </div>
            
            {/* Middle Column 1 */}
            <div>
              <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">Academic Tools</h4>
              <ul className="space-y-4">
                <li><button onClick={() => router.push("/login")} className="text-slate-400 hover:text-white text-sm transition-colors">Student Dashboard</button></li>
                <li><button onClick={() => router.push("/login")} className="text-slate-400 hover:text-white text-sm transition-colors">Timetable & Classes</button></li>
                <li><button onClick={() => router.push("/login")} className="text-slate-400 hover:text-white text-sm transition-colors">Exam Readiness</button></li>
                <li><button onClick={() => router.push("/login")} className="text-slate-400 hover:text-white text-sm transition-colors">Active Study & Flashcards</button></li>
                <li><button onClick={() => router.push("/login")} className="text-slate-400 hover:text-white text-sm transition-colors">Course Materials</button></li>
              </ul>
            </div>

            {/* Middle Column 2 */}
            <div>
              <h4 className="text-white font-bold mb-6 text-sm tracking-wider uppercase">Presente Platform</h4>
              <ul className="space-y-4">
                <li><button className="text-slate-400 hover:text-white text-sm transition-colors">About Us</button></li>
                <li><button className="text-slate-400 hover:text-white text-sm transition-colors">Contact & Support</button></li>
                <li><button className="text-slate-400 hover:text-white text-sm transition-colors">Download Web App</button></li>
                <li><button onClick={() => router.push("/login")} className="text-slate-400 hover:text-white text-sm transition-colors">Student Sign In</button></li>
                <li><button className="text-slate-400 hover:text-white text-sm transition-colors flex items-center gap-1">Presente Pro Plan <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg></button></li>
              </ul>
            </div>
          </div>
          
          {/* Bottom Row */}
          <div className="max-w-7xl mx-auto border-t border-white/5 pt-8 flex flex-col md:flex-row justify-between items-center gap-6">
            <p className="text-slate-500 text-xs">
              © {new Date().getFullYear()} PRESENTE. All rights reserved. &nbsp;•&nbsp; Semester Planning & Exam Preparation
            </p>
            
            {/* Social Icons */}
            <div className="flex items-center gap-3">
              {/* X (Twitter) */}
              <div className="w-8 h-8 rounded-full bg-black flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
              </div>
              {/* Instagram */}
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-yellow-400 via-red-500 to-purple-500 flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/></svg>
              </div>
              {/* YouTube */}
              <div className="w-8 h-8 rounded-full bg-[#FF0000] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
              </div>
              {/* LinkedIn */}
              <div className="w-8 h-8 rounded-full bg-[#0A66C2] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
              </div>
              {/* Discord */}
              <div className="w-8 h-8 rounded-full bg-[#5865F2] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M20.317 4.3698a19.7913 19.7913 0 00-4.8851-1.5152.0741.0741 0 00-.0785.0371c-.211.3753-.4447.8648-.6083 1.2495-1.8447-.2762-3.68-.2762-5.4868 0-.1636-.3933-.4058-.8742-.6177-1.2495a.077.077 0 00-.0785-.037 19.7363 19.7363 0 00-4.8852 1.515.0699.0699 0 00-.0321.0277C.5334 9.0458-.319 13.5799.0992 18.0578a.0824.0824 0 00.0312.0561c2.0528 1.5076 4.0413 2.4228 5.9929 3.0294a.0777.0777 0 00.0842-.0276c.4616-.6304.8731-1.2952 1.226-1.9942a.076.076 0 00-.0416-.1057c-.6528-.2476-1.2743-.5495-1.8722-.8923a.077.077 0 01-.0076-.1277c.1258-.0943.2517-.1923.3718-.2914a.0743.0743 0 01.0776-.0105c3.9278 1.7933 8.18 1.7933 12.0614 0a.0739.0739 0 01.0785.0095c.1202.099.246.1981.3728.2924a.077.077 0 01-.0066.1276 12.2986 12.2986 0 01-1.873.8914.0766.0766 0 00-.0407.1067c.3604.698.7719 1.3628 1.225 1.9932a.076.076 0 00.0842.0286c1.961-.6067 3.9495-1.5219 6.0023-3.0294a.077.077 0 00.0313-.0552c.5004-5.177-.8382-9.6739-3.5485-13.6604a.061.061 0 00-.0312-.0286zM8.02 15.3312c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9555-2.4189 2.157-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.9555 2.4189-2.1569 2.4189zm7.9748 0c-1.1825 0-2.1569-1.0857-2.1569-2.419 0-1.3332.9554-2.4189 2.1569-2.4189 1.2108 0 2.1757 1.0952 2.1568 2.419 0 1.3332-.946 2.4189-2.1568 2.4189Z"/></svg>
              </div>
              {/* WhatsApp */}
              <div className="w-8 h-8 rounded-full bg-[#25D366] flex items-center justify-center text-white cursor-pointer hover:scale-110 transition-transform">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/></svg>
              </div>
            </div>
          </div>
        </footer>
      </section>
    </div>
  );
}

/* ─── Feature Card Component (Pastel Design) ───────────────────────────────────────────────── */
function FeatureCard({
  slide,
  isActive,
}: {
  slide: (typeof SLIDES)[0];
  isActive: boolean;
}) {
  return (
    <div
      className="relative flex flex-col justify-end p-6 md:p-8 rounded-[32px] overflow-hidden transition-all duration-300 shadow-2xl"
      style={{
        width: 320,
        height: 380,
        backgroundColor: slide.bgColor,
        boxShadow: isActive
          ? "0 30px 60px rgba(0,0,0,0.15), inset 0 2px 4px rgba(255,255,255,0.4)"
          : "0 10px 30px rgba(0,0,0,0.1), inset 0 2px 4px rgba(255,255,255,0.2)",
      }}
    >
      {/* 3D Illustration Container - Centered in top 65% */}
      <div className="absolute top-0 left-0 w-full h-[65%] flex items-center justify-center p-6 drop-shadow-xl transform group-hover:scale-105 transition-transform duration-500">
        {slide.illustration}
      </div>

      {/* Text Content at bottom */}
      <div className="relative z-10 w-full mt-auto">
        <h3 className="text-2xl font-bold text-slate-900 mb-2 leading-tight">
          {slide.heading}
        </h3>
        <p className="text-sm font-medium text-slate-900/70 leading-relaxed">
          {slide.description}
        </p>
      </div>
    </div>
  );
}

/* ─── SVG Illustrations ──────────────────────────────────────────────────── */

/** Card 1 — Structured Schedule: person with giant clipboard checklist */
function ScheduleIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-h-40">
      {/* Clipboard body */}
      <rect x="50" y="30" width="90" height="110" rx="8" fill="#E6F4ED" stroke="#1B8354" strokeWidth="2.5" />
      {/* Clipboard clip */}
      <rect x="80" y="22" width="30" height="16" rx="5" fill="#1B8354" />
      {/* Checkmarks lines */}
      <rect x="70" y="55" width="50" height="7" rx="3" fill="#CBD5E1" />
      <rect x="70" y="72" width="45" height="7" rx="3" fill="#CBD5E1" />
      <rect x="70" y="89" width="50" height="7" rx="3" fill="#CBD5E1" />
      <rect x="70" y="106" width="38" height="7" rx="3" fill="#CBD5E1" />
      {/* Check marks */}
      <polyline points="61,59 65,63 74,54" stroke="#1B8354" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="61,76 65,80 74,71" stroke="#1B8354" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="61,93 65,97 74,88" stroke="#0F5A37" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Person body */}
      <circle cx="152" cy="75" r="12" fill="#FBBF24" />
      <rect x="144" y="89" width="16" height="28" rx="6" fill="#1B8354" />
      {/* Person legs */}
      <line x1="148" y1="117" x2="144" y2="140" stroke="#1B8354" strokeWidth="5" strokeLinecap="round" />
      <line x1="156" y1="117" x2="160" y2="140" stroke="#1B8354" strokeWidth="5" strokeLinecap="round" />
      {/* Person arm holding clipboard */}
      <line x1="144" y1="97" x2="132" y2="107" stroke="#1B8354" strokeWidth="4" strokeLinecap="round" />
      {/* Ground shadow */}
      <ellipse cx="152" cy="143" rx="20" ry="5" fill="rgba(27,131,84,0.15)" />
    </svg>
  );
}

/** Card 2 — Smart Attendance: clock + gears + verification sheet */
function AttendanceIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-h-40">
      {/* Large clock face */}
      <circle cx="100" cy="90" r="55" fill="#E6F4ED" stroke="#1B8354" strokeWidth="3" />
      <circle cx="100" cy="90" r="48" fill="white" stroke="#CBD5E1" strokeWidth="1.5" />
      {/* Clock hands */}
      <line x1="100" y1="90" x2="100" y2="52" stroke="#0F5A37" strokeWidth="3.5" strokeLinecap="round" />
      <line x1="100" y1="90" x2="125" y2="105" stroke="#1B8354" strokeWidth="2.5" strokeLinecap="round" />
      <circle cx="100" cy="90" r="4" fill="#0F5A37" />
      {/* Clock hour marks */}
      {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg, i) => {
        const rad = (deg * Math.PI) / 180;
        const x1 = 100 + 42 * Math.sin(rad);
        const y1 = 90 - 42 * Math.cos(rad);
        const x2 = 100 + 47 * Math.sin(rad);
        const y2 = 90 - 47 * Math.cos(rad);
        return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#CBD5E1" strokeWidth="1.5" />;
      })}
      {/* Gear top-left */}
      <circle cx="42" cy="42" r="16" fill="none" stroke="#1B8354" strokeWidth="3" strokeDasharray="6 3" />
      <circle cx="42" cy="42" r="7" fill="#E6F4ED" stroke="#1B8354" strokeWidth="2" />
      {/* Gear top-right */}
      <circle cx="162" cy="38" r="13" fill="none" stroke="#0F5A37" strokeWidth="2.5" strokeDasharray="5 3" />
      <circle cx="162" cy="38" r="6" fill="#E6F4ED" stroke="#0F5A37" strokeWidth="2" />
      {/* Checkmark badge bottom right */}
      <circle cx="158" cy="148" r="18" fill="#1B8354" />
      <polyline points="149,148 155,154 168,140" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sparkle accents */}
      <line x1="30" y1="100" x2="30" y2="112" stroke="#1B8354" strokeWidth="2" strokeLinecap="round" />
      <line x1="24" y1="106" x2="36" y2="106" stroke="#1B8354" strokeWidth="2" strokeLinecap="round" />
      <line x1="168" y1="75" x2="168" y2="83" stroke="#0F5A37" strokeWidth="2" strokeLinecap="round" />
      <line x1="164" y1="79" x2="172" y2="79" stroke="#0F5A37" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

/** Card 3 — Perfect Solution: group of students at a bulletin board */
function SolutionIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-h-40">
      {/* Bulletin board background */}
      <rect x="40" y="20" width="120" height="90" rx="6" fill="#E6F4ED" stroke="#1B8354" strokeWidth="2" />
      {/* Board items */}
      <rect x="52" y="32" width="35" height="22" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="93" y="32" width="35" height="22" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="52" y="60" width="35" height="22" rx="4" fill="white" stroke="#CBD5E1" strokeWidth="1" />
      <rect x="93" y="60" width="35" height="22" rx="4" fill="#1B8354" />
      {/* Green check on highlighted board item */}
      <polyline points="98,71 103,76 112,66" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
      {/* Pin dots */}
      <circle cx="69" cy="30" r="3" fill="#1B8354" />
      <circle cx="110" cy="30" r="3" fill="#1B8354" />
      {/* Person 1 - left */}
      <circle cx="52" cy="125" r="11" fill="#FBBF24" />
      <rect x="44" y="137" width="16" height="22" rx="5" fill="#475569" />
      <line x1="46" y1="159" x2="43" y2="175" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
      <line x1="58" y1="159" x2="61" y2="175" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
      {/* Person 2 - center (taller) */}
      <circle cx="100" cy="118" r="13" fill="#F97316" />
      <rect x="91" y="132" width="18" height="26" rx="6" fill="#1B8354" />
      <line x1="93" y1="158" x2="90" y2="176" stroke="#1B8354" strokeWidth="4.5" strokeLinecap="round" />
      <line x1="107" y1="158" x2="110" y2="176" stroke="#1B8354" strokeWidth="4.5" strokeLinecap="round" />
      {/* Raised arm with check */}
      <line x1="91" y1="138" x2="76" y2="122" stroke="#1B8354" strokeWidth="3.5" strokeLinecap="round" />
      <circle cx="74" cy="119" r="8" fill="#1B8354" />
      <polyline points="70,119 73,122 79,115" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      {/* Person 3 - right */}
      <circle cx="152" cy="125" r="11" fill="#A78BFA" />
      <rect x="144" y="137" width="16" height="22" rx="5" fill="#0F5A37" />
      <line x1="146" y1="159" x2="143" y2="175" stroke="#0F5A37" strokeWidth="4" strokeLinecap="round" />
      <line x1="158" y1="159" x2="161" y2="175" stroke="#0F5A37" strokeWidth="4" strokeLinecap="round" />
      {/* Ground */}
      <ellipse cx="100" cy="177" rx="80" ry="5" fill="rgba(27,131,84,0.1)" />
    </svg>
  );
}

/** Card 4 — Analytics: bar chart and magnifying glass */
function AnalyticsIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-h-40">
      {/* Background board */}
      <rect x="40" y="30" width="120" height="90" rx="6" fill="#E6F4ED" stroke="#1B8354" strokeWidth="2.5" />
      {/* Bars */}
      <rect x="55" y="80" width="15" height="30" rx="2" fill="#FBBF24" />
      <rect x="80" y="60" width="15" height="50" rx="2" fill="#F97316" />
      <rect x="105" y="40" width="15" height="70" rx="2" fill="#1B8354" />
      <rect x="130" y="70" width="15" height="40" rx="2" fill="#A78BFA" />
      {/* Trend line */}
      <polyline points="62,75 87,55 112,35 137,65" stroke="#0F5A37" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {/* Floating magnifying glass */}
      <circle cx="150" cy="120" r="15" fill="white" stroke="#1B8354" strokeWidth="4" />
      <line x1="160" y1="130" x2="175" y2="145" stroke="#1B8354" strokeWidth="6" strokeLinecap="round" />
      <circle cx="150" cy="120" r="8" fill="#E6F4ED" />
      {/* Ground shadow */}
      <ellipse cx="100" cy="150" rx="60" ry="5" fill="rgba(27,131,84,0.1)" />
    </svg>
  );
}

/** Card 5 — Announcements: megaphone with notification bubbles */
function AnnouncementsIllustration() {
  return (
    <svg viewBox="0 0 200 180" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-h-40">
      {/* Megaphone body */}
      <path d="M70,100 L140,120 L140,60 L70,80 Z" fill="#FBBF24" stroke="#F97316" strokeWidth="3" strokeLinejoin="round" />
      {/* Megaphone mouthpiece */}
      <rect x="55" y="80" width="15" height="20" rx="3" fill="#1B8354" />
      {/* Handle */}
      <path d="M100,110 L100,140 L90,140" fill="none" stroke="#0F5A37" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" />
      {/* Sound waves */}
      <path d="M155,70 Q165,90 155,110" fill="none" stroke="#1B8354" strokeWidth="4" strokeLinecap="round" />
      <path d="M170,60 Q185,90 170,120" fill="none" stroke="#1B8354" strokeWidth="4" strokeLinecap="round" />
      {/* Floating notification bubbles */}
      <circle cx="130" cy="40" r="10" fill="#E6F4ED" stroke="#1B8354" strokeWidth="2" />
      <circle cx="170" cy="30" r="6" fill="#FBBF24" />
      <circle cx="40" cy="60" r="8" fill="#A78BFA" />
      {/* Ground shadow */}
      <ellipse cx="100" cy="160" rx="50" ry="5" fill="rgba(27,131,84,0.1)" />
    </svg>
  );
}

/* ─── Brand Logo (colored version for light bg) ───────────────────────── */
function PresenteLogoWhite({ size = 40 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 120" fill="none" xmlns="http://www.w3.org/2000/svg">
      <line x1="22" y1="15" x2="22" y2="105" stroke="#1B8354" strokeWidth="9" strokeLinecap="round" />
      <line x1="22" y1="15" x2="55" y2="15" stroke="#1B8354" strokeWidth="9" strokeLinecap="round" />
      <path d="M55 15 Q80 15 80 40 Q80 65 55 65" stroke="#1B8354" strokeWidth="9" fill="none" strokeLinecap="round" />
      <line x1="22" y1="65" x2="55" y2="65" stroke="#1B8354" strokeWidth="9" strokeLinecap="round" />
    </svg>
  );
}
