'use client'

import { useState, useEffect } from 'react'
import { useFilter } from '@/hooks/useFilter'
import Map from '@/components/Map/Map'
import ReviewList, { type ExtendedRecommendation } from '@/components/ReviewCard/ReviewList'
import PostModal from '@/components/PostModal/PostModal'
import FilterPanel from '@/components/Filter/FilterPanel'
import FilterBottomSheet from '@/components/Filter/FilterBottomSheet'

export default function Home() {
  const [showMap, setShowMap] = useState(true)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const [showFilterPanel, setShowFilterPanel] = useState(false) // デスクトップ用
  const [reviews, setReviews] = useState<ExtendedRecommendation[]>([])
  const [loading, setLoading] = useState(true)
  const { filters, activeFilterCount } = useFilter()

  // Fetch reviews from database (with filters)
  useEffect(() => {
    const fetchReviews = async () => {
      setLoading(true)

      // Build query parameters
      const params = new URLSearchParams()
      if (filters.facilityId) params.set('facility_id', filters.facilityId)
      if (filters.tags && filters.tags.length > 0)
        params.set('tags', filters.tags.join(','))
      if (filters.season) params.set('season', filters.season)
      if (filters.heardFromTypes && filters.heardFromTypes.length > 0)
        params.set('heard_from_types', filters.heardFromTypes.join(','))
      if (filters.categories && filters.categories.length > 0)
        params.set('categories', filters.categories.join(','))
      if (filters.search) params.set('search', filters.search)

      try {
        const response = await fetch(`/api/recommendations?${params.toString()}`)
        const data = await response.json()

        if (data.success) {
          setReviews(data.recommendations as ExtendedRecommendation[])
        } else {
          console.error('Failed to fetch reviews:', data.error)
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchReviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filters.facilityId,
    filters.tags?.join(','),
    filters.season,
    filters.heardFromTypes?.join(','),
    filters.categories?.join(','),
    filters.search,
  ])

  const handlePostSuccess = async () => {
    // Refresh reviews after new post (using API with current filters)
    const params = new URLSearchParams()
    if (filters.facilityId) params.set('facility_id', filters.facilityId)
    if (filters.tags && filters.tags.length > 0)
      params.set('tags', filters.tags.join(','))
    if (filters.season) params.set('season', filters.season)
    if (filters.heardFromTypes && filters.heardFromTypes.length > 0)
      params.set('heard_from_types', filters.heardFromTypes.join(','))
    if (filters.categories && filters.categories.length > 0)
      params.set('categories', filters.categories.join(','))
    if (filters.search) params.set('search', filters.search)

    try {
      const response = await fetch(`/api/recommendations?${params.toString()}`)
      const data = await response.json()

      if (data.success) {
        setReviews(data.recommendations as ExtendedRecommendation[])
      }
    } catch (error) {
      console.error('Failed to refresh reviews:', error)
    }

    alert('投稿が完了しました！')
  }

  return (
    <main className="h-screen w-screen flex overflow-hidden">
      {/* Desktop Filter Panel */}
      {showFilterPanel && (
        <aside className="hidden lg:block w-80 flex-shrink-0">
          <FilterPanel onClose={() => setShowFilterPanel(false)} />
        </aside>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow-sm z-10 px-4 py-3 sm:px-6 flex-shrink-0">
          <div className="flex items-center justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-washi-green">
              まち口コミ帳
            </h1>
            <div className="flex items-center gap-2">
              {/* Filter Button */}
              <button
                onClick={() => {
                  if (window.innerWidth >= 1024) {
                    setShowFilterPanel(!showFilterPanel)
                  } else {
                    setIsFilterOpen(true)
                  }
                }}
                className="relative px-4 py-2 bg-white border-2 border-washi-green text-washi-green rounded-lg hover:bg-washi-beige transition-colors font-bold flex items-center gap-2"
              >
                <span>🔍</span>
                <span className="hidden sm:inline">絞り込み</span>
                {activeFilterCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-washi-orange text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <button
                onClick={() => setIsPostModalOpen(true)}
                className="px-4 py-2 bg-washi-orange text-white rounded-lg hover:bg-washi-orange-light transition-colors font-bold flex items-center gap-2"
              >
                <span>✏️</span>
                <span className="hidden sm:inline">口コミ投稿</span>
              </button>
              <button
                onClick={() => setShowMap(!showMap)}
                className="px-4 py-2 bg-washi-green text-white rounded-lg hover:bg-washi-green-light transition-colors"
              >
                {showMap ? '📋 リスト表示' : '🗺️ 地図表示'}
              </button>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-washi-green"></div>
          </div>
        ) : showMap ? (
          <div className="flex-1 w-full relative overflow-hidden">
            <Map
              className="w-full h-full"
              places={reviews
                .map((r) => r.places)
                .filter((p): p is NonNullable<typeof p> => p !== null)
                .map((p) => ({
                  ...p,
                  created_at: p.created_at ?? new Date().toISOString()
                }))}
              onMarkerClick={(place) => {
                console.log('Marker clicked:', place)
              }}
            />
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
            <ReviewList initialReviews={reviews} />
          </div>
        )}
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <FilterBottomSheet
        isOpen={isFilterOpen}
        onClose={() => setIsFilterOpen(false)}
      />

      {/* Post Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmitSuccess={handlePostSuccess}
      />
    </main>
  )
}
