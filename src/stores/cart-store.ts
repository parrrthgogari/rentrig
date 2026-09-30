import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export type CartItem = {
  equipmentId: string
  name: string
  pricePerDay: number
  imageUrl: string | null
  startDate: string
  endDate: string
  days: number
  totalPrice: number
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (equipmentId: string) => void
  updateDates: (equipmentId: string, startDate: string, endDate: string, days: number, totalPrice: number) => void
  clearCart: () => void
  totalItems: () => number
  grandTotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item) =>
        set((state) => {
          const exists = state.items.find((i) => i.equipmentId === item.equipmentId)
          if (exists) return state
          return { items: [...state.items, item] }
        }),
      removeItem: (equipmentId) =>
        set((state) => ({
          items: state.items.filter((i) => i.equipmentId !== equipmentId),
        })),
      updateDates: (equipmentId, startDate, endDate, days, totalPrice) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.equipmentId === equipmentId
              ? { ...i, startDate, endDate, days, totalPrice }
              : i
          ),
        })),
      clearCart: () => set({ items: [] }),
      totalItems: () => get().items.length,
      grandTotal: () => get().items.reduce((sum, i) => sum + i.totalPrice, 0),
    }),
    {
      name: 'rentrig-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
