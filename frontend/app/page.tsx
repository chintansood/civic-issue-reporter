'use client'

import { useMemo, useState, useEffect } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  CloudRain,
  ExternalLink,
  FileImage,
  Filter,
  Gauge,
  GripVertical,
  Leaf,
  Loader2,
  MapPin,
  Menu,
  MoreHorizontal,
  Navigation,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Upload,
  UserRound,
  Users,
  X,
  AlertCircle,
  Inbox
} from 'lucide-react'

type View = 'citizen' | 'staff' | 'admin'
type Status = 'Pending' | 'In Progress' | 'Resolved'
type Severity = 'High' | 'Medium' | 'Low'
type IssueType = 'Road Damage' | 'Garbage' | 'Waterlogging'

type DetectionItem = {
  issue_type: string
  confidence: number
  severity: Severity
  bbox: number[]
}

type DetectionResult = {
  detections: DetectionItem[]
  result_image: string
  location: {
    latitude: number
    longitude: number
    maps_link: string
  }
}

type StaffReport = {
  report_id: string
  detections: DetectionItem[]
  result_image: string
  location: {
    latitude: number
    longitude: number
    maps_link: string
  }
  department: string
  urgency_score: number
  status: Status
  timestamp: string
  issue_type: string
  severity: Severity
}

const severityClass = (severity: Severity) =>
  severity === 'High' ? 'severity-high' : severity === 'Medium' ? 'severity-medium' : 'severity-low'

function formatRelativeTime(isoString: string) {
  if (!isoString) return 'Just now'
  const date = new Date(isoString)
  const now = new Date()
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'Just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes} min ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours} hr${hours > 1 ? 's' : ''} ago`
  const days = Math.floor(hours / 24)
  return `${days} day${days > 1 ? 's' : ''} ago`
}

function latLngToPercent(lat?: number, lng?: number, index: number = 0) {
  if (!lat || !lng) {
    const defaultPositions = [
      { left: '22%', top: '56%' },
      { left: '48%', top: '38%' },
      { left: '68%', top: '64%' },
      { left: '76%', top: '28%' },
      { left: '52%', top: '75%' },
    ]
    return defaultPositions[index % defaultPositions.length]
  }

  const minLat = 30.0, maxLat = 31.2
  const minLng = 75.5, maxLng = 77.0

  const clampedLat = Math.max(minLat, Math.min(maxLat, lat))
  const clampedLng = Math.max(minLng, Math.min(maxLng, lng))

  const top = 100 - ((clampedLat - minLat) / (maxLat - minLat)) * 100
  const left = ((clampedLng - minLng) / (maxLng - minLng)) * 100

  const topBounded = Math.max(15, Math.min(82, top))
  const leftBounded = Math.max(15, Math.min(85, left))

  return { left: `${leftBounded.toFixed(1)}%`, top: `${topBounded.toFixed(1)}%` }
}

