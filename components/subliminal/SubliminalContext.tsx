'use client';

import { useSubliminalStore } from '@/lib/state/SubliminalStore'
import { type ReactNode } from 'react'

interface SubliminalProviderProps {
  children: ReactNode
}

/**
 * Provider component that initializes the subliminal feature context.
 * This is a thin wrapper around the Zustand store to maintain compatibility
 * with existing components while we migrate to direct store usage.
 */
export function SubliminalProvider({ children }: SubliminalProviderProps) {
  return children
}

/**
 * Hook to access subliminal state and actions.
 * @deprecated Use useSubliminalStore directly for better performance
 */
export function useSubliminal() {
  return useSubliminalStore()
} 