import React, { useEffect, useRef } from "react";
import { Box3, Group, Vector3 } from "three";

const PivotPoint = ({children, pivotPoint}: {children: React.ReactElement | React.ReactElement[], pivotPoint: "center" | "bottom" | "corner"}) => {
  const ref = useRef<Group>(new Group());
  const v = useRef(new Vector3());

  useEffect(() => {
    if(!ref.current) {
      return;
    }
    const bh = new Box3();
    bh.setFromObject(ref.current);
    bh.getSize(v.current);
    switch(pivotPoint) {
      case "bottom": {
        ref.current.position.setX(0);
        ref.current.position.setY(v.current.y / 2);
        break;
      }
      case "corner": {
        ref.current.position.setX(v.current.x / 2);
        ref.current.position.setY(v.current.y / 2);
        break;
      }
      case "center": {
        ref.current.position.setX(0);
        ref.current.position.setY(0);
        break;
      }
    }

  }, [pivotPoint]);

  return (
    <group ref={ref}>
      {children}
    </group>
  );
};

export default React.memo(PivotPoint);