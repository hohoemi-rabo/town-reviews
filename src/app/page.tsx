'use client'

import { useState } from 'react'
import Map from '@/components/Map/Map'
import ReviewList from '@/components/ReviewCard/ReviewList'
import PostModal from '@/components/PostModal/PostModal'

// Sample data for demonstration
const sampleReviews = [
  {
    id: '1',
    place_id: null,
    heard_from: '母',
    heard_from_type: '家族・親戚',
    note_raw: '飯田市の老舗蕎麦屋さん。手打ちそばが絶品で、特に鴨南蛮がおすすめです。お店の雰囲気も落ち着いていて、ゆっくり食事ができます。',
    note_formatted: '飯田市の老舗蕎麦屋さん。手打ちそばが絶品で、特に鴨南蛮がおすすめです。お店の雰囲気も落ち着いていて、ゆっくり食事ができます。',
    tags: ['そば', '和食', '老舗', '手打ち'],
    season: '秋',
    author_name: null,
    author_ip_hash: null,
    is_anonymous: true,
    images: [],
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    is_editable_until: null,
    places: { id: '1', place_id: 'test1', name: 'そば処 山里', lat: 35.5147, lng: 137.8261, category: '飲食', address: '飯田市', created_at: '' },
    reactions: { hokkorisu: 12, ittemiitai: 8, memoshita: 5 },
  },
  {
    id: '2',
    place_id: null,
    heard_from: '友人の田中さん',
    heard_from_type: '友人・知人',
    note_raw: '天竜峡の紅葉が本当に綺麗でした！遊歩道を歩きながら渓谷美を満喫できます。秋の週末は混雑するので、平日がおすすめです。',
    note_formatted: '天竜峡の紅葉が本当に綺麗でした！遊歩道を歩きながら渓谷美を満喫できます。秋の週末は混雑するので、平日がおすすめです。',
    tags: ['紅葉', '自然', '散策', '絶景'],
    season: '秋',
    author_name: '山田',
    author_ip_hash: null,
    is_anonymous: false,
    images: [],
    created_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    is_editable_until: null,
    places: { id: '2', place_id: 'test2', name: '天竜峡', lat: 35.4800, lng: 137.8500, category: '自然', address: '飯田市', created_at: '' },
    reactions: { hokkorisu: 25, ittemiitai: 18, memoshita: 12 },
  },
  {
    id: '3',
    place_id: null,
    heard_from: '近所の佐藤さん',
    heard_from_type: '近所の人',
    note_raw: '昼神温泉の朝市が楽しいです。地元の新鮮野菜や手作りのお菓子が買えます。温泉街を散策しながら朝市を楽しむのが最高！',
    note_formatted: '昼神温泉の朝市が楽しいです。地元の新鮮野菜や手作りのお菓子が買えます。温泉街を散策しながら朝市を楽しむのが最高！',
    tags: ['温泉', '朝市', '地元グルメ'],
    season: null,
    author_name: null,
    author_ip_hash: null,
    is_anonymous: true,
    images: [],
    created_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    updated_at: null,
    is_editable_until: null,
    places: { id: '3', place_id: 'test3', name: '昼神温泉朝市', lat: 35.5500, lng: 137.7500, category: '温泉', address: '阿智村', created_at: '' },
    reactions: { hokkorisu: 30, ittemiitai: 22, memoshita: 15 },
  },
]

export default function Home() {
  const [showMap, setShowMap] = useState(true)
  const [isPostModalOpen, setIsPostModalOpen] = useState(false)

  const handlePostSuccess = () => {
    // TODO: Refresh review list in Phase 2
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

      {showMap ? (
        <div className="flex-1 w-full relative overflow-hidden">
          <Map
            className="w-full h-full"
            places={sampleReviews.map((r) => r.places!).filter(Boolean)}
            onMarkerClick={(place) => {
              console.log('Marker clicked:', place)
            }}
          />
        </div>
      ) : (
        <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-6 lg:px-8">
          <ReviewList initialReviews={sampleReviews as any} />
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
