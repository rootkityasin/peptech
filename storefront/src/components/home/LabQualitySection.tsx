"use client"

import React, { useState, useRef, useEffect } from "react"
import Link from "next/link"

interface VideoItem {
  id: string
  title: string
  src: string
  poster: string
}

const VIDEOS: VideoItem[] = [
  {
    id: "lab",
    title: "Inside our laboratory",
    src: "/videos/cleanroom/cleanroom-corridor.mp4",
    poster: "/images/cleanroom/corridor-poster.webp",
  },
  {
    id: "check",
    title: "Checked thoroughly",
    src: "/videos/cleanroom/cleanroom-vials.mp4",
    poster: "/images/cleanroom/vials-poster.webp",
  },
  {
    id: "packaging",
    title: "Sterile & safe packaging",
    src: "/videos/cleanroom/cleanroom-packaging.mp4",
    poster: "/images/cleanroom/packaging-poster.webp",
  },
  {
    id: "quality",
    title: "Quality at every step",
    src: "/videos/cleanroom/cleanroom-overview.mp4",
    poster: "/images/cleanroom/overview-poster.webp",
  },
]

function VideoCard({ item }: { item: VideoItem }) {
  const [isPlaying, setIsPlaying] = useState(false)
  const [isMuted, setIsMuted] = useState(true)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Viewport-based lazy playback: only stream & play when scrolled near viewport
  useEffect(() => {
    const el = containerRef.current
    const video = videoRef.current
    if (!el || !video) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            video.play().then(() => setIsPlaying(true)).catch(() => {})
          } else {
            video.pause()
            setIsPlaying(false)
          }
        })
      },
      { rootMargin: "150px" }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const togglePlay = () => {
    if (!videoRef.current) return
    if (isPlaying) {
      videoRef.current.pause()
      setIsPlaying(false)
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {})
    }
  }

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!videoRef.current) return
    const next = !isMuted
    videoRef.current.muted = next
    setIsMuted(next)
  }

  return (
    <div
      ref={containerRef}
      onClick={togglePlay}
      className="group relative aspect-[9/16] w-full overflow-hidden rounded-xl sm:rounded-2xl bg-[#051329] border border-[#E2E8F0] shadow-sm cursor-pointer select-none"
    >
      {/* Video Element with Lazy Preload and FastStart Streaming */}
      <video
        ref={videoRef}
        src={item.src}
        poster={item.poster}
        preload="metadata"
        playsInline
        loop
        muted={isMuted}
        className="w-full h-full object-cover"
      />

      {/* Subtle edge shading for text readability & privacy */}
      <div
        className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-black/25 pointer-events-none"
        aria-hidden="true"
      />

      {/* Audio Mute/Unmute Toggle in Top-Right */}
      <button
        type="button"
        onClick={toggleMute}
        aria-label={isMuted ? "Unmute audio" : "Mute audio"}
        className="absolute top-2.5 right-2.5 w-7 h-7 rounded-full bg-black/50 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-opacity duration-200 z-10"
      >
        {isMuted ? (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        ) : (
          <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        )}
      </button>

      {/* Center Play Button (as seen in reference design) */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div
          className={`w-11 h-11 sm:w-12 sm:h-12 rounded-full bg-[#0B1F3A]/85 text-white flex items-center justify-center shadow-md backdrop-blur-xs transition-all duration-200 ${
            isPlaying ? "opacity-0 group-hover:opacity-85 scale-95 group-hover:scale-100" : "opacity-95 scale-100"
          }`}
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M6 4h4v16H6V4zm8 0h4v16h-4V4z" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          )}
        </div>
      </div>

      {/* Caption Overlay at Bottom (as seen in reference design) */}
      <div className="absolute inset-x-0 bottom-0 p-3 pt-6 text-center z-10 pointer-events-none">
        <p className="text-white text-[13px] sm:text-[14px] font-medium leading-snug drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">
          {item.title}
        </p>
      </div>
    </div>
  )
}

export function LabQualitySection() {
  return (
    <section className="bg-white py-12 sm:py-16 border-t border-[#E2E8F0]">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Simple Centered Header */}
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-10">
          <h2 className="text-[20px] sm:text-[24px] lg:text-[26px] font-bold text-[#0B1F3A] leading-tight">
            Quality and Safety in Our Laboratory
          </h2>
          <p className="text-[13px] sm:text-[14px] text-[#64748B] mt-2 leading-relaxed">
            We do everything with uncompromising quality and safety in the lab, checked thoroughly at every step.
          </p>
        </div>

        {/* 4-Card Horizontal Video Grid (Matching Reference Layout) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 lg:gap-5">
          {VIDEOS.map((item) => (
            <VideoCard key={item.id} item={item} />
          ))}
        </div>

        {/* Centered CTA Button with Glowing Breathing Animation */}
        <div className="flex justify-center mt-8 sm:mt-10">
          <Link
            href="/shop"
            className="px-8 py-3 rounded-full border border-slate-200/90 bg-white/95 backdrop-blur-xs hover:bg-white hover:border-[#16A6A3] text-slate-800 hover:text-[#0B1F3A] text-[13.5px] sm:text-[14px] font-semibold transition-all duration-300 shadow-md animate-review-button-glow hover:shadow-xl hover:shadow-teal-500/25 active:scale-95 cursor-pointer inline-flex items-center justify-center"
          >
            <span>Shop All Products</span>
          </Link>
        </div>

      </div>
    </section>
  )
}
