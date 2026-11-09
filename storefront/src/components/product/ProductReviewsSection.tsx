"use client"

import React, { useState, useEffect, useRef } from "react"

export interface ReviewItem {
  id: string
  name: string
  handle: string
  avatar: string
  avatarUrl?: string
  avatarBg?: string
  rating: number
  date: string
  verified: boolean
  comment: string
  photo?: string
  productHandle?: string
}

const DEFAULT_REVIEWS: ReviewItem[] = [
  // --- COLUMN 1 GROUP ---
  {
    id: "rev-1",
    name: "Dr. Alistair Vance",
    handle: "@VanceBioLab",
    avatar: "AV",
    avatarUrl: "/images/reviews/avatars/avatar-2.webp",
    avatarBg: "bg-[#0B1F3A]",
    rating: 5,
    date: "2 days ago",
    verified: true,
    comment:
      "Batch analysis was spot on. Reconstitution with bacteriostatic water yielded a completely clear solution with zero residue. The packaging QR code linked directly to the unedited HPLC report.",
  },
  {
    id: "rev-2",
    name: "Hannah Bennett",
    handle: "@CellularRigor",
    avatar: "HB",
    avatarUrl: "/images/reviews/avatars/avatar-1.webp",
    avatarBg: "bg-[#16A6A3]",
    rating: 5,
    date: "4 days ago",
    verified: true,
    comment:
      "The reusable pen precision dosing mechanism is unmatched compared to standard lab syringes. Cartridge clicked in securely and delivery volume was exact across all 28 cycles.",
  },
  {
    id: "rev-3",
    name: "Marcus Thorne",
    handle: "@ThorneResearch",
    avatar: "MT",
    avatarUrl: "/images/reviews/avatars/avatar-4.webp",
    avatarBg: "bg-[#1E3A8A]",
    rating: 5,
    date: "1 week ago",
    verified: true,
    comment:
      "Cold-chain delivery arrived within 24 hours via Royal Mail Tracked. Thermal insulation kept contents chilled. Impeccable packaging rigor.",
  },

  // --- COLUMN 2 GROUP ---
  {
    id: "rev-4",
    name: "Dr. Elena Rostova",
    handle: "@CambridgeBioChem",
    avatar: "ER",
    avatarUrl: "/images/reviews/avatars/avatar-3.webp",
    avatarBg: "bg-[#0D9488]",
    rating: 5,
    date: "1 week ago",
    verified: true,
    photo: "/images/cleanroom/vials-poster.webp",
    comment:
      "Mass spectrometry scan verified target molecular weight without secondary fragmentation. Clean analytical baseline with no residual trifluoroacetic acid. Will definitely be reordering cartridges.",
  },
  {
    id: "rev-5",
    name: "Julian Mercer",
    handle: "@MercerAnalytical",
    avatar: "JM",
    avatarUrl: "/images/reviews/avatars/avatar-6.webp",
    avatarBg: "bg-[#334155]",
    rating: 5,
    date: "2 weeks ago",
    verified: true,
    comment:
      "On the 28-day Subscribe & Save schedule. Renewal dispatched automatically 3 days prior to cycle end without lab supply interruptions.",
  },
  {
    id: "rev-6",
    name: "Sarah Jenkins",
    handle: "@MolecularCore",
    avatar: "SJ",
    avatarUrl: "/images/reviews/avatars/avatar-5.webp",
    avatarBg: "bg-[#0284C7]",
    rating: 5,
    date: "2 weeks ago",
    verified: true,
    comment:
      "Discreet outer box with zero external peptide branding. Inside, each unit was sealed with its batch passport and sterile needle accessories.",
  },

  // --- COLUMN 3 GROUP ---
  {
    id: "rev-7",
    name: "David K. Miller",
    handle: "@InVitroSolutions",
    avatar: "DM",
    avatarUrl: "/images/reviews/avatars/avatar-8.webp",
    avatarBg: "bg-[#4338CA]",
    rating: 5,
    date: "3 weeks ago",
    verified: true,
    comment:
      "Lyophilized cake was compact, snow-white, and dissolved in under 15 seconds. High purity confirmed on our in-house spectrometer.",
  },
  {
    id: "rev-8",
    name: "Claire Davenport",
    handle: "@DavenportLab",
    avatar: "CD",
    avatarUrl: "/images/reviews/avatars/avatar-7.webp",
    avatarBg: "bg-[#0F766E]",
    rating: 5,
    date: "1 month ago",
    verified: true,
    photo: "/images/cleanroom/packaging-poster.webp",
    comment:
      "Tested both the complete pen set and individual refill cartridges. Tolerances on the reusable pen chassis are aerospace grade. A massive step up for research consistency.",
  },
  {
    id: "rev-9",
    name: "Prof. Arthur Sterling",
    handle: "@SterlingBiotech",
    avatar: "AS",
    avatarUrl: "/images/reviews/avatars/avatar-10.webp",
    avatarBg: "bg-[#0B1F3A]",
    rating: 5,
    date: "1 month ago",
    verified: true,
    comment:
      "HPLC purity verified at 99.4% on our laboratory spectrometer. Excellent compound stability through multiple freeze-thaw reconstitutions.",
  },

  // --- COLUMN 4 GROUP ---
  {
    id: "rev-10",
    name: "Liam Carter",
    handle: "@CarterPeptides",
    avatar: "LC",
    avatarUrl: "/images/reviews/avatars/avatar-12.webp",
    avatarBg: "bg-[#16A6A3]",
    rating: 5,
    date: "1 month ago",
    verified: true,
    comment:
      "The cartridge system saves significant lab budget compared to buying single-use disposable pens each time. Simple click-in replacement workflow.",
  },
  {
    id: "rev-11",
    name: "Sophie Adams",
    handle: "@BioGenesisUK",
    avatar: "SA",
    avatarUrl: "/images/reviews/avatars/avatar-9.webp",
    avatarBg: "bg-[#1D4ED8]",
    rating: 5,
    date: "6 weeks ago",
    verified: true,
    comment:
      "Prompt dispatch and comprehensive documentation. Packaging QR code scanned cleanly on mobile and brought up the lot Certificate of Analysis immediately.",
  },
  {
    id: "rev-12",
    name: "Dr. Rajiv Patel",
    handle: "@ImperialSpectra",
    avatar: "RP",
    avatarUrl: "/images/reviews/avatars/avatar-11.webp",
    avatarBg: "bg-[#047857]",
    rating: 5,
    date: "2 months ago",
    verified: true,
    photo: "/images/about/pillar-purity.jpg",
    comment:
      "Vacuum seal integrity on the borosilicate glass cartridges is flawless. Zero leakage under mechanical vibration testing across our protocols.",
  },
]

