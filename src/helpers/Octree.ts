import { Octree } from "three/examples/jsm/math/Octree";
import { Mesh, Object3D, Vector3, Triangle, Box3 } from "three";

/**
 * This class is an additional override over the default Octree implementation from base class.
 * It add the ability to selectively add collision detection on certain objects by inspecting their userData.collision property
 */
class OctreeOverride extends Octree {
  bounds: Box3;

  constructor(box?: Box3) {
    super(box);
    // * an override from base class to add better error handling
    this.bounds = new Box3();
  }

  fromGraphNode(group: Object3D): this {
    group.updateWorldMatrix(true, true);
    group.traverse((obj: Object3D) => {

      if (obj instanceof Mesh && obj.isMesh) {

        // * This is an additional check from the base class
        if (obj.userData.testCollision) {

          let geometry, isTemp = false;
          if (obj.geometry.index !== null) {
            isTemp = true;
            geometry = obj.geometry.toNonIndexed();
          } else {
            geometry = obj.geometry;
          }

          const positionAttribute = geometry.getAttribute("position");

          for (let i = 0; i < positionAttribute.count; i += 3) {
            const v1 = new Vector3().fromBufferAttribute(positionAttribute, i);
            const v2 = new Vector3().fromBufferAttribute(positionAttribute, i + 1);
            const v3 = new Vector3().fromBufferAttribute(positionAttribute, i + 2);

            v1.applyMatrix4(obj.matrixWorld);
            v2.applyMatrix4(obj.matrixWorld);
            v3.applyMatrix4(obj.matrixWorld);

            this.addTriangle(new Triangle(v1, v2, v3));
          }
          if (isTemp) {
            geometry.dispose();
          }
        }
      }
    });
    this.build();
    return this;
  }
}

export default OctreeOverride;