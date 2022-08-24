import React, { useRef } from "react";
import { useController, useXR } from "@react-three/xr";
import { useFrame, useThree } from "@react-three/fiber";
import { Clock, Vector3 } from "three";
import { useStore } from "../../store";
import shallow from "zustand/shallow";
import CameraAdjust from "../6DOF/CameraAdjust";

const GRAVITY = 30;
const STEPS_PER_FRAME = 5;
// using a different clock since we want to get out of the default animation loop
const clock = new Clock();

const XRJoystickOctreeControls = () => {
  const { player, isPresenting } = useXR();
  const gl = useThree(s => s.gl);
  const camera = gl.xr.getCamera();

  const leftController = useController("left");
  const rightController = useController("right");


  const sceneOctree = useStore(s => s.sceneOctree, shallow);
  const playerCollider = useStore(s => s.playerCollider, shallow);

  const { current: playerVelocity } = useRef(new Vector3());
  const { current: playerDirection } = useRef(new Vector3());
  const playerOnFloor = useRef(false);

  /**
   * Move avatar front or back. -ve distance = front, +ve distance = back
   */
  function getForwardVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();

    return playerDirection;
  }

  /**
   * Move avatar left or right. -ve distance = left, +ve distance = right
   */
  function getSideVector() {
    camera.getWorldDirection(playerDirection);
    playerDirection.y = 0;
    playerDirection.normalize();
    playerDirection.cross(camera.up);

    return playerDirection;
  }

  function onControlsMoveForward(delta: number) {
    playerVelocity.add(getForwardVector().multiplyScalar(delta));
  }

  function onControlsMoveRight(delta: number) {
    playerVelocity.add(getSideVector().multiplyScalar(delta));
  }

  function playerCollisions() {
    const result = sceneOctree?.capsuleIntersect(playerCollider);
    playerOnFloor.current = false;

    if (result) {
      playerOnFloor.current = result.normal.y > 0;
      if (!playerOnFloor.current) {
        playerVelocity.addScaledVector(result.normal, -result.normal.dot(playerVelocity));
      }
      playerCollider.translate(result.normal.multiplyScalar(result.depth));
    }
  }

  /**
   * Bring the player into the scene.
   * If the player is in air, drop them from y to the nearest floor
   * @param deltaTime
   */
  function updatePlayer(deltaTime: number) {
    let damping = Math.exp(-4 * deltaTime) - 1;
    if (!playerOnFloor.current) {
      playerVelocity.y -= GRAVITY * deltaTime;
      // small air resistance
      damping *= 0.1;
    }

    playerVelocity.addScaledVector(playerVelocity, damping);
    const deltaPosition = playerVelocity.clone().multiplyScalar(deltaTime);
    playerCollider.translate(deltaPosition);
    playerCollisions();
    player.position.copy(playerCollider.end);
  }

  /**
   * Calculate any movement from left controller thumbstick
   */
  function frameLeftController() {
    const axes = leftController?.inputSource.gamepad?.axes || [undefined, undefined, 0, 0];
    const [_1, _2, xAxis, yAxis] = axes as [any, any, number, number];
    const moveForward = yAxis / 20;
    const moveRight = xAxis / 20;

    onControlsMoveForward(-moveForward);
    onControlsMoveRight(moveRight);

    return [yAxis / 20, xAxis / 20];
  }

  /**
   * Calculate any movement from right controller thumbstick
   */
  function frameRightController() {
    const axes = rightController?.inputSource.gamepad?.axes || [undefined, undefined, 0, 0];
    const [_1, _2, xAxis, yAxis] = axes as [any, any, number, number];
    const moveForward = yAxis / 20;
    const moveRight = xAxis / 20;

    onControlsMoveForward(-moveForward);
    onControlsMoveRight(moveRight);

    return [yAxis / 20, xAxis / 20];
  }

  /**
   * Teleport the player back into the space if they go out of bounds, this will generally happen when the player falls from a ledge - Similar to a re-spawn
   */
  function teleportPlayerIfOob() {
    if (player.position.y <= -25) {
      playerCollider.start.set(0, 0.35, 0);
      playerCollider.end.set(0, 1.95, 0);
      playerCollider.radius = 0.35;
      player.position.copy(playerCollider.end);
      player.rotation.set(0, 0, 0);
    }
  }

  useFrame(() => {
    if (!sceneOctree) {
      return;
    }
    if(!isPresenting) {
      playerCollider.start.set(0, 0.35, 0);
      playerCollider.end.set(0, 1.95, 0);
      playerCollider.radius = 0.35;

      player.position.copy(playerCollider.end);
      player.rotation.set(0, 0, 0);
    }

    // * we look for collisions in substeps to mitigate the risk of
    // * an object traversing another too quickly for detection.
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      frameLeftController();
      frameRightController();
      updatePlayer(deltaTime);
      teleportPlayerIfOob();
    }
  });

  return <CameraAdjust />;
};

export default XRJoystickOctreeControls;