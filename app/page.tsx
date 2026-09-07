'use client'

import { useMemo, useState } from 'react'
import {
  AlertTriangle,
  ArrowRight,
  BarChart3,
  Camera,
  Check,
  CheckCircle2,
  ChevronDown,
  CircleDot,
  Clock3,
  CloudRain,
  FileImage,
  Filter,
  Gauge,
  GripVertical,
  Leaf,
  MapPin,
  Menu,
  MoreHorizontal,
  Navigation,
  Plus,
  Search,
  ShieldCheck,
  Upload,
  UserRound,
  Users,
  X,
  Zap,
} from 'lucide-react'

type View = 'citizen' | 'staff' | 'admin'
type Status = 'pending' | 'progress' | 'resolved'
type Severity = 'High' | 'Medium' | 'Low'
type IssueType = 'Road Damage' | 'Garbage' | 'Waterlogging'

type Report = {
  id: string
  issue: IssueType
  location: string
  city: string
  reported: string
  severity: Severity
  confidence: number
  gps: string
  urgency: number
  duplicates: number
  cost: string
  status: Status
  color: string
}

const reports: Report[] = [
  { id: 'CS-1048', issue: 'Road Damage', location: 'Rajpura Road', city: 'Patiala, Punjab', reported: '12 min ago', severity: 'High', confidence: 96, gps: '30.3398° N, 76.3869° E', urgency: 94, duplicates: 7, cost: '₹18,500', status: 'pending', color: '#e94560' },
  { id: 'CS-1047', issue: 'Garbage', location: 'Model Town', city: 'Ludhiana, Punjab', reported: '28 min ago', severity: 'Medium', confidence: 91, gps: '30.9000° N, 75.8573° E', urgency: 62, duplicates: 3, cost: '₹4,200', status: 'progress', color: '#d99a22' },
  { id: 'CS-1046', issue: 'Waterlogging', location: 'Sector 17 Market', city: 'Chandigarh', reported: '1 hr ago', severity: 'High', confidence: 88, gps: '30.7415° N, 76.7681° E', urgency: 86, duplicates: 12, cost: '₹32,000', status: 'pending', color: '#e94560' },
  { id: 'CS-1045', issue: 'Road Damage', location: 'Mall Road', city: 'Patiala, Punjab', reported: '2 hrs ago', severity: 'Low', confidence: 94, gps: '30.3314° N, 76.3997° E', urgency: 28, duplicates: 1, cost: '₹8,700', status: 'resolved', color: '#0f9b58' },
  { id: 'CS-1044', issue: 'Garbage', location: 'Dugri Road', city: 'Ludhiana, Punjab', reported: '3 hrs ago', severity: 'Medium', confidence: 89, gps: '30.8760° N, 75.8310° E', urgency: 57, duplicates: 5, cost: '₹5,800', status: 'progress', color: '#d99a22' },
  { id: 'CS-1043', issue: 'Waterlogging', location: 'Sector 22', city: 'Chandigarh', reported: '5 hrs ago', severity: 'Low', confidence: 93, gps: '30.7333° N, 76.7794° E', urgency: 34, duplicates: 2, cost: '₹11,200', status: 'resolved', color: '#0f9b58' },
]

const issueIcon = (issue: IssueType) => issue === 'Road Damage' ? <AlertTriangle size={14} /> : issue === 'Garbage' ? <Leaf size={14} /> : <CloudRain size={14} />
const severityClass = (severity: Severity) => severity === 'High' ? 'severity-high' : severity === 'Medium' ? 'severity-medium' : 'severity-low'

