import React, { useEffect, useRef, useState } from "react";
import Spline from "@splinetool/react-spline";

export default function SplineBackground() {
  const [currentScene, setCurrentScene] = useState(
    "https://prod.spline.design/p0-zCGqo6Vm1HjXy/scene.splinecode"
  );
  const secondScene = "https://prod.spline.design/P5e3rxXx8Iuj6Eeu/scene.splinecode";

  useEffect(() => {
    function handleGlobalMouseUp() {
      // Example: switch from scene1 to scene2
      setCurrentScene(secondScene);
      console.log("Global mouseUp triggered → switched scene!");
    }

    window.addEventListener("mouseup", handleGlobalMouseUp);
    return () => {
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, []);

  return (
    <div className="spline-background">
      <Spline scene={currentScene} />
    </div>
  );
}