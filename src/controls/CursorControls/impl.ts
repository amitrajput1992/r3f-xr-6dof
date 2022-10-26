import { Camera, Object3D, Raycaster, Vector2, Vector3 } from "three";

const mouse2 = new Vector2();
const raycaster = new Raycaster();

class CursorImpl {
  viewerSpace: Object3D;
  domElement: HTMLElement;
  camera: Camera;

  cursorPosition = new Vector3();
  cursorNormal = new Vector3();
  hitVector: null | Vector3 = null;
  hitNormal: Vector3 = new Vector3();

  constructor(viewerSpace: Object3D, domElement: HTMLElement, camera: Camera) {
    this.viewerSpace = viewerSpace;
    this.domElement = domElement;
    this.camera = camera;
  }

  pointerMove = (e: PointerEvent) => {
    const rect = this.domElement.getBoundingClientRect();
    this.camera.updateMatrixWorld();

    mouse2.set(
      ((e.clientX - rect.left) / rect.width) * 2 - 1,
      -((e.clientY - rect.top) / rect.height) * 2 + 1,
    );
    raycaster.setFromCamera(mouse2, this.camera);

    // * Find the first intersected object with the raycaster, use the intersection point for adding a new pin.
    const intersections = raycaster.intersectObject(this.viewerSpace, true);
    // * find first object with non zero distance

    const validIntersects = intersections.filter((i: any) => i.object.type !== "Line" && i.object.type !== "LineSegments" && i.object.userData.useForXRMovement);

    if(validIntersects.length) {
      const intersect = validIntersects[0];

      this.cursorPosition.copy(intersect.point);
      if (intersect.face) {
        this.cursorNormal.copy(intersect.face.normal);
      }

      // * https://discourse.threejs.org/t/wrong-normal-with-raycaster/5488/4
      this.cursorNormal.transformDirection(intersect.object.matrixWorld);

      this.cursorPosition.addScaledVector(this.cursorNormal, 0.02)
      this.viewerSpace.worldToLocal(this.cursorPosition);

      if(this.cursorNormal.y !== 0) {
        this.hitNormal.copy(intersect.point);
        this.hitNormal.add(this.cursorNormal);
        this.hitVector = this.cursorPosition.clone();
      } else {
        this.hitVector = null;
      }
    }
  };

  attachListeners() {
    this.domElement.addEventListener("pointermove", this.pointerMove);
  }

  detachListeners() {
    this.domElement.removeEventListener("pointermove", this.pointerMove);
  }
}

export default CursorImpl;