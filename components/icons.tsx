import React from 'react';

export const Icons = {
  spinner: (props: React.SVGProps<SVGSVGElement>) => (
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
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  ),
  gitHub: (props: React.SVGProps<SVGSVGElement>) => (
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
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-1.5 6-6.5.08-1.39-.44-2.79-1.43-3.88.17-.42.15-1.01-.08-1.52 0 0-1.13-.37-3.72 1.4a13.07 13.07 0 0 0-6.9 0c-2.59-1.77-3.72-1.4-3.72-1.4-.23.51-.25 1.1-.08 1.52-.99 1.09-1.51 2.49-1.43 3.88 0 5 3 6.5 6 6.5a4.81 4.81 0 0 0-1 3.5v4" />
      <path d="M9 18c-4.51 2-5-2-7-2" />
    </svg>
  ),
  google: (props: React.SVGProps<SVGSVGElement>) => (
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
      <path d="M12.24 10.28c.14-.4.54-.7.98-.7h.02c.46 0 .89.36.98.79l.04.19c.11.5.11 1.07 0 1.58l-.04.19a1.06 1.06 0 0 1-.98.79h-.02c-.44 0-.84-.3-.98-.7l-.04-.19c-.11-.5-.11-1.07 0-1.58Z" />
      <path d="M15.28 12.76a3.9 3.9 0 0 0 .72-.72l.05-.08a3.97 3.97 0 0 0 0-5.29l-.05-.08a3.9 3.9 0 0 0-.72-.72l-.08-.05a3.97 3.97 0 0 0-5.29 0l-.08.05a3.9 3.9 0 0 0-.72.72l-.05.08a3.97 3.97 0 0 0 0 5.29l.05.08a3.9 3.9 0 0 0 .72.72l.08.05a3.97 3.97 0 0 0 5.29 0Z" />
      <path d="M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Z" />
    </svg>
  ),
  logo: (props: React.SVGProps<SVGSVGElement>) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      {/* Simple placeholder shape (e.g., a circle or square) */}
      <circle cx="12" cy="12" r="10" />
      {/* You could add initials or a simple design inside */}
      {/* <path d="M9 12l2 2 4-4" /> */}
    </svg>
  ),
};
