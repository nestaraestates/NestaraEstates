import { create } from 'zustand';

interface CompareState {
  compareIds: string[];
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
}

export const useCompareStore = create<CompareState>((set) => ({
  compareIds: [],
  toggleCompare: (id) => set((state) => {
    if (state.compareIds.includes(id)) {
      return { compareIds: state.compareIds.filter(item => item !== id) };
    }
    if (state.compareIds.length >= 3) {
      return state; // Max 3 items
    }
    return { compareIds: [...state.compareIds, id] };
  }),
  clearCompare: () => set({ compareIds: [] })
}));
