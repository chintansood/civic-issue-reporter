'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  FileText,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  Inbox
} from 'lucide-react'
import Navbar from '../../../components/Navbar'
import ReportCard from '../../../components/ReportCard'
import ReportDetailPanel from '../../../components/ReportDetailPanel'
import { api, Report } from '../../../lib/api'
import { getCurrentUser } from '../../../lib/auth'

export default function MyReportsPage() {
  const [reports, setReports] = useState<Report[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'All' | 'Pending' | 'In Progress' | 'Resolved'>('All')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)

  useEffect(() => {
    loadReports()
  }, [])

  const loadReports = async () => {
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

  // Filter tabs
  const filteredReports = reports.filter((r) => {
    // Tab filter
    if (activeTab === 'Pending' && r.status.toLowerCase() !== 'pending') return false
    if (activeTab === 'In Progress' && r.status.toLowerCase() !== 'in_progress') return false
    if (activeTab === 'Resolved' && r.status.toLowerCase() !== 'resolved') return false

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      const matchId = r.report_id.toLowerCase().includes(q)
      const matchType = r.issue_type.toLowerCase().includes(q)
      const matchLoc = (r.location_name || '').toLowerCase().includes(q)
      const matchDept = (r.department_name || '').toLowerCase().includes(q)
      return matchId || matchType || matchLoc || matchDept
    }

    return true
  })

  const tabs: ('All' | 'Pending' | 'In Progress' | 'Resolved')[] = [
    'All',
    'Pending',
    'In Progress',
    'Resolved',
  ]

  const countByTab = (tab: string) => {
    if (tab === 'All') return reports.length
    if (tab === 'Pending') return reports.filter((r) => r.status.toLowerCase() === 'pending').length
    if (tab === 'In Progress') return reports.filter((r) => r.status.toLowerCase() === 'in_progress').length
    if (tab === 'Resolved') return reports.filter((r) => r.status.toLowerCase() === 'resolved').length
    return 0
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc] pb-16">
      <Navbar />

      <main className="max-w-5xl w-full mx-auto px-4 md:px-8 pt-8 space-y-6 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-[#1a1a2e]">
              My Incident Reports
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Track resolution milestones, engineering notes, and verified photo completions.
            </p>
          </div>

          <Link
            href="/citizen/report"
            className="flex items-center gap-1.5 bg-[#1a1a2e] hover:bg-[#25253e] text-white text-xs font-semibold px-4 py-2.5 rounded-[6px] shadow-sm transition-colors"
          >
            <Plus className="w-4 h-4" />
            <span>New Report</span>
          </Link>
        </div>

        {/* Filter Bar & Search */}
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-3 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
          {/* Tabs */}
          <div className="flex items-center gap-1 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
            {tabs.map((tab) => {
              const count = countByTab(tab)
              const isActive = activeTab === tab
              return (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[6px] text-xs font-medium transition-colors shrink-0 ${
                    isActive
                      ? 'bg-[#1a1a2e] text-white font-semibold'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span>{tab}</span>
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Search */}
          <div className="relative w-full sm:w-64">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by ID, location, or type..."
              className="w-full text-xs pl-8 pr-3 py-1.5 rounded-[6px] border border-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-slate-400"
            />
          </div>
        </div>

        {/* Reports Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-44 bg-slate-100 rounded-[8px] animate-pulse" />
            ))}
          </div>
        ) : filteredReports.length === 0 ? (
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-12 text-center space-y-3">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
              <Inbox className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-sm text-[#1a1a2e]">No Reports Found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery
                ? `No reports matching "${searchQuery}". Try adjusting your filters.`
                : `You don't have any reports in "${activeTab}" status.`}
            </p>
            <Link
              href="/citizen/report"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1a1a2e] hover:underline pt-2"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Submit an Issue Now</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.report_id}
                report={report}
                onViewDetails={(id) => setSelectedReportId(id)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Slide-in Detail Panel */}
      <ReportDetailPanel
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
      />
    </div>
  )
}
