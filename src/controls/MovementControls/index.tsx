import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Camera, Vector3 } from "three";

const velocity = new Vector3();
const direction = new Vector3();
const movementVector = new Vector3();
let prevTime = performance.now();
let movementMultiplier = 1;

/**
 * Can't use the below shortcuts
 * ctrl + w -> Closes the current tab
 * ctrl+shift+w -> closes the window
 * alt+w -> opens up browser site search
 */
const WASD = () => {

  const moveForward = useRef(false);
  const moveLeft = useRef(false);
  const moveRight = useRef(false);
  const moveBackward = useRef(false);
  const fastMove = useRef(false);

  const skipFrame = useRef(false);

  function onKeyDown(e: KeyboardEvent) {
    // e.preventDefault();
    // run
    fastMove.current = e.shiftKey;
    // slow down
    // slowMove.current = e.altKey;

    switch (e.code) {
      case "ArrowUp":
      case "KeyW": {
        moveForward.current = true;
        break;
      }
      case "ArrowLeft":
      case "KeyA": {
        moveLeft.current = true;
        break;
      }

      case "ArrowDown":
      case "KeyS": {
        moveBackward.current = true;
        break;
      }

      case "ArrowRight":
      case "KeyD": {
        moveRight.current = true;
        break;
      }
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    e.preventDefault();
    // run
    fastMove.current = e.shiftKey;
    // slow down
    // slowMove.current = e.altKey;

    switch (e.code) {
      case "ArrowUp":
      case "KeyW": {
        moveForward.current = false;
        break;
      }
      case "ArrowLeft":
      case "KeyA": {
        moveLeft.current = false;
        break;
      }

      case "ArrowDown":
      case "KeyS": {
        moveBackward.current = false;
        break;
      }

      case "ArrowRight":
      case "KeyD": {
        moveRight.current = false;
        break;
      }
    }
  }

  function onVisibilityChange() {
    const visibility = document.visibilityState;
    if (visibility === "hidden") {
      // cancel all frames and reset all states
      skipFrame.current = true;

      moveForward.current = false;
      moveLeft.current = false;
      moveBackward.current = false;
      moveRight.current = false;
      fastMove.current = false;
    } else {
      // do nothing
      prevTime = performance.now();
      skipFrame.current = false;
    }
  }

  /**
   * Move camera front or back. -ve distance = front, +ve distance = back
   * @param camera
   * @param distance
   */
  function moveCameraForward(camera: Camera, distance: number) {
    // * To move in a static XZ plane. move forward parallel to the xz-plane, assumes camera.up is y-up
    movementVector.setFromMatrixColumn(camera.matrix, 0);
    movementVector.crossVectors(camera.up, movementVector);

    // * move forward parallel to the camera's local xz-plane
    // * https://stackoverflow.com/a/38054194
    // camera.getWorldDirection(movementVector);

    // * Collision detection is only done in the viewer. In editor users can pass through the objects, this makes using the editor simpler
    camera.position.addScaledVector(movementVector, distance);
  }

  /**
   * Move camera left or right. -ve distance = left, +ve distance = right
   * @param camera
   * @param distance
   */
  function moveCameraRight(camera: Camera, distance: number) {
    movementVector.setFromMatrixColumn(camera.matrix, 0);
    // camera.position.addScaledVector(movementVector, distance);

    // * Collision detection is only done in the viewer. In editor users can pass through the objects, this makes using the editor simpler
    camera.position.addScaledVector(movementVector, distance);
  }

  useEffect(() => {
    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("keyup", onKeyUp);
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("keyup", onKeyUp);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  // * These controls are desktop only, so fine to use the default camera
  useFrame(({ camera }, ms) => {
    const time = performance.now();
    const delta = (time - prevTime) / 1000;
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y -= 9.8 * 100.0 * delta; // 100.0 = mass

    direction.z = Number(moveForward.current) - Number(moveBackward.current);
    direction.x = Number(moveRight.current) - Number(moveLeft.current);
    direction.normalize(); // this ensures consistent movements in all directions
    if (moveForward.current || moveBackward.current) {
      velocity.z -= direction.z * 50.0 * delta;
    }
    if (moveLeft.current || moveRight.current) {
      velocity.x -= direction.x * 50.0 * delta;
    }

    movementMultiplier = fastMove.current? 2: 1;

    moveCameraRight(camera, -velocity.x * delta * movementMultiplier);
    moveCameraForward(camera, -velocity.z * delta * movementMultiplier);

    prevTime = time;
  });

  return null;
};

export default WASD;