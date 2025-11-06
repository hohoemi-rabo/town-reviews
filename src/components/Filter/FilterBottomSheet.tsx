'use client'

import { useEffect } from 'react'
import { useFilter } from '@/hooks/useFilter'
import TagFilter from './TagFilter'
// import SeasonFilter from './SeasonFilter' // Commented out as per user request
import SourceFilter from './SourceFilter'
import ContentSearchInput from './ContentSearchInput'
import FacilityFilter from './FacilityFilter'
import CategoryFilter from './CategoryFilter'

interface FilterBottomSheetProps {
  isOpen: boolean
  onClose: () => void
  refreshTrigger?: number
}

/**
 * フィルタボトムシートコンポーネント（モバイル用）
 */
export default function FilterBottomSheet({
  isOpen,
  onClose,
  refreshTrigger,
}: FilterBottomSheetProps) {
  const { filters, updateFilters, clearFilters, activeFilterCount } =
    useFilter()

  // モーダルが開いているときはbodyのスクロールを防止
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 z-40"
        onClick={onClose}
      />

      {/* Bottom Sheet */}
      <div className="fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-2xl shadow-lg max-h-[90vh] flex flex-col animate-slide-up">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-lg font-bold text-washi-green">絞り込み</h2>
          <div className="flex items-center gap-3">
            {activeFilterCount > 0 && (
              <button
                onClick={clearFilters}
                className="text-sm text-washi-orange hover:underline"
              >
                クリア ({activeFilterCount})
              </button>
            )}
            <button
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Facility Filter */}
          <FacilityFilter
            selectedFacilityId={filters.facilityId}
            onChange={(facilityId) => updateFilters({ facilityId })}
          />

          {/* Content Search */}
          <ContentSearchInput
            value={filters.search || ''}
            onChange={(search) => updateFilters({ search })}
          />

          {/* Category Filter */}
          <CategoryFilter
            selectedCategories={filters.categories || []}
            onChange={(categories) => updateFilters({ categories })}
          />

          {/* Tag Filter */}
          <TagFilter
            selectedTags={filters.tags || []}
            onChange={(tags) => updateFilters({ tags })}
            refreshTrigger={refreshTrigger}
          />

          {/* Season Filter - Commented out as per user request */}
          {/* <SeasonFilter
            selectedSeason={filters.season}
            onChange={(season) => updateFilters({ season })}
          /> */}

          {/* Source Filter */}
          <SourceFilter
            selectedSources={filters.heardFromTypes || []}
            onChange={(heardFromTypes) => updateFilters({ heardFromTypes })}
          />
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200">
          <button
            onClick={onClose}
            className="w-full py-3 bg-washi-green text-white rounded-lg font-bold hover:bg-washi-green-light transition-colors"
          >
            適用する
          </button>
        </div>
      </div>
    </>
  )
}