function MapCanvas({ admin = false }: { admin?: boolean }) {
  const pins = [{ left: '18%', top: '56%', color: '#e94560' }, { left: '43%', top: '33%', color: '#d99a22' }, { left: '64%', top: '62%', color: '#e94560' }, { left: '78%', top: '27%', color: '#0f9b58' }, { left: '53%', top: '78%', color: '#d99a22' }, { left: '30%', top: '19%', color: '#0f9b58' }]
  return <div className={`map-canvas ${admin ? 'map-admin' : ''}`}>
    <div className="map-grid" />
    <div className="map-road road-one" /><div className="map-road road-two" /><div className="map-road road-three" />
    <div className="map-label label-one">PATIALA</div><div className="map-label label-two">LUDHIANA</div><div className="map-label label-three">CHANDIGARH</div>
    {pins.map((pin, index) => <span key={index} className="map-pin" style={{ left: pin.left, top: pin.top, backgroundColor: pin.color }}><span /></span>)}
    {!admin && <div className="map-footer"><Navigation size={13} /> Live civic reports <span>•</span> Punjab region</div>}
  </div>
}

function TopNav({ view, setView }: { view: View; setView: (view: View) => void }) {
  return <header className="top-nav">
    <div className="brand"><span className="brand-mark"><ShieldCheck size={18} /></span><span>Civic<span>Scan</span></span><small>AI CIVIC INTELLIGENCE</small></div>
    <nav className="view-nav" aria-label="Application views">
      {(['citizen', 'staff', 'admin'] as View[]).map(item => <button key={item} className={view === item ? 'active' : ''} onClick={() => setView(item)}>{item === 'citizen' ? <UserRound size={15} /> : item === 'staff' ? <Users size={15} /> : <BarChart3 size={15} />}<span>{item[0].toUpperCase() + item.slice(1)}</span></button>)}
    </nav>
    <div className="top-actions"><span className="live-dot" /> System operational <button className="avatar">AS</button></div>
  </header>
}

function ReportCard({ report, onClick, onDragStart }: { report: Report; onClick: () => void; onDragStart: () => void }) {
  return <button className="report-card" onClick={onClick} draggable onDragStart={onDragStart} style={{ borderLeftColor: report.color }}>
    <div className="thumb"><FileImage size={17} /><span>{report.issue === 'Road Damage' ? 'ROAD' : report.issue === 'Garbage' ? 'WASTE' : 'RAIN'}</span></div>
    <div className="report-card-copy"><strong>{report.issue}</strong><span><MapPin size={11} /> {report.location}</span><small>{report.reported}</small></div><GripVertical size={15} className="drag" />
  </button>
}

function CitizenView() {
  const [uploaded, setUploaded] = useState(false)
  return <main className="citizen-layout">
    <section className="citizen-panel">
      <div className="eyebrow">REPORT AN ISSUE <span>01 / 04</span></div>
      <div className="steps"><span className="current"><b>1</b> Upload</span><i /><span><b>2</b> Detecting</span><i /><span><b>3</b> Review</span><i /><span><b>4</b> Submit</span></div>
      <div className="citizen-heading"><h1>Make your city<br /><em>better.</em></h1><p>Snap a photo of a civic issue. Our AI will identify it and route it to the right department.</p></div>
      {!uploaded ? <button className="dropzone" onClick={() => setUploaded(true)}><span className="upload-icon"><Upload size={21} /></span><strong>Drop photo here</strong><small>or click to browse from your device</small><span className="file-types">JPG, PNG up to 10 MB</span></button> : <div className="detected-photo"><div className="photo-sim"><span className="bbox"><b>Road damage</b></span><div className="road-stripe" /></div><button className="remove-photo" onClick={() => setUploaded(false)} aria-label="Remove photo"><X size={14} /></button><div className="photo-meta"><span className="issue-badge"><AlertTriangle size={13} /> Road Damage</span><strong>96% <small>confidence</small></strong><span className="severity-label"><i /> High severity</span></div></div>}
      <div className="location-chip"><span><MapPin size={14} /></span><div><small>LOCATION CAPTURED</small><strong>Patiala, Punjab</strong></div><CheckCircle2 size={17} /></div>
      <div className="submit-bar"><div><small>READY TO SUBMIT?</small><span>AI detection complete</span></div><button onClick={() => setUploaded(false)}>Submit Report <ArrowRight size={16} /></button></div>
    </section><section className="citizen-map"><div className="map-topline"><div><small>LIVE CIVIC MAP</small><h2>Patiala region</h2></div><button><Filter size={14} /> Filters <ChevronDown size={13} /></button></div><MapCanvas /></section>
  </main>
}

