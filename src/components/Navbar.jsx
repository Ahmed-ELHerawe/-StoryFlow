import React, { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores'

export default function Navbar() {
  const { user, isAdmin, logout } = useAuthStore()
  const location = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const links = [
    { to: '/',            label: 'الرئيسية' },
    { to: '/stories',     label: 'القصص' },
    { to: '/daily',       label: '🌟 اليوم' },
    { to: '/ai',          label: '🤖 AI' },
    { to: '/watch-party', label: '🎬 جماعي' },
    { to: '/challenges',  label: '⚔️ تحديات' },
    { to: '/badges',      label: '🏅 إنجازات' },
    { to: '/leaderboard', label: 'الترتيب' },
  ]

  const adminLinks = [
    { to: '/admin',     label: 'الإدارة' },
    { to: '/analytics', label: 'التحليلات' },
    { to: '/editor',    label: 'المحرر' },
  ]

  const isActive = (to) => location.pathname === to

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-ink-700/60 backdrop-blur-xl bg-ink-950/85">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0">
            <span className="text-2xl">📖</span>
            <span className="font-display font-bold text-xl text-gradient-gold">StoryFlow</span>
          </Link>

          {/* Desktop nav — scrollable if needed */}
          <div className="hidden md:flex items-center gap-4 overflow-x-auto flex-1 mx-6">
            {links.map(l => (
              <Link key={l.to} to={l.to}
                className={`text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  isActive(l.to) ? 'text-gold-400' : 'text-mist-300 hover:text-gold-400'
                }`}>
                {l.label}
              </Link>
            ))}
            {isAdmin && adminLinks.map(l => (
              <Link key={l.to} to={l.to}
                className={`text-sm font-medium whitespace-nowrap transition-colors flex-shrink-0 ${
                  isActive(l.to) ? 'text-ember-400' : 'text-ember-400/60 hover:text-ember-400'
                }`}>
                {l.label}
              </Link>
            ))}
          </div>

          {/* Auth */}
          <div className="hidden md:flex items-center gap-3 flex-shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                <Link to="/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-ink-800 border border-ink-600 hover:border-gold-500/40 transition-all">
                  <span>{user.avatar}</span>
                  <span className="text-sm text-mist-200 max-w-[80px] truncate">{user.username}</span>
                </Link>
                <button onClick={() => { logout(); navigate('/') }}
                  className="text-xs text-mist-500 hover:text-red-400 transition-colors px-2">
                  خروج
                </button>
              </div>
            ) : (
              <Link to="/auth" className="btn-gold text-sm py-2 px-4 rounded-lg">دخول</Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-mist-300 hover:text-gold-400 p-2" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden border-t border-ink-700 py-3 flex flex-col gap-1 max-h-[70vh] overflow-y-auto">
            {links.map(l => (
              <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                className={`px-3 py-2.5 rounded-lg text-sm font-medium ${
                  isActive(l.to) ? 'text-gold-400 bg-gold-500/10' : 'text-mist-300'
                }`}>
                {l.label}
              </Link>
            ))}
            {isAdmin && (
              <>
                <div className="border-t border-ink-700 my-1" />
                {adminLinks.map(l => (
                  <Link key={l.to} to={l.to} onClick={() => setMenuOpen(false)}
                    className="px-3 py-2.5 text-sm text-ember-400 rounded-lg">
                    {l.label}
                  </Link>
                ))}
              </>
            )}
            <div className="border-t border-ink-700 my-1" />
            {user ? (
              <div className="flex items-center justify-between px-3 py-2">
                <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 text-sm text-mist-200">
                  <span>{user.avatar}</span>{user.username}
                </Link>
                <button onClick={() => { logout(); navigate('/'); setMenuOpen(false) }} className="text-xs text-red-400">
                  خروج
                </button>
              </div>
            ) : (
              <Link to="/auth" onClick={() => setMenuOpen(false)} className="btn-gold text-sm text-center mx-3 py-2.5 rounded-xl">
                دخول / تسجيل
              </Link>
            )}
          </div>
        )}
      </div>
    </nav>
  )
}
