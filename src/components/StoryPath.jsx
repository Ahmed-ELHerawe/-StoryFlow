import React from 'react'

export default function StoryPath({ path, chapters }) {
  if (!path || path.length < 2) return null

  return (
    <div className="bg-ink-800/60 border border-ink-600 rounded-xl p-4">
      <p className="text-xs text-mist-400 mb-3 font-medium">مسار رحلتك</p>
      <div className="flex flex-wrap items-center gap-2">
        {path.map((chapterId, i) => {
          const chapter = chapters[chapterId]
          if (!chapter) return null
          const isLast = i === path.length - 1
          const isEnding = chapter.endingType !== null && chapter.endingType !== undefined

          return (
            <React.Fragment key={chapterId}>
              <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border transition-all ${
                isLast
                  ? isEnding
                    ? 'bg-gold-500/20 border-gold-500/50 text-gold-400'
                    : 'bg-purple-500/20 border-purple-500/50 text-purple-300'
                  : 'bg-ink-700 border-ink-600 text-mist-400'
              }`}>
                <span className="w-4 h-4 rounded-full bg-ink-600 flex items-center justify-center text-[10px] text-mist-300">
                  {i + 1}
                </span>
                {chapter.title}
              </div>
              {!isLast && (
                <span className="text-ink-600 text-xs">←</span>
              )}
            </React.Fragment>
          )
        })}
      </div>
    </div>
  )
}
