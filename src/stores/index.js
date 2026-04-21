import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ─── Auth Store ───────────────────────────────────────────────────────────────
export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      isAdmin: false,

      login: (username, password) => {
        // Admin check
        if (username === 'admin' && password === 'admin123') {
          set({ user: { id: 'admin', username: 'Admin', avatar: '👑' }, isAdmin: true })
          return { success: true, isAdmin: true }
        }
        // Regular user — create account if not exists
        const users = JSON.parse(localStorage.getItem('sf_users') || '[]')
        const existing = users.find(u => u.username === username)
        if (existing) {
          if (existing.password !== password) return { success: false, error: 'كلمة المرور خاطئة' }
          set({ user: existing, isAdmin: false })
          return { success: true, isAdmin: false }
        }
        return { success: false, error: 'المستخدم غير موجود' }
      },

      register: (username, password) => {
        if (username.length < 3) return { success: false, error: 'الاسم قصير جداً' }
        const users = JSON.parse(localStorage.getItem('sf_users') || '[]')
        if (users.find(u => u.username === username)) return { success: false, error: 'الاسم موجود بالفعل' }
        const newUser = { id: Date.now().toString(), username, password, avatar: '🧑', createdAt: new Date().toISOString() }
        users.push(newUser)
        localStorage.setItem('sf_users', JSON.stringify(users))
        set({ user: newUser, isAdmin: false })
        return { success: true }
      },

      logout: () => set({ user: null, isAdmin: false }),
    }),
    { name: 'sf_auth', partialize: s => ({ user: s.user, isAdmin: s.isAdmin }) }
  )
)

// ─── Reader Store ─────────────────────────────────────────────────────────────
export const useReaderStore = create(
  persist(
    (set, get) => ({
      // { [userId]: { [storyId]: { currentChapterId, path: [chapterId], completed, endingType, points, startedAt } } }
      progress: {},

      startStory: (userId, storyId, startChapterId) => {
        set(s => ({
          progress: {
            ...s.progress,
            [userId]: {
              ...s.progress[userId],
              [storyId]: {
                currentChapterId: startChapterId,
                path: [startChapterId],
                completed: false,
                endingType: null,
                points: 0,
                startedAt: new Date().toISOString(),
              }
            }
          }
        }))
      },

      makeChoice: (userId, storyId, nextChapterId) => {
        set(s => {
          const prev = s.progress[userId]?.[storyId] || {}
          return {
            progress: {
              ...s.progress,
              [userId]: {
                ...s.progress[userId],
                [storyId]: {
                  ...prev,
                  currentChapterId: nextChapterId,
                  path: [...(prev.path || []), nextChapterId],
                }
              }
            }
          }
        })
      },

      completeStory: (userId, storyId, endingType, points) => {
        set(s => ({
          progress: {
            ...s.progress,
            [userId]: {
              ...s.progress[userId],
              [storyId]: {
                ...s.progress[userId]?.[storyId],
                completed: true,
                endingType,
                points,
                completedAt: new Date().toISOString(),
              }
            }
          }
        }))
        // Update leaderboard
        useLeaderStore.getState().addScore(userId, storyId, points)
      },

      getProgress: (userId, storyId) => {
        return get().progress[userId]?.[storyId] || null
      },

      resetStory: (userId, storyId) => {
        set(s => {
          const updated = { ...s.progress[userId] }
          delete updated[storyId]
          return { progress: { ...s.progress, [userId]: updated } }
        })
      },
    }),
    { name: 'sf_reader' }
  )
)

// ─── Leaderboard Store ────────────────────────────────────────────────────────
export const useLeaderStore = create(
  persist(
    (set, get) => ({
      // { [userId]: { username, avatar, totalPoints, storiesCompleted, scores: [{storyId, points, endingType, date}] } }
      scores: {},

      addScore: (userId, storyId, points) => {
        const user = useAuthStore.getState().user
        if (!user) return
        set(s => {
          const existing = s.scores[userId] || { username: user.username, avatar: user.avatar, totalPoints: 0, storiesCompleted: 0, scores: [] }
          const alreadyScored = existing.scores.find(sc => sc.storyId === storyId)
          const newScores = alreadyScored
            ? existing.scores.map(sc => sc.storyId === storyId && points > sc.points ? { ...sc, points } : sc)
            : [...existing.scores, { storyId, points, date: new Date().toISOString() }]
          const totalPoints = newScores.reduce((sum, sc) => sum + sc.points, 0)
          return {
            scores: {
              ...s.scores,
              [userId]: {
                ...existing,
                totalPoints,
                storiesCompleted: newScores.length,
                scores: newScores,
              }
            }
          }
        })
      },

      getRanked: () => {
        const scores = get().scores
        return Object.entries(scores)
          .map(([uid, data]) => ({ uid, ...data }))
          .sort((a, b) => b.totalPoints - a.totalPoints)
      },
    }),
    { name: 'sf_leaderboard' }
  )
)

// ─── Admin Stories Store ──────────────────────────────────────────────────────
import { STORIES } from '../data/stories.js'

export const useStoriesStore = create(
  persist(
    (set, get) => ({
      stories: STORIES,
      customStories: [],

      addStory: (story) => {
        set(s => ({ customStories: [...s.customStories, { ...story, id: `custom-${Date.now()}`, plays: 0, rating: 0 }] }))
      },

      updateStory: (id, updates) => {
        set(s => ({
          customStories: s.customStories.map(st => st.id === id ? { ...st, ...updates } : st)
        }))
      },

      deleteStory: (id) => {
        set(s => ({ customStories: s.customStories.filter(st => st.id !== id) }))
      },

      getAllStories: () => {
        const s = get()
        return [...s.stories, ...s.customStories]
      },

      incrementPlays: (storyId) => {
        set(s => ({
          stories: s.stories.map(st => st.id === storyId ? { ...st, plays: st.plays + 1 } : st)
        }))
      },
    }),
    { name: 'sf_stories', partialize: s => ({ customStories: s.customStories }) }
  )
)
