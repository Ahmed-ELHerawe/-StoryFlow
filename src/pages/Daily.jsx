import React from 'react'
import { Link } from 'react-router-dom'
import { useDailyStore } from '../stores/daily'
import { useStoriesStore } from '../stores'
import { useAuthStore } from '../stores'
import { GENRES } from '../data/stories'

function StreakFlame({ active }) {
  return (
    <span className={`text-2xl transition-all ${active ? 'opacity-100' : 'opacity-20'}`}>🔥</span>
  )
}

export default function DailyPage() {
  const { user } = useAuthStore()
  const { getAllStories } = useStoriesStore()
  const { getDailyStory, getStreak, isCompletedToday } = useDailyStore()

  const allStories = getAllStories()
  const daily = getDailyStory(allStories)
  const streak = user ? getStreak(user.id) : { streak: 0, longestStreak: 0, completedDates: [] }
  const doneToday = user ? isCompletedToday(user.id) : false
  const genre = GENRES.find(g => g.id === daily?.genre)

  const today = new Date()
  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(today)
    d.setDate(today.getDate() - (6 - i))
    return d.toISOString().slice(0, 10)
  })

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-6xl mb-3">🌟</div>
          <h1 className="font-display text-3xl font-black text-mist-100 mb-2">قصة اليوم</h1>
          <p className="text-mist-400 text-sm">قصة جديدة كل يوم — أكملها للحصول على نقاط مضاعفة</p>
        </div>

        {/* Streak */}
        {user && (
          <div className="card-dark p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs text-mist-500 font-medium mb-1">سلسلتك اليومية</p>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-black text-amber-400">{streak.streak}</span>
                  <span className="text-mist-400 text-sm">يوم متتالي</span>
                </div>
              </div>
              <div className="text-center">
                <p className="text-xs text-mist-600 mb-1">أطول سلسلة</p>
                <span className="text-2xl font-bold text-mist-300">{streak.longestStreak}</span>
              </div>
            </div>

            {/* Last 7 days */}
            <div className="flex justify-between items-center">
              {last7.map((date, i) => {
                const done = streak.completedDates?.includes(date)
                const isToday = date === today.toISOString().slice(0, 10)
                const dayName = new Date(date).toLocaleDateString('ar-EG', { weekday: 'short' })
                return (
                  <div key={date} className="flex flex-col items-center gap-1">
                    <StreakFlame active={done} />
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs border-2 transition-all ${
                      done ? 'bg-amber-500/20 border-amber-500/60 text-amber-400 font-bold'
                           : isToday ? 'border-gold-500/40 text-mist-400'
                           : 'border-ink-600 text-mist-600'
                    }`}>
                      {done ? '✓' : isToday ? '●' : ''}
                    </div>
                    <span className={`text-xs ${isToday ? 'text-gold-400 font-medium' : 'text-mist-600'}`}>
                      {isToday ? 'اليوم' : dayName}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Daily Story Card */}
        {daily && (
          <div className="card-dark overflow-hidden border-amber-500/20">
            <div className="relative" style={{ aspectRatio: '16/9' }}>
              <img src={daily.cover} alt="" className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/30 to-transparent" />
              <div className="absolute top-3 right-3 flex items-center gap-2">
                {genre && <span className={`genre-badge border text-xs ${genre.color}`}>{genre.emoji} {genre.label}</span>}
                <span className="genre-badge border text-xs bg-amber-500/20 border-amber-500/40 text-amber-400">
                  🌟 اليوم
                </span>
              </div>
              {doneToday && (
                <div className="absolute inset-0 flex items-center justify-center bg-ink-950/60">
                  <div className="text-center">
                    <div className="text-5xl mb-2">✅</div>
                    <p className="text-green-400 font-bold">أكملتها اليوم!</p>
                  </div>
                </div>
              )}
            </div>
            <div className="p-6">
              <h2 className="font-display text-2xl font-bold text-mist-100 mb-2">{daily.title}</h2>
              <p className="text-mist-400 text-sm leading-relaxed mb-4">{daily.description}</p>
              <div className="flex items-center gap-4 text-xs text-mist-500 mb-5">
                <span>⭐ {daily.rating}</span>
                <span>📖 {daily.totalChapters} فصول</span>
                <span className="text-amber-400 font-medium">+50% نقاط مضاعفة</span>
              </div>
              <Link
                to={`/read/${daily.id}`}
                className={`block text-center py-3 rounded-xl font-medium transition-all ${
                  doneToday
                    ? 'btn-ghost text-sm'
                    : 'btn-gold text-base'
                }`}
              >
                {doneToday ? '▶ العب مجدداً' : '🌟 العب قصة اليوم ←'}
              </Link>
            </div>
          </div>
        )}

        {!user && (
          <div className="text-center mt-6 p-4 card-dark">
            <p className="text-mist-400 text-sm mb-3">سجل دخولك لتتبع سلسلتك اليومية</p>
            <Link to="/auth" className="btn-gold px-6 py-2 rounded-xl text-sm">دخول</Link>
          </div>
        )}
      </div>
    </div>
  )
}
