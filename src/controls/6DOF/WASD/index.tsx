import React, { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

type Props = {
  onMoveForward: (delta: number) => void,
  onMoveRight: (delta: number) => void,
  onJump?: () => void,
};

let prevTime = performance.now();

/**
 * Can't use the below shortcuts
 * ctrl + w -> Closes the current tab
 * ctrl+shift+w -> closes the window
 * alt+w -> opens up browser site search
 */
const WASD = ({onMoveRight, onMoveForward, onJump}: Props) => {

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

      case "Space": {
        onJump?.();
        break;
      }
    }
  }

  function onKeyUp(e: KeyboardEvent) {
    e.preventDefault();
    // run
    fastMove.current = e.shiftKey;

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
  useFrame(() => {
    const time = performance.now();
    const delta = (time - prevTime) / 1000;

    const speedDelta = delta * (fastMove.current ? 2: 1) * 20;

    if(moveForward.current) {
      onMoveForward(speedDelta);
    }

    if(moveBackward.current) {
      onMoveForward(-speedDelta);
    }

    if(moveLeft.current) {
      onMoveRight(-speedDelta);
    }

    if(moveRight.current) {
      onMoveRight(speedDelta);
    }

    prevTime = time;

  });

  return null;
};

export default WASD;