function StaffView() {
  const [selected, setSelected] = useState<Report | null>(null)
  const [items, setItems] = useState(reports)
  const [filter, setFilter] = useState<'All' | IssueType>('All')
  const [dragged, setDragged] = useState<Report | null>(null)
  const filtered = useMemo(() => filter === 'All' ? items : items.filter(item => item.issue === filter), [filter, items])
  const moveReport = (status: Status) => { if (!dragged) return; setItems(current => current.map(item => item.id === dragged.id ? { ...item, status } : item)); setDragged(null) }
  return <main className="staff-layout"><aside className="icon-rail"><button className="rail-logo"><ShieldCheck size={19} /></button><button className="rail-active"><Gauge size={18} /></button><button><FileImage size={18} /></button><button><MapPin size={18} /></button><span /><button><BarChart3 size={18} /></button><button><Menu size={18} /></button></aside><section className="staff-board"><div className="page-heading"><div><div className="eyebrow light">OPERATIONS CENTER</div><h1>Report queue</h1><p>Review, triage and resolve civic issues across your region.</p></div><button className="outline-button"><Plus size={15} /> New report</button></div><div className="filter-row"><div className="filter-pills">{(['All', 'Road Damage', 'Garbage', 'Waterlogging'] as const).map(item => <button key={item} className={filter === item ? 'selected' : ''} onClick={() => setFilter(item)}>{item === 'All' && <CircleDot size={12} />}{item}</button>)}</div><button className="sort-button"><Filter size={14} /> Sort by urgency <ChevronDown size={13} /></button></div><div className="kanban">{([['pending', 'Pending', 'Needs review'], ['progress', 'In Progress', 'Being handled'], ['resolved', 'Resolved', 'Closed reports']] as [Status, string, string][]).map(([status, title, sub]) => <div className="kanban-column" key={status} onDragOver={event => event.preventDefault()} onDrop={() => moveReport(status)}><div className="column-heading"><div><strong>{title}</strong><span>{sub}</span></div><b>{filtered.filter(item => item.status === status).length}</b></div><div className="card-stack">{filtered.filter(item => item.status === status).map(report => <ReportCard key={report.id} report={report} onClick={() => setSelected(report)} onDragStart={() => setDragged(report)} />)}<div className="drop-hint">Drop reports here</div></div></div>)}</div></section>{selected && <div className="drawer-backdrop" onClick={() => setSelected(null)}><aside className="detail-drawer" onClick={event => event.stopPropagation()}><div className="drawer-head"><div><small>REPORT {selected.id}</small><h2>{selected.issue}</h2></div><button onClick={() => setSelected(null)} aria-label="Close report"><X size={18} /></button></div><div className="drawer-photo"><div className="photo-sim"><span className="bbox"><b>{selected.issue}</b></span><div className="road-stripe" /></div></div><div className="drawer-status"><span className={severityClass(selected.severity)}>{selected.severity} severity</span><span><Clock3 size={13} /> {selected.reported}</span></div><div className="drawer-grid"><div><small>AI CONFIDENCE</small><strong>{selected.confidence}%</strong></div><div><small>URGENCY SCORE</small><strong>{selected.urgency}/100</strong></div><div><small>DUPLICATE REPORTS</small><strong>{selected.duplicates}</strong></div><div><small>EST. COST</small><strong>{selected.cost}</strong></div></div><div className="detail-list"><span><MapPin size={15} /> GPS coordinates <b>{selected.gps}</b></span><span><Navigation size={15} /> Assigned department <b>{selected.issue === 'Garbage' ? 'Sanitation' : selected.issue === 'Waterlogging' ? 'Water & Drainage' : 'Roads & Works'}</b></span></div><div className="drawer-actions"><button onClick={() => { setItems(current => current.map(item => item.id === selected.id ? { ...item, status: 'progress' } : item)); setSelected(null) }}>Mark In Progress</button><button className="resolve" onClick={() => { setItems(current => current.map(item => item.id === selected.id ? { ...item, status: 'resolved' } : item)); setSelected(null) }}><Check size={15} /> Resolve</button><button className="reject" onClick={() => setSelected(null)}>Reject report</button></div></aside></div>}</main>
}

