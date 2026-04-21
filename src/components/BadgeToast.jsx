import React, { useEffect } from 'react'
import { useBadgesStore } from '../stores/badges'

export default function BadgeToast() {
  const { newBadge, clearNewBadge } = useBadgesStore()

  if (!newBadge) return null

  return (
    <div
      className="fixed top-20 left-1/2 -translate-x-1/2 z-50 animate-fade-up"
      style={{ animation: 'choiceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) forwards' }}
    >
      <div className="flex items-center gap-4 px-6 py-4 rounded-2xl bg-ink-800 border border-gold-500/50 shadow-2xl glow-gold">
        <div className="w-14 h-14 rounded-full bg-gold-500/20 flex items-center justify-center text-3xl animate-pulse-glow">
          {newBadge.emoji}
        </div>
        <div>
          <p className="text-xs text-gold-400 font-medium mb-0.5">شارة جديدة 🎉</p>
          <p className="text-base font-bold text-mist-100">{newBadge.name}</p>
          <p className="text-xs text-mist-400">{newBadge.desc}</p>
        </div>
        <button onClick={clearNewBadge} className="text-mist-500 hover:text-mist-300 mr-2 text-lg">✕</button>
      </div>
    </div>
  )
}
