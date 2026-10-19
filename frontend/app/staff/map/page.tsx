'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Map,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowLeft,
  RefreshCw,
  Search
} from 'lucide-react'
import StaffSidebar from '../../../components/StaffSidebar'
import CityMap from '../../../components/CityMap'
import ReportDetailPanel from '../../../components/ReportDetailPanel'
import { api, Report } from '../../../lib/api'
import { getCurrentUser } from '../../../lib/auth'

export default function StaffMapViewPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  // Filters
  const [severityFilter, setSeverityFilter] = useState('All')
  const [statusFilter, setStatusFilter] = useState('All')
  const [typeFilter, setTypeFilter] = useState('All')

  useEffect(() => {
    loadMapData()
  }, [])

  const loadMapData = async () => {
    setLoading(true)
    try {
      const data = await api.getReports()
      setReports(data)
    } catch (err) {
      console.error('Failed to load map data', err)
    } finally {
      setLoading(false)
    }
  }

  const filteredReports = reports.filter((r) => {
    if (severityFilter !== 'All' && r.severity !== severityFilter) return false
    if (statusFilter !== 'All' && r.status.toLowerCase() !== statusFilter.toLowerCase().replace(/ /g, '_')) return false
    if (typeFilter !== 'All' && r.issue_type.toLowerCase() !== typeFilter.toLowerCase().replace(/ /g, '_')) return false
    return true
  })

  const mapPins = filteredReports.map((r) => ({
    report_id: r.report_id,
    issue_type: r.issue_type,
    severity: r.severity,
    status: r.status,
    latitude: r.latitude,
    longitude: r.longitude,
    location_name: r.location_name || 'Patiala, Punjab',
    urgency_score: r.urgency_score,
  }))

  return (
    <div className="flex h-screen bg-[#f8f9fc] overflow-hidden">
      {/* 56px Sidebar */}
      <StaffSidebar currentTab="map" />

      {/* Main View */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative">
        {/* Top Control Bar */}
        <header className="h-14 bg-white border-b border-[#e2e8f0] px-4 flex items-center justify-between z-20 shrink-0">
          <div className="flex items-center gap-3">
            <Link
              href="/staff/dashboard"
              className="p-1.5 rounded-[6px] border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div className="flex items-center gap-2">
              <h1 className="font-bold text-xs text-[#1a1a2e] uppercase tracking-wider">
                Territory Map View
              </h1>
              <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
                {filteredReports.length} incidents plotted
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={loadMapData}
              className="p-1.5 rounded-[6px] border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
              title="Refresh Map"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <Link
              href="/staff/dashboard"
              className="text-xs font-semibold px-3 py-1.5 rounded-[6px] bg-[#1a1a2e] text-white hover:bg-[#25253e] transition-colors"
            >
              Back to Queue
            </Link>
          </div>
        </header>

        {/* Floating Filter Bar */}
        <div className="absolute top-18 left-4 z-20 bg-white/95 backdrop-blur-xs border border-[#e2e8f0] rounded-[8px] p-3 shadow-md flex items-center gap-3 flex-wrap max-w-2xl">
          <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <span>Filters:</span>
          </div>

          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="text-xs py-1 px-2 rounded-[5px] border border-[#e2e8f0] bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="All">All Severities</option>
            <option value="High">High Severity</option>
            <option value="Medium">Medium Severity</option>
            <option value="Low">Low Severity</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs py-1 px-2 rounded-[5px] border border-[#e2e8f0] bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="All">All Statuses</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Type */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="text-xs py-1 px-2 rounded-[5px] border border-[#e2e8f0] bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
          >
            <option value="All">All Issues</option>
            <option value="Road Damage">Road Damage</option>
            <option value="Garbage">Garbage</option>
            <option value="Waterlogging">Waterlogging</option>
          </select>

          {(severityFilter !== 'All' || statusFilter !== 'All' || typeFilter !== 'All') && (
            <button
              onClick={() => {
                setSeverityFilter('All')
                setStatusFilter('All')
                setTypeFilter('All')
              }}
              className="text-[11px] text-rose-600 hover:underline font-semibold"
            >
              Reset
            </button>
          )}
        </div>

        {/* Full Screen Map */}
        <div className="flex-1 w-full h-full">
          <CityMap
            reports={mapPins}
            center={[30.3398, 76.3869]}
            zoom={13}
            height="100%"
            onSelectReport={(id) => setSelectedReportId(id)}
          />
        </div>
      </div>

      {/* Slide-in Detail Panel */}
      <ReportDetailPanel
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
        onStatusUpdated={loadMapData}
      />
    </div>
  )
}
