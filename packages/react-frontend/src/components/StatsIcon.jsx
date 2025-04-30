import React from 'react';

const StatsIcon = ({ size = 40 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 64 64"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect width="64" height="64" rx="12" fill="#1DB954" />
    <path d="M18 42V30" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M26 42V22" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M34 42V26" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M42 42V18" stroke="white" strokeWidth="3" strokeLinecap="round" />
    <path d="M50 42V34" stroke="white" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export default StatsIcon;
