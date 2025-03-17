"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface SavedResourcesContextType {
  savedResources: Set<string>
  toggleSave: (resourceId: string) => void
}

const SavedResourcesContext = createContext<SavedResourcesContextType | undefined>(undefined)

export function SavedResourcesProvider({ 
  children,
  initialSavedResources = []
}: { 
  children: React.ReactNode
  initialSavedResources?: string[]
}) {
  const [savedResources, setSavedResources] = useState<Set<string>>(
    new Set(initialSavedResources)
  )

  const toggleSave = useCallback((resourceId: string) => {
    setSavedResources(prev => {
      const next = new Set(prev)
      if (next.has(resourceId)) {
        next.delete(resourceId)
      } else {
        next.add(resourceId)
      }
      return next
    })
  }, [])

  return (
    <SavedResourcesContext.Provider value={{ savedResources, toggleSave }}>
      {children}
    </SavedResourcesContext.Provider>
  )
}

export function useSavedResources() {
  const context = useContext(SavedResourcesContext)
  if (context === undefined) {
    throw new Error('useSavedResources must be used within a SavedResourcesProvider')
  }
  return context
} 