"use client";

import { useEffect, useRef, useState } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { Scan, MapPin } from "lucide-react";

interface QRScannerProps {
  onScanSuccess: (decodedText: string) => void;
  isScanning: boolean;
  isCheckingIn: boolean;
}

export default function QRScanner({ onScanSuccess, isScanning, isCheckingIn }: QRScannerProps) {
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  
  useEffect(() => {
    let html5QrCode: Html5Qrcode;

    const startScanner = async () => {
      try {
        const cameras = await Html5Qrcode.getCameras();
        if (cameras && cameras.length > 0) {
          setHasCameraPermission(true);
          html5QrCode = new Html5Qrcode("reader");
          await html5QrCode.start(
            { facingMode: "environment" },
            {
              fps: 10,
              qrbox: { width: 250, height: 250 },
            },
            (decodedText) => {
              if (!isCheckingIn && isScanning) {
                // To prevent multiple scans firing rapidly
                onScanSuccess(decodedText);
                // Temporarily stop scanner
                html5QrCode.stop().catch(console.error);
              }
            },
            (errorMessage) => {
              // Parse errors are expected frequently when looking for code
            }
          );
        } else {
          setHasCameraPermission(false);
        }
      } catch (err) {
        console.error("Camera startup error:", err);
        setHasCameraPermission(false);
      }
    };

    if (isScanning && !isCheckingIn) {
      startScanner();
    }

    return () => {
      if (html5QrCode && html5QrCode.isScanning) {
        html5QrCode.stop().catch(console.error);
      }
    };
  }, [isScanning, isCheckingIn, onScanSuccess]);

  return (
    <div className="w-full flex flex-col items-center">
      <div className="relative w-full max-w-sm aspect-square bg-black rounded-2xl overflow-hidden shadow-lg border-4 border-gray-800 flex items-center justify-center">
        {hasCameraPermission === false ? (
          <div className="text-white text-center p-6">
            <Scan className="mx-auto mb-4 opacity-50" size={48} />
            <p>Camera access denied or no camera found.</p>
            <p className="text-sm opacity-70 mt-2">Please allow camera access in your browser settings.</p>
          </div>
        ) : (
          <div id="reader" className="w-full h-full"></div>
        )}
        
        {/* Scanning Overlay Grid */}
        {isScanning && !isCheckingIn && hasCameraPermission !== false && (
          <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40 flex items-center justify-center z-10">
            <div className="w-full h-full border-2 border-blue-500 rounded-lg shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"></div>
          </div>
        )}

        {isCheckingIn && (
          <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-20">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white font-medium">Verifying location...</p>
          </div>
        )}
      </div>

      <div className="mt-6 flex items-start gap-3 bg-blue-50 p-4 rounded-xl border border-blue-100 max-w-sm">
        <MapPin className="text-blue-600 shrink-0 mt-0.5" size={20} />
        <div>
          <h4 className="text-sm font-semibold text-blue-900">Location Access Required</h4>
          <p className="text-xs text-blue-700 mt-1">Your location will be checked against the venue's geofence upon scanning.</p>
        </div>
      </div>
    </div>
  );
}
