import React, { useEffect, useState } from 'react';
import Header from '../components/Header';
import StatCard from '../components/StatCard';
import AttendanceChart from '../components/AttendanceChart';
import { fetchDashboardStats } from '../services/api';
import { Users, UserCheck, UserX, Percent, AlertTriangle, Activity } from 'lucide-react';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    try {
      const data = await fetchDashboardStats();
      setStats(data);
    } catch (err) {
      console.error('Error fetching dashboard stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sky-600"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <Header title="Dashboard Overview" />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {/* Statistics Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <StatCard
            title="Total Students"
            value={stats?.total_students || 0}
            icon={Users}
            color="sky"
            subtext="Registered in system"
          />
          <StatCard
            title="Present Today"
            value={stats?.present_today || 0}
            icon={UserCheck}
            color="emerald"
            subtext="Biometric / Manual"
          />
          <StatCard
            title="Absent Today"
            value={stats?.absent_today || 0}
            icon={UserX}
            color="rose"
            subtext="Not marked present"
          />
          <StatCard
            title="Attendance Rate"
            value={`${stats?.attendance_percentage || 0}%`}
            icon={Percent}
            color="indigo"
            subtext="Overall daily average"
          />
        </div>

        {/* Middle Section: Chart & Low Attendance Warning Box */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <AttendanceChart data={stats?.weekly_attendance || []} />
          </div>

          {/* Low Attendance Alert Card (< 75%) */}
          <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-xs flex flex-col">
            <div className="flex items-center gap-2 mb-4 text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              <AlertTriangle className="w-5 h-5 shrink-0" />
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider">Low Attendance Alerts</h4>
                <p className="text-[11px] text-amber-600">Students below 75% threshold</p>
              </div>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto max-h-64">
              {stats?.low_attendance_students && stats.low_attendance_students.length > 0 ? (
                stats.low_attendance_students.map((student) => (
                  <div key={student.id} className="p-3 bg-gray-50 rounded-lg border border-gray-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-gray-900">{student.name}</p>
                      <p className="text-[11px] text-gray-500">{student.department}</p>
                    </div>
                    <span className="px-2 py-1 bg-rose-100 text-rose-700 text-xs font-bold rounded-md">
                      {student.attendance_percentage}%
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-xs text-gray-400">
                  No students currently below 75% attendance
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity Timeline Table */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-5 h-5 text-sky-600" /> Recent System Activity
            </h3>
            <span className="text-xs text-gray-400">Live event logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Event Type</th>
                  <th className="px-4 py-3">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {stats?.recent_activity && stats.recent_activity.length > 0 ? (
                  stats.recent_activity.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
                        {new Date(log.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-sky-50 text-sky-700 font-semibold rounded-md border border-sky-200">
                          {log.event_type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-gray-700">{log.description}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="3" className="px-4 py-6 text-center text-gray-400">
                      No recent activities logged
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

export default Dashboard;
