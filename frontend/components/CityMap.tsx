'use client'

import React, { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

export interface MapReportPin {
  report_id: string
  issue_type: string
  severity: 'High' | 'Medium' | 'Low'
  status: string
  latitude: number
  longitude: number
  location_name?: string
  image_url?: string
  urgency_score?: number
}

interface CityMapProps {
  reports?: MapReportPin[]
  center?: [number, number]
  zoom?: number
  height?: string
  onSelectReport?: (reportId: string) => void
  singlePin?: boolean
  pinLat?: number
  pinLng?: number
  draggablePin?: boolean
  onPinChange?: (lat: number, lng: number) => void
  darkTheme?: boolean
}

// Dynamically import Leaflet components to avoid SSR error
const DynamicMap = dynamic(
  async () => {
    const L = await import('leaflet')
    const { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } = await import('react-leaflet')

    // Fix default leaflet icons
    delete (L.Icon.Default.prototype as any)._getIconUrl
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    })

    const createCustomIcon = (severity: string, dark = false) => {
      const color =
        severity === 'High' ? '#e94560' : severity === 'Medium' ? '#f59e0b' : '#0f9b58'
      const svg = `
        <svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 0C6.268 0 0 6.268 0 14C0 24.5 14 36 14 36C14 36 28 24.5 28 14C28 6.268 21.732 0 14 0Z" fill="${color}"/>
          <circle cx="14" cy="14" r="6" fill="white"/>
        </svg>
      `
      return L.divIcon({
        className: 'custom-marker-icon',
        html: svg,
        iconSize: [28, 36],
        iconAnchor: [14, 36],
        popupAnchor: [0, -32],
      })
    }

    function DraggableMarker({
      position,
      onDragEnd,
    }: {
      position: [number, number]
      onDragEnd?: (lat: number, lng: number) => void
    }) {
      const map = useMapEvents({
        click(e) {
          if (onDragEnd) {
            onDragEnd(e.latlng.lat, e.latlng.lng)
          }
        },
      })

      return (
        <Marker
          position={position}
          draggable={true}
          eventHandlers={{
            dragend(e) {
              const marker = e.target
              const latlng = marker.getLatLng()
              if (onDragEnd) {
                onDragEnd(latlng.lat, latlng.lng)
              }
            },
          }}
          icon={createCustomIcon('High')}
        >
          <Popup>
            <div className="text-xs font-medium">Selected Location ({position[0].toFixed(4)}, {position[1].toFixed(4)})</div>
          </Popup>
        </Marker>
      )
    }

    return function LeafletMapWrapper({
      reports = [],
      center = [30.3398, 76.3869],
      zoom = 13,
      height = '400px',
      onSelectReport,
      singlePin = false,
      pinLat,
      pinLng,
      draggablePin = false,
      onPinChange,
      darkTheme = false,
    }: CityMapProps) {
      const effectiveCenter: [number, number] =
        singlePin && pinLat && pinLng ? [pinLat, pinLng] : center

      const tileUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
      const tileClassName = darkTheme ? 'map-tiles-dark' : ''

      return (
        <div style={{ height, width: '100%' }} className="relative overflow-hidden rounded-[8px] border border-[#e2e8f0]">
          <MapContainer
            center={effectiveCenter}
            zoom={zoom}
            scrollWheelZoom={true}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url={tileUrl}
              className={tileClassName}
            />

            {singlePin && pinLat && pinLng && (
              draggablePin ? (
                <DraggableMarker position={[pinLat, pinLng]} onDragEnd={onPinChange} />
              ) : (
                <Marker position={[pinLat, pinLng]} icon={createCustomIcon('High', darkTheme)}>
                  <Popup>
                    <div className="text-xs font-medium text-slate-800">
                      Report Location: {pinLat.toFixed(4)}, {pinLng.toFixed(4)}
                    </div>
                  </Popup>
                </Marker>
              )
            )}

            {!singlePin &&
              reports.map((r) => {
                const lat = r.latitude
                const lng = r.longitude
                if (!lat || !lng) return null

                return (
                  <Marker
                    key={r.report_id}
                    position={[lat, lng]}
                    icon={createCustomIcon(r.severity, darkTheme)}
                  >
                    <Popup>
                      <div className="p-1 min-w-[180px] max-w-[220px]">
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span className="text-[10px] font-bold text-slate-400">
                            #{r.report_id}
                          </span>
                          <span
                            className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                              r.severity === 'High'
                                ? 'bg-rose-100 text-[#e94560]'
                                : r.severity === 'Medium'
                                ? 'bg-amber-100 text-[#f59e0b]'
                                : 'bg-emerald-100 text-[#0f9b58]'
                            }`}
                          >
                            {r.severity}
                          </span>
                        </div>
                        <h4 className="font-semibold text-xs text-slate-900 capitalize mb-1">
                          {r.issue_type.replace(/_/g, ' ')}
                        </h4>
                        <p className="text-[11px] text-slate-500 mb-2 truncate">
                          📍 {r.location_name || `${lat.toFixed(4)}, ${lng.toFixed(4)}`}
                        </p>
                        <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                          <span className="text-[9px] uppercase tracking-wider font-semibold text-slate-600">
                            {r.status.replace(/_/g, ' ')}
                          </span>
                          {onSelectReport && (
                            <button
                              onClick={() => onSelectReport(r.report_id)}
                              className="text-[10px] bg-[#1a1a2e] text-white px-2 py-1 rounded-[4px] font-medium hover:bg-slate-800 transition-colors"
                            >
                              View Details
                            </button>
                          )}
                        </div>
                      </div>
                    </Popup>
                  </Marker>
                )
              })}
          </MapContainer>
        </div>
      )
    }
  },
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-[400px] bg-slate-100 flex items-center justify-center text-xs text-slate-400 rounded-[8px] border border-[#e2e8f0]">
        Loading interactive map...
      </div>
    ),
  }
)

export default function CityMap(props: CityMapProps) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div
        style={{ height: props.height || '400px' }}
        className="w-full bg-slate-100 flex items-center justify-center text-xs text-slate-400 rounded-[8px] border border-[#e2e8f0]"
      >
        Initializing Map...
      </div>
    )
  }

  return <DynamicMap {...props} />
}
