'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Bell,
  Building2,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Map,
  Filter,
  User,
  ShieldAlert,
  Loader2,
  RefreshCw
} from 'lucide-react'
import StaffSidebar from '../../../components/StaffSidebar'
import KanbanBoard from '../../../components/KanbanBoard'
import ReportDetailPanel from '../../../components/ReportDetailPanel'
import { api, Report, OverviewStats } from '../../../lib/api'
import { getCurrentUser, User as UserType } from '../../../lib/auth'
import { useToast } from '../../../components/Toast'

export default function StaffDashboardPage() {
  const router = useRouter()
  const toast = useToast()

  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [reports, setReports] = useState<Report[]>([])
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('queue')

  useEffect(() => {
    const user = getCurrentUser()
    setCurrentUser(user)
    fetchStaffData()
  }, [])

  const fetchStaffData = async () => {
    setLoading(true)
    try {
      const [repsData, statsData] = await Promise.all([
        api.getReports(),
        api.getOverviewStats(),
      ])
      setReports(repsData)
      setStats(statsData)
    } catch (err: any) {
      toast.error('Failed to load department queue')
    } finally {
      setLoading(false)
    }
  }

  // Optimistic UI updates for quick status change
  const handleQuickStatusChange = async (reportId: string, newStatus: string) => {
    // 1. Optimistic update in UI
    setReports((prev) =>
      prev.map((r) =>
        r.report_id === reportId ? { ...r, status: newStatus as any } : r
      )
    )
    toast.success(`Report #${reportId} moved to ${newStatus.replace(/_/g, ' ')}`)

    // 2. Perform API call in background
    try {
      await api.updateReportStatus(
        reportId,
        newStatus,
        `Quick dispatch status update by ${currentUser?.name || 'Staff'}`
      )
    } catch (err: any) {
      toast.error('Failed to update status on server')
      // Revert if failed
      fetchStaffData()
    }
  }

  // Calculate department stats
  const assignedToday = reports.length
  const pendingCount = reports.filter((r) => r.status.toLowerCase() === 'pending').length
  const inProgressCount = reports.filter((r) => r.status.toLowerCase() === 'in_progress').length
  const resolvedCount = reports.filter((r) => r.status.toLowerCase() === 'resolved').length
  const avgResolutionTime = stats ? `${stats.avg_resolution_time_hours} hrs` : '4.2 hrs'

  const deptTitle = currentUser?.department_name || 'Roads Department'

  return (
    <div className="flex h-screen bg-[#f8f9fc] overflow-hidden">
      {/* 56px Icon Sidebar */}
      <StaffSidebar currentTab={activeTab} onTabChange={setActiveTab} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-[#e2e8f0] px-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-[6px] bg-slate-100 flex items-center justify-center text-[#1a1a2e]">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h1 className="font-bold text-sm text-[#1a1a2e] tracking-tight">{deptTitle}</h1>
              <p className="text-[11px] text-slate-400">
                Municipal Command • Jurisdiction: Patiala & Region
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={fetchStaffData}
              className="p-1.5 rounded-[6px] border border-[#e2e8f0] text-slate-500 hover:text-slate-800 hover:bg-slate-50 transition-colors"
              title="Refresh queue"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            </button>

            <Link
              href="/staff/map"
              className="hidden sm:flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-[6px] border border-[#e2e8f0] text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Map className="w-3.5 h-3.5 text-slate-500" />
              <span>Territory Map</span>
            </Link>

            <div className="h-4 w-px bg-slate-200"></div>

            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#1a1a2e] text-white text-[11px] font-bold flex items-center justify-center">
                {currentUser ? currentUser.name.charAt(0) : 'S'}
              </div>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-semibold text-slate-800">
                  {currentUser?.name || 'Staff Member'}
                </span>
                <span className="text-[10px] text-slate-400 capitalize">
                  {currentUser?.role || 'Field Engineer'}
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* Scrollable Dashboard Body */}
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Stats Row */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5">
            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Assigned Queue
              </span>
              <p className="text-xl font-bold text-[#1a1a2e] mt-1">{assignedToday}</p>
              <span className="text-[10px] text-slate-500">Total in ward</span>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#e94560]">
                Pending Review
              </span>
              <p className="text-xl font-bold text-[#e94560] mt-1">{pendingCount}</p>
              <span className="text-[10px] text-slate-500">Awaiting action</span>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#f59e0b]">
                In Progress
              </span>
              <p className="text-xl font-bold text-[#f59e0b] mt-1">{inProgressCount}</p>
              <span className="text-[10px] text-slate-500">Crews active</span>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-3.5 shadow-xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0f9b58]">
                Resolved
              </span>
              <p className="text-xl font-bold text-[#0f9b58] mt-1">{resolvedCount}</p>
              <span className="text-[10px] text-slate-500">Completed jobs</span>
            </div>

            <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-3.5 shadow-xs col-span-2 md:col-span-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600">
                Avg Resolution
              </span>
              <p className="text-xl font-bold text-indigo-600 mt-1">{avgResolutionTime}</p>
              <span className="text-[10px] text-slate-500">Mean response time</span>
            </div>
          </div>

          {/* Kanban Section Header */}
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-bold text-base text-[#1a1a2e] tracking-tight">
                Department Dispatch Kanban
              </h2>
              <p className="text-xs text-slate-500">
                Drag or advance incidents through dispatch stages. Optimistic updates synchronize with citizen tracking.
              </p>
            </div>
          </div>

          {/* Kanban Board */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-96 bg-slate-100 rounded-[8px] animate-pulse" />
              ))}
            </div>
          ) : (
            <KanbanBoard
              reports={reports}
              onSelectReport={(id) => setSelectedReportId(id)}
              onQuickStatusChange={handleQuickStatusChange}
            />
          )}
        </main>
      </div>

      {/* Slide-in Detail Panel for Staff */}
      <ReportDetailPanel
        reportId={selectedReportId}
        onClose={() => setSelectedReportId(null)}
        onStatusUpdated={(updated) => {
          setReports((prev) =>
            prev.map((r) => (r.report_id === updated.report_id ? updated : r))
          )
        }}
      />
    </div>
  )
}
