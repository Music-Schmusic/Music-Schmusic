import React, { useEffect, useState } from 'react';
import Spline from '@splinetool/react-spline';

export default function SplineBackground({ currentScene }) {
  
  return (
    <div className="spline-background">
      <Spline scene={currentScene} />
    </div>
  );
}
