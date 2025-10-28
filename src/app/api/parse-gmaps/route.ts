import { NextRequest, NextResponse } from 'next/server'
import { parseGoogleMapsLink } from '@/lib/google-maps'

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'Google MapsのURLを入力してください' },
        { status: 400 }
      )
    }

    // Extract Place ID from URL
    const placeId = parseGoogleMapsLink(url)

    if (!placeId) {
      return NextResponse.json(
        { error: '有効なGoogle MapsのURLではありません' },
        { status: 400 }
      )
    }

    // Fetch place details from Google Places API
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps APIキーが設定されていません' },
        { status: 500 }
      )
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,geometry,types&key=${apiKey}&language=ja`
    )

    const data = await response.json()

    if (data.status !== 'OK') {
      return NextResponse.json(
        { error: 'スポット情報の取得に失敗しました' },
        { status: 400 }
      )
    }

    const place = data.result

    // Determine category based on types
    let category = 'その他'
    const types = place.types || []

    if (
      types.includes('restaurant') ||
      types.includes('cafe') ||
      types.includes('food') ||
      types.includes('bar')
    ) {
      category = '飲食'
    } else if (
      types.includes('tourist_attraction') ||
      types.includes('museum') ||
      types.includes('amusement_park')
    ) {
      category = '体験'
    } else if (
      types.includes('park') ||
      types.includes('natural_feature') ||
      types.includes('campground')
    ) {
      category = '自然'
    } else if (types.includes('spa') || types.includes('lodging')) {
      category = '温泉'
    }

    return NextResponse.json({
      placeId,
      name: place.name,
      address: place.formatted_address,
      lat: place.geometry.location.lat,
      lng: place.geometry.location.lng,
      category,
    })
  } catch (error) {
    console.error('Parse gmaps error:', error)
    return NextResponse.json(
      { error: 'リンクの解析中にエラーが発生しました' },
      { status: 500 }
    )
  }
}
