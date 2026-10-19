import { getToken } from './auth'

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'

export interface DetectionItem {
  issue_type: string
  confidence: number
  severity: 'High' | 'Medium' | 'Low'
  bbox: number[]
  department: string
  cost_min: number
  cost_max: number
}

export interface DetectResponse {
  detections: DetectionItem[]
  result_image: string
  location: {
    latitude: number
    longitude: number
    city: string
    maps_link: string
  }
  duplicate_warning?: string | null
  duplicate_count: number
  duplicate_of?: string | null
  estimated_cost_range: string
  top_issue: string
  top_severity: 'High' | 'Medium' | 'Low'
  top_department: string
  urgency_score: number
}

export interface StatusHistory {
  history_id: number
  old_status?: string | null
  new_status: string
  changed_by: string
  notes?: string | null
  changed_at: string
}

export interface Report {
  report_id: string
  user_id?: number | null
  image_url: string
  result_image_url?: string | null
  result_image_b64?: string | null
  issue_type: string
  confidence: number
  severity: 'High' | 'Medium' | 'Low'
  latitude: number
  longitude: number
  location_name?: string | null
  status: 'pending' | 'in_progress' | 'resolved' | 'rejected'
  department_id?: number | null
  department_name?: string | null
  urgency_score: number
  duplicate_of?: string | null
  duplicate_count: number
  cost_estimate_min: number
  cost_estimate_max: number
  description?: string | null
  staff_notes?: string | null
  created_at: string
  updated_at: string
  resolved_at?: string | null
  status_history?: StatusHistory[]
  user_name?: string | null
  user_email?: string | null
  duplicate_reports?: Report[]
}

export interface Department {
  dept_id: number
  name: string
  issue_types: string[]
  head_name: string
  contact_email: string
}

export interface OverviewStats {
  total_reports: number
  resolved_reports: number
  pending_reports: number
  in_progress_reports: number
  cities_covered: number
  resolution_rate: number
  avg_resolution_time_hours: number
  active_departments: number
}

export interface AnalyticsStats {
  reports_by_type: { name: string; issue_type: string; count: number; color: string }[]
  reports_over_time: { date: string; reports: number }[]
  dept_resolution_rates: { department: string; total: number; resolved: number; rate: number }[]
  top_locations: { location: string; reports_count: number; latitude: number; longitude: number }[]
}

export interface NotificationItem {
  notif_id: number
  report_id?: string | null
  message: string
  type: string
  is_read: boolean
  created_at: string
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken()
  const headers = new Headers(options.headers || {})

  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`)
  }

  // Include credentials for httpOnly cookies
  const config: RequestInit = {
    ...options,
    headers,
    credentials: 'include',
  }

  const url = `${API_BASE_URL}${endpoint}`
  const response = await fetch(url, config)

  if (!response.ok) {
    let errorMessage = `Request failed: ${response.statusText}`
    try {
      const errorData = await response.json()
      errorMessage = errorData.detail || errorData.message || errorMessage
    } catch {
      // ignore
    }
    throw new Error(errorMessage)
  }

  return response.json()
}

// Auth API
export const api = {
  // Auth
  async signup(data: any) {
    return request<any>('/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },

  async login(data: any) {
    return request<any>('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    })
  },

  async logout() {
    return request<any>('/auth/logout', { method: 'POST' })
  },

  async getMe() {
    return request<any>('/auth/me')
  },

  async getNotifications(): Promise<NotificationItem[]> {
    return request<NotificationItem[]>('/auth/notifications')
  },

  async markNotificationRead(notifId: number) {
    return request<any>(`/auth/notifications/${notifId}/read`, { method: 'PATCH' })
  },

  // Reports
  async detect(file: Blob | File, lat = 30.3398, lng = 76.3869): Promise<DetectResponse> {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('latitude', lat.toString())
    formData.append('longitude', lng.toString())

    return request<DetectResponse>('/reports/detect', {
      method: 'POST',
      body: formData,
    })
  },

  async submitReport(formData: FormData): Promise<Report> {
    return request<Report>('/reports/submit', {
      method: 'POST',
      body: formData,
    })
  },

  async getReports(params: {
    status?: string
    issue_type?: string
    department_id?: number
    mine_only?: boolean
  } = {}): Promise<Report[]> {
    const query = new URLSearchParams()
    if (params.status && params.status !== 'All') query.append('status', params.status)
    if (params.issue_type && params.issue_type !== 'All') query.append('issue_type', params.issue_type)
    if (params.department_id) query.append('department_id', params.department_id.toString())
    if (params.mine_only) query.append('mine_only', 'true')

    const qs = query.toString()
    return request<Report[]>(`/reports${qs ? `?${qs}` : ''}`)
  },

  async getReport(reportId: string): Promise<Report> {
    return request<Report>(`/reports/${encodeURIComponent(reportId)}`)
  },

  async updateReportStatus(reportId: string, status: string, notes?: string): Promise<Report> {
    return request<Report>(`/reports/${encodeURIComponent(reportId)}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status, notes }),
    })
  },

  async getMapReports(params: { status?: string; department_id?: number } = {}): Promise<any[]> {
    const query = new URLSearchParams()
    if (params.status && params.status !== 'All') query.append('status', params.status)
    if (params.department_id) query.append('department_id', params.department_id.toString())
    const qs = query.toString()
    return request<any[]>(`/reports/map${qs ? `?${qs}` : ''}`)
  },

  // Departments
  async getDepartments(): Promise<Department[]> {
    return request<Department[]>('/departments')
  },

  // Stats
  async getOverviewStats(): Promise<OverviewStats> {
    return request<OverviewStats>('/stats/overview')
  },

  async getAnalyticsStats(): Promise<AnalyticsStats> {
    return request<AnalyticsStats>('/stats/analytics')
  },
}
