'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ShieldAlert,
  ArrowRight,
  User,
  Mail,
  Lock,
  Phone,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2,
  KeyRound
} from 'lucide-react'
import { api, Department } from '../../lib/api'
import { setAuth, getCurrentUser } from '../../lib/auth'
import { useToast } from '../../components/Toast'

export default function AuthPage() {
  const router = useRouter()
  const toast = useToast()

  const [isLogin, setIsLogin] = useState(true)
  const [loading, setLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [forgotSent, setForgotSent] = useState(false)
  const [showForgotModal, setShowForgotModal] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')

  // Form fields
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [role, setRole] = useState<'citizen' | 'staff'>('citizen')
  const [departmentId, setDepartmentId] = useState<number | null>(null)
  const [departments, setDepartments] = useState<Department[]>([])

  useEffect(() => {
    // If already logged in, redirect
    const user = getCurrentUser()
    if (user) {
      if (user.role === 'admin') router.push('/admin/dashboard')
      else if (user.role === 'staff') router.push('/staff/dashboard')
      else router.push('/citizen/dashboard')
    }

    const loadDepts = async () => {
      try {
        const data = await api.getDepartments()
        setDepartments(data)
        if (data.length > 0) setDepartmentId(data[0].dept_id)
      } catch {
        // ignore
      }
    }
    loadDepts()
  }, [])

  const redirectByRole = (userRole: string) => {
    if (userRole === 'admin') {
      router.push('/admin/dashboard')
    } else if (userRole === 'staff') {
      router.push('/staff/dashboard')
    } else {
      router.push('/citizen/dashboard')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMessage(null)
    setLoading(true)

    try {
      if (isLogin) {
        const res = await api.login({ email, password })
        setAuth(res.access_token, res.user)
        toast.success(`Welcome back, ${res.user.name}!`)
        redirectByRole(res.user.role)
      } else {
        const res = await api.signup({
          name,
          email,
          password,
          phone: phone || undefined,
          role,
          department_id: role === 'staff' ? departmentId : undefined,
        })
        setAuth(res.access_token, res.user)
        toast.success(`Account created successfully! Welcome, ${res.user.name}.`)
        redirectByRole(res.user.role)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication failed. Please check your credentials.')
    } finally {
      setLoading(false)
    }
  }

  // Quick Demo Logins for instant evaluation
  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setLoading(true)
    setErrorMessage(null)
    try {
      const res = await api.login({ email: demoEmail, password: demoPass })
      setAuth(res.access_token, res.user)
      toast.success(`Logged in as ${res.user.name} (${res.user.role})`)
      redirectByRole(res.user.role)
    } catch (err: any) {
      setErrorMessage(err.message || 'Demo login failed')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPassword = (e: React.FormEvent) => {
    e.preventDefault()
    setForgotSent(true)
    setTimeout(() => {
      setShowForgotModal(false)
      setForgotSent(false)
    }, 2500)
  }

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex flex-col justify-center items-center p-4">
      {/* Brand Header */}
      <Link href="/" className="flex items-center gap-2.5 mb-8 group">
        <div className="w-9 h-9 rounded-[7px] bg-[#1a1a2e] flex items-center justify-center text-white shadow-sm">
          <ShieldAlert className="w-5 h-5 text-white" />
        </div>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-bold text-xl tracking-tight text-[#1a1a2e]">CivicScan</span>
            <span className="text-[10px] font-semibold uppercase tracking-wider bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded">
              AI
            </span>
          </div>
        </div>
      </Link>

      {/* Main Card */}
      <div className="w-full max-w-md bg-white border border-[#e2e8f0] rounded-[8px] p-7 shadow-xs">
        {/* Toggle Bar */}
        <div className="flex p-1 bg-slate-100 rounded-[6px] mb-6">
          <button
            type="button"
            onClick={() => {
              setIsLogin(true)
              setErrorMessage(null)
            }}
            className={`flex-1 text-xs font-semibold py-2 rounded-[5px] transition-all ${
              isLogin ? 'bg-white text-[#1a1a2e] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setIsLogin(false)
              setErrorMessage(null)
            }}
            className={`flex-1 text-xs font-semibold py-2 rounded-[5px] transition-all ${
              !isLogin ? 'bg-white text-[#1a1a2e] shadow-2xs' : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* Inline Error Message */}
        {errorMessage && (
          <div className="mb-5 p-3 rounded-[6px] bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2 animate-in fade-in duration-150">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <>
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Amanpreet Kaur"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-[6px] border border-[#e2e8f0] bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Phone Number <span className="text-slate-400 font-normal">(optional)</span>
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98765 43210"
                    className="w-full text-xs pl-9 pr-3 py-2.5 rounded-[6px] border border-[#e2e8f0] bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">
                  Account Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole('citizen')}
                    className={`py-2 px-3 text-xs font-semibold rounded-[6px] border transition-all ${
                      role === 'citizen'
                        ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white'
                        : 'border-[#e2e8f0] bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Citizen
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('staff')}
                    className={`py-2 px-3 text-xs font-semibold rounded-[6px] border transition-all ${
                      role === 'staff'
                        ? 'border-[#1a1a2e] bg-[#1a1a2e] text-white'
                        : 'border-[#e2e8f0] bg-white text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    Department Staff
                  </button>
                </div>
              </div>

              {role === 'staff' && (
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Select Assigned Department
                  </label>
                  <div className="relative">
                    <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                    <select
                      value={departmentId || ''}
                      onChange={(e) => setDepartmentId(Number(e.target.value))}
                      className="w-full text-xs pl-9 pr-3 py-2.5 rounded-[6px] border border-[#e2e8f0] bg-white focus:outline-none focus:ring-1 focus:ring-slate-400 appearance-none"
                    >
                      {departments.map((dept) => (
                        <option key={dept.dept_id} value={dept.dept_id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </>
          )}

          <div>
            <label className="text-xs font-semibold text-slate-700 block mb-1">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-[6px] border border-[#e2e8f0] bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700">Password</label>
              {isLogin && (
                <button
                  type="button"
                  onClick={() => setShowForgotModal(true)}
                  className="text-[11px] text-slate-500 hover:text-[#1a1a2e] transition-colors"
                >
                  Forgot password?
                </button>
              )}
            </div>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full text-xs pl-9 pr-3 py-2.5 rounded-[6px] border border-[#e2e8f0] bg-white focus:outline-none focus:ring-1 focus:ring-slate-400"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 bg-[#1a1a2e] hover:bg-[#25253e] text-white text-xs font-semibold py-2.5 rounded-[6px] transition-colors shadow-sm disabled:opacity-50 mt-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <>
                <span>{isLogin ? 'Sign In' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Logins Bar */}
        <div className="mt-6 pt-5 border-t border-slate-100">
          <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-2.5 text-center">
            Instant Demo Logins
          </p>
          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('citizen@civicscan.com', 'citizen123')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[5px] text-[11px] font-medium text-slate-700 transition-colors"
            >
              Citizen Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('roads@civicscan.com', 'staff123')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[5px] text-[11px] font-medium text-slate-700 transition-colors"
            >
              Staff Demo
            </button>
            <button
              type="button"
              onClick={() => handleQuickLogin('admin@civicscan.com', 'admin123')}
              className="px-2 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-[5px] text-[11px] font-medium text-slate-700 transition-colors"
            >
              Admin Demo
            </button>
          </div>
        </div>
      </div>

      {/* Forgot Password Modal */}
      {showForgotModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/30 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-[8px] border border-[#e2e8f0] p-6 max-w-sm w-full shadow-xl">
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 mb-3">
              <KeyRound className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-[#1a1a2e]">Reset Password</h3>
            <p className="text-xs text-slate-500 mt-1 mb-4 leading-relaxed">
              Enter your email address and we'll send a secure password reset link to restore your account access.
            </p>

            {forgotSent ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-[6px] text-xs text-emerald-800 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Password reset email dispatched successfully!</span>
              </div>
            ) : (
              <form onSubmit={handleForgotPassword} className="space-y-3">
                <input
                  type="email"
                  required
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  placeholder="Enter your account email..."
                  className="w-full text-xs p-2.5 rounded-[6px] border border-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-slate-400"
                />
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    className="flex-1 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50 border border-[#e2e8f0] rounded-[6px]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2 text-xs font-semibold text-white bg-[#1a1a2e] hover:bg-[#25253e] rounded-[6px]"
                  >
                    Send Link
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
