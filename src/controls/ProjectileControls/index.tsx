import React, { useEffect, useState } from "react";
import { createPortal, useFrame, useThree } from "@react-three/fiber";
import { Object3D, Raycaster, Vector2, Vector3 } from "three";
import ProjectileRay from "./ProjectileRay";
import { useStore } from "../../store";

const mouseVector = new Vector3(0, 0, 0);
const mouse3 = new Vector3();

const ProjectileControls = () => {
  const domElement = useThree(s => s.gl.domElement);
  const camera = useThree(s => s.camera);
  const { scene } = useThree();
  const playerCollider = useStore(s => s.playerCollider);

  const [root] = useState(() => {
    const o = new Object3D();
    o.position.set(0.1, 0, -0.2);
    // o.position.setX(0.4);
    return o;
  });
  const [ray] = useState(new ProjectileRay(root, scene));

  function pointerClick(e: MouseEvent) {
    e.preventDefault();
    if(!ray.hitVector) {
      return;
    }
    const destinationVector = new Vector3().copy(ray.hitVector);
    const d = destinationVector.sub(playerCollider.start.clone());
    playerCollider.translate(d);
  }

  function pointerMove(e: PointerEvent) {
    const rect = domElement.getBoundingClientRect();
    camera.updateMatrixWorld();

    // * Ref https://stackoverflow.com/a/13091694
    mouse3.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
      0, // To check this
    );

    mouse3.unproject(camera);
    mouse3.sub(camera.position).normalize();
    mouseVector.copy(camera.position).add(mouse3);
  }

  useFrame(() => {
    ray.frame(camera);
  });

  useEffect(() => {
    domElement.addEventListener("contextmenu", pointerClick);
    domElement.addEventListener("pointermove", pointerMove);

    return () => {
      domElement.removeEventListener("contextmenu", pointerClick);
      domElement.removeEventListener("pointermove", pointerMove);
    };
  }, [domElement]);

  return (
    <>
      {
        createPortal(
          <primitive object={root} />,
          camera
        )
      }
    </>
  );
};

export default ProjectileControls;