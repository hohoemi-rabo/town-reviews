import Image from 'next/image'

interface ReviewImageProps {
  images: string[]
}

export default function ReviewImage({ images }: ReviewImageProps) {
  if (images.length === 0) return null

  return (
    <div className="flex gap-2 overflow-x-auto scrollbar-hide snap-x snap-mandatory">
      {images.map((image, index) => (
        <div
          key={index}
          className="relative flex-shrink-0 w-48 h-32 rounded-lg overflow-hidden snap-start"
        >
          <Image
            src={image}
            alt={`口コミ画像 ${index + 1}`}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 192px, 192px"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  )
}
