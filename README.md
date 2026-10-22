# Presente — Smart Classroom Attendance & LMS System

An end-to-end university academic management and intelligent attendance tracking platform built with **Next.js**, **Express**, and **MongoDB**. Features dynamic, rotating anti-proxy QR codes with time-sensitive cryptographic tokens and strict real-device GPS geofencing.

---

## 🌟 Key Features

### 1. Smart Dynamic Attendance System
- **Time-Sensitive Dynamic QR**: Rotates cryptographically signed JWT tokens every 15–30 seconds to prevent students from sharing photo screenshots via chat.
- **Strict Geofencing (Haversine Formula)**: Compares student device GPS against the lecturer's classroom anchor point down to the exact meter.
- **Projector Mode**: One-click fullscreen display for classroom projectors and smartboards with active radar pulse animation.
- **6-Digit Backup Passcode (OTP)**: For students with camera hardware issues or poor classroom lighting (geofencing is still strictly enforced).
- **Manual Check-In Override**: Lecturers can search by matric number or name to mark students whose device batteries died.
- **Dynamic Attendance Rate**: Automatically calculates real percentages based on actual sessions conducted ($1/1 = 100\%$, $1/2 = 50\%$, $9/10 = 90\%$).

### 2. Lecturer Portal
- **Dashboard & Analytics**: Real-time attendance tally, active course overviews, and submission tracking.
- **Course Management**: Course code generation, invite links, syllabus materials upload.
- **Assignments & Grading**: Create deadlines, accept PDF/file submissions, and submit grades.
- **Student Performance**: Inspect individual student attendance records, submission history, and attendance standing.

### 3. Student Portal
- **Dashboard & Course Access**: View enrolled courses, real-time timetable, upcoming assignments, and notices.
- **Classroom Check-In**: Quick QR camera scanner with scan-line animation and 6-digit fallback tab.
- **Course Attendance Overview**: View course-specific attendance standing (Present, Late, Absent) and full check-in receipts.

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16 (App Router, Turbopack), TypeScript, Tailwind CSS, Framer Motion, Lucide Icons, HTML5-QRCode, QRCode.react.
- **Backend**: Node.js, Express.js, MongoDB (Mongoose), JWT, Bcrypt, Multer.
- **Algorithms**: Haversine Great-Circle Distance Calculation.

---

## 🚀 Getting Started

### 1. Backend Setup
```bash
cd backend
npm install
npm run dev
```

### 2. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
