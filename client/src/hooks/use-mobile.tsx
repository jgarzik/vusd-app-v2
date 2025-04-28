/**
 * Copyright 2025 Hemi Labs. All rights reserved.
 */

/**
 * use-mobile.tsx - Responsive layout detection hook
 * 
 * This hook provides a way to detect whether the current viewport is mobile-sized.
 * Key features:
 * - Uses media queries to detect viewport width
 * - Provides a boolean value indicating mobile state
 * - Updates automatically when window is resized
 * - Handles cleanup properly with event listener removal
 * 
 * The mobile breakpoint is set at 768px, matching the md breakpoint in Tailwind CSS.
 * Components can use this hook to conditionally render different UI based on screen size.
 */

import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    mql.addEventListener("change", onChange)
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => mql.removeEventListener("change", onChange)
  }, [])

  return !!isMobile
}
