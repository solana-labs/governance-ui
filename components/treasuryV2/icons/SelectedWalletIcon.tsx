import React from 'react'

type Props = React.SVGAttributes<SVGElement>

export default function SelectedWalletIcon(props: Props) {
  return (
    <svg
      {...props}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 0C4 0 0 4 0 20C0 36 4 40 20 40C36 40 40 36 40 20C40 4 36 0 20 0Z"
        fill="url(#paint0_linear_6604_55016)"
      />
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M11 26V14C11 12.3431 12.3431 11 14 11H24.5C25.3284 11 26 11.6716 26 12.5V15.5H27.5C28.3284 15.5 29 16.1716 29 17V27.5C29 28.3284 28.3284 29 27.5 29H14C12.3431 29 11 27.6569 11 26ZM14 15.5C13.1716 15.5 12.5 14.8284 12.5 14C12.5 13.1716 13.1716 12.5 14 12.5H24.5V15.5H14ZM24.5 23C25.3284 23 26 22.3284 26 21.5C26 20.6716 25.3284 20 24.5 20C23.6716 20 23 20.6716 23 21.5C23 22.3284 23.6716 23 24.5 23Z"
        fill="black"
      />
      <defs>
        <linearGradient
          id="paint0_linear_6604_55016"
          x1="-3.42727e-08"
          y1="22"
          x2="40.0175"
          y2="22.4537"
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
