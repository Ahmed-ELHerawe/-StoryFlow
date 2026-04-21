import React, { useRef, useState, useEffect, useCallback } from 'react'

export default function VideoPlayer({ chapter, onChoice, onVideoEnd }) {
  const videoRef = useRef(null)
  const containerRef = useRef(null)
  const controlsTimer = useRef(null)

  const [playing, setPlaying]         = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration]       = useState(0)
  const [volume, setVolume]           = useState(1)
  const [muted, setMuted]             = useState(false)
  const [showChoices, setShowChoices] = useState(false)
  const [choiceMade, setChoiceMade]   = useState(false)
  const [buffering, setBuffering]     = useState(false)
  const [videoError, setVideoError]   = useState(false)
  const [showControls, setShowControls] = useState(true)

  const hasChoices = chapter.choices?.length > 0
  const choiceAt   = chapter.choiceAt

  // ── Reset whenever chapter changes ──────────────────────────────
  useEffect(() => {
    const v = videoRef.current
    setShowChoices(false)
    setChoiceMade(false)
    setCurrentTime(0)
    setDuration(0)
    setPlaying(false)
    setVideoError(false)
    setBuffering(false)
    if (v) { v.pause(); v.load() }
  }, [chapter.id])

  // ── Cleanup timer on unmount ─────────────────────────────────────
  useEffect(() => () => clearTimeout(controlsTimer.current), [])

  // ── Time update → trigger choices ────────────────────────────────
  const handleTimeUpdate = useCallback(() => {
    const v = videoRef.current
    if (!v) return
    const t = v.currentTime
    setCurrentTime(t)
    if (hasChoices && !choiceMade && choiceAt && t >= choiceAt) {
      v.pause()
      setPlaying(false)
      setShowChoices(true)
    }
  }, [hasChoices, choiceMade, choiceAt])

  const handleEnded = useCallback(() => {
    setPlaying(false)
    if (hasChoices && !choiceMade) setShowChoices(true)
    else if (!hasChoices) onVideoEnd?.()
  }, [hasChoices, choiceMade, onVideoEnd])

  // ── Play / Pause ─────────────────────────────────────────────────
  const togglePlay = () => {
    const v = videoRef.current
    if (!v || videoError) return
    if (playing) {
      v.pause(); setPlaying(false)
    } else {
      v.play()
        .then(() => setPlaying(true))
        .catch(err => {
          console.error('play error:', err)
          setVideoError(true)
        })
    }
  }

  // ── Seek ─────────────────────────────────────────────────────────
  const handleSeek = (e) => {
    const v = videoRef.current
    if (!v || !duration) return
    const rect = e.currentTarget.getBoundingClientRect()
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width))
    v.currentTime = ratio * duration
    setCurrentTime(ratio * duration)
  }

  // ── Volume ───────────────────────────────────────────────────────
  const handleVolumeChange = (e) => {
    const v = videoRef.current
    const val = parseFloat(e.target.value)
    setVolume(val)
    setMuted(val === 0)
    if (v) v.volume = val
  }

  const toggleMute = () => {
    const v = videoRef.current
    const newMuted = !muted
    setMuted(newMuted)
    if (v) v.muted = newMuted
  }

  // ── Choice selected ───────────────────────────────────────────────
  const handleChoice = (choice) => {
    setChoiceMade(true)
    setShowChoices(false)
    onChoice(choice)
  }

  // ── Controls auto-hide ────────────────────────────────────────────
  const revealControls = () => {
    setShowControls(true)
    clearTimeout(controlsTimer.current)
    if (playing) controlsTimer.current = setTimeout(() => setShowControls(false), 3000)
  }

  // ── Helpers ───────────────────────────────────────────────────────
  const fmt = (s) => {
    if (!s || isNaN(s)) return '0:00'
    return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`
  }

  const progress      = duration ? Math.min(100, (currentTime / duration) * 100) : 0
  const choicePct     = duration && choiceAt ? Math.min(100, (choiceAt / duration) * 100) : null

  return (
    <div
      ref={containerRef}
      className="relative w-full bg-ink-950 rounded-2xl overflow-hidden select-none"
      style={{ aspectRatio: '16/9' }}
      onMouseMove={revealControls}
      onMouseLeave={() => playing && setShowControls(false)}
    >
      {/* ── Native Video ── */}
      <video
        key={chapter.id}
        ref={videoRef}
        className="w-full h-full object-cover"
        poster={chapter.videoThumbnail || undefined}
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() => setDuration(videoRef.current?.duration || 0)}
        onCanPlay={() => setBuffering(false)}
        onWaiting={() => setBuffering(true)}
        onPlaying={() => setBuffering(false)}
        onEnded={handleEnded}
        onError={() => { setVideoError(true); setBuffering(false) }}
        playsInline
        preload="metadata"
        crossOrigin="anonymous"
      >
        <source src={chapter.videoUrl} />
      </video>

      {/* ── Error State ── */}
      {videoError && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-ink-900 gap-4 z-20">
          <div className="text-5xl">📽️</div>
          <p className="text-mist-400 text-sm text-center px-8 leading-relaxed">
            تعذّر تحميل الفيديو
            <br />
            <span className="text-mist-600 text-xs">
              تأكد من اتصال الإنترنت أو غيّر رابط الفيديو
            </span>
          </p>
          <div className="flex gap-3">
            {hasChoices && (
              <button onClick={() => setShowChoices(true)} className="btn-gold text-sm px-5 py-2 rounded-xl">
                الاختيارات ←
              </button>
            )}
            {!hasChoices && (
              <button onClick={() => onVideoEnd?.()} className="btn-gold text-sm px-5 py-2 rounded-xl">
                متابعة ←
              </button>
            )}
            <button
              onClick={() => { setVideoError(false); videoRef.current?.load() }}
              className="btn-ghost text-sm px-5 py-2 rounded-xl"
            >
              إعادة المحاولة
            </button>
          </div>
        </div>
      )}

      {/* ── Buffering Spinner ── */}
      {buffering && !videoError && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-12 h-12 border-2 border-gold-500/30 border-t-gold-500 rounded-full animate-spin" />
        </div>
      )}

      {/* ── Big Play Button ── */}
      {!playing && !showChoices && !videoError && (
        <button
          onClick={togglePlay}
          className="absolute inset-0 flex items-center justify-center z-10 group/play"
        >
          <div className="w-20 h-20 rounded-full bg-gold-500/20 border-2 border-gold-500/70 flex items-center justify-center backdrop-blur-sm group-hover/play:bg-gold-500/30 transition-all animate-pulse-glow">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor" className="text-gold-400 ml-1">
              <path d="M8 5v14l11-7z"/>
            </svg>
          </div>
        </button>
      )}

      {/* ── Choice Timestamp Marker ── */}
      {choicePct !== null && !choiceMade && !videoError && (
        <div
          className="absolute w-2.5 h-2.5 rounded-full bg-ember-400 border-2 border-ink-950 -translate-x-1/2 pointer-events-none z-10"
          style={{ left: `${choicePct}%`, bottom: '52px' }}
        />
      )}

      {/* ── Controls Bar ── */}
      {!videoError && (
        <div
          className={`absolute bottom-0 left-0 right-0 custom-video-controls px-4 pt-8 pb-3 z-10 transition-opacity duration-300 ${
            showControls || !playing ? 'opacity-100' : 'opacity-0'
          }`}
        >
          {/* Progress */}
          <div
            className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer mb-3 relative group/bar"
            onClick={handleSeek}
          >
            <div
              className="h-full bg-gold-500 rounded-full transition-none"
              style={{ width: `${progress}%` }}
            />
            <div
              className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-3.5 h-3.5 rounded-full bg-gold-400 shadow opacity-0 group-hover/bar:opacity-100 transition-opacity pointer-events-none"
              style={{ left: `${progress}%` }}
            />
          </div>

          {/* Buttons row */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Play/Pause */}
              <button onClick={togglePlay} className="text-white/80 hover:text-gold-400 transition-colors w-7 h-7 flex items-center justify-center">
                {playing
                  ? <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>
                  : <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>
                }
              </button>

              {/* Volume */}
              <div className="flex items-center gap-2">
                <button onClick={toggleMute} className="text-white/60 hover:text-white/90 transition-colors">
                  {muted || volume === 0
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12A4.5 4.5 0 0 0 14 7.97v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51A8.796 8.796 0 0 0 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06A8.99 8.99 0 0 0 17.73 18L19 19.27 20.27 18 5.27 3 4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>
                    : volume < 0.5
                    ? <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M18.5 12A4.5 4.5 0 0 0 16 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z"/></svg>
                    : <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3A4.5 4.5 0 0 0 14 7.97v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>
                  }
                </button>
                <input
                  type="range" min="0" max="1" step="0.05"
                  value={muted ? 0 : volume}
                  onChange={handleVolumeChange}
                  className="w-16 accent-gold-500 cursor-pointer"
                />
              </div>

              <span className="text-xs text-white/50 tabular-nums">
                {fmt(currentTime)} / {fmt(duration)}
              </span>
            </div>

            <span className="text-xs text-white/30 hidden sm:block truncate max-w-[200px]">
              {chapter.title}
            </span>
          </div>
        </div>
      )}

      {/* ── Choices Overlay ── */}
      {showChoices && (
        <div className="absolute inset-0 flex flex-col items-center justify-end bg-gradient-to-t from-ink-950/96 via-ink-950/60 to-transparent choices-overlay z-20">
          <div className="w-full max-w-2xl px-6 pb-8">
            {chapter.choicePrompt && (
              <p className="text-center text-gold-400 font-display font-bold text-xl mb-6 animate-fade-up">
                {chapter.choicePrompt}
              </p>
            )}
            <div className="flex flex-col gap-3">
              {chapter.choices.map((choice, i) => (
                <button
                  key={choice.id}
                  onClick={() => handleChoice(choice)}
                  className="choice-card p-4 text-right w-full"
                  style={{
                    opacity: 0,
                    animation: `choiceIn 0.5s cubic-bezier(0.34,1.56,0.64,1) ${i * 0.12}s forwards`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl flex-shrink-0">{choice.icon}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-mist-100 font-medium">{choice.text}</p>
                      {choice.consequence && (
                        <p className="text-xs text-mist-400 mt-0.5">{choice.consequence}</p>
                      )}
                    </div>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-mist-500 flex-shrink-0">
                      <path d="M15 18l-6-6 6-6"/>
                    </svg>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
