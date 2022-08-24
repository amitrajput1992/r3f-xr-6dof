import React, { useEffect, useState } from "react";
import {
  Material,
  MeshBasicMaterial,
  CanvasTexture,
  ClampToEdgeWrapping,
  DoubleSide, Vector3, Mesh,
} from "three";

type Props = {
  size: Vector3,
  src: string,
  opacity?: number,
  position?: Vector3,
  scale?: Vector3,
  width?: number
}

const CubeFaceMesh = React.forwardRef(({ width = 2048, opacity = 1, scale = new Vector3(1, -1, 1), position = new Vector3(0, 0, 0), size, src }: Props, ref: React.ForwardedRef<Mesh>) => {
  const [materials, setMaterials] = useState<Material[]>([]);

  async function makeFaceTexture(x: number, y: number): Promise<CanvasTexture> {
    const canvas = document.createElement("canvas") as HTMLCanvasElement;
    canvas.width = canvas.height = width;
    const context = canvas.getContext("2d") as CanvasRenderingContext2D;
    const img = new Image();
    img.src = src;
    img.crossOrigin = "anonymous";

    return new Promise(res => {
      img.addEventListener("load", () => {
        if (img.complete) {
          // Create a pattern with this image, and set it to "repeat".
          context.fillStyle = context.createPattern(img, "repeat") as CanvasPattern;
          context.fillRect(0, 0, canvas.width, canvas.height); // context.fillRect(x, y, width, height);


          const fcanvas = document.createElement("canvas") as HTMLCanvasElement;
          const canvasTex = new CanvasTexture(fcanvas);
          const fctx = fcanvas.getContext("2d") as CanvasRenderingContext2D;
          const aspect = Math.min(x, y) / Math.max(x, y);
          // console.log(aspect, canvas.width, canvas.height * aspect);
          fcanvas.width = canvas.width;
          fcanvas.height = canvas.height * aspect;
          fctx.drawImage(canvas, 0, 0);

          canvasTex.generateMipmaps = false;
          canvasTex.wrapS = ClampToEdgeWrapping;
          canvasTex.wrapT = ClampToEdgeWrapping;
          canvasTex.offset.set(0, 0);

          canvasTex.needsUpdate = true;

          res(canvasTex);
        }
      });
    });
  }

  async function computeFaceMaterials() {
    const right = await makeFaceTexture(size.z, size.y);
    const left = await makeFaceTexture(size.z, size.y);
    const top = await makeFaceTexture(size.x, size.z);
    const bottom = await makeFaceTexture(size.x, size.z);
    const back = await makeFaceTexture(size.x, size.y);
    const front = await makeFaceTexture(size.x, size.y);

    const materials = [
      new MeshBasicMaterial({ opacity: opacity, transparent: true, side: DoubleSide, map: right, depthWrite: false }), // right
      new MeshBasicMaterial({ opacity: opacity, transparent: true, side: DoubleSide, map: left, depthWrite: false }), // left
      new MeshBasicMaterial({ opacity: opacity, transparent: true, side: DoubleSide, map: top, depthWrite: false }), // top
      new MeshBasicMaterial({ opacity: opacity, transparent: true, side: DoubleSide, map: bottom, depthWrite: false }), // bottom
      new MeshBasicMaterial({ opacity: opacity, transparent: true, side: DoubleSide, map: back, depthWrite: false }), // back
      new MeshBasicMaterial({ opacity: opacity, transparent: true, side: DoubleSide, map: front, depthWrite: false }), // front
    ];

    setMaterials(materials);
  }

  useEffect(() => {
    computeFaceMaterials().then();
  }, [size.x, size.y, size.z]);

  return (
    <mesh
      ref={ref}
      name={"CubeFaceMesh"}
      userData={{ needsRenderOrder: true, testCollision: true }}
      position={position}
      scale={scale}
      material={materials}
      renderOrder={999}
    >
      <boxGeometry args={[size.x, size.y, size.z]} />
    </mesh>
  );
});

export default CubeFaceMesh;