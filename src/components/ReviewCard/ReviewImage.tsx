'use client'

import Image from 'next/image'
import { useState } from 'react'

interface ReviewImageProps {
  images: string[]
}

export default function ReviewImage({ images }: ReviewImageProps) {
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set())

  if (images.length === 0) return null

  const handleImageLoad = (index: number) => {
    setLoadedImages((prev) => new Set(prev).add(index))
  }

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
      {images.map((image, index) => (
        <div
          key={index}
          className="relative flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden snap-start bg-gray-100"
        >
          <Image
            src={image}
            alt={`口コミ画像 ${index + 1}`}
            fill
            className={`object-cover transition-opacity duration-300 ${
              loadedImages.has(index) ? 'opacity-100' : 'opacity-0'
            }`}
            sizes="(max-width: 768px) 192px, 192px"
            quality={85}
            loading="lazy"
            onLoad={() => handleImageLoad(index)}
            placeholder="blur"
            blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mN8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg=="
          />
          {!loadedImages.has(index) && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-washi-green"></div>
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
