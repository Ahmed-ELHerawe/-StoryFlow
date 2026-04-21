import { create } from 'zustand'

export const useAIStoryStore = create((set, get) => ({
  generating: false,
  error: null,
  streamText: '',

  generateStory: async (prompt, genre, onDone) => {
    set({ generating: true, error: null, streamText: '' })

    const systemPrompt = `أنت كاتب قصص تفاعلية محترف. مهمتك توليد قصة تفاعلية قصيرة بالعربي.

يجب أن تُرجع JSON فقط بهذا الشكل بالضبط — لا تضع أي نص قبله أو بعده:
{
  "title": "عنوان القصة",
  "description": "وصف مختصر جذاب",
  "chapters": {
    "ch1": {
      "id": "ch1",
      "title": "عنوان الفصل",
      "description": "نص الفصل — جملتان أو ثلاث مثيرة",
      "choicePrompt": "سؤال للقارئ",
      "choiceAt": 10,
      "endingType": null,
      "choices": [
        { "id": "c1", "text": "الاختيار الأول", "icon": "⭐", "nextChapterId": "ch2a", "consequence": "" },
        { "id": "c2", "text": "الاختيار الثاني", "icon": "🔥", "nextChapterId": "ch2b", "consequence": "" }
      ]
    },
    "ch2a": {
      "id": "ch2a", "title": "مسار أ", "description": "نص...",
      "choicePrompt": null, "choiceAt": null, "choices": [],
      "endingType": "good", "points": 100
    },
    "ch2b": {
      "id": "ch2b", "title": "مسار ب", "description": "نص...",
      "choicePrompt": null, "choiceAt": null, "choices": [],
      "endingType": "neutral", "points": 60
    }
  },
  "startChapterId": "ch1"
}`

    try {
      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{
            role: 'user',
            content: `اكتب قصة تفاعلية قصيرة بنوع "${genre}" عن: ${prompt}`
          }]
        })
      })

      const data = await res.json()
      const text = data.content?.map(c => c.text || '').join('') || ''

      // Parse JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/)
      if (!jsonMatch) throw new Error('لم يتمكن الذكاء الاصطناعي من توليد القصة')

      const story = JSON.parse(jsonMatch[0])

      // Add required fields
      const fullStory = {
        id: `ai-${Date.now()}`,
        genre,
        cover: `https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=800&q=80`,
        totalChapters: Object.keys(story.chapters).length,
        plays: 0,
        rating: 0,
        isAI: true,
        videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
        ...story,
        chapters: Object.fromEntries(
          Object.entries(story.chapters).map(([k, ch]) => [k, {
            videoUrl: getVideoForChapter(ch.endingType),
            videoThumbnail: '',
            ...ch,
          }])
        )
      }

      set({ generating: false })
      onDone?.(fullStory)
    } catch (err) {
      set({ generating: false, error: err.message || 'خطأ في توليد القصة' })
    }
  },
}))

function getVideoForChapter(endingType) {
  const videos = {
    epic:    'https://assets.mixkit.co/videos/preview/mixkit-mountain-top-in-the-clouds-4070-large.mp4',
    good:    'https://assets.mixkit.co/videos/preview/mixkit-sunrise-over-the-mountains-4133-large.mp4',
    neutral: 'https://assets.mixkit.co/videos/preview/mixkit-aerial-view-of-the-ocean-4910-large.mp4',
    bad:     'https://assets.mixkit.co/videos/preview/mixkit-rain-falling-on-the-surface-of-a-lake-18312-large.mp4',
    null:    'https://assets.mixkit.co/videos/preview/mixkit-forest-stream-in-the-sunlight-529-large.mp4',
  }
  return videos[endingType] || videos.null
}
