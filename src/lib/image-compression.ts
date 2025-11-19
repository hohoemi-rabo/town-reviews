import imageCompression from 'browser-image-compression'

export interface CompressionOptions {
  maxSizeMB?: number
  maxWidthOrHeight?: number
  useWebWorker?: boolean
}

export async function compressImage(
  file: File,
  options: CompressionOptions = {}
): Promise<File> {
  const defaultOptions = {
    maxSizeMB: 0.5, // Max file size: 500KB (optimized for mobile reviews)
    maxWidthOrHeight: 1200, // Max width or height (sufficient for review images)
    useWebWorker: false, // Disabled to avoid CSP issues with external CDN
    ...options,
  }

  try {
    const compressedFile = await imageCompression(file, defaultOptions)
    return compressedFile
  } catch (error) {
    console.error('Image compression error:', error)
    throw new Error('画像の圧縮に失敗しました')
  }
}

export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg']
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: 'JPEG or PNG形式の画像のみアップロードできます',
    }
  }

  // Check file size (20MB max - will be compressed to 500KB)
  const maxSize = 20 * 1024 * 1024 // 20MB in bytes (generous limit for raw photos)
  if (file.size > maxSize) {
    return {
      valid: false,
      error: 'ファイルサイズは20MB以下にしてください（自動的に500KB以下に圧縮されます）',
    }
  }

  return { valid: true }
}

export async function readFileAsDataURL(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result)
      } else {
        reject(new Error('Failed to read file'))
      }
    }
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(file)
  })
}
