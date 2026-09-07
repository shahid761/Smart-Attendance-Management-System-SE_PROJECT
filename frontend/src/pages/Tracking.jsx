import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import { fetchTrackingLogs } from '../services/api';
import { Activity, Clock, ShieldCheck, UserCheck, UserPlus, RefreshCw } from 'lucide-react';

const Tracking = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const data = await fetchTrackingLogs();
      setLogs(data);
    } catch (err) {
      console.error('Error loading tracking logs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLogs();
  }, []);

  const getEventBadge = (eventType) => {
    switch (eventType) {
      case 'Student created':
        return { bg: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: UserPlus };
      case 'Student updated':
        return { bg: 'bg-amber-50 text-amber-700 border-amber-200', icon: RefreshCw };
      case 'Face recognized':
        return { bg: 'bg-indigo-50 text-indigo-700 border-indigo-200', icon: ShieldCheck };
      case 'Attendance marked':
        return { bg: 'bg-sky-50 text-sky-700 border-sky-200', icon: UserCheck };
      default:
        return { bg: 'bg-gray-50 text-gray-700 border-gray-200', icon: Activity };
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <Header title="Activity & Audit Tracking" />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <div className="flex items-center justify-between bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          <div>
            <h3 className="text-sm font-bold text-gray-900 flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" /> System Audit Trail
            </h3>
            <p className="text-xs text-gray-500">Real-time log of administrative and facial recognition events</p>
          </div>
          <button
            onClick={loadLogs}
            className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-200 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh Logs
          </button>
        </div>

        {/* Tracking Timeline Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">Log ID</th>
                  <th className="px-5 py-3.5">Event Type</th>
                  <th className="px-5 py-3.5">Description</th>
                  <th className="px-5 py-3.5">Date & Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-gray-400">
                      Loading activity logs...
                    </td>
                  </tr>
                ) : logs.length > 0 ? (
                  logs.map((log) => {
                    const badge = getEventBadge(log.event_type);
                    const Icon = badge.icon;
                    return (
                      <tr key={log.id} className="hover:bg-gray-50/80">
                        <td className="px-5 py-3.5 font-bold text-gray-900">#{log.id}</td>
                        <td className="px-5 py-3.5 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-md font-bold text-[11px] border inline-flex items-center gap-1.5 ${badge.bg}`}>
                            <Icon className="w-3.5 h-3.5" /> {log.event_type}
                          </span>
                        </td>
                        <td className="px-5 py-3.5 text-gray-800">{log.description}</td>
                        <td className="px-5 py-3.5 text-gray-500 whitespace-nowrap">
                          <span className="inline-flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-gray-400" />
                            {new Date(log.created_at).toLocaleString()}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="4" className="px-5 py-8 text-center text-gray-400">
                      No activity events recorded yet.
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

export default Tracking;
