import React from 'react'
import { useAuthStore } from '../stores'
import { useBadgesStore, BADGES } from '../stores/badges'
import { Link } from 'react-router-dom'

export default function BadgesPage() {
  const { user } = useAuthStore()
  const { getEarned, getStats } = useBadgesStore()
  const earned = user ? getEarned(user.id) : []
  const stats  = user ? getStats(user.id) : {}

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <div className="text-5xl mb-3">🏅</div>
          <h1 className="font-display text-3xl font-black text-mist-100 mb-2">الإنجازات</h1>
          <p className="text-mist-400 text-sm">
            {earned.length} / {BADGES.length} شارة مكتسبة
          </p>
          {user && (
            <div className="mt-3 w-48 mx-auto progress-bar">
              <div className="progress-bar-fill" style={{ width: `${(earned.length / BADGES.length) * 100}%` }} />
            </div>
          )}
        </div>

        {!user ? (
          <div className="text-center py-12">
            <p className="text-mist-400 mb-4">سجل دخولك لتتبع إنجازاتك</p>
            <Link to="/auth" className="btn-gold px-8 py-3 rounded-xl">دخول</Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {BADGES.map(badge => {
              const isEarned = earned.includes(badge.id)
              return (
                <div
                  key={badge.id}
                  className={`card-dark p-5 flex items-center gap-4 transition-all ${
                    isEarned ? 'border-gold-500/30 bg-gold-500/5' : 'opacity-50'
                  }`}
                >
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center text-3xl flex-shrink-0 ${
                    isEarned ? 'bg-gold-500/20 animate-pulse-glow' : 'bg-ink-700'
                  }`}>
                    {isEarned ? badge.emoji : '🔒'}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className={`font-bold text-sm ${isEarned ? 'text-gold-400' : 'text-mist-500'}`}>
                      {badge.name}
                    </p>
                    <p className="text-xs text-mist-500 mt-0.5">{badge.desc}</p>
                    {isEarned && (
                      <span className="text-xs text-green-400 mt-1 block">✅ مكتسبة</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
