'use client'

import React, { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import {
  Shield,
  Camera,
  Cpu,
  Building2,
  ArrowRight,
  CheckCircle2,
  MapPin,
  Clock,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  Check,
  ClipboardList,
  Zap,
  ArrowUp,
  AlertTriangle,
  Droplets,
  Trash2
} from 'lucide-react'
import Navbar from '../components/Navbar'
import { api, OverviewStats } from '../lib/api'

// Counter animation component for animated numbers
function AnimatedCounter({
  target,
  duration = 1400,
  suffix = '',
}: {
  target: number
  duration?: number
  suffix?: string
}) {
  const [count, setCount] = useState(0)
  const [hasStarted, setHasStarted] = useState(false)
  const elementRef = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = elementRef.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !hasStarted) {
          setHasStarted(true)
          let startTime: number | null = null

          const step = (now: number) => {
            if (!startTime) startTime = now
            const elapsed = now - startTime
            const progress = Math.min(elapsed / duration, 1)
            // Ease out cubic
            const current = Math.floor(
              progress === 1 ? target : target * (1 - Math.pow(1 - progress, 3))
            )
            setCount(current)

            if (progress < 1) {
              window.requestAnimationFrame(step)
            } else {
              setCount(target)
            }
          }
          window.requestAnimationFrame(step)
        }
      },
      { threshold: 0.2 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [target, duration, hasStarted])

  return (
    <span ref={elementRef}>
      {count.toLocaleString()}
      {suffix}
    </span>
  )
}

