'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  Shield,
  ShieldCheck,
  Plus,
  Bell,
  User,
  LogOut,
  FileText,
  LayoutDashboard,
  Check,
  ChevronDown
} from 'lucide-react'
import { getCurrentUser, clearAuth, User as UserType } from '../lib/auth'
import { api, NotificationItem } from '../lib/api'

export default function Navbar() {
  const router = useRouter()
  const pathname = usePathname()
  const [currentUser, setCurrentUser] = useState<UserType | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [showNotifs, setShowNotifs] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const notifRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setCurrentUser(getCurrentUser())

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 12)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    const loadNotifs = async () => {
      try {
        const notifs = await api.getNotifications()
        setNotifications(notifs)
      } catch {
        // user not logged in or endpoint silent
      }
    }
    loadNotifs()

    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifs(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setShowUserMenu(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      window.removeEventListener('scroll', handleScroll)
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [pathname])

  const handleLogout = async () => {
    try {
      await api.logout()
    } catch {
      // ignore
    }
    clearAuth()
    setCurrentUser(null)
    router.push('/auth')
  }

  const unreadCount = notifications.filter((n) => !n.is_read).length

  const markRead = async (id: number) => {
    try {
      await api.markNotificationRead(id)
      setNotifications((prev) =>
        prev.map((n) => (n.notif_id === id ? { ...n, is_read: true } : n))
      )
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Thin loading/progress bar at very top of page (accent color) */}
      <div className="fixed top-0 left-0 right-0 h-[2.5px] bg-gradient-to-r from-[#0284c7] via-[#22d3ee] to-[#0f9b58] z-50 pointer-events-none" />

      <header
        className={`sticky top-0 z-40 bg-white/95 backdrop-blur-md h-16 px-4 md:px-8 flex items-center justify-between transition-all duration-200 ${
          isScrolled
            ? 'border-b border-[#e2e8f0] shadow-[0_2px_10px_rgba(0,0,0,0.03)]'
            : 'border-b border-transparent'
        }`}
      >
        {/* Brand */}
        <div className="flex items-center gap-7">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="w-8 h-8 rounded-[6px] bg-[#1a1a2e] flex items-center justify-center text-white shadow-xs group-hover:bg-[#25253e] transition-colors">
              <Shield className="w-4 h-4 text-cyan-400 stroke-[2.2]" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-lg tracking-tight text-[#1a1a2e]">
                CivicScan
              </span>
              <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200/60">
                AI
              </span>
            </div>
          </Link>

          {/* Nav links with smooth hover underline animation */}
          <nav className="hidden md:flex items-center gap-5">
            <Link
              href="/citizen/dashboard"
              className={`nav-link-animated text-xs font-medium py-1 ${
                pathname.includes('/citizen/dashboard')
                  ? 'text-[#1a1a2e] font-semibold after:w-full'
                  : 'text-slate-600 hover:text-[#1a1a2e]'
              }`}
            >
              Citizen Dashboard
            </Link>
            <Link
              href="/citizen/reports"
              className={`nav-link-animated text-xs font-medium py-1 ${
                pathname.includes('/citizen/reports')
                  ? 'text-[#1a1a2e] font-semibold after:w-full'
                  : 'text-slate-600 hover:text-[#1a1a2e]'
              }`}
            >
              My Reports
            </Link>
            {currentUser && (currentUser.role === 'staff' || currentUser.role === 'admin') && (
              <Link
                href="/staff/dashboard"
                className={`nav-link-animated text-xs font-medium py-1 ${
                  pathname.includes('/staff')
                    ? 'text-[#1a1a2e] font-semibold after:w-full'
                    : 'text-slate-600 hover:text-[#1a1a2e]'
                }`}
              >
                Staff Portal
              </Link>
            )}
            {currentUser && currentUser.role === 'admin' && (
              <Link
                href="/admin/dashboard"
                className={`nav-link-animated text-xs font-medium py-1 ${
                  pathname.includes('/admin')
                    ? 'text-[#1a1a2e] font-semibold after:w-full'
                    : 'text-slate-600 hover:text-[#1a1a2e]'
                }`}
              >
                Admin HQ
              </Link>
            )}
          </nav>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <div className="relative" ref={notifRef}>
            <button
              onClick={() => setShowNotifs(!showNotifs)}
              className="w-9 h-9 rounded-[6px] border border-[#e2e8f0] flex items-center justify-center text-slate-600 hover:text-[#1a1a2e] hover:bg-slate-50 transition-colors relative"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#e94560] text-white text-[9px] font-bold flex items-center justify-center border-2 border-white">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifs && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-[#e2e8f0] rounded-[8px] shadow-lg py-2 z-50 animate-toast">
                <div className="px-3.5 py-2 border-b border-[#e2e8f0] flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#1a1a2e]">Notifications</span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {unreadCount} unread
                  </span>
                </div>
                <div className="max-h-64 overflow-y-auto divide-y divide-slate-100">
                  {notifications.length === 0 ? (
                    <div className="p-4 text-center text-xs text-slate-500">
                      No notifications yet.
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.notif_id}
                        onClick={() => markRead(n.notif_id)}
                        className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition-colors ${
                          !n.is_read ? 'bg-blue-50/40' : ''
                        }`}
                      >
                        <p className="text-slate-800 leading-snug">{n.message}</p>
                        <span className="text-[10px] text-slate-400 mt-1 block">
                          {new Date(n.created_at).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Menu or Sign In Button with border */}
          {currentUser ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-2 pl-2 pr-1.5 py-1 rounded-[6px] border border-[#e2e8f0] hover:bg-slate-50 transition-colors"
              >
                <div className="w-6 h-6 rounded-full bg-[#1a1a2e] text-white text-[10px] font-bold flex items-center justify-center">
                  {currentUser.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs font-medium text-slate-700 hidden sm:inline max-w-[100px] truncate">
                  {currentUser.name}
                </span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-52 bg-white border border-[#e2e8f0] rounded-[8px] shadow-lg py-1.5 z-50 text-xs animate-toast">
                  <div className="px-3.5 py-2 border-b border-[#e2e8f0]">
                    <p className="font-semibold text-slate-900 truncate">{currentUser.name}</p>
                    <p className="text-[10px] text-slate-500 truncate">{currentUser.email}</p>
                    <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">
                      Role: {currentUser.role}
                    </span>
                  </div>
                  <Link
                    href="/citizen/dashboard"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5 text-slate-500" />
                    <span>Citizen Dashboard</span>
                  </Link>
                  <Link
                    href="/citizen/reports"
                    onClick={() => setShowUserMenu(false)}
                    className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700"
                  >
                    <FileText className="w-3.5 h-3.5 text-slate-500" />
                    <span>My Reports</span>
                  </Link>
                  <div className="border-t border-[#e2e8f0] my-1"></div>
                  {currentUser.role === 'staff' && (
                    <Link
                      href="/staff/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Staff Portal</span>
                    </Link>
                  )}
                  {currentUser.role === 'admin' && (
                    <Link
                      href="/admin/dashboard"
                      onClick={() => setShowUserMenu(false)}
                      className="flex items-center gap-2 px-3.5 py-2 hover:bg-slate-50 text-slate-700 font-medium"
                    >
                      <ShieldCheck className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Admin Control Center</span>
                    </Link>
                  )}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-3.5 py-2 hover:bg-rose-50 text-rose-600 text-left"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Log out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link
              href="/auth"
              className="text-xs font-semibold text-[#1a1a2e] hover:text-[#25253e] px-3.5 py-1.5 border border-[#e2e8f0] bg-white rounded-[6px] hover:bg-slate-50 transition-colors shadow-2xs"
            >
              Sign In
            </Link>
          )}

          {/* Filled Report Issue CTA */}
          <Link
            href="/citizen/report"
            className="flex items-center gap-1.5 bg-[#1a1a2e] hover:bg-[#25253e] text-white text-xs font-medium px-3.5 py-2 rounded-[6px] transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Report Issue</span>
          </Link>
        </div>
      </header>
    </>
  )
}
