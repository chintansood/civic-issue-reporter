'use client'

import React from 'react'
import { Check } from 'lucide-react'

interface StepIndicatorProps {
  currentStep: number // 1 to 4
}

export default function StepIndicator({ currentStep }: StepIndicatorProps) {
  const steps = [
    { num: 1, label: 'Upload Photo' },
    { num: 2, label: 'AI Detection' },
    { num: 3, label: 'Review Results' },
    { num: 4, label: 'Success' },
  ]

  return (
    <div className="flex items-center justify-between w-full max-w-lg mx-auto py-4">
      {steps.map((step, idx) => {
        const isCompleted = step.num < currentStep
        const isCurrent = step.num === currentStep

        return (
          <React.Fragment key={step.num}>
            <div className="flex items-center gap-2">
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  isCompleted
                    ? 'bg-[#0f9b58] text-white'
                    : isCurrent
                    ? 'bg-[#1a1a2e] text-white ring-4 ring-slate-100'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {isCompleted ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : step.num}
              </div>
              <span
                className={`text-xs font-medium hidden sm:inline ${
                  isCurrent ? 'text-[#1a1a2e] font-semibold' : 'text-slate-500'
                }`}
              >
                {step.label}
              </span>
            </div>

            {idx < steps.length - 1 && (
              <div
                className={`flex-1 h-[2px] mx-3 transition-colors ${
                  step.num < currentStep ? 'bg-[#0f9b58]' : 'bg-slate-200'
                }`}
              />
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}
