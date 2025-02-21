import { create } from "zustand";


export const useQuizStore = create((set) => ({
    coin: 1,
    setCoin: (coin) => set({ coin: coin + 2 }),
}));