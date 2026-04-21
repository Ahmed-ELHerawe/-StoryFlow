import React from 'react'
import { Link } from 'react-router-dom'
import { useStoriesStore } from '../stores'
import StoryCard from '../components/StoryCard'
import { GENRES } from '../data/stories'

export default function Home() {
  const { getAllStories } = useStoriesStore()
  const stories = getAllStories()
  const featured = stories[2] // scifi story as hero

  return (
    <div className="min-h-screen pt-16">
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Background */}
        <div className="absolute inset-0">
          <img
            src={featured.cover}
            alt=""
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-ink-950/60 via-ink-950/40 to-ink-950" />
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950 via-transparent to-ink-950" />
        </div>

        {/* Decorative orbs */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gold-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-ember-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-24">
          <div className="max-w-2xl">
            {/* Label */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-gold-500/10 border border-gold-500/30 text-gold-400 text-sm mb-6">
              <span className="w-2 h-2 rounded-full bg-gold-500 animate-pulse" />
              قصص تفاعلية بالفيديو
            </div>

            <h1 className="font-display text-5xl sm:text-7xl font-black text-mist-100 leading-tight mb-6">
              أنت من
              <br />
              <span className="text-gradient-gold">يكتب</span>
              <br />
              النهاية
            </h1>

            <p className="text-lg text-mist-400 leading-relaxed mb-8 max-w-lg">
              قصص فيديو تفاعلية — كل اختيار يغير المسار. مئات النهايات المختلفة تنتظرك.
            </p>

            <div className="flex flex-wrap gap-4">
              <Link to="/stories" className="btn-gold text-base px-8 py-4 rounded-xl">
                ابدأ المغامرة ←
              </Link>
              <Link to="/leaderboard" className="btn-ghost text-base px-8 py-4 rounded-xl">
                🏆 الترتيب
              </Link>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-8 mt-12 pt-8 border-t border-ink-700">
              <div>
                <div className="text-2xl font-bold text-gold-400">{stories.length}</div>
                <div className="text-sm text-mist-500">قصة</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gold-400">∞</div>
                <div className="text-sm text-mist-500">مسار</div>
              </div>
              <div>
                <div className="text-2xl font-bold text-gold-400">4K+</div>
                <div className="text-sm text-mist-500">قارئ</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Genres Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="flex flex-wrap gap-3 justify-center">
          {GENRES.map(g => (
            <Link
              key={g.id}
              to={`/stories?genre=${g.id}`}
              className={`genre-badge border text-sm py-2 px-4 hover:scale-105 transition-all cursor-pointer ${g.color}`}
            >
              <span>{g.emoji}</span>
              <span>{g.label}</span>
            </Link>
          ))}
        </div>
      </section>

      {/* Stories Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 pb-20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="font-display text-2xl font-bold text-mist-100">
            القصص المتاحة
          </h2>
          <Link to="/stories" className="text-sm text-gold-400 hover:text-gold-300 transition-colors">
            عرض الكل ←
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {stories.map(story => (
            <StoryCard key={story.id} story={story} />
          ))}
        </div>
      </section>
    </div>
  )
}
