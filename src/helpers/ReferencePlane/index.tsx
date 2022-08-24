import React, { useMemo } from "react";
import { CustomBlending, OneMinusDstColorFactor, DstAlphaFactor, ReverseSubtractEquation, MathUtils } from "three";

/**
 * This component adds a reference plane to the scene graph for the 6DOF mode.
 * This is a plane similar to the one we see in Oculus Quest 2
 * TODO: Allow togglability
 */
const ReferencePlane = () => {
  return (
    <GridLines />
  );
};

const GridLines = () => {
  const processedPositions = useMemo(() => {
    const gridSizeX = 20;
    const gridSizeZ = 20;
    const gridUnit = 0.5;
    const newVerts = new Float32Array((gridSizeX + 1) * 2 * 4 * 3);
    let newVertexPos = 0;

    // no middle points, just bottom and top
    for (let x = 0; x <= gridSizeX; x += gridUnit) {
      for (let z = 0; z <= gridSizeZ; z += gridSizeZ) {
        newVerts[newVertexPos++] = x;
        newVerts[newVertexPos++] = -0.01;
        newVerts[newVertexPos++] = z;
      }
    }

    for (let z = 0; z <= gridSizeZ; z += gridUnit) {
      for (let x = 0; x <= gridSizeX; x += gridSizeX) {
        newVerts[newVertexPos++] = x;
        newVerts[newVertexPos++] = -0.01;
        newVerts[newVertexPos++] = z;
      }
    }

    return newVerts;
  }, []);

  return (
    <>
      <lineSegments position={[-10, 0, -10]} rotation={[0, 0, 0]}>
        <bufferGeometry attach="geometry">
          <bufferAttribute
            // attach={["attributes", "position"]}
            // https://github.com/pmndrs/react-three-fiber/discussions/2233#discussioncomment-2630911
            attach="attributes-position"
            count={processedPositions.length / 3}
            array={processedPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <lineBasicMaterial
          color="#C8C8C8"
          // color="rgb(180, 180, 180)"
          blending={CustomBlending}
          blendEquation={ReverseSubtractEquation}
          blendSrc={OneMinusDstColorFactor}
          blendDst={DstAlphaFactor}
        />
      </lineSegments>
    </>
  );
};

export default ReferencePlane;