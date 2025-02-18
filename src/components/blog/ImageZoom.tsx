/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useState } from "react"
import Image from "next/image"
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog"
import { ZoomIn, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { VisuallyHidden } from "@/components/ui/visually-hidden"
import { AnimatePresence, motion } from "framer-motion"

interface ImageZoomProps {
  src: string
  alt: string
  isContent?: boolean
}

export function ImageZoom({ src, alt, isContent = false }: ImageZoomProps) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <motion.div 
        onClick={() => setIsOpen(true)}
        className={cn(
          "group relative overflow-hidden rounded-lg",
          isContent ? "w-full" : "aspect-video"
        )}
        whileHover={{ scale: 1.02 }}
        transition={{ duration: 0.2 }}
      >
        <Image
          src={src}
          alt={alt}
          width={1200}
          height={isContent ? 800 : 600}
          className={cn(
            "transition-all duration-300",
            isContent ? "w-full h-auto" : "object-cover",
            "group-hover:brightness-90"
          )}
          priority={!isContent}
        />
        <motion.div 
          className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          initial={{ opacity: 0 }}
          whileHover={{ opacity: 1 }}
        >
          <motion.div 
            className="p-2 rounded-full bg-background/80 backdrop-blur-sm"
            initial={{ scale: 0.8 }}
            whileHover={{ scale: 1 }}
          >
            <ZoomIn className="h-4 w-4" />
          </motion.div>
        </motion.div>
      </motion.div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent 
          className="max-w-none max-h-none h-[100dvh] w-screen p-0 border-none bg-background/95 backdrop-blur-sm dark:bg-background/98 [&>button]:hidden"
          onClick={() => setIsOpen(false)}
        >
          <DialogTitle asChild>
            <VisuallyHidden>Image Preview</VisuallyHidden>
          </DialogTitle>
          
          <motion.div 
            className="relative w-full h-full flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            <motion.button
              onClick={(e) => {
                e.stopPropagation()
                setIsOpen(false)
              }}
              className="absolute top-4 right-4 z-50 p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <X className="h-4 w-4" />
            </motion.button>

            <motion.div 
              className="relative w-full h-full p-4 sm:p-8"
              onClick={(e) => e.stopPropagation()}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2, delay: 0.1 }}
            >
              <Image
                src={src}
                alt={alt}
                fill
                className="object-contain"
                quality={100}
                priority
                sizes="100vw"
              />
            </motion.div>
          </motion.div>
        </DialogContent>
      </Dialog>
    </>
  )
} 