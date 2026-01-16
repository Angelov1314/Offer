// Zustand 状态管理 + 本地存储

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { GameState, Child, Offer } from '@/types';

interface GameStore extends GameState {
  // Actions
  addChild: (child: Child) => void;
  updateChild: (childId: string, updates: Partial<Child>) => void;
  removeChild: (childId: string) => void;
  addOffer: (offer: Offer) => void;
  acceptOffer: (offerId: string) => void;
  addCoins: (amount: number) => void;
  spendCoins: (amount: number) => void;
  addGems: (amount: number) => void;
  spendGems: (amount: number) => void;
  addGems: (amount: number) => void;
  updateMaterials: (materials: Partial<GameState['materials']>) => void;
  advanceRound: () => void;
  resetGame: () => void;
}

const initialState: GameState = {
  coins: 10000,
  gems: 100,
  materials: {
    books: 10,
    time: 100,
    energy: 100,
    relationships: 50,
  },
  children: [],
  current_round: 1,
  time_budget: 100,
  stress: 0,
  family_support: 50,
};

export const useGameStore = create<GameStore>()(
  persist(
    (set) => ({
      ...initialState,

      addChild: (child) =>
        set((state) => ({
          children: [...state.children, child],
        })),

      updateChild: (childId, updates) =>
        set((state) => ({
          children: state.children.map((child) =>
            child.id === childId ? { ...child, ...updates } : child
          ),
        })),

      removeChild: (childId) =>
        set((state) => ({
          children: state.children.filter((child) => child.id !== childId),
        })),

      addOffer: (offer) =>
        set((state) => {
          // 这里可以扩展为 offers 数组
          return state;
        }),

      acceptOffer: (offerId) =>
        set((state) => {
          // 处理接受 offer 的逻辑
          return state;
        }),

      addCoins: (amount) =>
        set((state) => ({
          coins: state.coins + amount,
        })),

      spendCoins: (amount) =>
        set((state) => ({
          coins: Math.max(0, state.coins - amount),
        })),

      addGems: (amount) =>
        set((state) => ({
          gems: state.gems + amount,
        })),

      spendGems: (amount) =>
        set((state) => ({
          gems: Math.max(0, state.gems - amount),
        })),

      addGems: (amount) =>
        set((state) => ({
          gems: state.gems + amount,
        })),

      updateMaterials: (materials) =>
        set((state) => ({
          materials: { ...state.materials, ...materials },
        })),

      advanceRound: () =>
        set((state) => ({
          current_round: state.current_round + 1,
        })),

      resetGame: () => set(initialState),
    }),
    {
      name: 'offer-game-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
