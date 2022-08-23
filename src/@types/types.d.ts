
import {RefObject} from "react";
import { ReactThreeFiber } from "@react-three/fiber";

interface Controls {
  ref?: RefObject<any>,
  args?: any[],
}

declare global {
  namespace JSX {
    interface IntrinsicElements {
      mousePanControls: Controls;
    }
  }
}
