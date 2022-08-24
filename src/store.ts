import create from "zustand";
import { Group, Vector3 } from "three";
import { Capsule } from "three/examples/jsm/math/Capsule";
import Octree from "./helpers/Octree";

type Store = {
  world: Group | null,
  setWorld: (w: Group) => void,
  playerCollider: Capsule

  sceneOctree: Octree | null,
  buildSceneOctree: () => void,
  purgeSceneOctree: () => void,
};

export const useStore = create<Store>((set, get) => ({
  world: null,
  setWorld: (w) => set({ world: w }),
  playerCollider: new Capsule(new Vector3(0, 0.35, 0), new Vector3(0, 1.95, 0), 0.35),
  sceneOctree: null,
  buildSceneOctree: () => {

    const world3d = get().world;
    if (!world3d) {
      console.info(`Unable to create octree as world3d is not set yet`);
      return;
    }

    /**
     * * Build the octree everytime threejs scene graph changes.
     * * This will usually happen whenever the scene changes
     */
    const octreeToBuild = new Octree();
    octreeToBuild.fromGraphNode(world3d);

    set({ sceneOctree: octreeToBuild });
  },
  purgeSceneOctree: () => set({ sceneOctree: null }),
}));