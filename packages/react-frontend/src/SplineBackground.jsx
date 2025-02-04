
import { useRef, useEffect } from "react";
import Spline from '@splinetool/react-spline';

export default function SplineBackground() {
  return (
    <div className = "spline-background">
    <Spline scene="https://prod.spline.design/p0-zCGqo6Vm1HjXy/scene.splinecode" />
    </div>
  );
}
