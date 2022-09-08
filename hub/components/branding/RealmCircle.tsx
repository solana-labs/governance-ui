import React from 'react';

type Props = React.SVGAttributes<SVGElement>;

export function RealmCircle(props: Props) {
  return (
    <svg
      {...props}
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M32.4988 42.2059C32.2806 42.2898 32.1052 42.023 32.2598 41.8477C36.4548 37.0895 38.9999 30.8418 38.9999 23.9996C38.9999 17.1574 36.4548 10.9097 32.2597 6.15145C32.1052 5.97614 32.2806 5.70935 32.4988 5.79326C39.8108 8.60595 44.9999 15.6968 44.9999 23.9996C44.9999 32.3024 39.8108 39.3932 32.4988 42.2059Z"
        fill="#00C2FF"
      />
      <path
        d="M34.1084 12.5378C34.2058 12.7593 33.8966 12.9819 33.701 12.8394C32.7897 12.1756 31.1741 11.25 29.25 11.25C25.5 11.25 20.25 15.75 20.25 24C20.25 32.25 24 36.75 28.5 36.75C30.9238 36.75 32.7209 35.81 33.6889 35.1452C33.8884 35.0082 34.2058 35.2407 34.1084 35.4622C31.6838 40.9747 26.7235 45 21 45C11.8873 45 3 35.598 3 24C3 12.402 11.8873 3 21 3C26.7235 3 31.6838 7.02527 34.1084 12.5378Z"
        fill="url(#paint0_radial_372_12106)"
      />
      <defs>
        <radialGradient
          id="paint0_radial_372_12106"
          cx="0"
          cy="0"
          r="1"
          gradientUnits="userSpaceOnUse"
          gradientTransform="translate(28.5 24) rotate(180) scale(22.66 30.2134)"
        >
          <stop offset="0.156146" stopColor="#006585" />
          <stop offset="1" stopColor="#00C2FF" />
        </radialGradient>
      </defs>
    </svg>
  );
}
