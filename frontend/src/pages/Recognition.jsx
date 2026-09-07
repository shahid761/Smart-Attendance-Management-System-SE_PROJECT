import React, { useState } from 'react';
import Header from '../components/Header';
import WebcamCapture from '../components/WebcamCapture';
import { ScanFace, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

const Recognition = () => {
  const [detectionLogs, setDetectionLogs] = useState([]);

  const handleRecognitionResult = (res) => {
    if (res.recognized) {
      const newEntry = {
        id: Date.now(),
        student_id: res.student_id,
        student_name: res.student_name,
        confidence: res.confidence,
        time: new Date().toLocaleTimeString(),
        message: res.message
      };
      setDetectionLogs((prev) => [newEntry, ...prev.slice(0, 9)]);
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <Header title="Biometric Face Recognition" />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        <WebcamCapture onRecognitionResult={handleRecognitionResult} />

        {/* Real-time Recognition Activity Logs */}
        <div className="bg-white rounded-xl border border-gray-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
              <ScanFace className="w-5 h-5 text-sky-600" /> Live Recognition Feed
            </h3>
            <span className="text-xs text-gray-400">Current session detections</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3">Time</th>
                  <th className="px-4 py-3">Student Name</th>
                  <th className="px-4 py-3">Student ID</th>
                  <th className="px-4 py-3">Match Confidence</th>
                  <th className="px-4 py-3">Attendance Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {detectionLogs.length > 0 ? (
                  detectionLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-gray-50/80">
                      <td className="px-4 py-3 text-gray-500 whitespace-nowrap">{log.time}</td>
                      <td className="px-4 py-3 font-bold text-gray-900">{log.student_name}</td>
                      <td className="px-4 py-3 text-gray-600">#{log.student_id}</td>
                      <td className="px-4 py-3">
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 font-bold rounded-md border border-emerald-200">
                          {Math.round(log.confidence * 100)}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1 text-sky-700 font-semibold">
                          <CheckCircle className="w-3.5 h-3.5 text-sky-600" /> Marked Present
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-4 py-8 text-center text-gray-400">
                      No facial recognition events recorded in this live session yet.
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

export default Recognition;
