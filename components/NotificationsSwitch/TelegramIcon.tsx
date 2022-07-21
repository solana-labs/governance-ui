import * as React from 'react'
import { SVGProps } from 'react'

const SvgComponent = (props: SVGProps<SVGSVGElement>) => (
  <svg
    width="700pt"
    height="700pt"
    viewBox="0 0 700 700"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <path
      d="m594.12 82.949-89.25 367.85c-4.2 17.324-23.625 26.25-39.551 18.023l-112.88-58.273-53.375 87.324c-14.523 23.801-51.273 13.477-51.273-14.352V386.22c0-7.523 3.148-14.699 8.574-19.949l219.98-210c-.176-2.625-2.976-4.898-5.773-2.977l-262.5 182.7-88.2-45.5c-20.647-10.676-19.772-40.602 1.575-49.875L556.327 51.1c20.824-9.101 43.227 9.625 37.801 31.848z"
      fill="currentColor"
    />
  </svg>
)

export default SvgComponent
