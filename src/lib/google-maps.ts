// Google Maps JavaScript API utilities

export const GOOGLE_MAPS_API_KEY = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

// Default map center (Iida City, Nagano)
export const DEFAULT_CENTER = {
  lat: 35.5147,
  lng: 137.8261,
}

export const DEFAULT_ZOOM = 12

// Category colors for map pins
export const CATEGORY_COLORS = {
  飲食: '#FF8C00', // Orange
  体験: '#4169E1', // Blue
  自然: '#228B22', // Green
  温泉: '#8B4513', // Brown
} as const

// Load Google Maps script dynamically
export function loadGoogleMapsScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window.google !== 'undefined') {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
    script.async = true
    script.defer = true
    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Google Maps script'))
    document.head.appendChild(script)
  })
}

// Parse Google Maps link to extract Place ID
export function parseGoogleMapsLink(url: string): string | null {
  try {
    // Patterns to extract Place ID from various URL formats
    const patterns = [
      // Full URL with data parameter: https://www.google.com/maps/place/.../@.../data=...!1sChIJ...
      /!1s(ChIJ[a-zA-Z0-9_-]+)/,
      // Query parameter: ?place_id=ChIJ...
      /place_id=(ChIJ[a-zA-Z0-9_-]+)/,
      // CID format: /data=...!3m1!4b1!4m...!3m...!1s0x...:0x...
      /1s0x[a-f0-9]+:0x[a-f0-9]+/,
    ]

    for (const pattern of patterns) {
      const match = url.match(pattern)
      if (match && match[1]) {
        return match[1]
      }
    }

    // If no match found, the URL might be a shortened URL
    // In this case, return null and let the API handle it
    return null
  } catch (error) {
    console.error('Error parsing Google Maps link:', error)
    return null
  }
}
