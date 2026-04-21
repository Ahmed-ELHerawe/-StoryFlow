import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useDailyStore = create(
  persist(
    (set, get) => ({
      // { date: 'YYYY-MM-DD', storyId: string }
      daily: null,
      // { [userId]: { lastDate, streak, longestStreak, completedDates: [] } }
      streaks: {},

      getToday: () => new Date().toISOString().slice(0, 10),

      getDailyStory: (allStories) => {
        const today = get().getToday()
        const current = get().daily
        if (current?.date === today) return allStories.find(s => s.id === current.storyId) || allStories[0]
        // Pick story based on day index so it's consistent for everyone
        const dayIndex = Math.floor(Date.now() / 86400000)
        const story = allStories[dayIndex % allStories.length]
        set({ daily: { date: today, storyId: story.id } })
        return story
      },

      recordDailyComplete: (userId) => {
        const today = get().getToday()
        set(s => {
          const prev = s.streaks[userId] || { lastDate: null, streak: 0, longestStreak: 0, completedDates: [] }
          if (prev.completedDates.includes(today)) return s // already recorded

          const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)
          const newStreak = prev.lastDate === yesterday ? prev.streak + 1 : 1
          return {
            streaks: {
              ...s.streaks,
              [userId]: {
                lastDate: today,
                streak: newStreak,
                longestStreak: Math.max(prev.longestStreak, newStreak),
                completedDates: [...prev.completedDates, today],
              }
            }
          }
        })
      },

      getStreak: (userId) => get().streaks[userId] || { streak: 0, longestStreak: 0, completedDates: [] },

      isCompletedToday: (userId) => {
        const today = get().getToday()
        return get().streaks[userId]?.completedDates?.includes(today) || false
      },
    }),
    { name: 'sf_daily' }
  )
)
