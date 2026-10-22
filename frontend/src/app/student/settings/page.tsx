"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { Camera, Save, User, Mail, Lock, Shield, Bell, Smartphone, Key } from "lucide-react";
import toast from "react-hot-toast";
import api from "@/utils/api";

export default function StudentSettings() {
  const { user } = useAuth();
  
  const [activeTab, setActiveTab] = useState("profile");
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar || `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.name}&backgroundColor=0F5A37,1B8354`);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const presetAvatars = [
    `https://api.dicebear.com/7.x/shapes/svg?seed=${user?.name}&backgroundColor=0F5A37,1B8354`,
    `https://api.dicebear.com/7.x/bottts/svg?seed=${user?.name}&backgroundColor=1e293b`,
    `https://api.dicebear.com/7.x/adventurer/svg?seed=${user?.name}&backgroundColor=fde047`,
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${user?.name}&backgroundColor=c0aede`,
    `https://api.dicebear.com/7.x/fun-emoji/svg?seed=${user?.name}&backgroundColor=ffdfbf`,
  ];

  // Form State
  const [formData, setFormData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    matricNo: user?.matricNo || "",
  });

  const [passwords, setPasswords] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingAvatar(true);
    try {
      const data = new FormData();
      data.append("file", file);
      data.append("upload_preset", "eatros image"); 
      
      const res = await fetch(`https://api.cloudinary.com/v1_1/degnrlkor/image/upload`, {
        method: "POST",
        body: data,
      });
      const fileData = await res.json();
      
      if (fileData.secure_url) {
        setAvatarUrl(fileData.secure_url);
        toast.success("Profile picture updated!");
      }
    } catch (err) {
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await api.put("/auth/profile", {
        name: formData.name,
        email: formData.email,
        matricNo: formData.matricNo,
        avatar: avatarUrl
      });
      if (res.data.success) {
        toast.success("Profile updated successfully!");
        // Small delay to allow the toast to be seen before reload
        setTimeout(() => window.location.reload(), 1000);
      }
    } catch (err) {
      toast.error("Failed to update profile.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.newPassword !== passwords.confirmPassword) {
      toast.error("New passwords do not match!");
      return;
    }
    
    setPasswordLoading(true);
    // Simulate API call
    setTimeout(() => {
      toast.success("Password changed successfully!");
      setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
      setPasswordLoading(false);
    }, 1000);
  };

  if (!user) return null;

  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-5xl animate-in fade-in zoom-in-95 duration-300">
        
        {/* Header */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Settings & Profile</h2>
          <p className="text-sm text-gray-500 mt-1">Manage your account settings, preferences and security</p>
        </div>

        <div className="flex flex-col md:flex-row gap-8">
          
          {/* Left Sidebar (Tabs) */}
          <div className="w-full md:w-64 shrink-0 flex flex-col gap-2">
            <button 
              onClick={() => setActiveTab("profile")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'profile' ? 'bg-[#0F5A37] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <User size={18} /> Personal Info
            </button>
            <button 
              onClick={() => setActiveTab("security")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'security' ? 'bg-[#0F5A37] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Shield size={18} /> Security
            </button>
            <button 
              onClick={() => setActiveTab("notifications")}
              className={`flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-bold transition-all ${activeTab === 'notifications' ? 'bg-[#0F5A37] text-white shadow-md' : 'text-gray-600 hover:bg-gray-100'}`}
            >
              <Bell size={18} /> Notifications
            </button>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 bg-white rounded-[2rem] p-6 md:p-10 shadow-sm border border-gray-50">
            
            {/* PROFILE TAB */}
            {activeTab === "profile" && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Information</h3>
                
                {/* Avatar Section */}
                <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-gray-100">
                  <div className="relative shrink-0">
                    <div className="w-24 h-24 rounded-full border-4 border-gray-50 shadow-sm overflow-hidden bg-gray-100">
                      {uploadingAvatar ? (
                        <div className="w-full h-full flex items-center justify-center bg-gray-200">
                          <div className="w-5 h-5 border-2 border-[#0F5A37] border-t-transparent rounded-full animate-spin"></div>
                        </div>
                      ) : (
                        <img src={avatarUrl} alt="avatar" className="w-full h-full object-cover" />
                      )}
                    </div>
                  </div>
                  <div>
                    <h4 className="font-bold text-gray-900 text-lg">{user.name}</h4>
                    <p className="text-sm font-medium text-gray-500 mb-3">{user.role.charAt(0).toUpperCase() + user.role.slice(1)} • Computer Science</p>
                    <div className="flex gap-3 relative">
                      <label className="cursor-pointer px-4 py-2 bg-[#0F5A37] text-white text-xs font-bold rounded-xl hover:bg-[#1B8354] transition-colors shadow-sm shadow-[#1B8354]/30">
                        {uploadingAvatar ? 'Uploading...' : 'Upload Image'}
                        <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} disabled={uploadingAvatar} />
                      </label>
                      <button 
                        type="button"
                        onClick={() => setShowAvatarPicker(!showAvatarPicker)}
                        className="px-4 py-2 bg-gray-50 text-gray-600 text-xs font-bold rounded-xl border border-gray-200 hover:bg-gray-100 transition-colors"
                      >
                        Pick Avatar
                      </button>
                      
                      {/* Avatar Picker Dropdown */}
                      {showAvatarPicker && (
                        <div className="absolute top-12 left-0 w-64 bg-white border border-gray-100 shadow-xl rounded-2xl p-4 z-10 grid grid-cols-5 gap-2 animate-in slide-in-from-top-2">
                          {presetAvatars.map((preset, idx) => (
                            <button
                              key={idx}
                              type="button"
                              onClick={() => {
                                setAvatarUrl(preset);
                                setShowAvatarPicker(false);
                              }}
                              className="w-10 h-10 rounded-full border border-gray-200 hover:border-[#0F5A37] hover:scale-110 transition-all overflow-hidden"
                            >
                              <img src={preset} className="w-full h-full object-cover" />
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <form onSubmit={handleProfileUpdate} className="space-y-5 max-w-lg">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Full Name</label>
                    <div className="relative">
                      <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({...formData, name: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email Address</label>
                    <div className="relative">
                      <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({...formData, email: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Matriculation Number</label>
                    <div className="relative">
                      <Shield size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        value={formData.matricNo}
                        onChange={e => setFormData({...formData, matricNo: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 focus:bg-white transition-all"
                        placeholder="e.g. 21/0430"
                      />
                    </div>
                  </div>

                  <div className="pt-4">
                    <button 
                      type="submit"
                      disabled={loading}
                      className="flex items-center justify-center gap-2 w-full md:w-auto px-8 py-3.5 bg-[#0F5A37] text-white text-sm font-bold rounded-2xl hover:bg-[#1B8354] transition-all shadow-lg shadow-[#1B8354]/30 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : <><Save size={18} /> Save Changes</>}
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* SECURITY TAB */}
            {activeTab === "security" && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-2">Security Settings</h3>
                <p className="text-sm font-medium text-gray-500 mb-8 pb-8 border-b border-gray-100">Ensure your account is using a long, random password to stay secure.</p>

                <form onSubmit={handlePasswordUpdate} className="space-y-5 max-w-lg mb-8 pb-8 border-b border-gray-100">
                  <h4 className="text-sm font-extrabold text-gray-900 mb-4">Change Password</h4>
                  
                  <div>
                    <label className="block text-xs font-bold text-gray-500 mb-2">CURRENT PASSWORD</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="password" 
                        required
                        value={passwords.currentPassword}
                        onChange={e => setPasswords({...passwords, currentPassword: e.target.value})}
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">NEW PASSWORD</label>
                      <input 
                        type="password" 
                        required
                        value={passwords.newPassword}
                        onChange={e => setPasswords({...passwords, newPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 focus:bg-white transition-all"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 mb-2">CONFIRM NEW PASSWORD</label>
                      <input 
                        type="password" 
                        required
                        value={passwords.confirmPassword}
                        onChange={e => setPasswords({...passwords, confirmPassword: e.target.value})}
                        className="w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-2xl text-sm font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#0F5A37]/20 focus:bg-white transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-2">
                    <button 
                      type="submit"
                      disabled={passwordLoading}
                      className="flex items-center justify-center gap-2 w-full md:w-auto px-6 py-3 bg-gray-900 text-white text-sm font-bold rounded-xl hover:bg-gray-800 transition-all disabled:opacity-50"
                    >
                      {passwordLoading ? 'Updating...' : <><Key size={16} /> Update Password</>}
                    </button>
                  </div>
                </form>

                {/* 2FA Section */}
                <div>
                  <h4 className="text-sm font-extrabold text-gray-900 mb-4">Two-Factor Authentication</h4>
                  <div className="flex items-center justify-between p-5 bg-blue-50/50 border border-blue-100 rounded-2xl">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                        <Smartphone size={20} />
                      </div>
                      <div>
                        <h5 className="font-bold text-gray-900 text-sm">Authenticator App</h5>
                        <p className="text-xs font-medium text-gray-500 mt-0.5">Not configured. Use an app like Google Authenticator.</p>
                      </div>
                    </div>
                    <button className="px-4 py-2 bg-white border border-gray-200 text-gray-700 text-xs font-bold rounded-xl shadow-sm hover:bg-gray-50 transition-colors shrink-0">
                      Set Up
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === "notifications" && (
              <div className="animate-in fade-in duration-300">
                <h3 className="text-xl font-bold text-gray-900 mb-6">Notification Preferences</h3>
                
                <div className="space-y-4 max-w-lg">
                  {[
                    { id: 1, title: 'New Assignments', desc: 'Receive a notification when a lecturer posts a new assignment.' },
                    { id: 2, title: 'Upcoming Deadlines', desc: 'Get reminded 24 hours before an assignment is due.' },
                    { id: 3, title: 'Grades Posted', desc: 'Find out immediately when your submission is graded.' },
                    { id: 4, title: 'Course Announcements', desc: 'Important updates from your course representatives or lecturers.' },
                  ].map(item => (
                    <div key={item.id} className="flex items-start justify-between p-4 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                      <div className="pr-8">
                        <h4 className="font-bold text-gray-900 text-sm">{item.title}</h4>
                        <p className="text-xs font-medium text-gray-500 mt-1">{item.desc}</p>
                      </div>
                      
                      {/* Toggle Switch */}
                      <label className="relative inline-flex items-center cursor-pointer shrink-0 mt-1">
                        <input type="checkbox" className="sr-only peer" defaultChecked />
                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#1B8354]"></div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>

      </div>
    </main>
  );
}
