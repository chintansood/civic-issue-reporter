'use client'

import React from 'react'
import { Check, Clock, AlertCircle } from 'lucide-react'
import { StatusHistory } from '../lib/api'

interface StatusTimelineProps {
  status: string
  histories?: StatusHistory[]
  createdAt?: string
}

export default function StatusTimeline({ status, histories = [], createdAt }: StatusTimelineProps) {
  const steps = [
    { key: 'submitted', label: 'Submitted', defaultText: 'Report uploaded by citizen' },
    { key: 'pending', label: 'Received & Queued', defaultText: 'Assigned to Municipal Department' },
    { key: 'in_progress', label: 'In Progress', defaultText: 'Field crew dispatched to site' },
    { key: 'resolved', label: 'Resolved', defaultText: 'Repairs or cleanup completed' },
  ]

  // Map backend status to index
  const statusToIndex: Record<string, number> = {
    pending: 1,
    in_progress: 2,
    resolved: 3,
    rejected: -1,
  }

  const currentIndex = statusToIndex[status.toLowerCase()] ?? 1

  return (
    <div className="py-2">
      <div className="relative border-l-2 border-slate-200 ml-3 space-y-6">
        {steps.map((step, idx) => {
          const isCompleted = idx <= currentIndex && status.toLowerCase() !== 'rejected'
          const isCurrent = idx === currentIndex && status.toLowerCase() !== 'rejected'

          // Find if there's a matching history event
          const matchingHist = histories.find(
            (h) =>
              (step.key === 'submitted' && h.old_status === null) ||
              h.new_status.toLowerCase() === step.key
          )

          return (
            <div key={step.key} className="relative pl-6">
              {/* Circle indicator */}
              <div
                className={`absolute -left-[9px] top-0.5 w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${
                  isCompleted
                    ? 'bg-[#0f9b58] text-white ring-4 ring-emerald-50'
                    : isCurrent
                    ? 'bg-[#f59e0b] text-white ring-4 ring-amber-50'
                    : 'bg-slate-200 text-slate-400'
                }`}
              >
                {isCompleted ? (
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                ) : (
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                )}
              </div>

              {/* Text content */}
              <div>
                <div className="flex items-center gap-2">
                  <h5
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-[#1a1a2e]'
                        : isCompleted
                        ? 'text-slate-800'
                        : 'text-slate-400'
                    }`}
                  >
                    {step.label}
                  </h5>
                  {isCurrent && (
                    <span className="text-[9px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-1.5 py-0.2 rounded">
                      Current
                    </span>
                  )}
                </div>

                <p className="text-[11px] text-slate-500 mt-0.5">
                  {matchingHist?.notes || step.defaultText}
                </p>

                {matchingHist && (
                  <div className="flex items-center gap-2 mt-1 text-[10px] text-slate-400">
                    <span>by {matchingHist.changed_by}</span>
                    <span>•</span>
                    <span>
                      {new Date(matchingHist.changed_at).toLocaleString([], {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )
        })}

        {status.toLowerCase() === 'rejected' && (
          <div className="relative pl-6">
            <div className="absolute -left-[9px] top-0.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center ring-4 ring-rose-50">
              <AlertCircle className="w-2.5 h-2.5" />
            </div>
            <div>
              <h5 className="text-xs font-semibold text-rose-700">Rejected</h5>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Issue deemed outside department jurisdiction or non-actionable.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
