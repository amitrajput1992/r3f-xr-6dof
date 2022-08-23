import { MathUtils, PerspectiveCamera } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import React, { useEffect, useMemo } from "react";

const HALF_PI = Math.PI / 2;

class ScrollPanCameraControlsImpl {
  camera: PerspectiveCamera;
  deltaYaw: number;
  deltaPitch: number;
  enabled: boolean;
  frame: HTMLElement;
  lastX: number;
  lastY: number;
  verticalFov: number;

  constructor(camera: PerspectiveCamera, domElement: HTMLElement) {
    this.deltaYaw = 0;
    this.deltaPitch = 0;
    this.enabled = true;
    this.camera = camera;
    this.frame = domElement;
    this.lastX = 0;
    this.lastY = 0;
    this.verticalFov = MathUtils.degToRad(this.camera.fov);
  }

  connect = () => {
    this.frame.addEventListener("wheel", this.onWheel);
  };

  disconnect = () => {
    this.frame.removeEventListener("wheel", this.onWheel);
  };

  onWheel = (e: WheelEvent) => {
    if (!this.enabled) {
      return;
    }
    const width = this.frame.clientWidth;
    const height = this.frame.clientHeight;
    const aspect = width / height;
    const deltaX = e.deltaX;
    const deltaY = e.deltaY;
    this.deltaPitch += deltaX / width * this.verticalFov * aspect;
    this.deltaYaw += deltaY / height * this.verticalFov;
    this.deltaYaw = Math.max(-HALF_PI, Math.min(HALF_PI, this.deltaYaw));
    e.preventDefault();
  };

  update = () => {
    if (!this.enabled) {
      return false;
    }

    if (this.deltaPitch === 0 && this.deltaYaw === 0) {
      return false;
    }

    // premultiply the camera rotation by the horizontal (pitch) rotation,
    // then multiply by the vertical (yaw) rotation
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
    return true;
  };
}

type Props = {
  render?: boolean
};

const ScrollPanCameraControls = ({ render = true }: Props) => {
  const { camera, gl: { domElement } } = useThree(s => ({ camera: s.camera, gl: s.gl }));
  const controls = useMemo(() => new ScrollPanCameraControlsImpl(camera as PerspectiveCamera, domElement), []);

  useEffect(() => {
    if (render) {
      controls.connect();
    } else {
      controls.disconnect();
    }
  }, [render]);

  useFrame(() => {
    if (render) {
      controls.update();
    }
  });

  useEffect(() => {
    controls.connect();
    controls.enabled = render;
    return () => {
      controls.disconnect();
    };
  }, []);

  return (
    <primitive object={controls} />
  );
};

export default ScrollPanCameraControls;