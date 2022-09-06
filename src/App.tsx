import React from "react";
import { ResizeObserver } from "@juggle/resize-observer";
import MousePanCameraControls from "./controls/MousePanCameraController";
import { Stats } from "@react-three/drei";
import ScrollPanCameraControls from "./controls/ScrollCameraControls";
import { VRCanvas } from "@react-three/xr";
import { DefaultXRControllers } from "./controls/XRControllers";
import XRReorientWorld from "./helpers/XRReorientWorld";
import { useStore } from "./store";
import Children from "./components/Children";
import OctreeImpl from "./controls/OctreeImpl";
import XRJoystickOctreeControls from "./controls/XRJoystickOctreeControls";
import ReferencePlane from "./helpers/ReferencePlane";
import MovementControls from "./controls/MovementControls";

const search = new URL(window.location.href).searchParams;
const enableXRControls = search.get("enableXRControls") == "true";

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
        <ReferencePlane />
        {
          enableXRControls?
            <XRJoystickOctreeControls />:
            <OctreeImpl />
        }

        <MousePanCameraControls />
        <ScrollPanCameraControls />
        <XRReorientWorld/>
        <DefaultXRControllers />
      </group>
      <React.Suspense>
        <group name={"world"} ref={setWorld}>
          <group name={"lights"}>
            <ambientLight color={"white"} intensity={0.7} />
            <pointLight color={"white"} position={[0, 0, 0]} intensity={0.7} />
          </group>
          <Children />
        </group>
      </React.Suspense>
      <Stats />
    </VRCanvas>
  );
}
