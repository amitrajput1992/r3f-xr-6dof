import React from "react";
import { ResizeObserver } from "@juggle/resize-observer";
import PanoImage from "./components/PanoImage";
import MousePanCameraControls from "./controls/MousePanCameraController";
import Space from "./components/Space";
import MovementControls from "./controls/MovementControls";
import { Stats } from "@react-three/drei";
import ScrollPanCameraControls from "./controls/ScrollCameraControls";
import { DefaultXRControllers, VRCanvas } from "@react-three/xr";
import XRJoystickMoveControls from "./controls/XRJoystickMoveControls";
import XRReorientWorld from "./helpers/XRReorientWorld";
import { useStore } from "./store";

export default function App() {
  const setWorld = useStore(s => s.setWorld);

  return (
    <VRCanvas
      resize={{ polyfill: ResizeObserver }}
      camera={{
        fov: 75,
        near: 0.01,
        far: 1500,
        position: [0, 0, 0],
        zoom: 1,
      }}
      dpr={window.devicePixelRatio}
      // toggle sRGB color management.
      linear={true}
      // frameloop={"demand"}
      // setting tone mapping to NoMapping. Default is ACESFilmicToneMapping which results in washed out renders
      flat={true}
    >
      <group name={"controls"}>
        <MousePanCameraControls />
        <MovementControls />
        <ScrollPanCameraControls />
        <XRJoystickMoveControls/>
        <XRReorientWorld/>
        <DefaultXRControllers />
      </group>
      <React.Suspense>
        <group name={"world"} ref={setWorld}>
          <group name={"lights"}>
            <ambientLight color={"white"} intensity={0.7} />
            <pointLight color={"white"} position={[0, 0, 0]} intensity={0.7} />
          </group>

          <PanoImage />
          <Space />
        </group>
      </React.Suspense>
      <Stats />
    </VRCanvas>
  );
}
