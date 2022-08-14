import React from 'react'

type Props = React.SVGAttributes<SVGElement>

export default function OtherPreviewIcon(props: Props) {
  return (
    <svg
      {...props}
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M5.79996 12.9C5.88134 12.839 5.94217 12.7546 5.97434 12.6581L6.36038 11.5H9.63962L10.0257 12.6581C10.0578 12.7546 10.1187 12.839 10.2 12.9L10.9997 13.4997H5.00026L5.79996 12.9ZM10 10.5H6H3.33333C2.8731 10.5 2.5 10.1269 2.5 9.66667V3.33333C2.5 2.8731 2.8731 2.5 3.33333 2.5H12.6667C13.1269 2.5 13.5 2.8731 13.5 3.33333V9.66667C13.5 10.1269 13.1269 10.5 12.6667 10.5H10Z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}
