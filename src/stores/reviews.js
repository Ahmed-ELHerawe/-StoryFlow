import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useReviewsStore = create(
  persist(
    (set, get) => ({
      // { [storyId]: [{ id, userId, username, avatar, rating, text, date, endingType }] }
      reviews: {},

      addReview: (storyId, userId, username, avatar, rating, text, endingType) => {
        const id = `${userId}-${storyId}`
        set(s => {
          const storyReviews = s.reviews[storyId] || []
          const filtered = storyReviews.filter(r => r.userId !== userId) // one review per user
          return {
            reviews: {
              ...s.reviews,
              [storyId]: [
                { id, userId, username, avatar, rating, text, endingType, date: new Date().toISOString() },
                ...filtered,
              ]
            }
          }
        })
      },

      getReviews: (storyId) => get().reviews[storyId] || [],

      getAvgRating: (storyId) => {
        const reviews = get().reviews[storyId] || []
        if (!reviews.length) return 0
        return reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      },

      getUserReview: (storyId, userId) => {
        return (get().reviews[storyId] || []).find(r => r.userId === userId) || null
      },

      deleteReview: (storyId, userId) => {
        set(s => ({
          reviews: {
            ...s.reviews,
            [storyId]: (s.reviews[storyId] || []).filter(r => r.userId !== userId)
          }
        }))
      },
    }),
    { name: 'sf_reviews' }
  )
)
