const Course = require('../models/Course');
const User = require('../models/User');
const Attendance = require('../models/Attendance');
const AttendanceSession = require('../models/AttendanceSession');

// @desc    Get lecturer analytics
// @route   GET /api/analytics/lecturer
// @access  Private (Lecturer)
const getLecturerAnalytics = async (req, res) => {
  try {
    const courses = await Course.find({ lecturer: req.user.id });
    const courseIds = courses.map(c => c._id);
    
    let totalStudents = 0;
    courses.forEach(course => {
      totalStudents += (course.enrolledStudents || []).length;
    });

    // Sessions conducted by this lecturer
    const sessions = await AttendanceSession.find({ lecturer: req.user.id }).populate('course', 'enrolledStudents');
    const totalSessions = sessions.length;

    // Total expected attendances across all sessions held
    let totalExpectedAttendances = 0;
    sessions.forEach(session => {
      totalExpectedAttendances += (session.course?.enrolledStudents?.length || 0);
    });

    const presentCount = await Attendance.countDocuments({ 
      course: { $in: courseIds },
      status: 'PRESENT'
    });
    
    const avgAttendance = totalExpectedAttendances > 0 
      ? Math.min(100, Math.round((presentCount / totalExpectedAttendances) * 100))
      : (totalStudents > 0 ? 100 : 0);

    const recentActivity = await Attendance.find({ course: { $in: courseIds } })
      .populate('student', 'name matricNo')
      .populate('course', 'title courseCode')
      .sort('-createdAt')
      .limit(10);

    const stats = {
      totalCourses: courses.length,
      totalStudents: totalStudents,
      totalSessions,
      averageAttendance: avgAttendance, 
      recentActivity
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get student analytics
// @route   GET /api/analytics/student
// @access  Private (Student)
const getStudentAnalytics = async (req, res) => {
  try {
    const courses = await Course.find({ enrolledStudents: req.user.id });
    const courseIds = courses.map(c => c._id);
    
    // Total sessions conducted across all enrolled courses
    const allSessions = await AttendanceSession.find({ course: { $in: courseIds } });
    const totalSessions = allSessions.length;

    // Student's attended records
    const presentAttendances = await Attendance.find({ 
      student: req.user.id, 
      course: { $in: courseIds },
      status: 'PRESENT'
    });

    const totalPresent = presentAttendances.length;
    
    // Dynamic rate:
    // If no classes held yet -> 100%
    // If 1 class held & student attended -> 1/1 = 100%
    // If 2 classes held & student missed 1 -> 1/2 = 50%
    // If 10 classes held & student attended 9 -> 9/10 = 90%
    const averageAttendance = totalSessions > 0 
      ? Math.round((totalPresent / totalSessions) * 100) 
      : (courses.length > 0 ? 100 : 0);

    // Group by day of week
    const weeklyBuckets = [
      { day: 'Sun', attended: 0, missed: 0 },
      { day: 'Mon', attended: 0, missed: 0 },
      { day: 'Tue', attended: 0, missed: 0 },
      { day: 'Wed', attended: 0, missed: 0 },
      { day: 'Thu', attended: 0, missed: 0 },
      { day: 'Fri', attended: 0, missed: 0 },
      { day: 'Sat', attended: 0, missed: 0 }
    ];

    const attendedSessionIdSet = new Set(
      presentAttendances
        .filter(a => a.session)
        .map(a => a.session.toString())
    );

    allSessions.forEach(session => {
      const dayIdx = new Date(session.createdAt).getDay();
      if (attendedSessionIdSet.has(session._id.toString())) {
        weeklyBuckets[dayIdx].attended++;
      } else {
        weeklyBuckets[dayIdx].missed++;
      }
    });

    // Reorder to start with Mon
    const weeklyData = [
      weeklyBuckets[1], weeklyBuckets[2], weeklyBuckets[3], 
      weeklyBuckets[4], weeklyBuckets[5], weeklyBuckets[6], weeklyBuckets[0]
    ];

    // Normalize weekly data to percentages for the chart
    const normalizedWeekly = weeklyData.map(d => {
      const dTotal = d.attended + d.missed;
      if (dTotal === 0) return { day: d.day, attended: 0, missed: 0 };
      return {
        day: d.day,
        attended: Math.round((d.attended / dTotal) * 100),
        missed: Math.round((d.missed / dTotal) * 100)
      };
    });

    const stats = {
      totalCourses: courses.length,
      totalSessions,
      totalPresent,
      averageAttendance,
      weeklyData: normalizedWeekly
    };

    res.status(200).json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLecturerAnalytics, getStudentAnalytics };
