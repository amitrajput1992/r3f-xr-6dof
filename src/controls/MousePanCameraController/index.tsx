import React, { useRef } from "react";
import { useFrame, extend, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";

const HALF_PI = Math.PI / 2;
const YAW_SPEED = 2;
const PITCH_SPEED = 3 / YAW_SPEED;

/**
 * MousePanControls allows manipulation of the camera through clicking and
 * dragging the mouse on a desktop
 */
class MousePanControls {
  camera: PerspectiveCamera;
  enabled: boolean;
  lastMouseX: number;
  lastMouseY: number;
  domElement: any;
  tracking: boolean;
  deltaYaw: number;
  deltaPitch: number;
  fov: number;
  draggingTouch = false;
  lastTouchX = 0;
  lastTouchY = 0;

  /**
   * Create a MousePanControls instance, and attaches the necessary event
   * listeners
   * @param camera - A Three.js Camera to control
   * @param domElement - An optional DOM element to attach the mouse events to.
   *   Defaults to the `window` object.
   */
  constructor(camera: PerspectiveCamera, domElement?: Element) {
    this.deltaYaw = 0;
    this.deltaPitch = 0;
    this.camera = camera;
    this.enabled = true;
    this.tracking = false;
    this.domElement = domElement || window;
    this.lastMouseX = 0;
    this.lastMouseY = 0;
    this.fov = this.camera.fov * Math.PI / 180;

    this.connect();
  }

  connect = () => {
    this.domElement.addEventListener("mousedown", this.mouseDownHandler);
    window.addEventListener("mousemove", this.mouseMoveHandler);
    window.addEventListener("mouseup", this.mouseUpHandler);

    this.domElement.addEventListener("touchstart", this.onTouchStart);
    this.domElement.addEventListener("touchmove", this.onTouchMove);
    this.domElement.addEventListener("touchcancel", this.onTouchEnd);
    this.domElement.addEventListener("touchend", this.onTouchEnd);

    this.enabled = true;

    // Should start untracked.
    this.tracking = false;
  };

  disconnect = () => {
    this.domElement.removeEventListener("mousedown", this.mouseDownHandler);
    window.removeEventListener("mousemove", this.mouseMoveHandler);
    window.removeEventListener("mouseup", this.mouseUpHandler);

    this.domElement.removeEventListener("touchstart", this.onTouchStart);
    this.domElement.removeEventListener("touchmove", this.onTouchMove);
    this.domElement.removeEventListener("touchcancel", this.onTouchEnd);
    this.domElement.removeEventListener("touchend", this.onTouchEnd);
    this.enabled = false;
  };

  onTouchStart = (e: any) => {
    if (!this.enabled) {
      return;
    }
    this.draggingTouch = true;
    this.lastTouchX = e.changedTouches[0].clientX;
    this.lastTouchY = e.changedTouches[0].clientY;
  };

  onTouchMove = (e: any) => {
    if (!this.enabled || !this.draggingTouch) {
      return;
    }
    const x = e.changedTouches[0].clientX;
    const y = e.changedTouches[0].clientY;
    const width = this.domElement.clientWidth;
    const height = this.domElement.clientHeight;
    const aspect = width / height;
    const deltaX = x - this.lastTouchX;
    const deltaY = y - this.lastTouchY;
    this.lastTouchX = x;
    this.lastTouchY = y;
    this.deltaPitch += deltaX / width * this.fov * aspect * PITCH_SPEED;
    this.deltaYaw += deltaY / height * this.fov * YAW_SPEED;
    this.deltaYaw = Math.max(-HALF_PI, Math.min(HALF_PI, this.deltaYaw));
  };

  onTouchEnd = () => {
    this.draggingTouch = false;
  };

  mouseDownHandler = (e: MouseEvent) => {
    this.tracking = true;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
  };

  mouseUpHandler = () => {
    this.tracking = false;
  };

  mouseMoveHandler = (e: MouseEvent) => {
    if (!this.tracking) {
      return;
    }

    const width = this.domElement.clientWidth;
    const height = this.domElement.clientHeight;
    const aspect = width / height;
    const deltaX = e.clientX - this.lastMouseX;
    const deltaY = e.clientY - this.lastMouseY;
    this.lastMouseX = e.clientX;
    this.lastMouseY = e.clientY;
    this.deltaPitch += (deltaX / width) * this.fov * aspect;
    this.deltaYaw += (deltaY / height) * this.fov;
    this.deltaYaw = Math.max(-HALF_PI, Math.min(HALF_PI, this.deltaYaw));
  };

  update = () => {
    if (!this.enabled) {
      return;
    }

    if (this.deltaPitch === 0 && this.deltaYaw === 0) {
      return false;
    }

    const rotation = this.camera.quaternion.toArray();
    const cp = Math.cos(this.deltaPitch / 2);
    const sp = Math.sin(this.deltaPitch / 2);
    const cy = Math.cos(this.deltaYaw / 2);
    const sy = Math.sin(this.deltaYaw / 2);

    const x1 = rotation[0];
    const y1 = rotation[1];
    const z1 = rotation[2];
    const w1 = rotation[3];

    const x2 = cp * x1 + sp * z1;
    const y2 = cp * y1 + sp * w1;
    const z2 = cp * z1 - sp * x1;
    const w2 = cp * w1 - sp * y1;

    const x3 = w2 * sy + x2 * cy;
    const y3 = y2 * cy + z2 * sy;
    const z3 = -y2 * sy + z2 * cy;
    const w3 = w2 * cy - x2 * sy;

    rotation[0] = x3;
    rotation[1] = y3;
    rotation[2] = z3;
    rotation[3] = w3;

    this.camera.quaternion.fromArray(rotation);
    this.deltaPitch = 0;
    this.deltaYaw = 0;
  };
}

extend({ MousePanControls });

export default function MousePanCameraControls() {
  const { camera, gl: { domElement } } = useThree();
  const controls = useRef<MousePanControls | undefined>();

  useFrame(() => {
    controls.current?.update();
  });

  return (
    <mousePanControls ref={controls} args={[camera, domElement]} />
  );
}
