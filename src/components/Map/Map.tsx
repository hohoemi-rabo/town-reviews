'use client'

import { useEffect, useRef, useState } from 'react'
import { MarkerClusterer } from '@googlemaps/markerclusterer'
import {
  GOOGLE_MAPS_API_KEY,
  DEFAULT_CENTER,
  DEFAULT_ZOOM,
  REVIEW_CATEGORY_COLORS,
  loadGoogleMapsScript,
} from '@/lib/google-maps'
import { defaultMapOptions } from '@/styles/map-styles'
import type { Tables } from '@/types/database.types'

type Recommendation = Tables<'recommendations'> & {
  places: Tables<'places'> | null
}

interface MapProps {
  recommendations?: Recommendation[]
  onMarkerClick?: (recommendation: Recommendation) => void
  className?: string
  center?: { lat: number; lng: number }
  zoom?: number
}

export default function Map({
  recommendations = [],
  onMarkerClick,
  className = '',
  center = DEFAULT_CENTER,
  zoom = DEFAULT_ZOOM,
}: MapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const mapInstanceRef = useRef<google.maps.Map | null>(null)
  const markersRef = useRef<google.maps.Marker[]>([])
  const clustererRef = useRef<MarkerClusterer | null>(null)
  const currentLocationMarkerRef = useRef<google.maps.Marker | null>(null)

  const [isLoaded, setIsLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Load Google Maps script
  useEffect(() => {
    if (!GOOGLE_MAPS_API_KEY) {
      setError('Google Maps APIキーが設定されていません')
      return
    }

    loadGoogleMapsScript()
      .then(() => {
        setIsLoaded(true)
      })
      .catch((err) => {
        console.error('Failed to load Google Maps:', err)
        setError('Google Mapsの読み込みに失敗しました')
      })
  }, [])

  // Initialize map
  useEffect(() => {
    if (!isLoaded || !mapRef.current || mapInstanceRef.current) return

    try {
      const map = new google.maps.Map(mapRef.current, {
        ...defaultMapOptions,
        center,
        zoom,
      })

      mapInstanceRef.current = map

      // Add current location button
      const locationButton = document.createElement('button')
      locationButton.textContent = '現在地'
      locationButton.classList.add('custom-map-control-button')
      locationButton.style.cssText = `
        background-color: #fff;
        border: 2px solid #fff;
        border-radius: 3px;
        box-shadow: 0 2px 6px rgba(0,0,0,.3);
        cursor: pointer;
        font-size: 14px;
        margin: 10px;
        padding: 8px 12px;
        text-align: center;
      `

      map.controls[google.maps.ControlPosition.RIGHT_BOTTOM].push(locationButton)

      locationButton.addEventListener('click', () => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              const pos = {
                lat: position.coords.latitude,
                lng: position.coords.longitude,
              }

              // Remove existing current location marker
              if (currentLocationMarkerRef.current) {
                currentLocationMarkerRef.current.setMap(null)
              }

              // Create new current location marker
              const currentMarker = new google.maps.Marker({
                position: pos,
                map: map,
                title: '現在地',
                icon: {
                  path: google.maps.SymbolPath.CIRCLE,
                  fillColor: '#4285F4',
                  fillOpacity: 1,
                  strokeColor: '#ffffff',
                  strokeWeight: 3,
                  scale: 10,
                },
                zIndex: 1000,
              })

              currentLocationMarkerRef.current = currentMarker
              map.setCenter(pos)
              map.setZoom(15)
            },
            () => {
              alert('現在地を取得できませんでした')
            },
            {
              enableHighAccuracy: true,
              timeout: 10000,
              maximumAge: 0,
            }
          )
        } else {
          alert('お使いのブラウザは位置情報に対応していません')
        }
      })
    } catch (err) {
      console.error('Failed to initialize map:', err)
      setError('地図の初期化に失敗しました')
    }
  }, [isLoaded, center, zoom])

  // Update markers when recommendations change
  useEffect(() => {
    if (!mapInstanceRef.current || !isLoaded) return

    // Clear existing markers and clusterer
    if (clustererRef.current) {
      clustererRef.current.clearMarkers()
    }
    markersRef.current.forEach((marker) => marker.setMap(null))
    markersRef.current = []

    // Create new markers (square/memo style) - one marker per recommendation
    const newMarkers = recommendations
      .filter((rec) => rec.places) // Only show recommendations with valid places
      .map((recommendation) => {
        const place = recommendation.places!
        const reviewCategory = recommendation.review_category || 'その他'
        const markerColor = REVIEW_CATEGORY_COLORS[reviewCategory as keyof typeof REVIEW_CATEGORY_COLORS] || REVIEW_CATEGORY_COLORS['その他']

        const marker = new google.maps.Marker({
          position: { lat: place.lat, lng: place.lng },
          map: mapInstanceRef.current!,
          title: place.name,
          icon: {
            // Square path: M(move to) -size,-size L(line to) size,-size L size,size L -size,size Z(close)
            path: 'M -12,-12 L 12,-12 L 12,12 L -12,12 Z',
            fillColor: markerColor,
            fillOpacity: 0.95,
            strokeColor: '#333333',
            strokeWeight: 3,
            scale: 1,
            anchor: new google.maps.Point(0, 0),
          },
        })

        // Add click listener
        if (onMarkerClick) {
          marker.addListener('click', () => {
            onMarkerClick(recommendation)
          })
        }

        return marker
      })

    markersRef.current = newMarkers

    // Create marker clusterer
    if (newMarkers.length > 0) {
      clustererRef.current = new MarkerClusterer({
        map: mapInstanceRef.current,
        markers: newMarkers,
      })
    }
  }, [recommendations, isLoaded, onMarkerClick])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (clustererRef.current) {
        clustererRef.current.clearMarkers()
      }
      markersRef.current.forEach((marker) => marker.setMap(null))
      if (currentLocationMarkerRef.current) {
        currentLocationMarkerRef.current.setMap(null)
      }
    }
  }, [])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-red-50 border border-red-200 rounded-lg ${className}`}>
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className={`flex items-center justify-center bg-gray-50 ${className}`}>
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="text-gray-600 text-sm">地図を読み込んでいます...</p>
        </div>
      </div>
    )
  }

  return <div ref={mapRef} className={className} />
}
