import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatchPartyStore } from '../stores/watchParty'
import { useStoriesStore } from '../stores'
import { useAuthStore } from '../stores'
import VideoPlayer from '../components/VideoPlayer'
import CountdownTimer from '../components/CountdownTimer'
import { ENDING_CONFIG } from '../data/stories'

export default function WatchParty() {
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const { getAllStories } = useStoriesStore()
  const {
    createRoom, joinRoom, getRoom, startWatching, startVoting,
    castVote, resolveVote, advanceChapter, leaveRoom, closeRoom, myRoomCode
  } = useWatchPartyStore()

  const [view, setView]         = useState('lobby') // lobby | create | join | room
  const [joinCode, setJoinCode] = useState('')
  const [joinError, setJoinError] = useState('')
  const [selectedStory, setSelectedStory] = useState('')
  const [room, setRoom]         = useState(null)
  const [votingCountdown, setVotingCountdown] = useState(false)
  const [showResult, setShowResult] = useState(null)

  const allStories = getAllStories()

  // Poll room state every second (simulating real-time)
  useEffect(() => {
    if (!room?.code) return
    const interval = setInterval(() => {
      const updated = getRoom(room.code)
      if (updated) setRoom({ ...updated })
    }, 1000)
    return () => clearInterval(interval)
  }, [room?.code])

  const isHost = room?.hostId === user?.id
  const story = allStories.find(s => s.id === room?.storyId)
  const chapter = story?.chapters[room?.currentChapterId]

  const handleCreate = () => {
    if (!selectedStory) return
    const s = allStories.find(st => st.id === selectedStory)
    const code = createRoom(user.id, user.username, s.id, s.title, s.startChapterId)
    setRoom(getRoom(code))
    setView('room')
  }

  const handleJoin = () => {
    setJoinError('')
    const result = joinRoom(joinCode, user.id, user.username)
    if (!result.success) { setJoinError(result.error); return }
    setRoom(result.room)
    setView('room')
  }

  const handleVote = (choiceId) => {
    castVote(room.code, user.id, choiceId)
    setRoom(getRoom(room.code))
  }

  const handleResolve = () => {
    const winner = resolveVote(room.code)
    const choice = chapter?.choices?.find(c => c.id === winner)
    if (choice) {
      setShowResult(choice)
      setTimeout(() => {
        advanceChapter(room.code, choice.nextChapterId)
        setRoom(getRoom(room.code))
        setShowResult(null)
        setVotingCountdown(false)
      }, 2500)
    }
  }

  const handleLeave = () => {
    if (isHost) closeRoom(room.code)
    else leaveRoom(room.code, user.id)
    setRoom(null)
    setView('lobby')
  }

  const myVote = room?.votes?.[user?.id]
  const totalVotes = Object.keys(room?.votes || {}).length
  const memberCount = room?.members?.length || 0

  // ── LOBBY ──────────────────────────────────────────────────────────
  if (view === 'lobby') return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-10">
          <div className="text-6xl mb-4">🎬</div>
          <h1 className="font-display text-3xl font-black text-mist-100 mb-2">مشاهدة جماعية</h1>
          <p className="text-mist-400 text-sm">شاهد القصص مع أصدقائك وصوّتوا على الاختيارات معاً</p>
        </div>
        <div className="space-y-3">
          <button onClick={() => setView('create')} className="btn-gold w-full py-4 rounded-xl text-base">
            🎭 إنشاء غرفة جديدة
          </button>
          <button onClick={() => setView('join')} className="btn-ghost w-full py-4 rounded-xl text-base">
            🚪 الانضمام لغرفة
          </button>
        </div>
      </div>
    </div>
  )

  // ── CREATE ─────────────────────────────────────────────────────────
  if (view === 'create') return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center p-4">
      <div className="card-dark p-8 max-w-md w-full">
        <h2 className="font-display text-xl font-bold text-mist-100 mb-6">اختر القصة</h2>
        <div className="space-y-2 mb-6 max-h-64 overflow-y-auto">
          {allStories.map(s => (
            <button key={s.id} onClick={() => setSelectedStory(s.id)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl border transition-all text-right ${
                selectedStory === s.id ? 'border-gold-500/60 bg-gold-500/10' : 'border-ink-600 hover:border-ink-500'
              }`}>
              <img src={s.cover} alt="" className="w-12 h-10 rounded-lg object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-mist-200 truncate">{s.title}</p>
                <p className="text-xs text-mist-500">{s.totalChapters} فصول</p>
              </div>
              {selectedStory === s.id && <span className="text-gold-400">✓</span>}
            </button>
          ))}
        </div>
        <div className="flex gap-3">
          <button onClick={handleCreate} disabled={!selectedStory} className="btn-gold flex-1 py-3 rounded-xl disabled:opacity-40">
            إنشاء الغرفة ←
          </button>
          <button onClick={() => setView('lobby')} className="btn-ghost px-5 py-3 rounded-xl">رجوع</button>
        </div>
      </div>
    </div>
  )

  // ── JOIN ───────────────────────────────────────────────────────────
  if (view === 'join') return (
    <div className="min-h-screen pt-24 pb-20 flex items-center justify-center p-4">
      <div className="card-dark p-8 max-w-sm w-full">
        <h2 className="font-display text-xl font-bold text-mist-100 mb-6">انضم لغرفة</h2>
        <input value={joinCode} onChange={e => setJoinCode(e.target.value.toUpperCase())}
          placeholder="أدخل كود الغرفة"
          className="input-dark text-center text-2xl font-mono tracking-widest mb-3" maxLength={5} />
        {joinError && <p className="text-xs text-red-400 mb-3">{joinError}</p>}
        <div className="flex gap-3">
          <button onClick={handleJoin} disabled={joinCode.length < 4} className="btn-gold flex-1 py-3 rounded-xl disabled:opacity-40">
            انضم ←
          </button>
          <button onClick={() => setView('lobby')} className="btn-ghost px-5 py-3 rounded-xl">رجوع</button>
        </div>
      </div>
    </div>
  )

  // ── ROOM ───────────────────────────────────────────────────────────
  if (!room || !story || !chapter) return null

  const isEnding = chapter.endingType !== null && chapter.endingType !== undefined
  const endingConfig = isEnding ? ENDING_CONFIG[chapter.endingType] : null

  return (
    <div className="min-h-screen pt-16 bg-ink-950">
      <div className="max-w-5xl mx-auto px-4 py-6">
        {/* Room header */}
        <div className="flex items-center gap-4 mb-6 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-800 border border-ink-600">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            <span className="font-mono text-gold-400 font-bold text-sm">{room.code}</span>
            <span className="text-mist-500 text-xs">({memberCount} مشاهد)</span>
          </div>
          <div className="text-sm text-mist-300">{story.title}</div>
          {isHost && <span className="text-xs text-amber-400 bg-amber-400/10 px-2 py-1 rounded-full">👑 مضيف</span>}
          <button onClick={handleLeave} className="mr-auto text-xs text-red-400 hover:text-red-300 transition-colors">
            مغادرة الغرفة
          </button>
        </div>

        {/* Members */}
        <div className="flex flex-wrap gap-2 mb-6">
          {room.members.map(m => (
            <div key={m.id} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-ink-800 border border-ink-600 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
              <span className="text-mist-300">{m.name}</span>
              {m.id === room.hostId && <span className="text-amber-400">👑</span>}
              {room.votes[m.id] && <span className="text-gold-400">✓</span>}
            </div>
          ))}
        </div>

        {/* Waiting phase */}
        {room.phase === 'waiting' && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">⏳</div>
            <p className="text-mist-400 mb-2">في انتظار بدء المشاهدة</p>
            <p className="text-xs text-mist-600 mb-6">{memberCount} مشاهد في الغرفة</p>
            {isHost && (
              <button onClick={() => { startWatching(room.code); setRoom(getRoom(room.code)) }}
                className="btn-gold px-10 py-3 rounded-xl">
                ابدأ المشاهدة ▶
              </button>
            )}
          </div>
        )}

        {/* Watching phase */}
        {room.phase === 'watching' && (
          <div className="space-y-4">
            <VideoPlayer
              key={chapter.id}
              chapter={{ ...chapter, choices: [] }} // hide choices — voting handles it
              onChoice={() => {}}
              onVideoEnd={() => {
                if (isEnding) return
                if (isHost) { startVoting(room.code); setVotingCountdown(true); setRoom(getRoom(room.code)) }
              }}
            />
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-display text-xl font-bold text-mist-100">{chapter.title}</h2>
                <p className="text-sm text-mist-400">{chapter.description}</p>
              </div>
              {isHost && !isEnding && (
                <button onClick={() => { startVoting(room.code); setVotingCountdown(true); setRoom(getRoom(room.code)) }}
                  className="btn-ghost text-sm px-4 py-2 rounded-xl">
                  بدء التصويت ←
                </button>
              )}
            </div>
          </div>
        )}

        {/* Voting phase */}
        {room.phase === 'voting' && chapter.choices?.length > 0 && (
          <div className="space-y-4">
            <div className="card-dark p-5">
              <p className="text-center text-gold-400 font-display font-bold text-lg mb-2">
                {chapter.choicePrompt || 'صوّت على الاختيار!'}
              </p>
              <CountdownTimer
                seconds={20}
                paused={!votingCountdown}
                onExpire={() => isHost && handleResolve()}
              />
            </div>

            {showResult ? (
              <div className="text-center py-8 animate-fade-up">
                <div className="text-5xl mb-3">{showResult.icon}</div>
                <p className="font-display text-xl font-bold text-gold-400 mb-1">الفائز بالتصويت!</p>
                <p className="text-mist-200">{showResult.text}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {chapter.choices.map(choice => {
                  const votes = Object.values(room.votes).filter(v => v === choice.id).length
                  const pct = totalVotes ? Math.round((votes / totalVotes) * 100) : 0
                  const isMyVote = myVote === choice.id
                  return (
                    <button key={choice.id} onClick={() => handleVote(choice.id)}
                      className={`choice-card w-full p-4 text-right ${isMyVote ? 'border-gold-500/60' : ''}`}>
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-2xl">{choice.icon}</span>
                        <span className="flex-1 text-mist-100 font-medium">{choice.text}</span>
                        <span className="text-sm font-bold text-gold-400">{votes} 🗳️</span>
                        {isMyVote && <span className="text-xs text-green-400">✓ صوتك</span>}
                      </div>
                      <div className="h-1.5 bg-ink-700 rounded-full overflow-hidden">
                        <div className="h-full bg-gold-500/70 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
                      </div>
                    </button>
                  )
                })}
                {isHost && (
                  <button onClick={handleResolve} className="btn-gold w-full py-3 rounded-xl mt-2">
                    إنهاء التصويت والمتابعة ←
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Ending */}
        {isEnding && endingConfig && (
          <div className="text-center py-12 animate-fade-up">
            <div className="text-7xl mb-4">{endingConfig.emoji}</div>
            <span className={`inline-block genre-badge border mb-3 ${endingConfig.bg} ${endingConfig.color}`}>
              {endingConfig.label}
            </span>
            <h2 className="font-display text-3xl font-black text-mist-100 mb-2">{chapter.title}</h2>
            <p className="text-mist-400 mb-6">{chapter.description}</p>
            <button onClick={handleLeave} className="btn-gold px-8 py-3 rounded-xl">مغادرة الغرفة</button>
          </div>
        )}
      </div>
    </div>
  )
}
