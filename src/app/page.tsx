'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import Map from '@/components/Map/Map'
import ReviewList, { type ExtendedRecommendation } from '@/components/ReviewCard/ReviewList'
import PostModal from '@/components/PostModal/PostModal'

export default function Home() {
  const [showMap, setShowMap] = useState(true)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)
  const [reviews, setReviews] = useState<ExtendedRecommendation[]>([])
  const [loading, setLoading] = useState(true)

  // Fetch reviews from database
  useEffect(() => {
    const fetchReviews = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from('recommendations')
        .select(`
          id,
          place_id,
          heard_from,
          heard_from_type,
          note_raw,
          note_formatted,
          tags,
          season,
          author_name,
          author_ip_hash,
          is_anonymous,
          images,
          created_at,
          updated_at,
          is_editable_until,
          places (
            id,
            place_id,
            name,
            lat,
            lng,
            category,
            address,
            created_at
          )
        `)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Failed to fetch reviews:', error)
        setLoading(false)
        return
      }

      if (data) {
        // Transform places array to single object
        const transformedData = data.map((item) => ({
          ...item,
          places: Array.isArray(item.places) && item.places.length > 0
            ? item.places[0]
            : null
        })) as ExtendedRecommendation[]
        setReviews(transformedData)
      }
      setLoading(false)
    }

    fetchReviews()
  }, [])

  const handlePostSuccess = () => {
    // Refresh reviews after new post
    const supabase = createClient()
    supabase
      .from('recommendations')
      .select(`
        id,
        place_id,
        heard_from,
        heard_from_type,
        note_raw,
        note_formatted,
        tags,
        season,
        author_name,
        author_ip_hash,
        is_anonymous,
        images,
        created_at,
        updated_at,
        is_editable_until,
        places (
          id,
          place_id,
          name,
          lat,
          lng,
          category,
          address,
          created_at
        )
      `)
      .order('created_at', { ascending: false })
      .then(({ data }) => {
        if (data) {
          // Transform places array to single object
          const transformedData = data.map((item) => ({
            ...item,
            places: Array.isArray(item.places) && item.places.length > 0
              ? item.places[0]
              : null
          })) as ExtendedRecommendation[]
          setReviews(transformedData)
        }
      })

    alert('投稿が完了しました！')
  }

  return (
    <main className="h-screen w-screen flex flex-col overflow-hidden">
      <header className="bg-white shadow-sm z-10 px-4 py-3 sm:px-6 flex-shrink-0">
        <div className="flex items-center justify-between">
          <h1 className="text-xl sm:text-2xl font-bold text-washi-green">
            まち口コミ帳
          </h1>
          <div className="flex items-center gap-2">
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

      {/* Post Modal */}
      <PostModal
        isOpen={isPostModalOpen}
        onClose={() => setIsPostModalOpen(false)}
        onSubmitSuccess={handlePostSuccess}
      />
    </main>
  )
}
