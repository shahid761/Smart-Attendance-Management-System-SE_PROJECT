import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';

import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Recognition from './pages/Recognition';
import Attendance from './pages/Attendance';
import Tracking from './pages/Tracking';
import Reports from './pages/Reports';

function App() {
  return (
    <Router>
      <div className="flex min-h-screen bg-gray-50 text-gray-900 font-sans antialiased">
        <Sidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/students" element={<Students />} />
            <Route path="/recognition" element={<Recognition />} />
            <Route path="/attendance" element={<Attendance />} />
            <Route path="/tracking" element={<Tracking />} />
            <Route path="/reports" element={<Reports />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
