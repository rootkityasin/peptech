"use client"

import React, { useState, useRef, useEffect, useId } from "react"

export interface SelectOption {
  value: string
  label: string
  sublabel?: string
  disabled?: boolean
}

export interface CustomSelectProps {
  id?: string
  name?: string
  value?: string
  defaultValue?: string
  options: (SelectOption | string)[]
  onChange?: (value: string) => void
  placeholder?: string
  disabled?: boolean
  required?: boolean
  className?: string
  buttonClassName?: string
  dropdownClassName?: string
  variant?: "default" | "sort" | "compact"
  prefixLabel?: string
  align?: "left" | "right"
  "aria-label"?: string
}

export const CustomSelect = React.forwardRef<HTMLSelectElement, CustomSelectProps>(
  (
    {
      id,
      name,
      value: controlledValue,
      defaultValue,
      options,
      onChange,
      placeholder = "Select...",
      disabled = false,
      required = false,
      className = "",
      buttonClassName = "",
      dropdownClassName = "",
      variant = "default",
      prefixLabel,
      align = "left",
      "aria-label": ariaLabel,
    },
    ref
  ) => {
    const generatedId = useId()
    const selectId = id || generatedId
    const containerRef = useRef<HTMLDivElement | null>(null)
    const hiddenSelectRef = useRef<HTMLSelectElement | null>(null)

    // Normalize options
    const normalizedOptions: SelectOption[] = options.map((opt) =>
      typeof opt === "string" ? { value: opt, label: opt } : opt
    )

    // Initial state
    const isControlled = controlledValue !== undefined
    const [internalValue, setInternalValue] = useState<string>(() => {
      if (isControlled) return controlledValue || ""
      if (defaultValue !== undefined) return defaultValue
      return normalizedOptions[0]?.value || ""
    })

    const [isOpen, setIsOpen] = useState(false)
    const [highlightedIndex, setHighlightedIndex] = useState<number>(-1)

    const currentValue = isControlled ? controlledValue || "" : internalValue
    const selectedOption = normalizedOptions.find((o) => o.value === currentValue)

    // Sync forwarded ref with internal select ref
    useEffect(() => {
      if (!ref) return
      if (typeof ref === "function") {
        ref(hiddenSelectRef.current)
      } else {
        ;(ref as React.MutableRefObject<HTMLSelectElement | null>).current = hiddenSelectRef.current
      }
    }, [ref])

    // Close on click outside
    useEffect(() => {
      if (!isOpen) return

      const handleClickOutside = (e: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
          setIsOpen(false)
        }
      }

      document.addEventListener("mousedown", handleClickOutside)
      return () => document.removeEventListener("mousedown", handleClickOutside)
    }, [isOpen])

    // Handle keyboard navigation
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (disabled) return

      if (e.key === "Escape") {
        setIsOpen(false)
        return
      }

      if (!isOpen) {
        if (e.key === "Enter" || e.key === " " || e.key === "ArrowDown") {
          e.preventDefault()
          setIsOpen(true)
          const currIdx = normalizedOptions.findIndex((o) => o.value === currentValue)
          setHighlightedIndex(currIdx >= 0 ? currIdx : 0)
        }
        return
      }

      if (e.key === "ArrowDown") {
        e.preventDefault()
        setHighlightedIndex((prev) => {
          let next = prev + 1
          while (next < normalizedOptions.length && normalizedOptions[next]?.disabled) {
            next++
          }
          return next < normalizedOptions.length ? next : prev
        })
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setHighlightedIndex((prev) => {
          let next = prev - 1
          while (next >= 0 && normalizedOptions[next]?.disabled) {
            next--
          }
          return next >= 0 ? next : prev
        })
      } else if (e.key === "Enter" || e.key === " ") {
        e.preventDefault()
        if (highlightedIndex >= 0 && highlightedIndex < normalizedOptions.length) {
          const opt = normalizedOptions[highlightedIndex]
          if (opt && !opt.disabled) {
            handleSelect(opt.value)
          }
        }
      } else if (e.key === "Tab") {
        setIsOpen(false)
      }
    }

    const handleSelect = (val: string) => {
      if (!isControlled) {
        setInternalValue(val)
      }
      if (hiddenSelectRef.current) {
        hiddenSelectRef.current.value = val
        hiddenSelectRef.current.dispatchEvent(new Event("change", { bubbles: true }))
      }
      onChange?.(val)
      setIsOpen(false)
    }

    // Determine base button classes according to variant
    let buttonClasses = ""
    if (variant === "sort") {
      buttonClasses =
        "inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#f8fafc] hover:bg-[#f1f5f9] border border-[#e2e8f0] hover:border-[#cbd5e1] rounded-lg text-xs font-semibold text-[#0b1f3a] transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#16a6a3]/20"
    } else if (variant === "compact") {
      buttonClasses =
        "w-full flex items-center justify-between gap-2 px-2.5 py-2 bg-white hover:bg-[#f8fafc] border border-[#cbd5e1] focus:border-[#16a6a3] rounded-lg text-xs text-[#0b1f3a] font-medium transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#16a6a3]/15"
    } else {
      // Default form variant
      buttonClasses =
        "w-full flex items-center justify-between gap-2 px-3.5 py-2.5 bg-white hover:bg-[#fafbfc] border border-slate-300 focus:border-[#16a6a3] rounded-xl text-xs sm:text-sm text-[#0b1f3a] font-normal transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-[#16a6a3]/15 shadow-xs"
    }

    if (disabled) {
      buttonClasses += " opacity-60 cursor-not-allowed bg-slate-50"
    }

    return (
      <div
        ref={containerRef}
        className={`relative ${variant === "sort" ? "inline-block shrink-0" : "w-full"} ${className}`}
        onKeyDown={handleKeyDown}
      >
        {/* Hidden native select for standard HTML form submission, FormData, and ref forwarding */}
        <select
          ref={hiddenSelectRef}
          id={selectId}
          name={name}
          value={currentValue}
          onChange={(e) => handleSelect(e.target.value)}
          disabled={disabled}
          required={required}
          className="sr-only pointer-events-none"
          tabIndex={-1}
          aria-hidden="true"
        >
          {normalizedOptions.map((opt) => (
            <option key={opt.value} value={opt.value} disabled={opt.disabled}>
              {opt.label}
            </option>
          ))}
        </select>

        {/* Visual Trigger Button */}
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-label={ariaLabel}
          disabled={disabled}
          onClick={() => !disabled && setIsOpen(!isOpen)}
          className={`${buttonClasses} ${buttonClassName}`}
        >
          <div className="flex items-center gap-1.5 truncate">
            {prefixLabel && (
              <span className="font-medium text-[#64748b] text-[12px] whitespace-nowrap">
                {prefixLabel}
              </span>
            )}
            <span className="truncate text-left font-semibold text-[#0b1f3a]">
              {selectedOption ? selectedOption.label : placeholder}
            </span>
          </div>

          {/* Smooth SVG Chevron */}
          <svg
            className={`w-3.5 h-3.5 text-[#64748b] shrink-0 transition-transform duration-200 ease-out ${
              isOpen ? "rotate-180 text-[#16a6a3]" : ""
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.2}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {/* Floating Custom Dropdown Popover */}
        {isOpen && (
          <div
            role="listbox"
            tabIndex={-1}
            className={`absolute z-50 mt-1.5 ${
              align === "right" ? "right-0" : "left-0"
            } ${
              variant === "sort" ? "min-w-[200px] w-max right-0" : "w-full min-w-full"
            } max-h-60 overflow-y-auto bg-white border border-[#e2e8f0] rounded-xl shadow-xl shadow-slate-900/10 py-1 ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-100 ${dropdownClassName}`}
          >
            {normalizedOptions.length === 0 ? (
              <div className="px-3.5 py-2.5 text-xs text-[#94a3b8] italic text-center">
                No options available
              </div>
            ) : (
              normalizedOptions.map((opt, index) => {
                const isSelected = opt.value === currentValue
                const isHighlighted = index === highlightedIndex

                return (
                  <div
                    key={opt.value}
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      if (!opt.disabled) {
                        handleSelect(opt.value)
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`flex items-center justify-between gap-3 px-3.5 py-2 text-xs sm:text-[13px] transition-colors cursor-pointer select-none ${
                      opt.disabled
                        ? "opacity-40 cursor-not-allowed text-slate-400"
                        : isSelected
                        ? "bg-[#e6fffa] text-[#0d7b78] font-semibold"
                        : isHighlighted
                        ? "bg-[#f8fafc] text-[#16a6a3]"
                        : "text-[#0b1f3a] hover:bg-[#f8fafc]"
                    }`}
                  >
                    <div className="flex flex-col min-w-0">
                      <span className="truncate">{opt.label}</span>
                      {opt.sublabel && (
                        <span className="text-[11px] text-[#64748b] font-normal">{opt.sublabel}</span>
                      )}
                    </div>

                    {/* Active Checkmark Icon */}
                    {isSelected && (
                      <svg
                        className="w-4 h-4 text-[#16a6a3] shrink-0"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    )
  }
)

CustomSelect.displayName = "CustomSelect"
