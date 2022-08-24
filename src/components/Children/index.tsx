import React, { useEffect } from "react";
import PanoImage from "../PanoImage";
import Space from "../Space";
import Placer from "../../helpers/Placer";
import { useStore } from "../../store";
import CubeFaceMesh from "../../helpers/CubeFaceMesh";
import { Box3, Vector3 } from "three";
import ColliderBox from "../ColliderBox";
import PivotPoint from "../../helpers/PivotPoint";


const bounds = [-30, 10.5, 0, 10, -8.5, 30] as number[];

const box = new Box3().set(new Vector3(bounds[0], bounds[2], bounds[4]), new Vector3(bounds[1], bounds[3], bounds[5]));
const center = new Vector3();
const size = new Vector3();
box.getCenter(center);
box.getSize(size);

const Children = () => {
  useEffect(() => {
    const buildSceneOctree = useStore.getState().buildSceneOctree;
    const purgeSceneOctree = useStore.getState().purgeSceneOctree;
    buildSceneOctree();

    return () => {
      purgeSceneOctree();
    };
  }, []);

  const floorPosition = new Vector3().set(center.x, center.y, center.z);

  return (
    <group>
      <PanoImage />
      <Space />

      <Placer position={[-24.335158837280744, -0.0513586806106740, 20.79208404771122]}>
        <PivotPoint pivotPoint={"bottom"}>
          <ColliderBox dimensions={[4, 2, 1]} />
        </PivotPoint>
      </Placer>

      <Placer position={[-16.246211562164923, -0.05135868061067406, 20.79208404771122]}>
        <PivotPoint pivotPoint={"bottom"}>
          <ColliderBox dimensions={[4, 2, 1]} />
        </PivotPoint>
      </Placer>

      <Placer position={floorPosition}>
        <CubeFaceMesh
          size={size}
          src={"https://s.gmetri.com/gb-web/z5-editor/6DOF/plus_outlined_64_1.png"}
          opacity={0.5}
        />
      </Placer>
    </group>
  );
};

export default Children;