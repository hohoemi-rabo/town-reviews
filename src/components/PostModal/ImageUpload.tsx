'use client'

import { useState, useRef, ChangeEvent, DragEvent } from 'react'
import Image from 'next/image'
import { compressImage, validateImageFile } from '@/lib/image-compression'

interface ImageUploadProps {
  images: File[]
  onImagesChange: (images: File[]) => void
  maxImages?: number
}

export default function ImageUpload({
  images,
  onImagesChange,
  maxImages = 1,
}: ImageUploadProps) {
  const [previews, setPreviews] = useState<string[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFiles = async (files: FileList | null) => {
    if (!files) return

    setError(null)

    // Check total count
    if (images.length + files.length > maxImages) {
      setError(`画像は最大${maxImages}枚までアップロードできます`)
      return
    }

    const newImages: File[] = []
    const newPreviews: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]

      // Validate file
      const validation = validateImageFile(file)
      if (!validation.valid) {
        setError(validation.error!)
        continue
      }

      try {
        // Compress image
        const compressedFile = await compressImage(file)
        newImages.push(compressedFile)

        // Create preview
        const reader = new FileReader()
        reader.onload = (e) => {
          newPreviews.push(e.target?.result as string)
          if (newPreviews.length === files.length) {
            setPreviews([...previews, ...newPreviews])
          }
        }
        reader.readAsDataURL(compressedFile)
      } catch (err) {
        console.error('Image compression error:', err)
        setError('画像の圧縮に失敗しました')
      }
    }

    if (newImages.length > 0) {
      onImagesChange([...images, ...newImages])
    }
  }

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files)
  }

  const handleDragEnter = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
  }

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    handleFiles(e.dataTransfer.files)
  }

  const handleRemoveImage = (index: number) => {
    const newImages = [...images]
    newImages.splice(index, 1)
    onImagesChange(newImages)

    const newPreviews = [...previews]
    newPreviews.splice(index, 1)
    setPreviews(newPreviews)

    setError(null)
  }

  const handleClickUpload = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        写真 (任意、最大{maxImages}枚)
      </label>

      {/* Upload area */}
      {images.length < maxImages && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={handleClickUpload}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragging
              ? 'border-washi-green bg-washi-beige'
              : 'border-gray-300 hover:border-washi-green-light bg-gray-50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            multiple
            onChange={handleFileInput}
            className="hidden"
          />
          <div className="flex flex-col items-center gap-2">
            <span className="text-3xl">📸</span>
            <p className="text-sm text-gray-600">
              クリックまたはドラッグ&ドロップで画像を追加
            </p>
            <p className="text-xs text-gray-500">
              JPEG、PNG形式、5MB以下
            </p>
          </div>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {/* Preview */}
      {previews.length > 0 && (
        <div className="relative w-full max-w-md rounded-lg overflow-hidden border-2 border-gray-200 group">
          <div className="relative aspect-video">
            <Image
              src={previews[0]}
              alt="プレビュー画像"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 448px"
            />
          </div>
          <button
            type="button"
            onClick={() => handleRemoveImage(0)}
            className="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
            aria-label="画像を削除"
          >
            ✕
          </button>
        </div>
      )}

      {/* Image count info */}
      {images.length > 0 && (
        <p className="text-xs text-gray-500 text-center">
          {images.length}/{maxImages}枚
        </p>
      )}
    </div>
  )
}
