'use client'

import React, { useState } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  ArrowRight,
  ExternalLink,
  ShieldCheck,
  CheckCircle,
  Clock,
  Sparkles,
  MapPin,
  Tag
} from 'lucide-react'
import { DetectResponse } from '../lib/api'

interface DetectionResultProps {
  detectionData: DetectResponse
  uploadedImagePreview: string
  description: string
  onDescriptionChange: (desc: string) => void
  onRetake: () => void
  onSubmit: () => void
  submitting: boolean
}

export default function DetectionResult({
  detectionData,
  uploadedImagePreview,
  description,
  onDescriptionChange,
  onRetake,
  onSubmit,
  submitting,
}: DetectionResultProps) {
  const topIssue = detectionData.top_issue
  const topSeverity = detectionData.top_severity
  const topDet = detectionData.detections[0]
  const confidence = topDet ? Math.round(topDet.confidence * 100) : 85
  const isLowConfidence = topDet ? topDet.confidence < 0.3 : false

  const severityColor = {
    High: 'bg-rose-50 text-[#e94560] border-rose-200',
    Medium: 'bg-amber-50 text-[#f59e0b] border-amber-200',
    Low: 'bg-emerald-50 text-[#0f9b58] border-emerald-200',
  }[topSeverity] || 'bg-slate-50 text-slate-700 border-slate-200'

  return (
    <div className="w-full max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6 bg-white p-6 rounded-[8px] border border-[#e2e8f0] shadow-sm">
      {/* Left: Detected Image with YOLO Bounding Box */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600 uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-cyan-500" />
            AI Detection Scan
          </span>
          <span className="text-[11px] text-slate-400">YOLOv8 Cyan Bounding Box</span>
        </div>

        <div className="relative rounded-[8px] overflow-hidden bg-slate-900 border border-slate-200 aspect-[4/3] flex items-center justify-center">
          <img
            src={
              detectionData.result_image
                ? `data:image/jpeg;base64,${detectionData.result_image}`
                : uploadedImagePreview
            }
            alt="AI Detection Output"
            className="w-full h-full object-contain"
          />

          <div className="absolute bottom-3 left-3 bg-[#1a1a2e]/90 text-white text-[11px] font-medium px-2.5 py-1 rounded backdrop-blur-xs flex items-center gap-1.5 border border-white/10">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span>Live YOLOv8 Object Classification</span>
          </div>
        </div>

        {/* Low confidence alert */}
        {isLowConfidence && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-[6px] text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              Could not detect issue clearly (confidence &lt; 30%) — please consider retaking the photo in better lighting for faster municipal action.
            </span>
          </div>
        )}

        {/* Duplicate warning */}
        {detectionData.duplicate_warning && (
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-[6px] text-xs text-amber-800 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>{detectionData.duplicate_warning}</span>
          </div>
        )}
      </div>

      {/* Right: Results Card */}
      <div className="flex flex-col justify-between space-y-5">
        <div className="space-y-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="bg-[#1a1a2e] text-white text-xs font-bold px-2.5 py-1 rounded tracking-wider uppercase">
                {topIssue.replace(/_/g, ' ')}
              </span>
              <span className={`text-xs font-bold px-2 py-0.5 rounded border ${severityColor}`}>
                {topSeverity} Severity
              </span>
              <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {confidence}% confident
              </span>
            </div>

            <h3 className="text-lg font-bold text-[#1a1a2e] tracking-tight capitalize">
              Detected {topIssue.replace(/_/g, ' ')}
            </h3>
          </div>

          {/* Details breakdown */}
          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Estimated Repair Cost</span>
              <span className="font-bold text-[#1a1a2e]">
                {detectionData.estimated_cost_range}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Department Routing</span>
              <span className="font-semibold text-slate-800 truncate max-w-[200px]">
                {detectionData.top_department}
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-slate-50 border border-slate-200">
              <span className="text-slate-500">Urgency Assessment</span>
              <span className="font-bold text-[#1a1a2e]">
                {detectionData.urgency_score} / 100
              </span>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-[6px] bg-slate-50 border border-slate-200">
              <span className="text-slate-500 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                <span>GPS Location</span>
              </span>
              <a
                href={detectionData.location.maps_link}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:underline flex items-center gap-1 font-medium"
              >
                <span>
                  {detectionData.location.latitude.toFixed(4)}° N, {detectionData.location.longitude.toFixed(4)}° E
                </span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Additional Notes Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-700 block">
              Additional Details <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={description}
              onChange={(e) => onDescriptionChange(e.target.value)}
              placeholder="e.g. Near the main intersection, water depth is about 6 inches, posing risk to school traffic..."
              className="w-full text-xs p-3 rounded-[6px] border border-[#e2e8f0] focus:outline-none focus:ring-1 focus:ring-slate-400 resize-none h-20"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t border-[#e2e8f0] gap-3">
          <button
            type="button"
            onClick={onRetake}
            disabled={submitting}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 px-4 py-2.5 rounded-[6px] border border-[#e2e8f0] hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Retake Photo</span>
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={submitting}
            className="flex-1 flex items-center justify-center gap-2 bg-[#1a1a2e] hover:bg-[#25253e] text-white text-xs font-semibold px-5 py-2.5 rounded-[6px] transition-colors shadow-sm disabled:opacity-50"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Submitting to Department...</span>
              </>
            ) : (
              <>
                <span>Submit Report</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
