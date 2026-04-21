import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useStoriesStore } from '../stores'
import StoryCard from '../components/StoryCard'
import { GENRES } from '../data/stories'

export default function Stories() {
  const [searchParams, setSearchParams] = useSearchParams()
  const { getAllStories } = useStoriesStore()
  const [selectedGenre, setSelectedGenre] = useState(searchParams.get('genre') || 'all')
  const [search, setSearch] = useState('')

  const allStories = getAllStories()

  const filtered = allStories.filter(s => {
    const matchGenre = selectedGenre === 'all' || s.genre === selectedGenre
    const matchSearch = !search || s.title.includes(search) || s.description.includes(search)
    return matchGenre && matchSearch
  })

  useEffect(() => {
    if (selectedGenre !== 'all') setSearchParams({ genre: selectedGenre })
    else setSearchParams({})
  }, [selectedGenre])

  return (
    <div className="min-h-screen pt-24 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-display text-4xl font-black text-mist-100 mb-2">القصص</h1>
          <p className="text-mist-400">اختر قصتك واصنع مصيرها بنفسك</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-mist-400">🔍</span>
            <input
              type="text"
              placeholder="ابحث عن قصة..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-dark pr-10"
            />
          </div>

          {/* Genre Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedGenre('all')}
              className={`genre-badge border cursor-pointer transition-all ${
                selectedGenre === 'all'
                  ? 'bg-gold-500/20 border-gold-500/50 text-gold-400'
                  : 'border-ink-600 text-mist-400 hover:border-ink-500'
              }`}
            >
              الكل
            </button>
            {GENRES.map(g => (
              <button
                key={g.id}
                onClick={() => setSelectedGenre(g.id)}
                className={`genre-badge border cursor-pointer transition-all ${
                  selectedGenre === g.id ? g.color : 'border-ink-600 text-mist-400 hover:border-ink-500'
                }`}
              >
                <span>{g.emoji}</span>
                <span>{g.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        {filtered.length === 0 ? (
          <div className="text-center py-20 text-mist-500">
            <div className="text-4xl mb-4">📭</div>
            <p>لا توجد قصص مطابقة</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map(story => (
              <StoryCard key={story.id} story={story} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
