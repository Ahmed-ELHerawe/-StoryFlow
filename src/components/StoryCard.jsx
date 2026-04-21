import React from 'react'
import { Link } from 'react-router-dom'
import { GENRES } from '../data/stories'

export default function StoryCard({ story }) {
  const genre = GENRES.find(g => g.id === story.genre)

  return (
    <Link to={`/read/${story.id}`} className="group block">
      <div className="card-dark overflow-hidden hover:border-gold-500/40 transition-all duration-300 hover:-translate-y-1 hover:glow-gold">
        {/* Cover Image */}
        <div className="relative overflow-hidden" style={{ aspectRatio: '16/9' }}>
          <img
            src={story.cover}
            alt={story.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-ink-950 via-ink-950/20 to-transparent" />

          {/* Genre Badge */}
          {genre && (
            <div className={`absolute top-3 right-3 genre-badge border ${genre.color}`}>
              <span>{genre.emoji}</span>
              <span>{genre.label}</span>
            </div>
          )}

          {/* Play icon overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-gold-500/20 border-2 border-gold-500/60 flex items-center justify-center backdrop-blur-sm">
              <span className="text-2xl mr-1">▶</span>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-5">
          <h3 className="font-display font-bold text-xl text-mist-100 mb-2 group-hover:text-gold-400 transition-colors">
            {story.title}
          </h3>
          <p className="text-sm text-mist-400 leading-relaxed mb-4 line-clamp-2">
            {story.description}
          </p>

          {/* Stats */}
          <div className="flex items-center justify-between text-xs text-mist-400">
            <div className="flex items-center gap-3">
              <span>👁️ {story.plays.toLocaleString()}</span>
              <span>⭐ {story.rating}</span>
              <span>📖 {story.totalChapters} فصول</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  )
}
