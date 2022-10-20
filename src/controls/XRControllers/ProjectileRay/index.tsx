import {
  BufferAttribute,
  BufferGeometry, Camera,
  Color,
  DoubleSide, LatheBufferGeometry,
  Line,
  LineBasicMaterial,
  Mesh,
  MeshBasicMaterial,
  Object3D,
  Raycaster,
  Vector2,
  Vector3,
} from "three";

const vec1 = new Vector3();
const vec2 = new Vector3();
const vec3 = new Vector3();
const arcVerts = 20;
const raycaster = new Raycaster();

const blue = new Color("#2e05c7");
const grey = new Color("grey");

class Ray {
  viewerSpace: Object3D;
  rayGroup = new Object3D();
  arcControlPointDist = 1.5;
  arcTension = 0.5;
  arcGeometry = new BufferGeometry();
  arcMaterial = new LineBasicMaterial({ color: blue });
  arc = new Line(this.arcGeometry, this.arcMaterial);

  arcVecOrg = new Vector3();
  arcVecMid = new Vector3();
  arcVecEnd = new Vector3();

  cursorMaterial = new MeshBasicMaterial({ color: blue, side: DoubleSide });
  arcCursor: Mesh;

  cursorPosition = new Vector3();
  cursorNormal = new Vector3();
  hitVector: null | Vector3 = null;

  constructor(controller: Object3D, viewerSpace: Object3D) {
    this.viewerSpace = viewerSpace;

    this.arcGeometry.setAttribute("position", new BufferAttribute(new Float32Array(3 * arcVerts), 3));

    // All meshes should be de-referenced, so created local instances of geomertry and meshes
    const lathePoints = [new Vector2(0.4, 0), new Vector2(0.3, 0)];
    const latheGeom = new LatheBufferGeometry(lathePoints, 32);
    this.arcCursor = new Mesh(latheGeom, this.cursorMaterial);
    this.arcCursor.geometry.rotateX(Math.PI / 2);

    this.rayGroup.add(this.arc);
    controller.userData.ignoreInteraction = true;

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

    raycaster.ray.origin.copy(this.arcVecMid);
    raycaster.ray.direction
      .copy(this.arcVecEnd)
      .sub(this.arcVecMid)
      .normalize();

    this.rayGroup.worldToLocal(this.arcVecOrg);
    this.rayGroup.worldToLocal(this.arcVecMid);
    this.rayGroup.worldToLocal(this.arcVecEnd);

    // update geometry and cast rays

    const posAttrib = this.arcGeometry.attributes.position;

    for (let i = 0; i < arcVerts; i++) {

      // bezier curve sampling to update arc geometry
      const a = i / (arcVerts - 5);
      vec1.lerpVectors(this.arcVecOrg, this.arcVecMid, a);
      vec2.lerpVectors(this.arcVecMid, this.arcVecEnd, a);
      vec3.lerpVectors(vec1, vec2, a);
      posAttrib.setXYZ(i, vec3.x, vec3.y, vec3.z);
    }

    posAttrib.needsUpdate = true;

    // find intersection
    let intersects: any = [];
    try {
      intersects = raycaster.intersectObject(this.viewerSpace, true);
    } catch {
      // console.log();
    }

    if (intersects.length) {
      const validIntersect = intersects.filter((i: any) => i.object.type !== "Line" && i.object.type !== "LineSegments" && i.object.userData.useForXRMovement);

      const intersect = validIntersect[0];
      if(!intersect) {
        return;
      }

      this.cursorPosition.copy(intersect.point);
      if (intersect.face) {
        this.cursorNormal.copy(intersect.face.normal);
      }

      // * https://discourse.threejs.org/t/wrong-normal-with-raycaster/5488/4
      this.cursorNormal.transformDirection(intersect.object.matrixWorld);

      this.viewerSpace.add(this.arcCursor);

      this.arcCursor.position.copy(this.cursorPosition);
      this.arcCursor.position.addScaledVector(this.cursorNormal, 0.02);
      this.viewerSpace.worldToLocal(this.arcCursor.position);

      // make the cursor look upwards
      vec1.copy(intersect.point);
      vec1.add(this.cursorNormal);

      this.arcCursor.lookAt(vec1);

      if(this.cursorNormal.y !== 0) {
        this.cursorMaterial.color = blue;
        this.arcMaterial.color = blue;
        this.hitVector = this.arcCursor.position.clone();
      } else {
        this.cursorMaterial.color = grey;
        this.arcMaterial.color = grey;
        this.hitVector = null;
      }

    } else {
      this.viewerSpace.remove(this.arcCursor);
    }

  }

  destroy(controller: Object3D) {
    this.viewerSpace.remove(this.arcCursor);
    controller.remove(this.rayGroup);
  }
}

export default Ray;