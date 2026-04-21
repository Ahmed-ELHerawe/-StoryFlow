import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Each choice in a story can carry stat effects like:
// { courage: +2, intelligence: -1, luck: +1 }
// We attach these to choices in stories that support RPG mode.

export const RPG_STATS = [
  { id: 'courage',      label: 'الشجاعة',    emoji: '⚔️', color: 'text-ember-400',  max: 20 },
  { id: 'intelligence', label: 'الذكاء',     emoji: '🧠', color: 'text-blue-400',   max: 20 },
  { id: 'luck',         label: 'الحظ',       emoji: '🍀', color: 'text-green-400',  max: 20 },
  { id: 'wisdom',       label: 'الحكمة',     emoji: '📚', color: 'text-purple-400', max: 20 },
  { id: 'stealth',      label: 'التخفي',     emoji: '🌑', color: 'text-mist-400',   max: 20 },
]

const DEFAULT_STATS = { courage: 5, intelligence: 5, luck: 5, wisdom: 5, stealth: 5 }

export const useRPGStore = create(
  persist(
    (set, get) => ({
      // { [userId]: { [storyId]: { stats, history: [{choiceText, effects, chapterId}] } } }
      characters: {},

      getCharacter: (userId, storyId) => {
        return get().characters[userId]?.[storyId] || { stats: { ...DEFAULT_STATS }, history: [] }
      },

      initCharacter: (userId, storyId) => {
        set(s => {
          if (s.characters[userId]?.[storyId]) return s
          return {
            characters: {
              ...s.characters,
              [userId]: {
                ...s.characters[userId],
                [storyId]: { stats: { ...DEFAULT_STATS }, history: [] }
              }
            }
          }
        })
      },

      applyEffects: (userId, storyId, effects, choiceText, chapterId) => {
        if (!effects || Object.keys(effects).length === 0) return
        set(s => {
          const prev = s.characters[userId]?.[storyId] || { stats: { ...DEFAULT_STATS }, history: [] }
          const newStats = { ...prev.stats }
          Object.entries(effects).forEach(([stat, delta]) => {
            newStats[stat] = Math.max(0, Math.min(20, (newStats[stat] || 5) + delta))
          })
          return {
            characters: {
              ...s.characters,
              [userId]: {
                ...s.characters[userId],
                [storyId]: {
                  stats: newStats,
                  history: [...prev.history, { choiceText, effects, chapterId, date: new Date().toISOString() }]
                }
              }
            }
          }
        })
      },

      // Check if a choice is available based on stat requirements
      // e.g. requires: { courage: 8 } means courage must be >= 8
      isChoiceAvailable: (userId, storyId, requires) => {
        if (!requires) return true
        const char = get().getCharacter(userId, storyId)
        return Object.entries(requires).every(([stat, min]) => (char.stats[stat] || 0) >= min)
      },

      resetCharacter: (userId, storyId) => {
        set(s => {
          const updated = { ...s.characters[userId] }
          delete updated[storyId]
          return { characters: { ...s.characters, [userId]: updated } }
        })
      },
    }),
    { name: 'sf_rpg' }
  )
)
