import React, { useEffect, useState, useCallback } from 'react'
import { useParams, Link, useSearchParams } from 'react-router-dom'
import { useAuthStore, useReaderStore, useStoriesStore } from '../stores'
import { useBadgesStore } from '../stores/badges'
import { useAnalyticsStore } from '../stores/analytics'
import { useChallengeStore } from '../stores/challenge'
import { useRPGStore } from '../stores/rpg'
import { useDailyStore } from '../stores/daily'
import { useVoiceNarrator } from '../hooks/useVoiceNarrator'
import VideoPlayer from '../components/VideoPlayer'
import StoryPath from '../components/StoryPath'
import StoryTree from '../components/StoryTree'
import CountdownTimer from '../components/CountdownTimer'
import { RPGStatsPanel, StatEffectBadge } from '../components/RPGStats'
import { ChallengeShareModal } from '../components/ChallengeModal'
import { ReviewForm, ReviewsList } from '../components/Reviews'
import { ENDING_CONFIG, GENRES } from '../data/stories'

export default function Read() {
  const { storyId } = useParams()
  const [searchParams] = useSearchParams()
  const challengeCode = searchParams.get('challenge')

  const { user } = useAuthStore()
  const { getProgress, startStory, makeChoice, completeStory, resetStory } = useReaderStore()
  const { getAllStories, incrementPlays } = useStoriesStore()
  const { updateStats } = useBadgesStore()
  const { recordChoice } = useAnalyticsStore()
  const { respondToChallenge } = useChallengeStore()
  const { getCharacter, initCharacter, applyEffects, isChoiceAvailable } = useRPGStore()
  const { getDailyStory, recordDailyComplete, isCompletedToday } = useDailyStore()
  const { toggle: toggleVoice, speaking, supported: voiceSupported } = useVoiceNarrator()

  const story = getAllStories().find(s => s.id === storyId)
  const progress = getProgress(user.id, storyId)
  const character = getCharacter(user.id, storyId)

  const [showEndScreen, setShowEndScreen]   = useState(false)
  const [justFinished, setJustFinished]     = useState(null)
  const [showChallenge, setShowChallenge]   = useState(false)
  const [showTree, setShowTree]             = useState(false)
  const [showReviews, setShowReviews]       = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [statDeltas, setStatDeltas]         = useState({})
  const [countdownActive, setCountdownActive] = useState(false)
  const [choicesVisible, setChoicesVisible] = useState(false)
  const [startTime] = useState(Date.now())

  // Determine if this is today's daily story
  const allStories = getAllStories()
  const dailyStory = getDailyStory(allStories)
  const isDailyStory = dailyStory?.id === storyId
  const alreadyDoneToday = isCompletedToday(user.id)

  useEffect(() => {
    if (!story) return
    if (!progress) {
      startStory(user.id, storyId, story.startChapterId)
      incrementPlays(storyId)
    }
    initCharacter(user.id, storyId)
  }, [storyId])

  if (!story) return (
    <div className="min-h-screen pt-24 flex items-center justify-center">
      <div className="text-center">
        <p className="text-mist-400 mb-4">القصة غير موجودة</p>
        <Link to="/stories" className="btn-gold">العودة</Link>
      </div>
    </div>
  )

  const currentChapterId = progress?.currentChapterId || story.startChapterId
  const chapter = story.chapters[currentChapterId]
  if (!chapter) return null

  const isEnding = chapter.endingType !== null && chapter.endingType !== undefined
  const endingConfig = isEnding ? ENDING_CONFIG[chapter.endingType] : null
  const genre = GENRES.find(g => g.id === story.genre)

  // When video reaches choiceAt — show countdown
  const handleChoice = useCallback((choice) => {
    recordChoice(storyId, currentChapterId, choice.id)
    if (choice.effects) {
      setStatDeltas(choice.effects)
      applyEffects(user.id, storyId, choice.effects, choice.text, currentChapterId)
      setTimeout(() => setStatDeltas({}), 3000)
    }
    setCountdownActive(false)
    setChoicesVisible(false)
    makeChoice(user.id, storyId, choice.nextChapterId)
  }, [storyId, currentChapterId, user.id])

  // VideoPlayer calls this when it's time to show choices
  const handleChoicesReveal = () => {
    setCountdownActive(true)
    setChoicesVisible(true)
  }

  const handleCountdownExpire = () => {
    // Auto-pick first available choice
    const available = chapter.choices?.filter(c =>
      isChoiceAvailable(user.id, storyId, c.requires)
    )
    if (available?.length) handleChoice(available[0])
  }

  const handleVideoEnd = () => {
    if (!isEnding) return
    const pts = chapter.points || 0
    const bonusPts = isDailyStory && !alreadyDoneToday ? Math.round(pts * 0.5) : 0
    const finalPts = pts + bonusPts
    completeStory(user.id, storyId, chapter.endingType, finalPts)
    const elapsed = Math.round((Date.now() - startTime) / 1000)
    updateStats(user.id, {
      storiesCompleted: 1,
      totalPoints: finalPts,
      epicEndings: chapter.endingType === 'epic' ? 1 : 0,
      badEndings: chapter.endingType === 'bad' ? 1 : 0,
      endingTypes: 1,
      uniquePaths: progress?.path?.length || 0,
      fastCompletes: elapsed < 300 ? 1 : 0,
    })
    if (isDailyStory) recordDailyComplete(user.id)
    if (challengeCode) respondToChallenge(challengeCode, user.id, user.username, chapter.endingType, finalPts)
    setJustFinished({ ...chapter, points: finalPts, bonusPts })
    setShowEndScreen(true)
  }

  const handleRestart = () => {
    resetStory(user.id, storyId)
    startStory(user.id, storyId, story.startChapterId)
    incrementPlays(storyId)
    setShowEndScreen(false)
    setJustFinished(null)
    setCountdownActive(false)
    setChoicesVisible(false)
  }

  // Filter choices by RPG requirements
  const availableChoices = chapter.choices?.filter(c =>
    isChoiceAvailable(user.id, storyId, c.requires)
  ) || []
  const hasRPGChoices = chapter.choices?.some(c => c.effects || c.requires)

  return (
    <div className="min-h-screen pt-16 bg-ink-950">
      {showChallenge && justFinished && (
        <ChallengeShareModal
          story={story}
          progress={{ ...progress, endingType: justFinished.endingType, points: justFinished.points }}
          onClose={() => setShowChallenge(false)}
        />
      )}

      {/* ── End Screen ── */}
      {showEndScreen && justFinished && endingConfig && (
        <div className="fixed inset-0 z-50 bg-ink-950/96 backdrop-blur-xl flex items-center justify-center p-4 overflow-y-auto">
          <div className="max-w-lg w-full text-center animate-fade-up py-8">
            <div className="text-7xl mb-4">{endingConfig.emoji}</div>
            <span className={`inline-block genre-badge border mb-3 text-sm ${endingConfig.bg} ${endingConfig.color}`}>
              {endingConfig.label}
            </span>
            <h2 className="font-display text-3xl font-black text-mist-100 mb-2">{justFinished.title}</h2>
            <p className="text-mist-400 leading-relaxed mb-4">{justFinished.description}</p>

            {/* Points */}
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold-500/10 border border-gold-500/30 text-gold-400 text-xl font-bold">
                ✨ +{justFinished.points} نقطة
              </div>
              {justFinished.bonusPts > 0 && (
                <div className="inline-flex items-center gap-1 px-3 py-2.5 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 text-sm font-medium">
                  🌟 +{justFinished.bonusPts} bonus يومي
                </div>
              )}
            </div>

            {progress?.path && (
              <div className="mb-5 text-right"><StoryPath path={progress.path} chapters={story.chapters} /></div>
            )}

            {/* Review CTA */}
            {!showReviewForm ? (
              <button onClick={() => setShowReviewForm(true)}
                className="w-full mb-3 py-2.5 rounded-xl border border-gold-500/30 text-gold-400 text-sm hover:bg-gold-500/10 transition-all">
                ⭐ قيّم القصة
              </button>
            ) : (
              <div className="card-dark p-4 mb-4 text-right">
                <ReviewForm storyId={storyId} endingType={justFinished.endingType} onClose={() => setShowReviewForm(false)} />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 mb-3">
              <button onClick={handleRestart} className="btn-gold py-3 rounded-xl">🔄 ألعب مجدداً</button>
              <button onClick={() => setShowChallenge(true)} className="btn-ghost py-3 rounded-xl">⚔️ تحدّي صديق</button>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Link to="/badges" className="btn-ghost py-3 rounded-xl text-center">🏅 إنجازاتي</Link>
              <Link to="/stories" className="btn-ghost py-3 rounded-xl text-center">📚 قصص أخرى</Link>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb + Daily badge */}
        <div className="flex items-center gap-3 mb-6 flex-wrap">
          <Link to="/stories" className="text-mist-500 hover:text-mist-300 text-sm">← القصص</Link>
          <span className="text-ink-600">/</span>
          {genre && <span className={`genre-badge border text-xs ${genre.color}`}>{genre.emoji} {genre.label}</span>}
          <span className="font-display font-bold text-mist-200 text-sm truncate max-w-[180px]">{story.title}</span>
          {story.isAI && <span className="genre-badge border text-xs bg-purple-500/10 border-purple-500/30 text-purple-400">🤖 AI</span>}
          {isDailyStory && !alreadyDoneToday && (
            <span className="genre-badge border text-xs bg-amber-500/10 border-amber-500/30 text-amber-400 animate-pulse">
              🌟 قصة اليوم +50% نقاط
            </span>
          )}
          {isEnding && endingConfig && (
            <span className={`mr-auto genre-badge border text-xs ${endingConfig.bg} ${endingConfig.color}`}>
              {endingConfig.emoji} {endingConfig.label}
            </span>
          )}
        </div>

        {/* Video */}
        <div className="mb-4">
          <VideoPlayer
            key={chapter.id}
            chapter={{
              ...chapter,
              choices: availableChoices.map(c => ({
                ...c,
                consequence: c.consequence || '',
              }))
            }}
            onChoice={handleChoice}
            onVideoEnd={handleVideoEnd}
            onChoicesReveal={handleChoicesReveal}
          />
        </div>

        {/* Countdown Timer — shown when choices appear */}
        {choicesVisible && chapter.choices?.length > 0 && !isEnding && (
          <div className="card-dark p-4 mb-4">
            <CountdownTimer
              key={currentChapterId}
              seconds={20}
              paused={!countdownActive}
              onExpire={handleCountdownExpire}
            />
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            {/* Title + voice */}
            <div className="flex items-start gap-3">
              <div className="flex-1">
                <h2 className="font-display text-2xl font-bold text-mist-100 mb-1">{chapter.title}</h2>
                <p className="text-mist-400 leading-relaxed">{chapter.description}</p>
              </div>
              {voiceSupported && (
                <button
                  onClick={() => toggleVoice(`${chapter.title}. ${chapter.description}`)}
                  className={`flex-shrink-0 w-10 h-10 rounded-full border flex items-center justify-center transition-all ${
                    speaking ? 'border-gold-500/60 bg-gold-500/20 text-gold-400' : 'border-ink-600 text-mist-500 hover:border-ink-500'
                  }`}
                >
                  {speaking ? '⏸' : '🔊'}
                </button>
              )}
            </div>

            {progress?.path && progress.path.length > 1 && (
              <StoryPath path={progress.path} chapters={story.chapters} />
            )}

            {/* Tree Toggle */}
            <button onClick={() => setShowTree(!showTree)} className="w-full btn-ghost text-sm py-2.5 rounded-xl">
              📊 {showTree ? 'إخفاء' : 'إظهار'} خريطة قرارات القراء
            </button>
            {showTree && <StoryTree story={story} />}

            {/* Reviews Toggle */}
            <button onClick={() => setShowReviews(!showReviews)} className="w-full btn-ghost text-sm py-2.5 rounded-xl">
              ⭐ {showReviews ? 'إخفاء' : 'إظهار'} تقييمات القصة
            </button>
            {showReviews && (
              <div className="card-dark p-4">
                <ReviewsList storyId={storyId} />
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Progress */}
            <div className="card-dark p-4">
              <p className="text-xs text-mist-500 mb-3 font-medium">تقدمك</p>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-full bg-ink-700 flex items-center justify-center text-lg">{user.avatar}</div>
                <div>
                  <p className="text-sm font-medium text-mist-200">{user.username}</p>
                  <p className="text-xs text-mist-500">{progress?.path?.length || 1} / {story.totalChapters} فصل</p>
                </div>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${Math.min(100, ((progress?.path?.length || 1) / story.totalChapters) * 100)}%` }} />
              </div>
            </div>

            {/* RPG Stats */}
            {(hasRPGChoices || Object.values(character.stats).some(v => v !== 5)) && (
              <RPGStatsPanel stats={character.stats} deltas={statDeltas} compact />
            )}

            {/* Daily Streak */}
            {isDailyStory && (
              <div className="card-dark p-4 border-amber-500/30 bg-amber-500/5">
                <p className="text-xs text-amber-400 font-medium mb-1">🌟 قصة اليوم</p>
                <p className="text-xs text-mist-400">
                  {alreadyDoneToday ? 'أكملتها اليوم ✅' : 'أكملها اليوم للحصول على نقاط مضاعفة!'}
                </p>
              </div>
            )}

            {challengeCode && (
              <div className="card-dark p-4 border-gold-500/30 bg-gold-500/5">
                <p className="text-xs text-gold-400 font-medium mb-1">⚔️ تحدي جارٍ</p>
                <p className="text-xs text-mist-400">أكمل القصة للمقارنة</p>
              </div>
            )}

            <div className="card-dark p-4">
              <p className="text-xs text-mist-500 font-medium mb-2">عن القصة</p>
              <p className="text-sm text-mist-300 leading-relaxed">{story.description}</p>
            </div>

            <div className="space-y-2">
              {progress?.path?.length > 1 && (
                <button onClick={handleRestart} className="w-full btn-ghost text-sm py-2.5 rounded-xl">🔄 ابدأ من جديد</button>
              )}
              <Link to="/watch-party" className="w-full btn-ghost text-sm py-2.5 rounded-xl block text-center">🎬 مشاهدة جماعية</Link>
              <Link to="/badges" className="w-full btn-ghost text-sm py-2.5 rounded-xl block text-center">🏅 إنجازاتي</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