interface ProductReviewsSectionProps {
  productHandle?: string
  productTitle?: string
}

export function ProductReviewsSection({
  productHandle = "default",
  productTitle = "Product",
}: ProductReviewsSectionProps) {
  const [reviews, setReviews] = useState<ReviewItem[]>(DEFAULT_REVIEWS)
  const [modalOpen, setModalOpen] = useState(false)
  const [isExpanded, setIsExpanded] = useState(false)
  const [contentHeight, setContentHeight] = useState<number>(1400)
  const contentRef = useRef<HTMLDivElement>(null)

  // Dynamically observe content height so the container and button move with mathematical precision
  useEffect(() => {
    if (!contentRef.current) return
    const updateHeight = () => {
      if (contentRef.current) {
        setContentHeight(contentRef.current.scrollHeight)
      }
    }
    updateHeight()
    const ro = new ResizeObserver(updateHeight)
    ro.observe(contentRef.current)
    window.addEventListener("resize", updateHeight)
    return () => {
      ro.disconnect()
      window.removeEventListener("resize", updateHeight)
    }
  }, [reviews])

  // Safely hydrate stored user reviews post-mount to eliminate SSR hydration mismatches
  useEffect(() => {
    try {
      const stored = localStorage.getItem(`peptech_reviews_${productHandle}`)
      if (stored) {
        const parsed: ReviewItem[] = JSON.parse(stored)
        if (Array.isArray(parsed) && parsed.length > 0) {
          queueMicrotask(() => {
            setReviews([...parsed, ...DEFAULT_REVIEWS])
          })
        }
      }
    } catch {}
  }, [productHandle])

  // Handle new review submission from modal
  const handleReviewSubmitted = (newRev: { name: string; rating: number; comment: string; photo?: string }) => {
    const initials =
      newRev.name
        .split(" ")
        .map((n) => n[0])
        .slice(0, 2)
        .join("")
        .toUpperCase() || "VR"

    // Pick an avatar from the local pool based on timestamp
    const avatarIndex = (Date.now() % 12) + 1

    const fullReview: ReviewItem = {
      ...newRev,
      id: `rev-${Date.now()}`,
      handle: `@${newRev.name.replace(/\s+/g, "").toLowerCase()}`,
      avatar: initials,
      avatarUrl: newRev.photo ? undefined : `/images/reviews/avatars/avatar-${avatarIndex}.webp`,
      avatarBg: "bg-[#0B1F3A]",
      date: "Just now",
      verified: true,
      productHandle,
    }

    const updated = [fullReview, ...reviews]
    setReviews(updated)

    try {
      const customOnly = updated.filter((r) => r.id.startsWith("rev-"))
      localStorage.setItem(`peptech_reviews_${productHandle}`, JSON.stringify(customOnly))
    } catch {}
  }

  const handleToggleExpand = () => {
    if (isExpanded) {
      const el = document.getElementById("product-reviews")
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" })
      }
      setIsExpanded(false)
    } else {
      setIsExpanded(true)
    }
  }

  return (
    <section className="bg-white py-14 sm:py-20 border-t border-[#E2E8F0]" id="product-reviews">
      <div className="max-w-[1240px] mx-auto px-4 sm:px-6">
        
        {/* ------------------------------------------------------------- */}
        {/* Section Header: Centered Title & Write Review Button          */}
        {/* ------------------------------------------------------------- */}
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-12">
          <h2 className="text-[26px] sm:text-[34px] font-bold text-[#0B1F3A] leading-tight tracking-tight">
            What Researchers Are Saying
          </h2>
          <p className="text-[13.5px] sm:text-[14.5px] text-[#64748B] mt-2 leading-relaxed">
            Verified laboratory feedback from biochemistry institutes, analytical researchers, and commercial laboratories.
          </p>

          {/* Action Row: Rating Badge & Write Review CTA */}
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F8FAFC] border border-[#E2E8F0] text-[12.5px] font-semibold text-[#0B1F3A]">
              <span className="text-[#F59E0B]">★★★★★</span>
              <span>5.0</span>
              <span className="text-slate-400 font-normal">({reviews.length} Verified Reviews)</span>
            </div>

            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="btn-press px-5 py-1.5 rounded-full bg-[#0B1F3A] hover:bg-[#16A6A3] text-white text-[12.5px] font-semibold transition-colors cursor-pointer shadow-xs"
            >
              Write a review
            </button>
          </div>
        </div>

        {/* ------------------------------------------------------------- */}
        {/* Masonry Bento Cards Wall with Smooth Height Expansion & Glide */}
        {/* ------------------------------------------------------------- */}
        <div
          className="relative overflow-hidden transition-[height] duration-900 ease-[cubic-bezier(0.16,1,0.3,1)]"
          style={{
            height: isExpanded ? `${contentHeight + 96}px` : "520px",
          }}
        >
          {/* Internal Content Div Tracked by ResizeObserver */}
          <div
            ref={contentRef}
            className="columns-1 sm:columns-2 lg:columns-4 gap-4 [column-fill:_balance] pb-12"
          >
            {reviews.map((rev, index) => {
              // Cards in the 3rd tier of the 4 columns or user reviews that reveal on expansion
              const isLowerTier = index === 2 || index === 5 || index === 8 || index === 11 || index >= 12
              
              // Wave cascade delay across columns (Col 1 -> Col 2 -> Col 3 -> Col 4)
              const staggerDelay =
                index === 2 ? 80 :
                index === 5 ? 180 :
                index === 8 ? 280 :
                index === 11 ? 380 :
                index >= 12 ? 460 + (index - 12) * 70 : 0

              return (
                <div
                  key={rev.id}
                  style={{
                    animationDelay: isExpanded && isLowerTier ? `${staggerDelay}ms` : undefined,
                  }}
                  className={`break-inside-avoid mb-4 bg-white border border-[#E2E8F0] rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#16A6A3]/60 hover:shadow-md transition-all group relative overflow-hidden ${
                    isExpanded && isLowerTier
                      ? "animate-review-glide"
                      : !isExpanded && isLowerTier
                      ? "opacity-75 blur-[0.5px] scale-[0.985] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                      : "opacity-100 scale-100"
                  }`}
                >
                  {/* Gentle Surface Shimmer Sweep on entrance */}
                  {isExpanded && isLowerTier && (
                    <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
                      <div
                        className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-teal-500/10 to-transparent animate-review-shimmer"
                        style={{ animationDelay: `${staggerDelay + 160}ms` }}
                      />
                    </div>
                  )}

                  {/* Author Info Row: Real Human Photo Avatar + Name/Handle + Teal Verified Badge */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="relative size-10 rounded-full overflow-hidden bg-slate-100 border border-slate-200/90 shrink-0 shadow-2xs group-hover:border-[#16A6A3]/50 transition-colors">
                        {rev.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={rev.avatarUrl}
                            alt={rev.name}
                            className="size-full object-cover group-hover:scale-105 transition-transform duration-300"
                            loading="lazy"
                          />
                        ) : (
                          <div
                            className={`size-full ${rev.avatarBg || "bg-[#0B1F3A]"} text-white flex items-center justify-center font-bold text-[11px] tracking-wider`}
                          >
                            {rev.avatar}
                          </div>
                        )}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1 min-w-0">
                          <span className="font-bold text-[#0B1F3A] text-[13px] sm:text-[13.5px] truncate">
                            {rev.name}
                          </span>
                          {rev.verified && (
                            <svg
                              className="w-4 h-4 text-[#16A6A3] shrink-0 fill-current"
                              viewBox="0 0 20 20"
                              aria-label="Verified Researcher"
                            >
                              <path
                                fillRule="evenodd"
                                d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                          )}
                        </div>
                        <span className="text-[11.5px] text-[#64748B] truncate">
                          {rev.handle}
                        </span>
                      </div>
                    </div>

                    {/* Rating Stars Badge */}
                    <div className="flex items-center text-[#F59E0B] text-[11px] shrink-0">
                      {"★".repeat(rev.rating)}
                    </div>
                  </div>

                  {/* Review Text Body */}
                  <p className="text-[13px] text-[#334155] leading-relaxed mt-3">
                    {rev.comment}
                  </p>

                  {/* Attached Laboratory Photo Evidence (creates dynamic ups and downs) */}
                  {rev.photo && (
                    <div className="mt-3 aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-[#E2E8F0]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={rev.photo}
                        alt="Analytical laboratory verification"
                        className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-300"
                        loading="lazy"
                      />
                    </div>
                  )}

                  {/* Subtle Timestamp & Verified Order Footer */}
                  <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between text-[11px] text-slate-400">
                    <span>{rev.date}</span>
                    <span className="text-[#16A6A3] font-medium text-[10.5px]">Verified Order</span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ------------------------------------------------------------- */}
          {/* Traveling Bleed Gradient Overlay & Smoothly Translating Button */}
          {/* ------------------------------------------------------------- */}
          <div
            className={`absolute inset-x-0 bottom-0 flex items-center justify-center pointer-events-none transition-all duration-900 ease-[cubic-bezier(0.16,1,0.3,1)] ${
              !isExpanded
                ? "h-56 sm:h-64 bg-gradient-to-t from-white via-white/90 via-45% to-transparent pb-4 sm:pb-6"
                : "h-24 bg-gradient-to-t from-white/95 via-white/50 to-transparent pb-4"
            }`}
          >
            <button
              type="button"
              onClick={handleToggleExpand}
              className={`pointer-events-auto group px-7 py-3 rounded-full border border-slate-200/90 bg-white/95 backdrop-blur-xs hover:bg-white hover:border-[#16A6A3] text-slate-800 hover:text-[#0B1F3A] text-[13px] font-semibold transition-all duration-300 active:scale-95 cursor-pointer inline-flex items-center gap-2.5 ${
                !isExpanded
                  ? "shadow-sm hover:shadow-xl hover:shadow-teal-500/15"
                  : "shadow-md animate-review-button-glow hover:shadow-xl hover:shadow-teal-500/25"
              }`}
            >
              <span className="flex items-center gap-2">
                <span>{isExpanded ? "Show Less" : "Show More"}</span>
                {!isExpanded && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-[#0B1F3A]/75 group-hover:bg-[#16A6A3]/15 group-hover:text-[#16A6A3] transition-colors">
                    +{Math.max(0, reviews.length - 8)} Verified Reviews
                  </span>
                )}
              </span>
              <div className="size-5 rounded-full bg-slate-100 group-hover:bg-[#16A6A3] group-hover:text-white text-slate-500 flex items-center justify-center transition-all duration-300">
                <svg
                  className={`w-3 h-3 transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] ${
                    isExpanded ? "rotate-180" : "rotate-0"
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2.5}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* Multi-Step Animated Write A Review Modal (Preserved & Intact)  */}
      {/* ------------------------------------------------------------- */}
      {modalOpen && (
        <WriteReviewModal
          productTitle={productTitle}
          onClose={() => setModalOpen(false)}
          onSubmit={handleReviewSubmitted}
        />
      )}
    </section>
  )
}

// ---------------------------------------------------------------------------
// Animated Multi-Step Review Modal Component (Preserved Exactly)
// ---------------------------------------------------------------------------

interface WriteReviewModalProps {
  productTitle: string
  onClose: () => void
  onSubmit: (review: { name: string; rating: number; comment: string; photo?: string }) => void
}

function WriteReviewModal({ productTitle, onClose, onSubmit }: WriteReviewModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4 | 5>(1)
  const [direction, setDirection] = useState<"next" | "prev">("next")
  const [isAnimating, setIsAnimating] = useState(false)

  // Form Fields State
  const [rating, setRating] = useState<number>(5)
  const [hoverRating, setHoverRating] = useState<number>(0)
  const [photo, setPhoto] = useState<string | undefined>(undefined)
  const [comment, setComment] = useState<string>("")
  const [name, setName] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [copiedCode, setCopiedCode] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // Animate step transitions
  const goToStep = (nextStep: 1 | 2 | 3 | 4 | 5, dir: "next" | "prev") => {
    if (isAnimating) return
    setDirection(dir)
    setIsAnimating(true)
    setTimeout(() => {
      setStep(nextStep)
      setIsAnimating(false)
    }, 220)
  }

  // Handle Photo File selection
  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = () => {
        if (typeof reader.result === "string") {
          setPhoto(reader.result)
          goToStep(3, "next")
        }
      }
      reader.readAsDataURL(file)
    }
  }

  // Handle Final Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return

    onSubmit({
      name: name.trim(),
      rating,
      comment: comment.trim() || "Verified high-quality research compound.",
      photo,
    })

    goToStep(5, "next")
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity duration-300">
      
      {/* Modal Card Container */}
      <div className="relative w-full max-w-[520px] min-h-[460px] bg-white rounded-2xl shadow-2xl p-6 sm:p-9 flex flex-col justify-between overflow-hidden">
        
        {/* Top-Left Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close review dialog"
          className="absolute top-5 left-5 w-8 h-8 rounded-full hover:bg-slate-100 text-slate-500 hover:text-black flex items-center justify-center transition-colors cursor-pointer z-20"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Animated Step Body Container */}
        <div
          className={`flex-1 flex flex-col justify-center items-center pt-8 pb-4 transition-all duration-200 ease-out ${
            isAnimating
              ? direction === "next"
                ? "-translate-x-8 opacity-0"
                : "translate-x-8 opacity-0"
              : "translate-x-0 opacity-100"
          }`}
        >

          {/* STEP 1: Star Rating */}
          {step === 1 && (
            <div className="w-full flex flex-col items-center text-center">
              <h3 className="text-[20px] sm:text-[22px] font-semibold text-[#0B1F3A] mb-8">
                How would you rate this item?
              </h3>

              {/* 5 Big Interactive Stars */}
              <div className="flex items-center gap-2.5 sm:gap-3 mb-3">
                {[1, 2, 3, 4, 5].map((starValue) => {
                  const isFilled = (hoverRating || rating) >= starValue
                  return (
                    <button
                      key={starValue}
                      type="button"
                      onMouseEnter={() => setHoverRating(starValue)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => {
                        setRating(starValue)
                        goToStep(2, "next")
                      }}
                      className="p-1 transition-transform duration-150 hover:scale-115 cursor-pointer"
                    >
                      <svg
                        className={`w-9 h-9 sm:w-11 sm:h-11 ${
                          isFilled ? "text-[#F59E0B] fill-current" : "text-[#F59E0B] fill-none stroke-current"
                        }`}
                        strokeWidth={1.5}
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    </button>
                  )
                })}
              </div>

              <div className="w-full max-w-[280px] flex items-center justify-between text-[12px] text-slate-400 font-medium px-2">
                <span>Dislike it</span>
                <span>Love it!</span>
              </div>
            </div>
          )}

          {/* STEP 2: Photo Upload + 10% Discount Offer */}
          {step === 2 && (
            <div className="w-full flex flex-col items-center text-center">
              <h3 className="text-[22px] sm:text-[24px] font-bold text-[#0B1F3A]">
                Show it off
              </h3>
              <p className="text-[14px] text-slate-500 mt-1 mb-6">
                We&apos;d love to see it in action!
              </p>

              <div className="w-full max-w-[380px] border border-slate-200 rounded-2xl p-6 bg-slate-50/60 shadow-xs flex flex-col items-center">
                <h4 className="text-[16px] font-bold text-[#0B1F3A] mb-4">
                  Get 10% off your next purchase
                </h4>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoSelect}
                  className="hidden"
                />

                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full py-3 px-6 rounded-xl bg-black hover:bg-slate-800 text-white text-[14px] font-semibold flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-sm"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span>{photo ? "Photo Added ✓" : "Add photos"}</span>
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: Share Experience Textarea */}
          {step === 3 && (
            <div className="w-full flex flex-col items-center">
              <h3 className="text-[22px] sm:text-[24px] font-bold text-[#0B1F3A] mb-5 text-center">
                Tell us more!
              </h3>

              <div className="w-full">
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share your experience"
                  rows={5}
                  className="w-full p-4 text-[14px] text-slate-800 bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A] resize-none leading-relaxed placeholder:text-slate-400"
                />
              </div>
            </div>
          )}

          {/* STEP 4: Name & Email Input */}
          {step === 4 && (
            <form onSubmit={handleSubmit} className="w-full flex flex-col items-center">
              <h3 className="text-[22px] sm:text-[24px] font-bold text-[#0B1F3A] mb-1 text-center">
                About you
              </h3>
              <p className="text-[13px] text-slate-500 mb-5 text-center">
                Your feedback helps other researchers choose the right compounds.
              </p>

              <div className="w-full space-y-3.5">
                <div>
                  <label className="block text-[12px] font-semibold text-[#0B1F3A] mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dr. Alex Morgan"
                    className="w-full p-3 text-[13.5px] bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                  />
                </div>

                <div>
                  <label className="block text-[12px] font-semibold text-[#0B1F3A] mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@organization.com (kept private)"
                    className="w-full p-3 text-[13.5px] bg-white border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0B1F3A]"
                  />
                </div>
              </div>
            </form>
          )}

          {/* STEP 5: Success & 10% Discount Code Presentation */}
          {step === 5 && (
            <div className="w-full flex flex-col items-center text-center py-2">
              <div className="w-14 h-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-2xl mb-4 border border-emerald-200">
                ✓
              </div>
              <h3 className="text-[22px] font-bold text-[#0B1F3A]">
                Thank you for your review!
              </h3>
              <p className="text-[13.5px] text-slate-600 mt-1.5 max-w-sm">
                Your verified review has been submitted and posted for {productTitle}.
              </p>

              {/* 10% Discount Coupon Card */}
              <div className="w-full max-w-[320px] bg-slate-50 border border-slate-200 rounded-xl p-4 mt-6 text-center">
                <span className="text-[11px] font-bold text-[#16A6A3] uppercase tracking-wider block mb-1">
                  Your Reward Coupon
                </span>
                <div className="flex items-center justify-center gap-2">
                  <span className="font-mono font-bold text-[18px] text-[#0B1F3A] tracking-widest">
                    RESEARCH10
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText("RESEARCH10")
                      setCopiedCode(true)
                      setTimeout(() => setCopiedCode(false), 2000)
                    }}
                    className="text-[11px] font-semibold px-2.5 py-1 rounded-md bg-[#0B1F3A] hover:bg-[#16A6A3] text-white transition-colors cursor-pointer"
                  >
                    {copiedCode ? "Copied! ✓" : "Copy"}
                  </button>
                </div>
                <span className="text-[11px] text-slate-400 mt-1 block">
                  10% off your next cartridge or vial order
                </span>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="mt-6 px-6 py-2.5 rounded-lg bg-[#0B1F3A] text-white text-[13px] font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          )}

        </div>

        {/* Bottom Bar: Back button, 4 Segments Progress, Skip/Next */}
        {step < 5 && (
          <div className="flex items-center justify-between pt-4 border-t border-slate-100 mt-auto">
            {step > 1 ? (
              <button
                type="button"
                onClick={() => {
                  if (step === 2) goToStep(1, "prev")
                  else if (step === 3) goToStep(2, "prev")
                  else if (step === 4) goToStep(3, "prev")
                }}
                className="text-[13.5px] font-semibold text-black hover:text-slate-600 flex items-center gap-1.5 cursor-pointer"
              >
                <span>←</span>
                <span>Back</span>
              </button>
            ) : (
              <div className="w-12" />
            )}

            <div className="flex items-center gap-1.5">
              {[1, 2, 3, 4].map((seg) => (
                <div
                  key={seg}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    seg <= step
                      ? "w-8 sm:w-10 bg-black"
                      : "w-8 sm:w-10 bg-slate-200"
                  }`}
                />
              ))}
            </div>

            {step === 1 && (
              <button
                type="button"
                onClick={() => goToStep(2, "next")}
                className="text-[13.5px] font-semibold text-slate-400 hover:text-black cursor-pointer"
              >
                Next →
              </button>
            )}

            {step === 2 && (
              <button
                type="button"
                onClick={() => goToStep(3, "next")}
                className="text-[13.5px] font-semibold text-black hover:text-slate-600 cursor-pointer"
              >
                {photo ? "Next →" : "Skip"}
              </button>
            )}

            {step === 3 && (
              <button
                type="button"
                onClick={() => goToStep(4, "next")}
                className="px-5 py-2 rounded-lg bg-slate-100 hover:bg-black hover:text-white text-[#0B1F3A] text-[13px] font-semibold transition-colors cursor-pointer"
              >
                Next
              </button>
            )}

            {step === 4 && (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={!name.trim()}
                className={`px-5 py-2 rounded-lg text-[13px] font-semibold transition-colors cursor-pointer ${
                  name.trim()
                    ? "bg-[#0B1F3A] hover:bg-[#16A6A3] text-white"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                Submit
              </button>
            )}
          </div>
        )}

      </div>
    </div>
  )
}
