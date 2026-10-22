"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, Shield, Bell, Lock, Smartphone, Laptop, AlertTriangle, CheckCircle2 } from "lucide-react";

export default function LecturerSettings() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "security" | "notifications">("profile");

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto bg-gray-50/50">
      <div className="w-full max-w-4xl animate-in fade-in zoom-in-95 duration-300">
        
        <div className="mb-10">
          <h2 className="text-3xl font-extrabold text-gray-900 tracking-tight">Account Settings</h2>
          <p className="text-sm font-medium text-gray-500 mt-2">
            Manage your profile, security, and notification preferences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Settings Nav */}
          <div className="md:col-span-1 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-3 font-bold text-sm rounded-xl transition-all ${
                activeTab === "profile" ? "bg-white text-[#0F5A37] shadow-sm border border-gray-100" : "text-gray-500 hover:bg-gray-100 border border-transparent"
              }`}
            >
              <User size={18} /> Profile
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 font-bold text-sm rounded-xl transition-all ${
                activeTab === "security" ? "bg-white text-[#0F5A37] shadow-sm border border-gray-100" : "text-gray-500 hover:bg-gray-100 border border-transparent"
              }`}
            >
              <Shield size={18} /> Security
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 px-4 py-3 font-bold text-sm rounded-xl transition-all ${
                activeTab === "notifications" ? "bg-white text-[#0F5A37] shadow-sm border border-gray-100" : "text-gray-500 hover:bg-gray-100 border border-transparent"
              }`}
            >
              <Bell size={18} /> Notifications
            </button>
          </div>

          {/* Settings Content */}
          <div className="md:col-span-3 flex flex-col gap-8">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4">Personal Information</h3>
                
                <div className="flex items-center gap-6 mb-8">
                  <div className="w-20 h-20 bg-gradient-to-tr from-[#0F5A37] to-[#1B8354] rounded-full flex items-center justify-center text-white font-black text-2xl shadow-lg shadow-[#0F5A37]/20">
                    {user?.name?.charAt(0) || "L"}
                  </div>
                  <div>
                    <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-xl text-sm font-bold hover:bg-gray-200 transition-colors mb-2 block">
                      Upload new photo
                    </button>
                    <p className="text-xs font-medium text-gray-500">JPG, GIF or PNG. Max size of 800K</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Full Name</label>
                    <input type="text" defaultValue={user?.name} className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-3.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Email Address</label>
                    <input type="email" defaultValue={user?.email} disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl block p-3.5 cursor-not-allowed outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Department</label>
                    <input type="text" defaultValue="Computer Science" className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-3.5 outline-none" />
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-2">Staff ID</label>
                    <input type="text" defaultValue="LEC-2023-894" disabled className="w-full bg-gray-100 border border-gray-200 text-gray-500 text-sm font-semibold rounded-xl block p-3.5 cursor-not-allowed outline-none" />
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <button className="bg-[#0F5A37] text-white px-6 py-3 rounded-xl text-sm font-bold shadow-md shadow-[#0F5A37]/20 hover:-translate-y-0.5 transition-all">
                    Save Changes
                  </button>
                </div>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="animate-in slide-in-from-right-4 duration-300 flex flex-col gap-8">
                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                  <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                    <Lock size={18} className="text-[#0F5A37]" /> Password & Authentication
                  </h3>
                  
                  <div className="space-y-4 mb-8">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">Current Password</label>
                      <input type="password" placeholder="••••••••" className="w-full max-w-md bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-3.5 outline-none" />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-2">New Password</label>
                      <input type="password" placeholder="••••••••" className="w-full max-w-md bg-gray-50 border border-gray-200 text-gray-900 text-sm font-semibold rounded-xl focus:ring-[#0F5A37] focus:border-[#0F5A37] block p-3.5 outline-none" />
                    </div>
                    <div className="pt-2">
                      <button className="bg-gray-900 text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-gray-800 transition-colors">
                        Update Password
                      </button>
                    </div>
                  </div>

                  <div className="border-t border-gray-100 pt-8 flex items-center justify-between">
                    <div>
                      <h4 className="text-base font-bold text-gray-900">Two-Factor Authentication (2FA)</h4>
                      <p className="text-sm font-medium text-gray-500 mt-1 max-w-sm">
                        Add an extra layer of security to your account by requiring a code from your mobile app when logging in.
                      </p>
                    </div>
                    <button className="bg-emerald-50 text-emerald-600 px-5 py-2.5 rounded-xl text-sm font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors">
                      Enable 2FA
                    </button>
                  </div>
                </div>

                <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm">
                   <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                    <Smartphone size={18} className="text-[#0F5A37]" /> Active Sessions
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-green-50 rounded-2xl border border-green-100">
                      <div className="flex items-center gap-4">
                        <Laptop size={24} className="text-[#0F5A37]" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">Windows PC - Chrome</p>
                          <p className="text-xs font-medium text-gray-500">Current Session • Lagos, Nigeria</p>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-emerald-600 flex items-center gap-1"><CheckCircle2 size={14}/> Active</span>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100">
                      <div className="flex items-center gap-4">
                        <Smartphone size={24} className="text-gray-400" />
                        <div>
                          <p className="font-bold text-gray-900 text-sm">iPhone 14 Pro - Safari</p>
                          <p className="text-xs font-medium text-gray-500">Last active 2 hours ago • Lagos, Nigeria</p>
                        </div>
                      </div>
                      <button className="text-xs font-bold text-red-500 hover:underline">Revoke</button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="bg-white rounded-[2rem] p-8 border border-gray-100 shadow-sm animate-in slide-in-from-right-4 duration-300">
                <h3 className="text-lg font-bold text-gray-900 mb-6 border-b border-gray-100 pb-4 flex items-center gap-2">
                  <Bell size={18} className="text-[#0F5A37]" /> Notification Preferences
                </h3>
                
                <div className="space-y-6">
                  
                  <div className="flex items-start justify-between pb-6 border-b border-gray-50">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Assignment Submissions</h4>
                      <p className="text-xs font-medium text-gray-500 mt-1">Get an email digest when students submit assignments.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5A37]"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between pb-6 border-b border-gray-50">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Attendance Anomalies</h4>
                      <p className="text-xs font-medium text-gray-500 mt-1">Alert me immediately if geofence violations occur during a live class.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" defaultChecked />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                    </label>
                  </div>

                  <div className="flex items-start justify-between pb-6 border-b border-gray-50">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900">Student Enrollment</h4>
                      <p className="text-xs font-medium text-gray-500 mt-1">Notify me when a new student joins one of my courses using a join code.</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input type="checkbox" className="sr-only peer" />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0F5A37]"></div>
                    </label>
                  </div>

                </div>

                <div className="mt-8 bg-amber-50 rounded-2xl p-4 border border-amber-100 flex items-start gap-3">
                  <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-bold text-amber-900">Note on email alerts</h4>
                    <p className="text-xs font-medium text-amber-700 mt-1">
                      Critical security alerts (like new logins from unrecognized devices) cannot be disabled.
                    </p>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}
