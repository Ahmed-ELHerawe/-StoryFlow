import React, { useEffect, useRef, useState } from 'react'

export default function CountdownTimer({ seconds = 15, onExpire, paused = false }) {
  const [remaining, setRemaining] = useState(seconds)
  const intervalRef = useRef(null)

  useEffect(() => {
    setRemaining(seconds)
  }, [seconds])

  useEffect(() => {
    if (paused) {
      clearInterval(intervalRef.current)
      return
    }
    intervalRef.current = setInterval(() => {
      setRemaining(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current)
          onExpire?.()
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => clearInterval(intervalRef.current)
  }, [paused, onExpire])

  const pct = (remaining / seconds) * 100
  const isUrgent = remaining <= 5
  const isCritical = remaining <= 3

  return (
    <div className="flex items-center gap-3">
      {/* Circular countdown */}
      <div className="relative w-12 h-12 flex-shrink-0">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor"
            className="text-ink-700" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none"
            stroke={isCritical ? '#E24B4A' : isUrgent ? '#EF9F27' : '#f5c842'}
            strokeWidth="3"
            strokeDasharray="100"
            strokeDashoffset={100 - pct}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>
        <span className={`absolute inset-0 flex items-center justify-center text-sm font-bold tabular-nums ${
          isCritical ? 'text-red-400' : isUrgent ? 'text-amber-400' : 'text-gold-400'
        }`}>
          {remaining}
        </span>
      </div>

      {/* Bar */}
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-1">
          <span className={isUrgent ? 'text-amber-400' : 'text-mist-500'}>
            {isCritical ? '⚠️ اختر الآن!' : isUrgent ? 'الوقت ينتهي!' : 'اختر قبل انتهاء الوقت'}
          </span>
          <span className="text-mist-500 tabular-nums">{remaining}s</span>
        </div>
        <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-1000 linear"
            style={{
              width: `${pct}%`,
              background: isCritical ? '#E24B4A' : isUrgent ? '#EF9F27' : '#f5c842',
            }}
          />
        </div>
      </div>
    </div>
  )
}
