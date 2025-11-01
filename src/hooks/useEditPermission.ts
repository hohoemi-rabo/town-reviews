'use client'

import { useEffect, useState } from 'react'

interface EditPermissionResult {
  editable: boolean
  loading: boolean
}

// グローバルキャッシュ（全コンポーネントで共有）
let cachedEditableIds: string[] = []
let hasInitialized = false
let cacheFetchPromise: Promise<string[]> | null = null

/**
 * 編集可能な投稿IDリストを取得（1回だけ実行）
 */
async function fetchEditableIds(): Promise<string[]> {
  // すでにキャッシュがあれば返す
  if (hasInitialized) {
    return cachedEditableIds
  }

  // 既にfetch中なら、そのPromiseを待つ
  if (cacheFetchPromise) {
    return cacheFetchPromise
  }

  // 新規fetch
  cacheFetchPromise = fetch('/api/recommendations/editable-list')
    .then((res) => res.json())
    .then((data) => {
      cachedEditableIds = data.editableIds || []
      hasInitialized = true
      cacheFetchPromise = null
      return cachedEditableIds
    })
    .catch((error) => {
      console.error('Failed to fetch editable list:', error)
      cacheFetchPromise = null
      hasInitialized = true
      cachedEditableIds = []
      return []
    })

  return cacheFetchPromise
}

/**
 * 投稿が編集可能かどうかを確認するフック（最適化版）
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
    let isMounted = true

    fetchEditableIds().then((editableIds) => {
      if (isMounted) {
        setResult({
          editable: editableIds.includes(recommendationId),
          loading: false,
        })
      }
    })

    return () => {
      isMounted = false
    }
  }, [recommendationId])

  return result
}

/**
 * 新しい投稿が作成されたときにキャッシュを更新
 */
export function addEditableId(id: string) {
  if (hasInitialized && !cachedEditableIds.includes(id)) {
    cachedEditableIds.push(id)
  }
}

/**
 * 投稿が削除されたときにキャッシュを更新
 */
export function removeEditableId(id: string) {
  if (hasInitialized) {
    cachedEditableIds = cachedEditableIds.filter(
      (editableId) => editableId !== id
    )
  }
}
