'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Plus,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  MapPin,
  TrendingUp,
  ArrowRight,
  Sparkles,
  Filter
} from 'lucide-react'
import Navbar from '../../../components/Navbar'
import CityMap from '../../../components/CityMap'
import ReportCard from '../../../components/ReportCard'
import ReportDetailPanel from '../../../components/ReportDetailPanel'
import { api, Report } from '../../../lib/api'
import { getCurrentUser, User } from '../../../lib/auth'

export default function CitizenDashboardPage() {
  const [currentUser, setCurrentUser] = useState<User | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  useEffect(() => {
    setCurrentUser(getCurrentUser())

    const loadData = async () => {
      setLoading(true)
      try {
        const data = await api.getReports()
        setReports(data)
      } catch (err) {
        console.error('Failed to load reports', err)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  // Quick stats
  const totalReports = reports.length
  const pendingCount = reports.filter((r) => r.status.toLowerCase() === 'pending').length
  const inProgressCount = reports.filter((r) => r.status.toLowerCase() === 'in_progress').length
  const resolvedCount = reports.filter((r) => r.status.toLowerCase() === 'resolved').length

  // Last 5 recent reports
  const recentReports = reports.slice(0, 5)

  // Map pins formatting
  const mapPins = reports.map((r) => ({
    report_id: r.report_id,
    issue_type: r.issue_type,
    severity: r.severity,
    status: r.status,
    latitude: r.latitude,
    longitude: r.longitude,
    location_name: r.location_name || 'Patiala, Punjab',
    urgency_score: r.urgency_score,
  }))

  const greeting = () => {
    const hour = new Date().getHours()
    if (hour < 12) return 'Good morning'
    if (hour < 17) return 'Good afternoon'
    return 'Good evening'
  }

  const userName = currentUser ? currentUser.name.split(' ')[0] : 'Citizen'

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc] pb-16">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 md:px-8 pt-8 space-y-8 flex-1">
        {/* Welcome Banner */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1a2e]">
              {greeting()}, {userName}. Help make your city better.
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Live automated municipal dashboard. AI computer vision monitors civic infrastructure across Punjab & Chandigarh.
            </p>
          </div>

          <Link
            href="/citizen/report"
            className="flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#25253e] text-white text-xs font-semibold px-4 py-2.5 rounded-[6px] shadow-sm transition-colors shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Report New Issue</span>
          </Link>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-4.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Total Reports
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-2xl font-bold text-[#1a1a2e]">{totalReports}</strong>
              <FileText className="w-4 h-4 text-slate-400" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Civic incidents logged</span>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-4.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">
              Pending
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-2xl font-bold text-[#e94560]">{pendingCount}</strong>
              <Clock className="w-4 h-4 text-rose-400" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Awaiting inspection</span>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-4.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-amber-500">
              In Progress
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-2xl font-bold text-[#f59e0b]">{inProgressCount}</strong>
              <TrendingUp className="w-4 h-4 text-amber-400" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Crews dispatched</span>
          </div>

          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-4.5 shadow-xs">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600">
              Resolved
            </span>
            <div className="flex items-baseline justify-between mt-1">
              <strong className="text-2xl font-bold text-[#0f9b58]">{resolvedCount}</strong>
              <CheckCircle2 className="w-4 h-4 text-emerald-500" />
            </div>
            <span className="text-[11px] text-slate-500 mt-1 block">Restored & sealed</span>
          </div>
        </div>

        {/* City Map Section */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-5 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <div>
              <h2 className="text-base font-bold text-[#1a1a2e] tracking-tight">
                City Map Overview — Live Incident Feed
              </h2>
              <p className="text-xs text-slate-500">
                Interactive Leaflet map showing public civic issues color-coded by severity (Red=High, Yellow=Medium, Green=Low).
              </p>
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#e94560]"></span>
                High
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]"></span>
                Medium
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#0f9b58]"></span>
                Low
              </span>
            </div>
          </div>

          <div className="h-[380px] rounded-[6px] overflow-hidden">
            <CityMap
              reports={mapPins}
              center={[30.3398, 76.3869]}
              zoom={12}
              height="100%"
              onSelectReport={(id) => setSelectedReportId(id)}
            />
          </div>
        </div>

        {/* Recent Reports Section */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#1a1a2e] tracking-tight">
                Recent Civic Reports
              </h2>
              <p className="text-xs text-slate-500">
                Latest submissions processed by the YOLOv8 vision engine.
              </p>
            </div>

            <Link
              href="/citizen/reports"
              className="text-xs font-semibold text-slate-700 hover:text-[#1a1a2e] flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="h-32 bg-slate-100 rounded-[8px] animate-pulse" />
              ))}
            </div>
          ) : recentReports.length === 0 ? (
            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-8 text-center text-xs text-slate-500">
              No civic issues submitted yet. Be the first to report an issue!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {recentReports.map((report) => (
                <ReportCard
                  key={report.report_id}
                  report={report}
                  onViewDetails={(id) => setSelectedReportId(id)}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Floating Action Button (Bottom Right) */}
      <Link
        href="/citizen/report"
        className="fixed bottom-6 right-6 z-30 flex items-center gap-2 bg-[#1a1a2e] hover:bg-[#25253e] text-white text-xs font-semibold px-4 py-3 rounded-full shadow-lg hover:shadow-xl transition-all"
      >
        <Plus className="w-4 h-4" />
        <span>Report an Issue</span>
      </Link>

      {/* Slide-in Details Drawer */}
      <ReportDetailPanel
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
      />
    </div>
  )
}
