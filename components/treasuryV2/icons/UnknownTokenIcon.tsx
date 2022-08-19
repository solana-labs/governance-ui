import React from 'react'

type Props = React.SVGAttributes<SVGElement>

export default function UnknownTokenIcon(props: Props) {
  return (
    <svg
      {...props}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.48511 6C5.85118 5.22321 6.83895 4.66667 8.00004 4.66667C9.4728 4.66667 10.6667 5.5621 10.6667 6.66667C10.6667 7.59963 9.81496 8.38339 8.66285 8.6044C8.00667 8.73028 8 9.5 8 10M8 11.5H8.00667M14 8C14 11.3137 11.3137 14 8 14C4.68629 14 2 11.3137 2 8C2 4.68629 4.68629 2 8 2C11.3137 2 14 4.68629 14 8Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
