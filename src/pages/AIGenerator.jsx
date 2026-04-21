import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useFormik } from 'formik'
import { z } from 'zod'
import { useAIStoryStore } from '../stores/aiStory'
import { useStoriesStore } from '../stores'
import { useBadgesStore } from '../stores/badges'
import { useAuthStore } from '../stores'
import { GENRES } from '../data/stories'

const schema = z.object({
  prompt: z.string().min(10, 'الفكرة قصيرة جداً — أضف تفاصيل أكثر'),
  genre: z.string().min(1),
})

function zodValidate(s) {
  return v => {
    const r = s.safeParse(v)
    if (r.success) return {}
    const e = {}
    r.error.issues.forEach(i => { e[i.path[0]] = i.message })
    return e
  }
}

const EXAMPLE_PROMPTS = [
  'رجل يجد رسالة من نفسه في المستقبل تحذره من خطر قادم',
  'مدينة تحت الماء اكتشفها غواص بمفرده في منتصف الليل',
  'آخر شجرة في العالم — ومن يقررون مصيرها',
  'طالب يكتشف أن مدرسته مبنية فوق بوابة لعالم موازٍ',
]

export default function AIGenerator() {
  const navigate = useNavigate()
  const { generateStory, generating, error } = useAIStoryStore()
  const { addStory } = useStoriesStore()
  const { updateStats } = useBadgesStore()
  const { user } = useAuthStore()
  const [done, setDone] = useState(false)
  const [generatedId, setGeneratedId] = useState(null)

  const form = useFormik({
    initialValues: { prompt: '', genre: 'adventure' },
    validate: zodValidate(schema),
    onSubmit: (values) => {
      generateStory(values.prompt, values.genre, (story) => {
        addStory(story)
        setGeneratedId(story.id)
        setDone(true)
        if (user) updateStats(user.id, { aiStoriesRead: 1 })
      })
    }
  })

  if (done && generatedId) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center p-4">
        <div className="card-dark p-10 max-w-md w-full text-center animate-fade-up">
          <div className="text-6xl mb-4">🤖✨</div>
          <h2 className="font-display text-2xl font-bold text-mist-100 mb-2">القصة جاهزة!</h2>
          <p className="text-mist-400 mb-6 text-sm">تم توليد قصتك بالذكاء الاصطناعي وإضافتها للمنصة</p>
          <div className="flex gap-3">
            <button onClick={() => navigate(`/read/${generatedId}`)} className="btn-gold flex-1 py-3 rounded-xl">
              العب الآن ←
            </button>
            <button onClick={() => { setDone(false); form.resetForm() }} className="btn-ghost px-5 py-3 rounded-xl">
              قصة أخرى
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🤖</div>
          <h1 className="font-display text-4xl font-black text-mist-100 mb-2">
            قصص بالذكاء الاصطناعي
          </h1>
          <p className="text-mist-400 text-sm">
            اكتب فكرة بسيطة — Claude يبني القصة كاملة بفصول واختيارات
          </p>
        </div>

        <form onSubmit={form.handleSubmit} className="card-dark p-8 space-y-6">
          {/* Genre */}
          <div>
            <label className="block text-sm text-mist-400 mb-3">النوع</label>
            <div className="flex flex-wrap gap-2">
              {GENRES.map(g => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => form.setFieldValue('genre', g.id)}
                  className={`px-4 py-2 rounded-xl text-sm border transition-all ${
                    form.values.genre === g.id
                      ? 'bg-gold-500/20 border-gold-500/50 text-gold-400'
                      : 'border-ink-600 text-mist-400 hover:border-ink-500'
                  }`}
                >
                  {g.emoji} {g.label}
                </button>
              ))}
            </div>
          </div>

          {/* Prompt */}
          <div>
            <label className="block text-sm text-mist-400 mb-2">فكرة القصة</label>
            <textarea
              name="prompt"
              rows={4}
              value={form.values.prompt}
              onChange={form.handleChange}
              onBlur={form.handleBlur}
              placeholder="اكتب فكرتك هنا... كلما كانت أوضح كانت القصة أفضل"
              className={`input-dark resize-none ${form.touched.prompt && form.errors.prompt ? 'border-red-500/60' : ''}`}
              style={{ direction: 'rtl' }}
            />
            {form.touched.prompt && form.errors.prompt && (
              <p className="text-xs text-red-400 mt-1">{form.errors.prompt}</p>
            )}
          </div>

          {/* Example prompts */}
          <div>
            <p className="text-xs text-mist-500 mb-2">أفكار للإلهام:</p>
            <div className="space-y-2">
              {EXAMPLE_PROMPTS.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => form.setFieldValue('prompt', p)}
                  className="block w-full text-right text-xs text-mist-400 hover:text-gold-400 py-1.5 px-3 rounded-lg hover:bg-ink-700 transition-all border border-transparent hover:border-ink-600"
                >
                  "{p}"
                </button>
              ))}
            </div>
          </div>

          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={generating || !form.isValid}
            className="btn-gold w-full py-4 rounded-xl text-base disabled:opacity-50 flex items-center justify-center gap-3"
          >
            {generating ? (
              <>
                <div className="w-5 h-5 border-2 border-ink-950/30 border-t-ink-950 rounded-full animate-spin" />
                Claude بيكتب القصة...
              </>
            ) : (
              '✨ ولّد القصة'
            )}
          </button>

          {generating && (
            <div className="text-center text-xs text-mist-500 animate-pulse">
              بيولّد العنوان والفصول والاختيارات...
            </div>
          )}
        </form>
      </div>
    </div>
  )
}
