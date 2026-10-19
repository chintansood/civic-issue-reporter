'use client'

import React from 'react'
import {
  Clock,
  MapPin,
  ArrowRight,
  CheckCircle,
  Eye,
  AlertTriangle,
  Play
} from 'lucide-react'
import { Report, API_BASE_URL } from '../lib/api'

interface KanbanBoardProps {
  reports: Report[]
  onSelectReport: (reportId: string) => void
  onQuickStatusChange: (reportId: string, newStatus: string) => void
}

export default function KanbanBoard({
  reports,
  onSelectReport,
  onQuickStatusChange,
}: KanbanBoardProps) {
  const getFullImageUrl = (url?: string | null) => {
    if (!url) return '/placeholder.jpg'
    if (url.startsWith('http') || url.startsWith('data:')) return url
    return `${API_BASE_URL}${url}`
  }

  const timeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
      if (diff < 60) return 'Just now'
      if (diff < 3600) return `${Math.floor(diff / 60)}h ago`
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
      return `${Math.floor(diff / 86400)}d ago`
    } catch {
      return 'Recently'
    }
  }

  const columns = [
    {
      id: 'pending',
      title: 'Pending Review',
      color: 'border-t-4 border-t-[#e94560]',
      badgeColor: 'bg-rose-100 text-[#e94560]',
      nextStatus: 'in_progress',
      nextLabel: 'Dispatch / In Progress',
      nextIcon: Play,
      filter: (r: Report) => r.status.toLowerCase() === 'pending',
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: 'border-t-4 border-t-[#f59e0b]',
      badgeColor: 'bg-amber-100 text-[#f59e0b]',
      nextStatus: 'resolved',
      nextLabel: 'Mark Resolved',
      nextIcon: CheckCircle,
      filter: (r: Report) => r.status.toLowerCase() === 'in_progress',
    },
    {
      id: 'resolved',
      title: 'Resolved',
      color: 'border-t-4 border-t-[#0f9b58]',
      badgeColor: 'bg-emerald-100 text-[#0f9b58]',
      nextStatus: null,
      nextLabel: null,
      nextIcon: null,
      filter: (r: Report) => r.status.toLowerCase() === 'resolved',
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-5 items-start">
      {columns.map((col) => {
        const colReports = reports.filter(col.filter)

        return (
          <div
            key={col.id}
            className={`bg-slate-50/70 border border-[#e2e8f0] rounded-[8px] p-3.5 flex flex-col min-h-[520px] ${col.color}`}
          >
            {/* Column Header */}
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 mb-3">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs text-[#1a1a2e] uppercase tracking-wider">
                  {col.title}
                </span>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${col.badgeColor}`}
                >
                  {colReports.length}
                </span>
              </div>
            </div>

            {/* Column Cards */}
            <div className="space-y-3 flex-1 overflow-y-auto">
              {colReports.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400 border border-dashed border-slate-200 rounded-[6px]">
                  No reports in this queue.
                </div>
              ) : (
                colReports.map((report) => {
                  // Border color by urgency
                  const urgencyBorder =
                    report.urgency_score >= 75
                      ? 'border-l-[#e94560]'
                      : report.urgency_score >= 45
                      ? 'border-l-[#f59e0b]'
                      : 'border-l-[#0f9b58]'

                  return (
                    <div
                      key={report.report_id}
                      className={`bg-white rounded-[6px] border border-[#e2e8f0] border-l-4 ${urgencyBorder} p-3 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group`}
                    >
                      <div className="flex gap-2.5">
                        {/* Thumbnail */}
                        <div className="w-14 h-14 rounded-[4px] overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
                          <img
                            src={getFullImageUrl(report.result_image_url || report.image_url)}
                            alt={report.issue_type}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              ;(e.target as HTMLElement).style.display = 'none'
                            }}
                          />
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1 mb-0.5">
                            <span className="font-mono text-[10px] font-bold text-slate-500">
                              #{report.report_id}
                            </span>
                            <div className="flex items-center gap-1">
                              <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-slate-100 text-slate-700">
                                {report.urgency_score}
                              </span>
                            </div>
                          </div>

                          <h4 className="font-bold text-xs text-[#1a1a2e] capitalize truncate">
                            {report.issue_type.replace(/_/g, ' ')}
                          </h4>

                          <p className="text-[11px] text-slate-500 truncate mt-0.5 flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-400 shrink-0" />
                            <span className="truncate">{report.location_name || 'Patiala, Punjab'}</span>
                          </p>

                          <div className="flex items-center gap-2 mt-1.5 text-[10px] text-slate-400">
                            <span className="flex items-center gap-0.5">
                              <Clock className="w-3 h-3" />
                              {timeAgo(report.created_at)}
                            </span>
                            <span>•</span>
                            <span
                              className={`font-semibold ${
                                report.severity === 'High'
                                  ? 'text-[#e94560]'
                                  : report.severity === 'Medium'
                                  ? 'text-[#f59e0b]'
                                  : 'text-[#0f9b58]'
                              }`}
                            >
                              {report.severity}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Card Action Buttons */}
                      <div className="pt-2.5 mt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <button
                          onClick={() => onSelectReport(report.report_id)}
                          className="flex items-center gap-1 text-[11px] font-semibold text-slate-600 hover:text-slate-900 px-2 py-1 rounded hover:bg-slate-50 transition-colors"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View</span>
                        </button>

                        {col.nextStatus && (
                          <button
                            onClick={() => onQuickStatusChange(report.report_id, col.nextStatus)}
                            className="flex items-center gap-1 text-[11px] font-semibold bg-[#1a1a2e] hover:bg-[#25253e] text-white px-2.5 py-1 rounded-[4px] transition-colors shadow-2xs"
                          >
                            <span>{col.nextLabel}</span>
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}
