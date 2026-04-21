import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthStore } from './stores'
import Navbar from './components/Navbar'
import BadgeToast from './components/BadgeToast'
import Home from './pages/Home'
import Stories from './pages/Stories'
import Read from './pages/Read'
import Leaderboard from './pages/Leaderboard'
import Auth from './pages/Auth'
import Admin from './pages/Admin'
import Profile from './pages/Profile'
import AIGenerator from './pages/AIGenerator'
import Challenges from './pages/Challenges'
import BadgesPage from './pages/Badges'
import StoryEditor from './pages/StoryEditor'
import WatchParty from './pages/WatchParty'
import Analytics from './pages/Analytics'
import DailyPage from './pages/Daily'

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, isAdmin } = useAuthStore()
  if (!user) return <Navigate to="/auth" replace />
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />
  return children
}

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-ink-950 text-mist-100">
        <Navbar />
        <BadgeToast />
        <Routes>
          <Route path="/"            element={<Home />} />
          <Route path="/stories"     element={<Stories />} />
          <Route path="/daily"       element={<DailyPage />} />
          <Route path="/leaderboard" element={<Leaderboard />} />
          <Route path="/auth"        element={<Auth />} />
          <Route path="/read/:storyId" element={<ProtectedRoute><Read /></ProtectedRoute>} />
          <Route path="/profile"     element={<ProtectedRoute><Profile /></ProtectedRoute>} />
          <Route path="/ai"          element={<ProtectedRoute><AIGenerator /></ProtectedRoute>} />
          <Route path="/challenges"  element={<ProtectedRoute><Challenges /></ProtectedRoute>} />
          <Route path="/badges"      element={<ProtectedRoute><BadgesPage /></ProtectedRoute>} />
          <Route path="/watch-party" element={<ProtectedRoute><WatchParty /></ProtectedRoute>} />
          <Route path="/admin"       element={<ProtectedRoute adminOnly><Admin /></ProtectedRoute>} />
          <Route path="/analytics"   element={<ProtectedRoute adminOnly><Analytics /></ProtectedRoute>} />
          <Route path="/editor"      element={<ProtectedRoute adminOnly><StoryEditor /></ProtectedRoute>} />
          <Route path="*"            element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </BrowserRouter>
  )
}
