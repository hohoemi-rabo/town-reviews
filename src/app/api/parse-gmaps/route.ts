import { NextRequest, NextResponse } from 'next/server'
import { parseGoogleMapsLink } from '@/lib/google-maps'

// Expand shortened URL to full URL
async function expandShortenedUrl(url: string): Promise<string> {
  try {
    // Check if it's a shortened URL
    if (url.includes('maps.app.goo.gl') || url.includes('goo.gl/maps')) {
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'follow',
      })
      return response.url
    }
    return url
  } catch (error) {
    console.error('Error expanding URL:', error)
    return url
  }
}

export async function POST(request: NextRequest) {
  try {
    const { url } = await request.json()

    if (!url) {
      return NextResponse.json(
        { error: 'Google MapsのURLを入力してください' },
        { status: 400 }
      )
    }

    console.log('Original URL:', url)

    // Expand shortened URL if necessary
    const expandedUrl = await expandShortenedUrl(url)
    console.log('Expanded URL:', expandedUrl)

    // Extract Place ID from URL
    let placeId = parseGoogleMapsLink(expandedUrl)
    console.log('Extracted Place ID:', placeId)

    // Get API key (use server-side key if available, otherwise fallback to public key)
    const apiKey = process.env.GOOGLE_MAPS_SERVER_API_KEY || process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        { error: 'Google Maps APIキーが設定されていません' },
        { status: 500 }
      )
    }

    console.log('Using API key:', apiKey ? 'Key is set' : 'No key found')

    // If Place ID not found, try to extract coordinates and use Text Search API
    if (!placeId) {
      console.log('Place ID not found, trying to extract coordinates...')

      // Extract coordinates from URL (format: /@lat,lng,zoom)
      const coordMatch = expandedUrl.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/)

      if (coordMatch) {
        const lat = parseFloat(coordMatch[1])
        const lng = parseFloat(coordMatch[2])
        console.log('Extracted coordinates:', lat, lng)

        // Extract place name from URL (between /place/ and /@)
        const nameMatch = expandedUrl.match(/\/place\/([^/@]+)/)
        let placeName = 'Unknown'
        if (nameMatch) {
          placeName = decodeURIComponent(nameMatch[1].replace(/\+/g, ' '))
          console.log('Extracted place name:', placeName)
        }

        // Use Find Place from Text API to find the place
        const findPlaceUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(placeName)}&inputtype=textquery&locationbias=point:${lat},${lng}&fields=place_id,name&key=${apiKey}&language=ja`

        console.log('Calling Find Place from Text API...')
        const searchResponse = await fetch(findPlaceUrl)
        const searchData = await searchResponse.json()

        console.log('Find Place API response:', searchData.status)

        if (searchData.status === 'OK' && searchData.candidates && searchData.candidates.length > 0) {
          placeId = searchData.candidates[0].place_id
          console.log('Found Place ID from Find Place:', placeId)
        } else if (searchData.status === 'REQUEST_DENIED') {
          console.error('API error details:', searchData)
          return NextResponse.json(
            {
              error: 'Google Places APIの設定に問題があります。Google Cloud ConsoleでPlaces APIが有効になっているか確認してください。',
              details: searchData.error_message
            },
            { status: 500 }
          )
        } else {
          return NextResponse.json(
            { error: 'スポット情報が見つかりませんでした' },
            { status: 400 }
          )
        }
      } else {
        return NextResponse.json(
          { error: '有効なGoogle MapsのURLではありません' },
          { status: 400 }
        )
      }
    }

    // Fetch place details from Google Places API
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
