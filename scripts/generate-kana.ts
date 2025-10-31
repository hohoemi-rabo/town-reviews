/**
 * 既存施設データに読み仮名（ひらがな）を自動生成して追加するスクリプト
 *
 * 使い方:
 * npx tsx scripts/generate-kana.ts
 */

import * as fs from 'fs'
import * as path from 'path'
// @ts-ignore - kuroshiro types may not be available
import Kuroshiro from 'kuroshiro'
// @ts-ignore - kuroshiro-analyzer types may not be available
import KuromojiAnalyzer from 'kuroshiro-analyzer-kuromoji'

// 環境変数の読み込み
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  const envFile = fs.readFileSync(envPath, 'utf-8')
  envFile.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...values] = trimmed.split('=')
      if (key && values.length > 0) {
        process.env[key.trim()] = values.join('=').trim()
      }
    }
  })
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('Error: Supabase credentials not found in .env.local')
  process.exit(1)
}

type Facility = {
  id: string
  name: string
  name_kana: string | null
}

async function main() {
  console.log('🚀 Starting kana generation for existing facilities...\n')

  // Initialize Kuroshiro
  console.log('Initializing Kuroshiro (Japanese text analyzer)...')
  const kuroshiro = new Kuroshiro()
  await kuroshiro.init(new KuromojiAnalyzer())
  console.log('✅ Kuroshiro initialized\n')

  // Fetch all facilities from Supabase (paginated to handle more than 1000 records)
  console.log('Fetching facilities from database...')
  const facilities: Facility[] = []
  let offset = 0
  const limit = 1000

  while (true) {
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/places?select=id,name,name_kana&limit=${limit}&offset=${offset}`,
      {
        headers: {
          apikey: SUPABASE_SERVICE_KEY as string,
          Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        },
      }
    )

    if (!response.ok) {
      console.error('Failed to fetch facilities:', await response.text())
      process.exit(1)
    }

    const batch: Facility[] = await response.json()
    facilities.push(...batch)

    console.log(`  Fetched ${batch.length} facilities (total: ${facilities.length})`)

    if (batch.length < limit) {
      break // No more records
    }

    offset += limit
  }

  console.log(`✅ Found ${facilities.length} facilities in total\n`)

  // Filter facilities that don't have kana yet
  const facilitiesWithoutKana = facilities.filter((f) => !f.name_kana)
  console.log(`📝 ${facilitiesWithoutKana.length} facilities need kana generation\n`)

  if (facilitiesWithoutKana.length === 0) {
    console.log('✨ All facilities already have kana. Nothing to do!')
    return
  }

  // Generate kana for each facility
  let successCount = 0
  let errorCount = 0

  for (const facility of facilitiesWithoutKana) {
    try {
      console.log(`Processing: ${facility.name}`)

      // Convert to hiragana
      const kana = await kuroshiro.convert(facility.name, {
        to: 'hiragana',
        mode: 'normal',
      })

      console.log(`  → ${kana}`)

      // Update database
      const updateResponse = await fetch(
        `${SUPABASE_URL}/rest/v1/places?id=eq.${facility.id}`,
        {
          method: 'PATCH',
          headers: {
            apikey: SUPABASE_SERVICE_KEY as string,
            Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
            'Content-Type': 'application/json',
            Prefer: 'return=minimal',
          },
          body: JSON.stringify({ name_kana: kana }),
        }
      )

      if (!updateResponse.ok) {
        console.error(`  ❌ Failed to update: ${await updateResponse.text()}`)
        errorCount++
      } else {
        console.log(`  ✅ Updated`)
        successCount++
      }

      // Small delay to avoid rate limiting
      await new Promise((resolve) => setTimeout(resolve, 100))
    } catch (error) {
      console.error(`  ❌ Error: ${error}`)
      errorCount++
    }
  }

  console.log('\n' + '='.repeat(50))
  console.log('📊 Summary:')
  console.log(`  Total processed: ${facilitiesWithoutKana.length}`)
  console.log(`  ✅ Success: ${successCount}`)
  console.log(`  ❌ Errors: ${errorCount}`)
  console.log('='.repeat(50))
  console.log('\n✨ Done!')
}

main().catch(console.error)
