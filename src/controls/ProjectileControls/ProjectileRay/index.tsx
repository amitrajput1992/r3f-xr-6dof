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
  Raycaster, TextureLoader,
  Vector2,
  Vector3
} from "three";

const vec1 = new Vector3();
const vec2 = new Vector3();
const vec3 = new Vector3();
const arcVerts = 20;
const raycaster = new Raycaster();

const blue = new Color("#2e05c7");
const green = new Color("green");
const grey = new Color("grey");

const CYLINDER_TEXTURE =
  "data:image/png;base64,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";

const texture = new TextureLoader().load( CYLINDER_TEXTURE);

class Ray {
  viewerSpace: Object3D;
  rayGroup = new Object3D();
  arcControlPointDist = 1.5;
  arcTension = 0.5;
  arcGeometry = new BufferGeometry();
  arcMaterial = new LineBasicMaterial({ color: blue, linewidth: 3, opacity: 0.5, transparent: true });
  arc = new Line(this.arcGeometry, this.arcMaterial);

  arcVecOrg = new Vector3();
  arcVecMid = new Vector3();
  arcVecEnd = new Vector3();

  cursorMaterial = new MeshBasicMaterial({ color: blue, side: DoubleSide, opacity: 0.5, transparent: true });
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
    this.arcVecMid.set(0, -0.05, this.arcControlPointDist * -1);
    this.arcVecEnd.set(0, -0.05, this.arcControlPointDist * -5);

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