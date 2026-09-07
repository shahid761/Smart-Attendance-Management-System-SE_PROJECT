import React, { useState, useEffect } from 'react';
import { X, Camera, Check, Upload, AlertCircle } from 'lucide-react';
import Webcam from 'react-webcam';
import { registerFace } from '../services/api';

const StudentModal = ({ isOpen, onClose, onSave, student = null, mode = 'add' }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    department: 'Computer Science',
    course: 'B.Tech CS',
    semester: '1st',
    status: 'Active'
  });

  const [faceImage, setFaceImage] = useState(null);
  const [showWebcam, setShowWebcam] = useState(false);
  const [registeringFace, setRegisteringFace] = useState(false);
  const [faceMsg, setFaceMsg] = useState('');
  const webcamRef = React.useRef(null);

  useEffect(() => {
    if (student) {
      setFormData({
        name: student.name || '',
        email: student.email || '',
        phone: student.phone || '',
        department: student.department || 'Computer Science',
        course: student.course || 'B.Tech CS',
        semester: student.semester || '1st',
        status: student.status || 'Active'
      });
    } else {
      setFormData({
        name: '',
        email: '',
        phone: '',
        department: 'Computer Science',
        course: 'B.Tech CS',
        semester: '1st',
        status: 'Active'
      });
    }
    setFaceImage(null);
    setShowWebcam(false);
    setFaceMsg('');
  }, [student, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData, faceImage);
  };

  const capturePhoto = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setFaceImage(imageSrc);
      setShowWebcam(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFaceImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRegisterFaceDirect = async () => {
    if (!student?.id || !faceImage) return;
    setRegisteringFace(true);
    setFaceMsg('');
    try {
      const res = await registerFace(student.id, faceImage);
      setFaceMsg(res.message);
      onSave(formData, null); // Refresh list
    } catch (err) {
      setFaceMsg(err.response?.data?.detail || 'Failed to register face');
    } finally {
      setRegisteringFace(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <h3 className="text-lg font-bold text-gray-900">
            {mode === 'add' ? 'Add New Student' : mode === 'edit' ? 'Edit Student Details' : 'Student Profile'}
          </h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Full Name</label>
              <input
                type="text"
                name="name"
                required
                disabled={mode === 'view'}
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Alex Johnson"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Email Address</label>
              <input
                type="email"
                name="email"
                required
                disabled={mode === 'view'}
                value={formData.email}
                onChange={handleChange}
                placeholder="alex@university.edu"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Phone Number</label>
              <input
                type="text"
                name="phone"
                disabled={mode === 'view'}
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 555-0192"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Department</label>
              <select
                name="department"
                disabled={mode === 'view'}
                value={formData.department}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100"
              >
                <option value="Computer Science">Computer Science</option>
                <option value="Electrical Engineering">Electrical Engineering</option>
                <option value="Mechanical Engineering">Mechanical Engineering</option>
                <option value="Information Technology">Information Technology</option>
                <option value="Civil Engineering">Civil Engineering</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Course</label>
              <input
                type="text"
                name="course"
                disabled={mode === 'view'}
                value={formData.course}
                onChange={handleChange}
                placeholder="B.Tech CS"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 uppercase mb-1">Semester</label>
              <input
                type="text"
                name="semester"
                disabled={mode === 'view'}
                value={formData.semester}
                onChange={handleChange}
                placeholder="6th"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 disabled:bg-gray-100"
              />
            </div>
          </div>

          {/* Biometric Face Section */}
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-700 uppercase mb-2">Biometric Face Reference</p>
            
            {showWebcam ? (
              <div className="space-y-3">
                <div className="relative rounded-lg overflow-hidden border border-gray-300 bg-black max-w-sm mx-auto">
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    className="w-full h-48 object-cover"
                  />
                </div>
                <div className="flex gap-2 justify-center">
                  <button
                    type="button"
                    onClick={capturePhoto}
                    className="px-4 py-1.5 bg-sky-600 text-white rounded-lg text-xs font-semibold hover:bg-sky-700 flex items-center gap-1"
                  >
                    <Camera className="w-4 h-4" /> Capture Photo
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWebcam(false)}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-200">
                {faceImage ? (
                  <img src={faceImage} alt="Captured Face" className="w-20 h-20 object-cover rounded-lg border border-sky-400" />
                ) : (
                  <div className="w-20 h-20 bg-gray-200 rounded-lg flex items-center justify-center text-gray-400 text-xs font-medium">
                    No Photo
                  </div>
                )}

                <div className="flex-1 space-y-2 text-center sm:text-left">
                  <p className="text-xs text-gray-500">
                    {student?.has_face_registered
                      ? "✓ Face registered in system. Capture a new snapshot to update."
                      : "No biometric face data registered yet."}
                  </p>

                  {mode !== 'view' && (
                    <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
                      <button
                        type="button"
                        onClick={() => setShowWebcam(true)}
                        className="px-3 py-1.5 bg-sky-50 text-sky-700 rounded-lg text-xs font-semibold hover:bg-sky-100 border border-sky-200 flex items-center gap-1"
                      >
                        <Camera className="w-3.5 h-3.5" /> Webcam Snapshot
                      </button>
                      <label className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-xs font-semibold hover:bg-gray-50 border border-gray-300 cursor-pointer flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" /> Upload Image
                        <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
                      </label>
                    </div>
                  )}

                  {student?.id && faceImage && (
                    <button
                      type="button"
                      onClick={handleRegisterFaceDirect}
                      disabled={registeringFace}
                      className="px-3 py-1 bg-emerald-600 text-white text-xs font-medium rounded-md hover:bg-emerald-700"
                    >
                      {registeringFace ? 'Saving Face...' : 'Save Face Reference Now'}
                    </button>
                  )}

                  {faceMsg && <p className="text-xs font-medium text-emerald-600">{faceMsg}</p>}
                </div>
              </div>
            )}
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-100 text-gray-700 text-sm font-semibold rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
            {mode !== 'view' && (
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white text-sm font-semibold rounded-lg hover:bg-sky-700 shadow-sm"
              >
                {mode === 'add' ? 'Save Student' : 'Update Student'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default StudentModal;