export default function LandingPage() {
  const [stats, setStats] = useState<OverviewStats>({
    total_reports: 1284,
    resolved_reports: 946,
    pending_reports: 184,
    in_progress_reports: 154,
    cities_covered: 12,
    resolution_rate: 73.6,
    avg_resolution_time_hours: 28,
    active_departments: 3,
  })

  const [showScrollTop, setShowScrollTop] = useState(false)

  useEffect(() => {
    // Fetch live municipal stats from backend
    const fetchStats = async () => {
      try {
        const data = await api.getOverviewStats()
        if (data && data.total_reports > 0) {
          setStats(data)
        }
      } catch {
        // Fallback to sample municipal stats
      }
    }
    fetchStats()

    // Scroll reveal observer
    const reveals = document.querySelectorAll('.reveal-fade-up')
    const revealObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible')
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    )

    reveals.forEach((el) => revealObserver.observe(el))

    // Back to top scroll listener
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 200)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      revealObserver.disconnect()
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f8f9fc] relative">
      <Navbar />

      {/* ================= HERO SECTION ================= */}
      <section className="hero-pattern-bg pt-20 pb-16 px-4 md:px-8 max-w-5xl mx-auto w-full text-center relative overflow-hidden">
        <div className="reveal-fade-up is-visible">
          {/* Announcement pill with gentle breathing animation & breathing green dot */}
          <div className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-medium text-slate-700 mb-6 shadow-2xs animate-pill-breathe">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-dot-halo absolute inline-flex h-full w-full rounded-full bg-[#0f9b58] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#0f9b58]"></span>
            </span>
            <span className="font-semibold text-slate-800">
              AI Computer Vision Model YOLOv8 Live in Punjab & Chandigarh
            </span>
          </div>

          {/* Headline with tighter letter-spacing */}
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-[-0.035em] text-[#1a1a2e] max-w-3xl mx-auto leading-[1.08]">
            Report civic issues in seconds using AI
          </h1>

          <p className="mt-5 text-base md:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed font-normal">
            Snap a photo of road damage, garbage accumulation, or waterlogging. CivicScan’s neural network instantly locates, classifies, and dispatches field teams for rapid resolution.
          </p>

          {/* 3 Floating Issue Type Chips with Staggered Fade-in & Subtle Float Animation */}
          <div className="mt-6 flex items-center justify-center gap-2.5 flex-wrap">
            <div className="animate-float-1 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition-colors">
              <span>🕳️</span>
              <span>Road Damage</span>
            </div>
            <div className="animate-float-2 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition-colors">
              <span>🗑️</span>
              <span>Garbage</span>
            </div>
            <div className="animate-float-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-slate-200 text-xs font-semibold text-slate-700 shadow-2xs hover:border-slate-300 transition-colors">
              <span>💧</span>
              <span>Waterlogging</span>
            </div>
          </div>

          {/* CTAs */}
          <div className="mt-8 flex flex-col items-center justify-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 w-full sm:w-auto">
              <Link
                href="/citizen/report"
                className="group w-full sm:w-auto flex items-center justify-center gap-2 bg-[#1a1a2e] hover:bg-[#25253e] text-white text-sm font-semibold px-6 py-3 rounded-[6px] shadow-sm transition-all"
              >
                <span>Report an Issue</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>

              <Link
                href="/citizen/reports"
                className="w-full sm:w-auto flex items-center justify-center gap-2 bg-white hover:bg-slate-50 text-[#1a1a2e] text-sm font-semibold px-6 py-3 rounded-[6px] border border-[#e2e8f0] shadow-2xs transition-all"
              >
                <span>Track My Reports</span>
              </Link>
            </div>

            {/* Gray reassurance note under buttons */}
            <p className="text-xs text-slate-400 mt-3 font-medium">
              No signup required to report
            </p>
          </div>
        </div>
      </section>

      {/* ================= STATS BAR ================= */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto w-full mb-20 reveal-fade-up">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Reports */}
          <div className="bg-white border border-[#e2e8f0] border-t-3 border-t-[#1a1a2e] rounded-[8px] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Total Reports
              </span>
              <ClipboardList className="w-4 h-4 text-slate-400" />
            </div>
            <p className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight">
              <AnimatedCounter target={stats.total_reports} />
            </p>
            <span className="text-[11px] text-slate-400 mt-1">Logged across wards</span>
          </div>

          {/* Card 2: Issues Resolved */}
          <div className="bg-white border border-[#e2e8f0] border-t-3 border-t-[#0f9b58] rounded-[8px] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-emerald-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">
                Issues Resolved
              </span>
              <CheckCircle2 className="w-4 h-4 text-[#0f9b58]" />
            </div>
            <p className="text-3xl font-extrabold text-[#0f9b58] tracking-tight">
              <AnimatedCounter target={stats.resolved_reports} />
            </p>
            <span className="text-[11px] text-slate-400 mt-1">Verified work orders</span>
          </div>

          {/* Card 3: Cities Covered */}
          <div className="bg-white border border-[#e2e8f0] border-t-3 border-t-[#0284c7] rounded-[8px] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-sky-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-700">
                Cities Covered
              </span>
              <Building2 className="w-4 h-4 text-[#0284c7]" />
            </div>
            <p className="text-3xl font-extrabold text-[#1a1a2e] tracking-tight">
              <AnimatedCounter target={stats.cities_covered} />
            </p>
            <span className="text-[11px] text-slate-400 mt-1">Active municipal zones</span>
          </div>

          {/* Card 4: Avg Resolution Time */}
          <div className="bg-white border border-[#e2e8f0] border-t-3 border-t-[#e94560] rounded-[8px] p-5 shadow-xs flex flex-col justify-between">
            <div className="flex items-center justify-between text-indigo-600 mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-600">
                Avg Resolution Time
              </span>
              <Zap className="w-4 h-4 text-[#e94560]" />
            </div>
            <p className="text-3xl font-extrabold text-[#e94560] tracking-tight">
              28 hrs
            </p>
            <span className="text-[11px] text-slate-400 mt-1">Target dispatch window</span>
          </div>
        </div>
      </section>

      {/* ================= SECTION A: HOW IT WORKS ================= */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full mb-16 reveal-fade-up">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Autonomous Pipeline
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] mt-1 tracking-tight">
            How CivicScan Works
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Three automated milestones from your phone directly to municipal repair crews.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative">
          {/* Step 1 */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs relative flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <Camera className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-base text-[#1a1a2e]">Upload Photo</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Snap any street pothole, waste overflow, or blocked drain. Instant GPS geotagging pinpoints precise coordinates.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Check className="w-3.5 h-3.5 text-[#0f9b58]" />
              <span>JPG, PNG, WEBP auto-compressed</span>
            </div>
          </div>

          {/* Dotted connector arrow (desktop only) */}
          <div className="hidden md:flex absolute top-1/2 left-[31.5%] -translate-y-1/2 z-10 text-slate-300 pointer-events-none">
            <span className="text-xs font-mono tracking-widest">····➔</span>
          </div>

          {/* Step 2 */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs relative flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <Cpu className="w-5 h-5 text-cyan-500" />
              </div>
              <h3 className="font-bold text-base text-[#1a1a2e]">AI Detects Issue</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                YOLOv8 draws cyan bounding boxes, assesses severity, estimates cost ranges, and checks for nearby duplicate reports.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Check className="w-3.5 h-3.5 text-[#0f9b58]" />
              <span>Sub-second neural inference</span>
            </div>
          </div>

          {/* Dotted connector arrow (desktop only) */}
          <div className="hidden md:flex absolute top-1/2 left-[65%] -translate-y-1/2 z-10 text-slate-300 pointer-events-none">
            <span className="text-xs font-mono tracking-widest">····➔</span>
          </div>

          {/* Step 3 */}
          <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-6 shadow-xs relative flex flex-col justify-between hover:border-slate-300 transition-colors">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-8 h-8 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <Building2 className="w-5 h-5 text-slate-400" />
              </div>
              <h3 className="font-bold text-base text-[#1a1a2e]">Department Acts</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Directly routed to municipal department dispatch queue. Field teams execute resolution while citizens track live progress.
              </p>
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center gap-1.5 text-[11px] text-slate-400 font-medium">
              <Check className="w-3.5 h-3.5 text-[#0f9b58]" />
              <span>Transparent civic accountability</span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION B: WHAT WE DETECT ================= */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full mb-16 reveal-fade-up">
        <div className="text-center mb-12">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            Computer Vision Categories
          </span>
          <h2 className="text-2xl md:text-3xl font-bold text-[#1a1a2e] mt-1 tracking-tight">
            What CivicScan Detects
          </h2>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Trained on real-world Indian road, waste, and municipal infrastructure conditions.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Road Damage */}
          <div className="bg-white border border-[#e2e8f0] border-l-4 border-l-[#1a1a2e] rounded-[8px] p-6 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-[6px] bg-slate-100 flex items-center justify-center text-xl">
                🕳️
              </div>
              <h3 className="font-bold text-base text-[#1a1a2e]">Road Damage</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Potholes, cracks, surface damage, collapsed asphalt, and edge degradation on roads.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="text-slate-400 text-[11px]">Routes to:</span>
              <span className="bg-slate-100 px-2 py-0.5 rounded text-[11px] text-[#1a1a2e]">
                Roads Dept
              </span>
            </div>
          </div>

          {/* Card 2: Garbage */}
          <div className="bg-white border border-[#e2e8f0] border-l-4 border-l-[#f59e0b] rounded-[8px] p-6 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-[6px] bg-amber-50 flex items-center justify-center text-xl">
                🗑️
              </div>
              <h3 className="font-bold text-base text-[#1a1a2e]">Garbage Accumulation</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Overflowing bins, illegal dumping, construction debris, and uncollected curbside waste.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="text-slate-400 text-[11px]">Routes to:</span>
              <span className="bg-amber-50 text-amber-800 px-2 py-0.5 rounded text-[11px]">
                Sanitation Dept
              </span>
            </div>
          </div>

          {/* Card 3: Waterlogging */}
          <div className="bg-white border border-[#e2e8f0] border-l-4 border-l-[#0284c7] rounded-[8px] p-6 shadow-xs hover:-translate-y-1 hover:shadow-md transition-all duration-200 flex flex-col justify-between">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-[6px] bg-sky-50 flex items-center justify-center text-xl">
                💧
              </div>
              <h3 className="font-bold text-base text-[#1a1a2e]">Waterlogging</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Flooded roads, blocked storm drains, stagnant water pools, and overflow hazards.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-700">
              <span className="text-slate-400 text-[11px]">Routes to:</span>
              <span className="bg-sky-50 text-sky-800 px-2 py-0.5 rounded text-[11px]">
                Water Dept
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION C: WHY CIVICSCAN ================= */}
      <section className="py-16 px-4 md:px-8 max-w-5xl mx-auto w-full mb-16 reveal-fade-up">
        <div className="bg-white border border-[#e2e8f0] rounded-[8px] p-8 md:p-12 shadow-xs grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Left statement */}
          <div className="space-y-4">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-600">
              AI Civic Intelligence
            </span>
            <h2 className="text-3xl md:text-4xl font-extrabold text-[#1a1a2e] tracking-tight leading-[1.15]">
              Your photo. Our AI. Faster resolution.
            </h2>
            <p className="text-xs text-slate-600 leading-relaxed">
              CivicScan replaces cumbersome bureaucratic complaint forms with instantaneous computer vision. An issue reported in seconds is an issue dispatched in minutes.
            </p>
          </div>

          {/* Right bullet points */}
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0f9b58] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3 h-3 stroke-[3]" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  YOLOv8 computer vision — 70%+ accuracy
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Trained weights recognize civic defects even in challenging lighting and varied angles.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0f9b58] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Auto-routes to correct department
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Eliminates departmental run-arounds by directing reports straight to assigned field wards.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0f9b58] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Real-time status tracking
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Full transparency with sequential timelines, engineer notes, and completion verification.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-[#0f9b58] flex items-center justify-center shrink-0 mt-0.5">
                <Check className="w-3.5 h-3.5 stroke-[3]" />
              </div>
              <div>
                <strong className="text-xs font-bold text-slate-900 block">
                  Duplicate detection — no spam
                </strong>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Spatial proximity matching merges repeat complaints into a single prioritized cluster.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= SECTION D: CTA BANNER ================= */}
      <section className="px-4 md:px-8 max-w-5xl mx-auto w-full mb-20 reveal-fade-up">
        <div className="bg-[#1a1a2e] text-white rounded-[8px] p-8 md:p-12 text-center shadow-lg space-y-5">
          <h2 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white">
            Ready to make your city better?
          </h2>
          <p className="text-xs md:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
            Join citizens across Patiala, Chandigarh, and Ludhiana creating cleaner, safer public roads and infrastructure.
          </p>

          <div className="pt-2">
            <Link
              href="/citizen/report"
              className="inline-flex items-center justify-center gap-2 bg-white text-[#1a1a2e] hover:bg-slate-100 text-sm font-bold px-7 py-3 rounded-[6px] shadow-sm transition-all"
            >
              <span>Report an Issue</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
            <p className="text-[11px] text-slate-400 mt-2.5">
              Free to use. No account needed to report.
            </p>
          </div>
        </div>
      </section>

      {/* ================= FOOTER ================= */}
      <footer className="mt-auto bg-white border-t border-[#e2e8f0] py-8 px-4 md:px-8 text-xs text-slate-500">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Left */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-[5px] bg-[#1a1a2e] flex items-center justify-center text-white text-[10px] font-bold">
                <Shield className="w-3.5 h-3.5 text-cyan-400" />
              </div>
              <span className="font-bold text-sm text-[#1a1a2e]">CivicScan</span>
            </div>
            <p className="text-[11px] text-slate-400">
              AI-Powered Civic Issue Intelligence & Resolution
            </p>
          </div>

          {/* Middle Links */}
          <div className="flex items-center gap-6 text-xs font-medium">
            <Link href="/" className="hover:text-slate-900 transition-colors">
              Home
            </Link>
            <Link href="/citizen/report" className="hover:text-slate-900 transition-colors">
              Report Issue
            </Link>
            <Link href="/citizen/reports" className="hover:text-slate-900 transition-colors">
              Track Reports
            </Link>
            <Link href="/auth" className="hover:text-slate-900 transition-colors">
              About
            </Link>
          </div>

          {/* Right */}
          <div className="text-center md:text-right text-[11px] text-slate-500 font-medium">
            Built for UCS503 — Software Engineering, TIET
          </div>
        </div>
      </footer>

      {/* Floating Back to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-6 right-6 z-40 w-10 h-10 rounded-full bg-[#1a1a2e] text-white flex items-center justify-center shadow-lg hover:bg-[#25253e] hover:scale-105 transition-all animate-toast"
          aria-label="Back to Top"
        >
          <ArrowUp className="w-4 h-4 stroke-[2.5]" />
        </button>
      )}
    </div>
  )
}
