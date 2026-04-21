import React, { useState } from 'react'
import { useStoriesStore, useLeaderStore, useReaderStore } from '../stores'
import { useAnalyticsStore } from '../stores/analytics'
import { useReviewsStore } from '../stores/reviews'
import { useDailyStore } from '../stores/daily'
import { ENDING_CONFIG, GENRES } from '../data/stories'

function StatCard({ label, value, sub, color = 'text-gold-400' }) {
  return (
    <div className="stat-card border border-ink-600">
      <div className={`text-2xl font-black ${color}`}>{value}</div>
      <div className="text-sm text-mist-300 font-medium mt-0.5">{label}</div>
      {sub && <div className="text-xs text-mist-500 mt-0.5">{sub}</div>}
    </div>
  )
}

function MiniBar({ label, value, max, color = 'bg-gold-500' }) {
  const pct = max ? Math.round((value / max) * 100) : 0
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-mist-400 w-32 truncate text-right">{label}</span>
      <div className="flex-1 h-2 bg-ink-700 rounded-full overflow-hidden">
        <div className={`h-full ${color} rounded-full transition-all duration-700`} style={{ width: `${pct}%` }} />
      </div>
      <span className="text-xs text-mist-400 tabular-nums w-8 text-left">{value}</span>
    </div>
  )
}

