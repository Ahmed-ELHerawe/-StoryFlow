import React, { useState } from 'react'
import { useAuthStore } from '../stores'
import { useChallengeStore } from '../stores/challenge'
import { ChallengeAcceptModal } from '../components/ChallengeModal'
import { ENDING_CONFIG } from '../data/stories'
import { Link } from 'react-router-dom'

export default function Challenges() {
  const { user } = useAuthStore()
  const { getUserChallenges } = useChallengeStore()
  const [showAccept, setShowAccept] = useState(false)

  const myChallenges = user ? getUserChallenges(user.id) : []

  return (
    <div className="min-h-screen pt-24 pb-20">
      {showAccept && <ChallengeAcceptModal onClose={() => setShowAccept(false)} />}

      <div className="max-w-3xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-mist-100">⚔️ التحديات</h1>
            <p className="text-mist-500 text-sm mt-1">تحدّ أصدقاءك واثبت أنك الأفضل</p>
          </div>
          <button onClick={() => setShowAccept(true)} className="btn-gold px-5 py-2.5 rounded-xl text-sm">
            + قبول تحدي
          </button>
        </div>

        {!user ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🔒</div>
            <p className="text-mist-400 mb-4">سجل دخولك للمشاركة في التحديات</p>
            <Link to="/auth" className="btn-gold px-8 py-3 rounded-xl">دخول</Link>
          </div>
        ) : myChallenges.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-5xl mb-4">🤝</div>
            <h3 className="font-display text-xl font-bold text-mist-300 mb-2">لا توجد تحديات بعد</h3>
            <p className="text-mist-500 mb-6 text-sm">
              العب قصة وأكملها عشان تقدر تتحدى أصدقاءك
            </p>
            <Link to="/stories" className="btn-gold px-8 py-3 rounded-xl">العب الآن ←</Link>
          </div>
        ) : (
          <div className="space-y-4">
            {myChallenges.map(ch => {
              const isChallenger = ch.challenger.userId === user.id
              const ending = ch.endingType ? ENDING_CONFIG[ch.endingType] : null
              return (
                <div key={ch.code} className="card-dark p-5">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-gold-400 font-bold text-sm bg-gold-500/10 px-2 py-0.5 rounded">
                          #{ch.code}
                        </span>
                        <span className="text-xs text-mist-500">
                          {isChallenger ? 'أرسلته' : 'استلمته'}
                        </span>
                      </div>
                      <p className="font-display font-bold text-mist-100">{ch.storyTitle}</p>
                      <p className="text-xs text-mist-500 mt-0.5">
                        {isChallenger ? 'أنت' : ch.challenger.username} — {ch.points} نقطة
                        {ending && <span className={`mr-2 ${ending.color}`}>{ending.emoji} {ending.label}</span>}
                      </p>
                    </div>
                    {!isChallenger && (
                      <Link to={`/read/${ch.storyId}?challenge=${ch.code}`} className="btn-gold text-xs px-4 py-2 rounded-xl flex-shrink-0">
                        العب ←
                      </Link>
                    )}
                  </div>

                  {/* Responses */}
                  {ch.responses.length > 0 && (
                    <div className="border-t border-ink-700 pt-3 space-y-2">
                      <p className="text-xs text-mist-500 mb-2">النتائج:</p>
                      {[
                        { username: ch.challenger.username, points: ch.points, endingType: ch.endingType, isYou: isChallenger },
                        ...ch.responses.map(r => ({ ...r, isYou: r.userId === user.id }))
                      ].sort((a, b) => b.points - a.points).map((r, i) => {
                        const rEnding = r.endingType ? ENDING_CONFIG[r.endingType] : null
                        return (
                          <div key={i} className={`flex items-center gap-3 p-2 rounded-lg ${r.isYou ? 'bg-gold-500/10' : 'bg-ink-700/50'}`}>
                            <span className="text-sm font-bold text-mist-500 w-5">{i + 1}</span>
                            <span className={`text-sm font-medium flex-1 ${r.isYou ? 'text-gold-400' : 'text-mist-300'}`}>
                              {r.username} {r.isYou && '(أنت)'}
                            </span>
                            {rEnding && <span className={`text-xs ${rEnding.color}`}>{rEnding.emoji}</span>}
                            <span className="text-sm font-bold text-mist-200">{r.points}</span>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
