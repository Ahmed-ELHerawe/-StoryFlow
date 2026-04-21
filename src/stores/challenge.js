import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useChallengeStore = create(
  persist(
    (set, get) => ({
      // challenges keyed by code
      challenges: {},

      createChallenge: (userId, username, storyId, storyTitle, endingType, points, path) => {
        const code = Math.random().toString(36).slice(2, 8).toUpperCase()
        const challenge = {
          code,
          storyId,
          storyTitle,
          challenger: { userId, username },
          endingType,
          points,
          path,
          createdAt: new Date().toISOString(),
          responses: [],
        }
        set(s => ({ challenges: { ...s.challenges, [code]: challenge } }))
        return code
      },

      getChallenge: (code) => get().challenges[code.toUpperCase()] || null,

      respondToChallenge: (code, userId, username, endingType, points) => {
        set(s => {
          const ch = s.challenges[code]
          if (!ch) return s
          const already = ch.responses.find(r => r.userId === userId)
          if (already) return s
          return {
            challenges: {
              ...s.challenges,
              [code]: {
                ...ch,
                responses: [...ch.responses, { userId, username, endingType, points, date: new Date().toISOString() }]
              }
            }
          }
        })
      },

      getUserChallenges: (userId) => {
        return Object.values(get().challenges).filter(
          ch => ch.challenger.userId === userId || ch.responses.some(r => r.userId === userId)
        )
      },
    }),
    { name: 'sf_challenges' }
  )
)
