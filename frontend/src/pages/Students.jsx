import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import StudentModal from '../components/StudentModal';
import { fetchStudents, createStudent, updateStudent, deleteStudent, registerFace } from '../services/api';
import { UserPlus, Search, Edit3, Trash2, Eye, ScanFace, Check, AlertCircle } from 'lucide-react';

const Students = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentStudent, setCurrentStudent] = useState(null);
  const [modalMode, setModalMode] = useState('add'); // 'add', 'edit', 'view'
  const [alertMsg, setAlertMsg] = useState('');

  const loadStudents = async (query = '') => {
    setLoading(true);
    try {
      const data = await fetchStudents(query);
      setStudents(data);
    } catch (err) {
      console.error('Error fetching students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudents(search);
  }, [search]);

  const handleOpenAdd = () => {
    setCurrentStudent(null);
    setModalMode('add');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (student) => {
    setCurrentStudent(student);
    setModalMode('edit');
    setIsModalOpen(true);
  };

  const handleOpenView = (student) => {
    setCurrentStudent(student);
    setModalMode('view');
    setIsModalOpen(true);
  };

  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete student ${name}?`)) {
      try {
        await deleteStudent(id);
        setAlertMsg(`Successfully deleted ${name}`);
        loadStudents(search);
      } catch (err) {
        alert('Failed to delete student');
      }
    }
  };

  const handleSaveStudent = async (formData, faceImage) => {
    try {
      if (modalMode === 'add') {
        const created = await createStudent(formData);
        if (faceImage && created?.id) {
          await registerFace(created.id, faceImage);
        }
        setAlertMsg(`Added new student ${created.name}`);
      } else if (modalMode === 'edit' && currentStudent) {
        const updated = await updateStudent(currentStudent.id, formData);
        if (faceImage && updated?.id) {
          await registerFace(updated.id, faceImage);
        }
        setAlertMsg(`Updated details for ${updated.name}`);
      }
      setIsModalOpen(false);
      loadStudents(search);
    } catch (err) {
      alert(err.response?.data?.detail || 'Error saving student');
    }
  };

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-gray-50">
      <Header title="Student Directory" />

      <main className="p-6 space-y-6 max-w-7xl w-full mx-auto">
        {alertMsg && (
          <div className="p-3 bg-emerald-50 text-emerald-800 text-xs font-semibold rounded-lg border border-emerald-200 flex justify-between items-center">
            <span>{alertMsg}</span>
            <button onClick={() => setAlertMsg('')} className="text-emerald-600 hover:text-emerald-900 font-bold">✕</button>
          </div>
        )}

        {/* Toolbar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-gray-200 shadow-xs">
          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, department..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-xs focus:ring-2 focus:ring-sky-500 focus:border-sky-500"
            />
          </div>

          <button
            onClick={handleOpenAdd}
            className="w-full sm:w-auto px-4 py-2 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 flex items-center justify-center gap-2 shadow-sm"
          >
            <UserPlus className="w-4 h-4" /> Add Student
          </button>
        </div>

        {/* Students Table */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-500 uppercase tracking-wider font-semibold border-b border-gray-200">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Student Name</th>
                  <th className="px-5 py-3.5">Contact</th>
                  <th className="px-5 py-3.5">Dept / Course</th>
                  <th className="px-5 py-3.5">Biometric Face</th>
                  <th className="px-5 py-3.5">Attendance %</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium text-gray-700">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-gray-400">
                      Loading student directory...
                    </td>
                  </tr>
                ) : students.length > 0 ? (
                  students.map((student) => (
                    <tr key={student.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="px-5 py-3.5 font-bold text-gray-900">#{student.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-bold text-gray-900">{student.name}</div>
                        <div className="text-[11px] text-gray-400">{student.email}</div>
                      </td>
                      <td className="px-5 py-3.5 text-gray-600">{student.phone || 'N/A'}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-semibold text-gray-800">{student.department || 'N/A'}</div>
                        <div className="text-[11px] text-gray-500">{student.course} ({student.semester})</div>
                      </td>
                      <td className="px-5 py-3.5">
                        {student.has_face_registered ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-md font-semibold text-[11px] border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" /> Registered
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-50 text-amber-700 rounded-md font-semibold text-[11px] border border-amber-200">
                            <AlertCircle className="w-3 h-3 text-amber-600" /> Pending
                          </span>
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
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleOpenView(student)}
                            title="View Profile"
                            className="p-1.5 text-gray-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenEdit(student)}
                            title="Edit Student"
                            className="p-1.5 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(student.id, student.name)}
                            title="Delete Student"
                            className="p-1.5 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="7" className="px-5 py-8 text-center text-gray-400">
                      No students found matching search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      <StudentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveStudent}
        student={currentStudent}
        mode={modalMode}
      />
    </div>
  );
};

export default Students;
