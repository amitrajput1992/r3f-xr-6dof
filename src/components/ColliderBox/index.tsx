import React from "react";
import { BoxGeometry, DoubleSide, Vector3 } from "three";

const opacity = 0.7;
const lineOpacity = 1;

type Props = {
  dimensions?: number[],
  name?: string
};

const defaultDimensions = [1, 1, 1];
// * Inverted scale since we want to test inside the bounds for collisions
const invertedScale = new Vector3(-1, 1, 1);

const ColliderBox = ({dimensions = defaultDimensions, name}: Props) => {
  const geometry = new BoxGeometry(dimensions[0], dimensions[1], dimensions[2]);

  return (
    <group name={name}>
      {/*<lineSegments userData={{ needsRenderOrder: true, testCollision: true }} >*/}
      {/*  <edgesGeometry attach={"geometry"} args={[geometry]}/>*/}
      {/*  <lineBasicMaterial attach={"material"} color={"#FFFFFF"} opacity={lineOpacity} transparent={true}/>*/}
      {/*</lineSegments>*/}
      <mesh userData={{ needsRenderOrder: true, testCollision: true, useForXRMovement: true }} scale={invertedScale}>
        {/* dimWidth: 1, dimHeight: 1,dimDepth: 1, pivotPoint: 'center' */}
        <boxBufferGeometry attach="geometry" args={[dimensions[0], dimensions[1], dimensions[2]]} />
        <meshBasicMaterial
          attach="material"
          side={DoubleSide}
          opacity={opacity}
          transparent={true}
          color={"#FFFFFF"}
          depthWrite={false}
          // depthTest={false}
        />
      </mesh>
    </group>
  );
};

export default ColliderBox;