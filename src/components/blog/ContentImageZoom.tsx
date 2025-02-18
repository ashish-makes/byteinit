/* eslint-disable @typescript-eslint/no-unused-vars */
'use client'

import { useEffect, useState } from 'react'
import { createRoot } from 'react-dom/client'
import { ImageZoom } from './ImageZoom'

export function ContentImageZoom() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    const zoomElements = document.querySelectorAll('[data-image-zoom]')
    
    zoomElements.forEach((element) => {
      const src = element.getAttribute('data-image-src')
      const alt = element.getAttribute('data-image-alt')
      
      if (src) {
        const root = document.createElement('div')
        element.replaceWith(root)
        
        const imageZoom = <ImageZoom src={src} alt={alt || ''} isContent />
        createRoot(root).render(imageZoom)
      }
    })

    setMounted(true)

    return () => {
      // Cleanup if needed
    }
  }, [])

  return null
} 