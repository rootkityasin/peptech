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
  const [isMuted, setIsMuted] = useState(true)
  const [volume, setVolumeState] = useState(0.75)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isAudioAvailable, setIsAudioAvailable] = useState(true)

  const videoRef = useRef<HTMLVideoElement | null>(null)
  const volumeRef = useRef(0.75)
  const isMutedRef = useRef(true)
  const hasUserExplicitlyMutedRef = useRef(false)
  const interactionCleanupRef = useRef<(() => void) | null>(null)

  // Keep volume ref in sync
  useEffect(() => {
    volumeRef.current = volume
  }, [volume])

  // Remove pending interaction listeners
  const cleanupInteractionListeners = useCallback(() => {
    if (interactionCleanupRef.current) {
      interactionCleanupRef.current()
      interactionCleanupRef.current = null
    }
  }, [])

  // Register and synchronize video element
  const registerVideoElement = useCallback((el: HTMLVideoElement | null) => {
    // Stop previous video if switching elements
    if (videoRef.current && videoRef.current !== el) {
      try {
        videoRef.current.pause()
      } catch {}
    }

    videoRef.current = el

    if (!el) {
      setIsAudioAvailable(false)
      setIsPlaying(false)
      cleanupInteractionListeners()
      return
    }

    setIsAudioAvailable(true)
    const activeVol = volumeRef.current || 0.75
    el.volume = activeVol

    // ALWAYS ensure video is muted on initial load so the browser allows autoplay
    // without pausing or blocking video frames
    el.muted = true
    setIsMuted(true)
    isMutedRef.current = true

    // Start video playback immediately and reliably
    const playPromise = el.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsPlaying(true)
        })
        .catch(() => {
          // Fallback retry with muted guaranteed
          el.muted = true
          el.play().then(() => setIsPlaying(true)).catch(() => {})
        })
    }

    // Set up one-time unmute on first user interaction (valid W3C User Activation)
    if (!hasUserExplicitlyMutedRef.current) {
      const onFirstInteraction = (e?: Event) => {
        // If user directly clicked the Audio toggle button, let toggleMute handle it
        if (e && (e.target as HTMLElement)?.closest?.("button[aria-label*='Audio']")) {
          cleanupInteractionListeners()
          return
        }

        const video = videoRef.current
        if (video && !hasUserExplicitlyMutedRef.current) {
          try {
            video.muted = false
            video.volume = volumeRef.current || 0.75
            if (video.paused) {
              video.play().catch(() => {})
            }
            setIsMuted(false)
            isMutedRef.current = false
          } catch {}
        }
        cleanupInteractionListeners()
      }

      const events = ["click", "pointerdown", "touchstart", "keydown"]
      events.forEach((evt) => {
        window.addEventListener(evt, onFirstInteraction, { once: true, passive: true })
      })

      interactionCleanupRef.current = () => {
        events.forEach((evt) => {
          window.removeEventListener(evt, onFirstInteraction)
        })
      }
    }

    // Media event listeners for continuous sync with hardware DOM state
    const syncState = () => {
      if (!el) return
      const currentlyMuted = el.muted || el.volume === 0
      setIsMuted(currentlyMuted)
      isMutedRef.current = currentlyMuted
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

  // Explicit Toggle Mute / Unmute
  const toggleMute = useCallback(() => {
    cleanupInteractionListeners()
    const video = videoRef.current

    if (isMutedRef.current) {
      // User is unmuting
      hasUserExplicitlyMutedRef.current = false
      setIsMuted(false)
      isMutedRef.current = false
      if (video) {
        video.muted = false
        const restoredVol = volumeRef.current > 0 ? volumeRef.current : 0.75
        video.volume = restoredVol
        setVolumeState(restoredVol)
        if (video.paused) {
          video.play().catch(() => {})
        }
      }
    } else {
      // User is muting
      hasUserExplicitlyMutedRef.current = true
      setIsMuted(true)
      isMutedRef.current = true
      if (video) {
        video.muted = true
      }
    }
  }, [cleanupInteractionListeners])

  // Explicit Set Volume
  const setVolume = useCallback((newVol: number) => {
    cleanupInteractionListeners()
    const clamped = Math.max(0, Math.min(1, newVol))
    setVolumeState(clamped)
    volumeRef.current = clamped

    const video = videoRef.current
    if (clamped === 0) {
      hasUserExplicitlyMutedRef.current = true
      setIsMuted(true)
      isMutedRef.current = true
      if (video) video.muted = true
    } else {
      hasUserExplicitlyMutedRef.current = false
      setIsMuted(false)
      isMutedRef.current = false
      if (video) {
        video.muted = false
        video.volume = clamped
        if (video.paused) {
          video.play().catch(() => {})
        }
      }
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