function MapCanvas({
  admin = false,
  reports = [],
  activeReportId = null,
}: {
  admin?: boolean
  reports?: StaffReport[]
  activeReportId?: string | null
}) {
  const [liveReports, setLiveReports] = useState<StaffReport[]>(reports)
  const [selectedPin, setSelectedPin] = useState<StaffReport | null>(null)

  const loadReports = () => {
    fetch('http://localhost:8000/reports')
      .then((res) => res.json())
      .then((data) => {
        if (data && data.reports) setLiveReports(data.reports)
      })
      .catch(() => {})
  }

  useEffect(() => {
    if (reports && reports.length > 0) {
      setLiveReports(reports)
    } else {
      loadReports()
    }
  }, [reports])

  useEffect(() => {
    const interval = setInterval(loadReports, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className={`map-canvas ${admin ? 'map-admin' : ''}`}>
      <div className="map-grid" />
      <div className="map-road road-one" />
      <div className="map-road road-two" />
      <div className="map-road road-three" />
      <div className="map-label label-one">PATIALA</div>
      <div className="map-label label-two">LUDHIANA</div>
      <div className="map-label label-three">CHANDIGARH</div>

      {liveReports.map((rep, index) => {
        const pos = latLngToPercent(rep.location?.latitude, rep.location?.longitude, index)
        const isHighlight = activeReportId === rep.report_id
        const color = rep.severity === 'High' ? '#e94560' : rep.severity === 'Medium' ? '#d99a22' : '#0f9b58'
        return (
          <div
            key={rep.report_id || index}
            className="map-pin"
            style={{
              left: pos.left,
              top: pos.top,
              backgroundColor: color,
              cursor: 'pointer',
              boxShadow: isHighlight ? `0 0 0 8px ${color}66, 0 0 15px ${color}` : undefined,
              transform: isHighlight ? 'rotate(-45deg) scale(1.35)' : 'rotate(-45deg)',
              zIndex: isHighlight ? 10 : 2,
              transition: 'all 0.3s ease-out',
            }}
            onClick={() => setSelectedPin(rep)}
          >
            <span />
          </div>
        )
      })}

      {selectedPin && (
        <div
          style={{
            position: 'absolute',
            bottom: '60px',
            right: '20px',
            background: '#1a2638',
            border: '1px solid #354259',
            borderRadius: '8px',
            padding: '14px 16px',
            width: '260px',
            zIndex: 20,
            boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            color: '#fff',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
            <strong style={{ fontSize: '12px', color: '#55b8e8' }}>#{selectedPin.report_id}</strong>
            <button
              onClick={() => setSelectedPin(null)}
              style={{ background: 'transparent', border: 0, color: '#94a3b8', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>
          <div style={{ fontWeight: 700, fontSize: '13px', marginBottom: '4px' }}>
            {selectedPin.issue_type.replace(/_/g, ' ').toUpperCase()}
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', margin: '6px 0', fontSize: '10px' }}>
            <span className={severityClass(selectedPin.severity)}>{selectedPin.severity} Severity</span>
            <span style={{ color: '#94a3b8' }}>Urgency: {selectedPin.urgency_score}/100</span>
          </div>
          <div style={{ fontSize: '10px', color: '#94a3b8', marginTop: '6px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <span>📍 {selectedPin.location?.latitude}, {selectedPin.location?.longitude}</span>
            <span>🕒 Reported {formatRelativeTime(selectedPin.timestamp)}</span>
            <span>🏢 {selectedPin.department}</span>
          </div>
        </div>
      )}

      {!admin && (
        <div className="map-footer">
          <Navigation size={13} /> Live civic reports <span>•</span> {liveReports.length} active reports
        </div>
      )}
    </div>
  )
}

function TopNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  return (
    <header className="top-nav">
      <div className="brand" onClick={() => setView('citizen')} style={{ cursor: 'pointer' }}>
        <span className="brand-mark">
          <ShieldCheck size={18} />
        </span>
        <span>
          Civic<span>Scan</span>
        </span>
        <small>AI CIVIC INTELLIGENCE</small>
      </div>
      <nav className="view-nav" aria-label="Application views">
        {(['citizen', 'staff', 'admin'] as View[]).map((item) => (
          <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>
            {item === 'citizen' ? <UserRound size={15} /> : item === 'staff' ? <Users size={15} /> : <BarChart3 size={15} />}
            <span>{item[0].toUpperCase() + item.slice(1)} Portal</span>
          </button>
        ))}
      </nav>
      <div className="top-actions">
        <span className="live-dot" /> System operational <button className="avatar">AS</button>
      </div>
    </header>
  )
}

function CitizenView({ setView }: { setView: (view: View) => void }) {
  const [gpsStatus, setGpsStatus] = useState<'loading' | 'success' | 'failed'>('loading')
  const [latitude, setLatitude] = useState<number | null>(null)
  const [longitude, setLongitude] = useState<number | null>(null)
  const [manualLat, setManualLat] = useState<string>('30.3398')
  const [manualLng, setManualLng] = useState<string>('76.3869')

  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [isDetecting, setIsDetecting] = useState<boolean>(false)
  const [detectionResult, setDetectionResult] = useState<DetectionResult | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false)
  const [submittedReportId, setSubmittedReportId] = useState<string | null>(null)

  const captureLocation = () => {
    setGpsStatus('loading')
    if (typeof window !== 'undefined' && 'geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = parseFloat(position.coords.latitude.toFixed(4))
          const lng = parseFloat(position.coords.longitude.toFixed(4))
          setLatitude(lat)
          setLongitude(lng)
          setManualLat(lat.toString())
          setManualLng(lng.toString())
          setGpsStatus('success')
        },
        () => {
          setGpsStatus('failed')
        },
        { enableHighAccuracy: true, timeout: 10000 }
      )
    } else {
      setGpsStatus('failed')
    }
  }

  useEffect(() => {
    captureLocation()
  }, [])

  const handleManualLatChange = (val: string) => {
    setManualLat(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) setLatitude(parsed)
  }

  const handleManualLngChange = (val: string) => {
    setManualLng(val)
    const parsed = parseFloat(val)
    if (!isNaN(parsed)) setLongitude(parsed)
  }

  const handleFileChange = (selectedFile: File | null) => {
    if (!selectedFile) return
    setFile(selectedFile)
    setPreviewUrl(URL.createObjectURL(selectedFile))
    setDetectionResult(null)
    setErrorMessage(null)
    setSubmittedReportId(null)
    runDetect(selectedFile)
  }

  const runDetect = async (fileToUpload: File) => {
    setIsDetecting(true)
    setErrorMessage(null)
    setDetectionResult(null)

    const formData = new FormData()
    formData.append('file', fileToUpload)

    const currentLat = latitude !== null ? latitude : parseFloat(manualLat) || 30.3398
    const currentLng = longitude !== null ? longitude : parseFloat(manualLng) || 76.3869

    formData.append('latitude', currentLat.toString())
    formData.append('longitude', currentLng.toString())

    try {
      const response = await fetch('http://localhost:8000/detect', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Server error (${response.status})`)
      }

      const data: DetectionResult = await response.json()
      setDetectionResult(data)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Could not connect to server. Make sure backend is running on localhost:8000')
    } finally {
      setIsDetecting(false)
    }
  }

  const handleSubmitReport = async () => {
    if (!file) return
    setIsSubmitting(true)
    setErrorMessage(null)

    const formData = new FormData()
    formData.append('file', file)

    const currentLat = latitude !== null ? latitude : parseFloat(manualLat) || 30.3398
    const currentLng = longitude !== null ? longitude : parseFloat(manualLng) || 76.3869

    formData.append('latitude', currentLat.toString())
    formData.append('longitude', currentLng.toString())

    try {
      const response = await fetch('http://localhost:8000/submit-report', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || `Submission failed (${response.status})`)
      }

      const data = await response.json()
      setSubmittedReportId(data.report_id)
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to submit report. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const removePhoto = () => {
    setFile(null)
    setPreviewUrl(null)
    setDetectionResult(null)
    setErrorMessage(null)
    setSubmittedReportId(null)
  }

  const formatIssueType = (issue: string) => {
    return issue.replace(/_/g, ' ').toUpperCase()
  }

  return (
    <main className="citizen-layout">
      <section className="citizen-panel">
        <div className="eyebrow">REPORT AN ISSUE <span>01 / 04</span></div>
        <div className="steps">
          <span className={file ? '' : 'current'}><b>1</b> Upload</span><i />
          <span className={isDetecting ? 'current' : ''}><b>2</b> Detecting</span><i />
          <span className={detectionResult && !submittedReportId ? 'current' : ''}><b>3</b> Review</span><i />
          <span className={submittedReportId ? 'current' : ''}><b>4</b> Submitted</span>
        </div>
        <div className="citizen-heading">
          <h1>Make your city<br /><em>better.</em></h1>
          <p>Snap a photo of a civic issue. Our AI will identify it and route it to the right department.</p>
        </div>

        {/* Success Banner After Submission */}
        {submittedReportId ? (
          <div style={{ background: '#132e27', border: '1px solid #0f9b58', borderRadius: '8px', padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CheckCircle2 size={24} style={{ color: '#0f9b58' }} />
              <div>
                <strong style={{ color: '#fff', fontSize: '15px', display: 'block' }}>Report Submitted Successfully!</strong>
                <span style={{ color: '#6ee7b7', fontSize: '12px' }}>Report ID: <strong>#{submittedReportId}</strong></span>
              </div>
            </div>
            <p style={{ margin: 0, fontSize: '11px', color: '#a7f3d0' }}>
              Your issue has been logged in the priority queue and assigned to the municipal department.
            </p>
            <div style={{ display: 'flex', gap: '10px', marginTop: '6px' }}>
              <button
                onClick={() => setView('staff')}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#0f9b58', border: 0, borderRadius: '5px', color: '#fff', fontSize: '11px', fontWeight: 700, cursor: 'pointer' }}
              >
                View in Staff Queue <ArrowRight size={14} />
              </button>
              <button
                onClick={removePhoto}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '8px 14px', background: '#1f2937', border: '1px solid #374151', borderRadius: '5px', color: '#e5e7eb', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
              >
                Submit Another Issue
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Upload Zone */}
            {!file && !isDetecting && (
              <label className="dropzone" style={{ cursor: 'pointer' }}>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileChange(e.target.files[0])
                    }
                  }}
                />
                <span className="upload-icon"><Upload size={21} /></span>
                <strong>Drop photo here</strong>
                <small>or click to browse from your device</small>
                <span className="file-types">JPG, PNG up to 10 MB</span>
              </label>
            )}

            {/* Detection Spinner */}
            {isDetecting && (
              <div className="dropzone" style={{ background: '#1c1c33', borderColor: '#55b8e8', padding: '30px 20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
                <Loader2 size={36} style={{ color: '#55b8e8', animation: 'spin 1s linear infinite' }} />
                <strong style={{ fontSize: '15px', color: '#fff' }}>AI detecting issue...</strong>
                <small style={{ color: '#98a4ba' }}>Analyzing image features & severity</small>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && !isDetecting && (
              <div style={{ marginTop: '14px', padding: '14px', borderRadius: '6px', background: '#3b1c24', border: '1px solid #e94560', color: '#ffd5db', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, fontSize: '12px' }}>
                  <AlertCircle size={16} style={{ color: '#e94560' }} />
                  <span>Detection Error</span>
                </div>
                <p style={{ margin: 0, fontSize: '11px', color: '#fca5a5' }}>{errorMessage}</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '6px' }}>
                  {file && (
                    <button
                      onClick={() => runDetect(file)}
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#e94560', border: 0, borderRadius: '4px', color: '#fff', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                    >
                      <RefreshCw size={12} /> Retry Detection
                    </button>
                  )}
                  <button
                    onClick={removePhoto}
                    style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: '#334155', border: '1px solid #475569', borderRadius: '4px', color: '#f1f5f9', fontSize: '11px', fontWeight: 600, cursor: 'pointer' }}
                  >
                    <ArrowLeft size={12} /> Go Back & Change Photo
                  </button>
                </div>
              </div>
            )}

            {/* Result Display */}
            {file && !isDetecting && detectionResult && (
              <div className="detected-photo">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 600, letterSpacing: '0.05em' }}>DETECTION RESULT</span>
                  <button
                    onClick={removePhoto}
                    style={{ background: '#25263a', border: '1px solid #353b55', color: '#55b8e8', borderRadius: '4px', padding: '4px 10px', fontSize: '10px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer' }}
                  >
                    <ArrowLeft size={12} /> Upload Different Photo
                  </button>
                </div>

                <div style={{ position: 'relative', overflow: 'hidden', borderRadius: '6px', background: '#1a1a2e', border: '1px solid #353b55' }}>
                  <img
                    src={`data:image/jpeg;base64,${detectionResult.result_image}`}
                    alt="Detection result"
                    style={{ width: '100%', maxHeight: '240px', objectFit: 'contain', display: 'block' }}
                  />
                  <button className="remove-photo" onClick={removePhoto} aria-label="Remove photo">
                    <X size={14} />
                  </button>
                </div>

                {detectionResult.detections.length === 0 ? (
                  <div style={{ marginTop: '12px', padding: '12px', background: '#25263a', borderRadius: '6px', border: '1px dashed #d99a22', color: '#fcd34d', fontSize: '12px', textAlign: 'center' }}>
                    No civic issue detected in this photo. Try a clearer image.
                  </div>
                ) : (
                  <div style={{ marginTop: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {detectionResult.detections.map((det, idx) => (
                      <div key={idx} style={{ background: '#202039', border: '1px solid #353b55', borderRadius: '6px', padding: '10px 12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                          <span style={{ background: '#111827', border: '1px solid #374151', color: '#60a5fa', padding: '4px 8px', borderRadius: '4px', fontWeight: 700, fontSize: '10px', letterSpacing: '0.05em' }}>
                            {formatIssueType(det.issue_type)}
                          </span>
                          <span className={severityClass(det.severity)}>
                            {det.severity} Severity
                          </span>
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#98a4ba' }}>
                            <span>AI Confidence</span>
                            <strong style={{ color: '#fff' }}>{Math.round(det.confidence * 100)}%</strong>
                          </div>
                          <div style={{ height: '5px', background: '#101726', borderRadius: '3px', overflow: 'hidden' }}>
                            <div
                              style={{
                                height: '100%',
                                width: `${Math.round(det.confidence * 100)}%`,
                                background: det.confidence > 0.8 ? '#0f9b58' : det.confidence > 0.5 ? '#55b8e8' : '#d99a22',
                                borderRadius: '3px',
                                transition: 'width 0.5s ease-out',
                              }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Location Chip */}
            <div style={{ marginTop: '16px' }}>
              {gpsStatus === 'loading' && (
                <div className="location-chip" style={{ background: '#202039', border: '1px solid #353b55', color: '#98a4ba' }}>
                  <Loader2 size={15} style={{ animation: 'spin 1s linear infinite', color: '#55b8e8' }} />
                  <div>
                    <small>GPS LOCATION</small>
                    <strong style={{ color: '#55b8e8' }}>⏳ Detecting location...</strong>
                  </div>
                </div>
              )}

              {gpsStatus === 'success' && (
                <div className="location-chip">
                  <span><MapPin size={14} /></span>
                  <div>
                    <small>LOCATION CAPTURED</small>
                    <strong style={{ color: '#fff' }}>
                      ✅ Location captured: {latitude?.toFixed(4)}, {longitude?.toFixed(4)}
                    </strong>
                  </div>
                  <CheckCircle2 size={17} style={{ color: '#0f9b58' }} />
                </div>
              )}

              {gpsStatus === 'failed' && (
                <div style={{ background: '#202039', border: '1px solid #353b55', borderRadius: '6px', padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '10px', color: '#f87171', fontWeight: 600, letterSpacing: '0.05em' }}>
                      📍 GPS AUTO-CAPTURE FAILED
                    </span>
                    <button
                      onClick={captureLocation}
                      style={{ background: 'transparent', border: '1px solid #475569', borderRadius: '4px', color: '#94a3b8', padding: '3px 8px', fontSize: '9px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}
                    >
                      <RefreshCw size={10} /> Retry GPS
                    </button>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <label style={{ fontSize: '9px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={manualLat}
                        onChange={(e) => handleManualLatChange(e.target.value)}
                        placeholder="30.3398"
                        style={{ width: '100%', background: '#101726', border: '1px solid #334155', borderRadius: '4px', padding: '6px 8px', color: '#fff', fontSize: '11px', outline: 0 }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '9px', color: '#94a3b8', display: 'block', marginBottom: '3px' }}>Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={manualLng}
                        onChange={(e) => handleManualLngChange(e.target.value)}
                        placeholder="76.3869"
                        style={{ width: '100%', background: '#101726', border: '1px solid #334155', borderRadius: '4px', padding: '6px 8px', color: '#fff', fontSize: '11px', outline: 0 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Location Card */}
            {detectionResult?.location && (
              <div style={{ marginTop: '12px', background: '#182234', border: '1px solid #334155', borderRadius: '6px', padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <small style={{ color: '#7b889e', fontSize: '8px', letterSpacing: '0.12em', display: 'block' }}>REPORT LOCATION</small>
                  <strong style={{ color: '#fff', fontSize: '11px' }}>
                    {detectionResult.location.latitude}, {detectionResult.location.longitude}
                  </strong>
                </div>
                <a
                  href={detectionResult.location.maps_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#55b8e8', fontSize: '11px', fontWeight: 600, textDecoration: 'none' }}
                >
                  View on Google Maps <ExternalLink size={12} />
                </a>
              </div>
            )}

            {/* Submit Bar */}
            <div className="submit-bar">
              <div>
                <small>READY TO SUBMIT?</small>
                <span>{detectionResult ? 'AI detection complete' : 'Upload image to detect'}</span>
              </div>
              <button
                onClick={handleSubmitReport}
                disabled={!detectionResult || isSubmitting}
                style={{ opacity: detectionResult && !isSubmitting ? 1 : 0.5, cursor: detectionResult && !isSubmitting ? 'pointer' : 'not-allowed', display: 'flex', alignItems: 'center', gap: '8px' }}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 size={14} style={{ animation: 'spin 1s linear infinite' }} /> Submitting...
                  </>
                ) : (
                  <>
                    Submit Report <ArrowRight size={16} />
                  </>
                )}
              </button>
            </div>
          </>
        )}
      </section>
      <section className="citizen-map">
        <div className="map-topline">
          <div><small>LIVE CIVIC MAP</small><h2>Patiala region</h2></div>
          <button><Filter size={14} /> Filters <ChevronDown size={13} /></button>
        </div>
        <MapCanvas activeReportId={submittedReportId} />
      </section>
    </main>
  )
}

function StaffView() {
  const [reports, setReports] = useState<StaffReport[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [selectedReport, setSelectedReport] = useState<StaffReport | null>(null)
  
  // Filters
  const [issueFilter, setIssueFilter] = useState<string>('All')
  const [statusFilter, setStatusFilter] = useState<string>('All')
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchReports = async (issue = issueFilter, status = statusFilter) => {
    try {
      let url = 'http://localhost:8000/reports?'
      const params = new URLSearchParams()
      if (issue !== 'All') params.append('issue_type', issue.toLowerCase().replace(/ /g, '_'))
      if (status !== 'All') params.append('status', status)
      
      const res = await fetch(url + params.toString())
      if (res.ok) {
        const data = await res.json()
        setReports(data.reports || [])
      }
    } catch (e) {
      console.error('Failed to fetch reports:', e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchReports(issueFilter, statusFilter)
    const interval = setInterval(() => {
      fetchReports(issueFilter, statusFilter)
    }, 30000) // Auto refresh every 30 seconds
    return () => clearInterval(interval)
  }, [issueFilter, statusFilter])

  const updateReportStatus = async (reportId: string, newStatus: Status) => {
    setUpdatingId(reportId)
    try {
      const formData = new FormData()
      formData.append('status', newStatus)

      const res = await fetch(`http://localhost:8000/reports/${reportId}`, {
        method: 'PATCH',
        body: formData,
      })

      if (res.ok) {
        await fetchReports(issueFilter, statusFilter)
        if (selectedReport?.report_id === reportId) {
          setSelectedReport((prev) => (prev ? { ...prev, status: newStatus } : null))
        }
      }
    } catch (e) {
      console.error('Failed to update status:', e)
    } finally {
      setUpdatingId(null)
    }
  }

  // Stats bar metrics
  const totalCount = reports.length
  const pendingCount = reports.filter((r) => r.status === 'Pending').length
  const inProgressCount = reports.filter((r) => r.status === 'In Progress').length
  const resolvedCount = reports.filter((r) => r.status === 'Resolved').length

  const columns: { status: Status; title: string; sub: string; borderColor: string }[] = [
    { status: 'Pending', title: 'Pending', sub: 'Needs review', borderColor: '#e94560' },
    { status: 'In Progress', title: 'In Progress', sub: 'Being handled', borderColor: '#d99a22' },
    { status: 'Resolved', title: 'Resolved', sub: 'Closed reports', borderColor: '#0f9b58' },
  ]

  const formatIssueName = (typeStr: string) => {
    return typeStr.replace(/_/g, ' ').toUpperCase()
  }

  return (
    <main className="staff-layout">
      <aside className="icon-rail">
        <button className="rail-logo"><ShieldCheck size={19} /></button>
        <button className="rail-active"><Gauge size={18} /></button>
        <button><FileImage size={18} /></button>
        <button><MapPin size={18} /></button>
        <span />
        <button><BarChart3 size={18} /></button>
        <button><Menu size={18} /></button>
      </aside>

      <section className="staff-board" style={{ overflowY: 'auto' }}>
        {/* Top Stats Bar */}
        <div className="page-heading">
          <div>
            <div className="eyebrow light">OPERATIONS CENTER</div>
            <h1>Report Queue & Department Triage</h1>
            <p>Priority-sorted queue based on AI severity score & location coordinates.</p>
          </div>
          <button className="outline-button" onClick={() => fetchReports()}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Refresh Queue
          </button>
        </div>

        {/* Stats Cards Row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px', margin: '20px 0 28px' }}>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderRadius: '8px', padding: '14px 18px' }}>
            <small style={{ color: '#8290a5', fontSize: '9px', letterSpacing: '0.12em', fontWeight: 700 }}>TOTAL REPORTS</small>
            <strong style={{ display: 'block', fontSize: '24px', margin: '4px 0 0', color: 'var(--navy)' }}>{totalCount}</strong>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderLeft: '4px solid #e94560', borderRadius: '8px', padding: '14px 18px' }}>
            <small style={{ color: '#e94560', fontSize: '9px', letterSpacing: '0.12em', fontWeight: 700 }}>PENDING REVIEW</small>
            <strong style={{ display: 'block', fontSize: '24px', margin: '4px 0 0', color: '#e94560' }}>{pendingCount}</strong>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderLeft: '4px solid #d99a22', borderRadius: '8px', padding: '14px 18px' }}>
            <small style={{ color: '#d99a22', fontSize: '9px', letterSpacing: '0.12em', fontWeight: 700 }}>IN PROGRESS</small>
            <strong style={{ display: 'block', fontSize: '24px', margin: '4px 0 0', color: '#d99a22' }}>{inProgressCount}</strong>
          </div>
          <div style={{ background: '#fff', border: '1px solid var(--line)', borderLeft: '4px solid #0f9b58', borderRadius: '8px', padding: '14px 18px' }}>
            <small style={{ color: '#0f9b58', fontSize: '9px', letterSpacing: '0.12em', fontWeight: 700 }}>RESOLVED</small>
            <strong style={{ display: 'block', fontSize: '24px', margin: '4px 0 0', color: '#0f9b58' }}>{resolvedCount}</strong>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="filter-row" style={{ margin: '0 0 20px', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', gap: '16px', alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Issue Filter Pills */}
            <div className="filter-pills">
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginRight: '4px' }}>ISSUE:</span>
              {(['All', 'Road Damage', 'Garbage', 'Waterlogging'] as const).map((item) => (
                <button key={item} className={issueFilter === item ? 'selected' : ''} onClick={() => setIssueFilter(item)}>
                  {item === 'All' && <CircleDot size={12} />}
                  {item}
                </button>
              ))}
            </div>

            {/* Status Filter Pills */}
            <div className="filter-pills">
              <span style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, marginRight: '4px' }}>STATUS:</span>
              {(['All', 'Pending', 'In Progress', 'Resolved'] as const).map((item) => (
                <button key={item} className={statusFilter === item ? 'selected' : ''} onClick={() => setStatusFilter(item)}>
                  {item}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Empty State when no reports match */}
        {!loading && reports.length === 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', background: '#fff', border: '1px dashed #cbd5e1', borderRadius: '8px', marginTop: '10px' }}>
            <Inbox size={48} style={{ color: '#94a3b8', marginBottom: '12px' }} />
            <strong style={{ fontSize: '15px', color: 'var(--navy)' }}>No reports found</strong>
            <p style={{ color: '#64748b', fontSize: '12px', margin: '4px 0 0' }}>Waiting for citizen submissions or try adjusting your filters.</p>
          </div>
        )}

        {/* Kanban Board */}
        <div className="kanban">
          {columns.map(({ status, title, sub, borderColor }) => {
            const columnReports = reports.filter((r) => r.status === status)
            return (
              <div className="kanban-column" key={status}>
                <div className="column-heading" style={{ borderBottomColor: borderColor }}>
                  <div>
                    <strong>{title}</strong>
                    <span>{sub}</span>
                  </div>
                  <b style={{ background: `${borderColor}1a`, color: borderColor }}>{columnReports.length}</b>
                </div>

                <div className="card-stack">
                  {columnReports.map((report) => (
                    <div
                      key={report.report_id}
                      className="report-card"
                      style={{ borderLeftColor: borderColor, cursor: 'pointer', flexDirection: 'column', gap: '10px', padding: '12px' }}
                      onClick={() => setSelectedReport(report)}
                    >
                      <div style={{ display: 'flex', width: '100%', gap: '10px', alignItems: 'center' }}>
                        {/* Thumbnail */}
                        <div style={{ width: '48px', height: '48px', borderRadius: '6px', overflow: 'hidden', background: '#1e293b', flexShrink: 0, display: 'grid', placeItems: 'center' }}>
                          {report.result_image ? (
                            <img src={`data:image/jpeg;base64,${report.result_image}`} alt="Issue" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          ) : (
                            <FileImage size={20} style={{ color: '#94a3b8' }} />
                          )}
                        </div>

                        {/* Title & Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <strong style={{ fontSize: '12px', color: 'var(--navy)' }}>#{report.report_id}</strong>
                            <span className={severityClass(report.severity)}>{report.severity}</span>
                          </div>

                          <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: '#475569', fontWeight: 600, marginTop: '2px' }}>
                            {formatIssueName(report.issue_type)}
                          </span>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '10px', color: '#94a3b8', marginTop: '4px' }}>
                            <span><MapPin size={10} style={{ display: 'inline', marginRight: '2px' }} /> {report.location.latitude}, {report.location.longitude}</span>
                            <span>•</span>
                            <span>{formatRelativeTime(report.timestamp)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Urgency Score & Actions */}
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', paddingTop: '8px', borderTop: '1px solid #f1f5f9' }}>
                        <div style={{ fontSize: '10px', color: '#64748b' }}>
                          Urgency Score: <strong style={{ color: report.urgency_score > 70 ? '#e94560' : '#d99a22' }}>{report.urgency_score}/100</strong>
                        </div>

                        <div style={{ display: 'flex', gap: '6px' }}>
                          {report.status === 'Pending' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                updateReportStatus(report.report_id, 'In Progress')
                              }}
                              disabled={updatingId === report.report_id}
                              style={{ padding: '4px 8px', background: '#fff4d9', color: '#9c6b04', border: '1px solid #fde68a', borderRadius: '4px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Mark In Progress
                            </button>
                          )}

                          {report.status !== 'Resolved' && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                updateReportStatus(report.report_id, 'Resolved')
                              }}
                              disabled={updatingId === report.report_id}
                              style={{ padding: '4px 8px', background: '#e4f6ec', color: '#087f47', border: '1px solid #a7f3d0', borderRadius: '4px', fontSize: '10px', fontWeight: 700, cursor: 'pointer' }}
                            >
                              Resolve
                            </button>
                          )}

                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedReport(report)
                            }}
                            style={{ padding: '4px 8px', background: '#f1f5f9', color: '#475569', border: '1px solid #cbd5e1', borderRadius: '4px', fontSize: '10px', fontWeight: 600, cursor: 'pointer' }}
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                  {columnReports.length === 0 && <div className="drophint">No reports in {title.toLowerCase()}</div>}
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* Slide-in Detail Panel (400px) */}
      {selectedReport && (
        <div className="drawer-backdrop" onClick={() => setSelectedReport(null)}>
          <aside className="detail-drawer" style={{ width: '420px' }} onClick={(e) => e.stopPropagation()}>
            <div className="drawer-head">
              <div>
                <small>REPORT #{selectedReport.report_id}</small>
                <h2>{formatIssueName(selectedReport.issue_type)}</h2>
              </div>
              <button onClick={() => setSelectedReport(null)} aria-label="Close report">
                <X size={18} />
              </button>
            </div>

            {/* Full Image */}
            <div className="drawer-photo">
              {selectedReport.result_image ? (
                <div style={{ borderRadius: '6px', overflow: 'hidden', background: '#0f172a', border: '1px solid #334155' }}>
                  <img src={`data:image/jpeg;base64,${selectedReport.result_image}`} alt="Annotated Detection" style={{ width: '100%', maxHeight: '220px', objectFit: 'contain' }} />
                </div>
              ) : (
                <div className="photo-sim">
                  <span className="bbox"><b>{selectedReport.issue_type}</b></span>
                </div>
              )}
            </div>

            <div className="drawer-status">
              <span className={severityClass(selectedReport.severity)}>{selectedReport.severity} severity</span>
              <span><Clock3 size={13} /> {formatRelativeTime(selectedReport.timestamp)}</span>
            </div>

            <div className="drawer-grid">
              <div>
                <small>URGENCY SCORE</small>
                <strong>{selectedReport.urgency_score}/100</strong>
              </div>
              <div>
                <small>CURRENT STATUS</small>
                <strong style={{ color: selectedReport.status === 'Resolved' ? '#0f9b58' : selectedReport.status === 'In Progress' ? '#d99a22' : '#e94560' }}>
                  {selectedReport.status}
                </strong>
              </div>
            </div>

            <div className="detail-list">
              <span>
                <Navigation size={15} /> Assigned Department <b>{selectedReport.department}</b>
              </span>
              <span>
                <MapPin size={15} /> Coordinates <b>{selectedReport.location.latitude}, {selectedReport.location.longitude}</b>
              </span>
              {selectedReport.location.maps_link && (
                <span>
                  <ExternalLink size={15} /> Google Maps{' '}
                  <a href={selectedReport.location.maps_link} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 'auto', color: '#55b8e8', fontWeight: 600 }}>
                    Open Map →
                  </a>
                </span>
              )}
            </div>

            {/* Detections List */}
            <div style={{ marginTop: '10px', padding: '12px', background: '#f8fafc', borderRadius: '6px', border: '1px solid #e2e8f0' }}>
              <small style={{ color: '#64748b', fontSize: '9px', fontWeight: 700, letterSpacing: '0.1em', display: 'block', marginBottom: '8px' }}>DETECTIONS DETAILED</small>
              {selectedReport.detections?.map((d, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '4px' }}>
                  <span style={{ fontWeight: 600, color: 'var(--navy)' }}>{formatIssueName(d.issue_type)}</span>
                  <span style={{ color: '#0284c7', fontWeight: 700 }}>{Math.round(d.confidence * 100)}% confidence</span>
                </div>
              ))}
            </div>

            {/* Actions */}
            <div className="drawer-actions" style={{ marginTop: '20px' }}>
              {selectedReport.status === 'Pending' && (
                <button
                  onClick={() => updateReportStatus(selectedReport.report_id, 'In Progress')}
                  style={{ background: '#d99a22', color: '#fff' }}
                >
                  Mark In Progress
                </button>
              )}
              {selectedReport.status !== 'Resolved' && (
                <button
                  className="resolve"
                  onClick={() => updateReportStatus(selectedReport.report_id, 'Resolved')}
                >
                  <Check size={15} /> Resolve Report
                </button>
              )}
            </div>
          </aside>
        </div>
      )}
    </main>
  )
}

