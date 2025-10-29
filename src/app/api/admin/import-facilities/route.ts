import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

/**
 * CSVファイルから施設データを一括インポートするAPI
 *
 * Expected CSV format:
 * place_id,name,address,area,category,lat,lng,phone,google_maps_url,is_verified,created_by
 *
 * Note: Admin only (service_role key required)
 */

type FacilityRow = {
  place_id: string
  name: string
  address: string
  area: string
  category: string
  lat: number
  lng: number
  phone?: string
  google_maps_url?: string
  is_verified: boolean
  created_by: string
}

export async function POST(req: NextRequest) {
  try {
    // Admin password check
    const adminPassword = req.headers.get('x-admin-password')
    if (adminPassword !== process.env.ADMIN_PASSWORD) {
      return NextResponse.json(
        {
          success: false,
          error: '管理者権限がありません',
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

        if (row.length < 11) {
          errors.push(`Row ${i + 2}: 列数が不足しています (${row.length}/11)`)
          continue
        }

        const [
          place_id,
          name,
          address,
          area,
          category,
          lat,
          lng,
          phone,
          google_maps_url,
          is_verified,
          created_by,
        ] = row

        facilities.push({
          place_id,
          name,
          address,
          area,
          category,
          lat: parseFloat(lat),
          lng: parseFloat(lng),
          phone: phone || undefined,
          google_maps_url: google_maps_url || undefined,
          is_verified: is_verified === 'true',
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

    // Insert into database using service_role
    const supabase = await createClient()

    // Use upsert to handle duplicates (based on place_id unique constraint)
    const { data, error } = await supabase.from('places').upsert(facilities, {
      onConflict: 'place_id',
      ignoreDuplicates: false, // Update existing records
    })

    if (error) {
      console.error('Database insert error:', error)
      return NextResponse.json(
        {
          success: false,
          error: 'データベースへの登録中にエラーが発生しました',
          details: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: `${facilities.length}件の施設データをインポートしました`,
      imported: facilities.length,
      errors: errors.length > 0 ? errors : undefined,
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
