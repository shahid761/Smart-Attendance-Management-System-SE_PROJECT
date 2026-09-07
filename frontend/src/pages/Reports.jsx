import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { fetchStudents, fetchAttendance } from '../services/api';
import { Download, FileText, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend } from 'recharts';

const Reports = () => {
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReportData = async () => {
      setLoading(true);
      try {
        const [studentData, attendanceData] = await Promise.all([
          fetchStudents(),
          fetchAttendance()
        ]);
        setStudents(studentData);
        setAttendance(attendanceData);
      } catch (err) {
        console.error('Error fetching report data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadReportData();
  }, []);

  // Calculate summary counts
  const totalStudents = students.length;
  const totalRecords = attendance.length;
  const presentRecords = attendance.filter((a) => a.status === 'Present').length;
  const absentRecords = Math.max(0, totalRecords - presentRecords);

  const pieData = [
    { name: 'Present Logs', value: presentRecords || 1, color: '#0284c7' },
    { name: 'Absent / Missing', value: absentRecords || 0, color: '#f43f5e' },
  ];

  const exportCSV = () => {
    if (!students || students.length === 0) {
      alert('No student data available to export');
      return;
    }

    const headers = ['ID', 'Name', 'Email', 'Department', 'Course', 'Semester', 'Attendance Percentage', 'Face Registered'];
    const rows = students.map((s) => [
      s.id,
      `"${s.name}"`,
      `"${s.email}"`,
      `"${s.department || ''}"`,
      `"${s.course || ''}"`,
      `"${s.semester || ''}"`,
      `${s.attendance_percentage}%`,
      s.has_face_registered ? 'Yes' : 'No'
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Attendance_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <Header title="Reports & Analytics" />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Export Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <FileText className="w-4 h-4 text-sky-600" /> Export & Summary Reports
            </h3>
            <p className="text-xs text-gray-500">Download formatted CSV reports of student attendance performance</p>
          </div>

          <button
            onClick={exportCSV}
            className="w-full sm:w-auto px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-700 flex items-center justify-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Export CSV Report
          </button>
        </div>

        {/* Charts & Breakdown Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Summary Breakdown Card */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col justify-between">
            <h4 className="text-sm font-bold text-gray-900 mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-sky-600" /> System Totals
            </h4>

            <div className="space-y-4">
              <div className="p-3 bg-sky-50 rounded-lg border border-sky-100 flex justify-between items-center">
                <span className="text-xs font-medium text-sky-800">Total Enrolled Students</span>
                <span className="text-base font-bold text-sky-900">{totalStudents}</span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-100 flex justify-between items-center">
                <span className="text-xs font-medium text-emerald-800">Total Present Sessions</span>
                <span className="text-base font-bold text-emerald-900">{presentRecords}</span>
              </div>

              <div className="p-3 bg-rose-50 rounded-lg border border-rose-100 flex justify-between items-center">
                <span className="text-xs font-medium text-rose-800">Flagged Low Attendance (&lt;75%)</span>
                <span className="text-base font-bold text-rose-900">
                  {students.filter(s => s.attendance_percentage < 75).length}
                </span>
              </div>
            </div>
          </div>

          {/* Pie Distribution Chart */}
          <div className="lg:col-span-2 bg-white p-5 rounded-xl border border-gray-200 shadow-xs">
            <h4 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
              <PieIcon className="w-4 h-4 text-sky-600" /> Attendance Distribution Ratio
            </h4>

            <div className="h-56 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', borderRadius: '8px', border: 'none', color: '#fff', fontSize: '12px' }} />
                  <Legend wrapperStyle={{ fontSize: '12px' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Student Attendance Percentages Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-gray-200">
            <h4 className="text-sm font-bold text-gray-900">Student Attendance Percentage Ledger</h4>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Department</th>
                  <th className="px-5 py-3.5">Course</th>
                  <th className="px-5 py-3.5">Face Registered</th>
                  <th className="px-5 py-3.5">Attendance Score</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-gray-400">
                      Loading report ledger...
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/80">
                      <td className="px-5 py-3.5 font-bold text-gray-900">#{student.id}</td>
                      <td className="px-5 py-3.5 font-bold text-gray-900">{student.name}</td>
                      <td className="px-5 py-3.5 text-gray-600">{student.department || 'N/A'}</td>
                      <td className="px-5 py-3.5 text-gray-600">{student.course}</td>
                      <td className="px-5 py-3.5">
                        {student.has_face_registered ? (
                          <span className="text-emerald-600 font-bold">✓ Yes</span>
                        ) : (
                          <span className="text-amber-600 font-bold">✕ No</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] ${
                          student.attendance_percentage >= 75
                            ? 'bg-sky-50 text-sky-700 border border-sky-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {student.attendance_percentage}%
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-gray-400">
                      No student records to generate report.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Reports;
