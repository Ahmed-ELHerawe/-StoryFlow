import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useAnalyticsStore = create(
  persist(
    (set, get) => ({
      // { [storyId]: { [chapterId]: { [choiceId]: count } } }
      choiceStats: {},

      recordChoice: (storyId, chapterId, choiceId) => {
        set(s => {
          const story   = s.choiceStats[storyId] || {}
          const chapter = story[chapterId] || {}
          return {
            choiceStats: {
              ...s.choiceStats,
              [storyId]: {
                ...story,
                [chapterId]: {
                  ...chapter,
                  [choiceId]: (chapter[choiceId] || 0) + 1,
                }
              }
            }
          }
        })
      },

      getChapterStats: (storyId, chapterId) => {
        const stats = get().choiceStats[storyId]?.[chapterId] || {}
        const total = Object.values(stats).reduce((s, n) => s + n, 0)
        return { stats, total }
      },

      getStoryTree: (storyId, story) => {
        if (!story) return null
        const choiceStats = get().choiceStats[storyId] || {}

        const buildNode = (chapterId, depth = 0) => {
          const chapter = story.chapters[chapterId]
          if (!chapter || depth > 10) return null
          const chStats = choiceStats[chapterId] || {}
          const totalVotes = Object.values(chStats).reduce((s, n) => s + n, 0)
          return {
            id: chapterId,
            title: chapter.title,
            endingType: chapter.endingType,
            totalVotes,
            children: (chapter.choices || []).map(choice => {
              const votes = chStats[choice.id] || 0
              const pct   = totalVotes ? Math.round((votes / totalVotes) * 100) : 0
              const child = buildNode(choice.nextChapterId, depth + 1)
              return { choiceId: choice.id, choiceText: choice.text, icon: choice.icon, votes, pct, child }
            })
          }
        }
        return buildNode(story.startChapterId)
      },
    }),
    { name: 'sf_analytics' }
  )
)
