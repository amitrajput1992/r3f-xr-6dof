import { useXR, useXREvent, XRControllerEvent, XREvent } from "@react-three/xr";
import React, { useEffect, useRef, useState } from "react";
import {
  Color,
  Mesh,
  MeshBasicMaterial,
  Group,
  Object3D,
  BufferGeometry,
  Line,
  LineBasicMaterial,
  BufferAttribute,
  Vector2,
  LatheBufferGeometry, Vector3, Camera, Raycaster, DoubleSide
} from "three";
import { useFrame, useThree } from "@react-three/fiber";
import { XRControllerModelFactory } from "three/examples/jsm/webxr/XRControllerModelFactory";
import { useStore } from "../../store";
import shallow from "zustand/shallow";

const modelFactory = new XRControllerModelFactory();
const modelCache = new WeakMap<Group, any>();

/**
 * An override from @react-three/xr.
 * Change: We show the ray always regardless of it's interaction with an element
 * @param rayMaterial
 * @constructor
 */
export function DefaultXRControllers(): null {
  const { scene } = useThree();
  const { controllers } = useXR();
  const [rays] = useState(new Map<number, Ray>());
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

      const ray = new Ray(controller, scene);
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

const vec1 = new Vector3();
const vec2 = new Vector3();
const vec3 = new Vector3();
const arcVerts = 20;
const raycaster = new Raycaster();

class Ray {
  viewerSpace: Object3D;
  rayGroup = new Object3D();
  arcControlPointDist = 1.5;
  arcTension = 0.5;
  arcGeometry = new BufferGeometry();
  arcMaterial = new LineBasicMaterial({ color: new Color("red") });
  arc = new Line(this.arcGeometry, this.arcMaterial);

  arcVecOrg = new Vector3();
  arcVecMid = new Vector3();
  arcVecEnd = new Vector3();

  cursorMaterial = new MeshBasicMaterial( { color: new Color("red"), side: DoubleSide } );
  arcCursor: Mesh;

  cursorPosition = new Vector3();
  cursorNormal = new Vector3();
  hitVector: null | Vector3 = null;

  constructor(controller: Object3D, viewerSpace: Object3D) {
    this.viewerSpace = viewerSpace;

    this.arcGeometry.setAttribute("position", new BufferAttribute(new Float32Array(3 * arcVerts), 3));

    // All meshes should be de-referenced, so created local instances of geomertry and meshes
    const lathePoints = [ new Vector2( 0.4, 0 ), new Vector2( 0.3, 0 ) ];
    const latheGeom = new LatheBufferGeometry( lathePoints, 32 );
    this.arcCursor = new Mesh(latheGeom, this.cursorMaterial);
    this.arcCursor.geometry.rotateX( Math.PI / 2 );

    this.rayGroup.add(this.arc);

    controller.add(this.rayGroup);
  }

  frame(camera: Camera) {
    this.arc.visible = true;
    // get handles of bezier curve

    this.arcVecOrg.set(0, 0, 0);
    this.arcVecMid.set(0, 0, this.arcControlPointDist * -1);
    this.arcVecEnd.set(0, 0, this.arcControlPointDist * -3);

    // move the end of the curve according to projection direction

    this.rayGroup.localToWorld(this.arcVecOrg);
    this.rayGroup.localToWorld(this.arcVecMid);
    this.rayGroup.localToWorld(this.arcVecEnd);

    const dotUp = vec1
      .copy(this.arcVecMid)
      .sub(this.arcVecOrg)
      .normalize()
      .dot(camera.up);

    // we got the dot from up vector, we tween it with the user-defined ImmersiveControls.arcTension
    // and reduce the end handle height proportionally with the middle handle length.
    this.arcVecEnd.y -= (this.arcControlPointDist * 5) * Math.pow(dotUp * 0.5 + 0.5, this.arcTension * 3 + 1);

    raycaster.ray.origin.copy( this.arcVecMid );
    raycaster.ray.direction
      .copy( this.arcVecEnd )
      .sub( this.arcVecMid )
      .normalize();

    this.rayGroup.worldToLocal(this.arcVecOrg);
    this.rayGroup.worldToLocal(this.arcVecMid);
    this.rayGroup.worldToLocal(this.arcVecEnd);

    // update geometry and cast rays

    const posAttrib = this.arcGeometry.attributes.position;

    for (let i = 0; i < arcVerts; i++) {

      // bezier curve sampling to update arc geometry
      const a = i / (arcVerts - 1);
      vec1.lerpVectors(this.arcVecOrg, this.arcVecMid, a);
      vec2.lerpVectors(this.arcVecMid, this.arcVecEnd, a);
      vec3.lerpVectors(vec1, vec2, a);
      posAttrib.setXYZ(i, vec3.x, vec3.y, vec3.z);
    }

    posAttrib.needsUpdate = true;

    // find intersection
    const intersects = raycaster.intersectObject( this.viewerSpace, true );

    if ( intersects.length ) {
      const validIntersect = intersects.filter(i => i.object.type !== "Line" && i.object.type !== "LineSegments");

      this.cursorPosition.copy(validIntersect[0].point);
      if (validIntersect[0].face) {
        this.cursorNormal.copy(validIntersect[0].face.normal);
      }

      this.viewerSpace.add(this.arcCursor);

      this.arcCursor.position.copy(this.cursorPosition);
      this.arcCursor.position.addScaledVector(this.cursorNormal, 0.02);
      this.viewerSpace.worldToLocal(this.arcCursor.position);

      // make the cursor look upwards
      vec1.copy( validIntersect[0].point );
      if(validIntersect[0].face) {
        vec1.add( validIntersect[0].face.normal );
      }
      this.arcCursor.lookAt( vec1 );
      this.hitVector = this.arcCursor.position.clone();
    } else {
      this.viewerSpace.remove( this.arcCursor );
    }

  }

  destroy(controller: Object3D) {
    controller.remove(this.rayGroup);
  }
}