'use client'

import { useFilter } from '@/hooks/useFilter'
import TagFilter from './TagFilter'
// import SeasonFilter from './SeasonFilter' // Commented out as per user request
import SourceFilter from './SourceFilter'
import ContentSearchInput from './ContentSearchInput'
import FacilityFilter from './FacilityFilter'
import CategoryFilter from './CategoryFilter'

interface FilterPanelProps {
  onClose?: () => void
  refreshTrigger?: number
}

/**
 * フィルタパネルコンポーネント（デスクトップ用サイドバー）
 */
export default function FilterPanel({ onClose, refreshTrigger }: FilterPanelProps) {
  const { filters, updateFilters, clearFilters, activeFilterCount } =
    useFilter()

  return (
    <div className="h-full bg-white border-r border-gray-200 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-washi-green">検索</h2>
          {activeFilterCount > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-washi-orange hover:underline"
            >
              クリア ({activeFilterCount})
            </button>
          )}
        </div>

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
    </div>
  )
}
