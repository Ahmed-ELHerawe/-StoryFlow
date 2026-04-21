import React, { useState } from 'react'
import { useFormik } from 'formik'
import { z } from 'zod'
import { useStoriesStore } from '../stores'
import { GENRES } from '../data/stories'
import { Link } from 'react-router-dom'

const storySchema = z.object({
  title: z.string().min(3, 'العنوان قصير جداً'),
  description: z.string().min(10, 'الوصف قصير جداً'),
  genre: z.string().min(1, 'اختر نوعاً'),
  cover: z.string().url('رابط الغلاف غير صحيح').or(z.literal('')),
  startVideoUrl: z.string().url('رابط الفيديو غير صحيح'),
  startTitle: z.string().min(2, 'عنوان الفصل الأول مطلوب'),
  choice1Text: z.string().min(2, 'نص الاختيار الأول مطلوب'),
  choice2Text: z.string().min(2, 'نص الاختيار الثاني مطلوب'),
})

function zodValidate(schema) {
  return (values) => {
    const result = schema.safeParse(values)
    if (result.success) return {}
    const errors = {}
    result.error.issues.forEach(i => { errors[i.path[0]] = i.message })
    return errors
  }
}

const SAMPLE_VIDEOS = [
  { label: 'Big Buck Bunny', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4' },
  { label: "Elephant's Dream", url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4' },
  { label: 'For Bigger Blazes', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4' },
  { label: 'For Bigger Escapes', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4' },
  { label: 'Tears of Steel', url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4' },
]

export default function Admin() {
  const { getAllStories, addStory, deleteStory, customStories } = useStoriesStore()
  const [activeTab, setActiveTab] = useState('list')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [successMsg, setSuccessMsg] = useState('')

  const allStories = getAllStories()

  const form = useFormik({
    initialValues: {
      title: '', description: '', genre: 'adventure', cover: '',
      startVideoUrl: SAMPLE_VIDEOS[0].url, startTitle: 'الفصل الأول',
      choice1Text: '', choice2Text: '',
    },
    validate: zodValidate(storySchema),
    onSubmit: (values, { resetForm }) => {
      const startId = 'ch-start'
      const end1Id = 'ch-end1'
      const end2Id = 'ch-end2'
      const newStory = {
        title: values.title,
        description: values.description,
        genre: values.genre,
        cover: values.cover || 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80',
        totalChapters: 3,
        startChapterId: startId,
        chapters: {
          [startId]: {
            id: startId,
            title: values.startTitle,
            description: values.description,
            videoUrl: values.startVideoUrl,
            videoThumbnail: '',
            choicePrompt: 'ماذا ستختار؟',
            choiceAt: 15,
            choices: [
              { id: 'ch1', text: values.choice1Text, icon: '⭐', nextChapterId: end1Id, consequence: '' },
              { id: 'ch2', text: values.choice2Text, icon: '🔥', nextChapterId: end2Id, consequence: '' },
            ],
            endingType: null,
          },
          [end1Id]: {
            id: end1Id,
            title: `نهاية: ${values.choice1Text}`,
            description: `اخترت: ${values.choice1Text}`,
            videoUrl: SAMPLE_VIDEOS[1].url,
            videoThumbnail: '',
            choicePrompt: null, choiceAt: null, choices: [],
            endingType: 'good', points: 100,
          },
          [end2Id]: {
            id: end2Id,
            title: `نهاية: ${values.choice2Text}`,
            description: `اخترت: ${values.choice2Text}`,
            videoUrl: SAMPLE_VIDEOS[2].url,
            videoThumbnail: '',
            choicePrompt: null, choiceAt: null, choices: [],
            endingType: 'neutral', points: 60,
          },
        },
      }
      addStory(newStory)
      resetForm()
      setSuccessMsg('✅ تمت إضافة القصة بنجاح!')
      setActiveTab('list')
      setTimeout(() => setSuccessMsg(''), 3000)
    },
  })

  const InputField = ({ name, label, type = 'text', placeholder, as }) => (
    <div>
      <label className="block text-sm text-mist-400 mb-1.5">{label}</label>
      {as === 'textarea' ? (
        <textarea
          name={name} rows={3}
          value={form.values[name]} onChange={form.handleChange} onBlur={form.handleBlur}
          placeholder={placeholder}
          dir="rtl"
          className={`input-dark resize-none ${form.touched[name] && form.errors[name] ? 'border-red-500/60' : ''}`}
          style={{ direction: 'rtl', textAlign: 'right', unicodeBidi: 'plaintext' }}
        />
      ) : (
        <input
          type={type} name={name}
          value={form.values[name]} onChange={form.handleChange} onBlur={form.handleBlur}
          placeholder={placeholder}
          className={`input-dark ${form.touched[name] && form.errors[name] ? 'border-red-500/60' : ''}`}
        />
      )}
      {form.touched[name] && form.errors[name] && (
        <p className="text-xs text-red-400 mt-1">{form.errors[name]}</p>
      )}
    </div>
  )

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-5xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="font-display text-3xl font-bold text-mist-100">⚙️ لوحة الأدمن</h1>
            <p className="text-mist-500 text-sm mt-1">إدارة القصص التفاعلية</p>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/editor" className="btn-ghost text-sm px-4 py-2 rounded-xl">
              🔀 المحرر المرئي
            </Link>
            <span className="genre-badge border bg-ember-400/10 border-ember-400/30 text-ember-400">
              👑 أدمن
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-center font-medium">
            {successMsg}
          </div>
        )}

        {/* Stats Row */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'إجمالي القصص', val: allStories.length, emoji: '📚' },
            { label: 'قصصي المضافة', val: customStories.length, emoji: '✍️' },
            { label: 'إجمالي المشاهدات', val: allStories.reduce((s, st) => s + st.plays, 0).toLocaleString(), emoji: '👁️' },
            { label: 'متوسط التقييم', val: (allStories.reduce((s, st) => s + st.rating, 0) / allStories.length).toFixed(1), emoji: '⭐' },
          ].map(s => (
            <div key={s.label} className="stat-card border border-ink-600">
              <div className="text-2xl mb-1">{s.emoji}</div>
              <div className="text-xl font-bold text-gold-400">{s.val}</div>
              <div className="text-xs text-mist-500 mt-0.5">{s.label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex bg-ink-900 rounded-xl p-1 mb-8 w-fit">
          {[['list', '📋 القصص'], ['add', '➕ قصة جديدة']].map(([t, l]) => (
            <button key={t} onClick={() => setActiveTab(t)}
              className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === t ? 'bg-ink-700 text-mist-100' : 'text-mist-500 hover:text-mist-300'
              }`}>
              {l}
            </button>
          ))}
        </div>

        {/* Stories List */}
        {activeTab === 'list' && (
          <div className="space-y-3">
            {allStories.map(story => {
              const genre = GENRES.find(g => g.id === story.genre)
              const isCustom = customStories.some(cs => cs.id === story.id)
              return (
                <div key={story.id} className="card-dark p-4 flex items-center gap-4">
                  <img src={story.cover} alt="" className="w-16 h-16 rounded-xl object-cover flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <p className="font-medium text-mist-100">{story.title}</p>
                      {isCustom && <span className="genre-badge border text-xs bg-purple-500/10 border-purple-500/30 text-purple-400">مضاف</span>}
                      {genre && <span className={`genre-badge border text-xs ${genre.color}`}>{genre.emoji} {genre.label}</span>}
                    </div>
                    <p className="text-xs text-mist-500 line-clamp-1">{story.description}</p>
                    <div className="flex items-center gap-4 mt-1 text-xs text-mist-600">
                      <span>👁️ {story.plays.toLocaleString()}</span>
                      <span>⭐ {story.rating}</span>
                      <span>📖 {story.totalChapters} فصول</span>
                      <span>🔀 {Object.keys(story.chapters).length} مقطع</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Link to={`/read/${story.id}`} className="btn-ghost text-xs py-1.5 px-3 rounded-lg">
                      معاينة
                    </Link>
                    {isCustom && (
                      deleteConfirm === story.id ? (
                        <div className="flex gap-1">
                          <button onClick={() => { deleteStory(story.id); setDeleteConfirm(null) }}
                            className="text-xs py-1.5 px-3 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 hover:bg-red-500/30 transition-all">
                            تأكيد
                          </button>
                          <button onClick={() => setDeleteConfirm(null)}
                            className="text-xs py-1.5 px-3 rounded-lg bg-ink-700 text-mist-400">
                            إلغاء
                          </button>
                        </div>
                      ) : (
                        <button onClick={() => setDeleteConfirm(story.id)}
                          className="text-xs py-1.5 px-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition-all">
                          حذف
                        </button>
                      )
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Add Story Form */}
        {activeTab === 'add' && (
          <form onSubmit={form.handleSubmit} className="card-dark p-8 space-y-6">
            <h2 className="font-display text-xl font-bold text-mist-100 mb-6">إضافة قصة جديدة</h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <InputField name="title" label="عنوان القصة" placeholder="اسم القصة المبهر" />
              <div>
                <label className="block text-sm text-mist-400 mb-1.5">النوع</label>
                <select
                  name="genre"
                  value={form.values.genre}
                  onChange={form.handleChange}
                  className="input-dark"
                >
                  {GENRES.map(g => (
                    <option key={g.id} value={g.id}>{g.emoji} {g.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <InputField name="description" label="وصف القصة" placeholder="اكتب وصفاً مثيراً للفضول..." as="textarea" />
            <InputField name="cover" label="رابط صورة الغلاف (اختياري)" placeholder="https://..." type="url" />

            <div className="border-t border-ink-700 pt-6">
              <h3 className="text-sm font-medium text-mist-300 mb-4">الفصل الأول</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField name="startTitle" label="عنوان الفصل الأول" placeholder="البداية" />
                <div>
                  <label className="block text-sm text-mist-400 mb-1.5">فيديو الفصل الأول</label>
                  <select name="startVideoUrl" value={form.values.startVideoUrl} onChange={form.handleChange} className="input-dark">
                    {SAMPLE_VIDEOS.map(v => (
                      <option key={v.url} value={v.url}>{v.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="border-t border-ink-700 pt-6">
              <h3 className="text-sm font-medium text-mist-300 mb-4">الاختيارات (تظهر بعد 15 ثانية)</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <InputField name="choice1Text" label="الاختيار الأول" placeholder="مثال: اتجه شمالاً" />
                <InputField name="choice2Text" label="الاختيار الثاني" placeholder="مثال: اتجه جنوباً" />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-ink-900 border border-ink-700 text-xs text-mist-500">
              💡 ملاحظة: ستُنشأ فصلان نهائيان تلقائياً — واحد لكل اختيار. يمكنك توسيع القصة لاحقاً.
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={form.isSubmitting} className="btn-gold px-8 py-3 rounded-xl disabled:opacity-50">
                {form.isSubmitting ? 'جاري الإضافة...' : 'إضافة القصة ←'}
              </button>
              <button type="button" onClick={() => { form.resetForm(); setActiveTab('list') }} className="btn-ghost px-6 py-3 rounded-xl">
                إلغاء
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
