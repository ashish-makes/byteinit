"use client"

import React, { useRef, useState, useEffect } from 'react'
import { X, Plus } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'

interface TagInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function TagInput({ value, onChange, placeholder }: TagInputProps) {
  const [isAdding, setIsAdding] = useState(false)
  const [newTag, setNewTag] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)

  const addTag = () => {
    if (newTag.trim()) {
      const currentTags = value ? value.split(',').map(t => t.trim()) : []
      onChange([...currentTags, newTag.trim()].join(', '))
      setNewTag('')
    }
    setIsAdding(false)
  }

  const removeTag = (tagToRemove: string) => {
    const currentTags = value ? value.split(',').map(t => t.trim()) : []
    onChange(currentTags.filter(tag => tag !== tagToRemove).join(', '))
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      addTag()
    } else if (e.key === 'Escape') {
      setIsAdding(false)
      setNewTag('')
    }
  }

  useEffect(() => {
    if (isAdding) {
      inputRef.current?.focus()
    }
  }, [isAdding])

  return (
    <div className="flex flex-wrap gap-2 p-2 bg-muted/20 rounded-lg min-h-[2.5rem] items-center">
      {value && value.split(',').map((tag) => (
        <Badge
          key={tag}
          variant="secondary"
          className="rounded-full px-3 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {tag.trim()}
          <button
            type="button"
            className="ml-1 hover:text-destructive"
            onClick={() => removeTag(tag.trim())}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
      {isAdding ? (
        <Input
          ref={inputRef}
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={addTag}
          className="w-32 h-7 text-sm bg-background"
          placeholder="Add tag..."
        />
      ) : (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 rounded-full hover:bg-muted"
          onClick={() => setIsAdding(true)}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Tag
        </Button>
      )}
    </div>
  )
} 