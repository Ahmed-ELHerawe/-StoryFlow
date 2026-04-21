import React from 'react'
import { useLeaderStore, useAuthStore } from '../stores'
import { useStoriesStore } from '../stores'

const RANK_STYLE = {
  0: { emoji: '🥇', color: 'text-gold-400', bg: 'bg-gold-500/10 border-gold-500/30' },
  1: { emoji: '🥈', color: 'text-mist-300', bg: 'bg-mist-300/10 border-mist-300/30' },
  2: { emoji: '🥉', color: 'text-amber-600', bg: 'bg-amber-600/10 border-amber-600/30' },
}

export default function Leaderboard() {
  const { getRanked } = useLeaderStore()
  const { user } = useAuthStore()
  const { getAllStories } = useStoriesStore()
  const ranked = getRanked()
  const stories = getAllStories()

  if (ranked.length === 0) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🏆</div>
          <h2 className="font-display text-2xl font-bold text-mist-200 mb-2">لا يوجد ترتيب بعد</h2>
          <p className="text-mist-500">كن أول من يكمل قصة!</p>
        </div>
      </div>
    )
  }

  const myRank = user ? ranked.findIndex(r => r.uid === user.id) : -1

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="text-6xl mb-4">🏆</div>
          <h1 className="font-display text-4xl font-black text-mist-100 mb-2">الترتيب</h1>
          <p className="text-mist-400">أبطال القصص التفاعلية</p>
        </div>

        {/* My rank highlight */}
        {user && myRank >= 0 && (
          <div className="mb-6 p-4 rounded-xl bg-gold-500/10 border border-gold-500/30 text-center">
            <p className="text-sm text-gold-400">
              مرتبتك <span className="font-bold text-lg">#{myRank + 1}</span> — {ranked[myRank].totalPoints.toLocaleString()} نقطة
            </p>
          </div>
        )}

        {/* Top 3 */}
        {ranked.length >= 3 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            {[ranked[1], ranked[0], ranked[2]].map((r, i) => {
              const realRank = i === 0 ? 1 : i === 1 ? 0 : 2
              const style = RANK_STYLE[realRank]
              const isMe = user && r.uid === user.id
              return (
                <div key={r.uid} className={`stat-card border ${style.bg} ${realRank === 0 ? 'scale-105' : ''} ${isMe ? 'ring-1 ring-gold-500/50' : ''}`}>
                  <div className="text-3xl mb-1">{style.emoji}</div>
                  <div className="text-lg">{r.avatar || '🧑'}</div>
                  <div className={`text-sm font-bold ${style.color} truncate mt-1`}>{r.username}</div>
                  <div className="text-xs text-mist-500 mt-0.5">{r.totalPoints.toLocaleString()} نقطة</div>
                  <div className="text-xs text-mist-600">{r.storiesCompleted} قصة</div>
                </div>
              )
            })}
          </div>
        )}

        {/* Full List */}
        <div className="space-y-2">
          {ranked.map((r, i) => {
            const isMe = user && r.uid === user.id
            const style = RANK_STYLE[i] || {}
            return (
              <div key={r.uid} className={`leaderboard-row ${isMe ? 'border-gold-500/40 bg-gold-500/5' : ''}`}>
                {/* Rank */}
                <div className={`w-8 text-center font-black text-sm ${style.color || 'text-mist-500'}`}>
                  {i < 3 ? style.emoji : `#${i + 1}`}
                </div>

                {/* Avatar & Name */}
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-9 h-9 rounded-full flex items-center justify-center text-lg ${isMe ? 'bg-gold-500/20' : 'bg-ink-700'}`}>
                    {r.avatar || '🧑'}
                  </div>
                  <div className="min-w-0">
                    <p className={`text-sm font-medium truncate ${isMe ? 'text-gold-400' : 'text-mist-200'}`}>
                      {r.username} {isMe && <span className="text-xs text-gold-500/70">(أنت)</span>}
                    </p>
                    <p className="text-xs text-mist-500">{r.storiesCompleted} قصة مكتملة</p>
                  </div>
                </div>

                {/* Stories badges */}
                <div className="hidden sm:flex items-center gap-1">
                  {(r.scores || []).slice(0, 3).map(sc => {
                    const st = stories.find(s => s.id === sc.storyId)
                    return st ? (
                      <div key={sc.storyId} className="w-7 h-7 rounded overflow-hidden opacity-80" title={st.title}>
                        <img src={st.cover} alt={st.title} className="w-full h-full object-cover" />
                      </div>
                    ) : null
                  })}
                </div>

                {/* Points */}
                <div className="text-right">
                  <div className={`text-lg font-bold ${i === 0 ? 'text-gold-400' : 'text-mist-200'}`}>
                    {r.totalPoints.toLocaleString()}
                  </div>
                  <div className="text-xs text-mist-500">نقطة</div>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
