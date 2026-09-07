import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { fetchAttendance, fetchStudents, markAttendance } from '../services/api';
import { Calendar, Filter, UserCheck, CheckCircle2, Clock } from 'lucide-react';

const Attendance = () => {
  const [attendance, setAttendance] = useState([]);
  const [students, setStudents] = useState([]);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [loading, setLoading] = useState(true);
  const [quickStudentId, setQuickStudentId] = useState('');
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    setLoading(true);
    try {
      const [attData, studentList] = await Promise.all([
        fetchAttendance(selectedDate, selectedStudent),
        fetchStudents()
      ]);
      setAttendance(attData);
      setStudents(studentList);
    } catch (err) {
      console.error('Error loading attendance:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [selectedDate, selectedStudent]);

  const handleQuickMark = async (e) => {
    e.preventDefault();
    if (!quickStudentId) return;
    try {
      const res = await markAttendance(parseInt(quickStudentId), 1.0);
      setMsg(res.student_name ? `Attendance marked for ${res.student_name}` : 'Attendance marked');
      loadData();
    } catch (err) {
      alert(err.response?.data?.detail || 'Error marking attendance');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <Header title="Attendance Management" />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Filters & Manual Quick Mark Toolbar */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Filters Card */}
          <div className="lg:col-span-2 bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
              <Filter className="w-4 h-4 text-sky-600" /> Filters:
            </div>

            <div>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <select
                value={selectedStudent}
                onChange={(e) => setSelectedStudent(e.target.value)}
                className="px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
              >
                <option value="">All Students</option>
                {students.map((s) => (
                  <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>
                ))}
              </select>
            </div>

            {(selectedDate || selectedStudent) && (
              <button
                onClick={() => { setSelectedDate(''); setSelectedStudent(''); }}
                className="text-xs text-rose-600 font-semibold hover:underline"
              >
                Reset Filters
              </button>
            )}
          </div>

          {/* Quick Mark Card */}
          <form onSubmit={handleQuickMark} className="bg-white p-4 rounded-xl border border-gray-200 shadow-xs flex items-center gap-2">
            <select
              required
              value={quickStudentId}
              onChange={(e) => setQuickStudentId(e.target.value)}
              className="flex-1 px-3 py-1.5 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500"
            >
              <option value="">Select Student to Mark...</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>{s.name} (#{s.id})</option>
              ))}
            </select>
            <button
              type="submit"
              className="px-3 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 whitespace-nowrap flex items-center gap-1"
            >
              <UserCheck className="w-3.5 h-3.5" /> Mark Present
            </button>
          </form>
        </div>

        {msg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex justify-between items-center">
            <span>{msg}</span>
            <button onClick={() => setMsg('')} className="text-emerald-600 hover:text-emerald-900">✕</button>
          </div>
        )}

        {/* Attendance Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Record ID</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Date</th>
                  <th className="px-5 py-3.5">Time</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Recognition Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-gray-400">
                      Loading attendance records...
                    </td>
                  </tr>
                ) : attendance.length > 0 ? (
                  attendance.map((rec) => (
                    <tr key={rec.id} className="hover:bg-gray-50/80">
                      <td className="px-5 py-3.5 font-bold text-gray-900">#{rec.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{rec.student_name}</div>
                        <div className="text-[11px] text-gray-400">Student ID: #{rec.student_id}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{rec.date}</td>
                      <td className="px-5 py-3.5 text-gray-600 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-gray-400" /> {rec.time}
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-bold rounded-md border border-emerald-200 inline-flex items-center gap-1 text-[11px]">
                          <CheckCircle2 className="w-3 h-3 text-emerald-600" /> {rec.status}
                        </span>
                      </td>
                      <td className="px-5 py-3.5">
                        <span className="px-2.5 py-1 bg-sky-50 text-sky-700 font-bold rounded-md border border-sky-200 text-[11px]">
                          {Math.round(rec.confidence * 100)}% Match
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-gray-400">
                      No attendance records found.
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

export default Attendance;
