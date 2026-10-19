'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  Upload,
  Camera,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  Copy,
  Share2,
  ExternalLink,
  ShieldCheck,
  Sparkles,
  FileText
} from 'lucide-react'
import Navbar from '../../../components/Navbar'
import StepIndicator from '../../../components/StepIndicator'
import DetectionResult from '../../../components/DetectionResult'
import CityMap from '../../../components/CityMap'
import { api, DetectResponse, Report } from '../../../lib/api'
import { useToast } from '../../../components/Toast'

// browser-image-compression import
import imageCompression from 'browser-image-compression'

export default function ReportSubmissionPage() {
  const router = useRouter()
  const toast = useToast()

  // Current Step: 1 = Upload, 2 = AI Loading, 3 = Review, 4 = Success
  const [currentStep, setCurrentStep] = useState(1)

  // Step 1 state
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [latitude, setLatitude] = useState<number>(30.3398)
  const [longitude, setLongitude] = useState<number>(76.3869)
  const [locationStatus, setLocationStatus] = useState<string>('📍 Detecting your location...')
  const [locationName, setLocationName] = useState<string>('Patiala, Punjab')
  const [manualGps, setManualGps] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Step 2 state (AI detection simulation steps)
  const [detectionStepsDone, setDetectionStepsDone] = useState<number>(0)
  const [detectionData, setDetectionData] = useState<DetectResponse | null>(null)

  // Step 3 state (Review)
  const [description, setDescription] = useState<string>('')
  const [submitting, setSubmitting] = useState(false)

  // Step 4 state (Success)
  const [submittedReport, setSubmittedReport] = useState<Report | null>(null)

  // Geolocation detection
  useEffect(() => {
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(4))
          const lng = parseFloat(pos.coords.longitude.toFixed(4))
          setLatitude(lat)
          setLongitude(lng)
          setLocationStatus(`✅ Current GPS: (${lat}, ${lng})`)
        },
        (err) => {
          setLocationStatus('⚠️ GPS access denied. Using Patiala Municipal center.')
          setManualGps(true)
        },
        { timeout: 5000 }
      )
    } else {
      setLocationStatus('⚠️ Geolocation unavailable. Using default Patiala coordinates.')
      setManualGps(true)
    }
  }, [])

  // Handle file select + client-side compression
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      try {
        const options = {
          maxSizeMB: 1,
          maxWidthOrHeight: 1280,
          useWebWorker: true,
        }
        // Client-side image compression
        const compressedBlob = await imageCompression(file, options)
        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        })

        setSelectedFile(compressedFile)
        setPreviewUrl(URL.createObjectURL(compressedFile))
      } catch (err) {
        // Fallback without compression
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
      }
    }
  }

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
  }

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault()
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0]
      try {
        const options = { maxSizeMB: 1, maxWidthOrHeight: 1280, useWebWorker: true }
        const compressedBlob = await imageCompression(file, options)
        const compressedFile = new File([compressedBlob], file.name, {
          type: file.type,
          lastModified: Date.now(),
        })
        setSelectedFile(compressedFile)
        setPreviewUrl(URL.createObjectURL(compressedFile))
      } catch {
        setSelectedFile(file)
        setPreviewUrl(URL.createObjectURL(file))
      }
    }
  }

  // Trigger Step 2 -> Run detection
  const handleStartDetection = async () => {
    if (!selectedFile) return
    setCurrentStep(2)
    setDetectionStepsDone(0)

    // Staggered UI checklist animation
    setTimeout(() => setDetectionStepsDone(1), 600)   // "Uploading photo..."
    setTimeout(() => setDetectionStepsDone(2), 1200)  // "Running AI detection..."
    setTimeout(() => setDetectionStepsDone(3), 1800)  // "Calculating severity..."
    setTimeout(() => setDetectionStepsDone(4), 2400)  // "Checking for duplicates..."

    try {
      const res = await api.detect(selectedFile, latitude, longitude)
      setDetectionData(res)

      // Transition to Step 3 after completion
      setTimeout(() => {
        setCurrentStep(3)
      }, 2600)
    } catch (err: any) {
      toast.error(err.message || 'Detection failed. Please retry.')
      setCurrentStep(1)
    }
  }

  // Step 3 -> Final Submit
  const handleFinalSubmit = async () => {
    if (!detectionData || !selectedFile) return
    setSubmitting(true)

    try {
      const formData = new FormData()
      formData.append('file', selectedFile)
      formData.append('latitude', latitude.toString())
      formData.append('longitude', longitude.toString())
      formData.append('location_name', locationName)
      formData.append('issue_type', detectionData.top_issue)
      formData.append('confidence', (detectionData.detections[0]?.confidence || 0.85).toString())
      formData.append('severity', detectionData.top_severity)
      formData.append('urgency_score', detectionData.urgency_score.toString())
      formData.append('cost_estimate_min', (detectionData.detections[0]?.cost_min || 5000).toString())
      formData.append('cost_estimate_max', (detectionData.detections[0]?.cost_max || 20000).toString())
      if (description) formData.append('description', description)
      if (detectionData.result_image) formData.append('result_image_b64', detectionData.result_image)
      if (detectionData.duplicate_of) formData.append('duplicate_of', detectionData.duplicate_of)
      formData.append('duplicate_count', detectionData.duplicate_count.toString())

      const report = await api.submitReport(formData)
      setSubmittedReport(report)
      setCurrentStep(4)
      toast.success('Report filed successfully!')
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit report')
    } finally {
      setSubmitting(false)
    }
  }

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.origin + '/citizen/reports')
      toast.success('Tracking link copied to clipboard!')
    }
  }

  const handleReset = () => {
    setSelectedFile(null)
    setPreviewUrl(null)
    setDetectionData(null)
    setDescription('')
    setSubmittedReport(null)
    setCurrentStep(1)
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc]">
      <Navbar />

      {/* Step Indicator Header */}
      <div className="bg-white border-b border-[#e2e8f0] px-4">
        <StepIndicator currentStep={currentStep} />
      </div>

      <div className="flex-1 flex flex-col justify-center">
        {/* ================= STEP 1: UPLOAD ================= */}
        {currentStep === 1 && (
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 min-h-[calc(100vh-120px)]">
            {/* Left Dark Panel */}
            <div className="bg-[#1a1a2e] text-white p-6 md:p-10 flex flex-col justify-between">
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-cyan-400">
                    Step 1 of 4 • Spatial Ingestion
                  </span>
                  <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-1">
                    Upload Civic Incident Photo
                  </h1>
                  <p className="text-xs text-slate-300 mt-1">
                    Provide a clear photo of road potholes, garbage heaps, or water accumulation.
                  </p>
                </div>

                {/* Drag-drop zone */}
                <div
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-600 hover:border-cyan-400 bg-slate-900/60 rounded-[8px] p-6 flex flex-col items-center justify-center cursor-pointer transition-colors min-h-[220px] text-center"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />

                  {previewUrl ? (
                    <div className="space-y-2 w-full flex flex-col items-center">
                      <img
                        src={previewUrl}
                        alt="Preview"
                        className="max-h-40 rounded-[6px] object-contain border border-slate-700"
                      />
                      <p className="text-xs text-cyan-400 font-semibold">
                        Photo loaded ({selectedFile?.name}) — Click to change
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-2.5">
                      <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-cyan-400">
                        <Upload className="w-5 h-5" />
                      </div>
                      <p className="text-sm font-semibold text-slate-200">
                        Drop your photo here or <span className="text-cyan-400 underline">browse</span>
                      </p>
                      <p className="text-[11px] text-slate-400">
                        Supported formats: JPG, PNG, WEBP (auto-compressed)
                      </p>
                    </div>
                  )}
                </div>

                {/* GPS Status */}
                <div className="bg-slate-900/80 p-3.5 rounded-[6px] border border-slate-700 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-200">{locationStatus}</span>
                    <button
                      type="button"
                      onClick={() => setManualGps(!manualGps)}
                      className="text-[11px] text-cyan-400 hover:underline"
                    >
                      {manualGps ? 'Hide coordinates' : 'Adjust GPS coordinates'}
                    </button>
                  </div>

                  {manualGps && (
                    <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800 animate-in fade-in">
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Latitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={latitude}
                          onChange={(e) => setLatitude(parseFloat(e.target.value) || 30.3398)}
                          className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] text-slate-400 block mb-1">Longitude</label>
                        <input
                          type="number"
                          step="0.0001"
                          value={longitude}
                          onChange={(e) => setLongitude(parseFloat(e.target.value) || 76.3869)}
                          className="w-full text-xs p-2 rounded bg-slate-800 border border-slate-700 text-white"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Next Button */}
              <div className="pt-6 border-t border-slate-800 flex justify-end">
                <button
                  type="button"
                  disabled={!selectedFile}
                  onClick={handleStartDetection}
                  className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 text-xs font-bold px-6 py-3 rounded-[6px] transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-md"
                >
                  <span>Proceed to AI Detection</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Map Panel */}
            <div className="h-[400px] lg:h-full relative bg-slate-100 flex flex-col justify-between">
              <div className="absolute top-4 left-4 z-20 bg-white/90 backdrop-blur-xs px-3 py-1.5 rounded-[6px] border border-slate-200 text-xs font-semibold text-slate-800 shadow-sm flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-rose-500" />
                <span>Drag pin or click map to pinpoint incident site</span>
              </div>

              <CityMap
                singlePin={true}
                pinLat={latitude}
                pinLng={longitude}
                draggablePin={true}
                onPinChange={(lat, lng) => {
                  setLatitude(parseFloat(lat.toFixed(4)))
                  setLongitude(parseFloat(lng.toFixed(4)))
                  setLocationStatus(`📍 Custom Pin: (${lat.toFixed(4)}, ${lng.toFixed(4)})`)
                }}
                height="100%"
                zoom={14}
              />
            </div>
          </div>
        )}

        {/* ================= STEP 2: AI DETECTION LOADING ================= */}
        {currentStep === 2 && (
          <div className="max-w-4xl w-full mx-auto p-6 md:p-12 my-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-white p-8 rounded-[8px] border border-[#e2e8f0] shadow-sm">
              {/* Photo with scanning animation */}
              <div className="relative rounded-[8px] overflow-hidden bg-slate-900 aspect-video flex items-center justify-center border border-slate-300 shadow-inner">
                {previewUrl && (
                  <img
                    src={previewUrl}
                    alt="Scanning"
                    className="w-full h-full object-cover filter brightness-90"
                  />
                )}
                {/* Cyan animated scanning line */}
                <div className="absolute left-0 right-0 h-1 bg-cyan-400 shadow-[0_0_15px_#22d3ee] animate-scan pointer-events-none" />

                <div className="absolute top-3 left-3 bg-[#1a1a2e]/90 text-white text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-cyan-400 animate-spin" />
                  <span>YOLOv8 Inference Engine Active</span>
                </div>
              </div>

              {/* Progress Checklist */}
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                    Step 2 of 4 • Neural Processing
                  </span>
                  <h2 className="text-xl font-bold text-[#1a1a2e] mt-1 tracking-tight">
                    Analyzing Civic Incident...
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Model is extracting feature maps and identifying municipal defect signatures.
                  </p>
                </div>

                <div className="space-y-3.5">
                  {[
                    { step: 1, label: 'Uploading photo to municipal node...' },
                    { step: 2, label: 'Running AI detection (YOLOv8)...' },
                    { step: 3, label: 'Calculating severity and repair estimate...' },
                    { step: 4, label: 'Checking for duplicates & routing department...' },
                  ].map((item) => {
                    const isDone = detectionStepsDone >= item.step
                    return (
                      <div key={item.step} className="flex items-center gap-3 text-xs">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] transition-all ${
                            isDone
                              ? 'bg-[#0f9b58] text-white'
                              : 'border-2 border-slate-300 text-transparent'
                          }`}
                        >
                          {isDone ? <Check className="w-3 h-3 stroke-[3]" /> : null}
                        </div>
                        <span
                          className={`font-medium ${
                            isDone ? 'text-slate-900 font-semibold' : 'text-slate-400'
                          }`}
                        >
                          {item.label}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= STEP 3: REVIEW RESULTS ================= */}
        {currentStep === 3 && detectionData && (
          <div className="max-w-5xl w-full mx-auto p-4 md:p-8 my-auto">
            <DetectionResult
              detectionData={detectionData}
              uploadedImagePreview={previewUrl || ''}
              description={description}
              onDescriptionChange={setDescription}
              onRetake={() => setCurrentStep(1)}
              onSubmit={handleFinalSubmit}
              submitting={submitting}
            />
          </div>
        )}

        {/* ================= STEP 4: SUCCESS ================= */}
        {currentStep === 4 && (
          <div className="max-w-md w-full mx-auto p-6 my-auto text-center">
            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-8 shadow-sm space-y-6">
              {/* Big Green Checkmark Animation */}
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-[#0f9b58] flex items-center justify-center mx-auto shadow-inner animate-in zoom-in-75 duration-300">
                <CheckCircle2 className="w-10 h-10 stroke-[2.5]" />
              </div>

              <div>
                <h2 className="text-xl font-extrabold text-[#1a1a2e] tracking-tight">
                  Report Submitted Successfully!
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Your incident has been verified and registered in the municipal dispatch database.
                </p>
              </div>

              {/* Report ID */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px]">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Official Report Reference ID
                </span>
                <strong className="text-2xl font-mono font-bold text-[#1a1a2e] tracking-tight">
                  #{submittedReport?.report_id || 'CS-A3F9B2'}
                </strong>
                <p className="text-[11px] text-slate-500 mt-1">
                  Assigned to <strong className="text-slate-800">{submittedReport?.department_name || detectionData?.top_department || 'Roads Department'}</strong>
                </p>
              </div>

              {/* Urgency Progress Bar */}
              <div className="space-y-1.5 text-left">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600">Urgency Assessment</span>
                  <span className="text-[#1a1a2e]">
                    {submittedReport?.urgency_score || detectionData?.urgency_score || 78}/100
                  </span>
                </div>
                <div className="w-full bg-slate-200 rounded-full h-2.5 overflow-hidden">
                  <div
                    className="bg-[#1a1a2e] h-2.5 rounded-full transition-all duration-1000"
                    style={{
                      width: `${submittedReport?.urgency_score || detectionData?.urgency_score || 78}%`,
                    }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2.5 pt-2">
                <Link
                  href="/citizen/reports"
                  className="w-full flex items-center justify-center gap-2 bg-[#1a1a2e] hover:bg-[#25253e] text-white text-xs font-semibold py-2.5 rounded-[6px] transition-colors shadow-sm"
                >
                  <FileText className="w-4 h-4" />
                  <span>Track this report</span>
                </Link>

                <button
                  type="button"
                  onClick={handleReset}
                  className="w-full flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#1a1a2e] border border-[#e2e8f0] text-xs font-semibold py-2.5 rounded-[6px] transition-colors"
                >
                  <span>Report another issue</span>
                </button>

                <button
                  type="button"
                  onClick={handleCopyLink}
                  className="w-full flex items-center justify-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 py-1 transition-colors"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  <span>Copy tracking link</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
