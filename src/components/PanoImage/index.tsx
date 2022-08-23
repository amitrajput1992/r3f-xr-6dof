import React from "react";
import { useLoader } from "@react-three/fiber"; // to use custom ts jsx components
import { TextureLoader, Vector3, MathUtils, DoubleSide, ClampToEdgeWrapping, LinearFilter } from "three";

// this is used to orient the center of the camera to the center of the pano
const DEFAULT_PANO_Y = -90;
const scaleInvertForCenterCamera = new Vector3(-1, 1, 1);

const RADIUS = 1000;

const URL = "https://u.vrgmetri.com/gm-gb-test/media/2022-8/ebmdpp/07979461-92ad-4d7d-bd0a-a568e8efd163/o/Dubai%20Marina%20(360%20x%20180).jpg";
// const URL = "https://u.vrgmetri.com/gm-gb-test/media/2022-8/ebmdpp/22d2cfc4-67f0-4d8a-a38a-0bc4cb0ac26f/o/ICONSIAM%20DAY%20PANORAMA360.jpg";

const PanoImage = () => {
  const texture = useLoader(TextureLoader, URL);
  texture.wrapS = ClampToEdgeWrapping;
  texture.wrapT = ClampToEdgeWrapping;
  texture.generateMipmaps = false;
  texture.minFilter = LinearFilter;

  return (
    <mesh userData={{needsRenderOrder: true, renderDistance: RADIUS}} scale={scaleInvertForCenterCamera} rotation={[0, MathUtils.degToRad(DEFAULT_PANO_Y), 0]} name={"PanoImageR__mesh"}>
      <sphereBufferGeometry attach="geometry" args={[RADIUS, 60, 40]} />
      <meshBasicMaterial
        attach="material"
        map={texture}
        side={DoubleSide}
        opacity={1}
        transparent={true}
      />
    </mesh>
  );
};

export default PanoImage;