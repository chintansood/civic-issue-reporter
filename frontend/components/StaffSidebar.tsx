'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  ListTodo,
  Map,
  CheckCircle,
  User,
  LogOut,
  ShieldAlert,
  BarChart2
} from 'lucide-react'
import { clearAuth } from '../lib/auth'

interface StaffSidebarProps {
  currentTab?: string
  onTabChange?: (tab: string) => void
}

export default function StaffSidebar({ currentTab = 'queue', onTabChange }: StaffSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()

  const navItems = [
    { id: 'home', label: 'Dashboard Home', icon: LayoutDashboard, href: '/staff/dashboard' },
    { id: 'queue', label: 'Action Queue', icon: ListTodo, href: '/staff/dashboard' },
    { id: 'map', label: 'Territory Map', icon: Map, href: '/staff/map' },
    { id: 'resolved', label: 'Resolved Archive', icon: CheckCircle, href: '/staff/dashboard?filter=resolved' },
    { id: 'admin', label: 'Admin Analytics', icon: BarChart2, href: '/admin/dashboard' },
  ]

  const handleLogout = () => {
    clearAuth()
    router.push('/auth')
  }

  return (
    <aside className="w-14 flex-shrink-0 bg-[#1a1a2e] text-white flex flex-col items-center py-4 justify-between border-r border-slate-800 z-30">
      {/* Top Logo */}
      <div className="flex flex-col items-center gap-6">
        <Link
          href="/"
          className="w-9 h-9 rounded-[7px] bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-white transition-colors group relative"
          title="CivicScan Home"
        >
          <ShieldAlert className="w-5 h-5 text-indigo-400" />
          <span className="absolute left-16 bg-slate-900 text-white text-[10px] font-semibold px-2 py-1 rounded shadow-md whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50">
            CivicScan Home
          </span>
        </Link>

        {/* Navigation Icons */}
        <nav className="flex flex-col gap-2">
          {navItems.map((item) => {
            const Icon = item.icon
            const isActive =
              (item.id === 'map' && pathname.includes('/staff/map')) ||
              (item.id === 'admin' && pathname.includes('/admin')) ||
              (item.id === currentTab && pathname.includes('/staff/dashboard'))

            return (
              <div key={item.id} className="relative group">
                <Link
                  href={item.href}
                  onClick={() => {
                    if (onTabChange && item.id !== 'map' && item.id !== 'admin') {
                      onTabChange(item.id)
                    }
                  }}
                  className={`w-9 h-9 rounded-[6px] flex items-center justify-center transition-all ${
                    isActive
                      ? 'bg-white/15 text-white'
                      : 'text-slate-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </Link>

                {/* Tooltip */}
                <span className="absolute left-16 top-2 bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
                  {item.label}
                </span>
              </div>
            )
          })}
        </nav>
      </div>

      {/* Bottom User Actions */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative group">
          <Link
            href="/citizen/dashboard"
            className="w-9 h-9 rounded-[6px] flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <User className="w-4 h-4" />
          </Link>
          <span className="absolute left-16 top-2 bg-slate-900 text-white text-[10px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
            Citizen View
          </span>
        </div>

        <div className="relative group">
          <button
            onClick={handleLogout}
            className="w-9 h-9 rounded-[6px] flex items-center justify-center text-rose-400 hover:text-rose-300 hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
          <span className="absolute left-16 top-2 bg-slate-900 text-rose-300 text-[10px] font-medium px-2 py-1 rounded shadow-lg whitespace-nowrap opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity z-50 border border-slate-700">
            Log out
          </span>
        </div>
      </div>
    </aside>
  )
}
