import create from "zustand";
import { Group } from "three";

type Store = {
  world: Group | null,
  setWorld: (w: Group) => void,
};

export const useStore = create<Store>((set) => ({
  world: null,
  setWorld: (w) => set({ world: w }),
}));