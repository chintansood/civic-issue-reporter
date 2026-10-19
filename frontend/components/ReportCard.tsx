'use client'

import React from 'react'
import Image from 'next/image'
import { MapPin, Clock, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react'
import { Report, API_BASE_URL } from '../lib/api'

interface ReportCardProps {
  report: Report
  onViewDetails: (reportId: string) => void
}

export default function ReportCard({ report, onViewDetails }: ReportCardProps) {
  // Format relative time
  const timeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((new Date().getTime() - new Date(dateStr).getTime()) / 1000)
      if (diff < 60) return 'Just now'
      if (diff < 3600) return `${Math.floor(diff / 60)}m ago`
      if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`
      return `${Math.floor(diff / 86400)}d ago`
    } catch {
      return 'Recently'
    }
  }

  const getFullImageUrl = (url?: string | null) => {
    if (!url) return '/placeholder.jpg'
    if (url.startsWith('http')) return url
    return `${API_BASE_URL}${url}`
  }

  const severityColor = {
    High: 'bg-rose-50 text-[#e94560] border-rose-200',
    Medium: 'bg-amber-50 text-[#f59e0b] border-amber-200',
    Low: 'bg-emerald-50 text-[#0f9b58] border-emerald-200',
  }[report.severity] || 'bg-slate-50 text-slate-700 border-slate-200'

  const statusColor = {
    pending: 'bg-red-50 text-red-700 border-red-200',
    in_progress: 'bg-amber-50 text-amber-700 border-amber-200',
    resolved: 'bg-emerald-50 text-[#0f9b58] border-emerald-200',
    rejected: 'bg-slate-100 text-slate-600 border-slate-200',
  }[report.status.toLowerCase()] || 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-4 hover:border-slate-300 transition-all shadow-sm hover:shadow flex flex-col justify-between group">
      <div>
        {/* Top Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-slate-700 tracking-tight">
              #{report.report_id}
            </span>
            {report.duplicate_count > 0 && (
              <span className="text-[10px] font-semibold bg-indigo-50 text-indigo-700 px-1.5 py-0.5 rounded border border-indigo-200">
                +{report.duplicate_count} merged
              </span>
            )}
          </div>
          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${statusColor} uppercase tracking-wider`}>
            {report.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Thumbnail and Details */}
        <div className="flex gap-3.5 mb-3">
          <div className="w-20 h-20 rounded-[6px] overflow-hidden bg-slate-100 shrink-0 border border-slate-200 relative">
            <img
              src={getFullImageUrl(report.result_image_url || report.image_url)}
              alt={report.issue_type}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              onError={(e) => {
                // Fallback for image error
                (e.target as HTMLElement).style.display = 'none'
              }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 mb-1 flex-wrap">
              <span className="text-[11px] font-bold bg-[#1a1a2e] text-white px-2 py-0.5 rounded uppercase tracking-wider">
                {report.issue_type.replace(/_/g, ' ')}
              </span>
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded border ${severityColor}`}>
                {report.severity}
              </span>
            </div>

            <p className="text-xs text-slate-600 line-clamp-2 mt-1">
              {report.description || `Detected ${report.issue_type.replace(/_/g, ' ')} requiring municipal attention.`}
            </p>

            <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-2 truncate">
              <MapPin className="w-3.5 h-3.5 shrink-0 text-slate-400" />
              <span className="truncate">{report.location_name || 'Patiala, Punjab'}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <div className="flex items-center gap-3 text-slate-400 text-[11px]">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {timeAgo(report.created_at)}
          </span>
          <span>•</span>
          <span className="font-medium text-slate-600">
            Urgency: <strong className="text-[#1a1a2e]">{report.urgency_score}</strong>/100
          </span>
        </div>

        <button
          onClick={() => onViewDetails(report.report_id)}
          className="flex items-center gap-1 text-xs font-semibold text-[#1a1a2e] hover:text-indigo-600 transition-colors"
        >
          <span>View Details</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  )
}
