import React, { useRef } from "react";
import { Clock, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import shallow from "zustand/shallow";
import WASD from "../6DOF/WASD";
import { useStore } from "../../store";
import CameraAdjust from "../6DOF/CameraAdjust";

const GRAVITY = 30;
const STEPS_PER_FRAME = 5;

// using a different clock since we want to get out of the default animation loop
const clock = new Clock();

const Octree = () => {
  const camera = useThree(s => s.camera);
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

  function onControlsJump() {
    /**
     * The player is trying to jump, set the y velocity
     */
    if (playerOnFloor.current) {
      playerVelocity.y = 15;
    }
  }

  /**
   * Check the collision of the player capsule with the scene octree. Floor can be at any depth
   */
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
    camera.position.copy(playerCollider.end);
  }


  /**
   * Teleport the player back into the space if they go out of bounds, this will generally happen when the player falls from a ledge - Similar to a re-spawn
   */
  function teleportPlayerIfOob() {
    if (camera.position.y <= -25) {
      playerCollider.start.set(0, 0.35, 0);
      playerCollider.end.set(0, 1.95, 0);
      playerCollider.radius = 0.35;
      camera.position.copy(playerCollider.end);
      camera.rotation.set(0, 0, 0);
    }
  }

  useFrame(() => {
    if (!sceneOctree) {
      // reset the player when octree is not generated, this allows the position to be set correctly when the scene is ready
      // playerCollider.start.set(0, 0.35, 0);
      // playerCollider.end.set(0, 1.95, 0);

      const d = new Vector3(0, 2, 0);
      const delta = d.sub(playerCollider.start.clone());
      // playerCollider.radius = 0.35;
      playerCollider.translate(delta);

      camera.position.copy(playerCollider.end);
      return;
    }

    // * we look for collisions in substeps to mitigate the risk of
    // * an object traversing another too quickly for detection.
    const deltaTime = Math.min(0.05, clock.getDelta()) / STEPS_PER_FRAME;
    for (let i = 0; i < STEPS_PER_FRAME; i++) {
      updatePlayer(deltaTime);
      teleportPlayerIfOob();
    }
  });

  return (
    <>
      <CameraAdjust />
      <WASD onMoveRight={onControlsMoveRight} onMoveForward={onControlsMoveForward} onJump={onControlsJump}/>
    </>
  );
};

export default Octree;