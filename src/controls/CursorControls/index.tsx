import React, { useEffect, useRef, useState } from "react";
import { Group, MathUtils, Vector3 } from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { useStore } from "../../store";
import Zone from "../../helpers/Zone";
import CursorImpl from "./impl";

const Cursor = () => {
  const ref = useRef(new Group());
  const domElement = useThree(s => s.gl.domElement);
  const camera = useThree(s => s.camera);
  const { scene } = useThree();
  const playerCollider = useStore(s => s.playerCollider);

  const [cursor] = useState(new CursorImpl(scene, domElement, camera));

  function pointerClick(e: MouseEvent) {
    e.preventDefault();
    if(!cursor.hitVector) {
      return;
    }
    const destinationVector = new Vector3().copy(cursor.hitVector);
    const d = destinationVector.sub(playerCollider.start.clone());
    playerCollider.translate(d);
  }

  useEffect(() => {
    cursor.attachListeners();
    return () => {
      cursor.detachListeners();
    };
  }, [cursor]);

  useEffect(() => {
    domElement.addEventListener("contextmenu", pointerClick);
    return () => {
      domElement.removeEventListener("contextmenu", pointerClick);
    };
  }, [domElement]);

  useFrame(() => {
    const hitVector = cursor.hitVector;
    const hitNormal = cursor.hitNormal;

    if(!hitVector || !hitNormal) {
      ref.current.visible = false;
    } else {
      ref.current.position.copy(hitVector);
      ref.current.lookAt(hitNormal);
      ref.current.visible = true;
    }
  });

  return (
    <group ref={ref}>
      <group rotation-x={MathUtils.degToRad(-90)}>
        <Zone color={"white"} radius={0.4} opacity={0.7} height={0.2}/>
      </group>
    </group>
  );
};

export default Cursor;