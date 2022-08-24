import React, { useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";
import { PerspectiveCamera, Vector3 } from "three";
import { useStore } from "../../store";

let needsResize = false;
const vrAdjustedPosition = new Vector3();

let previouslyInVR = false;

const XRReorientWorld = () => {
  const camera = useThree(s => s.camera);
  const { player, isPresenting } = useXR();
  const world = useStore(s => s.world);

  /**
   * When entering VR:
   *  1. Move the scene graph in y direction to bring headset to horizon
   *
   * When exiting VR:
   *  1. Reset pose applied when entering VR
   *  2. Also reset camera to original glory
   */
  const vrCamera = player.children?.[0] as PerspectiveCamera;

  function setupPose() {
    if (isPresenting) {
      const vrCamera = player.children?.[0] as PerspectiveCamera;
      vrAdjustedPosition.copy(vrCamera?.position);
      // apply adjusted scene graph position
      if(world) {
        // world.position.y += vrCamera?.position?.y;
      }
      previouslyInVR = true;
    } else {
      if (previouslyInVR) {
        previouslyInVR = false;
        // restore scene graph position
        if(world) {
          // world.position.y -= vrAdjustedPosition.y;
        }
        // restore camera position
        // camera.position.y -= vrAdjustedPosition.y;
      }
    }
  }

  useEffect(() => {
    needsResize = true;
  }, [vrCamera?.position?.y, isPresenting]);


  useFrame(() => {
    if (needsResize) {
      setupPose();
      needsResize = false;
    }
  });

  return null;
};

export default XRReorientWorld;