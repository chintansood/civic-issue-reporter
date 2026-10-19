'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Clock,
  Building2,
  CheckCircle2,
  AlertCircle,
  Search,
  Filter,
  Layers,
  ArrowRight,
  RefreshCw
} from 'lucide-react'
import CityMap from '../../../components/CityMap'
import ReportDetailPanel from '../../../components/ReportDetailPanel'
import { api, Report, OverviewStats, AnalyticsStats } from '../../../lib/api'

// Recharts for bottom-right line chart
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts'

export default function AdminDashboardPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    fetchAdminData()
  }, [])

  const fetchAdminData = async () => {
    setLoading(true)
    try {
      const [reps, ovStats, anStats] = await Promise.all([
        api.getReports(),
        api.getOverviewStats(),
        api.getAnalyticsStats(),
      ])
      setReports(reps)
      setStats(ovStats)
      setAnalytics(anStats)
    } catch (err) {
      console.error('Failed to load admin data', err)
    } finally {
      setLoading(false)
    }
  }

  // Filter reports by search
  const filteredReports = reports.filter((r) => {
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      r.report_id.toLowerCase().includes(q) ||
      r.issue_type.toLowerCase().includes(q) ||
      (r.location_name || '').toLowerCase().includes(q)
    )
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

  const chartData = analytics?.reports_over_time || [
    { date: 'Oct 05', reports: 12 },
    { date: 'Oct 08', reports: 19 },
    { date: 'Oct 11', reports: 15 },
    { date: 'Oct 14', reports: 24 },
    { date: 'Oct 17', reports: 31 },
    { date: 'Oct 19', reports: 28 },
  ]

  const deptPerformances = analytics?.dept_resolution_rates || [
    { department: 'Roads Department', total: 24, resolved: 18, rate: 75.0 },
    { department: 'Sanitation Department', total: 19, resolved: 16, rate: 84.2 },
    { department: 'Water & Drainage Dept', total: 14, resolved: 9, rate: 64.3 },
  ]

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-slate-950 text-white font-sans">
      {/* Background Dark Leaflet Map */}
      <div className="absolute inset-0 z-0">
        <CityMap
          reports={mapPins}
          center={[30.3398, 76.3869]}
          zoom={12}
          height="100%"
          darkTheme={true}
          onSelectReport={(id) => setSelectedReportId(id)}
        />
      </div>

      {/* Top Left: Navigation & Stats Bar */}
      <div className="absolute top-5 left-5 z-20 space-y-3 pointer-events-auto max-w-xl w-full">
        {/* Brand header */}
        <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-slate-700/80 rounded-[8px] p-4 shadow-xl flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-sm tracking-tight text-white">
                  CivicScan Municipal HQ
                </h1>
                <span className="text-[9px] font-bold uppercase tracking-wider bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.2 rounded">
                  Live
                </span>
              </div>
              <p className="text-[11px] text-slate-400">
                Command Oversight & AI Incident Analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/analytics"
              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-xs font-semibold px-3 py-1.5 rounded-[6px] text-slate-200 border border-slate-700 transition-colors"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Full Analytics</span>
            </Link>
            <Link
              href="/citizen/dashboard"
              className="text-xs font-semibold text-slate-400 hover:text-white px-2 py-1.5 transition-colors"
            >
              Exit
            </Link>
          </div>
        </div>

        {/* KPI Stats Bar */}
        <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-slate-700/80 rounded-[8px] p-3 shadow-xl grid grid-cols-4 gap-2 text-center divide-x divide-slate-800">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
              Total Reports
            </span>
            <strong className="text-lg font-extrabold text-white">
              {stats?.total_reports || reports.length}
            </strong>
          </div>

          <div>
            <span className="text-[9px] uppercase tracking-wider text-emerald-400 font-bold block">
              Resolution Rate
            </span>
            <strong className="text-lg font-extrabold text-emerald-400">
              {stats?.resolution_rate || 78.4}%
            </strong>
          </div>

          <div>
            <span className="text-[9px] uppercase tracking-wider text-cyan-400 font-bold block">
              Avg Resolution
            </span>
            <strong className="text-lg font-extrabold text-cyan-400">
              {stats?.avg_resolution_time_hours || 4.8}h
            </strong>
          </div>

          <div>
            <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
              Active Depts
            </span>
            <strong className="text-lg font-extrabold text-white">
              {stats?.active_departments || 3}
            </strong>
          </div>
        </div>
      </div>

      {/* Top Right: Search & Severity Legend */}
      <div className="absolute top-5 right-5 z-20 space-y-2 pointer-events-auto">
        <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-slate-700/80 rounded-[8px] p-2.5 shadow-xl flex items-center gap-2">
          <Search className="w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search report ID, ward, issue..."
            className="text-xs bg-transparent text-white placeholder-slate-500 focus:outline-none w-48"
          />
        </div>

        {/* Legend */}
        <div className="bg-[#1a1a2e]/90 backdrop-blur-md border border-slate-700/80 rounded-[6px] p-2 shadow-lg flex items-center justify-between text-[10px] text-slate-300 gap-3">
          <span className="flex items-center gap-1 font-semibold text-rose-400">
            <span className="w-2 h-2 rounded-full bg-[#e94560]"></span> High
          </span>
          <span className="flex items-center gap-1 font-semibold text-amber-400">
            <span className="w-2 h-2 rounded-full bg-[#f59e0b]"></span> Medium
          </span>
          <span className="flex items-center gap-1 font-semibold text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-[#0f9b58]"></span> Low
          </span>
        </div>
      </div>

      {/* Bottom Left: Department Performance Panel */}
      <div className="absolute bottom-5 left-5 z-20 pointer-events-auto max-w-sm w-full">
        <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-slate-700/80 rounded-[8px] p-4 shadow-xl space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
              Department Performance
            </span>
            <Building2 className="w-3.5 h-3.5 text-slate-400" />
          </div>

          <div className="space-y-3">
            {deptPerformances.map((dept) => (
              <div key={dept.department} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-200 truncate">{dept.department}</span>
                  <span className="text-slate-400 font-mono text-[11px]">{dept.rate}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                  <div
                    className="h-1.5 rounded-full transition-all duration-700"
                    style={{
                      width: `${dept.rate}%`,
                      backgroundColor:
                        dept.rate > 80 ? '#0f9b58' : dept.rate > 60 ? '#f59e0b' : '#e94560',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Right: Line Chart (Daily Reports 30 Days using recharts) */}
      <div className="absolute bottom-5 right-5 z-20 pointer-events-auto max-w-md w-full">
        <div className="bg-[#1a1a2e]/95 backdrop-blur-md border border-slate-700/80 rounded-[8px] p-4 shadow-xl space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Daily Incident Trend
              </span>
              <p className="text-xs font-bold text-slate-200">Volume (Last 14 Days)</p>
            </div>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>

          <div className="h-28 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={9} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={9} tickLine={false} width={20} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0f172a',
                    borderColor: '#334155',
                    fontSize: '11px',
                    borderRadius: '6px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="reports"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  dot={{ r: 2, fill: '#22d3ee' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Slide-in Detail Panel */}
      <ReportDetailPanel
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
      />
    </div>
  )
}
