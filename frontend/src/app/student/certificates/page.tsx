"use client";

import { Award } from "lucide-react";

export default function CertificatesPage() {
  return (
    <main className="flex-1 p-4 md:p-8 flex flex-col items-center overflow-y-auto">
      <div className="w-full max-w-5xl animate-in fade-in zoom-in-95 duration-300">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">My Certificates</h2>
        </div>
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm text-center">
          <Award size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-bold text-gray-900 mb-2">No certificates earned yet</h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto">Complete your courses with an average above 70% to earn verified certificates.</p>
        </div>
      </div>
    </main>
  );
}
