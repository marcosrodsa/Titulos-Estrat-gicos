
import React from 'react';

export const SparklesIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M9.9 2.1c.1-.1.2-.3.3-.4A3.5 3.5 0 0 1 12 1.5c1.4 0 2.6.8 3.2 2 .1.1.2.3.3.4" />
    <path d="M21.9 9.9c.1.1.3.2.4.3A3.5 3.5 0 0 1 22.5 12c0 1.4-.8 2.6-2 3.2-.1.1-.3.2-.4.3" />
    <path d="M14.1 21.9c-.1.1-.2.3-.3.4A3.5 3.5 0 0 1 12 22.5c-1.4 0-2.6-.8-3.2-2-.1-.1-.2-.3-.3-.4" />
    <path d="M2.1 14.1c-.1-.1-.3-.2-.4-.3A3.5 3.5 0 0 1 1.5 12c0-1.4.8-2.6 2-3.2.1-.1.3-.2.4-.3" />
    <path d="M12 4v2" />
    <path d="M12 18v2" />
    <path d="M4 12h2" />
    <path d="M18 12h2" />
    <path d="m4.9 4.9 1.4 1.4" />
    <path d="m17.7 17.7 1.4 1.4" />
    <path d="m4.9 19.1 1.4-1.4" />
    <path d="m17.7 6.3 1.4-1.4" />
  </svg>
);
