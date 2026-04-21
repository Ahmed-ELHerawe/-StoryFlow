import React, { useState } from 'react'
import { RPG_STATS } from '../stores/rpg'

export function RPGStatBar({ stat, value, delta = 0 }) {
  const info = RPG_STATS.find(s => s.id === stat)
  if (!info) return null
  const pct = Math.round((value / info.max) * 100)

  return (
    <div className="flex items-center gap-2">
      <span className="text-base w-6 text-center">{info.emoji}</span>
      <div className="flex-1">
        <div className="flex justify-between text-xs mb-0.5">
          <span className={`font-medium ${info.color}`}>{info.label}</span>
          <span className="text-mist-400 tabular-nums">{value}/{info.max}</span>
        </div>
        <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${pct}%`, background: 'currentColor' }}
          />
        </div>
      </div>
      {delta !== 0 && (
        <span className={`text-xs font-bold tabular-nums ${delta > 0 ? 'text-green-400' : 'text-red-400'}`}>
          {delta > 0 ? '+' : ''}{delta}
        </span>
      )}
    </div>
  )
}

export function RPGStatsPanel({ stats, deltas = {}, compact = false }) {
  const [expanded, setExpanded] = useState(!compact)

  if (compact) return (
    <button
      onClick={() => setExpanded(!expanded)}
      className="w-full card-dark p-3 text-right"
    >
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-mist-500 font-medium">📊 إحصائيات الشخصية</span>
        <span className="text-mist-600 text-xs">{expanded ? '▲' : '▼'}</span>
      </div>
      {expanded && (
        <div className="space-y-2 pt-1">
          {RPG_STATS.map(s => (
            <RPGStatBar key={s.id} stat={s.id} value={stats[s.id] || 0} delta={deltas[s.id] || 0} />
          ))}
        </div>
      )}
    </button>
  )

  return (
    <div className="card-dark p-4 space-y-2.5">
      <p className="text-xs text-mist-500 font-medium mb-3">📊 إحصائيات الشخصية</p>
      {RPG_STATS.map(s => (
        <RPGStatBar key={s.id} stat={s.id} value={stats[s.id] || 0} delta={deltas[s.id] || 0} />
      ))}
    </div>
  )
}

export function StatEffectBadge({ effects }) {
  if (!effects || !Object.keys(effects).length) return null
  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {Object.entries(effects).map(([stat, delta]) => {
        const info = RPG_STATS.find(s => s.id === stat)
        if (!info) return null
        return (
          <span key={stat} className={`text-xs px-1.5 py-0.5 rounded-md font-medium ${
            delta > 0 ? 'bg-green-500/15 text-green-400' : 'bg-red-500/15 text-red-400'
          }`}>
            {info.emoji} {delta > 0 ? '+' : ''}{delta}
          </span>
        )
      })}
    </div>
  )
}
