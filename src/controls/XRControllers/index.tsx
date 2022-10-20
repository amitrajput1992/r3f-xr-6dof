import { useXR, useXREvent, XRControllerEvent, XREvent } from "@react-three/xr";
import React, { useEffect, useState } from "react";
import {
  Group,
  Object3D,
  Vector3,
  Camera
} from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import { useStore } from "../../store";
import shallow from "zustand/shallow";
import ProjectileRay from "./ProjectileRay";

const modelFactory = new XRControllerModelFactory();
const modelCache = new WeakMap<Group, any>();

/**
 * An override from @react-three/xr.
 * Change: We show the ray always regardless of it's interaction with an element
 * @constructor
 */
export function DefaultXRControllers(): null {
  const { scene } = useThree();
  const { controllers } = useXR();
  const [rays] = useState(new Map<number, ProjectileRay>());
  const playerCollider = useStore(s => s.playerCollider, shallow);
  useXREvent("select", onSqueeze);

  function onSqueeze(e: XREvent<XRControllerEvent>) {
    const ray = rays.get(e.target.controller.id);
    if(!ray) {
      return;
    }

    if(!ray.hitVector) {
      return;
    }
    const destinationVector = new Vector3().copy(ray.hitVector);
    const d = destinationVector.sub(playerCollider.start.clone());
    playerCollider.translate(d);
  }

  useEffect(() => {
    const cleanups: any[] = [];

    controllers.forEach(({ controller, grip, inputSource }) => {
      // Attach 3D model of the controller
      let model: Object3D;
      if (modelCache.has(controller)) {
        model = modelCache.get(controller);
      } else {
        model = modelFactory.createControllerModel(controller) as any;
        controller.dispatchEvent({ type: "connected", data: inputSource, fake: true });
        modelCache.set(controller, model);
      }
      grip.add(model);

      const ray = new ProjectileRay(controller, scene);
      rays.set(controller.id, ray);

      cleanups.push(() => {
        ray.destroy(controller);
        grip.remove(model);
        rays.delete(controller.id);
      });
    });

    return () => {
      cleanups.forEach((fn) => fn());
    };
  }, [controllers, scene, rays]);

  function updateArc(camera: Camera) {
    if(controllers.length === 0) {
      return;
    }
    for (const it of controllers) {
      const ray = rays.get(it.controller.id);
      ray?.frame(camera);
    }
  }

  useFrame(({ camera }) => {
    updateArc(camera);
  });

  return null;
}