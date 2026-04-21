import React from 'react'
import { Link } from 'react-router-dom'
import { useAuthStore, useReaderStore, useLeaderStore } from '../stores'
import { useStoriesStore } from '../stores'
import { ENDING_CONFIG, GENRES } from '../data/stories'

export default function Profile() {
  const { user } = useAuthStore()
  const { progress } = useReaderStore()
  const { getRanked } = useLeaderStore()
  const { getAllStories } = useStoriesStore()

  const myProgress = progress[user.id] || {}
  const allStories = getAllStories()
  const ranked = getRanked()
  const myRank = ranked.findIndex(r => r.uid === user.id)
  const myScore = ranked[myRank]

  const completedStories = Object.entries(myProgress)
    .filter(([, p]) => p.completed)
    .map(([storyId, p]) => ({
      story: allStories.find(s => s.id === storyId),
      progress: p,
    }))
    .filter(s => s.story)

  const inProgressStories = Object.entries(myProgress)
    .filter(([, p]) => !p.completed)
    .map(([storyId, p]) => ({
      story: allStories.find(s => s.id === storyId),
      progress: p,
    }))
    .filter(s => s.story)

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6">
        {/* Profile Header */}
        <div className="card-dark p-8 mb-6 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div className="w-20 h-20 rounded-full bg-ink-700 flex items-center justify-center text-4xl border-2 border-gold-500/30">
            {user.avatar}
          </div>
          <div className="flex-1 text-center sm:text-right">
            <h1 className="font-display text-3xl font-bold text-mist-100 mb-1">{user.username}</h1>
            <p className="text-mist-500 text-sm">عضو في StoryFlow</p>
          </div>
          {/* Stats */}
          <div className="flex gap-6 text-center">
            <div>
              <div className="text-2xl font-bold text-gold-400">{myScore?.totalPoints?.toLocaleString() || 0}</div>
              <div className="text-xs text-mist-500">نقطة</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-mist-200">{completedStories.length}</div>
              <div className="text-xs text-mist-500">مكتملة</div>
            </div>
            <div>
              <div className="text-2xl font-bold text-mist-200">
                {myRank >= 0 ? `#${myRank + 1}` : '—'}
              </div>
              <div className="text-xs text-mist-500">ترتيب</div>
            </div>
          </div>
        </div>

        {/* In Progress */}
        {inProgressStories.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold text-mist-200 mb-4">قصص في التقدم</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {inProgressStories.map(({ story, progress: p }) => {
                const genre = GENRES.find(g => g.id === story.genre)
                const pct = Math.round(((p.path?.length || 1) / story.totalChapters) * 100)
                return (
                  <Link key={story.id} to={`/read/${story.id}`} className="card-dark p-4 flex gap-4 hover:border-gold-500/40 transition-all group">
                    <img src={story.cover} alt="" className="w-16 h-16 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-mist-100 group-hover:text-gold-400 transition-colors truncate">{story.title}</p>
                      {genre && <span className={`genre-badge border text-xs ${genre.color} mt-1`}>{genre.emoji} {genre.label}</span>}
                      <div className="mt-2 progress-bar">
                        <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                      </div>
                      <p className="text-xs text-mist-500 mt-1">{pct}% مكتمل</p>
                    </div>
                  </Link>
                )
              })}
            </div>
          </section>
        )}

        {/* Completed */}
        {completedStories.length > 0 && (
          <section className="mb-8">
            <h2 className="font-display text-xl font-bold text-mist-200 mb-4">القصص المكتملة</h2>
            <div className="space-y-3">
              {completedStories.map(({ story, progress: p }) => {
                const ending = ENDING_CONFIG[p.endingType]
                const genre = GENRES.find(g => g.id === story.genre)
                return (
                  <div key={story.id} className="card-dark p-4 flex items-center gap-4">
                    <img src={story.cover} alt="" className="w-14 h-14 rounded-lg object-cover flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-mist-100 truncate">{story.title}</p>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        {genre && <span className={`genre-badge border text-xs ${genre.color}`}>{genre.emoji} {genre.label}</span>}
                        {ending && <span className={`genre-badge border text-xs ${ending.bg} ${ending.color}`}>{ending.emoji} {ending.label}</span>}
                      </div>
                      {p.path && (
                        <p className="text-xs text-mist-600 mt-1">{p.path.length} فصل · {new Date(p.completedAt).toLocaleDateString('ar-EG')}</p>
                      )}
                    </div>
                    <div className="text-left flex-shrink-0">
                      <div className="text-lg font-bold text-gold-400">+{p.points || 0}</div>
                      <div className="text-xs text-mist-500">نقطة</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Empty state */}
        {completedStories.length === 0 && inProgressStories.length === 0 && (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">📖</div>
            <h3 className="font-display text-xl font-bold text-mist-300 mb-2">لم تبدأ أي قصة بعد</h3>
            <p className="text-mist-500 mb-6">اكتشف قصصنا التفاعلية الآن</p>
            <Link to="/stories" className="btn-gold px-8 py-3 rounded-xl">
              استكشف القصص ←
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
