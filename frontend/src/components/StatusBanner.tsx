"use client";

import { CheckCircle, XCircle } from "lucide-react";

interface StatusBannerProps {
  status: "success" | "error" | null;
  message: string;
}

export default function StatusBanner({ status, message }: StatusBannerProps) {
  if (!status) return null;

  return (
    <div
      className={`p-4 rounded-xl flex items-center gap-3 shadow-sm border ${
        status === "success"
          ? "bg-green-50 border-green-200 text-green-800"
          : "bg-red-50 border-red-200 text-red-800"
      }`}
    >
      {status === "success" ? (
        <CheckCircle className="text-green-600 shrink-0" size={24} />
      ) : (
        <XCircle className="text-red-600 shrink-0" size={24} />
      )}
      <p className="font-medium">{message}</p>
    </div>
  );
}