export default function AnalyticsDashboard() {
  const { getAllStories } = useStoriesStore()
  const { getRanked } = useLeaderStore()
  const { progress } = useReaderStore()
  const { choiceStats } = useAnalyticsStore()
  const { getReviews, getAvgRating } = useReviewsStore()
  const { getStreak } = useDailyStore()
  const [activeStory, setActiveStory] = useState(null)

  const allStories = getAllStories()
  const ranked = getRanked()

  // Aggregate stats
  const totalPlays    = allStories.reduce((s, st) => s + st.plays, 0)
  const totalUsers    = ranked.length
  const totalPoints   = ranked.reduce((s, r) => s + r.totalPoints, 0)
  const totalCompleted = Object.values(progress).reduce((sum, userP) =>
    sum + Object.values(userP).filter(p => p.completed).length, 0)

  // Ending type distribution
  const endingCounts = { epic: 0, good: 0, neutral: 0, bad: 0 }
  Object.values(progress).forEach(userP =>
    Object.values(userP).forEach(p => { if (p.endingType) endingCounts[p.endingType]++ })
  )
  const maxEnding = Math.max(...Object.values(endingCounts), 1)

  // Story performance
  const storyPerf = allStories.map(s => {
    const storyProgress = Object.values(progress).map(up => up[s.id]).filter(Boolean)
    const completed = storyProgress.filter(p => p.completed).length
    const started = storyProgress.length
    const completionRate = started ? Math.round((completed / started) * 100) : 0
    const avgPoints = completed ? Math.round(storyProgress.filter(p => p.completed).reduce((sum, p) => sum + (p.points || 0), 0) / completed) : 0
    return { ...s, completed, started, completionRate, avgPoints, avgRating: getAvgRating(s.id) }
  }).sort((a, b) => b.plays - a.plays)

  // Choice analytics for selected story
  const selectedStats = activeStory ? choiceStats[activeStory] || {} : null
  const selectedStory = activeStory ? allStories.find(s => s.id === activeStory) : null

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-mist-100">📊 داشبورد التحليلات</h1>
            <p className="text-mist-500 text-sm mt-1">نظرة شاملة على أداء المنصة</p>
          </div>
          <span className="genre-badge border bg-ember-400/10 border-ember-400/30 text-ember-400 text-sm">👑 أدمن</span>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          <StatCard label="إجمالي المشاهدات" value={totalPlays.toLocaleString()} color="text-gold-400" />
          <StatCard label="إجمالي اليوزرين" value={totalUsers} color="text-blue-400" />
          <StatCard label="قصص مكتملة" value={totalCompleted} color="text-green-400" />
          <StatCard label="إجمالي النقاط" value={totalPoints.toLocaleString()} color="text-purple-400" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Story Performance */}
          <div className="card-dark p-5">
            <h3 className="font-medium text-mist-200 mb-4 text-sm">أداء القصص</h3>
            <div className="space-y-4">
              {storyPerf.map(s => (
                <div key={s.id}
                  className={`p-3 rounded-xl cursor-pointer transition-all border ${
                    activeStory === s.id ? 'border-gold-500/50 bg-gold-500/5' : 'border-ink-700 hover:border-ink-600'
                  }`}
                  onClick={() => setActiveStory(activeStory === s.id ? null : s.id)}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <img src={s.cover} alt="" className="w-10 h-8 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-mist-200 truncate">{s.title}</p>
                      <div className="flex items-center gap-2 text-xs text-mist-500 flex-wrap">
                        <span>👁️ {s.plays}</span>
                        <span>✅ {s.completionRate}%</span>
                        {s.avgRating > 0 && <span>⭐ {s.avgRating.toFixed(1)}</span>}
                        <span>🏅 {s.avgPoints}pts avg</span>
                      </div>
                    </div>
                  </div>
                  <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                    <div className="h-full bg-gold-500/70 rounded-full" style={{ width: `${s.completionRate}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Ending Distribution */}
          <div className="space-y-4">
            <div className="card-dark p-5">
              <h3 className="font-medium text-mist-200 mb-4 text-sm">توزيع النهايات</h3>
              <div className="space-y-3">
                {Object.entries(endingCounts).map(([type, count]) => {
                  const cfg = ENDING_CONFIG[type]
                  return (
                    <MiniBar
                      key={type}
                      label={`${cfg.emoji} ${cfg.label}`}
                      value={count}
                      max={maxEnding}
                      color={type === 'epic' ? 'bg-gold-500' : type === 'good' ? 'bg-green-500' : type === 'bad' ? 'bg-red-500' : 'bg-mist-500'}
                    />
                  )
                })}
              </div>
            </div>

            {/* Top Players */}
            <div className="card-dark p-5">
              <h3 className="font-medium text-mist-200 mb-4 text-sm">أكثر اليوزرين نشاطاً</h3>
              <div className="space-y-2">
                {ranked.slice(0, 5).map((r, i) => (
                  <div key={r.uid} className="flex items-center gap-3">
                    <span className="text-xs text-mist-500 w-5 text-center">#{i + 1}</span>
                    <span className="text-base">{r.avatar || '🧑'}</span>
                    <span className="text-sm text-mist-300 flex-1 truncate">{r.username}</span>
                    <span className="text-xs text-gold-400 font-bold">{r.totalPoints.toLocaleString()}</span>
                  </div>
                ))}
                {ranked.length === 0 && <p className="text-xs text-mist-600 text-center py-2">لا يوجد بيانات بعد</p>}
              </div>
            </div>
          </div>
        </div>

        {/* Choice Analytics for selected story */}
        {selectedStory && selectedStats && (
          <div className="card-dark p-5 mb-6">
            <h3 className="font-medium text-mist-200 mb-4 text-sm">
              تحليل الاختيارات — {selectedStory.title}
            </h3>
            {Object.keys(selectedStats).length === 0 ? (
              <p className="text-xs text-mist-600 text-center py-4">لا توجد بيانات اختيارات بعد</p>
            ) : (
              <div className="space-y-5">
                {Object.entries(selectedStats).map(([chapterId, choices]) => {
                  const chapter = selectedStory.chapters[chapterId]
                  if (!chapter) return null
                  const total = Object.values(choices).reduce((s, n) => s + n, 0)
                  return (
                    <div key={chapterId}>
                      <p className="text-xs text-mist-500 mb-2 font-medium">{chapter.title} — {total} اختيار</p>
                      <div className="space-y-2">
                        {(chapter.choices || []).map(choice => {
                          const count = choices[choice.id] || 0
                          const pct = total ? Math.round((count / total) * 100) : 0
                          return (
                            <div key={choice.id} className="flex items-center gap-2">
                              <span className="text-base">{choice.icon}</span>
                              <span className="text-xs text-mist-400 flex-1 truncate">{choice.text}</span>
                              <div className="w-24 h-1.5 bg-ink-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gold-500/70 rounded-full" style={{ width: `${pct}%` }} />
                              </div>
                              <span className="text-xs text-mist-400 tabular-nums w-10 text-left">{pct}% ({count})</span>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Genre Stats */}
        <div className="card-dark p-5">
          <h3 className="font-medium text-mist-200 mb-4 text-sm">توزيع الأنواع</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {GENRES.map(g => {
              const count = allStories.filter(s => s.genre === g.id).length
              const plays = allStories.filter(s => s.genre === g.id).reduce((sum, s) => sum + s.plays, 0)
              return (
                <div key={g.id} className={`genre-badge border flex-col gap-1 py-3 px-4 h-auto ${g.color}`}>
                  <span className="text-2xl">{g.emoji}</span>
                  <span className="font-medium text-sm">{g.label}</span>
                  <span className="text-xs opacity-70">{count} قصة · {plays} مشاهدة</span>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
