import React, { useEffect } from "react";
import { useThree } from "@react-three/fiber";
import { useXR } from "@react-three/xr";

/**
 * This component adjusts the scene graph for the 6DOF mode.
 * In a 3DOF setup, the camera is placed at horizon,
 *  but in a 6DOF setup the camera moves with the user's eye's height from the ground
 *
 * Whenever the user enters a 6dof scene
 *  In VR: We remove the hacks added to bring the scene up to the user's eyes
 *  In non-VR: We add a fixed height to the camera (1.2m - industry standard used by Oculus Quest 2)
 *
 * Since this component is part of the 6DOF implementation, it will only be mounted for 6DOF enabled scenes.
 * We can safely skip the scene type checks for this component and restrict to camera adjustments only
 *
 * !IMP: Camera height in VR is managed by the headset based on user's physical movement.
 *
 * Editor runs only in non-VR mode, so we can skip the VR mode checks here completely. These will have to be implemented in z5-edge
 */
const CameraAdjust = () => {
  const camera = useThree(s => s.camera);
  const { isPresenting } = useXR();

  useEffect(() => {
    if (!isPresenting) {
      camera.position.set(0, 1.6764, 0);
    } else {
      camera.position.set(0, 0, 0);
    }
  }, [isPresenting]);

  return null;
};

export default CameraAdjust;