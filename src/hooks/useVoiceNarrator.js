import { useRef, useState, useCallback } from 'react'

export function useVoiceNarrator() {
  const utteranceRef = useRef(null)
  const [speaking, setSpeaking] = useState(false)
  const [supported] = useState(() => 'speechSynthesis' in window)

  const getArabicVoice = () => {
    const voices = window.speechSynthesis.getVoices()
    return (
      voices.find(v => v.lang === 'ar-SA') ||
      voices.find(v => v.lang === 'ar-EG') ||
      voices.find(v => v.lang.startsWith('ar')) ||
      voices[0]
    )
  }

  const speak = useCallback((text) => {
    if (!supported || !text) return
    window.speechSynthesis.cancel()
    const utter = new SpeechSynthesisUtterance(text)
    utter.voice = getArabicVoice()
    utter.lang  = 'ar-SA'
    utter.rate  = 0.9
    utter.pitch = 1
    utter.onstart = () => setSpeaking(true)
    utter.onend   = () => setSpeaking(false)
    utter.onerror = () => setSpeaking(false)
    utteranceRef.current = utter
    window.speechSynthesis.speak(utter)
  }, [supported])

  const stop = useCallback(() => {
    window.speechSynthesis.cancel()
    setSpeaking(false)
  }, [])

  const toggle = useCallback((text) => {
    if (speaking) stop()
    else speak(text)
  }, [speaking, speak, stop])

  return { speak, stop, toggle, speaking, supported }
}