function AdminView() {
  return (
    <main className="admin-layout">
      <MapCanvas admin />
      <div className="admin-header">
        <div>
          <div className="eyebrow">CITY COMMAND CENTER</div>
          <h1>Regional overview</h1>
          <p>Punjab civic infrastructure · Updated just now</p>
        </div>
        <div className="admin-tools">
          <div className="search-box">
            <Search size={15} />
            <input placeholder="Search reports..." />
          </div>
          <button>
            <Filter size={15} /> Filter
          </button>
          <button className="admin-avatar">AS</button>
        </div>
      </div>
      <section className="kpi-panel">
        <div>
          <small>TOTAL REPORTS</small>
          <strong>1,284</strong>
          <span className="positive">+12.4% <em>this month</em></span>
        </div>
        <div>
          <small>RESOLUTION RATE</small>
          <strong>84.6%</strong>
          <span className="positive">+3.2% <em>vs last month</em></span>
        </div>
        <div>
          <small>AVG. RESOLUTION TIME</small>
          <strong>18.4h</strong>
          <span className="negative">−2.1h <em>improvement</em></span>
        </div>
        <div>
          <small>ACTIVE DEPARTMENTS</small>
          <strong>08</strong>
          <span className="neutral">All systems live</span>
        </div>
      </section>
    </main>
  )
}

export default function Page({ initialView = 'citizen' }: { initialView?: View }) {
  const [view, setView] = useState<View>(initialView)
  return (
    <div className="app-shell">
      <TopNav view={view} setView={setView} />
      {view === 'citizen' ? <CitizenView setView={setView} /> : view === 'staff' ? <StaffView /> : <AdminView />}
    </div>
  )
}
