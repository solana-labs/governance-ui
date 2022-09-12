import React from 'react'

type Props = React.SVGAttributes<SVGElement>

export default function NFTCollectionPreviewIcon(props: Props) {
  return (
    <svg
      {...props}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5.5 15V9L9 15V9M11 15V12M11 12V9H19M11 12H13.5M17 9V15"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
