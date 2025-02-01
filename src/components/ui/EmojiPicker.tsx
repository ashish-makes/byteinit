"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "./button"
import { Smile } from "lucide-react"
import { useTheme } from "next-themes"

interface EmojiPickerProps {
  onChange: (emoji: string) => void
}

export function EmojiPicker({ onChange }: EmojiPickerProps) {
  const { theme } = useTheme()

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side="right" 
        sideOffset={40}
        className="mb-16 border-none bg-transparent shadow-none drop-shadow-none"
      >
        <Picker
          theme={theme === "dark" ? "dark" : "light"}
          data={data}
          onEmojiSelect={(emoji: { native: string }) => onChange(emoji.native)}
        />
      </PopoverContent>
    </Popover>
  )
} 