import React, { useState, useRef, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Upload, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { recognizeFace } from '../services/api';

const WebcamCapture = ({ onRecognitionResult }) => {
  const webcamRef = useRef(null);
  const [cameraActive, setCameraActive] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastResult, setLastResult] = useState(null);
  const [autoScan, setAutoScan] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Handle automatic continuous scanning when enabled
  useEffect(() => {
    let interval = null;
    if (autoScan && cameraActive) {
      interval = setInterval(() => {
        captureAndRecognize();
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoScan, cameraActive]);

  const captureAndRecognize = async (customImage = null) => {
    let imageSrc = customImage;
    if (!imageSrc && webcamRef.current && cameraActive) {
      imageSrc = webcamRef.current.getScreenshot();
    }

    if (!imageSrc) {
      setErrorMsg('No video frame captured. Ensure camera is active or upload a photo.');
      return;
    }

    setIsProcessing(true);
    setErrorMsg('');
    try {
      const res = await recognizeFace(imageSrc);
      setLastResult(res);
      if (onRecognitionResult) {
        onRecognitionResult(res);
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.detail || 'Recognition server error');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        captureAndRecognize(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-xs space-y-6">
      {/* Top Banner / Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-sky-600" /> Biometric Scanner
          </h3>
          <p className="text-xs text-gray-500">Live facial recognition for automatic attendance logging</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer bg-gray-100 px-3 py-1.5 rounded-lg">
            <input
              type="checkbox"
              checked={autoScan}
              onChange={(e) => setAutoScan(e.target.checked)}
              className="rounded text-sky-600 focus:ring-sky-500 w-4 h-4"
            />
            <span>Auto Scan (Every 3s)</span>
          </label>

          <button
            onClick={() => setCameraActive(!cameraActive)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              cameraActive
                ? 'bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100'
                : 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
            }`}
          >
            <Camera className="w-3.5 h-3.5" />
            <span>{cameraActive ? 'Stop Camera' : 'Start Camera'}</span>
          </button>
        </div>
      </div>

      {/* Video Stream & Recognition Box */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Camera Frame */}
        <div className="lg:col-span-2 relative rounded-xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner flex items-center justify-center min-h-[320px]">
          {cameraActive ? (
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-80 object-cover"
            />
          ) : (
            <div className="text-center p-8 text-slate-500 space-y-2">
              <Camera className="w-12 h-12 mx-auto text-slate-600" />
              <p className="text-sm font-medium">Camera feeds disabled</p>
              <p className="text-xs">Click 'Start Camera' or upload an image to process facial recognition</p>
            </div>
          )}

          {/* Facial Target Scanner Overlay */}
          {cameraActive && (
            <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
              <div className="w-56 h-56 border-2 border-sky-400/70 border-dashed rounded-2xl flex items-center justify-center animate-pulse relative">
                <div className="absolute -top-3 px-2 py-0.5 bg-sky-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
                  Target Face Region
                </div>
              </div>
            </div>
          )}

          {isProcessing && (
            <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center text-white gap-2">
              <RefreshCw className="w-6 h-6 animate-spin text-sky-400" />
              <span className="text-sm font-semibold">Analyzing Face...</span>
            </div>
          )}
        </div>

        {/* Action Panel & Results */}
        <div className="space-y-4">
          <div className="flex flex-col gap-2">
            <button
              onClick={() => captureAndRecognize()}
              disabled={isProcessing || !cameraActive}
              className="w-full py-3 bg-sky-600 text-white rounded-xl text-sm font-bold hover:bg-sky-700 disabled:opacity-50 flex items-center justify-center gap-2 shadow-sm"
            >
              <Camera className="w-4 h-4" /> Capture & Recognize
            </button>

            <label className="w-full py-2.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-semibold hover:bg-gray-200 border border-gray-300 cursor-pointer flex items-center justify-center gap-2">
              <Upload className="w-4 h-4" /> Upload Frame Photo
              <input type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 text-rose-700 text-xs font-medium rounded-lg border border-rose-200 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Last Match Card */}
          {lastResult && (
            <div className={`p-4 rounded-xl border ${
              lastResult.recognized ? 'bg-emerald-50/80 border-emerald-200' : 'bg-slate-50 border-slate-200'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                {lastResult.recognized ? (
                  <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 text-amber-500 shrink-0" />
                )}
                <div>
                  <h4 className="font-bold text-sm text-gray-900">
                    {lastResult.recognized ? lastResult.student_name : 'Not Recognized'}
                  </h4>
                  <p className="text-xs text-gray-500">
                    {lastResult.recognized ? `Student ID: #${lastResult.student_id}` : 'No matching face in database'}
                  </p>
                </div>
              </div>

              <div className="mt-3 space-y-2 pt-2 border-t border-gray-200/60">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-gray-500">Confidence Score:</span>
                  <span className="text-gray-900 font-bold">{Math.round(lastResult.confidence * 100)}%</span>
                </div>
                <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-500 ${
                      lastResult.confidence >= 0.70 ? 'bg-emerald-500' : lastResult.confidence >= 0.50 ? 'bg-amber-500' : 'bg-rose-500'
                    }`}
                    style={{ width: `${Math.round(lastResult.confidence * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[11px] font-semibold text-gray-600 mt-1">{lastResult.message}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default WebcamCapture;
