import { NextRequest, NextResponse } from 'next/server'
import { validateSession } from '../auth/route'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * CSVファイルから施設データを一括インポートするAPI
 *
 * Expected CSV format (same as export):
 * id,name,name_kana,address,area,category,lat,lng,place_id,google_maps_url,phone,is_verified,created_by,created_at
 *
 * Note: Admin only
 */

type FacilityRow = {
  id?: string // Optional for new records
  name: string
  name_kana?: string | null
  address: string
  area: string
  category: string
  lat: number
  lng: number
  place_id: string | null
  google_maps_url?: string | null
  phone?: string | null
  is_verified: boolean
  created_by: string
}

export async function POST(req: NextRequest) {
  try {
    // Admin authentication check
    const isAuthenticated = await validateSession()
    if (!isAuthenticated) {
      return NextResponse.json(
        {
          success: false,
          error: '認証が必要です',
        },
        { status: 401 }
      )
    }

    const formData = await req.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSVファイルが見つかりません',
        },
        { status: 400 }
      )
    }

    // Read CSV content
    const text = await file.text()
    const lines = text.split('\n').filter((line) => line.trim().length > 0)

    if (lines.length < 2) {
      return NextResponse.json(
        {
          success: false,
          error: 'CSVファイルが空です',
        },
        { status: 400 }
      )
    }

    // Skip header line
    const dataLines = lines.slice(1)

    // Parse CSV rows
    const facilities: FacilityRow[] = []
    const errors: string[] = []

    for (let i = 0; i < dataLines.length; i++) {
      try {
        const row = parseCSVLine(dataLines[i])

        if (row.length < 14) {
          errors.push(`Row ${i + 2}: 列数が不足しています (${row.length}/14)`)
          continue
        }

        const [
          id,
          name,
          name_kana,
          address,
          area,
          category,
          lat,
          lng,
          place_id,
          google_maps_url,
          phone,
          is_verified,
          created_by,
          // created_at is ignored - will be set by database
        ] = row

        // Skip empty rows
        if (!name || !area || !category) {
          errors.push(`Row ${i + 2}: 必須フィールド（name, area, category）が空です`)
          continue
        }

        facilities.push({
          id: id || undefined, // Undefined will let database generate new UUID
          name,
          name_kana: name_kana || null,
          address,
          area,
          category,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          place_id: place_id || null,
          google_maps_url: google_maps_url || null,
          phone: phone || null,
          is_verified: ['true', 'TRUE', 'True', '1'].includes(is_verified.trim()),
          created_by,
        })
      } catch (error) {
        errors.push(`Row ${i + 2}: パースエラー - ${error}`)
      }
    }

    if (facilities.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '有効なデータがありません',
          errors,
        },
        { status: 400 }
      )
    }

    // Insert into database using admin client (bypasses RLS)
    const supabase = createAdminClient()

    // Process each facility: update if id exists, insert if not
    let successCount = 0
    let updateCount = 0
    let insertCount = 0
    const dbErrors: string[] = []

    for (const facility of facilities) {
      try {
        // Build facility data with conditional fields
        // Note: Type definition requires place_id as string, but database allows NULL
        const facilityData: Record<string, unknown> = {
          name: facility.name,
          address: facility.address,
          area: facility.area,
          category: facility.category,
          lat: facility.lat,
          lng: facility.lng,
          is_verified: facility.is_verified,
          created_by: facility.created_by,
        }

        // Add optional fields only if they have values
        if (facility.name_kana) facilityData.name_kana = facility.name_kana
        if (facility.place_id) facilityData.place_id = facility.place_id
        if (facility.google_maps_url) facilityData.google_maps_url = facility.google_maps_url
        if (facility.phone) facilityData.phone = facility.phone

        if (facility.id) {
          // Update existing record
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any)
            .from('places')
            .update(facilityData)
            .eq('id', facility.id)

          if (error) {
            dbErrors.push(`ID ${facility.id} (${facility.name}): ${error.message}`)
          } else {
            updateCount++
            successCount++
          }
        } else {
          // Insert new record
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const { error } = await (supabase as any).from('places').insert(facilityData)

          if (error) {
            dbErrors.push(`新規 (${facility.name}): ${error.message}`)
          } else {
            insertCount++
            successCount++
          }
        }
      } catch (err) {
        dbErrors.push(`${facility.name}: ${err}`)
      }
    }

    if (successCount === 0 && dbErrors.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'すべてのレコードの登録に失敗しました',
          details: dbErrors.join('\n'),
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `インポート完了: 新規${insertCount}件、更新${updateCount}件`,
      total: facilities.length,
      inserted: insertCount,
      updated: updateCount,
      parseErrors: errors.length > 0 ? errors : undefined,
      dbErrors: dbErrors.length > 0 ? dbErrors : undefined,
    })
  } catch (error) {
    console.error('Unexpected error in CSV import:', error)
    return NextResponse.json(
      {
        success: false,
        error: 'サーバーエラーが発生しました',
      },
      { status: 500 }
    )
  }
}

/**
 * Parse a CSV line handling quoted fields
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false

  for (let i = 0; i < line.length; i++) {
    const char = line[i]
    const nextChar = line[i + 1]

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote
        current += '"'
        i++
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current)
      current = ''
    } else {
      current += char
    }
  }

  result.push(current)

  return result
}
