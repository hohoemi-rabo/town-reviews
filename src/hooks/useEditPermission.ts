'use client'

import { useEffect, useState } from 'react'

interface EditPermissionResult {
  editable: boolean
  until?: string
  reason?: 'no_cookie' | 'not_found' | 'expired' | 'error'
  loading: boolean
}

/**
 * 投稿が編集可能かどうかを確認するフック
 * @param recommendationId - 確認する投稿のID
 * @returns 編集可能状態とロード状態
 */
export function useEditPermission(
  recommendationId: string
): EditPermissionResult {
  const [result, setResult] = useState<EditPermissionResult>({
    editable: false,
    loading: true,
  })

  useEffect(() => {
    async function checkPermission() {
      try {
        const response = await fetch(
          `/api/recommendations/${recommendationId}/editable`
        )
        const data = await response.json()

        setResult({
          editable: data.editable,
          until: data.until,
          reason: data.reason,
          loading: false,
        })
      } catch (error) {
        console.error('Edit permission check error:', error)
        setResult({
          editable: false,
          reason: 'error',
          loading: false,
        })
      }
    }

    if (recommendationId) {
      checkPermission()
    }
  }, [recommendationId])

  return result
}
