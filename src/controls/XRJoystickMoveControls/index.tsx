import React, { useRef } from "react";
import { useController, useXR } from "@react-three/xr";
import { useFrame, useThree } from "@react-three/fiber";
import { Vector3 } from "three";

type Props = {
  onMoveRight?: () => void,
  onMoveForward?: () => void,
};

const XRJoystickMoveControls = ({ onMoveRight, onMoveForward }: Props) => {
  const { player, isPresenting } = useXR();
  const gl = useThree(s => s.gl);

  const right = useRef(0);
  const forward = useRef(0);

  const leftController = useController("left");
  const rightController = useController("right");

  /**
   * Calculate any movement from left controller thumbstick
   */
  function frameLeftController() {
    const axes = leftController?.inputSource.gamepad?.axes || [undefined, undefined, 0, 0];
    const [_1, _2, xAxis, yAxis] = axes as [any, any, number, number];
    return [yAxis / 20, xAxis / 20];
  }

  /**
   * Calculate any movement from right controller thumbstick
   */
  function frameRightController() {
    const axes = rightController?.inputSource.gamepad?.axes || [undefined, undefined, 0, 0];
    const [_1, _2, xAxis, yAxis] = axes as [any, any, number, number];
    return [yAxis / 20, xAxis / 20];
  }

  function updatePlayer() {
    if (isPresenting) {
      const lookVector = new Vector3(0, 0, -1);
      lookVector.applyQuaternion(gl.xr.getCamera().quaternion);
      lookVector.y = 0;

      // get the rotation angle between default look direction and camera's current look direction
      const lookAt = lookVector.angleTo(new Vector3(0, 0, -1)) * (lookVector.x > 0 ? 1 : -1);

      // calculate relative movement in the direction of camera's look direction
      const speedForward = Math.cos(lookAt) * forward.current + Math.sin(lookAt) * right.current;
      const speedRight = -Math.sin(lookAt) * forward.current + Math.cos(lookAt) * right.current;

      player.translateX(speedRight);
      player.translateZ(speedForward);
    }
  }

  useFrame(() => {
    const [lforward, lright] = frameLeftController();
    const [rforward, rright] = frameRightController();

    forward.current = lforward || rforward;
    right.current = lright || rright;

    updatePlayer();
  });

  return null;
};

export default XRJoystickMoveControls;