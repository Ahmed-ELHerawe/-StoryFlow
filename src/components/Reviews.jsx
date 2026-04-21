import React, { useState } from 'react'
import { useReviewsStore } from '../stores/reviews'
import { useAuthStore } from '../stores'
import { ENDING_CONFIG } from '../data/stories'

function StarRating({ value, onChange, size = 'md' }) {
  const [hover, setHover] = useState(0)
  const sz = size === 'lg' ? 'text-3xl' : 'text-xl'
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(star => (
        <button
          key={star}
          type="button"
          onClick={() => onChange?.(star)}
          onMouseEnter={() => onChange && setHover(star)}
          onMouseLeave={() => onChange && setHover(0)}
          className={`${sz} transition-transform ${onChange ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <span className={(hover || value) >= star ? 'text-gold-400' : 'text-ink-600'}>★</span>
        </button>
      ))}
    </div>
  )
}

export function ReviewForm({ storyId, endingType, onClose }) {
  const { user } = useAuthStore()
  const { addReview, getUserReview } = useReviewsStore()
  const existing = getUserReview(storyId, user?.id)
  const [rating, setRating] = useState(existing?.rating || 0)
  const [text, setText] = useState(existing?.text || '')
  const [submitted, setSubmitted] = useState(false)

  if (!user) return null

  const handleSubmit = () => {
    if (!rating) return
    addReview(storyId, user.id, user.username, user.avatar, rating, text.trim(), endingType)
    setSubmitted(true)
    setTimeout(() => onClose?.(), 1500)
  }

  if (submitted) return (
    <div className="text-center py-6">
      <div className="text-4xl mb-2">✅</div>
      <p className="text-green-400 font-medium">شكراً على تقييمك!</p>
    </div>
  )

  return (
    <div className="space-y-4">
      <p className="text-sm font-medium text-mist-200">
        {existing ? 'عدّل تقييمك' : 'قيّم القصة'}
      </p>
      <div className="flex justify-center">
        <StarRating value={rating} onChange={setRating} size="lg" />
      </div>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="اكتب مراجعتك (اختياري)..."
        rows={3}
        className="input-dark resize-none text-sm"
        style={{ direction: 'rtl' }}
        maxLength={300}
      />
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={!rating}
          className="btn-gold flex-1 py-2.5 rounded-xl disabled:opacity-40"
        >
          {existing ? 'تحديث التقييم' : 'إرسال التقييم'}
        </button>
        {onClose && (
          <button onClick={onClose} className="btn-ghost px-4 py-2.5 rounded-xl">إلغاء</button>
        )}
      </div>
    </div>
  )
}

export function ReviewsList({ storyId }) {
  const { getReviews, getAvgRating } = useReviewsStore()
  const reviews = getReviews(storyId)
  const avg = getAvgRating(storyId)

  if (!reviews.length) return (
    <div className="text-center py-6 text-mist-500 text-sm">
      لا توجد مراجعات بعد — كن أول من يقيّم!
    </div>
  )

  return (
    <div>
      {/* Summary */}
      <div className="flex items-center gap-4 mb-5 p-4 bg-ink-800/60 rounded-xl border border-ink-700">
        <div className="text-center">
          <div className="text-4xl font-black text-gold-400">{avg.toFixed(1)}</div>
          <StarRating value={Math.round(avg)} size="sm" />
          <div className="text-xs text-mist-500 mt-1">{reviews.length} تقييم</div>
        </div>
        <div className="flex-1 space-y-1">
          {[5, 4, 3, 2, 1].map(star => {
            const count = reviews.filter(r => r.rating === star).length
            const pct = reviews.length ? (count / reviews.length) * 100 : 0
            return (
              <div key={star} className="flex items-center gap-2">
                <span className="text-xs text-mist-500 w-3">{star}</span>
                <span className="text-gold-400 text-xs">★</span>
                <div className="flex-1 h-1.5 bg-ink-700 rounded-full overflow-hidden">
                  <div className="h-full bg-gold-500 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-xs text-mist-600 w-4">{count}</span>
              </div>
            )
          })}
        </div>
      </div>

      {/* List */}
      <div className="space-y-3">
        {reviews.slice(0, 10).map(r => {
          const ending = r.endingType ? ENDING_CONFIG[r.endingType] : null
          return (
            <div key={r.id} className="card-dark p-4">
              <div className="flex items-start gap-3 mb-2">
                <div className="w-9 h-9 rounded-full bg-ink-700 flex items-center justify-center text-lg flex-shrink-0">
                  {r.avatar || '🧑'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-medium text-mist-200">{r.username}</span>
                    {ending && <span className={`text-xs ${ending.color}`}>{ending.emoji} {ending.label}</span>}
                    <span className="text-xs text-mist-600 mr-auto">
                      {new Date(r.date).toLocaleDateString('ar-EG')}
                    </span>
                  </div>
                  <StarRating value={r.rating} />
                </div>
              </div>
              {r.text && <p className="text-sm text-mist-400 leading-relaxed pr-12">{r.text}</p>}
            </div>
          )
        })}
      </div>
    </div>
  )
}
