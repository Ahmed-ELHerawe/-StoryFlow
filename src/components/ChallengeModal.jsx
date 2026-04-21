import React, { useState } from 'react'
import { useChallengeStore } from '../stores/challenge'
import { useAuthStore } from '../stores'
import { useBadgesStore } from '../stores/badges'
import { ENDING_CONFIG } from '../data/stories'
import { useNavigate } from 'react-router-dom'

export function ChallengeShareModal({ story, progress, onClose }) {
  const { user } = useAuthStore()
  const { createChallenge } = useChallengeStore()
  const { updateStats } = useBadgesStore()
  const [code, setCode] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleCreate = () => {
    const c = createChallenge(
      user.id, user.username,
      story.id, story.title,
      progress.endingType, progress.points || 0,
      progress.path || []
    )
    setCode(c)
    updateStats(user.id, { challengesSent: 1 })
  }

  const handleCopy = () => {
    const url = `${window.location.origin}/challenge/${code}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const ending = progress?.endingType ? ENDING_CONFIG[progress.endingType] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
      <div className="card-dark p-8 max-w-md w-full animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-mist-100">تحدّي صديق</h2>
          <button onClick={onClose} className="text-mist-500 hover:text-mist-300">✕</button>
        </div>

        {!code ? (
          <div className="text-center">
            <div className="text-5xl mb-4">🤝</div>
            <p className="text-mist-400 mb-2 text-sm">
              هتشارك نتيجتك في قصة "{story.title}"
            </p>
            {ending && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border mb-6 ${ending.bg} ${ending.color}`}>
                {ending.emoji} {ending.label} — {progress.points} نقطة
              </div>
            )}
            <p className="text-xs text-mist-500 mb-6">
              صديقك هيلعب نفس القصة وهتقارنوا النتائج
            </p>
            <button onClick={handleCreate} className="btn-gold w-full py-3 rounded-xl">
              إنشاء رابط التحدي ←
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-4xl mb-3">🎯</div>
            <p className="text-mist-300 mb-4 text-sm">كود التحدي:</p>
            <div className="text-4xl font-mono font-black text-gold-400 bg-ink-900 rounded-xl p-4 mb-4 tracking-widest">
              {code}
            </div>
            <button
              onClick={handleCopy}
              className={`w-full py-3 rounded-xl mb-3 transition-all font-medium ${
                copied ? 'bg-green-500/20 border border-green-500/40 text-green-400' : 'btn-gold'
              }`}
            >
              {copied ? '✅ تم النسخ!' : '📋 انسخ الرابط'}
            </button>
            <p className="text-xs text-mist-600">
              شارك الكود مع صديقك — يكتبه في صفحة التحديات
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export function ChallengeAcceptModal({ onClose }) {
  const [code, setCode] = useState('')
  const [challenge, setChallenge] = useState(null)
  const [error, setError] = useState('')
  const { getChallenge } = useChallengeStore()
  const navigate = useNavigate()

  const handleLookup = () => {
    setError('')
    const ch = getChallenge(code.trim().toUpperCase())
    if (!ch) { setError('الكود غير صحيح — تأكد من الكود وحاول مجدداً'); return }
    setChallenge(ch)
  }

  const handleAccept = () => {
    navigate(`/read/${challenge.storyId}?challenge=${challenge.code}`)
    onClose()
  }

  const ending = challenge?.endingType ? ENDING_CONFIG[challenge.endingType] : null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink-950/80 backdrop-blur-sm">
      <div className="card-dark p-8 max-w-md w-full animate-fade-up">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-xl font-bold text-mist-100">قبول تحدي</h2>
          <button onClick={onClose} className="text-mist-500 hover:text-mist-300">✕</button>
        </div>

        {!challenge ? (
          <div>
            <label className="block text-sm text-mist-400 mb-2">أدخل كود التحدي:</label>
            <input
              value={code}
              onChange={e => setCode(e.target.value.toUpperCase())}
              placeholder="مثال: AB12CD"
              className="input-dark text-center text-2xl font-mono tracking-widest mb-3"
              maxLength={6}
            />
            {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
            <button
              onClick={handleLookup}
              disabled={code.length < 4}
              className="btn-gold w-full py-3 rounded-xl disabled:opacity-40"
            >
              بحث ←
            </button>
          </div>
        ) : (
          <div className="text-center">
            <div className="text-3xl mb-3">⚔️</div>
            <p className="text-mist-400 text-sm mb-1">
              <span className="text-gold-400 font-bold">{challenge.challenger.username}</span> يتحداك في:
            </p>
            <p className="font-display text-xl font-bold text-mist-100 mb-3">{challenge.storyTitle}</p>
            {ending && (
              <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl border mb-4 text-sm ${ending.bg} ${ending.color}`}>
                هو وصل لـ {ending.emoji} {ending.label} بـ {challenge.points} نقطة
              </div>
            )}
            <p className="text-xs text-mist-500 mb-6">هل تستطيع التفوق عليه؟</p>
            <div className="flex gap-3">
              <button onClick={handleAccept} className="btn-gold flex-1 py-3 rounded-xl">
                اقبل التحدي ⚔️
              </button>
              <button onClick={() => setChallenge(null)} className="btn-ghost px-4 py-3 rounded-xl">
                رجوع
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
