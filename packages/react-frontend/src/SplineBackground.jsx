import React, { useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';

export default function SplineBackground({ switchScene }) {
  const [currentScene, setCurrentScene] = useState(
    'https://prod.spline.design/p0-zCGqo6Vm1HjXy/scene.splinecode'
  );
  const secondScene =
    'https://prod.spline.design/P5e3rxXx8Iuj6Eeu/scene.splinecode';

  useEffect(() => {
    if (switchScene) {
      setCurrentScene(secondScene);
      console.log('Scene switched!');
    }
  }, [switchScene]);

  return (
    <div className="spline-background">
      <Spline scene={currentScene} />
    </div>
  );
}
