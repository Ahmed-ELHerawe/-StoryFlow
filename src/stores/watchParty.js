import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Watch Party — simulated real-time via localStorage polling
// Real WebSocket would need a backend; this works locally for demo

export const useWatchPartyStore = create(
  persist(
    (set, get) => ({
      // Active rooms: { [roomCode]: { code, storyId, storyTitle, hostId, hostName, members, votes, currentChapterId, phase, createdAt } }
      rooms: {},
      myRoomCode: null,

      createRoom: (hostId, hostName, storyId, storyTitle, startChapterId) => {
        const code = Math.random().toString(36).slice(2, 7).toUpperCase()
        const room = {
          code, storyId, storyTitle,
          hostId, hostName,
          members: [{ id: hostId, name: hostName, joinedAt: new Date().toISOString() }],
          votes: {},
          currentChapterId: startChapterId,
          phase: 'waiting', // waiting | watching | voting | result
          createdAt: new Date().toISOString(),
          lastUpdate: Date.now(),
        }
        set(s => ({ rooms: { ...s.rooms, [code]: room }, myRoomCode: code }))
        return code
      },

      joinRoom: (code, userId, userName) => {
        const room = get().rooms[code.toUpperCase()]
        if (!room) return { success: false, error: 'الغرفة غير موجودة' }
        if (room.members.find(m => m.id === userId)) {
          set({ myRoomCode: code.toUpperCase() })
          return { success: true, room }
        }
        const updated = {
          ...room,
          members: [...room.members, { id: userId, name: userName, joinedAt: new Date().toISOString() }],
          lastUpdate: Date.now(),
        }
        set(s => ({ rooms: { ...s.rooms, [code.toUpperCase()]: updated }, myRoomCode: code.toUpperCase() }))
        return { success: true, room: updated }
      },

      getRoom: (code) => code ? get().rooms[code.toUpperCase()] : null,

      startWatching: (code) => {
        set(s => {
          const room = s.rooms[code]
          if (!room) return s
          return { rooms: { ...s.rooms, [code]: { ...room, phase: 'watching', lastUpdate: Date.now() } } }
        })
      },

      startVoting: (code) => {
        set(s => {
          const room = s.rooms[code]
          if (!room) return s
          return { rooms: { ...s.rooms, [code]: { ...room, phase: 'voting', votes: {}, lastUpdate: Date.now() } } }
        })
      },

      castVote: (code, userId, choiceId) => {
        set(s => {
          const room = s.rooms[code]
          if (!room) return s
          return {
            rooms: {
              ...s.rooms,
              [code]: { ...room, votes: { ...room.votes, [userId]: choiceId }, lastUpdate: Date.now() }
            }
          }
        })
      },

      resolveVote: (code) => {
        const room = get().rooms[code]
        if (!room) return null
        const votes = room.votes
        const tally = {}
        Object.values(votes).forEach(v => { tally[v] = (tally[v] || 0) + 1 })
        const winner = Object.entries(tally).sort((a, b) => b[1] - a[1])[0]?.[0]
        return winner || null
      },

      advanceChapter: (code, nextChapterId) => {
        set(s => {
          const room = s.rooms[code]
          if (!room) return s
          return {
            rooms: {
              ...s.rooms,
              [code]: { ...room, currentChapterId: nextChapterId, phase: 'watching', votes: {}, lastUpdate: Date.now() }
            }
          }
        })
      },

      leaveRoom: (code, userId) => {
        set(s => {
          const room = s.rooms[code]
          if (!room) return { ...s, myRoomCode: null }
          const updated = { ...room, members: room.members.filter(m => m.id !== userId), lastUpdate: Date.now() }
          return { rooms: { ...s.rooms, [code]: updated }, myRoomCode: null }
        })
      },

      closeRoom: (code) => {
        set(s => {
          const rooms = { ...s.rooms }
          delete rooms[code]
          return { rooms, myRoomCode: null }
        })
      },
    }),
    { name: 'sf_watchparty' }
  )
)
