import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const BADGES = [
  { id: 'first_story',    emoji: '📖', name: 'القارئ الأول',     desc: 'أكملت قصتك الأولى',              condition: (stats) => stats.storiesCompleted >= 1 },
  { id: 'explorer',       emoji: '🗺️', name: 'المستكشف',         desc: 'جربت 3 مسارات مختلفة في قصة واحدة', condition: (stats) => stats.uniquePaths >= 3 },
  { id: 'epic_ending',    emoji: '🏆', name: 'الأسطورة',          desc: 'حصلت على نهاية أسطورية',          condition: (stats) => stats.epicEndings >= 1 },
  { id: 'bad_ending',     emoji: '💀', name: 'المغامر المتهور',   desc: 'وصلت لنهاية محزنة',               condition: (stats) => stats.badEndings >= 1 },
  { id: 'completionist',  emoji: '💎', name: 'المكتمل',           desc: 'أكملت كل القصص المتاحة',          condition: (stats) => stats.storiesCompleted >= 3 },
  { id: 'speed_reader',   emoji: '⚡', name: 'القارئ السريع',     desc: 'أكملت قصة في أقل من 5 دقائق',    condition: (stats) => stats.fastCompletes >= 1 },
  { id: 'point_master',   emoji: '✨', name: 'سيد النقاط',        desc: 'جمعت 500 نقطة',                  condition: (stats) => stats.totalPoints >= 500 },
  { id: 'all_endings',    emoji: '🌈', name: 'كل المسارات',       desc: 'اكتشفت كل أنواع النهايات',       condition: (stats) => stats.endingTypes >= 4 },
  { id: 'social',         emoji: '🤝', name: 'المتحدي',           desc: 'تحديت صديقاً',                   condition: (stats) => stats.challengesSent >= 1 },
  { id: 'ai_story',       emoji: '🤖', name: 'مستكشف الذكاء',    desc: 'قرأت قصة مولودة بالذكاء الاصطناعي', condition: (stats) => stats.aiStoriesRead >= 1 },
]

export const useBadgesStore = create(
  persist(
    (set, get) => ({
      // { [userId]: { earnedIds: string[], stats: {...} } }
      userBadges: {},
      newBadge: null, // for toast notification

      getStats: (userId) => get().userBadges[userId]?.stats || {},
      getEarned: (userId) => get().userBadges[userId]?.earnedIds || [],

      updateStats: (userId, updates) => {
        set(s => {
          const prev = s.userBadges[userId] || { earnedIds: [], stats: {} }
          const newStats = { ...prev.stats, ...updates }
          // merge numeric fields
          Object.keys(updates).forEach(k => {
            if (typeof updates[k] === 'number' && typeof prev.stats[k] === 'number') {
              newStats[k] = Math.max(prev.stats[k], updates[k])
            }
          })
          // check for new badges
          const newlyEarned = BADGES.filter(b =>
            !prev.earnedIds.includes(b.id) && b.condition(newStats)
          )
          if (newlyEarned.length > 0) {
            setTimeout(() => {
              set({ newBadge: newlyEarned[0] })
              setTimeout(() => set({ newBadge: null }), 4000)
            }, 500)
          }
          return {
            userBadges: {
              ...s.userBadges,
              [userId]: {
                earnedIds: [...prev.earnedIds, ...newlyEarned.map(b => b.id)],
                stats: newStats,
              }
            }
          }
        })
      },

      clearNewBadge: () => set({ newBadge: null }),
    }),
    { name: 'sf_badges' }
  )
)
