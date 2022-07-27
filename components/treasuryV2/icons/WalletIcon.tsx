import React from 'react'

type Props = React.SVGAttributes<SVGElement>

export default function WalletIcon(props: Props) {
  return (
    <svg
      {...props}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M2 12V4C2 2.89543 2.89543 2 4 2H11C11.5523 2 12 2.44772 12 3V5H13C13.5523 5 14 5.44772 14 6V13C14 13.5523 13.5523 14 13 14H4C2.89543 14 2 13.1046 2 12ZM4 5C3.44772 5 3 4.55228 3 4C3 3.44772 3.44772 3 4 3H11V5H4ZM11 10C11.5523 10 12 9.55228 12 9C12 8.44772 11.5523 8 11 8C10.4477 8 10 8.44772 10 9C10 9.55228 10.4477 10 11 10Z"
        fill="url(#paint0_linear_6033_21552)"
      />
      <defs>
        <linearGradient
          id="paint0_linear_6033_21552"
          x1="2"
          y1="8.6"
          x2="14.0053"
          y2="8.73611"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#00C2FF" />
          <stop offset="0.5" stopColor="#00E4FF" />
          <stop offset="1" stopColor="#87F2FF" />
        </linearGradient>
      </defs>
    </svg>
  )
}
