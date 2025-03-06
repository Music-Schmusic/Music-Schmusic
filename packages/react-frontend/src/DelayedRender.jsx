// DelayedRender.jsx
import React, { useState, useEffect } from 'react';

function DelayedRender({ delay, children }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return show ? children : null;
}

export default DelayedRender;