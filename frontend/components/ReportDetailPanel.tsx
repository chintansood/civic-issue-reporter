'use client'

import React, { useState, useEffect } from 'react'
import {
  X,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  ShieldCheck,
  Send,
  Loader2,
  DollarSign,
  Users
} from 'lucide-react'
import { Report, api, API_BASE_URL } from '../lib/api'
import { getCurrentUser } from '../lib/auth'
import StatusTimeline from './StatusTimeline'
import CityMap from './CityMap'
import { useToast } from './Toast'

interface ReportDetailPanelProps {
  reportId: string | null
  onClose: () => void
  onStatusUpdated?: (updatedReport: Report) => void
}

export default function ReportDetailPanel({
  reportId,
  onClose,
  onStatusUpdated,
}: ReportDetailPanelProps) {
  const [report, setReport] = useState<Report | null>(null)
  const [loading, setLoading] = useState(false)
  const [updating, setUpdating] = useState(false)
  const [staffNote, setStaffNote] = useState('')
  const currentUser = getCurrentUser()
  const toast = useToast()

  const isStaffOrAdmin =
    currentUser && (currentUser.role === 'staff' || currentUser.role === 'admin')

  useEffect(() => {
    if (!reportId) {
      setReport(null)
      return
    }

    const fetchDetail = async () => {
      setLoading(true)
      try {
        const data = await api.getReport(reportId)
        setReport(data)
        setStaffNote(data.staff_notes || '')
      } catch (err: any) {
        toast.error('Failed to load report details')
      } finally {
        setLoading(false)
      }
    }

    fetchDetail()
  }, [reportId])

  if (!reportId) return null

  const getFullImageUrl = (url?: string | null) => {
    if (!url) return '/placeholder.jpg'
    if (url.startsWith('http') || url.startsWith('data:')) return url
    return `${API_BASE_URL}${url}`
  }

  const handleStatusChange = async (newStatus: string) => {
    if (!report) return
    setUpdating(true)
    try {
      const updated = await api.updateReportStatus(report.report_id, newStatus, staffNote)
      setReport(updated)
      if (onStatusUpdated) onStatusUpdated(updated)
      toast.success(`Status updated to ${newStatus.replace(/_/g, ' ')}`)
    } catch (err: any) {
      toast.error(err.message || 'Failed to update status')
    } finally {
      setUpdating(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-900/30 backdrop-blur-xs flex justify-end animate-in fade-in duration-200">
      <div className="w-full max-w-[440px] bg-white h-full shadow-2xl flex flex-col justify-between border-l border-[#e2e8f0] animate-in slide-in-from-right duration-300">
        {/* Panel Header */}
        <div className="px-5 py-4 border-b border-[#e2e8f0] flex items-center justify-between bg-slate-50">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-slate-700 tracking-tight">
                #{reportId}
              </span>
              {report && (
                <span
                  className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    report.status === 'resolved'
                      ? 'bg-emerald-100 text-[#0f9b58]'
                      : report.status === 'in_progress'
                      ? 'bg-amber-100 text-[#f59e0b]'
                      : 'bg-rose-100 text-[#e94560]'
                  }`}
                >
                  {report.status.replace(/_/g, ' ')}
                </span>
              )}
            </div>
            <h3 className="font-bold text-sm text-[#1a1a2e] mt-0.5 capitalize">
              {report ? report.issue_type.replace(/_/g, ' ') : 'Report Details'}
            </h3>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-[6px] border border-slate-200 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-6">
          {loading ? (
            <div className="py-20 flex flex-col items-center justify-center text-slate-400 gap-3">
              <Loader2 className="w-6 h-6 animate-spin text-[#1a1a2e]" />
              <span className="text-xs">Loading report information...</span>
            </div>
          ) : report ? (
            <>
              {/* Result image with YOLO cyan bounding boxes */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Detected Issue Imagery
                </label>
                <div className="rounded-[8px] overflow-hidden border border-slate-200 bg-slate-900 aspect-video relative flex items-center justify-center">
                  <img
                    src={
                      report.result_image_b64
                        ? `data:image/jpeg;base64,${report.result_image_b64}`
                        : getFullImageUrl(report.result_image_url || report.image_url)
                    }
                    alt={report.issue_type}
                    className="w-full h-full object-contain"
                  />
                  <div className="absolute top-2 left-2 bg-[#1a1a2e]/90 text-white text-[10px] px-2 py-0.5 rounded font-medium flex items-center gap-1.5 backdrop-blur-xs">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
                    YOLOv8 Analyzed
                  </div>
                </div>
              </div>

              {/* Key Metadata Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-slate-50 p-3 rounded-[6px] border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Severity
                  </span>
                  <span
                    className={`inline-block mt-1 text-xs font-bold px-2 py-0.5 rounded ${
                      report.severity === 'High'
                        ? 'bg-rose-100 text-[#e94560]'
                        : report.severity === 'Medium'
                        ? 'bg-amber-100 text-[#f59e0b]'
                        : 'bg-emerald-100 text-[#0f9b58]'
                    }`}
                  >
                    {report.severity}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-[6px] border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Confidence
                  </span>
                  <span className="text-xs font-bold text-slate-800 mt-1 block">
                    {Math.round(report.confidence * 100)}% Confident
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-[6px] border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Assigned Dept
                  </span>
                  <span className="text-xs font-semibold text-slate-800 mt-1 block truncate">
                    {report.department_name || 'Roads Department'}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-[6px] border border-slate-200">
                  <span className="text-[10px] text-slate-400 font-semibold block uppercase">
                    Urgency Rating
                  </span>
                  <span className="text-xs font-bold text-[#1a1a2e] mt-1 block">
                    {report.urgency_score} / 100
                  </span>
                </div>
              </div>

              {/* Cost Estimate & Duplicates */}
              <div className="space-y-2">
                <div className="flex items-center justify-between p-3 rounded-[6px] border border-slate-200 bg-white">
                  <span className="text-xs text-slate-600 font-medium">Estimated Repair Cost</span>
                  <strong className="text-xs font-bold text-[#1a1a2e]">
                    ₹{report.cost_estimate_min.toLocaleString()} - ₹{report.cost_estimate_max.toLocaleString()}
                  </strong>
                </div>

                {report.duplicate_count > 0 && (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-[6px] text-xs text-amber-900 flex items-center gap-2">
                    <Users className="w-4 h-4 text-amber-600 shrink-0" />
                    <span>
                      <strong>{report.duplicate_count + 1} citizens</strong> reported this civic issue nearby.
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              {report.description && (
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Citizen Description
                  </label>
                  <p className="text-xs text-slate-700 bg-slate-50 p-3 rounded-[6px] border border-slate-200 leading-relaxed">
                    {report.description}
                  </p>
                </div>
              )}

              {/* Citizen Contact (for Staff) */}
              {isStaffOrAdmin && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-[6px] text-xs space-y-1">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">
                    Reported By
                  </span>
                  <p className="font-semibold text-slate-800">{report.user_name || 'Citizen'}</p>
                  <p className="text-slate-500 font-mono text-[11px]">{report.user_email || 'citizen@civicscan.com'}</p>
                </div>
              )}

              {/* Location & Mini Leaflet Map */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Exact Location
                  </label>
                  <a
                    href={`https://maps.google.com/?q=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-indigo-600 hover:underline flex items-center gap-1 font-medium"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="h-44 rounded-[8px] overflow-hidden border border-slate-200">
                  <CityMap
                    singlePin={true}
                    pinLat={report.latitude}
                    pinLng={report.longitude}
                    height="100%"
                    zoom={15}
                  />
                </div>
                <p className="text-xs text-slate-500 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span>
                    {report.location_name || `${report.latitude.toFixed(4)}° N, ${report.longitude.toFixed(4)}° E`}
                  </span>
                </p>
              </div>

              {/* Status Timeline */}
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Resolution Timeline
                </label>
                <StatusTimeline
                  status={report.status}
                  histories={report.status_history}
                  createdAt={report.created_at}
                />
              </div>

              {/* Department Notes */}
              {report.staff_notes && !isStaffOrAdmin && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[6px] text-xs">
                  <span className="font-bold text-emerald-900 block mb-0.5">Department Note:</span>
                  <p className="text-emerald-800 leading-relaxed">{report.staff_notes}</p>
                </div>
              )}
            </>
          ) : null}
        </div>

        {/* Staff Action Footer (If Staff or Admin) */}
        {isStaffOrAdmin && report && (
          <div className="p-4 border-t border-[#e2e8f0] bg-slate-50 space-y-3">
            <div>
              <label className="text-[11px] font-semibold text-slate-600 block mb-1">
                Resolution / Dispatch Note
              </label>
              <textarea
                value={staffNote}
                onChange={(e) => setStaffNote(e.target.value)}
                placeholder="Enter notes for citizen update or resolution report..."
                className="w-full text-xs p-2 rounded-[6px] border border-[#e2e8f0] bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none h-16"
              />
            </div>

            <div className="flex gap-2">
              {report.status !== 'in_progress' && (
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange('in_progress')}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold py-2 rounded-[6px] transition-colors disabled:opacity-50"
                >
                  Mark In Progress
                </button>
              )}

              {report.status !== 'resolved' && (
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange('resolved')}
                  className="flex-1 bg-[#0f9b58] hover:bg-emerald-700 text-white text-xs font-semibold py-2 rounded-[6px] transition-colors disabled:opacity-50"
                >
                  Mark Resolved
                </button>
              )}

              {report.status !== 'rejected' && (
                <button
                  disabled={updating}
                  onClick={() => handleStatusChange('rejected')}
                  className="px-3 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-semibold py-2 rounded-[6px] transition-colors disabled:opacity-50"
                >
                  Reject
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
