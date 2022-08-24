import React, { useEffect, useMemo, useRef } from "react";
import {
  AnimationClip,
  AnimationMixer,
  Box3,
  Group,
  LinearEncoding,
  LoopRepeat, Material, Mesh,
  Object3D,
  Vector3,
} from "three";
import { useFrame, useLoader } from "@react-three/fiber";
import { GLTFLoader } from "three-stdlib";
import * as SkeletonUtils from "three/examples/jsm/utils/SkeletonUtils";
import { a } from "@react-spring/three";

const URL = "https://s.vrgmetri.com/gb-web/z5-edge/6DOF/environments/Event/eventModel_v11.glb";

const position = [0, -3.2, 0] as [number, number, number];

const Space = () => {
  const ref = useRef<Group>();
  const gltf = useLoader(GLTFLoader, URL);

  // @ts-ignore
  const gltfScene = useMemo(() => SkeletonUtils.clone(gltf.scene), [gltf]);
  const [_position, scale] = useMemo(() => getScaleAndAdjustedPosition(gltfScene), [gltfScene]);

  useEffect(() => {
    const encoding = LinearEncoding;
    traverseMaterials(gltfScene, (m) => {
      if (m.transparent) {
        m.alphaTest = 0.01;
      }
      // ! each mesh should write it's depth to the webGL depth buffer. This is required to correctly assign render orders to meshes.
      m.depthWrite = true;

      // @ts-ignore - TS doesn't understand this but our runtime env does
      if (m.map) {
        // @ts-ignore - TS doesn't understand this but our runtime env does
        m.map.encoding = encoding;
        m.needsUpdate = true;
      }
      // @ts-ignore - TS doesn't understand this but our runtime env does
      if (m.emissiveMap) {
        // @ts-ignore - TS doesn't understand this but our runtime env does
        m.emissiveMap.encoding = encoding;
        m.needsUpdate = true;
      }
    });
    // ! Parse through all meshes of the model and mark them for render order computation. This allows us to place arbitirary element's inside the models.
    traverseMesh(gltfScene, (m) => {
      m.userData.needsRenderOrder = true;
    });
  }, [gltfScene]);

  const animationMixer = useRef<undefined | AnimationMixer>();
  const animationClips = useRef<AnimationClip[]>([]);
  useEffect(() => {
    // setup animation mixer
    animationClips.current = gltf.animations || [];
    // optimize any animations
    animationClips.current.forEach(a => {
      if (a.validate && a.validate()) {
        a.optimize();
      }
    });
    animationMixer.current = new AnimationMixer(gltfScene);
    playAllAnimations(true);

  }, [gltf]);

  function playAllAnimations(loop = false) {
    animationClips.current.forEach((clip) => {
      const animation = animationMixer.current?.clipAction(clip);
      if (!animation) {
        return;
      }
      if (loop) {
        // do nothing, by default all animation loop
      } else {
        animation.setLoop(LoopRepeat, 1);
        animation.clampWhenFinished = true;
      }
      animation.reset().play();
    });
  }

  useFrame((_, ms) => {
    animationMixer.current?.update(ms);
  });

  return (
    <group position={position}>
      {/*
      //@ts-ignore*/}
      <a.primitive ref={ref} object={gltfScene} scale={1} />
    </group>
  );

};

/**
 * This function calculates a relative scale within a 1x1x1 box and also adjust the positioning of the object so that it's origin is top aligned
 * This assumes that the model's origin is always in the center
 */
function getScaleAndAdjustedPosition(o: Object3D) {
  const box = new Box3().setFromObject(o);
  const size = new Vector3();
  box.getSize(size);

  const maxAxis = Math.max(size.x, size.y, size.z);
  const scale = (10 / maxAxis);

  return [new Vector3(0, -size.y * scale / 2, 0), scale];
}

export function traverseMesh(object: Object3D | Mesh, cb: (m: Mesh) => void) {
  object.traverse((node) => {
    if (node instanceof Mesh) {
      cb(node);
    }
  });
}

export function traverseMaterials(object: Object3D | Mesh, cb: (m: Material) => void) {
  object.traverse((node) => {
    if (!(node instanceof Mesh)) {
      return;
    }
    const materials = Array.isArray(node.material) ? node.material : [node.material];
    materials.forEach(cb);
  });
}

export default Space;