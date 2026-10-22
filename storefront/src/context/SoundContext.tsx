"use client"

import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"

interface SoundContextType {
  isMuted: boolean
  volume: number
  isPlaying: boolean
  isAudioAvailable: boolean
  toggleMute: () => void
  setVolume: (vol: number) => void
  registerVideoElement: (el: HTMLVideoElement | null) => void
}

const SoundContext = createContext<SoundContextType | undefined>(undefined)

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [isMuted, setIsMuted] = useState(false)
  const [volume, setVolumeState] = useState(0.75)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAudioAvailable, setIsAudioAvailable] = useState(true)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const volumeRef = useRef(0.75)
  const isMutedRef = useRef(false)
  const interactionCleanupRef = useRef<(() => void) | null>(null)

  // Keep refs in sync with state for stable callbacks
  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  useEffect(() => {
    isMutedRef.current = isMuted
  }, [isMuted])

  // Remove any pending one-time interaction listeners
  const cleanupInteractionListeners = useCallback(() => {
    if (interactionCleanupRef.current) {
      interactionCleanupRef.current()
      interactionCleanupRef.current = null
    }
  }, [])

  // Register and synchronize video element (STABLE CALLBACK)
  const registerVideoElement = useCallback((el: HTMLVideoElement | null) => {
    // 1. If an existing video was already playing, stop and mute it to prevent double audio
    if (videoRef.current && videoRef.current !== el) {
      videoRef.current.pause()
      videoRef.current.muted = true
    }

    // Also defensively stop any orphan video/audio elements on document
    if (typeof window !== "undefined") {
      document.querySelectorAll("video, audio").forEach((m) => {
        if (m !== el) {
          try {
            ;(m as HTMLMediaElement).pause()
            ;(m as HTMLMediaElement).muted = true
          } catch {}
        }
      })
    }

    videoRef.current = el

    if (!el) {
      setIsAudioAvailable(false)
      setIsPlaying(false)
      cleanupInteractionListeners()
      return
    }

    setIsAudioAvailable(true)
    const initialVol = volumeRef.current || 0.75
    el.volume = initialVol

    // 2. Attempt Autoplay with Sound
    // Try unmuting directly
    el.muted = false
    const playPromise = el.play()

    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Unmuted autoplay succeeded! Match volume icon to unmuted
          setIsMuted(false)
          isMutedRef.current = false
          setIsPlaying(true)
        })
        .catch(() => {
          // Autoplay with sound restricted by browser policy:
          // Play muted so video renders, and set icon to MUTED so visual matches audio state!
          el.muted = true
          el.play().catch(() => {})
          setIsMuted(true)
          isMutedRef.current = true
          setIsPlaying(true)

          // On the very first user interaction (tap, click, scroll), unmute and match icon!
          const onFirstInteraction = () => {
            if (videoRef.current) {
              videoRef.current.muted = false
              videoRef.current.volume = volumeRef.current || 0.75
              videoRef.current.play().catch(() => {})
              setIsMuted(false)
              isMutedRef.current = false
            }
            cleanupInteractionListeners()
          }

          const events = ["click", "pointerdown", "touchstart", "keydown", "scroll"]
          events.forEach((evt) => {
            window.addEventListener(evt, onFirstInteraction, { once: true, passive: true })
          })

          interactionCleanupRef.current = () => {
            events.forEach((evt) => {
              window.removeEventListener(evt, onFirstInteraction)
            })
          }
        })
    }

    // 3. Keep state perfectly in sync with DOM media events
    const syncState = () => {
      setIsMuted(el.muted)
      isMutedRef.current = el.muted
      setVolumeState(el.volume)
      volumeRef.current = el.volume
      setIsPlaying(!el.paused && !el.ended)
    }

    el.addEventListener("play", syncState)
    el.addEventListener("pause", syncState)
    el.addEventListener("playing", syncState)
    el.addEventListener("volumechange", syncState)

    return () => {
      el.removeEventListener("play", syncState)
      el.removeEventListener("pause", syncState)
      el.removeEventListener("playing", syncState)
      el.removeEventListener("volumechange", syncState)
    }
  }, [cleanupInteractionListeners])

  // Toggle Mute / Unmute
  const toggleMute = useCallback(() => {
    cleanupInteractionListeners()
    const video = videoRef.current
    if (!video) {
      setIsMuted((prev) => !prev)
      return
    }

    if (video.muted) {
      video.muted = false
      if (video.volume === 0) {
        const restoredVol = volumeRef.current > 0 ? volumeRef.current : 0.75
        video.volume = restoredVol
        setVolumeState(restoredVol)
      }
      setIsMuted(false)
      isMutedRef.current = false
      video.play().catch(() => {})
    } else {
      video.muted = true
      setIsMuted(true)
      isMutedRef.current = true
    }
  }, [cleanupInteractionListeners])

  // Set Volume
  const setVolume = useCallback((newVol: number) => {
    cleanupInteractionListeners()
    const clamped = Math.max(0, Math.min(1, newVol))
    setVolumeState(clamped)
    volumeRef.current = clamped

    const video = videoRef.current
    if (video) {
      video.volume = clamped
      if (clamped === 0) {
        video.muted = true
        setIsMuted(true)
        isMutedRef.current = true
      } else {
        video.muted = false
        setIsMuted(false)
        isMutedRef.current = false
        video.play().catch(() => {})
      }
    } else {
      setIsMuted(clamped === 0)
      isMutedRef.current = clamped === 0
    }
  }, [cleanupInteractionListeners])

  return (
    <SoundContext.Provider
      value={{
        isMuted,
        volume,
        isPlaying,
        isAudioAvailable,
        toggleMute,
        setVolume,
        registerVideoElement,
      }}
    >
      {children}
    </SoundContext.Provider>
  )
}

export function useSound() {
  const context = useContext(SoundContext)
  if (!context) {
    throw new Error("useSound must be used within a SoundProvider")
  }
  return context
}
