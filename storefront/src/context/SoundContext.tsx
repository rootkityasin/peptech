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
  const interactionListenersRef = useRef<(() => void) | null>(null)

  // Clean up any pending interaction listeners
  const cleanupInteractionListeners = useCallback(() => {
    if (interactionListenersRef.current) {
      interactionListenersRef.current()
      interactionListenersRef.current = null
    }
  }, [])

  // Register video element
  const registerVideoElement = useCallback((el: HTMLVideoElement | null) => {
    videoRef.current = el
    if (!el) {
      setIsAudioAvailable(false)
      setIsPlaying(false)
      cleanupInteractionListeners()
      return
    }

    setIsAudioAvailable(true)
    el.volume = volume

    // Attempt autoplay with sound
    el.muted = false
    const playPromise = el.play()
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          setIsMuted(false)
          setIsPlaying(true)
        })
        .catch(() => {
          // Autoplay with sound restricted by browser policy:
          // Keep video playing muted until first user interaction
          el.muted = true
          el.play().catch(() => {})
          setIsMuted(true)
          setIsPlaying(true)

          const onFirstInteraction = () => {
            if (videoRef.current) {
              videoRef.current.muted = false
              videoRef.current.volume = volume
              videoRef.current.play().catch(() => {})
              setIsMuted(false)
            }
            cleanupInteractionListeners()
          }

          const events = ["click", "pointerdown", "touchstart", "keydown", "scroll"]
          events.forEach((evt) => {
            window.addEventListener(evt, onFirstInteraction, { once: true, passive: true })
          })

          interactionListenersRef.current = () => {
            events.forEach((evt) => {
              window.removeEventListener(evt, onFirstInteraction)
            })
          }
        })
    }

    const onPlay = () => setIsPlaying(true)
    const onPause = () => setIsPlaying(false)
    const onVolumeChange = () => {
      setIsMuted(el.muted)
      setVolumeState(el.volume)
    }

    el.addEventListener("play", onPlay)
    el.addEventListener("pause", onPause)
    el.addEventListener("volumechange", onVolumeChange)

    return () => {
      el.removeEventListener("play", onPlay)
      el.removeEventListener("pause", onPause)
      el.removeEventListener("volumechange", onVolumeChange)
    }
  }, [volume, cleanupInteractionListeners])

  // Toggle Mute / Unmute
  const toggleMute = useCallback(() => {
    cleanupInteractionListeners()
    if (!videoRef.current) {
      setIsMuted((prev) => !prev)
      return
    }

    if (videoRef.current.muted) {
      videoRef.current.muted = false
      if (videoRef.current.volume === 0) {
        videoRef.current.volume = 0.75
        setVolumeState(0.75)
      }
      setIsMuted(false)
      videoRef.current.play().catch(() => {})
    } else {
      videoRef.current.muted = true
      setIsMuted(true)
    }
  }, [cleanupInteractionListeners])

  // Set Volume
  const setVolume = useCallback((newVol: number) => {
    cleanupInteractionListeners()
    const clamped = Math.max(0, Math.min(1, newVol))
    setVolumeState(clamped)

    if (videoRef.current) {
      videoRef.current.volume = clamped
      if (clamped === 0) {
        videoRef.current.muted = true
        setIsMuted(true)
      } else {
        videoRef.current.muted = false
        setIsMuted(false)
        videoRef.current.play().catch(() => {})
      }
    } else {
      setIsMuted(clamped === 0)
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
