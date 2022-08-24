import React from "react";
import { Vector3 } from "three";

type Props = {
  position?: [number, number, number] | Vector3,
  rotation?: [number, number, number],
  children: React.ReactElement | React.ReactElement[] | null
};

const defaultPosition = [0, 0, 0] as [number, number, number];
const defaultRotation = [0, 0, 0] as [number, number, number];

const Placer = ({children, rotation = defaultRotation, position = defaultPosition}: Props) => {


  return (
    <group
      position={position}
      rotation={rotation}
    >
      {children}
    </group>
  );
};

export default Placer;