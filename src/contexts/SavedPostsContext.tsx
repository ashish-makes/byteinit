"use client"

import React, { createContext, useContext, useState, useCallback } from 'react'

interface SavedPostsContextType {
  savedPosts: Set<string>
  toggleSavedPost: (postId: string) => void
}

const SavedPostsContext = createContext<SavedPostsContextType | undefined>(undefined)

export function SavedPostsProvider({ 
  children,
  initialSavedPosts = []
}: { 
  children: React.ReactNode
  initialSavedPosts?: string[]
}) {
  const [savedPosts, setSavedPosts] = useState<Set<string>>(
    new Set(initialSavedPosts)
  )

  const toggleSavedPost = useCallback((postId: string) => {
    setSavedPosts(prev => {
      const next = new Set(prev)
      if (next.has(postId)) {
        next.delete(postId)
      } else {
        next.add(postId)
      }
      return next
    })
  }, [])

  return (
    <SavedPostsContext.Provider value={{ savedPosts, toggleSavedPost }}>
      {children}
    </SavedPostsContext.Provider>
  )
}

export function useSavedPosts() {
  const context = useContext(SavedPostsContext)
  if (context === undefined) {
    throw new Error('useSavedPosts must be used within a SavedPostsProvider')
  }
  return context
} 