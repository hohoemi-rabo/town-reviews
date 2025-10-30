'use client'

import { useSearchParams, useRouter, usePathname } from 'next/navigation'
import { useCallback, useMemo } from 'react'

export interface FilterState {
  facilityId?: string
  tags?: string[]
  season?: string
  heardFromTypes?: string[]
  categories?: string[]
  search?: string
}

/**
 * フィルタ状態管理hook
 * URLクエリパラメータと同期して、フィルタ条件を管理
 */
export function useFilter() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()

  // 現在のフィルタ状態を取得
  const filters = useMemo<FilterState>(() => {
    const facilityId = searchParams.get('facility_id') ?? undefined
    const tagsParam = searchParams.get('tags')
    const tags = tagsParam ? tagsParam.split(',') : undefined
    const season = searchParams.get('season') ?? undefined
    const heardFromTypesParam = searchParams.get('heard_from_types')
    const heardFromTypes = heardFromTypesParam
      ? heardFromTypesParam.split(',')
      : undefined
    const categoriesParam = searchParams.get('categories')
    const categories = categoriesParam ? categoriesParam.split(',') : undefined
    const search = searchParams.get('search') ?? undefined

    return {
      facilityId,
      tags,
      season,
      heardFromTypes,
      categories,
      search,
    }
  }, [searchParams])

  // フィルタの更新
  const updateFilters = useCallback(
    (newFilters: Partial<FilterState>) => {
      const params = new URLSearchParams(searchParams.toString())

      // facilityId
      if (newFilters.facilityId !== undefined) {
        if (newFilters.facilityId) {
          params.set('facility_id', newFilters.facilityId)
        } else {
          params.delete('facility_id')
        }
      }

      // tags
      if (newFilters.tags !== undefined) {
        if (newFilters.tags.length > 0) {
          params.set('tags', newFilters.tags.join(','))
        } else {
          params.delete('tags')
        }
      }

      // season
      if (newFilters.season !== undefined) {
        if (newFilters.season) {
          params.set('season', newFilters.season)
        } else {
          params.delete('season')
        }
      }

      // heardFromTypes
      if (newFilters.heardFromTypes !== undefined) {
        if (newFilters.heardFromTypes.length > 0) {
          params.set('heard_from_types', newFilters.heardFromTypes.join(','))
        } else {
          params.delete('heard_from_types')
        }
      }

      // categories
      if (newFilters.categories !== undefined) {
        if (newFilters.categories.length > 0) {
          params.set('categories', newFilters.categories.join(','))
        } else {
          params.delete('categories')
        }
      }

      // search
      if (newFilters.search !== undefined) {
        if (newFilters.search) {
          params.set('search', newFilters.search)
        } else {
          params.delete('search')
        }
      }

      router.push(`${pathname}?${params.toString()}`, { scroll: false })
    },
    [searchParams, router, pathname]
  )

  // すべてのフィルタをクリア
  const clearFilters = useCallback(() => {
    router.push(pathname, { scroll: false })
  }, [router, pathname])

  // アクティブなフィルタ数をカウント
  const activeFilterCount = useMemo(() => {
    let count = 0
    if (filters.facilityId) count++
    if (filters.tags && filters.tags.length > 0) count++
    if (filters.season) count++
    if (filters.heardFromTypes && filters.heardFromTypes.length > 0) count++
    if (filters.categories && filters.categories.length > 0) count++
    if (filters.search) count++
    return count
  }, [filters])

  // フィルタが適用されているか
  const hasActiveFilters = activeFilterCount > 0

  return {
    filters,
    updateFilters,
    clearFilters,
    activeFilterCount,
    hasActiveFilters,
  }
}
