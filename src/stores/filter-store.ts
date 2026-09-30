import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type EquipmentCategory =
  | 'GPU_SERVER'
  | 'DRONE'
  | 'LAB_INSTRUMENT'
  | 'VR_AR_HEADSET'
  | 'CAMERA_GEAR'
  | 'ROBOTICS_KIT'

type FilterStore = {
  search: string
  categories: EquipmentCategory[]
  minPrice: number
  maxPrice: number
  availableOnly: boolean
  sortBy: 'price_asc' | 'price_desc' | 'name_asc' | 'newest'
  setSearch: (search: string) => void
  toggleCategory: (category: EquipmentCategory) => void
  setMinPrice: (min: number) => void
  setMaxPrice: (max: number) => void
  setAvailableOnly: (value: boolean) => void
  setSortBy: (sort: FilterStore['sortBy']) => void
  resetFilters: () => void
}

const defaultFilters = {
  search: '',
  categories: [] as EquipmentCategory[],
  minPrice: 0,
  maxPrice: 5000,
  availableOnly: false,
  sortBy: 'newest' as const,
}

export const useFilterStore = create<FilterStore>()(
  persist(
    (set) => ({
      ...defaultFilters,
      setSearch: (search) => set({ search }),
      toggleCategory: (category) =>
        set((state) => ({
          categories: state.categories.includes(category)
            ? state.categories.filter((c) => c !== category)
            : [...state.categories, category],
        })),
      setMinPrice: (minPrice) => set({ minPrice }),
      setMaxPrice: (maxPrice) => set({ maxPrice }),
      setAvailableOnly: (availableOnly) => set({ availableOnly }),
      setSortBy: (sortBy) => set({ sortBy }),
      resetFilters: () => set(defaultFilters),
    }),
    {
      name: 'rentrig-filters',
      storage: createJSONStorage(() => sessionStorage),
    }
  )
)