function AdminView() {
  return <main className="admin-layout"><MapCanvas admin /><div className="admin-header"><div><div className="eyebrow">CITY COMMAND CENTER</div><h1>Regional overview</h1><p>Punjab civic infrastructure · Updated just now</p></div><div className="admin-tools"><div className="search-box"><Search size={15} /><input placeholder="Search reports..." /></div><button><Filter size={15} /> Filter</button><button className="admin-avatar">AS</button></div></div><section className="kpi-panel"><div><small>TOTAL REPORTS</small><strong>1,284</strong><span className="positive">+12.4% <em>this month</em></span></div><div><small>RESOLUTION RATE</small><strong>84.6%</strong><span className="positive">+3.2% <em>vs last month</em></span></div><div><small>AVG. RESOLUTION TIME</small><strong>18.4h</strong><span className="negative">−2.1h <em>improvement</em></span></div><div><small>ACTIVE DEPARTMENTS</small><strong>08</strong><span className="neutral">All systems live</span></div></section><section className="department-panel"><div className="floating-title"><div><small>DEPARTMENT PERFORMANCE</small><strong>Resolution by department</strong></div><MoreHorizontal size={18} /></div>{[['Roads & Works', 86, '#e94560'], ['Sanitation', 78, '#d99a22'], ['Water & Drainage', 91, '#55b8e8']].map(([name, value, color]) => <div className="progress-row" key={name as string}><div><span>{name}</span><b>{value}%</b></div><div className="progress-track"><i style={{ width: `${value}%`, backgroundColor: color as string }} /></div></div>)}</section><section className="chart-panel"><div className="floating-title"><div><small>REPORT VOLUME</small><strong>Daily reports</strong></div><button>Last 30 days <ChevronDown size={12} /></button></div><div className="chart"><svg viewBox="0 0 360 120" preserveAspectRatio="none"><path d="M0 94 C20 80, 31 85, 45 87 S70 67, 83 76 S106 32, 123 55 S150 69, 164 51 S189 72, 204 55 S224 24, 241 44 S264 34, 282 50 S299 12, 316 31 S341 43, 360 16" fill="none" stroke="#55b8e8" strokeWidth="2.5" /><path d="M0 94 C20 80, 31 85, 45 87 S70 67, 83 76 S106 32, 123 55 S150 69, 164 51 S189 72, 204 55 S224 24, 241 44 S264 34, 282 50 S299 12, 316 31 S341 43, 360 16 V120 H0 Z" fill="url(#fill)" opacity=".14" /><defs><linearGradient id="fill" x1="0" x2="0" y1="0" y2="1"><stop stopColor="#55b8e8" /><stop offset="1" stopColor="#55b8e8" stopOpacity="0" /></linearGradient></defs></svg><div className="chart-labels"><span>Aug 08</span><span>Aug 15</span><span>Aug 22</span><span>Aug 29</span><span>Sep 06</span></div></div></section><div className="admin-legend"><span><i style={{ background: '#e94560' }} /> High severity</span><span><i style={{ background: '#d99a22' }} /> Medium</span><span><i style={{ background: '#0f9b58' }} /> Low / resolved</span></div></main>
}

export default function Page() {
  const [view, setView] = useState<View>('citizen')
  return <div className="app-shell"><TopNav view={view} setView={setView} />{view === 'citizen' ? <CitizenView /> : view === 'staff' ? <StaffView /> : <AdminView />}</div>
}
