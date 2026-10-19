'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  BarChart3,
  TrendingUp,
  PieChart as PieIcon,
  MapPin,
  Building2,
  Calendar,
  Download,
  Filter,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react'
import Navbar from '../../../components/Navbar'
import { api, AnalyticsStats, OverviewStats } from '../../../lib/api'

// Recharts components
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts'

export default function AnalyticsPage() {
  const [analytics, setAnalytics] = useState<AnalyticsStats | null>(null)
  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      try {
        const [an, st] = await Promise.all([
          api.getAnalyticsStats(),
          api.getOverviewStats(),
        ])
        setAnalytics(an)
        setStats(st)
      } catch (err) {
        console.error('Failed to load analytics', err)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const defaultTypes = [
    { name: 'Road Damage', count: 18, color: '#1a1a2e' },
    { name: 'Garbage', count: 12, color: '#f59e0b' },
    { name: 'Waterlogging', count: 9, color: '#0ea5e9' },
  ]

  const reportsByType = analytics?.reports_by_type?.length
    ? analytics.reports_by_type
    : defaultTypes

  const reportsOverTime = analytics?.reports_over_time?.length
    ? analytics.reports_over_time
    : [
        { date: 'Oct 06', reports: 5 },
        { date: 'Oct 08', reports: 9 },
        { date: 'Oct 10', reports: 7 },
        { date: 'Oct 12', reports: 14 },
        { date: 'Oct 14', reports: 11 },
        { date: 'Oct 16', reports: 18 },
        { date: 'Oct 18', reports: 15 },
        { date: 'Oct 19', reports: 22 },
      ]

  const pieColors = ['#1a1a2e', '#0f9b58', '#0284c7', '#f59e0b']
  const deptResolution = analytics?.dept_resolution_rates || [
    { department: 'Roads Department', total: 28, resolved: 22, rate: 78.5 },
    { department: 'Sanitation Department', total: 20, resolved: 18, rate: 90.0 },
    { department: 'Water & Drainage Dept', total: 16, resolved: 10, rate: 62.5 },
  ]

  const topLocations = analytics?.top_locations || [
    { location: 'Model Town, Patiala', reports_count: 8, latitude: 30.3398, longitude: 76.3869 },
    { location: 'Sector 17 Plaza, Chandigarh', reports_count: 6, latitude: 30.7415, longitude: 76.7681 },
    { location: 'Chaura Bazaar, Ludhiana', reports_count: 5, latitude: 30.9000, longitude: 75.8573 },
    { location: 'Leela Bhawan, Patiala', reports_count: 4, latitude: 30.3421, longitude: 76.3812 },
    { location: 'Ferozepur Road, Ludhiana', reports_count: 3, latitude: 30.8920, longitude: 75.8200 },
  ]

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc] pb-16">
      <Navbar />

      <main className="max-w-6xl w-full mx-auto px-4 md:px-8 pt-8 space-y-8 flex-1">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link
              href="/admin/dashboard"
              className="p-2 rounded-[6px] border border-[#e2e8f0] bg-white text-slate-600 hover:bg-slate-50 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-[#1a1a2e]">
                Municipal Infrastructure Analytics
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Aggregated cross-departmental reporting, volume velocity, and location hotspots.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/admin/dashboard"
              className="text-xs font-semibold px-4 py-2 rounded-[6px] bg-[#1a1a2e] text-white hover:bg-[#25253e] transition-colors"
            >
              Map Control Room
            </Link>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Chart 1: Bar Chart — Reports by Issue Type */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#1a1a2e] tracking-tight">
                  Incidents by Issue Type
                </h3>
                <p className="text-[11px] text-slate-400">Total detected by YOLOv8 model</p>
              </div>
              <BarChart3 className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={reportsByType} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      color: '#fff',
                      fontSize: '12px',
                      borderRadius: '6px',
                    }}
                  />
                  <Bar dataKey="count" fill="#1a1a2e" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Line Chart — Reports Over Time */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#1a1a2e] tracking-tight">
                  Reporting Velocity Over Time
                </h3>
                <p className="text-[11px] text-slate-400">Daily incident ingestion trend</p>
              </div>
              <TrendingUp className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={reportsOverTime} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis stroke="#64748b" fontSize={11} tickLine={false} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      color: '#fff',
                      fontSize: '12px',
                      borderRadius: '6px',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="reports"
                    stroke="#0284c7"
                    strokeWidth={2.5}
                    dot={{ r: 3, fill: '#0284c7' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 3: Pie Chart — Resolution Rate by Department */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#1a1a2e] tracking-tight">
                  Resolution Breakdown by Department
                </h3>
                <p className="text-[11px] text-slate-400">Dispatched vs resolved volume</p>
              </div>
              <PieIcon className="w-4 h-4 text-slate-400" />
            </div>

            <div className="h-64 w-full flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={deptResolution}
                    dataKey="resolved"
                    nameKey="department"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    label={({ name, percent }: any) =>
                      `${name ? name.split(' ')[0] : ''}: ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    labelLine={false}
                  >
                    {deptResolution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={pieColors[index % pieColors.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#1a1a2e',
                      color: '#fff',
                      fontSize: '12px',
                      borderRadius: '6px',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Table: Top 10 Most Reported Locations */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs space-y-4 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-[#1a1a2e] tracking-tight">
                  Top Reported Geographic Hotspots
                </h3>
                <p className="text-[11px] text-slate-400">Ward and sector clustering</p>
              </div>
              <MapPin className="w-4 h-4 text-rose-500" />
            </div>

            <div className="overflow-x-auto flex-1">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[9px] tracking-wider">
                    <th className="pb-2">Location</th>
                    <th className="pb-2">Coordinates</th>
                    <th className="pb-2 text-right">Reports</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {topLocations.map((loc, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition-colors">
                      <td className="py-2.5 font-semibold text-slate-800 flex items-center gap-1.5">
                        <span className="w-4 h-4 rounded-full bg-slate-100 text-slate-600 text-[10px] font-bold flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span>{loc.location}</span>
                      </td>
                      <td className="py-2.5 text-slate-500 font-mono text-[11px]">
                        {loc.latitude.toFixed(3)}, {loc.longitude.toFixed(3)}
                      </td>
                      <td className="py-2.5 text-right font-bold text-[#1a1a2e]">
                        {loc.reports_count}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
