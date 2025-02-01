"use client"

/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from "react"
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Button } from "./button"
import { Smile } from "lucide-react"
import { useTheme } from "next-themes"
import { useMediaQuery } from "@/hooks/use-media-query"

interface EmojiPickerProps {
  onChange: (emoji: string) => void
}

export function EmojiPicker({ onChange }: EmojiPickerProps) {
  const { theme } = useTheme()
  const isMobile = useMediaQuery("(max-width: 768px)")

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Smile className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent 
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "center" : "start"}
        sideOffset={isMobile ? 10 : 40}
        className={`
          border-none bg-transparent shadow-none drop-shadow-none
          ${isMobile ? 'w-screen h-[350px] mb-0' : 'mb-16'}
        `}
      >
        <div className={`
          ${isMobile ? 'scale-[0.85] -mt-6' : ''}
          transform-gpu
        `}>
          <Picker
            theme={theme === "dark" ? "dark" : "light"}
            data={data}
            onEmojiSelect={(emoji: { native: string }) => onChange(emoji.native)}
          />
        </div>
      </PopoverContent>
    </Popover>
  )
} 